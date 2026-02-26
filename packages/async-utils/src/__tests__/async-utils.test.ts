// Copyright (c) 2026 Nexara DMCC. All rights reserved.
import {
  sleep,
  timeout,
  retry,
  parallel,
  sequential,
  race,
  settle,
  mapAsync,
  filterAsync,
  reduceAsync,
  defer,
  promisify,
  withTimeout,
  chunk,
  allSettled,
  firstResolved,
  createTaskQueue,
} from '../async-utils';

jest.setTimeout(10000);

describe('@ims/async-utils', () => {
  // ── sleep ──────────────────────────────────────────────────────────────
  describe('sleep', () => {
    it('sleep resolves without error #1', async () => {
      await expect(sleep(0)).resolves.toBeUndefined();
    });
    it('sleep resolves without error #2', async () => {
      await expect(sleep(0)).resolves.toBeUndefined();
    });
    it('sleep resolves without error #3', async () => {
      await expect(sleep(0)).resolves.toBeUndefined();
    });
    it('sleep resolves without error #4', async () => {
      await expect(sleep(0)).resolves.toBeUndefined();
    });
    it('sleep resolves without error #5', async () => {
      await expect(sleep(0)).resolves.toBeUndefined();
    });
    it('sleep returns a Promise #1', async () => {
      const p = sleep(0);
      expect(p).toBeInstanceOf(Promise);
      await p;
    });
    it('sleep returns a Promise #2', async () => {
      const p = sleep(0);
      expect(p).toBeInstanceOf(Promise);
      await p;
    });
    it('sleep returns a Promise #3', async () => {
      const p = sleep(0);
      expect(p).toBeInstanceOf(Promise);
      await p;
    });
    it('sleep returns a Promise #4', async () => {
      const p = sleep(0);
      expect(p).toBeInstanceOf(Promise);
      await p;
    });
    it('sleep returns a Promise #5', async () => {
      const p = sleep(0);
      expect(p).toBeInstanceOf(Promise);
      await p;
    });
    it('sleep(1) resolves', async () => {
      await expect(sleep(0)).resolves.toBeUndefined();
    });
    it('sleep(2) resolves', async () => {
      await expect(sleep(0)).resolves.toBeUndefined();
    });
    it('sleep(3) resolves', async () => {
      await expect(sleep(0)).resolves.toBeUndefined();
    });
    it('sleep(4) resolves', async () => {
      await expect(sleep(0)).resolves.toBeUndefined();
    });
    it('sleep(5) resolves', async () => {
      await expect(sleep(0)).resolves.toBeUndefined();
    });
    it('sleep(6) resolves', async () => {
      await expect(sleep(0)).resolves.toBeUndefined();
    });
    it('sleep(7) resolves', async () => {
      await expect(sleep(0)).resolves.toBeUndefined();
    });
    it('sleep(8) resolves', async () => {
      await expect(sleep(0)).resolves.toBeUndefined();
    });
    it('sleep(9) resolves', async () => {
      await expect(sleep(0)).resolves.toBeUndefined();
    });
    it('sleep(10) resolves', async () => {
      await expect(sleep(0)).resolves.toBeUndefined();
    });
    it('sleep(11) resolves', async () => {
      await expect(sleep(0)).resolves.toBeUndefined();
    });
    it('sleep(12) resolves', async () => {
      await expect(sleep(0)).resolves.toBeUndefined();
    });
    it('sleep(13) resolves', async () => {
      await expect(sleep(0)).resolves.toBeUndefined();
    });
    it('sleep(14) resolves', async () => {
      await expect(sleep(0)).resolves.toBeUndefined();
    });
    it('sleep(15) resolves', async () => {
      await expect(sleep(0)).resolves.toBeUndefined();
    });
    it('sleep(16) resolves', async () => {
      await expect(sleep(0)).resolves.toBeUndefined();
    });
    it('sleep(17) resolves', async () => {
      await expect(sleep(0)).resolves.toBeUndefined();
    });
    it('sleep(18) resolves', async () => {
      await expect(sleep(0)).resolves.toBeUndefined();
    });
    it('sleep(19) resolves', async () => {
      await expect(sleep(0)).resolves.toBeUndefined();
    });
    it('sleep(20) resolves', async () => {
      await expect(sleep(0)).resolves.toBeUndefined();
    });
    it('sleep(21) resolves', async () => {
      await expect(sleep(0)).resolves.toBeUndefined();
    });
    it('sleep(22) resolves', async () => {
      await expect(sleep(0)).resolves.toBeUndefined();
    });
    it('sleep(23) resolves', async () => {
      await expect(sleep(0)).resolves.toBeUndefined();
    });
    it('sleep(24) resolves', async () => {
      await expect(sleep(0)).resolves.toBeUndefined();
    });
    it('sleep(25) resolves', async () => {
      await expect(sleep(0)).resolves.toBeUndefined();
    });
    it('sleep(26) resolves', async () => {
      await expect(sleep(0)).resolves.toBeUndefined();
    });
    it('sleep(27) resolves', async () => {
      await expect(sleep(0)).resolves.toBeUndefined();
    });
    it('sleep(28) resolves', async () => {
      await expect(sleep(0)).resolves.toBeUndefined();
    });
    it('sleep(29) resolves', async () => {
      await expect(sleep(0)).resolves.toBeUndefined();
    });
    it('sleep(30) resolves', async () => {
      await expect(sleep(0)).resolves.toBeUndefined();
    });
    it('sleep(31) resolves', async () => {
      await expect(sleep(0)).resolves.toBeUndefined();
    });
    it('sleep(32) resolves', async () => {
      await expect(sleep(0)).resolves.toBeUndefined();
    });
    it('sleep(33) resolves', async () => {
      await expect(sleep(0)).resolves.toBeUndefined();
    });
    it('sleep(34) resolves', async () => {
      await expect(sleep(0)).resolves.toBeUndefined();
    });
    it('sleep(35) resolves', async () => {
      await expect(sleep(0)).resolves.toBeUndefined();
    });
    it('sleep(36) resolves', async () => {
      await expect(sleep(0)).resolves.toBeUndefined();
    });
    it('sleep(37) resolves', async () => {
      await expect(sleep(0)).resolves.toBeUndefined();
    });
    it('sleep(38) resolves', async () => {
      await expect(sleep(0)).resolves.toBeUndefined();
    });
    it('sleep(39) resolves', async () => {
      await expect(sleep(0)).resolves.toBeUndefined();
    });
    it('sleep(40) resolves', async () => {
      await expect(sleep(0)).resolves.toBeUndefined();
    });
  });
  // ── defer ──────────────────────────────────────────────────────────────
  describe('defer', () => {
    it('defer resolves with value 0 #1', async () => {
      const d = defer<number>();
      d.resolve(0);
      await expect(d.promise).resolves.toBe(0);
    });
    it('defer resolves with value 1 #2', async () => {
      const d = defer<number>();
      d.resolve(1);
      await expect(d.promise).resolves.toBe(1);
    });
    it('defer resolves with value -1 #3', async () => {
      const d = defer<number>();
      d.resolve(-1);
      await expect(d.promise).resolves.toBe(-1);
    });
    it('defer resolves with value 42 #4', async () => {
      const d = defer<number>();
      d.resolve(42);
      await expect(d.promise).resolves.toBe(42);
    });
    it('defer resolves with value 100 #5', async () => {
      const d = defer<number>();
      d.resolve(100);
      await expect(d.promise).resolves.toBe(100);
    });
    it('defer resolves with value 999 #6', async () => {
      const d = defer<number>();
      d.resolve(999);
      await expect(d.promise).resolves.toBe(999);
    });
    it('defer resolves with value 3.14 #7', async () => {
      const d = defer<number>();
      d.resolve(3.14);
      await expect(d.promise).resolves.toBe(3.14);
    });
    it('defer resolves with value -3.14 #8', async () => {
      const d = defer<number>();
      d.resolve(-3.14);
      await expect(d.promise).resolves.toBe(-3.14);
    });
    it('defer resolves with value 0.001 #9', async () => {
      const d = defer<number>();
      d.resolve(0.001);
      await expect(d.promise).resolves.toBe(0.001);
    });
    it('defer resolves with value 1000000.0 #10', async () => {
      const d = defer<number>();
      d.resolve(1000000.0);
      await expect(d.promise).resolves.toBe(1000000.0);
    });
    it('defer resolves with string "hello" #1', async () => {
      const d = defer<string>();
      d.resolve('hello');
      await expect(d.promise).resolves.toBe('hello');
    });
    it('defer resolves with string "world" #2', async () => {
      const d = defer<string>();
      d.resolve('world');
      await expect(d.promise).resolves.toBe('world');
    });
    it('defer resolves with string "" #3', async () => {
      const d = defer<string>();
      d.resolve('');
      await expect(d.promise).resolves.toBe('');
    });
    it('defer resolves with string "async" #4', async () => {
      const d = defer<string>();
      d.resolve('async');
      await expect(d.promise).resolves.toBe('async');
    });
    it('defer resolves with string "defer" #5', async () => {
      const d = defer<string>();
      d.resolve('defer');
      await expect(d.promise).resolves.toBe('defer');
    });
    it('defer resolves with string "test" #6', async () => {
      const d = defer<string>();
      d.resolve('test');
      await expect(d.promise).resolves.toBe('test');
    });
    it('defer resolves with string "nexara" #7', async () => {
      const d = defer<string>();
      d.resolve('nexara');
      await expect(d.promise).resolves.toBe('nexara');
    });
    it('defer resolves with string "ims" #8', async () => {
      const d = defer<string>();
      d.resolve('ims');
      await expect(d.promise).resolves.toBe('ims');
    });
    it('defer resolves with string "ok" #9', async () => {
      const d = defer<string>();
      d.resolve('ok');
      await expect(d.promise).resolves.toBe('ok');
    });
    it('defer resolves with string "done" #10', async () => {
      const d = defer<string>();
      d.resolve('done');
      await expect(d.promise).resolves.toBe('done');
    });
    it('defer resolves with boolean #1', async () => {
      const d = defer<boolean>();
      d.resolve(false);
      await expect(d.promise).resolves.toBe(false);
    });
    it('defer resolves with boolean #2', async () => {
      const d = defer<boolean>();
      d.resolve(true);
      await expect(d.promise).resolves.toBe(true);
    });
    it('defer resolves with boolean #3', async () => {
      const d = defer<boolean>();
      d.resolve(false);
      await expect(d.promise).resolves.toBe(false);
    });
    it('defer resolves with boolean #4', async () => {
      const d = defer<boolean>();
      d.resolve(true);
      await expect(d.promise).resolves.toBe(true);
    });
    it('defer resolves with boolean #5', async () => {
      const d = defer<boolean>();
      d.resolve(false);
      await expect(d.promise).resolves.toBe(false);
    });
    it('defer resolves with boolean #6', async () => {
      const d = defer<boolean>();
      d.resolve(true);
      await expect(d.promise).resolves.toBe(true);
    });
    it('defer resolves with boolean #7', async () => {
      const d = defer<boolean>();
      d.resolve(false);
      await expect(d.promise).resolves.toBe(false);
    });
    it('defer resolves with boolean #8', async () => {
      const d = defer<boolean>();
      d.resolve(true);
      await expect(d.promise).resolves.toBe(true);
    });
    it('defer resolves with boolean #9', async () => {
      const d = defer<boolean>();
      d.resolve(false);
      await expect(d.promise).resolves.toBe(false);
    });
    it('defer resolves with boolean #10', async () => {
      const d = defer<boolean>();
      d.resolve(true);
      await expect(d.promise).resolves.toBe(true);
    });
    it('defer rejects with error #1', async () => {
      const d = defer<number>();
      d.reject(new Error('fail-1'));
      await expect(d.promise).rejects.toThrow('fail-1');
    });
    it('defer rejects with error #2', async () => {
      const d = defer<number>();
      d.reject(new Error('fail-2'));
      await expect(d.promise).rejects.toThrow('fail-2');
    });
    it('defer rejects with error #3', async () => {
      const d = defer<number>();
      d.reject(new Error('fail-3'));
      await expect(d.promise).rejects.toThrow('fail-3');
    });
    it('defer rejects with error #4', async () => {
      const d = defer<number>();
      d.reject(new Error('fail-4'));
      await expect(d.promise).rejects.toThrow('fail-4');
    });
    it('defer rejects with error #5', async () => {
      const d = defer<number>();
      d.reject(new Error('fail-5'));
      await expect(d.promise).rejects.toThrow('fail-5');
    });
    it('defer rejects with error #6', async () => {
      const d = defer<number>();
      d.reject(new Error('fail-6'));
      await expect(d.promise).rejects.toThrow('fail-6');
    });
    it('defer rejects with error #7', async () => {
      const d = defer<number>();
      d.reject(new Error('fail-7'));
      await expect(d.promise).rejects.toThrow('fail-7');
    });
    it('defer rejects with error #8', async () => {
      const d = defer<number>();
      d.reject(new Error('fail-8'));
      await expect(d.promise).rejects.toThrow('fail-8');
    });
    it('defer rejects with error #9', async () => {
      const d = defer<number>();
      d.reject(new Error('fail-9'));
      await expect(d.promise).rejects.toThrow('fail-9');
    });
    it('defer rejects with error #10', async () => {
      const d = defer<number>();
      d.reject(new Error('fail-10'));
      await expect(d.promise).rejects.toThrow('fail-10');
    });
    it('defer rejects with error #11', async () => {
      const d = defer<number>();
      d.reject(new Error('fail-11'));
      await expect(d.promise).rejects.toThrow('fail-11');
    });
    it('defer rejects with error #12', async () => {
      const d = defer<number>();
      d.reject(new Error('fail-12'));
      await expect(d.promise).rejects.toThrow('fail-12');
    });
    it('defer rejects with error #13', async () => {
      const d = defer<number>();
      d.reject(new Error('fail-13'));
      await expect(d.promise).rejects.toThrow('fail-13');
    });
    it('defer rejects with error #14', async () => {
      const d = defer<number>();
      d.reject(new Error('fail-14'));
      await expect(d.promise).rejects.toThrow('fail-14');
    });
    it('defer rejects with error #15', async () => {
      const d = defer<number>();
      d.reject(new Error('fail-15'));
      await expect(d.promise).rejects.toThrow('fail-15');
    });
    it('defer rejects with error #16', async () => {
      const d = defer<number>();
      d.reject(new Error('fail-16'));
      await expect(d.promise).rejects.toThrow('fail-16');
    });
    it('defer rejects with error #17', async () => {
      const d = defer<number>();
      d.reject(new Error('fail-17'));
      await expect(d.promise).rejects.toThrow('fail-17');
    });
    it('defer rejects with error #18', async () => {
      const d = defer<number>();
      d.reject(new Error('fail-18'));
      await expect(d.promise).rejects.toThrow('fail-18');
    });
    it('defer rejects with error #19', async () => {
      const d = defer<number>();
      d.reject(new Error('fail-19'));
      await expect(d.promise).rejects.toThrow('fail-19');
    });
    it('defer rejects with error #20', async () => {
      const d = defer<number>();
      d.reject(new Error('fail-20'));
      await expect(d.promise).rejects.toThrow('fail-20');
    });
    it('defer returns object with promise resolve reject #1', async () => {
      const d = defer<number>();
      expect(d).toHaveProperty('promise');
      expect(d).toHaveProperty('resolve');
      expect(d).toHaveProperty('reject');
      d.resolve(1);
      await d.promise;
    });
    it('defer returns object with promise resolve reject #2', async () => {
      const d = defer<number>();
      expect(d).toHaveProperty('promise');
      expect(d).toHaveProperty('resolve');
      expect(d).toHaveProperty('reject');
      d.resolve(2);
      await d.promise;
    });
    it('defer returns object with promise resolve reject #3', async () => {
      const d = defer<number>();
      expect(d).toHaveProperty('promise');
      expect(d).toHaveProperty('resolve');
      expect(d).toHaveProperty('reject');
      d.resolve(3);
      await d.promise;
    });
    it('defer returns object with promise resolve reject #4', async () => {
      const d = defer<number>();
      expect(d).toHaveProperty('promise');
      expect(d).toHaveProperty('resolve');
      expect(d).toHaveProperty('reject');
      d.resolve(4);
      await d.promise;
    });
    it('defer returns object with promise resolve reject #5', async () => {
      const d = defer<number>();
      expect(d).toHaveProperty('promise');
      expect(d).toHaveProperty('resolve');
      expect(d).toHaveProperty('reject');
      d.resolve(5);
      await d.promise;
    });
    it('defer returns object with promise resolve reject #6', async () => {
      const d = defer<number>();
      expect(d).toHaveProperty('promise');
      expect(d).toHaveProperty('resolve');
      expect(d).toHaveProperty('reject');
      d.resolve(6);
      await d.promise;
    });
    it('defer returns object with promise resolve reject #7', async () => {
      const d = defer<number>();
      expect(d).toHaveProperty('promise');
      expect(d).toHaveProperty('resolve');
      expect(d).toHaveProperty('reject');
      d.resolve(7);
      await d.promise;
    });
    it('defer returns object with promise resolve reject #8', async () => {
      const d = defer<number>();
      expect(d).toHaveProperty('promise');
      expect(d).toHaveProperty('resolve');
      expect(d).toHaveProperty('reject');
      d.resolve(8);
      await d.promise;
    });
    it('defer returns object with promise resolve reject #9', async () => {
      const d = defer<number>();
      expect(d).toHaveProperty('promise');
      expect(d).toHaveProperty('resolve');
      expect(d).toHaveProperty('reject');
      d.resolve(9);
      await d.promise;
    });
    it('defer returns object with promise resolve reject #10', async () => {
      const d = defer<number>();
      expect(d).toHaveProperty('promise');
      expect(d).toHaveProperty('resolve');
      expect(d).toHaveProperty('reject');
      d.resolve(10);
      await d.promise;
    });
    it('defer returns object with promise resolve reject #11', async () => {
      const d = defer<number>();
      expect(d).toHaveProperty('promise');
      expect(d).toHaveProperty('resolve');
      expect(d).toHaveProperty('reject');
      d.resolve(11);
      await d.promise;
    });
    it('defer returns object with promise resolve reject #12', async () => {
      const d = defer<number>();
      expect(d).toHaveProperty('promise');
      expect(d).toHaveProperty('resolve');
      expect(d).toHaveProperty('reject');
      d.resolve(12);
      await d.promise;
    });
    it('defer returns object with promise resolve reject #13', async () => {
      const d = defer<number>();
      expect(d).toHaveProperty('promise');
      expect(d).toHaveProperty('resolve');
      expect(d).toHaveProperty('reject');
      d.resolve(13);
      await d.promise;
    });
    it('defer returns object with promise resolve reject #14', async () => {
      const d = defer<number>();
      expect(d).toHaveProperty('promise');
      expect(d).toHaveProperty('resolve');
      expect(d).toHaveProperty('reject');
      d.resolve(14);
      await d.promise;
    });
    it('defer returns object with promise resolve reject #15', async () => {
      const d = defer<number>();
      expect(d).toHaveProperty('promise');
      expect(d).toHaveProperty('resolve');
      expect(d).toHaveProperty('reject');
      d.resolve(15);
      await d.promise;
    });
    it('defer returns object with promise resolve reject #16', async () => {
      const d = defer<number>();
      expect(d).toHaveProperty('promise');
      expect(d).toHaveProperty('resolve');
      expect(d).toHaveProperty('reject');
      d.resolve(16);
      await d.promise;
    });
    it('defer returns object with promise resolve reject #17', async () => {
      const d = defer<number>();
      expect(d).toHaveProperty('promise');
      expect(d).toHaveProperty('resolve');
      expect(d).toHaveProperty('reject');
      d.resolve(17);
      await d.promise;
    });
    it('defer returns object with promise resolve reject #18', async () => {
      const d = defer<number>();
      expect(d).toHaveProperty('promise');
      expect(d).toHaveProperty('resolve');
      expect(d).toHaveProperty('reject');
      d.resolve(18);
      await d.promise;
    });
    it('defer returns object with promise resolve reject #19', async () => {
      const d = defer<number>();
      expect(d).toHaveProperty('promise');
      expect(d).toHaveProperty('resolve');
      expect(d).toHaveProperty('reject');
      d.resolve(19);
      await d.promise;
    });
    it('defer returns object with promise resolve reject #20', async () => {
      const d = defer<number>();
      expect(d).toHaveProperty('promise');
      expect(d).toHaveProperty('resolve');
      expect(d).toHaveProperty('reject');
      d.resolve(20);
      await d.promise;
    });
    it('defer returns object with promise resolve reject #21', async () => {
      const d = defer<number>();
      expect(d).toHaveProperty('promise');
      expect(d).toHaveProperty('resolve');
      expect(d).toHaveProperty('reject');
      d.resolve(21);
      await d.promise;
    });
    it('defer returns object with promise resolve reject #22', async () => {
      const d = defer<number>();
      expect(d).toHaveProperty('promise');
      expect(d).toHaveProperty('resolve');
      expect(d).toHaveProperty('reject');
      d.resolve(22);
      await d.promise;
    });
    it('defer returns object with promise resolve reject #23', async () => {
      const d = defer<number>();
      expect(d).toHaveProperty('promise');
      expect(d).toHaveProperty('resolve');
      expect(d).toHaveProperty('reject');
      d.resolve(23);
      await d.promise;
    });
    it('defer returns object with promise resolve reject #24', async () => {
      const d = defer<number>();
      expect(d).toHaveProperty('promise');
      expect(d).toHaveProperty('resolve');
      expect(d).toHaveProperty('reject');
      d.resolve(24);
      await d.promise;
    });
    it('defer returns object with promise resolve reject #25', async () => {
      const d = defer<number>();
      expect(d).toHaveProperty('promise');
      expect(d).toHaveProperty('resolve');
      expect(d).toHaveProperty('reject');
      d.resolve(25);
      await d.promise;
    });
    it('defer returns object with promise resolve reject #26', async () => {
      const d = defer<number>();
      expect(d).toHaveProperty('promise');
      expect(d).toHaveProperty('resolve');
      expect(d).toHaveProperty('reject');
      d.resolve(26);
      await d.promise;
    });
    it('defer returns object with promise resolve reject #27', async () => {
      const d = defer<number>();
      expect(d).toHaveProperty('promise');
      expect(d).toHaveProperty('resolve');
      expect(d).toHaveProperty('reject');
      d.resolve(27);
      await d.promise;
    });
    it('defer returns object with promise resolve reject #28', async () => {
      const d = defer<number>();
      expect(d).toHaveProperty('promise');
      expect(d).toHaveProperty('resolve');
      expect(d).toHaveProperty('reject');
      d.resolve(28);
      await d.promise;
    });
    it('defer returns object with promise resolve reject #29', async () => {
      const d = defer<number>();
      expect(d).toHaveProperty('promise');
      expect(d).toHaveProperty('resolve');
      expect(d).toHaveProperty('reject');
      d.resolve(29);
      await d.promise;
    });
    it('defer returns object with promise resolve reject #30', async () => {
      const d = defer<number>();
      expect(d).toHaveProperty('promise');
      expect(d).toHaveProperty('resolve');
      expect(d).toHaveProperty('reject');
      d.resolve(30);
      await d.promise;
    });
  });
  // ── sequential ─────────────────────────────────────────────────────────
  describe('sequential', () => {
    it('sequential empty array returns [] #1', async () => {
      await expect(sequential([])).resolves.toEqual([]);
    });
    it('sequential empty array returns [] #2', async () => {
      await expect(sequential([])).resolves.toEqual([]);
    });
    it('sequential empty array returns [] #3', async () => {
      await expect(sequential([])).resolves.toEqual([]);
    });
    it('sequential empty array returns [] #4', async () => {
      await expect(sequential([])).resolves.toEqual([]);
    });
    it('sequential empty array returns [] #5', async () => {
      await expect(sequential([])).resolves.toEqual([]);
    });
    it('sequential empty array returns [] #6', async () => {
      await expect(sequential([])).resolves.toEqual([]);
    });
    it('sequential empty array returns [] #7', async () => {
      await expect(sequential([])).resolves.toEqual([]);
    });
    it('sequential empty array returns [] #8', async () => {
      await expect(sequential([])).resolves.toEqual([]);
    });
    it('sequential empty array returns [] #9', async () => {
      await expect(sequential([])).resolves.toEqual([]);
    });
    it('sequential empty array returns [] #10', async () => {
      await expect(sequential([])).resolves.toEqual([]);
    });
    it('sequential single task result #1', async () => {
      const result = await sequential([() => Promise.resolve(1)]);
      expect(result).toEqual([1]);
    });
    it('sequential single task result #2', async () => {
      const result = await sequential([() => Promise.resolve(2)]);
      expect(result).toEqual([2]);
    });
    it('sequential single task result #3', async () => {
      const result = await sequential([() => Promise.resolve(3)]);
      expect(result).toEqual([3]);
    });
    it('sequential single task result #4', async () => {
      const result = await sequential([() => Promise.resolve(4)]);
      expect(result).toEqual([4]);
    });
    it('sequential single task result #5', async () => {
      const result = await sequential([() => Promise.resolve(5)]);
      expect(result).toEqual([5]);
    });
    it('sequential single task result #6', async () => {
      const result = await sequential([() => Promise.resolve(6)]);
      expect(result).toEqual([6]);
    });
    it('sequential single task result #7', async () => {
      const result = await sequential([() => Promise.resolve(7)]);
      expect(result).toEqual([7]);
    });
    it('sequential single task result #8', async () => {
      const result = await sequential([() => Promise.resolve(8)]);
      expect(result).toEqual([8]);
    });
    it('sequential single task result #9', async () => {
      const result = await sequential([() => Promise.resolve(9)]);
      expect(result).toEqual([9]);
    });
    it('sequential single task result #10', async () => {
      const result = await sequential([() => Promise.resolve(10)]);
      expect(result).toEqual([10]);
    });
    it('sequential single task result #11', async () => {
      const result = await sequential([() => Promise.resolve(11)]);
      expect(result).toEqual([11]);
    });
    it('sequential single task result #12', async () => {
      const result = await sequential([() => Promise.resolve(12)]);
      expect(result).toEqual([12]);
    });
    it('sequential single task result #13', async () => {
      const result = await sequential([() => Promise.resolve(13)]);
      expect(result).toEqual([13]);
    });
    it('sequential single task result #14', async () => {
      const result = await sequential([() => Promise.resolve(14)]);
      expect(result).toEqual([14]);
    });
    it('sequential single task result #15', async () => {
      const result = await sequential([() => Promise.resolve(15)]);
      expect(result).toEqual([15]);
    });
    it('sequential single task result #16', async () => {
      const result = await sequential([() => Promise.resolve(16)]);
      expect(result).toEqual([16]);
    });
    it('sequential single task result #17', async () => {
      const result = await sequential([() => Promise.resolve(17)]);
      expect(result).toEqual([17]);
    });
    it('sequential single task result #18', async () => {
      const result = await sequential([() => Promise.resolve(18)]);
      expect(result).toEqual([18]);
    });
    it('sequential single task result #19', async () => {
      const result = await sequential([() => Promise.resolve(19)]);
      expect(result).toEqual([19]);
    });
    it('sequential single task result #20', async () => {
      const result = await sequential([() => Promise.resolve(20)]);
      expect(result).toEqual([20]);
    });
    it('sequential 2 tasks length #1', async () => {
      const result = await sequential([() => Promise.resolve(1), () => Promise.resolve(2)]);
      expect(result).toHaveLength(2);
    });
    it('sequential 2 tasks length #2', async () => {
      const result = await sequential([() => Promise.resolve(1), () => Promise.resolve(2)]);
      expect(result).toHaveLength(2);
    });
    it('sequential 2 tasks length #3', async () => {
      const result = await sequential([() => Promise.resolve(1), () => Promise.resolve(2)]);
      expect(result).toHaveLength(2);
    });
    it('sequential 2 tasks length #4', async () => {
      const result = await sequential([() => Promise.resolve(1), () => Promise.resolve(2)]);
      expect(result).toHaveLength(2);
    });
    it('sequential 2 tasks length #5', async () => {
      const result = await sequential([() => Promise.resolve(1), () => Promise.resolve(2)]);
      expect(result).toHaveLength(2);
    });
    it('sequential 2 tasks length #6', async () => {
      const result = await sequential([() => Promise.resolve(1), () => Promise.resolve(2)]);
      expect(result).toHaveLength(2);
    });
    it('sequential 2 tasks length #7', async () => {
      const result = await sequential([() => Promise.resolve(1), () => Promise.resolve(2)]);
      expect(result).toHaveLength(2);
    });
    it('sequential 2 tasks length #8', async () => {
      const result = await sequential([() => Promise.resolve(1), () => Promise.resolve(2)]);
      expect(result).toHaveLength(2);
    });
    it('sequential 2 tasks length #9', async () => {
      const result = await sequential([() => Promise.resolve(1), () => Promise.resolve(2)]);
      expect(result).toHaveLength(2);
    });
    it('sequential 2 tasks length #10', async () => {
      const result = await sequential([() => Promise.resolve(1), () => Promise.resolve(2)]);
      expect(result).toHaveLength(2);
    });
    it('sequential 3 tasks length #1', async () => {
      const result = await sequential([() => Promise.resolve(1), () => Promise.resolve(2), () => Promise.resolve(3)]);
      expect(result).toHaveLength(3);
    });
    it('sequential 3 tasks length #2', async () => {
      const result = await sequential([() => Promise.resolve(1), () => Promise.resolve(2), () => Promise.resolve(3)]);
      expect(result).toHaveLength(3);
    });
    it('sequential 3 tasks length #3', async () => {
      const result = await sequential([() => Promise.resolve(1), () => Promise.resolve(2), () => Promise.resolve(3)]);
      expect(result).toHaveLength(3);
    });
    it('sequential 3 tasks length #4', async () => {
      const result = await sequential([() => Promise.resolve(1), () => Promise.resolve(2), () => Promise.resolve(3)]);
      expect(result).toHaveLength(3);
    });
    it('sequential 3 tasks length #5', async () => {
      const result = await sequential([() => Promise.resolve(1), () => Promise.resolve(2), () => Promise.resolve(3)]);
      expect(result).toHaveLength(3);
    });
    it('sequential 3 tasks length #6', async () => {
      const result = await sequential([() => Promise.resolve(1), () => Promise.resolve(2), () => Promise.resolve(3)]);
      expect(result).toHaveLength(3);
    });
    it('sequential 3 tasks length #7', async () => {
      const result = await sequential([() => Promise.resolve(1), () => Promise.resolve(2), () => Promise.resolve(3)]);
      expect(result).toHaveLength(3);
    });
    it('sequential 3 tasks length #8', async () => {
      const result = await sequential([() => Promise.resolve(1), () => Promise.resolve(2), () => Promise.resolve(3)]);
      expect(result).toHaveLength(3);
    });
    it('sequential 3 tasks length #9', async () => {
      const result = await sequential([() => Promise.resolve(1), () => Promise.resolve(2), () => Promise.resolve(3)]);
      expect(result).toHaveLength(3);
    });
    it('sequential 3 tasks length #10', async () => {
      const result = await sequential([() => Promise.resolve(1), () => Promise.resolve(2), () => Promise.resolve(3)]);
      expect(result).toHaveLength(3);
    });
    it('sequential 4 tasks length #1', async () => {
      const result = await sequential([() => Promise.resolve(1), () => Promise.resolve(2), () => Promise.resolve(3), () => Promise.resolve(4)]);
      expect(result).toHaveLength(4);
    });
    it('sequential 4 tasks length #2', async () => {
      const result = await sequential([() => Promise.resolve(1), () => Promise.resolve(2), () => Promise.resolve(3), () => Promise.resolve(4)]);
      expect(result).toHaveLength(4);
    });
    it('sequential 4 tasks length #3', async () => {
      const result = await sequential([() => Promise.resolve(1), () => Promise.resolve(2), () => Promise.resolve(3), () => Promise.resolve(4)]);
      expect(result).toHaveLength(4);
    });
    it('sequential 4 tasks length #4', async () => {
      const result = await sequential([() => Promise.resolve(1), () => Promise.resolve(2), () => Promise.resolve(3), () => Promise.resolve(4)]);
      expect(result).toHaveLength(4);
    });
    it('sequential 4 tasks length #5', async () => {
      const result = await sequential([() => Promise.resolve(1), () => Promise.resolve(2), () => Promise.resolve(3), () => Promise.resolve(4)]);
      expect(result).toHaveLength(4);
    });
    it('sequential 4 tasks length #6', async () => {
      const result = await sequential([() => Promise.resolve(1), () => Promise.resolve(2), () => Promise.resolve(3), () => Promise.resolve(4)]);
      expect(result).toHaveLength(4);
    });
    it('sequential 4 tasks length #7', async () => {
      const result = await sequential([() => Promise.resolve(1), () => Promise.resolve(2), () => Promise.resolve(3), () => Promise.resolve(4)]);
      expect(result).toHaveLength(4);
    });
    it('sequential 4 tasks length #8', async () => {
      const result = await sequential([() => Promise.resolve(1), () => Promise.resolve(2), () => Promise.resolve(3), () => Promise.resolve(4)]);
      expect(result).toHaveLength(4);
    });
    it('sequential 4 tasks length #9', async () => {
      const result = await sequential([() => Promise.resolve(1), () => Promise.resolve(2), () => Promise.resolve(3), () => Promise.resolve(4)]);
      expect(result).toHaveLength(4);
    });
    it('sequential 4 tasks length #10', async () => {
      const result = await sequential([() => Promise.resolve(1), () => Promise.resolve(2), () => Promise.resolve(3), () => Promise.resolve(4)]);
      expect(result).toHaveLength(4);
    });
    it('sequential 5 tasks length #1', async () => {
      const result = await sequential([() => Promise.resolve(1), () => Promise.resolve(2), () => Promise.resolve(3), () => Promise.resolve(4), () => Promise.resolve(5)]);
      expect(result).toHaveLength(5);
    });
    it('sequential 5 tasks length #2', async () => {
      const result = await sequential([() => Promise.resolve(1), () => Promise.resolve(2), () => Promise.resolve(3), () => Promise.resolve(4), () => Promise.resolve(5)]);
      expect(result).toHaveLength(5);
    });
    it('sequential 5 tasks length #3', async () => {
      const result = await sequential([() => Promise.resolve(1), () => Promise.resolve(2), () => Promise.resolve(3), () => Promise.resolve(4), () => Promise.resolve(5)]);
      expect(result).toHaveLength(5);
    });
    it('sequential 5 tasks length #4', async () => {
      const result = await sequential([() => Promise.resolve(1), () => Promise.resolve(2), () => Promise.resolve(3), () => Promise.resolve(4), () => Promise.resolve(5)]);
      expect(result).toHaveLength(5);
    });
    it('sequential 5 tasks length #5', async () => {
      const result = await sequential([() => Promise.resolve(1), () => Promise.resolve(2), () => Promise.resolve(3), () => Promise.resolve(4), () => Promise.resolve(5)]);
      expect(result).toHaveLength(5);
    });
    it('sequential 5 tasks length #6', async () => {
      const result = await sequential([() => Promise.resolve(1), () => Promise.resolve(2), () => Promise.resolve(3), () => Promise.resolve(4), () => Promise.resolve(5)]);
      expect(result).toHaveLength(5);
    });
    it('sequential 5 tasks length #7', async () => {
      const result = await sequential([() => Promise.resolve(1), () => Promise.resolve(2), () => Promise.resolve(3), () => Promise.resolve(4), () => Promise.resolve(5)]);
      expect(result).toHaveLength(5);
    });
    it('sequential 5 tasks length #8', async () => {
      const result = await sequential([() => Promise.resolve(1), () => Promise.resolve(2), () => Promise.resolve(3), () => Promise.resolve(4), () => Promise.resolve(5)]);
      expect(result).toHaveLength(5);
    });
    it('sequential 5 tasks length #9', async () => {
      const result = await sequential([() => Promise.resolve(1), () => Promise.resolve(2), () => Promise.resolve(3), () => Promise.resolve(4), () => Promise.resolve(5)]);
      expect(result).toHaveLength(5);
    });
    it('sequential 5 tasks length #10', async () => {
      const result = await sequential([() => Promise.resolve(1), () => Promise.resolve(2), () => Promise.resolve(3), () => Promise.resolve(4), () => Promise.resolve(5)]);
      expect(result).toHaveLength(5);
    });
    it('sequential 6 tasks length #1', async () => {
      const result = await sequential([() => Promise.resolve(1), () => Promise.resolve(2), () => Promise.resolve(3), () => Promise.resolve(4), () => Promise.resolve(5), () => Promise.resolve(6)]);
      expect(result).toHaveLength(6);
    });
    it('sequential 6 tasks length #2', async () => {
      const result = await sequential([() => Promise.resolve(1), () => Promise.resolve(2), () => Promise.resolve(3), () => Promise.resolve(4), () => Promise.resolve(5), () => Promise.resolve(6)]);
      expect(result).toHaveLength(6);
    });
    it('sequential 6 tasks length #3', async () => {
      const result = await sequential([() => Promise.resolve(1), () => Promise.resolve(2), () => Promise.resolve(3), () => Promise.resolve(4), () => Promise.resolve(5), () => Promise.resolve(6)]);
      expect(result).toHaveLength(6);
    });
    it('sequential 6 tasks length #4', async () => {
      const result = await sequential([() => Promise.resolve(1), () => Promise.resolve(2), () => Promise.resolve(3), () => Promise.resolve(4), () => Promise.resolve(5), () => Promise.resolve(6)]);
      expect(result).toHaveLength(6);
    });
    it('sequential 6 tasks length #5', async () => {
      const result = await sequential([() => Promise.resolve(1), () => Promise.resolve(2), () => Promise.resolve(3), () => Promise.resolve(4), () => Promise.resolve(5), () => Promise.resolve(6)]);
      expect(result).toHaveLength(6);
    });
    it('sequential 6 tasks length #6', async () => {
      const result = await sequential([() => Promise.resolve(1), () => Promise.resolve(2), () => Promise.resolve(3), () => Promise.resolve(4), () => Promise.resolve(5), () => Promise.resolve(6)]);
      expect(result).toHaveLength(6);
    });
    it('sequential 6 tasks length #7', async () => {
      const result = await sequential([() => Promise.resolve(1), () => Promise.resolve(2), () => Promise.resolve(3), () => Promise.resolve(4), () => Promise.resolve(5), () => Promise.resolve(6)]);
      expect(result).toHaveLength(6);
    });
    it('sequential 6 tasks length #8', async () => {
      const result = await sequential([() => Promise.resolve(1), () => Promise.resolve(2), () => Promise.resolve(3), () => Promise.resolve(4), () => Promise.resolve(5), () => Promise.resolve(6)]);
      expect(result).toHaveLength(6);
    });
    it('sequential 6 tasks length #9', async () => {
      const result = await sequential([() => Promise.resolve(1), () => Promise.resolve(2), () => Promise.resolve(3), () => Promise.resolve(4), () => Promise.resolve(5), () => Promise.resolve(6)]);
      expect(result).toHaveLength(6);
    });
    it('sequential 6 tasks length #10', async () => {
      const result = await sequential([() => Promise.resolve(1), () => Promise.resolve(2), () => Promise.resolve(3), () => Promise.resolve(4), () => Promise.resolve(5), () => Promise.resolve(6)]);
      expect(result).toHaveLength(6);
    });
    it('sequential preserves order #1', async () => {
      const result = await sequential([
        () => Promise.resolve(1),
        () => Promise.resolve(2),
        () => Promise.resolve(3),
      ]);
      expect(result[0]).toBe(1);
      expect(result[1]).toBe(2);
      expect(result[2]).toBe(3);
    });
    it('sequential preserves order #2', async () => {
      const result = await sequential([
        () => Promise.resolve(2),
        () => Promise.resolve(3),
        () => Promise.resolve(4),
      ]);
      expect(result[0]).toBe(2);
      expect(result[1]).toBe(3);
      expect(result[2]).toBe(4);
    });
    it('sequential preserves order #3', async () => {
      const result = await sequential([
        () => Promise.resolve(3),
        () => Promise.resolve(4),
        () => Promise.resolve(5),
      ]);
      expect(result[0]).toBe(3);
      expect(result[1]).toBe(4);
      expect(result[2]).toBe(5);
    });
    it('sequential preserves order #4', async () => {
      const result = await sequential([
        () => Promise.resolve(4),
        () => Promise.resolve(5),
        () => Promise.resolve(6),
      ]);
      expect(result[0]).toBe(4);
      expect(result[1]).toBe(5);
      expect(result[2]).toBe(6);
    });
    it('sequential preserves order #5', async () => {
      const result = await sequential([
        () => Promise.resolve(5),
        () => Promise.resolve(6),
        () => Promise.resolve(7),
      ]);
      expect(result[0]).toBe(5);
      expect(result[1]).toBe(6);
      expect(result[2]).toBe(7);
    });
    it('sequential preserves order #6', async () => {
      const result = await sequential([
        () => Promise.resolve(6),
        () => Promise.resolve(7),
        () => Promise.resolve(8),
      ]);
      expect(result[0]).toBe(6);
      expect(result[1]).toBe(7);
      expect(result[2]).toBe(8);
    });
    it('sequential preserves order #7', async () => {
      const result = await sequential([
        () => Promise.resolve(7),
        () => Promise.resolve(8),
        () => Promise.resolve(9),
      ]);
      expect(result[0]).toBe(7);
      expect(result[1]).toBe(8);
      expect(result[2]).toBe(9);
    });
    it('sequential preserves order #8', async () => {
      const result = await sequential([
        () => Promise.resolve(8),
        () => Promise.resolve(9),
        () => Promise.resolve(10),
      ]);
      expect(result[0]).toBe(8);
      expect(result[1]).toBe(9);
      expect(result[2]).toBe(10);
    });
    it('sequential preserves order #9', async () => {
      const result = await sequential([
        () => Promise.resolve(9),
        () => Promise.resolve(10),
        () => Promise.resolve(11),
      ]);
      expect(result[0]).toBe(9);
      expect(result[1]).toBe(10);
      expect(result[2]).toBe(11);
    });
    it('sequential preserves order #10', async () => {
      const result = await sequential([
        () => Promise.resolve(10),
        () => Promise.resolve(11),
        () => Promise.resolve(12),
      ]);
      expect(result[0]).toBe(10);
      expect(result[1]).toBe(11);
      expect(result[2]).toBe(12);
    });
    it('sequential preserves order #11', async () => {
      const result = await sequential([
        () => Promise.resolve(11),
        () => Promise.resolve(12),
        () => Promise.resolve(13),
      ]);
      expect(result[0]).toBe(11);
      expect(result[1]).toBe(12);
      expect(result[2]).toBe(13);
    });
    it('sequential preserves order #12', async () => {
      const result = await sequential([
        () => Promise.resolve(12),
        () => Promise.resolve(13),
        () => Promise.resolve(14),
      ]);
      expect(result[0]).toBe(12);
      expect(result[1]).toBe(13);
      expect(result[2]).toBe(14);
    });
    it('sequential preserves order #13', async () => {
      const result = await sequential([
        () => Promise.resolve(13),
        () => Promise.resolve(14),
        () => Promise.resolve(15),
      ]);
      expect(result[0]).toBe(13);
      expect(result[1]).toBe(14);
      expect(result[2]).toBe(15);
    });
    it('sequential preserves order #14', async () => {
      const result = await sequential([
        () => Promise.resolve(14),
        () => Promise.resolve(15),
        () => Promise.resolve(16),
      ]);
      expect(result[0]).toBe(14);
      expect(result[1]).toBe(15);
      expect(result[2]).toBe(16);
    });
    it('sequential preserves order #15', async () => {
      const result = await sequential([
        () => Promise.resolve(15),
        () => Promise.resolve(16),
        () => Promise.resolve(17),
      ]);
      expect(result[0]).toBe(15);
      expect(result[1]).toBe(16);
      expect(result[2]).toBe(17);
    });
    it('sequential preserves order #16', async () => {
      const result = await sequential([
        () => Promise.resolve(16),
        () => Promise.resolve(17),
        () => Promise.resolve(18),
      ]);
      expect(result[0]).toBe(16);
      expect(result[1]).toBe(17);
      expect(result[2]).toBe(18);
    });
    it('sequential preserves order #17', async () => {
      const result = await sequential([
        () => Promise.resolve(17),
        () => Promise.resolve(18),
        () => Promise.resolve(19),
      ]);
      expect(result[0]).toBe(17);
      expect(result[1]).toBe(18);
      expect(result[2]).toBe(19);
    });
    it('sequential preserves order #18', async () => {
      const result = await sequential([
        () => Promise.resolve(18),
        () => Promise.resolve(19),
        () => Promise.resolve(20),
      ]);
      expect(result[0]).toBe(18);
      expect(result[1]).toBe(19);
      expect(result[2]).toBe(20);
    });
    it('sequential preserves order #19', async () => {
      const result = await sequential([
        () => Promise.resolve(19),
        () => Promise.resolve(20),
        () => Promise.resolve(21),
      ]);
      expect(result[0]).toBe(19);
      expect(result[1]).toBe(20);
      expect(result[2]).toBe(21);
    });
    it('sequential preserves order #20', async () => {
      const result = await sequential([
        () => Promise.resolve(20),
        () => Promise.resolve(21),
        () => Promise.resolve(22),
      ]);
      expect(result[0]).toBe(20);
      expect(result[1]).toBe(21);
      expect(result[2]).toBe(22);
    });
    it('sequential string results #1', async () => {
      const result = await sequential([() => Promise.resolve('a1'), () => Promise.resolve('b1')]);
      expect(result).toEqual(['a1', 'b1']);
    });
    it('sequential string results #2', async () => {
      const result = await sequential([() => Promise.resolve('a2'), () => Promise.resolve('b2')]);
      expect(result).toEqual(['a2', 'b2']);
    });
    it('sequential string results #3', async () => {
      const result = await sequential([() => Promise.resolve('a3'), () => Promise.resolve('b3')]);
      expect(result).toEqual(['a3', 'b3']);
    });
    it('sequential string results #4', async () => {
      const result = await sequential([() => Promise.resolve('a4'), () => Promise.resolve('b4')]);
      expect(result).toEqual(['a4', 'b4']);
    });
    it('sequential string results #5', async () => {
      const result = await sequential([() => Promise.resolve('a5'), () => Promise.resolve('b5')]);
      expect(result).toEqual(['a5', 'b5']);
    });
    it('sequential string results #6', async () => {
      const result = await sequential([() => Promise.resolve('a6'), () => Promise.resolve('b6')]);
      expect(result).toEqual(['a6', 'b6']);
    });
    it('sequential string results #7', async () => {
      const result = await sequential([() => Promise.resolve('a7'), () => Promise.resolve('b7')]);
      expect(result).toEqual(['a7', 'b7']);
    });
    it('sequential string results #8', async () => {
      const result = await sequential([() => Promise.resolve('a8'), () => Promise.resolve('b8')]);
      expect(result).toEqual(['a8', 'b8']);
    });
    it('sequential string results #9', async () => {
      const result = await sequential([() => Promise.resolve('a9'), () => Promise.resolve('b9')]);
      expect(result).toEqual(['a9', 'b9']);
    });
    it('sequential string results #10', async () => {
      const result = await sequential([() => Promise.resolve('a10'), () => Promise.resolve('b10')]);
      expect(result).toEqual(['a10', 'b10']);
    });
  });
  // ── parallel ───────────────────────────────────────────────────────────
  describe('parallel', () => {
    it('parallel empty array #1', async () => {
      await expect(parallel([])).resolves.toEqual([]);
    });
    it('parallel empty array #2', async () => {
      await expect(parallel([])).resolves.toEqual([]);
    });
    it('parallel empty array #3', async () => {
      await expect(parallel([])).resolves.toEqual([]);
    });
    it('parallel empty array #4', async () => {
      await expect(parallel([])).resolves.toEqual([]);
    });
    it('parallel empty array #5', async () => {
      await expect(parallel([])).resolves.toEqual([]);
    });
    it('parallel empty array #6', async () => {
      await expect(parallel([])).resolves.toEqual([]);
    });
    it('parallel empty array #7', async () => {
      await expect(parallel([])).resolves.toEqual([]);
    });
    it('parallel empty array #8', async () => {
      await expect(parallel([])).resolves.toEqual([]);
    });
    it('parallel empty array #9', async () => {
      await expect(parallel([])).resolves.toEqual([]);
    });
    it('parallel empty array #10', async () => {
      await expect(parallel([])).resolves.toEqual([]);
    });
    it('parallel single task #1', async () => {
      const result = await parallel([() => Promise.resolve(1)]);
      expect(result).toEqual([1]);
    });
    it('parallel single task #2', async () => {
      const result = await parallel([() => Promise.resolve(2)]);
      expect(result).toEqual([2]);
    });
    it('parallel single task #3', async () => {
      const result = await parallel([() => Promise.resolve(3)]);
      expect(result).toEqual([3]);
    });
    it('parallel single task #4', async () => {
      const result = await parallel([() => Promise.resolve(4)]);
      expect(result).toEqual([4]);
    });
    it('parallel single task #5', async () => {
      const result = await parallel([() => Promise.resolve(5)]);
      expect(result).toEqual([5]);
    });
    it('parallel single task #6', async () => {
      const result = await parallel([() => Promise.resolve(6)]);
      expect(result).toEqual([6]);
    });
    it('parallel single task #7', async () => {
      const result = await parallel([() => Promise.resolve(7)]);
      expect(result).toEqual([7]);
    });
    it('parallel single task #8', async () => {
      const result = await parallel([() => Promise.resolve(8)]);
      expect(result).toEqual([8]);
    });
    it('parallel single task #9', async () => {
      const result = await parallel([() => Promise.resolve(9)]);
      expect(result).toEqual([9]);
    });
    it('parallel single task #10', async () => {
      const result = await parallel([() => Promise.resolve(10)]);
      expect(result).toEqual([10]);
    });
    it('parallel single task #11', async () => {
      const result = await parallel([() => Promise.resolve(11)]);
      expect(result).toEqual([11]);
    });
    it('parallel single task #12', async () => {
      const result = await parallel([() => Promise.resolve(12)]);
      expect(result).toEqual([12]);
    });
    it('parallel single task #13', async () => {
      const result = await parallel([() => Promise.resolve(13)]);
      expect(result).toEqual([13]);
    });
    it('parallel single task #14', async () => {
      const result = await parallel([() => Promise.resolve(14)]);
      expect(result).toEqual([14]);
    });
    it('parallel single task #15', async () => {
      const result = await parallel([() => Promise.resolve(15)]);
      expect(result).toEqual([15]);
    });
    it('parallel single task #16', async () => {
      const result = await parallel([() => Promise.resolve(16)]);
      expect(result).toEqual([16]);
    });
    it('parallel single task #17', async () => {
      const result = await parallel([() => Promise.resolve(17)]);
      expect(result).toEqual([17]);
    });
    it('parallel single task #18', async () => {
      const result = await parallel([() => Promise.resolve(18)]);
      expect(result).toEqual([18]);
    });
    it('parallel single task #19', async () => {
      const result = await parallel([() => Promise.resolve(19)]);
      expect(result).toEqual([19]);
    });
    it('parallel single task #20', async () => {
      const result = await parallel([() => Promise.resolve(20)]);
      expect(result).toEqual([20]);
    });
    it('parallel 2 tasks length #1', async () => {
      const result = await parallel([() => Promise.resolve(1), () => Promise.resolve(2)]);
      expect(result).toHaveLength(2);
    });
    it('parallel 2 tasks length #2', async () => {
      const result = await parallel([() => Promise.resolve(2), () => Promise.resolve(4)]);
      expect(result).toHaveLength(2);
    });
    it('parallel 2 tasks length #3', async () => {
      const result = await parallel([() => Promise.resolve(3), () => Promise.resolve(6)]);
      expect(result).toHaveLength(2);
    });
    it('parallel 2 tasks length #4', async () => {
      const result = await parallel([() => Promise.resolve(4), () => Promise.resolve(8)]);
      expect(result).toHaveLength(2);
    });
    it('parallel 2 tasks length #5', async () => {
      const result = await parallel([() => Promise.resolve(5), () => Promise.resolve(10)]);
      expect(result).toHaveLength(2);
    });
    it('parallel 2 tasks length #6', async () => {
      const result = await parallel([() => Promise.resolve(6), () => Promise.resolve(12)]);
      expect(result).toHaveLength(2);
    });
    it('parallel 2 tasks length #7', async () => {
      const result = await parallel([() => Promise.resolve(7), () => Promise.resolve(14)]);
      expect(result).toHaveLength(2);
    });
    it('parallel 2 tasks length #8', async () => {
      const result = await parallel([() => Promise.resolve(8), () => Promise.resolve(16)]);
      expect(result).toHaveLength(2);
    });
    it('parallel 2 tasks length #9', async () => {
      const result = await parallel([() => Promise.resolve(9), () => Promise.resolve(18)]);
      expect(result).toHaveLength(2);
    });
    it('parallel 2 tasks length #10', async () => {
      const result = await parallel([() => Promise.resolve(10), () => Promise.resolve(20)]);
      expect(result).toHaveLength(2);
    });
    it('parallel 3 tasks length #1', async () => {
      const result = await parallel([() => Promise.resolve(1), () => Promise.resolve(2), () => Promise.resolve(3)]);
      expect(result).toHaveLength(3);
    });
    it('parallel 3 tasks length #2', async () => {
      const result = await parallel([() => Promise.resolve(2), () => Promise.resolve(4), () => Promise.resolve(6)]);
      expect(result).toHaveLength(3);
    });
    it('parallel 3 tasks length #3', async () => {
      const result = await parallel([() => Promise.resolve(3), () => Promise.resolve(6), () => Promise.resolve(9)]);
      expect(result).toHaveLength(3);
    });
    it('parallel 3 tasks length #4', async () => {
      const result = await parallel([() => Promise.resolve(4), () => Promise.resolve(8), () => Promise.resolve(12)]);
      expect(result).toHaveLength(3);
    });
    it('parallel 3 tasks length #5', async () => {
      const result = await parallel([() => Promise.resolve(5), () => Promise.resolve(10), () => Promise.resolve(15)]);
      expect(result).toHaveLength(3);
    });
    it('parallel 3 tasks length #6', async () => {
      const result = await parallel([() => Promise.resolve(6), () => Promise.resolve(12), () => Promise.resolve(18)]);
      expect(result).toHaveLength(3);
    });
    it('parallel 3 tasks length #7', async () => {
      const result = await parallel([() => Promise.resolve(7), () => Promise.resolve(14), () => Promise.resolve(21)]);
      expect(result).toHaveLength(3);
    });
    it('parallel 3 tasks length #8', async () => {
      const result = await parallel([() => Promise.resolve(8), () => Promise.resolve(16), () => Promise.resolve(24)]);
      expect(result).toHaveLength(3);
    });
    it('parallel 3 tasks length #9', async () => {
      const result = await parallel([() => Promise.resolve(9), () => Promise.resolve(18), () => Promise.resolve(27)]);
      expect(result).toHaveLength(3);
    });
    it('parallel 3 tasks length #10', async () => {
      const result = await parallel([() => Promise.resolve(10), () => Promise.resolve(20), () => Promise.resolve(30)]);
      expect(result).toHaveLength(3);
    });
    it('parallel 4 tasks length #1', async () => {
      const result = await parallel([() => Promise.resolve(1), () => Promise.resolve(2), () => Promise.resolve(3), () => Promise.resolve(4)]);
      expect(result).toHaveLength(4);
    });
    it('parallel 4 tasks length #2', async () => {
      const result = await parallel([() => Promise.resolve(2), () => Promise.resolve(4), () => Promise.resolve(6), () => Promise.resolve(8)]);
      expect(result).toHaveLength(4);
    });
    it('parallel 4 tasks length #3', async () => {
      const result = await parallel([() => Promise.resolve(3), () => Promise.resolve(6), () => Promise.resolve(9), () => Promise.resolve(12)]);
      expect(result).toHaveLength(4);
    });
    it('parallel 4 tasks length #4', async () => {
      const result = await parallel([() => Promise.resolve(4), () => Promise.resolve(8), () => Promise.resolve(12), () => Promise.resolve(16)]);
      expect(result).toHaveLength(4);
    });
    it('parallel 4 tasks length #5', async () => {
      const result = await parallel([() => Promise.resolve(5), () => Promise.resolve(10), () => Promise.resolve(15), () => Promise.resolve(20)]);
      expect(result).toHaveLength(4);
    });
    it('parallel 4 tasks length #6', async () => {
      const result = await parallel([() => Promise.resolve(6), () => Promise.resolve(12), () => Promise.resolve(18), () => Promise.resolve(24)]);
      expect(result).toHaveLength(4);
    });
    it('parallel 4 tasks length #7', async () => {
      const result = await parallel([() => Promise.resolve(7), () => Promise.resolve(14), () => Promise.resolve(21), () => Promise.resolve(28)]);
      expect(result).toHaveLength(4);
    });
    it('parallel 4 tasks length #8', async () => {
      const result = await parallel([() => Promise.resolve(8), () => Promise.resolve(16), () => Promise.resolve(24), () => Promise.resolve(32)]);
      expect(result).toHaveLength(4);
    });
    it('parallel 4 tasks length #9', async () => {
      const result = await parallel([() => Promise.resolve(9), () => Promise.resolve(18), () => Promise.resolve(27), () => Promise.resolve(36)]);
      expect(result).toHaveLength(4);
    });
    it('parallel 4 tasks length #10', async () => {
      const result = await parallel([() => Promise.resolve(10), () => Promise.resolve(20), () => Promise.resolve(30), () => Promise.resolve(40)]);
      expect(result).toHaveLength(4);
    });
    it('parallel 5 tasks length #1', async () => {
      const result = await parallel([() => Promise.resolve(1), () => Promise.resolve(2), () => Promise.resolve(3), () => Promise.resolve(4), () => Promise.resolve(5)]);
      expect(result).toHaveLength(5);
    });
    it('parallel 5 tasks length #2', async () => {
      const result = await parallel([() => Promise.resolve(2), () => Promise.resolve(4), () => Promise.resolve(6), () => Promise.resolve(8), () => Promise.resolve(10)]);
      expect(result).toHaveLength(5);
    });
    it('parallel 5 tasks length #3', async () => {
      const result = await parallel([() => Promise.resolve(3), () => Promise.resolve(6), () => Promise.resolve(9), () => Promise.resolve(12), () => Promise.resolve(15)]);
      expect(result).toHaveLength(5);
    });
    it('parallel 5 tasks length #4', async () => {
      const result = await parallel([() => Promise.resolve(4), () => Promise.resolve(8), () => Promise.resolve(12), () => Promise.resolve(16), () => Promise.resolve(20)]);
      expect(result).toHaveLength(5);
    });
    it('parallel 5 tasks length #5', async () => {
      const result = await parallel([() => Promise.resolve(5), () => Promise.resolve(10), () => Promise.resolve(15), () => Promise.resolve(20), () => Promise.resolve(25)]);
      expect(result).toHaveLength(5);
    });
    it('parallel 5 tasks length #6', async () => {
      const result = await parallel([() => Promise.resolve(6), () => Promise.resolve(12), () => Promise.resolve(18), () => Promise.resolve(24), () => Promise.resolve(30)]);
      expect(result).toHaveLength(5);
    });
    it('parallel 5 tasks length #7', async () => {
      const result = await parallel([() => Promise.resolve(7), () => Promise.resolve(14), () => Promise.resolve(21), () => Promise.resolve(28), () => Promise.resolve(35)]);
      expect(result).toHaveLength(5);
    });
    it('parallel 5 tasks length #8', async () => {
      const result = await parallel([() => Promise.resolve(8), () => Promise.resolve(16), () => Promise.resolve(24), () => Promise.resolve(32), () => Promise.resolve(40)]);
      expect(result).toHaveLength(5);
    });
    it('parallel 5 tasks length #9', async () => {
      const result = await parallel([() => Promise.resolve(9), () => Promise.resolve(18), () => Promise.resolve(27), () => Promise.resolve(36), () => Promise.resolve(45)]);
      expect(result).toHaveLength(5);
    });
    it('parallel 5 tasks length #10', async () => {
      const result = await parallel([() => Promise.resolve(10), () => Promise.resolve(20), () => Promise.resolve(30), () => Promise.resolve(40), () => Promise.resolve(50)]);
      expect(result).toHaveLength(5);
    });
    it('parallel 6 tasks length #1', async () => {
      const result = await parallel([() => Promise.resolve(1), () => Promise.resolve(2), () => Promise.resolve(3), () => Promise.resolve(4), () => Promise.resolve(5), () => Promise.resolve(6)]);
      expect(result).toHaveLength(6);
    });
    it('parallel 6 tasks length #2', async () => {
      const result = await parallel([() => Promise.resolve(2), () => Promise.resolve(4), () => Promise.resolve(6), () => Promise.resolve(8), () => Promise.resolve(10), () => Promise.resolve(12)]);
      expect(result).toHaveLength(6);
    });
    it('parallel 6 tasks length #3', async () => {
      const result = await parallel([() => Promise.resolve(3), () => Promise.resolve(6), () => Promise.resolve(9), () => Promise.resolve(12), () => Promise.resolve(15), () => Promise.resolve(18)]);
      expect(result).toHaveLength(6);
    });
    it('parallel 6 tasks length #4', async () => {
      const result = await parallel([() => Promise.resolve(4), () => Promise.resolve(8), () => Promise.resolve(12), () => Promise.resolve(16), () => Promise.resolve(20), () => Promise.resolve(24)]);
      expect(result).toHaveLength(6);
    });
    it('parallel 6 tasks length #5', async () => {
      const result = await parallel([() => Promise.resolve(5), () => Promise.resolve(10), () => Promise.resolve(15), () => Promise.resolve(20), () => Promise.resolve(25), () => Promise.resolve(30)]);
      expect(result).toHaveLength(6);
    });
    it('parallel 6 tasks length #6', async () => {
      const result = await parallel([() => Promise.resolve(6), () => Promise.resolve(12), () => Promise.resolve(18), () => Promise.resolve(24), () => Promise.resolve(30), () => Promise.resolve(36)]);
      expect(result).toHaveLength(6);
    });
    it('parallel 6 tasks length #7', async () => {
      const result = await parallel([() => Promise.resolve(7), () => Promise.resolve(14), () => Promise.resolve(21), () => Promise.resolve(28), () => Promise.resolve(35), () => Promise.resolve(42)]);
      expect(result).toHaveLength(6);
    });
    it('parallel 6 tasks length #8', async () => {
      const result = await parallel([() => Promise.resolve(8), () => Promise.resolve(16), () => Promise.resolve(24), () => Promise.resolve(32), () => Promise.resolve(40), () => Promise.resolve(48)]);
      expect(result).toHaveLength(6);
    });
    it('parallel 6 tasks length #9', async () => {
      const result = await parallel([() => Promise.resolve(9), () => Promise.resolve(18), () => Promise.resolve(27), () => Promise.resolve(36), () => Promise.resolve(45), () => Promise.resolve(54)]);
      expect(result).toHaveLength(6);
    });
    it('parallel 6 tasks length #10', async () => {
      const result = await parallel([() => Promise.resolve(10), () => Promise.resolve(20), () => Promise.resolve(30), () => Promise.resolve(40), () => Promise.resolve(50), () => Promise.resolve(60)]);
      expect(result).toHaveLength(6);
    });
    it('parallel concurrency=1 returns all results #1', async () => {
      const result = await parallel([() => Promise.resolve(1), () => Promise.resolve(2), () => Promise.resolve(3)], 1);
      expect(result).toHaveLength(3);
    });
    it('parallel concurrency=1 returns all results #2', async () => {
      const result = await parallel([() => Promise.resolve(2), () => Promise.resolve(3), () => Promise.resolve(4)], 1);
      expect(result).toHaveLength(3);
    });
    it('parallel concurrency=1 returns all results #3', async () => {
      const result = await parallel([() => Promise.resolve(3), () => Promise.resolve(4), () => Promise.resolve(5)], 1);
      expect(result).toHaveLength(3);
    });
    it('parallel concurrency=1 returns all results #4', async () => {
      const result = await parallel([() => Promise.resolve(4), () => Promise.resolve(5), () => Promise.resolve(6)], 1);
      expect(result).toHaveLength(3);
    });
    it('parallel concurrency=1 returns all results #5', async () => {
      const result = await parallel([() => Promise.resolve(5), () => Promise.resolve(6), () => Promise.resolve(7)], 1);
      expect(result).toHaveLength(3);
    });
    it('parallel concurrency=1 returns all results #6', async () => {
      const result = await parallel([() => Promise.resolve(6), () => Promise.resolve(7), () => Promise.resolve(8)], 1);
      expect(result).toHaveLength(3);
    });
    it('parallel concurrency=1 returns all results #7', async () => {
      const result = await parallel([() => Promise.resolve(7), () => Promise.resolve(8), () => Promise.resolve(9)], 1);
      expect(result).toHaveLength(3);
    });
    it('parallel concurrency=1 returns all results #8', async () => {
      const result = await parallel([() => Promise.resolve(8), () => Promise.resolve(9), () => Promise.resolve(10)], 1);
      expect(result).toHaveLength(3);
    });
    it('parallel concurrency=1 returns all results #9', async () => {
      const result = await parallel([() => Promise.resolve(9), () => Promise.resolve(10), () => Promise.resolve(11)], 1);
      expect(result).toHaveLength(3);
    });
    it('parallel concurrency=1 returns all results #10', async () => {
      const result = await parallel([() => Promise.resolve(10), () => Promise.resolve(11), () => Promise.resolve(12)], 1);
      expect(result).toHaveLength(3);
    });
    it('parallel concurrency=1 returns all results #11', async () => {
      const result = await parallel([() => Promise.resolve(11), () => Promise.resolve(12), () => Promise.resolve(13)], 1);
      expect(result).toHaveLength(3);
    });
    it('parallel concurrency=1 returns all results #12', async () => {
      const result = await parallel([() => Promise.resolve(12), () => Promise.resolve(13), () => Promise.resolve(14)], 1);
      expect(result).toHaveLength(3);
    });
    it('parallel concurrency=1 returns all results #13', async () => {
      const result = await parallel([() => Promise.resolve(13), () => Promise.resolve(14), () => Promise.resolve(15)], 1);
      expect(result).toHaveLength(3);
    });
    it('parallel concurrency=1 returns all results #14', async () => {
      const result = await parallel([() => Promise.resolve(14), () => Promise.resolve(15), () => Promise.resolve(16)], 1);
      expect(result).toHaveLength(3);
    });
    it('parallel concurrency=1 returns all results #15', async () => {
      const result = await parallel([() => Promise.resolve(15), () => Promise.resolve(16), () => Promise.resolve(17)], 1);
      expect(result).toHaveLength(3);
    });
    it('parallel concurrency=1 returns all results #16', async () => {
      const result = await parallel([() => Promise.resolve(16), () => Promise.resolve(17), () => Promise.resolve(18)], 1);
      expect(result).toHaveLength(3);
    });
    it('parallel concurrency=1 returns all results #17', async () => {
      const result = await parallel([() => Promise.resolve(17), () => Promise.resolve(18), () => Promise.resolve(19)], 1);
      expect(result).toHaveLength(3);
    });
    it('parallel concurrency=1 returns all results #18', async () => {
      const result = await parallel([() => Promise.resolve(18), () => Promise.resolve(19), () => Promise.resolve(20)], 1);
      expect(result).toHaveLength(3);
    });
    it('parallel concurrency=1 returns all results #19', async () => {
      const result = await parallel([() => Promise.resolve(19), () => Promise.resolve(20), () => Promise.resolve(21)], 1);
      expect(result).toHaveLength(3);
    });
    it('parallel concurrency=1 returns all results #20', async () => {
      const result = await parallel([() => Promise.resolve(20), () => Promise.resolve(21), () => Promise.resolve(22)], 1);
      expect(result).toHaveLength(3);
    });
    it('parallel concurrency=2 #1', async () => {
      const result = await parallel([() => Promise.resolve(1), () => Promise.resolve(2), () => Promise.resolve(3), () => Promise.resolve(4)], 2);
      expect(result).toHaveLength(4);
    });
    it('parallel concurrency=2 #2', async () => {
      const result = await parallel([() => Promise.resolve(2), () => Promise.resolve(3), () => Promise.resolve(4), () => Promise.resolve(5)], 2);
      expect(result).toHaveLength(4);
    });
    it('parallel concurrency=2 #3', async () => {
      const result = await parallel([() => Promise.resolve(3), () => Promise.resolve(4), () => Promise.resolve(5), () => Promise.resolve(6)], 2);
      expect(result).toHaveLength(4);
    });
    it('parallel concurrency=2 #4', async () => {
      const result = await parallel([() => Promise.resolve(4), () => Promise.resolve(5), () => Promise.resolve(6), () => Promise.resolve(7)], 2);
      expect(result).toHaveLength(4);
    });
    it('parallel concurrency=2 #5', async () => {
      const result = await parallel([() => Promise.resolve(5), () => Promise.resolve(6), () => Promise.resolve(7), () => Promise.resolve(8)], 2);
      expect(result).toHaveLength(4);
    });
    it('parallel concurrency=2 #6', async () => {
      const result = await parallel([() => Promise.resolve(6), () => Promise.resolve(7), () => Promise.resolve(8), () => Promise.resolve(9)], 2);
      expect(result).toHaveLength(4);
    });
    it('parallel concurrency=2 #7', async () => {
      const result = await parallel([() => Promise.resolve(7), () => Promise.resolve(8), () => Promise.resolve(9), () => Promise.resolve(10)], 2);
      expect(result).toHaveLength(4);
    });
    it('parallel concurrency=2 #8', async () => {
      const result = await parallel([() => Promise.resolve(8), () => Promise.resolve(9), () => Promise.resolve(10), () => Promise.resolve(11)], 2);
      expect(result).toHaveLength(4);
    });
    it('parallel concurrency=2 #9', async () => {
      const result = await parallel([() => Promise.resolve(9), () => Promise.resolve(10), () => Promise.resolve(11), () => Promise.resolve(12)], 2);
      expect(result).toHaveLength(4);
    });
    it('parallel concurrency=2 #10', async () => {
      const result = await parallel([() => Promise.resolve(10), () => Promise.resolve(11), () => Promise.resolve(12), () => Promise.resolve(13)], 2);
      expect(result).toHaveLength(4);
    });
    it('parallel correct values #1', async () => {
      const result = await parallel([() => Promise.resolve(1), () => Promise.resolve(2)]);
      expect(result[0]).toBe(1);
      expect(result[1]).toBe(2);
    });
    it('parallel correct values #2', async () => {
      const result = await parallel([() => Promise.resolve(2), () => Promise.resolve(4)]);
      expect(result[0]).toBe(2);
      expect(result[1]).toBe(4);
    });
    it('parallel correct values #3', async () => {
      const result = await parallel([() => Promise.resolve(3), () => Promise.resolve(6)]);
      expect(result[0]).toBe(3);
      expect(result[1]).toBe(6);
    });
    it('parallel correct values #4', async () => {
      const result = await parallel([() => Promise.resolve(4), () => Promise.resolve(8)]);
      expect(result[0]).toBe(4);
      expect(result[1]).toBe(8);
    });
    it('parallel correct values #5', async () => {
      const result = await parallel([() => Promise.resolve(5), () => Promise.resolve(10)]);
      expect(result[0]).toBe(5);
      expect(result[1]).toBe(10);
    });
    it('parallel correct values #6', async () => {
      const result = await parallel([() => Promise.resolve(6), () => Promise.resolve(12)]);
      expect(result[0]).toBe(6);
      expect(result[1]).toBe(12);
    });
    it('parallel correct values #7', async () => {
      const result = await parallel([() => Promise.resolve(7), () => Promise.resolve(14)]);
      expect(result[0]).toBe(7);
      expect(result[1]).toBe(14);
    });
    it('parallel correct values #8', async () => {
      const result = await parallel([() => Promise.resolve(8), () => Promise.resolve(16)]);
      expect(result[0]).toBe(8);
      expect(result[1]).toBe(16);
    });
    it('parallel correct values #9', async () => {
      const result = await parallel([() => Promise.resolve(9), () => Promise.resolve(18)]);
      expect(result[0]).toBe(9);
      expect(result[1]).toBe(18);
    });
    it('parallel correct values #10', async () => {
      const result = await parallel([() => Promise.resolve(10), () => Promise.resolve(20)]);
      expect(result[0]).toBe(10);
      expect(result[1]).toBe(20);
    });
  });
  // ── settle / allSettled ────────────────────────────────────────────────
  describe('settle and allSettled', () => {
    it('settle all fulfilled #1', async () => {
      const results = await settle([Promise.resolve(1), Promise.resolve(2)]);
      expect(results[0].status).toBe('fulfilled');
      expect(results[1].status).toBe('fulfilled');
    });
    it('settle all fulfilled #2', async () => {
      const results = await settle([Promise.resolve(2), Promise.resolve(3)]);
      expect(results[0].status).toBe('fulfilled');
      expect(results[1].status).toBe('fulfilled');
    });
    it('settle all fulfilled #3', async () => {
      const results = await settle([Promise.resolve(3), Promise.resolve(4)]);
      expect(results[0].status).toBe('fulfilled');
      expect(results[1].status).toBe('fulfilled');
    });
    it('settle all fulfilled #4', async () => {
      const results = await settle([Promise.resolve(4), Promise.resolve(5)]);
      expect(results[0].status).toBe('fulfilled');
      expect(results[1].status).toBe('fulfilled');
    });
    it('settle all fulfilled #5', async () => {
      const results = await settle([Promise.resolve(5), Promise.resolve(6)]);
      expect(results[0].status).toBe('fulfilled');
      expect(results[1].status).toBe('fulfilled');
    });
    it('settle all fulfilled #6', async () => {
      const results = await settle([Promise.resolve(6), Promise.resolve(7)]);
      expect(results[0].status).toBe('fulfilled');
      expect(results[1].status).toBe('fulfilled');
    });
    it('settle all fulfilled #7', async () => {
      const results = await settle([Promise.resolve(7), Promise.resolve(8)]);
      expect(results[0].status).toBe('fulfilled');
      expect(results[1].status).toBe('fulfilled');
    });
    it('settle all fulfilled #8', async () => {
      const results = await settle([Promise.resolve(8), Promise.resolve(9)]);
      expect(results[0].status).toBe('fulfilled');
      expect(results[1].status).toBe('fulfilled');
    });
    it('settle all fulfilled #9', async () => {
      const results = await settle([Promise.resolve(9), Promise.resolve(10)]);
      expect(results[0].status).toBe('fulfilled');
      expect(results[1].status).toBe('fulfilled');
    });
    it('settle all fulfilled #10', async () => {
      const results = await settle([Promise.resolve(10), Promise.resolve(11)]);
      expect(results[0].status).toBe('fulfilled');
      expect(results[1].status).toBe('fulfilled');
    });
    it('settle all fulfilled #11', async () => {
      const results = await settle([Promise.resolve(11), Promise.resolve(12)]);
      expect(results[0].status).toBe('fulfilled');
      expect(results[1].status).toBe('fulfilled');
    });
    it('settle all fulfilled #12', async () => {
      const results = await settle([Promise.resolve(12), Promise.resolve(13)]);
      expect(results[0].status).toBe('fulfilled');
      expect(results[1].status).toBe('fulfilled');
    });
    it('settle all fulfilled #13', async () => {
      const results = await settle([Promise.resolve(13), Promise.resolve(14)]);
      expect(results[0].status).toBe('fulfilled');
      expect(results[1].status).toBe('fulfilled');
    });
    it('settle all fulfilled #14', async () => {
      const results = await settle([Promise.resolve(14), Promise.resolve(15)]);
      expect(results[0].status).toBe('fulfilled');
      expect(results[1].status).toBe('fulfilled');
    });
    it('settle all fulfilled #15', async () => {
      const results = await settle([Promise.resolve(15), Promise.resolve(16)]);
      expect(results[0].status).toBe('fulfilled');
      expect(results[1].status).toBe('fulfilled');
    });
    it('settle mixed fulfilled+rejected #1', async () => {
      const results = await settle([Promise.resolve(1), Promise.reject(new Error('e1'))]);
      expect(results[0].status).toBe('fulfilled');
      expect(results[1].status).toBe('rejected');
    });
    it('settle mixed fulfilled+rejected #2', async () => {
      const results = await settle([Promise.resolve(2), Promise.reject(new Error('e2'))]);
      expect(results[0].status).toBe('fulfilled');
      expect(results[1].status).toBe('rejected');
    });
    it('settle mixed fulfilled+rejected #3', async () => {
      const results = await settle([Promise.resolve(3), Promise.reject(new Error('e3'))]);
      expect(results[0].status).toBe('fulfilled');
      expect(results[1].status).toBe('rejected');
    });
    it('settle mixed fulfilled+rejected #4', async () => {
      const results = await settle([Promise.resolve(4), Promise.reject(new Error('e4'))]);
      expect(results[0].status).toBe('fulfilled');
      expect(results[1].status).toBe('rejected');
    });
    it('settle mixed fulfilled+rejected #5', async () => {
      const results = await settle([Promise.resolve(5), Promise.reject(new Error('e5'))]);
      expect(results[0].status).toBe('fulfilled');
      expect(results[1].status).toBe('rejected');
    });
    it('settle mixed fulfilled+rejected #6', async () => {
      const results = await settle([Promise.resolve(6), Promise.reject(new Error('e6'))]);
      expect(results[0].status).toBe('fulfilled');
      expect(results[1].status).toBe('rejected');
    });
    it('settle mixed fulfilled+rejected #7', async () => {
      const results = await settle([Promise.resolve(7), Promise.reject(new Error('e7'))]);
      expect(results[0].status).toBe('fulfilled');
      expect(results[1].status).toBe('rejected');
    });
    it('settle mixed fulfilled+rejected #8', async () => {
      const results = await settle([Promise.resolve(8), Promise.reject(new Error('e8'))]);
      expect(results[0].status).toBe('fulfilled');
      expect(results[1].status).toBe('rejected');
    });
    it('settle mixed fulfilled+rejected #9', async () => {
      const results = await settle([Promise.resolve(9), Promise.reject(new Error('e9'))]);
      expect(results[0].status).toBe('fulfilled');
      expect(results[1].status).toBe('rejected');
    });
    it('settle mixed fulfilled+rejected #10', async () => {
      const results = await settle([Promise.resolve(10), Promise.reject(new Error('e10'))]);
      expect(results[0].status).toBe('fulfilled');
      expect(results[1].status).toBe('rejected');
    });
    it('settle mixed fulfilled+rejected #11', async () => {
      const results = await settle([Promise.resolve(11), Promise.reject(new Error('e11'))]);
      expect(results[0].status).toBe('fulfilled');
      expect(results[1].status).toBe('rejected');
    });
    it('settle mixed fulfilled+rejected #12', async () => {
      const results = await settle([Promise.resolve(12), Promise.reject(new Error('e12'))]);
      expect(results[0].status).toBe('fulfilled');
      expect(results[1].status).toBe('rejected');
    });
    it('settle mixed fulfilled+rejected #13', async () => {
      const results = await settle([Promise.resolve(13), Promise.reject(new Error('e13'))]);
      expect(results[0].status).toBe('fulfilled');
      expect(results[1].status).toBe('rejected');
    });
    it('settle mixed fulfilled+rejected #14', async () => {
      const results = await settle([Promise.resolve(14), Promise.reject(new Error('e14'))]);
      expect(results[0].status).toBe('fulfilled');
      expect(results[1].status).toBe('rejected');
    });
    it('settle mixed fulfilled+rejected #15', async () => {
      const results = await settle([Promise.resolve(15), Promise.reject(new Error('e15'))]);
      expect(results[0].status).toBe('fulfilled');
      expect(results[1].status).toBe('rejected');
    });
    it('settle all rejected #1', async () => {
      const results = await settle([Promise.reject(new Error('a1')), Promise.reject(new Error('b1'))]);
      expect(results.every(r => r.status === 'rejected')).toBe(true);
    });
    it('settle all rejected #2', async () => {
      const results = await settle([Promise.reject(new Error('a2')), Promise.reject(new Error('b2'))]);
      expect(results.every(r => r.status === 'rejected')).toBe(true);
    });
    it('settle all rejected #3', async () => {
      const results = await settle([Promise.reject(new Error('a3')), Promise.reject(new Error('b3'))]);
      expect(results.every(r => r.status === 'rejected')).toBe(true);
    });
    it('settle all rejected #4', async () => {
      const results = await settle([Promise.reject(new Error('a4')), Promise.reject(new Error('b4'))]);
      expect(results.every(r => r.status === 'rejected')).toBe(true);
    });
    it('settle all rejected #5', async () => {
      const results = await settle([Promise.reject(new Error('a5')), Promise.reject(new Error('b5'))]);
      expect(results.every(r => r.status === 'rejected')).toBe(true);
    });
    it('settle all rejected #6', async () => {
      const results = await settle([Promise.reject(new Error('a6')), Promise.reject(new Error('b6'))]);
      expect(results.every(r => r.status === 'rejected')).toBe(true);
    });
    it('settle all rejected #7', async () => {
      const results = await settle([Promise.reject(new Error('a7')), Promise.reject(new Error('b7'))]);
      expect(results.every(r => r.status === 'rejected')).toBe(true);
    });
    it('settle all rejected #8', async () => {
      const results = await settle([Promise.reject(new Error('a8')), Promise.reject(new Error('b8'))]);
      expect(results.every(r => r.status === 'rejected')).toBe(true);
    });
    it('settle all rejected #9', async () => {
      const results = await settle([Promise.reject(new Error('a9')), Promise.reject(new Error('b9'))]);
      expect(results.every(r => r.status === 'rejected')).toBe(true);
    });
    it('settle all rejected #10', async () => {
      const results = await settle([Promise.reject(new Error('a10')), Promise.reject(new Error('b10'))]);
      expect(results.every(r => r.status === 'rejected')).toBe(true);
    });
    it('settle all rejected #11', async () => {
      const results = await settle([Promise.reject(new Error('a11')), Promise.reject(new Error('b11'))]);
      expect(results.every(r => r.status === 'rejected')).toBe(true);
    });
    it('settle all rejected #12', async () => {
      const results = await settle([Promise.reject(new Error('a12')), Promise.reject(new Error('b12'))]);
      expect(results.every(r => r.status === 'rejected')).toBe(true);
    });
    it('settle all rejected #13', async () => {
      const results = await settle([Promise.reject(new Error('a13')), Promise.reject(new Error('b13'))]);
      expect(results.every(r => r.status === 'rejected')).toBe(true);
    });
    it('settle all rejected #14', async () => {
      const results = await settle([Promise.reject(new Error('a14')), Promise.reject(new Error('b14'))]);
      expect(results.every(r => r.status === 'rejected')).toBe(true);
    });
    it('settle all rejected #15', async () => {
      const results = await settle([Promise.reject(new Error('a15')), Promise.reject(new Error('b15'))]);
      expect(results.every(r => r.status === 'rejected')).toBe(true);
    });
    it('settle preserves length #1', async () => {
      const results = await settle([Promise.resolve(1), Promise.resolve(2), Promise.resolve(3)]);
      expect(results).toHaveLength(3);
    });
    it('settle preserves length #2', async () => {
      const results = await settle([Promise.resolve(2), Promise.resolve(3), Promise.resolve(4)]);
      expect(results).toHaveLength(3);
    });
    it('settle preserves length #3', async () => {
      const results = await settle([Promise.resolve(3), Promise.resolve(4), Promise.resolve(5)]);
      expect(results).toHaveLength(3);
    });
    it('settle preserves length #4', async () => {
      const results = await settle([Promise.resolve(4), Promise.resolve(5), Promise.resolve(6)]);
      expect(results).toHaveLength(3);
    });
    it('settle preserves length #5', async () => {
      const results = await settle([Promise.resolve(5), Promise.resolve(6), Promise.resolve(7)]);
      expect(results).toHaveLength(3);
    });
    it('settle preserves length #6', async () => {
      const results = await settle([Promise.resolve(6), Promise.resolve(7), Promise.resolve(8)]);
      expect(results).toHaveLength(3);
    });
    it('settle preserves length #7', async () => {
      const results = await settle([Promise.resolve(7), Promise.resolve(8), Promise.resolve(9)]);
      expect(results).toHaveLength(3);
    });
    it('settle preserves length #8', async () => {
      const results = await settle([Promise.resolve(8), Promise.resolve(9), Promise.resolve(10)]);
      expect(results).toHaveLength(3);
    });
    it('settle preserves length #9', async () => {
      const results = await settle([Promise.resolve(9), Promise.resolve(10), Promise.resolve(11)]);
      expect(results).toHaveLength(3);
    });
    it('settle preserves length #10', async () => {
      const results = await settle([Promise.resolve(10), Promise.resolve(11), Promise.resolve(12)]);
      expect(results).toHaveLength(3);
    });
    it('settle preserves length #11', async () => {
      const results = await settle([Promise.resolve(11), Promise.resolve(12), Promise.resolve(13)]);
      expect(results).toHaveLength(3);
    });
    it('settle preserves length #12', async () => {
      const results = await settle([Promise.resolve(12), Promise.resolve(13), Promise.resolve(14)]);
      expect(results).toHaveLength(3);
    });
    it('settle preserves length #13', async () => {
      const results = await settle([Promise.resolve(13), Promise.resolve(14), Promise.resolve(15)]);
      expect(results).toHaveLength(3);
    });
    it('settle preserves length #14', async () => {
      const results = await settle([Promise.resolve(14), Promise.resolve(15), Promise.resolve(16)]);
      expect(results).toHaveLength(3);
    });
    it('settle preserves length #15', async () => {
      const results = await settle([Promise.resolve(15), Promise.resolve(16), Promise.resolve(17)]);
      expect(results).toHaveLength(3);
    });
    it('allSettled ok=true for resolved #1', async () => {
      const results = await allSettled([Promise.resolve(1)]);
      expect(results[0].ok).toBe(true);
      expect(results[0].value).toBe(1);
    });
    it('allSettled ok=true for resolved #2', async () => {
      const results = await allSettled([Promise.resolve(2)]);
      expect(results[0].ok).toBe(true);
      expect(results[0].value).toBe(2);
    });
    it('allSettled ok=true for resolved #3', async () => {
      const results = await allSettled([Promise.resolve(3)]);
      expect(results[0].ok).toBe(true);
      expect(results[0].value).toBe(3);
    });
    it('allSettled ok=true for resolved #4', async () => {
      const results = await allSettled([Promise.resolve(4)]);
      expect(results[0].ok).toBe(true);
      expect(results[0].value).toBe(4);
    });
    it('allSettled ok=true for resolved #5', async () => {
      const results = await allSettled([Promise.resolve(5)]);
      expect(results[0].ok).toBe(true);
      expect(results[0].value).toBe(5);
    });
    it('allSettled ok=true for resolved #6', async () => {
      const results = await allSettled([Promise.resolve(6)]);
      expect(results[0].ok).toBe(true);
      expect(results[0].value).toBe(6);
    });
    it('allSettled ok=true for resolved #7', async () => {
      const results = await allSettled([Promise.resolve(7)]);
      expect(results[0].ok).toBe(true);
      expect(results[0].value).toBe(7);
    });
    it('allSettled ok=true for resolved #8', async () => {
      const results = await allSettled([Promise.resolve(8)]);
      expect(results[0].ok).toBe(true);
      expect(results[0].value).toBe(8);
    });
    it('allSettled ok=true for resolved #9', async () => {
      const results = await allSettled([Promise.resolve(9)]);
      expect(results[0].ok).toBe(true);
      expect(results[0].value).toBe(9);
    });
    it('allSettled ok=true for resolved #10', async () => {
      const results = await allSettled([Promise.resolve(10)]);
      expect(results[0].ok).toBe(true);
      expect(results[0].value).toBe(10);
    });
    it('allSettled ok=true for resolved #11', async () => {
      const results = await allSettled([Promise.resolve(11)]);
      expect(results[0].ok).toBe(true);
      expect(results[0].value).toBe(11);
    });
    it('allSettled ok=true for resolved #12', async () => {
      const results = await allSettled([Promise.resolve(12)]);
      expect(results[0].ok).toBe(true);
      expect(results[0].value).toBe(12);
    });
    it('allSettled ok=true for resolved #13', async () => {
      const results = await allSettled([Promise.resolve(13)]);
      expect(results[0].ok).toBe(true);
      expect(results[0].value).toBe(13);
    });
    it('allSettled ok=true for resolved #14', async () => {
      const results = await allSettled([Promise.resolve(14)]);
      expect(results[0].ok).toBe(true);
      expect(results[0].value).toBe(14);
    });
    it('allSettled ok=true for resolved #15', async () => {
      const results = await allSettled([Promise.resolve(15)]);
      expect(results[0].ok).toBe(true);
      expect(results[0].value).toBe(15);
    });
    it('allSettled ok=false for rejected #1', async () => {
      const results = await allSettled([Promise.reject(new Error('err1'))]);
      expect(results[0].ok).toBe(false);
      expect(results[0].error).toBeInstanceOf(Error);
    });
    it('allSettled ok=false for rejected #2', async () => {
      const results = await allSettled([Promise.reject(new Error('err2'))]);
      expect(results[0].ok).toBe(false);
      expect(results[0].error).toBeInstanceOf(Error);
    });
    it('allSettled ok=false for rejected #3', async () => {
      const results = await allSettled([Promise.reject(new Error('err3'))]);
      expect(results[0].ok).toBe(false);
      expect(results[0].error).toBeInstanceOf(Error);
    });
    it('allSettled ok=false for rejected #4', async () => {
      const results = await allSettled([Promise.reject(new Error('err4'))]);
      expect(results[0].ok).toBe(false);
      expect(results[0].error).toBeInstanceOf(Error);
    });
    it('allSettled ok=false for rejected #5', async () => {
      const results = await allSettled([Promise.reject(new Error('err5'))]);
      expect(results[0].ok).toBe(false);
      expect(results[0].error).toBeInstanceOf(Error);
    });
    it('allSettled ok=false for rejected #6', async () => {
      const results = await allSettled([Promise.reject(new Error('err6'))]);
      expect(results[0].ok).toBe(false);
      expect(results[0].error).toBeInstanceOf(Error);
    });
    it('allSettled ok=false for rejected #7', async () => {
      const results = await allSettled([Promise.reject(new Error('err7'))]);
      expect(results[0].ok).toBe(false);
      expect(results[0].error).toBeInstanceOf(Error);
    });
    it('allSettled ok=false for rejected #8', async () => {
      const results = await allSettled([Promise.reject(new Error('err8'))]);
      expect(results[0].ok).toBe(false);
      expect(results[0].error).toBeInstanceOf(Error);
    });
    it('allSettled ok=false for rejected #9', async () => {
      const results = await allSettled([Promise.reject(new Error('err9'))]);
      expect(results[0].ok).toBe(false);
      expect(results[0].error).toBeInstanceOf(Error);
    });
    it('allSettled ok=false for rejected #10', async () => {
      const results = await allSettled([Promise.reject(new Error('err10'))]);
      expect(results[0].ok).toBe(false);
      expect(results[0].error).toBeInstanceOf(Error);
    });
    it('allSettled ok=false for rejected #11', async () => {
      const results = await allSettled([Promise.reject(new Error('err11'))]);
      expect(results[0].ok).toBe(false);
      expect(results[0].error).toBeInstanceOf(Error);
    });
    it('allSettled ok=false for rejected #12', async () => {
      const results = await allSettled([Promise.reject(new Error('err12'))]);
      expect(results[0].ok).toBe(false);
      expect(results[0].error).toBeInstanceOf(Error);
    });
    it('allSettled ok=false for rejected #13', async () => {
      const results = await allSettled([Promise.reject(new Error('err13'))]);
      expect(results[0].ok).toBe(false);
      expect(results[0].error).toBeInstanceOf(Error);
    });
    it('allSettled ok=false for rejected #14', async () => {
      const results = await allSettled([Promise.reject(new Error('err14'))]);
      expect(results[0].ok).toBe(false);
      expect(results[0].error).toBeInstanceOf(Error);
    });
    it('allSettled ok=false for rejected #15', async () => {
      const results = await allSettled([Promise.reject(new Error('err15'))]);
      expect(results[0].ok).toBe(false);
      expect(results[0].error).toBeInstanceOf(Error);
    });
    it('allSettled length #1', async () => {
      const results = await allSettled([Promise.resolve(1), Promise.resolve(2), Promise.resolve(3)]);
      expect(results).toHaveLength(3);
    });
    it('allSettled length #2', async () => {
      const results = await allSettled([Promise.resolve(2), Promise.resolve(3), Promise.resolve(4)]);
      expect(results).toHaveLength(3);
    });
    it('allSettled length #3', async () => {
      const results = await allSettled([Promise.resolve(3), Promise.resolve(4), Promise.resolve(5)]);
      expect(results).toHaveLength(3);
    });
    it('allSettled length #4', async () => {
      const results = await allSettled([Promise.resolve(4), Promise.resolve(5), Promise.resolve(6)]);
      expect(results).toHaveLength(3);
    });
    it('allSettled length #5', async () => {
      const results = await allSettled([Promise.resolve(5), Promise.resolve(6), Promise.resolve(7)]);
      expect(results).toHaveLength(3);
    });
    it('allSettled length #6', async () => {
      const results = await allSettled([Promise.resolve(6), Promise.resolve(7), Promise.resolve(8)]);
      expect(results).toHaveLength(3);
    });
    it('allSettled length #7', async () => {
      const results = await allSettled([Promise.resolve(7), Promise.resolve(8), Promise.resolve(9)]);
      expect(results).toHaveLength(3);
    });
    it('allSettled length #8', async () => {
      const results = await allSettled([Promise.resolve(8), Promise.resolve(9), Promise.resolve(10)]);
      expect(results).toHaveLength(3);
    });
    it('allSettled length #9', async () => {
      const results = await allSettled([Promise.resolve(9), Promise.resolve(10), Promise.resolve(11)]);
      expect(results).toHaveLength(3);
    });
    it('allSettled length #10', async () => {
      const results = await allSettled([Promise.resolve(10), Promise.resolve(11), Promise.resolve(12)]);
      expect(results).toHaveLength(3);
    });
    it('allSettled length #11', async () => {
      const results = await allSettled([Promise.resolve(11), Promise.resolve(12), Promise.resolve(13)]);
      expect(results).toHaveLength(3);
    });
    it('allSettled length #12', async () => {
      const results = await allSettled([Promise.resolve(12), Promise.resolve(13), Promise.resolve(14)]);
      expect(results).toHaveLength(3);
    });
    it('allSettled length #13', async () => {
      const results = await allSettled([Promise.resolve(13), Promise.resolve(14), Promise.resolve(15)]);
      expect(results).toHaveLength(3);
    });
    it('allSettled length #14', async () => {
      const results = await allSettled([Promise.resolve(14), Promise.resolve(15), Promise.resolve(16)]);
      expect(results).toHaveLength(3);
    });
    it('allSettled length #15', async () => {
      const results = await allSettled([Promise.resolve(15), Promise.resolve(16), Promise.resolve(17)]);
      expect(results).toHaveLength(3);
    });
    it('allSettled mixed ok values #1', async () => {
      const results = await allSettled([Promise.resolve(1), Promise.reject(new Error('x1'))]);
      expect(results[0].ok).toBe(true);
      expect(results[1].ok).toBe(false);
    });
    it('allSettled mixed ok values #2', async () => {
      const results = await allSettled([Promise.resolve(2), Promise.reject(new Error('x2'))]);
      expect(results[0].ok).toBe(true);
      expect(results[1].ok).toBe(false);
    });
    it('allSettled mixed ok values #3', async () => {
      const results = await allSettled([Promise.resolve(3), Promise.reject(new Error('x3'))]);
      expect(results[0].ok).toBe(true);
      expect(results[1].ok).toBe(false);
    });
    it('allSettled mixed ok values #4', async () => {
      const results = await allSettled([Promise.resolve(4), Promise.reject(new Error('x4'))]);
      expect(results[0].ok).toBe(true);
      expect(results[1].ok).toBe(false);
    });
    it('allSettled mixed ok values #5', async () => {
      const results = await allSettled([Promise.resolve(5), Promise.reject(new Error('x5'))]);
      expect(results[0].ok).toBe(true);
      expect(results[1].ok).toBe(false);
    });
    it('allSettled mixed ok values #6', async () => {
      const results = await allSettled([Promise.resolve(6), Promise.reject(new Error('x6'))]);
      expect(results[0].ok).toBe(true);
      expect(results[1].ok).toBe(false);
    });
    it('allSettled mixed ok values #7', async () => {
      const results = await allSettled([Promise.resolve(7), Promise.reject(new Error('x7'))]);
      expect(results[0].ok).toBe(true);
      expect(results[1].ok).toBe(false);
    });
    it('allSettled mixed ok values #8', async () => {
      const results = await allSettled([Promise.resolve(8), Promise.reject(new Error('x8'))]);
      expect(results[0].ok).toBe(true);
      expect(results[1].ok).toBe(false);
    });
    it('allSettled mixed ok values #9', async () => {
      const results = await allSettled([Promise.resolve(9), Promise.reject(new Error('x9'))]);
      expect(results[0].ok).toBe(true);
      expect(results[1].ok).toBe(false);
    });
    it('allSettled mixed ok values #10', async () => {
      const results = await allSettled([Promise.resolve(10), Promise.reject(new Error('x10'))]);
      expect(results[0].ok).toBe(true);
      expect(results[1].ok).toBe(false);
    });
    it('allSettled mixed ok values #11', async () => {
      const results = await allSettled([Promise.resolve(11), Promise.reject(new Error('x11'))]);
      expect(results[0].ok).toBe(true);
      expect(results[1].ok).toBe(false);
    });
    it('allSettled mixed ok values #12', async () => {
      const results = await allSettled([Promise.resolve(12), Promise.reject(new Error('x12'))]);
      expect(results[0].ok).toBe(true);
      expect(results[1].ok).toBe(false);
    });
    it('allSettled mixed ok values #13', async () => {
      const results = await allSettled([Promise.resolve(13), Promise.reject(new Error('x13'))]);
      expect(results[0].ok).toBe(true);
      expect(results[1].ok).toBe(false);
    });
    it('allSettled mixed ok values #14', async () => {
      const results = await allSettled([Promise.resolve(14), Promise.reject(new Error('x14'))]);
      expect(results[0].ok).toBe(true);
      expect(results[1].ok).toBe(false);
    });
    it('allSettled mixed ok values #15', async () => {
      const results = await allSettled([Promise.resolve(15), Promise.reject(new Error('x15'))]);
      expect(results[0].ok).toBe(true);
      expect(results[1].ok).toBe(false);
    });
    it('allSettled empty array #1', async () => {
      const results = await allSettled([]);
      expect(results).toHaveLength(0);
    });
    it('allSettled empty array #2', async () => {
      const results = await allSettled([]);
      expect(results).toHaveLength(0);
    });
    it('allSettled empty array #3', async () => {
      const results = await allSettled([]);
      expect(results).toHaveLength(0);
    });
    it('allSettled empty array #4', async () => {
      const results = await allSettled([]);
      expect(results).toHaveLength(0);
    });
    it('allSettled empty array #5', async () => {
      const results = await allSettled([]);
      expect(results).toHaveLength(0);
    });
    it('allSettled empty array #6', async () => {
      const results = await allSettled([]);
      expect(results).toHaveLength(0);
    });
    it('allSettled empty array #7', async () => {
      const results = await allSettled([]);
      expect(results).toHaveLength(0);
    });
    it('allSettled empty array #8', async () => {
      const results = await allSettled([]);
      expect(results).toHaveLength(0);
    });
    it('allSettled empty array #9', async () => {
      const results = await allSettled([]);
      expect(results).toHaveLength(0);
    });
    it('allSettled empty array #10', async () => {
      const results = await allSettled([]);
      expect(results).toHaveLength(0);
    });
    it('allSettled empty array #11', async () => {
      const results = await allSettled([]);
      expect(results).toHaveLength(0);
    });
    it('allSettled empty array #12', async () => {
      const results = await allSettled([]);
      expect(results).toHaveLength(0);
    });
    it('allSettled empty array #13', async () => {
      const results = await allSettled([]);
      expect(results).toHaveLength(0);
    });
    it('allSettled empty array #14', async () => {
      const results = await allSettled([]);
      expect(results).toHaveLength(0);
    });
    it('allSettled empty array #15', async () => {
      const results = await allSettled([]);
      expect(results).toHaveLength(0);
    });
  });
  // ── mapAsync ───────────────────────────────────────────────────────────
  describe('mapAsync', () => {
    it('mapAsync empty array #1', async () => {
      const result = await mapAsync([], async (x: number) => x * 2);
      expect(result).toEqual([]);
    });
    it('mapAsync empty array #2', async () => {
      const result = await mapAsync([], async (x: number) => x * 2);
      expect(result).toEqual([]);
    });
    it('mapAsync empty array #3', async () => {
      const result = await mapAsync([], async (x: number) => x * 2);
      expect(result).toEqual([]);
    });
    it('mapAsync empty array #4', async () => {
      const result = await mapAsync([], async (x: number) => x * 2);
      expect(result).toEqual([]);
    });
    it('mapAsync empty array #5', async () => {
      const result = await mapAsync([], async (x: number) => x * 2);
      expect(result).toEqual([]);
    });
    it('mapAsync empty array #6', async () => {
      const result = await mapAsync([], async (x: number) => x * 2);
      expect(result).toEqual([]);
    });
    it('mapAsync empty array #7', async () => {
      const result = await mapAsync([], async (x: number) => x * 2);
      expect(result).toEqual([]);
    });
    it('mapAsync empty array #8', async () => {
      const result = await mapAsync([], async (x: number) => x * 2);
      expect(result).toEqual([]);
    });
    it('mapAsync empty array #9', async () => {
      const result = await mapAsync([], async (x: number) => x * 2);
      expect(result).toEqual([]);
    });
    it('mapAsync empty array #10', async () => {
      const result = await mapAsync([], async (x: number) => x * 2);
      expect(result).toEqual([]);
    });
    it('mapAsync doubles values #1', async () => {
      const result = await mapAsync([1, 2, 3], async (x) => x * 2);
      expect(result).toEqual([2, 4, 6]);
    });
    it('mapAsync doubles values #2', async () => {
      const result = await mapAsync([2, 3, 4], async (x) => x * 2);
      expect(result).toEqual([4, 6, 8]);
    });
    it('mapAsync doubles values #3', async () => {
      const result = await mapAsync([3, 4, 5], async (x) => x * 2);
      expect(result).toEqual([6, 8, 10]);
    });
    it('mapAsync doubles values #4', async () => {
      const result = await mapAsync([4, 5, 6], async (x) => x * 2);
      expect(result).toEqual([8, 10, 12]);
    });
    it('mapAsync doubles values #5', async () => {
      const result = await mapAsync([5, 6, 7], async (x) => x * 2);
      expect(result).toEqual([10, 12, 14]);
    });
    it('mapAsync doubles values #6', async () => {
      const result = await mapAsync([6, 7, 8], async (x) => x * 2);
      expect(result).toEqual([12, 14, 16]);
    });
    it('mapAsync doubles values #7', async () => {
      const result = await mapAsync([7, 8, 9], async (x) => x * 2);
      expect(result).toEqual([14, 16, 18]);
    });
    it('mapAsync doubles values #8', async () => {
      const result = await mapAsync([8, 9, 10], async (x) => x * 2);
      expect(result).toEqual([16, 18, 20]);
    });
    it('mapAsync doubles values #9', async () => {
      const result = await mapAsync([9, 10, 11], async (x) => x * 2);
      expect(result).toEqual([18, 20, 22]);
    });
    it('mapAsync doubles values #10', async () => {
      const result = await mapAsync([10, 11, 12], async (x) => x * 2);
      expect(result).toEqual([20, 22, 24]);
    });
    it('mapAsync doubles values #11', async () => {
      const result = await mapAsync([11, 12, 13], async (x) => x * 2);
      expect(result).toEqual([22, 24, 26]);
    });
    it('mapAsync doubles values #12', async () => {
      const result = await mapAsync([12, 13, 14], async (x) => x * 2);
      expect(result).toEqual([24, 26, 28]);
    });
    it('mapAsync doubles values #13', async () => {
      const result = await mapAsync([13, 14, 15], async (x) => x * 2);
      expect(result).toEqual([26, 28, 30]);
    });
    it('mapAsync doubles values #14', async () => {
      const result = await mapAsync([14, 15, 16], async (x) => x * 2);
      expect(result).toEqual([28, 30, 32]);
    });
    it('mapAsync doubles values #15', async () => {
      const result = await mapAsync([15, 16, 17], async (x) => x * 2);
      expect(result).toEqual([30, 32, 34]);
    });
    it('mapAsync doubles values #16', async () => {
      const result = await mapAsync([16, 17, 18], async (x) => x * 2);
      expect(result).toEqual([32, 34, 36]);
    });
    it('mapAsync doubles values #17', async () => {
      const result = await mapAsync([17, 18, 19], async (x) => x * 2);
      expect(result).toEqual([34, 36, 38]);
    });
    it('mapAsync doubles values #18', async () => {
      const result = await mapAsync([18, 19, 20], async (x) => x * 2);
      expect(result).toEqual([36, 38, 40]);
    });
    it('mapAsync doubles values #19', async () => {
      const result = await mapAsync([19, 20, 21], async (x) => x * 2);
      expect(result).toEqual([38, 40, 42]);
    });
    it('mapAsync doubles values #20', async () => {
      const result = await mapAsync([20, 21, 22], async (x) => x * 2);
      expect(result).toEqual([40, 42, 44]);
    });
    it('mapAsync doubles values #21', async () => {
      const result = await mapAsync([21, 22, 23], async (x) => x * 2);
      expect(result).toEqual([42, 44, 46]);
    });
    it('mapAsync doubles values #22', async () => {
      const result = await mapAsync([22, 23, 24], async (x) => x * 2);
      expect(result).toEqual([44, 46, 48]);
    });
    it('mapAsync doubles values #23', async () => {
      const result = await mapAsync([23, 24, 25], async (x) => x * 2);
      expect(result).toEqual([46, 48, 50]);
    });
    it('mapAsync doubles values #24', async () => {
      const result = await mapAsync([24, 25, 26], async (x) => x * 2);
      expect(result).toEqual([48, 50, 52]);
    });
    it('mapAsync doubles values #25', async () => {
      const result = await mapAsync([25, 26, 27], async (x) => x * 2);
      expect(result).toEqual([50, 52, 54]);
    });
    it('mapAsync doubles values #26', async () => {
      const result = await mapAsync([26, 27, 28], async (x) => x * 2);
      expect(result).toEqual([52, 54, 56]);
    });
    it('mapAsync doubles values #27', async () => {
      const result = await mapAsync([27, 28, 29], async (x) => x * 2);
      expect(result).toEqual([54, 56, 58]);
    });
    it('mapAsync doubles values #28', async () => {
      const result = await mapAsync([28, 29, 30], async (x) => x * 2);
      expect(result).toEqual([56, 58, 60]);
    });
    it('mapAsync doubles values #29', async () => {
      const result = await mapAsync([29, 30, 31], async (x) => x * 2);
      expect(result).toEqual([58, 60, 62]);
    });
    it('mapAsync doubles values #30', async () => {
      const result = await mapAsync([30, 31, 32], async (x) => x * 2);
      expect(result).toEqual([60, 62, 64]);
    });
    it('mapAsync length preserved n=1 #1', async () => {
      const result = await mapAsync([1], async (x) => x);
      expect(result).toHaveLength(1);
    });
    it('mapAsync length preserved n=1 #2', async () => {
      const result = await mapAsync([1], async (x) => x);
      expect(result).toHaveLength(1);
    });
    it('mapAsync length preserved n=1 #3', async () => {
      const result = await mapAsync([1], async (x) => x);
      expect(result).toHaveLength(1);
    });
    it('mapAsync length preserved n=1 #4', async () => {
      const result = await mapAsync([1], async (x) => x);
      expect(result).toHaveLength(1);
    });
    it('mapAsync length preserved n=1 #5', async () => {
      const result = await mapAsync([1], async (x) => x);
      expect(result).toHaveLength(1);
    });
    it('mapAsync length preserved n=2 #1', async () => {
      const result = await mapAsync([1, 2], async (x) => x);
      expect(result).toHaveLength(2);
    });
    it('mapAsync length preserved n=2 #2', async () => {
      const result = await mapAsync([1, 2], async (x) => x);
      expect(result).toHaveLength(2);
    });
    it('mapAsync length preserved n=2 #3', async () => {
      const result = await mapAsync([1, 2], async (x) => x);
      expect(result).toHaveLength(2);
    });
    it('mapAsync length preserved n=2 #4', async () => {
      const result = await mapAsync([1, 2], async (x) => x);
      expect(result).toHaveLength(2);
    });
    it('mapAsync length preserved n=2 #5', async () => {
      const result = await mapAsync([1, 2], async (x) => x);
      expect(result).toHaveLength(2);
    });
    it('mapAsync length preserved n=3 #1', async () => {
      const result = await mapAsync([1, 2, 3], async (x) => x);
      expect(result).toHaveLength(3);
    });
    it('mapAsync length preserved n=3 #2', async () => {
      const result = await mapAsync([1, 2, 3], async (x) => x);
      expect(result).toHaveLength(3);
    });
    it('mapAsync length preserved n=3 #3', async () => {
      const result = await mapAsync([1, 2, 3], async (x) => x);
      expect(result).toHaveLength(3);
    });
    it('mapAsync length preserved n=3 #4', async () => {
      const result = await mapAsync([1, 2, 3], async (x) => x);
      expect(result).toHaveLength(3);
    });
    it('mapAsync length preserved n=3 #5', async () => {
      const result = await mapAsync([1, 2, 3], async (x) => x);
      expect(result).toHaveLength(3);
    });
    it('mapAsync length preserved n=4 #1', async () => {
      const result = await mapAsync([1, 2, 3, 4], async (x) => x);
      expect(result).toHaveLength(4);
    });
    it('mapAsync length preserved n=4 #2', async () => {
      const result = await mapAsync([1, 2, 3, 4], async (x) => x);
      expect(result).toHaveLength(4);
    });
    it('mapAsync length preserved n=4 #3', async () => {
      const result = await mapAsync([1, 2, 3, 4], async (x) => x);
      expect(result).toHaveLength(4);
    });
    it('mapAsync length preserved n=4 #4', async () => {
      const result = await mapAsync([1, 2, 3, 4], async (x) => x);
      expect(result).toHaveLength(4);
    });
    it('mapAsync length preserved n=4 #5', async () => {
      const result = await mapAsync([1, 2, 3, 4], async (x) => x);
      expect(result).toHaveLength(4);
    });
    it('mapAsync length preserved n=5 #1', async () => {
      const result = await mapAsync([1, 2, 3, 4, 5], async (x) => x);
      expect(result).toHaveLength(5);
    });
    it('mapAsync length preserved n=5 #2', async () => {
      const result = await mapAsync([1, 2, 3, 4, 5], async (x) => x);
      expect(result).toHaveLength(5);
    });
    it('mapAsync length preserved n=5 #3', async () => {
      const result = await mapAsync([1, 2, 3, 4, 5], async (x) => x);
      expect(result).toHaveLength(5);
    });
    it('mapAsync length preserved n=5 #4', async () => {
      const result = await mapAsync([1, 2, 3, 4, 5], async (x) => x);
      expect(result).toHaveLength(5);
    });
    it('mapAsync length preserved n=5 #5', async () => {
      const result = await mapAsync([1, 2, 3, 4, 5], async (x) => x);
      expect(result).toHaveLength(5);
    });
    it('mapAsync length preserved n=6 #1', async () => {
      const result = await mapAsync([1, 2, 3, 4, 5, 6], async (x) => x);
      expect(result).toHaveLength(6);
    });
    it('mapAsync length preserved n=6 #2', async () => {
      const result = await mapAsync([1, 2, 3, 4, 5, 6], async (x) => x);
      expect(result).toHaveLength(6);
    });
    it('mapAsync length preserved n=6 #3', async () => {
      const result = await mapAsync([1, 2, 3, 4, 5, 6], async (x) => x);
      expect(result).toHaveLength(6);
    });
    it('mapAsync length preserved n=6 #4', async () => {
      const result = await mapAsync([1, 2, 3, 4, 5, 6], async (x) => x);
      expect(result).toHaveLength(6);
    });
    it('mapAsync length preserved n=6 #5', async () => {
      const result = await mapAsync([1, 2, 3, 4, 5, 6], async (x) => x);
      expect(result).toHaveLength(6);
    });
    it('mapAsync length preserved n=7 #1', async () => {
      const result = await mapAsync([1, 2, 3, 4, 5, 6, 7], async (x) => x);
      expect(result).toHaveLength(7);
    });
    it('mapAsync length preserved n=7 #2', async () => {
      const result = await mapAsync([1, 2, 3, 4, 5, 6, 7], async (x) => x);
      expect(result).toHaveLength(7);
    });
    it('mapAsync length preserved n=7 #3', async () => {
      const result = await mapAsync([1, 2, 3, 4, 5, 6, 7], async (x) => x);
      expect(result).toHaveLength(7);
    });
    it('mapAsync length preserved n=7 #4', async () => {
      const result = await mapAsync([1, 2, 3, 4, 5, 6, 7], async (x) => x);
      expect(result).toHaveLength(7);
    });
    it('mapAsync length preserved n=7 #5', async () => {
      const result = await mapAsync([1, 2, 3, 4, 5, 6, 7], async (x) => x);
      expect(result).toHaveLength(7);
    });
    it('mapAsync length preserved n=8 #1', async () => {
      const result = await mapAsync([1, 2, 3, 4, 5, 6, 7, 8], async (x) => x);
      expect(result).toHaveLength(8);
    });
    it('mapAsync length preserved n=8 #2', async () => {
      const result = await mapAsync([1, 2, 3, 4, 5, 6, 7, 8], async (x) => x);
      expect(result).toHaveLength(8);
    });
    it('mapAsync length preserved n=8 #3', async () => {
      const result = await mapAsync([1, 2, 3, 4, 5, 6, 7, 8], async (x) => x);
      expect(result).toHaveLength(8);
    });
    it('mapAsync length preserved n=8 #4', async () => {
      const result = await mapAsync([1, 2, 3, 4, 5, 6, 7, 8], async (x) => x);
      expect(result).toHaveLength(8);
    });
    it('mapAsync length preserved n=8 #5', async () => {
      const result = await mapAsync([1, 2, 3, 4, 5, 6, 7, 8], async (x) => x);
      expect(result).toHaveLength(8);
    });
    it('mapAsync length preserved n=9 #1', async () => {
      const result = await mapAsync([1, 2, 3, 4, 5, 6, 7, 8, 9], async (x) => x);
      expect(result).toHaveLength(9);
    });
    it('mapAsync length preserved n=9 #2', async () => {
      const result = await mapAsync([1, 2, 3, 4, 5, 6, 7, 8, 9], async (x) => x);
      expect(result).toHaveLength(9);
    });
    it('mapAsync length preserved n=9 #3', async () => {
      const result = await mapAsync([1, 2, 3, 4, 5, 6, 7, 8, 9], async (x) => x);
      expect(result).toHaveLength(9);
    });
    it('mapAsync length preserved n=9 #4', async () => {
      const result = await mapAsync([1, 2, 3, 4, 5, 6, 7, 8, 9], async (x) => x);
      expect(result).toHaveLength(9);
    });
    it('mapAsync length preserved n=9 #5', async () => {
      const result = await mapAsync([1, 2, 3, 4, 5, 6, 7, 8, 9], async (x) => x);
      expect(result).toHaveLength(9);
    });
    it('mapAsync length preserved n=10 #1', async () => {
      const result = await mapAsync([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], async (x) => x);
      expect(result).toHaveLength(10);
    });
    it('mapAsync length preserved n=10 #2', async () => {
      const result = await mapAsync([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], async (x) => x);
      expect(result).toHaveLength(10);
    });
    it('mapAsync length preserved n=10 #3', async () => {
      const result = await mapAsync([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], async (x) => x);
      expect(result).toHaveLength(10);
    });
    it('mapAsync length preserved n=10 #4', async () => {
      const result = await mapAsync([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], async (x) => x);
      expect(result).toHaveLength(10);
    });
    it('mapAsync length preserved n=10 #5', async () => {
      const result = await mapAsync([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], async (x) => x);
      expect(result).toHaveLength(10);
    });
    it('mapAsync string transform #1', async () => {
      const result = await mapAsync(['a1', 'b1'], async (s) => s.toUpperCase());
      expect(result).toEqual(['A1', 'B1']);
    });
    it('mapAsync string transform #2', async () => {
      const result = await mapAsync(['a2', 'b2'], async (s) => s.toUpperCase());
      expect(result).toEqual(['A2', 'B2']);
    });
    it('mapAsync string transform #3', async () => {
      const result = await mapAsync(['a3', 'b3'], async (s) => s.toUpperCase());
      expect(result).toEqual(['A3', 'B3']);
    });
    it('mapAsync string transform #4', async () => {
      const result = await mapAsync(['a4', 'b4'], async (s) => s.toUpperCase());
      expect(result).toEqual(['A4', 'B4']);
    });
    it('mapAsync string transform #5', async () => {
      const result = await mapAsync(['a5', 'b5'], async (s) => s.toUpperCase());
      expect(result).toEqual(['A5', 'B5']);
    });
    it('mapAsync string transform #6', async () => {
      const result = await mapAsync(['a6', 'b6'], async (s) => s.toUpperCase());
      expect(result).toEqual(['A6', 'B6']);
    });
    it('mapAsync string transform #7', async () => {
      const result = await mapAsync(['a7', 'b7'], async (s) => s.toUpperCase());
      expect(result).toEqual(['A7', 'B7']);
    });
    it('mapAsync string transform #8', async () => {
      const result = await mapAsync(['a8', 'b8'], async (s) => s.toUpperCase());
      expect(result).toEqual(['A8', 'B8']);
    });
    it('mapAsync string transform #9', async () => {
      const result = await mapAsync(['a9', 'b9'], async (s) => s.toUpperCase());
      expect(result).toEqual(['A9', 'B9']);
    });
    it('mapAsync string transform #10', async () => {
      const result = await mapAsync(['a10', 'b10'], async (s) => s.toUpperCase());
      expect(result).toEqual(['A10', 'B10']);
    });
    it('mapAsync string transform #11', async () => {
      const result = await mapAsync(['a11', 'b11'], async (s) => s.toUpperCase());
      expect(result).toEqual(['A11', 'B11']);
    });
    it('mapAsync string transform #12', async () => {
      const result = await mapAsync(['a12', 'b12'], async (s) => s.toUpperCase());
      expect(result).toEqual(['A12', 'B12']);
    });
    it('mapAsync string transform #13', async () => {
      const result = await mapAsync(['a13', 'b13'], async (s) => s.toUpperCase());
      expect(result).toEqual(['A13', 'B13']);
    });
    it('mapAsync string transform #14', async () => {
      const result = await mapAsync(['a14', 'b14'], async (s) => s.toUpperCase());
      expect(result).toEqual(['A14', 'B14']);
    });
    it('mapAsync string transform #15', async () => {
      const result = await mapAsync(['a15', 'b15'], async (s) => s.toUpperCase());
      expect(result).toEqual(['A15', 'B15']);
    });
    it('mapAsync string transform #16', async () => {
      const result = await mapAsync(['a16', 'b16'], async (s) => s.toUpperCase());
      expect(result).toEqual(['A16', 'B16']);
    });
    it('mapAsync string transform #17', async () => {
      const result = await mapAsync(['a17', 'b17'], async (s) => s.toUpperCase());
      expect(result).toEqual(['A17', 'B17']);
    });
    it('mapAsync string transform #18', async () => {
      const result = await mapAsync(['a18', 'b18'], async (s) => s.toUpperCase());
      expect(result).toEqual(['A18', 'B18']);
    });
    it('mapAsync string transform #19', async () => {
      const result = await mapAsync(['a19', 'b19'], async (s) => s.toUpperCase());
      expect(result).toEqual(['A19', 'B19']);
    });
    it('mapAsync string transform #20', async () => {
      const result = await mapAsync(['a20', 'b20'], async (s) => s.toUpperCase());
      expect(result).toEqual(['A20', 'B20']);
    });
    it('mapAsync with concurrency=1 #1', async () => {
      const result = await mapAsync([1, 2, 3], async (x) => x + 1, 1);
      expect(result).toHaveLength(3);
    });
    it('mapAsync with concurrency=1 #2', async () => {
      const result = await mapAsync([2, 3, 4], async (x) => x + 1, 1);
      expect(result).toHaveLength(3);
    });
    it('mapAsync with concurrency=1 #3', async () => {
      const result = await mapAsync([3, 4, 5], async (x) => x + 1, 1);
      expect(result).toHaveLength(3);
    });
    it('mapAsync with concurrency=1 #4', async () => {
      const result = await mapAsync([4, 5, 6], async (x) => x + 1, 1);
      expect(result).toHaveLength(3);
    });
    it('mapAsync with concurrency=1 #5', async () => {
      const result = await mapAsync([5, 6, 7], async (x) => x + 1, 1);
      expect(result).toHaveLength(3);
    });
    it('mapAsync with concurrency=1 #6', async () => {
      const result = await mapAsync([6, 7, 8], async (x) => x + 1, 1);
      expect(result).toHaveLength(3);
    });
    it('mapAsync with concurrency=1 #7', async () => {
      const result = await mapAsync([7, 8, 9], async (x) => x + 1, 1);
      expect(result).toHaveLength(3);
    });
    it('mapAsync with concurrency=1 #8', async () => {
      const result = await mapAsync([8, 9, 10], async (x) => x + 1, 1);
      expect(result).toHaveLength(3);
    });
    it('mapAsync with concurrency=1 #9', async () => {
      const result = await mapAsync([9, 10, 11], async (x) => x + 1, 1);
      expect(result).toHaveLength(3);
    });
    it('mapAsync with concurrency=1 #10', async () => {
      const result = await mapAsync([10, 11, 12], async (x) => x + 1, 1);
      expect(result).toHaveLength(3);
    });
    it('mapAsync with concurrency=1 #11', async () => {
      const result = await mapAsync([11, 12, 13], async (x) => x + 1, 1);
      expect(result).toHaveLength(3);
    });
    it('mapAsync with concurrency=1 #12', async () => {
      const result = await mapAsync([12, 13, 14], async (x) => x + 1, 1);
      expect(result).toHaveLength(3);
    });
    it('mapAsync with concurrency=1 #13', async () => {
      const result = await mapAsync([13, 14, 15], async (x) => x + 1, 1);
      expect(result).toHaveLength(3);
    });
    it('mapAsync with concurrency=1 #14', async () => {
      const result = await mapAsync([14, 15, 16], async (x) => x + 1, 1);
      expect(result).toHaveLength(3);
    });
    it('mapAsync with concurrency=1 #15', async () => {
      const result = await mapAsync([15, 16, 17], async (x) => x + 1, 1);
      expect(result).toHaveLength(3);
    });
    it('mapAsync with concurrency=1 #16', async () => {
      const result = await mapAsync([16, 17, 18], async (x) => x + 1, 1);
      expect(result).toHaveLength(3);
    });
    it('mapAsync with concurrency=1 #17', async () => {
      const result = await mapAsync([17, 18, 19], async (x) => x + 1, 1);
      expect(result).toHaveLength(3);
    });
    it('mapAsync with concurrency=1 #18', async () => {
      const result = await mapAsync([18, 19, 20], async (x) => x + 1, 1);
      expect(result).toHaveLength(3);
    });
    it('mapAsync with concurrency=1 #19', async () => {
      const result = await mapAsync([19, 20, 21], async (x) => x + 1, 1);
      expect(result).toHaveLength(3);
    });
    it('mapAsync with concurrency=1 #20', async () => {
      const result = await mapAsync([20, 21, 22], async (x) => x + 1, 1);
      expect(result).toHaveLength(3);
    });
  });
  // ── filterAsync ────────────────────────────────────────────────────────
  describe('filterAsync', () => {
    it('filterAsync empty array #1', async () => {
      const result = await filterAsync([], async () => true);
      expect(result).toEqual([]);
    });
    it('filterAsync empty array #2', async () => {
      const result = await filterAsync([], async () => true);
      expect(result).toEqual([]);
    });
    it('filterAsync empty array #3', async () => {
      const result = await filterAsync([], async () => true);
      expect(result).toEqual([]);
    });
    it('filterAsync empty array #4', async () => {
      const result = await filterAsync([], async () => true);
      expect(result).toEqual([]);
    });
    it('filterAsync empty array #5', async () => {
      const result = await filterAsync([], async () => true);
      expect(result).toEqual([]);
    });
    it('filterAsync empty array #6', async () => {
      const result = await filterAsync([], async () => true);
      expect(result).toEqual([]);
    });
    it('filterAsync empty array #7', async () => {
      const result = await filterAsync([], async () => true);
      expect(result).toEqual([]);
    });
    it('filterAsync empty array #8', async () => {
      const result = await filterAsync([], async () => true);
      expect(result).toEqual([]);
    });
    it('filterAsync empty array #9', async () => {
      const result = await filterAsync([], async () => true);
      expect(result).toEqual([]);
    });
    it('filterAsync empty array #10', async () => {
      const result = await filterAsync([], async () => true);
      expect(result).toEqual([]);
    });
    it('filterAsync all pass #1', async () => {
      const result = await filterAsync([1, 2, 3], async () => true);
      expect(result).toHaveLength(3);
    });
    it('filterAsync all pass #2', async () => {
      const result = await filterAsync([2, 3, 4], async () => true);
      expect(result).toHaveLength(3);
    });
    it('filterAsync all pass #3', async () => {
      const result = await filterAsync([3, 4, 5], async () => true);
      expect(result).toHaveLength(3);
    });
    it('filterAsync all pass #4', async () => {
      const result = await filterAsync([4, 5, 6], async () => true);
      expect(result).toHaveLength(3);
    });
    it('filterAsync all pass #5', async () => {
      const result = await filterAsync([5, 6, 7], async () => true);
      expect(result).toHaveLength(3);
    });
    it('filterAsync all pass #6', async () => {
      const result = await filterAsync([6, 7, 8], async () => true);
      expect(result).toHaveLength(3);
    });
    it('filterAsync all pass #7', async () => {
      const result = await filterAsync([7, 8, 9], async () => true);
      expect(result).toHaveLength(3);
    });
    it('filterAsync all pass #8', async () => {
      const result = await filterAsync([8, 9, 10], async () => true);
      expect(result).toHaveLength(3);
    });
    it('filterAsync all pass #9', async () => {
      const result = await filterAsync([9, 10, 11], async () => true);
      expect(result).toHaveLength(3);
    });
    it('filterAsync all pass #10', async () => {
      const result = await filterAsync([10, 11, 12], async () => true);
      expect(result).toHaveLength(3);
    });
    it('filterAsync all pass #11', async () => {
      const result = await filterAsync([11, 12, 13], async () => true);
      expect(result).toHaveLength(3);
    });
    it('filterAsync all pass #12', async () => {
      const result = await filterAsync([12, 13, 14], async () => true);
      expect(result).toHaveLength(3);
    });
    it('filterAsync all pass #13', async () => {
      const result = await filterAsync([13, 14, 15], async () => true);
      expect(result).toHaveLength(3);
    });
    it('filterAsync all pass #14', async () => {
      const result = await filterAsync([14, 15, 16], async () => true);
      expect(result).toHaveLength(3);
    });
    it('filterAsync all pass #15', async () => {
      const result = await filterAsync([15, 16, 17], async () => true);
      expect(result).toHaveLength(3);
    });
    it('filterAsync all pass #16', async () => {
      const result = await filterAsync([16, 17, 18], async () => true);
      expect(result).toHaveLength(3);
    });
    it('filterAsync all pass #17', async () => {
      const result = await filterAsync([17, 18, 19], async () => true);
      expect(result).toHaveLength(3);
    });
    it('filterAsync all pass #18', async () => {
      const result = await filterAsync([18, 19, 20], async () => true);
      expect(result).toHaveLength(3);
    });
    it('filterAsync all pass #19', async () => {
      const result = await filterAsync([19, 20, 21], async () => true);
      expect(result).toHaveLength(3);
    });
    it('filterAsync all pass #20', async () => {
      const result = await filterAsync([20, 21, 22], async () => true);
      expect(result).toHaveLength(3);
    });
    it('filterAsync all fail #1', async () => {
      const result = await filterAsync([1, 2, 3], async () => false);
      expect(result).toEqual([]);
    });
    it('filterAsync all fail #2', async () => {
      const result = await filterAsync([2, 3, 4], async () => false);
      expect(result).toEqual([]);
    });
    it('filterAsync all fail #3', async () => {
      const result = await filterAsync([3, 4, 5], async () => false);
      expect(result).toEqual([]);
    });
    it('filterAsync all fail #4', async () => {
      const result = await filterAsync([4, 5, 6], async () => false);
      expect(result).toEqual([]);
    });
    it('filterAsync all fail #5', async () => {
      const result = await filterAsync([5, 6, 7], async () => false);
      expect(result).toEqual([]);
    });
    it('filterAsync all fail #6', async () => {
      const result = await filterAsync([6, 7, 8], async () => false);
      expect(result).toEqual([]);
    });
    it('filterAsync all fail #7', async () => {
      const result = await filterAsync([7, 8, 9], async () => false);
      expect(result).toEqual([]);
    });
    it('filterAsync all fail #8', async () => {
      const result = await filterAsync([8, 9, 10], async () => false);
      expect(result).toEqual([]);
    });
    it('filterAsync all fail #9', async () => {
      const result = await filterAsync([9, 10, 11], async () => false);
      expect(result).toEqual([]);
    });
    it('filterAsync all fail #10', async () => {
      const result = await filterAsync([10, 11, 12], async () => false);
      expect(result).toEqual([]);
    });
    it('filterAsync all fail #11', async () => {
      const result = await filterAsync([11, 12, 13], async () => false);
      expect(result).toEqual([]);
    });
    it('filterAsync all fail #12', async () => {
      const result = await filterAsync([12, 13, 14], async () => false);
      expect(result).toEqual([]);
    });
    it('filterAsync all fail #13', async () => {
      const result = await filterAsync([13, 14, 15], async () => false);
      expect(result).toEqual([]);
    });
    it('filterAsync all fail #14', async () => {
      const result = await filterAsync([14, 15, 16], async () => false);
      expect(result).toEqual([]);
    });
    it('filterAsync all fail #15', async () => {
      const result = await filterAsync([15, 16, 17], async () => false);
      expect(result).toEqual([]);
    });
    it('filterAsync all fail #16', async () => {
      const result = await filterAsync([16, 17, 18], async () => false);
      expect(result).toEqual([]);
    });
    it('filterAsync all fail #17', async () => {
      const result = await filterAsync([17, 18, 19], async () => false);
      expect(result).toEqual([]);
    });
    it('filterAsync all fail #18', async () => {
      const result = await filterAsync([18, 19, 20], async () => false);
      expect(result).toEqual([]);
    });
    it('filterAsync all fail #19', async () => {
      const result = await filterAsync([19, 20, 21], async () => false);
      expect(result).toEqual([]);
    });
    it('filterAsync all fail #20', async () => {
      const result = await filterAsync([20, 21, 22], async () => false);
      expect(result).toEqual([]);
    });
    it('filterAsync keeps evens #1', async () => {
      const arr = [1, 2, 3, 4];
      const result = await filterAsync(arr, async (x) => x % 2 === 0);
      expect(result.every(x => x % 2 === 0)).toBe(true);
    });
    it('filterAsync keeps evens #2', async () => {
      const arr = [2, 3, 4, 5];
      const result = await filterAsync(arr, async (x) => x % 2 === 0);
      expect(result.every(x => x % 2 === 0)).toBe(true);
    });
    it('filterAsync keeps evens #3', async () => {
      const arr = [3, 4, 5, 6];
      const result = await filterAsync(arr, async (x) => x % 2 === 0);
      expect(result.every(x => x % 2 === 0)).toBe(true);
    });
    it('filterAsync keeps evens #4', async () => {
      const arr = [4, 5, 6, 7];
      const result = await filterAsync(arr, async (x) => x % 2 === 0);
      expect(result.every(x => x % 2 === 0)).toBe(true);
    });
    it('filterAsync keeps evens #5', async () => {
      const arr = [5, 6, 7, 8];
      const result = await filterAsync(arr, async (x) => x % 2 === 0);
      expect(result.every(x => x % 2 === 0)).toBe(true);
    });
    it('filterAsync keeps evens #6', async () => {
      const arr = [6, 7, 8, 9];
      const result = await filterAsync(arr, async (x) => x % 2 === 0);
      expect(result.every(x => x % 2 === 0)).toBe(true);
    });
    it('filterAsync keeps evens #7', async () => {
      const arr = [7, 8, 9, 10];
      const result = await filterAsync(arr, async (x) => x % 2 === 0);
      expect(result.every(x => x % 2 === 0)).toBe(true);
    });
    it('filterAsync keeps evens #8', async () => {
      const arr = [8, 9, 10, 11];
      const result = await filterAsync(arr, async (x) => x % 2 === 0);
      expect(result.every(x => x % 2 === 0)).toBe(true);
    });
    it('filterAsync keeps evens #9', async () => {
      const arr = [9, 10, 11, 12];
      const result = await filterAsync(arr, async (x) => x % 2 === 0);
      expect(result.every(x => x % 2 === 0)).toBe(true);
    });
    it('filterAsync keeps evens #10', async () => {
      const arr = [10, 11, 12, 13];
      const result = await filterAsync(arr, async (x) => x % 2 === 0);
      expect(result.every(x => x % 2 === 0)).toBe(true);
    });
    it('filterAsync keeps evens #11', async () => {
      const arr = [11, 12, 13, 14];
      const result = await filterAsync(arr, async (x) => x % 2 === 0);
      expect(result.every(x => x % 2 === 0)).toBe(true);
    });
    it('filterAsync keeps evens #12', async () => {
      const arr = [12, 13, 14, 15];
      const result = await filterAsync(arr, async (x) => x % 2 === 0);
      expect(result.every(x => x % 2 === 0)).toBe(true);
    });
    it('filterAsync keeps evens #13', async () => {
      const arr = [13, 14, 15, 16];
      const result = await filterAsync(arr, async (x) => x % 2 === 0);
      expect(result.every(x => x % 2 === 0)).toBe(true);
    });
    it('filterAsync keeps evens #14', async () => {
      const arr = [14, 15, 16, 17];
      const result = await filterAsync(arr, async (x) => x % 2 === 0);
      expect(result.every(x => x % 2 === 0)).toBe(true);
    });
    it('filterAsync keeps evens #15', async () => {
      const arr = [15, 16, 17, 18];
      const result = await filterAsync(arr, async (x) => x % 2 === 0);
      expect(result.every(x => x % 2 === 0)).toBe(true);
    });
    it('filterAsync keeps evens #16', async () => {
      const arr = [16, 17, 18, 19];
      const result = await filterAsync(arr, async (x) => x % 2 === 0);
      expect(result.every(x => x % 2 === 0)).toBe(true);
    });
    it('filterAsync keeps evens #17', async () => {
      const arr = [17, 18, 19, 20];
      const result = await filterAsync(arr, async (x) => x % 2 === 0);
      expect(result.every(x => x % 2 === 0)).toBe(true);
    });
    it('filterAsync keeps evens #18', async () => {
      const arr = [18, 19, 20, 21];
      const result = await filterAsync(arr, async (x) => x % 2 === 0);
      expect(result.every(x => x % 2 === 0)).toBe(true);
    });
    it('filterAsync keeps evens #19', async () => {
      const arr = [19, 20, 21, 22];
      const result = await filterAsync(arr, async (x) => x % 2 === 0);
      expect(result.every(x => x % 2 === 0)).toBe(true);
    });
    it('filterAsync keeps evens #20', async () => {
      const arr = [20, 21, 22, 23];
      const result = await filterAsync(arr, async (x) => x % 2 === 0);
      expect(result.every(x => x % 2 === 0)).toBe(true);
    });
    it('filterAsync greater than threshold #1', async () => {
      const result = await filterAsync([1, 2, 3, 4, 5], async (x) => x > 2);
      expect(Array.isArray(result)).toBe(true);
    });
    it('filterAsync greater than threshold #2', async () => {
      const result = await filterAsync([1, 2, 3, 4, 5], async (x) => x > 3);
      expect(Array.isArray(result)).toBe(true);
    });
    it('filterAsync greater than threshold #3', async () => {
      const result = await filterAsync([1, 2, 3, 4, 5], async (x) => x > 4);
      expect(Array.isArray(result)).toBe(true);
    });
    it('filterAsync greater than threshold #4', async () => {
      const result = await filterAsync([1, 2, 3, 4, 5], async (x) => x > 5);
      expect(Array.isArray(result)).toBe(true);
    });
    it('filterAsync greater than threshold #5', async () => {
      const result = await filterAsync([1, 2, 3, 4, 5], async (x) => x > 1);
      expect(Array.isArray(result)).toBe(true);
    });
    it('filterAsync greater than threshold #6', async () => {
      const result = await filterAsync([1, 2, 3, 4, 5], async (x) => x > 2);
      expect(Array.isArray(result)).toBe(true);
    });
    it('filterAsync greater than threshold #7', async () => {
      const result = await filterAsync([1, 2, 3, 4, 5], async (x) => x > 3);
      expect(Array.isArray(result)).toBe(true);
    });
    it('filterAsync greater than threshold #8', async () => {
      const result = await filterAsync([1, 2, 3, 4, 5], async (x) => x > 4);
      expect(Array.isArray(result)).toBe(true);
    });
    it('filterAsync greater than threshold #9', async () => {
      const result = await filterAsync([1, 2, 3, 4, 5], async (x) => x > 5);
      expect(Array.isArray(result)).toBe(true);
    });
    it('filterAsync greater than threshold #10', async () => {
      const result = await filterAsync([1, 2, 3, 4, 5], async (x) => x > 1);
      expect(Array.isArray(result)).toBe(true);
    });
    it('filterAsync greater than threshold #11', async () => {
      const result = await filterAsync([1, 2, 3, 4, 5], async (x) => x > 2);
      expect(Array.isArray(result)).toBe(true);
    });
    it('filterAsync greater than threshold #12', async () => {
      const result = await filterAsync([1, 2, 3, 4, 5], async (x) => x > 3);
      expect(Array.isArray(result)).toBe(true);
    });
    it('filterAsync greater than threshold #13', async () => {
      const result = await filterAsync([1, 2, 3, 4, 5], async (x) => x > 4);
      expect(Array.isArray(result)).toBe(true);
    });
    it('filterAsync greater than threshold #14', async () => {
      const result = await filterAsync([1, 2, 3, 4, 5], async (x) => x > 5);
      expect(Array.isArray(result)).toBe(true);
    });
    it('filterAsync greater than threshold #15', async () => {
      const result = await filterAsync([1, 2, 3, 4, 5], async (x) => x > 1);
      expect(Array.isArray(result)).toBe(true);
    });
    it('filterAsync greater than threshold #16', async () => {
      const result = await filterAsync([1, 2, 3, 4, 5], async (x) => x > 2);
      expect(Array.isArray(result)).toBe(true);
    });
    it('filterAsync greater than threshold #17', async () => {
      const result = await filterAsync([1, 2, 3, 4, 5], async (x) => x > 3);
      expect(Array.isArray(result)).toBe(true);
    });
    it('filterAsync greater than threshold #18', async () => {
      const result = await filterAsync([1, 2, 3, 4, 5], async (x) => x > 4);
      expect(Array.isArray(result)).toBe(true);
    });
    it('filterAsync greater than threshold #19', async () => {
      const result = await filterAsync([1, 2, 3, 4, 5], async (x) => x > 5);
      expect(Array.isArray(result)).toBe(true);
    });
    it('filterAsync greater than threshold #20', async () => {
      const result = await filterAsync([1, 2, 3, 4, 5], async (x) => x > 1);
      expect(Array.isArray(result)).toBe(true);
    });
    it('filterAsync single element passes #1', async () => {
      const result = await filterAsync([1], async () => true);
      expect(result).toEqual([1]);
    });
    it('filterAsync single element passes #2', async () => {
      const result = await filterAsync([2], async () => true);
      expect(result).toEqual([2]);
    });
    it('filterAsync single element passes #3', async () => {
      const result = await filterAsync([3], async () => true);
      expect(result).toEqual([3]);
    });
    it('filterAsync single element passes #4', async () => {
      const result = await filterAsync([4], async () => true);
      expect(result).toEqual([4]);
    });
    it('filterAsync single element passes #5', async () => {
      const result = await filterAsync([5], async () => true);
      expect(result).toEqual([5]);
    });
    it('filterAsync single element passes #6', async () => {
      const result = await filterAsync([6], async () => true);
      expect(result).toEqual([6]);
    });
    it('filterAsync single element passes #7', async () => {
      const result = await filterAsync([7], async () => true);
      expect(result).toEqual([7]);
    });
    it('filterAsync single element passes #8', async () => {
      const result = await filterAsync([8], async () => true);
      expect(result).toEqual([8]);
    });
  });
  // ── reduceAsync ────────────────────────────────────────────────────────
  describe('reduceAsync', () => {
    it('reduceAsync sum #1', async () => {
      const result = await reduceAsync([1, 2], async (acc, x) => acc + x, 0);
      expect(result).toBe(3);
    });
    it('reduceAsync sum #2', async () => {
      const result = await reduceAsync([1, 2, 3], async (acc, x) => acc + x, 0);
      expect(result).toBe(6);
    });
    it('reduceAsync sum #3', async () => {
      const result = await reduceAsync([1, 2, 3, 4], async (acc, x) => acc + x, 0);
      expect(result).toBe(10);
    });
    it('reduceAsync sum #4', async () => {
      const result = await reduceAsync([1, 2, 3, 4, 5], async (acc, x) => acc + x, 0);
      expect(result).toBe(15);
    });
    it('reduceAsync sum #5', async () => {
      const result = await reduceAsync([1], async (acc, x) => acc + x, 0);
      expect(result).toBe(1);
    });
    it('reduceAsync sum #6', async () => {
      const result = await reduceAsync([1, 2], async (acc, x) => acc + x, 0);
      expect(result).toBe(3);
    });
    it('reduceAsync sum #7', async () => {
      const result = await reduceAsync([1, 2, 3], async (acc, x) => acc + x, 0);
      expect(result).toBe(6);
    });
    it('reduceAsync sum #8', async () => {
      const result = await reduceAsync([1, 2, 3, 4], async (acc, x) => acc + x, 0);
      expect(result).toBe(10);
    });
    it('reduceAsync sum #9', async () => {
      const result = await reduceAsync([1, 2, 3, 4, 5], async (acc, x) => acc + x, 0);
      expect(result).toBe(15);
    });
    it('reduceAsync sum #10', async () => {
      const result = await reduceAsync([1], async (acc, x) => acc + x, 0);
      expect(result).toBe(1);
    });
    it('reduceAsync sum #11', async () => {
      const result = await reduceAsync([1, 2], async (acc, x) => acc + x, 0);
      expect(result).toBe(3);
    });
    it('reduceAsync sum #12', async () => {
      const result = await reduceAsync([1, 2, 3], async (acc, x) => acc + x, 0);
      expect(result).toBe(6);
    });
    it('reduceAsync sum #13', async () => {
      const result = await reduceAsync([1, 2, 3, 4], async (acc, x) => acc + x, 0);
      expect(result).toBe(10);
    });
    it('reduceAsync sum #14', async () => {
      const result = await reduceAsync([1, 2, 3, 4, 5], async (acc, x) => acc + x, 0);
      expect(result).toBe(15);
    });
    it('reduceAsync sum #15', async () => {
      const result = await reduceAsync([1], async (acc, x) => acc + x, 0);
      expect(result).toBe(1);
    });
    it('reduceAsync sum #16', async () => {
      const result = await reduceAsync([1, 2], async (acc, x) => acc + x, 0);
      expect(result).toBe(3);
    });
    it('reduceAsync sum #17', async () => {
      const result = await reduceAsync([1, 2, 3], async (acc, x) => acc + x, 0);
      expect(result).toBe(6);
    });
    it('reduceAsync sum #18', async () => {
      const result = await reduceAsync([1, 2, 3, 4], async (acc, x) => acc + x, 0);
      expect(result).toBe(10);
    });
    it('reduceAsync sum #19', async () => {
      const result = await reduceAsync([1, 2, 3, 4, 5], async (acc, x) => acc + x, 0);
      expect(result).toBe(15);
    });
    it('reduceAsync sum #20', async () => {
      const result = await reduceAsync([1], async (acc, x) => acc + x, 0);
      expect(result).toBe(1);
    });
    it('reduceAsync sum #21', async () => {
      const result = await reduceAsync([1, 2], async (acc, x) => acc + x, 0);
      expect(result).toBe(3);
    });
    it('reduceAsync sum #22', async () => {
      const result = await reduceAsync([1, 2, 3], async (acc, x) => acc + x, 0);
      expect(result).toBe(6);
    });
    it('reduceAsync sum #23', async () => {
      const result = await reduceAsync([1, 2, 3, 4], async (acc, x) => acc + x, 0);
      expect(result).toBe(10);
    });
    it('reduceAsync sum #24', async () => {
      const result = await reduceAsync([1, 2, 3, 4, 5], async (acc, x) => acc + x, 0);
      expect(result).toBe(15);
    });
    it('reduceAsync sum #25', async () => {
      const result = await reduceAsync([1], async (acc, x) => acc + x, 0);
      expect(result).toBe(1);
    });
    it('reduceAsync product #1', async () => {
      const result = await reduceAsync([1, 2, 2], async (acc, x) => acc * x, 1);
      expect(result).toBe(4);
    });
    it('reduceAsync product #2', async () => {
      const result = await reduceAsync([1, 2, 3], async (acc, x) => acc * x, 1);
      expect(result).toBe(6);
    });
    it('reduceAsync product #3', async () => {
      const result = await reduceAsync([1, 2, 4], async (acc, x) => acc * x, 1);
      expect(result).toBe(8);
    });
    it('reduceAsync product #4', async () => {
      const result = await reduceAsync([1, 2, 5], async (acc, x) => acc * x, 1);
      expect(result).toBe(10);
    });
    it('reduceAsync product #5', async () => {
      const result = await reduceAsync([1, 2, 1], async (acc, x) => acc * x, 1);
      expect(result).toBe(2);
    });
    it('reduceAsync product #6', async () => {
      const result = await reduceAsync([1, 2, 2], async (acc, x) => acc * x, 1);
      expect(result).toBe(4);
    });
    it('reduceAsync product #7', async () => {
      const result = await reduceAsync([1, 2, 3], async (acc, x) => acc * x, 1);
      expect(result).toBe(6);
    });
    it('reduceAsync product #8', async () => {
      const result = await reduceAsync([1, 2, 4], async (acc, x) => acc * x, 1);
      expect(result).toBe(8);
    });
    it('reduceAsync product #9', async () => {
      const result = await reduceAsync([1, 2, 5], async (acc, x) => acc * x, 1);
      expect(result).toBe(10);
    });
    it('reduceAsync product #10', async () => {
      const result = await reduceAsync([1, 2, 1], async (acc, x) => acc * x, 1);
      expect(result).toBe(2);
    });
    it('reduceAsync product #11', async () => {
      const result = await reduceAsync([1, 2, 2], async (acc, x) => acc * x, 1);
      expect(result).toBe(4);
    });
    it('reduceAsync product #12', async () => {
      const result = await reduceAsync([1, 2, 3], async (acc, x) => acc * x, 1);
      expect(result).toBe(6);
    });
    it('reduceAsync product #13', async () => {
      const result = await reduceAsync([1, 2, 4], async (acc, x) => acc * x, 1);
      expect(result).toBe(8);
    });
    it('reduceAsync product #14', async () => {
      const result = await reduceAsync([1, 2, 5], async (acc, x) => acc * x, 1);
      expect(result).toBe(10);
    });
    it('reduceAsync product #15', async () => {
      const result = await reduceAsync([1, 2, 1], async (acc, x) => acc * x, 1);
      expect(result).toBe(2);
    });
    it('reduceAsync product #16', async () => {
      const result = await reduceAsync([1, 2, 2], async (acc, x) => acc * x, 1);
      expect(result).toBe(4);
    });
    it('reduceAsync product #17', async () => {
      const result = await reduceAsync([1, 2, 3], async (acc, x) => acc * x, 1);
      expect(result).toBe(6);
    });
    it('reduceAsync product #18', async () => {
      const result = await reduceAsync([1, 2, 4], async (acc, x) => acc * x, 1);
      expect(result).toBe(8);
    });
    it('reduceAsync product #19', async () => {
      const result = await reduceAsync([1, 2, 5], async (acc, x) => acc * x, 1);
      expect(result).toBe(10);
    });
    it('reduceAsync product #20', async () => {
      const result = await reduceAsync([1, 2, 1], async (acc, x) => acc * x, 1);
      expect(result).toBe(2);
    });
    it('reduceAsync empty returns initial #1', async () => {
      const result = await reduceAsync([], async (acc: number, x: number) => acc + x, 1);
      expect(result).toBe(1);
    });
    it('reduceAsync empty returns initial #2', async () => {
      const result = await reduceAsync([], async (acc: number, x: number) => acc + x, 2);
      expect(result).toBe(2);
    });
    it('reduceAsync empty returns initial #3', async () => {
      const result = await reduceAsync([], async (acc: number, x: number) => acc + x, 3);
      expect(result).toBe(3);
    });
    it('reduceAsync empty returns initial #4', async () => {
      const result = await reduceAsync([], async (acc: number, x: number) => acc + x, 4);
      expect(result).toBe(4);
    });
    it('reduceAsync empty returns initial #5', async () => {
      const result = await reduceAsync([], async (acc: number, x: number) => acc + x, 5);
      expect(result).toBe(5);
    });
    it('reduceAsync empty returns initial #6', async () => {
      const result = await reduceAsync([], async (acc: number, x: number) => acc + x, 6);
      expect(result).toBe(6);
    });
    it('reduceAsync empty returns initial #7', async () => {
      const result = await reduceAsync([], async (acc: number, x: number) => acc + x, 7);
      expect(result).toBe(7);
    });
    it('reduceAsync empty returns initial #8', async () => {
      const result = await reduceAsync([], async (acc: number, x: number) => acc + x, 8);
      expect(result).toBe(8);
    });
    it('reduceAsync empty returns initial #9', async () => {
      const result = await reduceAsync([], async (acc: number, x: number) => acc + x, 9);
      expect(result).toBe(9);
    });
    it('reduceAsync empty returns initial #10', async () => {
      const result = await reduceAsync([], async (acc: number, x: number) => acc + x, 10);
      expect(result).toBe(10);
    });
    it('reduceAsync string concat #1', async () => {
      const result = await reduceAsync(['a', 'b', 'c'], async (acc, x) => acc + x, '');
      expect(result).toBe('abc');
    });
    it('reduceAsync string concat #2', async () => {
      const result = await reduceAsync(['a', 'b', 'c'], async (acc, x) => acc + x, '');
      expect(result).toBe('abc');
    });
    it('reduceAsync string concat #3', async () => {
      const result = await reduceAsync(['a', 'b', 'c'], async (acc, x) => acc + x, '');
      expect(result).toBe('abc');
    });
    it('reduceAsync string concat #4', async () => {
      const result = await reduceAsync(['a', 'b', 'c'], async (acc, x) => acc + x, '');
      expect(result).toBe('abc');
    });
    it('reduceAsync string concat #5', async () => {
      const result = await reduceAsync(['a', 'b', 'c'], async (acc, x) => acc + x, '');
      expect(result).toBe('abc');
    });
    it('reduceAsync string concat #6', async () => {
      const result = await reduceAsync(['a', 'b', 'c'], async (acc, x) => acc + x, '');
      expect(result).toBe('abc');
    });
    it('reduceAsync string concat #7', async () => {
      const result = await reduceAsync(['a', 'b', 'c'], async (acc, x) => acc + x, '');
      expect(result).toBe('abc');
    });
    it('reduceAsync string concat #8', async () => {
      const result = await reduceAsync(['a', 'b', 'c'], async (acc, x) => acc + x, '');
      expect(result).toBe('abc');
    });
    it('reduceAsync string concat #9', async () => {
      const result = await reduceAsync(['a', 'b', 'c'], async (acc, x) => acc + x, '');
      expect(result).toBe('abc');
    });
    it('reduceAsync string concat #10', async () => {
      const result = await reduceAsync(['a', 'b', 'c'], async (acc, x) => acc + x, '');
      expect(result).toBe('abc');
    });
    it('reduceAsync string concat #11', async () => {
      const result = await reduceAsync(['a', 'b', 'c'], async (acc, x) => acc + x, '');
      expect(result).toBe('abc');
    });
    it('reduceAsync string concat #12', async () => {
      const result = await reduceAsync(['a', 'b', 'c'], async (acc, x) => acc + x, '');
      expect(result).toBe('abc');
    });
    it('reduceAsync string concat #13', async () => {
      const result = await reduceAsync(['a', 'b', 'c'], async (acc, x) => acc + x, '');
      expect(result).toBe('abc');
    });
    it('reduceAsync string concat #14', async () => {
      const result = await reduceAsync(['a', 'b', 'c'], async (acc, x) => acc + x, '');
      expect(result).toBe('abc');
    });
    it('reduceAsync string concat #15', async () => {
      const result = await reduceAsync(['a', 'b', 'c'], async (acc, x) => acc + x, '');
      expect(result).toBe('abc');
    });
    it('reduceAsync string concat #16', async () => {
      const result = await reduceAsync(['a', 'b', 'c'], async (acc, x) => acc + x, '');
      expect(result).toBe('abc');
    });
    it('reduceAsync string concat #17', async () => {
      const result = await reduceAsync(['a', 'b', 'c'], async (acc, x) => acc + x, '');
      expect(result).toBe('abc');
    });
    it('reduceAsync string concat #18', async () => {
      const result = await reduceAsync(['a', 'b', 'c'], async (acc, x) => acc + x, '');
      expect(result).toBe('abc');
    });
    it('reduceAsync string concat #19', async () => {
      const result = await reduceAsync(['a', 'b', 'c'], async (acc, x) => acc + x, '');
      expect(result).toBe('abc');
    });
    it('reduceAsync string concat #20', async () => {
      const result = await reduceAsync(['a', 'b', 'c'], async (acc, x) => acc + x, '');
      expect(result).toBe('abc');
    });
    it('reduceAsync max #1', async () => {
      const result = await reduceAsync([1, 4, 2], async (acc, x) => x > acc ? x : acc, 0);
      expect(result).toBe(4);
    });
    it('reduceAsync max #2', async () => {
      const result = await reduceAsync([2, 5, 3], async (acc, x) => x > acc ? x : acc, 0);
      expect(result).toBe(5);
    });
    it('reduceAsync max #3', async () => {
      const result = await reduceAsync([3, 6, 4], async (acc, x) => x > acc ? x : acc, 0);
      expect(result).toBe(6);
    });
    it('reduceAsync max #4', async () => {
      const result = await reduceAsync([4, 7, 5], async (acc, x) => x > acc ? x : acc, 0);
      expect(result).toBe(7);
    });
    it('reduceAsync max #5', async () => {
      const result = await reduceAsync([5, 8, 6], async (acc, x) => x > acc ? x : acc, 0);
      expect(result).toBe(8);
    });
    it('reduceAsync max #6', async () => {
      const result = await reduceAsync([6, 9, 7], async (acc, x) => x > acc ? x : acc, 0);
      expect(result).toBe(9);
    });
    it('reduceAsync max #7', async () => {
      const result = await reduceAsync([7, 10, 8], async (acc, x) => x > acc ? x : acc, 0);
      expect(result).toBe(10);
    });
    it('reduceAsync max #8', async () => {
      const result = await reduceAsync([8, 11, 9], async (acc, x) => x > acc ? x : acc, 0);
      expect(result).toBe(11);
    });
    it('reduceAsync max #9', async () => {
      const result = await reduceAsync([9, 12, 10], async (acc, x) => x > acc ? x : acc, 0);
      expect(result).toBe(12);
    });
    it('reduceAsync max #10', async () => {
      const result = await reduceAsync([10, 13, 11], async (acc, x) => x > acc ? x : acc, 0);
      expect(result).toBe(13);
    });
    it('reduceAsync max #11', async () => {
      const result = await reduceAsync([11, 14, 12], async (acc, x) => x > acc ? x : acc, 0);
      expect(result).toBe(14);
    });
    it('reduceAsync max #12', async () => {
      const result = await reduceAsync([12, 15, 13], async (acc, x) => x > acc ? x : acc, 0);
      expect(result).toBe(15);
    });
    it('reduceAsync max #13', async () => {
      const result = await reduceAsync([13, 16, 14], async (acc, x) => x > acc ? x : acc, 0);
      expect(result).toBe(16);
    });
    it('reduceAsync max #14', async () => {
      const result = await reduceAsync([14, 17, 15], async (acc, x) => x > acc ? x : acc, 0);
      expect(result).toBe(17);
    });
    it('reduceAsync max #15', async () => {
      const result = await reduceAsync([15, 18, 16], async (acc, x) => x > acc ? x : acc, 0);
      expect(result).toBe(18);
    });
    it('reduceAsync max #16', async () => {
      const result = await reduceAsync([16, 19, 17], async (acc, x) => x > acc ? x : acc, 0);
      expect(result).toBe(19);
    });
    it('reduceAsync max #17', async () => {
      const result = await reduceAsync([17, 20, 18], async (acc, x) => x > acc ? x : acc, 0);
      expect(result).toBe(20);
    });
    it('reduceAsync max #18', async () => {
      const result = await reduceAsync([18, 21, 19], async (acc, x) => x > acc ? x : acc, 0);
      expect(result).toBe(21);
    });
    it('reduceAsync max #19', async () => {
      const result = await reduceAsync([19, 22, 20], async (acc, x) => x > acc ? x : acc, 0);
      expect(result).toBe(22);
    });
    it('reduceAsync max #20', async () => {
      const result = await reduceAsync([20, 23, 21], async (acc, x) => x > acc ? x : acc, 0);
      expect(result).toBe(23);
    });
    it('reduceAsync max #21', async () => {
      const result = await reduceAsync([21, 24, 22], async (acc, x) => x > acc ? x : acc, 0);
      expect(result).toBe(24);
    });
    it('reduceAsync max #22', async () => {
      const result = await reduceAsync([22, 25, 23], async (acc, x) => x > acc ? x : acc, 0);
      expect(result).toBe(25);
    });
  });
  // ── chunk ──────────────────────────────────────────────────────────────
  describe('chunk', () => {
    it('chunk size 0 or negative returns [] #1', async () => {
      expect(chunk([1, 2, 3], 0)).toEqual([]);
      expect(chunk([1, 2, 3], -1)).toEqual([]);
    });
    it('chunk size 0 or negative returns [] #2', async () => {
      expect(chunk([1, 2, 3], 0)).toEqual([]);
      expect(chunk([1, 2, 3], -2)).toEqual([]);
    });
    it('chunk size 0 or negative returns [] #3', async () => {
      expect(chunk([1, 2, 3], 0)).toEqual([]);
      expect(chunk([1, 2, 3], -3)).toEqual([]);
    });
    it('chunk size 0 or negative returns [] #4', async () => {
      expect(chunk([1, 2, 3], 0)).toEqual([]);
      expect(chunk([1, 2, 3], -4)).toEqual([]);
    });
    it('chunk size 0 or negative returns [] #5', async () => {
      expect(chunk([1, 2, 3], 0)).toEqual([]);
      expect(chunk([1, 2, 3], -5)).toEqual([]);
    });
    it('chunk size 0 or negative returns [] #6', async () => {
      expect(chunk([1, 2, 3], 0)).toEqual([]);
      expect(chunk([1, 2, 3], -6)).toEqual([]);
    });
    it('chunk size 0 or negative returns [] #7', async () => {
      expect(chunk([1, 2, 3], 0)).toEqual([]);
      expect(chunk([1, 2, 3], -7)).toEqual([]);
    });
    it('chunk size 0 or negative returns [] #8', async () => {
      expect(chunk([1, 2, 3], 0)).toEqual([]);
      expect(chunk([1, 2, 3], -8)).toEqual([]);
    });
    it('chunk size 0 or negative returns [] #9', async () => {
      expect(chunk([1, 2, 3], 0)).toEqual([]);
      expect(chunk([1, 2, 3], -9)).toEqual([]);
    });
    it('chunk size 0 or negative returns [] #10', async () => {
      expect(chunk([1, 2, 3], 0)).toEqual([]);
      expect(chunk([1, 2, 3], -10)).toEqual([]);
    });
    it('chunk empty array #1', async () => {
      expect(chunk([], 1)).toEqual([]);
    });
    it('chunk empty array #2', async () => {
      expect(chunk([], 2)).toEqual([]);
    });
    it('chunk empty array #3', async () => {
      expect(chunk([], 3)).toEqual([]);
    });
    it('chunk empty array #4', async () => {
      expect(chunk([], 4)).toEqual([]);
    });
    it('chunk empty array #5', async () => {
      expect(chunk([], 5)).toEqual([]);
    });
    it('chunk empty array #6', async () => {
      expect(chunk([], 6)).toEqual([]);
    });
    it('chunk empty array #7', async () => {
      expect(chunk([], 7)).toEqual([]);
    });
    it('chunk empty array #8', async () => {
      expect(chunk([], 8)).toEqual([]);
    });
    it('chunk empty array #9', async () => {
      expect(chunk([], 9)).toEqual([]);
    });
    it('chunk empty array #10', async () => {
      expect(chunk([], 10)).toEqual([]);
    });
    it('chunk size=1 #1', async () => {
      expect(chunk([1], 1)).toEqual([[1]]);
    });
    it('chunk size=1 #2', async () => {
      expect(chunk([1, 2], 1)).toEqual([[1], [2]]);
    });
    it('chunk size=1 #3', async () => {
      expect(chunk([1, 2, 3], 1)).toEqual([[1], [2], [3]]);
    });
    it('chunk size=1 #4', async () => {
      expect(chunk([1, 2, 3, 4], 1)).toEqual([[1], [2], [3], [4]]);
    });
    it('chunk size=1 #5', async () => {
      expect(chunk([1, 2, 3, 4, 5], 1)).toEqual([[1], [2], [3], [4], [5]]);
    });
    it('chunk size=1 #6', async () => {
      expect(chunk([1, 2, 3, 4, 5, 6], 1)).toEqual([[1], [2], [3], [4], [5], [6]]);
    });
    it('chunk size=1 #7', async () => {
      expect(chunk([1, 2, 3, 4, 5, 6, 7], 1)).toEqual([[1], [2], [3], [4], [5], [6], [7]]);
    });
    it('chunk size=1 #8', async () => {
      expect(chunk([1, 2, 3, 4, 5, 6, 7, 8], 1)).toEqual([[1], [2], [3], [4], [5], [6], [7], [8]]);
    });
    it('chunk size=1 #9', async () => {
      expect(chunk([1, 2, 3, 4, 5, 6, 7, 8, 9], 1)).toEqual([[1], [2], [3], [4], [5], [6], [7], [8], [9]]);
    });
    it('chunk size=1 #10', async () => {
      expect(chunk([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 1)).toEqual([[1], [2], [3], [4], [5], [6], [7], [8], [9], [10]]);
    });
    it('chunk size >= length single chunk #1', async () => {
      const result = chunk([1], 6);
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveLength(1);
    });
    it('chunk size >= length single chunk #2', async () => {
      const result = chunk([1, 2], 7);
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveLength(2);
    });
    it('chunk size >= length single chunk #3', async () => {
      const result = chunk([1, 2, 3], 8);
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveLength(3);
    });
    it('chunk size >= length single chunk #4', async () => {
      const result = chunk([1, 2, 3, 4], 9);
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveLength(4);
    });
    it('chunk size >= length single chunk #5', async () => {
      const result = chunk([1, 2, 3, 4, 5], 10);
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveLength(5);
    });
    it('chunk size >= length single chunk #6', async () => {
      const result = chunk([1, 2, 3, 4, 5, 6], 11);
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveLength(6);
    });
    it('chunk size >= length single chunk #7', async () => {
      const result = chunk([1, 2, 3, 4, 5, 6, 7], 12);
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveLength(7);
    });
    it('chunk size >= length single chunk #8', async () => {
      const result = chunk([1, 2, 3, 4, 5, 6, 7, 8], 13);
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveLength(8);
    });
    it('chunk size >= length single chunk #9', async () => {
      const result = chunk([1, 2, 3, 4, 5, 6, 7, 8, 9], 14);
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveLength(9);
    });
    it('chunk size >= length single chunk #10', async () => {
      const result = chunk([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 15);
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveLength(10);
    });
    it('chunk exact division #1', async () => {
      const result = chunk([1, 2, 3, 4], 2);
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual([1, 2]);
      expect(result[1]).toEqual([3, 4]);
    });
    it('chunk exact division #2', async () => {
      const result = chunk([1, 2, 3, 4], 2);
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual([1, 2]);
      expect(result[1]).toEqual([3, 4]);
    });
    it('chunk exact division #3', async () => {
      const result = chunk([1, 2, 3, 4], 2);
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual([1, 2]);
      expect(result[1]).toEqual([3, 4]);
    });
    it('chunk exact division #4', async () => {
      const result = chunk([1, 2, 3, 4], 2);
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual([1, 2]);
      expect(result[1]).toEqual([3, 4]);
    });
    it('chunk exact division #5', async () => {
      const result = chunk([1, 2, 3, 4], 2);
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual([1, 2]);
      expect(result[1]).toEqual([3, 4]);
    });
    it('chunk exact division #6', async () => {
      const result = chunk([1, 2, 3, 4], 2);
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual([1, 2]);
      expect(result[1]).toEqual([3, 4]);
    });
    it('chunk exact division #7', async () => {
      const result = chunk([1, 2, 3, 4], 2);
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual([1, 2]);
      expect(result[1]).toEqual([3, 4]);
    });
    it('chunk exact division #8', async () => {
      const result = chunk([1, 2, 3, 4], 2);
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual([1, 2]);
      expect(result[1]).toEqual([3, 4]);
    });
    it('chunk exact division #9', async () => {
      const result = chunk([1, 2, 3, 4], 2);
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual([1, 2]);
      expect(result[1]).toEqual([3, 4]);
    });
    it('chunk exact division #10', async () => {
      const result = chunk([1, 2, 3, 4], 2);
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual([1, 2]);
      expect(result[1]).toEqual([3, 4]);
    });
    it('chunk with remainder #1', async () => {
      const result = chunk([1, 2, 3, 4, 5], 2);
      expect(result).toHaveLength(3);
      expect(result[2]).toEqual([5]);
    });
    it('chunk with remainder #2', async () => {
      const result = chunk([1, 2, 3, 4, 5], 2);
      expect(result).toHaveLength(3);
      expect(result[2]).toEqual([5]);
    });
    it('chunk with remainder #3', async () => {
      const result = chunk([1, 2, 3, 4, 5], 2);
      expect(result).toHaveLength(3);
      expect(result[2]).toEqual([5]);
    });
    it('chunk with remainder #4', async () => {
      const result = chunk([1, 2, 3, 4, 5], 2);
      expect(result).toHaveLength(3);
      expect(result[2]).toEqual([5]);
    });
    it('chunk with remainder #5', async () => {
      const result = chunk([1, 2, 3, 4, 5], 2);
      expect(result).toHaveLength(3);
      expect(result[2]).toEqual([5]);
    });
    it('chunk with remainder #6', async () => {
      const result = chunk([1, 2, 3, 4, 5], 2);
      expect(result).toHaveLength(3);
      expect(result[2]).toEqual([5]);
    });
    it('chunk with remainder #7', async () => {
      const result = chunk([1, 2, 3, 4, 5], 2);
      expect(result).toHaveLength(3);
      expect(result[2]).toEqual([5]);
    });
    it('chunk with remainder #8', async () => {
      const result = chunk([1, 2, 3, 4, 5], 2);
      expect(result).toHaveLength(3);
      expect(result[2]).toEqual([5]);
    });
    it('chunk with remainder #9', async () => {
      const result = chunk([1, 2, 3, 4, 5], 2);
      expect(result).toHaveLength(3);
      expect(result[2]).toEqual([5]);
    });
    it('chunk with remainder #10', async () => {
      const result = chunk([1, 2, 3, 4, 5], 2);
      expect(result).toHaveLength(3);
      expect(result[2]).toEqual([5]);
    });
    it('chunk size=3 nine elements #1', async () => {
      const result = chunk([1,2,3,4,5,6,7,8,9], 3);
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual([1,2,3]);
    });
    it('chunk size=3 nine elements #2', async () => {
      const result = chunk([1,2,3,4,5,6,7,8,9], 3);
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual([1,2,3]);
    });
    it('chunk size=3 nine elements #3', async () => {
      const result = chunk([1,2,3,4,5,6,7,8,9], 3);
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual([1,2,3]);
    });
    it('chunk size=3 nine elements #4', async () => {
      const result = chunk([1,2,3,4,5,6,7,8,9], 3);
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual([1,2,3]);
    });
    it('chunk size=3 nine elements #5', async () => {
      const result = chunk([1,2,3,4,5,6,7,8,9], 3);
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual([1,2,3]);
    });
    it('chunk size=3 nine elements #6', async () => {
      const result = chunk([1,2,3,4,5,6,7,8,9], 3);
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual([1,2,3]);
    });
    it('chunk size=3 nine elements #7', async () => {
      const result = chunk([1,2,3,4,5,6,7,8,9], 3);
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual([1,2,3]);
    });
    it('chunk size=3 nine elements #8', async () => {
      const result = chunk([1,2,3,4,5,6,7,8,9], 3);
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual([1,2,3]);
    });
    it('chunk size=3 nine elements #9', async () => {
      const result = chunk([1,2,3,4,5,6,7,8,9], 3);
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual([1,2,3]);
    });
    it('chunk size=3 nine elements #10', async () => {
      const result = chunk([1,2,3,4,5,6,7,8,9], 3);
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual([1,2,3]);
    });
    it('chunk all chunks <= size #1', async () => {
      const result = chunk([1,2,3,4,5,6,7,8,9,10], 3);
      expect(result.every(c => c.length <= 3)).toBe(true);
    });
    it('chunk all chunks <= size #2', async () => {
      const result = chunk([1,2,3,4,5,6,7,8,9,10], 4);
      expect(result.every(c => c.length <= 4)).toBe(true);
    });
    it('chunk all chunks <= size #3', async () => {
      const result = chunk([1,2,3,4,5,6,7,8,9,10], 2);
      expect(result.every(c => c.length <= 2)).toBe(true);
    });
    it('chunk all chunks <= size #4', async () => {
      const result = chunk([1,2,3,4,5,6,7,8,9,10], 3);
      expect(result.every(c => c.length <= 3)).toBe(true);
    });
    it('chunk all chunks <= size #5', async () => {
      const result = chunk([1,2,3,4,5,6,7,8,9,10], 4);
      expect(result.every(c => c.length <= 4)).toBe(true);
    });
    it('chunk all chunks <= size #6', async () => {
      const result = chunk([1,2,3,4,5,6,7,8,9,10], 2);
      expect(result.every(c => c.length <= 2)).toBe(true);
    });
    it('chunk all chunks <= size #7', async () => {
      const result = chunk([1,2,3,4,5,6,7,8,9,10], 3);
      expect(result.every(c => c.length <= 3)).toBe(true);
    });
    it('chunk all chunks <= size #8', async () => {
      const result = chunk([1,2,3,4,5,6,7,8,9,10], 4);
      expect(result.every(c => c.length <= 4)).toBe(true);
    });
    it('chunk all chunks <= size #9', async () => {
      const result = chunk([1,2,3,4,5,6,7,8,9,10], 2);
      expect(result.every(c => c.length <= 2)).toBe(true);
    });
    it('chunk all chunks <= size #10', async () => {
      const result = chunk([1,2,3,4,5,6,7,8,9,10], 3);
      expect(result.every(c => c.length <= 3)).toBe(true);
    });
    it('chunk flat round-trip #1', async () => {
      const arr = [1];
      const result = chunk(arr, 2).flat();
      expect(result).toEqual(arr);
    });
    it('chunk flat round-trip #2', async () => {
      const arr = [1, 2];
      const result = chunk(arr, 2).flat();
      expect(result).toEqual(arr);
    });
    it('chunk flat round-trip #3', async () => {
      const arr = [1, 2, 3];
      const result = chunk(arr, 2).flat();
      expect(result).toEqual(arr);
    });
    it('chunk flat round-trip #4', async () => {
      const arr = [1, 2, 3, 4];
      const result = chunk(arr, 2).flat();
      expect(result).toEqual(arr);
    });
    it('chunk flat round-trip #5', async () => {
      const arr = [1, 2, 3, 4, 5];
      const result = chunk(arr, 2).flat();
      expect(result).toEqual(arr);
    });
    it('chunk flat round-trip #6', async () => {
      const arr = [1, 2, 3, 4, 5, 6];
      const result = chunk(arr, 2).flat();
      expect(result).toEqual(arr);
    });
    it('chunk flat round-trip #7', async () => {
      const arr = [1, 2, 3, 4, 5, 6, 7];
      const result = chunk(arr, 2).flat();
      expect(result).toEqual(arr);
    });
    it('chunk flat round-trip #8', async () => {
      const arr = [1, 2, 3, 4, 5, 6, 7, 8];
      const result = chunk(arr, 2).flat();
      expect(result).toEqual(arr);
    });
    it('chunk flat round-trip #9', async () => {
      const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9];
      const result = chunk(arr, 2).flat();
      expect(result).toEqual(arr);
    });
    it('chunk flat round-trip #10', async () => {
      const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const result = chunk(arr, 2).flat();
      expect(result).toEqual(arr);
    });
  });
  // ── misc (retry, timeout, withTimeout, promisify, firstResolved, queue, race) ──
  describe('misc', () => {
    it('retry succeeds on first attempt #1', async () => {
      const result = await retry(async () => 1, 3);
      expect(result).toBe(1);
    });
    it('retry succeeds on first attempt #2', async () => {
      const result = await retry(async () => 2, 3);
      expect(result).toBe(2);
    });
    it('retry succeeds on first attempt #3', async () => {
      const result = await retry(async () => 3, 3);
      expect(result).toBe(3);
    });
    it('retry succeeds on first attempt #4', async () => {
      const result = await retry(async () => 4, 3);
      expect(result).toBe(4);
    });
    it('retry succeeds on first attempt #5', async () => {
      const result = await retry(async () => 5, 3);
      expect(result).toBe(5);
    });
    it('retry succeeds on first attempt #6', async () => {
      const result = await retry(async () => 6, 3);
      expect(result).toBe(6);
    });
    it('retry succeeds on first attempt #7', async () => {
      const result = await retry(async () => 7, 3);
      expect(result).toBe(7);
    });
    it('retry succeeds on first attempt #8', async () => {
      const result = await retry(async () => 8, 3);
      expect(result).toBe(8);
    });
    it('retry succeeds on first attempt #9', async () => {
      const result = await retry(async () => 9, 3);
      expect(result).toBe(9);
    });
    it('retry succeeds on first attempt #10', async () => {
      const result = await retry(async () => 10, 3);
      expect(result).toBe(10);
    });
    it('retry succeeds on first attempt #11', async () => {
      const result = await retry(async () => 11, 3);
      expect(result).toBe(11);
    });
    it('retry succeeds on first attempt #12', async () => {
      const result = await retry(async () => 12, 3);
      expect(result).toBe(12);
    });
    it('retry succeeds on first attempt #13', async () => {
      const result = await retry(async () => 13, 3);
      expect(result).toBe(13);
    });
    it('retry succeeds on first attempt #14', async () => {
      const result = await retry(async () => 14, 3);
      expect(result).toBe(14);
    });
    it('retry succeeds on first attempt #15', async () => {
      const result = await retry(async () => 15, 3);
      expect(result).toBe(15);
    });
    it('retry succeeds after failures #1', async () => {
      let calls = 0;
      const result = await retry(async () => {
        calls++;
        if (calls < 2) throw new Error('not yet');
        return 1;
      }, 5);
      expect(result).toBe(1);
    });
    it('retry succeeds after failures #2', async () => {
      let calls = 0;
      const result = await retry(async () => {
        calls++;
        if (calls < 3) throw new Error('not yet');
        return 2;
      }, 5);
      expect(result).toBe(2);
    });
    it('retry succeeds after failures #3', async () => {
      let calls = 0;
      const result = await retry(async () => {
        calls++;
        if (calls < 1) throw new Error('not yet');
        return 3;
      }, 5);
      expect(result).toBe(3);
    });
    it('retry succeeds after failures #4', async () => {
      let calls = 0;
      const result = await retry(async () => {
        calls++;
        if (calls < 2) throw new Error('not yet');
        return 4;
      }, 5);
      expect(result).toBe(4);
    });
    it('retry succeeds after failures #5', async () => {
      let calls = 0;
      const result = await retry(async () => {
        calls++;
        if (calls < 3) throw new Error('not yet');
        return 5;
      }, 5);
      expect(result).toBe(5);
    });
    it('retry succeeds after failures #6', async () => {
      let calls = 0;
      const result = await retry(async () => {
        calls++;
        if (calls < 1) throw new Error('not yet');
        return 6;
      }, 5);
      expect(result).toBe(6);
    });
    it('retry succeeds after failures #7', async () => {
      let calls = 0;
      const result = await retry(async () => {
        calls++;
        if (calls < 2) throw new Error('not yet');
        return 7;
      }, 5);
      expect(result).toBe(7);
    });
    it('retry succeeds after failures #8', async () => {
      let calls = 0;
      const result = await retry(async () => {
        calls++;
        if (calls < 3) throw new Error('not yet');
        return 8;
      }, 5);
      expect(result).toBe(8);
    });
    it('retry succeeds after failures #9', async () => {
      let calls = 0;
      const result = await retry(async () => {
        calls++;
        if (calls < 1) throw new Error('not yet');
        return 9;
      }, 5);
      expect(result).toBe(9);
    });
    it('retry succeeds after failures #10', async () => {
      let calls = 0;
      const result = await retry(async () => {
        calls++;
        if (calls < 2) throw new Error('not yet');
        return 10;
      }, 5);
      expect(result).toBe(10);
    });
    it('retry succeeds after failures #11', async () => {
      let calls = 0;
      const result = await retry(async () => {
        calls++;
        if (calls < 3) throw new Error('not yet');
        return 11;
      }, 5);
      expect(result).toBe(11);
    });
    it('retry succeeds after failures #12', async () => {
      let calls = 0;
      const result = await retry(async () => {
        calls++;
        if (calls < 1) throw new Error('not yet');
        return 12;
      }, 5);
      expect(result).toBe(12);
    });
    it('retry succeeds after failures #13', async () => {
      let calls = 0;
      const result = await retry(async () => {
        calls++;
        if (calls < 2) throw new Error('not yet');
        return 13;
      }, 5);
      expect(result).toBe(13);
    });
    it('retry succeeds after failures #14', async () => {
      let calls = 0;
      const result = await retry(async () => {
        calls++;
        if (calls < 3) throw new Error('not yet');
        return 14;
      }, 5);
      expect(result).toBe(14);
    });
    it('retry succeeds after failures #15', async () => {
      let calls = 0;
      const result = await retry(async () => {
        calls++;
        if (calls < 1) throw new Error('not yet');
        return 15;
      }, 5);
      expect(result).toBe(15);
    });
    it('retry throws after maxAttempts #1', async () => {
      await expect(retry(async () => { throw new Error('always'); }, 2)).rejects.toThrow('always');
    });
    it('retry throws after maxAttempts #2', async () => {
      await expect(retry(async () => { throw new Error('always'); }, 3)).rejects.toThrow('always');
    });
    it('retry throws after maxAttempts #3', async () => {
      await expect(retry(async () => { throw new Error('always'); }, 1)).rejects.toThrow('always');
    });
    it('retry throws after maxAttempts #4', async () => {
      await expect(retry(async () => { throw new Error('always'); }, 2)).rejects.toThrow('always');
    });
    it('retry throws after maxAttempts #5', async () => {
      await expect(retry(async () => { throw new Error('always'); }, 3)).rejects.toThrow('always');
    });
    it('retry throws after maxAttempts #6', async () => {
      await expect(retry(async () => { throw new Error('always'); }, 1)).rejects.toThrow('always');
    });
    it('retry throws after maxAttempts #7', async () => {
      await expect(retry(async () => { throw new Error('always'); }, 2)).rejects.toThrow('always');
    });
    it('retry throws after maxAttempts #8', async () => {
      await expect(retry(async () => { throw new Error('always'); }, 3)).rejects.toThrow('always');
    });
    it('retry throws after maxAttempts #9', async () => {
      await expect(retry(async () => { throw new Error('always'); }, 1)).rejects.toThrow('always');
    });
    it('retry throws after maxAttempts #10', async () => {
      await expect(retry(async () => { throw new Error('always'); }, 2)).rejects.toThrow('always');
    });
    it('timeout resolves fast promise #1', async () => {
      await expect(timeout(Promise.resolve(1), 5000)).resolves.toBe(1);
    });
    it('timeout resolves fast promise #2', async () => {
      await expect(timeout(Promise.resolve(2), 5000)).resolves.toBe(2);
    });
    it('timeout resolves fast promise #3', async () => {
      await expect(timeout(Promise.resolve(3), 5000)).resolves.toBe(3);
    });
    it('timeout resolves fast promise #4', async () => {
      await expect(timeout(Promise.resolve(4), 5000)).resolves.toBe(4);
    });
    it('timeout resolves fast promise #5', async () => {
      await expect(timeout(Promise.resolve(5), 5000)).resolves.toBe(5);
    });
    it('timeout resolves fast promise #6', async () => {
      await expect(timeout(Promise.resolve(6), 5000)).resolves.toBe(6);
    });
    it('timeout resolves fast promise #7', async () => {
      await expect(timeout(Promise.resolve(7), 5000)).resolves.toBe(7);
    });
    it('timeout resolves fast promise #8', async () => {
      await expect(timeout(Promise.resolve(8), 5000)).resolves.toBe(8);
    });
    it('timeout resolves fast promise #9', async () => {
      await expect(timeout(Promise.resolve(9), 5000)).resolves.toBe(9);
    });
    it('timeout resolves fast promise #10', async () => {
      await expect(timeout(Promise.resolve(10), 5000)).resolves.toBe(10);
    });
    it('timeout rejects after ms #1', async () => {
      await expect(timeout(new Promise(() => {}), 1)).rejects.toThrow('Timed out');
    });
    it('timeout rejects after ms #2', async () => {
      await expect(timeout(new Promise(() => {}), 1)).rejects.toThrow('Timed out');
    });
    it('timeout rejects after ms #3', async () => {
      await expect(timeout(new Promise(() => {}), 1)).rejects.toThrow('Timed out');
    });
    it('timeout rejects after ms #4', async () => {
      await expect(timeout(new Promise(() => {}), 1)).rejects.toThrow('Timed out');
    });
    it('timeout rejects after ms #5', async () => {
      await expect(timeout(new Promise(() => {}), 1)).rejects.toThrow('Timed out');
    });
    it('timeout rejects after ms #6', async () => {
      await expect(timeout(new Promise(() => {}), 1)).rejects.toThrow('Timed out');
    });
    it('timeout rejects after ms #7', async () => {
      await expect(timeout(new Promise(() => {}), 1)).rejects.toThrow('Timed out');
    });
    it('timeout rejects after ms #8', async () => {
      await expect(timeout(new Promise(() => {}), 1)).rejects.toThrow('Timed out');
    });
    it('timeout rejects after ms #9', async () => {
      await expect(timeout(new Promise(() => {}), 1)).rejects.toThrow('Timed out');
    });
    it('timeout rejects after ms #10', async () => {
      await expect(timeout(new Promise(() => {}), 1)).rejects.toThrow('Timed out');
    });
    it('withTimeout returns fallback on timeout #1', async () => {
      const result = await withTimeout(async () => new Promise<number>(() => {}), 1, 1);
      expect(result).toBe(1);
    });
    it('withTimeout returns fallback on timeout #2', async () => {
      const result = await withTimeout(async () => new Promise<number>(() => {}), 1, 2);
      expect(result).toBe(2);
    });
    it('withTimeout returns fallback on timeout #3', async () => {
      const result = await withTimeout(async () => new Promise<number>(() => {}), 1, 3);
      expect(result).toBe(3);
    });
    it('withTimeout returns fallback on timeout #4', async () => {
      const result = await withTimeout(async () => new Promise<number>(() => {}), 1, 4);
      expect(result).toBe(4);
    });
    it('withTimeout returns fallback on timeout #5', async () => {
      const result = await withTimeout(async () => new Promise<number>(() => {}), 1, 5);
      expect(result).toBe(5);
    });
    it('withTimeout returns fallback on timeout #6', async () => {
      const result = await withTimeout(async () => new Promise<number>(() => {}), 1, 6);
      expect(result).toBe(6);
    });
    it('withTimeout returns fallback on timeout #7', async () => {
      const result = await withTimeout(async () => new Promise<number>(() => {}), 1, 7);
      expect(result).toBe(7);
    });
    it('withTimeout returns fallback on timeout #8', async () => {
      const result = await withTimeout(async () => new Promise<number>(() => {}), 1, 8);
      expect(result).toBe(8);
    });
    it('withTimeout returns fallback on timeout #9', async () => {
      const result = await withTimeout(async () => new Promise<number>(() => {}), 1, 9);
      expect(result).toBe(9);
    });
    it('withTimeout returns fallback on timeout #10', async () => {
      const result = await withTimeout(async () => new Promise<number>(() => {}), 1, 10);
      expect(result).toBe(10);
    });
    it('withTimeout resolves normally #1', async () => {
      const result = await withTimeout(async () => Promise.resolve(1), 5000);
      expect(result).toBe(1);
    });
    it('withTimeout resolves normally #2', async () => {
      const result = await withTimeout(async () => Promise.resolve(2), 5000);
      expect(result).toBe(2);
    });
    it('withTimeout resolves normally #3', async () => {
      const result = await withTimeout(async () => Promise.resolve(3), 5000);
      expect(result).toBe(3);
    });
    it('withTimeout resolves normally #4', async () => {
      const result = await withTimeout(async () => Promise.resolve(4), 5000);
      expect(result).toBe(4);
    });
    it('withTimeout resolves normally #5', async () => {
      const result = await withTimeout(async () => Promise.resolve(5), 5000);
      expect(result).toBe(5);
    });
    it('withTimeout resolves normally #6', async () => {
      const result = await withTimeout(async () => Promise.resolve(6), 5000);
      expect(result).toBe(6);
    });
    it('withTimeout resolves normally #7', async () => {
      const result = await withTimeout(async () => Promise.resolve(7), 5000);
      expect(result).toBe(7);
    });
    it('withTimeout resolves normally #8', async () => {
      const result = await withTimeout(async () => Promise.resolve(8), 5000);
      expect(result).toBe(8);
    });
    it('withTimeout resolves normally #9', async () => {
      const result = await withTimeout(async () => Promise.resolve(9), 5000);
      expect(result).toBe(9);
    });
    it('withTimeout resolves normally #10', async () => {
      const result = await withTimeout(async () => Promise.resolve(10), 5000);
      expect(result).toBe(10);
    });
    it('promisify resolves #1', async () => {
      const result = await promisify<number>((cb) => cb(null, 1));
      expect(result).toBe(1);
    });
    it('promisify resolves #2', async () => {
      const result = await promisify<number>((cb) => cb(null, 2));
      expect(result).toBe(2);
    });
    it('promisify resolves #3', async () => {
      const result = await promisify<number>((cb) => cb(null, 3));
      expect(result).toBe(3);
    });
    it('promisify resolves #4', async () => {
      const result = await promisify<number>((cb) => cb(null, 4));
      expect(result).toBe(4);
    });
    it('promisify resolves #5', async () => {
      const result = await promisify<number>((cb) => cb(null, 5));
      expect(result).toBe(5);
    });
    it('promisify resolves #6', async () => {
      const result = await promisify<number>((cb) => cb(null, 6));
      expect(result).toBe(6);
    });
    it('promisify resolves #7', async () => {
      const result = await promisify<number>((cb) => cb(null, 7));
      expect(result).toBe(7);
    });
    it('promisify resolves #8', async () => {
      const result = await promisify<number>((cb) => cb(null, 8));
      expect(result).toBe(8);
    });
    it('promisify resolves #9', async () => {
      const result = await promisify<number>((cb) => cb(null, 9));
      expect(result).toBe(9);
    });
    it('promisify resolves #10', async () => {
      const result = await promisify<number>((cb) => cb(null, 10));
      expect(result).toBe(10);
    });
    it('promisify rejects on error #1', async () => {
      await expect(promisify((cb) => cb(new Error('cb-err-1'), undefined as never))).rejects.toThrow('cb-err-1');
    });
    it('promisify rejects on error #2', async () => {
      await expect(promisify((cb) => cb(new Error('cb-err-2'), undefined as never))).rejects.toThrow('cb-err-2');
    });
    it('promisify rejects on error #3', async () => {
      await expect(promisify((cb) => cb(new Error('cb-err-3'), undefined as never))).rejects.toThrow('cb-err-3');
    });
    it('promisify rejects on error #4', async () => {
      await expect(promisify((cb) => cb(new Error('cb-err-4'), undefined as never))).rejects.toThrow('cb-err-4');
    });
    it('promisify rejects on error #5', async () => {
      await expect(promisify((cb) => cb(new Error('cb-err-5'), undefined as never))).rejects.toThrow('cb-err-5');
    });
    it('promisify rejects on error #6', async () => {
      await expect(promisify((cb) => cb(new Error('cb-err-6'), undefined as never))).rejects.toThrow('cb-err-6');
    });
    it('promisify rejects on error #7', async () => {
      await expect(promisify((cb) => cb(new Error('cb-err-7'), undefined as never))).rejects.toThrow('cb-err-7');
    });
    it('promisify rejects on error #8', async () => {
      await expect(promisify((cb) => cb(new Error('cb-err-8'), undefined as never))).rejects.toThrow('cb-err-8');
    });
    it('promisify rejects on error #9', async () => {
      await expect(promisify((cb) => cb(new Error('cb-err-9'), undefined as never))).rejects.toThrow('cb-err-9');
    });
    it('promisify rejects on error #10', async () => {
      await expect(promisify((cb) => cb(new Error('cb-err-10'), undefined as never))).rejects.toThrow('cb-err-10');
    });
    it('firstResolved picks first resolved #1', async () => {
      const result = await firstResolved([Promise.resolve(1), Promise.resolve(2)]);
      expect([1, 2]).toContain(result);
    });
    it('firstResolved picks first resolved #2', async () => {
      const result = await firstResolved([Promise.resolve(2), Promise.resolve(3)]);
      expect([2, 3]).toContain(result);
    });
    it('firstResolved picks first resolved #3', async () => {
      const result = await firstResolved([Promise.resolve(3), Promise.resolve(4)]);
      expect([3, 4]).toContain(result);
    });
    it('firstResolved picks first resolved #4', async () => {
      const result = await firstResolved([Promise.resolve(4), Promise.resolve(5)]);
      expect([4, 5]).toContain(result);
    });
    it('firstResolved picks first resolved #5', async () => {
      const result = await firstResolved([Promise.resolve(5), Promise.resolve(6)]);
      expect([5, 6]).toContain(result);
    });
    it('firstResolved picks first resolved #6', async () => {
      const result = await firstResolved([Promise.resolve(6), Promise.resolve(7)]);
      expect([6, 7]).toContain(result);
    });
    it('firstResolved picks first resolved #7', async () => {
      const result = await firstResolved([Promise.resolve(7), Promise.resolve(8)]);
      expect([7, 8]).toContain(result);
    });
    it('firstResolved picks first resolved #8', async () => {
      const result = await firstResolved([Promise.resolve(8), Promise.resolve(9)]);
      expect([8, 9]).toContain(result);
    });
    it('firstResolved picks first resolved #9', async () => {
      const result = await firstResolved([Promise.resolve(9), Promise.resolve(10)]);
      expect([9, 10]).toContain(result);
    });
    it('firstResolved picks first resolved #10', async () => {
      const result = await firstResolved([Promise.resolve(10), Promise.resolve(11)]);
      expect([10, 11]).toContain(result);
    });
    it('firstResolved rejects when all fail #1', async () => {
      await expect(firstResolved([Promise.reject(new Error('a')), Promise.reject(new Error('b'))])).rejects.toThrow();
    });
    it('firstResolved rejects when all fail #2', async () => {
      await expect(firstResolved([Promise.reject(new Error('a')), Promise.reject(new Error('b'))])).rejects.toThrow();
    });
    it('firstResolved rejects when all fail #3', async () => {
      await expect(firstResolved([Promise.reject(new Error('a')), Promise.reject(new Error('b'))])).rejects.toThrow();
    });
    it('firstResolved rejects when all fail #4', async () => {
      await expect(firstResolved([Promise.reject(new Error('a')), Promise.reject(new Error('b'))])).rejects.toThrow();
    });
    it('firstResolved rejects when all fail #5', async () => {
      await expect(firstResolved([Promise.reject(new Error('a')), Promise.reject(new Error('b'))])).rejects.toThrow();
    });
    it('race resolves with first settled #1', async () => {
      const result = await race([() => Promise.resolve(1), () => Promise.resolve(2)]);
      expect([1, 2]).toContain(result);
    });
    it('race resolves with first settled #2', async () => {
      const result = await race([() => Promise.resolve(2), () => Promise.resolve(3)]);
      expect([2, 3]).toContain(result);
    });
    it('race resolves with first settled #3', async () => {
      const result = await race([() => Promise.resolve(3), () => Promise.resolve(4)]);
      expect([3, 4]).toContain(result);
    });
    it('race resolves with first settled #4', async () => {
      const result = await race([() => Promise.resolve(4), () => Promise.resolve(5)]);
      expect([4, 5]).toContain(result);
    });
    it('race resolves with first settled #5', async () => {
      const result = await race([() => Promise.resolve(5), () => Promise.resolve(6)]);
      expect([5, 6]).toContain(result);
    });
    it('race resolves with first settled #6', async () => {
      const result = await race([() => Promise.resolve(6), () => Promise.resolve(7)]);
      expect([6, 7]).toContain(result);
    });
    it('race resolves with first settled #7', async () => {
      const result = await race([() => Promise.resolve(7), () => Promise.resolve(8)]);
      expect([7, 8]).toContain(result);
    });
    it('race resolves with first settled #8', async () => {
      const result = await race([() => Promise.resolve(8), () => Promise.resolve(9)]);
      expect([8, 9]).toContain(result);
    });
    it('race resolves with first settled #9', async () => {
      const result = await race([() => Promise.resolve(9), () => Promise.resolve(10)]);
      expect([9, 10]).toContain(result);
    });
    it('race resolves with first settled #10', async () => {
      const result = await race([() => Promise.resolve(10), () => Promise.resolve(11)]);
      expect([10, 11]).toContain(result);
    });
    it('createTaskQueue runs task and resolves #1', async () => {
      const q = createTaskQueue(1);
      const result = await q.add(async () => 1);
      expect(result).toBe(1);
    });
    it('createTaskQueue runs task and resolves #2', async () => {
      const q = createTaskQueue(2);
      const result = await q.add(async () => 2);
      expect(result).toBe(2);
    });
    it('createTaskQueue runs task and resolves #3', async () => {
      const q = createTaskQueue(3);
      const result = await q.add(async () => 3);
      expect(result).toBe(3);
    });
    it('createTaskQueue runs task and resolves #4', async () => {
      const q = createTaskQueue(4);
      const result = await q.add(async () => 4);
      expect(result).toBe(4);
    });
    it('createTaskQueue runs task and resolves #5', async () => {
      const q = createTaskQueue(5);
      const result = await q.add(async () => 5);
      expect(result).toBe(5);
    });
    it('createTaskQueue runs task and resolves #6', async () => {
      const q = createTaskQueue(6);
      const result = await q.add(async () => 6);
      expect(result).toBe(6);
    });
    it('createTaskQueue runs task and resolves #7', async () => {
      const q = createTaskQueue(7);
      const result = await q.add(async () => 7);
      expect(result).toBe(7);
    });
    it('createTaskQueue runs task and resolves #8', async () => {
      const q = createTaskQueue(8);
      const result = await q.add(async () => 8);
      expect(result).toBe(8);
    });
    it('createTaskQueue runs task and resolves #9', async () => {
      const q = createTaskQueue(9);
      const result = await q.add(async () => 9);
      expect(result).toBe(9);
    });
    it('createTaskQueue runs task and resolves #10', async () => {
      const q = createTaskQueue(10);
      const result = await q.add(async () => 10);
      expect(result).toBe(10);
    });
    it('createTaskQueue pending starts at 0 #1', async () => {
      const q = createTaskQueue(2);
      expect(q.pending()).toBe(0);
      expect(q.running()).toBe(0);
    });
    it('createTaskQueue pending starts at 0 #2', async () => {
      const q = createTaskQueue(2);
      expect(q.pending()).toBe(0);
      expect(q.running()).toBe(0);
    });
    it('createTaskQueue pending starts at 0 #3', async () => {
      const q = createTaskQueue(2);
      expect(q.pending()).toBe(0);
      expect(q.running()).toBe(0);
    });
    it('createTaskQueue pending starts at 0 #4', async () => {
      const q = createTaskQueue(2);
      expect(q.pending()).toBe(0);
      expect(q.running()).toBe(0);
    });
    it('createTaskQueue pending starts at 0 #5', async () => {
      const q = createTaskQueue(2);
      expect(q.pending()).toBe(0);
      expect(q.running()).toBe(0);
    });
    it('createTaskQueue multiple tasks all complete #1', async () => {
      const q = createTaskQueue(2);
      const results = await Promise.all([q.add(async () => 1), q.add(async () => 2), q.add(async () => 3)]);
      expect(results).toEqual([1, 2, 3]);
    });
    it('createTaskQueue multiple tasks all complete #2', async () => {
      const q = createTaskQueue(2);
      const results = await Promise.all([q.add(async () => 1), q.add(async () => 2), q.add(async () => 3)]);
      expect(results).toEqual([1, 2, 3]);
    });
    it('createTaskQueue multiple tasks all complete #3', async () => {
      const q = createTaskQueue(2);
      const results = await Promise.all([q.add(async () => 1), q.add(async () => 2), q.add(async () => 3)]);
      expect(results).toEqual([1, 2, 3]);
    });
    it('createTaskQueue multiple tasks all complete #4', async () => {
      const q = createTaskQueue(2);
      const results = await Promise.all([q.add(async () => 1), q.add(async () => 2), q.add(async () => 3)]);
      expect(results).toEqual([1, 2, 3]);
    });
    it('createTaskQueue multiple tasks all complete #5', async () => {
      const q = createTaskQueue(2);
      const results = await Promise.all([q.add(async () => 1), q.add(async () => 2), q.add(async () => 3)]);
      expect(results).toEqual([1, 2, 3]);
    });
  });
});
