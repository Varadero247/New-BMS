// Copyright (c) 2026 Nexara DMCC. All rights reserved.

export interface Interval { start: number; end: number; }

export function interval(start: number, end: number): Interval { return { start, end }; }
export function length(i: Interval): number { return Math.max(0, i.end - i.start); }
export function isEmpty(i: Interval): boolean { return i.start >= i.end; }
export function contains(i: Interval, point: number): boolean { return point >= i.start && point <= i.end; }
export function containsInterval(outer: Interval, inner: Interval): boolean { return inner.start >= outer.start && inner.end <= outer.end; }
export function overlaps(a: Interval, b: Interval): boolean { return a.start < b.end && b.start < a.end; }
export function intersect(a: Interval, b: Interval): Interval | null {
  const start = Math.max(a.start, b.start), end = Math.min(a.end, b.end);
  return start < end ? { start, end } : null;
}
export function union(a: Interval, b: Interval): Interval {
  return { start: Math.min(a.start, b.start), end: Math.max(a.end, b.end) };
}
export function clamp(value: number, i: Interval): number { return Math.max(i.start, Math.min(i.end, value)); }
export function expand(i: Interval, amount: number): Interval { return { start: i.start - amount, end: i.end + amount }; }
export function shift(i: Interval, amount: number): Interval { return { start: i.start + amount, end: i.end + amount }; }
export function scale(i: Interval, factor: number): Interval { return { start: i.start * factor, end: i.end * factor }; }
export function normalise(value: number, i: Interval): number {
  const len = length(i); return len === 0 ? 0 : (value - i.start) / len;
}
export function denormalise(t: number, i: Interval): number { return i.start + t * length(i); }
export function compare(a: Interval, b: Interval): number {
  return a.start !== b.start ? a.start - b.start : a.end - b.end;
}
export function merge(intervals: Interval[]): Interval[] {
  if (!intervals.length) return [];
  const sorted = [...intervals].sort(compare);
  const result: Interval[] = [sorted[0]];
  for (let i = 1; i < sorted.length; i++) {
    const last = result[result.length - 1];
    if (sorted[i].start <= last.end) last.end = Math.max(last.end, sorted[i].end);
    else result.push(sorted[i]);
  }
  return result;
}
export function subtract(a: Interval, b: Interval): Interval[] {
  if (!overlaps(a, b)) return [a];
  const result: Interval[] = [];
  if (a.start < b.start) result.push({ start: a.start, end: b.start });
  if (a.end > b.end) result.push({ start: b.end, end: a.end });
  return result;
}
export function midpoint(i: Interval): number { return (i.start + i.end) / 2; }
export function equal(a: Interval, b: Interval): boolean { return a.start === b.start && a.end === b.end; }
