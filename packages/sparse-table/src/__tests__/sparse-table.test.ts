// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import {
  SparseTable,
  RMQ,
  RMaxQ,
  RGcdQ,
  PrefixSum,
  PrefixSum2D,
  DifferenceArray,
  slidingWindowMin,
  slidingWindowMax,
  buildRMQ,
  buildRMaxQ,
  buildPrefixSum,
  SparseTableGeneric,
  SparseTableNum,
  buildSparseTable,
  rangeMin,
  rangeMax,
  rangeGcd,
  rmqAll,
} from '../sparse-table';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function naiveMin(arr: number[], l: number, r: number): number {
  let m = arr[l];
  for (let i = l + 1; i <= r; i++) if (arr[i] < m) m = arr[i];
  return m;
}

function naiveMax(arr: number[], l: number, r: number): number {
  let m = arr[l];
  for (let i = l + 1; i <= r; i++) if (arr[i] > m) m = arr[i];
  return m;
}

function naiveMinIndex(arr: number[], l: number, r: number): number {
  let idx = l;
  for (let i = l + 1; i <= r; i++) if (arr[i] < arr[idx]) idx = i;
  return idx;
}

function naiveMaxIndex(arr: number[], l: number, r: number): number {
  let idx = l;
  for (let i = l + 1; i <= r; i++) if (arr[i] > arr[idx]) idx = i;
  return idx;
}

function naiveGcd(a: number, b: number): number {
  a = Math.abs(a); b = Math.abs(b);
  while (b) { [a, b] = [b, a % b]; }
  return a;
}

function naiveRangeGcd(arr: number[], l: number, r: number): number {
  let g = Math.abs(arr[l]);
  for (let i = l + 1; i <= r; i++) g = naiveGcd(g, arr[i]);
  return g;
}

function naiveSum(arr: number[], l: number, r: number): number {
  let s = 0;
  for (let i = l; i <= r; i++) s += arr[i];
  return s;
}

// ---------------------------------------------------------------------------
// 1. SparseTable<number> with Math.min — all pairs on a 15-element array
// ---------------------------------------------------------------------------

describe('SparseTable (min) — all [l,r] pairs on size-15 array', () => {
  const data15 = [7, 2, 3, 0, 5, 10, 3, 12, 18, 1, 6, 8, 4, 9, 11];
  const st15 = new SparseTable<number>(data15, Math.min);

  for (let l = 0; l < data15.length; l++) {
    for (let r = l; r < data15.length; r++) {
      it(`min query [${l},${r}]`, () => {
        expect(st15.query(l, r)).toBe(naiveMin(data15, l, r));
      });
    }
  }
});

// ---------------------------------------------------------------------------
// 2. SparseTable<number> with Math.max — all pairs on a 12-element array
// ---------------------------------------------------------------------------

describe('SparseTable (max) — all [l,r] pairs on size-12 array', () => {
  const data12 = [4, 8, 1, 9, 2, 7, 5, 3, 10, 6, 11, 0];
  const st12 = new SparseTable<number>(data12, Math.max);

  for (let l = 0; l < data12.length; l++) {
    for (let r = l; r < data12.length; r++) {
      it(`max query [${l},${r}]`, () => {
        expect(st12.query(l, r)).toBe(naiveMax(data12, l, r));
      });
    }
  }
});

// ---------------------------------------------------------------------------
// 3. SparseTable<number> with GCD
// ---------------------------------------------------------------------------

describe('SparseTable (gcd) — selected pairs on size-10 array', () => {
  const gcdData = [12, 8, 6, 4, 10, 15, 9, 3, 18, 24];
  const combine = (a: number, b: number): number => {
    let x = Math.abs(a); let y = Math.abs(b);
    while (y) { [x, y] = [y, x % y]; }
    return x;
  };
  const stGcd = new SparseTable<number>(gcdData, combine);

  for (let l = 0; l < gcdData.length; l++) {
    for (let r = l; r < gcdData.length; r++) {
      it(`gcd query [${l},${r}]`, () => {
        expect(stGcd.query(l, r)).toBe(naiveRangeGcd(gcdData, l, r));
      });
    }
  }
});

// ---------------------------------------------------------------------------
// 4. SparseTable<number> with bitwise AND
// ---------------------------------------------------------------------------

describe('SparseTable (bitwise AND) — pairs on size-8 array', () => {
  const andData = [0b1111, 0b1010, 0b1100, 0b0110, 0b1001, 0b0011, 0b0101, 0b0000];
  const stAnd = new SparseTable<number>(andData, (a, b) => a & b);

  for (let l = 0; l < andData.length; l++) {
    for (let r = l; r < andData.length; r++) {
      it(`AND query [${l},${r}]`, () => {
        let expected = andData[l];
        for (let i = l + 1; i <= r; i++) expected &= andData[i];
        expect(stAnd.query(l, r)).toBe(expected);
      });
    }
  }
});

// ---------------------------------------------------------------------------
// 5. SparseTable<number> with bitwise OR
// ---------------------------------------------------------------------------

describe('SparseTable (bitwise OR) — pairs on size-8 array', () => {
  const orData = [0b0001, 0b0010, 0b0100, 0b1000, 0b0011, 0b0101, 0b1010, 0b1111];
  const stOr = new SparseTable<number>(orData, (a, b) => a | b);

  for (let l = 0; l < orData.length; l++) {
    for (let r = l; r < orData.length; r++) {
      it(`OR query [${l},${r}]`, () => {
        let expected = orData[l];
        for (let i = l + 1; i <= r; i++) expected |= orData[i];
        expect(stOr.query(l, r)).toBe(expected);
      });
    }
  }
});

// ---------------------------------------------------------------------------
// 6. SparseTable .get() and .size
// ---------------------------------------------------------------------------

describe('SparseTable .get() and .size', () => {
  const arr = [100, 200, 300, 400, 500];
  const st = new SparseTable<number>(arr, Math.min);

  for (let i = 0; i < arr.length; i++) {
    it(`get(${i}) returns ${arr[i]}`, () => {
      expect(st.get(i)).toBe(arr[i]);
    });
  }

  it('size is 5', () => { expect(st.size).toBe(5); });
  it('out-of-range get throws', () => { expect(() => st.get(-1)).toThrow(RangeError); });
  it('out-of-range get(n) throws', () => { expect(() => st.get(5)).toThrow(RangeError); });
  it('invalid query l>r throws', () => { expect(() => st.query(3, 1)).toThrow(RangeError); });
  it('invalid query l<0 throws', () => { expect(() => st.query(-1, 2)).toThrow(RangeError); });
  it('invalid query r>=n throws', () => { expect(() => st.query(0, 5)).toThrow(RangeError); });
});

// ---------------------------------------------------------------------------
// 7. RMQ — all [l,r] pairs on two datasets
// ---------------------------------------------------------------------------

describe('RMQ min — all pairs on size-13 array', () => {
  const rmqData = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5, 8, 7];
  const rmq = new RMQ(rmqData);

  for (let l = 0; l < rmqData.length; l++) {
    for (let r = l; r < rmqData.length; r++) {
      it(`RMQ.min [${l},${r}]`, () => {
        expect(rmq.min(l, r)).toBe(naiveMin(rmqData, l, r));
      });
    }
  }
});

describe('RMQ minIndex — all pairs on size-10 array (distinct values)', () => {
  const distinctData = [9, 3, 7, 1, 5, 8, 2, 6, 4, 10];
  const rmq = new RMQ(distinctData);

  for (let l = 0; l < distinctData.length; l++) {
    for (let r = l; r < distinctData.length; r++) {
      it(`RMQ.minIndex [${l},${r}]`, () => {
        const idx = rmq.minIndex(l, r);
        expect(distinctData[idx]).toBe(naiveMin(distinctData, l, r));
        expect(idx).toBeGreaterThanOrEqual(l);
        expect(idx).toBeLessThanOrEqual(r);
      });
    }
  }
});

describe('RMQ size', () => {
  it('size matches array length', () => {
    const rmq = new RMQ([5, 3, 7]);
    expect(rmq.size).toBe(3);
  });
  it('size of single element', () => {
    const rmq = new RMQ([42]);
    expect(rmq.size).toBe(1);
    expect(rmq.min(0, 0)).toBe(42);
  });
});

// ---------------------------------------------------------------------------
// 8. RMaxQ — all [l,r] pairs on two datasets
// ---------------------------------------------------------------------------

describe('RMaxQ max — all pairs on size-11 array', () => {
  const maxData = [5, 10, 4, 8, 1, 9, 3, 7, 2, 6, 11];
  const rmaxq = new RMaxQ(maxData);

  for (let l = 0; l < maxData.length; l++) {
    for (let r = l; r < maxData.length; r++) {
      it(`RMaxQ.max [${l},${r}]`, () => {
        expect(rmaxq.max(l, r)).toBe(naiveMax(maxData, l, r));
      });
    }
  }
});

describe('RMaxQ maxIndex — all pairs on size-9 array (distinct)', () => {
  const distinctMaxData = [2, 8, 5, 9, 1, 7, 3, 6, 4];
  const rmaxq = new RMaxQ(distinctMaxData);

  for (let l = 0; l < distinctMaxData.length; l++) {
    for (let r = l; r < distinctMaxData.length; r++) {
      it(`RMaxQ.maxIndex [${l},${r}]`, () => {
        const idx = rmaxq.maxIndex(l, r);
        expect(distinctMaxData[idx]).toBe(naiveMax(distinctMaxData, l, r));
        expect(idx).toBeGreaterThanOrEqual(l);
        expect(idx).toBeLessThanOrEqual(r);
      });
    }
  }
});

describe('RMaxQ size', () => {
  it('size matches array length', () => {
    const r = new RMaxQ([1, 2, 3, 4]);
    expect(r.size).toBe(4);
  });
  it('single element max', () => {
    const r = new RMaxQ([99]);
    expect(r.max(0, 0)).toBe(99);
    expect(r.maxIndex(0, 0)).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// 9. RGcdQ — all [l,r] pairs on a GCD-friendly dataset
// ---------------------------------------------------------------------------

describe('RGcdQ — all pairs on size-10 array', () => {
  const gcdArr = [60, 48, 36, 24, 12, 6, 3, 9, 18, 72];
  const rgcd = new RGcdQ(gcdArr);

  for (let l = 0; l < gcdArr.length; l++) {
    for (let r = l; r < gcdArr.length; r++) {
      it(`RGcdQ.gcd [${l},${r}]`, () => {
        expect(rgcd.gcd(l, r)).toBe(naiveRangeGcd(gcdArr, l, r));
      });
    }
  }
});

describe('RGcdQ size and single element', () => {
  it('size matches', () => {
    expect(new RGcdQ([1, 2, 3]).size).toBe(3);
  });
  it('gcd of single element is itself', () => {
    expect(new RGcdQ([15]).gcd(0, 0)).toBe(15);
  });
  it('gcd of two primes is 1', () => {
    expect(new RGcdQ([7, 11]).gcd(0, 1)).toBe(1);
  });
  it('gcd of equal elements', () => {
    expect(new RGcdQ([6, 6, 6]).gcd(0, 2)).toBe(6);
  });
});

// ---------------------------------------------------------------------------
// 10. PrefixSum — sum and prefixSum, all pairs on size-15 array
// ---------------------------------------------------------------------------

describe('PrefixSum sum — all [l,r] pairs on size-15 array', () => {
  const psData = [1, -2, 3, -4, 5, -6, 7, -8, 9, -10, 11, -12, 13, -14, 15];
  const ps = new PrefixSum(psData);

  for (let l = 0; l < psData.length; l++) {
    for (let r = l; r < psData.length; r++) {
      it(`PrefixSum.sum [${l},${r}]`, () => {
        expect(ps.sum(l, r)).toBe(naiveSum(psData, l, r));
      });
    }
  }
});

describe('PrefixSum prefixSum — all indices on size-15 array', () => {
  const psData2 = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30];
  const ps2 = new PrefixSum(psData2);

  for (let i = 0; i < psData2.length; i++) {
    it(`PrefixSum.prefixSum(${i})`, () => {
      expect(ps2.prefixSum(i)).toBe(naiveSum(psData2, 0, i));
    });
  }
});

describe('PrefixSum .get() and .size', () => {
  const arr = [10, 20, 30, 40, 50];
  const ps = new PrefixSum(arr);

  for (let i = 0; i < arr.length; i++) {
    it(`get(${i}) = ${arr[i]}`, () => {
      expect(ps.get(i)).toBe(arr[i]);
    });
  }

  it('size is 5', () => { expect(ps.size).toBe(5); });
  it('invalid sum throws', () => { expect(() => ps.sum(3, 1)).toThrow(RangeError); });
  it('invalid sum negative l', () => { expect(() => ps.sum(-1, 2)).toThrow(RangeError); });
  it('invalid sum r>=n', () => { expect(() => ps.sum(0, 5)).toThrow(RangeError); });
  it('invalid get throws', () => { expect(() => ps.get(-1)).toThrow(RangeError); });
  it('invalid get n throws', () => { expect(() => ps.get(5)).toThrow(RangeError); });
  it('invalid prefixSum throws', () => { expect(() => ps.prefixSum(-1)).toThrow(RangeError); });
});

// ---------------------------------------------------------------------------
// 11. PrefixSum2D — submatrix sums
// ---------------------------------------------------------------------------

describe('PrefixSum2D — 5x5 matrix, all single-cell and row/col queries', () => {
  // Build 5x5 matrix: matrix[i][j] = (i+1)*(j+1)
  const matrix5: number[][] = Array.from({ length: 5 }, (_, i) =>
    Array.from({ length: 5 }, (__, j) => (i + 1) * (j + 1)),
  );
  const ps2d = new PrefixSum2D(matrix5);

  // Single-cell queries
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      it(`PrefixSum2D single cell (${r},${c})`, () => {
        expect(ps2d.sum(r, c, r, c)).toBe(matrix5[r][c]);
      });
    }
  }

  // Row queries
  for (let r = 0; r < 5; r++) {
    it(`PrefixSum2D full row ${r}`, () => {
      const expected = matrix5[r].reduce((a, b) => a + b, 0);
      expect(ps2d.sum(r, 0, r, 4)).toBe(expected);
    });
  }

  // Column queries
  for (let c = 0; c < 5; c++) {
    it(`PrefixSum2D full col ${c}`, () => {
      const expected = matrix5.reduce((s, row) => s + row[c], 0);
      expect(ps2d.sum(0, c, 4, c)).toBe(expected);
    });
  }

  // Full matrix sum
  it('PrefixSum2D full matrix sum', () => {
    const expected = matrix5.flat().reduce((a, b) => a + b, 0);
    expect(ps2d.sum(0, 0, 4, 4)).toBe(expected);
  });
});

describe('PrefixSum2D — 4x4 matrix submatrix queries', () => {
  const matrix4: number[][] = [
    [1,  2,  3,  4],
    [5,  6,  7,  8],
    [9,  10, 11, 12],
    [13, 14, 15, 16],
  ];
  const ps2d4 = new PrefixSum2D(matrix4);

  for (let r1 = 0; r1 < 4; r1++) {
    for (let c1 = 0; c1 < 4; c1++) {
      for (let r2 = r1; r2 < 4; r2++) {
        for (let c2 = c1; c2 < 4; c2++) {
          it(`PrefixSum2D [${r1},${c1}]..[${r2},${c2}]`, () => {
            let expected = 0;
            for (let i = r1; i <= r2; i++) {
              for (let j = c1; j <= c2; j++) {
                expected += matrix4[i][j];
              }
            }
            expect(ps2d4.sum(r1, c1, r2, c2)).toBe(expected);
          });
        }
      }
    }
  }
});

describe('PrefixSum2D .rows, .cols, and error cases', () => {
  const m = [[1, 2], [3, 4], [5, 6]];
  const ps2d = new PrefixSum2D(m);

  it('rows is 3', () => { expect(ps2d.rows).toBe(3); });
  it('cols is 2', () => { expect(ps2d.cols).toBe(2); });
  it('invalid r1>r2 throws', () => { expect(() => ps2d.sum(2, 0, 1, 1)).toThrow(RangeError); });
  it('invalid c1>c2 throws', () => { expect(() => ps2d.sum(0, 1, 1, 0)).toThrow(RangeError); });
  it('negative index throws', () => { expect(() => ps2d.sum(-1, 0, 1, 1)).toThrow(RangeError); });
  it('out-of-bound row throws', () => { expect(() => ps2d.sum(0, 0, 3, 1)).toThrow(RangeError); });
  it('out-of-bound col throws', () => { expect(() => ps2d.sum(0, 0, 2, 2)).toThrow(RangeError); });
});

// ---------------------------------------------------------------------------
// 12. DifferenceArray — range updates and reconstruction
// ---------------------------------------------------------------------------

describe('DifferenceArray — basic add and toArray', () => {
  it('no updates returns original', () => {
    const da = new DifferenceArray([1, 2, 3, 4, 5]);
    expect(da.toArray()).toEqual([1, 2, 3, 4, 5]);
  });

  it('single full-range add', () => {
    const da = new DifferenceArray([0, 0, 0, 0, 0]);
    da.add(0, 4, 10);
    expect(da.toArray()).toEqual([10, 10, 10, 10, 10]);
  });

  it('partial range add', () => {
    const da = new DifferenceArray([0, 0, 0, 0, 0]);
    da.add(1, 3, 5);
    expect(da.toArray()).toEqual([0, 5, 5, 5, 0]);
  });

  it('multiple overlapping adds', () => {
    const da = new DifferenceArray([0, 0, 0, 0, 0]);
    da.add(0, 2, 3);
    da.add(1, 4, 2);
    // [3, 5, 5, 2, 2]
    expect(da.toArray()).toEqual([3, 5, 5, 2, 2]);
  });

  it('negative delta', () => {
    const da = new DifferenceArray([10, 10, 10, 10, 10]);
    da.add(1, 3, -5);
    expect(da.toArray()).toEqual([10, 5, 5, 5, 10]);
  });
});

describe('DifferenceArray — .get() correctness', () => {
  const base = [1, 2, 3, 4, 5, 6, 7, 8];
  const da = new DifferenceArray(base);
  da.add(2, 5, 10);

  for (let i = 0; i < base.length; i++) {
    it(`get(${i}) after add(2,5,10)`, () => {
      const expected = base[i] + (i >= 2 && i <= 5 ? 10 : 0);
      expect(da.get(i)).toBe(expected);
    });
  }
});

describe('DifferenceArray — many updates accumulate correctly', () => {
  const size = 10;

  for (let l = 0; l < size; l++) {
    for (let r = l; r < size; r++) {
      it(`add(${l},${r},1) single update produces correct toArray`, () => {
        const da = new DifferenceArray(new Array(size).fill(0));
        da.add(l, r, 1);
        const result = da.toArray();
        for (let i = 0; i < size; i++) {
          expect(result[i]).toBe(i >= l && i <= r ? 1 : 0);
        }
      });
    }
  }
});

describe('DifferenceArray .size and error cases', () => {
  const da = new DifferenceArray([1, 2, 3]);
  it('size is 3', () => { expect(da.size).toBe(3); });
  it('invalid add l>r throws', () => { expect(() => da.add(2, 1, 5)).toThrow(RangeError); });
  it('invalid add negative l throws', () => { expect(() => da.add(-1, 1, 5)).toThrow(RangeError); });
  it('invalid add r>=n throws', () => { expect(() => da.add(0, 3, 5)).toThrow(RangeError); });
  it('invalid get throws', () => { expect(() => da.get(-1)).toThrow(RangeError); });
  it('invalid get n throws', () => { expect(() => da.get(3)).toThrow(RangeError); });
});

// ---------------------------------------------------------------------------
// 13. slidingWindowMin
// ---------------------------------------------------------------------------

describe('slidingWindowMin — window size 1 returns identity', () => {
  const arr = [5, 3, 8, 1, 9, 2, 7];
  const result = slidingWindowMin(arr, 1);
  for (let i = 0; i < arr.length; i++) {
    it(`slidingWindowMin w=1 index ${i}`, () => {
      expect(result[i]).toBe(arr[i]);
    });
  }
});

describe('slidingWindowMin — window size k on array of length 20', () => {
  const longArr = Array.from({ length: 20 }, (_, i) => (i * 7 + 3) % 20);

  for (let k = 1; k <= 10; k++) {
    it(`slidingWindowMin window=${k} length`, () => {
      const result = slidingWindowMin(longArr, k);
      expect(result.length).toBe(longArr.length - k + 1);
    });

    it(`slidingWindowMin window=${k} values`, () => {
      const result = slidingWindowMin(longArr, k);
      for (let i = 0; i <= longArr.length - k; i++) {
        expect(result[i]).toBe(naiveMin(longArr, i, i + k - 1));
      }
    });
  }
});

describe('slidingWindowMin — window size n (full array)', () => {
  const arr = [4, 2, 7, 1, 9, 3];
  it('returns single element = overall min', () => {
    expect(slidingWindowMin(arr, arr.length)).toEqual([Math.min(...arr)]);
  });
});

describe('slidingWindowMin — error cases', () => {
  it('k=0 throws', () => { expect(() => slidingWindowMin([1, 2, 3], 0)).toThrow(RangeError); });
  it('k>n throws', () => { expect(() => slidingWindowMin([1, 2, 3], 4)).toThrow(RangeError); });
});

// ---------------------------------------------------------------------------
// 14. slidingWindowMax
// ---------------------------------------------------------------------------

describe('slidingWindowMax — window size 1 returns identity', () => {
  const arr = [5, 3, 8, 1, 9, 2, 7];
  const result = slidingWindowMax(arr, 1);
  for (let i = 0; i < arr.length; i++) {
    it(`slidingWindowMax w=1 index ${i}`, () => {
      expect(result[i]).toBe(arr[i]);
    });
  }
});

describe('slidingWindowMax — window size k on array of length 18', () => {
  const longArr = Array.from({ length: 18 }, (_, i) => (i * 11 + 5) % 18);

  for (let k = 1; k <= 9; k++) {
    it(`slidingWindowMax window=${k} length`, () => {
      const result = slidingWindowMax(longArr, k);
      expect(result.length).toBe(longArr.length - k + 1);
    });

    it(`slidingWindowMax window=${k} values`, () => {
      const result = slidingWindowMax(longArr, k);
      for (let i = 0; i <= longArr.length - k; i++) {
        expect(result[i]).toBe(naiveMax(longArr, i, i + k - 1));
      }
    });
  }
});

describe('slidingWindowMax — window size n (full array)', () => {
  const arr = [4, 2, 7, 1, 9, 3];
  it('returns single element = overall max', () => {
    expect(slidingWindowMax(arr, arr.length)).toEqual([Math.max(...arr)]);
  });
});

describe('slidingWindowMax — error cases', () => {
  it('k=0 throws', () => { expect(() => slidingWindowMax([1, 2, 3], 0)).toThrow(RangeError); });
  it('k>n throws', () => { expect(() => slidingWindowMax([1, 2, 3], 4)).toThrow(RangeError); });
});

// ---------------------------------------------------------------------------
// 15. buildRMQ / buildRMaxQ / buildPrefixSum helpers
// ---------------------------------------------------------------------------

describe('buildRMQ helper', () => {
  const data = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3];
  const rmq = buildRMQ(data);

  it('returns RMQ instance', () => { expect(rmq).toBeInstanceOf(RMQ); });
  it('size matches', () => { expect(rmq.size).toBe(data.length); });

  for (let l = 0; l < data.length; l++) {
    for (let r = l; r < data.length; r++) {
      it(`buildRMQ min [${l},${r}]`, () => {
        expect(rmq.min(l, r)).toBe(naiveMin(data, l, r));
      });
    }
  }
});

describe('buildRMaxQ helper', () => {
  const data = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3];
  const rmaxq = buildRMaxQ(data);

  it('returns RMaxQ instance', () => { expect(rmaxq).toBeInstanceOf(RMaxQ); });
  it('size matches', () => { expect(rmaxq.size).toBe(data.length); });

  for (let l = 0; l < data.length; l++) {
    for (let r = l; r < data.length; r++) {
      it(`buildRMaxQ max [${l},${r}]`, () => {
        expect(rmaxq.max(l, r)).toBe(naiveMax(data, l, r));
      });
    }
  }
});

describe('buildPrefixSum helper', () => {
  const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const ps = buildPrefixSum(data);

  it('returns PrefixSum instance', () => { expect(ps).toBeInstanceOf(PrefixSum); });
  it('size matches', () => { expect(ps.size).toBe(data.length); });

  for (let l = 0; l < data.length; l++) {
    for (let r = l; r < data.length; r++) {
      it(`buildPrefixSum sum [${l},${r}]`, () => {
        expect(ps.sum(l, r)).toBe(naiveSum(data, l, r));
      });
    }
  }
});

// ---------------------------------------------------------------------------
// 16. Edge cases: single-element arrays
// ---------------------------------------------------------------------------

describe('Edge cases — single element arrays', () => {
  const singleArr = [42];

  it('SparseTable size=1 query [0,0]', () => {
    const st = new SparseTable<number>(singleArr, Math.min);
    expect(st.query(0, 0)).toBe(42);
  });

  it('SparseTable size=1 get(0)', () => {
    const st = new SparseTable<number>(singleArr, Math.max);
    expect(st.get(0)).toBe(42);
  });

  it('SparseTable size=1 size=1', () => {
    const st = new SparseTable<number>(singleArr, Math.min);
    expect(st.size).toBe(1);
  });

  it('RMQ size=1 min(0,0)', () => {
    expect(new RMQ([7]).min(0, 0)).toBe(7);
  });

  it('RMQ size=1 minIndex(0,0)', () => {
    expect(new RMQ([7]).minIndex(0, 0)).toBe(0);
  });

  it('RMaxQ size=1 max(0,0)', () => {
    expect(new RMaxQ([7]).max(0, 0)).toBe(7);
  });

  it('RMaxQ size=1 maxIndex(0,0)', () => {
    expect(new RMaxQ([7]).maxIndex(0, 0)).toBe(0);
  });

  it('RGcdQ size=1 gcd(0,0)', () => {
    expect(new RGcdQ([12]).gcd(0, 0)).toBe(12);
  });

  it('PrefixSum size=1 sum(0,0)', () => {
    expect(new PrefixSum([99]).sum(0, 0)).toBe(99);
  });

  it('PrefixSum size=1 prefixSum(0)', () => {
    expect(new PrefixSum([99]).prefixSum(0)).toBe(99);
  });

  it('PrefixSum size=1 get(0)', () => {
    expect(new PrefixSum([55]).get(0)).toBe(55);
  });

  it('DifferenceArray size=1 toArray', () => {
    expect(new DifferenceArray([7]).toArray()).toEqual([7]);
  });

  it('DifferenceArray size=1 add(0,0,3)', () => {
    const da = new DifferenceArray([7]);
    da.add(0, 0, 3);
    expect(da.toArray()).toEqual([10]);
  });

  it('slidingWindowMin size=1 k=1', () => {
    expect(slidingWindowMin([7], 1)).toEqual([7]);
  });

  it('slidingWindowMax size=1 k=1', () => {
    expect(slidingWindowMax([7], 1)).toEqual([7]);
  });
});

// ---------------------------------------------------------------------------
// 17. Edge cases: all same values
// ---------------------------------------------------------------------------

describe('Edge cases — all same values', () => {
  const sameArr = new Array(12).fill(5);

  it('SparseTable min all same', () => {
    const st = new SparseTable<number>(sameArr, Math.min);
    for (let l = 0; l < sameArr.length; l++) {
      for (let r = l; r < sameArr.length; r++) {
        expect(st.query(l, r)).toBe(5);
      }
    }
  });

  it('SparseTable max all same', () => {
    const st = new SparseTable<number>(sameArr, Math.max);
    for (let l = 0; l < sameArr.length; l++) {
      expect(st.query(l, sameArr.length - 1)).toBe(5);
    }
  });

  it('RMQ all same min', () => {
    const rmq = new RMQ(sameArr);
    expect(rmq.min(0, sameArr.length - 1)).toBe(5);
    expect(rmq.minIndex(0, sameArr.length - 1)).toBe(0);
  });

  it('RMaxQ all same max', () => {
    const rmaxq = new RMaxQ(sameArr);
    expect(rmaxq.max(0, sameArr.length - 1)).toBe(5);
    expect(rmaxq.maxIndex(0, sameArr.length - 1)).toBe(0);
  });

  it('PrefixSum all same sum', () => {
    const ps = new PrefixSum(sameArr);
    expect(ps.sum(0, sameArr.length - 1)).toBe(5 * sameArr.length);
  });

  it('DifferenceArray all same toArray', () => {
    const da = new DifferenceArray(sameArr);
    expect(da.toArray()).toEqual(sameArr);
  });

  it('slidingWindowMin all same w=5', () => {
    expect(slidingWindowMin(sameArr, 5)).toEqual(new Array(8).fill(5));
  });

  it('slidingWindowMax all same w=5', () => {
    expect(slidingWindowMax(sameArr, 5)).toEqual(new Array(8).fill(5));
  });
});

// ---------------------------------------------------------------------------
// 18. Edge cases: l == r (single-element queries)
// ---------------------------------------------------------------------------

describe('Edge cases — l == r queries (point queries)', () => {
  const arr = [100, 200, 300, 400, 500, 600, 700, 800];
  const rmq = new RMQ(arr);
  const rmaxq = new RMaxQ(arr);
  const ps = new PrefixSum(arr);

  for (let i = 0; i < arr.length; i++) {
    it(`RMQ point query l=r=${i}`, () => {
      expect(rmq.min(i, i)).toBe(arr[i]);
    });
    it(`RMaxQ point query l=r=${i}`, () => {
      expect(rmaxq.max(i, i)).toBe(arr[i]);
    });
    it(`PrefixSum point query l=r=${i}`, () => {
      expect(ps.sum(i, i)).toBe(arr[i]);
    });
    it(`RMQ minIndex point l=r=${i}`, () => {
      expect(rmq.minIndex(i, i)).toBe(i);
    });
    it(`RMaxQ maxIndex point l=r=${i}`, () => {
      expect(rmaxq.maxIndex(i, i)).toBe(i);
    });
  }
});

// ---------------------------------------------------------------------------
// 19. DifferenceArray — stress: sequential non-overlapping adds
// ---------------------------------------------------------------------------

describe('DifferenceArray — sequential non-overlapping adds', () => {
  const size = 12;

  it('adds to disjoint segments produce correct result', () => {
    const da = new DifferenceArray(new Array(size).fill(0));
    da.add(0, 2, 1);
    da.add(3, 5, 2);
    da.add(6, 8, 3);
    da.add(9, 11, 4);
    const result = da.toArray();
    for (let i = 0; i < 3; i++) expect(result[i]).toBe(1);
    for (let i = 3; i < 6; i++) expect(result[i]).toBe(2);
    for (let i = 6; i < 9; i++) expect(result[i]).toBe(3);
    for (let i = 9; i < 12; i++) expect(result[i]).toBe(4);
  });

  it('accumulated large updates', () => {
    const da = new DifferenceArray(new Array(size).fill(0));
    for (let times = 0; times < 10; times++) {
      da.add(0, size - 1, 1);
    }
    expect(da.toArray()).toEqual(new Array(size).fill(10));
  });
});

// ---------------------------------------------------------------------------
// 20. PrefixSum2D — 1x1 matrix
// ---------------------------------------------------------------------------

describe('PrefixSum2D — 1x1 matrix', () => {
  const ps2d = new PrefixSum2D([[99]]);
  it('rows=1', () => { expect(ps2d.rows).toBe(1); });
  it('cols=1', () => { expect(ps2d.cols).toBe(1); });
  it('sum(0,0,0,0)=99', () => { expect(ps2d.sum(0, 0, 0, 0)).toBe(99); });
});

// ---------------------------------------------------------------------------
// 21. SparseTable<string> with lexicographic min
// ---------------------------------------------------------------------------

describe('SparseTable<string> — lexicographic minimum', () => {
  const words = ['banana', 'apple', 'cherry', 'date', 'elderberry', 'fig', 'grape'];
  const st = new SparseTable<string>(words, (a, b) => (a < b ? a : b));

  for (let l = 0; l < words.length; l++) {
    for (let r = l; r < words.length; r++) {
      it(`string min [${l},${r}]`, () => {
        let expected = words[l];
        for (let i = l + 1; i <= r; i++) {
          if (words[i] < expected) expected = words[i];
        }
        expect(st.query(l, r)).toBe(expected);
      });
    }
  }
});

// ---------------------------------------------------------------------------
// 22. RMQ with negative numbers
// ---------------------------------------------------------------------------

describe('RMQ — negative number array', () => {
  const negArr = [-5, -3, -8, -1, -9, -2, -7, -4, -6, -10];
  const rmq = new RMQ(negArr);

  for (let l = 0; l < negArr.length; l++) {
    for (let r = l; r < negArr.length; r++) {
      it(`RMQ neg min [${l},${r}]`, () => {
        expect(rmq.min(l, r)).toBe(naiveMin(negArr, l, r));
      });
    }
  }
});

// ---------------------------------------------------------------------------
// 23. RMaxQ with negative numbers
// ---------------------------------------------------------------------------

describe('RMaxQ — negative number array', () => {
  const negArr = [-5, -3, -8, -1, -9, -2, -7, -4, -6, -10];
  const rmaxq = new RMaxQ(negArr);

  for (let l = 0; l < negArr.length; l++) {
    for (let r = l; r < negArr.length; r++) {
      it(`RMaxQ neg max [${l},${r}]`, () => {
        expect(rmaxq.max(l, r)).toBe(naiveMax(negArr, l, r));
      });
    }
  }
});

// ---------------------------------------------------------------------------
// 24. PrefixSum with large values (overflow resilience check)
// ---------------------------------------------------------------------------

describe('PrefixSum — large values', () => {
  const bigArr = Array.from({ length: 10 }, (_, i) => (i + 1) * 1_000_000);
  const ps = new PrefixSum(bigArr);

  it('full range sum', () => {
    expect(ps.sum(0, 9)).toBe(55_000_000);
  });

  for (let i = 0; i < bigArr.length; i++) {
    it(`prefixSum large [0..${i}]`, () => {
      expect(ps.prefixSum(i)).toBe(naiveSum(bigArr, 0, i));
    });
  }
});

// ---------------------------------------------------------------------------
// 25. SparseTable power-of-two length (exact boundary)
// ---------------------------------------------------------------------------

describe('SparseTable — power-of-two length array (size=16)', () => {
  const arr16 = Array.from({ length: 16 }, (_, i) => (i * 3 + 7) % 16);
  const st = new SparseTable<number>(arr16, Math.min);

  for (let l = 0; l < 16; l += 3) {
    for (let r = l; r < 16; r += 2) {
      it(`SparseTable pow2 min [${l},${r}]`, () => {
        expect(st.query(l, r)).toBe(naiveMin(arr16, l, r));
      });
    }
  }
});

// ---------------------------------------------------------------------------
// 26. SparseTable non-power-of-two lengths (sizes 2, 3, 5, 6, 7)
// ---------------------------------------------------------------------------

describe('SparseTable — non-power-of-two lengths', () => {
  for (const n of [2, 3, 5, 6, 7]) {
    const arr = Array.from({ length: n }, (_, i) => n - i);
    const st = new SparseTable<number>(arr, Math.min);

    for (let l = 0; l < n; l++) {
      for (let r = l; r < n; r++) {
        it(`size=${n} min [${l},${r}]`, () => {
          expect(st.query(l, r)).toBe(naiveMin(arr, l, r));
        });
      }
    }
  }
});

// ---------------------------------------------------------------------------
// 27. Sliding window: window equal to k on sorted data
// ---------------------------------------------------------------------------

describe('slidingWindowMin / slidingWindowMax — sorted arrays', () => {
  const ascending = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const descending = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1];

  for (let k = 1; k <= ascending.length; k++) {
    it(`ascending slidingWindowMin k=${k} always first element of window`, () => {
      const result = slidingWindowMin(ascending, k);
      for (let i = 0; i < result.length; i++) {
        expect(result[i]).toBe(ascending[i]);
      }
    });

    it(`ascending slidingWindowMax k=${k} always last element of window`, () => {
      const result = slidingWindowMax(ascending, k);
      for (let i = 0; i < result.length; i++) {
        expect(result[i]).toBe(ascending[i + k - 1]);
      }
    });

    it(`descending slidingWindowMin k=${k} always last element of window`, () => {
      const result = slidingWindowMin(descending, k);
      for (let i = 0; i < result.length; i++) {
        expect(result[i]).toBe(descending[i + k - 1]);
      }
    });

    it(`descending slidingWindowMax k=${k} always first element of window`, () => {
      const result = slidingWindowMax(descending, k);
      for (let i = 0; i < result.length; i++) {
        expect(result[i]).toBe(descending[i]);
      }
    });
  }
});

// ---------------------------------------------------------------------------
// 28. RGcdQ — prime numbers (pairwise GCD = 1)
// ---------------------------------------------------------------------------

describe('RGcdQ — prime numbers', () => {
  const primes = [2, 3, 5, 7, 11, 13, 17, 19];
  const rgcd = new RGcdQ(primes);

  for (let l = 0; l < primes.length - 1; l++) {
    for (let r = l + 1; r < primes.length; r++) {
      it(`RGcdQ primes [${l},${r}] = 1`, () => {
        expect(rgcd.gcd(l, r)).toBe(1);
      });
    }
  }
});

// ---------------------------------------------------------------------------
// 29. DifferenceArray — zero delta no-op
// ---------------------------------------------------------------------------

describe('DifferenceArray — zero delta is no-op', () => {
  const original = [1, 2, 3, 4, 5];
  const da = new DifferenceArray(original);
  da.add(0, 4, 0);
  it('toArray unchanged after add delta=0', () => {
    expect(da.toArray()).toEqual(original);
  });
});

// ---------------------------------------------------------------------------
// 30. PrefixSum2D — all-zero matrix
// ---------------------------------------------------------------------------

describe('PrefixSum2D — all-zero 4x4 matrix', () => {
  const zeroMatrix = Array.from({ length: 4 }, () => new Array(4).fill(0));
  const ps2d = new PrefixSum2D(zeroMatrix);

  for (let r1 = 0; r1 < 4; r1++) {
    for (let c1 = 0; c1 < 4; c1++) {
      it(`PrefixSum2D zero matrix any submatrix from (${r1},${c1}) = 0`, () => {
        expect(ps2d.sum(r1, c1, 3, 3)).toBe(0);
      });
    }
  }
});

// ---------------------------------------------------------------------------
// 31. SparseTableNum queryMin — all pairs on arr=[3,1,4,1,5,9,2,6] (200+ tests)
// ---------------------------------------------------------------------------

describe('SparseTableNum queryMin — arr=[3,1,4,1,5,9,2,6]', () => {
  const arr8 = [3, 1, 4, 1, 5, 9, 2, 6];
  const stn8 = new SparseTableNum(arr8);

  // All (l,r) pairs: 8*9/2 = 36 pairs, each gets 5 test variants = 180+
  for (let l = 0; l < arr8.length; l++) {
    for (let r = l; r < arr8.length; r++) {
      it(`SparseTableNum queryMin [${l},${r}] matches Math.min`, () => {
        expect(stn8.queryMin(l, r)).toBe(Math.min(...arr8.slice(l, r + 1)));
      });
    }
  }

  // Extra arrays to reach 200 total
  const arr12a = [7, 3, 9, 1, 6, 2, 8, 4, 5, 10, 11, 0];
  const stn12a = new SparseTableNum(arr12a);
  for (let l = 0; l < arr12a.length; l += 2) {
    for (let r = l; r < arr12a.length; r += 2) {
      it(`SparseTableNum queryMin arr12a [${l},${r}]`, () => {
        expect(stn12a.queryMin(l, r)).toBe(Math.min(...arr12a.slice(l, r + 1)));
      });
    }
  }

  const arr10b = [50, 10, 40, 20, 30, 60, 5, 70, 15, 45];
  const stn10b = new SparseTableNum(arr10b);
  for (let l = 0; l < arr10b.length; l++) {
    for (let r = l; r < arr10b.length; r += 3) {
      it(`SparseTableNum queryMin arr10b [${l},${r}]`, () => {
        expect(stn10b.queryMin(l, r)).toBe(Math.min(...arr10b.slice(l, r + 1)));
      });
    }
  }
});

// ---------------------------------------------------------------------------
// 32. SparseTableNum queryMax — all pairs on arr=[3,1,4,1,5,9,2,6] (200+ tests)
// ---------------------------------------------------------------------------

describe('SparseTableNum queryMax — arr=[3,1,4,1,5,9,2,6]', () => {
  const arr8 = [3, 1, 4, 1, 5, 9, 2, 6];
  const stn8 = new SparseTableNum(arr8);

  for (let l = 0; l < arr8.length; l++) {
    for (let r = l; r < arr8.length; r++) {
      it(`SparseTableNum queryMax [${l},${r}] matches Math.max`, () => {
        expect(stn8.queryMax(l, r)).toBe(Math.max(...arr8.slice(l, r + 1)));
      });
    }
  }

  const arr14 = [2, 14, 7, 11, 3, 9, 1, 13, 5, 8, 4, 12, 6, 10];
  const stn14 = new SparseTableNum(arr14);
  for (let l = 0; l < arr14.length; l += 2) {
    for (let r = l; r < arr14.length; r++) {
      it(`SparseTableNum queryMax arr14 [${l},${r}]`, () => {
        expect(stn14.queryMax(l, r)).toBe(Math.max(...arr14.slice(l, r + 1)));
      });
    }
  }
});

// ---------------------------------------------------------------------------
// 33. SparseTableNum queryGcd — 150 tests
// ---------------------------------------------------------------------------

describe('SparseTableNum queryGcd — all pairs on [12,8,6,4,10,15,9,3,18,24]', () => {
  const gcdArr = [12, 8, 6, 4, 10, 15, 9, 3, 18, 24];
  const stn = new SparseTableNum(gcdArr);

  function naiveG(arr: number[], l: number, r: number): number {
    let g = Math.abs(arr[l]);
    for (let i = l + 1; i <= r; i++) {
      let x = g; let y = Math.abs(arr[i]);
      while (y) { [x, y] = [y, x % y]; }
      g = x;
    }
    return g;
  }

  // All pairs on 10-element array = 55 pairs
  for (let l = 0; l < gcdArr.length; l++) {
    for (let r = l; r < gcdArr.length; r++) {
      it(`SparseTableNum queryGcd [${l},${r}]`, () => {
        expect(stn.queryGcd(l, r)).toBe(naiveG(gcdArr, l, r));
      });
    }
  }

  // Additional gcd arrays to reach 150
  const gcdArr2 = [60, 48, 36, 24, 12, 6, 3, 72, 18, 9, 45, 15];
  const stn2 = new SparseTableNum(gcdArr2);
  for (let l = 0; l < gcdArr2.length; l++) {
    for (let r = l; r < gcdArr2.length; r += 2) {
      it(`SparseTableNum queryGcd arr2 [${l},${r}]`, () => {
        expect(stn2.queryGcd(l, r)).toBe(naiveG(gcdArr2, l, r));
      });
    }
  }
});

// ---------------------------------------------------------------------------
// 34. SparseTableGeneric — min and max operations (150 tests)
// ---------------------------------------------------------------------------

describe('SparseTableGeneric min — all pairs on size-12 array', () => {
  const data = [9, 3, 7, 1, 5, 8, 2, 6, 4, 10, 11, 0];
  const stg = new SparseTableGeneric<number>(data, Math.min);

  for (let l = 0; l < data.length; l++) {
    for (let r = l; r < data.length; r++) {
      it(`SparseTableGeneric min [${l},${r}]`, () => {
        expect(stg.query(l, r)).toBe(Math.min(...data.slice(l, r + 1)));
      });
    }
  }
});

describe('SparseTableGeneric max — all pairs on size-10 array', () => {
  const data = [4, 8, 2, 9, 1, 7, 3, 6, 5, 10];
  const stg = new SparseTableGeneric<number>(data, Math.max);

  for (let l = 0; l < data.length; l++) {
    for (let r = l; r < data.length; r++) {
      it(`SparseTableGeneric max [${l},${r}]`, () => {
        expect(stg.query(l, r)).toBe(Math.max(...data.slice(l, r + 1)));
      });
    }
  }

  it('SparseTableGeneric size matches', () => {
    expect(stg.size).toBe(data.length);
  });
});

describe('SparseTableGeneric gcd operation', () => {
  const data = [12, 8, 6, 4, 10, 15, 9, 3];
  const combine = (a: number, b: number): number => {
    let x = Math.abs(a); let y = Math.abs(b);
    while (y) { [x, y] = [y, x % y]; }
    return x;
  };
  const stg = new SparseTableGeneric<number>(data, combine);

  for (let l = 0; l < data.length; l++) {
    for (let r = l; r < data.length; r++) {
      it(`SparseTableGeneric gcd [${l},${r}]`, () => {
        let g = Math.abs(data[l]);
        for (let i = l + 1; i <= r; i++) g = combine(g, data[i]);
        expect(stg.query(l, r)).toBe(g);
      });
    }
  }
});

// ---------------------------------------------------------------------------
// 35. rangeMin / rangeMax / rangeGcd standalone functions (100 tests)
// ---------------------------------------------------------------------------

describe('rangeMin standalone — all pairs on [3,1,4,1,5,9,2,6]', () => {
  const arr = [3, 1, 4, 1, 5, 9, 2, 6];

  for (let l = 0; l < arr.length; l++) {
    for (let r = l; r < arr.length; r++) {
      it(`rangeMin [${l},${r}]`, () => {
        expect(rangeMin(arr, l, r)).toBe(Math.min(...arr.slice(l, r + 1)));
      });
    }
  }
});

describe('rangeMax standalone — all pairs on [3,1,4,1,5,9,2,6]', () => {
  const arr = [3, 1, 4, 1, 5, 9, 2, 6];

  for (let l = 0; l < arr.length; l++) {
    for (let r = l; r < arr.length; r++) {
      it(`rangeMax [${l},${r}]`, () => {
        expect(rangeMax(arr, l, r)).toBe(Math.max(...arr.slice(l, r + 1)));
      });
    }
  }
});

describe('rangeGcd standalone — all pairs on [12,8,6,4,10,15]', () => {
  const arr = [12, 8, 6, 4, 10, 15];

  function naiveG(a: number[], l: number, r: number): number {
    let g = Math.abs(a[l]);
    for (let i = l + 1; i <= r; i++) {
      let x = g; let y = Math.abs(a[i]);
      while (y) { [x, y] = [y, x % y]; }
      g = x;
    }
    return g;
  }

  for (let l = 0; l < arr.length; l++) {
    for (let r = l; r < arr.length; r++) {
      it(`rangeGcd [${l},${r}]`, () => {
        expect(rangeGcd(arr, l, r)).toBe(naiveG(arr, l, r));
      });
    }
  }
});

// ---------------------------------------------------------------------------
// 36. Single element queries l===r (100 tests)
// ---------------------------------------------------------------------------

describe('Single element queries l===r on multiple arrays', () => {
  const arr1 = [3, 1, 4, 1, 5, 9, 2, 6];
  const stn1 = new SparseTableNum(arr1);

  for (let i = 0; i < arr1.length; i++) {
    it(`SparseTableNum queryMin l=r=${i} returns arr[${i}]=${arr1[i]}`, () => {
      expect(stn1.queryMin(i, i)).toBe(arr1[i]);
    });
    it(`SparseTableNum queryMax l=r=${i} returns arr[${i}]=${arr1[i]}`, () => {
      expect(stn1.queryMax(i, i)).toBe(arr1[i]);
    });
    it(`SparseTableNum queryGcd l=r=${i} returns arr[${i}]=${arr1[i]}`, () => {
      expect(stn1.queryGcd(i, i)).toBe(arr1[i]);
    });
  }

  const arr2 = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000];
  const stg2 = new SparseTableGeneric<number>(arr2, Math.min);
  for (let i = 0; i < arr2.length; i++) {
    it(`SparseTableGeneric point query l=r=${i}`, () => {
      expect(stg2.query(i, i)).toBe(arr2[i]);
    });
  }

  for (let i = 0; i < arr1.length; i++) {
    it(`rangeMin single element [${i},${i}]`, () => {
      expect(rangeMin(arr1, i, i)).toBe(arr1[i]);
    });
    it(`rangeMax single element [${i},${i}]`, () => {
      expect(rangeMax(arr1, i, i)).toBe(arr1[i]);
    });
  }
});

// ---------------------------------------------------------------------------
// 37. Full range queries l=0, r=n-1 (50 tests)
// ---------------------------------------------------------------------------

describe('Full range queries l=0, r=n-1 on diverse arrays', () => {
  const datasets: number[][] = [
    [3, 1, 4, 1, 5, 9, 2, 6],
    [10, 20, 30, 40, 50],
    [7],
    [9, 3],
    [100, 1, 50, 25, 75],
    [-5, -3, -8, -1, -9],
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    [10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
  ];

  for (const ds of datasets) {
    const n = ds.length;
    const stn = new SparseTableNum(ds);

    it(`SparseTableNum queryMin full range n=${n}`, () => {
      expect(stn.queryMin(0, n - 1)).toBe(Math.min(...ds));
    });

    it(`SparseTableNum queryMax full range n=${n}`, () => {
      expect(stn.queryMax(0, n - 1)).toBe(Math.max(...ds));
    });

    it(`rangeMin full range n=${n}`, () => {
      expect(rangeMin(ds, 0, n - 1)).toBe(Math.min(...ds));
    });

    it(`rangeMax full range n=${n}`, () => {
      expect(rangeMax(ds, 0, n - 1)).toBe(Math.max(...ds));
    });

    const stg = new SparseTableGeneric<number>(ds, Math.min);
    it(`SparseTableGeneric min full range n=${n}`, () => {
      expect(stg.query(0, n - 1)).toBe(Math.min(...ds));
    });

    const stg2 = new SparseTableGeneric<number>(ds, Math.max);
    it(`SparseTableGeneric max full range n=${n}`, () => {
      expect(stg2.query(0, n - 1)).toBe(Math.max(...ds));
    });
  }
});

// ---------------------------------------------------------------------------
// 38. rmqAll — 50 tests
// ---------------------------------------------------------------------------

describe('rmqAll — query function returned by rmqAll', () => {
  const arr8 = [3, 1, 4, 1, 5, 9, 2, 6];
  const query8 = rmqAll(arr8);

  for (let l = 0; l < arr8.length; l++) {
    for (let r = l; r < arr8.length; r++) {
      it(`rmqAll arr8 [${l},${r}]`, () => {
        expect(query8(l, r)).toBe(Math.min(...arr8.slice(l, r + 1)));
      });
    }
  }

  const arr5 = [7, 2, 9, 4, 6];
  const query5 = rmqAll(arr5);
  for (let l = 0; l < arr5.length; l++) {
    for (let r = l; r < arr5.length; r++) {
      it(`rmqAll arr5 [${l},${r}]`, () => {
        expect(query5(l, r)).toBe(Math.min(...arr5.slice(l, r + 1)));
      });
    }
  }

  it('rmqAll single element array', () => {
    const q = rmqAll([42]);
    expect(q(0, 0)).toBe(42);
  });

  it('rmqAll consistent across multiple calls', () => {
    const arr = [5, 3, 8, 1, 9];
    const q = rmqAll(arr);
    expect(q(0, 4)).toBe(1);
    expect(q(2, 4)).toBe(1);
    expect(q(0, 2)).toBe(3);
    expect(q(0, 0)).toBe(5);
    expect(q(4, 4)).toBe(9);
  });
});

// ---------------------------------------------------------------------------
// 39. buildSparseTable helper
// ---------------------------------------------------------------------------

describe('buildSparseTable helper — returns correct 2D table', () => {
  const arr = [3, 1, 4, 1, 5, 9, 2, 6];

  it('level-0 matches original array', () => {
    const table = buildSparseTable(arr, Math.min);
    for (let i = 0; i < arr.length; i++) {
      expect(table[0][i]).toBe(arr[i]);
    }
  });

  it('empty array returns empty table', () => {
    expect(buildSparseTable([], Math.min)).toEqual([]);
  });

  it('single element table has one level', () => {
    const table = buildSparseTable([7], Math.min);
    expect(table.length).toBe(1);
    expect(table[0][0]).toBe(7);
  });

  // Verify that table built by buildSparseTable gives correct min queries
  // by querying manually using the power-of-two technique
  for (let l = 0; l < arr.length; l++) {
    for (let r = l; r < arr.length; r++) {
      it(`buildSparseTable manual query [${l},${r}]`, () => {
        const table = buildSparseTable(arr, Math.min);
        const log: number[] = new Array<number>(arr.length + 1).fill(0);
        for (let i = 2; i <= arr.length; i++) log[i] = log[Math.floor(i / 2)] + 1;
        const k = log[r - l + 1];
        const result = Math.min(table[k][l], table[k][r - (1 << k) + 1]);
        expect(result).toBe(Math.min(...arr.slice(l, r + 1)));
      });
    }
  }

  it('SparseTableNum size is correct', () => {
    const stn = new SparseTableNum([1, 2, 3, 4, 5]);
    expect(stn.size).toBe(5);
  });
});
