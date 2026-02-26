// Copyright (c) 2026 Nexara DMCC. All rights reserved.
import { Deque, BoundedDeque, createDeque, createBoundedDeque, fromArray, slidingWindowMax, slidingWindowMin, isPalindromeDeque } from '../double-ended-queue';

describe('Deque pushBack 200 tests', () => {
  for (let i = 0; i < 200; i++) {
    it(`pushBack ${i} and check size`, () => {
      const d = new Deque<number>();
      d.pushBack(i);
      expect(d.size).toBe(1);
      expect(d.peekBack()).toBe(i);
    });
  }
});

describe('Deque pushFront 200 tests', () => {
  for (let i = 0; i < 200; i++) {
    it(`pushFront ${i} and check`, () => {
      const d = new Deque<number>();
      d.pushFront(i);
      expect(d.size).toBe(1);
      expect(d.peekFront()).toBe(i);
    });
  }
});

describe('Deque popFront 100 tests', () => {
  for (let n = 1; n <= 100; n++) {
    it(`popFront from size ${n} deque`, () => {
      const d = fromArray(Array.from({ length: n }, (_, i) => i));
      const front = d.popFront();
      expect(front).toBe(0);
      expect(d.size).toBe(n - 1);
    });
  }
});

describe('Deque popBack 100 tests', () => {
  for (let n = 1; n <= 100; n++) {
    it(`popBack from size ${n} deque`, () => {
      const d = fromArray(Array.from({ length: n }, (_, i) => i));
      const back = d.popBack();
      expect(back).toBe(n - 1);
    });
  }
});

describe('Deque contains 100 tests', () => {
  for (let i = 0; i < 100; i++) {
    it(`contains ${i} in [0..9] deque`, () => {
      const d = fromArray([0,1,2,3,4,5,6,7,8,9]);
      expect(d.contains(i % 10)).toBe(true);
    });
  }
});

describe('BoundedDeque 100 tests', () => {
  for (let cap = 1; cap <= 100; cap++) {
    it(`BoundedDeque capacity=${cap} stays bounded`, () => {
      const d = createBoundedDeque<number>(cap);
      for (let i = 0; i < cap * 2; i++) d.pushBack(i);
      expect(d.size).toBe(cap);
    });
  }
});

describe('slidingWindowMax 100 tests', () => {
  for (let k = 1; k <= 10; k++) {
    for (let n = k; n <= k + 9; n++) {
      it(`slidingWindowMax n=${n} k=${k}`, () => {
        const nums = Array.from({ length: n }, (_, i) => i + 1);
        const result = slidingWindowMax(nums, k);
        expect(result.length).toBe(n - k + 1);
        expect(result[result.length - 1]).toBe(n);
      });
    }
  }
});

describe('isPalindromeDeque 100 tests', () => {
  const palindromes = ['a', 'aa', 'aba', 'abba', 'racecar', 'level', 'civic', 'radar'];
  for (let i = 0; i < 100; i++) {
    const s = palindromes[i % palindromes.length];
    it(`isPalindromeDeque("${s}") = true iteration ${i}`, () => {
      expect(isPalindromeDeque(s)).toBe(true);
    });
  }
});

describe('Deque rotate 100 tests', () => {
  for (let k = 0; k < 100; k++) {
    it(`rotate by ${k} preserves size`, () => {
      const d = fromArray([1, 2, 3, 4, 5]);
      d.rotate(k);
      expect(d.size).toBe(5);
    });
  }
});

describe('fromArray 100 tests', () => {
  for (let n = 1; n <= 100; n++) {
    it(`fromArray length ${n}`, () => {
      const arr = Array.from({ length: n }, (_, i) => i);
      const d = fromArray(arr);
      expect(d.size).toBe(n);
      expect(d.toArray()).toEqual(arr);
    });
  }
});
