// Copyright (c) 2026 Nexara DMCC. All rights reserved.

export interface Interval { start: number; end: number; }
export interface WeightedInterval extends Interval { weight: number; }
export interface Job { id: string | number; start: number; end: number; weight?: number; }

/**
 * maxNonOverlapping — greedy algorithm, maximize count of non-overlapping intervals.
 * Sort by end time, greedily select intervals that don't overlap the last selected.
 */
export function maxNonOverlapping(intervals: Interval[]): Interval[] {
  if (intervals.length === 0) return [];
  const sorted = [...intervals].sort((a, b) => a.end - b.end);
  const result: Interval[] = [];
  let lastEnd = -Infinity;
  for (const iv of sorted) {
    if (iv.start >= lastEnd) {
      result.push(iv);
      lastEnd = iv.end;
    }
  }
  return result;
}

/**
 * minMachines — minimum number of machines required so all intervals can run concurrently.
 * Uses a sweep-line / event approach.
 */
export function minMachines(intervals: Interval[]): number {
  if (intervals.length === 0) return 0;
  const events: Array<[number, number]> = [];
  for (const iv of intervals) {
    events.push([iv.start, 1]);
    events.push([iv.end, -1]);
  }
  // Sort by time; on ties, end events (-1) before start events (+1) so that
  // an interval ending exactly when another starts does NOT require an extra machine.
  events.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  let current = 0;
  let maxMachines = 0;
  for (const [, delta] of events) {
    current += delta;
    if (current > maxMachines) maxMachines = current;
  }
  return maxMachines;
}

/**
 * mergeIntervals — merge all overlapping/adjacent intervals into one.
 */
export function mergeIntervals(intervals: Interval[]): Interval[] {
  if (intervals.length === 0) return [];
  const sorted = [...intervals].sort((a, b) => a.start - b.start);
  const result: Interval[] = [{ ...sorted[0] }];
  for (let i = 1; i < sorted.length; i++) {
    const last = result[result.length - 1];
    if (sorted[i].start <= last.end) {
      if (sorted[i].end > last.end) last.end = sorted[i].end;
    } else {
      result.push({ ...sorted[i] });
    }
  }
  return result;
}

/**
 * intersectionLength — length of overlap between two intervals (0 if none).
 */
export function intersectionLength(a: Interval, b: Interval): number {
  const start = Math.max(a.start, b.start);
  const end = Math.min(a.end, b.end);
  return Math.max(0, end - start);
}

/**
 * doOverlap — true if the two intervals overlap (touching endpoints do NOT overlap).
 */
export function doOverlap(a: Interval, b: Interval): boolean {
  return a.start < b.end && b.start < a.end;
}

/**
 * maxWeightSchedule — DP, maximize total weight of non-overlapping weighted intervals.
 * Returns the selected intervals.
 */
export function maxWeightSchedule(intervals: WeightedInterval[]): WeightedInterval[] {
  if (intervals.length === 0) return [];
  const sorted = [...intervals].sort((a, b) => a.end - b.end);
  const n = sorted.length;

  // For each i, find the latest j such that sorted[j].end <= sorted[i].start
  function latestNonConflict(i: number): number {
    let lo = 0, hi = i - 1, result = -1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (sorted[mid].end <= sorted[i].start) {
        result = mid;
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }
    return result;
  }

  const dp = new Array(n).fill(0);
  dp[0] = sorted[0].weight;
  for (let i = 1; i < n; i++) {
    const include = sorted[i].weight + (latestNonConflict(i) >= 0 ? dp[latestNonConflict(i)] : 0);
    dp[i] = Math.max(include, dp[i - 1]);
  }

  // Backtrack to find selected intervals
  const selected: WeightedInterval[] = [];
  let i = n - 1;
  while (i >= 0) {
    const j = latestNonConflict(i);
    const include = sorted[i].weight + (j >= 0 ? dp[j] : 0);
    if (i === 0 || include >= dp[i - 1]) {
      selected.push(sorted[i]);
      i = j;
    } else {
      i--;
    }
  }
  return selected.reverse();
}

/**
 * maxWeightScheduleValue — returns the maximum total weight (number only).
 */
export function maxWeightScheduleValue(intervals: WeightedInterval[]): number {
  if (intervals.length === 0) return 0;
  const sorted = [...intervals].sort((a, b) => a.end - b.end);
  const n = sorted.length;

  function latestNonConflict(i: number): number {
    let lo = 0, hi = i - 1, result = -1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (sorted[mid].end <= sorted[i].start) {
        result = mid;
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }
    return result;
  }

  const dp = new Array(n).fill(0);
  dp[0] = sorted[0].weight;
  for (let i = 1; i < n; i++) {
    const j = latestNonConflict(i);
    const include = sorted[i].weight + (j >= 0 ? dp[j] : 0);
    dp[i] = Math.max(include, dp[i - 1]);
  }
  return dp[n - 1];
}

/**
 * intervalCoverage — returns true if the union of intervals fully covers the target.
 */
export function intervalCoverage(intervals: Interval[], target: Interval): boolean {
  if (target.start >= target.end) return true; // degenerate target
  const relevant = intervals.filter(iv => iv.start <= target.start + (target.end - target.start) && iv.end > target.start);
  if (relevant.length === 0) return false;
  const merged = mergeIntervals(relevant);
  // Check if any merged interval fully covers target
  for (const m of merged) {
    if (m.start <= target.start && m.end >= target.end) return true;
  }
  return false;
}

/**
 * minIntervalsToCover — minimum number of intervals from the list needed to cover target.
 * Returns -1 if impossible.
 */
export function minIntervalsTocover(intervals: Interval[], target: Interval): number {
  if (target.start >= target.end) return 0;
  // Greedy: at each step, among all intervals that start <= current coverage end,
  // pick the one that extends the furthest.
  const relevant = intervals
    .filter(iv => iv.start <= target.end && iv.end > iv.start)
    .sort((a, b) => a.start - b.start);

  let covered = target.start;
  let count = 0;
  let i = 0;
  while (covered < target.end) {
    let best = covered;
    while (i < relevant.length && relevant[i].start <= covered) {
      if (relevant[i].end > best) best = relevant[i].end;
      i++;
    }
    if (best === covered) return -1; // no progress
    covered = best;
    count++;
  }
  return count;
}

/**
 * activitySelection — maximize number of non-overlapping jobs (greedy by end time).
 */
export function activitySelection(jobs: Job[]): Job[] {
  if (jobs.length === 0) return [];
  const sorted = [...jobs].sort((a, b) => a.end - b.end);
  const result: Job[] = [];
  let lastEnd = -Infinity;
  for (const job of sorted) {
    if (job.start >= lastEnd) {
      result.push(job);
      lastEnd = job.end;
    }
  }
  return result;
}

/**
 * partitionIntoMinChains — partition intervals into minimum number of non-overlapping chains.
 * By Dilworth's theorem this equals the maximum antichain size, but practically we
 * use a greedy approach: assign each interval to a chain whose last element ends earliest
 * and is <= the new interval's start; otherwise open a new chain.
 */
export function partitionIntoMinChains(intervals: Interval[]): Interval[][] {
  if (intervals.length === 0) return [];
  const sorted = [...intervals].sort((a, b) => a.start - b.start);
  // Each chain is stored with its last end time
  const chains: Interval[][] = [];
  const chainEnds: number[] = [];

  for (const iv of sorted) {
    // Find the chain with the largest end time that is <= iv.start
    let bestChain = -1;
    let bestEnd = -Infinity;
    for (let c = 0; c < chainEnds.length; c++) {
      if (chainEnds[c] <= iv.start && chainEnds[c] > bestEnd) {
        bestEnd = chainEnds[c];
        bestChain = c;
      }
    }
    if (bestChain >= 0) {
      chains[bestChain].push(iv);
      chainEnds[bestChain] = iv.end;
    } else {
      chains.push([iv]);
      chainEnds.push(iv.end);
    }
  }
  return chains;
}

/**
 * longestIncreasingSubsequenceLength — classic LIS using patience sorting (O(n log n)).
 */
export function longestIncreasingSubsequenceLength(arr: number[]): number {
  if (arr.length === 0) return 0;
  const tails: number[] = [];
  for (const x of arr) {
    let lo = 0, hi = tails.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (tails[mid] < x) lo = mid + 1;
      else hi = mid;
    }
    tails[lo] = x;
  }
  return tails.length;
}

/**
 * trapRainWater — classic two-pointer approach.
 */
export function trapRainWater(heights: number[]): number {
  if (heights.length < 3) return 0;
  let left = 0, right = heights.length - 1;
  let leftMax = 0, rightMax = 0, water = 0;
  while (left < right) {
    if (heights[left] <= heights[right]) {
      if (heights[left] >= leftMax) leftMax = heights[left];
      else water += leftMax - heights[left];
      left++;
    } else {
      if (heights[right] >= rightMax) rightMax = heights[right];
      else water += rightMax - heights[right];
      right--;
    }
  }
  return water;
}

/**
 * jobSchedulingMaxProfit — weighted job scheduling DP (similar to maxWeightScheduleValue).
 * Given parallel arrays of start times, end times, and profits.
 */
export function jobSchedulingMaxProfit(
  startTimes: number[],
  endTimes: number[],
  profits: number[]
): number {
  const n = startTimes.length;
  if (n === 0) return 0;
  // Build and sort jobs by end time
  const jobs = Array.from({ length: n }, (_, i) => ({
    start: startTimes[i],
    end: endTimes[i],
    profit: profits[i],
  })).sort((a, b) => a.end - b.end);

  // dp[i] = max profit considering first i jobs (1-indexed), dp[0] = 0
  const dp = new Array(n + 1).fill(0);
  for (let i = 1; i <= n; i++) {
    const job = jobs[i - 1];
    // Binary search: latest job j (1-indexed) such that jobs[j-1].end <= job.start
    let lo = 0, hi = i - 1, last = 0;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (jobs[mid - 1 + (mid > 0 ? 0 : 0)]?.end !== undefined && mid > 0 && jobs[mid - 1].end <= job.start) {
        last = mid;
        lo = mid + 1;
      } else if (mid === 0) {
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }
    dp[i] = Math.max(dp[i - 1], dp[last] + job.profit);
  }
  return dp[n];
}
