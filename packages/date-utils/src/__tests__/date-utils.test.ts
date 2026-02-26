// Copyright (c) 2026 Nexara DMCC. All rights reserved.
import {
  addDays, addMonths, addYears, addHours, addMinutes, addSeconds,
  subDays, subMonths, subYears,
  diffDays, diffHours, diffMinutes,
  isBefore, isAfter, isSameDay, isSameMonth, isSameYear,
  isWeekend, isLeapYear,
  startOfDay, endOfDay, startOfMonth, endOfMonth, startOfYear, endOfYear,
  getDaysInMonth, getWeekNumber, getDayOfYear,
  formatDate, parseDate, clampDate,
} from '../date-utils';

describe('addDays', () => {
  it('adds 1 day(s) to 2026-01-01 yields 2026-01-02', () => {
    const result = addDays(new Date(2026, 0, 1), 1);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(1);
    expect(result.getDate()).toBe(2);
  });
  it('adds 2 day(s) to 2026-01-01 yields 2026-01-03', () => {
    const result = addDays(new Date(2026, 0, 1), 2);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(1);
    expect(result.getDate()).toBe(3);
  });
  it('adds 3 day(s) to 2026-01-01 yields 2026-01-04', () => {
    const result = addDays(new Date(2026, 0, 1), 3);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(1);
    expect(result.getDate()).toBe(4);
  });
  it('adds 4 day(s) to 2026-01-01 yields 2026-01-05', () => {
    const result = addDays(new Date(2026, 0, 1), 4);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(1);
    expect(result.getDate()).toBe(5);
  });
  it('adds 5 day(s) to 2026-01-01 yields 2026-01-06', () => {
    const result = addDays(new Date(2026, 0, 1), 5);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(1);
    expect(result.getDate()).toBe(6);
  });
  it('adds 6 day(s) to 2026-01-01 yields 2026-01-07', () => {
    const result = addDays(new Date(2026, 0, 1), 6);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(1);
    expect(result.getDate()).toBe(7);
  });
  it('adds 7 day(s) to 2026-01-01 yields 2026-01-08', () => {
    const result = addDays(new Date(2026, 0, 1), 7);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(1);
    expect(result.getDate()).toBe(8);
  });
  it('adds 8 day(s) to 2026-01-01 yields 2026-01-09', () => {
    const result = addDays(new Date(2026, 0, 1), 8);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(1);
    expect(result.getDate()).toBe(9);
  });
  it('adds 9 day(s) to 2026-01-01 yields 2026-01-10', () => {
    const result = addDays(new Date(2026, 0, 1), 9);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(1);
    expect(result.getDate()).toBe(10);
  });
  it('adds 10 day(s) to 2026-01-01 yields 2026-01-11', () => {
    const result = addDays(new Date(2026, 0, 1), 10);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(1);
    expect(result.getDate()).toBe(11);
  });
  it('adds 11 day(s) to 2026-01-01 yields 2026-01-12', () => {
    const result = addDays(new Date(2026, 0, 1), 11);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(1);
    expect(result.getDate()).toBe(12);
  });
  it('adds 12 day(s) to 2026-01-01 yields 2026-01-13', () => {
    const result = addDays(new Date(2026, 0, 1), 12);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(1);
    expect(result.getDate()).toBe(13);
  });
  it('adds 13 day(s) to 2026-01-01 yields 2026-01-14', () => {
    const result = addDays(new Date(2026, 0, 1), 13);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(1);
    expect(result.getDate()).toBe(14);
  });
  it('adds 14 day(s) to 2026-01-01 yields 2026-01-15', () => {
    const result = addDays(new Date(2026, 0, 1), 14);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(1);
    expect(result.getDate()).toBe(15);
  });
  it('adds 15 day(s) to 2026-01-01 yields 2026-01-16', () => {
    const result = addDays(new Date(2026, 0, 1), 15);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(1);
    expect(result.getDate()).toBe(16);
  });
  it('adds 16 day(s) to 2026-01-01 yields 2026-01-17', () => {
    const result = addDays(new Date(2026, 0, 1), 16);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(1);
    expect(result.getDate()).toBe(17);
  });
  it('adds 17 day(s) to 2026-01-01 yields 2026-01-18', () => {
    const result = addDays(new Date(2026, 0, 1), 17);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(1);
    expect(result.getDate()).toBe(18);
  });
  it('adds 18 day(s) to 2026-01-01 yields 2026-01-19', () => {
    const result = addDays(new Date(2026, 0, 1), 18);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(1);
    expect(result.getDate()).toBe(19);
  });
  it('adds 19 day(s) to 2026-01-01 yields 2026-01-20', () => {
    const result = addDays(new Date(2026, 0, 1), 19);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(1);
    expect(result.getDate()).toBe(20);
  });
  it('adds 20 day(s) to 2026-01-01 yields 2026-01-21', () => {
    const result = addDays(new Date(2026, 0, 1), 20);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(1);
    expect(result.getDate()).toBe(21);
  });
  it('adds 21 day(s) to 2026-01-01 yields 2026-01-22', () => {
    const result = addDays(new Date(2026, 0, 1), 21);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(1);
    expect(result.getDate()).toBe(22);
  });
  it('adds 22 day(s) to 2026-01-01 yields 2026-01-23', () => {
    const result = addDays(new Date(2026, 0, 1), 22);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(1);
    expect(result.getDate()).toBe(23);
  });
  it('adds 23 day(s) to 2026-01-01 yields 2026-01-24', () => {
    const result = addDays(new Date(2026, 0, 1), 23);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(1);
    expect(result.getDate()).toBe(24);
  });
  it('adds 24 day(s) to 2026-01-01 yields 2026-01-25', () => {
    const result = addDays(new Date(2026, 0, 1), 24);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(1);
    expect(result.getDate()).toBe(25);
  });
  it('adds 25 day(s) to 2026-01-01 yields 2026-01-26', () => {
    const result = addDays(new Date(2026, 0, 1), 25);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(1);
    expect(result.getDate()).toBe(26);
  });
  it('adds 26 day(s) to 2026-01-01 yields 2026-01-27', () => {
    const result = addDays(new Date(2026, 0, 1), 26);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(1);
    expect(result.getDate()).toBe(27);
  });
  it('adds 27 day(s) to 2026-01-01 yields 2026-01-28', () => {
    const result = addDays(new Date(2026, 0, 1), 27);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(1);
    expect(result.getDate()).toBe(28);
  });
  it('adds 28 day(s) to 2026-01-01 yields 2026-01-29', () => {
    const result = addDays(new Date(2026, 0, 1), 28);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(1);
    expect(result.getDate()).toBe(29);
  });
  it('adds 29 day(s) to 2026-01-01 yields 2026-01-30', () => {
    const result = addDays(new Date(2026, 0, 1), 29);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(1);
    expect(result.getDate()).toBe(30);
  });
  it('adds 30 day(s) to 2026-01-01 yields 2026-01-31', () => {
    const result = addDays(new Date(2026, 0, 1), 30);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(1);
    expect(result.getDate()).toBe(31);
  });
  it('adds 31 day(s) to 2026-01-01 yields 2026-02-01', () => {
    const result = addDays(new Date(2026, 0, 1), 31);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(2);
    expect(result.getDate()).toBe(1);
  });
  it('adds 32 day(s) to 2026-01-01 yields 2026-02-02', () => {
    const result = addDays(new Date(2026, 0, 1), 32);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(2);
    expect(result.getDate()).toBe(2);
  });
  it('adds 33 day(s) to 2026-01-01 yields 2026-02-03', () => {
    const result = addDays(new Date(2026, 0, 1), 33);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(2);
    expect(result.getDate()).toBe(3);
  });
  it('adds 34 day(s) to 2026-01-01 yields 2026-02-04', () => {
    const result = addDays(new Date(2026, 0, 1), 34);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(2);
    expect(result.getDate()).toBe(4);
  });
  it('adds 35 day(s) to 2026-01-01 yields 2026-02-05', () => {
    const result = addDays(new Date(2026, 0, 1), 35);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(2);
    expect(result.getDate()).toBe(5);
  });
  it('adds 36 day(s) to 2026-01-01 yields 2026-02-06', () => {
    const result = addDays(new Date(2026, 0, 1), 36);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(2);
    expect(result.getDate()).toBe(6);
  });
  it('adds 37 day(s) to 2026-01-01 yields 2026-02-07', () => {
    const result = addDays(new Date(2026, 0, 1), 37);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(2);
    expect(result.getDate()).toBe(7);
  });
  it('adds 38 day(s) to 2026-01-01 yields 2026-02-08', () => {
    const result = addDays(new Date(2026, 0, 1), 38);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(2);
    expect(result.getDate()).toBe(8);
  });
  it('adds 39 day(s) to 2026-01-01 yields 2026-02-09', () => {
    const result = addDays(new Date(2026, 0, 1), 39);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(2);
    expect(result.getDate()).toBe(9);
  });
  it('adds 40 day(s) to 2026-01-01 yields 2026-02-10', () => {
    const result = addDays(new Date(2026, 0, 1), 40);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(2);
    expect(result.getDate()).toBe(10);
  });
  it('adds 41 day(s) to 2026-01-01 yields 2026-02-11', () => {
    const result = addDays(new Date(2026, 0, 1), 41);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(2);
    expect(result.getDate()).toBe(11);
  });
  it('adds 42 day(s) to 2026-01-01 yields 2026-02-12', () => {
    const result = addDays(new Date(2026, 0, 1), 42);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(2);
    expect(result.getDate()).toBe(12);
  });
  it('adds 43 day(s) to 2026-01-01 yields 2026-02-13', () => {
    const result = addDays(new Date(2026, 0, 1), 43);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(2);
    expect(result.getDate()).toBe(13);
  });
  it('adds 44 day(s) to 2026-01-01 yields 2026-02-14', () => {
    const result = addDays(new Date(2026, 0, 1), 44);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(2);
    expect(result.getDate()).toBe(14);
  });
  it('adds 45 day(s) to 2026-01-01 yields 2026-02-15', () => {
    const result = addDays(new Date(2026, 0, 1), 45);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(2);
    expect(result.getDate()).toBe(15);
  });
  it('adds 46 day(s) to 2026-01-01 yields 2026-02-16', () => {
    const result = addDays(new Date(2026, 0, 1), 46);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(2);
    expect(result.getDate()).toBe(16);
  });
  it('adds 47 day(s) to 2026-01-01 yields 2026-02-17', () => {
    const result = addDays(new Date(2026, 0, 1), 47);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(2);
    expect(result.getDate()).toBe(17);
  });
  it('adds 48 day(s) to 2026-01-01 yields 2026-02-18', () => {
    const result = addDays(new Date(2026, 0, 1), 48);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(2);
    expect(result.getDate()).toBe(18);
  });
  it('adds 49 day(s) to 2026-01-01 yields 2026-02-19', () => {
    const result = addDays(new Date(2026, 0, 1), 49);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(2);
    expect(result.getDate()).toBe(19);
  });
  it('adds 50 day(s) to 2026-01-01 yields 2026-02-20', () => {
    const result = addDays(new Date(2026, 0, 1), 50);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(2);
    expect(result.getDate()).toBe(20);
  });
  it('addDays cross-boundary 2026-03-01 plus -1', () => {
    const result = addDays(new Date(2026, 2, 1), -1);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(2);
    expect(result.getDate()).toBe(28);
  });
  it('addDays cross-boundary 2024-03-01 plus -1', () => {
    const result = addDays(new Date(2024, 2, 1), -1);
    expect(result.getFullYear()).toBe(2024);
    expect(result.getMonth() + 1).toBe(2);
    expect(result.getDate()).toBe(29);
  });
  it('addDays cross-boundary 2026-01-01 plus -1', () => {
    const result = addDays(new Date(2026, 0, 1), -1);
    expect(result.getFullYear()).toBe(2025);
    expect(result.getMonth() + 1).toBe(12);
    expect(result.getDate()).toBe(31);
  });
  it('addDays cross-boundary 2026-12-31 plus 1', () => {
    const result = addDays(new Date(2026, 11, 31), 1);
    expect(result.getFullYear()).toBe(2027);
    expect(result.getMonth() + 1).toBe(1);
    expect(result.getDate()).toBe(1);
  });
  it('addDays cross-boundary 2026-06-15 plus 30', () => {
    const result = addDays(new Date(2026, 5, 15), 30);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(7);
    expect(result.getDate()).toBe(15);
  });
  it('adds 102 days to 2020-06-01', () => {
    const result = addDays(new Date(2020, 5, 1), 102);
    expect(result.getDate()).toBe(11);
    expect(result.getMonth() + 1).toBe(9);
  });
  it('adds 104 days to 2020-06-01', () => {
    const result = addDays(new Date(2020, 5, 1), 104);
    expect(result.getDate()).toBe(13);
    expect(result.getMonth() + 1).toBe(9);
  });
  it('adds 106 days to 2020-06-01', () => {
    const result = addDays(new Date(2020, 5, 1), 106);
    expect(result.getDate()).toBe(15);
    expect(result.getMonth() + 1).toBe(9);
  });
  it('adds 108 days to 2020-06-01', () => {
    const result = addDays(new Date(2020, 5, 1), 108);
    expect(result.getDate()).toBe(17);
    expect(result.getMonth() + 1).toBe(9);
  });
  it('adds 110 days to 2020-06-01', () => {
    const result = addDays(new Date(2020, 5, 1), 110);
    expect(result.getDate()).toBe(19);
    expect(result.getMonth() + 1).toBe(9);
  });
  it('adds 112 days to 2020-06-01', () => {
    const result = addDays(new Date(2020, 5, 1), 112);
    expect(result.getDate()).toBe(21);
    expect(result.getMonth() + 1).toBe(9);
  });
  it('adds 114 days to 2020-06-01', () => {
    const result = addDays(new Date(2020, 5, 1), 114);
    expect(result.getDate()).toBe(23);
    expect(result.getMonth() + 1).toBe(9);
  });
  it('adds 116 days to 2020-06-01', () => {
    const result = addDays(new Date(2020, 5, 1), 116);
    expect(result.getDate()).toBe(25);
    expect(result.getMonth() + 1).toBe(9);
  });
  it('adds 118 days to 2020-06-01', () => {
    const result = addDays(new Date(2020, 5, 1), 118);
    expect(result.getDate()).toBe(27);
    expect(result.getMonth() + 1).toBe(9);
  });
  it('adds 120 days to 2020-06-01', () => {
    const result = addDays(new Date(2020, 5, 1), 120);
    expect(result.getDate()).toBe(29);
    expect(result.getMonth() + 1).toBe(9);
  });
  it('adds 122 days to 2020-06-01', () => {
    const result = addDays(new Date(2020, 5, 1), 122);
    expect(result.getDate()).toBe(1);
    expect(result.getMonth() + 1).toBe(10);
  });
  it('adds 124 days to 2020-06-01', () => {
    const result = addDays(new Date(2020, 5, 1), 124);
    expect(result.getDate()).toBe(3);
    expect(result.getMonth() + 1).toBe(10);
  });
  it('adds 126 days to 2020-06-01', () => {
    const result = addDays(new Date(2020, 5, 1), 126);
    expect(result.getDate()).toBe(5);
    expect(result.getMonth() + 1).toBe(10);
  });
  it('adds 128 days to 2020-06-01', () => {
    const result = addDays(new Date(2020, 5, 1), 128);
    expect(result.getDate()).toBe(7);
    expect(result.getMonth() + 1).toBe(10);
  });
  it('adds 130 days to 2020-06-01', () => {
    const result = addDays(new Date(2020, 5, 1), 130);
    expect(result.getDate()).toBe(9);
    expect(result.getMonth() + 1).toBe(10);
  });
  it('adds 132 days to 2020-06-01', () => {
    const result = addDays(new Date(2020, 5, 1), 132);
    expect(result.getDate()).toBe(11);
    expect(result.getMonth() + 1).toBe(10);
  });
  it('adds 134 days to 2020-06-01', () => {
    const result = addDays(new Date(2020, 5, 1), 134);
    expect(result.getDate()).toBe(13);
    expect(result.getMonth() + 1).toBe(10);
  });
  it('adds 136 days to 2020-06-01', () => {
    const result = addDays(new Date(2020, 5, 1), 136);
    expect(result.getDate()).toBe(15);
    expect(result.getMonth() + 1).toBe(10);
  });
  it('adds 138 days to 2020-06-01', () => {
    const result = addDays(new Date(2020, 5, 1), 138);
    expect(result.getDate()).toBe(17);
    expect(result.getMonth() + 1).toBe(10);
  });
  it('adds 140 days to 2020-06-01', () => {
    const result = addDays(new Date(2020, 5, 1), 140);
    expect(result.getDate()).toBe(19);
    expect(result.getMonth() + 1).toBe(10);
  });
  it('adds 142 days to 2020-06-01', () => {
    const result = addDays(new Date(2020, 5, 1), 142);
    expect(result.getDate()).toBe(21);
    expect(result.getMonth() + 1).toBe(10);
  });
  it('adds 144 days to 2020-06-01', () => {
    const result = addDays(new Date(2020, 5, 1), 144);
    expect(result.getDate()).toBe(23);
    expect(result.getMonth() + 1).toBe(10);
  });
  it('adds 146 days to 2020-06-01', () => {
    const result = addDays(new Date(2020, 5, 1), 146);
    expect(result.getDate()).toBe(25);
    expect(result.getMonth() + 1).toBe(10);
  });
  it('adds 148 days to 2020-06-01', () => {
    const result = addDays(new Date(2020, 5, 1), 148);
    expect(result.getDate()).toBe(27);
    expect(result.getMonth() + 1).toBe(10);
  });
  it('adds 150 days to 2020-06-01', () => {
    const result = addDays(new Date(2020, 5, 1), 150);
    expect(result.getDate()).toBe(29);
    expect(result.getMonth() + 1).toBe(10);
  });
  it('adds 152 days to 2020-06-01', () => {
    const result = addDays(new Date(2020, 5, 1), 152);
    expect(result.getDate()).toBe(31);
    expect(result.getMonth() + 1).toBe(10);
  });
  it('adds 154 days to 2020-06-01', () => {
    const result = addDays(new Date(2020, 5, 1), 154);
    expect(result.getDate()).toBe(2);
    expect(result.getMonth() + 1).toBe(11);
  });
  it('adds 156 days to 2020-06-01', () => {
    const result = addDays(new Date(2020, 5, 1), 156);
    expect(result.getDate()).toBe(4);
    expect(result.getMonth() + 1).toBe(11);
  });
  it('adds 158 days to 2020-06-01', () => {
    const result = addDays(new Date(2020, 5, 1), 158);
    expect(result.getDate()).toBe(6);
    expect(result.getMonth() + 1).toBe(11);
  });
  it('adds 160 days to 2020-06-01', () => {
    const result = addDays(new Date(2020, 5, 1), 160);
    expect(result.getDate()).toBe(8);
    expect(result.getMonth() + 1).toBe(11);
  });
  it('adds 162 days to 2020-06-01', () => {
    const result = addDays(new Date(2020, 5, 1), 162);
    expect(result.getDate()).toBe(10);
    expect(result.getMonth() + 1).toBe(11);
  });
  it('adds 164 days to 2020-06-01', () => {
    const result = addDays(new Date(2020, 5, 1), 164);
    expect(result.getDate()).toBe(12);
    expect(result.getMonth() + 1).toBe(11);
  });
  it('adds 166 days to 2020-06-01', () => {
    const result = addDays(new Date(2020, 5, 1), 166);
    expect(result.getDate()).toBe(14);
    expect(result.getMonth() + 1).toBe(11);
  });
  it('adds 168 days to 2020-06-01', () => {
    const result = addDays(new Date(2020, 5, 1), 168);
    expect(result.getDate()).toBe(16);
    expect(result.getMonth() + 1).toBe(11);
  });
  it('adds 170 days to 2020-06-01', () => {
    const result = addDays(new Date(2020, 5, 1), 170);
    expect(result.getDate()).toBe(18);
    expect(result.getMonth() + 1).toBe(11);
  });
  it('adds 172 days to 2020-06-01', () => {
    const result = addDays(new Date(2020, 5, 1), 172);
    expect(result.getDate()).toBe(20);
    expect(result.getMonth() + 1).toBe(11);
  });
  it('adds 174 days to 2020-06-01', () => {
    const result = addDays(new Date(2020, 5, 1), 174);
    expect(result.getDate()).toBe(22);
    expect(result.getMonth() + 1).toBe(11);
  });
  it('adds 176 days to 2020-06-01', () => {
    const result = addDays(new Date(2020, 5, 1), 176);
    expect(result.getDate()).toBe(24);
    expect(result.getMonth() + 1).toBe(11);
  });
  it('adds 178 days to 2020-06-01', () => {
    const result = addDays(new Date(2020, 5, 1), 178);
    expect(result.getDate()).toBe(26);
    expect(result.getMonth() + 1).toBe(11);
  });
  it('adds 180 days to 2020-06-01', () => {
    const result = addDays(new Date(2020, 5, 1), 180);
    expect(result.getDate()).toBe(28);
    expect(result.getMonth() + 1).toBe(11);
  });
  it('adds 182 days to 2020-06-01', () => {
    const result = addDays(new Date(2020, 5, 1), 182);
    expect(result.getDate()).toBe(30);
    expect(result.getMonth() + 1).toBe(11);
  });
  it('adds 184 days to 2020-06-01', () => {
    const result = addDays(new Date(2020, 5, 1), 184);
    expect(result.getDate()).toBe(2);
    expect(result.getMonth() + 1).toBe(12);
  });
  it('adds 186 days to 2020-06-01', () => {
    const result = addDays(new Date(2020, 5, 1), 186);
    expect(result.getDate()).toBe(4);
    expect(result.getMonth() + 1).toBe(12);
  });
  it('adds 188 days to 2020-06-01', () => {
    const result = addDays(new Date(2020, 5, 1), 188);
    expect(result.getDate()).toBe(6);
    expect(result.getMonth() + 1).toBe(12);
  });
  it('adds 190 days to 2020-06-01', () => {
    const result = addDays(new Date(2020, 5, 1), 190);
    expect(result.getDate()).toBe(8);
    expect(result.getMonth() + 1).toBe(12);
  });
});

describe('addMonths and addYears', () => {
  it('addMonths 2026-01-01 plus 1 months yields 2026-02', () => {
    const result = addMonths(new Date(2026, 0, 1), 1);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(2);
  });
  it('addMonths 2026-01-01 plus 2 months yields 2026-03', () => {
    const result = addMonths(new Date(2026, 0, 1), 2);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(3);
  });
  it('addMonths 2026-01-01 plus 3 months yields 2026-04', () => {
    const result = addMonths(new Date(2026, 0, 1), 3);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(4);
  });
  it('addMonths 2026-01-01 plus 4 months yields 2026-05', () => {
    const result = addMonths(new Date(2026, 0, 1), 4);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(5);
  });
  it('addMonths 2026-01-01 plus 5 months yields 2026-06', () => {
    const result = addMonths(new Date(2026, 0, 1), 5);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(6);
  });
  it('addMonths 2026-01-01 plus 6 months yields 2026-07', () => {
    const result = addMonths(new Date(2026, 0, 1), 6);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(7);
  });
  it('addMonths 2026-01-01 plus 7 months yields 2026-08', () => {
    const result = addMonths(new Date(2026, 0, 1), 7);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(8);
  });
  it('addMonths 2026-01-01 plus 8 months yields 2026-09', () => {
    const result = addMonths(new Date(2026, 0, 1), 8);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(9);
  });
  it('addMonths 2026-01-01 plus 9 months yields 2026-10', () => {
    const result = addMonths(new Date(2026, 0, 1), 9);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(10);
  });
  it('addMonths 2026-01-01 plus 10 months yields 2026-11', () => {
    const result = addMonths(new Date(2026, 0, 1), 10);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(11);
  });
  it('addMonths 2026-01-01 plus 11 months yields 2026-12', () => {
    const result = addMonths(new Date(2026, 0, 1), 11);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(12);
  });
  it('addMonths 2026-01-01 plus 12 months yields 2027-01', () => {
    const result = addMonths(new Date(2026, 0, 1), 12);
    expect(result.getFullYear()).toBe(2027);
    expect(result.getMonth() + 1).toBe(1);
  });
  it('addMonths 2026-01-01 plus 13 months yields 2027-02', () => {
    const result = addMonths(new Date(2026, 0, 1), 13);
    expect(result.getFullYear()).toBe(2027);
    expect(result.getMonth() + 1).toBe(2);
  });
  it('addMonths 2026-01-01 plus 14 months yields 2027-03', () => {
    const result = addMonths(new Date(2026, 0, 1), 14);
    expect(result.getFullYear()).toBe(2027);
    expect(result.getMonth() + 1).toBe(3);
  });
  it('addMonths 2026-01-01 plus 15 months yields 2027-04', () => {
    const result = addMonths(new Date(2026, 0, 1), 15);
    expect(result.getFullYear()).toBe(2027);
    expect(result.getMonth() + 1).toBe(4);
  });
  it('addMonths 2026-01-01 plus 16 months yields 2027-05', () => {
    const result = addMonths(new Date(2026, 0, 1), 16);
    expect(result.getFullYear()).toBe(2027);
    expect(result.getMonth() + 1).toBe(5);
  });
  it('addMonths 2026-01-01 plus 17 months yields 2027-06', () => {
    const result = addMonths(new Date(2026, 0, 1), 17);
    expect(result.getFullYear()).toBe(2027);
    expect(result.getMonth() + 1).toBe(6);
  });
  it('addMonths 2026-01-01 plus 18 months yields 2027-07', () => {
    const result = addMonths(new Date(2026, 0, 1), 18);
    expect(result.getFullYear()).toBe(2027);
    expect(result.getMonth() + 1).toBe(7);
  });
  it('addMonths 2026-01-01 plus 19 months yields 2027-08', () => {
    const result = addMonths(new Date(2026, 0, 1), 19);
    expect(result.getFullYear()).toBe(2027);
    expect(result.getMonth() + 1).toBe(8);
  });
  it('addMonths 2026-01-01 plus 20 months yields 2027-09', () => {
    const result = addMonths(new Date(2026, 0, 1), 20);
    expect(result.getFullYear()).toBe(2027);
    expect(result.getMonth() + 1).toBe(9);
  });
  it('addMonths 2026-01-01 plus 21 months yields 2027-10', () => {
    const result = addMonths(new Date(2026, 0, 1), 21);
    expect(result.getFullYear()).toBe(2027);
    expect(result.getMonth() + 1).toBe(10);
  });
  it('addMonths 2026-01-01 plus 22 months yields 2027-11', () => {
    const result = addMonths(new Date(2026, 0, 1), 22);
    expect(result.getFullYear()).toBe(2027);
    expect(result.getMonth() + 1).toBe(11);
  });
  it('addMonths 2026-01-01 plus 23 months yields 2027-12', () => {
    const result = addMonths(new Date(2026, 0, 1), 23);
    expect(result.getFullYear()).toBe(2027);
    expect(result.getMonth() + 1).toBe(12);
  });
  it('addMonths 2026-01-01 plus 24 months yields 2028-01', () => {
    const result = addMonths(new Date(2026, 0, 1), 24);
    expect(result.getFullYear()).toBe(2028);
    expect(result.getMonth() + 1).toBe(1);
  });
  it('addMonths 2026-01-01 plus 25 months yields 2028-02', () => {
    const result = addMonths(new Date(2026, 0, 1), 25);
    expect(result.getFullYear()).toBe(2028);
    expect(result.getMonth() + 1).toBe(2);
  });
  it('addMonths 2026-01-01 plus 26 months yields 2028-03', () => {
    const result = addMonths(new Date(2026, 0, 1), 26);
    expect(result.getFullYear()).toBe(2028);
    expect(result.getMonth() + 1).toBe(3);
  });
  it('addMonths 2026-01-01 plus 27 months yields 2028-04', () => {
    const result = addMonths(new Date(2026, 0, 1), 27);
    expect(result.getFullYear()).toBe(2028);
    expect(result.getMonth() + 1).toBe(4);
  });
  it('addMonths 2026-01-01 plus 28 months yields 2028-05', () => {
    const result = addMonths(new Date(2026, 0, 1), 28);
    expect(result.getFullYear()).toBe(2028);
    expect(result.getMonth() + 1).toBe(5);
  });
  it('addMonths 2026-01-01 plus 29 months yields 2028-06', () => {
    const result = addMonths(new Date(2026, 0, 1), 29);
    expect(result.getFullYear()).toBe(2028);
    expect(result.getMonth() + 1).toBe(6);
  });
  it('addMonths 2026-01-01 plus 30 months yields 2028-07', () => {
    const result = addMonths(new Date(2026, 0, 1), 30);
    expect(result.getFullYear()).toBe(2028);
    expect(result.getMonth() + 1).toBe(7);
  });
  it('addMonths 2026-01-01 plus 31 months yields 2028-08', () => {
    const result = addMonths(new Date(2026, 0, 1), 31);
    expect(result.getFullYear()).toBe(2028);
    expect(result.getMonth() + 1).toBe(8);
  });
  it('addMonths 2026-01-01 plus 32 months yields 2028-09', () => {
    const result = addMonths(new Date(2026, 0, 1), 32);
    expect(result.getFullYear()).toBe(2028);
    expect(result.getMonth() + 1).toBe(9);
  });
  it('addMonths 2026-01-01 plus 33 months yields 2028-10', () => {
    const result = addMonths(new Date(2026, 0, 1), 33);
    expect(result.getFullYear()).toBe(2028);
    expect(result.getMonth() + 1).toBe(10);
  });
  it('addMonths 2026-01-01 plus 34 months yields 2028-11', () => {
    const result = addMonths(new Date(2026, 0, 1), 34);
    expect(result.getFullYear()).toBe(2028);
    expect(result.getMonth() + 1).toBe(11);
  });
  it('addMonths 2026-01-01 plus 35 months yields 2028-12', () => {
    const result = addMonths(new Date(2026, 0, 1), 35);
    expect(result.getFullYear()).toBe(2028);
    expect(result.getMonth() + 1).toBe(12);
  });
  it('addMonths 2026-01-01 plus 36 months yields 2029-01', () => {
    const result = addMonths(new Date(2026, 0, 1), 36);
    expect(result.getFullYear()).toBe(2029);
    expect(result.getMonth() + 1).toBe(1);
  });
  it('addMonths 2026-01-01 plus 37 months yields 2029-02', () => {
    const result = addMonths(new Date(2026, 0, 1), 37);
    expect(result.getFullYear()).toBe(2029);
    expect(result.getMonth() + 1).toBe(2);
  });
  it('addMonths 2026-01-01 plus 38 months yields 2029-03', () => {
    const result = addMonths(new Date(2026, 0, 1), 38);
    expect(result.getFullYear()).toBe(2029);
    expect(result.getMonth() + 1).toBe(3);
  });
  it('addMonths 2026-01-01 plus 39 months yields 2029-04', () => {
    const result = addMonths(new Date(2026, 0, 1), 39);
    expect(result.getFullYear()).toBe(2029);
    expect(result.getMonth() + 1).toBe(4);
  });
  it('addMonths 2026-01-01 plus 40 months yields 2029-05', () => {
    const result = addMonths(new Date(2026, 0, 1), 40);
    expect(result.getFullYear()).toBe(2029);
    expect(result.getMonth() + 1).toBe(5);
  });
  it('addMonths 2026-01-01 plus 41 months yields 2029-06', () => {
    const result = addMonths(new Date(2026, 0, 1), 41);
    expect(result.getFullYear()).toBe(2029);
    expect(result.getMonth() + 1).toBe(6);
  });
  it('addMonths 2026-01-01 plus 42 months yields 2029-07', () => {
    const result = addMonths(new Date(2026, 0, 1), 42);
    expect(result.getFullYear()).toBe(2029);
    expect(result.getMonth() + 1).toBe(7);
  });
  it('addMonths 2026-01-01 plus 43 months yields 2029-08', () => {
    const result = addMonths(new Date(2026, 0, 1), 43);
    expect(result.getFullYear()).toBe(2029);
    expect(result.getMonth() + 1).toBe(8);
  });
  it('addMonths 2026-01-01 plus 44 months yields 2029-09', () => {
    const result = addMonths(new Date(2026, 0, 1), 44);
    expect(result.getFullYear()).toBe(2029);
    expect(result.getMonth() + 1).toBe(9);
  });
  it('addMonths 2026-01-01 plus 45 months yields 2029-10', () => {
    const result = addMonths(new Date(2026, 0, 1), 45);
    expect(result.getFullYear()).toBe(2029);
    expect(result.getMonth() + 1).toBe(10);
  });
  it('addMonths 2026-01-01 plus 46 months yields 2029-11', () => {
    const result = addMonths(new Date(2026, 0, 1), 46);
    expect(result.getFullYear()).toBe(2029);
    expect(result.getMonth() + 1).toBe(11);
  });
  it('addMonths 2026-01-01 plus 47 months yields 2029-12', () => {
    const result = addMonths(new Date(2026, 0, 1), 47);
    expect(result.getFullYear()).toBe(2029);
    expect(result.getMonth() + 1).toBe(12);
  });
  it('addMonths 2026-01-01 plus 48 months yields 2030-01', () => {
    const result = addMonths(new Date(2026, 0, 1), 48);
    expect(result.getFullYear()).toBe(2030);
    expect(result.getMonth() + 1).toBe(1);
  });
  it('addMonths 2026-01-01 plus 49 months yields 2030-02', () => {
    const result = addMonths(new Date(2026, 0, 1), 49);
    expect(result.getFullYear()).toBe(2030);
    expect(result.getMonth() + 1).toBe(2);
  });
  it('addMonths 2026-01-01 plus 50 months yields 2030-03', () => {
    const result = addMonths(new Date(2026, 0, 1), 50);
    expect(result.getFullYear()).toBe(2030);
    expect(result.getMonth() + 1).toBe(3);
  });
  it('addYears 2000-06-15 plus 1 years yields 2001', () => {
    const result = addYears(new Date(2000, 5, 15), 1);
    expect(result.getFullYear()).toBe(2001);
    expect(result.getMonth() + 1).toBe(6);
    expect(result.getDate()).toBe(15);
  });
  it('addYears 2000-06-15 plus 2 years yields 2002', () => {
    const result = addYears(new Date(2000, 5, 15), 2);
    expect(result.getFullYear()).toBe(2002);
    expect(result.getMonth() + 1).toBe(6);
    expect(result.getDate()).toBe(15);
  });
  it('addYears 2000-06-15 plus 3 years yields 2003', () => {
    const result = addYears(new Date(2000, 5, 15), 3);
    expect(result.getFullYear()).toBe(2003);
    expect(result.getMonth() + 1).toBe(6);
    expect(result.getDate()).toBe(15);
  });
  it('addYears 2000-06-15 plus 4 years yields 2004', () => {
    const result = addYears(new Date(2000, 5, 15), 4);
    expect(result.getFullYear()).toBe(2004);
    expect(result.getMonth() + 1).toBe(6);
    expect(result.getDate()).toBe(15);
  });
  it('addYears 2000-06-15 plus 5 years yields 2005', () => {
    const result = addYears(new Date(2000, 5, 15), 5);
    expect(result.getFullYear()).toBe(2005);
    expect(result.getMonth() + 1).toBe(6);
    expect(result.getDate()).toBe(15);
  });
  it('addYears 2000-06-15 plus 6 years yields 2006', () => {
    const result = addYears(new Date(2000, 5, 15), 6);
    expect(result.getFullYear()).toBe(2006);
    expect(result.getMonth() + 1).toBe(6);
    expect(result.getDate()).toBe(15);
  });
  it('addYears 2000-06-15 plus 7 years yields 2007', () => {
    const result = addYears(new Date(2000, 5, 15), 7);
    expect(result.getFullYear()).toBe(2007);
    expect(result.getMonth() + 1).toBe(6);
    expect(result.getDate()).toBe(15);
  });
  it('addYears 2000-06-15 plus 8 years yields 2008', () => {
    const result = addYears(new Date(2000, 5, 15), 8);
    expect(result.getFullYear()).toBe(2008);
    expect(result.getMonth() + 1).toBe(6);
    expect(result.getDate()).toBe(15);
  });
  it('addYears 2000-06-15 plus 9 years yields 2009', () => {
    const result = addYears(new Date(2000, 5, 15), 9);
    expect(result.getFullYear()).toBe(2009);
    expect(result.getMonth() + 1).toBe(6);
    expect(result.getDate()).toBe(15);
  });
  it('addYears 2000-06-15 plus 10 years yields 2010', () => {
    const result = addYears(new Date(2000, 5, 15), 10);
    expect(result.getFullYear()).toBe(2010);
    expect(result.getMonth() + 1).toBe(6);
    expect(result.getDate()).toBe(15);
  });
  it('addYears 2000-06-15 plus 11 years yields 2011', () => {
    const result = addYears(new Date(2000, 5, 15), 11);
    expect(result.getFullYear()).toBe(2011);
    expect(result.getMonth() + 1).toBe(6);
    expect(result.getDate()).toBe(15);
  });
  it('addYears 2000-06-15 plus 12 years yields 2012', () => {
    const result = addYears(new Date(2000, 5, 15), 12);
    expect(result.getFullYear()).toBe(2012);
    expect(result.getMonth() + 1).toBe(6);
    expect(result.getDate()).toBe(15);
  });
  it('addYears 2000-06-15 plus 13 years yields 2013', () => {
    const result = addYears(new Date(2000, 5, 15), 13);
    expect(result.getFullYear()).toBe(2013);
    expect(result.getMonth() + 1).toBe(6);
    expect(result.getDate()).toBe(15);
  });
  it('addYears 2000-06-15 plus 14 years yields 2014', () => {
    const result = addYears(new Date(2000, 5, 15), 14);
    expect(result.getFullYear()).toBe(2014);
    expect(result.getMonth() + 1).toBe(6);
    expect(result.getDate()).toBe(15);
  });
  it('addYears 2000-06-15 plus 15 years yields 2015', () => {
    const result = addYears(new Date(2000, 5, 15), 15);
    expect(result.getFullYear()).toBe(2015);
    expect(result.getMonth() + 1).toBe(6);
    expect(result.getDate()).toBe(15);
  });
  it('addYears 2000-06-15 plus 16 years yields 2016', () => {
    const result = addYears(new Date(2000, 5, 15), 16);
    expect(result.getFullYear()).toBe(2016);
    expect(result.getMonth() + 1).toBe(6);
    expect(result.getDate()).toBe(15);
  });
  it('addYears 2000-06-15 plus 17 years yields 2017', () => {
    const result = addYears(new Date(2000, 5, 15), 17);
    expect(result.getFullYear()).toBe(2017);
    expect(result.getMonth() + 1).toBe(6);
    expect(result.getDate()).toBe(15);
  });
  it('addYears 2000-06-15 plus 18 years yields 2018', () => {
    const result = addYears(new Date(2000, 5, 15), 18);
    expect(result.getFullYear()).toBe(2018);
    expect(result.getMonth() + 1).toBe(6);
    expect(result.getDate()).toBe(15);
  });
  it('addYears 2000-06-15 plus 19 years yields 2019', () => {
    const result = addYears(new Date(2000, 5, 15), 19);
    expect(result.getFullYear()).toBe(2019);
    expect(result.getMonth() + 1).toBe(6);
    expect(result.getDate()).toBe(15);
  });
  it('addYears 2000-06-15 plus 20 years yields 2020', () => {
    const result = addYears(new Date(2000, 5, 15), 20);
    expect(result.getFullYear()).toBe(2020);
    expect(result.getMonth() + 1).toBe(6);
    expect(result.getDate()).toBe(15);
  });
  it('addYears 2000-06-15 plus 21 years yields 2021', () => {
    const result = addYears(new Date(2000, 5, 15), 21);
    expect(result.getFullYear()).toBe(2021);
    expect(result.getMonth() + 1).toBe(6);
    expect(result.getDate()).toBe(15);
  });
  it('addYears 2000-06-15 plus 22 years yields 2022', () => {
    const result = addYears(new Date(2000, 5, 15), 22);
    expect(result.getFullYear()).toBe(2022);
    expect(result.getMonth() + 1).toBe(6);
    expect(result.getDate()).toBe(15);
  });
  it('addYears 2000-06-15 plus 23 years yields 2023', () => {
    const result = addYears(new Date(2000, 5, 15), 23);
    expect(result.getFullYear()).toBe(2023);
    expect(result.getMonth() + 1).toBe(6);
    expect(result.getDate()).toBe(15);
  });
  it('addYears 2000-06-15 plus 24 years yields 2024', () => {
    const result = addYears(new Date(2000, 5, 15), 24);
    expect(result.getFullYear()).toBe(2024);
    expect(result.getMonth() + 1).toBe(6);
    expect(result.getDate()).toBe(15);
  });
  it('addYears 2000-06-15 plus 25 years yields 2025', () => {
    const result = addYears(new Date(2000, 5, 15), 25);
    expect(result.getFullYear()).toBe(2025);
    expect(result.getMonth() + 1).toBe(6);
    expect(result.getDate()).toBe(15);
  });
  it('addYears 2000-06-15 plus 26 years yields 2026', () => {
    const result = addYears(new Date(2000, 5, 15), 26);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(6);
    expect(result.getDate()).toBe(15);
  });
  it('addYears 2000-06-15 plus 27 years yields 2027', () => {
    const result = addYears(new Date(2000, 5, 15), 27);
    expect(result.getFullYear()).toBe(2027);
    expect(result.getMonth() + 1).toBe(6);
    expect(result.getDate()).toBe(15);
  });
  it('addYears 2000-06-15 plus 28 years yields 2028', () => {
    const result = addYears(new Date(2000, 5, 15), 28);
    expect(result.getFullYear()).toBe(2028);
    expect(result.getMonth() + 1).toBe(6);
    expect(result.getDate()).toBe(15);
  });
  it('addYears 2000-06-15 plus 29 years yields 2029', () => {
    const result = addYears(new Date(2000, 5, 15), 29);
    expect(result.getFullYear()).toBe(2029);
    expect(result.getMonth() + 1).toBe(6);
    expect(result.getDate()).toBe(15);
  });
  it('addYears 2000-06-15 plus 30 years yields 2030', () => {
    const result = addYears(new Date(2000, 5, 15), 30);
    expect(result.getFullYear()).toBe(2030);
    expect(result.getMonth() + 1).toBe(6);
    expect(result.getDate()).toBe(15);
  });
  it('addYears 2000-06-15 plus 31 years yields 2031', () => {
    const result = addYears(new Date(2000, 5, 15), 31);
    expect(result.getFullYear()).toBe(2031);
    expect(result.getMonth() + 1).toBe(6);
    expect(result.getDate()).toBe(15);
  });
  it('addYears 2000-06-15 plus 32 years yields 2032', () => {
    const result = addYears(new Date(2000, 5, 15), 32);
    expect(result.getFullYear()).toBe(2032);
    expect(result.getMonth() + 1).toBe(6);
    expect(result.getDate()).toBe(15);
  });
  it('addYears 2000-06-15 plus 33 years yields 2033', () => {
    const result = addYears(new Date(2000, 5, 15), 33);
    expect(result.getFullYear()).toBe(2033);
    expect(result.getMonth() + 1).toBe(6);
    expect(result.getDate()).toBe(15);
  });
  it('addYears 2000-06-15 plus 34 years yields 2034', () => {
    const result = addYears(new Date(2000, 5, 15), 34);
    expect(result.getFullYear()).toBe(2034);
    expect(result.getMonth() + 1).toBe(6);
    expect(result.getDate()).toBe(15);
  });
  it('addYears 2000-06-15 plus 35 years yields 2035', () => {
    const result = addYears(new Date(2000, 5, 15), 35);
    expect(result.getFullYear()).toBe(2035);
    expect(result.getMonth() + 1).toBe(6);
    expect(result.getDate()).toBe(15);
  });
  it('addYears 2000-06-15 plus 36 years yields 2036', () => {
    const result = addYears(new Date(2000, 5, 15), 36);
    expect(result.getFullYear()).toBe(2036);
    expect(result.getMonth() + 1).toBe(6);
    expect(result.getDate()).toBe(15);
  });
  it('addYears 2000-06-15 plus 37 years yields 2037', () => {
    const result = addYears(new Date(2000, 5, 15), 37);
    expect(result.getFullYear()).toBe(2037);
    expect(result.getMonth() + 1).toBe(6);
    expect(result.getDate()).toBe(15);
  });
  it('addYears 2000-06-15 plus 38 years yields 2038', () => {
    const result = addYears(new Date(2000, 5, 15), 38);
    expect(result.getFullYear()).toBe(2038);
    expect(result.getMonth() + 1).toBe(6);
    expect(result.getDate()).toBe(15);
  });
  it('addYears 2000-06-15 plus 39 years yields 2039', () => {
    const result = addYears(new Date(2000, 5, 15), 39);
    expect(result.getFullYear()).toBe(2039);
    expect(result.getMonth() + 1).toBe(6);
    expect(result.getDate()).toBe(15);
  });
  it('addYears 2000-06-15 plus 40 years yields 2040', () => {
    const result = addYears(new Date(2000, 5, 15), 40);
    expect(result.getFullYear()).toBe(2040);
    expect(result.getMonth() + 1).toBe(6);
    expect(result.getDate()).toBe(15);
  });
  it('addYears 2000-06-15 plus 41 years yields 2041', () => {
    const result = addYears(new Date(2000, 5, 15), 41);
    expect(result.getFullYear()).toBe(2041);
    expect(result.getMonth() + 1).toBe(6);
    expect(result.getDate()).toBe(15);
  });
  it('addYears 2000-06-15 plus 42 years yields 2042', () => {
    const result = addYears(new Date(2000, 5, 15), 42);
    expect(result.getFullYear()).toBe(2042);
    expect(result.getMonth() + 1).toBe(6);
    expect(result.getDate()).toBe(15);
  });
  it('addYears 2000-06-15 plus 43 years yields 2043', () => {
    const result = addYears(new Date(2000, 5, 15), 43);
    expect(result.getFullYear()).toBe(2043);
    expect(result.getMonth() + 1).toBe(6);
    expect(result.getDate()).toBe(15);
  });
  it('addYears 2000-06-15 plus 44 years yields 2044', () => {
    const result = addYears(new Date(2000, 5, 15), 44);
    expect(result.getFullYear()).toBe(2044);
    expect(result.getMonth() + 1).toBe(6);
    expect(result.getDate()).toBe(15);
  });
  it('addYears 2000-06-15 plus 45 years yields 2045', () => {
    const result = addYears(new Date(2000, 5, 15), 45);
    expect(result.getFullYear()).toBe(2045);
    expect(result.getMonth() + 1).toBe(6);
    expect(result.getDate()).toBe(15);
  });
  it('addYears 2000-06-15 plus 46 years yields 2046', () => {
    const result = addYears(new Date(2000, 5, 15), 46);
    expect(result.getFullYear()).toBe(2046);
    expect(result.getMonth() + 1).toBe(6);
    expect(result.getDate()).toBe(15);
  });
  it('addYears 2000-06-15 plus 47 years yields 2047', () => {
    const result = addYears(new Date(2000, 5, 15), 47);
    expect(result.getFullYear()).toBe(2047);
    expect(result.getMonth() + 1).toBe(6);
    expect(result.getDate()).toBe(15);
  });
  it('addYears 2000-06-15 plus 48 years yields 2048', () => {
    const result = addYears(new Date(2000, 5, 15), 48);
    expect(result.getFullYear()).toBe(2048);
    expect(result.getMonth() + 1).toBe(6);
    expect(result.getDate()).toBe(15);
  });
  it('addYears 2000-06-15 plus 49 years yields 2049', () => {
    const result = addYears(new Date(2000, 5, 15), 49);
    expect(result.getFullYear()).toBe(2049);
    expect(result.getMonth() + 1).toBe(6);
    expect(result.getDate()).toBe(15);
  });
  it('addYears 2000-06-15 plus 50 years yields 2050', () => {
    const result = addYears(new Date(2000, 5, 15), 50);
    expect(result.getFullYear()).toBe(2050);
    expect(result.getMonth() + 1).toBe(6);
    expect(result.getDate()).toBe(15);
  });
});

describe('subDays and subMonths', () => {
  it('subDays 2026-12-31 minus 1', () => {
    const result = subDays(new Date(2026, 11, 31), 1);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(12);
    expect(result.getDate()).toBe(30);
  });
  it('subDays 2026-12-31 minus 2', () => {
    const result = subDays(new Date(2026, 11, 31), 2);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(12);
    expect(result.getDate()).toBe(29);
  });
  it('subDays 2026-12-31 minus 3', () => {
    const result = subDays(new Date(2026, 11, 31), 3);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(12);
    expect(result.getDate()).toBe(28);
  });
  it('subDays 2026-12-31 minus 4', () => {
    const result = subDays(new Date(2026, 11, 31), 4);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(12);
    expect(result.getDate()).toBe(27);
  });
  it('subDays 2026-12-31 minus 5', () => {
    const result = subDays(new Date(2026, 11, 31), 5);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(12);
    expect(result.getDate()).toBe(26);
  });
  it('subDays 2026-12-31 minus 6', () => {
    const result = subDays(new Date(2026, 11, 31), 6);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(12);
    expect(result.getDate()).toBe(25);
  });
  it('subDays 2026-12-31 minus 7', () => {
    const result = subDays(new Date(2026, 11, 31), 7);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(12);
    expect(result.getDate()).toBe(24);
  });
  it('subDays 2026-12-31 minus 8', () => {
    const result = subDays(new Date(2026, 11, 31), 8);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(12);
    expect(result.getDate()).toBe(23);
  });
  it('subDays 2026-12-31 minus 9', () => {
    const result = subDays(new Date(2026, 11, 31), 9);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(12);
    expect(result.getDate()).toBe(22);
  });
  it('subDays 2026-12-31 minus 10', () => {
    const result = subDays(new Date(2026, 11, 31), 10);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(12);
    expect(result.getDate()).toBe(21);
  });
  it('subDays 2026-12-31 minus 11', () => {
    const result = subDays(new Date(2026, 11, 31), 11);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(12);
    expect(result.getDate()).toBe(20);
  });
  it('subDays 2026-12-31 minus 12', () => {
    const result = subDays(new Date(2026, 11, 31), 12);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(12);
    expect(result.getDate()).toBe(19);
  });
  it('subDays 2026-12-31 minus 13', () => {
    const result = subDays(new Date(2026, 11, 31), 13);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(12);
    expect(result.getDate()).toBe(18);
  });
  it('subDays 2026-12-31 minus 14', () => {
    const result = subDays(new Date(2026, 11, 31), 14);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(12);
    expect(result.getDate()).toBe(17);
  });
  it('subDays 2026-12-31 minus 15', () => {
    const result = subDays(new Date(2026, 11, 31), 15);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(12);
    expect(result.getDate()).toBe(16);
  });
  it('subDays 2026-12-31 minus 16', () => {
    const result = subDays(new Date(2026, 11, 31), 16);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(12);
    expect(result.getDate()).toBe(15);
  });
  it('subDays 2026-12-31 minus 17', () => {
    const result = subDays(new Date(2026, 11, 31), 17);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(12);
    expect(result.getDate()).toBe(14);
  });
  it('subDays 2026-12-31 minus 18', () => {
    const result = subDays(new Date(2026, 11, 31), 18);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(12);
    expect(result.getDate()).toBe(13);
  });
  it('subDays 2026-12-31 minus 19', () => {
    const result = subDays(new Date(2026, 11, 31), 19);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(12);
    expect(result.getDate()).toBe(12);
  });
  it('subDays 2026-12-31 minus 20', () => {
    const result = subDays(new Date(2026, 11, 31), 20);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(12);
    expect(result.getDate()).toBe(11);
  });
  it('subDays 2026-12-31 minus 21', () => {
    const result = subDays(new Date(2026, 11, 31), 21);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(12);
    expect(result.getDate()).toBe(10);
  });
  it('subDays 2026-12-31 minus 22', () => {
    const result = subDays(new Date(2026, 11, 31), 22);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(12);
    expect(result.getDate()).toBe(9);
  });
  it('subDays 2026-12-31 minus 23', () => {
    const result = subDays(new Date(2026, 11, 31), 23);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(12);
    expect(result.getDate()).toBe(8);
  });
  it('subDays 2026-12-31 minus 24', () => {
    const result = subDays(new Date(2026, 11, 31), 24);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(12);
    expect(result.getDate()).toBe(7);
  });
  it('subDays 2026-12-31 minus 25', () => {
    const result = subDays(new Date(2026, 11, 31), 25);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(12);
    expect(result.getDate()).toBe(6);
  });
  it('subDays 2026-12-31 minus 26', () => {
    const result = subDays(new Date(2026, 11, 31), 26);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(12);
    expect(result.getDate()).toBe(5);
  });
  it('subDays 2026-12-31 minus 27', () => {
    const result = subDays(new Date(2026, 11, 31), 27);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(12);
    expect(result.getDate()).toBe(4);
  });
  it('subDays 2026-12-31 minus 28', () => {
    const result = subDays(new Date(2026, 11, 31), 28);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(12);
    expect(result.getDate()).toBe(3);
  });
  it('subDays 2026-12-31 minus 29', () => {
    const result = subDays(new Date(2026, 11, 31), 29);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(12);
    expect(result.getDate()).toBe(2);
  });
  it('subDays 2026-12-31 minus 30', () => {
    const result = subDays(new Date(2026, 11, 31), 30);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(12);
    expect(result.getDate()).toBe(1);
  });
  it('subDays 2026-12-31 minus 31', () => {
    const result = subDays(new Date(2026, 11, 31), 31);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(11);
    expect(result.getDate()).toBe(30);
  });
  it('subDays 2026-12-31 minus 32', () => {
    const result = subDays(new Date(2026, 11, 31), 32);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(11);
    expect(result.getDate()).toBe(29);
  });
  it('subDays 2026-12-31 minus 33', () => {
    const result = subDays(new Date(2026, 11, 31), 33);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(11);
    expect(result.getDate()).toBe(28);
  });
  it('subDays 2026-12-31 minus 34', () => {
    const result = subDays(new Date(2026, 11, 31), 34);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(11);
    expect(result.getDate()).toBe(27);
  });
  it('subDays 2026-12-31 minus 35', () => {
    const result = subDays(new Date(2026, 11, 31), 35);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(11);
    expect(result.getDate()).toBe(26);
  });
  it('subDays 2026-12-31 minus 36', () => {
    const result = subDays(new Date(2026, 11, 31), 36);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(11);
    expect(result.getDate()).toBe(25);
  });
  it('subDays 2026-12-31 minus 37', () => {
    const result = subDays(new Date(2026, 11, 31), 37);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(11);
    expect(result.getDate()).toBe(24);
  });
  it('subDays 2026-12-31 minus 38', () => {
    const result = subDays(new Date(2026, 11, 31), 38);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(11);
    expect(result.getDate()).toBe(23);
  });
  it('subDays 2026-12-31 minus 39', () => {
    const result = subDays(new Date(2026, 11, 31), 39);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(11);
    expect(result.getDate()).toBe(22);
  });
  it('subDays 2026-12-31 minus 40', () => {
    const result = subDays(new Date(2026, 11, 31), 40);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(11);
    expect(result.getDate()).toBe(21);
  });
  it('subDays 2026-12-31 minus 41', () => {
    const result = subDays(new Date(2026, 11, 31), 41);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(11);
    expect(result.getDate()).toBe(20);
  });
  it('subDays 2026-12-31 minus 42', () => {
    const result = subDays(new Date(2026, 11, 31), 42);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(11);
    expect(result.getDate()).toBe(19);
  });
  it('subDays 2026-12-31 minus 43', () => {
    const result = subDays(new Date(2026, 11, 31), 43);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(11);
    expect(result.getDate()).toBe(18);
  });
  it('subDays 2026-12-31 minus 44', () => {
    const result = subDays(new Date(2026, 11, 31), 44);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(11);
    expect(result.getDate()).toBe(17);
  });
  it('subDays 2026-12-31 minus 45', () => {
    const result = subDays(new Date(2026, 11, 31), 45);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(11);
    expect(result.getDate()).toBe(16);
  });
  it('subDays 2026-12-31 minus 46', () => {
    const result = subDays(new Date(2026, 11, 31), 46);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(11);
    expect(result.getDate()).toBe(15);
  });
  it('subDays 2026-12-31 minus 47', () => {
    const result = subDays(new Date(2026, 11, 31), 47);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(11);
    expect(result.getDate()).toBe(14);
  });
  it('subDays 2026-12-31 minus 48', () => {
    const result = subDays(new Date(2026, 11, 31), 48);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(11);
    expect(result.getDate()).toBe(13);
  });
  it('subDays 2026-12-31 minus 49', () => {
    const result = subDays(new Date(2026, 11, 31), 49);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(11);
    expect(result.getDate()).toBe(12);
  });
  it('subDays 2026-12-31 minus 50', () => {
    const result = subDays(new Date(2026, 11, 31), 50);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(11);
    expect(result.getDate()).toBe(11);
  });
  it('subMonths 2026-12-01 minus 1 months yields 2026-11', () => {
    const result = subMonths(new Date(2026, 11, 1), 1);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(11);
  });
  it('subMonths 2026-12-01 minus 2 months yields 2026-10', () => {
    const result = subMonths(new Date(2026, 11, 1), 2);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(10);
  });
  it('subMonths 2026-12-01 minus 3 months yields 2026-09', () => {
    const result = subMonths(new Date(2026, 11, 1), 3);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(9);
  });
  it('subMonths 2026-12-01 minus 4 months yields 2026-08', () => {
    const result = subMonths(new Date(2026, 11, 1), 4);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(8);
  });
  it('subMonths 2026-12-01 minus 5 months yields 2026-07', () => {
    const result = subMonths(new Date(2026, 11, 1), 5);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(7);
  });
  it('subMonths 2026-12-01 minus 6 months yields 2026-06', () => {
    const result = subMonths(new Date(2026, 11, 1), 6);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(6);
  });
  it('subMonths 2026-12-01 minus 7 months yields 2026-05', () => {
    const result = subMonths(new Date(2026, 11, 1), 7);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(5);
  });
  it('subMonths 2026-12-01 minus 8 months yields 2026-04', () => {
    const result = subMonths(new Date(2026, 11, 1), 8);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(4);
  });
  it('subMonths 2026-12-01 minus 9 months yields 2026-03', () => {
    const result = subMonths(new Date(2026, 11, 1), 9);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(3);
  });
  it('subMonths 2026-12-01 minus 10 months yields 2026-02', () => {
    const result = subMonths(new Date(2026, 11, 1), 10);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(2);
  });
  it('subMonths 2026-12-01 minus 11 months yields 2026-01', () => {
    const result = subMonths(new Date(2026, 11, 1), 11);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(1);
  });
  it('subMonths 2026-12-01 minus 12 months yields 2025-12', () => {
    const result = subMonths(new Date(2026, 11, 1), 12);
    expect(result.getFullYear()).toBe(2025);
    expect(result.getMonth() + 1).toBe(12);
  });
  it('subMonths 2026-12-01 minus 13 months yields 2025-11', () => {
    const result = subMonths(new Date(2026, 11, 1), 13);
    expect(result.getFullYear()).toBe(2025);
    expect(result.getMonth() + 1).toBe(11);
  });
  it('subMonths 2026-12-01 minus 14 months yields 2025-10', () => {
    const result = subMonths(new Date(2026, 11, 1), 14);
    expect(result.getFullYear()).toBe(2025);
    expect(result.getMonth() + 1).toBe(10);
  });
  it('subMonths 2026-12-01 minus 15 months yields 2025-09', () => {
    const result = subMonths(new Date(2026, 11, 1), 15);
    expect(result.getFullYear()).toBe(2025);
    expect(result.getMonth() + 1).toBe(9);
  });
  it('subMonths 2026-12-01 minus 16 months yields 2025-08', () => {
    const result = subMonths(new Date(2026, 11, 1), 16);
    expect(result.getFullYear()).toBe(2025);
    expect(result.getMonth() + 1).toBe(8);
  });
  it('subMonths 2026-12-01 minus 17 months yields 2025-07', () => {
    const result = subMonths(new Date(2026, 11, 1), 17);
    expect(result.getFullYear()).toBe(2025);
    expect(result.getMonth() + 1).toBe(7);
  });
  it('subMonths 2026-12-01 minus 18 months yields 2025-06', () => {
    const result = subMonths(new Date(2026, 11, 1), 18);
    expect(result.getFullYear()).toBe(2025);
    expect(result.getMonth() + 1).toBe(6);
  });
  it('subMonths 2026-12-01 minus 19 months yields 2025-05', () => {
    const result = subMonths(new Date(2026, 11, 1), 19);
    expect(result.getFullYear()).toBe(2025);
    expect(result.getMonth() + 1).toBe(5);
  });
  it('subMonths 2026-12-01 minus 20 months yields 2025-04', () => {
    const result = subMonths(new Date(2026, 11, 1), 20);
    expect(result.getFullYear()).toBe(2025);
    expect(result.getMonth() + 1).toBe(4);
  });
  it('subMonths 2026-12-01 minus 21 months yields 2025-03', () => {
    const result = subMonths(new Date(2026, 11, 1), 21);
    expect(result.getFullYear()).toBe(2025);
    expect(result.getMonth() + 1).toBe(3);
  });
  it('subMonths 2026-12-01 minus 22 months yields 2025-02', () => {
    const result = subMonths(new Date(2026, 11, 1), 22);
    expect(result.getFullYear()).toBe(2025);
    expect(result.getMonth() + 1).toBe(2);
  });
  it('subMonths 2026-12-01 minus 23 months yields 2025-01', () => {
    const result = subMonths(new Date(2026, 11, 1), 23);
    expect(result.getFullYear()).toBe(2025);
    expect(result.getMonth() + 1).toBe(1);
  });
  it('subMonths 2026-12-01 minus 24 months yields 2024-12', () => {
    const result = subMonths(new Date(2026, 11, 1), 24);
    expect(result.getFullYear()).toBe(2024);
    expect(result.getMonth() + 1).toBe(12);
  });
  it('subMonths 2026-12-01 minus 25 months yields 2024-11', () => {
    const result = subMonths(new Date(2026, 11, 1), 25);
    expect(result.getFullYear()).toBe(2024);
    expect(result.getMonth() + 1).toBe(11);
  });
  it('subMonths 2026-12-01 minus 26 months yields 2024-10', () => {
    const result = subMonths(new Date(2026, 11, 1), 26);
    expect(result.getFullYear()).toBe(2024);
    expect(result.getMonth() + 1).toBe(10);
  });
  it('subMonths 2026-12-01 minus 27 months yields 2024-09', () => {
    const result = subMonths(new Date(2026, 11, 1), 27);
    expect(result.getFullYear()).toBe(2024);
    expect(result.getMonth() + 1).toBe(9);
  });
  it('subMonths 2026-12-01 minus 28 months yields 2024-08', () => {
    const result = subMonths(new Date(2026, 11, 1), 28);
    expect(result.getFullYear()).toBe(2024);
    expect(result.getMonth() + 1).toBe(8);
  });
  it('subMonths 2026-12-01 minus 29 months yields 2024-07', () => {
    const result = subMonths(new Date(2026, 11, 1), 29);
    expect(result.getFullYear()).toBe(2024);
    expect(result.getMonth() + 1).toBe(7);
  });
  it('subMonths 2026-12-01 minus 30 months yields 2024-06', () => {
    const result = subMonths(new Date(2026, 11, 1), 30);
    expect(result.getFullYear()).toBe(2024);
    expect(result.getMonth() + 1).toBe(6);
  });
  it('subMonths 2026-12-01 minus 31 months yields 2024-05', () => {
    const result = subMonths(new Date(2026, 11, 1), 31);
    expect(result.getFullYear()).toBe(2024);
    expect(result.getMonth() + 1).toBe(5);
  });
  it('subMonths 2026-12-01 minus 32 months yields 2024-04', () => {
    const result = subMonths(new Date(2026, 11, 1), 32);
    expect(result.getFullYear()).toBe(2024);
    expect(result.getMonth() + 1).toBe(4);
  });
  it('subMonths 2026-12-01 minus 33 months yields 2024-03', () => {
    const result = subMonths(new Date(2026, 11, 1), 33);
    expect(result.getFullYear()).toBe(2024);
    expect(result.getMonth() + 1).toBe(3);
  });
  it('subMonths 2026-12-01 minus 34 months yields 2024-02', () => {
    const result = subMonths(new Date(2026, 11, 1), 34);
    expect(result.getFullYear()).toBe(2024);
    expect(result.getMonth() + 1).toBe(2);
  });
  it('subMonths 2026-12-01 minus 35 months yields 2024-01', () => {
    const result = subMonths(new Date(2026, 11, 1), 35);
    expect(result.getFullYear()).toBe(2024);
    expect(result.getMonth() + 1).toBe(1);
  });
  it('subMonths 2026-12-01 minus 36 months yields 2023-12', () => {
    const result = subMonths(new Date(2026, 11, 1), 36);
    expect(result.getFullYear()).toBe(2023);
    expect(result.getMonth() + 1).toBe(12);
  });
  it('subMonths 2026-12-01 minus 37 months yields 2023-11', () => {
    const result = subMonths(new Date(2026, 11, 1), 37);
    expect(result.getFullYear()).toBe(2023);
    expect(result.getMonth() + 1).toBe(11);
  });
  it('subMonths 2026-12-01 minus 38 months yields 2023-10', () => {
    const result = subMonths(new Date(2026, 11, 1), 38);
    expect(result.getFullYear()).toBe(2023);
    expect(result.getMonth() + 1).toBe(10);
  });
  it('subMonths 2026-12-01 minus 39 months yields 2023-09', () => {
    const result = subMonths(new Date(2026, 11, 1), 39);
    expect(result.getFullYear()).toBe(2023);
    expect(result.getMonth() + 1).toBe(9);
  });
  it('subMonths 2026-12-01 minus 40 months yields 2023-08', () => {
    const result = subMonths(new Date(2026, 11, 1), 40);
    expect(result.getFullYear()).toBe(2023);
    expect(result.getMonth() + 1).toBe(8);
  });
  it('subMonths 2026-12-01 minus 41 months yields 2023-07', () => {
    const result = subMonths(new Date(2026, 11, 1), 41);
    expect(result.getFullYear()).toBe(2023);
    expect(result.getMonth() + 1).toBe(7);
  });
  it('subMonths 2026-12-01 minus 42 months yields 2023-06', () => {
    const result = subMonths(new Date(2026, 11, 1), 42);
    expect(result.getFullYear()).toBe(2023);
    expect(result.getMonth() + 1).toBe(6);
  });
  it('subMonths 2026-12-01 minus 43 months yields 2023-05', () => {
    const result = subMonths(new Date(2026, 11, 1), 43);
    expect(result.getFullYear()).toBe(2023);
    expect(result.getMonth() + 1).toBe(5);
  });
  it('subMonths 2026-12-01 minus 44 months yields 2023-04', () => {
    const result = subMonths(new Date(2026, 11, 1), 44);
    expect(result.getFullYear()).toBe(2023);
    expect(result.getMonth() + 1).toBe(4);
  });
  it('subMonths 2026-12-01 minus 45 months yields 2023-03', () => {
    const result = subMonths(new Date(2026, 11, 1), 45);
    expect(result.getFullYear()).toBe(2023);
    expect(result.getMonth() + 1).toBe(3);
  });
  it('subMonths 2026-12-01 minus 46 months yields 2023-02', () => {
    const result = subMonths(new Date(2026, 11, 1), 46);
    expect(result.getFullYear()).toBe(2023);
    expect(result.getMonth() + 1).toBe(2);
  });
  it('subMonths 2026-12-01 minus 47 months yields 2023-01', () => {
    const result = subMonths(new Date(2026, 11, 1), 47);
    expect(result.getFullYear()).toBe(2023);
    expect(result.getMonth() + 1).toBe(1);
  });
  it('subMonths 2026-12-01 minus 48 months yields 2022-12', () => {
    const result = subMonths(new Date(2026, 11, 1), 48);
    expect(result.getFullYear()).toBe(2022);
    expect(result.getMonth() + 1).toBe(12);
  });
  it('subMonths 2026-12-01 minus 49 months yields 2022-11', () => {
    const result = subMonths(new Date(2026, 11, 1), 49);
    expect(result.getFullYear()).toBe(2022);
    expect(result.getMonth() + 1).toBe(11);
  });
  it('subMonths 2026-12-01 minus 50 months yields 2022-10', () => {
    const result = subMonths(new Date(2026, 11, 1), 50);
    expect(result.getFullYear()).toBe(2022);
    expect(result.getMonth() + 1).toBe(10);
  });
});

describe('diffDays', () => {
  it('diffDays 2024-01-01 and 2024-01-01 plus 0 days is 0', () => {
    const a = new Date(2024, 0, 1);
    const b = new Date(2024, 0, 1);
    expect(diffDays(a, b)).toBe(0);
    expect(diffDays(b, a)).toBe(0);
  });
  it('diffDays 2024-01-01 and 2024-01-01 plus 1 days is 1', () => {
    const a = new Date(2024, 0, 1);
    const b = new Date(2024, 0, 2);
    expect(diffDays(a, b)).toBe(1);
    expect(diffDays(b, a)).toBe(1);
  });
  it('diffDays 2024-01-01 and 2024-01-01 plus 2 days is 2', () => {
    const a = new Date(2024, 0, 1);
    const b = new Date(2024, 0, 3);
    expect(diffDays(a, b)).toBe(2);
    expect(diffDays(b, a)).toBe(2);
  });
  it('diffDays 2024-01-01 and 2024-01-01 plus 3 days is 3', () => {
    const a = new Date(2024, 0, 1);
    const b = new Date(2024, 0, 4);
    expect(diffDays(a, b)).toBe(3);
    expect(diffDays(b, a)).toBe(3);
  });
  it('diffDays 2024-01-01 and 2024-01-01 plus 4 days is 4', () => {
    const a = new Date(2024, 0, 1);
    const b = new Date(2024, 0, 5);
    expect(diffDays(a, b)).toBe(4);
    expect(diffDays(b, a)).toBe(4);
  });
  it('diffDays 2024-01-01 and 2024-01-01 plus 5 days is 5', () => {
    const a = new Date(2024, 0, 1);
    const b = new Date(2024, 0, 6);
    expect(diffDays(a, b)).toBe(5);
    expect(diffDays(b, a)).toBe(5);
  });
  it('diffDays 2024-01-01 and 2024-01-01 plus 6 days is 6', () => {
    const a = new Date(2024, 0, 1);
    const b = new Date(2024, 0, 7);
    expect(diffDays(a, b)).toBe(6);
    expect(diffDays(b, a)).toBe(6);
  });
  it('diffDays 2024-01-01 and 2024-01-01 plus 7 days is 7', () => {
    const a = new Date(2024, 0, 1);
    const b = new Date(2024, 0, 8);
    expect(diffDays(a, b)).toBe(7);
    expect(diffDays(b, a)).toBe(7);
  });
  it('diffDays 2024-01-01 and 2024-01-01 plus 8 days is 8', () => {
    const a = new Date(2024, 0, 1);
    const b = new Date(2024, 0, 9);
    expect(diffDays(a, b)).toBe(8);
    expect(diffDays(b, a)).toBe(8);
  });
  it('diffDays 2024-01-01 and 2024-01-01 plus 9 days is 9', () => {
    const a = new Date(2024, 0, 1);
    const b = new Date(2024, 0, 10);
    expect(diffDays(a, b)).toBe(9);
    expect(diffDays(b, a)).toBe(9);
  });
  it('diffDays 2024-01-01 and 2024-01-01 plus 10 days is 10', () => {
    const a = new Date(2024, 0, 1);
    const b = new Date(2024, 0, 11);
    expect(diffDays(a, b)).toBe(10);
    expect(diffDays(b, a)).toBe(10);
  });
  it('diffDays 2024-01-01 and 2024-01-01 plus 11 days is 11', () => {
    const a = new Date(2024, 0, 1);
    const b = new Date(2024, 0, 12);
    expect(diffDays(a, b)).toBe(11);
    expect(diffDays(b, a)).toBe(11);
  });
  it('diffDays 2024-01-01 and 2024-01-01 plus 12 days is 12', () => {
    const a = new Date(2024, 0, 1);
    const b = new Date(2024, 0, 13);
    expect(diffDays(a, b)).toBe(12);
    expect(diffDays(b, a)).toBe(12);
  });
  it('diffDays 2024-01-01 and 2024-01-01 plus 13 days is 13', () => {
    const a = new Date(2024, 0, 1);
    const b = new Date(2024, 0, 14);
    expect(diffDays(a, b)).toBe(13);
    expect(diffDays(b, a)).toBe(13);
  });
  it('diffDays 2024-01-01 and 2024-01-01 plus 14 days is 14', () => {
    const a = new Date(2024, 0, 1);
    const b = new Date(2024, 0, 15);
    expect(diffDays(a, b)).toBe(14);
    expect(diffDays(b, a)).toBe(14);
  });
  it('diffDays 2024-01-01 and 2024-01-01 plus 15 days is 15', () => {
    const a = new Date(2024, 0, 1);
    const b = new Date(2024, 0, 16);
    expect(diffDays(a, b)).toBe(15);
    expect(diffDays(b, a)).toBe(15);
  });
  it('diffDays 2024-01-01 and 2024-01-01 plus 16 days is 16', () => {
    const a = new Date(2024, 0, 1);
    const b = new Date(2024, 0, 17);
    expect(diffDays(a, b)).toBe(16);
    expect(diffDays(b, a)).toBe(16);
  });
  it('diffDays 2024-01-01 and 2024-01-01 plus 17 days is 17', () => {
    const a = new Date(2024, 0, 1);
    const b = new Date(2024, 0, 18);
    expect(diffDays(a, b)).toBe(17);
    expect(diffDays(b, a)).toBe(17);
  });
  it('diffDays 2024-01-01 and 2024-01-01 plus 18 days is 18', () => {
    const a = new Date(2024, 0, 1);
    const b = new Date(2024, 0, 19);
    expect(diffDays(a, b)).toBe(18);
    expect(diffDays(b, a)).toBe(18);
  });
  it('diffDays 2024-01-01 and 2024-01-01 plus 19 days is 19', () => {
    const a = new Date(2024, 0, 1);
    const b = new Date(2024, 0, 20);
    expect(diffDays(a, b)).toBe(19);
    expect(diffDays(b, a)).toBe(19);
  });
  it('diffDays 2024-01-01 and 2024-01-01 plus 20 days is 20', () => {
    const a = new Date(2024, 0, 1);
    const b = new Date(2024, 0, 21);
    expect(diffDays(a, b)).toBe(20);
    expect(diffDays(b, a)).toBe(20);
  });
  it('diffDays 2024-01-01 and 2024-01-01 plus 21 days is 21', () => {
    const a = new Date(2024, 0, 1);
    const b = new Date(2024, 0, 22);
    expect(diffDays(a, b)).toBe(21);
    expect(diffDays(b, a)).toBe(21);
  });
  it('diffDays 2024-01-01 and 2024-01-01 plus 22 days is 22', () => {
    const a = new Date(2024, 0, 1);
    const b = new Date(2024, 0, 23);
    expect(diffDays(a, b)).toBe(22);
    expect(diffDays(b, a)).toBe(22);
  });
  it('diffDays 2024-01-01 and 2024-01-01 plus 23 days is 23', () => {
    const a = new Date(2024, 0, 1);
    const b = new Date(2024, 0, 24);
    expect(diffDays(a, b)).toBe(23);
    expect(diffDays(b, a)).toBe(23);
  });
  it('diffDays 2024-01-01 and 2024-01-01 plus 24 days is 24', () => {
    const a = new Date(2024, 0, 1);
    const b = new Date(2024, 0, 25);
    expect(diffDays(a, b)).toBe(24);
    expect(diffDays(b, a)).toBe(24);
  });
  it('diffDays 2024-01-01 and 2024-01-01 plus 25 days is 25', () => {
    const a = new Date(2024, 0, 1);
    const b = new Date(2024, 0, 26);
    expect(diffDays(a, b)).toBe(25);
    expect(diffDays(b, a)).toBe(25);
  });
  it('diffDays 2024-01-01 and 2024-01-01 plus 26 days is 26', () => {
    const a = new Date(2024, 0, 1);
    const b = new Date(2024, 0, 27);
    expect(diffDays(a, b)).toBe(26);
    expect(diffDays(b, a)).toBe(26);
  });
  it('diffDays 2024-01-01 and 2024-01-01 plus 27 days is 27', () => {
    const a = new Date(2024, 0, 1);
    const b = new Date(2024, 0, 28);
    expect(diffDays(a, b)).toBe(27);
    expect(diffDays(b, a)).toBe(27);
  });
  it('diffDays 2024-01-01 and 2024-01-01 plus 28 days is 28', () => {
    const a = new Date(2024, 0, 1);
    const b = new Date(2024, 0, 29);
    expect(diffDays(a, b)).toBe(28);
    expect(diffDays(b, a)).toBe(28);
  });
  it('diffDays 2024-01-01 and 2024-01-01 plus 29 days is 29', () => {
    const a = new Date(2024, 0, 1);
    const b = new Date(2024, 0, 30);
    expect(diffDays(a, b)).toBe(29);
    expect(diffDays(b, a)).toBe(29);
  });
  it('diffDays 2024-01-01 and 2024-01-01 plus 30 days is 30', () => {
    const a = new Date(2024, 0, 1);
    const b = new Date(2024, 0, 31);
    expect(diffDays(a, b)).toBe(30);
    expect(diffDays(b, a)).toBe(30);
  });
  it('diffDays 2024-01-01 and 2024-01-01 plus 31 days is 31', () => {
    const a = new Date(2024, 0, 1);
    const b = new Date(2024, 1, 1);
    expect(diffDays(a, b)).toBe(31);
    expect(diffDays(b, a)).toBe(31);
  });
  it('diffDays 2024-01-01 and 2024-01-01 plus 32 days is 32', () => {
    const a = new Date(2024, 0, 1);
    const b = new Date(2024, 1, 2);
    expect(diffDays(a, b)).toBe(32);
    expect(diffDays(b, a)).toBe(32);
  });
  it('diffDays 2024-01-01 and 2024-01-01 plus 33 days is 33', () => {
    const a = new Date(2024, 0, 1);
    const b = new Date(2024, 1, 3);
    expect(diffDays(a, b)).toBe(33);
    expect(diffDays(b, a)).toBe(33);
  });
  it('diffDays 2024-01-01 and 2024-01-01 plus 34 days is 34', () => {
    const a = new Date(2024, 0, 1);
    const b = new Date(2024, 1, 4);
    expect(diffDays(a, b)).toBe(34);
    expect(diffDays(b, a)).toBe(34);
  });
  it('diffDays 2024-01-01 and 2024-01-01 plus 35 days is 35', () => {
    const a = new Date(2024, 0, 1);
    const b = new Date(2024, 1, 5);
    expect(diffDays(a, b)).toBe(35);
    expect(diffDays(b, a)).toBe(35);
  });
  it('diffDays 2024-01-01 and 2024-01-01 plus 36 days is 36', () => {
    const a = new Date(2024, 0, 1);
    const b = new Date(2024, 1, 6);
    expect(diffDays(a, b)).toBe(36);
    expect(diffDays(b, a)).toBe(36);
  });
  it('diffDays 2024-01-01 and 2024-01-01 plus 37 days is 37', () => {
    const a = new Date(2024, 0, 1);
    const b = new Date(2024, 1, 7);
    expect(diffDays(a, b)).toBe(37);
    expect(diffDays(b, a)).toBe(37);
  });
  it('diffDays 2024-01-01 and 2024-01-01 plus 38 days is 38', () => {
    const a = new Date(2024, 0, 1);
    const b = new Date(2024, 1, 8);
    expect(diffDays(a, b)).toBe(38);
    expect(diffDays(b, a)).toBe(38);
  });
  it('diffDays 2024-01-01 and 2024-01-01 plus 39 days is 39', () => {
    const a = new Date(2024, 0, 1);
    const b = new Date(2024, 1, 9);
    expect(diffDays(a, b)).toBe(39);
    expect(diffDays(b, a)).toBe(39);
  });
  it('diffDays 2024-01-01 and 2024-01-01 plus 40 days is 40', () => {
    const a = new Date(2024, 0, 1);
    const b = new Date(2024, 1, 10);
    expect(diffDays(a, b)).toBe(40);
    expect(diffDays(b, a)).toBe(40);
  });
  it('diffDays 2024-01-01 and 2024-01-01 plus 41 days is 41', () => {
    const a = new Date(2024, 0, 1);
    const b = new Date(2024, 1, 11);
    expect(diffDays(a, b)).toBe(41);
    expect(diffDays(b, a)).toBe(41);
  });
  it('diffDays 2024-01-01 and 2024-01-01 plus 42 days is 42', () => {
    const a = new Date(2024, 0, 1);
    const b = new Date(2024, 1, 12);
    expect(diffDays(a, b)).toBe(42);
    expect(diffDays(b, a)).toBe(42);
  });
  it('diffDays 2024-01-01 and 2024-01-01 plus 43 days is 43', () => {
    const a = new Date(2024, 0, 1);
    const b = new Date(2024, 1, 13);
    expect(diffDays(a, b)).toBe(43);
    expect(diffDays(b, a)).toBe(43);
  });
  it('diffDays 2024-01-01 and 2024-01-01 plus 44 days is 44', () => {
    const a = new Date(2024, 0, 1);
    const b = new Date(2024, 1, 14);
    expect(diffDays(a, b)).toBe(44);
    expect(diffDays(b, a)).toBe(44);
  });
  it('diffDays 2024-01-01 and 2024-01-01 plus 45 days is 45', () => {
    const a = new Date(2024, 0, 1);
    const b = new Date(2024, 1, 15);
    expect(diffDays(a, b)).toBe(45);
    expect(diffDays(b, a)).toBe(45);
  });
  it('diffDays 2024-01-01 and 2024-01-01 plus 46 days is 46', () => {
    const a = new Date(2024, 0, 1);
    const b = new Date(2024, 1, 16);
    expect(diffDays(a, b)).toBe(46);
    expect(diffDays(b, a)).toBe(46);
  });
  it('diffDays 2024-01-01 and 2024-01-01 plus 47 days is 47', () => {
    const a = new Date(2024, 0, 1);
    const b = new Date(2024, 1, 17);
    expect(diffDays(a, b)).toBe(47);
    expect(diffDays(b, a)).toBe(47);
  });
  it('diffDays 2024-01-01 and 2024-01-01 plus 48 days is 48', () => {
    const a = new Date(2024, 0, 1);
    const b = new Date(2024, 1, 18);
    expect(diffDays(a, b)).toBe(48);
    expect(diffDays(b, a)).toBe(48);
  });
  it('diffDays 2024-01-01 and 2024-01-01 plus 49 days is 49', () => {
    const a = new Date(2024, 0, 1);
    const b = new Date(2024, 1, 19);
    expect(diffDays(a, b)).toBe(49);
    expect(diffDays(b, a)).toBe(49);
  });
  it('diffDays 2024-01-01 and 2024-01-01 plus 50 days is 50', () => {
    const a = new Date(2024, 0, 1);
    const b = new Date(2024, 1, 20);
    expect(diffDays(a, b)).toBe(50);
    expect(diffDays(b, a)).toBe(50);
  });
  it('diffDays 2024-01-01 and 2024-01-01 plus 51 days is 51', () => {
    const a = new Date(2024, 0, 1);
    const b = new Date(2024, 1, 21);
    expect(diffDays(a, b)).toBe(51);
    expect(diffDays(b, a)).toBe(51);
  });
  it('diffDays 2024-01-01 and 2024-01-01 plus 52 days is 52', () => {
    const a = new Date(2024, 0, 1);
    const b = new Date(2024, 1, 22);
    expect(diffDays(a, b)).toBe(52);
    expect(diffDays(b, a)).toBe(52);
  });
  it('diffDays 2024-01-01 and 2024-01-01 plus 53 days is 53', () => {
    const a = new Date(2024, 0, 1);
    const b = new Date(2024, 1, 23);
    expect(diffDays(a, b)).toBe(53);
    expect(diffDays(b, a)).toBe(53);
  });
  it('diffDays 2024-01-01 and 2024-01-01 plus 54 days is 54', () => {
    const a = new Date(2024, 0, 1);
    const b = new Date(2024, 1, 24);
    expect(diffDays(a, b)).toBe(54);
    expect(diffDays(b, a)).toBe(54);
  });
  it('diffDays 2024-01-01 and 2024-01-01 plus 55 days is 55', () => {
    const a = new Date(2024, 0, 1);
    const b = new Date(2024, 1, 25);
    expect(diffDays(a, b)).toBe(55);
    expect(diffDays(b, a)).toBe(55);
  });
  it('diffDays 2024-01-01 and 2024-01-01 plus 56 days is 56', () => {
    const a = new Date(2024, 0, 1);
    const b = new Date(2024, 1, 26);
    expect(diffDays(a, b)).toBe(56);
    expect(diffDays(b, a)).toBe(56);
  });
  it('diffDays 2024-01-01 and 2024-01-01 plus 57 days is 57', () => {
    const a = new Date(2024, 0, 1);
    const b = new Date(2024, 1, 27);
    expect(diffDays(a, b)).toBe(57);
    expect(diffDays(b, a)).toBe(57);
  });
  it('diffDays 2024-01-01 and 2024-01-01 plus 58 days is 58', () => {
    const a = new Date(2024, 0, 1);
    const b = new Date(2024, 1, 28);
    expect(diffDays(a, b)).toBe(58);
    expect(diffDays(b, a)).toBe(58);
  });
  it('diffDays 2024-01-01 and 2024-01-01 plus 59 days is 59', () => {
    const a = new Date(2024, 0, 1);
    const b = new Date(2024, 1, 29);
    expect(diffDays(a, b)).toBe(59);
    expect(diffDays(b, a)).toBe(59);
  });
  it('diffDays 2024-01-01 and 2024-01-01 plus 60 days is 60', () => {
    const a = new Date(2024, 0, 1);
    const b = new Date(2024, 2, 1);
    expect(diffDays(a, b)).toBe(60);
    expect(diffDays(b, a)).toBe(60);
  });
  it('diffDays 2024-01-01 and 2024-01-01 plus 61 days is 61', () => {
    const a = new Date(2024, 0, 1);
    const b = new Date(2024, 2, 2);
    expect(diffDays(a, b)).toBe(61);
    expect(diffDays(b, a)).toBe(61);
  });
  it('diffDays 2024-01-01 and 2024-01-01 plus 62 days is 62', () => {
    const a = new Date(2024, 0, 1);
    const b = new Date(2024, 2, 3);
    expect(diffDays(a, b)).toBe(62);
    expect(diffDays(b, a)).toBe(62);
  });
  it('diffDays 2024-01-01 and 2024-01-01 plus 63 days is 63', () => {
    const a = new Date(2024, 0, 1);
    const b = new Date(2024, 2, 4);
    expect(diffDays(a, b)).toBe(63);
    expect(diffDays(b, a)).toBe(63);
  });
  it('diffDays 2024-01-01 and 2024-01-01 plus 64 days is 64', () => {
    const a = new Date(2024, 0, 1);
    const b = new Date(2024, 2, 5);
    expect(diffDays(a, b)).toBe(64);
    expect(diffDays(b, a)).toBe(64);
  });
  it('diffDays 2024-01-01 and 2024-01-01 plus 65 days is 65', () => {
    const a = new Date(2024, 0, 1);
    const b = new Date(2024, 2, 6);
    expect(diffDays(a, b)).toBe(65);
    expect(diffDays(b, a)).toBe(65);
  });
  it('diffDays 2024-01-01 and 2024-01-01 plus 66 days is 66', () => {
    const a = new Date(2024, 0, 1);
    const b = new Date(2024, 2, 7);
    expect(diffDays(a, b)).toBe(66);
    expect(diffDays(b, a)).toBe(66);
  });
  it('diffDays 2024-01-01 and 2024-01-01 plus 67 days is 67', () => {
    const a = new Date(2024, 0, 1);
    const b = new Date(2024, 2, 8);
    expect(diffDays(a, b)).toBe(67);
    expect(diffDays(b, a)).toBe(67);
  });
  it('diffDays 2024-01-01 and 2024-01-01 plus 68 days is 68', () => {
    const a = new Date(2024, 0, 1);
    const b = new Date(2024, 2, 9);
    expect(diffDays(a, b)).toBe(68);
    expect(diffDays(b, a)).toBe(68);
  });
  it('diffDays 2024-01-01 and 2024-01-01 plus 69 days is 69', () => {
    const a = new Date(2024, 0, 1);
    const b = new Date(2024, 2, 10);
    expect(diffDays(a, b)).toBe(69);
    expect(diffDays(b, a)).toBe(69);
  });
  it('diffDays 2024-01-01 and 2024-01-01 plus 70 days is 70', () => {
    const a = new Date(2024, 0, 1);
    const b = new Date(2024, 2, 11);
    expect(diffDays(a, b)).toBe(70);
    expect(diffDays(b, a)).toBe(70);
  });
  it('diffDays 2024-01-01 and 2024-01-01 plus 71 days is 71', () => {
    const a = new Date(2024, 0, 1);
    const b = new Date(2024, 2, 12);
    expect(diffDays(a, b)).toBe(71);
    expect(diffDays(b, a)).toBe(71);
  });
  it('diffDays 2024-01-01 and 2024-01-01 plus 72 days is 72', () => {
    const a = new Date(2024, 0, 1);
    const b = new Date(2024, 2, 13);
    expect(diffDays(a, b)).toBe(72);
    expect(diffDays(b, a)).toBe(72);
  });
  it('diffDays 2024-01-01 and 2024-01-01 plus 73 days is 73', () => {
    const a = new Date(2024, 0, 1);
    const b = new Date(2024, 2, 14);
    expect(diffDays(a, b)).toBe(73);
    expect(diffDays(b, a)).toBe(73);
  });
  it('diffDays 2024-01-01 and 2024-01-01 plus 74 days is 74', () => {
    const a = new Date(2024, 0, 1);
    const b = new Date(2024, 2, 15);
    expect(diffDays(a, b)).toBe(74);
    expect(diffDays(b, a)).toBe(74);
  });
  it('diffDays 2024-01-01 and 2024-01-01 plus 75 days is 75', () => {
    const a = new Date(2024, 0, 1);
    const b = new Date(2024, 2, 16);
    expect(diffDays(a, b)).toBe(75);
    expect(diffDays(b, a)).toBe(75);
  });
  it('diffDays 2024-01-01 and 2024-01-01 plus 76 days is 76', () => {
    const a = new Date(2024, 0, 1);
    const b = new Date(2024, 2, 17);
    expect(diffDays(a, b)).toBe(76);
    expect(diffDays(b, a)).toBe(76);
  });
  it('diffDays 2024-01-01 and 2024-01-01 plus 77 days is 77', () => {
    const a = new Date(2024, 0, 1);
    const b = new Date(2024, 2, 18);
    expect(diffDays(a, b)).toBe(77);
    expect(diffDays(b, a)).toBe(77);
  });
  it('diffDays 2024-01-01 and 2024-01-01 plus 78 days is 78', () => {
    const a = new Date(2024, 0, 1);
    const b = new Date(2024, 2, 19);
    expect(diffDays(a, b)).toBe(78);
    expect(diffDays(b, a)).toBe(78);
  });
  it('diffDays 2024-01-01 and 2024-01-01 plus 79 days is 79', () => {
    const a = new Date(2024, 0, 1);
    const b = new Date(2024, 2, 20);
    expect(diffDays(a, b)).toBe(79);
    expect(diffDays(b, a)).toBe(79);
  });
  it('diffDays 2024-01-01 and 2024-01-01 plus 80 days is 80', () => {
    const a = new Date(2024, 0, 1);
    const b = new Date(2024, 2, 21);
    expect(diffDays(a, b)).toBe(80);
    expect(diffDays(b, a)).toBe(80);
  });
  it('diffDays 2024-01-01 and 2024-01-01 plus 81 days is 81', () => {
    const a = new Date(2024, 0, 1);
    const b = new Date(2024, 2, 22);
    expect(diffDays(a, b)).toBe(81);
    expect(diffDays(b, a)).toBe(81);
  });
  it('diffDays 2024-01-01 and 2024-01-01 plus 82 days is 82', () => {
    const a = new Date(2024, 0, 1);
    const b = new Date(2024, 2, 23);
    expect(diffDays(a, b)).toBe(82);
    expect(diffDays(b, a)).toBe(82);
  });
  it('diffDays 2024-01-01 and 2024-01-01 plus 83 days is 83', () => {
    const a = new Date(2024, 0, 1);
    const b = new Date(2024, 2, 24);
    expect(diffDays(a, b)).toBe(83);
    expect(diffDays(b, a)).toBe(83);
  });
  it('diffDays 2024-01-01 and 2024-01-01 plus 84 days is 84', () => {
    const a = new Date(2024, 0, 1);
    const b = new Date(2024, 2, 25);
    expect(diffDays(a, b)).toBe(84);
    expect(diffDays(b, a)).toBe(84);
  });
  it('diffDays 2024-01-01 and 2024-01-01 plus 85 days is 85', () => {
    const a = new Date(2024, 0, 1);
    const b = new Date(2024, 2, 26);
    expect(diffDays(a, b)).toBe(85);
    expect(diffDays(b, a)).toBe(85);
  });
  it('diffDays 2024-01-01 and 2024-01-01 plus 86 days is 86', () => {
    const a = new Date(2024, 0, 1);
    const b = new Date(2024, 2, 27);
    expect(diffDays(a, b)).toBe(86);
    expect(diffDays(b, a)).toBe(86);
  });
  it('diffDays 2024-01-01 and 2024-01-01 plus 87 days is 87', () => {
    const a = new Date(2024, 0, 1);
    const b = new Date(2024, 2, 28);
    expect(diffDays(a, b)).toBe(87);
    expect(diffDays(b, a)).toBe(87);
  });
  it('diffDays 2024-01-01 and 2024-01-01 plus 88 days is 88', () => {
    const a = new Date(2024, 0, 1);
    const b = new Date(2024, 2, 29);
    expect(diffDays(a, b)).toBe(88);
    expect(diffDays(b, a)).toBe(88);
  });
  it('diffDays 2024-01-01 and 2024-01-01 plus 89 days is 89', () => {
    const a = new Date(2024, 0, 1);
    const b = new Date(2024, 2, 30);
    expect(diffDays(a, b)).toBe(89);
    expect(diffDays(b, a)).toBe(89);
  });
  it('diffDays 2024-01-01 and 2024-01-01 plus 90 days is 90', () => {
    const a = new Date(2024, 0, 1);
    const b = new Date(2024, 2, 31);
    expect(diffDays(a, b)).toBe(90);
    expect(diffDays(b, a)).toBe(90);
  });
  it('diffDays 2024-01-01 and 2024-01-01 plus 91 days is 91', () => {
    const a = new Date(2024, 0, 1);
    const b = new Date(2024, 3, 1);
    expect(diffDays(a, b)).toBe(91);
    expect(diffDays(b, a)).toBe(91);
  });
  it('diffDays 2024-01-01 and 2024-01-01 plus 92 days is 92', () => {
    const a = new Date(2024, 0, 1);
    const b = new Date(2024, 3, 2);
    expect(diffDays(a, b)).toBe(92);
    expect(diffDays(b, a)).toBe(92);
  });
  it('diffDays 2024-01-01 and 2024-01-01 plus 93 days is 93', () => {
    const a = new Date(2024, 0, 1);
    const b = new Date(2024, 3, 3);
    expect(diffDays(a, b)).toBe(93);
    expect(diffDays(b, a)).toBe(93);
  });
  it('diffDays 2024-01-01 and 2024-01-01 plus 94 days is 94', () => {
    const a = new Date(2024, 0, 1);
    const b = new Date(2024, 3, 4);
    expect(diffDays(a, b)).toBe(94);
    expect(diffDays(b, a)).toBe(94);
  });
  it('diffDays 2024-01-01 and 2024-01-01 plus 95 days is 95', () => {
    const a = new Date(2024, 0, 1);
    const b = new Date(2024, 3, 5);
    expect(diffDays(a, b)).toBe(95);
    expect(diffDays(b, a)).toBe(95);
  });
  it('diffDays 2024-01-01 and 2024-01-01 plus 96 days is 96', () => {
    const a = new Date(2024, 0, 1);
    const b = new Date(2024, 3, 6);
    expect(diffDays(a, b)).toBe(96);
    expect(diffDays(b, a)).toBe(96);
  });
  it('diffDays 2024-01-01 and 2024-01-01 plus 97 days is 97', () => {
    const a = new Date(2024, 0, 1);
    const b = new Date(2024, 3, 7);
    expect(diffDays(a, b)).toBe(97);
    expect(diffDays(b, a)).toBe(97);
  });
  it('diffDays 2024-01-01 and 2024-01-01 plus 98 days is 98', () => {
    const a = new Date(2024, 0, 1);
    const b = new Date(2024, 3, 8);
    expect(diffDays(a, b)).toBe(98);
    expect(diffDays(b, a)).toBe(98);
  });
  it('diffDays 2024-01-01 and 2024-01-01 plus 99 days is 99', () => {
    const a = new Date(2024, 0, 1);
    const b = new Date(2024, 3, 9);
    expect(diffDays(a, b)).toBe(99);
    expect(diffDays(b, a)).toBe(99);
  });
});

describe('isBefore and isAfter', () => {
  it('isBefore isAfter pair 1: 2026-01-01 vs 2026-01-02', () => {
    const a = new Date(2026, 0, 1);
    const b = new Date(2026, 0, 2);
    expect(isBefore(a, b)).toBe(true);
    expect(isAfter(b, a)).toBe(true);
    expect(isBefore(b, a)).toBe(false);
    expect(isAfter(a, b)).toBe(false);
  });
  it('isBefore isAfter pair 2: 2026-01-02 vs 2026-01-03', () => {
    const a = new Date(2026, 0, 2);
    const b = new Date(2026, 0, 3);
    expect(isBefore(a, b)).toBe(true);
    expect(isAfter(b, a)).toBe(true);
    expect(isBefore(b, a)).toBe(false);
    expect(isAfter(a, b)).toBe(false);
  });
  it('isBefore isAfter pair 3: 2026-01-03 vs 2026-01-04', () => {
    const a = new Date(2026, 0, 3);
    const b = new Date(2026, 0, 4);
    expect(isBefore(a, b)).toBe(true);
    expect(isAfter(b, a)).toBe(true);
    expect(isBefore(b, a)).toBe(false);
    expect(isAfter(a, b)).toBe(false);
  });
  it('isBefore isAfter pair 4: 2026-01-04 vs 2026-01-05', () => {
    const a = new Date(2026, 0, 4);
    const b = new Date(2026, 0, 5);
    expect(isBefore(a, b)).toBe(true);
    expect(isAfter(b, a)).toBe(true);
    expect(isBefore(b, a)).toBe(false);
    expect(isAfter(a, b)).toBe(false);
  });
  it('isBefore isAfter pair 5: 2026-01-05 vs 2026-01-06', () => {
    const a = new Date(2026, 0, 5);
    const b = new Date(2026, 0, 6);
    expect(isBefore(a, b)).toBe(true);
    expect(isAfter(b, a)).toBe(true);
    expect(isBefore(b, a)).toBe(false);
    expect(isAfter(a, b)).toBe(false);
  });
  it('isBefore isAfter pair 6: 2026-01-06 vs 2026-01-07', () => {
    const a = new Date(2026, 0, 6);
    const b = new Date(2026, 0, 7);
    expect(isBefore(a, b)).toBe(true);
    expect(isAfter(b, a)).toBe(true);
    expect(isBefore(b, a)).toBe(false);
    expect(isAfter(a, b)).toBe(false);
  });
  it('isBefore isAfter pair 7: 2026-01-07 vs 2026-01-08', () => {
    const a = new Date(2026, 0, 7);
    const b = new Date(2026, 0, 8);
    expect(isBefore(a, b)).toBe(true);
    expect(isAfter(b, a)).toBe(true);
    expect(isBefore(b, a)).toBe(false);
    expect(isAfter(a, b)).toBe(false);
  });
  it('isBefore isAfter pair 8: 2026-01-08 vs 2026-01-09', () => {
    const a = new Date(2026, 0, 8);
    const b = new Date(2026, 0, 9);
    expect(isBefore(a, b)).toBe(true);
    expect(isAfter(b, a)).toBe(true);
    expect(isBefore(b, a)).toBe(false);
    expect(isAfter(a, b)).toBe(false);
  });
  it('isBefore isAfter pair 9: 2026-01-09 vs 2026-01-10', () => {
    const a = new Date(2026, 0, 9);
    const b = new Date(2026, 0, 10);
    expect(isBefore(a, b)).toBe(true);
    expect(isAfter(b, a)).toBe(true);
    expect(isBefore(b, a)).toBe(false);
    expect(isAfter(a, b)).toBe(false);
  });
  it('isBefore isAfter pair 10: 2026-01-10 vs 2026-01-11', () => {
    const a = new Date(2026, 0, 10);
    const b = new Date(2026, 0, 11);
    expect(isBefore(a, b)).toBe(true);
    expect(isAfter(b, a)).toBe(true);
    expect(isBefore(b, a)).toBe(false);
    expect(isAfter(a, b)).toBe(false);
  });
  it('isBefore isAfter pair 11: 2026-01-11 vs 2026-01-12', () => {
    const a = new Date(2026, 0, 11);
    const b = new Date(2026, 0, 12);
    expect(isBefore(a, b)).toBe(true);
    expect(isAfter(b, a)).toBe(true);
    expect(isBefore(b, a)).toBe(false);
    expect(isAfter(a, b)).toBe(false);
  });
  it('isBefore isAfter pair 12: 2026-01-12 vs 2026-01-13', () => {
    const a = new Date(2026, 0, 12);
    const b = new Date(2026, 0, 13);
    expect(isBefore(a, b)).toBe(true);
    expect(isAfter(b, a)).toBe(true);
    expect(isBefore(b, a)).toBe(false);
    expect(isAfter(a, b)).toBe(false);
  });
  it('isBefore isAfter pair 13: 2026-01-13 vs 2026-01-14', () => {
    const a = new Date(2026, 0, 13);
    const b = new Date(2026, 0, 14);
    expect(isBefore(a, b)).toBe(true);
    expect(isAfter(b, a)).toBe(true);
    expect(isBefore(b, a)).toBe(false);
    expect(isAfter(a, b)).toBe(false);
  });
  it('isBefore isAfter pair 14: 2026-01-14 vs 2026-01-15', () => {
    const a = new Date(2026, 0, 14);
    const b = new Date(2026, 0, 15);
    expect(isBefore(a, b)).toBe(true);
    expect(isAfter(b, a)).toBe(true);
    expect(isBefore(b, a)).toBe(false);
    expect(isAfter(a, b)).toBe(false);
  });
  it('isBefore isAfter pair 15: 2026-01-15 vs 2026-01-16', () => {
    const a = new Date(2026, 0, 15);
    const b = new Date(2026, 0, 16);
    expect(isBefore(a, b)).toBe(true);
    expect(isAfter(b, a)).toBe(true);
    expect(isBefore(b, a)).toBe(false);
    expect(isAfter(a, b)).toBe(false);
  });
  it('isBefore isAfter pair 16: 2026-01-16 vs 2026-01-17', () => {
    const a = new Date(2026, 0, 16);
    const b = new Date(2026, 0, 17);
    expect(isBefore(a, b)).toBe(true);
    expect(isAfter(b, a)).toBe(true);
    expect(isBefore(b, a)).toBe(false);
    expect(isAfter(a, b)).toBe(false);
  });
  it('isBefore isAfter pair 17: 2026-01-17 vs 2026-01-18', () => {
    const a = new Date(2026, 0, 17);
    const b = new Date(2026, 0, 18);
    expect(isBefore(a, b)).toBe(true);
    expect(isAfter(b, a)).toBe(true);
    expect(isBefore(b, a)).toBe(false);
    expect(isAfter(a, b)).toBe(false);
  });
  it('isBefore isAfter pair 18: 2026-01-18 vs 2026-01-19', () => {
    const a = new Date(2026, 0, 18);
    const b = new Date(2026, 0, 19);
    expect(isBefore(a, b)).toBe(true);
    expect(isAfter(b, a)).toBe(true);
    expect(isBefore(b, a)).toBe(false);
    expect(isAfter(a, b)).toBe(false);
  });
  it('isBefore isAfter pair 19: 2026-01-19 vs 2026-01-20', () => {
    const a = new Date(2026, 0, 19);
    const b = new Date(2026, 0, 20);
    expect(isBefore(a, b)).toBe(true);
    expect(isAfter(b, a)).toBe(true);
    expect(isBefore(b, a)).toBe(false);
    expect(isAfter(a, b)).toBe(false);
  });
  it('isBefore isAfter pair 20: 2026-01-20 vs 2026-01-21', () => {
    const a = new Date(2026, 0, 20);
    const b = new Date(2026, 0, 21);
    expect(isBefore(a, b)).toBe(true);
    expect(isAfter(b, a)).toBe(true);
    expect(isBefore(b, a)).toBe(false);
    expect(isAfter(a, b)).toBe(false);
  });
  it('isBefore isAfter pair 21: 2026-01-21 vs 2026-01-22', () => {
    const a = new Date(2026, 0, 21);
    const b = new Date(2026, 0, 22);
    expect(isBefore(a, b)).toBe(true);
    expect(isAfter(b, a)).toBe(true);
    expect(isBefore(b, a)).toBe(false);
    expect(isAfter(a, b)).toBe(false);
  });
  it('isBefore isAfter pair 22: 2026-01-22 vs 2026-01-23', () => {
    const a = new Date(2026, 0, 22);
    const b = new Date(2026, 0, 23);
    expect(isBefore(a, b)).toBe(true);
    expect(isAfter(b, a)).toBe(true);
    expect(isBefore(b, a)).toBe(false);
    expect(isAfter(a, b)).toBe(false);
  });
  it('isBefore isAfter pair 23: 2026-01-23 vs 2026-01-24', () => {
    const a = new Date(2026, 0, 23);
    const b = new Date(2026, 0, 24);
    expect(isBefore(a, b)).toBe(true);
    expect(isAfter(b, a)).toBe(true);
    expect(isBefore(b, a)).toBe(false);
    expect(isAfter(a, b)).toBe(false);
  });
  it('isBefore isAfter pair 24: 2026-01-24 vs 2026-01-25', () => {
    const a = new Date(2026, 0, 24);
    const b = new Date(2026, 0, 25);
    expect(isBefore(a, b)).toBe(true);
    expect(isAfter(b, a)).toBe(true);
    expect(isBefore(b, a)).toBe(false);
    expect(isAfter(a, b)).toBe(false);
  });
  it('isBefore isAfter pair 25: 2026-01-25 vs 2026-01-26', () => {
    const a = new Date(2026, 0, 25);
    const b = new Date(2026, 0, 26);
    expect(isBefore(a, b)).toBe(true);
    expect(isAfter(b, a)).toBe(true);
    expect(isBefore(b, a)).toBe(false);
    expect(isAfter(a, b)).toBe(false);
  });
  it('isBefore isAfter pair 26: 2026-01-26 vs 2026-01-27', () => {
    const a = new Date(2026, 0, 26);
    const b = new Date(2026, 0, 27);
    expect(isBefore(a, b)).toBe(true);
    expect(isAfter(b, a)).toBe(true);
    expect(isBefore(b, a)).toBe(false);
    expect(isAfter(a, b)).toBe(false);
  });
  it('isBefore isAfter pair 27: 2026-01-27 vs 2026-01-28', () => {
    const a = new Date(2026, 0, 27);
    const b = new Date(2026, 0, 28);
    expect(isBefore(a, b)).toBe(true);
    expect(isAfter(b, a)).toBe(true);
    expect(isBefore(b, a)).toBe(false);
    expect(isAfter(a, b)).toBe(false);
  });
  it('isBefore isAfter pair 28: 2026-01-28 vs 2026-01-29', () => {
    const a = new Date(2026, 0, 28);
    const b = new Date(2026, 0, 29);
    expect(isBefore(a, b)).toBe(true);
    expect(isAfter(b, a)).toBe(true);
    expect(isBefore(b, a)).toBe(false);
    expect(isAfter(a, b)).toBe(false);
  });
  it('isBefore isAfter pair 29: 2026-01-29 vs 2026-01-30', () => {
    const a = new Date(2026, 0, 29);
    const b = new Date(2026, 0, 30);
    expect(isBefore(a, b)).toBe(true);
    expect(isAfter(b, a)).toBe(true);
    expect(isBefore(b, a)).toBe(false);
    expect(isAfter(a, b)).toBe(false);
  });
  it('isBefore isAfter pair 30: 2026-01-30 vs 2026-01-31', () => {
    const a = new Date(2026, 0, 30);
    const b = new Date(2026, 0, 31);
    expect(isBefore(a, b)).toBe(true);
    expect(isAfter(b, a)).toBe(true);
    expect(isBefore(b, a)).toBe(false);
    expect(isAfter(a, b)).toBe(false);
  });
  it('isBefore isAfter pair 31: 2026-01-31 vs 2026-02-01', () => {
    const a = new Date(2026, 0, 31);
    const b = new Date(2026, 1, 1);
    expect(isBefore(a, b)).toBe(true);
    expect(isAfter(b, a)).toBe(true);
    expect(isBefore(b, a)).toBe(false);
    expect(isAfter(a, b)).toBe(false);
  });
  it('isBefore isAfter pair 32: 2026-02-01 vs 2026-02-02', () => {
    const a = new Date(2026, 1, 1);
    const b = new Date(2026, 1, 2);
    expect(isBefore(a, b)).toBe(true);
    expect(isAfter(b, a)).toBe(true);
    expect(isBefore(b, a)).toBe(false);
    expect(isAfter(a, b)).toBe(false);
  });
  it('isBefore isAfter pair 33: 2026-02-02 vs 2026-02-03', () => {
    const a = new Date(2026, 1, 2);
    const b = new Date(2026, 1, 3);
    expect(isBefore(a, b)).toBe(true);
    expect(isAfter(b, a)).toBe(true);
    expect(isBefore(b, a)).toBe(false);
    expect(isAfter(a, b)).toBe(false);
  });
  it('isBefore isAfter pair 34: 2026-02-03 vs 2026-02-04', () => {
    const a = new Date(2026, 1, 3);
    const b = new Date(2026, 1, 4);
    expect(isBefore(a, b)).toBe(true);
    expect(isAfter(b, a)).toBe(true);
    expect(isBefore(b, a)).toBe(false);
    expect(isAfter(a, b)).toBe(false);
  });
  it('isBefore isAfter pair 35: 2026-02-04 vs 2026-02-05', () => {
    const a = new Date(2026, 1, 4);
    const b = new Date(2026, 1, 5);
    expect(isBefore(a, b)).toBe(true);
    expect(isAfter(b, a)).toBe(true);
    expect(isBefore(b, a)).toBe(false);
    expect(isAfter(a, b)).toBe(false);
  });
  it('isBefore isAfter pair 36: 2026-02-05 vs 2026-02-06', () => {
    const a = new Date(2026, 1, 5);
    const b = new Date(2026, 1, 6);
    expect(isBefore(a, b)).toBe(true);
    expect(isAfter(b, a)).toBe(true);
    expect(isBefore(b, a)).toBe(false);
    expect(isAfter(a, b)).toBe(false);
  });
  it('isBefore isAfter pair 37: 2026-02-06 vs 2026-02-07', () => {
    const a = new Date(2026, 1, 6);
    const b = new Date(2026, 1, 7);
    expect(isBefore(a, b)).toBe(true);
    expect(isAfter(b, a)).toBe(true);
    expect(isBefore(b, a)).toBe(false);
    expect(isAfter(a, b)).toBe(false);
  });
  it('isBefore isAfter pair 38: 2026-02-07 vs 2026-02-08', () => {
    const a = new Date(2026, 1, 7);
    const b = new Date(2026, 1, 8);
    expect(isBefore(a, b)).toBe(true);
    expect(isAfter(b, a)).toBe(true);
    expect(isBefore(b, a)).toBe(false);
    expect(isAfter(a, b)).toBe(false);
  });
  it('isBefore isAfter pair 39: 2026-02-08 vs 2026-02-09', () => {
    const a = new Date(2026, 1, 8);
    const b = new Date(2026, 1, 9);
    expect(isBefore(a, b)).toBe(true);
    expect(isAfter(b, a)).toBe(true);
    expect(isBefore(b, a)).toBe(false);
    expect(isAfter(a, b)).toBe(false);
  });
  it('isBefore isAfter pair 40: 2026-02-09 vs 2026-02-10', () => {
    const a = new Date(2026, 1, 9);
    const b = new Date(2026, 1, 10);
    expect(isBefore(a, b)).toBe(true);
    expect(isAfter(b, a)).toBe(true);
    expect(isBefore(b, a)).toBe(false);
    expect(isAfter(a, b)).toBe(false);
  });
  it('isBefore isAfter pair 41: 2026-02-10 vs 2026-02-11', () => {
    const a = new Date(2026, 1, 10);
    const b = new Date(2026, 1, 11);
    expect(isBefore(a, b)).toBe(true);
    expect(isAfter(b, a)).toBe(true);
    expect(isBefore(b, a)).toBe(false);
    expect(isAfter(a, b)).toBe(false);
  });
  it('isBefore isAfter pair 42: 2026-02-11 vs 2026-02-12', () => {
    const a = new Date(2026, 1, 11);
    const b = new Date(2026, 1, 12);
    expect(isBefore(a, b)).toBe(true);
    expect(isAfter(b, a)).toBe(true);
    expect(isBefore(b, a)).toBe(false);
    expect(isAfter(a, b)).toBe(false);
  });
  it('isBefore isAfter pair 43: 2026-02-12 vs 2026-02-13', () => {
    const a = new Date(2026, 1, 12);
    const b = new Date(2026, 1, 13);
    expect(isBefore(a, b)).toBe(true);
    expect(isAfter(b, a)).toBe(true);
    expect(isBefore(b, a)).toBe(false);
    expect(isAfter(a, b)).toBe(false);
  });
  it('isBefore isAfter pair 44: 2026-02-13 vs 2026-02-14', () => {
    const a = new Date(2026, 1, 13);
    const b = new Date(2026, 1, 14);
    expect(isBefore(a, b)).toBe(true);
    expect(isAfter(b, a)).toBe(true);
    expect(isBefore(b, a)).toBe(false);
    expect(isAfter(a, b)).toBe(false);
  });
  it('isBefore isAfter pair 45: 2026-02-14 vs 2026-02-15', () => {
    const a = new Date(2026, 1, 14);
    const b = new Date(2026, 1, 15);
    expect(isBefore(a, b)).toBe(true);
    expect(isAfter(b, a)).toBe(true);
    expect(isBefore(b, a)).toBe(false);
    expect(isAfter(a, b)).toBe(false);
  });
  it('isBefore isAfter pair 46: 2026-02-15 vs 2026-02-16', () => {
    const a = new Date(2026, 1, 15);
    const b = new Date(2026, 1, 16);
    expect(isBefore(a, b)).toBe(true);
    expect(isAfter(b, a)).toBe(true);
    expect(isBefore(b, a)).toBe(false);
    expect(isAfter(a, b)).toBe(false);
  });
  it('isBefore isAfter pair 47: 2026-02-16 vs 2026-02-17', () => {
    const a = new Date(2026, 1, 16);
    const b = new Date(2026, 1, 17);
    expect(isBefore(a, b)).toBe(true);
    expect(isAfter(b, a)).toBe(true);
    expect(isBefore(b, a)).toBe(false);
    expect(isAfter(a, b)).toBe(false);
  });
  it('isBefore isAfter pair 48: 2026-02-17 vs 2026-02-18', () => {
    const a = new Date(2026, 1, 17);
    const b = new Date(2026, 1, 18);
    expect(isBefore(a, b)).toBe(true);
    expect(isAfter(b, a)).toBe(true);
    expect(isBefore(b, a)).toBe(false);
    expect(isAfter(a, b)).toBe(false);
  });
  it('isBefore isAfter pair 49: 2026-02-18 vs 2026-02-19', () => {
    const a = new Date(2026, 1, 18);
    const b = new Date(2026, 1, 19);
    expect(isBefore(a, b)).toBe(true);
    expect(isAfter(b, a)).toBe(true);
    expect(isBefore(b, a)).toBe(false);
    expect(isAfter(a, b)).toBe(false);
  });
  it('isBefore isAfter pair 50: 2026-02-19 vs 2026-02-20', () => {
    const a = new Date(2026, 1, 19);
    const b = new Date(2026, 1, 20);
    expect(isBefore(a, b)).toBe(true);
    expect(isAfter(b, a)).toBe(true);
    expect(isBefore(b, a)).toBe(false);
    expect(isAfter(a, b)).toBe(false);
  });
});

describe('isSameDay isSameMonth isSameYear', () => {
  it('isSameDay true for 2026-01-01', () => {
    const a = new Date(2026, 0, 1, 8, 0, 0);
    const b = new Date(2026, 0, 1, 20, 0, 0);
    expect(isSameDay(a, b)).toBe(true);
  });
  it('isSameDay true for 2026-01-02', () => {
    const a = new Date(2026, 0, 2, 8, 0, 0);
    const b = new Date(2026, 0, 2, 20, 0, 0);
    expect(isSameDay(a, b)).toBe(true);
  });
  it('isSameDay true for 2026-01-03', () => {
    const a = new Date(2026, 0, 3, 8, 0, 0);
    const b = new Date(2026, 0, 3, 20, 0, 0);
    expect(isSameDay(a, b)).toBe(true);
  });
  it('isSameDay true for 2026-01-04', () => {
    const a = new Date(2026, 0, 4, 8, 0, 0);
    const b = new Date(2026, 0, 4, 20, 0, 0);
    expect(isSameDay(a, b)).toBe(true);
  });
  it('isSameDay true for 2026-01-05', () => {
    const a = new Date(2026, 0, 5, 8, 0, 0);
    const b = new Date(2026, 0, 5, 20, 0, 0);
    expect(isSameDay(a, b)).toBe(true);
  });
  it('isSameDay true for 2026-01-06', () => {
    const a = new Date(2026, 0, 6, 8, 0, 0);
    const b = new Date(2026, 0, 6, 20, 0, 0);
    expect(isSameDay(a, b)).toBe(true);
  });
  it('isSameDay true for 2026-01-07', () => {
    const a = new Date(2026, 0, 7, 8, 0, 0);
    const b = new Date(2026, 0, 7, 20, 0, 0);
    expect(isSameDay(a, b)).toBe(true);
  });
  it('isSameDay true for 2026-01-08', () => {
    const a = new Date(2026, 0, 8, 8, 0, 0);
    const b = new Date(2026, 0, 8, 20, 0, 0);
    expect(isSameDay(a, b)).toBe(true);
  });
  it('isSameDay true for 2026-01-09', () => {
    const a = new Date(2026, 0, 9, 8, 0, 0);
    const b = new Date(2026, 0, 9, 20, 0, 0);
    expect(isSameDay(a, b)).toBe(true);
  });
  it('isSameDay true for 2026-01-10', () => {
    const a = new Date(2026, 0, 10, 8, 0, 0);
    const b = new Date(2026, 0, 10, 20, 0, 0);
    expect(isSameDay(a, b)).toBe(true);
  });
  it('isSameDay true for 2026-01-11', () => {
    const a = new Date(2026, 0, 11, 8, 0, 0);
    const b = new Date(2026, 0, 11, 20, 0, 0);
    expect(isSameDay(a, b)).toBe(true);
  });
  it('isSameDay true for 2026-01-12', () => {
    const a = new Date(2026, 0, 12, 8, 0, 0);
    const b = new Date(2026, 0, 12, 20, 0, 0);
    expect(isSameDay(a, b)).toBe(true);
  });
  it('isSameDay true for 2026-01-13', () => {
    const a = new Date(2026, 0, 13, 8, 0, 0);
    const b = new Date(2026, 0, 13, 20, 0, 0);
    expect(isSameDay(a, b)).toBe(true);
  });
  it('isSameDay true for 2026-01-14', () => {
    const a = new Date(2026, 0, 14, 8, 0, 0);
    const b = new Date(2026, 0, 14, 20, 0, 0);
    expect(isSameDay(a, b)).toBe(true);
  });
  it('isSameDay true for 2026-01-15', () => {
    const a = new Date(2026, 0, 15, 8, 0, 0);
    const b = new Date(2026, 0, 15, 20, 0, 0);
    expect(isSameDay(a, b)).toBe(true);
  });
  it('isSameDay true for 2026-01-16', () => {
    const a = new Date(2026, 0, 16, 8, 0, 0);
    const b = new Date(2026, 0, 16, 20, 0, 0);
    expect(isSameDay(a, b)).toBe(true);
  });
  it('isSameDay true for 2026-01-17', () => {
    const a = new Date(2026, 0, 17, 8, 0, 0);
    const b = new Date(2026, 0, 17, 20, 0, 0);
    expect(isSameDay(a, b)).toBe(true);
  });
  it('isSameDay true for 2026-01-18', () => {
    const a = new Date(2026, 0, 18, 8, 0, 0);
    const b = new Date(2026, 0, 18, 20, 0, 0);
    expect(isSameDay(a, b)).toBe(true);
  });
  it('isSameDay true for 2026-01-19', () => {
    const a = new Date(2026, 0, 19, 8, 0, 0);
    const b = new Date(2026, 0, 19, 20, 0, 0);
    expect(isSameDay(a, b)).toBe(true);
  });
  it('isSameDay true for 2026-01-20', () => {
    const a = new Date(2026, 0, 20, 8, 0, 0);
    const b = new Date(2026, 0, 20, 20, 0, 0);
    expect(isSameDay(a, b)).toBe(true);
  });
  it('isSameDay true for 2026-01-21', () => {
    const a = new Date(2026, 0, 21, 8, 0, 0);
    const b = new Date(2026, 0, 21, 20, 0, 0);
    expect(isSameDay(a, b)).toBe(true);
  });
  it('isSameDay true for 2026-01-22', () => {
    const a = new Date(2026, 0, 22, 8, 0, 0);
    const b = new Date(2026, 0, 22, 20, 0, 0);
    expect(isSameDay(a, b)).toBe(true);
  });
  it('isSameDay true for 2026-01-23', () => {
    const a = new Date(2026, 0, 23, 8, 0, 0);
    const b = new Date(2026, 0, 23, 20, 0, 0);
    expect(isSameDay(a, b)).toBe(true);
  });
  it('isSameDay true for 2026-01-24', () => {
    const a = new Date(2026, 0, 24, 8, 0, 0);
    const b = new Date(2026, 0, 24, 20, 0, 0);
    expect(isSameDay(a, b)).toBe(true);
  });
  it('isSameDay true for 2026-01-25', () => {
    const a = new Date(2026, 0, 25, 8, 0, 0);
    const b = new Date(2026, 0, 25, 20, 0, 0);
    expect(isSameDay(a, b)).toBe(true);
  });
  it('isSameDay true for 2026-01-26', () => {
    const a = new Date(2026, 0, 26, 8, 0, 0);
    const b = new Date(2026, 0, 26, 20, 0, 0);
    expect(isSameDay(a, b)).toBe(true);
  });
  it('isSameDay true for 2026-01-27', () => {
    const a = new Date(2026, 0, 27, 8, 0, 0);
    const b = new Date(2026, 0, 27, 20, 0, 0);
    expect(isSameDay(a, b)).toBe(true);
  });
  it('isSameDay true for 2026-01-28', () => {
    const a = new Date(2026, 0, 28, 8, 0, 0);
    const b = new Date(2026, 0, 28, 20, 0, 0);
    expect(isSameDay(a, b)).toBe(true);
  });
  it('isSameDay true for 2026-01-29', () => {
    const a = new Date(2026, 0, 29, 8, 0, 0);
    const b = new Date(2026, 0, 29, 20, 0, 0);
    expect(isSameDay(a, b)).toBe(true);
  });
  it('isSameDay true for 2026-01-30', () => {
    const a = new Date(2026, 0, 30, 8, 0, 0);
    const b = new Date(2026, 0, 30, 20, 0, 0);
    expect(isSameDay(a, b)).toBe(true);
  });
  it('isSameDay false 2026-01-01 vs 2026-01-02', () => {
    const a = new Date(2026, 0, 1);
    const b = new Date(2026, 0, 2);
    expect(isSameDay(a, b)).toBe(false);
  });
  it('isSameDay false 2026-01-02 vs 2026-01-03', () => {
    const a = new Date(2026, 0, 2);
    const b = new Date(2026, 0, 3);
    expect(isSameDay(a, b)).toBe(false);
  });
  it('isSameDay false 2026-01-03 vs 2026-01-04', () => {
    const a = new Date(2026, 0, 3);
    const b = new Date(2026, 0, 4);
    expect(isSameDay(a, b)).toBe(false);
  });
  it('isSameDay false 2026-01-04 vs 2026-01-05', () => {
    const a = new Date(2026, 0, 4);
    const b = new Date(2026, 0, 5);
    expect(isSameDay(a, b)).toBe(false);
  });
  it('isSameDay false 2026-01-05 vs 2026-01-06', () => {
    const a = new Date(2026, 0, 5);
    const b = new Date(2026, 0, 6);
    expect(isSameDay(a, b)).toBe(false);
  });
  it('isSameDay false 2026-01-06 vs 2026-01-07', () => {
    const a = new Date(2026, 0, 6);
    const b = new Date(2026, 0, 7);
    expect(isSameDay(a, b)).toBe(false);
  });
  it('isSameDay false 2026-01-07 vs 2026-01-08', () => {
    const a = new Date(2026, 0, 7);
    const b = new Date(2026, 0, 8);
    expect(isSameDay(a, b)).toBe(false);
  });
  it('isSameDay false 2026-01-08 vs 2026-01-09', () => {
    const a = new Date(2026, 0, 8);
    const b = new Date(2026, 0, 9);
    expect(isSameDay(a, b)).toBe(false);
  });
  it('isSameDay false 2026-01-09 vs 2026-01-10', () => {
    const a = new Date(2026, 0, 9);
    const b = new Date(2026, 0, 10);
    expect(isSameDay(a, b)).toBe(false);
  });
  it('isSameDay false 2026-01-10 vs 2026-01-11', () => {
    const a = new Date(2026, 0, 10);
    const b = new Date(2026, 0, 11);
    expect(isSameDay(a, b)).toBe(false);
  });
  it('isSameMonth true month 1', () => {
    const a = new Date(2026, 0, 1);
    const b = new Date(2026, 0, 15);
    expect(isSameMonth(a, b)).toBe(true);
  });
  it('isSameMonth true month 2', () => {
    const a = new Date(2026, 1, 1);
    const b = new Date(2026, 1, 15);
    expect(isSameMonth(a, b)).toBe(true);
  });
  it('isSameMonth true month 3', () => {
    const a = new Date(2026, 2, 1);
    const b = new Date(2026, 2, 15);
    expect(isSameMonth(a, b)).toBe(true);
  });
  it('isSameMonth true month 4', () => {
    const a = new Date(2026, 3, 1);
    const b = new Date(2026, 3, 15);
    expect(isSameMonth(a, b)).toBe(true);
  });
  it('isSameMonth true month 5', () => {
    const a = new Date(2026, 4, 1);
    const b = new Date(2026, 4, 15);
    expect(isSameMonth(a, b)).toBe(true);
  });
  it('isSameMonth true month 6', () => {
    const a = new Date(2026, 5, 1);
    const b = new Date(2026, 5, 15);
    expect(isSameMonth(a, b)).toBe(true);
  });
  it('isSameMonth true month 7', () => {
    const a = new Date(2026, 6, 1);
    const b = new Date(2026, 6, 15);
    expect(isSameMonth(a, b)).toBe(true);
  });
  it('isSameMonth true month 8', () => {
    const a = new Date(2026, 7, 1);
    const b = new Date(2026, 7, 15);
    expect(isSameMonth(a, b)).toBe(true);
  });
  it('isSameMonth true month 9', () => {
    const a = new Date(2026, 8, 1);
    const b = new Date(2026, 8, 15);
    expect(isSameMonth(a, b)).toBe(true);
  });
  it('isSameMonth true month 10', () => {
    const a = new Date(2026, 9, 1);
    const b = new Date(2026, 9, 15);
    expect(isSameMonth(a, b)).toBe(true);
  });
  it('isSameMonth true month 11', () => {
    const a = new Date(2026, 10, 1);
    const b = new Date(2026, 10, 15);
    expect(isSameMonth(a, b)).toBe(true);
  });
  it('isSameMonth true month 12', () => {
    const a = new Date(2026, 11, 1);
    const b = new Date(2026, 11, 15);
    expect(isSameMonth(a, b)).toBe(true);
  });
  it('isSameMonth false month 1 vs 2', () => {
    const a = new Date(2026, 0, 15);
    const b = new Date(2026, 1, 15);
    expect(isSameMonth(a, b)).toBe(false);
  });
  it('isSameMonth false month 2 vs 3', () => {
    const a = new Date(2026, 1, 15);
    const b = new Date(2026, 2, 15);
    expect(isSameMonth(a, b)).toBe(false);
  });
  it('isSameMonth false month 3 vs 4', () => {
    const a = new Date(2026, 2, 15);
    const b = new Date(2026, 3, 15);
    expect(isSameMonth(a, b)).toBe(false);
  });
  it('isSameYear true 2020', () => {
    expect(isSameYear(new Date(2020, 0, 1), new Date(2020, 11, 31))).toBe(true);
  });
  it('isSameYear true 2021', () => {
    expect(isSameYear(new Date(2021, 0, 1), new Date(2021, 11, 31))).toBe(true);
  });
  it('isSameYear true 2022', () => {
    expect(isSameYear(new Date(2022, 0, 1), new Date(2022, 11, 31))).toBe(true);
  });
  it('isSameYear true 2023', () => {
    expect(isSameYear(new Date(2023, 0, 1), new Date(2023, 11, 31))).toBe(true);
  });
  it('isSameYear true 2024', () => {
    expect(isSameYear(new Date(2024, 0, 1), new Date(2024, 11, 31))).toBe(true);
  });
  it('isSameYear true 2025', () => {
    expect(isSameYear(new Date(2025, 0, 1), new Date(2025, 11, 31))).toBe(true);
  });
  it('isSameYear true 2026', () => {
    expect(isSameYear(new Date(2026, 0, 1), new Date(2026, 11, 31))).toBe(true);
  });
  it('isSameYear true 2027', () => {
    expect(isSameYear(new Date(2027, 0, 1), new Date(2027, 11, 31))).toBe(true);
  });
  it('isSameYear true 2028', () => {
    expect(isSameYear(new Date(2028, 0, 1), new Date(2028, 11, 31))).toBe(true);
  });
  it('isSameYear true 2029', () => {
    expect(isSameYear(new Date(2029, 0, 1), new Date(2029, 11, 31))).toBe(true);
  });
  it('isSameYear false 2020 vs 2021', () => {
    expect(isSameYear(new Date(2020, 0, 1), new Date(2021, 0, 1))).toBe(false);
  });
  it('isSameYear false 2021 vs 2022', () => {
    expect(isSameYear(new Date(2021, 0, 1), new Date(2022, 0, 1))).toBe(false);
  });
  it('isSameYear false 2022 vs 2023', () => {
    expect(isSameYear(new Date(2022, 0, 1), new Date(2023, 0, 1))).toBe(false);
  });
  it('isSameYear false 2023 vs 2024', () => {
    expect(isSameYear(new Date(2023, 0, 1), new Date(2024, 0, 1))).toBe(false);
  });
  it('isSameYear false 2024 vs 2025', () => {
    expect(isSameYear(new Date(2024, 0, 1), new Date(2025, 0, 1))).toBe(false);
  });
});

describe('isWeekend', () => {
  it('isWeekend 2026-01-01 Thursday is false', () => {
    expect(isWeekend(new Date(2026, 0, 1))).toBe(false);
  });
  it('isWeekend 2026-01-02 Friday is false', () => {
    expect(isWeekend(new Date(2026, 0, 2))).toBe(false);
  });
  it('isWeekend 2026-01-03 Saturday is true', () => {
    expect(isWeekend(new Date(2026, 0, 3))).toBe(true);
  });
  it('isWeekend 2026-01-04 Sunday is true', () => {
    expect(isWeekend(new Date(2026, 0, 4))).toBe(true);
  });
  it('isWeekend 2026-01-05 Monday is false', () => {
    expect(isWeekend(new Date(2026, 0, 5))).toBe(false);
  });
  it('isWeekend 2026-01-06 Tuesday is false', () => {
    expect(isWeekend(new Date(2026, 0, 6))).toBe(false);
  });
  it('isWeekend 2026-01-07 Wednesday is false', () => {
    expect(isWeekend(new Date(2026, 0, 7))).toBe(false);
  });
  it('isWeekend 2026-01-08 Thursday is false', () => {
    expect(isWeekend(new Date(2026, 0, 8))).toBe(false);
  });
  it('isWeekend 2026-01-09 Friday is false', () => {
    expect(isWeekend(new Date(2026, 0, 9))).toBe(false);
  });
  it('isWeekend 2026-01-10 Saturday is true', () => {
    expect(isWeekend(new Date(2026, 0, 10))).toBe(true);
  });
  it('isWeekend 2026-01-11 Sunday is true', () => {
    expect(isWeekend(new Date(2026, 0, 11))).toBe(true);
  });
  it('isWeekend 2026-01-12 Monday is false', () => {
    expect(isWeekend(new Date(2026, 0, 12))).toBe(false);
  });
  it('isWeekend 2026-01-13 Tuesday is false', () => {
    expect(isWeekend(new Date(2026, 0, 13))).toBe(false);
  });
  it('isWeekend 2026-01-14 Wednesday is false', () => {
    expect(isWeekend(new Date(2026, 0, 14))).toBe(false);
  });
  it('isWeekend 2026-01-15 Thursday is false', () => {
    expect(isWeekend(new Date(2026, 0, 15))).toBe(false);
  });
  it('isWeekend 2026-01-16 Friday is false', () => {
    expect(isWeekend(new Date(2026, 0, 16))).toBe(false);
  });
  it('isWeekend 2026-01-17 Saturday is true', () => {
    expect(isWeekend(new Date(2026, 0, 17))).toBe(true);
  });
  it('isWeekend 2026-01-18 Sunday is true', () => {
    expect(isWeekend(new Date(2026, 0, 18))).toBe(true);
  });
  it('isWeekend 2026-01-19 Monday is false', () => {
    expect(isWeekend(new Date(2026, 0, 19))).toBe(false);
  });
  it('isWeekend 2026-01-20 Tuesday is false', () => {
    expect(isWeekend(new Date(2026, 0, 20))).toBe(false);
  });
  it('isWeekend 2026-01-21 Wednesday is false', () => {
    expect(isWeekend(new Date(2026, 0, 21))).toBe(false);
  });
  it('isWeekend 2026-01-22 Thursday is false', () => {
    expect(isWeekend(new Date(2026, 0, 22))).toBe(false);
  });
  it('isWeekend 2026-01-23 Friday is false', () => {
    expect(isWeekend(new Date(2026, 0, 23))).toBe(false);
  });
  it('isWeekend 2026-01-24 Saturday is true', () => {
    expect(isWeekend(new Date(2026, 0, 24))).toBe(true);
  });
  it('isWeekend 2026-01-25 Sunday is true', () => {
    expect(isWeekend(new Date(2026, 0, 25))).toBe(true);
  });
  it('isWeekend 2026-01-26 Monday is false', () => {
    expect(isWeekend(new Date(2026, 0, 26))).toBe(false);
  });
  it('isWeekend 2026-01-27 Tuesday is false', () => {
    expect(isWeekend(new Date(2026, 0, 27))).toBe(false);
  });
  it('isWeekend 2026-01-28 Wednesday is false', () => {
    expect(isWeekend(new Date(2026, 0, 28))).toBe(false);
  });
  it('isWeekend 2026-01-29 Thursday is false', () => {
    expect(isWeekend(new Date(2026, 0, 29))).toBe(false);
  });
  it('isWeekend 2026-01-30 Friday is false', () => {
    expect(isWeekend(new Date(2026, 0, 30))).toBe(false);
  });
  it('isWeekend 2026-01-31 Saturday is true', () => {
    expect(isWeekend(new Date(2026, 0, 31))).toBe(true);
  });
  it('isWeekend 2026-02-01 Sunday is true', () => {
    expect(isWeekend(new Date(2026, 1, 1))).toBe(true);
  });
  it('isWeekend 2026-02-02 Monday is false', () => {
    expect(isWeekend(new Date(2026, 1, 2))).toBe(false);
  });
  it('isWeekend 2026-02-03 Tuesday is false', () => {
    expect(isWeekend(new Date(2026, 1, 3))).toBe(false);
  });
  it('isWeekend 2026-02-04 Wednesday is false', () => {
    expect(isWeekend(new Date(2026, 1, 4))).toBe(false);
  });
  it('isWeekend 2026-02-05 Thursday is false', () => {
    expect(isWeekend(new Date(2026, 1, 5))).toBe(false);
  });
  it('isWeekend 2026-02-06 Friday is false', () => {
    expect(isWeekend(new Date(2026, 1, 6))).toBe(false);
  });
  it('isWeekend 2026-02-07 Saturday is true', () => {
    expect(isWeekend(new Date(2026, 1, 7))).toBe(true);
  });
  it('isWeekend 2026-02-08 Sunday is true', () => {
    expect(isWeekend(new Date(2026, 1, 8))).toBe(true);
  });
  it('isWeekend 2026-02-09 Monday is false', () => {
    expect(isWeekend(new Date(2026, 1, 9))).toBe(false);
  });
  it('isWeekend 2026-02-10 Tuesday is false', () => {
    expect(isWeekend(new Date(2026, 1, 10))).toBe(false);
  });
  it('isWeekend 2026-02-11 Wednesday is false', () => {
    expect(isWeekend(new Date(2026, 1, 11))).toBe(false);
  });
  it('isWeekend 2026-02-12 Thursday is false', () => {
    expect(isWeekend(new Date(2026, 1, 12))).toBe(false);
  });
  it('isWeekend 2026-02-13 Friday is false', () => {
    expect(isWeekend(new Date(2026, 1, 13))).toBe(false);
  });
  it('isWeekend 2026-02-14 Saturday is true', () => {
    expect(isWeekend(new Date(2026, 1, 14))).toBe(true);
  });
  it('isWeekend 2026-02-15 Sunday is true', () => {
    expect(isWeekend(new Date(2026, 1, 15))).toBe(true);
  });
  it('isWeekend 2026-02-16 Monday is false', () => {
    expect(isWeekend(new Date(2026, 1, 16))).toBe(false);
  });
  it('isWeekend 2026-02-17 Tuesday is false', () => {
    expect(isWeekend(new Date(2026, 1, 17))).toBe(false);
  });
  it('isWeekend 2026-02-18 Wednesday is false', () => {
    expect(isWeekend(new Date(2026, 1, 18))).toBe(false);
  });
  it('isWeekend 2026-02-19 Thursday is false', () => {
    expect(isWeekend(new Date(2026, 1, 19))).toBe(false);
  });
  it('isWeekend 2026-02-20 Friday is false', () => {
    expect(isWeekend(new Date(2026, 1, 20))).toBe(false);
  });
  it('isWeekend 2026-02-21 Saturday is true', () => {
    expect(isWeekend(new Date(2026, 1, 21))).toBe(true);
  });
  it('isWeekend 2026-02-22 Sunday is true', () => {
    expect(isWeekend(new Date(2026, 1, 22))).toBe(true);
  });
  it('isWeekend 2026-02-23 Monday is false', () => {
    expect(isWeekend(new Date(2026, 1, 23))).toBe(false);
  });
  it('isWeekend 2026-02-24 Tuesday is false', () => {
    expect(isWeekend(new Date(2026, 1, 24))).toBe(false);
  });
  it('isWeekend 2026-02-25 Wednesday is false', () => {
    expect(isWeekend(new Date(2026, 1, 25))).toBe(false);
  });
  it('isWeekend 2026-02-26 Thursday is false', () => {
    expect(isWeekend(new Date(2026, 1, 26))).toBe(false);
  });
  it('isWeekend 2026-02-27 Friday is false', () => {
    expect(isWeekend(new Date(2026, 1, 27))).toBe(false);
  });
  it('isWeekend 2026-02-28 Saturday is true', () => {
    expect(isWeekend(new Date(2026, 1, 28))).toBe(true);
  });
  it('isWeekend 2026-03-01 Sunday is true', () => {
    expect(isWeekend(new Date(2026, 2, 1))).toBe(true);
  });
  it('isWeekend 2026-03-02 Monday is false', () => {
    expect(isWeekend(new Date(2026, 2, 2))).toBe(false);
  });
  it('isWeekend 2026-03-03 Tuesday is false', () => {
    expect(isWeekend(new Date(2026, 2, 3))).toBe(false);
  });
  it('isWeekend 2026-03-04 Wednesday is false', () => {
    expect(isWeekend(new Date(2026, 2, 4))).toBe(false);
  });
  it('isWeekend 2026-03-05 Thursday is false', () => {
    expect(isWeekend(new Date(2026, 2, 5))).toBe(false);
  });
  it('isWeekend 2026-03-06 Friday is false', () => {
    expect(isWeekend(new Date(2026, 2, 6))).toBe(false);
  });
  it('isWeekend 2026-03-07 Saturday is true', () => {
    expect(isWeekend(new Date(2026, 2, 7))).toBe(true);
  });
  it('isWeekend 2026-03-08 Sunday is true', () => {
    expect(isWeekend(new Date(2026, 2, 8))).toBe(true);
  });
  it('isWeekend 2026-03-09 Monday is false', () => {
    expect(isWeekend(new Date(2026, 2, 9))).toBe(false);
  });
  it('isWeekend 2026-03-10 Tuesday is false', () => {
    expect(isWeekend(new Date(2026, 2, 10))).toBe(false);
  });
  it('isWeekend 2026-03-11 Wednesday is false', () => {
    expect(isWeekend(new Date(2026, 2, 11))).toBe(false);
  });
  it('isWeekend 2026-03-12 Thursday is false', () => {
    expect(isWeekend(new Date(2026, 2, 12))).toBe(false);
  });
  it('isWeekend 2026-03-13 Friday is false', () => {
    expect(isWeekend(new Date(2026, 2, 13))).toBe(false);
  });
  it('isWeekend 2026-03-14 Saturday is true', () => {
    expect(isWeekend(new Date(2026, 2, 14))).toBe(true);
  });
  it('isWeekend 2026-03-15 Sunday is true', () => {
    expect(isWeekend(new Date(2026, 2, 15))).toBe(true);
  });
  it('isWeekend 2026-03-16 Monday is false', () => {
    expect(isWeekend(new Date(2026, 2, 16))).toBe(false);
  });
  it('isWeekend 2026-03-17 Tuesday is false', () => {
    expect(isWeekend(new Date(2026, 2, 17))).toBe(false);
  });
  it('isWeekend 2026-03-18 Wednesday is false', () => {
    expect(isWeekend(new Date(2026, 2, 18))).toBe(false);
  });
  it('isWeekend 2026-03-19 Thursday is false', () => {
    expect(isWeekend(new Date(2026, 2, 19))).toBe(false);
  });
  it('isWeekend 2026-03-20 Friday is false', () => {
    expect(isWeekend(new Date(2026, 2, 20))).toBe(false);
  });
  it('isWeekend 2026-03-21 Saturday is true', () => {
    expect(isWeekend(new Date(2026, 2, 21))).toBe(true);
  });
  it('isWeekend 2026-03-22 Sunday is true', () => {
    expect(isWeekend(new Date(2026, 2, 22))).toBe(true);
  });
  it('isWeekend 2026-03-23 Monday is false', () => {
    expect(isWeekend(new Date(2026, 2, 23))).toBe(false);
  });
  it('isWeekend 2026-03-24 Tuesday is false', () => {
    expect(isWeekend(new Date(2026, 2, 24))).toBe(false);
  });
  it('isWeekend 2026-03-25 Wednesday is false', () => {
    expect(isWeekend(new Date(2026, 2, 25))).toBe(false);
  });
  it('isWeekend 2026-03-26 Thursday is false', () => {
    expect(isWeekend(new Date(2026, 2, 26))).toBe(false);
  });
  it('isWeekend 2026-03-27 Friday is false', () => {
    expect(isWeekend(new Date(2026, 2, 27))).toBe(false);
  });
  it('isWeekend 2026-03-28 Saturday is true', () => {
    expect(isWeekend(new Date(2026, 2, 28))).toBe(true);
  });
  it('isWeekend 2026-03-29 Sunday is true', () => {
    expect(isWeekend(new Date(2026, 2, 29))).toBe(true);
  });
  it('isWeekend 2026-03-30 Monday is false', () => {
    expect(isWeekend(new Date(2026, 2, 30))).toBe(false);
  });
  it('isWeekend 2026-03-31 Tuesday is false', () => {
    expect(isWeekend(new Date(2026, 2, 31))).toBe(false);
  });
  it('isWeekend 2026-04-01 Wednesday is false', () => {
    expect(isWeekend(new Date(2026, 3, 1))).toBe(false);
  });
  it('isWeekend 2026-04-02 Thursday is false', () => {
    expect(isWeekend(new Date(2026, 3, 2))).toBe(false);
  });
  it('isWeekend 2026-04-03 Friday is false', () => {
    expect(isWeekend(new Date(2026, 3, 3))).toBe(false);
  });
  it('isWeekend 2026-04-04 Saturday is true', () => {
    expect(isWeekend(new Date(2026, 3, 4))).toBe(true);
  });
  it('isWeekend 2026-04-05 Sunday is true', () => {
    expect(isWeekend(new Date(2026, 3, 5))).toBe(true);
  });
  it('isWeekend 2026-04-06 Monday is false', () => {
    expect(isWeekend(new Date(2026, 3, 6))).toBe(false);
  });
  it('isWeekend 2026-04-07 Tuesday is false', () => {
    expect(isWeekend(new Date(2026, 3, 7))).toBe(false);
  });
  it('isWeekend 2026-04-08 Wednesday is false', () => {
    expect(isWeekend(new Date(2026, 3, 8))).toBe(false);
  });
  it('isWeekend 2026-04-09 Thursday is false', () => {
    expect(isWeekend(new Date(2026, 3, 9))).toBe(false);
  });
  it('isWeekend 2026-04-10 Friday is false', () => {
    expect(isWeekend(new Date(2026, 3, 10))).toBe(false);
  });
});

describe('isLeapYear', () => {
  it('isLeapYear 1900 is false', () => {
    expect(isLeapYear(1900)).toBe(false);
  });
  it('isLeapYear 1901 is false', () => {
    expect(isLeapYear(1901)).toBe(false);
  });
  it('isLeapYear 1902 is false', () => {
    expect(isLeapYear(1902)).toBe(false);
  });
  it('isLeapYear 1903 is false', () => {
    expect(isLeapYear(1903)).toBe(false);
  });
  it('isLeapYear 1904 is true', () => {
    expect(isLeapYear(1904)).toBe(true);
  });
  it('isLeapYear 1905 is false', () => {
    expect(isLeapYear(1905)).toBe(false);
  });
  it('isLeapYear 1906 is false', () => {
    expect(isLeapYear(1906)).toBe(false);
  });
  it('isLeapYear 1907 is false', () => {
    expect(isLeapYear(1907)).toBe(false);
  });
  it('isLeapYear 1908 is true', () => {
    expect(isLeapYear(1908)).toBe(true);
  });
  it('isLeapYear 1909 is false', () => {
    expect(isLeapYear(1909)).toBe(false);
  });
  it('isLeapYear 1910 is false', () => {
    expect(isLeapYear(1910)).toBe(false);
  });
  it('isLeapYear 1911 is false', () => {
    expect(isLeapYear(1911)).toBe(false);
  });
  it('isLeapYear 1912 is true', () => {
    expect(isLeapYear(1912)).toBe(true);
  });
  it('isLeapYear 1913 is false', () => {
    expect(isLeapYear(1913)).toBe(false);
  });
  it('isLeapYear 1914 is false', () => {
    expect(isLeapYear(1914)).toBe(false);
  });
  it('isLeapYear 1915 is false', () => {
    expect(isLeapYear(1915)).toBe(false);
  });
  it('isLeapYear 1916 is true', () => {
    expect(isLeapYear(1916)).toBe(true);
  });
  it('isLeapYear 1917 is false', () => {
    expect(isLeapYear(1917)).toBe(false);
  });
  it('isLeapYear 1918 is false', () => {
    expect(isLeapYear(1918)).toBe(false);
  });
  it('isLeapYear 1919 is false', () => {
    expect(isLeapYear(1919)).toBe(false);
  });
  it('isLeapYear 1920 is true', () => {
    expect(isLeapYear(1920)).toBe(true);
  });
  it('isLeapYear 1921 is false', () => {
    expect(isLeapYear(1921)).toBe(false);
  });
  it('isLeapYear 1922 is false', () => {
    expect(isLeapYear(1922)).toBe(false);
  });
  it('isLeapYear 1923 is false', () => {
    expect(isLeapYear(1923)).toBe(false);
  });
  it('isLeapYear 1924 is true', () => {
    expect(isLeapYear(1924)).toBe(true);
  });
  it('isLeapYear 1925 is false', () => {
    expect(isLeapYear(1925)).toBe(false);
  });
  it('isLeapYear 1926 is false', () => {
    expect(isLeapYear(1926)).toBe(false);
  });
  it('isLeapYear 1927 is false', () => {
    expect(isLeapYear(1927)).toBe(false);
  });
  it('isLeapYear 1928 is true', () => {
    expect(isLeapYear(1928)).toBe(true);
  });
  it('isLeapYear 1929 is false', () => {
    expect(isLeapYear(1929)).toBe(false);
  });
  it('isLeapYear 1930 is false', () => {
    expect(isLeapYear(1930)).toBe(false);
  });
  it('isLeapYear 1931 is false', () => {
    expect(isLeapYear(1931)).toBe(false);
  });
  it('isLeapYear 1932 is true', () => {
    expect(isLeapYear(1932)).toBe(true);
  });
  it('isLeapYear 1933 is false', () => {
    expect(isLeapYear(1933)).toBe(false);
  });
  it('isLeapYear 1934 is false', () => {
    expect(isLeapYear(1934)).toBe(false);
  });
  it('isLeapYear 1935 is false', () => {
    expect(isLeapYear(1935)).toBe(false);
  });
  it('isLeapYear 1936 is true', () => {
    expect(isLeapYear(1936)).toBe(true);
  });
  it('isLeapYear 1937 is false', () => {
    expect(isLeapYear(1937)).toBe(false);
  });
  it('isLeapYear 1938 is false', () => {
    expect(isLeapYear(1938)).toBe(false);
  });
  it('isLeapYear 1939 is false', () => {
    expect(isLeapYear(1939)).toBe(false);
  });
  it('isLeapYear 1940 is true', () => {
    expect(isLeapYear(1940)).toBe(true);
  });
  it('isLeapYear 1941 is false', () => {
    expect(isLeapYear(1941)).toBe(false);
  });
  it('isLeapYear 1942 is false', () => {
    expect(isLeapYear(1942)).toBe(false);
  });
  it('isLeapYear 1943 is false', () => {
    expect(isLeapYear(1943)).toBe(false);
  });
  it('isLeapYear 1944 is true', () => {
    expect(isLeapYear(1944)).toBe(true);
  });
  it('isLeapYear 1945 is false', () => {
    expect(isLeapYear(1945)).toBe(false);
  });
  it('isLeapYear 1946 is false', () => {
    expect(isLeapYear(1946)).toBe(false);
  });
  it('isLeapYear 1947 is false', () => {
    expect(isLeapYear(1947)).toBe(false);
  });
  it('isLeapYear 1948 is true', () => {
    expect(isLeapYear(1948)).toBe(true);
  });
  it('isLeapYear 1949 is false', () => {
    expect(isLeapYear(1949)).toBe(false);
  });
  it('isLeapYear 1950 is false', () => {
    expect(isLeapYear(1950)).toBe(false);
  });
  it('isLeapYear 1951 is false', () => {
    expect(isLeapYear(1951)).toBe(false);
  });
  it('isLeapYear 1952 is true', () => {
    expect(isLeapYear(1952)).toBe(true);
  });
  it('isLeapYear 1953 is false', () => {
    expect(isLeapYear(1953)).toBe(false);
  });
  it('isLeapYear 1954 is false', () => {
    expect(isLeapYear(1954)).toBe(false);
  });
  it('isLeapYear 1955 is false', () => {
    expect(isLeapYear(1955)).toBe(false);
  });
  it('isLeapYear 1956 is true', () => {
    expect(isLeapYear(1956)).toBe(true);
  });
  it('isLeapYear 1957 is false', () => {
    expect(isLeapYear(1957)).toBe(false);
  });
  it('isLeapYear 1958 is false', () => {
    expect(isLeapYear(1958)).toBe(false);
  });
  it('isLeapYear 1959 is false', () => {
    expect(isLeapYear(1959)).toBe(false);
  });
  it('isLeapYear 1960 is true', () => {
    expect(isLeapYear(1960)).toBe(true);
  });
  it('isLeapYear 1961 is false', () => {
    expect(isLeapYear(1961)).toBe(false);
  });
  it('isLeapYear 1962 is false', () => {
    expect(isLeapYear(1962)).toBe(false);
  });
  it('isLeapYear 1963 is false', () => {
    expect(isLeapYear(1963)).toBe(false);
  });
  it('isLeapYear 1964 is true', () => {
    expect(isLeapYear(1964)).toBe(true);
  });
  it('isLeapYear 1965 is false', () => {
    expect(isLeapYear(1965)).toBe(false);
  });
  it('isLeapYear 1966 is false', () => {
    expect(isLeapYear(1966)).toBe(false);
  });
  it('isLeapYear 1967 is false', () => {
    expect(isLeapYear(1967)).toBe(false);
  });
  it('isLeapYear 1968 is true', () => {
    expect(isLeapYear(1968)).toBe(true);
  });
  it('isLeapYear 1969 is false', () => {
    expect(isLeapYear(1969)).toBe(false);
  });
  it('isLeapYear 1970 is false', () => {
    expect(isLeapYear(1970)).toBe(false);
  });
  it('isLeapYear 1971 is false', () => {
    expect(isLeapYear(1971)).toBe(false);
  });
  it('isLeapYear 1972 is true', () => {
    expect(isLeapYear(1972)).toBe(true);
  });
  it('isLeapYear 1973 is false', () => {
    expect(isLeapYear(1973)).toBe(false);
  });
  it('isLeapYear 1974 is false', () => {
    expect(isLeapYear(1974)).toBe(false);
  });
  it('isLeapYear 1975 is false', () => {
    expect(isLeapYear(1975)).toBe(false);
  });
  it('isLeapYear 1976 is true', () => {
    expect(isLeapYear(1976)).toBe(true);
  });
  it('isLeapYear 1977 is false', () => {
    expect(isLeapYear(1977)).toBe(false);
  });
  it('isLeapYear 1978 is false', () => {
    expect(isLeapYear(1978)).toBe(false);
  });
  it('isLeapYear 1979 is false', () => {
    expect(isLeapYear(1979)).toBe(false);
  });
  it('isLeapYear 1980 is true', () => {
    expect(isLeapYear(1980)).toBe(true);
  });
  it('isLeapYear 1981 is false', () => {
    expect(isLeapYear(1981)).toBe(false);
  });
  it('isLeapYear 1982 is false', () => {
    expect(isLeapYear(1982)).toBe(false);
  });
  it('isLeapYear 1983 is false', () => {
    expect(isLeapYear(1983)).toBe(false);
  });
  it('isLeapYear 1984 is true', () => {
    expect(isLeapYear(1984)).toBe(true);
  });
  it('isLeapYear 1985 is false', () => {
    expect(isLeapYear(1985)).toBe(false);
  });
  it('isLeapYear 1986 is false', () => {
    expect(isLeapYear(1986)).toBe(false);
  });
  it('isLeapYear 1987 is false', () => {
    expect(isLeapYear(1987)).toBe(false);
  });
  it('isLeapYear 1988 is true', () => {
    expect(isLeapYear(1988)).toBe(true);
  });
  it('isLeapYear 1989 is false', () => {
    expect(isLeapYear(1989)).toBe(false);
  });
  it('isLeapYear 1990 is false', () => {
    expect(isLeapYear(1990)).toBe(false);
  });
  it('isLeapYear 1991 is false', () => {
    expect(isLeapYear(1991)).toBe(false);
  });
  it('isLeapYear 1992 is true', () => {
    expect(isLeapYear(1992)).toBe(true);
  });
  it('isLeapYear 1993 is false', () => {
    expect(isLeapYear(1993)).toBe(false);
  });
  it('isLeapYear 1994 is false', () => {
    expect(isLeapYear(1994)).toBe(false);
  });
  it('isLeapYear 1995 is false', () => {
    expect(isLeapYear(1995)).toBe(false);
  });
  it('isLeapYear 1996 is true', () => {
    expect(isLeapYear(1996)).toBe(true);
  });
  it('isLeapYear 1997 is false', () => {
    expect(isLeapYear(1997)).toBe(false);
  });
  it('isLeapYear 1998 is false', () => {
    expect(isLeapYear(1998)).toBe(false);
  });
  it('isLeapYear 1999 is false', () => {
    expect(isLeapYear(1999)).toBe(false);
  });
});

describe('startOfDay and endOfDay', () => {
  it('startOfDay 2026-01-01', () => {
    const result = startOfDay(new Date(2026, 0, 1, 14, 30, 45));
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
    expect(result.getDate()).toBe(1);
  });
  it('startOfDay 2026-01-02', () => {
    const result = startOfDay(new Date(2026, 0, 2, 14, 30, 45));
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
    expect(result.getDate()).toBe(2);
  });
  it('startOfDay 2026-01-03', () => {
    const result = startOfDay(new Date(2026, 0, 3, 14, 30, 45));
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
    expect(result.getDate()).toBe(3);
  });
  it('startOfDay 2026-01-04', () => {
    const result = startOfDay(new Date(2026, 0, 4, 14, 30, 45));
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
    expect(result.getDate()).toBe(4);
  });
  it('startOfDay 2026-01-05', () => {
    const result = startOfDay(new Date(2026, 0, 5, 14, 30, 45));
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
    expect(result.getDate()).toBe(5);
  });
  it('startOfDay 2026-01-06', () => {
    const result = startOfDay(new Date(2026, 0, 6, 14, 30, 45));
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
    expect(result.getDate()).toBe(6);
  });
  it('startOfDay 2026-01-07', () => {
    const result = startOfDay(new Date(2026, 0, 7, 14, 30, 45));
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
    expect(result.getDate()).toBe(7);
  });
  it('startOfDay 2026-01-08', () => {
    const result = startOfDay(new Date(2026, 0, 8, 14, 30, 45));
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
    expect(result.getDate()).toBe(8);
  });
  it('startOfDay 2026-01-09', () => {
    const result = startOfDay(new Date(2026, 0, 9, 14, 30, 45));
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
    expect(result.getDate()).toBe(9);
  });
  it('startOfDay 2026-01-10', () => {
    const result = startOfDay(new Date(2026, 0, 10, 14, 30, 45));
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
    expect(result.getDate()).toBe(10);
  });
  it('startOfDay 2026-01-11', () => {
    const result = startOfDay(new Date(2026, 0, 11, 14, 30, 45));
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
    expect(result.getDate()).toBe(11);
  });
  it('startOfDay 2026-01-12', () => {
    const result = startOfDay(new Date(2026, 0, 12, 14, 30, 45));
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
    expect(result.getDate()).toBe(12);
  });
  it('startOfDay 2026-01-13', () => {
    const result = startOfDay(new Date(2026, 0, 13, 14, 30, 45));
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
    expect(result.getDate()).toBe(13);
  });
  it('startOfDay 2026-01-14', () => {
    const result = startOfDay(new Date(2026, 0, 14, 14, 30, 45));
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
    expect(result.getDate()).toBe(14);
  });
  it('startOfDay 2026-01-15', () => {
    const result = startOfDay(new Date(2026, 0, 15, 14, 30, 45));
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
    expect(result.getDate()).toBe(15);
  });
  it('startOfDay 2026-01-16', () => {
    const result = startOfDay(new Date(2026, 0, 16, 14, 30, 45));
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
    expect(result.getDate()).toBe(16);
  });
  it('startOfDay 2026-01-17', () => {
    const result = startOfDay(new Date(2026, 0, 17, 14, 30, 45));
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
    expect(result.getDate()).toBe(17);
  });
  it('startOfDay 2026-01-18', () => {
    const result = startOfDay(new Date(2026, 0, 18, 14, 30, 45));
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
    expect(result.getDate()).toBe(18);
  });
  it('startOfDay 2026-01-19', () => {
    const result = startOfDay(new Date(2026, 0, 19, 14, 30, 45));
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
    expect(result.getDate()).toBe(19);
  });
  it('startOfDay 2026-01-20', () => {
    const result = startOfDay(new Date(2026, 0, 20, 14, 30, 45));
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
    expect(result.getDate()).toBe(20);
  });
  it('startOfDay 2026-01-21', () => {
    const result = startOfDay(new Date(2026, 0, 21, 14, 30, 45));
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
    expect(result.getDate()).toBe(21);
  });
  it('startOfDay 2026-01-22', () => {
    const result = startOfDay(new Date(2026, 0, 22, 14, 30, 45));
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
    expect(result.getDate()).toBe(22);
  });
  it('startOfDay 2026-01-23', () => {
    const result = startOfDay(new Date(2026, 0, 23, 14, 30, 45));
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
    expect(result.getDate()).toBe(23);
  });
  it('startOfDay 2026-01-24', () => {
    const result = startOfDay(new Date(2026, 0, 24, 14, 30, 45));
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
    expect(result.getDate()).toBe(24);
  });
  it('startOfDay 2026-01-25', () => {
    const result = startOfDay(new Date(2026, 0, 25, 14, 30, 45));
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
    expect(result.getDate()).toBe(25);
  });
  it('startOfDay 2026-01-26', () => {
    const result = startOfDay(new Date(2026, 0, 26, 14, 30, 45));
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
    expect(result.getDate()).toBe(26);
  });
  it('startOfDay 2026-01-27', () => {
    const result = startOfDay(new Date(2026, 0, 27, 14, 30, 45));
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
    expect(result.getDate()).toBe(27);
  });
  it('startOfDay 2026-01-28', () => {
    const result = startOfDay(new Date(2026, 0, 28, 14, 30, 45));
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
    expect(result.getDate()).toBe(28);
  });
  it('startOfDay 2026-01-29', () => {
    const result = startOfDay(new Date(2026, 0, 29, 14, 30, 45));
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
    expect(result.getDate()).toBe(29);
  });
  it('startOfDay 2026-01-30', () => {
    const result = startOfDay(new Date(2026, 0, 30, 14, 30, 45));
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
    expect(result.getDate()).toBe(30);
  });
  it('startOfDay 2026-01-31', () => {
    const result = startOfDay(new Date(2026, 0, 31, 14, 30, 45));
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
    expect(result.getDate()).toBe(31);
  });
  it('startOfDay 2026-02-01', () => {
    const result = startOfDay(new Date(2026, 1, 1, 14, 30, 45));
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
    expect(result.getDate()).toBe(1);
  });
  it('startOfDay 2026-02-02', () => {
    const result = startOfDay(new Date(2026, 1, 2, 14, 30, 45));
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
    expect(result.getDate()).toBe(2);
  });
  it('startOfDay 2026-02-03', () => {
    const result = startOfDay(new Date(2026, 1, 3, 14, 30, 45));
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
    expect(result.getDate()).toBe(3);
  });
  it('startOfDay 2026-02-04', () => {
    const result = startOfDay(new Date(2026, 1, 4, 14, 30, 45));
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
    expect(result.getDate()).toBe(4);
  });
  it('startOfDay 2026-02-05', () => {
    const result = startOfDay(new Date(2026, 1, 5, 14, 30, 45));
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
    expect(result.getDate()).toBe(5);
  });
  it('startOfDay 2026-02-06', () => {
    const result = startOfDay(new Date(2026, 1, 6, 14, 30, 45));
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
    expect(result.getDate()).toBe(6);
  });
  it('startOfDay 2026-02-07', () => {
    const result = startOfDay(new Date(2026, 1, 7, 14, 30, 45));
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
    expect(result.getDate()).toBe(7);
  });
  it('startOfDay 2026-02-08', () => {
    const result = startOfDay(new Date(2026, 1, 8, 14, 30, 45));
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
    expect(result.getDate()).toBe(8);
  });
  it('startOfDay 2026-02-09', () => {
    const result = startOfDay(new Date(2026, 1, 9, 14, 30, 45));
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
    expect(result.getDate()).toBe(9);
  });
  it('startOfDay 2026-02-10', () => {
    const result = startOfDay(new Date(2026, 1, 10, 14, 30, 45));
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
    expect(result.getDate()).toBe(10);
  });
  it('startOfDay 2026-02-11', () => {
    const result = startOfDay(new Date(2026, 1, 11, 14, 30, 45));
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
    expect(result.getDate()).toBe(11);
  });
  it('startOfDay 2026-02-12', () => {
    const result = startOfDay(new Date(2026, 1, 12, 14, 30, 45));
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
    expect(result.getDate()).toBe(12);
  });
  it('startOfDay 2026-02-13', () => {
    const result = startOfDay(new Date(2026, 1, 13, 14, 30, 45));
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
    expect(result.getDate()).toBe(13);
  });
  it('startOfDay 2026-02-14', () => {
    const result = startOfDay(new Date(2026, 1, 14, 14, 30, 45));
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
    expect(result.getDate()).toBe(14);
  });
  it('startOfDay 2026-02-15', () => {
    const result = startOfDay(new Date(2026, 1, 15, 14, 30, 45));
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
    expect(result.getDate()).toBe(15);
  });
  it('startOfDay 2026-02-16', () => {
    const result = startOfDay(new Date(2026, 1, 16, 14, 30, 45));
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
    expect(result.getDate()).toBe(16);
  });
  it('startOfDay 2026-02-17', () => {
    const result = startOfDay(new Date(2026, 1, 17, 14, 30, 45));
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
    expect(result.getDate()).toBe(17);
  });
  it('startOfDay 2026-02-18', () => {
    const result = startOfDay(new Date(2026, 1, 18, 14, 30, 45));
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
    expect(result.getDate()).toBe(18);
  });
  it('startOfDay 2026-02-19', () => {
    const result = startOfDay(new Date(2026, 1, 19, 14, 30, 45));
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
    expect(result.getDate()).toBe(19);
  });
  it('endOfDay 2026-01-01', () => {
    const result = endOfDay(new Date(2026, 0, 1, 0, 0, 0));
    expect(result.getHours()).toBe(23);
    expect(result.getMinutes()).toBe(59);
    expect(result.getSeconds()).toBe(59);
    expect(result.getMilliseconds()).toBe(999);
    expect(result.getDate()).toBe(1);
  });
  it('endOfDay 2026-01-02', () => {
    const result = endOfDay(new Date(2026, 0, 2, 0, 0, 0));
    expect(result.getHours()).toBe(23);
    expect(result.getMinutes()).toBe(59);
    expect(result.getSeconds()).toBe(59);
    expect(result.getMilliseconds()).toBe(999);
    expect(result.getDate()).toBe(2);
  });
  it('endOfDay 2026-01-03', () => {
    const result = endOfDay(new Date(2026, 0, 3, 0, 0, 0));
    expect(result.getHours()).toBe(23);
    expect(result.getMinutes()).toBe(59);
    expect(result.getSeconds()).toBe(59);
    expect(result.getMilliseconds()).toBe(999);
    expect(result.getDate()).toBe(3);
  });
  it('endOfDay 2026-01-04', () => {
    const result = endOfDay(new Date(2026, 0, 4, 0, 0, 0));
    expect(result.getHours()).toBe(23);
    expect(result.getMinutes()).toBe(59);
    expect(result.getSeconds()).toBe(59);
    expect(result.getMilliseconds()).toBe(999);
    expect(result.getDate()).toBe(4);
  });
  it('endOfDay 2026-01-05', () => {
    const result = endOfDay(new Date(2026, 0, 5, 0, 0, 0));
    expect(result.getHours()).toBe(23);
    expect(result.getMinutes()).toBe(59);
    expect(result.getSeconds()).toBe(59);
    expect(result.getMilliseconds()).toBe(999);
    expect(result.getDate()).toBe(5);
  });
  it('endOfDay 2026-01-06', () => {
    const result = endOfDay(new Date(2026, 0, 6, 0, 0, 0));
    expect(result.getHours()).toBe(23);
    expect(result.getMinutes()).toBe(59);
    expect(result.getSeconds()).toBe(59);
    expect(result.getMilliseconds()).toBe(999);
    expect(result.getDate()).toBe(6);
  });
  it('endOfDay 2026-01-07', () => {
    const result = endOfDay(new Date(2026, 0, 7, 0, 0, 0));
    expect(result.getHours()).toBe(23);
    expect(result.getMinutes()).toBe(59);
    expect(result.getSeconds()).toBe(59);
    expect(result.getMilliseconds()).toBe(999);
    expect(result.getDate()).toBe(7);
  });
  it('endOfDay 2026-01-08', () => {
    const result = endOfDay(new Date(2026, 0, 8, 0, 0, 0));
    expect(result.getHours()).toBe(23);
    expect(result.getMinutes()).toBe(59);
    expect(result.getSeconds()).toBe(59);
    expect(result.getMilliseconds()).toBe(999);
    expect(result.getDate()).toBe(8);
  });
  it('endOfDay 2026-01-09', () => {
    const result = endOfDay(new Date(2026, 0, 9, 0, 0, 0));
    expect(result.getHours()).toBe(23);
    expect(result.getMinutes()).toBe(59);
    expect(result.getSeconds()).toBe(59);
    expect(result.getMilliseconds()).toBe(999);
    expect(result.getDate()).toBe(9);
  });
  it('endOfDay 2026-01-10', () => {
    const result = endOfDay(new Date(2026, 0, 10, 0, 0, 0));
    expect(result.getHours()).toBe(23);
    expect(result.getMinutes()).toBe(59);
    expect(result.getSeconds()).toBe(59);
    expect(result.getMilliseconds()).toBe(999);
    expect(result.getDate()).toBe(10);
  });
  it('endOfDay 2026-01-11', () => {
    const result = endOfDay(new Date(2026, 0, 11, 0, 0, 0));
    expect(result.getHours()).toBe(23);
    expect(result.getMinutes()).toBe(59);
    expect(result.getSeconds()).toBe(59);
    expect(result.getMilliseconds()).toBe(999);
    expect(result.getDate()).toBe(11);
  });
  it('endOfDay 2026-01-12', () => {
    const result = endOfDay(new Date(2026, 0, 12, 0, 0, 0));
    expect(result.getHours()).toBe(23);
    expect(result.getMinutes()).toBe(59);
    expect(result.getSeconds()).toBe(59);
    expect(result.getMilliseconds()).toBe(999);
    expect(result.getDate()).toBe(12);
  });
  it('endOfDay 2026-01-13', () => {
    const result = endOfDay(new Date(2026, 0, 13, 0, 0, 0));
    expect(result.getHours()).toBe(23);
    expect(result.getMinutes()).toBe(59);
    expect(result.getSeconds()).toBe(59);
    expect(result.getMilliseconds()).toBe(999);
    expect(result.getDate()).toBe(13);
  });
  it('endOfDay 2026-01-14', () => {
    const result = endOfDay(new Date(2026, 0, 14, 0, 0, 0));
    expect(result.getHours()).toBe(23);
    expect(result.getMinutes()).toBe(59);
    expect(result.getSeconds()).toBe(59);
    expect(result.getMilliseconds()).toBe(999);
    expect(result.getDate()).toBe(14);
  });
  it('endOfDay 2026-01-15', () => {
    const result = endOfDay(new Date(2026, 0, 15, 0, 0, 0));
    expect(result.getHours()).toBe(23);
    expect(result.getMinutes()).toBe(59);
    expect(result.getSeconds()).toBe(59);
    expect(result.getMilliseconds()).toBe(999);
    expect(result.getDate()).toBe(15);
  });
  it('endOfDay 2026-01-16', () => {
    const result = endOfDay(new Date(2026, 0, 16, 0, 0, 0));
    expect(result.getHours()).toBe(23);
    expect(result.getMinutes()).toBe(59);
    expect(result.getSeconds()).toBe(59);
    expect(result.getMilliseconds()).toBe(999);
    expect(result.getDate()).toBe(16);
  });
  it('endOfDay 2026-01-17', () => {
    const result = endOfDay(new Date(2026, 0, 17, 0, 0, 0));
    expect(result.getHours()).toBe(23);
    expect(result.getMinutes()).toBe(59);
    expect(result.getSeconds()).toBe(59);
    expect(result.getMilliseconds()).toBe(999);
    expect(result.getDate()).toBe(17);
  });
  it('endOfDay 2026-01-18', () => {
    const result = endOfDay(new Date(2026, 0, 18, 0, 0, 0));
    expect(result.getHours()).toBe(23);
    expect(result.getMinutes()).toBe(59);
    expect(result.getSeconds()).toBe(59);
    expect(result.getMilliseconds()).toBe(999);
    expect(result.getDate()).toBe(18);
  });
  it('endOfDay 2026-01-19', () => {
    const result = endOfDay(new Date(2026, 0, 19, 0, 0, 0));
    expect(result.getHours()).toBe(23);
    expect(result.getMinutes()).toBe(59);
    expect(result.getSeconds()).toBe(59);
    expect(result.getMilliseconds()).toBe(999);
    expect(result.getDate()).toBe(19);
  });
  it('endOfDay 2026-01-20', () => {
    const result = endOfDay(new Date(2026, 0, 20, 0, 0, 0));
    expect(result.getHours()).toBe(23);
    expect(result.getMinutes()).toBe(59);
    expect(result.getSeconds()).toBe(59);
    expect(result.getMilliseconds()).toBe(999);
    expect(result.getDate()).toBe(20);
  });
  it('endOfDay 2026-01-21', () => {
    const result = endOfDay(new Date(2026, 0, 21, 0, 0, 0));
    expect(result.getHours()).toBe(23);
    expect(result.getMinutes()).toBe(59);
    expect(result.getSeconds()).toBe(59);
    expect(result.getMilliseconds()).toBe(999);
    expect(result.getDate()).toBe(21);
  });
  it('endOfDay 2026-01-22', () => {
    const result = endOfDay(new Date(2026, 0, 22, 0, 0, 0));
    expect(result.getHours()).toBe(23);
    expect(result.getMinutes()).toBe(59);
    expect(result.getSeconds()).toBe(59);
    expect(result.getMilliseconds()).toBe(999);
    expect(result.getDate()).toBe(22);
  });
  it('endOfDay 2026-01-23', () => {
    const result = endOfDay(new Date(2026, 0, 23, 0, 0, 0));
    expect(result.getHours()).toBe(23);
    expect(result.getMinutes()).toBe(59);
    expect(result.getSeconds()).toBe(59);
    expect(result.getMilliseconds()).toBe(999);
    expect(result.getDate()).toBe(23);
  });
  it('endOfDay 2026-01-24', () => {
    const result = endOfDay(new Date(2026, 0, 24, 0, 0, 0));
    expect(result.getHours()).toBe(23);
    expect(result.getMinutes()).toBe(59);
    expect(result.getSeconds()).toBe(59);
    expect(result.getMilliseconds()).toBe(999);
    expect(result.getDate()).toBe(24);
  });
  it('endOfDay 2026-01-25', () => {
    const result = endOfDay(new Date(2026, 0, 25, 0, 0, 0));
    expect(result.getHours()).toBe(23);
    expect(result.getMinutes()).toBe(59);
    expect(result.getSeconds()).toBe(59);
    expect(result.getMilliseconds()).toBe(999);
    expect(result.getDate()).toBe(25);
  });
  it('endOfDay 2026-01-26', () => {
    const result = endOfDay(new Date(2026, 0, 26, 0, 0, 0));
    expect(result.getHours()).toBe(23);
    expect(result.getMinutes()).toBe(59);
    expect(result.getSeconds()).toBe(59);
    expect(result.getMilliseconds()).toBe(999);
    expect(result.getDate()).toBe(26);
  });
  it('endOfDay 2026-01-27', () => {
    const result = endOfDay(new Date(2026, 0, 27, 0, 0, 0));
    expect(result.getHours()).toBe(23);
    expect(result.getMinutes()).toBe(59);
    expect(result.getSeconds()).toBe(59);
    expect(result.getMilliseconds()).toBe(999);
    expect(result.getDate()).toBe(27);
  });
  it('endOfDay 2026-01-28', () => {
    const result = endOfDay(new Date(2026, 0, 28, 0, 0, 0));
    expect(result.getHours()).toBe(23);
    expect(result.getMinutes()).toBe(59);
    expect(result.getSeconds()).toBe(59);
    expect(result.getMilliseconds()).toBe(999);
    expect(result.getDate()).toBe(28);
  });
  it('endOfDay 2026-01-29', () => {
    const result = endOfDay(new Date(2026, 0, 29, 0, 0, 0));
    expect(result.getHours()).toBe(23);
    expect(result.getMinutes()).toBe(59);
    expect(result.getSeconds()).toBe(59);
    expect(result.getMilliseconds()).toBe(999);
    expect(result.getDate()).toBe(29);
  });
  it('endOfDay 2026-01-30', () => {
    const result = endOfDay(new Date(2026, 0, 30, 0, 0, 0));
    expect(result.getHours()).toBe(23);
    expect(result.getMinutes()).toBe(59);
    expect(result.getSeconds()).toBe(59);
    expect(result.getMilliseconds()).toBe(999);
    expect(result.getDate()).toBe(30);
  });
  it('endOfDay 2026-01-31', () => {
    const result = endOfDay(new Date(2026, 0, 31, 0, 0, 0));
    expect(result.getHours()).toBe(23);
    expect(result.getMinutes()).toBe(59);
    expect(result.getSeconds()).toBe(59);
    expect(result.getMilliseconds()).toBe(999);
    expect(result.getDate()).toBe(31);
  });
  it('endOfDay 2026-02-01', () => {
    const result = endOfDay(new Date(2026, 1, 1, 0, 0, 0));
    expect(result.getHours()).toBe(23);
    expect(result.getMinutes()).toBe(59);
    expect(result.getSeconds()).toBe(59);
    expect(result.getMilliseconds()).toBe(999);
    expect(result.getDate()).toBe(1);
  });
  it('endOfDay 2026-02-02', () => {
    const result = endOfDay(new Date(2026, 1, 2, 0, 0, 0));
    expect(result.getHours()).toBe(23);
    expect(result.getMinutes()).toBe(59);
    expect(result.getSeconds()).toBe(59);
    expect(result.getMilliseconds()).toBe(999);
    expect(result.getDate()).toBe(2);
  });
  it('endOfDay 2026-02-03', () => {
    const result = endOfDay(new Date(2026, 1, 3, 0, 0, 0));
    expect(result.getHours()).toBe(23);
    expect(result.getMinutes()).toBe(59);
    expect(result.getSeconds()).toBe(59);
    expect(result.getMilliseconds()).toBe(999);
    expect(result.getDate()).toBe(3);
  });
  it('endOfDay 2026-02-04', () => {
    const result = endOfDay(new Date(2026, 1, 4, 0, 0, 0));
    expect(result.getHours()).toBe(23);
    expect(result.getMinutes()).toBe(59);
    expect(result.getSeconds()).toBe(59);
    expect(result.getMilliseconds()).toBe(999);
    expect(result.getDate()).toBe(4);
  });
  it('endOfDay 2026-02-05', () => {
    const result = endOfDay(new Date(2026, 1, 5, 0, 0, 0));
    expect(result.getHours()).toBe(23);
    expect(result.getMinutes()).toBe(59);
    expect(result.getSeconds()).toBe(59);
    expect(result.getMilliseconds()).toBe(999);
    expect(result.getDate()).toBe(5);
  });
  it('endOfDay 2026-02-06', () => {
    const result = endOfDay(new Date(2026, 1, 6, 0, 0, 0));
    expect(result.getHours()).toBe(23);
    expect(result.getMinutes()).toBe(59);
    expect(result.getSeconds()).toBe(59);
    expect(result.getMilliseconds()).toBe(999);
    expect(result.getDate()).toBe(6);
  });
  it('endOfDay 2026-02-07', () => {
    const result = endOfDay(new Date(2026, 1, 7, 0, 0, 0));
    expect(result.getHours()).toBe(23);
    expect(result.getMinutes()).toBe(59);
    expect(result.getSeconds()).toBe(59);
    expect(result.getMilliseconds()).toBe(999);
    expect(result.getDate()).toBe(7);
  });
  it('endOfDay 2026-02-08', () => {
    const result = endOfDay(new Date(2026, 1, 8, 0, 0, 0));
    expect(result.getHours()).toBe(23);
    expect(result.getMinutes()).toBe(59);
    expect(result.getSeconds()).toBe(59);
    expect(result.getMilliseconds()).toBe(999);
    expect(result.getDate()).toBe(8);
  });
  it('endOfDay 2026-02-09', () => {
    const result = endOfDay(new Date(2026, 1, 9, 0, 0, 0));
    expect(result.getHours()).toBe(23);
    expect(result.getMinutes()).toBe(59);
    expect(result.getSeconds()).toBe(59);
    expect(result.getMilliseconds()).toBe(999);
    expect(result.getDate()).toBe(9);
  });
  it('endOfDay 2026-02-10', () => {
    const result = endOfDay(new Date(2026, 1, 10, 0, 0, 0));
    expect(result.getHours()).toBe(23);
    expect(result.getMinutes()).toBe(59);
    expect(result.getSeconds()).toBe(59);
    expect(result.getMilliseconds()).toBe(999);
    expect(result.getDate()).toBe(10);
  });
  it('endOfDay 2026-02-11', () => {
    const result = endOfDay(new Date(2026, 1, 11, 0, 0, 0));
    expect(result.getHours()).toBe(23);
    expect(result.getMinutes()).toBe(59);
    expect(result.getSeconds()).toBe(59);
    expect(result.getMilliseconds()).toBe(999);
    expect(result.getDate()).toBe(11);
  });
  it('endOfDay 2026-02-12', () => {
    const result = endOfDay(new Date(2026, 1, 12, 0, 0, 0));
    expect(result.getHours()).toBe(23);
    expect(result.getMinutes()).toBe(59);
    expect(result.getSeconds()).toBe(59);
    expect(result.getMilliseconds()).toBe(999);
    expect(result.getDate()).toBe(12);
  });
  it('endOfDay 2026-02-13', () => {
    const result = endOfDay(new Date(2026, 1, 13, 0, 0, 0));
    expect(result.getHours()).toBe(23);
    expect(result.getMinutes()).toBe(59);
    expect(result.getSeconds()).toBe(59);
    expect(result.getMilliseconds()).toBe(999);
    expect(result.getDate()).toBe(13);
  });
  it('endOfDay 2026-02-14', () => {
    const result = endOfDay(new Date(2026, 1, 14, 0, 0, 0));
    expect(result.getHours()).toBe(23);
    expect(result.getMinutes()).toBe(59);
    expect(result.getSeconds()).toBe(59);
    expect(result.getMilliseconds()).toBe(999);
    expect(result.getDate()).toBe(14);
  });
  it('endOfDay 2026-02-15', () => {
    const result = endOfDay(new Date(2026, 1, 15, 0, 0, 0));
    expect(result.getHours()).toBe(23);
    expect(result.getMinutes()).toBe(59);
    expect(result.getSeconds()).toBe(59);
    expect(result.getMilliseconds()).toBe(999);
    expect(result.getDate()).toBe(15);
  });
  it('endOfDay 2026-02-16', () => {
    const result = endOfDay(new Date(2026, 1, 16, 0, 0, 0));
    expect(result.getHours()).toBe(23);
    expect(result.getMinutes()).toBe(59);
    expect(result.getSeconds()).toBe(59);
    expect(result.getMilliseconds()).toBe(999);
    expect(result.getDate()).toBe(16);
  });
  it('endOfDay 2026-02-17', () => {
    const result = endOfDay(new Date(2026, 1, 17, 0, 0, 0));
    expect(result.getHours()).toBe(23);
    expect(result.getMinutes()).toBe(59);
    expect(result.getSeconds()).toBe(59);
    expect(result.getMilliseconds()).toBe(999);
    expect(result.getDate()).toBe(17);
  });
  it('endOfDay 2026-02-18', () => {
    const result = endOfDay(new Date(2026, 1, 18, 0, 0, 0));
    expect(result.getHours()).toBe(23);
    expect(result.getMinutes()).toBe(59);
    expect(result.getSeconds()).toBe(59);
    expect(result.getMilliseconds()).toBe(999);
    expect(result.getDate()).toBe(18);
  });
  it('endOfDay 2026-02-19', () => {
    const result = endOfDay(new Date(2026, 1, 19, 0, 0, 0));
    expect(result.getHours()).toBe(23);
    expect(result.getMinutes()).toBe(59);
    expect(result.getSeconds()).toBe(59);
    expect(result.getMilliseconds()).toBe(999);
    expect(result.getDate()).toBe(19);
  });
});

describe('getDaysInMonth', () => {
  it('getDaysInMonth 2020 month 1 is 31', () => {
    expect(getDaysInMonth(2020, 1)).toBe(31);
  });
  it('getDaysInMonth 2020 month 2 is 29', () => {
    expect(getDaysInMonth(2020, 2)).toBe(29);
  });
  it('getDaysInMonth 2020 month 3 is 31', () => {
    expect(getDaysInMonth(2020, 3)).toBe(31);
  });
  it('getDaysInMonth 2020 month 4 is 30', () => {
    expect(getDaysInMonth(2020, 4)).toBe(30);
  });
  it('getDaysInMonth 2020 month 5 is 31', () => {
    expect(getDaysInMonth(2020, 5)).toBe(31);
  });
  it('getDaysInMonth 2020 month 6 is 30', () => {
    expect(getDaysInMonth(2020, 6)).toBe(30);
  });
  it('getDaysInMonth 2020 month 7 is 31', () => {
    expect(getDaysInMonth(2020, 7)).toBe(31);
  });
  it('getDaysInMonth 2020 month 8 is 31', () => {
    expect(getDaysInMonth(2020, 8)).toBe(31);
  });
  it('getDaysInMonth 2020 month 9 is 30', () => {
    expect(getDaysInMonth(2020, 9)).toBe(30);
  });
  it('getDaysInMonth 2020 month 10 is 31', () => {
    expect(getDaysInMonth(2020, 10)).toBe(31);
  });
  it('getDaysInMonth 2020 month 11 is 30', () => {
    expect(getDaysInMonth(2020, 11)).toBe(30);
  });
  it('getDaysInMonth 2020 month 12 is 31', () => {
    expect(getDaysInMonth(2020, 12)).toBe(31);
  });
  it('getDaysInMonth 2021 month 1 is 31', () => {
    expect(getDaysInMonth(2021, 1)).toBe(31);
  });
  it('getDaysInMonth 2021 month 2 is 28', () => {
    expect(getDaysInMonth(2021, 2)).toBe(28);
  });
  it('getDaysInMonth 2021 month 3 is 31', () => {
    expect(getDaysInMonth(2021, 3)).toBe(31);
  });
  it('getDaysInMonth 2021 month 4 is 30', () => {
    expect(getDaysInMonth(2021, 4)).toBe(30);
  });
  it('getDaysInMonth 2021 month 5 is 31', () => {
    expect(getDaysInMonth(2021, 5)).toBe(31);
  });
  it('getDaysInMonth 2021 month 6 is 30', () => {
    expect(getDaysInMonth(2021, 6)).toBe(30);
  });
  it('getDaysInMonth 2021 month 7 is 31', () => {
    expect(getDaysInMonth(2021, 7)).toBe(31);
  });
  it('getDaysInMonth 2021 month 8 is 31', () => {
    expect(getDaysInMonth(2021, 8)).toBe(31);
  });
  it('getDaysInMonth 2021 month 9 is 30', () => {
    expect(getDaysInMonth(2021, 9)).toBe(30);
  });
  it('getDaysInMonth 2021 month 10 is 31', () => {
    expect(getDaysInMonth(2021, 10)).toBe(31);
  });
  it('getDaysInMonth 2021 month 11 is 30', () => {
    expect(getDaysInMonth(2021, 11)).toBe(30);
  });
  it('getDaysInMonth 2021 month 12 is 31', () => {
    expect(getDaysInMonth(2021, 12)).toBe(31);
  });
  it('getDaysInMonth 2022 month 1 is 31', () => {
    expect(getDaysInMonth(2022, 1)).toBe(31);
  });
  it('getDaysInMonth 2022 month 2 is 28', () => {
    expect(getDaysInMonth(2022, 2)).toBe(28);
  });
  it('getDaysInMonth 2022 month 3 is 31', () => {
    expect(getDaysInMonth(2022, 3)).toBe(31);
  });
  it('getDaysInMonth 2022 month 4 is 30', () => {
    expect(getDaysInMonth(2022, 4)).toBe(30);
  });
  it('getDaysInMonth 2022 month 5 is 31', () => {
    expect(getDaysInMonth(2022, 5)).toBe(31);
  });
  it('getDaysInMonth 2022 month 6 is 30', () => {
    expect(getDaysInMonth(2022, 6)).toBe(30);
  });
  it('getDaysInMonth 2022 month 7 is 31', () => {
    expect(getDaysInMonth(2022, 7)).toBe(31);
  });
  it('getDaysInMonth 2022 month 8 is 31', () => {
    expect(getDaysInMonth(2022, 8)).toBe(31);
  });
  it('getDaysInMonth 2022 month 9 is 30', () => {
    expect(getDaysInMonth(2022, 9)).toBe(30);
  });
  it('getDaysInMonth 2022 month 10 is 31', () => {
    expect(getDaysInMonth(2022, 10)).toBe(31);
  });
  it('getDaysInMonth 2022 month 11 is 30', () => {
    expect(getDaysInMonth(2022, 11)).toBe(30);
  });
  it('getDaysInMonth 2022 month 12 is 31', () => {
    expect(getDaysInMonth(2022, 12)).toBe(31);
  });
  it('getDaysInMonth 2023 month 1 is 31', () => {
    expect(getDaysInMonth(2023, 1)).toBe(31);
  });
  it('getDaysInMonth 2023 month 2 is 28', () => {
    expect(getDaysInMonth(2023, 2)).toBe(28);
  });
  it('getDaysInMonth 2023 month 3 is 31', () => {
    expect(getDaysInMonth(2023, 3)).toBe(31);
  });
  it('getDaysInMonth 2023 month 4 is 30', () => {
    expect(getDaysInMonth(2023, 4)).toBe(30);
  });
  it('getDaysInMonth 2023 month 5 is 31', () => {
    expect(getDaysInMonth(2023, 5)).toBe(31);
  });
  it('getDaysInMonth 2023 month 6 is 30', () => {
    expect(getDaysInMonth(2023, 6)).toBe(30);
  });
  it('getDaysInMonth 2023 month 7 is 31', () => {
    expect(getDaysInMonth(2023, 7)).toBe(31);
  });
  it('getDaysInMonth 2023 month 8 is 31', () => {
    expect(getDaysInMonth(2023, 8)).toBe(31);
  });
  it('getDaysInMonth 2023 month 9 is 30', () => {
    expect(getDaysInMonth(2023, 9)).toBe(30);
  });
  it('getDaysInMonth 2023 month 10 is 31', () => {
    expect(getDaysInMonth(2023, 10)).toBe(31);
  });
  it('getDaysInMonth 2023 month 11 is 30', () => {
    expect(getDaysInMonth(2023, 11)).toBe(30);
  });
  it('getDaysInMonth 2023 month 12 is 31', () => {
    expect(getDaysInMonth(2023, 12)).toBe(31);
  });
  it('getDaysInMonth 2024 month 1 is 31', () => {
    expect(getDaysInMonth(2024, 1)).toBe(31);
  });
  it('getDaysInMonth 2024 month 2 is 29', () => {
    expect(getDaysInMonth(2024, 2)).toBe(29);
  });
  it('getDaysInMonth 2024 month 3 is 31', () => {
    expect(getDaysInMonth(2024, 3)).toBe(31);
  });
  it('getDaysInMonth 2024 month 4 is 30', () => {
    expect(getDaysInMonth(2024, 4)).toBe(30);
  });
  it('getDaysInMonth 2024 month 5 is 31', () => {
    expect(getDaysInMonth(2024, 5)).toBe(31);
  });
  it('getDaysInMonth 2024 month 6 is 30', () => {
    expect(getDaysInMonth(2024, 6)).toBe(30);
  });
  it('getDaysInMonth 2024 month 7 is 31', () => {
    expect(getDaysInMonth(2024, 7)).toBe(31);
  });
  it('getDaysInMonth 2024 month 8 is 31', () => {
    expect(getDaysInMonth(2024, 8)).toBe(31);
  });
  it('getDaysInMonth 2024 month 9 is 30', () => {
    expect(getDaysInMonth(2024, 9)).toBe(30);
  });
  it('getDaysInMonth 2024 month 10 is 31', () => {
    expect(getDaysInMonth(2024, 10)).toBe(31);
  });
  it('getDaysInMonth 2024 month 11 is 30', () => {
    expect(getDaysInMonth(2024, 11)).toBe(30);
  });
  it('getDaysInMonth 2024 month 12 is 31', () => {
    expect(getDaysInMonth(2024, 12)).toBe(31);
  });
  it('getDaysInMonth 2025 month 1 is 31', () => {
    expect(getDaysInMonth(2025, 1)).toBe(31);
  });
  it('getDaysInMonth 2025 month 2 is 28', () => {
    expect(getDaysInMonth(2025, 2)).toBe(28);
  });
  it('getDaysInMonth 2025 month 3 is 31', () => {
    expect(getDaysInMonth(2025, 3)).toBe(31);
  });
  it('getDaysInMonth 2025 month 4 is 30', () => {
    expect(getDaysInMonth(2025, 4)).toBe(30);
  });
  it('getDaysInMonth 2025 month 5 is 31', () => {
    expect(getDaysInMonth(2025, 5)).toBe(31);
  });
  it('getDaysInMonth 2025 month 6 is 30', () => {
    expect(getDaysInMonth(2025, 6)).toBe(30);
  });
  it('getDaysInMonth 2025 month 7 is 31', () => {
    expect(getDaysInMonth(2025, 7)).toBe(31);
  });
  it('getDaysInMonth 2025 month 8 is 31', () => {
    expect(getDaysInMonth(2025, 8)).toBe(31);
  });
  it('getDaysInMonth 2025 month 9 is 30', () => {
    expect(getDaysInMonth(2025, 9)).toBe(30);
  });
  it('getDaysInMonth 2025 month 10 is 31', () => {
    expect(getDaysInMonth(2025, 10)).toBe(31);
  });
  it('getDaysInMonth 2025 month 11 is 30', () => {
    expect(getDaysInMonth(2025, 11)).toBe(30);
  });
  it('getDaysInMonth 2025 month 12 is 31', () => {
    expect(getDaysInMonth(2025, 12)).toBe(31);
  });
  it('getDaysInMonth 2026 month 1 is 31', () => {
    expect(getDaysInMonth(2026, 1)).toBe(31);
  });
  it('getDaysInMonth 2026 month 2 is 28', () => {
    expect(getDaysInMonth(2026, 2)).toBe(28);
  });
  it('getDaysInMonth 2026 month 3 is 31', () => {
    expect(getDaysInMonth(2026, 3)).toBe(31);
  });
  it('getDaysInMonth 2026 month 4 is 30', () => {
    expect(getDaysInMonth(2026, 4)).toBe(30);
  });
  it('getDaysInMonth 2026 month 5 is 31', () => {
    expect(getDaysInMonth(2026, 5)).toBe(31);
  });
  it('getDaysInMonth 2026 month 6 is 30', () => {
    expect(getDaysInMonth(2026, 6)).toBe(30);
  });
  it('getDaysInMonth 2026 month 7 is 31', () => {
    expect(getDaysInMonth(2026, 7)).toBe(31);
  });
  it('getDaysInMonth 2026 month 8 is 31', () => {
    expect(getDaysInMonth(2026, 8)).toBe(31);
  });
  it('getDaysInMonth 2026 month 9 is 30', () => {
    expect(getDaysInMonth(2026, 9)).toBe(30);
  });
  it('getDaysInMonth 2026 month 10 is 31', () => {
    expect(getDaysInMonth(2026, 10)).toBe(31);
  });
  it('getDaysInMonth 2026 month 11 is 30', () => {
    expect(getDaysInMonth(2026, 11)).toBe(30);
  });
  it('getDaysInMonth 2026 month 12 is 31', () => {
    expect(getDaysInMonth(2026, 12)).toBe(31);
  });
  it('getDaysInMonth 2027 month 1 is 31', () => {
    expect(getDaysInMonth(2027, 1)).toBe(31);
  });
  it('getDaysInMonth 2027 month 2 is 28', () => {
    expect(getDaysInMonth(2027, 2)).toBe(28);
  });
  it('getDaysInMonth 2027 month 3 is 31', () => {
    expect(getDaysInMonth(2027, 3)).toBe(31);
  });
  it('getDaysInMonth 2027 month 4 is 30', () => {
    expect(getDaysInMonth(2027, 4)).toBe(30);
  });
  it('getDaysInMonth 2027 month 5 is 31', () => {
    expect(getDaysInMonth(2027, 5)).toBe(31);
  });
  it('getDaysInMonth 2027 month 6 is 30', () => {
    expect(getDaysInMonth(2027, 6)).toBe(30);
  });
  it('getDaysInMonth 2027 month 7 is 31', () => {
    expect(getDaysInMonth(2027, 7)).toBe(31);
  });
  it('getDaysInMonth 2027 month 8 is 31', () => {
    expect(getDaysInMonth(2027, 8)).toBe(31);
  });
  it('getDaysInMonth 2027 month 9 is 30', () => {
    expect(getDaysInMonth(2027, 9)).toBe(30);
  });
  it('getDaysInMonth 2027 month 10 is 31', () => {
    expect(getDaysInMonth(2027, 10)).toBe(31);
  });
  it('getDaysInMonth 2027 month 11 is 30', () => {
    expect(getDaysInMonth(2027, 11)).toBe(30);
  });
  it('getDaysInMonth 2027 month 12 is 31', () => {
    expect(getDaysInMonth(2027, 12)).toBe(31);
  });
  it('getDaysInMonth 2028 month 1 is 31', () => {
    expect(getDaysInMonth(2028, 1)).toBe(31);
  });
  it('getDaysInMonth 2028 month 2 is 29', () => {
    expect(getDaysInMonth(2028, 2)).toBe(29);
  });
  it('getDaysInMonth 2028 month 3 is 31', () => {
    expect(getDaysInMonth(2028, 3)).toBe(31);
  });
  it('getDaysInMonth 2028 month 4 is 30', () => {
    expect(getDaysInMonth(2028, 4)).toBe(30);
  });
});

describe('isLeapYear and getDaysInMonth February', () => {
  it('Feb 2000 leap=true days=29', () => {
    expect(isLeapYear(2000)).toBe(true);
    expect(getDaysInMonth(2000, 2)).toBe(29);
  });
  it('Feb 2001 leap=false days=28', () => {
    expect(isLeapYear(2001)).toBe(false);
    expect(getDaysInMonth(2001, 2)).toBe(28);
  });
  it('Feb 2002 leap=false days=28', () => {
    expect(isLeapYear(2002)).toBe(false);
    expect(getDaysInMonth(2002, 2)).toBe(28);
  });
  it('Feb 2003 leap=false days=28', () => {
    expect(isLeapYear(2003)).toBe(false);
    expect(getDaysInMonth(2003, 2)).toBe(28);
  });
  it('Feb 2004 leap=true days=29', () => {
    expect(isLeapYear(2004)).toBe(true);
    expect(getDaysInMonth(2004, 2)).toBe(29);
  });
  it('Feb 2005 leap=false days=28', () => {
    expect(isLeapYear(2005)).toBe(false);
    expect(getDaysInMonth(2005, 2)).toBe(28);
  });
  it('Feb 2006 leap=false days=28', () => {
    expect(isLeapYear(2006)).toBe(false);
    expect(getDaysInMonth(2006, 2)).toBe(28);
  });
  it('Feb 2007 leap=false days=28', () => {
    expect(isLeapYear(2007)).toBe(false);
    expect(getDaysInMonth(2007, 2)).toBe(28);
  });
  it('Feb 2008 leap=true days=29', () => {
    expect(isLeapYear(2008)).toBe(true);
    expect(getDaysInMonth(2008, 2)).toBe(29);
  });
  it('Feb 2009 leap=false days=28', () => {
    expect(isLeapYear(2009)).toBe(false);
    expect(getDaysInMonth(2009, 2)).toBe(28);
  });
  it('Feb 2010 leap=false days=28', () => {
    expect(isLeapYear(2010)).toBe(false);
    expect(getDaysInMonth(2010, 2)).toBe(28);
  });
  it('Feb 2011 leap=false days=28', () => {
    expect(isLeapYear(2011)).toBe(false);
    expect(getDaysInMonth(2011, 2)).toBe(28);
  });
  it('Feb 2012 leap=true days=29', () => {
    expect(isLeapYear(2012)).toBe(true);
    expect(getDaysInMonth(2012, 2)).toBe(29);
  });
  it('Feb 2013 leap=false days=28', () => {
    expect(isLeapYear(2013)).toBe(false);
    expect(getDaysInMonth(2013, 2)).toBe(28);
  });
  it('Feb 2014 leap=false days=28', () => {
    expect(isLeapYear(2014)).toBe(false);
    expect(getDaysInMonth(2014, 2)).toBe(28);
  });
  it('Feb 2015 leap=false days=28', () => {
    expect(isLeapYear(2015)).toBe(false);
    expect(getDaysInMonth(2015, 2)).toBe(28);
  });
  it('Feb 2016 leap=true days=29', () => {
    expect(isLeapYear(2016)).toBe(true);
    expect(getDaysInMonth(2016, 2)).toBe(29);
  });
  it('Feb 2017 leap=false days=28', () => {
    expect(isLeapYear(2017)).toBe(false);
    expect(getDaysInMonth(2017, 2)).toBe(28);
  });
  it('Feb 2018 leap=false days=28', () => {
    expect(isLeapYear(2018)).toBe(false);
    expect(getDaysInMonth(2018, 2)).toBe(28);
  });
  it('Feb 2019 leap=false days=28', () => {
    expect(isLeapYear(2019)).toBe(false);
    expect(getDaysInMonth(2019, 2)).toBe(28);
  });
  it('Feb 2020 leap=true days=29', () => {
    expect(isLeapYear(2020)).toBe(true);
    expect(getDaysInMonth(2020, 2)).toBe(29);
  });
  it('Feb 2021 leap=false days=28', () => {
    expect(isLeapYear(2021)).toBe(false);
    expect(getDaysInMonth(2021, 2)).toBe(28);
  });
  it('Feb 2022 leap=false days=28', () => {
    expect(isLeapYear(2022)).toBe(false);
    expect(getDaysInMonth(2022, 2)).toBe(28);
  });
  it('Feb 2023 leap=false days=28', () => {
    expect(isLeapYear(2023)).toBe(false);
    expect(getDaysInMonth(2023, 2)).toBe(28);
  });
  it('Feb 2024 leap=true days=29', () => {
    expect(isLeapYear(2024)).toBe(true);
    expect(getDaysInMonth(2024, 2)).toBe(29);
  });
  it('Feb 2025 leap=false days=28', () => {
    expect(isLeapYear(2025)).toBe(false);
    expect(getDaysInMonth(2025, 2)).toBe(28);
  });
  it('Feb 2026 leap=false days=28', () => {
    expect(isLeapYear(2026)).toBe(false);
    expect(getDaysInMonth(2026, 2)).toBe(28);
  });
  it('Feb 2027 leap=false days=28', () => {
    expect(isLeapYear(2027)).toBe(false);
    expect(getDaysInMonth(2027, 2)).toBe(28);
  });
  it('Feb 2028 leap=true days=29', () => {
    expect(isLeapYear(2028)).toBe(true);
    expect(getDaysInMonth(2028, 2)).toBe(29);
  });
  it('Feb 2029 leap=false days=28', () => {
    expect(isLeapYear(2029)).toBe(false);
    expect(getDaysInMonth(2029, 2)).toBe(28);
  });
  it('Feb 2030 leap=false days=28', () => {
    expect(isLeapYear(2030)).toBe(false);
    expect(getDaysInMonth(2030, 2)).toBe(28);
  });
  it('Feb 2031 leap=false days=28', () => {
    expect(isLeapYear(2031)).toBe(false);
    expect(getDaysInMonth(2031, 2)).toBe(28);
  });
  it('Feb 2032 leap=true days=29', () => {
    expect(isLeapYear(2032)).toBe(true);
    expect(getDaysInMonth(2032, 2)).toBe(29);
  });
  it('Feb 2033 leap=false days=28', () => {
    expect(isLeapYear(2033)).toBe(false);
    expect(getDaysInMonth(2033, 2)).toBe(28);
  });
  it('Feb 2034 leap=false days=28', () => {
    expect(isLeapYear(2034)).toBe(false);
    expect(getDaysInMonth(2034, 2)).toBe(28);
  });
  it('Feb 2035 leap=false days=28', () => {
    expect(isLeapYear(2035)).toBe(false);
    expect(getDaysInMonth(2035, 2)).toBe(28);
  });
  it('Feb 2036 leap=true days=29', () => {
    expect(isLeapYear(2036)).toBe(true);
    expect(getDaysInMonth(2036, 2)).toBe(29);
  });
  it('Feb 2037 leap=false days=28', () => {
    expect(isLeapYear(2037)).toBe(false);
    expect(getDaysInMonth(2037, 2)).toBe(28);
  });
  it('Feb 2038 leap=false days=28', () => {
    expect(isLeapYear(2038)).toBe(false);
    expect(getDaysInMonth(2038, 2)).toBe(28);
  });
  it('Feb 2039 leap=false days=28', () => {
    expect(isLeapYear(2039)).toBe(false);
    expect(getDaysInMonth(2039, 2)).toBe(28);
  });
  it('Feb 2040 leap=true days=29', () => {
    expect(isLeapYear(2040)).toBe(true);
    expect(getDaysInMonth(2040, 2)).toBe(29);
  });
  it('Feb 2041 leap=false days=28', () => {
    expect(isLeapYear(2041)).toBe(false);
    expect(getDaysInMonth(2041, 2)).toBe(28);
  });
  it('Feb 2042 leap=false days=28', () => {
    expect(isLeapYear(2042)).toBe(false);
    expect(getDaysInMonth(2042, 2)).toBe(28);
  });
  it('Feb 2043 leap=false days=28', () => {
    expect(isLeapYear(2043)).toBe(false);
    expect(getDaysInMonth(2043, 2)).toBe(28);
  });
  it('Feb 2044 leap=true days=29', () => {
    expect(isLeapYear(2044)).toBe(true);
    expect(getDaysInMonth(2044, 2)).toBe(29);
  });
  it('Feb 2045 leap=false days=28', () => {
    expect(isLeapYear(2045)).toBe(false);
    expect(getDaysInMonth(2045, 2)).toBe(28);
  });
  it('Feb 2046 leap=false days=28', () => {
    expect(isLeapYear(2046)).toBe(false);
    expect(getDaysInMonth(2046, 2)).toBe(28);
  });
  it('Feb 2047 leap=false days=28', () => {
    expect(isLeapYear(2047)).toBe(false);
    expect(getDaysInMonth(2047, 2)).toBe(28);
  });
  it('Feb 2048 leap=true days=29', () => {
    expect(isLeapYear(2048)).toBe(true);
    expect(getDaysInMonth(2048, 2)).toBe(29);
  });
  it('Feb 2049 leap=false days=28', () => {
    expect(isLeapYear(2049)).toBe(false);
    expect(getDaysInMonth(2049, 2)).toBe(28);
  });
  it('Feb 2050 leap=false days=28', () => {
    expect(isLeapYear(2050)).toBe(false);
    expect(getDaysInMonth(2050, 2)).toBe(28);
  });
  it('Feb 2051 leap=false days=28', () => {
    expect(isLeapYear(2051)).toBe(false);
    expect(getDaysInMonth(2051, 2)).toBe(28);
  });
  it('Feb 2052 leap=true days=29', () => {
    expect(isLeapYear(2052)).toBe(true);
    expect(getDaysInMonth(2052, 2)).toBe(29);
  });
  it('Feb 2053 leap=false days=28', () => {
    expect(isLeapYear(2053)).toBe(false);
    expect(getDaysInMonth(2053, 2)).toBe(28);
  });
  it('Feb 2054 leap=false days=28', () => {
    expect(isLeapYear(2054)).toBe(false);
    expect(getDaysInMonth(2054, 2)).toBe(28);
  });
  it('Feb 2055 leap=false days=28', () => {
    expect(isLeapYear(2055)).toBe(false);
    expect(getDaysInMonth(2055, 2)).toBe(28);
  });
  it('Feb 2056 leap=true days=29', () => {
    expect(isLeapYear(2056)).toBe(true);
    expect(getDaysInMonth(2056, 2)).toBe(29);
  });
  it('Feb 2057 leap=false days=28', () => {
    expect(isLeapYear(2057)).toBe(false);
    expect(getDaysInMonth(2057, 2)).toBe(28);
  });
  it('Feb 2058 leap=false days=28', () => {
    expect(isLeapYear(2058)).toBe(false);
    expect(getDaysInMonth(2058, 2)).toBe(28);
  });
  it('Feb 2059 leap=false days=28', () => {
    expect(isLeapYear(2059)).toBe(false);
    expect(getDaysInMonth(2059, 2)).toBe(28);
  });
  it('Feb 2060 leap=true days=29', () => {
    expect(isLeapYear(2060)).toBe(true);
    expect(getDaysInMonth(2060, 2)).toBe(29);
  });
  it('Feb 2061 leap=false days=28', () => {
    expect(isLeapYear(2061)).toBe(false);
    expect(getDaysInMonth(2061, 2)).toBe(28);
  });
  it('Feb 2062 leap=false days=28', () => {
    expect(isLeapYear(2062)).toBe(false);
    expect(getDaysInMonth(2062, 2)).toBe(28);
  });
  it('Feb 2063 leap=false days=28', () => {
    expect(isLeapYear(2063)).toBe(false);
    expect(getDaysInMonth(2063, 2)).toBe(28);
  });
  it('Feb 2064 leap=true days=29', () => {
    expect(isLeapYear(2064)).toBe(true);
    expect(getDaysInMonth(2064, 2)).toBe(29);
  });
  it('Feb 2065 leap=false days=28', () => {
    expect(isLeapYear(2065)).toBe(false);
    expect(getDaysInMonth(2065, 2)).toBe(28);
  });
  it('Feb 2066 leap=false days=28', () => {
    expect(isLeapYear(2066)).toBe(false);
    expect(getDaysInMonth(2066, 2)).toBe(28);
  });
  it('Feb 2067 leap=false days=28', () => {
    expect(isLeapYear(2067)).toBe(false);
    expect(getDaysInMonth(2067, 2)).toBe(28);
  });
  it('Feb 2068 leap=true days=29', () => {
    expect(isLeapYear(2068)).toBe(true);
    expect(getDaysInMonth(2068, 2)).toBe(29);
  });
  it('Feb 2069 leap=false days=28', () => {
    expect(isLeapYear(2069)).toBe(false);
    expect(getDaysInMonth(2069, 2)).toBe(28);
  });
  it('Feb 2070 leap=false days=28', () => {
    expect(isLeapYear(2070)).toBe(false);
    expect(getDaysInMonth(2070, 2)).toBe(28);
  });
  it('Feb 2071 leap=false days=28', () => {
    expect(isLeapYear(2071)).toBe(false);
    expect(getDaysInMonth(2071, 2)).toBe(28);
  });
  it('Feb 2072 leap=true days=29', () => {
    expect(isLeapYear(2072)).toBe(true);
    expect(getDaysInMonth(2072, 2)).toBe(29);
  });
  it('Feb 2073 leap=false days=28', () => {
    expect(isLeapYear(2073)).toBe(false);
    expect(getDaysInMonth(2073, 2)).toBe(28);
  });
  it('Feb 2074 leap=false days=28', () => {
    expect(isLeapYear(2074)).toBe(false);
    expect(getDaysInMonth(2074, 2)).toBe(28);
  });
  it('Feb 2075 leap=false days=28', () => {
    expect(isLeapYear(2075)).toBe(false);
    expect(getDaysInMonth(2075, 2)).toBe(28);
  });
  it('Feb 2076 leap=true days=29', () => {
    expect(isLeapYear(2076)).toBe(true);
    expect(getDaysInMonth(2076, 2)).toBe(29);
  });
  it('Feb 2077 leap=false days=28', () => {
    expect(isLeapYear(2077)).toBe(false);
    expect(getDaysInMonth(2077, 2)).toBe(28);
  });
  it('Feb 2078 leap=false days=28', () => {
    expect(isLeapYear(2078)).toBe(false);
    expect(getDaysInMonth(2078, 2)).toBe(28);
  });
  it('Feb 2079 leap=false days=28', () => {
    expect(isLeapYear(2079)).toBe(false);
    expect(getDaysInMonth(2079, 2)).toBe(28);
  });
  it('Feb 2080 leap=true days=29', () => {
    expect(isLeapYear(2080)).toBe(true);
    expect(getDaysInMonth(2080, 2)).toBe(29);
  });
  it('Feb 2081 leap=false days=28', () => {
    expect(isLeapYear(2081)).toBe(false);
    expect(getDaysInMonth(2081, 2)).toBe(28);
  });
  it('Feb 2082 leap=false days=28', () => {
    expect(isLeapYear(2082)).toBe(false);
    expect(getDaysInMonth(2082, 2)).toBe(28);
  });
  it('Feb 2083 leap=false days=28', () => {
    expect(isLeapYear(2083)).toBe(false);
    expect(getDaysInMonth(2083, 2)).toBe(28);
  });
  it('Feb 2084 leap=true days=29', () => {
    expect(isLeapYear(2084)).toBe(true);
    expect(getDaysInMonth(2084, 2)).toBe(29);
  });
  it('Feb 2085 leap=false days=28', () => {
    expect(isLeapYear(2085)).toBe(false);
    expect(getDaysInMonth(2085, 2)).toBe(28);
  });
  it('Feb 2086 leap=false days=28', () => {
    expect(isLeapYear(2086)).toBe(false);
    expect(getDaysInMonth(2086, 2)).toBe(28);
  });
  it('Feb 2087 leap=false days=28', () => {
    expect(isLeapYear(2087)).toBe(false);
    expect(getDaysInMonth(2087, 2)).toBe(28);
  });
  it('Feb 2088 leap=true days=29', () => {
    expect(isLeapYear(2088)).toBe(true);
    expect(getDaysInMonth(2088, 2)).toBe(29);
  });
  it('Feb 2089 leap=false days=28', () => {
    expect(isLeapYear(2089)).toBe(false);
    expect(getDaysInMonth(2089, 2)).toBe(28);
  });
  it('Feb 2090 leap=false days=28', () => {
    expect(isLeapYear(2090)).toBe(false);
    expect(getDaysInMonth(2090, 2)).toBe(28);
  });
  it('Feb 2091 leap=false days=28', () => {
    expect(isLeapYear(2091)).toBe(false);
    expect(getDaysInMonth(2091, 2)).toBe(28);
  });
  it('Feb 2092 leap=true days=29', () => {
    expect(isLeapYear(2092)).toBe(true);
    expect(getDaysInMonth(2092, 2)).toBe(29);
  });
  it('Feb 2093 leap=false days=28', () => {
    expect(isLeapYear(2093)).toBe(false);
    expect(getDaysInMonth(2093, 2)).toBe(28);
  });
  it('Feb 2094 leap=false days=28', () => {
    expect(isLeapYear(2094)).toBe(false);
    expect(getDaysInMonth(2094, 2)).toBe(28);
  });
  it('Feb 2095 leap=false days=28', () => {
    expect(isLeapYear(2095)).toBe(false);
    expect(getDaysInMonth(2095, 2)).toBe(28);
  });
  it('Feb 2096 leap=true days=29', () => {
    expect(isLeapYear(2096)).toBe(true);
    expect(getDaysInMonth(2096, 2)).toBe(29);
  });
  it('Feb 2097 leap=false days=28', () => {
    expect(isLeapYear(2097)).toBe(false);
    expect(getDaysInMonth(2097, 2)).toBe(28);
  });
  it('Feb 2098 leap=false days=28', () => {
    expect(isLeapYear(2098)).toBe(false);
    expect(getDaysInMonth(2098, 2)).toBe(28);
  });
  it('Feb 2099 leap=false days=28', () => {
    expect(isLeapYear(2099)).toBe(false);
    expect(getDaysInMonth(2099, 2)).toBe(28);
  });
});

describe('addHours addMinutes addSeconds', () => {
  it('addHours by 1', () => {
    const base = new Date(2026, 0, 1, 0, 0, 0);
    const result = addHours(base, 1);
    expect(result.getTime() - base.getTime()).toBe(1 * 3600000);
  });
  it('addHours by 2', () => {
    const base = new Date(2026, 0, 1, 0, 0, 0);
    const result = addHours(base, 2);
    expect(result.getTime() - base.getTime()).toBe(2 * 3600000);
  });
  it('addHours by 3', () => {
    const base = new Date(2026, 0, 1, 0, 0, 0);
    const result = addHours(base, 3);
    expect(result.getTime() - base.getTime()).toBe(3 * 3600000);
  });
  it('addHours by 4', () => {
    const base = new Date(2026, 0, 1, 0, 0, 0);
    const result = addHours(base, 4);
    expect(result.getTime() - base.getTime()).toBe(4 * 3600000);
  });
  it('addHours by 5', () => {
    const base = new Date(2026, 0, 1, 0, 0, 0);
    const result = addHours(base, 5);
    expect(result.getTime() - base.getTime()).toBe(5 * 3600000);
  });
  it('addHours by 6', () => {
    const base = new Date(2026, 0, 1, 0, 0, 0);
    const result = addHours(base, 6);
    expect(result.getTime() - base.getTime()).toBe(6 * 3600000);
  });
  it('addHours by 7', () => {
    const base = new Date(2026, 0, 1, 0, 0, 0);
    const result = addHours(base, 7);
    expect(result.getTime() - base.getTime()).toBe(7 * 3600000);
  });
  it('addHours by 8', () => {
    const base = new Date(2026, 0, 1, 0, 0, 0);
    const result = addHours(base, 8);
    expect(result.getTime() - base.getTime()).toBe(8 * 3600000);
  });
  it('addHours by 9', () => {
    const base = new Date(2026, 0, 1, 0, 0, 0);
    const result = addHours(base, 9);
    expect(result.getTime() - base.getTime()).toBe(9 * 3600000);
  });
  it('addHours by 10', () => {
    const base = new Date(2026, 0, 1, 0, 0, 0);
    const result = addHours(base, 10);
    expect(result.getTime() - base.getTime()).toBe(10 * 3600000);
  });
  it('addHours by 11', () => {
    const base = new Date(2026, 0, 1, 0, 0, 0);
    const result = addHours(base, 11);
    expect(result.getTime() - base.getTime()).toBe(11 * 3600000);
  });
  it('addHours by 12', () => {
    const base = new Date(2026, 0, 1, 0, 0, 0);
    const result = addHours(base, 12);
    expect(result.getTime() - base.getTime()).toBe(12 * 3600000);
  });
  it('addHours by 13', () => {
    const base = new Date(2026, 0, 1, 0, 0, 0);
    const result = addHours(base, 13);
    expect(result.getTime() - base.getTime()).toBe(13 * 3600000);
  });
  it('addHours by 14', () => {
    const base = new Date(2026, 0, 1, 0, 0, 0);
    const result = addHours(base, 14);
    expect(result.getTime() - base.getTime()).toBe(14 * 3600000);
  });
  it('addHours by 15', () => {
    const base = new Date(2026, 0, 1, 0, 0, 0);
    const result = addHours(base, 15);
    expect(result.getTime() - base.getTime()).toBe(15 * 3600000);
  });
  it('addHours by 16', () => {
    const base = new Date(2026, 0, 1, 0, 0, 0);
    const result = addHours(base, 16);
    expect(result.getTime() - base.getTime()).toBe(16 * 3600000);
  });
  it('addHours by 17', () => {
    const base = new Date(2026, 0, 1, 0, 0, 0);
    const result = addHours(base, 17);
    expect(result.getTime() - base.getTime()).toBe(17 * 3600000);
  });
  it('addHours by 18', () => {
    const base = new Date(2026, 0, 1, 0, 0, 0);
    const result = addHours(base, 18);
    expect(result.getTime() - base.getTime()).toBe(18 * 3600000);
  });
  it('addHours by 19', () => {
    const base = new Date(2026, 0, 1, 0, 0, 0);
    const result = addHours(base, 19);
    expect(result.getTime() - base.getTime()).toBe(19 * 3600000);
  });
  it('addHours by 20', () => {
    const base = new Date(2026, 0, 1, 0, 0, 0);
    const result = addHours(base, 20);
    expect(result.getTime() - base.getTime()).toBe(20 * 3600000);
  });
  it('addMinutes by 1', () => {
    const base = new Date(2026, 0, 1, 0, 0, 0);
    const result = addMinutes(base, 1);
    expect(result.getTime() - base.getTime()).toBe(1 * 60000);
  });
  it('addMinutes by 2', () => {
    const base = new Date(2026, 0, 1, 0, 0, 0);
    const result = addMinutes(base, 2);
    expect(result.getTime() - base.getTime()).toBe(2 * 60000);
  });
  it('addMinutes by 3', () => {
    const base = new Date(2026, 0, 1, 0, 0, 0);
    const result = addMinutes(base, 3);
    expect(result.getTime() - base.getTime()).toBe(3 * 60000);
  });
  it('addMinutes by 4', () => {
    const base = new Date(2026, 0, 1, 0, 0, 0);
    const result = addMinutes(base, 4);
    expect(result.getTime() - base.getTime()).toBe(4 * 60000);
  });
  it('addMinutes by 5', () => {
    const base = new Date(2026, 0, 1, 0, 0, 0);
    const result = addMinutes(base, 5);
    expect(result.getTime() - base.getTime()).toBe(5 * 60000);
  });
  it('addMinutes by 6', () => {
    const base = new Date(2026, 0, 1, 0, 0, 0);
    const result = addMinutes(base, 6);
    expect(result.getTime() - base.getTime()).toBe(6 * 60000);
  });
  it('addMinutes by 7', () => {
    const base = new Date(2026, 0, 1, 0, 0, 0);
    const result = addMinutes(base, 7);
    expect(result.getTime() - base.getTime()).toBe(7 * 60000);
  });
  it('addMinutes by 8', () => {
    const base = new Date(2026, 0, 1, 0, 0, 0);
    const result = addMinutes(base, 8);
    expect(result.getTime() - base.getTime()).toBe(8 * 60000);
  });
  it('addMinutes by 9', () => {
    const base = new Date(2026, 0, 1, 0, 0, 0);
    const result = addMinutes(base, 9);
    expect(result.getTime() - base.getTime()).toBe(9 * 60000);
  });
  it('addMinutes by 10', () => {
    const base = new Date(2026, 0, 1, 0, 0, 0);
    const result = addMinutes(base, 10);
    expect(result.getTime() - base.getTime()).toBe(10 * 60000);
  });
  it('addMinutes by 11', () => {
    const base = new Date(2026, 0, 1, 0, 0, 0);
    const result = addMinutes(base, 11);
    expect(result.getTime() - base.getTime()).toBe(11 * 60000);
  });
  it('addMinutes by 12', () => {
    const base = new Date(2026, 0, 1, 0, 0, 0);
    const result = addMinutes(base, 12);
    expect(result.getTime() - base.getTime()).toBe(12 * 60000);
  });
  it('addMinutes by 13', () => {
    const base = new Date(2026, 0, 1, 0, 0, 0);
    const result = addMinutes(base, 13);
    expect(result.getTime() - base.getTime()).toBe(13 * 60000);
  });
  it('addMinutes by 14', () => {
    const base = new Date(2026, 0, 1, 0, 0, 0);
    const result = addMinutes(base, 14);
    expect(result.getTime() - base.getTime()).toBe(14 * 60000);
  });
  it('addMinutes by 15', () => {
    const base = new Date(2026, 0, 1, 0, 0, 0);
    const result = addMinutes(base, 15);
    expect(result.getTime() - base.getTime()).toBe(15 * 60000);
  });
  it('addMinutes by 16', () => {
    const base = new Date(2026, 0, 1, 0, 0, 0);
    const result = addMinutes(base, 16);
    expect(result.getTime() - base.getTime()).toBe(16 * 60000);
  });
  it('addMinutes by 17', () => {
    const base = new Date(2026, 0, 1, 0, 0, 0);
    const result = addMinutes(base, 17);
    expect(result.getTime() - base.getTime()).toBe(17 * 60000);
  });
  it('addMinutes by 18', () => {
    const base = new Date(2026, 0, 1, 0, 0, 0);
    const result = addMinutes(base, 18);
    expect(result.getTime() - base.getTime()).toBe(18 * 60000);
  });
  it('addMinutes by 19', () => {
    const base = new Date(2026, 0, 1, 0, 0, 0);
    const result = addMinutes(base, 19);
    expect(result.getTime() - base.getTime()).toBe(19 * 60000);
  });
  it('addMinutes by 20', () => {
    const base = new Date(2026, 0, 1, 0, 0, 0);
    const result = addMinutes(base, 20);
    expect(result.getTime() - base.getTime()).toBe(20 * 60000);
  });
  it('addSeconds by 1', () => {
    const base = new Date(2026, 0, 1, 0, 0, 0);
    const result = addSeconds(base, 1);
    expect(result.getTime() - base.getTime()).toBe(1 * 1000);
  });
  it('addSeconds by 2', () => {
    const base = new Date(2026, 0, 1, 0, 0, 0);
    const result = addSeconds(base, 2);
    expect(result.getTime() - base.getTime()).toBe(2 * 1000);
  });
  it('addSeconds by 3', () => {
    const base = new Date(2026, 0, 1, 0, 0, 0);
    const result = addSeconds(base, 3);
    expect(result.getTime() - base.getTime()).toBe(3 * 1000);
  });
  it('addSeconds by 4', () => {
    const base = new Date(2026, 0, 1, 0, 0, 0);
    const result = addSeconds(base, 4);
    expect(result.getTime() - base.getTime()).toBe(4 * 1000);
  });
  it('addSeconds by 5', () => {
    const base = new Date(2026, 0, 1, 0, 0, 0);
    const result = addSeconds(base, 5);
    expect(result.getTime() - base.getTime()).toBe(5 * 1000);
  });
  it('addSeconds by 6', () => {
    const base = new Date(2026, 0, 1, 0, 0, 0);
    const result = addSeconds(base, 6);
    expect(result.getTime() - base.getTime()).toBe(6 * 1000);
  });
  it('addSeconds by 7', () => {
    const base = new Date(2026, 0, 1, 0, 0, 0);
    const result = addSeconds(base, 7);
    expect(result.getTime() - base.getTime()).toBe(7 * 1000);
  });
  it('addSeconds by 8', () => {
    const base = new Date(2026, 0, 1, 0, 0, 0);
    const result = addSeconds(base, 8);
    expect(result.getTime() - base.getTime()).toBe(8 * 1000);
  });
  it('addSeconds by 9', () => {
    const base = new Date(2026, 0, 1, 0, 0, 0);
    const result = addSeconds(base, 9);
    expect(result.getTime() - base.getTime()).toBe(9 * 1000);
  });
  it('addSeconds by 10', () => {
    const base = new Date(2026, 0, 1, 0, 0, 0);
    const result = addSeconds(base, 10);
    expect(result.getTime() - base.getTime()).toBe(10 * 1000);
  });
  it('addSeconds by 11', () => {
    const base = new Date(2026, 0, 1, 0, 0, 0);
    const result = addSeconds(base, 11);
    expect(result.getTime() - base.getTime()).toBe(11 * 1000);
  });
  it('addSeconds by 12', () => {
    const base = new Date(2026, 0, 1, 0, 0, 0);
    const result = addSeconds(base, 12);
    expect(result.getTime() - base.getTime()).toBe(12 * 1000);
  });
  it('addSeconds by 13', () => {
    const base = new Date(2026, 0, 1, 0, 0, 0);
    const result = addSeconds(base, 13);
    expect(result.getTime() - base.getTime()).toBe(13 * 1000);
  });
  it('addSeconds by 14', () => {
    const base = new Date(2026, 0, 1, 0, 0, 0);
    const result = addSeconds(base, 14);
    expect(result.getTime() - base.getTime()).toBe(14 * 1000);
  });
  it('addSeconds by 15', () => {
    const base = new Date(2026, 0, 1, 0, 0, 0);
    const result = addSeconds(base, 15);
    expect(result.getTime() - base.getTime()).toBe(15 * 1000);
  });
  it('addSeconds by 16', () => {
    const base = new Date(2026, 0, 1, 0, 0, 0);
    const result = addSeconds(base, 16);
    expect(result.getTime() - base.getTime()).toBe(16 * 1000);
  });
  it('addSeconds by 17', () => {
    const base = new Date(2026, 0, 1, 0, 0, 0);
    const result = addSeconds(base, 17);
    expect(result.getTime() - base.getTime()).toBe(17 * 1000);
  });
  it('addSeconds by 18', () => {
    const base = new Date(2026, 0, 1, 0, 0, 0);
    const result = addSeconds(base, 18);
    expect(result.getTime() - base.getTime()).toBe(18 * 1000);
  });
  it('addSeconds by 19', () => {
    const base = new Date(2026, 0, 1, 0, 0, 0);
    const result = addSeconds(base, 19);
    expect(result.getTime() - base.getTime()).toBe(19 * 1000);
  });
  it('addSeconds by 20', () => {
    const base = new Date(2026, 0, 1, 0, 0, 0);
    const result = addSeconds(base, 20);
    expect(result.getTime() - base.getTime()).toBe(20 * 1000);
  });
});

describe('subYears', () => {
  it('subYears 2026 minus 1 yields 2025', () => {
    const result = subYears(new Date(2026, 5, 15), 1);
    expect(result.getFullYear()).toBe(2025);
    expect(result.getMonth() + 1).toBe(6);
    expect(result.getDate()).toBe(15);
  });
  it('subYears 2026 minus 2 yields 2024', () => {
    const result = subYears(new Date(2026, 5, 15), 2);
    expect(result.getFullYear()).toBe(2024);
    expect(result.getMonth() + 1).toBe(6);
    expect(result.getDate()).toBe(15);
  });
  it('subYears 2026 minus 3 yields 2023', () => {
    const result = subYears(new Date(2026, 5, 15), 3);
    expect(result.getFullYear()).toBe(2023);
    expect(result.getMonth() + 1).toBe(6);
    expect(result.getDate()).toBe(15);
  });
  it('subYears 2026 minus 4 yields 2022', () => {
    const result = subYears(new Date(2026, 5, 15), 4);
    expect(result.getFullYear()).toBe(2022);
    expect(result.getMonth() + 1).toBe(6);
    expect(result.getDate()).toBe(15);
  });
  it('subYears 2026 minus 5 yields 2021', () => {
    const result = subYears(new Date(2026, 5, 15), 5);
    expect(result.getFullYear()).toBe(2021);
    expect(result.getMonth() + 1).toBe(6);
    expect(result.getDate()).toBe(15);
  });
  it('subYears 2026 minus 6 yields 2020', () => {
    const result = subYears(new Date(2026, 5, 15), 6);
    expect(result.getFullYear()).toBe(2020);
    expect(result.getMonth() + 1).toBe(6);
    expect(result.getDate()).toBe(15);
  });
  it('subYears 2026 minus 7 yields 2019', () => {
    const result = subYears(new Date(2026, 5, 15), 7);
    expect(result.getFullYear()).toBe(2019);
    expect(result.getMonth() + 1).toBe(6);
    expect(result.getDate()).toBe(15);
  });
  it('subYears 2026 minus 8 yields 2018', () => {
    const result = subYears(new Date(2026, 5, 15), 8);
    expect(result.getFullYear()).toBe(2018);
    expect(result.getMonth() + 1).toBe(6);
    expect(result.getDate()).toBe(15);
  });
  it('subYears 2026 minus 9 yields 2017', () => {
    const result = subYears(new Date(2026, 5, 15), 9);
    expect(result.getFullYear()).toBe(2017);
    expect(result.getMonth() + 1).toBe(6);
    expect(result.getDate()).toBe(15);
  });
  it('subYears 2026 minus 10 yields 2016', () => {
    const result = subYears(new Date(2026, 5, 15), 10);
    expect(result.getFullYear()).toBe(2016);
    expect(result.getMonth() + 1).toBe(6);
    expect(result.getDate()).toBe(15);
  });
  it('subYears 2026 minus 11 yields 2015', () => {
    const result = subYears(new Date(2026, 5, 15), 11);
    expect(result.getFullYear()).toBe(2015);
    expect(result.getMonth() + 1).toBe(6);
    expect(result.getDate()).toBe(15);
  });
  it('subYears 2026 minus 12 yields 2014', () => {
    const result = subYears(new Date(2026, 5, 15), 12);
    expect(result.getFullYear()).toBe(2014);
    expect(result.getMonth() + 1).toBe(6);
    expect(result.getDate()).toBe(15);
  });
  it('subYears 2026 minus 13 yields 2013', () => {
    const result = subYears(new Date(2026, 5, 15), 13);
    expect(result.getFullYear()).toBe(2013);
    expect(result.getMonth() + 1).toBe(6);
    expect(result.getDate()).toBe(15);
  });
  it('subYears 2026 minus 14 yields 2012', () => {
    const result = subYears(new Date(2026, 5, 15), 14);
    expect(result.getFullYear()).toBe(2012);
    expect(result.getMonth() + 1).toBe(6);
    expect(result.getDate()).toBe(15);
  });
  it('subYears 2026 minus 15 yields 2011', () => {
    const result = subYears(new Date(2026, 5, 15), 15);
    expect(result.getFullYear()).toBe(2011);
    expect(result.getMonth() + 1).toBe(6);
    expect(result.getDate()).toBe(15);
  });
  it('subYears 2026 minus 16 yields 2010', () => {
    const result = subYears(new Date(2026, 5, 15), 16);
    expect(result.getFullYear()).toBe(2010);
    expect(result.getMonth() + 1).toBe(6);
    expect(result.getDate()).toBe(15);
  });
  it('subYears 2026 minus 17 yields 2009', () => {
    const result = subYears(new Date(2026, 5, 15), 17);
    expect(result.getFullYear()).toBe(2009);
    expect(result.getMonth() + 1).toBe(6);
    expect(result.getDate()).toBe(15);
  });
  it('subYears 2026 minus 18 yields 2008', () => {
    const result = subYears(new Date(2026, 5, 15), 18);
    expect(result.getFullYear()).toBe(2008);
    expect(result.getMonth() + 1).toBe(6);
    expect(result.getDate()).toBe(15);
  });
  it('subYears 2026 minus 19 yields 2007', () => {
    const result = subYears(new Date(2026, 5, 15), 19);
    expect(result.getFullYear()).toBe(2007);
    expect(result.getMonth() + 1).toBe(6);
    expect(result.getDate()).toBe(15);
  });
  it('subYears 2026 minus 20 yields 2006', () => {
    const result = subYears(new Date(2026, 5, 15), 20);
    expect(result.getFullYear()).toBe(2006);
    expect(result.getMonth() + 1).toBe(6);
    expect(result.getDate()).toBe(15);
  });
  it('subYears 2026 minus 21 yields 2005', () => {
    const result = subYears(new Date(2026, 5, 15), 21);
    expect(result.getFullYear()).toBe(2005);
    expect(result.getMonth() + 1).toBe(6);
    expect(result.getDate()).toBe(15);
  });
  it('subYears 2026 minus 22 yields 2004', () => {
    const result = subYears(new Date(2026, 5, 15), 22);
    expect(result.getFullYear()).toBe(2004);
    expect(result.getMonth() + 1).toBe(6);
    expect(result.getDate()).toBe(15);
  });
  it('subYears 2026 minus 23 yields 2003', () => {
    const result = subYears(new Date(2026, 5, 15), 23);
    expect(result.getFullYear()).toBe(2003);
    expect(result.getMonth() + 1).toBe(6);
    expect(result.getDate()).toBe(15);
  });
  it('subYears 2026 minus 24 yields 2002', () => {
    const result = subYears(new Date(2026, 5, 15), 24);
    expect(result.getFullYear()).toBe(2002);
    expect(result.getMonth() + 1).toBe(6);
    expect(result.getDate()).toBe(15);
  });
  it('subYears 2026 minus 25 yields 2001', () => {
    const result = subYears(new Date(2026, 5, 15), 25);
    expect(result.getFullYear()).toBe(2001);
    expect(result.getMonth() + 1).toBe(6);
    expect(result.getDate()).toBe(15);
  });
  it('subYears 2026 minus 26 yields 2000', () => {
    const result = subYears(new Date(2026, 5, 15), 26);
    expect(result.getFullYear()).toBe(2000);
    expect(result.getMonth() + 1).toBe(6);
    expect(result.getDate()).toBe(15);
  });
  it('subYears 2026 minus 27 yields 1999', () => {
    const result = subYears(new Date(2026, 5, 15), 27);
    expect(result.getFullYear()).toBe(1999);
    expect(result.getMonth() + 1).toBe(6);
    expect(result.getDate()).toBe(15);
  });
  it('subYears 2026 minus 28 yields 1998', () => {
    const result = subYears(new Date(2026, 5, 15), 28);
    expect(result.getFullYear()).toBe(1998);
    expect(result.getMonth() + 1).toBe(6);
    expect(result.getDate()).toBe(15);
  });
  it('subYears 2026 minus 29 yields 1997', () => {
    const result = subYears(new Date(2026, 5, 15), 29);
    expect(result.getFullYear()).toBe(1997);
    expect(result.getMonth() + 1).toBe(6);
    expect(result.getDate()).toBe(15);
  });
  it('subYears 2026 minus 30 yields 1996', () => {
    const result = subYears(new Date(2026, 5, 15), 30);
    expect(result.getFullYear()).toBe(1996);
    expect(result.getMonth() + 1).toBe(6);
    expect(result.getDate()).toBe(15);
  });
});

describe('diffHours and diffMinutes', () => {
  it('diffHours 1h apart', () => {
    const a = new Date(2026, 0, 1, 0, 0, 0);
    const b = new Date(a.getTime() + 1 * 3600000);
    expect(diffHours(a, b)).toBe(1);
    expect(diffHours(b, a)).toBe(1);
  });
  it('diffHours 2h apart', () => {
    const a = new Date(2026, 0, 1, 0, 0, 0);
    const b = new Date(a.getTime() + 2 * 3600000);
    expect(diffHours(a, b)).toBe(2);
    expect(diffHours(b, a)).toBe(2);
  });
  it('diffHours 3h apart', () => {
    const a = new Date(2026, 0, 1, 0, 0, 0);
    const b = new Date(a.getTime() + 3 * 3600000);
    expect(diffHours(a, b)).toBe(3);
    expect(diffHours(b, a)).toBe(3);
  });
  it('diffHours 4h apart', () => {
    const a = new Date(2026, 0, 1, 0, 0, 0);
    const b = new Date(a.getTime() + 4 * 3600000);
    expect(diffHours(a, b)).toBe(4);
    expect(diffHours(b, a)).toBe(4);
  });
  it('diffHours 5h apart', () => {
    const a = new Date(2026, 0, 1, 0, 0, 0);
    const b = new Date(a.getTime() + 5 * 3600000);
    expect(diffHours(a, b)).toBe(5);
    expect(diffHours(b, a)).toBe(5);
  });
  it('diffHours 6h apart', () => {
    const a = new Date(2026, 0, 1, 0, 0, 0);
    const b = new Date(a.getTime() + 6 * 3600000);
    expect(diffHours(a, b)).toBe(6);
    expect(diffHours(b, a)).toBe(6);
  });
  it('diffHours 7h apart', () => {
    const a = new Date(2026, 0, 1, 0, 0, 0);
    const b = new Date(a.getTime() + 7 * 3600000);
    expect(diffHours(a, b)).toBe(7);
    expect(diffHours(b, a)).toBe(7);
  });
  it('diffHours 8h apart', () => {
    const a = new Date(2026, 0, 1, 0, 0, 0);
    const b = new Date(a.getTime() + 8 * 3600000);
    expect(diffHours(a, b)).toBe(8);
    expect(diffHours(b, a)).toBe(8);
  });
  it('diffHours 9h apart', () => {
    const a = new Date(2026, 0, 1, 0, 0, 0);
    const b = new Date(a.getTime() + 9 * 3600000);
    expect(diffHours(a, b)).toBe(9);
    expect(diffHours(b, a)).toBe(9);
  });
  it('diffHours 10h apart', () => {
    const a = new Date(2026, 0, 1, 0, 0, 0);
    const b = new Date(a.getTime() + 10 * 3600000);
    expect(diffHours(a, b)).toBe(10);
    expect(diffHours(b, a)).toBe(10);
  });
  it('diffHours 11h apart', () => {
    const a = new Date(2026, 0, 1, 0, 0, 0);
    const b = new Date(a.getTime() + 11 * 3600000);
    expect(diffHours(a, b)).toBe(11);
    expect(diffHours(b, a)).toBe(11);
  });
  it('diffHours 12h apart', () => {
    const a = new Date(2026, 0, 1, 0, 0, 0);
    const b = new Date(a.getTime() + 12 * 3600000);
    expect(diffHours(a, b)).toBe(12);
    expect(diffHours(b, a)).toBe(12);
  });
  it('diffHours 13h apart', () => {
    const a = new Date(2026, 0, 1, 0, 0, 0);
    const b = new Date(a.getTime() + 13 * 3600000);
    expect(diffHours(a, b)).toBe(13);
    expect(diffHours(b, a)).toBe(13);
  });
  it('diffHours 14h apart', () => {
    const a = new Date(2026, 0, 1, 0, 0, 0);
    const b = new Date(a.getTime() + 14 * 3600000);
    expect(diffHours(a, b)).toBe(14);
    expect(diffHours(b, a)).toBe(14);
  });
  it('diffHours 15h apart', () => {
    const a = new Date(2026, 0, 1, 0, 0, 0);
    const b = new Date(a.getTime() + 15 * 3600000);
    expect(diffHours(a, b)).toBe(15);
    expect(diffHours(b, a)).toBe(15);
  });
  it('diffHours 16h apart', () => {
    const a = new Date(2026, 0, 1, 0, 0, 0);
    const b = new Date(a.getTime() + 16 * 3600000);
    expect(diffHours(a, b)).toBe(16);
    expect(diffHours(b, a)).toBe(16);
  });
  it('diffHours 17h apart', () => {
    const a = new Date(2026, 0, 1, 0, 0, 0);
    const b = new Date(a.getTime() + 17 * 3600000);
    expect(diffHours(a, b)).toBe(17);
    expect(diffHours(b, a)).toBe(17);
  });
  it('diffHours 18h apart', () => {
    const a = new Date(2026, 0, 1, 0, 0, 0);
    const b = new Date(a.getTime() + 18 * 3600000);
    expect(diffHours(a, b)).toBe(18);
    expect(diffHours(b, a)).toBe(18);
  });
  it('diffHours 19h apart', () => {
    const a = new Date(2026, 0, 1, 0, 0, 0);
    const b = new Date(a.getTime() + 19 * 3600000);
    expect(diffHours(a, b)).toBe(19);
    expect(diffHours(b, a)).toBe(19);
  });
  it('diffHours 20h apart', () => {
    const a = new Date(2026, 0, 1, 0, 0, 0);
    const b = new Date(a.getTime() + 20 * 3600000);
    expect(diffHours(a, b)).toBe(20);
    expect(diffHours(b, a)).toBe(20);
  });
  it('diffHours 21h apart', () => {
    const a = new Date(2026, 0, 1, 0, 0, 0);
    const b = new Date(a.getTime() + 21 * 3600000);
    expect(diffHours(a, b)).toBe(21);
    expect(diffHours(b, a)).toBe(21);
  });
  it('diffHours 22h apart', () => {
    const a = new Date(2026, 0, 1, 0, 0, 0);
    const b = new Date(a.getTime() + 22 * 3600000);
    expect(diffHours(a, b)).toBe(22);
    expect(diffHours(b, a)).toBe(22);
  });
  it('diffHours 23h apart', () => {
    const a = new Date(2026, 0, 1, 0, 0, 0);
    const b = new Date(a.getTime() + 23 * 3600000);
    expect(diffHours(a, b)).toBe(23);
    expect(diffHours(b, a)).toBe(23);
  });
  it('diffHours 24h apart', () => {
    const a = new Date(2026, 0, 1, 0, 0, 0);
    const b = new Date(a.getTime() + 24 * 3600000);
    expect(diffHours(a, b)).toBe(24);
    expect(diffHours(b, a)).toBe(24);
  });
  it('diffHours 25h apart', () => {
    const a = new Date(2026, 0, 1, 0, 0, 0);
    const b = new Date(a.getTime() + 25 * 3600000);
    expect(diffHours(a, b)).toBe(25);
    expect(diffHours(b, a)).toBe(25);
  });
  it('diffHours 26h apart', () => {
    const a = new Date(2026, 0, 1, 0, 0, 0);
    const b = new Date(a.getTime() + 26 * 3600000);
    expect(diffHours(a, b)).toBe(26);
    expect(diffHours(b, a)).toBe(26);
  });
  it('diffHours 27h apart', () => {
    const a = new Date(2026, 0, 1, 0, 0, 0);
    const b = new Date(a.getTime() + 27 * 3600000);
    expect(diffHours(a, b)).toBe(27);
    expect(diffHours(b, a)).toBe(27);
  });
  it('diffHours 28h apart', () => {
    const a = new Date(2026, 0, 1, 0, 0, 0);
    const b = new Date(a.getTime() + 28 * 3600000);
    expect(diffHours(a, b)).toBe(28);
    expect(diffHours(b, a)).toBe(28);
  });
  it('diffHours 29h apart', () => {
    const a = new Date(2026, 0, 1, 0, 0, 0);
    const b = new Date(a.getTime() + 29 * 3600000);
    expect(diffHours(a, b)).toBe(29);
    expect(diffHours(b, a)).toBe(29);
  });
  it('diffHours 30h apart', () => {
    const a = new Date(2026, 0, 1, 0, 0, 0);
    const b = new Date(a.getTime() + 30 * 3600000);
    expect(diffHours(a, b)).toBe(30);
    expect(diffHours(b, a)).toBe(30);
  });
  it('diffMinutes 1min apart', () => {
    const a = new Date(2026, 0, 1, 0, 0, 0);
    const b = new Date(a.getTime() + 1 * 60000);
    expect(diffMinutes(a, b)).toBe(1);
    expect(diffMinutes(b, a)).toBe(1);
  });
  it('diffMinutes 2min apart', () => {
    const a = new Date(2026, 0, 1, 0, 0, 0);
    const b = new Date(a.getTime() + 2 * 60000);
    expect(diffMinutes(a, b)).toBe(2);
    expect(diffMinutes(b, a)).toBe(2);
  });
  it('diffMinutes 3min apart', () => {
    const a = new Date(2026, 0, 1, 0, 0, 0);
    const b = new Date(a.getTime() + 3 * 60000);
    expect(diffMinutes(a, b)).toBe(3);
    expect(diffMinutes(b, a)).toBe(3);
  });
  it('diffMinutes 4min apart', () => {
    const a = new Date(2026, 0, 1, 0, 0, 0);
    const b = new Date(a.getTime() + 4 * 60000);
    expect(diffMinutes(a, b)).toBe(4);
    expect(diffMinutes(b, a)).toBe(4);
  });
  it('diffMinutes 5min apart', () => {
    const a = new Date(2026, 0, 1, 0, 0, 0);
    const b = new Date(a.getTime() + 5 * 60000);
    expect(diffMinutes(a, b)).toBe(5);
    expect(diffMinutes(b, a)).toBe(5);
  });
  it('diffMinutes 6min apart', () => {
    const a = new Date(2026, 0, 1, 0, 0, 0);
    const b = new Date(a.getTime() + 6 * 60000);
    expect(diffMinutes(a, b)).toBe(6);
    expect(diffMinutes(b, a)).toBe(6);
  });
  it('diffMinutes 7min apart', () => {
    const a = new Date(2026, 0, 1, 0, 0, 0);
    const b = new Date(a.getTime() + 7 * 60000);
    expect(diffMinutes(a, b)).toBe(7);
    expect(diffMinutes(b, a)).toBe(7);
  });
  it('diffMinutes 8min apart', () => {
    const a = new Date(2026, 0, 1, 0, 0, 0);
    const b = new Date(a.getTime() + 8 * 60000);
    expect(diffMinutes(a, b)).toBe(8);
    expect(diffMinutes(b, a)).toBe(8);
  });
  it('diffMinutes 9min apart', () => {
    const a = new Date(2026, 0, 1, 0, 0, 0);
    const b = new Date(a.getTime() + 9 * 60000);
    expect(diffMinutes(a, b)).toBe(9);
    expect(diffMinutes(b, a)).toBe(9);
  });
  it('diffMinutes 10min apart', () => {
    const a = new Date(2026, 0, 1, 0, 0, 0);
    const b = new Date(a.getTime() + 10 * 60000);
    expect(diffMinutes(a, b)).toBe(10);
    expect(diffMinutes(b, a)).toBe(10);
  });
  it('diffMinutes 11min apart', () => {
    const a = new Date(2026, 0, 1, 0, 0, 0);
    const b = new Date(a.getTime() + 11 * 60000);
    expect(diffMinutes(a, b)).toBe(11);
    expect(diffMinutes(b, a)).toBe(11);
  });
  it('diffMinutes 12min apart', () => {
    const a = new Date(2026, 0, 1, 0, 0, 0);
    const b = new Date(a.getTime() + 12 * 60000);
    expect(diffMinutes(a, b)).toBe(12);
    expect(diffMinutes(b, a)).toBe(12);
  });
  it('diffMinutes 13min apart', () => {
    const a = new Date(2026, 0, 1, 0, 0, 0);
    const b = new Date(a.getTime() + 13 * 60000);
    expect(diffMinutes(a, b)).toBe(13);
    expect(diffMinutes(b, a)).toBe(13);
  });
  it('diffMinutes 14min apart', () => {
    const a = new Date(2026, 0, 1, 0, 0, 0);
    const b = new Date(a.getTime() + 14 * 60000);
    expect(diffMinutes(a, b)).toBe(14);
    expect(diffMinutes(b, a)).toBe(14);
  });
  it('diffMinutes 15min apart', () => {
    const a = new Date(2026, 0, 1, 0, 0, 0);
    const b = new Date(a.getTime() + 15 * 60000);
    expect(diffMinutes(a, b)).toBe(15);
    expect(diffMinutes(b, a)).toBe(15);
  });
  it('diffMinutes 16min apart', () => {
    const a = new Date(2026, 0, 1, 0, 0, 0);
    const b = new Date(a.getTime() + 16 * 60000);
    expect(diffMinutes(a, b)).toBe(16);
    expect(diffMinutes(b, a)).toBe(16);
  });
  it('diffMinutes 17min apart', () => {
    const a = new Date(2026, 0, 1, 0, 0, 0);
    const b = new Date(a.getTime() + 17 * 60000);
    expect(diffMinutes(a, b)).toBe(17);
    expect(diffMinutes(b, a)).toBe(17);
  });
  it('diffMinutes 18min apart', () => {
    const a = new Date(2026, 0, 1, 0, 0, 0);
    const b = new Date(a.getTime() + 18 * 60000);
    expect(diffMinutes(a, b)).toBe(18);
    expect(diffMinutes(b, a)).toBe(18);
  });
  it('diffMinutes 19min apart', () => {
    const a = new Date(2026, 0, 1, 0, 0, 0);
    const b = new Date(a.getTime() + 19 * 60000);
    expect(diffMinutes(a, b)).toBe(19);
    expect(diffMinutes(b, a)).toBe(19);
  });
  it('diffMinutes 20min apart', () => {
    const a = new Date(2026, 0, 1, 0, 0, 0);
    const b = new Date(a.getTime() + 20 * 60000);
    expect(diffMinutes(a, b)).toBe(20);
    expect(diffMinutes(b, a)).toBe(20);
  });
  it('diffMinutes 21min apart', () => {
    const a = new Date(2026, 0, 1, 0, 0, 0);
    const b = new Date(a.getTime() + 21 * 60000);
    expect(diffMinutes(a, b)).toBe(21);
    expect(diffMinutes(b, a)).toBe(21);
  });
  it('diffMinutes 22min apart', () => {
    const a = new Date(2026, 0, 1, 0, 0, 0);
    const b = new Date(a.getTime() + 22 * 60000);
    expect(diffMinutes(a, b)).toBe(22);
    expect(diffMinutes(b, a)).toBe(22);
  });
  it('diffMinutes 23min apart', () => {
    const a = new Date(2026, 0, 1, 0, 0, 0);
    const b = new Date(a.getTime() + 23 * 60000);
    expect(diffMinutes(a, b)).toBe(23);
    expect(diffMinutes(b, a)).toBe(23);
  });
  it('diffMinutes 24min apart', () => {
    const a = new Date(2026, 0, 1, 0, 0, 0);
    const b = new Date(a.getTime() + 24 * 60000);
    expect(diffMinutes(a, b)).toBe(24);
    expect(diffMinutes(b, a)).toBe(24);
  });
  it('diffMinutes 25min apart', () => {
    const a = new Date(2026, 0, 1, 0, 0, 0);
    const b = new Date(a.getTime() + 25 * 60000);
    expect(diffMinutes(a, b)).toBe(25);
    expect(diffMinutes(b, a)).toBe(25);
  });
  it('diffMinutes 26min apart', () => {
    const a = new Date(2026, 0, 1, 0, 0, 0);
    const b = new Date(a.getTime() + 26 * 60000);
    expect(diffMinutes(a, b)).toBe(26);
    expect(diffMinutes(b, a)).toBe(26);
  });
  it('diffMinutes 27min apart', () => {
    const a = new Date(2026, 0, 1, 0, 0, 0);
    const b = new Date(a.getTime() + 27 * 60000);
    expect(diffMinutes(a, b)).toBe(27);
    expect(diffMinutes(b, a)).toBe(27);
  });
  it('diffMinutes 28min apart', () => {
    const a = new Date(2026, 0, 1, 0, 0, 0);
    const b = new Date(a.getTime() + 28 * 60000);
    expect(diffMinutes(a, b)).toBe(28);
    expect(diffMinutes(b, a)).toBe(28);
  });
  it('diffMinutes 29min apart', () => {
    const a = new Date(2026, 0, 1, 0, 0, 0);
    const b = new Date(a.getTime() + 29 * 60000);
    expect(diffMinutes(a, b)).toBe(29);
    expect(diffMinutes(b, a)).toBe(29);
  });
  it('diffMinutes 30min apart', () => {
    const a = new Date(2026, 0, 1, 0, 0, 0);
    const b = new Date(a.getTime() + 30 * 60000);
    expect(diffMinutes(a, b)).toBe(30);
    expect(diffMinutes(b, a)).toBe(30);
  });
});

describe('startOfMonth endOfMonth startOfYear endOfYear', () => {
  it('startOfMonth 2026-01', () => {
    const result = startOfMonth(new Date(2026, 0, 15));
    expect(result.getDate()).toBe(1);
    expect(result.getMonth() + 1).toBe(1);
    expect(result.getHours()).toBe(0);
  });
  it('endOfMonth 2026-01', () => {
    const result = endOfMonth(new Date(2026, 0, 1));
    expect(result.getDate()).toBe(31);
    expect(result.getMonth() + 1).toBe(1);
    expect(result.getHours()).toBe(23);
    expect(result.getMinutes()).toBe(59);
    expect(result.getSeconds()).toBe(59);
    expect(result.getMilliseconds()).toBe(999);
  });
  it('startOfMonth 2026-02', () => {
    const result = startOfMonth(new Date(2026, 1, 15));
    expect(result.getDate()).toBe(1);
    expect(result.getMonth() + 1).toBe(2);
    expect(result.getHours()).toBe(0);
  });
  it('endOfMonth 2026-02', () => {
    const result = endOfMonth(new Date(2026, 1, 1));
    expect(result.getDate()).toBe(28);
    expect(result.getMonth() + 1).toBe(2);
    expect(result.getHours()).toBe(23);
    expect(result.getMinutes()).toBe(59);
    expect(result.getSeconds()).toBe(59);
    expect(result.getMilliseconds()).toBe(999);
  });
  it('startOfMonth 2026-03', () => {
    const result = startOfMonth(new Date(2026, 2, 15));
    expect(result.getDate()).toBe(1);
    expect(result.getMonth() + 1).toBe(3);
    expect(result.getHours()).toBe(0);
  });
  it('endOfMonth 2026-03', () => {
    const result = endOfMonth(new Date(2026, 2, 1));
    expect(result.getDate()).toBe(31);
    expect(result.getMonth() + 1).toBe(3);
    expect(result.getHours()).toBe(23);
    expect(result.getMinutes()).toBe(59);
    expect(result.getSeconds()).toBe(59);
    expect(result.getMilliseconds()).toBe(999);
  });
  it('startOfMonth 2026-04', () => {
    const result = startOfMonth(new Date(2026, 3, 15));
    expect(result.getDate()).toBe(1);
    expect(result.getMonth() + 1).toBe(4);
    expect(result.getHours()).toBe(0);
  });
  it('endOfMonth 2026-04', () => {
    const result = endOfMonth(new Date(2026, 3, 1));
    expect(result.getDate()).toBe(30);
    expect(result.getMonth() + 1).toBe(4);
    expect(result.getHours()).toBe(23);
    expect(result.getMinutes()).toBe(59);
    expect(result.getSeconds()).toBe(59);
    expect(result.getMilliseconds()).toBe(999);
  });
  it('startOfMonth 2026-05', () => {
    const result = startOfMonth(new Date(2026, 4, 15));
    expect(result.getDate()).toBe(1);
    expect(result.getMonth() + 1).toBe(5);
    expect(result.getHours()).toBe(0);
  });
  it('endOfMonth 2026-05', () => {
    const result = endOfMonth(new Date(2026, 4, 1));
    expect(result.getDate()).toBe(31);
    expect(result.getMonth() + 1).toBe(5);
    expect(result.getHours()).toBe(23);
    expect(result.getMinutes()).toBe(59);
    expect(result.getSeconds()).toBe(59);
    expect(result.getMilliseconds()).toBe(999);
  });
  it('startOfMonth 2026-06', () => {
    const result = startOfMonth(new Date(2026, 5, 15));
    expect(result.getDate()).toBe(1);
    expect(result.getMonth() + 1).toBe(6);
    expect(result.getHours()).toBe(0);
  });
  it('endOfMonth 2026-06', () => {
    const result = endOfMonth(new Date(2026, 5, 1));
    expect(result.getDate()).toBe(30);
    expect(result.getMonth() + 1).toBe(6);
    expect(result.getHours()).toBe(23);
    expect(result.getMinutes()).toBe(59);
    expect(result.getSeconds()).toBe(59);
    expect(result.getMilliseconds()).toBe(999);
  });
  it('startOfMonth 2026-07', () => {
    const result = startOfMonth(new Date(2026, 6, 15));
    expect(result.getDate()).toBe(1);
    expect(result.getMonth() + 1).toBe(7);
    expect(result.getHours()).toBe(0);
  });
  it('endOfMonth 2026-07', () => {
    const result = endOfMonth(new Date(2026, 6, 1));
    expect(result.getDate()).toBe(31);
    expect(result.getMonth() + 1).toBe(7);
    expect(result.getHours()).toBe(23);
    expect(result.getMinutes()).toBe(59);
    expect(result.getSeconds()).toBe(59);
    expect(result.getMilliseconds()).toBe(999);
  });
  it('startOfMonth 2026-08', () => {
    const result = startOfMonth(new Date(2026, 7, 15));
    expect(result.getDate()).toBe(1);
    expect(result.getMonth() + 1).toBe(8);
    expect(result.getHours()).toBe(0);
  });
  it('endOfMonth 2026-08', () => {
    const result = endOfMonth(new Date(2026, 7, 1));
    expect(result.getDate()).toBe(31);
    expect(result.getMonth() + 1).toBe(8);
    expect(result.getHours()).toBe(23);
    expect(result.getMinutes()).toBe(59);
    expect(result.getSeconds()).toBe(59);
    expect(result.getMilliseconds()).toBe(999);
  });
  it('startOfMonth 2026-09', () => {
    const result = startOfMonth(new Date(2026, 8, 15));
    expect(result.getDate()).toBe(1);
    expect(result.getMonth() + 1).toBe(9);
    expect(result.getHours()).toBe(0);
  });
  it('endOfMonth 2026-09', () => {
    const result = endOfMonth(new Date(2026, 8, 1));
    expect(result.getDate()).toBe(30);
    expect(result.getMonth() + 1).toBe(9);
    expect(result.getHours()).toBe(23);
    expect(result.getMinutes()).toBe(59);
    expect(result.getSeconds()).toBe(59);
    expect(result.getMilliseconds()).toBe(999);
  });
  it('startOfMonth 2026-10', () => {
    const result = startOfMonth(new Date(2026, 9, 15));
    expect(result.getDate()).toBe(1);
    expect(result.getMonth() + 1).toBe(10);
    expect(result.getHours()).toBe(0);
  });
  it('endOfMonth 2026-10', () => {
    const result = endOfMonth(new Date(2026, 9, 1));
    expect(result.getDate()).toBe(31);
    expect(result.getMonth() + 1).toBe(10);
    expect(result.getHours()).toBe(23);
    expect(result.getMinutes()).toBe(59);
    expect(result.getSeconds()).toBe(59);
    expect(result.getMilliseconds()).toBe(999);
  });
  it('startOfMonth 2026-11', () => {
    const result = startOfMonth(new Date(2026, 10, 15));
    expect(result.getDate()).toBe(1);
    expect(result.getMonth() + 1).toBe(11);
    expect(result.getHours()).toBe(0);
  });
  it('endOfMonth 2026-11', () => {
    const result = endOfMonth(new Date(2026, 10, 1));
    expect(result.getDate()).toBe(30);
    expect(result.getMonth() + 1).toBe(11);
    expect(result.getHours()).toBe(23);
    expect(result.getMinutes()).toBe(59);
    expect(result.getSeconds()).toBe(59);
    expect(result.getMilliseconds()).toBe(999);
  });
  it('startOfMonth 2026-12', () => {
    const result = startOfMonth(new Date(2026, 11, 15));
    expect(result.getDate()).toBe(1);
    expect(result.getMonth() + 1).toBe(12);
    expect(result.getHours()).toBe(0);
  });
  it('endOfMonth 2026-12', () => {
    const result = endOfMonth(new Date(2026, 11, 1));
    expect(result.getDate()).toBe(31);
    expect(result.getMonth() + 1).toBe(12);
    expect(result.getHours()).toBe(23);
    expect(result.getMinutes()).toBe(59);
    expect(result.getSeconds()).toBe(59);
    expect(result.getMilliseconds()).toBe(999);
  });
  it('startOfYear 2020', () => {
    const result = startOfYear(new Date(2020, 5, 15));
    expect(result.getFullYear()).toBe(2020);
    expect(result.getMonth() + 1).toBe(1);
    expect(result.getDate()).toBe(1);
    expect(result.getHours()).toBe(0);
  });
  it('endOfYear 2020', () => {
    const result = endOfYear(new Date(2020, 5, 15));
    expect(result.getFullYear()).toBe(2020);
    expect(result.getMonth() + 1).toBe(12);
    expect(result.getDate()).toBe(31);
    expect(result.getHours()).toBe(23);
    expect(result.getMinutes()).toBe(59);
    expect(result.getMilliseconds()).toBe(999);
  });
  it('startOfYear 2021', () => {
    const result = startOfYear(new Date(2021, 5, 15));
    expect(result.getFullYear()).toBe(2021);
    expect(result.getMonth() + 1).toBe(1);
    expect(result.getDate()).toBe(1);
    expect(result.getHours()).toBe(0);
  });
  it('endOfYear 2021', () => {
    const result = endOfYear(new Date(2021, 5, 15));
    expect(result.getFullYear()).toBe(2021);
    expect(result.getMonth() + 1).toBe(12);
    expect(result.getDate()).toBe(31);
    expect(result.getHours()).toBe(23);
    expect(result.getMinutes()).toBe(59);
    expect(result.getMilliseconds()).toBe(999);
  });
  it('startOfYear 2022', () => {
    const result = startOfYear(new Date(2022, 5, 15));
    expect(result.getFullYear()).toBe(2022);
    expect(result.getMonth() + 1).toBe(1);
    expect(result.getDate()).toBe(1);
    expect(result.getHours()).toBe(0);
  });
  it('endOfYear 2022', () => {
    const result = endOfYear(new Date(2022, 5, 15));
    expect(result.getFullYear()).toBe(2022);
    expect(result.getMonth() + 1).toBe(12);
    expect(result.getDate()).toBe(31);
    expect(result.getHours()).toBe(23);
    expect(result.getMinutes()).toBe(59);
    expect(result.getMilliseconds()).toBe(999);
  });
  it('startOfYear 2023', () => {
    const result = startOfYear(new Date(2023, 5, 15));
    expect(result.getFullYear()).toBe(2023);
    expect(result.getMonth() + 1).toBe(1);
    expect(result.getDate()).toBe(1);
    expect(result.getHours()).toBe(0);
  });
  it('endOfYear 2023', () => {
    const result = endOfYear(new Date(2023, 5, 15));
    expect(result.getFullYear()).toBe(2023);
    expect(result.getMonth() + 1).toBe(12);
    expect(result.getDate()).toBe(31);
    expect(result.getHours()).toBe(23);
    expect(result.getMinutes()).toBe(59);
    expect(result.getMilliseconds()).toBe(999);
  });
  it('startOfYear 2024', () => {
    const result = startOfYear(new Date(2024, 5, 15));
    expect(result.getFullYear()).toBe(2024);
    expect(result.getMonth() + 1).toBe(1);
    expect(result.getDate()).toBe(1);
    expect(result.getHours()).toBe(0);
  });
  it('endOfYear 2024', () => {
    const result = endOfYear(new Date(2024, 5, 15));
    expect(result.getFullYear()).toBe(2024);
    expect(result.getMonth() + 1).toBe(12);
    expect(result.getDate()).toBe(31);
    expect(result.getHours()).toBe(23);
    expect(result.getMinutes()).toBe(59);
    expect(result.getMilliseconds()).toBe(999);
  });
  it('startOfYear 2025', () => {
    const result = startOfYear(new Date(2025, 5, 15));
    expect(result.getFullYear()).toBe(2025);
    expect(result.getMonth() + 1).toBe(1);
    expect(result.getDate()).toBe(1);
    expect(result.getHours()).toBe(0);
  });
  it('endOfYear 2025', () => {
    const result = endOfYear(new Date(2025, 5, 15));
    expect(result.getFullYear()).toBe(2025);
    expect(result.getMonth() + 1).toBe(12);
    expect(result.getDate()).toBe(31);
    expect(result.getHours()).toBe(23);
    expect(result.getMinutes()).toBe(59);
    expect(result.getMilliseconds()).toBe(999);
  });
  it('startOfYear 2026', () => {
    const result = startOfYear(new Date(2026, 5, 15));
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(1);
    expect(result.getDate()).toBe(1);
    expect(result.getHours()).toBe(0);
  });
  it('endOfYear 2026', () => {
    const result = endOfYear(new Date(2026, 5, 15));
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(12);
    expect(result.getDate()).toBe(31);
    expect(result.getHours()).toBe(23);
    expect(result.getMinutes()).toBe(59);
    expect(result.getMilliseconds()).toBe(999);
  });
});

describe('getWeekNumber', () => {
  it('getWeekNumber 2026-01-01 is week 1', () => {
    expect(getWeekNumber(new Date(2026, 0, 1))).toBe(1);
  });
  it('getWeekNumber 2026-01-08 is week 2', () => {
    expect(getWeekNumber(new Date(2026, 0, 8))).toBe(2);
  });
  it('getWeekNumber 2026-01-15 is week 3', () => {
    expect(getWeekNumber(new Date(2026, 0, 15))).toBe(3);
  });
  it('getWeekNumber 2026-01-22 is week 4', () => {
    expect(getWeekNumber(new Date(2026, 0, 22))).toBe(4);
  });
  it('getWeekNumber 2026-01-29 is week 5', () => {
    expect(getWeekNumber(new Date(2026, 0, 29))).toBe(5);
  });
  it('getWeekNumber 2026-02-05 is week 6', () => {
    expect(getWeekNumber(new Date(2026, 1, 5))).toBe(6);
  });
  it('getWeekNumber 2026-02-12 is week 7', () => {
    expect(getWeekNumber(new Date(2026, 1, 12))).toBe(7);
  });
  it('getWeekNumber 2026-02-19 is week 8', () => {
    expect(getWeekNumber(new Date(2026, 1, 19))).toBe(8);
  });
  it('getWeekNumber 2026-02-26 is week 9', () => {
    expect(getWeekNumber(new Date(2026, 1, 26))).toBe(9);
  });
  it('getWeekNumber 2026-03-05 is week 10', () => {
    expect(getWeekNumber(new Date(2026, 2, 5))).toBe(10);
  });
  it('getWeekNumber 2026-03-12 is week 11', () => {
    expect(getWeekNumber(new Date(2026, 2, 12))).toBe(11);
  });
  it('getWeekNumber 2026-03-19 is week 12', () => {
    expect(getWeekNumber(new Date(2026, 2, 19))).toBe(12);
  });
  it('getWeekNumber 2026-03-26 is week 13', () => {
    expect(getWeekNumber(new Date(2026, 2, 26))).toBe(13);
  });
  it('getWeekNumber 2026-04-02 is week 14', () => {
    expect(getWeekNumber(new Date(2026, 3, 2))).toBe(14);
  });
  it('getWeekNumber 2026-04-09 is week 15', () => {
    expect(getWeekNumber(new Date(2026, 3, 9))).toBe(15);
  });
  it('getWeekNumber 2026-04-16 is week 16', () => {
    expect(getWeekNumber(new Date(2026, 3, 16))).toBe(16);
  });
  it('getWeekNumber 2026-04-23 is week 17', () => {
    expect(getWeekNumber(new Date(2026, 3, 23))).toBe(17);
  });
  it('getWeekNumber 2026-04-30 is week 18', () => {
    expect(getWeekNumber(new Date(2026, 3, 30))).toBe(18);
  });
  it('getWeekNumber 2026-05-07 is week 19', () => {
    expect(getWeekNumber(new Date(2026, 4, 7))).toBe(19);
  });
  it('getWeekNumber 2026-05-14 is week 20', () => {
    expect(getWeekNumber(new Date(2026, 4, 14))).toBe(20);
  });
  it('getWeekNumber 2026-05-21 is week 21', () => {
    expect(getWeekNumber(new Date(2026, 4, 21))).toBe(21);
  });
  it('getWeekNumber 2026-05-28 is week 22', () => {
    expect(getWeekNumber(new Date(2026, 4, 28))).toBe(22);
  });
  it('getWeekNumber 2026-06-04 is week 23', () => {
    expect(getWeekNumber(new Date(2026, 5, 4))).toBe(23);
  });
  it('getWeekNumber 2026-06-11 is week 24', () => {
    expect(getWeekNumber(new Date(2026, 5, 11))).toBe(24);
  });
  it('getWeekNumber 2026-06-18 is week 25', () => {
    expect(getWeekNumber(new Date(2026, 5, 18))).toBe(25);
  });
  it('getWeekNumber 2026-06-25 is week 26', () => {
    expect(getWeekNumber(new Date(2026, 5, 25))).toBe(26);
  });
  it('getWeekNumber 2026-07-02 is week 27', () => {
    expect(getWeekNumber(new Date(2026, 6, 2))).toBe(27);
  });
  it('getWeekNumber 2026-07-09 is week 28', () => {
    expect(getWeekNumber(new Date(2026, 6, 9))).toBe(28);
  });
  it('getWeekNumber 2026-07-16 is week 29', () => {
    expect(getWeekNumber(new Date(2026, 6, 16))).toBe(29);
  });
  it('getWeekNumber 2026-07-23 is week 30', () => {
    expect(getWeekNumber(new Date(2026, 6, 23))).toBe(30);
  });
});

describe('getDayOfYear', () => {
  it('getDayOfYear 2026-01-01 is 1', () => {
    expect(getDayOfYear(new Date(2026, 0, 1))).toBe(1);
  });
  it('getDayOfYear 2026-12-31 is 365', () => {
    expect(getDayOfYear(new Date(2026, 11, 31))).toBe(365);
  });
  it('getDayOfYear 2024-12-31 is 366', () => {
    expect(getDayOfYear(new Date(2024, 11, 31))).toBe(366);
  });
  it('getDayOfYear 2024-01-01 is 1', () => {
    expect(getDayOfYear(new Date(2024, 0, 1))).toBe(1);
  });
  it('getDayOfYear 2024-02-29 is 60', () => {
    expect(getDayOfYear(new Date(2024, 1, 29))).toBe(60);
  });
  it('getDayOfYear 2026-03-01 is 60', () => {
    expect(getDayOfYear(new Date(2026, 2, 1))).toBe(60);
  });
  it('getDayOfYear 2026-01-01 is 1', () => {
    expect(getDayOfYear(new Date(2026, 0, 1))).toBe(1);
  });
  it('getDayOfYear 2026-01-15 is 15', () => {
    expect(getDayOfYear(new Date(2026, 0, 15))).toBe(15);
  });
  it('getDayOfYear 2026-01-29 is 29', () => {
    expect(getDayOfYear(new Date(2026, 0, 29))).toBe(29);
  });
  it('getDayOfYear 2026-02-12 is 43', () => {
    expect(getDayOfYear(new Date(2026, 1, 12))).toBe(43);
  });
  it('getDayOfYear 2026-02-26 is 57', () => {
    expect(getDayOfYear(new Date(2026, 1, 26))).toBe(57);
  });
  it('getDayOfYear 2026-03-12 is 71', () => {
    expect(getDayOfYear(new Date(2026, 2, 12))).toBe(71);
  });
  it('getDayOfYear 2026-03-26 is 85', () => {
    expect(getDayOfYear(new Date(2026, 2, 26))).toBe(85);
  });
  it('getDayOfYear 2026-04-09 is 99', () => {
    expect(getDayOfYear(new Date(2026, 3, 9))).toBe(99);
  });
  it('getDayOfYear 2026-04-23 is 113', () => {
    expect(getDayOfYear(new Date(2026, 3, 23))).toBe(113);
  });
  it('getDayOfYear 2026-05-07 is 127', () => {
    expect(getDayOfYear(new Date(2026, 4, 7))).toBe(127);
  });
  it('getDayOfYear 2026-05-21 is 141', () => {
    expect(getDayOfYear(new Date(2026, 4, 21))).toBe(141);
  });
  it('getDayOfYear 2026-06-04 is 155', () => {
    expect(getDayOfYear(new Date(2026, 5, 4))).toBe(155);
  });
  it('getDayOfYear 2026-06-18 is 169', () => {
    expect(getDayOfYear(new Date(2026, 5, 18))).toBe(169);
  });
  it('getDayOfYear 2026-07-02 is 183', () => {
    expect(getDayOfYear(new Date(2026, 6, 2))).toBe(183);
  });
  it('getDayOfYear 2026-07-16 is 197', () => {
    expect(getDayOfYear(new Date(2026, 6, 16))).toBe(197);
  });
  it('getDayOfYear 2026-07-30 is 211', () => {
    expect(getDayOfYear(new Date(2026, 6, 30))).toBe(211);
  });
  it('getDayOfYear 2026-08-13 is 225', () => {
    expect(getDayOfYear(new Date(2026, 7, 13))).toBe(225);
  });
  it('getDayOfYear 2026-08-27 is 239', () => {
    expect(getDayOfYear(new Date(2026, 7, 27))).toBe(239);
  });
  it('getDayOfYear 2026-09-10 is 253', () => {
    expect(getDayOfYear(new Date(2026, 8, 10))).toBe(253);
  });
  it('getDayOfYear 2026-09-24 is 267', () => {
    expect(getDayOfYear(new Date(2026, 8, 24))).toBe(267);
  });
  it('getDayOfYear 2026-10-08 is 281', () => {
    expect(getDayOfYear(new Date(2026, 9, 8))).toBe(281);
  });
  it('getDayOfYear 2026-10-22 is 295', () => {
    expect(getDayOfYear(new Date(2026, 9, 22))).toBe(295);
  });
  it('getDayOfYear 2026-11-05 is 309', () => {
    expect(getDayOfYear(new Date(2026, 10, 5))).toBe(309);
  });
  it('getDayOfYear 2026-11-19 is 323', () => {
    expect(getDayOfYear(new Date(2026, 10, 19))).toBe(323);
  });
});

describe('formatDate', () => {
  it('formatDate 2026-01-15 with format YYYY-MM-DD', () => {
    const date = new Date(2026, 0, 15, 0, 0, 0);
    expect(formatDate(date, 'YYYY-MM-DD')).toBe('2026-01-15');
  });
  it('formatDate 2026-12-31 with format YYYY-MM-DD', () => {
    const date = new Date(2026, 11, 31, 23, 59, 59);
    expect(formatDate(date, 'YYYY-MM-DD')).toBe('2026-12-31');
  });
  it('formatDate 2000-06-05 with format YYYY/MM/DD', () => {
    const date = new Date(2000, 5, 5, 8, 5, 3);
    expect(formatDate(date, 'YYYY/MM/DD')).toBe('2000/06/05');
  });
  it('formatDate 2026-01-01 with format DD/MM/YYYY', () => {
    const date = new Date(2026, 0, 1, 0, 0, 0);
    expect(formatDate(date, 'DD/MM/YYYY')).toBe('01/01/2026');
  });
  it('formatDate 2026-03-25 with format HH:mm:ss', () => {
    const date = new Date(2026, 2, 25, 14, 30, 45);
    expect(formatDate(date, 'HH:mm:ss')).toBe('14:30:45');
  });
  it('formatDate 2026-07-04 with format YYYY-MM-DD HH:mm:ss', () => {
    const date = new Date(2026, 6, 4, 9, 5, 3);
    expect(formatDate(date, 'YYYY-MM-DD HH:mm:ss')).toBe('2026-07-04 09:05:03');
  });
  it('formatDate 2025-11-30 with format YYYY-MM-DD HH:mm:ss', () => {
    const date = new Date(2025, 10, 30, 23, 59, 59);
    expect(formatDate(date, 'YYYY-MM-DD HH:mm:ss')).toBe('2025-11-30 23:59:59');
  });
  it('formatDate YYYY-MM-DD seq 1', () => {
    const date = new Date(2026, 0, 1);
    expect(formatDate(date, 'YYYY-MM-DD')).toBe('2026-01-01');
  });
  it('formatDate YYYY-MM-DD seq 2', () => {
    const date = new Date(2026, 0, 2);
    expect(formatDate(date, 'YYYY-MM-DD')).toBe('2026-01-02');
  });
  it('formatDate YYYY-MM-DD seq 3', () => {
    const date = new Date(2026, 0, 3);
    expect(formatDate(date, 'YYYY-MM-DD')).toBe('2026-01-03');
  });
  it('formatDate YYYY-MM-DD seq 4', () => {
    const date = new Date(2026, 0, 4);
    expect(formatDate(date, 'YYYY-MM-DD')).toBe('2026-01-04');
  });
  it('formatDate YYYY-MM-DD seq 5', () => {
    const date = new Date(2026, 0, 5);
    expect(formatDate(date, 'YYYY-MM-DD')).toBe('2026-01-05');
  });
  it('formatDate YYYY-MM-DD seq 6', () => {
    const date = new Date(2026, 0, 6);
    expect(formatDate(date, 'YYYY-MM-DD')).toBe('2026-01-06');
  });
  it('formatDate YYYY-MM-DD seq 7', () => {
    const date = new Date(2026, 0, 7);
    expect(formatDate(date, 'YYYY-MM-DD')).toBe('2026-01-07');
  });
  it('formatDate YYYY-MM-DD seq 8', () => {
    const date = new Date(2026, 0, 8);
    expect(formatDate(date, 'YYYY-MM-DD')).toBe('2026-01-08');
  });
  it('formatDate YYYY-MM-DD seq 9', () => {
    const date = new Date(2026, 0, 9);
    expect(formatDate(date, 'YYYY-MM-DD')).toBe('2026-01-09');
  });
  it('formatDate YYYY-MM-DD seq 10', () => {
    const date = new Date(2026, 0, 10);
    expect(formatDate(date, 'YYYY-MM-DD')).toBe('2026-01-10');
  });
  it('formatDate YYYY-MM-DD seq 11', () => {
    const date = new Date(2026, 0, 11);
    expect(formatDate(date, 'YYYY-MM-DD')).toBe('2026-01-11');
  });
  it('formatDate YYYY-MM-DD seq 12', () => {
    const date = new Date(2026, 0, 12);
    expect(formatDate(date, 'YYYY-MM-DD')).toBe('2026-01-12');
  });
  it('formatDate YYYY-MM-DD seq 13', () => {
    const date = new Date(2026, 0, 13);
    expect(formatDate(date, 'YYYY-MM-DD')).toBe('2026-01-13');
  });
  it('formatDate YYYY-MM-DD seq 14', () => {
    const date = new Date(2026, 0, 14);
    expect(formatDate(date, 'YYYY-MM-DD')).toBe('2026-01-14');
  });
  it('formatDate YYYY-MM-DD seq 15', () => {
    const date = new Date(2026, 0, 15);
    expect(formatDate(date, 'YYYY-MM-DD')).toBe('2026-01-15');
  });
  it('formatDate YYYY-MM-DD seq 16', () => {
    const date = new Date(2026, 0, 16);
    expect(formatDate(date, 'YYYY-MM-DD')).toBe('2026-01-16');
  });
  it('formatDate YYYY-MM-DD seq 17', () => {
    const date = new Date(2026, 0, 17);
    expect(formatDate(date, 'YYYY-MM-DD')).toBe('2026-01-17');
  });
  it('formatDate YYYY-MM-DD seq 18', () => {
    const date = new Date(2026, 0, 18);
    expect(formatDate(date, 'YYYY-MM-DD')).toBe('2026-01-18');
  });
  it('formatDate YYYY-MM-DD seq 19', () => {
    const date = new Date(2026, 0, 19);
    expect(formatDate(date, 'YYYY-MM-DD')).toBe('2026-01-19');
  });
  it('formatDate YYYY-MM-DD seq 20', () => {
    const date = new Date(2026, 0, 20);
    expect(formatDate(date, 'YYYY-MM-DD')).toBe('2026-01-20');
  });
  it('formatDate YYYY-MM-DD seq 21', () => {
    const date = new Date(2026, 0, 21);
    expect(formatDate(date, 'YYYY-MM-DD')).toBe('2026-01-21');
  });
  it('formatDate YYYY-MM-DD seq 22', () => {
    const date = new Date(2026, 0, 22);
    expect(formatDate(date, 'YYYY-MM-DD')).toBe('2026-01-22');
  });
  it('formatDate YYYY-MM-DD seq 23', () => {
    const date = new Date(2026, 0, 23);
    expect(formatDate(date, 'YYYY-MM-DD')).toBe('2026-01-23');
  });
});

describe('parseDate', () => {
  it('parseDate 2026-01-15 with YYYY-MM-DD', () => {
    const result = parseDate('2026-01-15', 'YYYY-MM-DD');
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(1);
    expect(result.getDate()).toBe(15);
  });
  it('parseDate 2024-02-29 with YYYY-MM-DD', () => {
    const result = parseDate('2024-02-29', 'YYYY-MM-DD');
    expect(result.getFullYear()).toBe(2024);
    expect(result.getMonth() + 1).toBe(2);
    expect(result.getDate()).toBe(29);
  });
  it('parseDate 31/12/2026 with DD/MM/YYYY', () => {
    const result = parseDate('31/12/2026', 'DD/MM/YYYY');
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(12);
    expect(result.getDate()).toBe(31);
  });
  it('parseDate 2026/07/04 with YYYY/MM/DD', () => {
    const result = parseDate('2026/07/04', 'YYYY/MM/DD');
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(7);
    expect(result.getDate()).toBe(4);
  });
  it('parseDate round-trip 2026-01-01', () => {
    const result = parseDate('2026-01-01', 'YYYY-MM-DD');
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(1);
    expect(result.getDate()).toBe(1);
  });
  it('parseDate round-trip 2026-01-02', () => {
    const result = parseDate('2026-01-02', 'YYYY-MM-DD');
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(1);
    expect(result.getDate()).toBe(2);
  });
  it('parseDate round-trip 2026-01-03', () => {
    const result = parseDate('2026-01-03', 'YYYY-MM-DD');
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(1);
    expect(result.getDate()).toBe(3);
  });
  it('parseDate round-trip 2026-01-04', () => {
    const result = parseDate('2026-01-04', 'YYYY-MM-DD');
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(1);
    expect(result.getDate()).toBe(4);
  });
  it('parseDate round-trip 2026-01-05', () => {
    const result = parseDate('2026-01-05', 'YYYY-MM-DD');
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(1);
    expect(result.getDate()).toBe(5);
  });
  it('parseDate round-trip 2026-01-06', () => {
    const result = parseDate('2026-01-06', 'YYYY-MM-DD');
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(1);
    expect(result.getDate()).toBe(6);
  });
  it('parseDate round-trip 2026-01-07', () => {
    const result = parseDate('2026-01-07', 'YYYY-MM-DD');
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(1);
    expect(result.getDate()).toBe(7);
  });
  it('parseDate round-trip 2026-01-08', () => {
    const result = parseDate('2026-01-08', 'YYYY-MM-DD');
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(1);
    expect(result.getDate()).toBe(8);
  });
  it('parseDate round-trip 2026-01-09', () => {
    const result = parseDate('2026-01-09', 'YYYY-MM-DD');
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(1);
    expect(result.getDate()).toBe(9);
  });
  it('parseDate round-trip 2026-01-10', () => {
    const result = parseDate('2026-01-10', 'YYYY-MM-DD');
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(1);
    expect(result.getDate()).toBe(10);
  });
  it('parseDate round-trip 2026-01-11', () => {
    const result = parseDate('2026-01-11', 'YYYY-MM-DD');
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(1);
    expect(result.getDate()).toBe(11);
  });
  it('parseDate round-trip 2026-01-12', () => {
    const result = parseDate('2026-01-12', 'YYYY-MM-DD');
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(1);
    expect(result.getDate()).toBe(12);
  });
  it('parseDate round-trip 2026-01-13', () => {
    const result = parseDate('2026-01-13', 'YYYY-MM-DD');
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(1);
    expect(result.getDate()).toBe(13);
  });
  it('parseDate round-trip 2026-01-14', () => {
    const result = parseDate('2026-01-14', 'YYYY-MM-DD');
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(1);
    expect(result.getDate()).toBe(14);
  });
  it('parseDate round-trip 2026-01-15', () => {
    const result = parseDate('2026-01-15', 'YYYY-MM-DD');
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(1);
    expect(result.getDate()).toBe(15);
  });
  it('parseDate round-trip 2026-01-16', () => {
    const result = parseDate('2026-01-16', 'YYYY-MM-DD');
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(1);
    expect(result.getDate()).toBe(16);
  });
  it('parseDate round-trip 2026-01-17', () => {
    const result = parseDate('2026-01-17', 'YYYY-MM-DD');
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(1);
    expect(result.getDate()).toBe(17);
  });
  it('parseDate round-trip 2026-01-18', () => {
    const result = parseDate('2026-01-18', 'YYYY-MM-DD');
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(1);
    expect(result.getDate()).toBe(18);
  });
  it('parseDate round-trip 2026-01-19', () => {
    const result = parseDate('2026-01-19', 'YYYY-MM-DD');
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(1);
    expect(result.getDate()).toBe(19);
  });
  it('parseDate round-trip 2026-01-20', () => {
    const result = parseDate('2026-01-20', 'YYYY-MM-DD');
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(1);
    expect(result.getDate()).toBe(20);
  });
  it('parseDate round-trip 2026-01-21', () => {
    const result = parseDate('2026-01-21', 'YYYY-MM-DD');
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(1);
    expect(result.getDate()).toBe(21);
  });
  it('parseDate round-trip 2026-01-22', () => {
    const result = parseDate('2026-01-22', 'YYYY-MM-DD');
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(1);
    expect(result.getDate()).toBe(22);
  });
  it('parseDate round-trip 2026-01-23', () => {
    const result = parseDate('2026-01-23', 'YYYY-MM-DD');
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(1);
    expect(result.getDate()).toBe(23);
  });
  it('parseDate round-trip 2026-01-24', () => {
    const result = parseDate('2026-01-24', 'YYYY-MM-DD');
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(1);
    expect(result.getDate()).toBe(24);
  });
  it('parseDate round-trip 2026-01-25', () => {
    const result = parseDate('2026-01-25', 'YYYY-MM-DD');
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(1);
    expect(result.getDate()).toBe(25);
  });
  it('parseDate round-trip 2026-01-26', () => {
    const result = parseDate('2026-01-26', 'YYYY-MM-DD');
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth() + 1).toBe(1);
    expect(result.getDate()).toBe(26);
  });
});

describe('clampDate', () => {
  it('clampDate below min returns min', () => {
    const min = new Date(2026, 0, 10);
    const max = new Date(2026, 0, 20);
    const result = clampDate(new Date(2026, 0, 5), min, max);
    expect(result.getTime()).toBe(min.getTime());
  });
  it('clampDate above max returns max', () => {
    const min = new Date(2026, 0, 10);
    const max = new Date(2026, 0, 20);
    const result = clampDate(new Date(2026, 0, 25), min, max);
    expect(result.getTime()).toBe(max.getTime());
  });
  it('clampDate within range returns date unchanged', () => {
    const min = new Date(2026, 0, 10);
    const max = new Date(2026, 0, 20);
    const date = new Date(2026, 0, 15);
    const result = clampDate(date, min, max);
    expect(result.getTime()).toBe(date.getTime());
  });
  it('clampDate returns a new Date object', () => {
    const min = new Date(2026, 0, 10);
    const max = new Date(2026, 0, 20);
    const date = new Date(2026, 0, 15);
    const result = clampDate(date, min, max);
    expect(result).not.toBe(date);
  });
  it('clampDate equal to min', () => {
    const min = new Date(2026, 0, 10);
    const max = new Date(2026, 0, 20);
    const result = clampDate(new Date(2026, 0, 10), min, max);
    expect(result.getTime()).toBe(min.getTime());
  });
  it('clampDate equal to max', () => {
    const min = new Date(2026, 0, 10);
    const max = new Date(2026, 0, 20);
    const result = clampDate(new Date(2026, 0, 20), min, max);
    expect(result.getTime()).toBe(max.getTime());
  });
  it('clampDate day 1 clamped to range 5..25 yields 5', () => {
    const min = new Date(2026, 0, 5);
    const max = new Date(2026, 0, 25);
    const date = new Date(2026, 0, 1);
    const result = clampDate(date, min, max);
    expect(result.getDate()).toBe(5);
  });
  it('clampDate day 2 clamped to range 5..25 yields 5', () => {
    const min = new Date(2026, 0, 5);
    const max = new Date(2026, 0, 25);
    const date = new Date(2026, 0, 2);
    const result = clampDate(date, min, max);
    expect(result.getDate()).toBe(5);
  });
  it('clampDate day 3 clamped to range 5..25 yields 5', () => {
    const min = new Date(2026, 0, 5);
    const max = new Date(2026, 0, 25);
    const date = new Date(2026, 0, 3);
    const result = clampDate(date, min, max);
    expect(result.getDate()).toBe(5);
  });
  it('clampDate day 4 clamped to range 5..25 yields 5', () => {
    const min = new Date(2026, 0, 5);
    const max = new Date(2026, 0, 25);
    const date = new Date(2026, 0, 4);
    const result = clampDate(date, min, max);
    expect(result.getDate()).toBe(5);
  });
  it('clampDate day 5 clamped to range 5..25 yields 5', () => {
    const min = new Date(2026, 0, 5);
    const max = new Date(2026, 0, 25);
    const date = new Date(2026, 0, 5);
    const result = clampDate(date, min, max);
    expect(result.getDate()).toBe(5);
  });
  it('clampDate day 6 clamped to range 5..25 yields 6', () => {
    const min = new Date(2026, 0, 5);
    const max = new Date(2026, 0, 25);
    const date = new Date(2026, 0, 6);
    const result = clampDate(date, min, max);
    expect(result.getDate()).toBe(6);
  });
  it('clampDate day 7 clamped to range 5..25 yields 7', () => {
    const min = new Date(2026, 0, 5);
    const max = new Date(2026, 0, 25);
    const date = new Date(2026, 0, 7);
    const result = clampDate(date, min, max);
    expect(result.getDate()).toBe(7);
  });
  it('clampDate day 8 clamped to range 5..25 yields 8', () => {
    const min = new Date(2026, 0, 5);
    const max = new Date(2026, 0, 25);
    const date = new Date(2026, 0, 8);
    const result = clampDate(date, min, max);
    expect(result.getDate()).toBe(8);
  });
  it('clampDate day 9 clamped to range 5..25 yields 9', () => {
    const min = new Date(2026, 0, 5);
    const max = new Date(2026, 0, 25);
    const date = new Date(2026, 0, 9);
    const result = clampDate(date, min, max);
    expect(result.getDate()).toBe(9);
  });
  it('clampDate day 10 clamped to range 5..25 yields 10', () => {
    const min = new Date(2026, 0, 5);
    const max = new Date(2026, 0, 25);
    const date = new Date(2026, 0, 10);
    const result = clampDate(date, min, max);
    expect(result.getDate()).toBe(10);
  });
  it('clampDate day 11 clamped to range 5..25 yields 11', () => {
    const min = new Date(2026, 0, 5);
    const max = new Date(2026, 0, 25);
    const date = new Date(2026, 0, 11);
    const result = clampDate(date, min, max);
    expect(result.getDate()).toBe(11);
  });
  it('clampDate day 12 clamped to range 5..25 yields 12', () => {
    const min = new Date(2026, 0, 5);
    const max = new Date(2026, 0, 25);
    const date = new Date(2026, 0, 12);
    const result = clampDate(date, min, max);
    expect(result.getDate()).toBe(12);
  });
  it('clampDate day 13 clamped to range 5..25 yields 13', () => {
    const min = new Date(2026, 0, 5);
    const max = new Date(2026, 0, 25);
    const date = new Date(2026, 0, 13);
    const result = clampDate(date, min, max);
    expect(result.getDate()).toBe(13);
  });
  it('clampDate day 14 clamped to range 5..25 yields 14', () => {
    const min = new Date(2026, 0, 5);
    const max = new Date(2026, 0, 25);
    const date = new Date(2026, 0, 14);
    const result = clampDate(date, min, max);
    expect(result.getDate()).toBe(14);
  });
  it('clampDate day 15 clamped to range 5..25 yields 15', () => {
    const min = new Date(2026, 0, 5);
    const max = new Date(2026, 0, 25);
    const date = new Date(2026, 0, 15);
    const result = clampDate(date, min, max);
    expect(result.getDate()).toBe(15);
  });
  it('clampDate day 16 clamped to range 5..25 yields 16', () => {
    const min = new Date(2026, 0, 5);
    const max = new Date(2026, 0, 25);
    const date = new Date(2026, 0, 16);
    const result = clampDate(date, min, max);
    expect(result.getDate()).toBe(16);
  });
  it('clampDate day 17 clamped to range 5..25 yields 17', () => {
    const min = new Date(2026, 0, 5);
    const max = new Date(2026, 0, 25);
    const date = new Date(2026, 0, 17);
    const result = clampDate(date, min, max);
    expect(result.getDate()).toBe(17);
  });
  it('clampDate day 18 clamped to range 5..25 yields 18', () => {
    const min = new Date(2026, 0, 5);
    const max = new Date(2026, 0, 25);
    const date = new Date(2026, 0, 18);
    const result = clampDate(date, min, max);
    expect(result.getDate()).toBe(18);
  });
  it('clampDate day 19 clamped to range 5..25 yields 19', () => {
    const min = new Date(2026, 0, 5);
    const max = new Date(2026, 0, 25);
    const date = new Date(2026, 0, 19);
    const result = clampDate(date, min, max);
    expect(result.getDate()).toBe(19);
  });
  it('clampDate day 20 clamped to range 5..25 yields 20', () => {
    const min = new Date(2026, 0, 5);
    const max = new Date(2026, 0, 25);
    const date = new Date(2026, 0, 20);
    const result = clampDate(date, min, max);
    expect(result.getDate()).toBe(20);
  });
  it('clampDate day 21 clamped to range 5..25 yields 21', () => {
    const min = new Date(2026, 0, 5);
    const max = new Date(2026, 0, 25);
    const date = new Date(2026, 0, 21);
    const result = clampDate(date, min, max);
    expect(result.getDate()).toBe(21);
  });
  it('clampDate day 22 clamped to range 5..25 yields 22', () => {
    const min = new Date(2026, 0, 5);
    const max = new Date(2026, 0, 25);
    const date = new Date(2026, 0, 22);
    const result = clampDate(date, min, max);
    expect(result.getDate()).toBe(22);
  });
  it('clampDate day 23 clamped to range 5..25 yields 23', () => {
    const min = new Date(2026, 0, 5);
    const max = new Date(2026, 0, 25);
    const date = new Date(2026, 0, 23);
    const result = clampDate(date, min, max);
    expect(result.getDate()).toBe(23);
  });
  it('clampDate day 24 clamped to range 5..25 yields 24', () => {
    const min = new Date(2026, 0, 5);
    const max = new Date(2026, 0, 25);
    const date = new Date(2026, 0, 24);
    const result = clampDate(date, min, max);
    expect(result.getDate()).toBe(24);
  });
});

