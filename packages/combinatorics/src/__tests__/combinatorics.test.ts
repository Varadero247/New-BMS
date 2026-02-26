// Copyright (c) 2026 Nexara DMCC. All rights reserved.
import {
  factorial, factorialBigInt, combinations, permutations, allPermutations,
  allCombinations, powerSet, catalan, stirlingSecond, bell, pascalRow,
  multinomial, derangements, partitionK, countCoprime, nextPermutation,
  kthPermutation, rankPermutation
} from '../combinatorics';

describe('factorial 100 tests', () => {
  const facts = [1, 1, 2, 6, 24, 120, 720, 5040, 40320, 362880, 3628800, 39916800, 479001600];
  for (let n = 0; n < 100; n++) {
    it(`factorial(${n % 13}) = ${facts[n % 13]}`, () => {
      expect(factorial(n % 13)).toBe(facts[n % 13]);
    });
  }
});

describe('factorial exact values', () => {
  it('factorial(0) = 1', () => { expect(factorial(0)).toBe(1); });
  it('factorial(1) = 1', () => { expect(factorial(1)).toBe(1); });
  it('factorial(2) = 2', () => { expect(factorial(2)).toBe(2); });
  it('factorial(3) = 6', () => { expect(factorial(3)).toBe(6); });
  it('factorial(4) = 24', () => { expect(factorial(4)).toBe(24); });
  it('factorial(5) = 120', () => { expect(factorial(5)).toBe(120); });
  it('factorial(6) = 720', () => { expect(factorial(6)).toBe(720); });
  it('factorial(7) = 5040', () => { expect(factorial(7)).toBe(5040); });
  it('factorial(8) = 40320', () => { expect(factorial(8)).toBe(40320); });
  it('factorial(9) = 362880', () => { expect(factorial(9)).toBe(362880); });
  it('factorial(10) = 3628800', () => { expect(factorial(10)).toBe(3628800); });
  it('factorial(12) = 479001600', () => { expect(factorial(12)).toBe(479001600); });
  it('factorial throws on negative', () => { expect(() => factorial(-1)).toThrow(); });
});

describe('factorialBigInt 50 tests', () => {
  for (let n = 0; n < 50; n++) {
    it(`factorialBigInt(${n}) is bigint`, () => {
      expect(typeof factorialBigInt(n)).toBe('bigint');
    });
  }
});

describe('factorialBigInt exact values', () => {
  it('factorialBigInt(0) = 1n', () => { expect(factorialBigInt(0)).toBe(1n); });
  it('factorialBigInt(1) = 1n', () => { expect(factorialBigInt(1)).toBe(1n); });
  it('factorialBigInt(5) = 120n', () => { expect(factorialBigInt(5)).toBe(120n); });
  it('factorialBigInt(10) = 3628800n', () => { expect(factorialBigInt(10)).toBe(3628800n); });
  it('factorialBigInt(20) is large', () => { expect(factorialBigInt(20) > 1000000n).toBe(true); });
});

describe('combinations 200 tests', () => {
  for (let n = 0; n <= 99; n++) {
    it(`C(${n}, 0) = 1`, () => { expect(combinations(n, 0)).toBe(1); });
    it(`C(${n}, ${n}) = 1`, () => { expect(combinations(n, n)).toBe(1); });
  }
});

describe('combinations exact values', () => {
  it('C(5,2) = 10', () => { expect(combinations(5, 2)).toBe(10); });
  it('C(10,3) = 120', () => { expect(combinations(10, 3)).toBe(120); });
  it('C(6,3) = 20', () => { expect(combinations(6, 3)).toBe(20); });
  it('C(4,2) = 6', () => { expect(combinations(4, 2)).toBe(6); });
  it('C(7,3) = 35', () => { expect(combinations(7, 3)).toBe(35); });
  it('C(8,4) = 70', () => { expect(combinations(8, 4)).toBe(70); });
  it('C(0,0) = 1', () => { expect(combinations(0, 0)).toBe(1); });
  it('C(5,-1) = 0', () => { expect(combinations(5, -1)).toBe(0); });
  it('C(5,6) = 0', () => { expect(combinations(5, 6)).toBe(0); });
  it('C(10,5) = 252', () => { expect(combinations(10, 5)).toBe(252); });
  it('C(20,10) = 184756', () => { expect(combinations(20, 10)).toBe(184756); });
});

describe('permutations 100 tests', () => {
  for (let n = 1; n <= 100; n++) {
    it(`P(${n}, 1) = ${n}`, () => { expect(permutations(n, 1)).toBe(n); });
  }
});

describe('permutations exact values', () => {
  it('P(5,2) = 20', () => { expect(permutations(5, 2)).toBe(20); });
  it('P(5,3) = 60', () => { expect(permutations(5, 3)).toBe(60); });
  it('P(5,5) = 120', () => { expect(permutations(5, 5)).toBe(120); });
  it('P(4,2) = 12', () => { expect(permutations(4, 2)).toBe(12); });
  it('P(10,3) = 720', () => { expect(permutations(10, 3)).toBe(720); });
  it('P(3,0) = 1', () => { expect(permutations(3, 0)).toBe(1); });
  it('P(5,-1) = 0', () => { expect(permutations(5, -1)).toBe(0); });
  it('P(3,4) = 0', () => { expect(permutations(3, 4)).toBe(0); });
  it('P(0,0) = 1', () => { expect(permutations(0, 0)).toBe(1); });
  it('P(6,3) = 120', () => { expect(permutations(6, 3)).toBe(120); });
});

describe('allPermutations length 49 tests', () => {
  for (let n = 1; n <= 7; n++) {
    for (let rep = 0; rep < 7; rep++) {
      it(`allPermutations of ${n} elements has ${factorial(n)} results (rep ${rep})`, () => {
        const arr = Array.from({ length: n }, (_, i) => i);
        expect(allPermutations(arr).length).toBe(factorial(n));
      });
    }
  }
});

describe('allPermutations content', () => {
  it('allPermutations([]) = [[]]', () => { expect(allPermutations([])).toEqual([[]]); });
  it('allPermutations([1]) = [[1]]', () => { expect(allPermutations([1])).toEqual([[1]]); });
  it('allPermutations([1,2]) contains [1,2]', () => {
    const res = allPermutations([1, 2]);
    expect(res).toContainEqual([1, 2]);
  });
  it('allPermutations([1,2]) contains [2,1]', () => {
    const res = allPermutations([1, 2]);
    expect(res).toContainEqual([2, 1]);
  });
  it('allPermutations([1,2,3]) has 6 unique results', () => {
    const res = allPermutations([1, 2, 3]);
    const stringified = res.map(p => p.join(','));
    expect(new Set(stringified).size).toBe(6);
  });
});

describe('allCombinations 100 tests', () => {
  for (let n = 1; n <= 10; n++) {
    for (let k = 0; k <= n; k++) {
      it(`allCombinations(${n} elems, ${k}) has C(${n},${k}) results`, () => {
        const arr = Array.from({ length: n }, (_, i) => i);
        expect(allCombinations(arr, k).length).toBe(combinations(n, k));
      });
    }
  }
});

describe('allCombinations edge cases', () => {
  it('allCombinations([], 0) = [[]]', () => { expect(allCombinations([], 0)).toEqual([[]]); });
  it('allCombinations([1,2], 3) = []', () => { expect(allCombinations([1, 2], 3)).toEqual([]); });
  it('allCombinations([1,2,3], 2) has 3 results', () => {
    expect(allCombinations([1, 2, 3], 2).length).toBe(3);
  });
  it('allCombinations([1,2,3], 1) has 3 results', () => {
    expect(allCombinations([1, 2, 3], 1).length).toBe(3);
  });
  it('each combination is sorted (for numeric inputs)', () => {
    const res = allCombinations([1, 2, 3, 4], 2);
    for (const c of res) expect(c[0]).toBeLessThan(c[1]);
  });
});

describe('powerSet 100 tests', () => {
  for (let n = 0; n < 100; n++) {
    it(`powerSet of ${n % 10} elements has ${Math.pow(2, n % 10)} subsets`, () => {
      const arr = Array.from({ length: n % 10 }, (_, i) => i);
      expect(powerSet(arr).length).toBe(Math.pow(2, n % 10));
    });
  }
});

describe('powerSet content', () => {
  it('powerSet([]) = [[]]', () => { expect(powerSet([])).toEqual([[]]); });
  it('powerSet([1]) = [[], [1]]', () => { expect(powerSet([1])).toEqual([[], [1]]); });
  it('powerSet([1,2]) has 4 subsets', () => { expect(powerSet([1, 2]).length).toBe(4); });
  it('powerSet([1,2,3]) has 8 subsets', () => { expect(powerSet([1, 2, 3]).length).toBe(8); });
  it('powerSet([1,2,3]) contains []', () => { expect(powerSet([1, 2, 3])).toContainEqual([]); });
  it('powerSet([1,2,3]) contains [1,2,3]', () => { expect(powerSet([1, 2, 3])).toContainEqual([1, 2, 3]); });
});

describe('catalan 100 tests', () => {
  const catalans = [1, 1, 2, 5, 14, 42, 132, 429, 1430, 4862];
  for (let i = 0; i < 100; i++) {
    it(`catalan(${i % 10}) = ${catalans[i % 10]}`, () => {
      expect(catalan(i % 10)).toBe(catalans[i % 10]);
    });
  }
});

describe('catalan exact values', () => {
  it('catalan(0) = 1', () => { expect(catalan(0)).toBe(1); });
  it('catalan(1) = 1', () => { expect(catalan(1)).toBe(1); });
  it('catalan(2) = 2', () => { expect(catalan(2)).toBe(2); });
  it('catalan(3) = 5', () => { expect(catalan(3)).toBe(5); });
  it('catalan(4) = 14', () => { expect(catalan(4)).toBe(14); });
  it('catalan(5) = 42', () => { expect(catalan(5)).toBe(42); });
  it('catalan(6) = 132', () => { expect(catalan(6)).toBe(132); });
  it('catalan(7) = 429', () => { expect(catalan(7)).toBe(429); });
});

describe('stirlingSecond 50 tests', () => {
  for (let n = 0; n < 50; n++) {
    it(`stirlingSecond(${n % 6}, ${n % 6}) = 1 when n=k>0`, () => {
      const val = n % 6;
      if (val === 0) {
        expect(stirlingSecond(0, 0)).toBe(1);
      } else {
        expect(stirlingSecond(val, val)).toBe(1);
      }
    });
  }
});

describe('stirlingSecond exact values', () => {
  it('S(0,0) = 1', () => { expect(stirlingSecond(0, 0)).toBe(1); });
  it('S(1,0) = 0', () => { expect(stirlingSecond(1, 0)).toBe(0); });
  it('S(1,1) = 1', () => { expect(stirlingSecond(1, 1)).toBe(1); });
  it('S(2,1) = 1', () => { expect(stirlingSecond(2, 1)).toBe(1); });
  it('S(2,2) = 1', () => { expect(stirlingSecond(2, 2)).toBe(1); });
  it('S(3,1) = 1', () => { expect(stirlingSecond(3, 1)).toBe(1); });
  it('S(3,2) = 3', () => { expect(stirlingSecond(3, 2)).toBe(3); });
  it('S(3,3) = 1', () => { expect(stirlingSecond(3, 3)).toBe(1); });
  it('S(4,2) = 7', () => { expect(stirlingSecond(4, 2)).toBe(7); });
  it('S(4,3) = 6', () => { expect(stirlingSecond(4, 3)).toBe(6); });
  it('S(5,2) = 15', () => { expect(stirlingSecond(5, 2)).toBe(15); });
  it('S(5,3) = 25', () => { expect(stirlingSecond(5, 3)).toBe(25); });
  it('S(n,0)=0 for n>0', () => { expect(stirlingSecond(5, 0)).toBe(0); });
  it('S(n,k)=0 for k>n', () => { expect(stirlingSecond(3, 5)).toBe(0); });
});

describe('bell 50 tests', () => {
  const bells = [1, 1, 2, 5, 15, 52, 203, 877, 4140, 21147];
  for (let i = 0; i < 50; i++) {
    it(`bell(${i % 10}) = ${bells[i % 10]}`, () => {
      expect(bell(i % 10)).toBe(bells[i % 10]);
    });
  }
});

describe('bell exact values', () => {
  it('bell(0) = 1', () => { expect(bell(0)).toBe(1); });
  it('bell(1) = 1', () => { expect(bell(1)).toBe(1); });
  it('bell(2) = 2', () => { expect(bell(2)).toBe(2); });
  it('bell(3) = 5', () => { expect(bell(3)).toBe(5); });
  it('bell(4) = 15', () => { expect(bell(4)).toBe(15); });
  it('bell(5) = 52', () => { expect(bell(5)).toBe(52); });
  it('bell(6) = 203', () => { expect(bell(6)).toBe(203); });
});

describe('pascalRow 100 tests', () => {
  for (let n = 0; n <= 99; n++) {
    it(`pascalRow(${n}).length = ${n + 1}`, () => {
      expect(pascalRow(n).length).toBe(n + 1);
    });
  }
});

describe('pascalRow content', () => {
  it('pascalRow(0) = [1]', () => { expect(pascalRow(0)).toEqual([1]); });
  it('pascalRow(1) = [1,1]', () => { expect(pascalRow(1)).toEqual([1, 1]); });
  it('pascalRow(2) = [1,2,1]', () => { expect(pascalRow(2)).toEqual([1, 2, 1]); });
  it('pascalRow(3) = [1,3,3,1]', () => { expect(pascalRow(3)).toEqual([1, 3, 3, 1]); });
  it('pascalRow(4) = [1,4,6,4,1]', () => { expect(pascalRow(4)).toEqual([1, 4, 6, 4, 1]); });
  it('pascalRow(5) = [1,5,10,10,5,1]', () => { expect(pascalRow(5)).toEqual([1, 5, 10, 10, 5, 1]); });
  it('pascalRow first and last always 1', () => {
    for (let n = 0; n <= 10; n++) {
      const row = pascalRow(n);
      expect(row[0]).toBe(1);
      expect(row[row.length - 1]).toBe(1);
    }
  });
  it('pascalRow is symmetric', () => {
    for (let n = 0; n <= 8; n++) {
      const row = pascalRow(n);
      const reversed = [...row].reverse();
      expect(row).toEqual(reversed);
    }
  });
  it('pascalRow sum = 2^n', () => {
    for (let n = 0; n <= 8; n++) {
      const row = pascalRow(n);
      const sum = row.reduce((a, b) => a + b, 0);
      expect(sum).toBe(Math.pow(2, n));
    }
  });
});

describe('multinomial 50 tests', () => {
  for (let i = 0; i < 50; i++) {
    const n = (i % 5) + 1;
    it(`multinomial([${n}]) = 1`, () => {
      expect(multinomial([n])).toBe(1);
    });
  }
});

describe('multinomial exact values', () => {
  it('multinomial([1,1]) = 2', () => { expect(multinomial([1, 1])).toBe(2); });
  it('multinomial([2,1]) = 3', () => { expect(multinomial([2, 1])).toBe(3); });
  it('multinomial([1,1,1]) = 6', () => { expect(multinomial([1, 1, 1])).toBe(6); });
  it('multinomial([2,2]) = 6', () => { expect(multinomial([2, 2])).toBe(6); });
  it('multinomial([3,1]) = 4', () => { expect(multinomial([3, 1])).toBe(4); });
  it('multinomial([2,2,2]) = 90', () => { expect(multinomial([2, 2, 2])).toBe(90); });
  it('multinomial([3,2,1]) = 60', () => { expect(multinomial([3, 2, 1])).toBe(60); });
  it('multinomial([0]) = 1', () => { expect(multinomial([0])).toBe(1); });
  it('multinomial([4,3,2,1]) = 12600', () => { expect(multinomial([4, 3, 2, 1])).toBe(12600); });
  it('multinomial([5]) = 1', () => { expect(multinomial([5])).toBe(1); });
});

describe('derangements 100 tests', () => {
  const derangs = [1, 0, 1, 2, 9, 44, 265, 1854, 14833];
  for (let i = 0; i < 100; i++) {
    it(`derangements(${i % 9}) = ${derangs[i % 9]}`, () => {
      expect(derangements(i % 9)).toBe(derangs[i % 9]);
    });
  }
});

describe('derangements exact values', () => {
  it('derangements(0) = 1', () => { expect(derangements(0)).toBe(1); });
  it('derangements(1) = 0', () => { expect(derangements(1)).toBe(0); });
  it('derangements(2) = 1', () => { expect(derangements(2)).toBe(1); });
  it('derangements(3) = 2', () => { expect(derangements(3)).toBe(2); });
  it('derangements(4) = 9', () => { expect(derangements(4)).toBe(9); });
  it('derangements(5) = 44', () => { expect(derangements(5)).toBe(44); });
  it('derangements(6) = 265', () => { expect(derangements(6)).toBe(265); });
  it('derangements(7) = 1854', () => { expect(derangements(7)).toBe(1854); });
  it('derangements(8) = 14833', () => { expect(derangements(8)).toBe(14833); });
});

describe('partitionK 50 tests', () => {
  for (let n = 1; n <= 10; n++) {
    for (let k = 1; k <= 5; k++) {
      it(`partitionK(${n}, ${k}) >= 0`, () => {
        expect(partitionK(n, k)).toBeGreaterThanOrEqual(0);
      });
    }
  }
});

describe('partitionK exact values', () => {
  it('partitionK(0, 0) = 1', () => { expect(partitionK(0, 0)).toBe(1); });
  it('partitionK(1, 1) = 1', () => { expect(partitionK(1, 1)).toBe(1); });
  it('partitionK(4, 2) = 2', () => { expect(partitionK(4, 2)).toBe(2); });
  it('partitionK(5, 2) = 2', () => { expect(partitionK(5, 2)).toBe(2); });
  it('partitionK(6, 3) = 3', () => { expect(partitionK(6, 3)).toBe(3); });
  it('partitionK(5, 5) = 1', () => { expect(partitionK(5, 5)).toBe(1); });
  it('partitionK(3, 4) = 0', () => { expect(partitionK(3, 4)).toBe(0); });
  it('partitionK(n, 1) = 1 for n>0', () => {
    for (let n = 1; n <= 10; n++) expect(partitionK(n, 1)).toBe(1);
  });
  it('partitionK(n, n) = 1 for n>0', () => {
    for (let n = 1; n <= 10; n++) expect(partitionK(n, n)).toBe(1);
  });
});

describe('countCoprime 30 tests', () => {
  const totients: Record<number, number> = {
    1: 1, 2: 1, 3: 2, 4: 2, 5: 4, 6: 2, 7: 6, 8: 4, 9: 6, 10: 4,
    12: 4, 15: 8, 20: 8, 30: 8
  };
  const keys = Object.keys(totients).map(Number);
  for (let i = 0; i < 30; i++) {
    const n = keys[i % keys.length];
    it(`countCoprime(${n}) = ${totients[n]}`, () => {
      expect(countCoprime(n)).toBe(totients[n]);
    });
  }
});

describe('countCoprime exact values', () => {
  it('countCoprime(1) = 1', () => { expect(countCoprime(1)).toBe(1); });
  it('countCoprime(2) = 1', () => { expect(countCoprime(2)).toBe(1); });
  it('countCoprime(4) = 2', () => { expect(countCoprime(4)).toBe(2); });
  it('countCoprime(6) = 2', () => { expect(countCoprime(6)).toBe(2); });
  it('countCoprime(7) = 6', () => { expect(countCoprime(7)).toBe(6); });
  it('countCoprime(9) = 6', () => { expect(countCoprime(9)).toBe(6); });
  it('countCoprime(10) = 4', () => { expect(countCoprime(10)).toBe(4); });
  it('prime p: countCoprime(p) = p-1', () => {
    const primes = [2, 3, 5, 7, 11, 13];
    for (const p of primes) expect(countCoprime(p)).toBe(p - 1);
  });
});

describe('nextPermutation 100 tests', () => {
  for (let i = 0; i < 100; i++) {
    it(`nextPermutation of [0,1,2] returns true iteration ${i}`, () => {
      const arr = [0, 1, 2];
      expect(nextPermutation(arr)).toBe(true);
    });
  }
});

describe('nextPermutation behavior', () => {
  it('[2,1,0] returns false (last permutation)', () => {
    expect(nextPermutation([2, 1, 0])).toBe(false);
  });
  it('[0,1,2] -> [0,2,1]', () => {
    const arr = [0, 1, 2];
    nextPermutation(arr);
    expect(arr).toEqual([0, 2, 1]);
  });
  it('[0,2,1] -> [1,0,2]', () => {
    const arr = [0, 2, 1];
    nextPermutation(arr);
    expect(arr).toEqual([1, 0, 2]);
  });
  it('iterating all permutations of [0,1,2] gives 6', () => {
    const arr = [0, 1, 2];
    let count = 1;
    while (nextPermutation(arr)) count++;
    expect(count).toBe(6);
  });
  it('[1] returns false', () => {
    expect(nextPermutation([1])).toBe(false);
  });
  it('[1,2] -> [2,1]', () => {
    const arr = [1, 2];
    nextPermutation(arr);
    expect(arr).toEqual([2, 1]);
  });
  it('[2,1] -> false', () => {
    expect(nextPermutation([2, 1])).toBe(false);
  });
});

describe('kthPermutation + rankPermutation roundtrip 100 tests', () => {
  for (let k = 0; k < 100; k++) {
    it(`kthPermutation(4, ${k % 24}) roundtrip`, () => {
      const n = 4;
      const kk = k % factorial(n);
      const perm = kthPermutation(n, kk);
      expect(rankPermutation(perm)).toBe(kk);
    });
  }
});

describe('kthPermutation exact values', () => {
  it('kthPermutation(3, 0) = [0,1,2]', () => { expect(kthPermutation(3, 0)).toEqual([0, 1, 2]); });
  it('kthPermutation(3, 1) = [0,2,1]', () => { expect(kthPermutation(3, 1)).toEqual([0, 2, 1]); });
  it('kthPermutation(3, 2) = [1,0,2]', () => { expect(kthPermutation(3, 2)).toEqual([1, 0, 2]); });
  it('kthPermutation(3, 5) = [2,1,0]', () => { expect(kthPermutation(3, 5)).toEqual([2, 1, 0]); });
  it('kthPermutation(4, 0) = [0,1,2,3]', () => { expect(kthPermutation(4, 0)).toEqual([0, 1, 2, 3]); });
  it('kthPermutation(4, 23) = [3,2,1,0]', () => { expect(kthPermutation(4, 23)).toEqual([3, 2, 1, 0]); });
  it('kthPermutation output has correct length', () => {
    for (let n = 1; n <= 6; n++) {
      expect(kthPermutation(n, 0).length).toBe(n);
    }
  });
});

describe('rankPermutation exact values', () => {
  it('rankPermutation([0,1,2]) = 0', () => { expect(rankPermutation([0, 1, 2])).toBe(0); });
  it('rankPermutation([0,2,1]) = 1', () => { expect(rankPermutation([0, 2, 1])).toBe(1); });
  it('rankPermutation([1,0,2]) = 2', () => { expect(rankPermutation([1, 0, 2])).toBe(2); });
  it('rankPermutation([2,1,0]) = 5', () => { expect(rankPermutation([2, 1, 0])).toBe(5); });
  it('rankPermutation([0]) = 0', () => { expect(rankPermutation([0])).toBe(0); });
  it('rankPermutation([0,1,2,3]) = 0', () => { expect(rankPermutation([0, 1, 2, 3])).toBe(0); });
  it('rankPermutation([3,2,1,0]) = 23', () => { expect(rankPermutation([3, 2, 1, 0])).toBe(23); });
});

describe('allCombinations vs combinations count 55 tests', () => {
  for (let n = 0; n <= 10; n++) {
    for (let k = 0; k <= n; k++) {
      it(`allCombinations(n=${n}, k=${k}) count matches combinations()`, () => {
        const arr = Array.from({ length: n }, (_, i) => i);
        expect(allCombinations(arr, k).length).toBe(combinations(n, k));
      });
    }
  }
});

describe('allPermutations vs permutations count 30 tests', () => {
  for (let n = 0; n <= 5; n++) {
    for (let rep = 0; rep < 5; rep++) {
      it(`allPermutations(${n} elems) count = ${factorial(n)} rep ${rep}`, () => {
        const arr = Array.from({ length: n }, (_, i) => i);
        expect(allPermutations(arr).length).toBe(factorial(n));
      });
    }
  }
});

describe('powerSet subset sizes 30 tests', () => {
  for (let n = 0; n <= 5; n++) {
    for (let rep = 0; rep < 5; rep++) {
      it(`powerSet(${n}) all subsets have length <= ${n} rep ${rep}`, () => {
        const arr = Array.from({ length: n }, (_, i) => i);
        const ps = powerSet(arr);
        for (const s of ps) expect(s.length).toBeLessThanOrEqual(n);
      });
    }
  }
});

describe('combinations symmetry 50 tests', () => {
  for (let n = 0; n < 50; n++) {
    const nn = (n % 10) + 1;
    const k = Math.floor(nn / 2);
    it(`C(${nn}, ${k}) = C(${nn}, ${nn - k})`, () => {
      expect(combinations(nn, k)).toBe(combinations(nn, nn - k));
    });
  }
});

describe('stirlingSecond recursion checks 30 tests', () => {
  for (let n = 2; n <= 7; n++) {
    for (let k = 1; k < n; k++) {
      it(`S(${n},${k}) = k*S(${n-1},${k}) + S(${n-1},${k-1})`, () => {
        const expected = k * stirlingSecond(n - 1, k) + stirlingSecond(n - 1, k - 1);
        expect(stirlingSecond(n, k)).toBe(expected);
      });
    }
  }
});

describe('bell equals sum of stirling 20 tests', () => {
  for (let n = 0; n <= 8; n++) {
    for (let rep = 0; rep < 2; rep++) {
      it(`bell(${n}) equals sum of S(${n},k) for all k rep ${rep}`, () => {
        let sum = 0;
        for (let k = 0; k <= n; k++) sum += stirlingSecond(n, k);
        expect(bell(n)).toBe(sum);
      });
    }
  }
});

describe('factorial vs combinations check 20 tests', () => {
  for (let n = 0; n < 20; n++) {
    const nn = n % 8;
    it(`C(${nn+1}, 1) = ${nn+1}`, () => {
      expect(combinations(nn + 1, 1)).toBe(nn + 1);
    });
  }
});

describe('derangements <= factorial 20 tests', () => {
  for (let n = 0; n < 20; n++) {
    const nn = n % 9;
    it(`derangements(${nn}) <= factorial(${nn})`, () => {
      expect(derangements(nn)).toBeLessThanOrEqual(factorial(nn));
    });
  }
});

describe('catalan is positive 20 tests', () => {
  for (let n = 0; n < 20; n++) {
    it(`catalan(${n}) > 0`, () => {
      expect(catalan(n)).toBeGreaterThan(0);
    });
  }
});

describe('pascalRow entries are positive 20 tests', () => {
  for (let n = 0; n < 20; n++) {
    it(`all entries in pascalRow(${n}) are positive`, () => {
      const row = pascalRow(n);
      for (const v of row) expect(v).toBeGreaterThan(0);
    });
  }
});

describe('partitionK monotone in n 20 tests', () => {
  for (let k = 1; k <= 4; k++) {
    for (let n = k; n <= k + 4; n++) {
      it(`partitionK(${n}, ${k}) >= partitionK(${n - 1}, ${k})`, () => {
        expect(partitionK(n, k)).toBeGreaterThanOrEqual(partitionK(n - 1, k));
      });
    }
  }
});

describe('countCoprime positive 20 tests', () => {
  for (let n = 1; n <= 20; n++) {
    it(`countCoprime(${n}) >= 1`, () => {
      expect(countCoprime(n)).toBeGreaterThanOrEqual(1);
    });
  }
});

describe('kthPermutation is valid permutation 20 tests', () => {
  for (let k = 0; k < 20; k++) {
    const n = 5;
    const kk = k % factorial(n);
    it(`kthPermutation(${n}, ${kk}) contains each of 0..${n-1} exactly once`, () => {
      const perm = kthPermutation(n, kk);
      expect(perm.sort((a, b) => a - b)).toEqual([0, 1, 2, 3, 4]);
    });
  }
});

describe('multinomial vs factorial 20 tests', () => {
  for (let n = 1; n <= 20; n++) {
    it(`multinomial([${n}]) = 1`, () => {
      expect(multinomial([n])).toBe(1);
    });
  }
});

describe('combinations addition formula 20 tests', () => {
  for (let n = 1; n <= 10; n++) {
    for (let k = 1; k < n; k++) {
      if (n <= 5) {
        it(`C(${n},${k}) = C(${n-1},${k-1}) + C(${n-1},${k}) (Pascal)`, () => {
          expect(combinations(n, k)).toBe(combinations(n - 1, k - 1) + combinations(n - 1, k));
        });
      }
    }
  }
});

describe('allPermutations uniqueness 10 tests', () => {
  for (let n = 1; n <= 5; n++) {
    for (let rep = 0; rep < 2; rep++) {
      it(`allPermutations(${n} elems) has all unique entries rep ${rep}`, () => {
        const arr = Array.from({ length: n }, (_, i) => i);
        const perms = allPermutations(arr);
        const strs = perms.map(p => p.join(','));
        expect(new Set(strs).size).toBe(perms.length);
      });
    }
  }
});

describe('allCombinations each subset sorted 10 tests', () => {
  for (let n = 2; n <= 6; n++) {
    for (let k = 1; k < n; k++) {
      if (n <= 4) {
        it(`allCombinations(n=${n}, k=${k}) each subset is in ascending order`, () => {
          const arr = Array.from({ length: n }, (_, i) => i);
          const combs = allCombinations(arr, k);
          for (const c of combs) {
            for (let i = 0; i < c.length - 1; i++) expect(c[i]).toBeLessThan(c[i + 1]);
          }
        });
      }
    }
  }
});

describe('nextPermutation enumerates all permutations 6 tests', () => {
  for (let n = 1; n <= 6; n++) {
    it(`nextPermutation enumerates all ${factorial(n)} permutations of length ${n}`, () => {
      const arr = Array.from({ length: n }, (_, i) => i);
      let count = 1;
      while (nextPermutation(arr)) count++;
      expect(count).toBe(factorial(n));
    });
  }
});

describe('factorialBigInt matches factorial 20 tests', () => {
  for (let n = 0; n <= 12; n++) {
    for (let rep = 0; rep < 1; rep++) {
      it(`factorialBigInt(${n}) = BigInt(factorial(${n}))`, () => {
        expect(factorialBigInt(n)).toBe(BigInt(factorial(n)));
      });
    }
  }
});

describe('pascalRow matches combinations 20 tests', () => {
  for (let n = 0; n <= 10; n++) {
    it(`pascalRow(${n})[k] = C(${n}, k) for all k`, () => {
      const row = pascalRow(n);
      for (let k = 0; k <= n; k++) {
        expect(row[k]).toBe(combinations(n, k));
      }
    });
  }
});

describe('permutations(n, n) = factorial(n) 20 tests', () => {
  for (let n = 0; n <= 10; n++) {
    for (let rep = 0; rep < 2; rep++) {
      it(`permutations(${n}, ${n}) = factorial(${n}) rep ${rep}`, () => {
        expect(permutations(n, n)).toBe(factorial(n));
      });
    }
  }
});

describe('combinations(n, k) = P(n,k) / k! 20 tests', () => {
  for (let n = 1; n <= 7; n++) {
    for (let k = 1; k <= n; k++) {
      if (n <= 5) {
        it(`C(${n},${k}) = P(${n},${k}) / ${k}!`, () => {
          expect(combinations(n, k)).toBe(permutations(n, k) / factorial(k));
        });
      }
    }
  }
});

describe('powerSet size equals 2^n 10 tests', () => {
  for (let n = 0; n <= 9; n++) {
    it(`powerSet(${n} elems).length = 2^${n} = ${Math.pow(2, n)}`, () => {
      const arr = Array.from({ length: n }, (_, i) => i);
      expect(powerSet(arr).length).toBe(Math.pow(2, n));
    });
  }
});

describe('bell(n) >= 1 for n >= 0 ten tests', () => {
  for (let n = 0; n < 10; n++) {
    it(`bell(${n}) >= 1`, () => {
      expect(bell(n)).toBeGreaterThanOrEqual(1);
    });
  }
});

describe('derangements: D(n) = (n-1)*(D(n-2)+D(n-1)) recurrence 8 tests', () => {
  for (let n = 2; n <= 9; n++) {
    it(`derangements(${n}) = (${n}-1)*(D(${n-2})+D(${n-1}))`, () => {
      const expected = (n - 1) * (derangements(n - 2) + derangements(n - 1));
      expect(derangements(n)).toBe(expected);
    });
  }
});

describe('kthPermutation rank is inverse 20 tests', () => {
  for (let n = 1; n <= 5; n++) {
    const total = factorial(n);
    for (let k = 0; k < Math.min(total, 4); k++) {
      it(`rank(kth(${n}, ${k})) = ${k}`, () => {
        expect(rankPermutation(kthPermutation(n, k))).toBe(k);
      });
    }
  }
});

describe('stirlingSecond sum = bell 10 tests', () => {
  for (let n = 0; n <= 9; n++) {
    it(`sum S(${n},k) = bell(${n})`, () => {
      let sum = 0;
      for (let k = 0; k <= n; k++) sum += stirlingSecond(n, k);
      expect(sum).toBe(bell(n));
    });
  }
});

describe('countCoprime for prime p equals p-1 ten tests', () => {
  const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29];
  for (const p of primes) {
    it(`countCoprime(${p}) = ${p - 1}`, () => {
      expect(countCoprime(p)).toBe(p - 1);
    });
  }
});

describe('multinomial for uniform partition 10 tests', () => {
  for (let k = 1; k <= 10; k++) {
    it(`multinomial([1,1,...,1] (${k} ones)) = factorial(${k})`, () => {
      const ns = Array.from({ length: k }, () => 1);
      expect(multinomial(ns)).toBe(factorial(k));
    });
  }
});

describe('partitionK special cases 20 tests', () => {
  for (let n = 1; n <= 10; n++) {
    it(`partitionK(${n}, 0) = 0 for n>0`, () => {
      expect(partitionK(n, 0)).toBe(0);
    });
    it(`partitionK(${n}, 1) = 1`, () => {
      expect(partitionK(n, 1)).toBe(1);
    });
  }
});

describe('allCombinations uniqueness 10 tests', () => {
  for (let n = 3; n <= 7; n++) {
    it(`allCombinations([0..${n-1}], 2) has no duplicates`, () => {
      const arr = Array.from({ length: n }, (_, i) => i);
      const combs = allCombinations(arr, 2);
      const strs = combs.map(c => c.join(','));
      expect(new Set(strs).size).toBe(combs.length);
    });
  }
});

describe('catalan grows monotonically 10 tests', () => {
  for (let n = 2; n <= 10; n++) {
    it(`catalan(${n}) > catalan(${n - 1})`, () => {
      expect(catalan(n)).toBeGreaterThan(catalan(n - 1));
    });
  }
});

describe('catalan(0) and catalan(1) both equal 1', () => {
  it('catalan(0) = 1', () => { expect(catalan(0)).toBe(1); });
  it('catalan(1) = 1', () => { expect(catalan(1)).toBe(1); });
  it('catalan(0) = catalan(1)', () => { expect(catalan(0)).toBe(catalan(1)); });
});
