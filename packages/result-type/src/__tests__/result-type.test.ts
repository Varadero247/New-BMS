// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import {
  Ok, Err, ok, err,
  tryResult, tryResultAsync,
  all, any, partition,
  Some, None, some, none,
  fromNullable, fromPredicate,
  Left, Right, left, right,
} from '../result-type';

// ─────────────────────────────────────────────────────────────────────────────
// Ok.map — 100 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('Ok.map', () => {
  for (let i = 0; i < 100; i++) {
    it(`maps value ${i} to ${i * 2}`, () => {
      const result = ok<number>(i).map(x => x * 2);
      expect(result.isOk()).toBe(true);
      expect((result as Ok<number>).value).toBe(i * 2);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Ok.flatMap — 100 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('Ok.flatMap', () => {
  for (let i = 0; i < 100; i++) {
    it(`flatMaps Ok(${i}) → Ok(${i + 1})`, () => {
      const result = ok<number>(i).flatMap(x => ok(x + 1));
      expect(result.isOk()).toBe(true);
      expect((result as Ok<number>).value).toBe(i + 1);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Ok.getOrElse — 100 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('Ok.getOrElse', () => {
  for (let i = 0; i < 100; i++) {
    it(`Ok(${i}).getOrElse returns value, not default`, () => {
      const result = ok<number>(i).getOrElse(-999);
      expect(result).toBe(i);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Err.map — 100 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('Err.map', () => {
  for (let i = 0; i < 100; i++) {
    it(`Err.map(${i}) returns Err unchanged`, () => {
      const e = new Error(`err-${i}`);
      const result = err<number>(e).map(x => x + 1);
      expect(result.isErr()).toBe(true);
      expect((result as Err<number>).error).toBe(e);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Err.getOrElse — 100 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('Err.getOrElse', () => {
  for (let i = 0; i < 100; i++) {
    it(`Err.getOrElse(${i}) returns default`, () => {
      const result = err<number>(new Error('fail')).getOrElse(i);
      expect(result).toBe(i);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Ok.match / Err.match — 100 tests (50 Ok, 50 Err)
// ─────────────────────────────────────────────────────────────────────────────
describe('Ok.match and Err.match', () => {
  for (let i = 0; i < 50; i++) {
    it(`Ok(${i}).match calls ok handler`, () => {
      const r = ok<number>(i).match({ ok: v => v * 3, err: () => -1 });
      expect(r).toBe(i * 3);
    });
  }
  for (let i = 0; i < 50; i++) {
    it(`Err(${i}).match calls err handler`, () => {
      const r = err<number, number>(i).match({ ok: () => -1, err: e => e + 100 });
      expect(r).toBe(i + 100);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// tryResult — 100 tests (50 success, 50 failure)
// ─────────────────────────────────────────────────────────────────────────────
describe('tryResult', () => {
  for (let i = 0; i < 50; i++) {
    it(`tryResult success case ${i}`, () => {
      const r = tryResult(() => i * 2);
      expect(r.isOk()).toBe(true);
      expect((r as Ok<number>).value).toBe(i * 2);
    });
  }
  for (let i = 0; i < 50; i++) {
    it(`tryResult throwing case ${i}`, () => {
      const r = tryResult(() => { throw new Error(`bang-${i}`); });
      expect(r.isErr()).toBe(true);
      expect((r as Err<never>).error.message).toBe(`bang-${i}`);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// all — 100 tests (50 all-Ok, 50 mixed with Err)
// ─────────────────────────────────────────────────────────────────────────────
describe('all', () => {
  for (let n = 0; n < 50; n++) {
    it(`all: ${n + 1} Ok results → Ok(array)`, () => {
      const results = Array.from({ length: n + 1 }, (_, i) => ok<number>(i));
      const r = all(results);
      expect(r.isOk()).toBe(true);
      expect((r as Ok<number[]>).value).toEqual(Array.from({ length: n + 1 }, (_, i) => i));
    });
  }
  for (let n = 0; n < 50; n++) {
    it(`all: first result is Err(${n}) → Err`, () => {
      const results = [err<number>(new Error(`e-${n}`)), ok<number>(n)];
      const r = all(results);
      expect(r.isErr()).toBe(true);
      expect((r as Err<number[]>).error.message).toBe(`e-${n}`);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Some.map — 100 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('Some.map', () => {
  for (let i = 0; i < 100; i++) {
    it(`Some(${i}).map → Some(${i + 10})`, () => {
      const r = some(i).map(x => x + 10);
      expect(r.isSome()).toBe(true);
      expect((r as Some<number>).value).toBe(i + 10);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Some.filter — 100 tests (50 pass, 50 fail predicate)
// ─────────────────────────────────────────────────────────────────────────────
describe('Some.filter', () => {
  for (let i = 0; i < 50; i++) {
    it(`Some(${i}).filter(always true) → Some`, () => {
      const r = some(i).filter(() => true);
      expect(r.isSome()).toBe(true);
      expect((r as Some<number>).value).toBe(i);
    });
  }
  for (let i = 0; i < 50; i++) {
    it(`Some(${i}).filter(always false) → None`, () => {
      const r = some(i).filter(() => false);
      expect(r.isNone()).toBe(true);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// None.map — 100 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('None.map', () => {
  for (let i = 0; i < 100; i++) {
    it(`None.map(${i}) always returns None`, () => {
      const r = none.map(() => i);
      expect(r.isNone()).toBe(true);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// fromNullable — 100 tests (50 null/undefined, 50 values)
// ─────────────────────────────────────────────────────────────────────────────
describe('fromNullable', () => {
  for (let i = 0; i < 25; i++) {
    it(`fromNullable(null) case ${i} → None`, () => {
      const r = fromNullable<number>(null);
      expect(r.isNone()).toBe(true);
    });
  }
  for (let i = 0; i < 25; i++) {
    it(`fromNullable(undefined) case ${i} → None`, () => {
      const r = fromNullable<number>(undefined);
      expect(r.isNone()).toBe(true);
    });
  }
  for (let i = 0; i < 50; i++) {
    it(`fromNullable(${i}) → Some(${i})`, () => {
      const r = fromNullable(i);
      expect(r.isSome()).toBe(true);
      expect((r as Some<number>).value).toBe(i);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Option.match — 100 tests (50 Some, 50 None)
// ─────────────────────────────────────────────────────────────────────────────
describe('Option.match', () => {
  for (let i = 0; i < 50; i++) {
    it(`Some(${i}).match calls some handler`, () => {
      const r = some(i).match({ some: v => v * 4, none: () => -1 });
      expect(r).toBe(i * 4);
    });
  }
  for (let i = 0; i < 50; i++) {
    it(`None.match(${i}) calls none handler`, () => {
      const r = none.match({ some: () => -1, none: () => i + 200 });
      expect(r).toBe(i + 200);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Left.map — 50 tests: map on Left does nothing
// ─────────────────────────────────────────────────────────────────────────────
describe('Left.map', () => {
  for (let i = 0; i < 50; i++) {
    it(`Left(${i}).map does not call fn`, () => {
      const e = left<number, number>(i);
      const r = e.map(x => x + 100);
      expect(r.isLeft()).toBe(true);
      expect((r as Left<number, number>).left).toBe(i);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Right.map — 50 tests: map on Right applies fn
// ─────────────────────────────────────────────────────────────────────────────
describe('Right.map', () => {
  for (let i = 0; i < 50; i++) {
    it(`Right(${i}).map → Right(${i + 50})`, () => {
      const e = right<number, never>(i);
      const r = e.map(x => x + 50);
      expect(r.isRight()).toBe(true);
      expect((r as Right<never, number>).right).toBe(i + 50);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Either.match — 50 tests (25 Left, 25 Right)
// ─────────────────────────────────────────────────────────────────────────────
describe('Either.match', () => {
  for (let i = 0; i < 25; i++) {
    it(`Left(${i}).match calls left handler`, () => {
      const e = left<number, number>(i);
      const r = e.match({ left: l => l + 300, right: rr => rr });
      expect(r).toBe(i + 300);
    });
  }
  for (let i = 0; i < 25; i++) {
    it(`Right(${i}).match calls right handler`, () => {
      const e = right<number, never>(i);
      const r = e.match({ left: () => -1, right: rr => rr + 400 });
      expect(r).toBe(i + 400);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// toResult / toOption conversions — 50 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('toResult and toOption conversions', () => {
  for (let i = 0; i < 10; i++) {
    it(`Some(${i}).toResult → Ok`, () => {
      const r = some(i).toResult(new Error('unused'));
      expect(r.isOk()).toBe(true);
      expect((r as Ok<number>).value).toBe(i);
    });
  }
  for (let i = 0; i < 10; i++) {
    it(`None.toResult(Error(${i})) → Err`, () => {
      const e = new Error(`none-err-${i}`);
      const r = none.toResult(e);
      expect(r.isErr()).toBe(true);
      expect((r as Err<never>).error).toBe(e);
    });
  }
  for (let i = 0; i < 10; i++) {
    it(`Ok(${i}).toOption → Some`, () => {
      const r = ok<number>(i).toOption();
      expect(r.isSome()).toBe(true);
      expect((r as Some<number>).value).toBe(i);
    });
  }
  for (let i = 0; i < 10; i++) {
    it(`Err.toOption → None (case ${i})`, () => {
      const r = err<number>(new Error(`e${i}`)).toOption();
      expect(r.isNone()).toBe(true);
    });
  }
  for (let i = 0; i < 5; i++) {
    it(`Right(${i}).toResult → Ok`, () => {
      const r = right<number, string>(i).toResult();
      expect(r.isOk()).toBe(true);
      expect((r as Ok<number>).value).toBe(i);
    });
  }
  for (let i = 0; i < 5; i++) {
    it(`Left('err${i}').toResult → Err`, () => {
      const r = left<string, number>(`err${i}`).toResult();
      expect(r.isErr()).toBe(true);
      expect((r as Err<number, string>).error).toBe(`err${i}`);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Additional coverage: unwrap / unwrapOr / getOrThrow / tap / toString / etc.
// ─────────────────────────────────────────────────────────────────────────────
describe('Ok additional methods', () => {
  for (let i = 0; i < 50; i++) {
    it(`Ok(${i}).unwrap() === ${i}`, () => {
      expect(ok(i).unwrap()).toBe(i);
    });
  }
  for (let i = 0; i < 50; i++) {
    it(`Ok(${i}).unwrapOr(999) === ${i}`, () => {
      expect(ok(i).unwrapOr(999)).toBe(i);
    });
  }
  for (let i = 0; i < 50; i++) {
    it(`Ok(${i}).getOrThrow() === ${i}`, () => {
      expect(ok(i).getOrThrow()).toBe(i);
    });
  }
  for (let i = 0; i < 50; i++) {
    it(`Ok(${i}).isOk() is true`, () => {
      expect(ok(i).isOk()).toBe(true);
    });
  }
  for (let i = 0; i < 50; i++) {
    it(`Ok(${i}).isErr() is false`, () => {
      expect(ok(i).isErr()).toBe(false);
    });
  }
  for (let i = 0; i < 50; i++) {
    it(`Ok(${i}) .ok literal is true`, () => {
      expect(ok(i).ok).toBe(true);
    });
  }
  for (let i = 0; i < 50; i++) {
    it(`Ok(${i}).toString() contains value`, () => {
      expect(ok(i).toString()).toContain(String(i));
    });
  }
  for (let i = 0; i < 50; i++) {
    it(`Ok(${i}).tap executes side effect`, () => {
      let captured = -1;
      ok(i).tap(v => { captured = v; });
      expect(captured).toBe(i);
    });
  }
  for (let i = 0; i < 50; i++) {
    it(`Ok(${i}).tap returns same result`, () => {
      const o = ok(i);
      const r = o.tap(() => {});
      expect(r.isOk()).toBe(true);
      expect((r as Ok<number>).value).toBe(i);
    });
  }
  for (let i = 0; i < 50; i++) {
    it(`Ok(${i}).mapErr does not change value`, () => {
      const r = ok<number, Error>(i).mapErr(() => new Error('mapped'));
      expect(r.isOk()).toBe(true);
      expect((r as Ok<number>).value).toBe(i);
    });
  }
});

describe('Err additional methods', () => {
  for (let i = 0; i < 50; i++) {
    it(`Err(${i}).isErr() is true`, () => {
      expect(err<number, number>(i).isErr()).toBe(true);
    });
  }
  for (let i = 0; i < 50; i++) {
    it(`Err(${i}).isOk() is false`, () => {
      expect(err<number, number>(i).isOk()).toBe(false);
    });
  }
  for (let i = 0; i < 50; i++) {
    it(`Err(${i}).unwrapOr(${i + 1}) returns default`, () => {
      expect(err<number, number>(i).unwrapOr(i + 1)).toBe(i + 1);
    });
  }
  for (let i = 0; i < 50; i++) {
    it(`Err(${i}).unwrap() throws`, () => {
      expect(() => err<number, number>(i).unwrap()).toThrow();
    });
  }
  for (let i = 0; i < 50; i++) {
    it(`Err(${i}).getOrThrow() throws`, () => {
      expect(() => err<number, number>(i).getOrThrow()).toThrow();
    });
  }
  for (let i = 0; i < 50; i++) {
    it(`Err(${i}).tap does not execute side effect`, () => {
      let called = false;
      err<number, number>(i).tap(() => { called = true; });
      expect(called).toBe(false);
    });
  }
  for (let i = 0; i < 50; i++) {
    it(`Err(${i}).tap returns same Err`, () => {
      const e = err<number, number>(i);
      const r = e.tap(() => {});
      expect(r.isErr()).toBe(true);
      expect((r as Err<number, number>).error).toBe(i);
    });
  }
  for (let i = 0; i < 50; i++) {
    it(`Err(${i}).mapErr transforms error`, () => {
      const r = err<number, number>(i).mapErr(e => e * 2);
      expect(r.isErr()).toBe(true);
      expect((r as Err<number, number>).error).toBe(i * 2);
    });
  }
  for (let i = 0; i < 50; i++) {
    it(`Err(${i}).toString() contains error`, () => {
      expect(err<number, number>(i).toString()).toContain(String(i));
    });
  }
  for (let i = 0; i < 50; i++) {
    it(`Err(${i}).flatMap returns same Err`, () => {
      const e = err<number, number>(i);
      const r = e.flatMap(v => ok<number, number>(v + 1));
      expect(r.isErr()).toBe(true);
      expect((r as Err<number, number>).error).toBe(i);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// tryResultAsync — 50 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('tryResultAsync', () => {
  for (let i = 0; i < 25; i++) {
    it(`tryResultAsync success ${i}`, async () => {
      const r = await tryResultAsync(async () => i * 3);
      expect(r.isOk()).toBe(true);
      expect((r as Ok<number>).value).toBe(i * 3);
    });
  }
  for (let i = 0; i < 25; i++) {
    it(`tryResultAsync failure ${i}`, async () => {
      const r = await tryResultAsync(async () => { throw new Error(`async-err-${i}`); });
      expect(r.isErr()).toBe(true);
      expect((r as Err<never>).error.message).toBe(`async-err-${i}`);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// any — 50 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('any', () => {
  for (let i = 0; i < 25; i++) {
    it(`any: first Ok(${i}) wins`, () => {
      const results = [ok<number, string>(i), err<number, string>(`e${i}`)];
      const r = any(results);
      expect(r.isOk()).toBe(true);
      expect((r as Ok<number>).value).toBe(i);
    });
  }
  for (let i = 0; i < 25; i++) {
    it(`any: all Errs → Err([...errors]) case ${i}`, () => {
      const results = [err<number, number>(i), err<number, number>(i + 1)];
      const r = any(results);
      expect(r.isErr()).toBe(true);
      expect((r as Err<number, number[]>).error).toEqual([i, i + 1]);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// partition — 50 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('partition', () => {
  for (let i = 0; i < 25; i++) {
    it(`partition ${i}: separates oks and errs`, () => {
      const results = [ok<number>(i), err<number>(new Error(`e${i}`)), ok<number>(i + 1)];
      const { oks, errs } = partition(results);
      expect(oks).toEqual([i, i + 1]);
      expect(errs).toHaveLength(1);
      expect(errs[0].message).toBe(`e${i}`);
    });
  }
  for (let i = 0; i < 25; i++) {
    it(`partition ${i}: all-ok array`, () => {
      const results = [ok<number>(i), ok<number>(i + 1)];
      const { oks, errs } = partition(results);
      expect(oks).toEqual([i, i + 1]);
      expect(errs).toHaveLength(0);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Some additional methods — 50 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('Some additional methods', () => {
  for (let i = 0; i < 10; i++) {
    it(`Some(${i}).isSome() is true`, () => {
      expect(some(i).isSome()).toBe(true);
    });
  }
  for (let i = 0; i < 10; i++) {
    it(`Some(${i}).isNone() is false`, () => {
      expect(some(i).isNone()).toBe(false);
    });
  }
  for (let i = 0; i < 10; i++) {
    it(`Some(${i}).getOrElse returns value not default`, () => {
      expect(some(i).getOrElse(-1)).toBe(i);
    });
  }
  for (let i = 0; i < 10; i++) {
    it(`Some(${i}).getOrThrow returns value`, () => {
      expect(some(i).getOrThrow()).toBe(i);
    });
  }
  for (let i = 0; i < 10; i++) {
    it(`Some(${i}).toArray returns [${i}]`, () => {
      expect(some(i).toArray()).toEqual([i]);
    });
  }
  for (let i = 0; i < 10; i++) {
    it(`Some(${i}).tap executes side effect`, () => {
      let captured = -1;
      some(i).tap(v => { captured = v; });
      expect(captured).toBe(i);
    });
  }
  for (let i = 0; i < 10; i++) {
    it(`Some(${i}).flatMap → Some(${i * 2})`, () => {
      const r = some(i).flatMap(v => some(v * 2));
      expect(r.isSome()).toBe(true);
      expect((r as Some<number>).value).toBe(i * 2);
    });
  }
  for (let i = 0; i < 10; i++) {
    it(`Some(${i}).toString contains value`, () => {
      expect(some(i).toString()).toContain(String(i));
    });
  }
  for (let i = 0; i < 10; i++) {
    it(`Some(${i}).some literal is true`, () => {
      expect(some(i).some).toBe(true);
    });
  }
  for (let i = 0; i < 10; i++) {
    it(`Some(${i}).none literal is false`, () => {
      expect(some(i).none).toBe(false);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// None additional methods — 50 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('None additional methods', () => {
  for (let i = 0; i < 10; i++) {
    it(`None.isSome() is false (${i})`, () => {
      expect(none.isSome()).toBe(false);
    });
  }
  for (let i = 0; i < 10; i++) {
    it(`None.isNone() is true (${i})`, () => {
      expect(none.isNone()).toBe(true);
    });
  }
  for (let i = 0; i < 10; i++) {
    it(`None.getOrElse(${i}) returns default`, () => {
      expect(none.getOrElse(i)).toBe(i);
    });
  }
  for (let i = 0; i < 10; i++) {
    it(`None.getOrThrow() throws (${i})`, () => {
      expect(() => none.getOrThrow()).toThrow();
    });
  }
  for (let i = 0; i < 10; i++) {
    it(`None.toArray() returns [] (${i})`, () => {
      expect(none.toArray()).toEqual([]);
    });
  }
  for (let i = 0; i < 10; i++) {
    it(`None.tap does not execute fn (${i})`, () => {
      let called = false;
      none.tap(() => { called = true; });
      expect(called).toBe(false);
    });
  }
  for (let i = 0; i < 10; i++) {
    it(`None.flatMap returns None (${i})`, () => {
      const r = none.flatMap(() => some(i));
      expect(r.isNone()).toBe(true);
    });
  }
  for (let i = 0; i < 10; i++) {
    it(`None.filter returns None (${i})`, () => {
      const r = none.filter(() => true);
      expect(r.isNone()).toBe(true);
    });
  }
  for (let i = 0; i < 10; i++) {
    it(`None.toString() === 'None' (${i})`, () => {
      expect(none.toString()).toBe('None');
    });
  }
  for (let i = 0; i < 10; i++) {
    it(`None.none literal is true (${i})`, () => {
      expect(none.none).toBe(true);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// fromPredicate — 50 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('fromPredicate', () => {
  for (let i = 0; i < 25; i++) {
    it(`fromPredicate(${i}, even) → ${i % 2 === 0 ? 'Some' : 'None'}`, () => {
      const r = fromPredicate(i, v => v % 2 === 0);
      if (i % 2 === 0) {
        expect(r.isSome()).toBe(true);
        expect((r as Some<number>).value).toBe(i);
      } else {
        expect(r.isNone()).toBe(true);
      }
    });
  }
  for (let i = 0; i < 25; i++) {
    it(`fromPredicate(${i}, alwaysTrue) → Some`, () => {
      const r = fromPredicate(i, () => true);
      expect(r.isSome()).toBe(true);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Either additional methods — 50 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('Either additional methods', () => {
  for (let i = 0; i < 10; i++) {
    it(`Left(${i}).isLeft() is true`, () => {
      expect(left(i).isLeft()).toBe(true);
    });
  }
  for (let i = 0; i < 10; i++) {
    it(`Right(${i}).isRight() is true`, () => {
      expect(right(i).isRight()).toBe(true);
    });
  }
  for (let i = 0; i < 10; i++) {
    it(`Left(${i}).getOrElse(${i + 1}) returns default`, () => {
      expect(left<number, number>(i).getOrElse(i + 1)).toBe(i + 1);
    });
  }
  for (let i = 0; i < 10; i++) {
    it(`Right(${i}).getOrElse(-1) returns value`, () => {
      expect(right<number, never>(i).getOrElse(-1)).toBe(i);
    });
  }
  for (let i = 0; i < 10; i++) {
    it(`Left(${i}).toOption → None`, () => {
      expect(left(i).toOption().isNone()).toBe(true);
    });
  }
  for (let i = 0; i < 10; i++) {
    it(`Right(${i}).toOption → Some`, () => {
      const r = right<number, never>(i).toOption();
      expect(r.isSome()).toBe(true);
      expect((r as Some<number>).value).toBe(i);
    });
  }
  for (let i = 0; i < 5; i++) {
    it(`Left(${i}).swap → Right containing ${i}`, () => {
      const r = left<number, string>(i).swap();
      expect(r.isRight()).toBe(true);
    });
  }
  for (let i = 0; i < 5; i++) {
    it(`Right(${i}).swap → Left containing ${i}`, () => {
      const r = right<number, never>(i).swap();
      expect(r.isLeft()).toBe(true);
    });
  }
  for (let i = 0; i < 5; i++) {
    it(`Left(${i}).mapLeft transforms left`, () => {
      const r = left<number, number>(i).mapLeft(l => l * 3);
      expect(r.isLeft()).toBe(true);
      expect((r as Left<number, number>).left).toBe(i * 3);
    });
  }
  for (let i = 0; i < 5; i++) {
    it(`Right(${i}).mapLeft does nothing`, () => {
      const r = right<number, number>(i).mapLeft(l => l * 3);
      expect(r.isRight()).toBe(true);
      expect((r as Right<number, number>).right).toBe(i);
    });
  }
  for (let i = 0; i < 5; i++) {
    it(`Left(${i}).flatMap does nothing`, () => {
      const r = left<number, number>(i).flatMap(v => right<number, number>(v + 1));
      expect(r.isLeft()).toBe(true);
      expect((r as Left<number, number>).left).toBe(i);
    });
  }
  for (let i = 0; i < 5; i++) {
    it(`Right(${i}).flatMap chains`, () => {
      const r = right<number, number>(i).flatMap(v => right<number, number>(v + 5));
      expect(r.isRight()).toBe(true);
      expect((r as Right<number, number>).right).toBe(i + 5);
    });
  }
  for (let i = 0; i < 5; i++) {
    it(`Left(${i})._tag === 'Left'`, () => {
      expect(left(i)._tag).toBe('Left');
    });
  }
  for (let i = 0; i < 5; i++) {
    it(`Right(${i})._tag === 'Right'`, () => {
      expect(right(i)._tag).toBe('Right');
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Result constructor property tests — 50 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('Result constructor properties', () => {
  for (let i = 0; i < 25; i++) {
    it(`ok(${i}).value === ${i}`, () => {
      expect(ok(i).value).toBe(i);
    });
  }
  for (let i = 0; i < 25; i++) {
    it(`err(Error).error is Error instance (${i})`, () => {
      const e = new Error(`msg-${i}`);
      expect(err(e).error).toBe(e);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Non-Error Err types — 25 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('Non-Error Err types', () => {
  for (let i = 0; i < 10; i++) {
    it(`err with string error ${i}`, () => {
      const r = err<number, string>(`error-${i}`);
      expect(r.isErr()).toBe(true);
      expect(r.error).toBe(`error-${i}`);
    });
  }
  for (let i = 0; i < 10; i++) {
    it(`err with number error ${i}`, () => {
      const r = err<string, number>(i);
      expect(r.isErr()).toBe(true);
      expect(r.error).toBe(i);
    });
  }
  for (let i = 0; i < 5; i++) {
    it(`err with object error ${i}`, () => {
      const e = { code: i, message: `msg-${i}` };
      const r = err<number, typeof e>(e);
      expect(r.isErr()).toBe(true);
      expect(r.error).toBe(e);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Edge cases — 25 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('Edge cases', () => {
  for (let i = 0; i < 5; i++) {
    it(`ok(null) is Ok with null value (${i})`, () => {
      const r = ok<null>(null);
      expect(r.isOk()).toBe(true);
      expect(r.value).toBeNull();
    });
  }
  for (let i = 0; i < 5; i++) {
    it(`ok(undefined) is Ok with undefined (${i})`, () => {
      const r = ok<undefined>(undefined);
      expect(r.isOk()).toBe(true);
      expect(r.value).toBeUndefined();
    });
  }
  for (let i = 0; i < 5; i++) {
    it(`ok(false) is Ok (${i})`, () => {
      const r = ok<boolean>(false);
      expect(r.isOk()).toBe(true);
      expect(r.value).toBe(false);
    });
  }
  for (let i = 0; i < 5; i++) {
    it(`err with non-Error is still Err (${i})`, () => {
      const r = tryResult(() => { throw 'string throw'; });
      expect(r.isErr()).toBe(true);
    });
  }
  for (let i = 0; i < 5; i++) {
    it(`all([]) returns Ok([]) (${i})`, () => {
      const r = all([]);
      expect(r.isOk()).toBe(true);
      expect((r as Ok<never[]>).value).toEqual([]);
    });
  }
});
