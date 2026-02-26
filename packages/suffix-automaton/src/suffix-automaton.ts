// Copyright (c) 2026 Nexara DMCC. All rights reserved.

interface SAMState {
  len: number;
  link: number;
  next: Map<string, number>;
  endpos: boolean; // is this a terminal state?
  cnt: number;     // number of occurrences (filled after construction)
}

export class SuffixAutomaton {
  private states: SAMState[];
  private last: number;
  private text: string;

  constructor(s: string) {
    this.text = s;
    this.states = [];
    this.last = 0;
    // Initial state
    this.states.push({ len: 0, link: -1, next: new Map(), endpos: false, cnt: 0 });
    for (const ch of s) {
      this.extend(ch);
    }
    // Mark terminal states
    let cur = this.last;
    while (cur !== -1) {
      this.states[cur].endpos = true;
      cur = this.states[cur].link;
    }
    // Count occurrences using topological sort by len
    this.computeCounts();
  }

  private extend(ch: string): void {
    const cur = this.states.length;
    this.states.push({ len: this.states[this.last].len + 1, link: -1, next: new Map(), endpos: false, cnt: 1 });
    let p = this.last;
    while (p !== -1 && !this.states[p].next.has(ch)) {
      this.states[p].next.set(ch, cur);
      p = this.states[p].link;
    }
    if (p === -1) {
      this.states[cur].link = 0;
    } else {
      const q = this.states[p].next.get(ch)!;
      if (this.states[p].len + 1 === this.states[q].len) {
        this.states[cur].link = q;
      } else {
        const clone = this.states.length;
        this.states.push({
          len: this.states[p].len + 1,
          link: this.states[q].link,
          next: new Map(this.states[q].next),
          endpos: false,
          cnt: 0
        });
        while (p !== -1 && this.states[p].next.get(ch) === q) {
          this.states[p].next.set(ch, clone);
          p = this.states[p].link;
        }
        this.states[q].link = clone;
        this.states[cur].link = clone;
      }
    }
    this.last = cur;
  }

  private computeCounts(): void {
    // Topological sort by decreasing len, propagate cnt up suffix links
    const order = [...this.states.keys()].sort((a, b) => this.states[b].len - this.states[a].len);
    for (const v of order) {
      const lnk = this.states[v].link;
      if (lnk !== -1) this.states[lnk].cnt += this.states[v].cnt;
    }
  }

  /** Number of states in SAM */
  get size(): number { return this.states.length; }

  /** Is the given string a substring of the original? */
  isSubstring(t: string): boolean {
    let cur = 0;
    for (const ch of t) {
      const nxt = this.states[cur].next.get(ch);
      if (nxt === undefined) return false;
      cur = nxt;
    }
    return true;
  }

  /** Count occurrences of substring t */
  countOccurrences(t: string): number {
    if (t.length === 0) return this.text.length + 1;
    let cur = 0;
    for (const ch of t) {
      const nxt = this.states[cur].next.get(ch);
      if (nxt === undefined) return 0;
      cur = nxt;
    }
    return this.states[cur].cnt;
  }

  /** Number of distinct substrings (non-empty) */
  countDistinctSubstrings(): number {
    let total = 0;
    for (let i = 1; i < this.states.length; i++) {
      total += this.states[i].len - this.states[this.states[i].link].len;
    }
    return total;
  }

  /** Lexicographically k-th substring (1-indexed) */
  kthSubstring(k: number): string | null {
    if (k <= 0) return null;
    // dp[v] = number of distinct paths (substrings) from v
    const dp = new Array(this.states.length).fill(0);
    const order = [...this.states.keys()].sort((a, b) => this.states[b].len - this.states[a].len);
    for (const v of order) {
      dp[v] = 1; // the path ending at v
      for (const nxt of this.states[v].next.values()) {
        dp[v] += dp[nxt];
      }
    }
    let cur = 0;
    let result = '';
    let rem = k;
    while (rem > 0) {
      // Sort edges by character for lex order
      const edges = [...this.states[cur].next.entries()].sort((a, b) => a[0] < b[0] ? -1 : 1);
      let found = false;
      for (const [ch, nxt] of edges) {
        if (rem <= dp[nxt]) {
          result += ch;
          cur = nxt;
          rem--;
          found = true;
          break;
        }
        rem -= dp[nxt];
      }
      if (!found) return null;
    }
    return result;
  }

  /** Longest common substring with another string */
  longestCommonSubstring(t: string): string {
    let cur = 0, len = 0, best = 0, bestEnd = 0;
    for (let i = 0; i < t.length; i++) {
      const ch = t[i];
      while (cur !== 0 && !this.states[cur].next.has(ch)) {
        cur = this.states[cur].link;
        len = this.states[cur].len;
      }
      if (this.states[cur].next.has(ch)) {
        cur = this.states[cur].next.get(ch)!;
        len++;
      }
      if (len > best) { best = len; bestEnd = i; }
    }
    return t.slice(bestEnd - best + 1, bestEnd + 1);
  }

  /** Get the text used to construct this SAM */
  getText(): string { return this.text; }

  /** Get all states (for advanced usage) */
  getStates(): SAMState[] { return this.states; }
}

// Standalone functions

/** Build SAM and check if t is a substring of s */
export function isSubstring(s: string, t: string): boolean {
  if (t.length === 0) return true;
  if (s.length === 0) return false;
  return new SuffixAutomaton(s).isSubstring(t);
}

/** Count occurrences of t in s */
export function countOccurrences(s: string, t: string): number {
  if (t.length === 0) return s.length + 1;
  if (s.length === 0) return 0;
  return new SuffixAutomaton(s).countOccurrences(t);
}

/** Count distinct substrings of s (including empty string) */
export function countDistinctSubstrings(s: string): number {
  if (s.length === 0) return 1; // just empty string
  return new SuffixAutomaton(s).countDistinctSubstrings() + 1; // +1 for empty
}

/** Longest common substring of s and t */
export function longestCommonSubstring(s: string, t: string): string {
  if (s.length === 0 || t.length === 0) return '';
  return new SuffixAutomaton(s).longestCommonSubstring(t);
}

/** k-th lexicographically smallest substring (1-indexed, non-empty) */
export function kthSubstring(s: string, k: number): string | null {
  if (s.length === 0) return null;
  return new SuffixAutomaton(s).kthSubstring(k);
}

/** Check if s1 is a rotation of s2 */
export function isRotation(s1: string, s2: string): boolean {
  if (s1.length !== s2.length) return false;
  if (s1.length === 0) return true;
  return isSubstring(s1 + s1, s2);
}

/** Find the shortest substring of s that does NOT appear in t */
export function shortestUniqueSubstring(s: string, t: string): string | null {
  if (s.length === 0) return null;
  const sam = new SuffixAutomaton(t);
  // Try all substrings of s by length, return shortest not in t
  for (let len = 1; len <= s.length; len++) {
    for (let start = 0; start <= s.length - len; start++) {
      const sub = s.slice(start, start + len);
      if (!sam.isSubstring(sub)) return sub;
    }
  }
  return null;
}

/** Count substrings of s that appear in t */
export function countSharedSubstrings(s: string, t: string): number {
  if (s.length === 0 || t.length === 0) return 0;
  const sam = new SuffixAutomaton(t);
  let count = 0;
  for (let i = 0; i < s.length; i++) {
    for (let j = i + 1; j <= s.length; j++) {
      if (sam.isSubstring(s.slice(i, j))) count++;
    }
  }
  return count;
}

/** All distinct substrings of s (non-empty), sorted lexicographically */
export function allDistinctSubstrings(s: string): string[] {
  if (s.length === 0) return [];
  const set = new Set<string>();
  for (let i = 0; i < s.length; i++) {
    for (let j = i + 1; j <= s.length; j++) {
      set.add(s.slice(i, j));
    }
  }
  return [...set].sort();
}

/** Longest repeated substring in s */
export function longestRepeatedSubstring(s: string): string {
  if (s.length <= 1) return '';
  const sam = new SuffixAutomaton(s);
  // A substring repeated at least twice has cnt >= 2 in SAM
  // Among those states, find the one with maximum len
  let best = 0;
  let bestState = -1;
  const states = sam.getStates();
  for (let i = 1; i < states.length; i++) {
    if (states[i].cnt >= 2 && states[i].len > best) {
      best = states[i].len;
      bestState = i;
    }
  }
  if (bestState === -1) return '';
  // Recover string: traverse from initial state following transitions
  // We do a BFS/DFS to find a path of length `best` to this state
  const target = bestState;
  const targetLen = best;
  // BFS from state 0
  const queue: Array<{ state: number; path: string }> = [{ state: 0, path: '' }];
  while (queue.length > 0) {
    const { state, path } = queue.shift()!;
    if (state === target && path.length === targetLen) return path;
    if (path.length >= targetLen) continue;
    for (const [ch, nxt] of states[state].next.entries()) {
      queue.push({ state: nxt, path: path + ch });
    }
  }
  return '';
}
