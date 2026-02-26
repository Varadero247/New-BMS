// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

// ---------------------------------------------------------------------------
// Fibonacci (memoized top-down)
// ---------------------------------------------------------------------------

const _fibCache = new Map<number, number>();

/** Return the n-th Fibonacci number (0-indexed: fib(0)=0, fib(1)=1). */
export function fibonacci(n: number): number {
  if (n < 0) throw new RangeError('n must be >= 0');
  if (n === 0) return 0;
  if (n === 1) return 1;
  if (_fibCache.has(n)) return _fibCache.get(n)!;
  const result = fibonacci(n - 1) + fibonacci(n - 2);
  _fibCache.set(n, result);
  return result;
}

/** Return the first n Fibonacci numbers as an array. */
export function fibonacciSequence(n: number): number[] {
  if (n <= 0) return [];
  const seq: number[] = [];
  for (let i = 0; i < n; i++) seq.push(fibonacci(i));
  return seq;
}

// ---------------------------------------------------------------------------
// Longest Common Subsequence
// ---------------------------------------------------------------------------

/** Return the length of the LCS of strings a and b. */
export function lcsLength(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  // Use two-row DP for space efficiency
  let prev = new Array<number>(n + 1).fill(0);
  let curr = new Array<number>(n + 1).fill(0);
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        curr[j] = prev[j - 1] + 1;
      } else {
        curr[j] = Math.max(prev[j], curr[j - 1]);
      }
    }
    [prev, curr] = [curr, prev];
    curr.fill(0);
  }
  return prev[n];
}

/** Return one LCS string of a and b (full DP table for backtracking). */
export function lcs(a: string, b: string): string {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  // Backtrack
  let i = m;
  let j = n;
  const result: string[] = [];
  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) {
      result.push(a[i - 1]);
      i--;
      j--;
    } else if (dp[i - 1][j] > dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }
  return result.reverse().join('');
}

// ---------------------------------------------------------------------------
// Longest Increasing Subsequence
// ---------------------------------------------------------------------------

/** Return one LIS of arr (O(n²) DP with backtracking). */
export function lis(arr: number[]): number[] {
  if (arr.length === 0) return [];
  const n = arr.length;
  const dp = new Array<number>(n).fill(1);
  const parent = new Array<number>(n).fill(-1);
  let maxLen = 1;
  let maxIdx = 0;
  for (let i = 1; i < n; i++) {
    for (let j = 0; j < i; j++) {
      if (arr[j] < arr[i] && dp[j] + 1 > dp[i]) {
        dp[i] = dp[j] + 1;
        parent[i] = j;
      }
    }
    if (dp[i] > maxLen) {
      maxLen = dp[i];
      maxIdx = i;
    }
  }
  // Reconstruct
  const result: number[] = [];
  let idx = maxIdx;
  while (idx !== -1) {
    result.push(arr[idx]);
    idx = parent[idx];
  }
  return result.reverse();
}

/** Return the length of the LIS using O(n log n) patience sort. */
export function lisLength(arr: number[]): number {
  if (arr.length === 0) return 0;
  const tails: number[] = [];
  for (const x of arr) {
    let lo = 0;
    let hi = tails.length;
    while (lo < hi) {
      const mid = (lo + hi) >>> 1;
      if (tails[mid] < x) lo = mid + 1;
      else hi = mid;
    }
    tails[lo] = x;
  }
  return tails.length;
}

// ---------------------------------------------------------------------------
// 0/1 Knapsack
// ---------------------------------------------------------------------------

export interface KnapsackItem {
  weight: number;
  value: number;
}

/** 0/1 knapsack. Returns maxValue and indices of selected items. */
export function knapsack01(
  items: KnapsackItem[],
  capacity: number
): { maxValue: number; selectedItems: number[] } {
  const n = items.length;
  if (n === 0 || capacity <= 0) return { maxValue: 0, selectedItems: [] };

  // dp[i][w] = max value using first i items with capacity w
  const dp: number[][] = Array.from({ length: n + 1 }, () =>
    new Array<number>(capacity + 1).fill(0)
  );

  for (let i = 1; i <= n; i++) {
    const { weight, value } = items[i - 1];
    for (let w = 0; w <= capacity; w++) {
      dp[i][w] = dp[i - 1][w];
      if (weight <= w) {
        dp[i][w] = Math.max(dp[i][w], dp[i - 1][w - weight] + value);
      }
    }
  }

  // Backtrack to find selected items
  const selectedItems: number[] = [];
  let w = capacity;
  for (let i = n; i > 0; i--) {
    if (dp[i][w] !== dp[i - 1][w]) {
      selectedItems.push(i - 1);
      w -= items[i - 1].weight;
    }
  }
  selectedItems.reverse();

  return { maxValue: dp[n][capacity], selectedItems };
}

// ---------------------------------------------------------------------------
// Unbounded Knapsack
// ---------------------------------------------------------------------------

/** Unbounded knapsack — items can be used multiple times. Returns max value. */
export function knapsackUnbounded(items: KnapsackItem[], capacity: number): number {
  if (capacity <= 0 || items.length === 0) return 0;
  const dp = new Array<number>(capacity + 1).fill(0);
  for (let w = 1; w <= capacity; w++) {
    for (const item of items) {
      if (item.weight <= w) {
        dp[w] = Math.max(dp[w], dp[w - item.weight] + item.value);
      }
    }
  }
  return dp[capacity];
}

// ---------------------------------------------------------------------------
// Coin Change
// ---------------------------------------------------------------------------

/** Minimum coins to make amount. Returns -1 if impossible. */
export function coinChange(coins: number[], amount: number): number {
  if (amount === 0) return 0;
  if (amount < 0 || coins.length === 0) return -1;
  const dp = new Array<number>(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (let i = 1; i <= amount; i++) {
    for (const coin of coins) {
      if (coin <= i && dp[i - coin] + 1 < dp[i]) {
        dp[i] = dp[i - coin] + 1;
      }
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}

/** Number of ways to make amount using coins (order doesn't matter). */
export function coinChangeWays(coins: number[], amount: number): number {
  if (amount === 0) return 1;
  if (amount < 0 || coins.length === 0) return 0;
  const dp = new Array<number>(amount + 1).fill(0);
  dp[0] = 1;
  for (const coin of coins) {
    for (let i = coin; i <= amount; i++) {
      dp[i] += dp[i - coin];
    }
  }
  return dp[amount];
}

// ---------------------------------------------------------------------------
// Edit Distance (Levenshtein)
// ---------------------------------------------------------------------------

/** Levenshtein edit distance — O(min(m,n)) space. */
export function editDistance(a: string, b: string): number {
  // Ensure a is the shorter string for space optimisation
  if (a.length > b.length) return editDistance(b, a);
  const m = a.length;
  const n = b.length;
  let prev = Array.from({ length: m + 1 }, (_, i) => i);
  let curr = new Array<number>(m + 1).fill(0);
  for (let j = 1; j <= n; j++) {
    curr[0] = j;
    for (let i = 1; i <= m; i++) {
      if (a[i - 1] === b[j - 1]) {
        curr[i] = prev[i - 1];
      } else {
        curr[i] = 1 + Math.min(prev[i - 1], prev[i], curr[i - 1]);
      }
    }
    [prev, curr] = [curr, prev];
  }
  return prev[m];
}

export type EditOp = {
  op: 'insert' | 'delete' | 'replace' | 'match';
  char?: string;
};

/** Edit distance with full operation trace (full DP table). */
export function editDistanceOps(a: string, b: string): EditOp[] {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) => {
    const row = new Array<number>(n + 1).fill(0);
    row[0] = i;
    return row;
  });
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack
  const ops: EditOp[] = [];
  let i = m;
  let j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
      ops.push({ op: 'match', char: a[i - 1] });
      i--;
      j--;
    } else if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + 1) {
      ops.push({ op: 'replace', char: b[j - 1] });
      i--;
      j--;
    } else if (j > 0 && dp[i][j] === dp[i][j - 1] + 1) {
      ops.push({ op: 'insert', char: b[j - 1] });
      j--;
    } else {
      ops.push({ op: 'delete', char: a[i - 1] });
      i--;
    }
  }
  return ops.reverse();
}

// ---------------------------------------------------------------------------
// Matrix Chain Multiplication
// ---------------------------------------------------------------------------

/**
 * Minimum scalar multiplications for matrix chain.
 * dims has length n+1, representing n matrices where matrix i is dims[i] x dims[i+1].
 */
export function matrixChain(dims: number[]): number {
  const n = dims.length - 1;
  if (n <= 1) return 0;

  // dp[i][j] = min multiplications to compute matrices i..j (0-indexed)
  const dp: number[][] = Array.from({ length: n }, () => new Array<number>(n).fill(0));

  for (let len = 2; len <= n; len++) {
    for (let i = 0; i <= n - len; i++) {
      const j = i + len - 1;
      dp[i][j] = Infinity;
      for (let k = i; k < j; k++) {
        const cost = dp[i][k] + dp[k + 1][j] + dims[i] * dims[k + 1] * dims[j + 1];
        if (cost < dp[i][j]) dp[i][j] = cost;
      }
    }
  }
  return dp[0][n - 1];
}

// ---------------------------------------------------------------------------
// Partition Equal Subset Sum
// ---------------------------------------------------------------------------

/** Can nums be partitioned into two subsets with equal sum? */
export function canPartition(nums: number[]): boolean {
  const total = nums.reduce((s, x) => s + x, 0);
  if (total % 2 !== 0) return false;
  return subsetSum(nums, total / 2);
}

// ---------------------------------------------------------------------------
// Subset Sum
// ---------------------------------------------------------------------------

/** Can we pick a subset of nums that sums to target? */
export function subsetSum(nums: number[], target: number): boolean {
  if (target === 0) return true;
  if (target < 0 || nums.length === 0) return false;
  const dp = new Array<boolean>(target + 1).fill(false);
  dp[0] = true;
  for (const num of nums) {
    for (let j = target; j >= num; j--) {
      if (dp[j - num]) dp[j] = true;
    }
  }
  return dp[target];
}

// ---------------------------------------------------------------------------
// Maximum Subarray (Kadane's Algorithm)
// ---------------------------------------------------------------------------

/** Maximum subarray sum (Kadane's). Returns -Infinity for empty array. */
export function maxSubarraySum(arr: number[]): number {
  if (arr.length === 0) return -Infinity;
  let maxSum = arr[0];
  let current = arr[0];
  for (let i = 1; i < arr.length; i++) {
    current = Math.max(arr[i], current + arr[i]);
    if (current > maxSum) maxSum = current;
  }
  return maxSum;
}

/** Maximum subarray with start/end indices. */
export function maxSubarray(arr: number[]): { sum: number; start: number; end: number } {
  if (arr.length === 0) return { sum: -Infinity, start: -1, end: -1 };
  let maxSum = arr[0];
  let current = arr[0];
  let start = 0;
  let end = 0;
  let tempStart = 0;
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] > current + arr[i]) {
      current = arr[i];
      tempStart = i;
    } else {
      current = current + arr[i];
    }
    if (current > maxSum) {
      maxSum = current;
      start = tempStart;
      end = i;
    }
  }
  return { sum: maxSum, start, end };
}

// ---------------------------------------------------------------------------
// Minimum Path Sum in Grid
// ---------------------------------------------------------------------------

/** Minimum path sum from top-left to bottom-right, moving only right or down. */
export function minPathSum(grid: number[][]): number {
  if (grid.length === 0 || grid[0].length === 0) return 0;
  const m = grid.length;
  const n = grid[0].length;
  const dp: number[][] = Array.from({ length: m }, () => new Array<number>(n).fill(0));
  dp[0][0] = grid[0][0];
  for (let i = 1; i < m; i++) dp[i][0] = dp[i - 1][0] + grid[i][0];
  for (let j = 1; j < n; j++) dp[0][j] = dp[0][j - 1] + grid[0][j];
  for (let i = 1; i < m; i++) {
    for (let j = 1; j < n; j++) {
      dp[i][j] = Math.min(dp[i - 1][j], dp[i][j - 1]) + grid[i][j];
    }
  }
  return dp[m - 1][n - 1];
}

// ---------------------------------------------------------------------------
// Unique Paths
// ---------------------------------------------------------------------------

/** Number of unique paths from top-left to bottom-right in m×n grid. */
export function uniquePaths(m: number, n: number): number {
  if (m <= 0 || n <= 0) return 0;
  const dp = new Array<number>(n).fill(1);
  for (let i = 1; i < m; i++) {
    for (let j = 1; j < n; j++) {
      dp[j] += dp[j - 1];
    }
  }
  return dp[n - 1];
}

/** Unique paths with obstacles (0=open, 1=obstacle). */
export function uniquePathsWithObstacles(grid: number[][]): number {
  const m = grid.length;
  if (m === 0) return 0;
  const n = grid[0].length;
  if (grid[0][0] === 1 || grid[m - 1][n - 1] === 1) return 0;
  const dp = new Array<number>(n).fill(0);
  dp[0] = 1;
  for (let j = 1; j < n; j++) dp[j] = grid[0][j] === 1 ? 0 : dp[j - 1];
  for (let i = 1; i < m; i++) {
    dp[0] = grid[i][0] === 1 ? 0 : dp[0];
    for (let j = 1; j < n; j++) {
      dp[j] = grid[i][j] === 1 ? 0 : dp[j] + dp[j - 1];
    }
  }
  return dp[n - 1];
}

// ---------------------------------------------------------------------------
// Longest Palindromic Subsequence
// ---------------------------------------------------------------------------

/** Longest palindromic subsequence length. */
export function longestPalindromicSubsequence(s: string): number {
  return lcsLength(s, s.split('').reverse().join(''));
}

// ---------------------------------------------------------------------------
// Longest Palindromic Substring (Manacher-like DP)
// ---------------------------------------------------------------------------

/** Longest palindromic substring (first one if ties). */
export function longestPalindromicSubstring(s: string): string {
  if (s.length === 0) return '';
  const n = s.length;
  let start = 0;
  let maxLen = 1;

  // Expand around center
  const expand = (l: number, r: number): void => {
    while (l >= 0 && r < n && s[l] === s[r]) {
      if (r - l + 1 > maxLen) {
        maxLen = r - l + 1;
        start = l;
      }
      l--;
      r++;
    }
  };

  for (let i = 0; i < n; i++) {
    expand(i, i);     // Odd length
    expand(i, i + 1); // Even length
  }
  return s.substring(start, start + maxLen);
}

// ---------------------------------------------------------------------------
// Word Break
// ---------------------------------------------------------------------------

/** Can s be segmented into words from wordDict? */
export function wordBreak(s: string, wordDict: string[]): boolean {
  const wordSet = new Set(wordDict);
  const n = s.length;
  const dp = new Array<boolean>(n + 1).fill(false);
  dp[0] = true;
  for (let i = 1; i <= n; i++) {
    for (let j = 0; j < i; j++) {
      if (dp[j] && wordSet.has(s.substring(j, i))) {
        dp[i] = true;
        break;
      }
    }
  }
  return dp[n];
}

/** All valid segmentations of s into words from wordDict. */
export function wordBreakAll(s: string, wordDict: string[]): string[] {
  const wordSet = new Set(wordDict);
  const memo = new Map<number, string[]>();

  function helper(start: number): string[] {
    if (memo.has(start)) return memo.get(start)!;
    if (start === s.length) return [''];
    const results: string[] = [];
    for (let end = start + 1; end <= s.length; end++) {
      const word = s.substring(start, end);
      if (wordSet.has(word)) {
        const rest = helper(end);
        for (const r of rest) {
          results.push(r === '' ? word : word + ' ' + r);
        }
      }
    }
    memo.set(start, results);
    return results;
  }

  return helper(0);
}

// ---------------------------------------------------------------------------
// Jump Game
// ---------------------------------------------------------------------------

/** Can you reach the last index from index 0? */
export function canJump(nums: number[]): boolean {
  let maxReach = 0;
  for (let i = 0; i < nums.length; i++) {
    if (i > maxReach) return false;
    maxReach = Math.max(maxReach, i + nums[i]);
  }
  return true;
}

/** Minimum number of jumps to reach the last index. Returns Infinity if impossible. */
export function minJumps(nums: number[]): number {
  const n = nums.length;
  if (n <= 1) return 0;
  let jumps = 0;
  let currentEnd = 0;
  let farthest = 0;
  for (let i = 0; i < n - 1; i++) {
    farthest = Math.max(farthest, i + nums[i]);
    if (i === currentEnd) {
      if (farthest <= i) return Infinity; // can't progress
      jumps++;
      currentEnd = farthest;
      if (currentEnd >= n - 1) break;
    }
  }
  return jumps;
}

// ---------------------------------------------------------------------------
// House Robber
// ---------------------------------------------------------------------------

/** Max money from non-adjacent houses (linear). */
export function houseRobber(nums: number[]): number {
  if (nums.length === 0) return 0;
  if (nums.length === 1) return nums[0];
  let prev2 = 0;
  let prev1 = 0;
  for (const n of nums) {
    const curr = Math.max(prev1, prev2 + n);
    prev2 = prev1;
    prev1 = curr;
  }
  return prev1;
}

/** Max money from houses arranged in a circle (no two adjacent). */
export function houseRobberCircular(nums: number[]): number {
  const n = nums.length;
  if (n === 0) return 0;
  if (n === 1) return nums[0];
  if (n === 2) return Math.max(nums[0], nums[1]);
  // Either exclude first or exclude last
  return Math.max(houseRobber(nums.slice(0, n - 1)), houseRobber(nums.slice(1)));
}

// ---------------------------------------------------------------------------
// Memoize Helper
// ---------------------------------------------------------------------------

/**
 * Generic memoize for top-down DP.
 * keyFn defaults to JSON.stringify of arguments.
 */
export function memoize<T extends unknown[], R>(
  fn: (...args: T) => R,
  keyFn?: (...args: T) => string
): (...args: T) => R {
  const cache = new Map<string, R>();
  return (...args: T): R => {
    const key = keyFn ? keyFn(...args) : JSON.stringify(args);
    if (cache.has(key)) return cache.get(key)!;
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}


// Aliases for test compatibility
export function longestIncreasingSubsequence(arr: number[]): number {
  return lisLength(arr);
}

export function knapsack(weights: number[], values: number[], capacity: number): number {
  const items = weights.map((w, i) => ({ weight: w, value: values[i] }));
  return knapsack01(items, capacity).maxValue;
}

export function matrixChainMultiplication(dims: number[]): number {
  return matrixChain(dims);
}
