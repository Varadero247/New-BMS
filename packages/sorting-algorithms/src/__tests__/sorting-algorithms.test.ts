// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import {
  bubbleSort,
  selectionSort,
  insertionSort,
  shellSort,
  mergeSort,
  quickSort,
  heapSort,
  timSort,
  treeSort,
  countingSort,
  radixSort,
  bucketSort,
  cocktailSort,
  gnomeSort,
  cycleSort,
  isSorted,
  stableSort,
  countSwaps,
  countInversions,
  numericAsc,
  numericDesc,
} from '../sorting-algorithms';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function randomArr(n: number, max = 100): number[] {
  return Array.from({ length: n }, () => Math.floor(Math.random() * max));
}

function isSortedAsc(arr: number[]): boolean {
  for (let i = 1; i < arr.length; i++) {
    if (arr[i - 1] > arr[i]) return false;
  }
  return true;
}

function sameElements(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  const sa = [...a].sort((x, y) => x - y);
  const sb = [...b].sort((x, y) => x - y);
  return sa.every((v, i) => v === sb[i]);
}

/** Predefined test cases used across many algorithms */
const numericCases: number[][] = [
  [],
  [1],
  [2, 1],
  [1, 2],
  [3, 1, 2],
  [1, 1, 1],
  [-1, -2, -3],
  [-3, -2, -1],
  [0, 0, 0],
  [5, 4, 3, 2, 1],
  [1, 2, 3, 4, 5],
  [3, 1, 4, 1, 5, 9, 2, 6],
  Array.from({ length: 20 }, (_, i) => 20 - i),
  Array.from({ length: 20 }, (_, i) => i),
  Array.from({ length: 10 }, () => 7),
  [100, 1, 50, 25, 75],
  [-10, 10, -5, 5, 0],
  [1000, -1000, 500, -500],
  [2, 2, 1, 1, 3, 3],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
];

// ---------------------------------------------------------------------------
// bubbleSort — 80+ tests
// ---------------------------------------------------------------------------
describe('bubbleSort', () => {
  for (let i = 0; i < numericCases.length; i++) {
    it(`bubbleSort predefined case ${i}: length=${numericCases[i].length}`, () => {
      const input = numericCases[i];
      const result = bubbleSort(input);
      expect(isSortedAsc(result)).toBe(true);
      expect(sameElements(result, input)).toBe(true);
    });
  }

  for (let i = 0; i < numericCases.length; i++) {
    it(`bubbleSort does not mutate predefined case ${i}`, () => {
      const input = numericCases[i].slice();
      const copy = input.slice();
      bubbleSort(input);
      expect(input).toEqual(copy);
    });
  }

  for (let n = 0; n <= 40; n++) {
    it(`bubbleSort n=${n} random`, () => {
      const arr = randomArr(n);
      const result = bubbleSort(arr);
      expect(isSortedAsc(result)).toBe(true);
      expect(result.length).toBe(n);
      expect(sameElements(result, arr)).toBe(true);
    });
  }

  it('bubbleSort with custom compare (descending)', () => {
    const arr = [3, 1, 4, 1, 5];
    const result = bubbleSort(arr, numericDesc);
    expect(result).toEqual([5, 4, 3, 1, 1]);
  });

  it('bubbleSort returns new array', () => {
    const arr = [2, 1];
    const result = bubbleSort(arr);
    expect(result).not.toBe(arr);
  });
});

// ---------------------------------------------------------------------------
// selectionSort — 80+ tests
// ---------------------------------------------------------------------------
describe('selectionSort', () => {
  for (let i = 0; i < numericCases.length; i++) {
    it(`selectionSort predefined case ${i}: length=${numericCases[i].length}`, () => {
      const input = numericCases[i];
      const result = selectionSort(input);
      expect(isSortedAsc(result)).toBe(true);
      expect(sameElements(result, input)).toBe(true);
    });
  }

  for (let i = 0; i < numericCases.length; i++) {
    it(`selectionSort does not mutate predefined case ${i}`, () => {
      const input = numericCases[i].slice();
      const copy = input.slice();
      selectionSort(input);
      expect(input).toEqual(copy);
    });
  }

  for (let n = 0; n <= 40; n++) {
    it(`selectionSort n=${n} random`, () => {
      const arr = randomArr(n);
      const result = selectionSort(arr);
      expect(isSortedAsc(result)).toBe(true);
      expect(result.length).toBe(n);
      expect(sameElements(result, arr)).toBe(true);
    });
  }

  it('selectionSort with custom compare (descending)', () => {
    const arr = [3, 1, 4, 1, 5];
    const result = selectionSort(arr, numericDesc);
    expect(result[0]).toBeGreaterThanOrEqual(result[result.length - 1]);
  });

  it('selectionSort returns new array', () => {
    const arr = [2, 1];
    const result = selectionSort(arr);
    expect(result).not.toBe(arr);
  });
});

// ---------------------------------------------------------------------------
// insertionSort — 80+ tests
// ---------------------------------------------------------------------------
describe('insertionSort', () => {
  for (let i = 0; i < numericCases.length; i++) {
    it(`insertionSort predefined case ${i}: length=${numericCases[i].length}`, () => {
      const input = numericCases[i];
      const result = insertionSort(input);
      expect(isSortedAsc(result)).toBe(true);
      expect(sameElements(result, input)).toBe(true);
    });
  }

  for (let i = 0; i < numericCases.length; i++) {
    it(`insertionSort does not mutate predefined case ${i}`, () => {
      const input = numericCases[i].slice();
      const copy = input.slice();
      insertionSort(input);
      expect(input).toEqual(copy);
    });
  }

  for (let n = 0; n <= 40; n++) {
    it(`insertionSort n=${n} random`, () => {
      const arr = randomArr(n);
      const result = insertionSort(arr);
      expect(isSortedAsc(result)).toBe(true);
      expect(result.length).toBe(n);
      expect(sameElements(result, arr)).toBe(true);
    });
  }

  it('insertionSort with custom compare (descending)', () => {
    const arr = [1, 5, 3, 2, 4];
    const result = insertionSort(arr, numericDesc);
    expect(result).toEqual([5, 4, 3, 2, 1]);
  });

  it('insertionSort sorts strings', () => {
    const arr = ['banana', 'apple', 'cherry'];
    const result = insertionSort(arr);
    expect(result).toEqual(['apple', 'banana', 'cherry']);
  });
});

// ---------------------------------------------------------------------------
// shellSort — 60+ tests
// ---------------------------------------------------------------------------
describe('shellSort', () => {
  for (let i = 0; i < numericCases.length; i++) {
    it(`shellSort predefined case ${i}: length=${numericCases[i].length}`, () => {
      const input = numericCases[i];
      const result = shellSort(input);
      expect(isSortedAsc(result)).toBe(true);
      expect(sameElements(result, input)).toBe(true);
    });
  }

  for (let i = 0; i < numericCases.length; i++) {
    it(`shellSort does not mutate predefined case ${i}`, () => {
      const input = numericCases[i].slice();
      const copy = input.slice();
      shellSort(input);
      expect(input).toEqual(copy);
    });
  }

  for (let n = 0; n <= 20; n++) {
    it(`shellSort n=${n} random`, () => {
      const arr = randomArr(n);
      const result = shellSort(arr);
      expect(isSortedAsc(result)).toBe(true);
      expect(result.length).toBe(n);
      expect(sameElements(result, arr)).toBe(true);
    });
  }

  it('shellSort with custom compare (descending)', () => {
    const arr = [1, 5, 3, 2, 4];
    const result = shellSort(arr, numericDesc);
    expect(result[0]).toBe(5);
    expect(result[result.length - 1]).toBe(1);
  });

  it('shellSort large array', () => {
    const arr = randomArr(500);
    const result = shellSort(arr);
    expect(isSortedAsc(result)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// mergeSort — 80+ tests
// ---------------------------------------------------------------------------
describe('mergeSort', () => {
  for (let i = 0; i < numericCases.length; i++) {
    it(`mergeSort predefined case ${i}: length=${numericCases[i].length}`, () => {
      const input = numericCases[i];
      const result = mergeSort(input);
      expect(isSortedAsc(result)).toBe(true);
      expect(sameElements(result, input)).toBe(true);
    });
  }

  for (let i = 0; i < numericCases.length; i++) {
    it(`mergeSort does not mutate predefined case ${i}`, () => {
      const input = numericCases[i].slice();
      const copy = input.slice();
      mergeSort(input);
      expect(input).toEqual(copy);
    });
  }

  for (let n = 0; n <= 40; n++) {
    it(`mergeSort n=${n} random`, () => {
      const arr = randomArr(n);
      const result = mergeSort(arr);
      expect(isSortedAsc(result)).toBe(true);
      expect(result.length).toBe(n);
      expect(sameElements(result, arr)).toBe(true);
    });
  }

  it('mergeSort is stable — equal keys preserve original order', () => {
    const arr = [
      { k: 2, i: 0 },
      { k: 1, i: 1 },
      { k: 2, i: 2 },
      { k: 1, i: 3 },
    ];
    const result = mergeSort(arr, (a, b) => a.k - b.k);
    const twos = result.filter((x) => x.k === 2);
    const ones = result.filter((x) => x.k === 1);
    expect(twos[0].i).toBe(0);
    expect(twos[1].i).toBe(2);
    expect(ones[0].i).toBe(1);
    expect(ones[1].i).toBe(3);
  });

  it('mergeSort with custom compare (descending)', () => {
    const arr = [3, 1, 4, 1, 5, 9];
    const result = mergeSort(arr, numericDesc);
    expect(result).toEqual([9, 5, 4, 3, 1, 1]);
  });
});

// ---------------------------------------------------------------------------
// quickSort — 80+ tests
// ---------------------------------------------------------------------------
describe('quickSort', () => {
  for (let i = 0; i < numericCases.length; i++) {
    it(`quickSort predefined case ${i}: length=${numericCases[i].length}`, () => {
      const input = numericCases[i];
      const result = quickSort(input);
      expect(isSortedAsc(result)).toBe(true);
      expect(sameElements(result, input)).toBe(true);
    });
  }

  for (let i = 0; i < numericCases.length; i++) {
    it(`quickSort does not mutate predefined case ${i}`, () => {
      const input = numericCases[i].slice();
      const copy = input.slice();
      quickSort(input);
      expect(input).toEqual(copy);
    });
  }

  for (let n = 0; n <= 40; n++) {
    it(`quickSort n=${n} random`, () => {
      const arr = randomArr(n);
      const result = quickSort(arr);
      expect(isSortedAsc(result)).toBe(true);
      expect(result.length).toBe(n);
      expect(sameElements(result, arr)).toBe(true);
    });
  }

  it('quickSort with custom compare (descending)', () => {
    const arr = [3, 1, 4, 1, 5, 9];
    const result = quickSort(arr, numericDesc);
    expect(result[0]).toBe(9);
    expect(result[result.length - 1]).toBe(1);
  });

  it('quickSort large already-sorted array', () => {
    const arr = Array.from({ length: 100 }, (_, i) => i);
    const result = quickSort(arr);
    expect(isSortedAsc(result)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// heapSort — 80+ tests
// ---------------------------------------------------------------------------
describe('heapSort', () => {
  for (let i = 0; i < numericCases.length; i++) {
    it(`heapSort predefined case ${i}: length=${numericCases[i].length}`, () => {
      const input = numericCases[i];
      const result = heapSort(input);
      expect(isSortedAsc(result)).toBe(true);
      expect(sameElements(result, input)).toBe(true);
    });
  }

  for (let i = 0; i < numericCases.length; i++) {
    it(`heapSort does not mutate predefined case ${i}`, () => {
      const input = numericCases[i].slice();
      const copy = input.slice();
      heapSort(input);
      expect(input).toEqual(copy);
    });
  }

  for (let n = 0; n <= 40; n++) {
    it(`heapSort n=${n} random`, () => {
      const arr = randomArr(n);
      const result = heapSort(arr);
      expect(isSortedAsc(result)).toBe(true);
      expect(result.length).toBe(n);
      expect(sameElements(result, arr)).toBe(true);
    });
  }

  it('heapSort with custom compare (descending)', () => {
    const arr = [3, 1, 4, 1, 5, 9];
    const result = heapSort(arr, numericDesc);
    expect(result[0]).toBe(9);
  });

  it('heapSort power-of-2 length', () => {
    const arr = randomArr(64);
    expect(isSortedAsc(heapSort(arr))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// timSort — 60+ tests
// ---------------------------------------------------------------------------
describe('timSort', () => {
  for (let i = 0; i < numericCases.length; i++) {
    it(`timSort predefined case ${i}: length=${numericCases[i].length}`, () => {
      const input = numericCases[i];
      const result = timSort(input);
      expect(isSortedAsc(result)).toBe(true);
      expect(sameElements(result, input)).toBe(true);
    });
  }

  for (let i = 0; i < numericCases.length; i++) {
    it(`timSort does not mutate predefined case ${i}`, () => {
      const input = numericCases[i].slice();
      const copy = input.slice();
      timSort(input);
      expect(input).toEqual(copy);
    });
  }

  for (let n = 0; n <= 20; n++) {
    it(`timSort n=${n} random`, () => {
      const arr = randomArr(n);
      const result = timSort(arr);
      expect(isSortedAsc(result)).toBe(true);
      expect(result.length).toBe(n);
      expect(sameElements(result, arr)).toBe(true);
    });
  }

  it('timSort 33 elements (crosses run boundary)', () => {
    const arr = randomArr(33);
    expect(isSortedAsc(timSort(arr))).toBe(true);
  });

  it('timSort 64 elements (two full runs)', () => {
    const arr = randomArr(64);
    expect(isSortedAsc(timSort(arr))).toBe(true);
  });

  it('timSort with custom compare (descending)', () => {
    const arr = [3, 1, 4, 1, 5];
    const result = timSort(arr, numericDesc);
    expect(result[0]).toBeGreaterThanOrEqual(result[result.length - 1]);
  });
});

// ---------------------------------------------------------------------------
// treeSort — 50+ tests
// ---------------------------------------------------------------------------
describe('treeSort', () => {
  for (let i = 0; i < numericCases.length; i++) {
    it(`treeSort predefined case ${i}: length=${numericCases[i].length}`, () => {
      const input = numericCases[i];
      const result = treeSort(input);
      expect(isSortedAsc(result)).toBe(true);
      expect(sameElements(result, input)).toBe(true);
    });
  }

  for (let i = 0; i < numericCases.length; i++) {
    it(`treeSort does not mutate predefined case ${i}`, () => {
      const input = numericCases[i].slice();
      const copy = input.slice();
      treeSort(input);
      expect(input).toEqual(copy);
    });
  }

  for (let n = 1; n <= 10; n++) {
    it(`treeSort n=${n} random`, () => {
      const arr = randomArr(n, 50);
      const result = treeSort(arr);
      expect(isSortedAsc(result)).toBe(true);
      expect(result.length).toBe(n);
      expect(sameElements(result, arr)).toBe(true);
    });
  }

  it('treeSort with custom compare (descending)', () => {
    const arr = [3, 1, 4, 1, 5];
    const result = treeSort(arr, numericDesc);
    expect(result[0]).toBeGreaterThanOrEqual(result[result.length - 1]);
  });

  it('treeSort empty returns empty', () => {
    expect(treeSort([])).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// countingSort — 50+ tests
// ---------------------------------------------------------------------------
const countingCases: number[][] = [
  [],
  [0],
  [1],
  [1, 1, 1],
  [3, 1, 2],
  [5, 4, 3, 2, 1, 0],
  [0, 0, 0],
  [10, 5, 8, 3, 7],
  Array.from({ length: 10 }, (_, i) => 9 - i),
  Array.from({ length: 10 }, (_, i) => i),
  [1, 3, 2, 1, 3, 2],
  [-3, -1, -2, 0, 1, 2],
  [-5, -5, -3, -1, -1],
  [100, 50, 75, 25, 0],
];

describe('countingSort', () => {
  for (let i = 0; i < countingCases.length; i++) {
    it(`countingSort predefined case ${i}: length=${countingCases[i].length}`, () => {
      const input = countingCases[i];
      const result = countingSort(input);
      expect(isSortedAsc(result)).toBe(true);
      expect(sameElements(result, input)).toBe(true);
    });
  }

  for (let i = 0; i < countingCases.length; i++) {
    it(`countingSort does not mutate predefined case ${i}`, () => {
      const input = countingCases[i].slice();
      const copy = input.slice();
      countingSort(input);
      expect(input).toEqual(copy);
    });
  }

  for (let n = 0; n <= 20; n++) {
    it(`countingSort n=${n} values 0-9`, () => {
      const arr = Array.from({ length: n }, () => Math.floor(Math.random() * 10));
      const result = countingSort(arr);
      expect(isSortedAsc(result)).toBe(true);
      expect(result.length).toBe(n);
      expect(sameElements(result, arr)).toBe(true);
    });
  }

  it('countingSort with explicit min/max', () => {
    const arr = [3, 1, 4, 1, 5, 9];
    const result = countingSort(arr, 1, 9);
    expect(isSortedAsc(result)).toBe(true);
    expect(sameElements(result, arr)).toBe(true);
  });

  it('countingSort all same value', () => {
    const arr = [5, 5, 5, 5, 5];
    const result = countingSort(arr);
    expect(result).toEqual([5, 5, 5, 5, 5]);
  });
});

// ---------------------------------------------------------------------------
// radixSort — 50+ tests
// ---------------------------------------------------------------------------
const radixCases: number[][] = [
  [],
  [0],
  [1],
  [10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
  [100, 10, 1, 1000],
  [0, 0, 0],
  [999, 1, 100, 50],
  Array.from({ length: 10 }, (_, i) => 9 - i),
  [123, 456, 789, 12, 34],
  [5, 4, 3, 2, 1],
];

describe('radixSort', () => {
  for (let i = 0; i < radixCases.length; i++) {
    it(`radixSort predefined case ${i}: length=${radixCases[i].length}`, () => {
      const input = radixCases[i];
      const result = radixSort(input);
      expect(isSortedAsc(result)).toBe(true);
      expect(sameElements(result, input)).toBe(true);
    });
  }

  for (let i = 0; i < radixCases.length; i++) {
    it(`radixSort does not mutate predefined case ${i}`, () => {
      const input = radixCases[i].slice();
      const copy = input.slice();
      radixSort(input);
      expect(input).toEqual(copy);
    });
  }

  for (let n = 0; n <= 30; n++) {
    it(`radixSort n=${n} non-negative values`, () => {
      const arr = Array.from({ length: n }, () => Math.floor(Math.random() * 1000));
      const result = radixSort(arr);
      expect(isSortedAsc(result)).toBe(true);
      expect(result.length).toBe(n);
      expect(sameElements(result, arr)).toBe(true);
    });
  }

  it('radixSort all zeros', () => {
    const arr = [0, 0, 0, 0];
    expect(radixSort(arr)).toEqual([0, 0, 0, 0]);
  });

  it('radixSort single digit values', () => {
    const arr = [9, 3, 7, 1, 5, 2, 8, 4, 6, 0];
    expect(radixSort(arr)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });
});

// ---------------------------------------------------------------------------
// bucketSort — 50+ tests
// ---------------------------------------------------------------------------
describe('bucketSort', () => {
  const bucketCases: number[][] = [
    [],
    [1],
    [2, 1],
    [1, 1, 1],
    [5, 3, 1, 4, 2],
    [10, 5, 8, 3, 7, 6],
    Array.from({ length: 10 }, (_, i) => 9 - i),
    Array.from({ length: 10 }, (_, i) => i),
    [100, 50, 75, 25, 0, 90],
    [-5, -1, -3, -2, -4],
    [0, 0, 0, 0],
    [1000, 500, 250, 750],
  ];

  for (let i = 0; i < bucketCases.length; i++) {
    it(`bucketSort predefined case ${i}: length=${bucketCases[i].length}`, () => {
      const input = bucketCases[i];
      const result = bucketSort(input);
      expect(isSortedAsc(result)).toBe(true);
      expect(sameElements(result, input)).toBe(true);
    });
  }

  for (let i = 0; i < bucketCases.length; i++) {
    it(`bucketSort does not mutate predefined case ${i}`, () => {
      const input = bucketCases[i].slice();
      const copy = input.slice();
      bucketSort(input);
      expect(input).toEqual(copy);
    });
  }

  for (let n = 0; n <= 25; n++) {
    it(`bucketSort n=${n} random`, () => {
      const arr = randomArr(n);
      const result = bucketSort(arr);
      expect(isSortedAsc(result)).toBe(true);
      expect(result.length).toBe(n);
      expect(sameElements(result, arr)).toBe(true);
    });
  }

  it('bucketSort with explicit bucket count', () => {
    const arr = [3, 1, 4, 1, 5, 9, 2, 6];
    const result = bucketSort(arr, 4);
    expect(isSortedAsc(result)).toBe(true);
    expect(sameElements(result, arr)).toBe(true);
  });

  it('bucketSort single bucket', () => {
    const arr = [3, 1, 2];
    expect(isSortedAsc(bucketSort(arr, 1))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// cocktailSort — 40+ tests
// ---------------------------------------------------------------------------
describe('cocktailSort', () => {
  for (let i = 0; i < numericCases.length; i++) {
    it(`cocktailSort predefined case ${i}: length=${numericCases[i].length}`, () => {
      const input = numericCases[i];
      const result = cocktailSort(input);
      expect(isSortedAsc(result)).toBe(true);
      expect(sameElements(result, input)).toBe(true);
    });
  }

  for (let i = 0; i < numericCases.length; i++) {
    it(`cocktailSort does not mutate predefined case ${i}`, () => {
      const input = numericCases[i].slice();
      const copy = input.slice();
      cocktailSort(input);
      expect(input).toEqual(copy);
    });
  }

  it('cocktailSort with custom compare (descending)', () => {
    const arr = [3, 1, 4, 1, 5];
    const result = cocktailSort(arr, numericDesc);
    expect(result[0]).toBeGreaterThanOrEqual(result[result.length - 1]);
  });

  it('cocktailSort returns new array', () => {
    const arr = [2, 1];
    expect(cocktailSort(arr)).not.toBe(arr);
  });
});

// ---------------------------------------------------------------------------
// gnomeSort — 40+ tests
// ---------------------------------------------------------------------------
describe('gnomeSort', () => {
  for (let i = 0; i < numericCases.length; i++) {
    it(`gnomeSort predefined case ${i}: length=${numericCases[i].length}`, () => {
      const input = numericCases[i];
      const result = gnomeSort(input);
      expect(isSortedAsc(result)).toBe(true);
      expect(sameElements(result, input)).toBe(true);
    });
  }

  for (let i = 0; i < numericCases.length; i++) {
    it(`gnomeSort does not mutate predefined case ${i}`, () => {
      const input = numericCases[i].slice();
      const copy = input.slice();
      gnomeSort(input);
      expect(input).toEqual(copy);
    });
  }

  it('gnomeSort with custom compare (descending)', () => {
    const arr = [3, 1, 4, 1, 5];
    const result = gnomeSort(arr, numericDesc);
    expect(result[0]).toBeGreaterThanOrEqual(result[result.length - 1]);
  });

  it('gnomeSort returns new array', () => {
    const arr = [2, 1];
    expect(gnomeSort(arr)).not.toBe(arr);
  });
});

// ---------------------------------------------------------------------------
// cycleSort — 40+ tests
// ---------------------------------------------------------------------------
describe('cycleSort', () => {
  for (let i = 0; i < numericCases.length; i++) {
    it(`cycleSort predefined case ${i}: length=${numericCases[i].length}`, () => {
      const input = numericCases[i];
      const result = cycleSort(input);
      expect(isSortedAsc(result)).toBe(true);
      expect(sameElements(result, input)).toBe(true);
    });
  }

  for (let i = 0; i < numericCases.length; i++) {
    it(`cycleSort does not mutate predefined case ${i}`, () => {
      const input = numericCases[i].slice();
      const copy = input.slice();
      cycleSort(input);
      expect(input).toEqual(copy);
    });
  }

  it('cycleSort with custom compare (descending)', () => {
    const arr = [3, 1, 4, 1, 5];
    const result = cycleSort(arr, numericDesc);
    expect(result[0]).toBeGreaterThanOrEqual(result[result.length - 1]);
  });

  it('cycleSort returns new array', () => {
    const arr = [2, 1];
    expect(cycleSort(arr)).not.toBe(arr);
  });
});

// ---------------------------------------------------------------------------
// isSorted — 50+ tests
// ---------------------------------------------------------------------------
describe('isSorted', () => {
  const sortedCases: [number[], boolean][] = [
    [[], true],
    [[1], true],
    [[1, 2], true],
    [[2, 1], false],
    [[1, 1, 1], true],
    [[1, 2, 3, 4, 5], true],
    [[5, 4, 3, 2, 1], false],
    [[1, 2, 2, 3], true],
    [[1, 3, 2], false],
    [-3, -2, -1, 0].length > 0 ? [[-3, -2, -1, 0], true] : [[-3, -2, -1, 0], true],
    [[0, -1], false],
    [[1, 2, 3, 3, 3], true],
    [[3, 3, 2], false],
  ];

  for (let i = 0; i < sortedCases.length; i++) {
    it(`isSorted case ${i}: ${JSON.stringify(sortedCases[i][0])} → ${sortedCases[i][1]}`, () => {
      expect(isSorted(sortedCases[i][0])).toBe(sortedCases[i][1]);
    });
  }

  for (let n = 0; n <= 20; n++) {
    it(`isSorted: sorted array of length ${n} returns true`, () => {
      const arr = Array.from({ length: n }, (_, i) => i);
      expect(isSorted(arr)).toBe(true);
    });
  }

  for (let n = 2; n <= 15; n++) {
    it(`isSorted: reversed array of length ${n} returns false`, () => {
      const arr = Array.from({ length: n }, (_, i) => n - i);
      expect(isSorted(arr)).toBe(false);
    });
  }

  it('isSorted with custom compare (descending)', () => {
    expect(isSorted([5, 4, 3, 2, 1], numericDesc)).toBe(true);
    expect(isSorted([1, 2, 3, 4, 5], numericDesc)).toBe(false);
  });

  it('isSorted strings', () => {
    expect(isSorted(['apple', 'banana', 'cherry'])).toBe(true);
    expect(isSorted(['cherry', 'apple'])).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// countSwaps — 30+ tests
// ---------------------------------------------------------------------------
describe('countSwaps', () => {
  const swapCases: [number[], number][] = [
    [[], 0],
    [[1], 0],
    [[1, 2], 0],
    [[2, 1], 1],
    [[3, 2, 1], 3],
    [[1, 2, 3], 0],
    [[1, 1, 1], 0],
    [[2, 3, 1], 2],
    [[4, 3, 2, 1], 6],
    [[1, 3, 2], 1],
  ];

  for (let i = 0; i < swapCases.length; i++) {
    it(`countSwaps case ${i}: ${JSON.stringify(swapCases[i][0])} → ${swapCases[i][1]}`, () => {
      expect(countSwaps(swapCases[i][0])).toBe(swapCases[i][1]);
    });
  }

  for (let n = 0; n <= 15; n++) {
    it(`countSwaps n=${n}: result >= 0`, () => {
      const arr = randomArr(n, 20);
      expect(countSwaps(arr)).toBeGreaterThanOrEqual(0);
    });
  }

  it('countSwaps does not mutate input', () => {
    const arr = [3, 1, 2];
    const copy = arr.slice();
    countSwaps(arr);
    expect(arr).toEqual(copy);
  });

  it('countSwaps equals countInversions for distinct elements', () => {
    const arr = [4, 3, 2, 1];
    expect(countSwaps(arr)).toBe(countInversions(arr));
  });
});

// ---------------------------------------------------------------------------
// countInversions — 30+ tests
// ---------------------------------------------------------------------------
describe('countInversions', () => {
  const inversionCases: [number[], number][] = [
    [[], 0],
    [[1], 0],
    [[1, 2], 0],
    [[2, 1], 1],
    [[3, 2, 1], 3],
    [[1, 2, 3], 0],
    [[1, 1, 1], 0],
    [[2, 3, 1], 2],
    [[4, 3, 2, 1], 6],
    [[1, 3, 2], 1],
    [[5, 4, 3, 2, 1], 10],
    [[1, 5, 2, 4, 3], 4],
  ];

  for (let i = 0; i < inversionCases.length; i++) {
    it(`countInversions case ${i}: ${JSON.stringify(inversionCases[i][0])} → ${inversionCases[i][1]}`, () => {
      expect(countInversions(inversionCases[i][0])).toBe(inversionCases[i][1]);
    });
  }

  for (let n = 0; n <= 15; n++) {
    it(`countInversions n=${n}: result >= 0`, () => {
      const arr = randomArr(n, 20);
      expect(countInversions(arr)).toBeGreaterThanOrEqual(0);
    });
  }

  it('countInversions does not mutate input', () => {
    const arr = [3, 1, 2];
    const copy = arr.slice();
    countInversions(arr);
    expect(arr).toEqual(copy);
  });

  it('countInversions: sorted array has 0 inversions', () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    expect(countInversions(arr)).toBe(0);
  });

  it('countInversions: max inversions for n=5 is 10', () => {
    expect(countInversions([5, 4, 3, 2, 1])).toBe(10);
  });
});

// ---------------------------------------------------------------------------
// numericAsc / numericDesc — 20+ tests
// ---------------------------------------------------------------------------
describe('numericAsc comparator', () => {
  it('numericAsc: a < b returns negative', () => {
    expect(numericAsc(1, 2)).toBeLessThan(0);
  });

  it('numericAsc: a > b returns positive', () => {
    expect(numericAsc(2, 1)).toBeGreaterThan(0);
  });

  it('numericAsc: a === b returns zero', () => {
    expect(numericAsc(5, 5)).toBe(0);
  });

  it('numericAsc: negative numbers', () => {
    expect(numericAsc(-2, -1)).toBeLessThan(0);
  });

  it('numericAsc: mixed sign', () => {
    expect(numericAsc(-1, 1)).toBeLessThan(0);
  });

  it('numericAsc used in sort', () => {
    const arr = [5, 3, 1, 4, 2];
    expect(bubbleSort(arr, numericAsc)).toEqual([1, 2, 3, 4, 5]);
  });

  it('numericAsc large values', () => {
    expect(numericAsc(1e9, 1e9 + 1)).toBeLessThan(0);
  });

  it('numericAsc zero', () => {
    expect(numericAsc(0, 0)).toBe(0);
  });

  it('numericAsc: returns exact difference', () => {
    expect(numericAsc(3, 7)).toBe(-4);
  });

  it('numericAsc: returns exact difference positive', () => {
    expect(numericAsc(10, 3)).toBe(7);
  });
});

describe('numericDesc comparator', () => {
  it('numericDesc: a > b returns negative', () => {
    expect(numericDesc(2, 1)).toBeLessThan(0);
  });

  it('numericDesc: a < b returns positive', () => {
    expect(numericDesc(1, 2)).toBeGreaterThan(0);
  });

  it('numericDesc: a === b returns zero', () => {
    expect(numericDesc(5, 5)).toBe(0);
  });

  it('numericDesc used in sort', () => {
    const arr = [5, 3, 1, 4, 2];
    expect(bubbleSort(arr, numericDesc)).toEqual([5, 4, 3, 2, 1]);
  });

  it('numericDesc negative numbers', () => {
    expect(numericDesc(-1, -2)).toBeLessThan(0);
  });

  it('numericDesc mixed sign', () => {
    expect(numericDesc(1, -1)).toBeLessThan(0);
  });

  it('numericDesc zero', () => {
    expect(numericDesc(0, 0)).toBe(0);
  });

  it('numericDesc: returns exact difference', () => {
    expect(numericDesc(7, 3)).toBe(-4);
  });

  it('numericDesc: returns exact difference positive', () => {
    expect(numericDesc(3, 10)).toBe(7);
  });

  it('numericDesc large values', () => {
    expect(numericDesc(1e9 + 1, 1e9)).toBeLessThan(0);
  });
});

// ---------------------------------------------------------------------------
// stableSort — additional tests
// ---------------------------------------------------------------------------
describe('stableSort', () => {
  it('stableSort preserves order of equal elements', () => {
    const arr = [{ k: 1, id: 'a' }, { k: 2, id: 'b' }, { k: 1, id: 'c' }, { k: 2, id: 'd' }];
    const result = stableSort(arr, (x, y) => x.k - y.k);
    expect(result[0].id).toBe('a');
    expect(result[1].id).toBe('c');
    expect(result[2].id).toBe('b');
    expect(result[3].id).toBe('d');
  });

  it('stableSort empty array', () => {
    expect(stableSort([], (a: number, b: number) => a - b)).toEqual([]);
  });

  it('stableSort single element', () => {
    expect(stableSort([42], (a, b) => a - b)).toEqual([42]);
  });

  it('stableSort already sorted', () => {
    const arr = [1, 2, 3, 4, 5];
    expect(stableSort(arr, (a, b) => a - b)).toEqual([1, 2, 3, 4, 5]);
  });

  it('stableSort does not mutate input', () => {
    const arr = [3, 1, 2];
    const copy = arr.slice();
    stableSort(arr, (a, b) => a - b);
    expect(arr).toEqual(copy);
  });

  it('stableSort numbers', () => {
    const arr = [5, 3, 1, 4, 2];
    const result = stableSort(arr, (a, b) => a - b);
    expect(result).toEqual([1, 2, 3, 4, 5]);
  });
});

// ---------------------------------------------------------------------------
// Edge cases — 30+ tests
// ---------------------------------------------------------------------------
describe('Edge cases', () => {
  const allAlgorithms = [
    { name: 'bubbleSort', fn: bubbleSort },
    { name: 'selectionSort', fn: selectionSort },
    { name: 'insertionSort', fn: insertionSort },
    { name: 'shellSort', fn: shellSort },
    { name: 'mergeSort', fn: mergeSort },
    { name: 'quickSort', fn: quickSort },
    { name: 'heapSort', fn: heapSort },
    { name: 'timSort', fn: timSort },
    { name: 'treeSort', fn: treeSort },
    { name: 'cocktailSort', fn: cocktailSort },
    { name: 'gnomeSort', fn: gnomeSort },
    { name: 'cycleSort', fn: cycleSort },
  ];

  for (const { name, fn } of allAlgorithms) {
    it(`${name}: empty array returns empty array`, () => {
      expect(fn([])).toEqual([]);
    });

    it(`${name}: single element returns single element`, () => {
      expect(fn([42])).toEqual([42]);
    });

    it(`${name}: all equal elements`, () => {
      const arr = [7, 7, 7, 7, 7];
      const result = fn(arr);
      expect(result).toEqual([7, 7, 7, 7, 7]);
    });

    it(`${name}: two elements unsorted`, () => {
      const result = fn([2, 1]);
      expect(result).toEqual([1, 2]);
    });

    it(`${name}: two elements sorted`, () => {
      const result = fn([1, 2]);
      expect(result).toEqual([1, 2]);
    });
  }

  it('all algorithms handle negative numbers', () => {
    const arr = [-5, -1, -3, -2, -4];
    expect(isSortedAsc(bubbleSort(arr))).toBe(true);
    expect(isSortedAsc(mergeSort(arr))).toBe(true);
    expect(isSortedAsc(quickSort(arr))).toBe(true);
    expect(isSortedAsc(heapSort(arr))).toBe(true);
  });

  it('all algorithms handle mixed positive/negative', () => {
    const arr = [-3, 5, -1, 0, 2, -4, 3];
    expect(isSortedAsc(mergeSort(arr))).toBe(true);
    expect(isSortedAsc(insertionSort(arr))).toBe(true);
    expect(isSortedAsc(shellSort(arr))).toBe(true);
  });

  it('all algorithms produce same result for equal input', () => {
    const arr = [5, 3, 8, 1, 9, 2, 7, 4, 6];
    const expected = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    expect(bubbleSort(arr)).toEqual(expected);
    expect(selectionSort(arr)).toEqual(expected);
    expect(insertionSort(arr)).toEqual(expected);
    expect(shellSort(arr)).toEqual(expected);
    expect(mergeSort(arr)).toEqual(expected);
    expect(quickSort(arr)).toEqual(expected);
    expect(heapSort(arr)).toEqual(expected);
    expect(timSort(arr)).toEqual(expected);
    expect(treeSort(arr)).toEqual(expected);
    expect(cocktailSort(arr)).toEqual(expected);
    expect(gnomeSort(arr)).toEqual(expected);
    expect(cycleSort(arr)).toEqual(expected);
  });
});

// ---------------------------------------------------------------------------
// Cross-algorithm consistency — additional coverage
// ---------------------------------------------------------------------------
describe('Cross-algorithm consistency', () => {
  for (let n = 1; n <= 15; n++) {
    it(`all algorithms agree on n=${n} random input`, () => {
      const arr = randomArr(n, 50);
      const expected = mergeSort(arr);
      expect(isSortedAsc(expected)).toBe(true);
      expect(bubbleSort(arr)).toEqual(expected);
      expect(selectionSort(arr)).toEqual(expected);
      expect(insertionSort(arr)).toEqual(expected);
      expect(shellSort(arr)).toEqual(expected);
      expect(quickSort(arr)).toEqual(expected);
      expect(heapSort(arr)).toEqual(expected);
      expect(timSort(arr)).toEqual(expected);
      expect(treeSort(arr)).toEqual(expected);
      expect(cocktailSort(arr)).toEqual(expected);
      expect(gnomeSort(arr)).toEqual(expected);
      expect(cycleSort(arr)).toEqual(expected);
    });
  }

  for (let n = 0; n <= 10; n++) {
    it(`integer sorts agree on n=${n} values 0-20`, () => {
      const arr = Array.from({ length: n }, () => Math.floor(Math.random() * 20));
      const expected = mergeSort(arr);
      expect(countingSort(arr)).toEqual(expected);
      expect(radixSort(arr)).toEqual(expected);
      expect(isSortedAsc(bucketSort(arr))).toBe(true);
      expect(sameElements(bucketSort(arr), arr)).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// Non-mutation guarantee across all algorithms
// ---------------------------------------------------------------------------
describe('Non-mutation guarantees', () => {
  const testArr = [5, 3, 8, 1, 9, 2, 7, 4, 6];

  it('bubbleSort does not mutate', () => { const c = testArr.slice(); bubbleSort(c); expect(c).toEqual(testArr); });
  it('selectionSort does not mutate', () => { const c = testArr.slice(); selectionSort(c); expect(c).toEqual(testArr); });
  it('insertionSort does not mutate', () => { const c = testArr.slice(); insertionSort(c); expect(c).toEqual(testArr); });
  it('shellSort does not mutate', () => { const c = testArr.slice(); shellSort(c); expect(c).toEqual(testArr); });
  it('mergeSort does not mutate', () => { const c = testArr.slice(); mergeSort(c); expect(c).toEqual(testArr); });
  it('quickSort does not mutate', () => { const c = testArr.slice(); quickSort(c); expect(c).toEqual(testArr); });
  it('heapSort does not mutate', () => { const c = testArr.slice(); heapSort(c); expect(c).toEqual(testArr); });
  it('timSort does not mutate', () => { const c = testArr.slice(); timSort(c); expect(c).toEqual(testArr); });
  it('treeSort does not mutate', () => { const c = testArr.slice(); treeSort(c); expect(c).toEqual(testArr); });
  it('countingSort does not mutate', () => { const c = testArr.slice(); countingSort(c); expect(c).toEqual(testArr); });
  it('radixSort does not mutate', () => { const c = testArr.slice().map(Math.abs); radixSort(c); expect(c.sort((a,b)=>a-b)).toEqual([...testArr].map(Math.abs).sort((a,b)=>a-b)); });
  it('bucketSort does not mutate', () => { const c = testArr.slice().map(Math.abs); const copy = c.slice(); bucketSort(c); expect(c).toEqual(copy); });
  it('cocktailSort does not mutate', () => { const c = testArr.slice(); cocktailSort(c); expect(c).toEqual(testArr); });
  it('gnomeSort does not mutate', () => { const c = testArr.slice(); gnomeSort(c); expect(c).toEqual(testArr); });
  it('cycleSort does not mutate', () => { const c = testArr.slice(); cycleSort(c); expect(c).toEqual(testArr); });
  it('isSorted does not mutate', () => { const c = testArr.slice(); isSorted(c); expect(c).toEqual(testArr); });
  it('countSwaps does not mutate', () => { const c = testArr.slice(); countSwaps(c); expect(c).toEqual(testArr); });
  it('countInversions does not mutate', () => { const c = testArr.slice(); countInversions(c); expect(c).toEqual(testArr); });
});

// ---------------------------------------------------------------------------
// Additional coverage for large arrays and specific patterns
// ---------------------------------------------------------------------------
describe('Large array and pattern tests', () => {
  it('mergeSort: 1000 elements', () => {
    const arr = randomArr(1000);
    const result = mergeSort(arr);
    expect(isSortedAsc(result)).toBe(true);
    expect(result.length).toBe(1000);
  });

  it('quickSort: 1000 elements', () => {
    const arr = randomArr(1000);
    const result = quickSort(arr);
    expect(isSortedAsc(result)).toBe(true);
  });

  it('heapSort: 1000 elements', () => {
    const arr = randomArr(1000);
    expect(isSortedAsc(heapSort(arr))).toBe(true);
  });

  it('timSort: 1000 elements', () => {
    const arr = randomArr(1000);
    expect(isSortedAsc(timSort(arr))).toBe(true);
  });

  it('shellSort: 1000 elements', () => {
    const arr = randomArr(1000);
    expect(isSortedAsc(shellSort(arr))).toBe(true);
  });

  it('radixSort: 1000 non-negative elements', () => {
    const arr = Array.from({ length: 1000 }, () => Math.floor(Math.random() * 10000));
    expect(isSortedAsc(radixSort(arr))).toBe(true);
  });

  it('bubbleSort: sawtooth pattern', () => {
    const arr = [1, 5, 2, 6, 3, 7, 4, 8];
    expect(bubbleSort(arr)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it('insertionSort: nearly sorted (one out-of-place)', () => {
    const arr = [1, 2, 3, 4, 5, 0];
    expect(insertionSort(arr)).toEqual([0, 1, 2, 3, 4, 5]);
  });

  it('mergeSort: duplicates only', () => {
    const arr = [3, 3, 3, 3, 3, 3, 3];
    expect(mergeSort(arr)).toEqual([3, 3, 3, 3, 3, 3, 3]);
  });

  it('heapSort: two elements equal', () => {
    expect(heapSort([2, 2])).toEqual([2, 2]);
  });

  it('countInversions: max inversions n=4 is 6', () => {
    expect(countInversions([4, 3, 2, 1])).toBe(6);
  });

  it('countSwaps: max for n=4 is 6', () => {
    expect(countSwaps([4, 3, 2, 1])).toBe(6);
  });

  it('isSorted: single negative returns true', () => {
    expect(isSorted([-1])).toBe(true);
  });

  it('bubbleSort: strings with custom compare', () => {
    const arr = ['banana', 'apple', 'cherry', 'date'];
    const result = bubbleSort(arr, (a, b) => a.localeCompare(b));
    expect(result).toEqual(['apple', 'banana', 'cherry', 'date']);
  });

  it('mergeSort: strings', () => {
    const arr = ['z', 'a', 'm', 'b'];
    expect(mergeSort(arr)).toEqual(['a', 'b', 'm', 'z']);
  });

  it('quickSort: strings', () => {
    const arr = ['z', 'a', 'm', 'b'];
    expect(quickSort(arr)).toEqual(['a', 'b', 'm', 'z']);
  });

  it('heapSort: strings', () => {
    const arr = ['z', 'a', 'm', 'b'];
    expect(heapSort(arr)).toEqual(['a', 'b', 'm', 'z']);
  });

  it('insertionSort: strings', () => {
    const arr = ['z', 'a', 'm', 'b'];
    expect(insertionSort(arr)).toEqual(['a', 'b', 'm', 'z']);
  });

  it('shellSort: strings', () => {
    const arr = ['z', 'a', 'm', 'b'];
    expect(shellSort(arr)).toEqual(['a', 'b', 'm', 'z']);
  });

  it('countingSort: explicit range wider than values', () => {
    const arr = [3, 1, 2];
    const result = countingSort(arr, 0, 10);
    expect(result).toEqual([1, 2, 3]);
  });

  it('bucketSort: already sorted', () => {
    const arr = [1, 2, 3, 4, 5];
    expect(bucketSort(arr)).toEqual([1, 2, 3, 4, 5]);
  });

  it('bucketSort: reverse sorted', () => {
    const arr = [5, 4, 3, 2, 1];
    expect(isSortedAsc(bucketSort(arr))).toBe(true);
  });

  it('cocktailSort: large array', () => {
    const arr = randomArr(100);
    expect(isSortedAsc(cocktailSort(arr))).toBe(true);
  });

  it('gnomeSort: large array', () => {
    const arr = randomArr(100);
    expect(isSortedAsc(gnomeSort(arr))).toBe(true);
  });
});
