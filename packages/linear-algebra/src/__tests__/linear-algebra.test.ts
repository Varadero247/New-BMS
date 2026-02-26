// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import {
  Vector,
  Matrix,
  dotProduct,
  crossProduct,
  matMul,
  transpose,
  det2,
  det3,
  lerpVectors,
  gramSchmidt,
} from '../linear-algebra';

const EPS = 1e-9;

function close(a: number, b: number, eps = EPS): boolean {
  return Math.abs(a - b) <= eps;
}

// ─── Vector: constructor / get / dim ─────────────────────────────────────────
describe('Vector constructor and get', () => {
  for (let n = 1; n <= 10; n++) {
    it(`creates a ${n}D vector with correct dim`, () => {
      const v = new Vector(Array.from({ length: n }, (_, i) => i + 1));
      expect(v.dim).toBe(n);
    });
  }

  for (let n = 1; n <= 10; n++) {
    it(`Vector.get() returns correct component for dim=${n}`, () => {
      const arr = Array.from({ length: n }, (_, i) => i * 3 + 7);
      const v = new Vector(arr);
      for (let i = 0; i < n; i++) {
        expect(v.get(i)).toBe(arr[i]);
      }
    });
  }

  for (let i = 0; i < 10; i++) {
    it(`Vector.components returns a copy (mutation test ${i})`, () => {
      const arr = [1, 2, 3];
      const v = new Vector(arr);
      const comps = v.components;
      comps[0] = 999;
      expect(v.get(0)).toBe(1);
    });
  }

  it('throws on empty components', () => {
    expect(() => new Vector([])).toThrow();
  });

  it('throws on out-of-bounds get (negative)', () => {
    const v = new Vector([1, 2, 3]);
    expect(() => v.get(-1)).toThrow();
  });

  it('throws on out-of-bounds get (too large)', () => {
    const v = new Vector([1, 2, 3]);
    expect(() => v.get(3)).toThrow();
  });
});

// ─── Vector: add / subtract / scale ──────────────────────────────────────────
describe('Vector add / subtract / scale', () => {
  for (let i = 0; i < 15; i++) {
    it(`add two ${i + 2}D vectors (test ${i})`, () => {
      const a = new Vector(Array.from({ length: i + 2 }, (_, k) => k + i));
      const b = new Vector(Array.from({ length: i + 2 }, (_, k) => k * 2 + 1));
      const r = a.add(b);
      for (let k = 0; k < i + 2; k++) {
        expect(r.get(k)).toBe(a.get(k) + b.get(k));
      }
    });
  }

  for (let i = 0; i < 15; i++) {
    it(`subtract two ${i + 2}D vectors (test ${i})`, () => {
      const a = new Vector(Array.from({ length: i + 2 }, (_, k) => k * 3 + i));
      const b = new Vector(Array.from({ length: i + 2 }, (_, k) => k + 2));
      const r = a.subtract(b);
      for (let k = 0; k < i + 2; k++) {
        expect(r.get(k)).toBe(a.get(k) - b.get(k));
      }
    });
  }

  for (let s = -5; s <= 10; s++) {
    it(`scale 3D vector by ${s}`, () => {
      const v = new Vector([1, 2, 3]);
      const r = v.scale(s);
      expect(r.get(0)).toBe(s);
      expect(r.get(1)).toBe(2 * s);
      expect(r.get(2)).toBe(3 * s);
    });
  }

  it('add throws on dimension mismatch', () => {
    expect(() => new Vector([1, 2]).add(new Vector([1, 2, 3]))).toThrow();
  });

  it('subtract throws on dimension mismatch', () => {
    expect(() => new Vector([1, 2]).subtract(new Vector([1]))).toThrow();
  });

  for (let i = 0; i < 10; i++) {
    it(`scale preserves original vector (immutability test ${i})`, () => {
      const v = new Vector([i, i + 1, i + 2]);
      v.scale(100);
      expect(v.get(0)).toBe(i);
    });
  }
});

// ─── Vector: dot / cross / magnitude / normalize ─────────────────────────────
describe('Vector dot / cross / magnitude / normalize', () => {
  // dot product
  for (let i = 1; i <= 15; i++) {
    it(`dot product of standard basis vectors e${i} with itself = 1 (dim ${i})`, () => {
      const v = Vector.unit(i + 1, 0);
      expect(v.dot(v)).toBe(1);
    });
  }

  for (let i = 0; i < 10; i++) {
    it(`dot product of orthogonal vectors = 0 (test ${i})`, () => {
      const a = new Vector([1, 0, 0]);
      const b = new Vector([0, 1, 0]);
      expect(a.dot(b)).toBe(0);
    });
  }

  it('dot [1,2,3] · [4,5,6] = 32', () => {
    const a = new Vector([1, 2, 3]);
    const b = new Vector([4, 5, 6]);
    expect(a.dot(b)).toBe(32);
  });

  it('dot throws on dimension mismatch', () => {
    expect(() => new Vector([1, 2]).dot(new Vector([1]))).toThrow();
  });

  // cross product
  for (let i = 0; i < 10; i++) {
    it(`cross product: e1 × e2 = e3 (test ${i})`, () => {
      const e1 = new Vector([1, 0, 0]);
      const e2 = new Vector([0, 1, 0]);
      const r = e1.cross(e2);
      expect(r.get(0)).toBe(0);
      expect(r.get(1)).toBe(0);
      expect(r.get(2)).toBe(1);
    });
  }

  for (let i = 0; i < 10; i++) {
    it(`cross product: e2 × e1 = -e3 (test ${i})`, () => {
      const e1 = new Vector([1, 0, 0]);
      const e2 = new Vector([0, 1, 0]);
      const r = e2.cross(e1);
      expect(r.get(2)).toBe(-1);
    });
  }

  it('cross product [1,0,0] × [0,0,1] = [0,-1,0]', () => {
    const a = new Vector([1, 0, 0]);
    const b = new Vector([0, 0, 1]);
    const r = a.cross(b);
    expect(r.get(0)).toBeCloseTo(0);
    expect(r.get(1)).toBeCloseTo(-1);
    expect(r.get(2)).toBeCloseTo(0);
  });

  it('cross throws for non-3D', () => {
    expect(() => new Vector([1, 2]).cross(new Vector([3, 4]))).toThrow();
  });

  // magnitude
  for (let i = 1; i <= 10; i++) {
    it(`magnitude of unit vector e_0 in dim ${i} = 1`, () => {
      const v = Vector.unit(i, 0);
      expect(v.magnitude()).toBeCloseTo(1);
    });
  }

  for (let i = 1; i <= 10; i++) {
    it(`magnitudeSquared of [${i},0,0] = ${i * i}`, () => {
      const v = new Vector([i, 0, 0]);
      expect(v.magnitudeSquared()).toBe(i * i);
    });
  }

  it('magnitude of [3,4] = 5', () => {
    const v = new Vector([3, 4]);
    expect(v.magnitude()).toBeCloseTo(5);
  });

  it('magnitude of [1,1,1] = sqrt(3)', () => {
    const v = new Vector([1, 1, 1]);
    expect(v.magnitude()).toBeCloseTo(Math.sqrt(3));
  });

  // normalize
  for (let i = 1; i <= 10; i++) {
    it(`normalize [${i},0,0] yields unit vector`, () => {
      const v = new Vector([i, 0, 0]);
      const n = v.normalize();
      expect(n.magnitude()).toBeCloseTo(1);
    });
  }

  for (let i = 1; i <= 5; i++) {
    it(`normalize [${i},${i},${i}] yields unit vector`, () => {
      const v = new Vector([i, i, i]);
      const n = v.normalize();
      expect(n.magnitude()).toBeCloseTo(1);
    });
  }

  it('normalize throws for zero vector', () => {
    expect(() => new Vector([0, 0, 0]).normalize()).toThrow();
  });
});

// ─── Vector: angleTo / projectOnto / isOrthogonal / isParallel ───────────────
describe('Vector angleTo / projectOnto / isOrthogonal / isParallel', () => {
  // angleTo
  for (let i = 0; i < 10; i++) {
    it(`angle between same vector = 0 (test ${i})`, () => {
      const v = new Vector([i + 1, i + 2, i + 3]);
      expect(v.angleTo(v)).toBeCloseTo(0);
    });
  }

  for (let i = 0; i < 10; i++) {
    it(`angle between e1 and e2 = pi/2 (test ${i})`, () => {
      const e1 = new Vector([1, 0, 0]);
      const e2 = new Vector([0, 1, 0]);
      expect(e1.angleTo(e2)).toBeCloseTo(Math.PI / 2);
    });
  }

  it('angle between [1,0] and [-1,0] = pi', () => {
    const a = new Vector([1, 0]);
    const b = new Vector([-1, 0]);
    expect(a.angleTo(b)).toBeCloseTo(Math.PI);
  });

  it('angleTo throws on dimension mismatch', () => {
    expect(() => new Vector([1, 2]).angleTo(new Vector([1]))).toThrow();
  });

  it('angleTo throws on zero vector', () => {
    expect(() => new Vector([0, 0]).angleTo(new Vector([1, 0]))).toThrow();
  });

  // projectOnto
  for (let i = 1; i <= 10; i++) {
    it(`project [${i},${i}] onto [1,0] = [${i},0]`, () => {
      const v = new Vector([i, i]);
      const onto = new Vector([1, 0]);
      const proj = v.projectOnto(onto);
      expect(proj.get(0)).toBeCloseTo(i);
      expect(proj.get(1)).toBeCloseTo(0);
    });
  }

  for (let i = 1; i <= 10; i++) {
    it(`project e1 onto e1 in dim ${i + 1} = e1`, () => {
      const v = Vector.unit(i + 1, 0);
      const proj = v.projectOnto(v);
      expect(proj.get(0)).toBeCloseTo(1);
    });
  }

  it('projectOnto throws on zero vector', () => {
    expect(() => new Vector([1, 0]).projectOnto(new Vector([0, 0]))).toThrow();
  });

  // isOrthogonal
  for (let i = 0; i < 10; i++) {
    it(`e1 and e2 are orthogonal (test ${i})`, () => {
      expect(new Vector([1, 0, 0]).isOrthogonal(new Vector([0, 1, 0]))).toBe(true);
    });
  }

  for (let i = 1; i <= 5; i++) {
    it(`[1,1] and [1,-1] are orthogonal (test ${i})`, () => {
      expect(new Vector([1, 1]).isOrthogonal(new Vector([1, -1]))).toBe(true);
    });
  }

  for (let i = 1; i <= 5; i++) {
    it(`[1,2] and [3,4] are NOT orthogonal (test ${i})`, () => {
      expect(new Vector([1, 2]).isOrthogonal(new Vector([3, 4]))).toBe(false);
    });
  }

  // isParallel
  for (let i = 1; i <= 10; i++) {
    it(`[1,0] and [${i},0] are parallel`, () => {
      expect(new Vector([1, 0]).isParallel(new Vector([i, 0]))).toBe(true);
    });
  }

  for (let i = 1; i <= 5; i++) {
    it(`[1,1] and [-${i},-${i}] are parallel`, () => {
      expect(new Vector([1, 1]).isParallel(new Vector([-i, -i]))).toBe(true);
    });
  }

  for (let i = 1; i <= 5; i++) {
    it(`[1,0] and [0,${i}] are NOT parallel`, () => {
      expect(new Vector([1, 0]).isParallel(new Vector([0, i]))).toBe(false);
    });
  }
});

// ─── Vector: equals / negate / zero / unit / toString ────────────────────────
describe('Vector equals / negate / zero / unit / toArray / toString', () => {
  for (let i = 1; i <= 10; i++) {
    it(`equals same vector (dim ${i})`, () => {
      const arr = Array.from({ length: i }, (_, k) => k * 2.5);
      const v = new Vector(arr);
      expect(v.equals(new Vector(arr))).toBe(true);
    });
  }

  for (let i = 1; i <= 10; i++) {
    it(`equals different vector returns false (dim ${i})`, () => {
      const a = new Vector(Array.from({ length: i + 1 }, (_, k) => k));
      const b = new Vector(Array.from({ length: i + 1 }, (_, k) => k + 1));
      expect(a.equals(b)).toBe(false);
    });
  }

  it('equals returns false for different dimensions', () => {
    expect(new Vector([1, 2]).equals(new Vector([1, 2, 3]))).toBe(false);
  });

  for (let i = 1; i <= 10; i++) {
    it(`negate vector (test ${i})`, () => {
      const v = new Vector([i, -i, 2 * i]);
      const n = v.negate();
      expect(n.get(0)).toBe(-i);
      expect(n.get(1)).toBe(i);
      expect(n.get(2)).toBe(-2 * i);
    });
  }

  for (let d = 1; d <= 10; d++) {
    it(`Vector.zero(${d}) has all zero components`, () => {
      const v = Vector.zero(d);
      expect(v.dim).toBe(d);
      for (let i = 0; i < d; i++) expect(v.get(i)).toBe(0);
    });
  }

  it('Vector.zero throws on zero dim', () => {
    expect(() => Vector.zero(0)).toThrow();
  });

  for (let d = 1; d <= 5; d++) {
    for (let i = 0; i < d; i++) {
      it(`Vector.unit(${d}, ${i}) has 1 at index ${i}, 0 elsewhere`, () => {
        const u = Vector.unit(d, i);
        expect(u.dim).toBe(d);
        for (let k = 0; k < d; k++) expect(u.get(k)).toBe(k === i ? 1 : 0);
      });
    }
  }

  it('Vector.unit throws on out-of-bounds index', () => {
    expect(() => Vector.unit(3, 3)).toThrow();
  });

  it('Vector.unit throws on invalid dim', () => {
    expect(() => Vector.unit(0, 0)).toThrow();
  });

  for (let i = 1; i <= 5; i++) {
    it(`toArray returns a copy (mutation safe, test ${i})`, () => {
      const v = new Vector([i, i + 1, i + 2]);
      const arr = v.toArray();
      arr[0] = 999;
      expect(v.get(0)).toBe(i);
    });
  }

  for (let i = 1; i <= 5; i++) {
    it(`toString contains 'Vector' (test ${i})`, () => {
      const v = new Vector([i, i]);
      expect(v.toString()).toContain('Vector');
    });
  }
});

// ─── Matrix: zeros / identity / diagonal / fromVector / random ───────────────
describe('Matrix zeros / identity / diagonal / fromVector / random', () => {
  for (let m = 1; m <= 5; m++) {
    for (let n = 1; n <= 5; n++) {
      it(`Matrix.zeros(${m}, ${n}) all zero`, () => {
        const mat = Matrix.zeros(m, n);
        expect(mat.rows).toBe(m);
        expect(mat.cols).toBe(n);
        for (let i = 0; i < m; i++) {
          for (let j = 0; j < n; j++) {
            expect(mat.get(i, j)).toBe(0);
          }
        }
      });
    }
  }

  for (let n = 1; n <= 5; n++) {
    it(`Matrix.identity(${n}) has 1 on diagonal, 0 elsewhere`, () => {
      const mat = Matrix.identity(n);
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          expect(mat.get(i, j)).toBe(i === j ? 1 : 0);
        }
      }
    });
  }

  for (let n = 1; n <= 5; n++) {
    it(`Matrix.diagonal([1..${n}]) has correct diagonal`, () => {
      const vals = Array.from({ length: n }, (_, i) => i + 1);
      const mat = Matrix.diagonal(vals);
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          expect(mat.get(i, j)).toBe(i === j ? vals[i] : 0);
        }
      }
    });
  }

  it('Matrix.fromVector default = column vector', () => {
    const v = new Vector([1, 2, 3]);
    const mat = Matrix.fromVector(v);
    expect(mat.rows).toBe(3);
    expect(mat.cols).toBe(1);
    expect(mat.get(0, 0)).toBe(1);
    expect(mat.get(1, 0)).toBe(2);
    expect(mat.get(2, 0)).toBe(3);
  });

  it('Matrix.fromVector row vector', () => {
    const v = new Vector([1, 2, 3]);
    const mat = Matrix.fromVector(v, false);
    expect(mat.rows).toBe(1);
    expect(mat.cols).toBe(3);
  });

  for (let i = 0; i < 5; i++) {
    it(`Matrix.random(${i + 2}, ${i + 2}) uses provided rng`, () => {
      let calls = 0;
      const rng = () => { calls++; return 0.5; };
      const mat = Matrix.random(i + 2, i + 2, rng);
      expect(calls).toBe((i + 2) * (i + 2));
      expect(mat.get(0, 0)).toBe(0.5);
    });
  }

  it('Matrix.zeros throws on non-positive dims', () => {
    expect(() => Matrix.zeros(0, 3)).toThrow();
    expect(() => Matrix.zeros(3, 0)).toThrow();
  });

  it('Matrix.identity throws on non-positive dim', () => {
    expect(() => Matrix.identity(0)).toThrow();
  });

  it('Matrix constructor throws on empty rows', () => {
    expect(() => new Matrix([])).toThrow();
  });

  it('Matrix constructor throws on jagged rows', () => {
    expect(() => new Matrix([[1, 2], [3]])).toThrow();
  });
});

// ─── Matrix: get / set / getRow / getCol / getRowVector / getColVector ────────
describe('Matrix get / set / getRow / getCol / getRowVector / getColVector', () => {
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      it(`Matrix.get(${i},${j}) on 3x3`, () => {
        const mat = new Matrix([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);
        expect(mat.get(i, j)).toBe(i * 3 + j + 1);
      });
    }
  }

  for (let i = 0; i < 3; i++) {
    it(`Matrix.getRow(${i}) on 3x3`, () => {
      const mat = new Matrix([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);
      const row = mat.getRow(i);
      expect(row).toEqual([i * 3 + 1, i * 3 + 2, i * 3 + 3]);
    });
  }

  for (let j = 0; j < 3; j++) {
    it(`Matrix.getCol(${j}) on 3x3`, () => {
      const mat = new Matrix([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);
      const col = mat.getCol(j);
      expect(col).toEqual([j + 1, j + 4, j + 7]);
    });
  }

  for (let i = 0; i < 3; i++) {
    it(`Matrix.getRowVector(${i}) returns correct Vector`, () => {
      const mat = new Matrix([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);
      const rv = mat.getRowVector(i);
      expect(rv.dim).toBe(3);
      expect(rv.get(0)).toBe(i * 3 + 1);
    });
  }

  for (let j = 0; j < 3; j++) {
    it(`Matrix.getColVector(${j}) returns correct Vector`, () => {
      const mat = new Matrix([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);
      const cv = mat.getColVector(j);
      expect(cv.dim).toBe(3);
      expect(cv.get(0)).toBe(j + 1);
    });
  }

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      it(`Matrix.set(${i},${j}, 99) is immutable`, () => {
        const mat = new Matrix([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);
        const mat2 = mat.set(i, j, 99);
        expect(mat2.get(i, j)).toBe(99);
        expect(mat.get(i, j)).toBe(i * 3 + j + 1); // original unchanged
      });
    }
  }

  it('Matrix.get throws on invalid row', () => {
    const mat = new Matrix([[1, 2], [3, 4]]);
    expect(() => mat.get(-1, 0)).toThrow();
    expect(() => mat.get(2, 0)).toThrow();
  });

  it('Matrix.get throws on invalid col', () => {
    const mat = new Matrix([[1, 2], [3, 4]]);
    expect(() => mat.get(0, -1)).toThrow();
    expect(() => mat.get(0, 2)).toThrow();
  });
});

// ─── Matrix: add / subtract / multiply / scale ───────────────────────────────
describe('Matrix add / subtract / multiply / scale', () => {
  for (let n = 1; n <= 5; n++) {
    it(`Matrix add nxn identity matrices (n=${n})`, () => {
      const a = Matrix.identity(n);
      const b = Matrix.identity(n);
      const r = a.add(b);
      for (let i = 0; i < n; i++) {
        expect(r.get(i, i)).toBe(2);
      }
    });
  }

  for (let n = 1; n <= 5; n++) {
    it(`Matrix subtract A - A = zero matrix (n=${n})`, () => {
      const a = Matrix.identity(n);
      const r = a.subtract(a);
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          expect(r.get(i, j)).toBe(0);
        }
      }
    });
  }

  it('add throws on dimension mismatch', () => {
    expect(() => Matrix.zeros(2, 3).add(Matrix.zeros(2, 4))).toThrow();
  });

  it('subtract throws on dimension mismatch', () => {
    expect(() => Matrix.zeros(2, 3).subtract(Matrix.zeros(3, 3))).toThrow();
  });

  // multiply
  for (let n = 1; n <= 5; n++) {
    it(`A * I = A for n=${n}`, () => {
      const data = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (__, j) => i * n + j));
      const A = new Matrix(data);
      const r = A.multiply(Matrix.identity(n));
      expect(r.equals(A)).toBe(true);
    });
  }

  for (let n = 1; n <= 5; n++) {
    it(`I * A = A for n=${n}`, () => {
      const data = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (__, j) => i + j + 1));
      const A = new Matrix(data);
      const r = Matrix.identity(n).multiply(A);
      expect(r.equals(A)).toBe(true);
    });
  }

  it('multiply [1,2,3] * col([1,1,1]) = 6', () => {
    const A = new Matrix([[1, 2, 3]]);
    const B = new Matrix([[1], [1], [1]]);
    const r = A.multiply(B);
    expect(r.get(0, 0)).toBe(6);
  });

  it('multiply 2x2 * 2x2', () => {
    const A = new Matrix([[1, 2], [3, 4]]);
    const B = new Matrix([[5, 6], [7, 8]]);
    const r = A.multiply(B);
    expect(r.get(0, 0)).toBe(19);
    expect(r.get(0, 1)).toBe(22);
    expect(r.get(1, 0)).toBe(43);
    expect(r.get(1, 1)).toBe(50);
  });

  it('multiply throws on incompatible dimensions', () => {
    expect(() => Matrix.zeros(2, 3).multiply(Matrix.zeros(4, 2))).toThrow();
  });

  // multiplyVector
  for (let n = 1; n <= 5; n++) {
    it(`I * e_0 = e_0 for n=${n}`, () => {
      const I = Matrix.identity(n);
      const v = Vector.unit(n, 0);
      const r = I.multiplyVector(v);
      expect(r.equals(v)).toBe(true);
    });
  }

  it('multiplyVector [[1,2],[3,4]] * [1,1] = [3,7]', () => {
    const A = new Matrix([[1, 2], [3, 4]]);
    const v = new Vector([1, 1]);
    const r = A.multiplyVector(v);
    expect(r.get(0)).toBe(3);
    expect(r.get(1)).toBe(7);
  });

  it('multiplyVector throws on dimension mismatch', () => {
    expect(() => Matrix.zeros(2, 3).multiplyVector(new Vector([1, 2]))).toThrow();
  });

  // scale
  for (let s = -3; s <= 5; s++) {
    it(`Matrix.scale(${s}) on 2x2 identity`, () => {
      const A = Matrix.identity(2);
      const r = A.scale(s);
      expect(r.get(0, 0)).toBe(s);
      expect(r.get(1, 1)).toBe(s);
      expect(r.get(0, 1)).toBeCloseTo(0);
    });
  }
});

// ─── Matrix: transpose ───────────────────────────────────────────────────────
describe('Matrix transpose', () => {
  for (let n = 1; n <= 5; n++) {
    it(`transpose of ${n}x${n} identity = identity`, () => {
      const I = Matrix.identity(n);
      expect(I.transpose().equals(I)).toBe(true);
    });
  }

  for (let m = 1; m <= 5; m++) {
    for (let n = 1; n <= 5; n++) {
      it(`transpose of ${m}x${n} = ${n}x${m}`, () => {
        const mat = Matrix.zeros(m, n);
        const T = mat.transpose();
        expect(T.rows).toBe(n);
        expect(T.cols).toBe(m);
      });
    }
  }

  it('transpose of [[1,2,3],[4,5,6]] is [[1,4],[2,5],[3,6]]', () => {
    const A = new Matrix([[1, 2, 3], [4, 5, 6]]);
    const T = A.transpose();
    expect(T.rows).toBe(3);
    expect(T.cols).toBe(2);
    expect(T.get(0, 0)).toBe(1);
    expect(T.get(0, 1)).toBe(4);
    expect(T.get(1, 0)).toBe(2);
    expect(T.get(1, 1)).toBe(5);
    expect(T.get(2, 0)).toBe(3);
    expect(T.get(2, 1)).toBe(6);
  });

  for (let n = 1; n <= 5; n++) {
    it(`(A^T)^T = A for ${n}x${n}`, () => {
      const data = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (__, j) => i * n + j + 1));
      const A = new Matrix(data);
      expect(A.transpose().transpose().equals(A)).toBe(true);
    });
  }

  for (let n = 1; n <= 5; n++) {
    it(`symmetric matrix equals its transpose (n=${n})`, () => {
      const sym = Matrix.identity(n);
      expect(sym.equals(sym.transpose())).toBe(true);
    });
  }
});

// ─── Matrix: isSquare / isSymmetric / trace ───────────────────────────────────
describe('Matrix isSquare / isSymmetric / trace', () => {
  for (let n = 1; n <= 10; n++) {
    it(`${n}x${n} identity is square`, () => {
      expect(Matrix.identity(n).isSquare()).toBe(true);
    });
  }

  for (let m = 1; m <= 5; m++) {
    for (let n = 1; n <= 5; n++) {
      it(`${m}x${n} zeros: isSquare = ${m === n}`, () => {
        expect(Matrix.zeros(m, n).isSquare()).toBe(m === n);
      });
    }
  }

  for (let n = 1; n <= 5; n++) {
    it(`${n}x${n} identity is symmetric`, () => {
      expect(Matrix.identity(n).isSymmetric()).toBe(true);
    });
  }

  it('[[1,2],[2,1]] is symmetric', () => {
    expect(new Matrix([[1, 2], [2, 1]]).isSymmetric()).toBe(true);
  });

  it('[[1,2],[3,1]] is NOT symmetric', () => {
    expect(new Matrix([[1, 2], [3, 1]]).isSymmetric()).toBe(false);
  });

  it('non-square matrix is not symmetric', () => {
    expect(Matrix.zeros(2, 3).isSymmetric()).toBe(false);
  });

  for (let n = 1; n <= 10; n++) {
    it(`trace of ${n}x${n} identity = ${n}`, () => {
      expect(Matrix.identity(n).trace()).toBe(n);
    });
  }

  for (let n = 1; n <= 5; n++) {
    it(`trace of diagonal([1..${n}]) = ${n * (n + 1) / 2}`, () => {
      const vals = Array.from({ length: n }, (_, i) => i + 1);
      expect(Matrix.diagonal(vals).trace()).toBe(n * (n + 1) / 2);
    });
  }

  it('trace throws on non-square matrix', () => {
    expect(() => Matrix.zeros(2, 3).trace()).toThrow();
  });
});

// ─── Matrix: determinant ──────────────────────────────────────────────────────
describe('Matrix determinant', () => {
  // 1x1
  for (let v = -5; v <= 5; v++) {
    it(`det([[${v}]]) = ${v}`, () => {
      expect(new Matrix([[v]]).determinant()).toBeCloseTo(v);
    });
  }

  // 2x2
  const det2Cases: [number[][], number][] = [
    [[[ 1, 0], [0,  1]], 1],
    [[[ 2, 0], [0,  3]], 6],
    [[[ 1, 2], [3,  4]], -2],
    [[[ 0, 0], [0,  0]], 0],
    [[[ 5, 3], [2,  4]], 14],
    [[[-1, 2], [3, -4]], -2],
    [[[ 1, 1], [1,  1]], 0],
    [[[ 2, 3], [4,  5]], -2],
    [[[ 6, 1], [3,  2]], 9],
    [[[ 7, 2], [3,  5]], 29],
  ];

  for (const [data, expected] of det2Cases) {
    it(`det 2x2 [[${data[0]}],[${data[1]}]] = ${expected}`, () => {
      expect(new Matrix(data).determinant()).toBeCloseTo(expected);
    });
  }

  // 3x3
  const det3Cases: [number[][], number][] = [
    [[[1, 0, 0], [0, 1, 0], [0, 0, 1]], 1],
    [[[2, 0, 0], [0, 3, 0], [0, 0, 4]], 24],
    [[[1, 2, 3], [4, 5, 6], [7, 8, 9]], 0],
    [[[1, 2, 0], [0, 1, 0], [0, 0, 1]], 1],
    [[[2, 1, 3], [0, 4, 1], [5, 0, 2]], -39],
    [[[1, 3, 5], [2, 4, 6], [0, 0, 1]], -2],
    [[[3, 0, 0], [0, 3, 0], [0, 0, 3]], 27],
    [[[0, 1, 2], [1, 0, 3], [4, -3, 8]], -2],
    [[[1, 0, 1], [0, 1, 0], [1, 0, 0]], -1],
    [[[5, 1, 0], [0, 5, 0], [0, 0, 5]], 125],
  ];

  for (const [data, expected] of det3Cases) {
    it(`det 3x3 = ${expected}`, () => {
      expect(new Matrix(data).determinant()).toBeCloseTo(expected, 6);
    });
  }

  // identity determinant = 1 for n=1..5
  for (let n = 1; n <= 5; n++) {
    it(`det(I_${n}) = 1`, () => {
      expect(Matrix.identity(n).determinant()).toBeCloseTo(1);
    });
  }

  // diagonal determinant = product of diagonal
  for (let n = 1; n <= 5; n++) {
    it(`det diagonal([1..${n}]) = ${Array.from({ length: n }, (_, i) => i + 1).reduce((a, b) => a * b, 1)}`, () => {
      const vals = Array.from({ length: n }, (_, i) => i + 1);
      const expected = vals.reduce((a, b) => a * b, 1);
      expect(Matrix.diagonal(vals).determinant()).toBeCloseTo(expected);
    });
  }

  it('determinant throws on non-square matrix', () => {
    expect(() => Matrix.zeros(2, 3).determinant()).toThrow();
  });

  // singular matrix det = 0
  for (let n = 2; n <= 5; n++) {
    it(`singular matrix (zero row) has det = 0 (n=${n})`, () => {
      const data = Array.from({ length: n }, (_, i) =>
        i === 0 ? new Array(n).fill(0) : Array.from({ length: n }, (__, j) => i * n + j + 1)
      );
      expect(new Matrix(data).determinant()).toBeCloseTo(0);
    });
  }
});

// ─── Matrix: inverse ──────────────────────────────────────────────────────────
describe('Matrix inverse', () => {
  // 1x1 inverse
  for (let v = 1; v <= 10; v++) {
    it(`inverse of [[${v}]] = [[${1 / v}]]`, () => {
      const inv = new Matrix([[v]]).inverse();
      expect(inv).not.toBeNull();
      expect(inv!.get(0, 0)).toBeCloseTo(1 / v);
    });
  }

  // 2x2 inverse
  const inv2Cases: [number[][], number[][]][] = [
    [[[1, 0], [0, 1]], [[1, 0], [0, 1]]],
    [[[2, 0], [0, 2]], [[0.5, 0], [0, 0.5]]],
    [[[1, 2], [3, 4]], [[-2, 1], [1.5, -0.5]]],
    [[[2, 1], [5, 3]], [[3, -1], [-5, 2]]],
    [[[1, 0], [0, 2]], [[1, 0], [0, 0.5]]],
  ];

  for (const [data, expected] of inv2Cases) {
    it(`inverse of 2x2 [[${data[0]}],[${data[1]}]]`, () => {
      const inv = new Matrix(data).inverse();
      expect(inv).not.toBeNull();
      for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 2; j++) {
          expect(inv!.get(i, j)).toBeCloseTo(expected[i][j], 6);
        }
      }
    });
  }

  // A * inv(A) = I
  for (let n = 2; n <= 4; n++) {
    it(`A * inv(A) = I for n=${n}`, () => {
      const A = Matrix.diagonal(Array.from({ length: n }, (_, i) => i + 1));
      const inv = A.inverse();
      expect(inv).not.toBeNull();
      const product = A.multiply(inv!);
      const I = Matrix.identity(n);
      expect(product.equals(I, 1e-8)).toBe(true);
    });
  }

  // 3x3 inverse
  it('inverse of 3x3 identity = identity', () => {
    const I = Matrix.identity(3);
    expect(I.inverse()!.equals(I)).toBe(true);
  });

  it('inverse of [[2,1,0],[0,3,0],[0,0,1]]', () => {
    const A = new Matrix([[2, 1, 0], [0, 3, 0], [0, 0, 1]]);
    const inv = A.inverse();
    expect(inv).not.toBeNull();
    const prod = A.multiply(inv!);
    expect(prod.equals(Matrix.identity(3), 1e-8)).toBe(true);
  });

  // Singular matrix returns null
  for (let n = 2; n <= 4; n++) {
    it(`singular matrix (zeros row) returns null (n=${n})`, () => {
      const data = Array.from({ length: n }, (_, i) =>
        Array.from({ length: n }, (__, j) => (i === 0 ? 0 : i * n + j + 1))
      );
      expect(new Matrix(data).inverse()).toBeNull();
    });
  }

  it('inverse throws on non-square', () => {
    expect(() => Matrix.zeros(2, 3).inverse()).toThrow();
  });

  for (let n = 1; n <= 5; n++) {
    it(`inv(I_${n}) = I_${n}`, () => {
      const I = Matrix.identity(n);
      const inv = I.inverse();
      expect(inv).not.toBeNull();
      expect(inv!.equals(I, 1e-8)).toBe(true);
    });
  }
});

// ─── Matrix: solve ────────────────────────────────────────────────────────────
describe('Matrix solve Ax=b', () => {
  // 1x1 solve
  for (let v = 1; v <= 10; v++) {
    it(`[[${v}]] * x = [1] → x = [${1 / v}]`, () => {
      const A = new Matrix([[v]]);
      const b = new Vector([1]);
      const x = A.solve(b);
      expect(x).not.toBeNull();
      expect(x!.get(0)).toBeCloseTo(1 / v);
    });
  }

  // 2x2 solve
  const solve2Cases: [number[][], number[], number[]][] = [
    [[[1, 0], [0, 1]], [3, 5], [3, 5]],
    [[[2, 0], [0, 3]], [6, 9], [3, 3]],
    [[[1, 1], [1, -1]], [4, 2], [3, 1]],
    [[[3, 1], [1, 2]], [9, 8], [2, 3]],
    [[[2, 3], [1, 4]], [13, 9], [5, 1]],
  ];

  for (const [data, bArr, expected] of solve2Cases) {
    it(`solve 2x2 Ax=b, b=[${bArr}], expected x=[${expected}]`, () => {
      const A = new Matrix(data);
      const b = new Vector(bArr);
      const x = A.solve(b);
      expect(x).not.toBeNull();
      for (let i = 0; i < expected.length; i++) {
        expect(x!.get(i)).toBeCloseTo(expected[i], 6);
      }
    });
  }

  // 3x3 solve
  const solve3Cases: [number[][], number[], number[]][] = [
    [[[1, 0, 0], [0, 1, 0], [0, 0, 1]], [1, 2, 3], [1, 2, 3]],
    [[[2, 0, 0], [0, 3, 0], [0, 0, 4]], [4, 9, 16], [2, 3, 4]],
    [[[1, 1, 0], [1, -1, 0], [0, 0, 2]], [3, 1, 6], [2, 1, 3]],
    [[[2, 1, -1], [-3, -1, 2], [-2, 1, 2]], [8, -11, -3], [2, 3, -1]],
    [[[1, 2, 3], [0, 1, 2], [0, 0, 1]], [6, 3, 1], [1, 1, 1]],
  ];

  for (const [data, bArr, expected] of solve3Cases) {
    it(`solve 3x3 Ax=b, expected x=[${expected}]`, () => {
      const A = new Matrix(data);
      const b = new Vector(bArr);
      const x = A.solve(b);
      expect(x).not.toBeNull();
      for (let i = 0; i < expected.length; i++) {
        expect(x!.get(i)).toBeCloseTo(expected[i], 5);
      }
    });
  }

  // Verify A*x = b
  for (let n = 2; n <= 4; n++) {
    it(`verify Ax=b for diagonal system n=${n}`, () => {
      const A = Matrix.diagonal(Array.from({ length: n }, (_, i) => i + 1));
      const bArr = Array.from({ length: n }, (_, i) => (i + 1) * (i + 1));
      const b = new Vector(bArr);
      const x = A.solve(b);
      expect(x).not.toBeNull();
      const Ax = A.multiplyVector(x!);
      for (let i = 0; i < n; i++) {
        expect(Ax.get(i)).toBeCloseTo(b.get(i));
      }
    });
  }

  // Singular system
  for (let n = 2; n <= 4; n++) {
    it(`singular system returns null (n=${n})`, () => {
      const data = Array.from({ length: n }, () => new Array(n).fill(1));
      const b = new Vector(new Array(n).fill(2));
      expect(new Matrix(data).solve(b)).toBeNull();
    });
  }

  it('solve returns null for non-square matrix', () => {
    expect(Matrix.zeros(2, 3).solve(new Vector([1, 2]))).toBeNull();
  });

  it('solve throws on dimension mismatch between A and b', () => {
    expect(() => Matrix.identity(3).solve(new Vector([1, 2]))).toThrow();
  });
});

// ─── Matrix: rank ─────────────────────────────────────────────────────────────
describe('Matrix rank', () => {
  for (let n = 1; n <= 5; n++) {
    it(`rank of I_${n} = ${n}`, () => {
      expect(Matrix.identity(n).rank()).toBe(n);
    });
  }

  for (let n = 1; n <= 5; n++) {
    it(`rank of zeros(${n},${n}) = 0`, () => {
      expect(Matrix.zeros(n, n).rank()).toBe(0);
    });
  }

  it('rank of [[1,2,3],[4,5,6],[7,8,9]] = 2', () => {
    expect(new Matrix([[1, 2, 3], [4, 5, 6], [7, 8, 9]]).rank()).toBe(2);
  });

  it('rank of [[1,0],[0,0]] = 1', () => {
    expect(new Matrix([[1, 0], [0, 0]]).rank()).toBe(1);
  });

  it('rank of [[1,2],[3,4]] = 2', () => {
    expect(new Matrix([[1, 2], [3, 4]]).rank()).toBe(2);
  });

  for (let n = 2; n <= 5; n++) {
    it(`rank of diagonal([1..${n}]) = ${n}`, () => {
      const vals = Array.from({ length: n }, (_, i) => i + 1);
      expect(Matrix.diagonal(vals).rank()).toBe(n);
    });
  }

  it('rank of 1x3 non-zero row = 1', () => {
    expect(new Matrix([[1, 2, 3]]).rank()).toBe(1);
  });

  it('rank of 3x1 non-zero column = 1', () => {
    expect(new Matrix([[1], [2], [3]]).rank()).toBe(1);
  });

  it('rank of 2x3 full row rank = 2', () => {
    expect(new Matrix([[1, 0, 2], [0, 1, 3]]).rank()).toBe(2);
  });

  it('rank of zero 1x1 = 0', () => {
    expect(new Matrix([[0]]).rank()).toBe(0);
  });

  it('rank of non-zero 1x1 = 1', () => {
    expect(new Matrix([[5]]).rank()).toBe(1);
  });
});

// ─── Matrix: luDecomposition ──────────────────────────────────────────────────
describe('Matrix luDecomposition', () => {
  for (let n = 1; n <= 4; n++) {
    it(`LU of I_${n}: PA = LU`, () => {
      const A = Matrix.identity(n);
      const { L, U, P } = A.luDecomposition();
      // PA = LU
      const PA = P.multiply(A);
      const LU = L.multiply(U);
      expect(PA.equals(LU, 1e-8)).toBe(true);
    });
  }

  it('LU of [[2,1],[4,3]]: PA = LU', () => {
    const A = new Matrix([[2, 1], [4, 3]]);
    const { L, U, P } = A.luDecomposition();
    const PA = P.multiply(A);
    const LU = L.multiply(U);
    expect(PA.equals(LU, 1e-8)).toBe(true);
  });

  it('LU of 3x3 non-singular: PA = LU', () => {
    const A = new Matrix([[1, 2, 3], [4, 5, 6], [7, 0, 9]]);
    const { L, U, P } = A.luDecomposition();
    const PA = P.multiply(A);
    const LU = L.multiply(U);
    expect(PA.equals(LU, 1e-8)).toBe(true);
  });

  it('L is lower triangular with 1s on diagonal', () => {
    const A = new Matrix([[4, 3], [6, 3]]);
    const { L } = A.luDecomposition();
    expect(L.get(0, 0)).toBeCloseTo(1);
    expect(L.get(1, 1)).toBeCloseTo(1);
    expect(L.get(0, 1)).toBeCloseTo(0);
  });

  it('U is upper triangular', () => {
    const A = new Matrix([[2, 1, -1], [4, 3, 0], [2, -1, 2]]);
    const { U } = A.luDecomposition();
    for (let i = 1; i < 3; i++) {
      for (let j = 0; j < i; j++) {
        expect(Math.abs(U.get(i, j))).toBeLessThan(1e-8);
      }
    }
  });

  it('LU throws on non-square matrix', () => {
    expect(() => Matrix.zeros(2, 3).luDecomposition()).toThrow();
  });

  for (let n = 2; n <= 4; n++) {
    it(`diagonal matrix LU: PA = LU (n=${n})`, () => {
      const A = Matrix.diagonal(Array.from({ length: n }, (_, i) => i + 2));
      const { L, U, P } = A.luDecomposition();
      const PA = P.multiply(A);
      const LU = L.multiply(U);
      expect(PA.equals(LU, 1e-8)).toBe(true);
    });
  }
});

// ─── Helper functions: dotProduct / crossProduct / matMul / transpose ─────────
describe('Helper: dotProduct / crossProduct / matMul / transpose', () => {
  // dotProduct
  for (let i = 0; i < 10; i++) {
    it(`dotProduct [${i},${i + 1}] · [${i + 1},${i}] = ${i * (i + 1) + (i + 1) * i}`, () => {
      const result = dotProduct([i, i + 1], [i + 1, i]);
      expect(result).toBe(2 * i * (i + 1));
    });
  }

  for (let n = 1; n <= 5; n++) {
    it(`dotProduct of zeros length ${n} = 0`, () => {
      expect(dotProduct(new Array(n).fill(0), new Array(n).fill(5))).toBe(0);
    });
  }

  it('dotProduct throws on length mismatch', () => {
    expect(() => dotProduct([1, 2], [1])).toThrow();
  });

  // crossProduct
  for (let i = 0; i < 5; i++) {
    it(`crossProduct e1 × e2 = e3 (test ${i})`, () => {
      const r = crossProduct([1, 0, 0], [0, 1, 0]);
      expect(r).toEqual([0, 0, 1]);
    });
  }

  for (let i = 0; i < 5; i++) {
    it(`crossProduct e2 × e3 = e1 (test ${i})`, () => {
      const r = crossProduct([0, 1, 0], [0, 0, 1]);
      expect(r).toEqual([1, 0, 0]);
    });
  }

  for (let i = 0; i < 5; i++) {
    it(`crossProduct [${i},${i + 1},${i + 2}] × [0,0,0] = [0,0,0]`, () => {
      const r = crossProduct([i, i + 1, i + 2], [0, 0, 0]);
      expect(r).toEqual([0, 0, 0]);
    });
  }

  it('crossProduct anticommutativity: a×b = -(b×a)', () => {
    const a: [number, number, number] = [1, 2, 3];
    const b: [number, number, number] = [4, 5, 6];
    const ab = crossProduct(a, b);
    const ba = crossProduct(b, a);
    expect(ab[0]).toBeCloseTo(-ba[0]);
    expect(ab[1]).toBeCloseTo(-ba[1]);
    expect(ab[2]).toBeCloseTo(-ba[2]);
  });

  // matMul
  for (let n = 1; n <= 5; n++) {
    it(`matMul I_${n} * I_${n} = I_${n}`, () => {
      const I = Array.from({ length: n }, (_, i) =>
        Array.from({ length: n }, (__, j) => (i === j ? 1 : 0))
      );
      const result = matMul(I, I);
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          expect(result[i][j]).toBe(i === j ? 1 : 0);
        }
      }
    });
  }

  it('matMul [[1,2],[3,4]] * [[5,6],[7,8]] = [[19,22],[43,50]]', () => {
    const r = matMul([[1, 2], [3, 4]], [[5, 6], [7, 8]]);
    expect(r[0][0]).toBe(19);
    expect(r[0][1]).toBe(22);
    expect(r[1][0]).toBe(43);
    expect(r[1][1]).toBe(50);
  });

  it('matMul throws on incompatible dims', () => {
    expect(() => matMul([[1, 2]], [[1, 2]])).toThrow();
  });

  // transpose
  for (let m = 1; m <= 4; m++) {
    for (let n = 1; n <= 4; n++) {
      it(`transpose of ${m}x${n} array = ${n}x${m}`, () => {
        const data = Array.from({ length: m }, (_, i) =>
          Array.from({ length: n }, (__, j) => i * n + j)
        );
        const T = transpose(data);
        expect(T.length).toBe(n);
        expect(T[0].length).toBe(m);
        expect(T[0][0]).toBe(data[0][0]);
        if (m > 1 && n > 1) expect(T[0][1]).toBe(data[1][0]);
      });
    }
  }

  it('transpose of empty array = []', () => {
    expect(transpose([])).toEqual([]);
  });
});

// ─── Helper functions: det2 / det3 ───────────────────────────────────────────
describe('Helper: det2 / det3', () => {
  const det2Cases: [[[number, number], [number, number]], number][] = [
    [[[1, 0], [0, 1]], 1],
    [[[2, 3], [1, 4]], 5],
    [[[0, 0], [0, 0]], 0],
    [[[5, 3], [2, 4]], 14],
    [[[1, 2], [3, 4]], -2],
    [[[-1, 2], [3, -4]], -2],
    [[[6, 1], [3, 2]], 9],
    [[[7, 2], [3, 5]], 29],
    [[[1, 1], [1, 1]], 0],
    [[[10, 0], [0, 10]], 100],
  ];

  for (const [data, expected] of det2Cases) {
    it(`det2 [[${data[0]}],[${data[1]}]] = ${expected}`, () => {
      expect(det2(data)).toBeCloseTo(expected);
    });
  }

  const det3Cases2: [number[][], number][] = [
    [[[1, 0, 0], [0, 1, 0], [0, 0, 1]], 1],
    [[[2, 0, 0], [0, 3, 0], [0, 0, 4]], 24],
    [[[1, 2, 3], [4, 5, 6], [7, 8, 9]], 0],
    [[[1, 2, 0], [0, 1, 0], [0, 0, 1]], 1],
    [[[2, 1, 3], [0, 4, 1], [5, 0, 2]], -39],
    [[[1, 3, 5], [2, 4, 6], [0, 0, 1]], -2],
    [[[3, 0, 0], [0, 3, 0], [0, 0, 3]], 27],
    [[[0, 1, 2], [1, 0, 3], [4, -3, 8]], -2],
    [[[1, 0, 1], [0, 1, 0], [1, 0, 0]], -1],
    [[[5, 1, 0], [0, 5, 0], [0, 0, 5]], 125],
    [[[0, 0, 0], [0, 0, 0], [0, 0, 0]], 0],
    [[[1, 2, 3], [1, 2, 3], [4, 5, 6]], 0],
    [[[2, 1, 3], [1, 2, 4], [3, 0, 1]], -3],
    [[[-1, 2, -3], [4, -5, 6], [-7, 8, -9]], 0],
    [[[1, 1, 1], [1, 1, 0], [1, 0, 0]], -1],
    [[[2, 3, 4], [5, 6, 7], [8, 9, 10]], 0],
    [[[1, 0, 0], [0, 2, 0], [0, 0, 0]], 0],
    [[[4, 7, 2], [3, 6, 1], [5, 8, 0]], -9],
    [[[1, 2, 4], [0, 3, 0], [0, 0, 2]], 6],
    [[[0, 1, 0], [1, 0, 0], [0, 0, 1]], -1],
  ];

  for (const [data, expected] of det3Cases2) {
    it(`det3 = ${expected}`, () => {
      expect(det3(data)).toBeCloseTo(expected, 6);
    });
  }

  // Consistency: det2 should match det3 with zeros padded? No—check det2 === Matrix.det for 2x2
  for (let i = 0; i < 5; i++) {
    it(`det2 matches Matrix.determinant for 2x2 (test ${i})`, () => {
      const a = i + 1, b = i * 2, c = i + 3, d = i * 2 + 1;
      const data: [[number, number], [number, number]] = [[a, b], [c, d]];
      expect(det2(data)).toBeCloseTo(new Matrix(data).determinant(), 8);
    });
  }

  for (let i = 0; i < 5; i++) {
    it(`det3 matches Matrix.determinant for 3x3 (test ${i})`, () => {
      const data = [[1 + i, 2, 0], [0, 3, i], [i, 0, 4]];
      expect(det3(data)).toBeCloseTo(new Matrix(data).determinant(), 6);
    });
  }
});

// ─── lerpVectors ─────────────────────────────────────────────────────────────
describe('lerpVectors', () => {
  for (let i = 0; i <= 10; i++) {
    const t = i / 10;
    it(`lerp at t=${t}: result between a and b`, () => {
      const a = new Vector([0, 0, 0]);
      const b = new Vector([10, 10, 10]);
      const r = lerpVectors(a, b, t);
      expect(r.get(0)).toBeCloseTo(10 * t);
      expect(r.get(1)).toBeCloseTo(10 * t);
      expect(r.get(2)).toBeCloseTo(10 * t);
    });
  }

  for (let i = 0; i <= 10; i++) {
    const t = i / 10;
    it(`lerp at t=${t} equals a at t=0, b at t=1 (2D)`, () => {
      const a = new Vector([1, 2]);
      const b = new Vector([3, 4]);
      const r = lerpVectors(a, b, t);
      expect(r.get(0)).toBeCloseTo(1 + 2 * t);
      expect(r.get(1)).toBeCloseTo(2 + 2 * t);
    });
  }

  it('lerp t=0 returns copy of a', () => {
    const a = new Vector([5, 6, 7]);
    const b = new Vector([10, 11, 12]);
    const r = lerpVectors(a, b, 0);
    expect(r.equals(a)).toBe(true);
  });

  it('lerp t=1 returns copy of b', () => {
    const a = new Vector([5, 6, 7]);
    const b = new Vector([10, 11, 12]);
    const r = lerpVectors(a, b, 1);
    expect(r.equals(b)).toBe(true);
  });

  it('lerp t=0.5 is midpoint', () => {
    const a = new Vector([0, 0]);
    const b = new Vector([4, 6]);
    const r = lerpVectors(a, b, 0.5);
    expect(r.get(0)).toBeCloseTo(2);
    expect(r.get(1)).toBeCloseTo(3);
  });

  it('lerp throws on dimension mismatch', () => {
    expect(() => lerpVectors(new Vector([1, 2]), new Vector([1, 2, 3]), 0.5)).toThrow();
  });

  for (let i = 1; i <= 5; i++) {
    it(`lerp preserves dimension (dim=${i + 1})`, () => {
      const a = Vector.zero(i + 1);
      const b = Vector.unit(i + 1, 0);
      const r = lerpVectors(a, b, 0.5);
      expect(r.dim).toBe(i + 1);
    });
  }
});

// ─── gramSchmidt ─────────────────────────────────────────────────────────────
describe('gramSchmidt', () => {
  it('gramSchmidt of empty array = []', () => {
    expect(gramSchmidt([])).toEqual([]);
  });

  for (let n = 1; n <= 5; n++) {
    it(`gramSchmidt of standard basis e_0..e_${n - 1} returns ${n} unit vectors`, () => {
      const basis = Array.from({ length: n }, (_, i) => Vector.unit(n, i));
      const result = gramSchmidt(basis);
      expect(result.length).toBe(n);
      for (const v of result) {
        expect(v.magnitude()).toBeCloseTo(1);
      }
    });
  }

  it('gramSchmidt result vectors are orthonormal', () => {
    const vecs = [new Vector([1, 1, 0]), new Vector([1, 0, 1]), new Vector([0, 1, 1])];
    const orth = gramSchmidt(vecs);
    expect(orth.length).toBeGreaterThan(0);
    // Check orthogonality
    for (let i = 0; i < orth.length; i++) {
      for (let j = i + 1; j < orth.length; j++) {
        expect(Math.abs(orth[i].dot(orth[j]))).toBeCloseTo(0);
      }
    }
    // Check unit magnitude
    for (const v of orth) {
      expect(v.magnitude()).toBeCloseTo(1);
    }
  });

  it('gramSchmidt removes linearly dependent vectors', () => {
    const vecs = [new Vector([1, 0]), new Vector([2, 0])]; // dependent
    const result = gramSchmidt(vecs);
    expect(result.length).toBe(1);
  });

  for (let i = 0; i < 5; i++) {
    it(`gramSchmidt of 2D non-collinear pair (test ${i})`, () => {
      const vecs = [new Vector([i + 1, 0]), new Vector([0, i + 1])];
      const orth = gramSchmidt(vecs);
      expect(orth.length).toBe(2);
      expect(Math.abs(orth[0].dot(orth[1]))).toBeCloseTo(0);
    });
  }

  for (let i = 0; i < 5; i++) {
    it(`gramSchmidt single vector yields unit vector (test ${i})`, () => {
      const v = new Vector([i + 1, i + 2]);
      const result = gramSchmidt([v]);
      expect(result.length).toBe(1);
      expect(result[0].magnitude()).toBeCloseTo(1);
    });
  }

  it('gramSchmidt of 3 linearly independent 3D vectors yields 3 orthonormal vectors', () => {
    const vecs = [new Vector([1, 0, 0]), new Vector([1, 1, 0]), new Vector([1, 1, 1])];
    const result = gramSchmidt(vecs);
    expect(result.length).toBe(3);
    for (const v of result) expect(v.magnitude()).toBeCloseTo(1);
    for (let i = 0; i < 3; i++) {
      for (let j = i + 1; j < 3; j++) {
        expect(Math.abs(result[i].dot(result[j]))).toBeCloseTo(0);
      }
    }
  });
});

// ─── Edge cases ───────────────────────────────────────────────────────────────
describe('Edge cases', () => {
  // 1D vectors
  for (let v = -5; v <= 5; v++) {
    it(`1D vector [${v}] magnitude = ${Math.abs(v)}`, () => {
      if (v !== 0) {
        expect(new Vector([v]).magnitude()).toBeCloseTo(Math.abs(v));
      } else {
        expect(new Vector([v]).magnitude()).toBe(0);
      }
    });
  }

  // Zero vector operations
  it('zero vector dot zero = 0', () => {
    expect(Vector.zero(3).dot(Vector.zero(3))).toBe(0);
  });

  it('zero vector magnitude = 0', () => {
    expect(Vector.zero(5).magnitude()).toBe(0);
  });

  it('zero vector is orthogonal to any vector', () => {
    expect(Vector.zero(3).isOrthogonal(new Vector([1, 2, 3]))).toBe(true);
  });

  it('zero vector is parallel to zero vector', () => {
    expect(Vector.zero(3).isParallel(Vector.zero(3))).toBe(true);
  });

  // Singular 1x1 matrix
  it('inverse of [[0]] = null', () => {
    expect(new Matrix([[0]]).inverse()).toBeNull();
  });

  it('det of [[0]] = 0', () => {
    expect(new Matrix([[0]]).determinant()).toBe(0);
  });

  it('solve with [[0]] = null', () => {
    expect(new Matrix([[0]]).solve(new Vector([1]))).toBeNull();
  });

  // Large vectors
  for (let d = 10; d <= 50; d += 10) {
    it(`zero vector dim=${d} can be created`, () => {
      const v = Vector.zero(d);
      expect(v.dim).toBe(d);
      expect(v.magnitude()).toBe(0);
    });
  }

  // Matrix equality immutability
  for (let i = 0; i < 5; i++) {
    it(`toArray returns a copy (Matrix, test ${i})`, () => {
      const mat = Matrix.identity(3);
      const arr = mat.toArray();
      arr[0][0] = 999;
      expect(mat.get(0, 0)).toBe(1);
    });
  }

  // toString
  for (let n = 1; n <= 3; n++) {
    it(`Matrix.toString for ${n}x${n} contains 'Matrix'`, () => {
      expect(Matrix.identity(n).toString()).toContain('Matrix');
    });
  }

  // Commutativity of addition
  for (let i = 0; i < 5; i++) {
    it(`vector addition is commutative (test ${i})`, () => {
      const a = new Vector([i, i + 1, i + 2]);
      const b = new Vector([i + 3, i + 4, i + 5]);
      expect(a.add(b).equals(b.add(a))).toBe(true);
    });
  }

  // Commutativity of dot product
  for (let i = 0; i < 5; i++) {
    it(`dot product is commutative (test ${i})`, () => {
      const a = new Vector([i, i + 1]);
      const b = new Vector([i + 2, i + 3]);
      expect(a.dot(b)).toBeCloseTo(b.dot(a));
    });
  }

  // Associativity of matrix multiply
  for (let n = 2; n <= 4; n++) {
    it(`(A*B)*C = A*(B*C) for n=${n}`, () => {
      const A = Matrix.identity(n);
      const B = Matrix.diagonal(Array.from({ length: n }, (_, i) => i + 1));
      const C = Matrix.identity(n);
      const left = A.multiply(B).multiply(C);
      const right = A.multiply(B.multiply(C));
      expect(left.equals(right, 1e-8)).toBe(true);
    });
  }
});

// ─── Extended Vector Tests ────────────────────────────────────────────────────
describe('Vector extended: negate / toArray / toString', () => {
  for (let i = 1; i <= 20; i++) {
    it(`negate of [${i}, ${-i}] returns [-${i}, ${i}]`, () => {
      const v = new Vector([i, -i]);
      const n = v.negate();
      expect(n.get(0)).toBe(-i);
      expect(n.get(1)).toBe(i);
    });
  }

  for (let d = 1; d <= 20; d++) {
    it(`toArray for dim=${d} returns array of length ${d}`, () => {
      const v = Vector.zero(d);
      expect(v.toArray().length).toBe(d);
    });
  }

  for (let i = 1; i <= 20; i++) {
    it(`toString for ${i}D vector starts with 'Vector'`, () => {
      const v = new Vector(Array.from({ length: i }, (_, k) => k));
      expect(v.toString().startsWith('Vector')).toBe(true);
    });
  }
});

describe('Vector extended: scale and add combined', () => {
  for (let i = 1; i <= 30; i++) {
    it(`v.scale(${i}).add(v) = v.scale(${i + 1})`, () => {
      const v = new Vector([1, 2, 3]);
      const left = v.scale(i).add(v);
      const right = v.scale(i + 1);
      expect(left.equals(right)).toBe(true);
    });
  }

  for (let i = 1; i <= 20; i++) {
    it(`v.subtract(v.scale(${i})) = v.scale(${1 - i})`, () => {
      const v = new Vector([2, 4, 6]);
      const left = v.subtract(v.scale(i));
      const right = v.scale(1 - i);
      expect(left.equals(right)).toBe(true);
    });
  }
});

describe('Vector extended: dot product properties', () => {
  for (let i = 1; i <= 20; i++) {
    it(`dot([${i},0],[0,${i}]) = 0 (orthogonal)`, () => {
      expect(new Vector([i, 0]).dot(new Vector([0, i]))).toBe(0);
    });
  }

  for (let i = 1; i <= 20; i++) {
    it(`dot([${i},${i}],[1,-1]) = 0`, () => {
      expect(new Vector([i, i]).dot(new Vector([1, -1]))).toBe(0);
    });
  }

  for (let i = 1; i <= 20; i++) {
    it(`dot product: |v|^2 = v.dot(v) for [${i},${2 * i}]`, () => {
      const v = new Vector([i, 2 * i]);
      expect(v.dot(v)).toBeCloseTo(v.magnitudeSquared());
    });
  }
});

describe('Vector extended: magnitude combinations', () => {
  for (let a = 1; a <= 10; a++) {
    for (let b = 1; b <= 5; b++) {
      it(`magnitude([${a},${b}]) = sqrt(${a * a + b * b})`, () => {
        const v = new Vector([a, b]);
        expect(v.magnitude()).toBeCloseTo(Math.sqrt(a * a + b * b));
      });
    }
  }
});

describe('Vector extended: normalize and scale back', () => {
  for (let i = 1; i <= 30; i++) {
    it(`normalize([${i},0,0]).scale(${i}) = [${i},0,0]`, () => {
      const v = new Vector([i, 0, 0]);
      const back = v.normalize().scale(i);
      expect(back.get(0)).toBeCloseTo(i);
      expect(back.get(1)).toBeCloseTo(0);
      expect(back.get(2)).toBeCloseTo(0);
    });
  }
});

describe('Vector extended: cross product magnitude', () => {
  for (let i = 1; i <= 20; i++) {
    it(`|e1 × [0,${i},0]| = ${i}`, () => {
      const e1 = new Vector([1, 0, 0]);
      const v = new Vector([0, i, 0]);
      const c = e1.cross(v);
      expect(c.magnitude()).toBeCloseTo(i);
    });
  }

  for (let i = 1; i <= 15; i++) {
    it(`cross product of parallel vectors is zero (test ${i})`, () => {
      const v = new Vector([i, 0, 0]);
      const w = new Vector([2 * i, 0, 0]);
      const c = v.cross(w);
      expect(c.magnitude()).toBeCloseTo(0);
    });
  }
});

describe('Vector extended: angleTo properties', () => {
  for (let i = 0; i <= 10; i++) {
    const angle = (i * Math.PI) / 10;
    it(`angle between [cos(${i}π/10), sin(${i}π/10)] and e1 = ${i}π/10`, () => {
      const v = new Vector([Math.cos(angle), Math.sin(angle)]);
      const e1 = new Vector([1, 0]);
      expect(v.angleTo(e1)).toBeCloseTo(angle);
    });
  }

  for (let i = 1; i <= 10; i++) {
    it(`angleTo is symmetric (test ${i})`, () => {
      const a = new Vector([i, 0, 0]);
      const b = new Vector([0, i, 0]);
      expect(a.angleTo(b)).toBeCloseTo(b.angleTo(a));
    });
  }
});

describe('Vector extended: projectOnto properties', () => {
  for (let i = 1; i <= 20; i++) {
    it(`project [${i},0] onto [1,0] = [${i},0]`, () => {
      const v = new Vector([i, 0]);
      const onto = new Vector([1, 0]);
      const proj = v.projectOnto(onto);
      expect(proj.get(0)).toBeCloseTo(i);
      expect(proj.get(1)).toBeCloseTo(0);
    });
  }

  for (let i = 1; i <= 20; i++) {
    it(`project [0,${i}] onto [1,0] = [0,0]`, () => {
      const v = new Vector([0, i]);
      const onto = new Vector([1, 0]);
      const proj = v.projectOnto(onto);
      expect(proj.get(0)).toBeCloseTo(0);
      expect(proj.get(1)).toBeCloseTo(0);
    });
  }
});

describe('Vector extended: equals with epsilon', () => {
  for (let i = 1; i <= 20; i++) {
    const eps = i * 1e-6;
    it(`vectors within eps=${eps} are equal`, () => {
      const v1 = new Vector([1.0, 2.0]);
      const v2 = new Vector([1.0 + eps * 0.5, 2.0 + eps * 0.5]);
      expect(v1.equals(v2, eps)).toBe(true);
    });
  }

  for (let i = 1; i <= 20; i++) {
    it(`vectors with diff 1 are NOT equal with default epsilon (test ${i})`, () => {
      const v1 = new Vector([i, 0]);
      const v2 = new Vector([i + 1, 0]);
      expect(v1.equals(v2)).toBe(false);
    });
  }
});

// ─── Extended Matrix Tests ────────────────────────────────────────────────────
describe('Matrix extended: add and subtract properties', () => {
  for (let n = 1; n <= 10; n++) {
    it(`A + zeros = A for n=${n}`, () => {
      const A = Matrix.identity(n);
      const Z = Matrix.zeros(n, n);
      expect(A.add(Z).equals(A)).toBe(true);
    });
  }

  for (let n = 1; n <= 10; n++) {
    it(`A - A = zeros for n=${n}`, () => {
      const A = Matrix.diagonal(Array.from({ length: n }, (_, i) => i + 1));
      const result = A.subtract(A);
      const Z = Matrix.zeros(n, n);
      expect(result.equals(Z)).toBe(true);
    });
  }

  for (let n = 1; n <= 10; n++) {
    it(`A + B = B + A (commutativity of add) for n=${n}`, () => {
      const A = Matrix.identity(n);
      const B = Matrix.diagonal(Array.from({ length: n }, (_, i) => (i + 1) * 2));
      expect(A.add(B).equals(B.add(A))).toBe(true);
    });
  }
});

describe('Matrix extended: multiply properties', () => {
  for (let n = 1; n <= 10; n++) {
    it(`A * zeros = zeros for n=${n}`, () => {
      const A = Matrix.identity(n);
      const Z = Matrix.zeros(n, n);
      expect(A.multiply(Z).equals(Z)).toBe(true);
    });
  }

  for (let n = 1; n <= 10; n++) {
    it(`zeros * A = zeros for n=${n}`, () => {
      const A = Matrix.identity(n);
      const Z = Matrix.zeros(n, n);
      expect(Z.multiply(A).equals(Z)).toBe(true);
    });
  }

  for (let k = 1; k <= 10; k++) {
    it(`(kI) * (kI) = k^2 * I for k=${k}`, () => {
      const n = 3;
      const kI = Matrix.identity(n).scale(k);
      const result = kI.multiply(kI);
      const expected = Matrix.identity(n).scale(k * k);
      expect(result.equals(expected, 1e-8)).toBe(true);
    });
  }
});

describe('Matrix extended: transpose and multiply', () => {
  for (let n = 1; n <= 10; n++) {
    it(`(A * B)^T = B^T * A^T for diagonal n=${n}`, () => {
      const A = Matrix.diagonal(Array.from({ length: n }, (_, i) => i + 1));
      const B = Matrix.diagonal(Array.from({ length: n }, (_, i) => i + 2));
      const left = A.multiply(B).transpose();
      const right = B.transpose().multiply(A.transpose());
      expect(left.equals(right, 1e-8)).toBe(true);
    });
  }

  for (let n = 1; n <= 10; n++) {
    it(`(A^T)^T = A for n=${n} diagonal`, () => {
      const A = Matrix.diagonal(Array.from({ length: n }, (_, i) => i * 3 + 1));
      expect(A.transpose().transpose().equals(A)).toBe(true);
    });
  }
});

describe('Matrix extended: scale properties', () => {
  for (let k = 1; k <= 20; k++) {
    it(`scale(${k}) of identity: diagonal = ${k}`, () => {
      const A = Matrix.identity(3).scale(k);
      expect(A.get(0, 0)).toBe(k);
      expect(A.get(1, 1)).toBe(k);
      expect(A.get(2, 2)).toBe(k);
    });
  }

  for (let k = 1; k <= 20; k++) {
    it(`scale(${k}) then scale(1/${k}) = identity (3x3)`, () => {
      const A = Matrix.identity(3).scale(k).scale(1 / k);
      expect(A.equals(Matrix.identity(3), 1e-8)).toBe(true);
    });
  }
});

describe('Matrix extended: isSquare and rows/cols', () => {
  for (let m = 1; m <= 10; m++) {
    for (let n = 1; n <= 5; n++) {
      it(`Matrix(${m}x${n}).rows = ${m}, cols = ${n}`, () => {
        const mat = Matrix.zeros(m, n);
        expect(mat.rows).toBe(m);
        expect(mat.cols).toBe(n);
      });
    }
  }
});

describe('Matrix extended: determinant consistency', () => {
  for (let k = 1; k <= 15; k++) {
    it(`det of [[${k},0],[0,${k}]] = ${k * k}`, () => {
      const A = new Matrix([[k, 0], [0, k]]);
      expect(A.determinant()).toBeCloseTo(k * k);
    });
  }

  for (let k = 1; k <= 15; k++) {
    it(`det of diagonal([${k},${k},${k}]) = ${k * k * k}`, () => {
      const A = Matrix.diagonal([k, k, k]);
      expect(A.determinant()).toBeCloseTo(k * k * k);
    });
  }

  for (let k = 1; k <= 10; k++) {
    it(`det(A^T) = det(A) for [[${k},1],[0,${k}]]`, () => {
      const A = new Matrix([[k, 1], [0, k]]);
      expect(A.determinant()).toBeCloseTo(A.transpose().determinant(), 6);
    });
  }
});

describe('Matrix extended: inverse verification', () => {
  for (let k = 1; k <= 15; k++) {
    it(`inverse of [[${k},0],[0,1]] has [0][0] = ${1 / k}`, () => {
      const A = new Matrix([[k, 0], [0, 1]]);
      const inv = A.inverse();
      expect(inv).not.toBeNull();
      expect(inv!.get(0, 0)).toBeCloseTo(1 / k);
    });
  }

  for (let k = 1; k <= 15; k++) {
    it(`inv([[1,0],[0,${k}]])[1][1] = ${1 / k}`, () => {
      const A = new Matrix([[1, 0], [0, k]]);
      const inv = A.inverse();
      expect(inv).not.toBeNull();
      expect(inv!.get(1, 1)).toBeCloseTo(1 / k);
    });
  }
});

describe('Matrix extended: solve verification', () => {
  for (let k = 1; k <= 20; k++) {
    it(`solve [[${k},0],[0,${k}]] * x = [${k},${2 * k}] => x = [1,2]`, () => {
      const A = new Matrix([[k, 0], [0, k]]);
      const b = new Vector([k, 2 * k]);
      const x = A.solve(b);
      expect(x).not.toBeNull();
      expect(x!.get(0)).toBeCloseTo(1);
      expect(x!.get(1)).toBeCloseTo(2);
    });
  }

  for (let k = 1; k <= 10; k++) {
    it(`solve diagonal([${k},${k + 1},${k + 2}]) * x = b, verify Ax = b`, () => {
      const A = Matrix.diagonal([k, k + 1, k + 2]);
      const bArr = [k, k + 1, k + 2];
      const x = A.solve(new Vector(bArr));
      expect(x).not.toBeNull();
      expect(x!.get(0)).toBeCloseTo(1);
      expect(x!.get(1)).toBeCloseTo(1);
      expect(x!.get(2)).toBeCloseTo(1);
    });
  }
});

// ─── Extended Helper Tests ────────────────────────────────────────────────────
describe('Helper extended: dotProduct', () => {
  for (let i = 1; i <= 20; i++) {
    it(`dotProduct([${i}],[${i}]) = ${i * i}`, () => {
      expect(dotProduct([i], [i])).toBe(i * i);
    });
  }

  for (let i = 1; i <= 20; i++) {
    it(`dotProduct([${i},0,0],[0,${i},0]) = 0`, () => {
      expect(dotProduct([i, 0, 0], [0, i, 0])).toBe(0);
    });
  }

  for (let n = 1; n <= 10; n++) {
    it(`dotProduct of ones length ${n} = ${n}`, () => {
      expect(dotProduct(new Array(n).fill(1), new Array(n).fill(1))).toBe(n);
    });
  }
});

describe('Helper extended: matMul properties', () => {
  for (let n = 1; n <= 10; n++) {
    it(`matMul([[${n}]],[[${n}]]) = [[${n * n}]]`, () => {
      expect(matMul([[n]], [[n]])[0][0]).toBe(n * n);
    });
  }

  for (let n = 1; n <= 10; n++) {
    it(`matMul I_${n} * zeros gives zeros`, () => {
      const I = Array.from({ length: n }, (_, i) =>
        Array.from({ length: n }, (__, j) => (i === j ? 1 : 0))
      );
      const Z = Array.from({ length: n }, () => new Array(n).fill(0));
      const r = matMul(I, Z);
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          expect(r[i][j]).toBe(0);
        }
      }
    });
  }
});

describe('Helper extended: transpose', () => {
  for (let n = 1; n <= 20; n++) {
    it(`transpose of 1x${n} = ${n}x1`, () => {
      const row = [Array.from({ length: n }, (_, i) => i)];
      const T = transpose(row);
      expect(T.length).toBe(n);
      expect(T[0].length).toBe(1);
    });
  }

  for (let n = 1; n <= 20; n++) {
    it(`transpose of ${n}x1 = 1x${n}`, () => {
      const col = Array.from({ length: n }, (_, i) => [i]);
      const T = transpose(col);
      expect(T.length).toBe(1);
      expect(T[0].length).toBe(n);
    });
  }
});

describe('Helper extended: det2', () => {
  for (let k = 1; k <= 20; k++) {
    it(`det2([[${k},0],[0,${k}]]) = ${k * k}`, () => {
      const data: [[number, number], [number, number]] = [[k, 0], [0, k]];
      expect(det2(data)).toBeCloseTo(k * k);
    });
  }

  for (let k = 1; k <= 20; k++) {
    it(`det2([[${k},${k}],[${k},${k}]]) = 0 (singular)`, () => {
      const data: [[number, number], [number, number]] = [[k, k], [k, k]];
      expect(det2(data)).toBeCloseTo(0);
    });
  }
});

describe('Helper extended: det3', () => {
  for (let k = 1; k <= 10; k++) {
    it(`det3(k*I_3) = ${k * k * k} for k=${k}`, () => {
      const data = [[k, 0, 0], [0, k, 0], [0, 0, k]];
      expect(det3(data)).toBeCloseTo(k * k * k);
    });
  }

  for (let k = 1; k <= 10; k++) {
    it(`det3 of matrix with two equal rows = 0 (k=${k})`, () => {
      const data = [[k, 0, 0], [k, 0, 0], [0, 0, k]];
      expect(det3(data)).toBeCloseTo(0);
    });
  }
});

describe('lerpVectors extended', () => {
  for (let i = 0; i <= 20; i++) {
    const t = i / 20;
    it(`lerp at t=${t} satisfies linearity property`, () => {
      const a = new Vector([0, 0]);
      const b = new Vector([20, 20]);
      const r = lerpVectors(a, b, t);
      expect(r.get(0)).toBeCloseTo(20 * t);
      expect(r.get(1)).toBeCloseTo(20 * t);
    });
  }

  for (let i = 1; i <= 10; i++) {
    it(`lerp midpoint of [${i},${i}] and [${3 * i},${3 * i}] = [${2 * i},${2 * i}]`, () => {
      const a = new Vector([i, i]);
      const b = new Vector([3 * i, 3 * i]);
      const r = lerpVectors(a, b, 0.5);
      expect(r.get(0)).toBeCloseTo(2 * i);
      expect(r.get(1)).toBeCloseTo(2 * i);
    });
  }
});

describe('gramSchmidt extended', () => {
  for (let n = 2; n <= 6; n++) {
    it(`gramSchmidt of ${n} standard basis vectors returns ${n} orthonormal vectors`, () => {
      const basis = Array.from({ length: n }, (_, i) => Vector.unit(n, i));
      const result = gramSchmidt(basis);
      expect(result.length).toBe(n);
      for (const v of result) {
        expect(v.magnitude()).toBeCloseTo(1);
      }
    });
  }

  for (let n = 2; n <= 6; n++) {
    it(`gramSchmidt result is orthogonal for ${n}D standard basis`, () => {
      const basis = Array.from({ length: n }, (_, i) => Vector.unit(n, i));
      const result = gramSchmidt(basis);
      for (let i = 0; i < result.length; i++) {
        for (let j = i + 1; j < result.length; j++) {
          expect(Math.abs(result[i].dot(result[j]))).toBeCloseTo(0);
        }
      }
    });
  }

  for (let i = 2; i <= 15; i++) {
    it(`gramSchmidt of ${i} identical vectors returns 1 vector`, () => {
      const v = new Vector([1, 0]);
      const vecs = Array.from({ length: i }, () => new Vector([1, 0]));
      const result = gramSchmidt(vecs);
      expect(result.length).toBe(1);
    });
  }
});

describe('Matrix extended: rowEchelon', () => {
  for (let n = 1; n <= 10; n++) {
    it(`rowEchelon of I_${n} = I_${n}`, () => {
      const I = Matrix.identity(n);
      const ref = I.rowEchelon();
      expect(ref.equals(I, 1e-8)).toBe(true);
    });
  }

  for (let n = 1; n <= 10; n++) {
    it(`rowEchelon of zeros(${n},${n}) = zeros`, () => {
      const Z = Matrix.zeros(n, n);
      const ref = Z.rowEchelon();
      expect(ref.equals(Z)).toBe(true);
    });
  }

  for (let n = 2; n <= 5; n++) {
    it(`rowEchelon of diagonal([1..${n}]) is upper triangular`, () => {
      const A = Matrix.diagonal(Array.from({ length: n }, (_, i) => i + 1));
      const ref = A.rowEchelon();
      for (let i = 1; i < n; i++) {
        for (let j = 0; j < i; j++) {
          expect(Math.abs(ref.get(i, j))).toBeCloseTo(0);
        }
      }
    });
  }
});

describe('Matrix extended: equals', () => {
  for (let n = 1; n <= 15; n++) {
    it(`I_${n}.equals(I_${n}) = true`, () => {
      expect(Matrix.identity(n).equals(Matrix.identity(n))).toBe(true);
    });
  }

  for (let n = 1; n <= 15; n++) {
    it(`zeros(${n},${n}).equals(zeros(${n},${n})) = true`, () => {
      expect(Matrix.zeros(n, n).equals(Matrix.zeros(n, n))).toBe(true);
    });
  }

  for (let n = 1; n <= 10; n++) {
    it(`I_${n} != zeros_${n} (equals = false)`, () => {
      if (n > 0) {
        expect(Matrix.identity(n).equals(Matrix.zeros(n, n))).toBe(false);
      }
    });
  }
});

describe('Vector extended: static methods validation', () => {
  for (let d = 1; d <= 20; d++) {
    it(`Vector.zero(${d}).toArray() has ${d} zeros`, () => {
      const arr = Vector.zero(d).toArray();
      expect(arr.length).toBe(d);
      expect(arr.every((v) => v === 0)).toBe(true);
    });
  }

  for (let d = 1; d <= 10; d++) {
    for (let i = 0; i < d; i++) {
      it(`Vector.unit(${d}, ${i}).get(${i}) = 1`, () => {
        expect(Vector.unit(d, i).get(i)).toBe(1);
      });
    }
  }
});

describe('Matrix extended: random', () => {
  for (let m = 1; m <= 5; m++) {
    for (let n = 1; n <= 5; n++) {
      it(`Matrix.random(${m}, ${n}) has correct dimensions`, () => {
        const mat = Matrix.random(m, n);
        expect(mat.rows).toBe(m);
        expect(mat.cols).toBe(n);
      });
    }
  }
});
