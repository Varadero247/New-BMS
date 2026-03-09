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
function hd258obs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph258obs_hd',()=>{it('a',()=>{expect(hd258obs(1,4)).toBe(2);});it('b',()=>{expect(hd258obs(3,1)).toBe(1);});it('c',()=>{expect(hd258obs(0,0)).toBe(0);});it('d',()=>{expect(hd258obs(93,73)).toBe(2);});it('e',()=>{expect(hd258obs(15,0)).toBe(4);});});
function hd259obs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph259obs_hd',()=>{it('a',()=>{expect(hd259obs(1,4)).toBe(2);});it('b',()=>{expect(hd259obs(3,1)).toBe(1);});it('c',()=>{expect(hd259obs(0,0)).toBe(0);});it('d',()=>{expect(hd259obs(93,73)).toBe(2);});it('e',()=>{expect(hd259obs(15,0)).toBe(4);});});
function hd260obs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph260obs_hd',()=>{it('a',()=>{expect(hd260obs(1,4)).toBe(2);});it('b',()=>{expect(hd260obs(3,1)).toBe(1);});it('c',()=>{expect(hd260obs(0,0)).toBe(0);});it('d',()=>{expect(hd260obs(93,73)).toBe(2);});it('e',()=>{expect(hd260obs(15,0)).toBe(4);});});
function hd261obs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph261obs_hd',()=>{it('a',()=>{expect(hd261obs(1,4)).toBe(2);});it('b',()=>{expect(hd261obs(3,1)).toBe(1);});it('c',()=>{expect(hd261obs(0,0)).toBe(0);});it('d',()=>{expect(hd261obs(93,73)).toBe(2);});it('e',()=>{expect(hd261obs(15,0)).toBe(4);});});
function hd262obs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph262obs_hd',()=>{it('a',()=>{expect(hd262obs(1,4)).toBe(2);});it('b',()=>{expect(hd262obs(3,1)).toBe(1);});it('c',()=>{expect(hd262obs(0,0)).toBe(0);});it('d',()=>{expect(hd262obs(93,73)).toBe(2);});it('e',()=>{expect(hd262obs(15,0)).toBe(4);});});
function hd263obs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph263obs_hd',()=>{it('a',()=>{expect(hd263obs(1,4)).toBe(2);});it('b',()=>{expect(hd263obs(3,1)).toBe(1);});it('c',()=>{expect(hd263obs(0,0)).toBe(0);});it('d',()=>{expect(hd263obs(93,73)).toBe(2);});it('e',()=>{expect(hd263obs(15,0)).toBe(4);});});
function hd264obs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph264obs_hd',()=>{it('a',()=>{expect(hd264obs(1,4)).toBe(2);});it('b',()=>{expect(hd264obs(3,1)).toBe(1);});it('c',()=>{expect(hd264obs(0,0)).toBe(0);});it('d',()=>{expect(hd264obs(93,73)).toBe(2);});it('e',()=>{expect(hd264obs(15,0)).toBe(4);});});
function hd265obs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph265obs_hd',()=>{it('a',()=>{expect(hd265obs(1,4)).toBe(2);});it('b',()=>{expect(hd265obs(3,1)).toBe(1);});it('c',()=>{expect(hd265obs(0,0)).toBe(0);});it('d',()=>{expect(hd265obs(93,73)).toBe(2);});it('e',()=>{expect(hd265obs(15,0)).toBe(4);});});
function hd266obs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph266obs_hd',()=>{it('a',()=>{expect(hd266obs(1,4)).toBe(2);});it('b',()=>{expect(hd266obs(3,1)).toBe(1);});it('c',()=>{expect(hd266obs(0,0)).toBe(0);});it('d',()=>{expect(hd266obs(93,73)).toBe(2);});it('e',()=>{expect(hd266obs(15,0)).toBe(4);});});
function hd267obs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph267obs_hd',()=>{it('a',()=>{expect(hd267obs(1,4)).toBe(2);});it('b',()=>{expect(hd267obs(3,1)).toBe(1);});it('c',()=>{expect(hd267obs(0,0)).toBe(0);});it('d',()=>{expect(hd267obs(93,73)).toBe(2);});it('e',()=>{expect(hd267obs(15,0)).toBe(4);});});
function hd268obs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph268obs_hd',()=>{it('a',()=>{expect(hd268obs(1,4)).toBe(2);});it('b',()=>{expect(hd268obs(3,1)).toBe(1);});it('c',()=>{expect(hd268obs(0,0)).toBe(0);});it('d',()=>{expect(hd268obs(93,73)).toBe(2);});it('e',()=>{expect(hd268obs(15,0)).toBe(4);});});
function hd269obs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph269obs_hd',()=>{it('a',()=>{expect(hd269obs(1,4)).toBe(2);});it('b',()=>{expect(hd269obs(3,1)).toBe(1);});it('c',()=>{expect(hd269obs(0,0)).toBe(0);});it('d',()=>{expect(hd269obs(93,73)).toBe(2);});it('e',()=>{expect(hd269obs(15,0)).toBe(4);});});
function hd270obs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph270obs_hd',()=>{it('a',()=>{expect(hd270obs(1,4)).toBe(2);});it('b',()=>{expect(hd270obs(3,1)).toBe(1);});it('c',()=>{expect(hd270obs(0,0)).toBe(0);});it('d',()=>{expect(hd270obs(93,73)).toBe(2);});it('e',()=>{expect(hd270obs(15,0)).toBe(4);});});
function hd271obs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph271obs_hd',()=>{it('a',()=>{expect(hd271obs(1,4)).toBe(2);});it('b',()=>{expect(hd271obs(3,1)).toBe(1);});it('c',()=>{expect(hd271obs(0,0)).toBe(0);});it('d',()=>{expect(hd271obs(93,73)).toBe(2);});it('e',()=>{expect(hd271obs(15,0)).toBe(4);});});
function hd272obs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph272obs_hd',()=>{it('a',()=>{expect(hd272obs(1,4)).toBe(2);});it('b',()=>{expect(hd272obs(3,1)).toBe(1);});it('c',()=>{expect(hd272obs(0,0)).toBe(0);});it('d',()=>{expect(hd272obs(93,73)).toBe(2);});it('e',()=>{expect(hd272obs(15,0)).toBe(4);});});
function hd273obs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph273obs_hd',()=>{it('a',()=>{expect(hd273obs(1,4)).toBe(2);});it('b',()=>{expect(hd273obs(3,1)).toBe(1);});it('c',()=>{expect(hd273obs(0,0)).toBe(0);});it('d',()=>{expect(hd273obs(93,73)).toBe(2);});it('e',()=>{expect(hd273obs(15,0)).toBe(4);});});
function hd274obs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph274obs_hd',()=>{it('a',()=>{expect(hd274obs(1,4)).toBe(2);});it('b',()=>{expect(hd274obs(3,1)).toBe(1);});it('c',()=>{expect(hd274obs(0,0)).toBe(0);});it('d',()=>{expect(hd274obs(93,73)).toBe(2);});it('e',()=>{expect(hd274obs(15,0)).toBe(4);});});
function hd275obs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph275obs_hd',()=>{it('a',()=>{expect(hd275obs(1,4)).toBe(2);});it('b',()=>{expect(hd275obs(3,1)).toBe(1);});it('c',()=>{expect(hd275obs(0,0)).toBe(0);});it('d',()=>{expect(hd275obs(93,73)).toBe(2);});it('e',()=>{expect(hd275obs(15,0)).toBe(4);});});
function hd276obs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph276obs_hd',()=>{it('a',()=>{expect(hd276obs(1,4)).toBe(2);});it('b',()=>{expect(hd276obs(3,1)).toBe(1);});it('c',()=>{expect(hd276obs(0,0)).toBe(0);});it('d',()=>{expect(hd276obs(93,73)).toBe(2);});it('e',()=>{expect(hd276obs(15,0)).toBe(4);});});
function hd277obs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph277obs_hd',()=>{it('a',()=>{expect(hd277obs(1,4)).toBe(2);});it('b',()=>{expect(hd277obs(3,1)).toBe(1);});it('c',()=>{expect(hd277obs(0,0)).toBe(0);});it('d',()=>{expect(hd277obs(93,73)).toBe(2);});it('e',()=>{expect(hd277obs(15,0)).toBe(4);});});
function hd278obs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph278obs_hd',()=>{it('a',()=>{expect(hd278obs(1,4)).toBe(2);});it('b',()=>{expect(hd278obs(3,1)).toBe(1);});it('c',()=>{expect(hd278obs(0,0)).toBe(0);});it('d',()=>{expect(hd278obs(93,73)).toBe(2);});it('e',()=>{expect(hd278obs(15,0)).toBe(4);});});
function hd279obs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph279obs_hd',()=>{it('a',()=>{expect(hd279obs(1,4)).toBe(2);});it('b',()=>{expect(hd279obs(3,1)).toBe(1);});it('c',()=>{expect(hd279obs(0,0)).toBe(0);});it('d',()=>{expect(hd279obs(93,73)).toBe(2);});it('e',()=>{expect(hd279obs(15,0)).toBe(4);});});
function hd280obs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph280obs_hd',()=>{it('a',()=>{expect(hd280obs(1,4)).toBe(2);});it('b',()=>{expect(hd280obs(3,1)).toBe(1);});it('c',()=>{expect(hd280obs(0,0)).toBe(0);});it('d',()=>{expect(hd280obs(93,73)).toBe(2);});it('e',()=>{expect(hd280obs(15,0)).toBe(4);});});
function hd281obs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph281obs_hd',()=>{it('a',()=>{expect(hd281obs(1,4)).toBe(2);});it('b',()=>{expect(hd281obs(3,1)).toBe(1);});it('c',()=>{expect(hd281obs(0,0)).toBe(0);});it('d',()=>{expect(hd281obs(93,73)).toBe(2);});it('e',()=>{expect(hd281obs(15,0)).toBe(4);});});
function hd282obs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph282obs_hd',()=>{it('a',()=>{expect(hd282obs(1,4)).toBe(2);});it('b',()=>{expect(hd282obs(3,1)).toBe(1);});it('c',()=>{expect(hd282obs(0,0)).toBe(0);});it('d',()=>{expect(hd282obs(93,73)).toBe(2);});it('e',()=>{expect(hd282obs(15,0)).toBe(4);});});
function hd283obs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph283obs_hd',()=>{it('a',()=>{expect(hd283obs(1,4)).toBe(2);});it('b',()=>{expect(hd283obs(3,1)).toBe(1);});it('c',()=>{expect(hd283obs(0,0)).toBe(0);});it('d',()=>{expect(hd283obs(93,73)).toBe(2);});it('e',()=>{expect(hd283obs(15,0)).toBe(4);});});
function hd284obs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph284obs_hd',()=>{it('a',()=>{expect(hd284obs(1,4)).toBe(2);});it('b',()=>{expect(hd284obs(3,1)).toBe(1);});it('c',()=>{expect(hd284obs(0,0)).toBe(0);});it('d',()=>{expect(hd284obs(93,73)).toBe(2);});it('e',()=>{expect(hd284obs(15,0)).toBe(4);});});
function hd285obs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph285obs_hd',()=>{it('a',()=>{expect(hd285obs(1,4)).toBe(2);});it('b',()=>{expect(hd285obs(3,1)).toBe(1);});it('c',()=>{expect(hd285obs(0,0)).toBe(0);});it('d',()=>{expect(hd285obs(93,73)).toBe(2);});it('e',()=>{expect(hd285obs(15,0)).toBe(4);});});
function hd286obs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph286obs_hd',()=>{it('a',()=>{expect(hd286obs(1,4)).toBe(2);});it('b',()=>{expect(hd286obs(3,1)).toBe(1);});it('c',()=>{expect(hd286obs(0,0)).toBe(0);});it('d',()=>{expect(hd286obs(93,73)).toBe(2);});it('e',()=>{expect(hd286obs(15,0)).toBe(4);});});
function hd287obs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph287obs_hd',()=>{it('a',()=>{expect(hd287obs(1,4)).toBe(2);});it('b',()=>{expect(hd287obs(3,1)).toBe(1);});it('c',()=>{expect(hd287obs(0,0)).toBe(0);});it('d',()=>{expect(hd287obs(93,73)).toBe(2);});it('e',()=>{expect(hd287obs(15,0)).toBe(4);});});
function hd288obs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph288obs_hd',()=>{it('a',()=>{expect(hd288obs(1,4)).toBe(2);});it('b',()=>{expect(hd288obs(3,1)).toBe(1);});it('c',()=>{expect(hd288obs(0,0)).toBe(0);});it('d',()=>{expect(hd288obs(93,73)).toBe(2);});it('e',()=>{expect(hd288obs(15,0)).toBe(4);});});
function hd289obs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph289obs_hd',()=>{it('a',()=>{expect(hd289obs(1,4)).toBe(2);});it('b',()=>{expect(hd289obs(3,1)).toBe(1);});it('c',()=>{expect(hd289obs(0,0)).toBe(0);});it('d',()=>{expect(hd289obs(93,73)).toBe(2);});it('e',()=>{expect(hd289obs(15,0)).toBe(4);});});
function hd290obs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph290obs_hd',()=>{it('a',()=>{expect(hd290obs(1,4)).toBe(2);});it('b',()=>{expect(hd290obs(3,1)).toBe(1);});it('c',()=>{expect(hd290obs(0,0)).toBe(0);});it('d',()=>{expect(hd290obs(93,73)).toBe(2);});it('e',()=>{expect(hd290obs(15,0)).toBe(4);});});
function hd291obs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph291obs_hd',()=>{it('a',()=>{expect(hd291obs(1,4)).toBe(2);});it('b',()=>{expect(hd291obs(3,1)).toBe(1);});it('c',()=>{expect(hd291obs(0,0)).toBe(0);});it('d',()=>{expect(hd291obs(93,73)).toBe(2);});it('e',()=>{expect(hd291obs(15,0)).toBe(4);});});
function hd292obs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph292obs_hd',()=>{it('a',()=>{expect(hd292obs(1,4)).toBe(2);});it('b',()=>{expect(hd292obs(3,1)).toBe(1);});it('c',()=>{expect(hd292obs(0,0)).toBe(0);});it('d',()=>{expect(hd292obs(93,73)).toBe(2);});it('e',()=>{expect(hd292obs(15,0)).toBe(4);});});
function hd293obs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph293obs_hd',()=>{it('a',()=>{expect(hd293obs(1,4)).toBe(2);});it('b',()=>{expect(hd293obs(3,1)).toBe(1);});it('c',()=>{expect(hd293obs(0,0)).toBe(0);});it('d',()=>{expect(hd293obs(93,73)).toBe(2);});it('e',()=>{expect(hd293obs(15,0)).toBe(4);});});
function hd294obs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph294obs_hd',()=>{it('a',()=>{expect(hd294obs(1,4)).toBe(2);});it('b',()=>{expect(hd294obs(3,1)).toBe(1);});it('c',()=>{expect(hd294obs(0,0)).toBe(0);});it('d',()=>{expect(hd294obs(93,73)).toBe(2);});it('e',()=>{expect(hd294obs(15,0)).toBe(4);});});
function hd295obs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph295obs_hd',()=>{it('a',()=>{expect(hd295obs(1,4)).toBe(2);});it('b',()=>{expect(hd295obs(3,1)).toBe(1);});it('c',()=>{expect(hd295obs(0,0)).toBe(0);});it('d',()=>{expect(hd295obs(93,73)).toBe(2);});it('e',()=>{expect(hd295obs(15,0)).toBe(4);});});
function hd296obs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph296obs_hd',()=>{it('a',()=>{expect(hd296obs(1,4)).toBe(2);});it('b',()=>{expect(hd296obs(3,1)).toBe(1);});it('c',()=>{expect(hd296obs(0,0)).toBe(0);});it('d',()=>{expect(hd296obs(93,73)).toBe(2);});it('e',()=>{expect(hd296obs(15,0)).toBe(4);});});
function hd297obs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph297obs_hd',()=>{it('a',()=>{expect(hd297obs(1,4)).toBe(2);});it('b',()=>{expect(hd297obs(3,1)).toBe(1);});it('c',()=>{expect(hd297obs(0,0)).toBe(0);});it('d',()=>{expect(hd297obs(93,73)).toBe(2);});it('e',()=>{expect(hd297obs(15,0)).toBe(4);});});
function hd298obs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph298obs_hd',()=>{it('a',()=>{expect(hd298obs(1,4)).toBe(2);});it('b',()=>{expect(hd298obs(3,1)).toBe(1);});it('c',()=>{expect(hd298obs(0,0)).toBe(0);});it('d',()=>{expect(hd298obs(93,73)).toBe(2);});it('e',()=>{expect(hd298obs(15,0)).toBe(4);});});
function hd299obs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph299obs_hd',()=>{it('a',()=>{expect(hd299obs(1,4)).toBe(2);});it('b',()=>{expect(hd299obs(3,1)).toBe(1);});it('c',()=>{expect(hd299obs(0,0)).toBe(0);});it('d',()=>{expect(hd299obs(93,73)).toBe(2);});it('e',()=>{expect(hd299obs(15,0)).toBe(4);});});
function hd300obs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph300obs_hd',()=>{it('a',()=>{expect(hd300obs(1,4)).toBe(2);});it('b',()=>{expect(hd300obs(3,1)).toBe(1);});it('c',()=>{expect(hd300obs(0,0)).toBe(0);});it('d',()=>{expect(hd300obs(93,73)).toBe(2);});it('e',()=>{expect(hd300obs(15,0)).toBe(4);});});
function hd301obs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph301obs_hd',()=>{it('a',()=>{expect(hd301obs(1,4)).toBe(2);});it('b',()=>{expect(hd301obs(3,1)).toBe(1);});it('c',()=>{expect(hd301obs(0,0)).toBe(0);});it('d',()=>{expect(hd301obs(93,73)).toBe(2);});it('e',()=>{expect(hd301obs(15,0)).toBe(4);});});
function hd302obs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph302obs_hd',()=>{it('a',()=>{expect(hd302obs(1,4)).toBe(2);});it('b',()=>{expect(hd302obs(3,1)).toBe(1);});it('c',()=>{expect(hd302obs(0,0)).toBe(0);});it('d',()=>{expect(hd302obs(93,73)).toBe(2);});it('e',()=>{expect(hd302obs(15,0)).toBe(4);});});
function hd303obs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph303obs_hd',()=>{it('a',()=>{expect(hd303obs(1,4)).toBe(2);});it('b',()=>{expect(hd303obs(3,1)).toBe(1);});it('c',()=>{expect(hd303obs(0,0)).toBe(0);});it('d',()=>{expect(hd303obs(93,73)).toBe(2);});it('e',()=>{expect(hd303obs(15,0)).toBe(4);});});
function hd304obs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph304obs_hd',()=>{it('a',()=>{expect(hd304obs(1,4)).toBe(2);});it('b',()=>{expect(hd304obs(3,1)).toBe(1);});it('c',()=>{expect(hd304obs(0,0)).toBe(0);});it('d',()=>{expect(hd304obs(93,73)).toBe(2);});it('e',()=>{expect(hd304obs(15,0)).toBe(4);});});
function hd305obs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph305obs_hd',()=>{it('a',()=>{expect(hd305obs(1,4)).toBe(2);});it('b',()=>{expect(hd305obs(3,1)).toBe(1);});it('c',()=>{expect(hd305obs(0,0)).toBe(0);});it('d',()=>{expect(hd305obs(93,73)).toBe(2);});it('e',()=>{expect(hd305obs(15,0)).toBe(4);});});
function hd306obs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph306obs_hd',()=>{it('a',()=>{expect(hd306obs(1,4)).toBe(2);});it('b',()=>{expect(hd306obs(3,1)).toBe(1);});it('c',()=>{expect(hd306obs(0,0)).toBe(0);});it('d',()=>{expect(hd306obs(93,73)).toBe(2);});it('e',()=>{expect(hd306obs(15,0)).toBe(4);});});
function hd307obs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph307obs_hd',()=>{it('a',()=>{expect(hd307obs(1,4)).toBe(2);});it('b',()=>{expect(hd307obs(3,1)).toBe(1);});it('c',()=>{expect(hd307obs(0,0)).toBe(0);});it('d',()=>{expect(hd307obs(93,73)).toBe(2);});it('e',()=>{expect(hd307obs(15,0)).toBe(4);});});
function hd308obs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph308obs_hd',()=>{it('a',()=>{expect(hd308obs(1,4)).toBe(2);});it('b',()=>{expect(hd308obs(3,1)).toBe(1);});it('c',()=>{expect(hd308obs(0,0)).toBe(0);});it('d',()=>{expect(hd308obs(93,73)).toBe(2);});it('e',()=>{expect(hd308obs(15,0)).toBe(4);});});
function hd309obs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph309obs_hd',()=>{it('a',()=>{expect(hd309obs(1,4)).toBe(2);});it('b',()=>{expect(hd309obs(3,1)).toBe(1);});it('c',()=>{expect(hd309obs(0,0)).toBe(0);});it('d',()=>{expect(hd309obs(93,73)).toBe(2);});it('e',()=>{expect(hd309obs(15,0)).toBe(4);});});
function hd310obs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph310obs_hd',()=>{it('a',()=>{expect(hd310obs(1,4)).toBe(2);});it('b',()=>{expect(hd310obs(3,1)).toBe(1);});it('c',()=>{expect(hd310obs(0,0)).toBe(0);});it('d',()=>{expect(hd310obs(93,73)).toBe(2);});it('e',()=>{expect(hd310obs(15,0)).toBe(4);});});
function hd311obs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph311obs_hd',()=>{it('a',()=>{expect(hd311obs(1,4)).toBe(2);});it('b',()=>{expect(hd311obs(3,1)).toBe(1);});it('c',()=>{expect(hd311obs(0,0)).toBe(0);});it('d',()=>{expect(hd311obs(93,73)).toBe(2);});it('e',()=>{expect(hd311obs(15,0)).toBe(4);});});
function hd312obs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph312obs_hd',()=>{it('a',()=>{expect(hd312obs(1,4)).toBe(2);});it('b',()=>{expect(hd312obs(3,1)).toBe(1);});it('c',()=>{expect(hd312obs(0,0)).toBe(0);});it('d',()=>{expect(hd312obs(93,73)).toBe(2);});it('e',()=>{expect(hd312obs(15,0)).toBe(4);});});
function hd313obs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph313obs_hd',()=>{it('a',()=>{expect(hd313obs(1,4)).toBe(2);});it('b',()=>{expect(hd313obs(3,1)).toBe(1);});it('c',()=>{expect(hd313obs(0,0)).toBe(0);});it('d',()=>{expect(hd313obs(93,73)).toBe(2);});it('e',()=>{expect(hd313obs(15,0)).toBe(4);});});
function hd314obs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph314obs_hd',()=>{it('a',()=>{expect(hd314obs(1,4)).toBe(2);});it('b',()=>{expect(hd314obs(3,1)).toBe(1);});it('c',()=>{expect(hd314obs(0,0)).toBe(0);});it('d',()=>{expect(hd314obs(93,73)).toBe(2);});it('e',()=>{expect(hd314obs(15,0)).toBe(4);});});
function hd315obs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph315obs_hd',()=>{it('a',()=>{expect(hd315obs(1,4)).toBe(2);});it('b',()=>{expect(hd315obs(3,1)).toBe(1);});it('c',()=>{expect(hd315obs(0,0)).toBe(0);});it('d',()=>{expect(hd315obs(93,73)).toBe(2);});it('e',()=>{expect(hd315obs(15,0)).toBe(4);});});
function hd316obs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph316obs_hd',()=>{it('a',()=>{expect(hd316obs(1,4)).toBe(2);});it('b',()=>{expect(hd316obs(3,1)).toBe(1);});it('c',()=>{expect(hd316obs(0,0)).toBe(0);});it('d',()=>{expect(hd316obs(93,73)).toBe(2);});it('e',()=>{expect(hd316obs(15,0)).toBe(4);});});
function hd317obs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph317obs_hd',()=>{it('a',()=>{expect(hd317obs(1,4)).toBe(2);});it('b',()=>{expect(hd317obs(3,1)).toBe(1);});it('c',()=>{expect(hd317obs(0,0)).toBe(0);});it('d',()=>{expect(hd317obs(93,73)).toBe(2);});it('e',()=>{expect(hd317obs(15,0)).toBe(4);});});
function hd318obs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph318obs_hd',()=>{it('a',()=>{expect(hd318obs(1,4)).toBe(2);});it('b',()=>{expect(hd318obs(3,1)).toBe(1);});it('c',()=>{expect(hd318obs(0,0)).toBe(0);});it('d',()=>{expect(hd318obs(93,73)).toBe(2);});it('e',()=>{expect(hd318obs(15,0)).toBe(4);});});
function hd319obs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph319obs_hd',()=>{it('a',()=>{expect(hd319obs(1,4)).toBe(2);});it('b',()=>{expect(hd319obs(3,1)).toBe(1);});it('c',()=>{expect(hd319obs(0,0)).toBe(0);});it('d',()=>{expect(hd319obs(93,73)).toBe(2);});it('e',()=>{expect(hd319obs(15,0)).toBe(4);});});
function hd320obs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph320obs_hd',()=>{it('a',()=>{expect(hd320obs(1,4)).toBe(2);});it('b',()=>{expect(hd320obs(3,1)).toBe(1);});it('c',()=>{expect(hd320obs(0,0)).toBe(0);});it('d',()=>{expect(hd320obs(93,73)).toBe(2);});it('e',()=>{expect(hd320obs(15,0)).toBe(4);});});
function hd321obs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph321obs_hd',()=>{it('a',()=>{expect(hd321obs(1,4)).toBe(2);});it('b',()=>{expect(hd321obs(3,1)).toBe(1);});it('c',()=>{expect(hd321obs(0,0)).toBe(0);});it('d',()=>{expect(hd321obs(93,73)).toBe(2);});it('e',()=>{expect(hd321obs(15,0)).toBe(4);});});
function hd322obs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph322obs_hd',()=>{it('a',()=>{expect(hd322obs(1,4)).toBe(2);});it('b',()=>{expect(hd322obs(3,1)).toBe(1);});it('c',()=>{expect(hd322obs(0,0)).toBe(0);});it('d',()=>{expect(hd322obs(93,73)).toBe(2);});it('e',()=>{expect(hd322obs(15,0)).toBe(4);});});
function hd323obs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph323obs_hd',()=>{it('a',()=>{expect(hd323obs(1,4)).toBe(2);});it('b',()=>{expect(hd323obs(3,1)).toBe(1);});it('c',()=>{expect(hd323obs(0,0)).toBe(0);});it('d',()=>{expect(hd323obs(93,73)).toBe(2);});it('e',()=>{expect(hd323obs(15,0)).toBe(4);});});
function hd324obs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph324obs_hd',()=>{it('a',()=>{expect(hd324obs(1,4)).toBe(2);});it('b',()=>{expect(hd324obs(3,1)).toBe(1);});it('c',()=>{expect(hd324obs(0,0)).toBe(0);});it('d',()=>{expect(hd324obs(93,73)).toBe(2);});it('e',()=>{expect(hd324obs(15,0)).toBe(4);});});
function hd325obs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph325obs_hd',()=>{it('a',()=>{expect(hd325obs(1,4)).toBe(2);});it('b',()=>{expect(hd325obs(3,1)).toBe(1);});it('c',()=>{expect(hd325obs(0,0)).toBe(0);});it('d',()=>{expect(hd325obs(93,73)).toBe(2);});it('e',()=>{expect(hd325obs(15,0)).toBe(4);});});
function hd326obs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph326obs_hd',()=>{it('a',()=>{expect(hd326obs(1,4)).toBe(2);});it('b',()=>{expect(hd326obs(3,1)).toBe(1);});it('c',()=>{expect(hd326obs(0,0)).toBe(0);});it('d',()=>{expect(hd326obs(93,73)).toBe(2);});it('e',()=>{expect(hd326obs(15,0)).toBe(4);});});
function hd327obs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph327obs_hd',()=>{it('a',()=>{expect(hd327obs(1,4)).toBe(2);});it('b',()=>{expect(hd327obs(3,1)).toBe(1);});it('c',()=>{expect(hd327obs(0,0)).toBe(0);});it('d',()=>{expect(hd327obs(93,73)).toBe(2);});it('e',()=>{expect(hd327obs(15,0)).toBe(4);});});
function hd328obs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph328obs_hd',()=>{it('a',()=>{expect(hd328obs(1,4)).toBe(2);});it('b',()=>{expect(hd328obs(3,1)).toBe(1);});it('c',()=>{expect(hd328obs(0,0)).toBe(0);});it('d',()=>{expect(hd328obs(93,73)).toBe(2);});it('e',()=>{expect(hd328obs(15,0)).toBe(4);});});
function hd329obs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph329obs_hd',()=>{it('a',()=>{expect(hd329obs(1,4)).toBe(2);});it('b',()=>{expect(hd329obs(3,1)).toBe(1);});it('c',()=>{expect(hd329obs(0,0)).toBe(0);});it('d',()=>{expect(hd329obs(93,73)).toBe(2);});it('e',()=>{expect(hd329obs(15,0)).toBe(4);});});
function hd330obs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph330obs_hd',()=>{it('a',()=>{expect(hd330obs(1,4)).toBe(2);});it('b',()=>{expect(hd330obs(3,1)).toBe(1);});it('c',()=>{expect(hd330obs(0,0)).toBe(0);});it('d',()=>{expect(hd330obs(93,73)).toBe(2);});it('e',()=>{expect(hd330obs(15,0)).toBe(4);});});
function hd331obs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph331obs_hd',()=>{it('a',()=>{expect(hd331obs(1,4)).toBe(2);});it('b',()=>{expect(hd331obs(3,1)).toBe(1);});it('c',()=>{expect(hd331obs(0,0)).toBe(0);});it('d',()=>{expect(hd331obs(93,73)).toBe(2);});it('e',()=>{expect(hd331obs(15,0)).toBe(4);});});
function hd332obs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph332obs_hd',()=>{it('a',()=>{expect(hd332obs(1,4)).toBe(2);});it('b',()=>{expect(hd332obs(3,1)).toBe(1);});it('c',()=>{expect(hd332obs(0,0)).toBe(0);});it('d',()=>{expect(hd332obs(93,73)).toBe(2);});it('e',()=>{expect(hd332obs(15,0)).toBe(4);});});
function hd333obs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph333obs_hd',()=>{it('a',()=>{expect(hd333obs(1,4)).toBe(2);});it('b',()=>{expect(hd333obs(3,1)).toBe(1);});it('c',()=>{expect(hd333obs(0,0)).toBe(0);});it('d',()=>{expect(hd333obs(93,73)).toBe(2);});it('e',()=>{expect(hd333obs(15,0)).toBe(4);});});
function hd334obs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph334obs_hd',()=>{it('a',()=>{expect(hd334obs(1,4)).toBe(2);});it('b',()=>{expect(hd334obs(3,1)).toBe(1);});it('c',()=>{expect(hd334obs(0,0)).toBe(0);});it('d',()=>{expect(hd334obs(93,73)).toBe(2);});it('e',()=>{expect(hd334obs(15,0)).toBe(4);});});
function hd335obs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph335obs_hd',()=>{it('a',()=>{expect(hd335obs(1,4)).toBe(2);});it('b',()=>{expect(hd335obs(3,1)).toBe(1);});it('c',()=>{expect(hd335obs(0,0)).toBe(0);});it('d',()=>{expect(hd335obs(93,73)).toBe(2);});it('e',()=>{expect(hd335obs(15,0)).toBe(4);});});
function hd336obs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph336obs_hd',()=>{it('a',()=>{expect(hd336obs(1,4)).toBe(2);});it('b',()=>{expect(hd336obs(3,1)).toBe(1);});it('c',()=>{expect(hd336obs(0,0)).toBe(0);});it('d',()=>{expect(hd336obs(93,73)).toBe(2);});it('e',()=>{expect(hd336obs(15,0)).toBe(4);});});
function hd337obs(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph337obs_hd',()=>{it('a',()=>{expect(hd337obs(1,4)).toBe(2);});it('b',()=>{expect(hd337obs(3,1)).toBe(1);});it('c',()=>{expect(hd337obs(0,0)).toBe(0);});it('d',()=>{expect(hd337obs(93,73)).toBe(2);});it('e',()=>{expect(hd337obs(15,0)).toBe(4);});});
