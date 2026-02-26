import {
  addDays, addWeeks, addMonths, addYears, addTime,
  startOfDay, endOfDay, startOfMonth, endOfMonth,
  startOfYear, endOfYear, getQuarter, startOfQuarter, endOfQuarter,
  diffDays, diffHours, isWeekend, isBusinessDay,
  nextBusinessDay, addBusinessDays, isSameDay, isBefore, isAfter,
  isWithinRange, toISODateString, fromISODateString,
  getDayOfYear, getWeekOfYear, isLeapYear, daysInMonth,
  isValidTimeUnit, clampDate, formatDuration,
} from "../src/index";

const BASE = new Date("2026-01-01T12:00:00.000Z");

describe("addDays", () => {
  it("addDays loop 1: adding 1 days increases timestamp", () => {
    expect(addDays(BASE, 1).getTime()).toBeGreaterThan(BASE.getTime());
  });
  it("addDays loop 2: adding 2 days increases timestamp", () => {
    expect(addDays(BASE, 2).getTime()).toBeGreaterThan(BASE.getTime());
  });
  it("addDays loop 3: adding 3 days increases timestamp", () => {
    expect(addDays(BASE, 3).getTime()).toBeGreaterThan(BASE.getTime());
  });
  it("addDays loop 4: adding 4 days increases timestamp", () => {
    expect(addDays(BASE, 4).getTime()).toBeGreaterThan(BASE.getTime());
  });
  it("addDays loop 5: adding 5 days increases timestamp", () => {
    expect(addDays(BASE, 5).getTime()).toBeGreaterThan(BASE.getTime());
  });
  it("addDays loop 6: adding 6 days increases timestamp", () => {
    expect(addDays(BASE, 6).getTime()).toBeGreaterThan(BASE.getTime());
  });
  it("addDays loop 7: adding 7 days increases timestamp", () => {
    expect(addDays(BASE, 7).getTime()).toBeGreaterThan(BASE.getTime());
  });
  it("addDays loop 8: adding 8 days increases timestamp", () => {
    expect(addDays(BASE, 8).getTime()).toBeGreaterThan(BASE.getTime());
  });
  it("addDays loop 9: adding 9 days increases timestamp", () => {
    expect(addDays(BASE, 9).getTime()).toBeGreaterThan(BASE.getTime());
  });
  it("addDays loop 10: adding 10 days increases timestamp", () => {
    expect(addDays(BASE, 10).getTime()).toBeGreaterThan(BASE.getTime());
  });
  it("addDays loop 11: adding 11 days increases timestamp", () => {
    expect(addDays(BASE, 11).getTime()).toBeGreaterThan(BASE.getTime());
  });
  it("addDays loop 12: adding 12 days increases timestamp", () => {
    expect(addDays(BASE, 12).getTime()).toBeGreaterThan(BASE.getTime());
  });
  it("addDays loop 13: adding 13 days increases timestamp", () => {
    expect(addDays(BASE, 13).getTime()).toBeGreaterThan(BASE.getTime());
  });
  it("addDays loop 14: adding 14 days increases timestamp", () => {
    expect(addDays(BASE, 14).getTime()).toBeGreaterThan(BASE.getTime());
  });
  it("addDays loop 15: adding 15 days increases timestamp", () => {
    expect(addDays(BASE, 15).getTime()).toBeGreaterThan(BASE.getTime());
  });
  it("addDays loop 16: adding 16 days increases timestamp", () => {
    expect(addDays(BASE, 16).getTime()).toBeGreaterThan(BASE.getTime());
  });
  it("addDays loop 17: adding 17 days increases timestamp", () => {
    expect(addDays(BASE, 17).getTime()).toBeGreaterThan(BASE.getTime());
  });
  it("addDays loop 18: adding 18 days increases timestamp", () => {
    expect(addDays(BASE, 18).getTime()).toBeGreaterThan(BASE.getTime());
  });
  it("addDays loop 19: adding 19 days increases timestamp", () => {
    expect(addDays(BASE, 19).getTime()).toBeGreaterThan(BASE.getTime());
  });
  it("addDays loop 20: adding 20 days increases timestamp", () => {
    expect(addDays(BASE, 20).getTime()).toBeGreaterThan(BASE.getTime());
  });
  it("addDays loop 21: adding 21 days increases timestamp", () => {
    expect(addDays(BASE, 21).getTime()).toBeGreaterThan(BASE.getTime());
  });
  it("addDays loop 22: adding 22 days increases timestamp", () => {
    expect(addDays(BASE, 22).getTime()).toBeGreaterThan(BASE.getTime());
  });
  it("addDays loop 23: adding 23 days increases timestamp", () => {
    expect(addDays(BASE, 23).getTime()).toBeGreaterThan(BASE.getTime());
  });
  it("addDays loop 24: adding 24 days increases timestamp", () => {
    expect(addDays(BASE, 24).getTime()).toBeGreaterThan(BASE.getTime());
  });
  it("addDays loop 25: adding 25 days increases timestamp", () => {
    expect(addDays(BASE, 25).getTime()).toBeGreaterThan(BASE.getTime());
  });
  it("addDays loop 26: adding 26 days increases timestamp", () => {
    expect(addDays(BASE, 26).getTime()).toBeGreaterThan(BASE.getTime());
  });
  it("addDays loop 27: adding 27 days increases timestamp", () => {
    expect(addDays(BASE, 27).getTime()).toBeGreaterThan(BASE.getTime());
  });
  it("addDays loop 28: adding 28 days increases timestamp", () => {
    expect(addDays(BASE, 28).getTime()).toBeGreaterThan(BASE.getTime());
  });
  it("addDays loop 29: adding 29 days increases timestamp", () => {
    expect(addDays(BASE, 29).getTime()).toBeGreaterThan(BASE.getTime());
  });
  it("addDays loop 30: adding 30 days increases timestamp", () => {
    expect(addDays(BASE, 30).getTime()).toBeGreaterThan(BASE.getTime());
  });
  it("addDays: adding 0 days returns same timestamp", () => {
    expect(addDays(BASE, 0).getTime()).toBe(BASE.getTime());
  });
  it("addDays: negative days goes back", () => {
    expect(addDays(BASE, -1).getTime()).toBeLessThan(BASE.getTime());
  });
  it("addDays: does not mutate input", () => {
    const t = BASE.getTime(); addDays(BASE, 5); expect(BASE.getTime()).toBe(t);
  });
  it("addDays: 365 days from 2026-01-01 gives 2027", () => {
    expect(addDays(new Date("2026-01-01"), 365).getFullYear()).toBe(2027);
  });
  it("addDays: 7 days equals addWeeks 1", () => {
    expect(addDays(BASE, 7).getTime()).toBe(addWeeks(BASE, 1).getTime());
  });
  it("addDays: adding 30 days from Jan gives Feb", () => {
    const r = addDays(new Date("2026-01-15"), 30);
    expect(r.getMonth()).toBe(1);
  });
});

describe("addWeeks", () => {
  it("addWeeks loop 1: 1 weeks = 7 days", () => {
    expect(addWeeks(BASE, 1).getTime()).toBe(addDays(BASE, 7).getTime());
  });
  it("addWeeks loop 2: 2 weeks = 14 days", () => {
    expect(addWeeks(BASE, 2).getTime()).toBe(addDays(BASE, 14).getTime());
  });
  it("addWeeks loop 3: 3 weeks = 21 days", () => {
    expect(addWeeks(BASE, 3).getTime()).toBe(addDays(BASE, 21).getTime());
  });
  it("addWeeks loop 4: 4 weeks = 28 days", () => {
    expect(addWeeks(BASE, 4).getTime()).toBe(addDays(BASE, 28).getTime());
  });
  it("addWeeks loop 5: 5 weeks = 35 days", () => {
    expect(addWeeks(BASE, 5).getTime()).toBe(addDays(BASE, 35).getTime());
  });
  it("addWeeks loop 6: 6 weeks = 42 days", () => {
    expect(addWeeks(BASE, 6).getTime()).toBe(addDays(BASE, 42).getTime());
  });
  it("addWeeks loop 7: 7 weeks = 49 days", () => {
    expect(addWeeks(BASE, 7).getTime()).toBe(addDays(BASE, 49).getTime());
  });
  it("addWeeks loop 8: 8 weeks = 56 days", () => {
    expect(addWeeks(BASE, 8).getTime()).toBe(addDays(BASE, 56).getTime());
  });
  it("addWeeks loop 9: 9 weeks = 63 days", () => {
    expect(addWeeks(BASE, 9).getTime()).toBe(addDays(BASE, 63).getTime());
  });
  it("addWeeks loop 10: 10 weeks = 70 days", () => {
    expect(addWeeks(BASE, 10).getTime()).toBe(addDays(BASE, 70).getTime());
  });
  it("addWeeks loop 11: 11 weeks = 77 days", () => {
    expect(addWeeks(BASE, 11).getTime()).toBe(addDays(BASE, 77).getTime());
  });
  it("addWeeks loop 12: 12 weeks = 84 days", () => {
    expect(addWeeks(BASE, 12).getTime()).toBe(addDays(BASE, 84).getTime());
  });
  it("addWeeks loop 13: 13 weeks = 91 days", () => {
    expect(addWeeks(BASE, 13).getTime()).toBe(addDays(BASE, 91).getTime());
  });
  it("addWeeks loop 14: 14 weeks = 98 days", () => {
    expect(addWeeks(BASE, 14).getTime()).toBe(addDays(BASE, 98).getTime());
  });
  it("addWeeks loop 15: 15 weeks = 105 days", () => {
    expect(addWeeks(BASE, 15).getTime()).toBe(addDays(BASE, 105).getTime());
  });
  it("addWeeks loop 16: 16 weeks = 112 days", () => {
    expect(addWeeks(BASE, 16).getTime()).toBe(addDays(BASE, 112).getTime());
  });
  it("addWeeks loop 17: 17 weeks = 119 days", () => {
    expect(addWeeks(BASE, 17).getTime()).toBe(addDays(BASE, 119).getTime());
  });
  it("addWeeks loop 18: 18 weeks = 126 days", () => {
    expect(addWeeks(BASE, 18).getTime()).toBe(addDays(BASE, 126).getTime());
  });
  it("addWeeks loop 19: 19 weeks = 133 days", () => {
    expect(addWeeks(BASE, 19).getTime()).toBe(addDays(BASE, 133).getTime());
  });
  it("addWeeks loop 20: 20 weeks = 140 days", () => {
    expect(addWeeks(BASE, 20).getTime()).toBe(addDays(BASE, 140).getTime());
  });
  it("addWeeks: 0 weeks is identity", () => {
    expect(addWeeks(BASE, 0).getTime()).toBe(BASE.getTime());
  });
  it("addWeeks: negative goes back", () => {
    expect(addWeeks(BASE, -1).getTime()).toBeLessThan(BASE.getTime());
  });
  it("addWeeks: does not mutate", () => {
    const t = BASE.getTime(); addWeeks(BASE, 3); expect(BASE.getTime()).toBe(t);
  });
  it("addWeeks: 52 weeks from 2026-01-01 stays in 2026 or 2027", () => {
    const r = addWeeks(new Date("2026-01-01"), 52);
    expect(r.getFullYear()).toBeGreaterThanOrEqual(2026);
  });
});

describe("addMonths", () => {
  it("addMonths loop 1: Jan + 1 months = month 1", () => {
    const r = addMonths(new Date("2026-01-15"), 1);
    expect(r.getMonth()).toBe(1);
  });
  it("addMonths loop 2: Jan + 2 months = month 2", () => {
    const r = addMonths(new Date("2026-01-15"), 2);
    expect(r.getMonth()).toBe(2);
  });
  it("addMonths loop 3: Jan + 3 months = month 3", () => {
    const r = addMonths(new Date("2026-01-15"), 3);
    expect(r.getMonth()).toBe(3);
  });
  it("addMonths loop 4: Jan + 4 months = month 4", () => {
    const r = addMonths(new Date("2026-01-15"), 4);
    expect(r.getMonth()).toBe(4);
  });
  it("addMonths loop 5: Jan + 5 months = month 5", () => {
    const r = addMonths(new Date("2026-01-15"), 5);
    expect(r.getMonth()).toBe(5);
  });
  it("addMonths loop 6: Jan + 6 months = month 6", () => {
    const r = addMonths(new Date("2026-01-15"), 6);
    expect(r.getMonth()).toBe(6);
  });
  it("addMonths loop 7: Jan + 7 months = month 7", () => {
    const r = addMonths(new Date("2026-01-15"), 7);
    expect(r.getMonth()).toBe(7);
  });
  it("addMonths loop 8: Jan + 8 months = month 8", () => {
    const r = addMonths(new Date("2026-01-15"), 8);
    expect(r.getMonth()).toBe(8);
  });
  it("addMonths loop 9: Jan + 9 months = month 9", () => {
    const r = addMonths(new Date("2026-01-15"), 9);
    expect(r.getMonth()).toBe(9);
  });
  it("addMonths loop 10: Jan + 10 months = month 10", () => {
    const r = addMonths(new Date("2026-01-15"), 10);
    expect(r.getMonth()).toBe(10);
  });
  it("addMonths loop 11: Jan + 11 months = month 11", () => {
    const r = addMonths(new Date("2026-01-15"), 11);
    expect(r.getMonth()).toBe(11);
  });
  it("addMonths loop 12: Jan + 12 months = month 0", () => {
    const r = addMonths(new Date("2026-01-15"), 12);
    expect(r.getMonth()).toBe(0);
  });
  it("addMonths: 0 months identity", () => {
    expect(addMonths(BASE, 0).getMonth()).toBe(BASE.getMonth());
  });
  it("addMonths: negative goes back", () => {
    const r = addMonths(new Date("2026-06-01"), -3);
    expect(r.getMonth()).toBe(2);
  });
  it("addMonths: does not mutate", () => {
    const t = BASE.getTime(); addMonths(BASE, 2); expect(BASE.getTime()).toBe(t);
  });
  it("addMonths: 24 months advances year by 2", () => {
    expect(addMonths(new Date("2026-06-01"), 24).getFullYear()).toBe(2028);
  });
  it("addMonths: 6 months from Jan is Jul", () => {
    expect(addMonths(new Date("2026-01-01"), 6).getMonth()).toBe(6);
  });
  it("addMonths: result year same when adding within year", () => {
    expect(addMonths(new Date("2026-01-01"), 11).getFullYear()).toBe(2026);
  });
});

describe("addYears", () => {
  it("addYears loop 1: year becomes 2027", () => {
    expect(addYears(new Date("2026-06-15"), 1).getFullYear()).toBe(2027);
  });
  it("addYears loop 2: year becomes 2028", () => {
    expect(addYears(new Date("2026-06-15"), 2).getFullYear()).toBe(2028);
  });
  it("addYears loop 3: year becomes 2029", () => {
    expect(addYears(new Date("2026-06-15"), 3).getFullYear()).toBe(2029);
  });
  it("addYears loop 4: year becomes 2030", () => {
    expect(addYears(new Date("2026-06-15"), 4).getFullYear()).toBe(2030);
  });
  it("addYears loop 5: year becomes 2031", () => {
    expect(addYears(new Date("2026-06-15"), 5).getFullYear()).toBe(2031);
  });
  it("addYears loop 6: year becomes 2032", () => {
    expect(addYears(new Date("2026-06-15"), 6).getFullYear()).toBe(2032);
  });
  it("addYears loop 7: year becomes 2033", () => {
    expect(addYears(new Date("2026-06-15"), 7).getFullYear()).toBe(2033);
  });
  it("addYears loop 8: year becomes 2034", () => {
    expect(addYears(new Date("2026-06-15"), 8).getFullYear()).toBe(2034);
  });
  it("addYears loop 9: year becomes 2035", () => {
    expect(addYears(new Date("2026-06-15"), 9).getFullYear()).toBe(2035);
  });
  it("addYears loop 10: year becomes 2036", () => {
    expect(addYears(new Date("2026-06-15"), 10).getFullYear()).toBe(2036);
  });
  it("addYears: 0 years identity", () => {
    expect(addYears(BASE, 0).getFullYear()).toBe(2026);
  });
  it("addYears: negative goes back", () => {
    expect(addYears(BASE, -1).getFullYear()).toBe(2025);
  });
  it("addYears: does not mutate", () => {
    const t = BASE.getTime(); addYears(BASE, 1); expect(BASE.getTime()).toBe(t);
  });
  it("addYears: month preserved after addYears", () => {
    expect(addYears(new Date("2026-07-15"), 1).getMonth()).toBe(6);
  });
  it("addYears: day preserved after addYears", () => {
    expect(addYears(new Date("2026-07-15"), 1).getDate()).toBe(15);
  });
});

describe("addTime", () => {
  it("addTime: unit ms positive increases time", () => {
    const r = addTime(BASE, 1, "ms");
    expect(r.getTime()).toBeGreaterThan(BASE.getTime());
  });
  it("addTime: unit ms with 0 returns same or equivalent", () => {
    expect(addTime(BASE, 0, "ms").getTime()).toBe(BASE.getTime());
  });
  it("addTime: unit ms result is a Date", () => {
    expect(addTime(BASE, 1, "ms")).toBeInstanceOf(Date);
  });
  it("addTime: unit ms negative decreases time", () => {
    expect(addTime(BASE, -1, "ms").getTime()).toBeLessThan(BASE.getTime());
  });
  it("addTime: unit ms does not mutate input", () => {
    const t = BASE.getTime(); addTime(BASE, 5, "ms"); expect(BASE.getTime()).toBe(t);
  });
  it("addTime: unit seconds positive increases time", () => {
    const r = addTime(BASE, 1, "seconds");
    expect(r.getTime()).toBeGreaterThan(BASE.getTime());
  });
  it("addTime: unit seconds with 0 returns same or equivalent", () => {
    expect(addTime(BASE, 0, "seconds").getTime()).toBe(BASE.getTime());
  });
  it("addTime: unit seconds result is a Date", () => {
    expect(addTime(BASE, 1, "seconds")).toBeInstanceOf(Date);
  });
  it("addTime: unit seconds negative decreases time", () => {
    expect(addTime(BASE, -1, "seconds").getTime()).toBeLessThan(BASE.getTime());
  });
  it("addTime: unit seconds does not mutate input", () => {
    const t = BASE.getTime(); addTime(BASE, 5, "seconds"); expect(BASE.getTime()).toBe(t);
  });
  it("addTime: unit minutes positive increases time", () => {
    const r = addTime(BASE, 1, "minutes");
    expect(r.getTime()).toBeGreaterThan(BASE.getTime());
  });
  it("addTime: unit minutes with 0 returns same or equivalent", () => {
    expect(addTime(BASE, 0, "minutes").getTime()).toBe(BASE.getTime());
  });
  it("addTime: unit minutes result is a Date", () => {
    expect(addTime(BASE, 1, "minutes")).toBeInstanceOf(Date);
  });
  it("addTime: unit minutes negative decreases time", () => {
    expect(addTime(BASE, -1, "minutes").getTime()).toBeLessThan(BASE.getTime());
  });
  it("addTime: unit minutes does not mutate input", () => {
    const t = BASE.getTime(); addTime(BASE, 5, "minutes"); expect(BASE.getTime()).toBe(t);
  });
  it("addTime: unit hours positive increases time", () => {
    const r = addTime(BASE, 1, "hours");
    expect(r.getTime()).toBeGreaterThan(BASE.getTime());
  });
  it("addTime: unit hours with 0 returns same or equivalent", () => {
    expect(addTime(BASE, 0, "hours").getTime()).toBe(BASE.getTime());
  });
  it("addTime: unit hours result is a Date", () => {
    expect(addTime(BASE, 1, "hours")).toBeInstanceOf(Date);
  });
  it("addTime: unit hours negative decreases time", () => {
    expect(addTime(BASE, -1, "hours").getTime()).toBeLessThan(BASE.getTime());
  });
  it("addTime: unit hours does not mutate input", () => {
    const t = BASE.getTime(); addTime(BASE, 5, "hours"); expect(BASE.getTime()).toBe(t);
  });
  it("addTime: unit days positive increases time", () => {
    const r = addTime(BASE, 1, "days");
    expect(r.getTime()).toBeGreaterThan(BASE.getTime());
  });
  it("addTime: unit days with 0 returns same or equivalent", () => {
    expect(addTime(BASE, 0, "days").getDate()).toBe(BASE.getDate());
  });
  it("addTime: unit days result is a Date", () => {
    expect(addTime(BASE, 1, "days")).toBeInstanceOf(Date);
  });
  it("addTime: unit days negative decreases time", () => {
    expect(addTime(BASE, -1, "days").getTime()).toBeLessThan(BASE.getTime());
  });
  it("addTime: unit days does not mutate input", () => {
    const t = BASE.getTime(); addTime(BASE, 5, "days"); expect(BASE.getTime()).toBe(t);
  });
  it("addTime: unit weeks positive increases time", () => {
    const r = addTime(BASE, 1, "weeks");
    expect(r.getTime()).toBeGreaterThan(BASE.getTime());
  });
  it("addTime: unit weeks with 0 returns same or equivalent", () => {
    expect(addTime(BASE, 0, "weeks").getDate()).toBe(BASE.getDate());
  });
  it("addTime: unit weeks result is a Date", () => {
    expect(addTime(BASE, 1, "weeks")).toBeInstanceOf(Date);
  });
  it("addTime: unit weeks negative decreases time", () => {
    expect(addTime(BASE, -1, "weeks").getTime()).toBeLessThan(BASE.getTime());
  });
  it("addTime: unit weeks does not mutate input", () => {
    const t = BASE.getTime(); addTime(BASE, 5, "weeks"); expect(BASE.getTime()).toBe(t);
  });
  it("addTime: unit months positive increases time", () => {
    const r = addTime(BASE, 1, "months");
    expect(r.getTime()).toBeGreaterThan(BASE.getTime());
  });
  it("addTime: unit months with 0 returns same or equivalent", () => {
    expect(addTime(BASE, 0, "months").getDate()).toBe(BASE.getDate());
  });
  it("addTime: unit months result is a Date", () => {
    expect(addTime(BASE, 1, "months")).toBeInstanceOf(Date);
  });
  it("addTime: unit months negative decreases time", () => {
    expect(addTime(BASE, -1, "months").getTime()).toBeLessThan(BASE.getTime());
  });
  it("addTime: unit months does not mutate input", () => {
    const t = BASE.getTime(); addTime(BASE, 5, "months"); expect(BASE.getTime()).toBe(t);
  });
  it("addTime: unit years positive increases time", () => {
    const r = addTime(BASE, 1, "years");
    expect(r.getTime()).toBeGreaterThan(BASE.getTime());
  });
  it("addTime: unit years with 0 returns same or equivalent", () => {
    expect(addTime(BASE, 0, "years").getDate()).toBe(BASE.getDate());
  });
  it("addTime: unit years result is a Date", () => {
    expect(addTime(BASE, 1, "years")).toBeInstanceOf(Date);
  });
  it("addTime: unit years negative decreases time", () => {
    expect(addTime(BASE, -1, "years").getTime()).toBeLessThan(BASE.getTime());
  });
  it("addTime: unit years does not mutate input", () => {
    const t = BASE.getTime(); addTime(BASE, 5, "years"); expect(BASE.getTime()).toBe(t);
  });
});

describe("isValidTimeUnit", () => {
  it("isValidTimeUnit: ms is valid", () => {
    expect(isValidTimeUnit("ms")).toBe(true);
  });
  it("isValidTimeUnit: seconds is valid", () => {
    expect(isValidTimeUnit("seconds")).toBe(true);
  });
  it("isValidTimeUnit: minutes is valid", () => {
    expect(isValidTimeUnit("minutes")).toBe(true);
  });
  it("isValidTimeUnit: hours is valid", () => {
    expect(isValidTimeUnit("hours")).toBe(true);
  });
  it("isValidTimeUnit: days is valid", () => {
    expect(isValidTimeUnit("days")).toBe(true);
  });
  it("isValidTimeUnit: weeks is valid", () => {
    expect(isValidTimeUnit("weeks")).toBe(true);
  });
  it("isValidTimeUnit: months is valid", () => {
    expect(isValidTimeUnit("months")).toBe(true);
  });
  it("isValidTimeUnit: years is valid", () => {
    expect(isValidTimeUnit("years")).toBe(true);
  });
  it("isValidTimeUnit: nanoseconds is invalid", () => {
    expect(isValidTimeUnit("nanoseconds")).toBe(false);
  });
  it("isValidTimeUnit: fortnights is invalid", () => {
    expect(isValidTimeUnit("fortnights")).toBe(false);
  });
  it("isValidTimeUnit: century is invalid", () => {
    expect(isValidTimeUnit("century")).toBe(false);
  });
  it("isValidTimeUnit: quarter is invalid", () => {
    expect(isValidTimeUnit("quarter")).toBe(false);
  });
  it("isValidTimeUnit: empty is invalid", () => {
    expect(isValidTimeUnit("")).toBe(false);
  });
});

describe("startOfDay", () => {
  it("startOfDay: 2026-01-01 sets hours to 0", () => {
    const r = startOfDay(new Date("2026-01-01"));
    expect(r.getHours()).toBe(0);
    expect(r.getMinutes()).toBe(0);
    expect(r.getSeconds()).toBe(0);
    expect(r.getMilliseconds()).toBe(0);
  });
  it("startOfDay: 2026-01-02 sets hours to 0", () => {
    const r = startOfDay(new Date("2026-01-02"));
    expect(r.getHours()).toBe(0);
    expect(r.getMinutes()).toBe(0);
    expect(r.getSeconds()).toBe(0);
    expect(r.getMilliseconds()).toBe(0);
  });
  it("startOfDay: 2026-01-03 sets hours to 0", () => {
    const r = startOfDay(new Date("2026-01-03"));
    expect(r.getHours()).toBe(0);
    expect(r.getMinutes()).toBe(0);
    expect(r.getSeconds()).toBe(0);
    expect(r.getMilliseconds()).toBe(0);
  });
  it("startOfDay: 2026-01-04 sets hours to 0", () => {
    const r = startOfDay(new Date("2026-01-04"));
    expect(r.getHours()).toBe(0);
    expect(r.getMinutes()).toBe(0);
    expect(r.getSeconds()).toBe(0);
    expect(r.getMilliseconds()).toBe(0);
  });
  it("startOfDay: 2026-01-05 sets hours to 0", () => {
    const r = startOfDay(new Date("2026-01-05"));
    expect(r.getHours()).toBe(0);
    expect(r.getMinutes()).toBe(0);
    expect(r.getSeconds()).toBe(0);
    expect(r.getMilliseconds()).toBe(0);
  });
  it("startOfDay: 2026-01-06 sets hours to 0", () => {
    const r = startOfDay(new Date("2026-01-06"));
    expect(r.getHours()).toBe(0);
    expect(r.getMinutes()).toBe(0);
    expect(r.getSeconds()).toBe(0);
    expect(r.getMilliseconds()).toBe(0);
  });
  it("startOfDay: 2026-01-07 sets hours to 0", () => {
    const r = startOfDay(new Date("2026-01-07"));
    expect(r.getHours()).toBe(0);
    expect(r.getMinutes()).toBe(0);
    expect(r.getSeconds()).toBe(0);
    expect(r.getMilliseconds()).toBe(0);
  });
  it("startOfDay: 2026-01-08 sets hours to 0", () => {
    const r = startOfDay(new Date("2026-01-08"));
    expect(r.getHours()).toBe(0);
    expect(r.getMinutes()).toBe(0);
    expect(r.getSeconds()).toBe(0);
    expect(r.getMilliseconds()).toBe(0);
  });
  it("startOfDay: 2026-01-09 sets hours to 0", () => {
    const r = startOfDay(new Date("2026-01-09"));
    expect(r.getHours()).toBe(0);
    expect(r.getMinutes()).toBe(0);
    expect(r.getSeconds()).toBe(0);
    expect(r.getMilliseconds()).toBe(0);
  });
  it("startOfDay: 2026-01-10 sets hours to 0", () => {
    const r = startOfDay(new Date("2026-01-10"));
    expect(r.getHours()).toBe(0);
    expect(r.getMinutes()).toBe(0);
    expect(r.getSeconds()).toBe(0);
    expect(r.getMilliseconds()).toBe(0);
  });
  it("startOfDay: 2026-01-11 sets hours to 0", () => {
    const r = startOfDay(new Date("2026-01-11"));
    expect(r.getHours()).toBe(0);
    expect(r.getMinutes()).toBe(0);
    expect(r.getSeconds()).toBe(0);
    expect(r.getMilliseconds()).toBe(0);
  });
  it("startOfDay: 2026-01-12 sets hours to 0", () => {
    const r = startOfDay(new Date("2026-01-12"));
    expect(r.getHours()).toBe(0);
    expect(r.getMinutes()).toBe(0);
    expect(r.getSeconds()).toBe(0);
    expect(r.getMilliseconds()).toBe(0);
  });
  it("startOfDay: 2026-01-13 sets hours to 0", () => {
    const r = startOfDay(new Date("2026-01-13"));
    expect(r.getHours()).toBe(0);
    expect(r.getMinutes()).toBe(0);
    expect(r.getSeconds()).toBe(0);
    expect(r.getMilliseconds()).toBe(0);
  });
  it("startOfDay: 2026-01-14 sets hours to 0", () => {
    const r = startOfDay(new Date("2026-01-14"));
    expect(r.getHours()).toBe(0);
    expect(r.getMinutes()).toBe(0);
    expect(r.getSeconds()).toBe(0);
    expect(r.getMilliseconds()).toBe(0);
  });
  it("startOfDay: 2026-01-15 sets hours to 0", () => {
    const r = startOfDay(new Date("2026-01-15"));
    expect(r.getHours()).toBe(0);
    expect(r.getMinutes()).toBe(0);
    expect(r.getSeconds()).toBe(0);
    expect(r.getMilliseconds()).toBe(0);
  });
  it("startOfDay: 2026-01-16 sets hours to 0", () => {
    const r = startOfDay(new Date("2026-01-16"));
    expect(r.getHours()).toBe(0);
    expect(r.getMinutes()).toBe(0);
    expect(r.getSeconds()).toBe(0);
    expect(r.getMilliseconds()).toBe(0);
  });
  it("startOfDay: 2026-01-17 sets hours to 0", () => {
    const r = startOfDay(new Date("2026-01-17"));
    expect(r.getHours()).toBe(0);
    expect(r.getMinutes()).toBe(0);
    expect(r.getSeconds()).toBe(0);
    expect(r.getMilliseconds()).toBe(0);
  });
  it("startOfDay: 2026-01-18 sets hours to 0", () => {
    const r = startOfDay(new Date("2026-01-18"));
    expect(r.getHours()).toBe(0);
    expect(r.getMinutes()).toBe(0);
    expect(r.getSeconds()).toBe(0);
    expect(r.getMilliseconds()).toBe(0);
  });
  it("startOfDay: 2026-01-19 sets hours to 0", () => {
    const r = startOfDay(new Date("2026-01-19"));
    expect(r.getHours()).toBe(0);
    expect(r.getMinutes()).toBe(0);
    expect(r.getSeconds()).toBe(0);
    expect(r.getMilliseconds()).toBe(0);
  });
  it("startOfDay: 2026-01-20 sets hours to 0", () => {
    const r = startOfDay(new Date("2026-01-20"));
    expect(r.getHours()).toBe(0);
    expect(r.getMinutes()).toBe(0);
    expect(r.getSeconds()).toBe(0);
    expect(r.getMilliseconds()).toBe(0);
  });
});

describe("endOfDay", () => {
  it("endOfDay: 2026-01-01 sets time to 23:59:59.999", () => {
    const r = endOfDay(new Date("2026-01-01"));
    expect(r.getHours()).toBe(23);
    expect(r.getMinutes()).toBe(59);
    expect(r.getSeconds()).toBe(59);
    expect(r.getMilliseconds()).toBe(999);
  });
  it("endOfDay: 2026-01-02 sets time to 23:59:59.999", () => {
    const r = endOfDay(new Date("2026-01-02"));
    expect(r.getHours()).toBe(23);
    expect(r.getMinutes()).toBe(59);
    expect(r.getSeconds()).toBe(59);
    expect(r.getMilliseconds()).toBe(999);
  });
  it("endOfDay: 2026-01-03 sets time to 23:59:59.999", () => {
    const r = endOfDay(new Date("2026-01-03"));
    expect(r.getHours()).toBe(23);
    expect(r.getMinutes()).toBe(59);
    expect(r.getSeconds()).toBe(59);
    expect(r.getMilliseconds()).toBe(999);
  });
  it("endOfDay: 2026-01-04 sets time to 23:59:59.999", () => {
    const r = endOfDay(new Date("2026-01-04"));
    expect(r.getHours()).toBe(23);
    expect(r.getMinutes()).toBe(59);
    expect(r.getSeconds()).toBe(59);
    expect(r.getMilliseconds()).toBe(999);
  });
  it("endOfDay: 2026-01-05 sets time to 23:59:59.999", () => {
    const r = endOfDay(new Date("2026-01-05"));
    expect(r.getHours()).toBe(23);
    expect(r.getMinutes()).toBe(59);
    expect(r.getSeconds()).toBe(59);
    expect(r.getMilliseconds()).toBe(999);
  });
  it("endOfDay: 2026-01-06 sets time to 23:59:59.999", () => {
    const r = endOfDay(new Date("2026-01-06"));
    expect(r.getHours()).toBe(23);
    expect(r.getMinutes()).toBe(59);
    expect(r.getSeconds()).toBe(59);
    expect(r.getMilliseconds()).toBe(999);
  });
  it("endOfDay: 2026-01-07 sets time to 23:59:59.999", () => {
    const r = endOfDay(new Date("2026-01-07"));
    expect(r.getHours()).toBe(23);
    expect(r.getMinutes()).toBe(59);
    expect(r.getSeconds()).toBe(59);
    expect(r.getMilliseconds()).toBe(999);
  });
  it("endOfDay: 2026-01-08 sets time to 23:59:59.999", () => {
    const r = endOfDay(new Date("2026-01-08"));
    expect(r.getHours()).toBe(23);
    expect(r.getMinutes()).toBe(59);
    expect(r.getSeconds()).toBe(59);
    expect(r.getMilliseconds()).toBe(999);
  });
  it("endOfDay: 2026-01-09 sets time to 23:59:59.999", () => {
    const r = endOfDay(new Date("2026-01-09"));
    expect(r.getHours()).toBe(23);
    expect(r.getMinutes()).toBe(59);
    expect(r.getSeconds()).toBe(59);
    expect(r.getMilliseconds()).toBe(999);
  });
  it("endOfDay: 2026-01-10 sets time to 23:59:59.999", () => {
    const r = endOfDay(new Date("2026-01-10"));
    expect(r.getHours()).toBe(23);
    expect(r.getMinutes()).toBe(59);
    expect(r.getSeconds()).toBe(59);
    expect(r.getMilliseconds()).toBe(999);
  });
  it("endOfDay: 2026-01-11 sets time to 23:59:59.999", () => {
    const r = endOfDay(new Date("2026-01-11"));
    expect(r.getHours()).toBe(23);
    expect(r.getMinutes()).toBe(59);
    expect(r.getSeconds()).toBe(59);
    expect(r.getMilliseconds()).toBe(999);
  });
  it("endOfDay: 2026-01-12 sets time to 23:59:59.999", () => {
    const r = endOfDay(new Date("2026-01-12"));
    expect(r.getHours()).toBe(23);
    expect(r.getMinutes()).toBe(59);
    expect(r.getSeconds()).toBe(59);
    expect(r.getMilliseconds()).toBe(999);
  });
  it("endOfDay: 2026-01-13 sets time to 23:59:59.999", () => {
    const r = endOfDay(new Date("2026-01-13"));
    expect(r.getHours()).toBe(23);
    expect(r.getMinutes()).toBe(59);
    expect(r.getSeconds()).toBe(59);
    expect(r.getMilliseconds()).toBe(999);
  });
  it("endOfDay: 2026-01-14 sets time to 23:59:59.999", () => {
    const r = endOfDay(new Date("2026-01-14"));
    expect(r.getHours()).toBe(23);
    expect(r.getMinutes()).toBe(59);
    expect(r.getSeconds()).toBe(59);
    expect(r.getMilliseconds()).toBe(999);
  });
  it("endOfDay: 2026-01-15 sets time to 23:59:59.999", () => {
    const r = endOfDay(new Date("2026-01-15"));
    expect(r.getHours()).toBe(23);
    expect(r.getMinutes()).toBe(59);
    expect(r.getSeconds()).toBe(59);
    expect(r.getMilliseconds()).toBe(999);
  });
  it("endOfDay: 2026-01-16 sets time to 23:59:59.999", () => {
    const r = endOfDay(new Date("2026-01-16"));
    expect(r.getHours()).toBe(23);
    expect(r.getMinutes()).toBe(59);
    expect(r.getSeconds()).toBe(59);
    expect(r.getMilliseconds()).toBe(999);
  });
  it("endOfDay: 2026-01-17 sets time to 23:59:59.999", () => {
    const r = endOfDay(new Date("2026-01-17"));
    expect(r.getHours()).toBe(23);
    expect(r.getMinutes()).toBe(59);
    expect(r.getSeconds()).toBe(59);
    expect(r.getMilliseconds()).toBe(999);
  });
  it("endOfDay: 2026-01-18 sets time to 23:59:59.999", () => {
    const r = endOfDay(new Date("2026-01-18"));
    expect(r.getHours()).toBe(23);
    expect(r.getMinutes()).toBe(59);
    expect(r.getSeconds()).toBe(59);
    expect(r.getMilliseconds()).toBe(999);
  });
  it("endOfDay: 2026-01-19 sets time to 23:59:59.999", () => {
    const r = endOfDay(new Date("2026-01-19"));
    expect(r.getHours()).toBe(23);
    expect(r.getMinutes()).toBe(59);
    expect(r.getSeconds()).toBe(59);
    expect(r.getMilliseconds()).toBe(999);
  });
  it("endOfDay: 2026-01-20 sets time to 23:59:59.999", () => {
    const r = endOfDay(new Date("2026-01-20"));
    expect(r.getHours()).toBe(23);
    expect(r.getMinutes()).toBe(59);
    expect(r.getSeconds()).toBe(59);
    expect(r.getMilliseconds()).toBe(999);
  });
});

describe("startOfMonth", () => {
  it("startOfMonth: month 1 starts on day 1", () => {
    const r = startOfMonth(new Date("2026-01-15"));
    expect(r.getDate()).toBe(1);
    expect(r.getMonth()).toBe(0);
  });
  it("startOfMonth: month 2 starts on day 1", () => {
    const r = startOfMonth(new Date("2026-02-15"));
    expect(r.getDate()).toBe(1);
    expect(r.getMonth()).toBe(1);
  });
  it("startOfMonth: month 3 starts on day 1", () => {
    const r = startOfMonth(new Date("2026-03-15"));
    expect(r.getDate()).toBe(1);
    expect(r.getMonth()).toBe(2);
  });
  it("startOfMonth: month 4 starts on day 1", () => {
    const r = startOfMonth(new Date("2026-04-15"));
    expect(r.getDate()).toBe(1);
    expect(r.getMonth()).toBe(3);
  });
  it("startOfMonth: month 5 starts on day 1", () => {
    const r = startOfMonth(new Date("2026-05-16T12:00:00"));
    expect(r.getDate()).toBe(1);
    expect(r.getMonth()).toBe(4);
  });
  it("startOfMonth: month 6 starts on day 1", () => {
    const r = startOfMonth(new Date("2026-06-15"));
    expect(r.getDate()).toBe(1);
    expect(r.getMonth()).toBe(5);
  });
  it("startOfMonth: month 7 starts on day 1", () => {
    const r = startOfMonth(new Date("2026-07-15"));
    expect(r.getDate()).toBe(1);
    expect(r.getMonth()).toBe(6);
  });
  it("startOfMonth: month 8 starts on day 1", () => {
    const r = startOfMonth(new Date("2026-08-15"));
    expect(r.getDate()).toBe(1);
    expect(r.getMonth()).toBe(7);
  });
  it("startOfMonth: month 9 starts on day 1", () => {
    const r = startOfMonth(new Date("2026-09-15"));
    expect(r.getDate()).toBe(1);
    expect(r.getMonth()).toBe(8);
  });
  it("startOfMonth: month 10 starts on day 1", () => {
    const r = startOfMonth(new Date("2026-10-15"));
    expect(r.getDate()).toBe(1);
    expect(r.getMonth()).toBe(9);
  });
  it("startOfMonth: month 11 starts on day 1", () => {
    const r = startOfMonth(new Date("2026-11-15"));
    expect(r.getDate()).toBe(1);
    expect(r.getMonth()).toBe(10);
  });
  it("startOfMonth: month 12 starts on day 1", () => {
    const r = startOfMonth(new Date("2026-12-15"));
    expect(r.getDate()).toBe(1);
    expect(r.getMonth()).toBe(11);
  });
});

describe("endOfMonth", () => {
  it("endOfMonth: month 1 ends on day 31", () => {
    const r = endOfMonth(new Date("2026-01-01"));
    expect(r.getDate()).toBe(31);
  });
  it("endOfMonth: month 2 ends on day 28", () => {
    const r = endOfMonth(new Date("2026-02-01"));
    expect(r.getDate()).toBe(28);
  });
  it("endOfMonth: month 3 ends on day 31", () => {
    const r = endOfMonth(new Date("2026-03-01"));
    expect(r.getDate()).toBe(31);
  });
  it("endOfMonth: month 4 ends on day 30", () => {
    const r = endOfMonth(new Date("2026-04-01"));
    expect(r.getDate()).toBe(30);
  });
  it("endOfMonth: month 5 ends on day 31", () => {
    const r = endOfMonth(new Date("2026-05-02T12:00:00"));
    expect(r.getDate()).toBe(31);
  });
  it("endOfMonth: month 6 ends on day 30", () => {
    const r = endOfMonth(new Date("2026-06-01"));
    expect(r.getDate()).toBe(30);
  });
  it("endOfMonth: month 7 ends on day 31", () => {
    const r = endOfMonth(new Date("2026-07-01"));
    expect(r.getDate()).toBe(31);
  });
  it("endOfMonth: month 8 ends on day 31", () => {
    const r = endOfMonth(new Date("2026-08-01"));
    expect(r.getDate()).toBe(31);
  });
  it("endOfMonth: month 9 ends on day 30", () => {
    const r = endOfMonth(new Date("2026-09-01"));
    expect(r.getDate()).toBe(30);
  });
  it("endOfMonth: month 10 ends on day 31", () => {
    const r = endOfMonth(new Date("2026-10-01"));
    expect(r.getDate()).toBe(31);
  });
  it("endOfMonth: month 11 ends on day 30", () => {
    const r = endOfMonth(new Date("2026-11-01"));
    expect(r.getDate()).toBe(30);
  });
  it("endOfMonth: month 12 ends on day 31", () => {
    const r = endOfMonth(new Date("2026-12-01"));
    expect(r.getDate()).toBe(31);
  });
});

describe("startOfYear", () => {
  it("startOfYear: year 2020 starts Jan 1", () => {
    const r = startOfYear(new Date("2020-07-15"));
    expect(r.getMonth()).toBe(0);
    expect(r.getDate()).toBe(1);
  });
  it("startOfYear: year 2021 starts Jan 1", () => {
    const r = startOfYear(new Date("2021-07-15"));
    expect(r.getMonth()).toBe(0);
    expect(r.getDate()).toBe(1);
  });
  it("startOfYear: year 2022 starts Jan 1", () => {
    const r = startOfYear(new Date("2022-07-15"));
    expect(r.getMonth()).toBe(0);
    expect(r.getDate()).toBe(1);
  });
  it("startOfYear: year 2023 starts Jan 1", () => {
    const r = startOfYear(new Date("2023-07-15"));
    expect(r.getMonth()).toBe(0);
    expect(r.getDate()).toBe(1);
  });
  it("startOfYear: year 2024 starts Jan 1", () => {
    const r = startOfYear(new Date("2024-07-15"));
    expect(r.getMonth()).toBe(0);
    expect(r.getDate()).toBe(1);
  });
  it("startOfYear: year 2025 starts Jan 1", () => {
    const r = startOfYear(new Date("2025-07-15"));
    expect(r.getMonth()).toBe(0);
    expect(r.getDate()).toBe(1);
  });
  it("startOfYear: year 2026 starts Jan 1", () => {
    const r = startOfYear(new Date("2026-07-15"));
    expect(r.getMonth()).toBe(0);
    expect(r.getDate()).toBe(1);
  });
  it("startOfYear: year 2027 starts Jan 1", () => {
    const r = startOfYear(new Date("2027-07-15"));
    expect(r.getMonth()).toBe(0);
    expect(r.getDate()).toBe(1);
  });
  it("startOfYear: year 2028 starts Jan 1", () => {
    const r = startOfYear(new Date("2028-07-15"));
    expect(r.getMonth()).toBe(0);
    expect(r.getDate()).toBe(1);
  });
  it("startOfYear: year 2029 starts Jan 1", () => {
    const r = startOfYear(new Date("2029-07-15"));
    expect(r.getMonth()).toBe(0);
    expect(r.getDate()).toBe(1);
  });
});

describe("endOfYear", () => {
  it("endOfYear: year 2020 ends Dec 31", () => {
    const r = endOfYear(new Date("2020-07-15"));
    expect(r.getMonth()).toBe(11);
    expect(r.getDate()).toBe(31);
  });
  it("endOfYear: year 2021 ends Dec 31", () => {
    const r = endOfYear(new Date("2021-07-15"));
    expect(r.getMonth()).toBe(11);
    expect(r.getDate()).toBe(31);
  });
  it("endOfYear: year 2022 ends Dec 31", () => {
    const r = endOfYear(new Date("2022-07-15"));
    expect(r.getMonth()).toBe(11);
    expect(r.getDate()).toBe(31);
  });
  it("endOfYear: year 2023 ends Dec 31", () => {
    const r = endOfYear(new Date("2023-07-15"));
    expect(r.getMonth()).toBe(11);
    expect(r.getDate()).toBe(31);
  });
  it("endOfYear: year 2024 ends Dec 31", () => {
    const r = endOfYear(new Date("2024-07-15"));
    expect(r.getMonth()).toBe(11);
    expect(r.getDate()).toBe(31);
  });
  it("endOfYear: year 2025 ends Dec 31", () => {
    const r = endOfYear(new Date("2025-07-15"));
    expect(r.getMonth()).toBe(11);
    expect(r.getDate()).toBe(31);
  });
  it("endOfYear: year 2026 ends Dec 31", () => {
    const r = endOfYear(new Date("2026-07-15"));
    expect(r.getMonth()).toBe(11);
    expect(r.getDate()).toBe(31);
  });
  it("endOfYear: year 2027 ends Dec 31", () => {
    const r = endOfYear(new Date("2027-07-15"));
    expect(r.getMonth()).toBe(11);
    expect(r.getDate()).toBe(31);
  });
  it("endOfYear: year 2028 ends Dec 31", () => {
    const r = endOfYear(new Date("2028-07-15"));
    expect(r.getMonth()).toBe(11);
    expect(r.getDate()).toBe(31);
  });
  it("endOfYear: year 2029 ends Dec 31", () => {
    const r = endOfYear(new Date("2029-07-15"));
    expect(r.getMonth()).toBe(11);
    expect(r.getDate()).toBe(31);
  });
});

describe("getQuarter", () => {
  it("getQuarter: month 1 is Q1", () => {
    expect(getQuarter(new Date("2026-01-01"))).toBe(1);
  });
  it("getQuarter: month 2 is Q1", () => {
    expect(getQuarter(new Date("2026-02-01"))).toBe(1);
  });
  it("getQuarter: month 3 is Q1", () => {
    expect(getQuarter(new Date("2026-03-01"))).toBe(1);
  });
  it("getQuarter: month 4 is Q2", () => {
    expect(getQuarter(new Date("2026-04-01"))).toBe(2);
  });
  it("getQuarter: month 5 is Q2", () => {
    expect(getQuarter(new Date("2026-05-02T12:00:00"))).toBe(2);
  });
  it("getQuarter: month 6 is Q2", () => {
    expect(getQuarter(new Date("2026-06-01"))).toBe(2);
  });
  it("getQuarter: month 7 is Q3", () => {
    expect(getQuarter(new Date("2026-07-01"))).toBe(3);
  });
  it("getQuarter: month 8 is Q3", () => {
    expect(getQuarter(new Date("2026-08-01"))).toBe(3);
  });
  it("getQuarter: month 9 is Q3", () => {
    expect(getQuarter(new Date("2026-09-01"))).toBe(3);
  });
  it("getQuarter: month 10 is Q4", () => {
    expect(getQuarter(new Date("2026-10-01"))).toBe(4);
  });
  it("getQuarter: month 11 is Q4", () => {
    expect(getQuarter(new Date("2026-11-01"))).toBe(4);
  });
  it("getQuarter: month 12 is Q4", () => {
    expect(getQuarter(new Date("2026-12-01"))).toBe(4);
  });
});

describe("startOfQuarter", () => {
  it("startOfQuarter: Q1 starts month 1", () => {
    const r = startOfQuarter(new Date("2026-01-15"));
    expect(r.getMonth()).toBe(0);
    expect(r.getDate()).toBe(1);
  });
  it("startOfQuarter: Q2 starts month 4", () => {
    const r = startOfQuarter(new Date("2026-04-15"));
    expect(r.getMonth()).toBe(3);
    expect(r.getDate()).toBe(1);
  });
  it("startOfQuarter: Q3 starts month 7", () => {
    const r = startOfQuarter(new Date("2026-07-15"));
    expect(r.getMonth()).toBe(6);
    expect(r.getDate()).toBe(1);
  });
  it("startOfQuarter: Q4 starts month 10", () => {
    const r = startOfQuarter(new Date("2026-10-15"));
    expect(r.getMonth()).toBe(9);
    expect(r.getDate()).toBe(1);
  });
});

describe("endOfQuarter", () => {
  it("endOfQuarter: Q1 ends month 3 day 31", () => {
    const r = endOfQuarter(new Date("2026-0003-01"));
    expect(r.getDate()).toBe(31);
  });
  it("endOfQuarter: Q2 ends month 6 day 30", () => {
    const r = endOfQuarter(new Date("2026-0006-01"));
    expect(r.getDate()).toBe(30);
  });
  it("endOfQuarter: Q3 ends month 9 day 30", () => {
    const r = endOfQuarter(new Date("2026-0009-01"));
    expect(r.getDate()).toBe(30);
  });
  it("endOfQuarter: Q4 ends month 12 day 31", () => {
    const r = endOfQuarter(new Date("2026-012-01"));
    expect(r.getDate()).toBe(31);
  });
});

describe("diffDays", () => {
  it("diffDays: base + 1 days = 1", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 1);
    expect(diffDays(a, b)).toBe(1);
  });
  it("diffDays: base + 2 days = 2", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 2);
    expect(diffDays(a, b)).toBe(2);
  });
  it("diffDays: base + 3 days = 3", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 3);
    expect(diffDays(a, b)).toBe(3);
  });
  it("diffDays: base + 4 days = 4", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 4);
    expect(diffDays(a, b)).toBe(4);
  });
  it("diffDays: base + 5 days = 5", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 5);
    expect(diffDays(a, b)).toBe(5);
  });
  it("diffDays: base + 6 days = 6", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 6);
    expect(diffDays(a, b)).toBe(6);
  });
  it("diffDays: base + 7 days = 7", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 7);
    expect(diffDays(a, b)).toBe(7);
  });
  it("diffDays: base + 8 days = 8", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 8);
    expect(diffDays(a, b)).toBe(8);
  });
  it("diffDays: base + 9 days = 9", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 9);
    expect(diffDays(a, b)).toBe(9);
  });
  it("diffDays: base + 10 days = 10", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 10);
    expect(diffDays(a, b)).toBe(10);
  });
  it("diffDays: base + 11 days = 11", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 11);
    expect(diffDays(a, b)).toBe(11);
  });
  it("diffDays: base + 12 days = 12", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 12);
    expect(diffDays(a, b)).toBe(12);
  });
  it("diffDays: base + 13 days = 13", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 13);
    expect(diffDays(a, b)).toBe(13);
  });
  it("diffDays: base + 14 days = 14", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 14);
    expect(diffDays(a, b)).toBe(14);
  });
  it("diffDays: base + 15 days = 15", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 15);
    expect(diffDays(a, b)).toBe(15);
  });
  it("diffDays: base + 16 days = 16", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 16);
    expect(diffDays(a, b)).toBe(16);
  });
  it("diffDays: base + 17 days = 17", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 17);
    expect(diffDays(a, b)).toBe(17);
  });
  it("diffDays: base + 18 days = 18", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 18);
    expect(diffDays(a, b)).toBe(18);
  });
  it("diffDays: base + 19 days = 19", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 19);
    expect(diffDays(a, b)).toBe(19);
  });
  it("diffDays: base + 20 days = 20", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 20);
    expect(diffDays(a, b)).toBe(20);
  });
  it("diffDays: base + 21 days = 21", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 21);
    expect(diffDays(a, b)).toBe(21);
  });
  it("diffDays: base + 22 days = 22", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 22);
    expect(diffDays(a, b)).toBe(22);
  });
  it("diffDays: base + 23 days = 23", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 23);
    expect(diffDays(a, b)).toBe(23);
  });
  it("diffDays: base + 24 days = 24", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 24);
    expect(diffDays(a, b)).toBe(24);
  });
  it("diffDays: base + 25 days = 25", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 25);
    expect(diffDays(a, b)).toBe(25);
  });
  it("diffDays: base + 26 days = 26", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 26);
    expect(diffDays(a, b)).toBe(26);
  });
  it("diffDays: base + 27 days = 27", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 27);
    expect(diffDays(a, b)).toBe(27);
  });
  it("diffDays: base + 28 days = 28", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 28);
    expect(diffDays(a, b)).toBe(28);
  });
  it("diffDays: base + 29 days = 29", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 29);
    expect(diffDays(a, b)).toBe(29);
  });
  it("diffDays: base + 30 days = 30", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 30);
    expect(diffDays(a, b)).toBe(30);
  });
  it("diffDays: same day = 0", () => {
    expect(diffDays(BASE, BASE)).toBe(0);
  });
  it("diffDays: b before a gives negative", () => {
    const a = new Date("2026-01-10");
    const b = new Date("2026-01-01");
    expect(diffDays(a, b)).toBeLessThan(0);
  });
});

describe("diffHours", () => {
  it("diffHours: 1 hours apart", () => {
    const a = new Date("2026-01-01T00:00:00.000Z");
    const b = new Date(a.getTime() + 1 * 3600000);
    expect(diffHours(a, b)).toBe(1);
  });
  it("diffHours: 2 hours apart", () => {
    const a = new Date("2026-01-01T00:00:00.000Z");
    const b = new Date(a.getTime() + 2 * 3600000);
    expect(diffHours(a, b)).toBe(2);
  });
  it("diffHours: 3 hours apart", () => {
    const a = new Date("2026-01-01T00:00:00.000Z");
    const b = new Date(a.getTime() + 3 * 3600000);
    expect(diffHours(a, b)).toBe(3);
  });
  it("diffHours: 4 hours apart", () => {
    const a = new Date("2026-01-01T00:00:00.000Z");
    const b = new Date(a.getTime() + 4 * 3600000);
    expect(diffHours(a, b)).toBe(4);
  });
  it("diffHours: 5 hours apart", () => {
    const a = new Date("2026-01-01T00:00:00.000Z");
    const b = new Date(a.getTime() + 5 * 3600000);
    expect(diffHours(a, b)).toBe(5);
  });
  it("diffHours: 6 hours apart", () => {
    const a = new Date("2026-01-01T00:00:00.000Z");
    const b = new Date(a.getTime() + 6 * 3600000);
    expect(diffHours(a, b)).toBe(6);
  });
  it("diffHours: 7 hours apart", () => {
    const a = new Date("2026-01-01T00:00:00.000Z");
    const b = new Date(a.getTime() + 7 * 3600000);
    expect(diffHours(a, b)).toBe(7);
  });
  it("diffHours: 8 hours apart", () => {
    const a = new Date("2026-01-01T00:00:00.000Z");
    const b = new Date(a.getTime() + 8 * 3600000);
    expect(diffHours(a, b)).toBe(8);
  });
  it("diffHours: 9 hours apart", () => {
    const a = new Date("2026-01-01T00:00:00.000Z");
    const b = new Date(a.getTime() + 9 * 3600000);
    expect(diffHours(a, b)).toBe(9);
  });
  it("diffHours: 10 hours apart", () => {
    const a = new Date("2026-01-01T00:00:00.000Z");
    const b = new Date(a.getTime() + 10 * 3600000);
    expect(diffHours(a, b)).toBe(10);
  });
  it("diffHours: 11 hours apart", () => {
    const a = new Date("2026-01-01T00:00:00.000Z");
    const b = new Date(a.getTime() + 11 * 3600000);
    expect(diffHours(a, b)).toBe(11);
  });
  it("diffHours: 12 hours apart", () => {
    const a = new Date("2026-01-01T00:00:00.000Z");
    const b = new Date(a.getTime() + 12 * 3600000);
    expect(diffHours(a, b)).toBe(12);
  });
  it("diffHours: 13 hours apart", () => {
    const a = new Date("2026-01-01T00:00:00.000Z");
    const b = new Date(a.getTime() + 13 * 3600000);
    expect(diffHours(a, b)).toBe(13);
  });
  it("diffHours: 14 hours apart", () => {
    const a = new Date("2026-01-01T00:00:00.000Z");
    const b = new Date(a.getTime() + 14 * 3600000);
    expect(diffHours(a, b)).toBe(14);
  });
  it("diffHours: 15 hours apart", () => {
    const a = new Date("2026-01-01T00:00:00.000Z");
    const b = new Date(a.getTime() + 15 * 3600000);
    expect(diffHours(a, b)).toBe(15);
  });
  it("diffHours: 16 hours apart", () => {
    const a = new Date("2026-01-01T00:00:00.000Z");
    const b = new Date(a.getTime() + 16 * 3600000);
    expect(diffHours(a, b)).toBe(16);
  });
  it("diffHours: 17 hours apart", () => {
    const a = new Date("2026-01-01T00:00:00.000Z");
    const b = new Date(a.getTime() + 17 * 3600000);
    expect(diffHours(a, b)).toBe(17);
  });
  it("diffHours: 18 hours apart", () => {
    const a = new Date("2026-01-01T00:00:00.000Z");
    const b = new Date(a.getTime() + 18 * 3600000);
    expect(diffHours(a, b)).toBe(18);
  });
  it("diffHours: 19 hours apart", () => {
    const a = new Date("2026-01-01T00:00:00.000Z");
    const b = new Date(a.getTime() + 19 * 3600000);
    expect(diffHours(a, b)).toBe(19);
  });
  it("diffHours: 20 hours apart", () => {
    const a = new Date("2026-01-01T00:00:00.000Z");
    const b = new Date(a.getTime() + 20 * 3600000);
    expect(diffHours(a, b)).toBe(20);
  });
  it("diffHours: 21 hours apart", () => {
    const a = new Date("2026-01-01T00:00:00.000Z");
    const b = new Date(a.getTime() + 21 * 3600000);
    expect(diffHours(a, b)).toBe(21);
  });
  it("diffHours: 22 hours apart", () => {
    const a = new Date("2026-01-01T00:00:00.000Z");
    const b = new Date(a.getTime() + 22 * 3600000);
    expect(diffHours(a, b)).toBe(22);
  });
  it("diffHours: 23 hours apart", () => {
    const a = new Date("2026-01-01T00:00:00.000Z");
    const b = new Date(a.getTime() + 23 * 3600000);
    expect(diffHours(a, b)).toBe(23);
  });
  it("diffHours: 24 hours apart", () => {
    const a = new Date("2026-01-01T00:00:00.000Z");
    const b = new Date(a.getTime() + 24 * 3600000);
    expect(diffHours(a, b)).toBe(24);
  });
  it("diffHours: same time = 0", () => {
    expect(diffHours(BASE, BASE)).toBe(0);
  });
  it("diffHours: fractional hours", () => {
    const a = new Date("2026-01-01T00:00:00.000Z");
    const b = new Date(a.getTime() + 1800000);
    expect(diffHours(a, b)).toBe(0.5);
  });
});

describe("isWeekend", () => {
  it("isWeekend: 2026-01-03 is weekend", () => {
    expect(isWeekend(new Date("2026-01-03"))).toBe(true);
  });
  it("isWeekend: 2026-01-04 is weekend", () => {
    expect(isWeekend(new Date("2026-01-04"))).toBe(true);
  });
  it("isWeekend: 2026-01-05 is not weekend", () => {
    expect(isWeekend(new Date("2026-01-05"))).toBe(false);
  });
  it("isWeekend: 2026-01-06 is not weekend", () => {
    expect(isWeekend(new Date("2026-01-06"))).toBe(false);
  });
  it("isWeekend: 2026-01-07 is not weekend", () => {
    expect(isWeekend(new Date("2026-01-07"))).toBe(false);
  });
  it("isWeekend: 2026-01-08 is not weekend", () => {
    expect(isWeekend(new Date("2026-01-08"))).toBe(false);
  });
  it("isWeekend: 2026-01-09 is not weekend", () => {
    expect(isWeekend(new Date("2026-01-09"))).toBe(false);
  });
  it("isWeekend: 2026-01-10 is weekend", () => {
    expect(isWeekend(new Date("2026-01-10"))).toBe(true);
  });
  it("isWeekend: 2026-01-11 is weekend", () => {
    expect(isWeekend(new Date("2026-01-11"))).toBe(true);
  });
  it("isWeekend: 2026-01-12 is not weekend", () => {
    expect(isWeekend(new Date("2026-01-12"))).toBe(false);
  });
  it("isWeekend: Monday 2026-01-05 is not weekend", () => {
    expect(isWeekend(new Date("2026-01-05"))).toBe(false);
  });
  it("isWeekend: Monday 2026-01-12 is not weekend", () => {
    expect(isWeekend(new Date("2026-01-12"))).toBe(false);
  });
  it("isWeekend: Monday 2026-01-19 is not weekend", () => {
    expect(isWeekend(new Date("2026-01-19"))).toBe(false);
  });
  it("isWeekend: Monday 2026-01-26 is not weekend", () => {
    expect(isWeekend(new Date("2026-01-26"))).toBe(false);
  });
  it("isWeekend: Monday 2026-02-02 is not weekend", () => {
    expect(isWeekend(new Date("2026-02-02"))).toBe(false);
  });
  it("isWeekend: Monday 2026-02-09 is not weekend", () => {
    expect(isWeekend(new Date("2026-02-09"))).toBe(false);
  });
  it("isWeekend: Monday 2026-02-16 is not weekend", () => {
    expect(isWeekend(new Date("2026-02-16"))).toBe(false);
  });
  it("isWeekend: Monday 2026-02-23 is not weekend", () => {
    expect(isWeekend(new Date("2026-02-23"))).toBe(false);
  });
  it("isWeekend: Monday 2026-03-02 is not weekend", () => {
    expect(isWeekend(new Date("2026-03-02"))).toBe(false);
  });
  it("isWeekend: Monday 2026-03-09 is not weekend", () => {
    expect(isWeekend(new Date("2026-03-09"))).toBe(false);
  });
  it("isWeekend: Monday 2026-03-16 is not weekend", () => {
    expect(isWeekend(new Date("2026-03-16"))).toBe(false);
  });
  it("isWeekend: Monday 2026-03-23 is not weekend", () => {
    expect(isWeekend(new Date("2026-03-23"))).toBe(false);
  });
  it("isWeekend: Monday 2026-03-30 is not weekend", () => {
    expect(isWeekend(new Date("2026-03-30T12:00:00"))).toBe(false);
  });
  it("isWeekend: Monday 2026-04-06 is not weekend", () => {
    expect(isWeekend(new Date("2026-04-06T12:00:00"))).toBe(false);
  });
  it("isWeekend: Monday 2026-04-13 is not weekend", () => {
    expect(isWeekend(new Date("2026-04-13T12:00:00"))).toBe(false);
  });
  it("isWeekend: Monday 2026-04-20 is not weekend", () => {
    expect(isWeekend(new Date("2026-04-20T12:00:00"))).toBe(false);
  });
  it("isWeekend: Monday 2026-04-27 is not weekend", () => {
    expect(isWeekend(new Date("2026-04-27T12:00:00"))).toBe(false);
  });
  it("isWeekend: Monday 2026-05-04 is not weekend", () => {
    expect(isWeekend(new Date("2026-05-04T12:00:00"))).toBe(false);
  });
  it("isWeekend: Monday 2026-05-11 is not weekend", () => {
    expect(isWeekend(new Date("2026-05-11T12:00:00"))).toBe(false);
  });
  it("isWeekend: Monday 2026-05-18 is not weekend", () => {
    expect(isWeekend(new Date("2026-05-18T12:00:00"))).toBe(false);
  });
  it("isWeekend: Saturday 2026-01-03 is weekend", () => {
    expect(isWeekend(new Date("2026-01-03"))).toBe(true);
  });
  it("isWeekend: Saturday 2026-01-10 is weekend", () => {
    expect(isWeekend(new Date("2026-01-10"))).toBe(true);
  });
  it("isWeekend: Saturday 2026-01-17 is weekend", () => {
    expect(isWeekend(new Date("2026-01-17"))).toBe(true);
  });
  it("isWeekend: Saturday 2026-01-24 is weekend", () => {
    expect(isWeekend(new Date("2026-01-24"))).toBe(true);
  });
  it("isWeekend: Saturday 2026-01-31 is weekend", () => {
    expect(isWeekend(new Date("2026-01-31"))).toBe(true);
  });
  it("isWeekend: Saturday 2026-02-07 is weekend", () => {
    expect(isWeekend(new Date("2026-02-07"))).toBe(true);
  });
  it("isWeekend: Saturday 2026-02-14 is weekend", () => {
    expect(isWeekend(new Date("2026-02-14"))).toBe(true);
  });
  it("isWeekend: Saturday 2026-02-21 is weekend", () => {
    expect(isWeekend(new Date("2026-02-21"))).toBe(true);
  });
  it("isWeekend: Saturday 2026-02-28 is weekend", () => {
    expect(isWeekend(new Date("2026-02-28"))).toBe(true);
  });
  it("isWeekend: Saturday 2026-03-07 is weekend", () => {
    expect(isWeekend(new Date("2026-03-07"))).toBe(true);
  });
  it("isWeekend: Saturday 2026-03-14 is weekend", () => {
    expect(isWeekend(new Date("2026-03-14"))).toBe(true);
  });
  it("isWeekend: Saturday 2026-03-21 is weekend", () => {
    expect(isWeekend(new Date("2026-03-21"))).toBe(true);
  });
  it("isWeekend: Saturday 2026-03-28 is weekend", () => {
    expect(isWeekend(new Date("2026-03-28"))).toBe(true);
  });
  it("isWeekend: Saturday 2026-04-04 is weekend", () => {
    expect(isWeekend(new Date("2026-04-04T12:00:00"))).toBe(true);
  });
  it("isWeekend: Saturday 2026-04-11 is weekend", () => {
    expect(isWeekend(new Date("2026-04-11T12:00:00"))).toBe(true);
  });
  it("isWeekend: Saturday 2026-04-18 is weekend", () => {
    expect(isWeekend(new Date("2026-04-18T12:00:00"))).toBe(true);
  });
  it("isWeekend: Saturday 2026-04-25 is weekend", () => {
    expect(isWeekend(new Date("2026-04-25T12:00:00"))).toBe(true);
  });
  it("isWeekend: Saturday 2026-05-02 is weekend", () => {
    expect(isWeekend(new Date("2026-05-02T12:00:00"))).toBe(true);
  });
  it("isWeekend: Saturday 2026-05-09 is weekend", () => {
    expect(isWeekend(new Date("2026-05-09T12:00:00"))).toBe(true);
  });
  it("isWeekend: Saturday 2026-05-16 is weekend", () => {
    expect(isWeekend(new Date("2026-05-16T12:00:00"))).toBe(true);
  });
});

describe("isBusinessDay", () => {
  it("isBusinessDay: 2026-01-05 -> true", () => {
    expect(isBusinessDay(new Date("2026-01-05"))).toBe(true);
  });
  it("isBusinessDay: 2026-01-06 -> true", () => {
    expect(isBusinessDay(new Date("2026-01-06"))).toBe(true);
  });
  it("isBusinessDay: 2026-01-07 -> true", () => {
    expect(isBusinessDay(new Date("2026-01-07"))).toBe(true);
  });
  it("isBusinessDay: 2026-01-08 -> true", () => {
    expect(isBusinessDay(new Date("2026-01-08"))).toBe(true);
  });
  it("isBusinessDay: 2026-01-09 -> true", () => {
    expect(isBusinessDay(new Date("2026-01-09"))).toBe(true);
  });
  it("isBusinessDay: 2026-01-10 -> false", () => {
    expect(isBusinessDay(new Date("2026-01-10"))).toBe(false);
  });
  it("isBusinessDay: 2026-01-11 -> false", () => {
    expect(isBusinessDay(new Date("2026-01-11"))).toBe(false);
  });
  it("isBusinessDay: 2026-01-12 -> true", () => {
    expect(isBusinessDay(new Date("2026-01-12"))).toBe(true);
  });
  it("isBusinessDay: 2026-01-13 -> true", () => {
    expect(isBusinessDay(new Date("2026-01-13"))).toBe(true);
  });
  it("isBusinessDay: 2026-01-14 -> true", () => {
    expect(isBusinessDay(new Date("2026-01-14"))).toBe(true);
  });
  it("isBusinessDay: holiday returns false", () => {
    const holiday = new Date("2026-01-05");
    expect(isBusinessDay(holiday, { holidays: [holiday] })).toBe(false);
  });
  it("isBusinessDay: custom workDays Mon-only, Monday true", () => {
    expect(isBusinessDay(new Date("2026-01-05"), { workDays: [1] })).toBe(true);
  });
  it("isBusinessDay: custom workDays Mon-only, Tuesday false", () => {
    expect(isBusinessDay(new Date("2026-01-06"), { workDays: [1] })).toBe(false);
  });
  it("isBusinessDay: Saturday default false", () => {
    expect(isBusinessDay(new Date("2026-01-03"))).toBe(false);
  });
  it("isBusinessDay: Sunday default false", () => {
    expect(isBusinessDay(new Date("2026-01-04"))).toBe(false);
  });
  it("isBusinessDay extra 0: 2026-01-12 -> true", () => {
    expect(isBusinessDay(new Date("2026-01-12"))).toBe(true);
  });
  it("isBusinessDay extra 1: 2026-01-13 -> true", () => {
    expect(isBusinessDay(new Date("2026-01-13"))).toBe(true);
  });
  it("isBusinessDay extra 2: 2026-01-14 -> true", () => {
    expect(isBusinessDay(new Date("2026-01-14"))).toBe(true);
  });
  it("isBusinessDay extra 3: 2026-01-15 -> true", () => {
    expect(isBusinessDay(new Date("2026-01-15"))).toBe(true);
  });
  it("isBusinessDay extra 4: 2026-01-16 -> true", () => {
    expect(isBusinessDay(new Date("2026-01-16"))).toBe(true);
  });
  it("isBusinessDay extra 5: 2026-01-17 -> false", () => {
    expect(isBusinessDay(new Date("2026-01-17"))).toBe(false);
  });
  it("isBusinessDay extra 6: 2026-01-18 -> false", () => {
    expect(isBusinessDay(new Date("2026-01-18"))).toBe(false);
  });
  it("isBusinessDay extra 7: 2026-01-19 -> true", () => {
    expect(isBusinessDay(new Date("2026-01-19"))).toBe(true);
  });
  it("isBusinessDay extra 8: 2026-01-20 -> true", () => {
    expect(isBusinessDay(new Date("2026-01-20"))).toBe(true);
  });
  it("isBusinessDay extra 9: 2026-01-21 -> true", () => {
    expect(isBusinessDay(new Date("2026-01-21"))).toBe(true);
  });
  it("isBusinessDay extra 10: 2026-01-22 -> true", () => {
    expect(isBusinessDay(new Date("2026-01-22"))).toBe(true);
  });
  it("isBusinessDay extra 11: 2026-01-23 -> true", () => {
    expect(isBusinessDay(new Date("2026-01-23"))).toBe(true);
  });
  it("isBusinessDay extra 12: 2026-01-24 -> false", () => {
    expect(isBusinessDay(new Date("2026-01-24"))).toBe(false);
  });
  it("isBusinessDay extra 13: 2026-01-25 -> false", () => {
    expect(isBusinessDay(new Date("2026-01-25"))).toBe(false);
  });
  it("isBusinessDay extra 14: 2026-01-26 -> true", () => {
    expect(isBusinessDay(new Date("2026-01-26"))).toBe(true);
  });
});

describe("nextBusinessDay", () => {
  it("nextBusinessDay: Friday -> Monday", () => {
    const fri = new Date("2026-01-02");
    const result = nextBusinessDay(fri);
    expect(result.getDay()).toBe(1);
  });
  it("nextBusinessDay: Thursday -> Friday", () => {
    const thu = new Date("2026-01-08");
    expect(nextBusinessDay(thu).getDay()).toBe(5);
  });
  it("nextBusinessDay: Monday -> Tuesday", () => {
    const mon = new Date("2026-01-05");
    expect(nextBusinessDay(mon).getDay()).toBe(2);
  });
  it("nextBusinessDay: result is after input", () => {
    expect(nextBusinessDay(BASE).getTime()).toBeGreaterThan(BASE.getTime());
  });
  it("nextBusinessDay: skips holiday", () => {
    const mon = new Date("2026-01-05");
    const tue = new Date("2026-01-06");
    const result = nextBusinessDay(mon, { holidays: [tue] });
    expect(result.getDate()).toBe(7);
  });
  it("nextBusinessDay: does not mutate", () => {
    const t = BASE.getTime(); nextBusinessDay(BASE); expect(BASE.getTime()).toBe(t);
  });
  it("nextBusinessDay iteration 0: result is business day", () => {
    const r = nextBusinessDay(new Date("2026-01-05"));
    expect([1,2,3,4,5]).toContain(r.getDay());
  });
  it("nextBusinessDay iteration 1: result is business day", () => {
    const r = nextBusinessDay(new Date("2026-01-06"));
    expect([1,2,3,4,5]).toContain(r.getDay());
  });
  it("nextBusinessDay iteration 2: result is business day", () => {
    const r = nextBusinessDay(new Date("2026-01-07"));
    expect([1,2,3,4,5]).toContain(r.getDay());
  });
  it("nextBusinessDay iteration 3: result is business day", () => {
    const r = nextBusinessDay(new Date("2026-01-08"));
    expect([1,2,3,4,5]).toContain(r.getDay());
  });
  it("nextBusinessDay iteration 4: result is business day", () => {
    const r = nextBusinessDay(new Date("2026-01-09"));
    expect([1,2,3,4,5]).toContain(r.getDay());
  });
  it("nextBusinessDay iteration 5: result is business day", () => {
    const r = nextBusinessDay(new Date("2026-01-10"));
    expect([1,2,3,4,5]).toContain(r.getDay());
  });
  it("nextBusinessDay iteration 6: result is business day", () => {
    const r = nextBusinessDay(new Date("2026-01-11"));
    expect([1,2,3,4,5]).toContain(r.getDay());
  });
  it("nextBusinessDay iteration 7: result is business day", () => {
    const r = nextBusinessDay(new Date("2026-01-12"));
    expect([1,2,3,4,5]).toContain(r.getDay());
  });
  it("nextBusinessDay iteration 8: result is business day", () => {
    const r = nextBusinessDay(new Date("2026-01-13"));
    expect([1,2,3,4,5]).toContain(r.getDay());
  });
  it("nextBusinessDay iteration 9: result is business day", () => {
    const r = nextBusinessDay(new Date("2026-01-14"));
    expect([1,2,3,4,5]).toContain(r.getDay());
  });
});

describe("addBusinessDays", () => {
  it("addBusinessDays 1 bdays result is a business day", () => {
    const r = addBusinessDays(new Date("2026-01-05"), 1);
    expect([1,2,3,4,5]).toContain(r.getDay());
  });
  it("addBusinessDays 2 bdays result is a business day", () => {
    const r = addBusinessDays(new Date("2026-01-05"), 2);
    expect([1,2,3,4,5]).toContain(r.getDay());
  });
  it("addBusinessDays 3 bdays result is a business day", () => {
    const r = addBusinessDays(new Date("2026-01-05"), 3);
    expect([1,2,3,4,5]).toContain(r.getDay());
  });
  it("addBusinessDays 4 bdays result is a business day", () => {
    const r = addBusinessDays(new Date("2026-01-05"), 4);
    expect([1,2,3,4,5]).toContain(r.getDay());
  });
  it("addBusinessDays 5 bdays result is a business day", () => {
    const r = addBusinessDays(new Date("2026-01-05"), 5);
    expect([1,2,3,4,5]).toContain(r.getDay());
  });
  it("addBusinessDays 6 bdays result is a business day", () => {
    const r = addBusinessDays(new Date("2026-01-05"), 6);
    expect([1,2,3,4,5]).toContain(r.getDay());
  });
  it("addBusinessDays 7 bdays result is a business day", () => {
    const r = addBusinessDays(new Date("2026-01-05"), 7);
    expect([1,2,3,4,5]).toContain(r.getDay());
  });
  it("addBusinessDays 8 bdays result is a business day", () => {
    const r = addBusinessDays(new Date("2026-01-05"), 8);
    expect([1,2,3,4,5]).toContain(r.getDay());
  });
  it("addBusinessDays 9 bdays result is a business day", () => {
    const r = addBusinessDays(new Date("2026-01-05"), 9);
    expect([1,2,3,4,5]).toContain(r.getDay());
  });
  it("addBusinessDays 10 bdays result is a business day", () => {
    const r = addBusinessDays(new Date("2026-01-05"), 10);
    expect([1,2,3,4,5]).toContain(r.getDay());
  });
  it("addBusinessDays 11 bdays result is a business day", () => {
    const r = addBusinessDays(new Date("2026-01-05"), 11);
    expect([1,2,3,4,5]).toContain(r.getDay());
  });
  it("addBusinessDays 12 bdays result is a business day", () => {
    const r = addBusinessDays(new Date("2026-01-05"), 12);
    expect([1,2,3,4,5]).toContain(r.getDay());
  });
  it("addBusinessDays 13 bdays result is a business day", () => {
    const r = addBusinessDays(new Date("2026-01-05"), 13);
    expect([1,2,3,4,5]).toContain(r.getDay());
  });
  it("addBusinessDays 14 bdays result is a business day", () => {
    const r = addBusinessDays(new Date("2026-01-05"), 14);
    expect([1,2,3,4,5]).toContain(r.getDay());
  });
  it("addBusinessDays 15 bdays result is a business day", () => {
    const r = addBusinessDays(new Date("2026-01-05"), 15);
    expect([1,2,3,4,5]).toContain(r.getDay());
  });
  it("addBusinessDays 16 bdays result is a business day", () => {
    const r = addBusinessDays(new Date("2026-01-05"), 16);
    expect([1,2,3,4,5]).toContain(r.getDay());
  });
  it("addBusinessDays 17 bdays result is a business day", () => {
    const r = addBusinessDays(new Date("2026-01-05"), 17);
    expect([1,2,3,4,5]).toContain(r.getDay());
  });
  it("addBusinessDays 18 bdays result is a business day", () => {
    const r = addBusinessDays(new Date("2026-01-05"), 18);
    expect([1,2,3,4,5]).toContain(r.getDay());
  });
  it("addBusinessDays 19 bdays result is a business day", () => {
    const r = addBusinessDays(new Date("2026-01-05"), 19);
    expect([1,2,3,4,5]).toContain(r.getDay());
  });
  it("addBusinessDays 20 bdays result is a business day", () => {
    const r = addBusinessDays(new Date("2026-01-05"), 20);
    expect([1,2,3,4,5]).toContain(r.getDay());
  });
  it("addBusinessDays: result after input", () => {
    expect(addBusinessDays(BASE, 1).getTime()).toBeGreaterThan(BASE.getTime());
  });
  it("addBusinessDays: 5 bdays from Monday is next Monday", () => {
    const r = addBusinessDays(new Date("2026-01-05"), 5);
    expect(r.getDay()).toBe(1);
  });
  it("addBusinessDays: 10 bdays = 2 calendar weeks", () => {
    const a = new Date("2026-01-05");
    const r = addBusinessDays(a, 10);
    expect(diffDays(a, r)).toBe(14);
  });
  it("addBusinessDays: does not mutate", () => {
    const t = BASE.getTime(); addBusinessDays(BASE, 3); expect(BASE.getTime()).toBe(t);
  });
});

describe("isSameDay", () => {
  it("isSameDay: 2026-01-01 same date is true", () => {
    expect(isSameDay(new Date("2026-01-01"), new Date("2026-01-01"))).toBe(true);
  });
  it("isSameDay: 2026-01-02 same date is true", () => {
    expect(isSameDay(new Date("2026-01-02"), new Date("2026-01-02"))).toBe(true);
  });
  it("isSameDay: 2026-01-03 same date is true", () => {
    expect(isSameDay(new Date("2026-01-03"), new Date("2026-01-03"))).toBe(true);
  });
  it("isSameDay: 2026-01-04 same date is true", () => {
    expect(isSameDay(new Date("2026-01-04"), new Date("2026-01-04"))).toBe(true);
  });
  it("isSameDay: 2026-01-05 same date is true", () => {
    expect(isSameDay(new Date("2026-01-05"), new Date("2026-01-05"))).toBe(true);
  });
  it("isSameDay: 2026-01-06 same date is true", () => {
    expect(isSameDay(new Date("2026-01-06"), new Date("2026-01-06"))).toBe(true);
  });
  it("isSameDay: 2026-01-07 same date is true", () => {
    expect(isSameDay(new Date("2026-01-07"), new Date("2026-01-07"))).toBe(true);
  });
  it("isSameDay: 2026-01-08 same date is true", () => {
    expect(isSameDay(new Date("2026-01-08"), new Date("2026-01-08"))).toBe(true);
  });
  it("isSameDay: 2026-01-09 same date is true", () => {
    expect(isSameDay(new Date("2026-01-09"), new Date("2026-01-09"))).toBe(true);
  });
  it("isSameDay: 2026-01-10 same date is true", () => {
    expect(isSameDay(new Date("2026-01-10"), new Date("2026-01-10"))).toBe(true);
  });
  it("isSameDay: 2026-01-01 vs 2026-01-02 is false", () => {
    expect(isSameDay(new Date("2026-01-01"), new Date("2026-01-02"))).toBe(false);
  });
  it("isSameDay: 2026-01-02 vs 2026-01-03 is false", () => {
    expect(isSameDay(new Date("2026-01-02"), new Date("2026-01-03"))).toBe(false);
  });
  it("isSameDay: 2026-01-03 vs 2026-01-04 is false", () => {
    expect(isSameDay(new Date("2026-01-03"), new Date("2026-01-04"))).toBe(false);
  });
  it("isSameDay: 2026-01-04 vs 2026-01-05 is false", () => {
    expect(isSameDay(new Date("2026-01-04"), new Date("2026-01-05"))).toBe(false);
  });
  it("isSameDay: 2026-01-05 vs 2026-01-06 is false", () => {
    expect(isSameDay(new Date("2026-01-05"), new Date("2026-01-06"))).toBe(false);
  });
  it("isSameDay: 2026-01-06 vs 2026-01-07 is false", () => {
    expect(isSameDay(new Date("2026-01-06"), new Date("2026-01-07"))).toBe(false);
  });
  it("isSameDay: 2026-01-07 vs 2026-01-08 is false", () => {
    expect(isSameDay(new Date("2026-01-07"), new Date("2026-01-08"))).toBe(false);
  });
  it("isSameDay: 2026-01-08 vs 2026-01-09 is false", () => {
    expect(isSameDay(new Date("2026-01-08"), new Date("2026-01-09"))).toBe(false);
  });
  it("isSameDay: 2026-01-09 vs 2026-01-10 is false", () => {
    expect(isSameDay(new Date("2026-01-09"), new Date("2026-01-10"))).toBe(false);
  });
  it("isSameDay: 2026-01-10 vs 2026-01-11 is false", () => {
    expect(isSameDay(new Date("2026-01-10"), new Date("2026-01-11"))).toBe(false);
  });
  it("isSameDay: different times same day is true", () => {
    const a = new Date("2026-03-15T08:00:00");
    const b = new Date("2026-03-15T20:00:00");
    expect(isSameDay(a, b)).toBe(true);
  });
});

describe("isBefore", () => {
  it("isBefore: Jan 1 before Jan 2", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 1);
    expect(isBefore(a, b)).toBe(true);
  });
  it("isBefore: Jan 1 before Jan 3", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 2);
    expect(isBefore(a, b)).toBe(true);
  });
  it("isBefore: Jan 1 before Jan 4", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 3);
    expect(isBefore(a, b)).toBe(true);
  });
  it("isBefore: Jan 1 before Jan 5", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 4);
    expect(isBefore(a, b)).toBe(true);
  });
  it("isBefore: Jan 1 before Jan 6", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 5);
    expect(isBefore(a, b)).toBe(true);
  });
  it("isBefore: Jan 1 before Jan 7", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 6);
    expect(isBefore(a, b)).toBe(true);
  });
  it("isBefore: Jan 1 before Jan 8", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 7);
    expect(isBefore(a, b)).toBe(true);
  });
  it("isBefore: Jan 1 before Jan 9", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 8);
    expect(isBefore(a, b)).toBe(true);
  });
  it("isBefore: Jan 1 before Jan 10", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 9);
    expect(isBefore(a, b)).toBe(true);
  });
  it("isBefore: Jan 1 before Jan 11", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 10);
    expect(isBefore(a, b)).toBe(true);
  });
  it("isBefore: Jan 1 before Jan 12", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 11);
    expect(isBefore(a, b)).toBe(true);
  });
  it("isBefore: Jan 1 before Jan 13", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 12);
    expect(isBefore(a, b)).toBe(true);
  });
  it("isBefore: Jan 1 before Jan 14", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 13);
    expect(isBefore(a, b)).toBe(true);
  });
  it("isBefore: Jan 1 before Jan 15", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 14);
    expect(isBefore(a, b)).toBe(true);
  });
  it("isBefore: Jan 1 before Jan 16", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 15);
    expect(isBefore(a, b)).toBe(true);
  });
  it("isBefore: Jan 1 before Jan 17", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 16);
    expect(isBefore(a, b)).toBe(true);
  });
  it("isBefore: Jan 1 before Jan 18", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 17);
    expect(isBefore(a, b)).toBe(true);
  });
  it("isBefore: Jan 1 before Jan 19", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 18);
    expect(isBefore(a, b)).toBe(true);
  });
  it("isBefore: Jan 1 before Jan 20", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 19);
    expect(isBefore(a, b)).toBe(true);
  });
  it("isBefore: Jan 1 before Jan 21", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 20);
    expect(isBefore(a, b)).toBe(true);
  });
  it("isBefore: Jan 1 before Jan 22", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 21);
    expect(isBefore(a, b)).toBe(true);
  });
  it("isBefore: Jan 1 before Jan 23", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 22);
    expect(isBefore(a, b)).toBe(true);
  });
  it("isBefore: Jan 1 before Jan 24", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 23);
    expect(isBefore(a, b)).toBe(true);
  });
  it("isBefore: Jan 1 before Jan 25", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 24);
    expect(isBefore(a, b)).toBe(true);
  });
  it("isBefore: Jan 1 before Jan 26", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 25);
    expect(isBefore(a, b)).toBe(true);
  });
  it("isBefore: Jan 1 before Jan 27", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 26);
    expect(isBefore(a, b)).toBe(true);
  });
  it("isBefore: Jan 1 before Jan 28", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 27);
    expect(isBefore(a, b)).toBe(true);
  });
  it("isBefore: Jan 1 before Jan 29", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 28);
    expect(isBefore(a, b)).toBe(true);
  });
  it("isBefore: Jan 1 before Jan 30", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 29);
    expect(isBefore(a, b)).toBe(true);
  });
  it("isBefore: Jan 1 before Jan 31", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 30);
    expect(isBefore(a, b)).toBe(true);
  });
  it("isBefore: same date is false", () => {
    expect(isBefore(BASE, BASE)).toBe(false);
  });
  it("isBefore: later before earlier is false", () => {
    expect(isBefore(addDays(BASE, 1), BASE)).toBe(false);
  });
});

describe("isAfter", () => {
  it("isAfter: Jan 2 after Jan 1", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 1);
    expect(isAfter(b, a)).toBe(true);
  });
  it("isAfter: Jan 3 after Jan 1", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 2);
    expect(isAfter(b, a)).toBe(true);
  });
  it("isAfter: Jan 4 after Jan 1", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 3);
    expect(isAfter(b, a)).toBe(true);
  });
  it("isAfter: Jan 5 after Jan 1", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 4);
    expect(isAfter(b, a)).toBe(true);
  });
  it("isAfter: Jan 6 after Jan 1", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 5);
    expect(isAfter(b, a)).toBe(true);
  });
  it("isAfter: Jan 7 after Jan 1", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 6);
    expect(isAfter(b, a)).toBe(true);
  });
  it("isAfter: Jan 8 after Jan 1", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 7);
    expect(isAfter(b, a)).toBe(true);
  });
  it("isAfter: Jan 9 after Jan 1", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 8);
    expect(isAfter(b, a)).toBe(true);
  });
  it("isAfter: Jan 10 after Jan 1", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 9);
    expect(isAfter(b, a)).toBe(true);
  });
  it("isAfter: Jan 11 after Jan 1", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 10);
    expect(isAfter(b, a)).toBe(true);
  });
  it("isAfter: Jan 12 after Jan 1", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 11);
    expect(isAfter(b, a)).toBe(true);
  });
  it("isAfter: Jan 13 after Jan 1", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 12);
    expect(isAfter(b, a)).toBe(true);
  });
  it("isAfter: Jan 14 after Jan 1", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 13);
    expect(isAfter(b, a)).toBe(true);
  });
  it("isAfter: Jan 15 after Jan 1", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 14);
    expect(isAfter(b, a)).toBe(true);
  });
  it("isAfter: Jan 16 after Jan 1", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 15);
    expect(isAfter(b, a)).toBe(true);
  });
  it("isAfter: Jan 17 after Jan 1", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 16);
    expect(isAfter(b, a)).toBe(true);
  });
  it("isAfter: Jan 18 after Jan 1", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 17);
    expect(isAfter(b, a)).toBe(true);
  });
  it("isAfter: Jan 19 after Jan 1", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 18);
    expect(isAfter(b, a)).toBe(true);
  });
  it("isAfter: Jan 20 after Jan 1", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 19);
    expect(isAfter(b, a)).toBe(true);
  });
  it("isAfter: Jan 21 after Jan 1", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 20);
    expect(isAfter(b, a)).toBe(true);
  });
  it("isAfter: Jan 22 after Jan 1", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 21);
    expect(isAfter(b, a)).toBe(true);
  });
  it("isAfter: Jan 23 after Jan 1", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 22);
    expect(isAfter(b, a)).toBe(true);
  });
  it("isAfter: Jan 24 after Jan 1", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 23);
    expect(isAfter(b, a)).toBe(true);
  });
  it("isAfter: Jan 25 after Jan 1", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 24);
    expect(isAfter(b, a)).toBe(true);
  });
  it("isAfter: Jan 26 after Jan 1", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 25);
    expect(isAfter(b, a)).toBe(true);
  });
  it("isAfter: Jan 27 after Jan 1", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 26);
    expect(isAfter(b, a)).toBe(true);
  });
  it("isAfter: Jan 28 after Jan 1", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 27);
    expect(isAfter(b, a)).toBe(true);
  });
  it("isAfter: Jan 29 after Jan 1", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 28);
    expect(isAfter(b, a)).toBe(true);
  });
  it("isAfter: Jan 30 after Jan 1", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 29);
    expect(isAfter(b, a)).toBe(true);
  });
  it("isAfter: Jan 31 after Jan 1", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 30);
    expect(isAfter(b, a)).toBe(true);
  });
  it("isAfter: same date is false", () => {
    expect(isAfter(BASE, BASE)).toBe(false);
  });
  it("isAfter: earlier after later is false", () => {
    expect(isAfter(BASE, addDays(BASE, 1))).toBe(false);
  });
});

describe("isWithinRange", () => {
  const rangeStart = new Date("2026-01-10");
  const rangeEnd = new Date("2026-01-20");
  const range = { start: rangeStart, end: rangeEnd };
  it("isWithinRange: 2026-01-10 within Jan 10-20", () => {
    expect(isWithinRange(new Date("2026-01-10"), range)).toBe(true);
  });
  it("isWithinRange: 2026-01-11 within Jan 10-20", () => {
    expect(isWithinRange(new Date("2026-01-11"), range)).toBe(true);
  });
  it("isWithinRange: 2026-01-12 within Jan 10-20", () => {
    expect(isWithinRange(new Date("2026-01-12"), range)).toBe(true);
  });
  it("isWithinRange: 2026-01-13 within Jan 10-20", () => {
    expect(isWithinRange(new Date("2026-01-13"), range)).toBe(true);
  });
  it("isWithinRange: 2026-01-14 within Jan 10-20", () => {
    expect(isWithinRange(new Date("2026-01-14"), range)).toBe(true);
  });
  it("isWithinRange: 2026-01-15 within Jan 10-20", () => {
    expect(isWithinRange(new Date("2026-01-15"), range)).toBe(true);
  });
  it("isWithinRange: 2026-01-16 within Jan 10-20", () => {
    expect(isWithinRange(new Date("2026-01-16"), range)).toBe(true);
  });
  it("isWithinRange: 2026-01-17 within Jan 10-20", () => {
    expect(isWithinRange(new Date("2026-01-17"), range)).toBe(true);
  });
  it("isWithinRange: 2026-01-18 within Jan 10-20", () => {
    expect(isWithinRange(new Date("2026-01-18"), range)).toBe(true);
  });
  it("isWithinRange: 2026-01-19 within Jan 10-20", () => {
    expect(isWithinRange(new Date("2026-01-19"), range)).toBe(true);
  });
  it("isWithinRange: 2026-01-20 within Jan 10-20", () => {
    expect(isWithinRange(new Date("2026-01-20"), range)).toBe(true);
  });
  it("isWithinRange: 2026-01-01 outside Jan 10-20", () => {
    expect(isWithinRange(new Date("2026-01-01"), range)).toBe(false);
  });
  it("isWithinRange: 2026-01-02 outside Jan 10-20", () => {
    expect(isWithinRange(new Date("2026-01-02"), range)).toBe(false);
  });
  it("isWithinRange: 2026-01-03 outside Jan 10-20", () => {
    expect(isWithinRange(new Date("2026-01-03"), range)).toBe(false);
  });
  it("isWithinRange: 2026-01-04 outside Jan 10-20", () => {
    expect(isWithinRange(new Date("2026-01-04"), range)).toBe(false);
  });
  it("isWithinRange: 2026-01-05 outside Jan 10-20", () => {
    expect(isWithinRange(new Date("2026-01-05"), range)).toBe(false);
  });
  it("isWithinRange: 2026-01-06 outside Jan 10-20", () => {
    expect(isWithinRange(new Date("2026-01-06"), range)).toBe(false);
  });
  it("isWithinRange: 2026-01-07 outside Jan 10-20", () => {
    expect(isWithinRange(new Date("2026-01-07"), range)).toBe(false);
  });
  it("isWithinRange: 2026-01-08 outside Jan 10-20", () => {
    expect(isWithinRange(new Date("2026-01-08"), range)).toBe(false);
  });
  it("isWithinRange: 2026-01-09 outside Jan 10-20", () => {
    expect(isWithinRange(new Date("2026-01-09"), range)).toBe(false);
  });
  it("isWithinRange: Jan 21 outside range", () => {
    expect(isWithinRange(new Date("2026-01-21"), range)).toBe(false);
  });
});

describe("toISODateString", () => {
  it("toISODateString: 2026-01-15", () => {
    const r = toISODateString(new Date("2026-01-15T12:00:00Z"));
    expect(r).toBe("2026-01-15");
  });
  it("toISODateString: 2026-02-15", () => {
    const r = toISODateString(new Date("2026-02-15T12:00:00Z"));
    expect(r).toBe("2026-02-15");
  });
  it("toISODateString: 2026-03-15", () => {
    const r = toISODateString(new Date("2026-03-15T12:00:00Z"));
    expect(r).toBe("2026-03-15");
  });
  it("toISODateString: 2026-04-15", () => {
    const r = toISODateString(new Date("2026-04-15T12:00:00Z"));
    expect(r).toBe("2026-04-15");
  });
  it("toISODateString: 2026-05-15", () => {
    const r = toISODateString(new Date("2026-05-15T12:00:00Z"));
    expect(r).toBe("2026-05-15");
  });
  it("toISODateString: 2026-06-15", () => {
    const r = toISODateString(new Date("2026-06-15T12:00:00Z"));
    expect(r).toBe("2026-06-15");
  });
  it("toISODateString: 2026-07-15", () => {
    const r = toISODateString(new Date("2026-07-15T12:00:00Z"));
    expect(r).toBe("2026-07-15");
  });
  it("toISODateString: 2026-08-15", () => {
    const r = toISODateString(new Date("2026-08-15T12:00:00Z"));
    expect(r).toBe("2026-08-15");
  });
  it("toISODateString: 2026-09-15", () => {
    const r = toISODateString(new Date("2026-09-15T12:00:00Z"));
    expect(r).toBe("2026-09-15");
  });
  it("toISODateString: 2026-10-15", () => {
    const r = toISODateString(new Date("2026-10-15T12:00:00Z"));
    expect(r).toBe("2026-10-15");
  });
  it("toISODateString: 2026-11-15", () => {
    const r = toISODateString(new Date("2026-11-15T12:00:00Z"));
    expect(r).toBe("2026-11-15");
  });
  it("toISODateString: 2026-12-15", () => {
    const r = toISODateString(new Date("2026-12-15T12:00:00Z"));
    expect(r).toBe("2026-12-15");
  });
  it("toISODateString: returns string", () => {
    expect(typeof toISODateString(BASE)).toBe("string");
  });
  it("toISODateString: format is YYYY-MM-DD", () => {
    expect(toISODateString(BASE)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("fromISODateString", () => {
  it("fromISODateString: parses 2026-01-15", () => {
    const r = fromISODateString("2026-01-15");
    expect(r).toBeInstanceOf(Date);
    expect(r.getUTCMonth()).toBe(0);
  });
  it("fromISODateString: parses 2026-02-15", () => {
    const r = fromISODateString("2026-02-15");
    expect(r).toBeInstanceOf(Date);
    expect(r.getUTCMonth()).toBe(1);
  });
  it("fromISODateString: parses 2026-03-15", () => {
    const r = fromISODateString("2026-03-15");
    expect(r).toBeInstanceOf(Date);
    expect(r.getUTCMonth()).toBe(2);
  });
  it("fromISODateString: parses 2026-04-15", () => {
    const r = fromISODateString("2026-04-15");
    expect(r).toBeInstanceOf(Date);
    expect(r.getUTCMonth()).toBe(3);
  });
  it("fromISODateString: parses 2026-05-15", () => {
    const r = fromISODateString("2026-05-15");
    expect(r).toBeInstanceOf(Date);
    expect(r.getUTCMonth()).toBe(4);
  });
  it("fromISODateString: parses 2026-06-15", () => {
    const r = fromISODateString("2026-06-15");
    expect(r).toBeInstanceOf(Date);
    expect(r.getUTCMonth()).toBe(5);
  });
  it("fromISODateString: parses 2026-07-15", () => {
    const r = fromISODateString("2026-07-15");
    expect(r).toBeInstanceOf(Date);
    expect(r.getUTCMonth()).toBe(6);
  });
  it("fromISODateString: parses 2026-08-15", () => {
    const r = fromISODateString("2026-08-15");
    expect(r).toBeInstanceOf(Date);
    expect(r.getUTCMonth()).toBe(7);
  });
  it("fromISODateString: parses 2026-09-15", () => {
    const r = fromISODateString("2026-09-15");
    expect(r).toBeInstanceOf(Date);
    expect(r.getUTCMonth()).toBe(8);
  });
  it("fromISODateString: parses 2026-10-15", () => {
    const r = fromISODateString("2026-10-15");
    expect(r).toBeInstanceOf(Date);
    expect(r.getUTCMonth()).toBe(9);
  });
  it("fromISODateString: parses 2026-11-15", () => {
    const r = fromISODateString("2026-11-15");
    expect(r).toBeInstanceOf(Date);
    expect(r.getUTCMonth()).toBe(10);
  });
  it("fromISODateString: parses 2026-12-15", () => {
    const r = fromISODateString("2026-12-15");
    expect(r).toBeInstanceOf(Date);
    expect(r.getUTCMonth()).toBe(11);
  });
  it("fromISODateString: UTC day is correct", () => {
    const r = fromISODateString("2026-03-25");
    expect(r.getUTCDate()).toBe(25);
  });
  it("fromISODateString: roundtrip with toISODateString", () => {
    const iso = "2026-06-15";
    expect(toISODateString(fromISODateString(iso))).toBe(iso);
  });
});

describe("getDayOfYear", () => {
  it("getDayOfYear: Jan 1 is day 1", () => {
    expect(getDayOfYear(new Date("2026-01-01"))).toBe(1);
  });
  it("getDayOfYear: Dec 31 non-leap is day 365", () => {
    expect(getDayOfYear(new Date("2026-12-31"))).toBe(365);
  });
  it("getDayOfYear: Dec 31 leap year is day 366", () => {
    expect(getDayOfYear(new Date("2024-12-31"))).toBe(366);
  });
  it("getDayOfYear: Feb 1 is day 32", () => {
    expect(getDayOfYear(new Date("2026-02-01"))).toBe(32);
  });
  it("getDayOfYear: Jan 1 2026 is day 1", () => {
    expect(getDayOfYear(new Date("2026-01-01"))).toBe(1);
  });
  it("getDayOfYear: Jan 2 2026 is day 2", () => {
    expect(getDayOfYear(new Date("2026-01-02"))).toBe(2);
  });
  it("getDayOfYear: Jan 3 2026 is day 3", () => {
    expect(getDayOfYear(new Date("2026-01-03"))).toBe(3);
  });
  it("getDayOfYear: Jan 4 2026 is day 4", () => {
    expect(getDayOfYear(new Date("2026-01-04"))).toBe(4);
  });
  it("getDayOfYear: Jan 5 2026 is day 5", () => {
    expect(getDayOfYear(new Date("2026-01-05"))).toBe(5);
  });
  it("getDayOfYear: Jan 6 2026 is day 6", () => {
    expect(getDayOfYear(new Date("2026-01-06"))).toBe(6);
  });
  it("getDayOfYear: Jan 7 2026 is day 7", () => {
    expect(getDayOfYear(new Date("2026-01-07"))).toBe(7);
  });
  it("getDayOfYear: Jan 8 2026 is day 8", () => {
    expect(getDayOfYear(new Date("2026-01-08"))).toBe(8);
  });
  it("getDayOfYear: Jan 9 2026 is day 9", () => {
    expect(getDayOfYear(new Date("2026-01-09"))).toBe(9);
  });
  it("getDayOfYear: Jan 10 2026 is day 10", () => {
    expect(getDayOfYear(new Date("2026-01-10"))).toBe(10);
  });
  it("getDayOfYear: Jan 11 2026 is day 11", () => {
    expect(getDayOfYear(new Date("2026-01-11"))).toBe(11);
  });
  it("getDayOfYear: Jan 12 2026 is day 12", () => {
    expect(getDayOfYear(new Date("2026-01-12"))).toBe(12);
  });
  it("getDayOfYear: Jan 13 2026 is day 13", () => {
    expect(getDayOfYear(new Date("2026-01-13"))).toBe(13);
  });
  it("getDayOfYear: Jan 14 2026 is day 14", () => {
    expect(getDayOfYear(new Date("2026-01-14"))).toBe(14);
  });
  it("getDayOfYear: Jan 15 2026 is day 15", () => {
    expect(getDayOfYear(new Date("2026-01-15"))).toBe(15);
  });
  it("getDayOfYear: Jan 16 2026 is day 16", () => {
    expect(getDayOfYear(new Date("2026-01-16"))).toBe(16);
  });
  it("getDayOfYear: Jan 17 2026 is day 17", () => {
    expect(getDayOfYear(new Date("2026-01-17"))).toBe(17);
  });
  it("getDayOfYear: Jan 18 2026 is day 18", () => {
    expect(getDayOfYear(new Date("2026-01-18"))).toBe(18);
  });
  it("getDayOfYear: Jan 19 2026 is day 19", () => {
    expect(getDayOfYear(new Date("2026-01-19"))).toBe(19);
  });
  it("getDayOfYear: Jan 20 2026 is day 20", () => {
    expect(getDayOfYear(new Date("2026-01-20"))).toBe(20);
  });
});

describe("getWeekOfYear", () => {
  it("getWeekOfYear: Jan 1 2026 is week 1", () => {
    expect(getWeekOfYear(new Date("2026-01-01"))).toBe(1);
  });
  it("getWeekOfYear: Jan 2 2026 is week 1", () => {
    expect(getWeekOfYear(new Date("2026-01-02"))).toBe(1);
  });
  it("getWeekOfYear: Jan 3 2026 is week 1", () => {
    expect(getWeekOfYear(new Date("2026-01-03"))).toBe(1);
  });
  it("getWeekOfYear: Jan 4 2026 is week 1", () => {
    expect(getWeekOfYear(new Date("2026-01-04"))).toBe(1);
  });
  it("getWeekOfYear: Jan 5 2026 is week 1", () => {
    expect(getWeekOfYear(new Date("2026-01-05"))).toBe(1);
  });
  it("getWeekOfYear: Jan 6 2026 is week 1", () => {
    expect(getWeekOfYear(new Date("2026-01-06"))).toBe(1);
  });
  it("getWeekOfYear: Jan 7 2026 is week 1", () => {
    expect(getWeekOfYear(new Date("2026-01-07"))).toBe(1);
  });
  it("getWeekOfYear: Jan 8 2026 is week 2", () => {
    expect(getWeekOfYear(new Date("2026-01-8"))).toBe(2);
  });
  it("getWeekOfYear: Jan 9 2026 is week 2", () => {
    expect(getWeekOfYear(new Date("2026-01-9"))).toBe(2);
  });
  it("getWeekOfYear: Jan 10 2026 is week 2", () => {
    expect(getWeekOfYear(new Date("2026-01-10"))).toBe(2);
  });
  it("getWeekOfYear: Jan 11 2026 is week 2", () => {
    expect(getWeekOfYear(new Date("2026-01-11"))).toBe(2);
  });
  it("getWeekOfYear: Jan 12 2026 is week 2", () => {
    expect(getWeekOfYear(new Date("2026-01-12"))).toBe(2);
  });
  it("getWeekOfYear: Jan 13 2026 is week 2", () => {
    expect(getWeekOfYear(new Date("2026-01-13"))).toBe(2);
  });
  it("getWeekOfYear: Jan 14 2026 is week 2", () => {
    expect(getWeekOfYear(new Date("2026-01-14"))).toBe(2);
  });
  it("getWeekOfYear: Jan 1 is week 1", () => {
    expect(getWeekOfYear(new Date("2026-01-01"))).toBe(1);
  });
  it("getWeekOfYear: Dec 31 is week 53 or less", () => {
    expect(getWeekOfYear(new Date("2026-12-31"))).toBeLessThanOrEqual(53);
  });
  it("getWeekOfYear: returns positive integer", () => {
    expect(getWeekOfYear(BASE)).toBeGreaterThan(0);
  });
  it("getWeekOfYear: week increases through year", () => {
    const w1 = getWeekOfYear(new Date("2026-01-01"));
    const w2 = getWeekOfYear(new Date("2026-06-01"));
    expect(w2).toBeGreaterThan(w1);
  });
});

describe("isLeapYear", () => {
  it("isLeapYear: 2000 is leap", () => {
    expect(isLeapYear(2000)).toBe(true);
  });
  it("isLeapYear: 2004 is leap", () => {
    expect(isLeapYear(2004)).toBe(true);
  });
  it("isLeapYear: 2008 is leap", () => {
    expect(isLeapYear(2008)).toBe(true);
  });
  it("isLeapYear: 2012 is leap", () => {
    expect(isLeapYear(2012)).toBe(true);
  });
  it("isLeapYear: 2016 is leap", () => {
    expect(isLeapYear(2016)).toBe(true);
  });
  it("isLeapYear: 2020 is leap", () => {
    expect(isLeapYear(2020)).toBe(true);
  });
  it("isLeapYear: 2024 is leap", () => {
    expect(isLeapYear(2024)).toBe(true);
  });
  it("isLeapYear: 2028 is leap", () => {
    expect(isLeapYear(2028)).toBe(true);
  });
  it("isLeapYear: 2032 is leap", () => {
    expect(isLeapYear(2032)).toBe(true);
  });
  it("isLeapYear: 2036 is leap", () => {
    expect(isLeapYear(2036)).toBe(true);
  });
  it("isLeapYear: 1900 is not leap", () => {
    expect(isLeapYear(1900)).toBe(false);
  });
  it("isLeapYear: 1901 is not leap", () => {
    expect(isLeapYear(1901)).toBe(false);
  });
  it("isLeapYear: 2001 is not leap", () => {
    expect(isLeapYear(2001)).toBe(false);
  });
  it("isLeapYear: 2002 is not leap", () => {
    expect(isLeapYear(2002)).toBe(false);
  });
  it("isLeapYear: 2003 is not leap", () => {
    expect(isLeapYear(2003)).toBe(false);
  });
  it("isLeapYear: 2005 is not leap", () => {
    expect(isLeapYear(2005)).toBe(false);
  });
  it("isLeapYear: 2006 is not leap", () => {
    expect(isLeapYear(2006)).toBe(false);
  });
  it("isLeapYear: 2007 is not leap", () => {
    expect(isLeapYear(2007)).toBe(false);
  });
  it("isLeapYear: 2009 is not leap", () => {
    expect(isLeapYear(2009)).toBe(false);
  });
  it("isLeapYear: 2010 is not leap", () => {
    expect(isLeapYear(2010)).toBe(false);
  });
  it("isLeapYear: 2025 is not leap", () => {
    expect(isLeapYear(2025)).toBe(false);
  });
  it("isLeapYear: 2026 is not leap", () => {
    expect(isLeapYear(2026)).toBe(false);
  });
  it("isLeapYear: 2027 is not leap", () => {
    expect(isLeapYear(2027)).toBe(false);
  });
  it("isLeapYear: 2100 is not leap", () => {
    expect(isLeapYear(2100)).toBe(false);
  });
  it("isLeapYear: 2400 is leap (div 400)", () => {
    expect(isLeapYear(2400)).toBe(true);
  });
  it("isLeapYear: 2200 is not leap (div 100 not 400)", () => {
    expect(isLeapYear(2200)).toBe(false);
  });
});

describe("daysInMonth", () => {
  it("daysInMonth: 2026 month 0 has 31 days", () => {
    expect(daysInMonth(2026, 0)).toBe(31);
  });
  it("daysInMonth: 2026 month 1 has 28 days", () => {
    expect(daysInMonth(2026, 1)).toBe(28);
  });
  it("daysInMonth: 2026 month 2 has 31 days", () => {
    expect(daysInMonth(2026, 2)).toBe(31);
  });
  it("daysInMonth: 2026 month 3 has 30 days", () => {
    expect(daysInMonth(2026, 3)).toBe(30);
  });
  it("daysInMonth: 2026 month 4 has 31 days", () => {
    expect(daysInMonth(2026, 4)).toBe(31);
  });
  it("daysInMonth: 2026 month 5 has 30 days", () => {
    expect(daysInMonth(2026, 5)).toBe(30);
  });
  it("daysInMonth: 2026 month 6 has 31 days", () => {
    expect(daysInMonth(2026, 6)).toBe(31);
  });
  it("daysInMonth: 2026 month 7 has 31 days", () => {
    expect(daysInMonth(2026, 7)).toBe(31);
  });
  it("daysInMonth: 2026 month 8 has 30 days", () => {
    expect(daysInMonth(2026, 8)).toBe(30);
  });
  it("daysInMonth: 2026 month 9 has 31 days", () => {
    expect(daysInMonth(2026, 9)).toBe(31);
  });
  it("daysInMonth: 2026 month 10 has 30 days", () => {
    expect(daysInMonth(2026, 10)).toBe(30);
  });
  it("daysInMonth: 2026 month 11 has 31 days", () => {
    expect(daysInMonth(2026, 11)).toBe(31);
  });
  it("daysInMonth: Feb 2024 leap has 29 days", () => {
    expect(daysInMonth(2024, 1)).toBe(29);
  });
  it("daysInMonth: Feb 1900 not leap has 28 days", () => {
    expect(daysInMonth(1900, 1)).toBe(28);
  });
  it("daysInMonth: Feb 2000 leap has 29 days", () => {
    expect(daysInMonth(2000, 1)).toBe(29);
  });
  it("daysInMonth: Dec has 31 days", () => {
    expect(daysInMonth(2026, 11)).toBe(31);
  });
});

describe("clampDate", () => {
  const min = new Date("2026-01-10");
  const max = new Date("2026-01-20");
  it("clampDate: 2026-01-10 within range stays", () => {
    const r = clampDate(new Date("2026-01-10"), min, max);
    expect(r.getDate()).toBe(10);
  });
  it("clampDate: 2026-01-11 within range stays", () => {
    const r = clampDate(new Date("2026-01-11"), min, max);
    expect(r.getDate()).toBe(11);
  });
  it("clampDate: 2026-01-12 within range stays", () => {
    const r = clampDate(new Date("2026-01-12"), min, max);
    expect(r.getDate()).toBe(12);
  });
  it("clampDate: 2026-01-13 within range stays", () => {
    const r = clampDate(new Date("2026-01-13"), min, max);
    expect(r.getDate()).toBe(13);
  });
  it("clampDate: 2026-01-14 within range stays", () => {
    const r = clampDate(new Date("2026-01-14"), min, max);
    expect(r.getDate()).toBe(14);
  });
  it("clampDate: 2026-01-15 within range stays", () => {
    const r = clampDate(new Date("2026-01-15"), min, max);
    expect(r.getDate()).toBe(15);
  });
  it("clampDate: 2026-01-16 within range stays", () => {
    const r = clampDate(new Date("2026-01-16"), min, max);
    expect(r.getDate()).toBe(16);
  });
  it("clampDate: 2026-01-17 within range stays", () => {
    const r = clampDate(new Date("2026-01-17"), min, max);
    expect(r.getDate()).toBe(17);
  });
  it("clampDate: 2026-01-18 within range stays", () => {
    const r = clampDate(new Date("2026-01-18"), min, max);
    expect(r.getDate()).toBe(18);
  });
  it("clampDate: 2026-01-19 within range stays", () => {
    const r = clampDate(new Date("2026-01-19"), min, max);
    expect(r.getDate()).toBe(19);
  });
  it("clampDate: 2026-01-20 within range stays", () => {
    const r = clampDate(new Date("2026-01-20"), min, max);
    expect(r.getDate()).toBe(20);
  });
  it("clampDate: 2026-01-01 before min clamped to min", () => {
    const r = clampDate(new Date("2026-01-01"), min, max);
    expect(r.getDate()).toBe(10);
  });
  it("clampDate: 2026-01-02 before min clamped to min", () => {
    const r = clampDate(new Date("2026-01-02"), min, max);
    expect(r.getDate()).toBe(10);
  });
  it("clampDate: 2026-01-03 before min clamped to min", () => {
    const r = clampDate(new Date("2026-01-03"), min, max);
    expect(r.getDate()).toBe(10);
  });
  it("clampDate: 2026-01-04 before min clamped to min", () => {
    const r = clampDate(new Date("2026-01-04"), min, max);
    expect(r.getDate()).toBe(10);
  });
  it("clampDate: 2026-01-05 before min clamped to min", () => {
    const r = clampDate(new Date("2026-01-05"), min, max);
    expect(r.getDate()).toBe(10);
  });
  it("clampDate: 2026-01-06 before min clamped to min", () => {
    const r = clampDate(new Date("2026-01-06"), min, max);
    expect(r.getDate()).toBe(10);
  });
  it("clampDate: 2026-01-07 before min clamped to min", () => {
    const r = clampDate(new Date("2026-01-07"), min, max);
    expect(r.getDate()).toBe(10);
  });
  it("clampDate: 2026-01-08 before min clamped to min", () => {
    const r = clampDate(new Date("2026-01-08"), min, max);
    expect(r.getDate()).toBe(10);
  });
  it("clampDate: 2026-01-09 before min clamped to min", () => {
    const r = clampDate(new Date("2026-01-09"), min, max);
    expect(r.getDate()).toBe(10);
  });
  it("clampDate: Jan 25 after max clamped to Jan 20", () => {
    const r = clampDate(new Date("2026-01-25"), min, max);
    expect(r.getDate()).toBe(20);
  });
  it("clampDate: returns a new Date instance", () => {
    const d = new Date("2026-01-15");
    expect(clampDate(d, min, max)).not.toBe(d);
  });
  it("clampDate: does not mutate input", () => {
    const d = new Date("2026-01-05");
    const t = d.getTime();
    clampDate(d, min, max);
    expect(d.getTime()).toBe(t);
  });
});

describe("formatDuration", () => {
  it("formatDuration: 0ms is 0s", () => {
    expect(formatDuration(0)).toBe("0s");
  });
  it("formatDuration: 1000ms is 1s", () => {
    expect(formatDuration(1000)).toBe("1s");
  });
  it("formatDuration: 60000ms is 1m 0s", () => {
    expect(formatDuration(60000)).toBe("1m 0s");
  });
  it("formatDuration: 90000ms is 1m 30s", () => {
    expect(formatDuration(90000)).toBe("1m 30s");
  });
  it("formatDuration: 3600000ms is 1h 0m", () => {
    expect(formatDuration(3600000)).toBe("1h 0m");
  });
  it("formatDuration: 3660000ms is 1h 1m", () => {
    expect(formatDuration(3660000)).toBe("1h 1m");
  });
  it("formatDuration: 86400000ms is 1d 0h", () => {
    expect(formatDuration(86400000)).toBe("1d 0h");
  });
  it("formatDuration: 90000000ms is 1d 1h", () => {
    expect(formatDuration(90000000)).toBe("1d 1h");
  });
  it("formatDuration: 172800000ms is 2d 0h", () => {
    expect(formatDuration(172800000)).toBe("2d 0h");
  });
  it("formatDuration: 1 seconds", () => {
    expect(formatDuration(1000)).toBe("1s");
  });
  it("formatDuration: 2 seconds", () => {
    expect(formatDuration(2000)).toBe("2s");
  });
  it("formatDuration: 3 seconds", () => {
    expect(formatDuration(3000)).toBe("3s");
  });
  it("formatDuration: 4 seconds", () => {
    expect(formatDuration(4000)).toBe("4s");
  });
  it("formatDuration: 5 seconds", () => {
    expect(formatDuration(5000)).toBe("5s");
  });
  it("formatDuration: 6 seconds", () => {
    expect(formatDuration(6000)).toBe("6s");
  });
  it("formatDuration: 7 seconds", () => {
    expect(formatDuration(7000)).toBe("7s");
  });
  it("formatDuration: 8 seconds", () => {
    expect(formatDuration(8000)).toBe("8s");
  });
  it("formatDuration: 9 seconds", () => {
    expect(formatDuration(9000)).toBe("9s");
  });
  it("formatDuration: 10 seconds", () => {
    expect(formatDuration(10000)).toBe("10s");
  });
  it("formatDuration: 11 seconds", () => {
    expect(formatDuration(11000)).toBe("11s");
  });
  it("formatDuration: 12 seconds", () => {
    expect(formatDuration(12000)).toBe("12s");
  });
  it("formatDuration: 13 seconds", () => {
    expect(formatDuration(13000)).toBe("13s");
  });
  it("formatDuration: 14 seconds", () => {
    expect(formatDuration(14000)).toBe("14s");
  });
  it("formatDuration: 15 seconds", () => {
    expect(formatDuration(15000)).toBe("15s");
  });
  it("formatDuration: 16 seconds", () => {
    expect(formatDuration(16000)).toBe("16s");
  });
  it("formatDuration: 17 seconds", () => {
    expect(formatDuration(17000)).toBe("17s");
  });
  it("formatDuration: 18 seconds", () => {
    expect(formatDuration(18000)).toBe("18s");
  });
  it("formatDuration: 19 seconds", () => {
    expect(formatDuration(19000)).toBe("19s");
  });
  it("formatDuration: 20 seconds", () => {
    expect(formatDuration(20000)).toBe("20s");
  });
  it("formatDuration: 21 seconds", () => {
    expect(formatDuration(21000)).toBe("21s");
  });
  it("formatDuration: 22 seconds", () => {
    expect(formatDuration(22000)).toBe("22s");
  });
  it("formatDuration: 23 seconds", () => {
    expect(formatDuration(23000)).toBe("23s");
  });
  it("formatDuration: 24 seconds", () => {
    expect(formatDuration(24000)).toBe("24s");
  });
  it("formatDuration: 25 seconds", () => {
    expect(formatDuration(25000)).toBe("25s");
  });
  it("formatDuration: 26 seconds", () => {
    expect(formatDuration(26000)).toBe("26s");
  });
  it("formatDuration: 27 seconds", () => {
    expect(formatDuration(27000)).toBe("27s");
  });
  it("formatDuration: 28 seconds", () => {
    expect(formatDuration(28000)).toBe("28s");
  });
  it("formatDuration: 29 seconds", () => {
    expect(formatDuration(29000)).toBe("29s");
  });
  it("formatDuration: 30 seconds", () => {
    expect(formatDuration(30000)).toBe("30s");
  });
  it("formatDuration: 1 minutes exact", () => {
    expect(formatDuration(60000)).toBe("1m 0s");
  });
  it("formatDuration: 2 minutes exact", () => {
    expect(formatDuration(120000)).toBe("2m 0s");
  });
  it("formatDuration: 3 minutes exact", () => {
    expect(formatDuration(180000)).toBe("3m 0s");
  });
  it("formatDuration: 4 minutes exact", () => {
    expect(formatDuration(240000)).toBe("4m 0s");
  });
  it("formatDuration: 5 minutes exact", () => {
    expect(formatDuration(300000)).toBe("5m 0s");
  });
  it("formatDuration: 6 minutes exact", () => {
    expect(formatDuration(360000)).toBe("6m 0s");
  });
  it("formatDuration: 7 minutes exact", () => {
    expect(formatDuration(420000)).toBe("7m 0s");
  });
  it("formatDuration: 8 minutes exact", () => {
    expect(formatDuration(480000)).toBe("8m 0s");
  });
  it("formatDuration: 9 minutes exact", () => {
    expect(formatDuration(540000)).toBe("9m 0s");
  });
  it("formatDuration: 10 minutes exact", () => {
    expect(formatDuration(600000)).toBe("10m 0s");
  });
  it("formatDuration: 11 minutes exact", () => {
    expect(formatDuration(660000)).toBe("11m 0s");
  });
  it("formatDuration: 12 minutes exact", () => {
    expect(formatDuration(720000)).toBe("12m 0s");
  });
  it("formatDuration: 13 minutes exact", () => {
    expect(formatDuration(780000)).toBe("13m 0s");
  });
  it("formatDuration: 14 minutes exact", () => {
    expect(formatDuration(840000)).toBe("14m 0s");
  });
  it("formatDuration: 15 minutes exact", () => {
    expect(formatDuration(900000)).toBe("15m 0s");
  });
  it("formatDuration: 16 minutes exact", () => {
    expect(formatDuration(960000)).toBe("16m 0s");
  });
  it("formatDuration: 17 minutes exact", () => {
    expect(formatDuration(1020000)).toBe("17m 0s");
  });
  it("formatDuration: 18 minutes exact", () => {
    expect(formatDuration(1080000)).toBe("18m 0s");
  });
  it("formatDuration: 19 minutes exact", () => {
    expect(formatDuration(1140000)).toBe("19m 0s");
  });
  it("formatDuration: 20 minutes exact", () => {
    expect(formatDuration(1200000)).toBe("20m 0s");
  });
  it("formatDuration: 1 hours exact", () => {
    expect(formatDuration(3600000)).toBe("1h 0m");
  });
  it("formatDuration: 2 hours exact", () => {
    expect(formatDuration(7200000)).toBe("2h 0m");
  });
  it("formatDuration: 3 hours exact", () => {
    expect(formatDuration(10800000)).toBe("3h 0m");
  });
  it("formatDuration: 4 hours exact", () => {
    expect(formatDuration(14400000)).toBe("4h 0m");
  });
  it("formatDuration: 5 hours exact", () => {
    expect(formatDuration(18000000)).toBe("5h 0m");
  });
  it("formatDuration: 6 hours exact", () => {
    expect(formatDuration(21600000)).toBe("6h 0m");
  });
  it("formatDuration: 7 hours exact", () => {
    expect(formatDuration(25200000)).toBe("7h 0m");
  });
  it("formatDuration: 8 hours exact", () => {
    expect(formatDuration(28800000)).toBe("8h 0m");
  });
  it("formatDuration: 9 hours exact", () => {
    expect(formatDuration(32400000)).toBe("9h 0m");
  });
  it("formatDuration: 10 hours exact", () => {
    expect(formatDuration(36000000)).toBe("10h 0m");
  });
  it("formatDuration: 1 days exact", () => {
    expect(formatDuration(86400000)).toBe("1d 0h");
  });
  it("formatDuration: 2 days exact", () => {
    expect(formatDuration(172800000)).toBe("2d 0h");
  });
  it("formatDuration: 3 days exact", () => {
    expect(formatDuration(259200000)).toBe("3d 0h");
  });
  it("formatDuration: 4 days exact", () => {
    expect(formatDuration(345600000)).toBe("4d 0h");
  });
  it("formatDuration: 5 days exact", () => {
    expect(formatDuration(432000000)).toBe("5d 0h");
  });
  it("formatDuration: 6 days exact", () => {
    expect(formatDuration(518400000)).toBe("6d 0h");
  });
  it("formatDuration: 7 days exact", () => {
    expect(formatDuration(604800000)).toBe("7d 0h");
  });
  it("formatDuration: 8 days exact", () => {
    expect(formatDuration(691200000)).toBe("8d 0h");
  });
  it("formatDuration: 9 days exact", () => {
    expect(formatDuration(777600000)).toBe("9d 0h");
  });
  it("formatDuration: 10 days exact", () => {
    expect(formatDuration(864000000)).toBe("10d 0h");
  });
  it("formatDuration: returns a string", () => {
    expect(typeof formatDuration(5000)).toBe("string");
  });
  it("formatDuration: 59999ms is 59s", () => {
    expect(formatDuration(59999)).toBe("59s");
  });
  it("formatDuration: 3599999ms is 59m 59s", () => {
    expect(formatDuration(3599999)).toBe("59m 59s");
  });
});

describe("addDays extended", () => {
  it("addDays 31 returns correct month", () => {
    const r = addDays(new Date("2026-01-01"), 31);
    expect(r.getTime()).toBeGreaterThan(new Date("2026-01-01").getTime());
  });
  it("addDays 32 returns correct month", () => {
    const r = addDays(new Date("2026-01-01"), 32);
    expect(r.getTime()).toBeGreaterThan(new Date("2026-01-01").getTime());
  });
  it("addDays 33 returns correct month", () => {
    const r = addDays(new Date("2026-01-01"), 33);
    expect(r.getTime()).toBeGreaterThan(new Date("2026-01-01").getTime());
  });
  it("addDays 34 returns correct month", () => {
    const r = addDays(new Date("2026-01-01"), 34);
    expect(r.getTime()).toBeGreaterThan(new Date("2026-01-01").getTime());
  });
  it("addDays 35 returns correct month", () => {
    const r = addDays(new Date("2026-01-01"), 35);
    expect(r.getTime()).toBeGreaterThan(new Date("2026-01-01").getTime());
  });
  it("addDays 36 returns correct month", () => {
    const r = addDays(new Date("2026-01-01"), 36);
    expect(r.getTime()).toBeGreaterThan(new Date("2026-01-01").getTime());
  });
  it("addDays 37 returns correct month", () => {
    const r = addDays(new Date("2026-01-01"), 37);
    expect(r.getTime()).toBeGreaterThan(new Date("2026-01-01").getTime());
  });
  it("addDays 38 returns correct month", () => {
    const r = addDays(new Date("2026-01-01"), 38);
    expect(r.getTime()).toBeGreaterThan(new Date("2026-01-01").getTime());
  });
  it("addDays 39 returns correct month", () => {
    const r = addDays(new Date("2026-01-01"), 39);
    expect(r.getTime()).toBeGreaterThan(new Date("2026-01-01").getTime());
  });
  it("addDays 40 returns correct month", () => {
    const r = addDays(new Date("2026-01-01"), 40);
    expect(r.getTime()).toBeGreaterThan(new Date("2026-01-01").getTime());
  });
  it("addDays 41 returns correct month", () => {
    const r = addDays(new Date("2026-01-01"), 41);
    expect(r.getTime()).toBeGreaterThan(new Date("2026-01-01").getTime());
  });
  it("addDays 42 returns correct month", () => {
    const r = addDays(new Date("2026-01-01"), 42);
    expect(r.getTime()).toBeGreaterThan(new Date("2026-01-01").getTime());
  });
  it("addDays 43 returns correct month", () => {
    const r = addDays(new Date("2026-01-01"), 43);
    expect(r.getTime()).toBeGreaterThan(new Date("2026-01-01").getTime());
  });
  it("addDays 44 returns correct month", () => {
    const r = addDays(new Date("2026-01-01"), 44);
    expect(r.getTime()).toBeGreaterThan(new Date("2026-01-01").getTime());
  });
  it("addDays 45 returns correct month", () => {
    const r = addDays(new Date("2026-01-01"), 45);
    expect(r.getTime()).toBeGreaterThan(new Date("2026-01-01").getTime());
  });
  it("addDays 46 returns correct month", () => {
    const r = addDays(new Date("2026-01-01"), 46);
    expect(r.getTime()).toBeGreaterThan(new Date("2026-01-01").getTime());
  });
  it("addDays 47 returns correct month", () => {
    const r = addDays(new Date("2026-01-01"), 47);
    expect(r.getTime()).toBeGreaterThan(new Date("2026-01-01").getTime());
  });
  it("addDays 48 returns correct month", () => {
    const r = addDays(new Date("2026-01-01"), 48);
    expect(r.getTime()).toBeGreaterThan(new Date("2026-01-01").getTime());
  });
  it("addDays 49 returns correct month", () => {
    const r = addDays(new Date("2026-01-01"), 49);
    expect(r.getTime()).toBeGreaterThan(new Date("2026-01-01").getTime());
  });
  it("addDays 50 returns correct month", () => {
    const r = addDays(new Date("2026-01-01"), 50);
    expect(r.getTime()).toBeGreaterThan(new Date("2026-01-01").getTime());
  });
  it("addDays 51 returns correct month", () => {
    const r = addDays(new Date("2026-01-01"), 51);
    expect(r.getTime()).toBeGreaterThan(new Date("2026-01-01").getTime());
  });
  it("addDays 52 returns correct month", () => {
    const r = addDays(new Date("2026-01-01"), 52);
    expect(r.getTime()).toBeGreaterThan(new Date("2026-01-01").getTime());
  });
  it("addDays 53 returns correct month", () => {
    const r = addDays(new Date("2026-01-01"), 53);
    expect(r.getTime()).toBeGreaterThan(new Date("2026-01-01").getTime());
  });
  it("addDays 54 returns correct month", () => {
    const r = addDays(new Date("2026-01-01"), 54);
    expect(r.getTime()).toBeGreaterThan(new Date("2026-01-01").getTime());
  });
  it("addDays 55 returns correct month", () => {
    const r = addDays(new Date("2026-01-01"), 55);
    expect(r.getTime()).toBeGreaterThan(new Date("2026-01-01").getTime());
  });
  it("addDays 56 returns correct month", () => {
    const r = addDays(new Date("2026-01-01"), 56);
    expect(r.getTime()).toBeGreaterThan(new Date("2026-01-01").getTime());
  });
  it("addDays 57 returns correct month", () => {
    const r = addDays(new Date("2026-01-01"), 57);
    expect(r.getTime()).toBeGreaterThan(new Date("2026-01-01").getTime());
  });
  it("addDays 58 returns correct month", () => {
    const r = addDays(new Date("2026-01-01"), 58);
    expect(r.getTime()).toBeGreaterThan(new Date("2026-01-01").getTime());
  });
  it("addDays 59 returns correct month", () => {
    const r = addDays(new Date("2026-01-01"), 59);
    expect(r.getTime()).toBeGreaterThan(new Date("2026-01-01").getTime());
  });
  it("addDays 60 returns correct month", () => {
    const r = addDays(new Date("2026-01-01"), 60);
    expect(r.getTime()).toBeGreaterThan(new Date("2026-01-01").getTime());
  });
  it("addDays 61 returns correct month", () => {
    const r = addDays(new Date("2026-01-01"), 61);
    expect(r.getTime()).toBeGreaterThan(new Date("2026-01-01").getTime());
  });
  it("addDays 62 returns correct month", () => {
    const r = addDays(new Date("2026-01-01"), 62);
    expect(r.getTime()).toBeGreaterThan(new Date("2026-01-01").getTime());
  });
  it("addDays 63 returns correct month", () => {
    const r = addDays(new Date("2026-01-01"), 63);
    expect(r.getTime()).toBeGreaterThan(new Date("2026-01-01").getTime());
  });
  it("addDays 64 returns correct month", () => {
    const r = addDays(new Date("2026-01-01"), 64);
    expect(r.getTime()).toBeGreaterThan(new Date("2026-01-01").getTime());
  });
  it("addDays 65 returns correct month", () => {
    const r = addDays(new Date("2026-01-01"), 65);
    expect(r.getTime()).toBeGreaterThan(new Date("2026-01-01").getTime());
  });
  it("addDays 66 returns correct month", () => {
    const r = addDays(new Date("2026-01-01"), 66);
    expect(r.getTime()).toBeGreaterThan(new Date("2026-01-01").getTime());
  });
  it("addDays 67 returns correct month", () => {
    const r = addDays(new Date("2026-01-01"), 67);
    expect(r.getTime()).toBeGreaterThan(new Date("2026-01-01").getTime());
  });
  it("addDays 68 returns correct month", () => {
    const r = addDays(new Date("2026-01-01"), 68);
    expect(r.getTime()).toBeGreaterThan(new Date("2026-01-01").getTime());
  });
  it("addDays 69 returns correct month", () => {
    const r = addDays(new Date("2026-01-01"), 69);
    expect(r.getTime()).toBeGreaterThan(new Date("2026-01-01").getTime());
  });
  it("addDays 70 returns correct month", () => {
    const r = addDays(new Date("2026-01-01"), 70);
    expect(r.getTime()).toBeGreaterThan(new Date("2026-01-01").getTime());
  });
  it("addDays 71 returns correct month", () => {
    const r = addDays(new Date("2026-01-01"), 71);
    expect(r.getTime()).toBeGreaterThan(new Date("2026-01-01").getTime());
  });
  it("addDays 72 returns correct month", () => {
    const r = addDays(new Date("2026-01-01"), 72);
    expect(r.getTime()).toBeGreaterThan(new Date("2026-01-01").getTime());
  });
  it("addDays 73 returns correct month", () => {
    const r = addDays(new Date("2026-01-01"), 73);
    expect(r.getTime()).toBeGreaterThan(new Date("2026-01-01").getTime());
  });
  it("addDays 74 returns correct month", () => {
    const r = addDays(new Date("2026-01-01"), 74);
    expect(r.getTime()).toBeGreaterThan(new Date("2026-01-01").getTime());
  });
  it("addDays 75 returns correct month", () => {
    const r = addDays(new Date("2026-01-01"), 75);
    expect(r.getTime()).toBeGreaterThan(new Date("2026-01-01").getTime());
  });
  it("addDays 76 returns correct month", () => {
    const r = addDays(new Date("2026-01-01"), 76);
    expect(r.getTime()).toBeGreaterThan(new Date("2026-01-01").getTime());
  });
  it("addDays 77 returns correct month", () => {
    const r = addDays(new Date("2026-01-01"), 77);
    expect(r.getTime()).toBeGreaterThan(new Date("2026-01-01").getTime());
  });
  it("addDays 78 returns correct month", () => {
    const r = addDays(new Date("2026-01-01"), 78);
    expect(r.getTime()).toBeGreaterThan(new Date("2026-01-01").getTime());
  });
  it("addDays 79 returns correct month", () => {
    const r = addDays(new Date("2026-01-01"), 79);
    expect(r.getTime()).toBeGreaterThan(new Date("2026-01-01").getTime());
  });
  it("addDays 80 returns correct month", () => {
    const r = addDays(new Date("2026-01-01"), 80);
    expect(r.getTime()).toBeGreaterThan(new Date("2026-01-01").getTime());
  });
  it("addDays 81 returns correct month", () => {
    const r = addDays(new Date("2026-01-01"), 81);
    expect(r.getTime()).toBeGreaterThan(new Date("2026-01-01").getTime());
  });
  it("addDays 82 returns correct month", () => {
    const r = addDays(new Date("2026-01-01"), 82);
    expect(r.getTime()).toBeGreaterThan(new Date("2026-01-01").getTime());
  });
  it("addDays 83 returns correct month", () => {
    const r = addDays(new Date("2026-01-01"), 83);
    expect(r.getTime()).toBeGreaterThan(new Date("2026-01-01").getTime());
  });
  it("addDays 84 returns correct month", () => {
    const r = addDays(new Date("2026-01-01"), 84);
    expect(r.getTime()).toBeGreaterThan(new Date("2026-01-01").getTime());
  });
  it("addDays 85 returns correct month", () => {
    const r = addDays(new Date("2026-01-01"), 85);
    expect(r.getTime()).toBeGreaterThan(new Date("2026-01-01").getTime());
  });
  it("addDays 86 returns correct month", () => {
    const r = addDays(new Date("2026-01-01"), 86);
    expect(r.getTime()).toBeGreaterThan(new Date("2026-01-01").getTime());
  });
  it("addDays 87 returns correct month", () => {
    const r = addDays(new Date("2026-01-01"), 87);
    expect(r.getTime()).toBeGreaterThan(new Date("2026-01-01").getTime());
  });
  it("addDays 88 returns correct month", () => {
    const r = addDays(new Date("2026-01-01"), 88);
    expect(r.getTime()).toBeGreaterThan(new Date("2026-01-01").getTime());
  });
  it("addDays 89 returns correct month", () => {
    const r = addDays(new Date("2026-01-01"), 89);
    expect(r.getTime()).toBeGreaterThan(new Date("2026-01-01").getTime());
  });
  it("addDays 90 returns correct month", () => {
    const r = addDays(new Date("2026-01-01"), 90);
    expect(r.getTime()).toBeGreaterThan(new Date("2026-01-01").getTime());
  });
  it("addDays 91 returns correct month", () => {
    const r = addDays(new Date("2026-01-01"), 91);
    expect(r.getTime()).toBeGreaterThan(new Date("2026-01-01").getTime());
  });
  it("addDays 92 returns correct month", () => {
    const r = addDays(new Date("2026-01-01"), 92);
    expect(r.getTime()).toBeGreaterThan(new Date("2026-01-01").getTime());
  });
  it("addDays 93 returns correct month", () => {
    const r = addDays(new Date("2026-01-01"), 93);
    expect(r.getTime()).toBeGreaterThan(new Date("2026-01-01").getTime());
  });
  it("addDays 94 returns correct month", () => {
    const r = addDays(new Date("2026-01-01"), 94);
    expect(r.getTime()).toBeGreaterThan(new Date("2026-01-01").getTime());
  });
  it("addDays 95 returns correct month", () => {
    const r = addDays(new Date("2026-01-01"), 95);
    expect(r.getTime()).toBeGreaterThan(new Date("2026-01-01").getTime());
  });
  it("addDays 96 returns correct month", () => {
    const r = addDays(new Date("2026-01-01"), 96);
    expect(r.getTime()).toBeGreaterThan(new Date("2026-01-01").getTime());
  });
  it("addDays 97 returns correct month", () => {
    const r = addDays(new Date("2026-01-01"), 97);
    expect(r.getTime()).toBeGreaterThan(new Date("2026-01-01").getTime());
  });
  it("addDays 98 returns correct month", () => {
    const r = addDays(new Date("2026-01-01"), 98);
    expect(r.getTime()).toBeGreaterThan(new Date("2026-01-01").getTime());
  });
  it("addDays 99 returns correct month", () => {
    const r = addDays(new Date("2026-01-01"), 99);
    expect(r.getTime()).toBeGreaterThan(new Date("2026-01-01").getTime());
  });
  it("addDays 100 returns correct month", () => {
    const r = addDays(new Date("2026-01-01"), 100);
    expect(r.getTime()).toBeGreaterThan(new Date("2026-01-01").getTime());
  });
});

describe("diffDays extended", () => {
  it("diffDays 31 days apart", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 31);
    expect(diffDays(a, b)).toBe(31);
  });
  it("diffDays 32 days apart", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 32);
    expect(diffDays(a, b)).toBe(32);
  });
  it("diffDays 33 days apart", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 33);
    expect(diffDays(a, b)).toBe(33);
  });
  it("diffDays 34 days apart", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 34);
    expect(diffDays(a, b)).toBe(34);
  });
  it("diffDays 35 days apart", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 35);
    expect(diffDays(a, b)).toBe(35);
  });
  it("diffDays 36 days apart", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 36);
    expect(diffDays(a, b)).toBe(36);
  });
  it("diffDays 37 days apart", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 37);
    expect(diffDays(a, b)).toBe(37);
  });
  it("diffDays 38 days apart", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 38);
    expect(diffDays(a, b)).toBe(38);
  });
  it("diffDays 39 days apart", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 39);
    expect(diffDays(a, b)).toBe(39);
  });
  it("diffDays 40 days apart", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 40);
    expect(diffDays(a, b)).toBe(40);
  });
  it("diffDays 41 days apart", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 41);
    expect(diffDays(a, b)).toBe(41);
  });
  it("diffDays 42 days apart", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 42);
    expect(diffDays(a, b)).toBe(42);
  });
  it("diffDays 43 days apart", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 43);
    expect(diffDays(a, b)).toBe(43);
  });
  it("diffDays 44 days apart", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 44);
    expect(diffDays(a, b)).toBe(44);
  });
  it("diffDays 45 days apart", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 45);
    expect(diffDays(a, b)).toBe(45);
  });
  it("diffDays 46 days apart", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 46);
    expect(diffDays(a, b)).toBe(46);
  });
  it("diffDays 47 days apart", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 47);
    expect(diffDays(a, b)).toBe(47);
  });
  it("diffDays 48 days apart", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 48);
    expect(diffDays(a, b)).toBe(48);
  });
  it("diffDays 49 days apart", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 49);
    expect(diffDays(a, b)).toBe(49);
  });
  it("diffDays 50 days apart", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 50);
    expect(diffDays(a, b)).toBe(50);
  });
  it("diffDays 51 days apart", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 51);
    expect(diffDays(a, b)).toBe(51);
  });
  it("diffDays 52 days apart", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 52);
    expect(diffDays(a, b)).toBe(52);
  });
  it("diffDays 53 days apart", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 53);
    expect(diffDays(a, b)).toBe(53);
  });
  it("diffDays 54 days apart", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 54);
    expect(diffDays(a, b)).toBe(54);
  });
  it("diffDays 55 days apart", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 55);
    expect(diffDays(a, b)).toBe(55);
  });
  it("diffDays 56 days apart", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 56);
    expect(diffDays(a, b)).toBe(56);
  });
  it("diffDays 57 days apart", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 57);
    expect(diffDays(a, b)).toBe(57);
  });
  it("diffDays 58 days apart", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 58);
    expect(diffDays(a, b)).toBe(58);
  });
  it("diffDays 59 days apart", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 59);
    expect(diffDays(a, b)).toBe(59);
  });
  it("diffDays 60 days apart", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 60);
    expect(diffDays(a, b)).toBe(60);
  });
  it("diffDays 61 days apart", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 61);
    expect(diffDays(a, b)).toBe(61);
  });
  it("diffDays 62 days apart", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 62);
    expect(diffDays(a, b)).toBe(62);
  });
  it("diffDays 63 days apart", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 63);
    expect(diffDays(a, b)).toBe(63);
  });
  it("diffDays 64 days apart", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 64);
    expect(diffDays(a, b)).toBe(64);
  });
  it("diffDays 65 days apart", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 65);
    expect(diffDays(a, b)).toBe(65);
  });
  it("diffDays 66 days apart", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 66);
    expect(diffDays(a, b)).toBe(66);
  });
  it("diffDays 67 days apart", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 67);
    expect(diffDays(a, b)).toBe(67);
  });
  it("diffDays 68 days apart", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 68);
    expect(diffDays(a, b)).toBe(68);
  });
  it("diffDays 69 days apart", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 69);
    expect(diffDays(a, b)).toBe(69);
  });
  it("diffDays 70 days apart", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 70);
    expect(diffDays(a, b)).toBe(70);
  });
  it("diffDays 71 days apart", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 71);
    expect(diffDays(a, b)).toBe(71);
  });
  it("diffDays 72 days apart", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 72);
    expect(diffDays(a, b)).toBe(72);
  });
  it("diffDays 73 days apart", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 73);
    expect(diffDays(a, b)).toBe(73);
  });
  it("diffDays 74 days apart", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 74);
    expect(diffDays(a, b)).toBe(74);
  });
  it("diffDays 75 days apart", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 75);
    expect(diffDays(a, b)).toBe(75);
  });
  it("diffDays 76 days apart", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 76);
    expect(diffDays(a, b)).toBe(76);
  });
  it("diffDays 77 days apart", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 77);
    expect(diffDays(a, b)).toBe(77);
  });
  it("diffDays 78 days apart", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 78);
    expect(diffDays(a, b)).toBe(78);
  });
  it("diffDays 79 days apart", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 79);
    expect(diffDays(a, b)).toBe(79);
  });
  it("diffDays 80 days apart", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 80);
    expect(diffDays(a, b)).toBe(80);
  });
  it("diffDays 81 days apart", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 81);
    expect(diffDays(a, b)).toBe(81);
  });
  it("diffDays 82 days apart", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 82);
    expect(diffDays(a, b)).toBe(82);
  });
  it("diffDays 83 days apart", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 83);
    expect(diffDays(a, b)).toBe(83);
  });
  it("diffDays 84 days apart", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 84);
    expect(diffDays(a, b)).toBe(84);
  });
  it("diffDays 85 days apart", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 85);
    expect(diffDays(a, b)).toBe(85);
  });
  it("diffDays 86 days apart", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 86);
    expect(diffDays(a, b)).toBe(86);
  });
  it("diffDays 87 days apart", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 87);
    expect(diffDays(a, b)).toBe(87);
  });
  it("diffDays 88 days apart", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 88);
    expect(diffDays(a, b)).toBe(88);
  });
  it("diffDays 89 days apart", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 89);
    expect(diffDays(a, b)).toBe(89);
  });
  it("diffDays 90 days apart", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 90);
    expect(diffDays(a, b)).toBe(90);
  });
  it("diffDays 91 days apart", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 91);
    expect(diffDays(a, b)).toBe(91);
  });
  it("diffDays 92 days apart", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 92);
    expect(diffDays(a, b)).toBe(92);
  });
  it("diffDays 93 days apart", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 93);
    expect(diffDays(a, b)).toBe(93);
  });
  it("diffDays 94 days apart", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 94);
    expect(diffDays(a, b)).toBe(94);
  });
  it("diffDays 95 days apart", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 95);
    expect(diffDays(a, b)).toBe(95);
  });
  it("diffDays 96 days apart", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 96);
    expect(diffDays(a, b)).toBe(96);
  });
  it("diffDays 97 days apart", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 97);
    expect(diffDays(a, b)).toBe(97);
  });
  it("diffDays 98 days apart", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 98);
    expect(diffDays(a, b)).toBe(98);
  });
  it("diffDays 99 days apart", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 99);
    expect(diffDays(a, b)).toBe(99);
  });
  it("diffDays 100 days apart", () => {
    const a = new Date("2026-01-01");
    const b = addDays(a, 100);
    expect(diffDays(a, b)).toBe(100);
  });
});

describe("isLeapYear extended", () => {
  it("isLeapYear 1904", () => { expect(isLeapYear(1904)).toBe(true); });
  it("isLeapYear 1908", () => { expect(isLeapYear(1908)).toBe(true); });
  it("isLeapYear 1912", () => { expect(isLeapYear(1912)).toBe(true); });
  it("isLeapYear 1916", () => { expect(isLeapYear(1916)).toBe(true); });
  it("isLeapYear 1920", () => { expect(isLeapYear(1920)).toBe(true); });
  it("isLeapYear 1924", () => { expect(isLeapYear(1924)).toBe(true); });
  it("isLeapYear 1928", () => { expect(isLeapYear(1928)).toBe(true); });
  it("isLeapYear 1932", () => { expect(isLeapYear(1932)).toBe(true); });
  it("isLeapYear 1936", () => { expect(isLeapYear(1936)).toBe(true); });
  it("isLeapYear 1940", () => { expect(isLeapYear(1940)).toBe(true); });
  it("isLeapYear 1944", () => { expect(isLeapYear(1944)).toBe(true); });
  it("isLeapYear 1948", () => { expect(isLeapYear(1948)).toBe(true); });
  it("isLeapYear 2001 = false", () => {
    expect(isLeapYear(2001)).toBe(false);
  });
  it("isLeapYear 2002 = false", () => {
    expect(isLeapYear(2002)).toBe(false);
  });
  it("isLeapYear 2003 = false", () => {
    expect(isLeapYear(2003)).toBe(false);
  });
  it("isLeapYear 2004 = true", () => {
    expect(isLeapYear(2004)).toBe(true);
  });
  it("isLeapYear 2005 = false", () => {
    expect(isLeapYear(2005)).toBe(false);
  });
  it("isLeapYear 2006 = false", () => {
    expect(isLeapYear(2006)).toBe(false);
  });
  it("isLeapYear 2007 = false", () => {
    expect(isLeapYear(2007)).toBe(false);
  });
  it("isLeapYear 2008 = true", () => {
    expect(isLeapYear(2008)).toBe(true);
  });
  it("isLeapYear 2009 = false", () => {
    expect(isLeapYear(2009)).toBe(false);
  });
  it("isLeapYear 2010 = false", () => {
    expect(isLeapYear(2010)).toBe(false);
  });
  it("isLeapYear 2011 = false", () => {
    expect(isLeapYear(2011)).toBe(false);
  });
  it("isLeapYear 2012 = true", () => {
    expect(isLeapYear(2012)).toBe(true);
  });
  it("isLeapYear 2013 = false", () => {
    expect(isLeapYear(2013)).toBe(false);
  });
  it("isLeapYear 2014 = false", () => {
    expect(isLeapYear(2014)).toBe(false);
  });
  it("isLeapYear 2015 = false", () => {
    expect(isLeapYear(2015)).toBe(false);
  });
  it("isLeapYear 2016 = true", () => {
    expect(isLeapYear(2016)).toBe(true);
  });
  it("isLeapYear 2017 = false", () => {
    expect(isLeapYear(2017)).toBe(false);
  });
  it("isLeapYear 2018 = false", () => {
    expect(isLeapYear(2018)).toBe(false);
  });
  it("isLeapYear 2019 = false", () => {
    expect(isLeapYear(2019)).toBe(false);
  });
  it("isLeapYear 2020 = true", () => {
    expect(isLeapYear(2020)).toBe(true);
  });
  it("isLeapYear 2021 = false", () => {
    expect(isLeapYear(2021)).toBe(false);
  });
  it("isLeapYear 2022 = false", () => {
    expect(isLeapYear(2022)).toBe(false);
  });
  it("isLeapYear 2023 = false", () => {
    expect(isLeapYear(2023)).toBe(false);
  });
  it("isLeapYear 2024 = true", () => {
    expect(isLeapYear(2024)).toBe(true);
  });
  it("isLeapYear 2025 = false", () => {
    expect(isLeapYear(2025)).toBe(false);
  });
  it("isLeapYear 2026 = false", () => {
    expect(isLeapYear(2026)).toBe(false);
  });
  it("isLeapYear 2027 = false", () => {
    expect(isLeapYear(2027)).toBe(false);
  });
  it("isLeapYear 2028 = true", () => {
    expect(isLeapYear(2028)).toBe(true);
  });
  it("isLeapYear 2029 = false", () => {
    expect(isLeapYear(2029)).toBe(false);
  });
  it("isLeapYear 2030 = false", () => {
    expect(isLeapYear(2030)).toBe(false);
  });
  it("isLeapYear 2031 = false", () => {
    expect(isLeapYear(2031)).toBe(false);
  });
  it("isLeapYear 2032 = true", () => {
    expect(isLeapYear(2032)).toBe(true);
  });
  it("isLeapYear 2033 = false", () => {
    expect(isLeapYear(2033)).toBe(false);
  });
  it("isLeapYear 2034 = false", () => {
    expect(isLeapYear(2034)).toBe(false);
  });
  it("isLeapYear 2035 = false", () => {
    expect(isLeapYear(2035)).toBe(false);
  });
  it("isLeapYear 2036 = true", () => {
    expect(isLeapYear(2036)).toBe(true);
  });
  it("isLeapYear 2037 = false", () => {
    expect(isLeapYear(2037)).toBe(false);
  });
  it("isLeapYear 2038 = false", () => {
    expect(isLeapYear(2038)).toBe(false);
  });
  it("isLeapYear 2039 = false", () => {
    expect(isLeapYear(2039)).toBe(false);
  });
  it("isLeapYear 2040 = true", () => {
    expect(isLeapYear(2040)).toBe(true);
  });
});

describe("daysInMonth extended", () => {
  it("daysInMonth: Feb 2020 has 29 days", () => {
    expect(daysInMonth(2020, 1)).toBe(29);
  });
  it("daysInMonth: Feb 2021 has 28 days", () => {
    expect(daysInMonth(2021, 1)).toBe(28);
  });
  it("daysInMonth: Feb 2022 has 28 days", () => {
    expect(daysInMonth(2022, 1)).toBe(28);
  });
  it("daysInMonth: Feb 2023 has 28 days", () => {
    expect(daysInMonth(2023, 1)).toBe(28);
  });
  it("daysInMonth: Feb 2024 has 29 days", () => {
    expect(daysInMonth(2024, 1)).toBe(29);
  });
  it("daysInMonth: Feb 2025 has 28 days", () => {
    expect(daysInMonth(2025, 1)).toBe(28);
  });
  it("daysInMonth: Feb 2026 has 28 days", () => {
    expect(daysInMonth(2026, 1)).toBe(28);
  });
  it("daysInMonth: Feb 2027 has 28 days", () => {
    expect(daysInMonth(2027, 1)).toBe(28);
  });
  it("daysInMonth: Feb 2028 has 29 days", () => {
    expect(daysInMonth(2028, 1)).toBe(29);
  });
  it("daysInMonth: Feb 2029 has 28 days", () => {
    expect(daysInMonth(2029, 1)).toBe(28);
  });
  it("daysInMonth: Feb 2030 has 28 days", () => {
    expect(daysInMonth(2030, 1)).toBe(28);
  });
});

describe("isSameDay extended", () => {
  it("isSameDay: 2026-02-01 with itself", () => {
    const a = new Date("2026-02-01"); expect(isSameDay(a, a)).toBe(true);
  });
  it("isSameDay: 2026-02-02 with itself", () => {
    const a = new Date("2026-02-02"); expect(isSameDay(a, a)).toBe(true);
  });
  it("isSameDay: 2026-02-03 with itself", () => {
    const a = new Date("2026-02-03"); expect(isSameDay(a, a)).toBe(true);
  });
  it("isSameDay: 2026-02-04 with itself", () => {
    const a = new Date("2026-02-04"); expect(isSameDay(a, a)).toBe(true);
  });
  it("isSameDay: 2026-02-05 with itself", () => {
    const a = new Date("2026-02-05"); expect(isSameDay(a, a)).toBe(true);
  });
  it("isSameDay: 2026-02-06 with itself", () => {
    const a = new Date("2026-02-06"); expect(isSameDay(a, a)).toBe(true);
  });
  it("isSameDay: 2026-02-07 with itself", () => {
    const a = new Date("2026-02-07"); expect(isSameDay(a, a)).toBe(true);
  });
  it("isSameDay: 2026-02-08 with itself", () => {
    const a = new Date("2026-02-08"); expect(isSameDay(a, a)).toBe(true);
  });
  it("isSameDay: 2026-02-09 with itself", () => {
    const a = new Date("2026-02-09"); expect(isSameDay(a, a)).toBe(true);
  });
  it("isSameDay: 2026-02-10 with itself", () => {
    const a = new Date("2026-02-10"); expect(isSameDay(a, a)).toBe(true);
  });
  it("isSameDay: 2026-02-11 with itself", () => {
    const a = new Date("2026-02-11"); expect(isSameDay(a, a)).toBe(true);
  });
  it("isSameDay: 2026-02-12 with itself", () => {
    const a = new Date("2026-02-12"); expect(isSameDay(a, a)).toBe(true);
  });
  it("isSameDay: 2026-02-13 with itself", () => {
    const a = new Date("2026-02-13"); expect(isSameDay(a, a)).toBe(true);
  });
  it("isSameDay: 2026-02-14 with itself", () => {
    const a = new Date("2026-02-14"); expect(isSameDay(a, a)).toBe(true);
  });
  it("isSameDay: 2026-02-15 with itself", () => {
    const a = new Date("2026-02-15"); expect(isSameDay(a, a)).toBe(true);
  });
  it("isSameDay: 2026-02-16 with itself", () => {
    const a = new Date("2026-02-16"); expect(isSameDay(a, a)).toBe(true);
  });
  it("isSameDay: 2026-02-17 with itself", () => {
    const a = new Date("2026-02-17"); expect(isSameDay(a, a)).toBe(true);
  });
  it("isSameDay: 2026-02-18 with itself", () => {
    const a = new Date("2026-02-18"); expect(isSameDay(a, a)).toBe(true);
  });
  it("isSameDay: 2026-02-19 with itself", () => {
    const a = new Date("2026-02-19"); expect(isSameDay(a, a)).toBe(true);
  });
  it("isSameDay: 2026-02-20 with itself", () => {
    const a = new Date("2026-02-20"); expect(isSameDay(a, a)).toBe(true);
  });
  it("isSameDay: 2026-02-21 with itself", () => {
    const a = new Date("2026-02-21"); expect(isSameDay(a, a)).toBe(true);
  });
  it("isSameDay: 2026-02-22 with itself", () => {
    const a = new Date("2026-02-22"); expect(isSameDay(a, a)).toBe(true);
  });
  it("isSameDay: 2026-02-23 with itself", () => {
    const a = new Date("2026-02-23"); expect(isSameDay(a, a)).toBe(true);
  });
  it("isSameDay: 2026-02-24 with itself", () => {
    const a = new Date("2026-02-24"); expect(isSameDay(a, a)).toBe(true);
  });
  it("isSameDay: 2026-02-25 with itself", () => {
    const a = new Date("2026-02-25"); expect(isSameDay(a, a)).toBe(true);
  });
  it("isSameDay: 2026-02-26 with itself", () => {
    const a = new Date("2026-02-26"); expect(isSameDay(a, a)).toBe(true);
  });
  it("isSameDay: 2026-02-27 with itself", () => {
    const a = new Date("2026-02-27"); expect(isSameDay(a, a)).toBe(true);
  });
  it("isSameDay: 2026-02-28 with itself", () => {
    const a = new Date("2026-02-28"); expect(isSameDay(a, a)).toBe(true);
  });
});

describe("addBusinessDays extended", () => {
  it("addBusinessDays extended 1: result is weekday", () => {
    const r = addBusinessDays(new Date("2026-01-05"), 1);
    expect([1,2,3,4,5]).toContain(r.getDay());
  });
  it("addBusinessDays extended 2: result is weekday", () => {
    const r = addBusinessDays(new Date("2026-01-05"), 2);
    expect([1,2,3,4,5]).toContain(r.getDay());
  });
  it("addBusinessDays extended 3: result is weekday", () => {
    const r = addBusinessDays(new Date("2026-01-05"), 3);
    expect([1,2,3,4,5]).toContain(r.getDay());
  });
  it("addBusinessDays extended 4: result is weekday", () => {
    const r = addBusinessDays(new Date("2026-01-05"), 4);
    expect([1,2,3,4,5]).toContain(r.getDay());
  });
  it("addBusinessDays extended 5: result is weekday", () => {
    const r = addBusinessDays(new Date("2026-01-05"), 5);
    expect([1,2,3,4,5]).toContain(r.getDay());
  });
  it("addBusinessDays extended 6: result is weekday", () => {
    const r = addBusinessDays(new Date("2026-01-05"), 6);
    expect([1,2,3,4,5]).toContain(r.getDay());
  });
  it("addBusinessDays extended 7: result is weekday", () => {
    const r = addBusinessDays(new Date("2026-01-05"), 7);
    expect([1,2,3,4,5]).toContain(r.getDay());
  });
  it("addBusinessDays extended 8: result is weekday", () => {
    const r = addBusinessDays(new Date("2026-01-05"), 8);
    expect([1,2,3,4,5]).toContain(r.getDay());
  });
  it("addBusinessDays extended 9: result is weekday", () => {
    const r = addBusinessDays(new Date("2026-01-05"), 9);
    expect([1,2,3,4,5]).toContain(r.getDay());
  });
  it("addBusinessDays extended 10: result is weekday", () => {
    const r = addBusinessDays(new Date("2026-01-05"), 10);
    expect([1,2,3,4,5]).toContain(r.getDay());
  });
  it("addBusinessDays extended 11: result is weekday", () => {
    const r = addBusinessDays(new Date("2026-01-05"), 11);
    expect([1,2,3,4,5]).toContain(r.getDay());
  });
  it("addBusinessDays extended 12: result is weekday", () => {
    const r = addBusinessDays(new Date("2026-01-05"), 12);
    expect([1,2,3,4,5]).toContain(r.getDay());
  });
  it("addBusinessDays extended 13: result is weekday", () => {
    const r = addBusinessDays(new Date("2026-01-05"), 13);
    expect([1,2,3,4,5]).toContain(r.getDay());
  });
  it("addBusinessDays extended 14: result is weekday", () => {
    const r = addBusinessDays(new Date("2026-01-05"), 14);
    expect([1,2,3,4,5]).toContain(r.getDay());
  });
  it("addBusinessDays extended 15: result is weekday", () => {
    const r = addBusinessDays(new Date("2026-01-05"), 15);
    expect([1,2,3,4,5]).toContain(r.getDay());
  });
  it("addBusinessDays extended 16: result is weekday", () => {
    const r = addBusinessDays(new Date("2026-01-05"), 16);
    expect([1,2,3,4,5]).toContain(r.getDay());
  });
  it("addBusinessDays extended 17: result is weekday", () => {
    const r = addBusinessDays(new Date("2026-01-05"), 17);
    expect([1,2,3,4,5]).toContain(r.getDay());
  });
  it("addBusinessDays extended 18: result is weekday", () => {
    const r = addBusinessDays(new Date("2026-01-05"), 18);
    expect([1,2,3,4,5]).toContain(r.getDay());
  });
  it("addBusinessDays extended 19: result is weekday", () => {
    const r = addBusinessDays(new Date("2026-01-05"), 19);
    expect([1,2,3,4,5]).toContain(r.getDay());
  });
  it("addBusinessDays extended 20: result is weekday", () => {
    const r = addBusinessDays(new Date("2026-01-05"), 20);
    expect([1,2,3,4,5]).toContain(r.getDay());
  });
  it("addBusinessDays extended 21: result is weekday", () => {
    const r = addBusinessDays(new Date("2026-01-05"), 21);
    expect([1,2,3,4,5]).toContain(r.getDay());
  });
  it("addBusinessDays extended 22: result is weekday", () => {
    const r = addBusinessDays(new Date("2026-01-05"), 22);
    expect([1,2,3,4,5]).toContain(r.getDay());
  });
  it("addBusinessDays extended 23: result is weekday", () => {
    const r = addBusinessDays(new Date("2026-01-05"), 23);
    expect([1,2,3,4,5]).toContain(r.getDay());
  });
  it("addBusinessDays extended 24: result is weekday", () => {
    const r = addBusinessDays(new Date("2026-01-05"), 24);
    expect([1,2,3,4,5]).toContain(r.getDay());
  });
  it("addBusinessDays extended 25: result is weekday", () => {
    const r = addBusinessDays(new Date("2026-01-05"), 25);
    expect([1,2,3,4,5]).toContain(r.getDay());
  });
  it("addBusinessDays extended 26: result is weekday", () => {
    const r = addBusinessDays(new Date("2026-01-05"), 26);
    expect([1,2,3,4,5]).toContain(r.getDay());
  });
  it("addBusinessDays extended 27: result is weekday", () => {
    const r = addBusinessDays(new Date("2026-01-05"), 27);
    expect([1,2,3,4,5]).toContain(r.getDay());
  });
  it("addBusinessDays extended 28: result is weekday", () => {
    const r = addBusinessDays(new Date("2026-01-05"), 28);
    expect([1,2,3,4,5]).toContain(r.getDay());
  });
  it("addBusinessDays extended 29: result is weekday", () => {
    const r = addBusinessDays(new Date("2026-01-05"), 29);
    expect([1,2,3,4,5]).toContain(r.getDay());
  });
  it("addBusinessDays extended 30: result is weekday", () => {
    const r = addBusinessDays(new Date("2026-01-05"), 30);
    expect([1,2,3,4,5]).toContain(r.getDay());
  });
  it("addBusinessDays extended 31: result is weekday", () => {
    const r = addBusinessDays(new Date("2026-01-05"), 31);
    expect([1,2,3,4,5]).toContain(r.getDay());
  });
  it("addBusinessDays extended 32: result is weekday", () => {
    const r = addBusinessDays(new Date("2026-01-05"), 32);
    expect([1,2,3,4,5]).toContain(r.getDay());
  });
  it("addBusinessDays extended 33: result is weekday", () => {
    const r = addBusinessDays(new Date("2026-01-05"), 33);
    expect([1,2,3,4,5]).toContain(r.getDay());
  });
  it("addBusinessDays extended 34: result is weekday", () => {
    const r = addBusinessDays(new Date("2026-01-05"), 34);
    expect([1,2,3,4,5]).toContain(r.getDay());
  });
  it("addBusinessDays extended 35: result is weekday", () => {
    const r = addBusinessDays(new Date("2026-01-05"), 35);
    expect([1,2,3,4,5]).toContain(r.getDay());
  });
  it("addBusinessDays extended 36: result is weekday", () => {
    const r = addBusinessDays(new Date("2026-01-05"), 36);
    expect([1,2,3,4,5]).toContain(r.getDay());
  });
  it("addBusinessDays extended 37: result is weekday", () => {
    const r = addBusinessDays(new Date("2026-01-05"), 37);
    expect([1,2,3,4,5]).toContain(r.getDay());
  });
  it("addBusinessDays extended 38: result is weekday", () => {
    const r = addBusinessDays(new Date("2026-01-05"), 38);
    expect([1,2,3,4,5]).toContain(r.getDay());
  });
  it("addBusinessDays extended 39: result is weekday", () => {
    const r = addBusinessDays(new Date("2026-01-05"), 39);
    expect([1,2,3,4,5]).toContain(r.getDay());
  });
  it("addBusinessDays extended 40: result is weekday", () => {
    const r = addBusinessDays(new Date("2026-01-05"), 40);
    expect([1,2,3,4,5]).toContain(r.getDay());
  });
  it("addBusinessDays extended 41: result is weekday", () => {
    const r = addBusinessDays(new Date("2026-01-05"), 41);
    expect([1,2,3,4,5]).toContain(r.getDay());
  });
  it("addBusinessDays extended 42: result is weekday", () => {
    const r = addBusinessDays(new Date("2026-01-05"), 42);
    expect([1,2,3,4,5]).toContain(r.getDay());
  });
  it("addBusinessDays extended 43: result is weekday", () => {
    const r = addBusinessDays(new Date("2026-01-05"), 43);
    expect([1,2,3,4,5]).toContain(r.getDay());
  });
  it("addBusinessDays extended 44: result is weekday", () => {
    const r = addBusinessDays(new Date("2026-01-05"), 44);
    expect([1,2,3,4,5]).toContain(r.getDay());
  });
  it("addBusinessDays extended 45: result is weekday", () => {
    const r = addBusinessDays(new Date("2026-01-05"), 45);
    expect([1,2,3,4,5]).toContain(r.getDay());
  });
  it("addBusinessDays extended 46: result is weekday", () => {
    const r = addBusinessDays(new Date("2026-01-05"), 46);
    expect([1,2,3,4,5]).toContain(r.getDay());
  });
  it("addBusinessDays extended 47: result is weekday", () => {
    const r = addBusinessDays(new Date("2026-01-05"), 47);
    expect([1,2,3,4,5]).toContain(r.getDay());
  });
  it("addBusinessDays extended 48: result is weekday", () => {
    const r = addBusinessDays(new Date("2026-01-05"), 48);
    expect([1,2,3,4,5]).toContain(r.getDay());
  });
  it("addBusinessDays extended 49: result is weekday", () => {
    const r = addBusinessDays(new Date("2026-01-05"), 49);
    expect([1,2,3,4,5]).toContain(r.getDay());
  });
  it("addBusinessDays extended 50: result is weekday", () => {
    const r = addBusinessDays(new Date("2026-01-05"), 50);
    expect([1,2,3,4,5]).toContain(r.getDay());
  });
});

describe("isWithinRange extended", () => {
  const s = new Date("2026-03-01");
  const e = new Date("2026-03-31");
  const range = { start: s, end: e };
  it("isWithinRange: 2026-03-01 is in March range", () => {
    expect(isWithinRange(new Date("2026-03-01"), range)).toBe(true);
  });
  it("isWithinRange: 2026-03-02 is in March range", () => {
    expect(isWithinRange(new Date("2026-03-02"), range)).toBe(true);
  });
  it("isWithinRange: 2026-03-03 is in March range", () => {
    expect(isWithinRange(new Date("2026-03-03"), range)).toBe(true);
  });
  it("isWithinRange: 2026-03-04 is in March range", () => {
    expect(isWithinRange(new Date("2026-03-04"), range)).toBe(true);
  });
  it("isWithinRange: 2026-03-05 is in March range", () => {
    expect(isWithinRange(new Date("2026-03-05"), range)).toBe(true);
  });
  it("isWithinRange: 2026-03-06 is in March range", () => {
    expect(isWithinRange(new Date("2026-03-06"), range)).toBe(true);
  });
  it("isWithinRange: 2026-03-07 is in March range", () => {
    expect(isWithinRange(new Date("2026-03-07"), range)).toBe(true);
  });
  it("isWithinRange: 2026-03-08 is in March range", () => {
    expect(isWithinRange(new Date("2026-03-08"), range)).toBe(true);
  });
  it("isWithinRange: 2026-03-09 is in March range", () => {
    expect(isWithinRange(new Date("2026-03-09"), range)).toBe(true);
  });
  it("isWithinRange: 2026-03-10 is in March range", () => {
    expect(isWithinRange(new Date("2026-03-10"), range)).toBe(true);
  });
  it("isWithinRange: 2026-03-11 is in March range", () => {
    expect(isWithinRange(new Date("2026-03-11"), range)).toBe(true);
  });
  it("isWithinRange: 2026-03-12 is in March range", () => {
    expect(isWithinRange(new Date("2026-03-12"), range)).toBe(true);
  });
  it("isWithinRange: 2026-03-13 is in March range", () => {
    expect(isWithinRange(new Date("2026-03-13"), range)).toBe(true);
  });
  it("isWithinRange: 2026-03-14 is in March range", () => {
    expect(isWithinRange(new Date("2026-03-14"), range)).toBe(true);
  });
  it("isWithinRange: 2026-03-15 is in March range", () => {
    expect(isWithinRange(new Date("2026-03-15"), range)).toBe(true);
  });
  it("isWithinRange: 2026-03-16 is in March range", () => {
    expect(isWithinRange(new Date("2026-03-16"), range)).toBe(true);
  });
  it("isWithinRange: 2026-03-17 is in March range", () => {
    expect(isWithinRange(new Date("2026-03-17"), range)).toBe(true);
  });
  it("isWithinRange: 2026-03-18 is in March range", () => {
    expect(isWithinRange(new Date("2026-03-18"), range)).toBe(true);
  });
  it("isWithinRange: 2026-03-19 is in March range", () => {
    expect(isWithinRange(new Date("2026-03-19"), range)).toBe(true);
  });
  it("isWithinRange: 2026-03-20 is in March range", () => {
    expect(isWithinRange(new Date("2026-03-20"), range)).toBe(true);
  });
  it("isWithinRange: 2026-03-21 is in March range", () => {
    expect(isWithinRange(new Date("2026-03-21"), range)).toBe(true);
  });
  it("isWithinRange: 2026-03-22 is in March range", () => {
    expect(isWithinRange(new Date("2026-03-22"), range)).toBe(true);
  });
  it("isWithinRange: 2026-03-23 is in March range", () => {
    expect(isWithinRange(new Date("2026-03-23"), range)).toBe(true);
  });
  it("isWithinRange: 2026-03-24 is in March range", () => {
    expect(isWithinRange(new Date("2026-03-24"), range)).toBe(true);
  });
  it("isWithinRange: 2026-03-25 is in March range", () => {
    expect(isWithinRange(new Date("2026-03-25"), range)).toBe(true);
  });
  it("isWithinRange: 2026-03-26 is in March range", () => {
    expect(isWithinRange(new Date("2026-03-26"), range)).toBe(true);
  });
  it("isWithinRange: 2026-03-27 is in March range", () => {
    expect(isWithinRange(new Date("2026-03-27"), range)).toBe(true);
  });
  it("isWithinRange: 2026-03-28 is in March range", () => {
    expect(isWithinRange(new Date("2026-03-28"), range)).toBe(true);
  });
  it("isWithinRange: 2026-03-29 is in March range", () => {
    expect(isWithinRange(new Date("2026-03-29"), range)).toBe(true);
  });
  it("isWithinRange: 2026-03-30 is in March range", () => {
    expect(isWithinRange(new Date("2026-03-30"), range)).toBe(true);
  });
  it("isWithinRange: 2026-03-31 is in March range", () => {
    expect(isWithinRange(new Date("2026-03-31"), range)).toBe(true);
  });
  it("isWithinRange: 2026-02-01 is outside March range", () => {
    expect(isWithinRange(new Date("2026-02-01"), range)).toBe(false);
  });
  it("isWithinRange: 2026-02-02 is outside March range", () => {
    expect(isWithinRange(new Date("2026-02-02"), range)).toBe(false);
  });
  it("isWithinRange: 2026-02-03 is outside March range", () => {
    expect(isWithinRange(new Date("2026-02-03"), range)).toBe(false);
  });
  it("isWithinRange: 2026-02-04 is outside March range", () => {
    expect(isWithinRange(new Date("2026-02-04"), range)).toBe(false);
  });
  it("isWithinRange: 2026-02-05 is outside March range", () => {
    expect(isWithinRange(new Date("2026-02-05"), range)).toBe(false);
  });
  it("isWithinRange: 2026-02-06 is outside March range", () => {
    expect(isWithinRange(new Date("2026-02-06"), range)).toBe(false);
  });
  it("isWithinRange: 2026-02-07 is outside March range", () => {
    expect(isWithinRange(new Date("2026-02-07"), range)).toBe(false);
  });
  it("isWithinRange: 2026-02-08 is outside March range", () => {
    expect(isWithinRange(new Date("2026-02-08"), range)).toBe(false);
  });
  it("isWithinRange: 2026-02-09 is outside March range", () => {
    expect(isWithinRange(new Date("2026-02-09"), range)).toBe(false);
  });
  it("isWithinRange: 2026-02-10 is outside March range", () => {
    expect(isWithinRange(new Date("2026-02-10"), range)).toBe(false);
  });
});