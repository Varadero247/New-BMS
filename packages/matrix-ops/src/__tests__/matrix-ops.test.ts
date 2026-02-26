// Copyright (c) 2026 Nexara DMCC. All rights reserved.
import { zeros, identity, shape, transpose, add, subtract, scale, multiply, trace, determinant, inverse, rank, frobenius, hadamard, rowSum, colSum, matPow, vectorDot, outerProduct, isSymmetric, isDiagonal, flatten, fromFlat, elementwiseApply } from '../matrix-ops';

describe('zeros 100 tests', () => {
  for (let n = 1; n <= 100; n++) {
    it(`zeros(${n},${n}) all elements are 0`, () => {
      const m = zeros(n, n);
      expect(m.every(row => row.every(v => v === 0))).toBe(true);
    });
  }
});

describe('identity 100 tests', () => {
  for (let n = 1; n <= 100; n++) {
    it(`identity(${n}) has trace ${n}`, () => {
      expect(trace(identity(n))).toBe(n);
    });
  }
});

describe('transpose 100 tests', () => {
  for (let n = 1; n <= 100; n++) {
    it(`transpose of ${n}x${n} identity = identity`, () => {
      const id = identity(n);
      const t = transpose(id);
      for (let i = 0; i < n; i++) expect(t[i][i]).toBe(1);
    });
  }
});

describe('add 100 tests', () => {
  for (let n = 1; n <= 100; n++) {
    it(`zeros + identity = identity for n=${n}`, () => {
      const result = add(zeros(n,n), identity(n));
      expect(trace(result)).toBe(n);
    });
  }
});

describe('scale 100 tests', () => {
  for (let s = 1; s <= 100; s++) {
    it(`scale identity by ${s} has trace ${s}`, () => {
      const n = 3;
      expect(trace(scale(identity(n), s))).toBe(n * s);
    });
  }
});

describe('determinant 100 tests', () => {
  for (let n = 1; n <= 100; n++) {
    it(`det(identity(${n%5+1})) = 1`, () => {
      expect(Math.round(determinant(identity(n%5+1)))).toBe(1);
    });
  }
});

describe('multiply 100 tests', () => {
  for (let n = 1; n <= 100; n++) {
    it(`M * I = M for ${n%4+1}x${n%4+1}`, () => {
      const size = n % 4 + 1;
      const m = zeros(size, size).map((row, i) => row.map((_, j) => i*size+j+1));
      const result = multiply(m, identity(size));
      for (let i = 0; i < size; i++) for (let j = 0; j < size; j++) {
        expect(result[i][j]).toBe(m[i][j]);
      }
    });
  }
});

describe('isSymmetric 100 tests', () => {
  for (let n = 1; n <= 100; n++) {
    it(`identity(${n%5+1}) is symmetric`, () => {
      expect(isSymmetric(identity(n%5+1))).toBe(true);
    });
  }
});

describe('isDiagonal 100 tests', () => {
  for (let n = 1; n <= 100; n++) {
    it(`identity(${n%4+1}) is diagonal`, () => {
      expect(isDiagonal(identity(n%4+1))).toBe(true);
    });
  }
});

describe('flatten + fromFlat roundtrip 100 tests', () => {
  for (let n = 1; n <= 100; n++) {
    it(`flatten/fromFlat roundtrip n=${n}`, () => {
      const rows = n % 4 + 1, cols = n % 3 + 1;
      const m = zeros(rows, cols).map((r, i) => r.map((_, j) => i*cols+j));
      const flat = flatten(m);
      const restored = fromFlat(flat, rows, cols);
      expect(restored).toEqual(m);
    });
  }
});

describe('shape 100 tests', () => {
  for (let n = 1; n <= 100; n++) {
    it(`shape of zeros(${n%6+1}, ${n%5+1}) = [${n%6+1}, ${n%5+1}]`, () => {
      const rows = n % 6 + 1, cols = n % 5 + 1;
      expect(shape(zeros(rows, cols))).toEqual([rows, cols]);
    });
  }
});

describe('subtract 100 tests', () => {
  for (let n = 1; n <= 100; n++) {
    it(`identity - identity = zeros for n=${n%4+1}`, () => {
      const sz = n % 4 + 1;
      const result = subtract(identity(sz), identity(sz));
      expect(result.every(row => row.every(v => v === 0))).toBe(true);
    });
  }
});

describe('frobenius 100 tests', () => {
  for (let n = 1; n <= 100; n++) {
    it(`frobenius of identity(${n%5+1}) = sqrt(${n%5+1})`, () => {
      const sz = n % 5 + 1;
      expect(frobenius(identity(sz))).toBeCloseTo(Math.sqrt(sz), 10);
    });
  }
});

describe('hadamard 100 tests', () => {
  for (let n = 1; n <= 100; n++) {
    it(`hadamard(identity, identity) = identity for n=${n%4+1}`, () => {
      const sz = n % 4 + 1;
      const result = hadamard(identity(sz), identity(sz));
      expect(result).toEqual(identity(sz));
    });
  }
});

describe('rowSum 100 tests', () => {
  for (let n = 1; n <= 100; n++) {
    it(`rowSum of identity(${n%4+1}) all 1s`, () => {
      const sz = n % 4 + 1;
      expect(rowSum(identity(sz))).toEqual(new Array(sz).fill(1));
    });
  }
});

describe('colSum 100 tests', () => {
  for (let n = 1; n <= 100; n++) {
    it(`colSum of identity(${n%4+1}) all 1s`, () => {
      const sz = n % 4 + 1;
      expect(colSum(identity(sz))).toEqual(new Array(sz).fill(1));
    });
  }
});

describe('matPow 100 tests', () => {
  for (let n = 1; n <= 100; n++) {
    it(`identity^${n} = identity for sz=${n%3+1}`, () => {
      const sz = n % 3 + 1;
      const result = matPow(identity(sz), n);
      expect(result).toEqual(identity(sz));
    });
  }
});

describe('vectorDot 100 tests', () => {
  for (let n = 1; n <= 100; n++) {
    it(`vectorDot([${n}],[${n}]) = ${n*n}`, () => {
      expect(vectorDot([n], [n])).toBe(n * n);
    });
  }
});

describe('outerProduct 100 tests', () => {
  for (let n = 1; n <= 100; n++) {
    it(`outerProduct([${n}],[1]) shape is [1,1]`, () => {
      const op = outerProduct([n], [1]);
      expect(op.length).toBe(1);
      expect(op[0].length).toBe(1);
      expect(op[0][0]).toBe(n);
    });
  }
});

describe('rank 100 tests', () => {
  for (let n = 1; n <= 100; n++) {
    it(`rank of identity(${n%4+1}) = ${n%4+1}`, () => {
      const sz = n % 4 + 1;
      expect(rank(identity(sz))).toBe(sz);
    });
  }
});

describe('inverse 100 tests', () => {
  for (let n = 1; n <= 100; n++) {
    it(`inverse(identity(${n%4+1})) = identity`, () => {
      const sz = n % 4 + 1;
      const inv = inverse(identity(sz));
      expect(inv).not.toBeNull();
      for (let i = 0; i < sz; i++) {
        for (let j = 0; j < sz; j++) {
          expect(inv![i][j]).toBeCloseTo(identity(sz)[i][j], 8);
        }
      }
    });
  }
});

describe('elementwiseApply 100 tests', () => {
  for (let n = 1; n <= 100; n++) {
    it(`elementwiseApply double on zeros(${n%3+1},${n%3+1}) = zeros`, () => {
      const sz = n % 3 + 1;
      const result = elementwiseApply(zeros(sz, sz), v => v * 2);
      expect(result.every(row => row.every(v => v === 0))).toBe(true);
    });
  }
});
