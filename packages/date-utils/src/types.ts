export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;  // 0=Sun, 6=Sat
export type TimeUnit = 'ms' | 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'years';
export type QuarterNumber = 1 | 2 | 3 | 4;

export interface DateRange {
  start: Date;
  end: Date;
}

export interface BusinessDayOptions {
  holidays?: Date[];
  workDays?: DayOfWeek[];  // defaults to Mon-Fri (1-5)
}
