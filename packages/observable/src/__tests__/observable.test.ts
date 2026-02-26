// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import {
  Observable, of, from, range, EMPTY, NEVER, throwError,
  merge, concat, combineLatest, zip, defer,
} from '../observable';
import { Subject, BehaviorSubject, ReplaySubject, AsyncSubject } from '../subject';
import {
  map, filter, take, skip, takeWhile, skipWhile, distinct, distinctUntilChanged,
  scan, reduce, toArray, tap, catchError, startWith, endWith, pairwise, first, last,
} from '../operators';

// Helper: collect sync values from an observable
function collect<T>(obs: Observable<T>): { values: T[]; completed: boolean; error: unknown } {
  const values: T[] = [];
  let completed = false;
  let error: unknown = undefined;
  obs.subscribe({ next: v => values.push(v), error: e => { error = e; }, complete: () => { completed = true; } });
  return { values, completed, error };
}

// ── of() — 100 tests ─────────────────────────────────────────────────────────
describe('of() — single value', () => {
  for (let i = 0; i < 100; i++) {
    it(`of(${i}) emits exactly [${i}]`, () => {
      const { values, completed } = collect(of(i));
      expect(values).toEqual([i]);
      expect(completed).toBe(true);
    });
  }
});

// ── of() — multiple values — 50 tests ───────────────────────────────────────
describe('of() — multiple values', () => {
  for (let n = 1; n <= 50; n++) {
    it(`of(1..${n}) emits ${n} values`, () => {
      const args = Array.from({ length: n }, (_, i) => i + 1);
      const { values } = collect(of(...args));
      expect(values).toHaveLength(n);
      expect(values).toEqual(args);
    });
  }
});

// ── from() — 100 tests ───────────────────────────────────────────────────────
describe('from() — arrays', () => {
  for (let n = 0; n < 100; n++) {
    it(`from(array of ${n}) emits ${n} values`, () => {
      const arr = Array.from({ length: n }, (_, i) => i * 3);
      const { values, completed } = collect(from(arr));
      expect(values).toEqual(arr);
      expect(completed).toBe(true);
    });
  }
});

// ── range() — 100 tests ──────────────────────────────────────────────────────
describe('range() — count', () => {
  for (let count = 1; count <= 100; count++) {
    it(`range(0, ${count}) emits ${count} values`, () => {
      const { values } = collect(range(0, count));
      expect(values).toHaveLength(count);
      expect(values[0]).toBe(0);
      expect(values[count - 1]).toBe(count - 1);
    });
  }
});

// ── range() — start offset — 50 tests ───────────────────────────────────────
describe('range() — start offset', () => {
  for (let start = 0; start < 50; start++) {
    it(`range(${start}, 5) starts at ${start}`, () => {
      const { values } = collect(range(start, 5));
      expect(values[0]).toBe(start);
      expect(values).toHaveLength(5);
    });
  }
});

// ── EMPTY() — 50 tests ───────────────────────────────────────────────────────
describe('EMPTY() — completes immediately', () => {
  for (let i = 0; i < 50; i++) {
    it(`EMPTY() #${i} emits no values and completes`, () => {
      const { values, completed } = collect(EMPTY());
      expect(values).toHaveLength(0);
      expect(completed).toBe(true);
    });
  }
});

// ── map() — 100 tests ────────────────────────────────────────────────────────
describe('map() — multiply by factor', () => {
  for (let factor = 1; factor <= 100; factor++) {
    it(`map(x => x * ${factor})`, () => {
      const { values } = collect(range(1, 5).pipe(map((x: number) => x * factor)));
      expect(values).toEqual([factor, factor * 2, factor * 3, factor * 4, factor * 5]);
    });
  }
});

// ── filter() — 100 tests ─────────────────────────────────────────────────────
describe('filter() — even numbers', () => {
  for (let n = 2; n <= 101; n++) {
    it(`filter even from range(0, ${n})`, () => {
      const { values } = collect(range(0, n).pipe(filter((x: number) => x % 2 === 0)));
      expect(values.every((v: number) => v % 2 === 0)).toBe(true);
    });
  }
});

// ── take() — 100 tests ───────────────────────────────────────────────────────
describe('take() — first N items', () => {
  for (let n = 1; n <= 100; n++) {
    it(`take(${n}) from large range`, () => {
      const { values } = collect(range(0, 200).pipe(take(n)));
      expect(values).toHaveLength(n);
      expect(values[0]).toBe(0);
    });
  }
});

// ── skip() — 50 tests ────────────────────────────────────────────────────────
describe('skip() — skip N items', () => {
  for (let n = 0; n < 50; n++) {
    it(`skip(${n}) from range(0, 100)`, () => {
      const { values } = collect(range(0, 100).pipe(skip(n)));
      expect(values).toHaveLength(100 - n);
      if (n < 100) expect(values[0]).toBe(n);
    });
  }
});

// ── scan() — 50 tests ────────────────────────────────────────────────────────
describe('scan() — running sum', () => {
  for (let n = 1; n <= 50; n++) {
    it(`scan running sum from range(1, ${n})`, () => {
      const { values } = collect(range(1, n).pipe(scan((acc: number, v: number) => acc + v, 0)));
      expect(values).toHaveLength(n);
      const last = values[values.length - 1];
      expect(last).toBe(n * (n + 1) / 2);
    });
  }
});

// ── startWith() — 50 tests ───────────────────────────────────────────────────
describe('startWith() — prepend value', () => {
  for (let i = 0; i < 50; i++) {
    it(`startWith(${i}) prepends ${i}`, () => {
      const { values } = collect(range(10, 3).pipe(startWith(i)));
      expect(values[0]).toBe(i);
      expect(values).toHaveLength(4);
    });
  }
});

// ── endWith() — 50 tests ─────────────────────────────────────────────────────
describe('endWith() — append value', () => {
  for (let i = 0; i < 50; i++) {
    it(`endWith(${i}) appends ${i}`, () => {
      const { values } = collect(range(10, 3).pipe(endWith(i)));
      expect(values[values.length - 1]).toBe(i);
      expect(values).toHaveLength(4);
    });
  }
});

// ── Subject — 50 tests ───────────────────────────────────────────────────────
describe('Subject — emit and receive', () => {
  for (let n = 1; n <= 50; n++) {
    it(`Subject receives ${n} values`, () => {
      const subj = new Subject<number>();
      const received: number[] = [];
      subj.subscribe({ next: v => received.push(v) });
      for (let i = 0; i < n; i++) subj.next(i);
      expect(received).toHaveLength(n);
      expect(received[0]).toBe(0);
    });
  }
});

// ── BehaviorSubject — 50 tests ───────────────────────────────────────────────
describe('BehaviorSubject — initial value', () => {
  for (let init = 0; init < 50; init++) {
    it(`BehaviorSubject initial value ${init}`, () => {
      const subj = new BehaviorSubject<number>(init);
      const received: number[] = [];
      subj.subscribe({ next: v => received.push(v) });
      expect(received[0]).toBe(init);
      expect(subj.getValue()).toBe(init);
    });
  }
});

// ── distinct() — 50 tests ────────────────────────────────────────────────────
describe('distinct() — removes duplicates', () => {
  for (let n = 1; n <= 50; n++) {
    it(`distinct from ${n} unique then repeated`, () => {
      // Create [0,1,...,n-1,0,1,...,n-1] and distinct should give [0..n-1]
      const doubled = [...Array.from({ length: n }, (_, i) => i), ...Array.from({ length: n }, (_, i) => i)];
      const { values } = collect(from(doubled).pipe(distinct()));
      expect(values).toHaveLength(n);
    });
  }
});

// ── concat() — 50 tests ──────────────────────────────────────────────────────
describe('concat() — sequences sources', () => {
  for (let n = 1; n <= 50; n++) {
    it(`concat of ${n} and ${n+1} elements`, () => {
      const a = range(0, n);
      const b = range(n, n + 1);
      const { values } = collect(concat(a, b));
      expect(values).toHaveLength(2 * n + 1);
    });
  }
});

// ── pairwise() — 50 tests ────────────────────────────────────────────────────
describe('pairwise() — consecutive pairs', () => {
  for (let n = 2; n <= 51; n++) {
    it(`pairwise of ${n} elements gives ${n - 1} pairs`, () => {
      const { values } = collect(range(0, n).pipe(pairwise<number>()));
      expect(values).toHaveLength(n - 1);
      if (n >= 2) {
        const [a, b] = values[0] as [number, number];
        expect(a).toBe(0);
        expect(b).toBe(1);
      }
    });
  }
});

// ── toArray() — 50 tests ─────────────────────────────────────────────────────
describe('toArray() — collects all values', () => {
  for (let n = 0; n < 50; n++) {
    it(`toArray of range(0, ${n})`, () => {
      const { values } = collect(range(0, n).pipe(toArray()));
      expect(values).toHaveLength(1);
      expect((values[0] as number[]).length).toBe(n);
    });
  }
});

// ── first() — 50 tests ───────────────────────────────────────────────────────
describe('first() — emits first value', () => {
  for (let start = 0; start < 50; start++) {
    it(`first() from range(${start}, 10)`, () => {
      const { values } = collect(range(start, 10).pipe(first()));
      expect(values).toHaveLength(1);
      expect(values[0]).toBe(start);
    });
  }
});

// ── last() — 50 tests ────────────────────────────────────────────────────────
describe('last() — emits last value', () => {
  for (let n = 1; n <= 50; n++) {
    it(`last() from range(0, ${n})`, () => {
      const { values } = collect(range(0, n).pipe(last()));
      expect(values).toHaveLength(1);
      expect(values[0]).toBe(n - 1);
    });
  }
});

// ── throwError() — 30 tests ──────────────────────────────────────────────────
describe('throwError() — delivers error', () => {
  for (let i = 0; i < 30; i++) {
    it(`throwError delivers error #${i}`, () => {
      const err = new Error(`error-${i}`);
      const { error } = collect(throwError(err));
      expect(error).toBe(err);
    });
  }
});

// ── catchError() — 30 tests ──────────────────────────────────────────────────
describe('catchError() — recovers from error', () => {
  for (let i = 0; i < 30; i++) {
    it(`catchError recovery #${i}`, () => {
      const obs = throwError(new Error('boom')).pipe(
        catchError<never>(() => of(i as never))
      );
      const { values } = collect(obs);
      expect(values).toEqual([i]);
    });
  }
});

// ── reduce() — 30 tests ──────────────────────────────────────────────────────
describe('reduce() — accumulates to single value', () => {
  for (let n = 1; n <= 30; n++) {
    it(`reduce sum of range(1, ${n})`, () => {
      const { values } = collect(range(1, n).pipe(reduce((acc: number, v: number) => acc + v, 0)));
      expect(values).toHaveLength(1);
      expect(values[0]).toBe(n * (n + 1) / 2);
    });
  }
});

// ── tap() — 30 tests ────────────────────────────────────────────────────────
describe('tap() — side effect without modifying stream', () => {
  for (let n = 1; n <= 30; n++) {
    it(`tap collects ${n} values`, () => {
      const tapped: number[] = [];
      const { values } = collect(range(0, n).pipe(tap(v => tapped.push(v))));
      expect(tapped).toHaveLength(n);
      expect(values).toHaveLength(n);
      expect(tapped).toEqual(values);
    });
  }
});

// ── distinctUntilChanged() — 30 tests ───────────────────────────────────────
describe('distinctUntilChanged() — consecutive dedup', () => {
  for (let n = 1; n <= 30; n++) {
    it(`distinctUntilChanged from ${n} repeated values`, () => {
      const data = Array(n).fill(42);
      const { values } = collect(from(data).pipe(distinctUntilChanged()));
      expect(values).toHaveLength(1);
      expect(values[0]).toBe(42);
    });
  }
});

// ── ReplaySubject — 30 tests ─────────────────────────────────────────────────
describe('ReplaySubject — replays buffered values', () => {
  for (let buf = 1; buf <= 30; buf++) {
    it(`ReplaySubject bufferSize=${buf}`, () => {
      const subj = new ReplaySubject<number>(buf);
      for (let i = 0; i < buf; i++) subj.next(i);
      const received: number[] = [];
      subj.subscribe({ next: v => received.push(v) });
      expect(received).toHaveLength(buf);
    });
  }
});
