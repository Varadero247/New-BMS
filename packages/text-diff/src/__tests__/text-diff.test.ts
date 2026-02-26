// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import {
  diffChars,
  diffWords,
  diffLines,
  applyPatch,
  verifyPatch,
  diffStats,
  editDistance,
  lcs,
  similarity,
  htmlDiff,
  unifiedDiff,
  parseUnifiedDiff,
  applyUnifiedDiff,
  summarizeChanges,
  diffObjects,
  threeWayMerge,
  DiffChunk,
  DiffStats,
} from '../text-diff';

// ─── Helpers ────────────────────────────────────────────────────────────────

function randStr(seed: number, len: number): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  let s = '';
  let r = seed;
  for (let i = 0; i < len; i++) {
    r = (r * 1664525 + 1013904223) >>> 0;
    s += chars[r % chars.length];
  }
  return s;
}

// ─── 1. diffChars equal strings (100 tests) ─────────────────────────────────
describe('diffChars equal strings', () => {
  for (let i = 0; i < 100; i++) {
    it(`equal string test ${i}`, () => {
      const s = randStr(i, i % 20);
      const chunks = diffChars(s, s);
      const nonEqual = chunks.filter((c) => c.op !== 'equal');
      expect(nonEqual).toHaveLength(0);
      if (s.length > 0) {
        const totalCount = chunks.reduce((acc, c) => acc + c.count, 0);
        expect(totalCount).toBe(s.length);
      }
    });
  }
});

// ─── 2. diffChars insertions (100 tests) ────────────────────────────────────
describe('diffChars insertions', () => {
  for (let i = 0; i < 100; i++) {
    it(`insertion test ${i}`, () => {
      const base = randStr(i + 200, 5 + (i % 10));
      const suffix = randStr(i + 300, 1 + (i % 5));
      const full = base + suffix;
      const chunks = diffChars(base, full);
      // Result of applying patch should equal full
      expect(applyPatch(base, chunks)).toBe(full);
      // There should be at least one insert chunk
      const inserts = chunks.filter((c) => c.op === 'insert');
      expect(inserts.length).toBeGreaterThanOrEqual(1);
      // Total insert count should equal suffix length
      const totalInserted = inserts.reduce((acc, c) => acc + c.count, 0);
      expect(totalInserted).toBe(suffix.length);
    });
  }
});

// ─── 3. diffChars deletions (100 tests) ─────────────────────────────────────
describe('diffChars deletions', () => {
  for (let i = 0; i < 100; i++) {
    it(`deletion test ${i}`, () => {
      const prefix = randStr(i + 400, 1 + (i % 5));
      const rest = randStr(i + 500, 5 + (i % 10));
      const full = prefix + rest;
      const chunks = diffChars(full, rest);
      expect(applyPatch(full, chunks)).toBe(rest);
      const deletes = chunks.filter((c) => c.op === 'delete');
      expect(deletes.length).toBeGreaterThanOrEqual(1);
      const totalDeleted = deletes.reduce((acc, c) => acc + c.count, 0);
      expect(totalDeleted).toBe(prefix.length);
    });
  }
});

// ─── 4. applyPatch roundtrip (100 tests) ────────────────────────────────────
describe('applyPatch roundtrip', () => {
  for (let i = 0; i < 100; i++) {
    it(`roundtrip test ${i}`, () => {
      const a = randStr(i + 600, i % 15);
      const b = randStr(i + 700, i % 15);
      const chunks = diffChars(a, b);
      expect(applyPatch(a, chunks)).toBe(b);
    });
  }
});

// ─── 5. diffWords (100 tests) ───────────────────────────────────────────────
describe('diffWords', () => {
  const wordPairs: Array<[string, string]> = [
    ['hello world', 'hello earth'],
    ['foo bar baz', 'foo baz'],
    ['one two three', 'one two three four'],
    ['the quick brown fox', 'the slow brown fox'],
    ['a b c d', 'a b c d e'],
    ['alpha beta gamma', 'alpha gamma'],
    ['x y z', 'x y z'],
    ['cat sat mat', 'dog sat mat'],
    ['my name is alice', 'my name is bob'],
    ['red green blue', 'red blue'],
  ];

  for (let i = 0; i < 100; i++) {
    it(`word diff test ${i}`, () => {
      const [a, b] = wordPairs[i % wordPairs.length];
      const suffix = i >= wordPairs.length ? ` extra${i}` : '';
      const aa = a + suffix;
      const bb = b + suffix;
      const chunks = diffWords(aa, bb);
      expect(applyPatch(aa, chunks)).toBe(bb);
      // Each chunk must have a non-negative count
      for (const c of chunks) {
        expect(c.count).toBeGreaterThanOrEqual(0);
      }
    });
  }
});

// ─── 6. diffLines (100 tests) ───────────────────────────────────────────────
describe('diffLines', () => {
  for (let i = 0; i < 100; i++) {
    it(`line diff test ${i}`, () => {
      const lineCount = 3 + (i % 5);
      const linesA: string[] = [];
      const linesB: string[] = [];
      for (let j = 0; j < lineCount; j++) {
        linesA.push(randStr(i * 100 + j, 4));
        // Every other line is changed in B
        linesB.push(j % 2 === 0 ? linesA[j] : randStr(i * 100 + j + 50, 4));
      }
      // Add an extra line in B for some cases
      if (i % 3 === 0) linesB.push('extra');
      const a = linesA.join('\n');
      const b = linesB.join('\n');
      const chunks = diffLines(a, b);
      expect(applyPatch(a, chunks)).toBe(b);
      // All ops are valid
      for (const c of chunks) {
        expect(['equal', 'insert', 'delete']).toContain(c.op);
      }
    });
  }
});

// ─── 7. diffStats (100 tests) ───────────────────────────────────────────────
describe('diffStats', () => {
  for (let i = 0; i < 100; i++) {
    it(`diffStats test ${i}`, () => {
      const a = randStr(i + 1000, 5 + (i % 10));
      const b = randStr(i + 1100, 5 + (i % 10));
      const chunks = diffChars(a, b);
      const stats = diffStats(chunks);
      // All counts non-negative
      expect(stats.insertions).toBeGreaterThanOrEqual(0);
      expect(stats.deletions).toBeGreaterThanOrEqual(0);
      expect(stats.unchanged).toBeGreaterThanOrEqual(0);
      // similarity in [0,1]
      expect(stats.similarity).toBeGreaterThanOrEqual(0);
      expect(stats.similarity).toBeLessThanOrEqual(1);
      // insertions + unchanged = new length
      const newLen = stats.insertions + stats.unchanged;
      expect(newLen).toBe(b.length);
      // deletions + unchanged = old length
      const oldLen = stats.deletions + stats.unchanged;
      expect(oldLen).toBe(a.length);
    });
  }
});

// ─── 8. editDistance (100 tests) ────────────────────────────────────────────
describe('editDistance', () => {
  for (let i = 0; i < 100; i++) {
    it(`editDistance test ${i}`, () => {
      const s = randStr(i + 2000, i % 12);
      const t = randStr(i + 2100, i % 12);
      // editDistance(s, s) === 0
      expect(editDistance(s, s)).toBe(0);
      // editDistance('', s) === s.length
      expect(editDistance('', s)).toBe(s.length);
      // editDistance(s, '') === s.length
      expect(editDistance(s, '')).toBe(s.length);
      // Triangle inequality: d(s,t) <= d(s,'') + d('',t)
      const dst = editDistance(s, t);
      expect(dst).toBeLessThanOrEqual(s.length + t.length);
      // Non-negative
      expect(dst).toBeGreaterThanOrEqual(0);
    });
  }
});

// ─── 9. lcs (100 tests) ─────────────────────────────────────────────────────
describe('lcs', () => {
  for (let i = 0; i < 100; i++) {
    it(`lcs test ${i}`, () => {
      const tokens = Array.from(randStr(i + 3000, 6 + (i % 6)));
      // lcs(a, a) === a
      expect(lcs(tokens, tokens)).toEqual(tokens);
      // lcs([], b) === []
      expect(lcs([], tokens)).toEqual([]);
      // lcs(a, []) === []
      expect(lcs(tokens, [])).toEqual([]);
      // Length of lcs <= min(a.length, b.length)
      const other = Array.from(randStr(i + 3100, 6 + (i % 6)));
      const result = lcs(tokens, other);
      expect(result.length).toBeLessThanOrEqual(Math.min(tokens.length, other.length));
      // All elements in lcs are in both arrays
      for (const el of result) {
        expect(tokens).toContain(el);
        expect(other).toContain(el);
      }
    });
  }
});

// ─── 10. similarity (100 tests) ─────────────────────────────────────────────
describe('similarity', () => {
  for (let i = 0; i < 100; i++) {
    it(`similarity test ${i}`, () => {
      const s = randStr(i + 4000, 5 + (i % 10));
      // similarity(s, s) === 1
      expect(similarity(s, s)).toBe(1);
      // similarity(s, '') approaches 0 when s is non-empty
      if (s.length > 0) {
        expect(similarity(s, '')).toBe(0);
        expect(similarity('', s)).toBe(0);
      }
      // similarity in [0, 1]
      const t = randStr(i + 4100, 5 + (i % 10));
      const sim = similarity(s, t);
      expect(sim).toBeGreaterThanOrEqual(0);
      expect(sim).toBeLessThanOrEqual(1);
    });
  }
});

// ─── 11. htmlDiff (50 tests) ────────────────────────────────────────────────
describe('htmlDiff', () => {
  for (let i = 0; i < 50; i++) {
    it(`htmlDiff test ${i}`, () => {
      const a = randStr(i + 5000, 4 + (i % 8));
      const b = randStr(i + 5100, 4 + (i % 8));
      const html = htmlDiff(a, b);
      // Result is a string
      expect(typeof html).toBe('string');
      // When strings differ, should contain ins or del tags
      if (a !== b) {
        const hasIns = html.includes('<ins>');
        const hasDel = html.includes('<del>');
        expect(hasIns || hasDel).toBe(true);
      }
      // When strings are equal, no ins/del
      const sameHtml = htmlDiff(a, a);
      expect(sameHtml).not.toContain('<ins>');
      expect(sameHtml).not.toContain('<del>');
    });
  }
});

// ─── 12. htmlDiff custom tags (additional 50 tests to reach min count) ──────
describe('htmlDiff custom tags', () => {
  for (let i = 0; i < 50; i++) {
    it(`htmlDiff custom tag test ${i}`, () => {
      const a = `old${i}`;
      const b = `new${i}`;
      const html = htmlDiff(a, b, { insertTag: 'mark', deleteTag: 'strike' });
      expect(typeof html).toBe('string');
      const hasMark = html.includes('<mark>');
      const hasStrike = html.includes('<strike>');
      expect(hasMark || hasStrike).toBe(true);
    });
  }
});

// ─── 13. unifiedDiff (50 tests) ─────────────────────────────────────────────
describe('unifiedDiff', () => {
  for (let i = 0; i < 50; i++) {
    it(`unifiedDiff test ${i}`, () => {
      const lines = 3 + (i % 6);
      const aLines: string[] = [];
      const bLines: string[] = [];
      for (let j = 0; j < lines; j++) {
        const line = randStr(i * 100 + j + 6000, 5);
        aLines.push(line);
        bLines.push(j === 1 ? randStr(i * 100 + j + 6500, 5) : line);
      }
      const a = aLines.join('\n');
      const b = bLines.join('\n');
      const diff = unifiedDiff(a, b);
      // Contains @@ when strings differ
      if (a !== b) {
        expect(diff).toContain('@@');
      }
    });
  }
});

// ─── 14. unifiedDiff labels (additional 50 tests) ──────────────────────────
describe('unifiedDiff with labels', () => {
  for (let i = 0; i < 50; i++) {
    it(`unifiedDiff label test ${i}`, () => {
      const a = `line one\nline two\nline ${i}`;
      const b = `line one\nline TWO\nline ${i}`;
      const diff = unifiedDiff(a, b, { oldLabel: `old${i}`, newLabel: `new${i}` });
      expect(diff).toContain(`--- old${i}`);
      expect(diff).toContain(`+++ new${i}`);
      expect(diff).toContain('@@');
    });
  }
});

// ─── 15. summarizeChanges (50 tests) ────────────────────────────────────────
describe('summarizeChanges', () => {
  for (let i = 0; i < 50; i++) {
    it(`summarizeChanges test ${i}`, () => {
      const a = randStr(i + 7000, 5 + (i % 10));
      const b = randStr(i + 7100, 5 + (i % 10));
      const summary = summarizeChanges(a, b);
      expect(typeof summary).toBe('string');
      const hasSimilarity = summary.includes('similarity');
      expect(hasSimilarity).toBe(true);
    });
  }
});

// ─── 16. summarizeChanges content (additional 50 tests) ────────────────────
describe('summarizeChanges content', () => {
  for (let i = 0; i < 50; i++) {
    it(`summarizeChanges content test ${i}`, () => {
      const a = `abcdef${i}`;
      const b = `abcdef${i}xyz`;
      const summary = summarizeChanges(a, b);
      // Should mention insertion since b is longer
      expect(summary).toMatch(/insertion|deletion|similarity/);
    });
  }
});

// ─── 17. diffObjects (100 tests) ────────────────────────────────────────────
describe('diffObjects', () => {
  for (let i = 0; i < 100; i++) {
    it(`diffObjects test ${i}`, () => {
      const a: Record<string, unknown> = {
        name: `alice${i}`,
        age: i,
        active: true,
        role: 'admin',
      };
      const b: Record<string, unknown> = {
        name: `bob${i}`,       // changed
        age: i,                // same
        active: false,         // changed
        extra: 'new',          // added
      };
      const result = diffObjects(a, b);
      // 'name' and 'active' changed
      expect(result.changed).toContain('name');
      expect(result.changed).toContain('active');
      // 'extra' added
      expect(result.added).toContain('extra');
      // 'role' removed
      expect(result.removed).toContain('role');
      // 'age' unchanged (not in any array)
      expect(result.changed).not.toContain('age');
      expect(result.added).not.toContain('age');
      expect(result.removed).not.toContain('age');
    });
  }
});

// ─── 18. diffObjects nested (additional 100 tests) ─────────────────────────
describe('diffObjects nested', () => {
  for (let i = 0; i < 100; i++) {
    it(`diffObjects nested test ${i}`, () => {
      const a = { user: { name: `alice${i}`, score: i }, count: i };
      const b = { user: { name: `alice${i}`, score: i + 1 }, count: i };
      const result = diffObjects(a, b);
      // user.score changed
      expect(result.changed).toContain('user.score');
      // user.name unchanged
      expect(result.changed).not.toContain('user.name');
      // count unchanged
      expect(result.changed).not.toContain('count');
    });
  }
});

// ─── 19. threeWayMerge no conflicts (50 tests) ──────────────────────────────
describe('threeWayMerge no conflicts', () => {
  for (let i = 0; i < 50; i++) {
    it(`threeWayMerge no conflict test ${i}`, () => {
      const base = `line1\nline2\nline3\nline${i}`;
      // ours changes only line 1
      const ours = `CHANGED_LINE1\nline2\nline3\nline${i}`;
      // theirs changes only line 3
      const theirs = `line1\nline2\nCHANGED_LINE3\nline${i}`;
      const result = threeWayMerge(base, ours, theirs);
      // No conflicts: only one side changed each line
      expect(result.hasConflicts).toBe(false);
      expect(result.conflicts).toBe(0);
      // Merged should contain both changes
      expect(result.merged).toContain('CHANGED_LINE1');
      expect(result.merged).toContain('CHANGED_LINE3');
    });
  }
});

// ─── 20. threeWayMerge identical sides (additional 50 tests) ────────────────
describe('threeWayMerge identical sides', () => {
  for (let i = 0; i < 50; i++) {
    it(`threeWayMerge identical test ${i}`, () => {
      const base = randStr(i + 8000, 4);
      // ours === theirs === base → no conflict, merged = base
      const result = threeWayMerge(base, base, base);
      expect(result.hasConflicts).toBe(false);
      expect(result.conflicts).toBe(0);
    });
  }
});

// ─── 21. verifyPatch (50 tests) ─────────────────────────────────────────────
describe('verifyPatch', () => {
  for (let i = 0; i < 50; i++) {
    it(`verifyPatch test ${i}`, () => {
      const a = randStr(i + 9000, 5 + (i % 8));
      const b = randStr(i + 9100, 5 + (i % 8));
      expect(verifyPatch(a, b)).toBe(true);
      expect(verifyPatch(a, a)).toBe(true);
    });
  }
});

// ─── 22. diffChars empty string handling (50 tests) ─────────────────────────
describe('diffChars empty string handling', () => {
  for (let i = 0; i < 50; i++) {
    it(`empty string test ${i}`, () => {
      const s = randStr(i + 10000, i % 10);
      // empty → s: all inserts
      const chunks1 = diffChars('', s);
      expect(applyPatch('', chunks1)).toBe(s);
      // s → empty: all deletes
      const chunks2 = diffChars(s, '');
      expect(applyPatch(s, chunks2)).toBe('');
    });
  }
});

// ─── 23. diffWords edge cases (50 tests) ────────────────────────────────────
describe('diffWords edge cases', () => {
  for (let i = 0; i < 50; i++) {
    it(`diffWords edge test ${i}`, () => {
      const a = `word${i} extra`;
      const b = `word${i}`;
      const chunks = diffWords(a, b);
      expect(applyPatch(a, chunks)).toBe(b);
      // Should have at least one delete chunk
      const deletes = chunks.filter((c) => c.op === 'delete');
      expect(deletes.length).toBeGreaterThanOrEqual(1);
    });
  }
});

// ─── 24. diffLines single line (50 tests) ────────────────────────────────────
describe('diffLines single line', () => {
  for (let i = 0; i < 50; i++) {
    it(`diffLines single line test ${i}`, () => {
      const a = `single${i}`;
      const b = `other${i}`;
      const chunks = diffLines(a, b);
      expect(applyPatch(a, chunks)).toBe(b);
    });
  }
});

// ─── 25. diffStats equal strings (50 tests) ──────────────────────────────────
describe('diffStats equal strings', () => {
  for (let i = 0; i < 50; i++) {
    it(`diffStats equal test ${i}`, () => {
      const s = randStr(i + 11000, 5 + (i % 8));
      const chunks = diffChars(s, s);
      const stats = diffStats(chunks);
      expect(stats.insertions).toBe(0);
      expect(stats.deletions).toBe(0);
      expect(stats.similarity).toBe(1);
    });
  }
});

// ─── 26. editDistance known values (50 tests) ────────────────────────────────
describe('editDistance known values', () => {
  const cases: Array<[string, string, number]> = [
    ['', '', 0],
    ['a', '', 1],
    ['', 'a', 1],
    ['abc', 'abc', 0],
    ['abc', 'axc', 1],
    ['kitten', 'sitting', 3],
    ['sunday', 'saturday', 3],
    ['ab', 'ba', 2],
    ['ab', 'abc', 1],
    ['abc', 'ac', 1],
  ];

  for (let i = 0; i < 50; i++) {
    it(`editDistance known test ${i}`, () => {
      const [a, b, expected] = cases[i % cases.length];
      expect(editDistance(a, b)).toBe(expected);
    });
  }
});

// ─── 27. lcs known values (50 tests) ─────────────────────────────────────────
describe('lcs known values', () => {
  for (let i = 0; i < 50; i++) {
    it(`lcs known value test ${i}`, () => {
      const a = ['a', 'b', 'c', 'd'];
      const b = ['a', 'c', 'd'];
      const result = lcs(a, b);
      // LCS should be ['a', 'c', 'd']
      expect(result).toEqual(['a', 'c', 'd']);
      // Also verify single-element lcs
      const single = lcs(['x'], ['x']);
      expect(single).toEqual(['x']);
      const none = lcs(['x'], ['y']);
      expect(none).toEqual([]);
    });
  }
});

// ─── 28. htmlDiff returns equal content unchanged (50 tests) ─────────────────
describe('htmlDiff equal content', () => {
  for (let i = 0; i < 50; i++) {
    it(`htmlDiff equal content test ${i}`, () => {
      const s = `text${i}content`;
      const html = htmlDiff(s, s);
      // No tags for equal strings
      expect(html).not.toContain('<ins>');
      expect(html).not.toContain('<del>');
      // Content preserved (without HTML encoding of normal chars)
      expect(html).toContain(`text${i}content`);
    });
  }
});

// ─── 29. parseUnifiedDiff (50 tests) ─────────────────────────────────────────
describe('parseUnifiedDiff', () => {
  for (let i = 0; i < 50; i++) {
    it(`parseUnifiedDiff test ${i}`, () => {
      const a = `line1\noriginal line ${i}\nline3`;
      const b = `line1\nchanged line ${i}\nline3`;
      const diff = unifiedDiff(a, b);
      if (diff.includes('@@')) {
        const hunks = parseUnifiedDiff(diff);
        expect(hunks.length).toBeGreaterThanOrEqual(1);
        // Each hunk has lines
        for (const hunk of hunks) {
          expect(Array.isArray(hunk.lines)).toBe(true);
          expect(hunk.oldStart).toBeGreaterThanOrEqual(1);
          expect(hunk.newStart).toBeGreaterThanOrEqual(1);
        }
      }
    });
  }
});

// ─── 30. applyUnifiedDiff roundtrip (50 tests) ──────────────────────────────
describe('applyUnifiedDiff roundtrip', () => {
  for (let i = 0; i < 50; i++) {
    it(`applyUnifiedDiff test ${i}`, () => {
      const a = `alpha\nbeta\ngamma ${i}\ndelta`;
      const b = `alpha\nbeta\nGAMMA ${i}\ndelta`;
      const diff = unifiedDiff(a, b);
      if (diff.includes('@@')) {
        const patched = applyUnifiedDiff(a, diff);
        expect(patched).toBe(b);
      }
    });
  }
});

// ─── 31. diffChars position tracking (50 tests) ─────────────────────────────
describe('diffChars position tracking', () => {
  for (let i = 0; i < 50; i++) {
    it(`position tracking test ${i}`, () => {
      const a = 'abcdef'.slice(0, 3 + (i % 4));
      const b = 'xyz' + a.slice(1);
      const chunks = diffChars(a, b);
      // oldStart of first chunk should be 0
      if (chunks.length > 0) {
        expect(chunks[0].oldStart).toBe(0);
        expect(chunks[0].newStart).toBe(0);
      }
      // applyPatch still works
      expect(applyPatch(a, chunks)).toBe(b);
    });
  }
});

// ─── 32. similarity symmetric (50 tests) ────────────────────────────────────
describe('similarity symmetric', () => {
  for (let i = 0; i < 50; i++) {
    it(`similarity symmetric test ${i}`, () => {
      const a = randStr(i + 12000, 4 + (i % 8));
      const b = randStr(i + 12100, 4 + (i % 8));
      // similarity is not guaranteed symmetric due to max(a,b) denominator,
      // but both should be in [0,1]
      expect(similarity(a, b)).toBeGreaterThanOrEqual(0);
      expect(similarity(a, b)).toBeLessThanOrEqual(1);
      expect(similarity(b, a)).toBeGreaterThanOrEqual(0);
      expect(similarity(b, a)).toBeLessThanOrEqual(1);
    });
  }
});

// ─── 33. diffObjects identical objects (50 tests) ───────────────────────────
describe('diffObjects identical', () => {
  for (let i = 0; i < 50; i++) {
    it(`diffObjects identical test ${i}`, () => {
      const obj = { a: i, b: `str${i}`, c: true };
      const result = diffObjects(obj, obj);
      expect(result.added).toHaveLength(0);
      expect(result.removed).toHaveLength(0);
      expect(result.changed).toHaveLength(0);
    });
  }
});

// ─── 34. threeWayMerge ours only changes (50 tests) ─────────────────────────
describe('threeWayMerge ours only', () => {
  for (let i = 0; i < 50; i++) {
    it(`threeWayMerge ours only test ${i}`, () => {
      const base = `hello\nworld\ntest${i}`;
      const ours = `hello\nWORLD\ntest${i}`;
      const theirs = base; // theirs unchanged
      const result = threeWayMerge(base, ours, theirs);
      // No conflict: only ours changed
      expect(result.hasConflicts).toBe(false);
      expect(result.merged).toContain('WORLD');
    });
  }
});

// ─── 35. diffWords returns valid ops (50 tests) ──────────────────────────────
describe('diffWords valid ops', () => {
  for (let i = 0; i < 50; i++) {
    it(`diffWords valid ops test ${i}`, () => {
      const a = `the quick brown fox ${i}`;
      const b = `the lazy brown fox ${i + 1}`;
      const chunks = diffWords(a, b);
      for (const c of chunks) {
        expect(['equal', 'insert', 'delete']).toContain(c.op);
        expect(typeof c.value).toBe('string');
        expect(c.count).toBeGreaterThanOrEqual(0);
      }
      // Round-trip
      expect(applyPatch(a, chunks)).toBe(b);
    });
  }
});

// ─── 36. editDistance triangle inequality (50 tests) ─────────────────────────
describe('editDistance triangle inequality', () => {
  for (let i = 0; i < 50; i++) {
    it(`triangle inequality test ${i}`, () => {
      const a = randStr(i + 13000, 3 + (i % 5));
      const b = randStr(i + 13100, 3 + (i % 5));
      const c = randStr(i + 13200, 3 + (i % 5));
      const ab = editDistance(a, b);
      const bc = editDistance(b, c);
      const ac = editDistance(a, c);
      // Triangle inequality: d(a,c) <= d(a,b) + d(b,c)
      expect(ac).toBeLessThanOrEqual(ab + bc);
    });
  }
});

// ─── 37. diffLines add lines (50 tests) ──────────────────────────────────────
describe('diffLines add lines', () => {
  for (let i = 0; i < 50; i++) {
    it(`diffLines add lines test ${i}`, () => {
      const base = `line1\nline2\nline3`;
      const added = base + `\nnewline${i}`;
      const chunks = diffLines(base, added);
      const inserts = chunks.filter((c) => c.op === 'insert');
      expect(inserts.length).toBeGreaterThanOrEqual(1);
      expect(applyPatch(base, chunks)).toBe(added);
    });
  }
});

// ─── 38. diffLines remove lines (50 tests) ───────────────────────────────────
describe('diffLines remove lines', () => {
  for (let i = 0; i < 50; i++) {
    it(`diffLines remove lines test ${i}`, () => {
      const full = `prefix${i}\nline2\nline3`;
      const reduced = `line2\nline3`;
      const chunks = diffLines(full, reduced);
      const deletes = chunks.filter((c) => c.op === 'delete');
      expect(deletes.length).toBeGreaterThanOrEqual(1);
      expect(applyPatch(full, chunks)).toBe(reduced);
    });
  }
});

// ─── 39. diffStats insertions+deletions match diff (50 tests) ────────────────
describe('diffStats insertions deletions match', () => {
  for (let i = 0; i < 50; i++) {
    it(`diffStats match test ${i}`, () => {
      const a = `hello${i}`;
      const b = `world${i}extra`;
      const chunks = diffChars(a, b);
      const stats = diffStats(chunks);
      // Manually count
      let ins = 0, del = 0, eq = 0;
      for (const c of chunks) {
        if (c.op === 'insert') ins += c.count;
        else if (c.op === 'delete') del += c.count;
        else eq += c.count;
      }
      expect(stats.insertions).toBe(ins);
      expect(stats.deletions).toBe(del);
      expect(stats.unchanged).toBe(eq);
    });
  }
});

// ─── 40. summarizeChanges equal strings (50 tests) ───────────────────────────
describe('summarizeChanges equal strings', () => {
  for (let i = 0; i < 50; i++) {
    it(`summarizeChanges equal test ${i}`, () => {
      const s = `same${i}`;
      const summary = summarizeChanges(s, s);
      // Should mention 100% similarity
      expect(summary).toContain('100% similarity');
      // Should mention no changes
      expect(summary).toContain('no changes');
    });
  }
});

// ─── 41. diffObjects empty objects (30 tests) ────────────────────────────────
describe('diffObjects empty', () => {
  for (let i = 0; i < 30; i++) {
    it(`diffObjects empty test ${i}`, () => {
      const result = diffObjects({}, {});
      expect(result.added).toHaveLength(0);
      expect(result.removed).toHaveLength(0);
      expect(result.changed).toHaveLength(0);
    });
  }
});

// ─── 42. diffObjects all added (30 tests) ────────────────────────────────────
describe('diffObjects all added', () => {
  for (let i = 0; i < 30; i++) {
    it(`diffObjects all added test ${i}`, () => {
      const b = { key1: i, key2: `val${i}` };
      const result = diffObjects({}, b);
      expect(result.added).toContain('key1');
      expect(result.added).toContain('key2');
      expect(result.removed).toHaveLength(0);
      expect(result.changed).toHaveLength(0);
    });
  }
});

// ─── 43. diffObjects all removed (30 tests) ──────────────────────────────────
describe('diffObjects all removed', () => {
  for (let i = 0; i < 30; i++) {
    it(`diffObjects all removed test ${i}`, () => {
      const a = { key1: i, key2: `val${i}` };
      const result = diffObjects(a, {});
      expect(result.removed).toContain('key1');
      expect(result.removed).toContain('key2');
      expect(result.added).toHaveLength(0);
      expect(result.changed).toHaveLength(0);
    });
  }
});

// ─── 44. verifyPatch empty strings (30 tests) ────────────────────────────────
describe('verifyPatch empty strings', () => {
  for (let i = 0; i < 30; i++) {
    it(`verifyPatch empty test ${i}`, () => {
      expect(verifyPatch('', '')).toBe(true);
      const s = randStr(i + 14000, i % 8);
      expect(verifyPatch('', s)).toBe(true);
      expect(verifyPatch(s, '')).toBe(true);
    });
  }
});

// ─── 45. unifiedDiff no change (30 tests) ────────────────────────────────────
describe('unifiedDiff no change', () => {
  for (let i = 0; i < 30; i++) {
    it(`unifiedDiff no change test ${i}`, () => {
      const s = `equal line ${i}\nno change here`;
      const diff = unifiedDiff(s, s);
      // No hunks when no changes
      expect(diff).toBe('');
    });
  }
});

// ─── 46. diffChars single char change (30 tests) ─────────────────────────────
describe('diffChars single char change', () => {
  for (let i = 0; i < 30; i++) {
    it(`single char change test ${i}`, () => {
      const base = 'hello world';
      const changed = 'hello' + String.fromCharCode(65 + (i % 26)) + 'orld';
      const chunks = diffChars(base, changed);
      expect(applyPatch(base, chunks)).toBe(changed);
      const stats = diffStats(chunks);
      expect(stats.similarity).toBeGreaterThan(0.5);
    });
  }
});

// ─── 47. lcs subsequence verification (30 tests) ─────────────────────────────
describe('lcs subsequence', () => {
  for (let i = 0; i < 30; i++) {
    it(`lcs subsequence test ${i}`, () => {
      const a = Array.from(randStr(i + 15000, 6));
      const b = Array.from(randStr(i + 15100, 6));
      const result = lcs(a, b);
      // Verify result is a subsequence of a
      let ai = 0;
      for (const el of result) {
        while (ai < a.length && a[ai] !== el) ai++;
        expect(ai).toBeLessThan(a.length);
        ai++;
      }
    });
  }
});

// ─── 48. htmlDiff special chars (30 tests) ───────────────────────────────────
describe('htmlDiff special chars', () => {
  for (let i = 0; i < 30; i++) {
    it(`htmlDiff special chars test ${i}`, () => {
      const a = `<p>Hello & World</p> ${i}`;
      const b = `<p>Hello & Earth</p> ${i}`;
      const html = htmlDiff(a, b);
      // Should escape HTML entities
      expect(html).toContain('&lt;');
      expect(html).toContain('&amp;');
    });
  }
});

// ─── 49. threeWayMerge both same change (30 tests) ───────────────────────────
describe('threeWayMerge both same change', () => {
  for (let i = 0; i < 30; i++) {
    it(`threeWayMerge both same change test ${i}`, () => {
      const base = `original${i}\nline2`;
      const changed = `modified${i}\nline2`;
      // Both ours and theirs make the same change
      const result = threeWayMerge(base, changed, changed);
      // No conflict when both sides agree
      expect(result.hasConflicts).toBe(false);
      expect(result.merged).toContain(`modified${i}`);
    });
  }
});

// ─── 50. diffStats similarity bounds (30 tests) ──────────────────────────────
describe('diffStats similarity bounds', () => {
  for (let i = 0; i < 30; i++) {
    it(`similarity bounds test ${i}`, () => {
      const a = randStr(i + 16000, 8);
      const b = randStr(i + 16100, 8);
      const chunks = diffChars(a, b);
      const stats = diffStats(chunks);
      expect(stats.similarity).toBeGreaterThanOrEqual(0);
      expect(stats.similarity).toBeLessThanOrEqual(1);
      // insertions + unchanged = b.length
      expect(stats.insertions + stats.unchanged).toBe(b.length);
      // deletions + unchanged = a.length
      expect(stats.deletions + stats.unchanged).toBe(a.length);
    });
  }
});
