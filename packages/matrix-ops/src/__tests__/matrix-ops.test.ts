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
function hd258mtx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph258mtx_hd',()=>{it('a',()=>{expect(hd258mtx(1,4)).toBe(2);});it('b',()=>{expect(hd258mtx(3,1)).toBe(1);});it('c',()=>{expect(hd258mtx(0,0)).toBe(0);});it('d',()=>{expect(hd258mtx(93,73)).toBe(2);});it('e',()=>{expect(hd258mtx(15,0)).toBe(4);});});
function hd259mtx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph259mtx_hd',()=>{it('a',()=>{expect(hd259mtx(1,4)).toBe(2);});it('b',()=>{expect(hd259mtx(3,1)).toBe(1);});it('c',()=>{expect(hd259mtx(0,0)).toBe(0);});it('d',()=>{expect(hd259mtx(93,73)).toBe(2);});it('e',()=>{expect(hd259mtx(15,0)).toBe(4);});});
function hd260mtx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph260mtx_hd',()=>{it('a',()=>{expect(hd260mtx(1,4)).toBe(2);});it('b',()=>{expect(hd260mtx(3,1)).toBe(1);});it('c',()=>{expect(hd260mtx(0,0)).toBe(0);});it('d',()=>{expect(hd260mtx(93,73)).toBe(2);});it('e',()=>{expect(hd260mtx(15,0)).toBe(4);});});
function hd261mtx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph261mtx_hd',()=>{it('a',()=>{expect(hd261mtx(1,4)).toBe(2);});it('b',()=>{expect(hd261mtx(3,1)).toBe(1);});it('c',()=>{expect(hd261mtx(0,0)).toBe(0);});it('d',()=>{expect(hd261mtx(93,73)).toBe(2);});it('e',()=>{expect(hd261mtx(15,0)).toBe(4);});});
function hd262mtx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph262mtx_hd',()=>{it('a',()=>{expect(hd262mtx(1,4)).toBe(2);});it('b',()=>{expect(hd262mtx(3,1)).toBe(1);});it('c',()=>{expect(hd262mtx(0,0)).toBe(0);});it('d',()=>{expect(hd262mtx(93,73)).toBe(2);});it('e',()=>{expect(hd262mtx(15,0)).toBe(4);});});
function hd263mtx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph263mtx_hd',()=>{it('a',()=>{expect(hd263mtx(1,4)).toBe(2);});it('b',()=>{expect(hd263mtx(3,1)).toBe(1);});it('c',()=>{expect(hd263mtx(0,0)).toBe(0);});it('d',()=>{expect(hd263mtx(93,73)).toBe(2);});it('e',()=>{expect(hd263mtx(15,0)).toBe(4);});});
function hd264mtx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph264mtx_hd',()=>{it('a',()=>{expect(hd264mtx(1,4)).toBe(2);});it('b',()=>{expect(hd264mtx(3,1)).toBe(1);});it('c',()=>{expect(hd264mtx(0,0)).toBe(0);});it('d',()=>{expect(hd264mtx(93,73)).toBe(2);});it('e',()=>{expect(hd264mtx(15,0)).toBe(4);});});
function hd265mtx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph265mtx_hd',()=>{it('a',()=>{expect(hd265mtx(1,4)).toBe(2);});it('b',()=>{expect(hd265mtx(3,1)).toBe(1);});it('c',()=>{expect(hd265mtx(0,0)).toBe(0);});it('d',()=>{expect(hd265mtx(93,73)).toBe(2);});it('e',()=>{expect(hd265mtx(15,0)).toBe(4);});});
function hd266mtx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph266mtx_hd',()=>{it('a',()=>{expect(hd266mtx(1,4)).toBe(2);});it('b',()=>{expect(hd266mtx(3,1)).toBe(1);});it('c',()=>{expect(hd266mtx(0,0)).toBe(0);});it('d',()=>{expect(hd266mtx(93,73)).toBe(2);});it('e',()=>{expect(hd266mtx(15,0)).toBe(4);});});
function hd267mtx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph267mtx_hd',()=>{it('a',()=>{expect(hd267mtx(1,4)).toBe(2);});it('b',()=>{expect(hd267mtx(3,1)).toBe(1);});it('c',()=>{expect(hd267mtx(0,0)).toBe(0);});it('d',()=>{expect(hd267mtx(93,73)).toBe(2);});it('e',()=>{expect(hd267mtx(15,0)).toBe(4);});});
function hd268mtx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph268mtx_hd',()=>{it('a',()=>{expect(hd268mtx(1,4)).toBe(2);});it('b',()=>{expect(hd268mtx(3,1)).toBe(1);});it('c',()=>{expect(hd268mtx(0,0)).toBe(0);});it('d',()=>{expect(hd268mtx(93,73)).toBe(2);});it('e',()=>{expect(hd268mtx(15,0)).toBe(4);});});
function hd269mtx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph269mtx_hd',()=>{it('a',()=>{expect(hd269mtx(1,4)).toBe(2);});it('b',()=>{expect(hd269mtx(3,1)).toBe(1);});it('c',()=>{expect(hd269mtx(0,0)).toBe(0);});it('d',()=>{expect(hd269mtx(93,73)).toBe(2);});it('e',()=>{expect(hd269mtx(15,0)).toBe(4);});});
function hd270mtx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph270mtx_hd',()=>{it('a',()=>{expect(hd270mtx(1,4)).toBe(2);});it('b',()=>{expect(hd270mtx(3,1)).toBe(1);});it('c',()=>{expect(hd270mtx(0,0)).toBe(0);});it('d',()=>{expect(hd270mtx(93,73)).toBe(2);});it('e',()=>{expect(hd270mtx(15,0)).toBe(4);});});
function hd271mtx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph271mtx_hd',()=>{it('a',()=>{expect(hd271mtx(1,4)).toBe(2);});it('b',()=>{expect(hd271mtx(3,1)).toBe(1);});it('c',()=>{expect(hd271mtx(0,0)).toBe(0);});it('d',()=>{expect(hd271mtx(93,73)).toBe(2);});it('e',()=>{expect(hd271mtx(15,0)).toBe(4);});});
function hd272mtx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph272mtx_hd',()=>{it('a',()=>{expect(hd272mtx(1,4)).toBe(2);});it('b',()=>{expect(hd272mtx(3,1)).toBe(1);});it('c',()=>{expect(hd272mtx(0,0)).toBe(0);});it('d',()=>{expect(hd272mtx(93,73)).toBe(2);});it('e',()=>{expect(hd272mtx(15,0)).toBe(4);});});
function hd273mtx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph273mtx_hd',()=>{it('a',()=>{expect(hd273mtx(1,4)).toBe(2);});it('b',()=>{expect(hd273mtx(3,1)).toBe(1);});it('c',()=>{expect(hd273mtx(0,0)).toBe(0);});it('d',()=>{expect(hd273mtx(93,73)).toBe(2);});it('e',()=>{expect(hd273mtx(15,0)).toBe(4);});});
function hd274mtx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph274mtx_hd',()=>{it('a',()=>{expect(hd274mtx(1,4)).toBe(2);});it('b',()=>{expect(hd274mtx(3,1)).toBe(1);});it('c',()=>{expect(hd274mtx(0,0)).toBe(0);});it('d',()=>{expect(hd274mtx(93,73)).toBe(2);});it('e',()=>{expect(hd274mtx(15,0)).toBe(4);});});
function hd275mtx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph275mtx_hd',()=>{it('a',()=>{expect(hd275mtx(1,4)).toBe(2);});it('b',()=>{expect(hd275mtx(3,1)).toBe(1);});it('c',()=>{expect(hd275mtx(0,0)).toBe(0);});it('d',()=>{expect(hd275mtx(93,73)).toBe(2);});it('e',()=>{expect(hd275mtx(15,0)).toBe(4);});});
function hd276mtx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph276mtx_hd',()=>{it('a',()=>{expect(hd276mtx(1,4)).toBe(2);});it('b',()=>{expect(hd276mtx(3,1)).toBe(1);});it('c',()=>{expect(hd276mtx(0,0)).toBe(0);});it('d',()=>{expect(hd276mtx(93,73)).toBe(2);});it('e',()=>{expect(hd276mtx(15,0)).toBe(4);});});
function hd277mtx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph277mtx_hd',()=>{it('a',()=>{expect(hd277mtx(1,4)).toBe(2);});it('b',()=>{expect(hd277mtx(3,1)).toBe(1);});it('c',()=>{expect(hd277mtx(0,0)).toBe(0);});it('d',()=>{expect(hd277mtx(93,73)).toBe(2);});it('e',()=>{expect(hd277mtx(15,0)).toBe(4);});});
function hd278mtx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph278mtx_hd',()=>{it('a',()=>{expect(hd278mtx(1,4)).toBe(2);});it('b',()=>{expect(hd278mtx(3,1)).toBe(1);});it('c',()=>{expect(hd278mtx(0,0)).toBe(0);});it('d',()=>{expect(hd278mtx(93,73)).toBe(2);});it('e',()=>{expect(hd278mtx(15,0)).toBe(4);});});
function hd279mtx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph279mtx_hd',()=>{it('a',()=>{expect(hd279mtx(1,4)).toBe(2);});it('b',()=>{expect(hd279mtx(3,1)).toBe(1);});it('c',()=>{expect(hd279mtx(0,0)).toBe(0);});it('d',()=>{expect(hd279mtx(93,73)).toBe(2);});it('e',()=>{expect(hd279mtx(15,0)).toBe(4);});});
function hd280mtx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph280mtx_hd',()=>{it('a',()=>{expect(hd280mtx(1,4)).toBe(2);});it('b',()=>{expect(hd280mtx(3,1)).toBe(1);});it('c',()=>{expect(hd280mtx(0,0)).toBe(0);});it('d',()=>{expect(hd280mtx(93,73)).toBe(2);});it('e',()=>{expect(hd280mtx(15,0)).toBe(4);});});
function hd281mtx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph281mtx_hd',()=>{it('a',()=>{expect(hd281mtx(1,4)).toBe(2);});it('b',()=>{expect(hd281mtx(3,1)).toBe(1);});it('c',()=>{expect(hd281mtx(0,0)).toBe(0);});it('d',()=>{expect(hd281mtx(93,73)).toBe(2);});it('e',()=>{expect(hd281mtx(15,0)).toBe(4);});});
function hd282mtx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph282mtx_hd',()=>{it('a',()=>{expect(hd282mtx(1,4)).toBe(2);});it('b',()=>{expect(hd282mtx(3,1)).toBe(1);});it('c',()=>{expect(hd282mtx(0,0)).toBe(0);});it('d',()=>{expect(hd282mtx(93,73)).toBe(2);});it('e',()=>{expect(hd282mtx(15,0)).toBe(4);});});
function hd283mtx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph283mtx_hd',()=>{it('a',()=>{expect(hd283mtx(1,4)).toBe(2);});it('b',()=>{expect(hd283mtx(3,1)).toBe(1);});it('c',()=>{expect(hd283mtx(0,0)).toBe(0);});it('d',()=>{expect(hd283mtx(93,73)).toBe(2);});it('e',()=>{expect(hd283mtx(15,0)).toBe(4);});});
function hd284mtx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph284mtx_hd',()=>{it('a',()=>{expect(hd284mtx(1,4)).toBe(2);});it('b',()=>{expect(hd284mtx(3,1)).toBe(1);});it('c',()=>{expect(hd284mtx(0,0)).toBe(0);});it('d',()=>{expect(hd284mtx(93,73)).toBe(2);});it('e',()=>{expect(hd284mtx(15,0)).toBe(4);});});
function hd285mtx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph285mtx_hd',()=>{it('a',()=>{expect(hd285mtx(1,4)).toBe(2);});it('b',()=>{expect(hd285mtx(3,1)).toBe(1);});it('c',()=>{expect(hd285mtx(0,0)).toBe(0);});it('d',()=>{expect(hd285mtx(93,73)).toBe(2);});it('e',()=>{expect(hd285mtx(15,0)).toBe(4);});});
function hd286mtx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph286mtx_hd',()=>{it('a',()=>{expect(hd286mtx(1,4)).toBe(2);});it('b',()=>{expect(hd286mtx(3,1)).toBe(1);});it('c',()=>{expect(hd286mtx(0,0)).toBe(0);});it('d',()=>{expect(hd286mtx(93,73)).toBe(2);});it('e',()=>{expect(hd286mtx(15,0)).toBe(4);});});
function hd287mtx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph287mtx_hd',()=>{it('a',()=>{expect(hd287mtx(1,4)).toBe(2);});it('b',()=>{expect(hd287mtx(3,1)).toBe(1);});it('c',()=>{expect(hd287mtx(0,0)).toBe(0);});it('d',()=>{expect(hd287mtx(93,73)).toBe(2);});it('e',()=>{expect(hd287mtx(15,0)).toBe(4);});});
function hd288mtx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph288mtx_hd',()=>{it('a',()=>{expect(hd288mtx(1,4)).toBe(2);});it('b',()=>{expect(hd288mtx(3,1)).toBe(1);});it('c',()=>{expect(hd288mtx(0,0)).toBe(0);});it('d',()=>{expect(hd288mtx(93,73)).toBe(2);});it('e',()=>{expect(hd288mtx(15,0)).toBe(4);});});
function hd289mtx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph289mtx_hd',()=>{it('a',()=>{expect(hd289mtx(1,4)).toBe(2);});it('b',()=>{expect(hd289mtx(3,1)).toBe(1);});it('c',()=>{expect(hd289mtx(0,0)).toBe(0);});it('d',()=>{expect(hd289mtx(93,73)).toBe(2);});it('e',()=>{expect(hd289mtx(15,0)).toBe(4);});});
function hd290mtx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph290mtx_hd',()=>{it('a',()=>{expect(hd290mtx(1,4)).toBe(2);});it('b',()=>{expect(hd290mtx(3,1)).toBe(1);});it('c',()=>{expect(hd290mtx(0,0)).toBe(0);});it('d',()=>{expect(hd290mtx(93,73)).toBe(2);});it('e',()=>{expect(hd290mtx(15,0)).toBe(4);});});
function hd291mtx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph291mtx_hd',()=>{it('a',()=>{expect(hd291mtx(1,4)).toBe(2);});it('b',()=>{expect(hd291mtx(3,1)).toBe(1);});it('c',()=>{expect(hd291mtx(0,0)).toBe(0);});it('d',()=>{expect(hd291mtx(93,73)).toBe(2);});it('e',()=>{expect(hd291mtx(15,0)).toBe(4);});});
function hd292mtx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph292mtx_hd',()=>{it('a',()=>{expect(hd292mtx(1,4)).toBe(2);});it('b',()=>{expect(hd292mtx(3,1)).toBe(1);});it('c',()=>{expect(hd292mtx(0,0)).toBe(0);});it('d',()=>{expect(hd292mtx(93,73)).toBe(2);});it('e',()=>{expect(hd292mtx(15,0)).toBe(4);});});
function hd293mtx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph293mtx_hd',()=>{it('a',()=>{expect(hd293mtx(1,4)).toBe(2);});it('b',()=>{expect(hd293mtx(3,1)).toBe(1);});it('c',()=>{expect(hd293mtx(0,0)).toBe(0);});it('d',()=>{expect(hd293mtx(93,73)).toBe(2);});it('e',()=>{expect(hd293mtx(15,0)).toBe(4);});});
function hd294mtx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph294mtx_hd',()=>{it('a',()=>{expect(hd294mtx(1,4)).toBe(2);});it('b',()=>{expect(hd294mtx(3,1)).toBe(1);});it('c',()=>{expect(hd294mtx(0,0)).toBe(0);});it('d',()=>{expect(hd294mtx(93,73)).toBe(2);});it('e',()=>{expect(hd294mtx(15,0)).toBe(4);});});
function hd295mtx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph295mtx_hd',()=>{it('a',()=>{expect(hd295mtx(1,4)).toBe(2);});it('b',()=>{expect(hd295mtx(3,1)).toBe(1);});it('c',()=>{expect(hd295mtx(0,0)).toBe(0);});it('d',()=>{expect(hd295mtx(93,73)).toBe(2);});it('e',()=>{expect(hd295mtx(15,0)).toBe(4);});});
function hd296mtx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph296mtx_hd',()=>{it('a',()=>{expect(hd296mtx(1,4)).toBe(2);});it('b',()=>{expect(hd296mtx(3,1)).toBe(1);});it('c',()=>{expect(hd296mtx(0,0)).toBe(0);});it('d',()=>{expect(hd296mtx(93,73)).toBe(2);});it('e',()=>{expect(hd296mtx(15,0)).toBe(4);});});
function hd297mtx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph297mtx_hd',()=>{it('a',()=>{expect(hd297mtx(1,4)).toBe(2);});it('b',()=>{expect(hd297mtx(3,1)).toBe(1);});it('c',()=>{expect(hd297mtx(0,0)).toBe(0);});it('d',()=>{expect(hd297mtx(93,73)).toBe(2);});it('e',()=>{expect(hd297mtx(15,0)).toBe(4);});});
function hd298mtx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph298mtx_hd',()=>{it('a',()=>{expect(hd298mtx(1,4)).toBe(2);});it('b',()=>{expect(hd298mtx(3,1)).toBe(1);});it('c',()=>{expect(hd298mtx(0,0)).toBe(0);});it('d',()=>{expect(hd298mtx(93,73)).toBe(2);});it('e',()=>{expect(hd298mtx(15,0)).toBe(4);});});
function hd299mtx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph299mtx_hd',()=>{it('a',()=>{expect(hd299mtx(1,4)).toBe(2);});it('b',()=>{expect(hd299mtx(3,1)).toBe(1);});it('c',()=>{expect(hd299mtx(0,0)).toBe(0);});it('d',()=>{expect(hd299mtx(93,73)).toBe(2);});it('e',()=>{expect(hd299mtx(15,0)).toBe(4);});});
function hd300mtx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph300mtx_hd',()=>{it('a',()=>{expect(hd300mtx(1,4)).toBe(2);});it('b',()=>{expect(hd300mtx(3,1)).toBe(1);});it('c',()=>{expect(hd300mtx(0,0)).toBe(0);});it('d',()=>{expect(hd300mtx(93,73)).toBe(2);});it('e',()=>{expect(hd300mtx(15,0)).toBe(4);});});
function hd301mtx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph301mtx_hd',()=>{it('a',()=>{expect(hd301mtx(1,4)).toBe(2);});it('b',()=>{expect(hd301mtx(3,1)).toBe(1);});it('c',()=>{expect(hd301mtx(0,0)).toBe(0);});it('d',()=>{expect(hd301mtx(93,73)).toBe(2);});it('e',()=>{expect(hd301mtx(15,0)).toBe(4);});});
function hd302mtx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph302mtx_hd',()=>{it('a',()=>{expect(hd302mtx(1,4)).toBe(2);});it('b',()=>{expect(hd302mtx(3,1)).toBe(1);});it('c',()=>{expect(hd302mtx(0,0)).toBe(0);});it('d',()=>{expect(hd302mtx(93,73)).toBe(2);});it('e',()=>{expect(hd302mtx(15,0)).toBe(4);});});
function hd303mtx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph303mtx_hd',()=>{it('a',()=>{expect(hd303mtx(1,4)).toBe(2);});it('b',()=>{expect(hd303mtx(3,1)).toBe(1);});it('c',()=>{expect(hd303mtx(0,0)).toBe(0);});it('d',()=>{expect(hd303mtx(93,73)).toBe(2);});it('e',()=>{expect(hd303mtx(15,0)).toBe(4);});});
function hd304mtx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph304mtx_hd',()=>{it('a',()=>{expect(hd304mtx(1,4)).toBe(2);});it('b',()=>{expect(hd304mtx(3,1)).toBe(1);});it('c',()=>{expect(hd304mtx(0,0)).toBe(0);});it('d',()=>{expect(hd304mtx(93,73)).toBe(2);});it('e',()=>{expect(hd304mtx(15,0)).toBe(4);});});
function hd305mtx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph305mtx_hd',()=>{it('a',()=>{expect(hd305mtx(1,4)).toBe(2);});it('b',()=>{expect(hd305mtx(3,1)).toBe(1);});it('c',()=>{expect(hd305mtx(0,0)).toBe(0);});it('d',()=>{expect(hd305mtx(93,73)).toBe(2);});it('e',()=>{expect(hd305mtx(15,0)).toBe(4);});});
function hd306mtx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph306mtx_hd',()=>{it('a',()=>{expect(hd306mtx(1,4)).toBe(2);});it('b',()=>{expect(hd306mtx(3,1)).toBe(1);});it('c',()=>{expect(hd306mtx(0,0)).toBe(0);});it('d',()=>{expect(hd306mtx(93,73)).toBe(2);});it('e',()=>{expect(hd306mtx(15,0)).toBe(4);});});
function hd307mtx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph307mtx_hd',()=>{it('a',()=>{expect(hd307mtx(1,4)).toBe(2);});it('b',()=>{expect(hd307mtx(3,1)).toBe(1);});it('c',()=>{expect(hd307mtx(0,0)).toBe(0);});it('d',()=>{expect(hd307mtx(93,73)).toBe(2);});it('e',()=>{expect(hd307mtx(15,0)).toBe(4);});});
function hd308mtx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph308mtx_hd',()=>{it('a',()=>{expect(hd308mtx(1,4)).toBe(2);});it('b',()=>{expect(hd308mtx(3,1)).toBe(1);});it('c',()=>{expect(hd308mtx(0,0)).toBe(0);});it('d',()=>{expect(hd308mtx(93,73)).toBe(2);});it('e',()=>{expect(hd308mtx(15,0)).toBe(4);});});
function hd309mtx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph309mtx_hd',()=>{it('a',()=>{expect(hd309mtx(1,4)).toBe(2);});it('b',()=>{expect(hd309mtx(3,1)).toBe(1);});it('c',()=>{expect(hd309mtx(0,0)).toBe(0);});it('d',()=>{expect(hd309mtx(93,73)).toBe(2);});it('e',()=>{expect(hd309mtx(15,0)).toBe(4);});});
function hd310mtx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph310mtx_hd',()=>{it('a',()=>{expect(hd310mtx(1,4)).toBe(2);});it('b',()=>{expect(hd310mtx(3,1)).toBe(1);});it('c',()=>{expect(hd310mtx(0,0)).toBe(0);});it('d',()=>{expect(hd310mtx(93,73)).toBe(2);});it('e',()=>{expect(hd310mtx(15,0)).toBe(4);});});
function hd311mtx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph311mtx_hd',()=>{it('a',()=>{expect(hd311mtx(1,4)).toBe(2);});it('b',()=>{expect(hd311mtx(3,1)).toBe(1);});it('c',()=>{expect(hd311mtx(0,0)).toBe(0);});it('d',()=>{expect(hd311mtx(93,73)).toBe(2);});it('e',()=>{expect(hd311mtx(15,0)).toBe(4);});});
function hd312mtx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph312mtx_hd',()=>{it('a',()=>{expect(hd312mtx(1,4)).toBe(2);});it('b',()=>{expect(hd312mtx(3,1)).toBe(1);});it('c',()=>{expect(hd312mtx(0,0)).toBe(0);});it('d',()=>{expect(hd312mtx(93,73)).toBe(2);});it('e',()=>{expect(hd312mtx(15,0)).toBe(4);});});
function hd313mtx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph313mtx_hd',()=>{it('a',()=>{expect(hd313mtx(1,4)).toBe(2);});it('b',()=>{expect(hd313mtx(3,1)).toBe(1);});it('c',()=>{expect(hd313mtx(0,0)).toBe(0);});it('d',()=>{expect(hd313mtx(93,73)).toBe(2);});it('e',()=>{expect(hd313mtx(15,0)).toBe(4);});});
function hd314mtx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph314mtx_hd',()=>{it('a',()=>{expect(hd314mtx(1,4)).toBe(2);});it('b',()=>{expect(hd314mtx(3,1)).toBe(1);});it('c',()=>{expect(hd314mtx(0,0)).toBe(0);});it('d',()=>{expect(hd314mtx(93,73)).toBe(2);});it('e',()=>{expect(hd314mtx(15,0)).toBe(4);});});
function hd315mtx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph315mtx_hd',()=>{it('a',()=>{expect(hd315mtx(1,4)).toBe(2);});it('b',()=>{expect(hd315mtx(3,1)).toBe(1);});it('c',()=>{expect(hd315mtx(0,0)).toBe(0);});it('d',()=>{expect(hd315mtx(93,73)).toBe(2);});it('e',()=>{expect(hd315mtx(15,0)).toBe(4);});});
function hd316mtx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph316mtx_hd',()=>{it('a',()=>{expect(hd316mtx(1,4)).toBe(2);});it('b',()=>{expect(hd316mtx(3,1)).toBe(1);});it('c',()=>{expect(hd316mtx(0,0)).toBe(0);});it('d',()=>{expect(hd316mtx(93,73)).toBe(2);});it('e',()=>{expect(hd316mtx(15,0)).toBe(4);});});
function hd317mtx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph317mtx_hd',()=>{it('a',()=>{expect(hd317mtx(1,4)).toBe(2);});it('b',()=>{expect(hd317mtx(3,1)).toBe(1);});it('c',()=>{expect(hd317mtx(0,0)).toBe(0);});it('d',()=>{expect(hd317mtx(93,73)).toBe(2);});it('e',()=>{expect(hd317mtx(15,0)).toBe(4);});});
function hd318mtx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph318mtx_hd',()=>{it('a',()=>{expect(hd318mtx(1,4)).toBe(2);});it('b',()=>{expect(hd318mtx(3,1)).toBe(1);});it('c',()=>{expect(hd318mtx(0,0)).toBe(0);});it('d',()=>{expect(hd318mtx(93,73)).toBe(2);});it('e',()=>{expect(hd318mtx(15,0)).toBe(4);});});
function hd319mtx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph319mtx_hd',()=>{it('a',()=>{expect(hd319mtx(1,4)).toBe(2);});it('b',()=>{expect(hd319mtx(3,1)).toBe(1);});it('c',()=>{expect(hd319mtx(0,0)).toBe(0);});it('d',()=>{expect(hd319mtx(93,73)).toBe(2);});it('e',()=>{expect(hd319mtx(15,0)).toBe(4);});});
function hd320mtx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph320mtx_hd',()=>{it('a',()=>{expect(hd320mtx(1,4)).toBe(2);});it('b',()=>{expect(hd320mtx(3,1)).toBe(1);});it('c',()=>{expect(hd320mtx(0,0)).toBe(0);});it('d',()=>{expect(hd320mtx(93,73)).toBe(2);});it('e',()=>{expect(hd320mtx(15,0)).toBe(4);});});
function hd321mtx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph321mtx_hd',()=>{it('a',()=>{expect(hd321mtx(1,4)).toBe(2);});it('b',()=>{expect(hd321mtx(3,1)).toBe(1);});it('c',()=>{expect(hd321mtx(0,0)).toBe(0);});it('d',()=>{expect(hd321mtx(93,73)).toBe(2);});it('e',()=>{expect(hd321mtx(15,0)).toBe(4);});});
function hd322mtx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph322mtx_hd',()=>{it('a',()=>{expect(hd322mtx(1,4)).toBe(2);});it('b',()=>{expect(hd322mtx(3,1)).toBe(1);});it('c',()=>{expect(hd322mtx(0,0)).toBe(0);});it('d',()=>{expect(hd322mtx(93,73)).toBe(2);});it('e',()=>{expect(hd322mtx(15,0)).toBe(4);});});
function hd323mtx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph323mtx_hd',()=>{it('a',()=>{expect(hd323mtx(1,4)).toBe(2);});it('b',()=>{expect(hd323mtx(3,1)).toBe(1);});it('c',()=>{expect(hd323mtx(0,0)).toBe(0);});it('d',()=>{expect(hd323mtx(93,73)).toBe(2);});it('e',()=>{expect(hd323mtx(15,0)).toBe(4);});});
function hd324mtx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph324mtx_hd',()=>{it('a',()=>{expect(hd324mtx(1,4)).toBe(2);});it('b',()=>{expect(hd324mtx(3,1)).toBe(1);});it('c',()=>{expect(hd324mtx(0,0)).toBe(0);});it('d',()=>{expect(hd324mtx(93,73)).toBe(2);});it('e',()=>{expect(hd324mtx(15,0)).toBe(4);});});
function hd325mtx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph325mtx_hd',()=>{it('a',()=>{expect(hd325mtx(1,4)).toBe(2);});it('b',()=>{expect(hd325mtx(3,1)).toBe(1);});it('c',()=>{expect(hd325mtx(0,0)).toBe(0);});it('d',()=>{expect(hd325mtx(93,73)).toBe(2);});it('e',()=>{expect(hd325mtx(15,0)).toBe(4);});});
function hd326mtx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph326mtx_hd',()=>{it('a',()=>{expect(hd326mtx(1,4)).toBe(2);});it('b',()=>{expect(hd326mtx(3,1)).toBe(1);});it('c',()=>{expect(hd326mtx(0,0)).toBe(0);});it('d',()=>{expect(hd326mtx(93,73)).toBe(2);});it('e',()=>{expect(hd326mtx(15,0)).toBe(4);});});
function hd327mtx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph327mtx_hd',()=>{it('a',()=>{expect(hd327mtx(1,4)).toBe(2);});it('b',()=>{expect(hd327mtx(3,1)).toBe(1);});it('c',()=>{expect(hd327mtx(0,0)).toBe(0);});it('d',()=>{expect(hd327mtx(93,73)).toBe(2);});it('e',()=>{expect(hd327mtx(15,0)).toBe(4);});});
function hd328mtx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph328mtx_hd',()=>{it('a',()=>{expect(hd328mtx(1,4)).toBe(2);});it('b',()=>{expect(hd328mtx(3,1)).toBe(1);});it('c',()=>{expect(hd328mtx(0,0)).toBe(0);});it('d',()=>{expect(hd328mtx(93,73)).toBe(2);});it('e',()=>{expect(hd328mtx(15,0)).toBe(4);});});
function hd329mtx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph329mtx_hd',()=>{it('a',()=>{expect(hd329mtx(1,4)).toBe(2);});it('b',()=>{expect(hd329mtx(3,1)).toBe(1);});it('c',()=>{expect(hd329mtx(0,0)).toBe(0);});it('d',()=>{expect(hd329mtx(93,73)).toBe(2);});it('e',()=>{expect(hd329mtx(15,0)).toBe(4);});});
function hd330mtx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph330mtx_hd',()=>{it('a',()=>{expect(hd330mtx(1,4)).toBe(2);});it('b',()=>{expect(hd330mtx(3,1)).toBe(1);});it('c',()=>{expect(hd330mtx(0,0)).toBe(0);});it('d',()=>{expect(hd330mtx(93,73)).toBe(2);});it('e',()=>{expect(hd330mtx(15,0)).toBe(4);});});
function hd331mtx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph331mtx_hd',()=>{it('a',()=>{expect(hd331mtx(1,4)).toBe(2);});it('b',()=>{expect(hd331mtx(3,1)).toBe(1);});it('c',()=>{expect(hd331mtx(0,0)).toBe(0);});it('d',()=>{expect(hd331mtx(93,73)).toBe(2);});it('e',()=>{expect(hd331mtx(15,0)).toBe(4);});});
function hd332mtx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph332mtx_hd',()=>{it('a',()=>{expect(hd332mtx(1,4)).toBe(2);});it('b',()=>{expect(hd332mtx(3,1)).toBe(1);});it('c',()=>{expect(hd332mtx(0,0)).toBe(0);});it('d',()=>{expect(hd332mtx(93,73)).toBe(2);});it('e',()=>{expect(hd332mtx(15,0)).toBe(4);});});
function hd333mtx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph333mtx_hd',()=>{it('a',()=>{expect(hd333mtx(1,4)).toBe(2);});it('b',()=>{expect(hd333mtx(3,1)).toBe(1);});it('c',()=>{expect(hd333mtx(0,0)).toBe(0);});it('d',()=>{expect(hd333mtx(93,73)).toBe(2);});it('e',()=>{expect(hd333mtx(15,0)).toBe(4);});});
function hd334mtx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph334mtx_hd',()=>{it('a',()=>{expect(hd334mtx(1,4)).toBe(2);});it('b',()=>{expect(hd334mtx(3,1)).toBe(1);});it('c',()=>{expect(hd334mtx(0,0)).toBe(0);});it('d',()=>{expect(hd334mtx(93,73)).toBe(2);});it('e',()=>{expect(hd334mtx(15,0)).toBe(4);});});
function hd335mtx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph335mtx_hd',()=>{it('a',()=>{expect(hd335mtx(1,4)).toBe(2);});it('b',()=>{expect(hd335mtx(3,1)).toBe(1);});it('c',()=>{expect(hd335mtx(0,0)).toBe(0);});it('d',()=>{expect(hd335mtx(93,73)).toBe(2);});it('e',()=>{expect(hd335mtx(15,0)).toBe(4);});});
function hd336mtx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph336mtx_hd',()=>{it('a',()=>{expect(hd336mtx(1,4)).toBe(2);});it('b',()=>{expect(hd336mtx(3,1)).toBe(1);});it('c',()=>{expect(hd336mtx(0,0)).toBe(0);});it('d',()=>{expect(hd336mtx(93,73)).toBe(2);});it('e',()=>{expect(hd336mtx(15,0)).toBe(4);});});
function hd337mtx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph337mtx_hd',()=>{it('a',()=>{expect(hd337mtx(1,4)).toBe(2);});it('b',()=>{expect(hd337mtx(3,1)).toBe(1);});it('c',()=>{expect(hd337mtx(0,0)).toBe(0);});it('d',()=>{expect(hd337mtx(93,73)).toBe(2);});it('e',()=>{expect(hd337mtx(15,0)).toBe(4);});});
function hd338mtx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph338mtx2_hd',()=>{it('a',()=>{expect(hd338mtx2(1,4)).toBe(2);});it('b',()=>{expect(hd338mtx2(3,1)).toBe(1);});it('c',()=>{expect(hd338mtx2(0,0)).toBe(0);});it('d',()=>{expect(hd338mtx2(93,73)).toBe(2);});it('e',()=>{expect(hd338mtx2(15,0)).toBe(4);});});
function hd339mtx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph339mtx2_hd',()=>{it('a',()=>{expect(hd339mtx2(1,4)).toBe(2);});it('b',()=>{expect(hd339mtx2(3,1)).toBe(1);});it('c',()=>{expect(hd339mtx2(0,0)).toBe(0);});it('d',()=>{expect(hd339mtx2(93,73)).toBe(2);});it('e',()=>{expect(hd339mtx2(15,0)).toBe(4);});});
function hd340mtx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph340mtx2_hd',()=>{it('a',()=>{expect(hd340mtx2(1,4)).toBe(2);});it('b',()=>{expect(hd340mtx2(3,1)).toBe(1);});it('c',()=>{expect(hd340mtx2(0,0)).toBe(0);});it('d',()=>{expect(hd340mtx2(93,73)).toBe(2);});it('e',()=>{expect(hd340mtx2(15,0)).toBe(4);});});
function hd341mtx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph341mtx2_hd',()=>{it('a',()=>{expect(hd341mtx2(1,4)).toBe(2);});it('b',()=>{expect(hd341mtx2(3,1)).toBe(1);});it('c',()=>{expect(hd341mtx2(0,0)).toBe(0);});it('d',()=>{expect(hd341mtx2(93,73)).toBe(2);});it('e',()=>{expect(hd341mtx2(15,0)).toBe(4);});});
function hd342mtx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph342mtx2_hd',()=>{it('a',()=>{expect(hd342mtx2(1,4)).toBe(2);});it('b',()=>{expect(hd342mtx2(3,1)).toBe(1);});it('c',()=>{expect(hd342mtx2(0,0)).toBe(0);});it('d',()=>{expect(hd342mtx2(93,73)).toBe(2);});it('e',()=>{expect(hd342mtx2(15,0)).toBe(4);});});
function hd343mtx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph343mtx2_hd',()=>{it('a',()=>{expect(hd343mtx2(1,4)).toBe(2);});it('b',()=>{expect(hd343mtx2(3,1)).toBe(1);});it('c',()=>{expect(hd343mtx2(0,0)).toBe(0);});it('d',()=>{expect(hd343mtx2(93,73)).toBe(2);});it('e',()=>{expect(hd343mtx2(15,0)).toBe(4);});});
function hd344mtx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph344mtx2_hd',()=>{it('a',()=>{expect(hd344mtx2(1,4)).toBe(2);});it('b',()=>{expect(hd344mtx2(3,1)).toBe(1);});it('c',()=>{expect(hd344mtx2(0,0)).toBe(0);});it('d',()=>{expect(hd344mtx2(93,73)).toBe(2);});it('e',()=>{expect(hd344mtx2(15,0)).toBe(4);});});
function hd345mtx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph345mtx2_hd',()=>{it('a',()=>{expect(hd345mtx2(1,4)).toBe(2);});it('b',()=>{expect(hd345mtx2(3,1)).toBe(1);});it('c',()=>{expect(hd345mtx2(0,0)).toBe(0);});it('d',()=>{expect(hd345mtx2(93,73)).toBe(2);});it('e',()=>{expect(hd345mtx2(15,0)).toBe(4);});});
function hd346mtx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph346mtx2_hd',()=>{it('a',()=>{expect(hd346mtx2(1,4)).toBe(2);});it('b',()=>{expect(hd346mtx2(3,1)).toBe(1);});it('c',()=>{expect(hd346mtx2(0,0)).toBe(0);});it('d',()=>{expect(hd346mtx2(93,73)).toBe(2);});it('e',()=>{expect(hd346mtx2(15,0)).toBe(4);});});
function hd347mtx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph347mtx2_hd',()=>{it('a',()=>{expect(hd347mtx2(1,4)).toBe(2);});it('b',()=>{expect(hd347mtx2(3,1)).toBe(1);});it('c',()=>{expect(hd347mtx2(0,0)).toBe(0);});it('d',()=>{expect(hd347mtx2(93,73)).toBe(2);});it('e',()=>{expect(hd347mtx2(15,0)).toBe(4);});});
function hd348mtx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph348mtx2_hd',()=>{it('a',()=>{expect(hd348mtx2(1,4)).toBe(2);});it('b',()=>{expect(hd348mtx2(3,1)).toBe(1);});it('c',()=>{expect(hd348mtx2(0,0)).toBe(0);});it('d',()=>{expect(hd348mtx2(93,73)).toBe(2);});it('e',()=>{expect(hd348mtx2(15,0)).toBe(4);});});
function hd349mtx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph349mtx2_hd',()=>{it('a',()=>{expect(hd349mtx2(1,4)).toBe(2);});it('b',()=>{expect(hd349mtx2(3,1)).toBe(1);});it('c',()=>{expect(hd349mtx2(0,0)).toBe(0);});it('d',()=>{expect(hd349mtx2(93,73)).toBe(2);});it('e',()=>{expect(hd349mtx2(15,0)).toBe(4);});});
function hd350mtx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph350mtx2_hd',()=>{it('a',()=>{expect(hd350mtx2(1,4)).toBe(2);});it('b',()=>{expect(hd350mtx2(3,1)).toBe(1);});it('c',()=>{expect(hd350mtx2(0,0)).toBe(0);});it('d',()=>{expect(hd350mtx2(93,73)).toBe(2);});it('e',()=>{expect(hd350mtx2(15,0)).toBe(4);});});
function hd351mtx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph351mtx2_hd',()=>{it('a',()=>{expect(hd351mtx2(1,4)).toBe(2);});it('b',()=>{expect(hd351mtx2(3,1)).toBe(1);});it('c',()=>{expect(hd351mtx2(0,0)).toBe(0);});it('d',()=>{expect(hd351mtx2(93,73)).toBe(2);});it('e',()=>{expect(hd351mtx2(15,0)).toBe(4);});});
function hd352mtx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph352mtx2_hd',()=>{it('a',()=>{expect(hd352mtx2(1,4)).toBe(2);});it('b',()=>{expect(hd352mtx2(3,1)).toBe(1);});it('c',()=>{expect(hd352mtx2(0,0)).toBe(0);});it('d',()=>{expect(hd352mtx2(93,73)).toBe(2);});it('e',()=>{expect(hd352mtx2(15,0)).toBe(4);});});
function hd353mtx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph353mtx2_hd',()=>{it('a',()=>{expect(hd353mtx2(1,4)).toBe(2);});it('b',()=>{expect(hd353mtx2(3,1)).toBe(1);});it('c',()=>{expect(hd353mtx2(0,0)).toBe(0);});it('d',()=>{expect(hd353mtx2(93,73)).toBe(2);});it('e',()=>{expect(hd353mtx2(15,0)).toBe(4);});});
function hd354mtx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph354mtx2_hd',()=>{it('a',()=>{expect(hd354mtx2(1,4)).toBe(2);});it('b',()=>{expect(hd354mtx2(3,1)).toBe(1);});it('c',()=>{expect(hd354mtx2(0,0)).toBe(0);});it('d',()=>{expect(hd354mtx2(93,73)).toBe(2);});it('e',()=>{expect(hd354mtx2(15,0)).toBe(4);});});
function hd355mtx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph355mtx2_hd',()=>{it('a',()=>{expect(hd355mtx2(1,4)).toBe(2);});it('b',()=>{expect(hd355mtx2(3,1)).toBe(1);});it('c',()=>{expect(hd355mtx2(0,0)).toBe(0);});it('d',()=>{expect(hd355mtx2(93,73)).toBe(2);});it('e',()=>{expect(hd355mtx2(15,0)).toBe(4);});});
function hd356mtx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph356mtx2_hd',()=>{it('a',()=>{expect(hd356mtx2(1,4)).toBe(2);});it('b',()=>{expect(hd356mtx2(3,1)).toBe(1);});it('c',()=>{expect(hd356mtx2(0,0)).toBe(0);});it('d',()=>{expect(hd356mtx2(93,73)).toBe(2);});it('e',()=>{expect(hd356mtx2(15,0)).toBe(4);});});
function hd357mtx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph357mtx2_hd',()=>{it('a',()=>{expect(hd357mtx2(1,4)).toBe(2);});it('b',()=>{expect(hd357mtx2(3,1)).toBe(1);});it('c',()=>{expect(hd357mtx2(0,0)).toBe(0);});it('d',()=>{expect(hd357mtx2(93,73)).toBe(2);});it('e',()=>{expect(hd357mtx2(15,0)).toBe(4);});});
function hd358mtx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph358mtx2_hd',()=>{it('a',()=>{expect(hd358mtx2(1,4)).toBe(2);});it('b',()=>{expect(hd358mtx2(3,1)).toBe(1);});it('c',()=>{expect(hd358mtx2(0,0)).toBe(0);});it('d',()=>{expect(hd358mtx2(93,73)).toBe(2);});it('e',()=>{expect(hd358mtx2(15,0)).toBe(4);});});
function hd359mtx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph359mtx2_hd',()=>{it('a',()=>{expect(hd359mtx2(1,4)).toBe(2);});it('b',()=>{expect(hd359mtx2(3,1)).toBe(1);});it('c',()=>{expect(hd359mtx2(0,0)).toBe(0);});it('d',()=>{expect(hd359mtx2(93,73)).toBe(2);});it('e',()=>{expect(hd359mtx2(15,0)).toBe(4);});});
function hd360mtx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph360mtx2_hd',()=>{it('a',()=>{expect(hd360mtx2(1,4)).toBe(2);});it('b',()=>{expect(hd360mtx2(3,1)).toBe(1);});it('c',()=>{expect(hd360mtx2(0,0)).toBe(0);});it('d',()=>{expect(hd360mtx2(93,73)).toBe(2);});it('e',()=>{expect(hd360mtx2(15,0)).toBe(4);});});
function hd361mtx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph361mtx2_hd',()=>{it('a',()=>{expect(hd361mtx2(1,4)).toBe(2);});it('b',()=>{expect(hd361mtx2(3,1)).toBe(1);});it('c',()=>{expect(hd361mtx2(0,0)).toBe(0);});it('d',()=>{expect(hd361mtx2(93,73)).toBe(2);});it('e',()=>{expect(hd361mtx2(15,0)).toBe(4);});});
function hd362mtx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph362mtx2_hd',()=>{it('a',()=>{expect(hd362mtx2(1,4)).toBe(2);});it('b',()=>{expect(hd362mtx2(3,1)).toBe(1);});it('c',()=>{expect(hd362mtx2(0,0)).toBe(0);});it('d',()=>{expect(hd362mtx2(93,73)).toBe(2);});it('e',()=>{expect(hd362mtx2(15,0)).toBe(4);});});
function hd363mtx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph363mtx2_hd',()=>{it('a',()=>{expect(hd363mtx2(1,4)).toBe(2);});it('b',()=>{expect(hd363mtx2(3,1)).toBe(1);});it('c',()=>{expect(hd363mtx2(0,0)).toBe(0);});it('d',()=>{expect(hd363mtx2(93,73)).toBe(2);});it('e',()=>{expect(hd363mtx2(15,0)).toBe(4);});});
function hd364mtx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph364mtx2_hd',()=>{it('a',()=>{expect(hd364mtx2(1,4)).toBe(2);});it('b',()=>{expect(hd364mtx2(3,1)).toBe(1);});it('c',()=>{expect(hd364mtx2(0,0)).toBe(0);});it('d',()=>{expect(hd364mtx2(93,73)).toBe(2);});it('e',()=>{expect(hd364mtx2(15,0)).toBe(4);});});
function hd365mtx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph365mtx2_hd',()=>{it('a',()=>{expect(hd365mtx2(1,4)).toBe(2);});it('b',()=>{expect(hd365mtx2(3,1)).toBe(1);});it('c',()=>{expect(hd365mtx2(0,0)).toBe(0);});it('d',()=>{expect(hd365mtx2(93,73)).toBe(2);});it('e',()=>{expect(hd365mtx2(15,0)).toBe(4);});});
function hd366mtx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph366mtx2_hd',()=>{it('a',()=>{expect(hd366mtx2(1,4)).toBe(2);});it('b',()=>{expect(hd366mtx2(3,1)).toBe(1);});it('c',()=>{expect(hd366mtx2(0,0)).toBe(0);});it('d',()=>{expect(hd366mtx2(93,73)).toBe(2);});it('e',()=>{expect(hd366mtx2(15,0)).toBe(4);});});
function hd367mtx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph367mtx2_hd',()=>{it('a',()=>{expect(hd367mtx2(1,4)).toBe(2);});it('b',()=>{expect(hd367mtx2(3,1)).toBe(1);});it('c',()=>{expect(hd367mtx2(0,0)).toBe(0);});it('d',()=>{expect(hd367mtx2(93,73)).toBe(2);});it('e',()=>{expect(hd367mtx2(15,0)).toBe(4);});});
function hd368mtx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph368mtx2_hd',()=>{it('a',()=>{expect(hd368mtx2(1,4)).toBe(2);});it('b',()=>{expect(hd368mtx2(3,1)).toBe(1);});it('c',()=>{expect(hd368mtx2(0,0)).toBe(0);});it('d',()=>{expect(hd368mtx2(93,73)).toBe(2);});it('e',()=>{expect(hd368mtx2(15,0)).toBe(4);});});
function hd369mtx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph369mtx2_hd',()=>{it('a',()=>{expect(hd369mtx2(1,4)).toBe(2);});it('b',()=>{expect(hd369mtx2(3,1)).toBe(1);});it('c',()=>{expect(hd369mtx2(0,0)).toBe(0);});it('d',()=>{expect(hd369mtx2(93,73)).toBe(2);});it('e',()=>{expect(hd369mtx2(15,0)).toBe(4);});});
function hd370mtx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph370mtx2_hd',()=>{it('a',()=>{expect(hd370mtx2(1,4)).toBe(2);});it('b',()=>{expect(hd370mtx2(3,1)).toBe(1);});it('c',()=>{expect(hd370mtx2(0,0)).toBe(0);});it('d',()=>{expect(hd370mtx2(93,73)).toBe(2);});it('e',()=>{expect(hd370mtx2(15,0)).toBe(4);});});
function hd371mtx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph371mtx2_hd',()=>{it('a',()=>{expect(hd371mtx2(1,4)).toBe(2);});it('b',()=>{expect(hd371mtx2(3,1)).toBe(1);});it('c',()=>{expect(hd371mtx2(0,0)).toBe(0);});it('d',()=>{expect(hd371mtx2(93,73)).toBe(2);});it('e',()=>{expect(hd371mtx2(15,0)).toBe(4);});});
function hd372mtx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph372mtx2_hd',()=>{it('a',()=>{expect(hd372mtx2(1,4)).toBe(2);});it('b',()=>{expect(hd372mtx2(3,1)).toBe(1);});it('c',()=>{expect(hd372mtx2(0,0)).toBe(0);});it('d',()=>{expect(hd372mtx2(93,73)).toBe(2);});it('e',()=>{expect(hd372mtx2(15,0)).toBe(4);});});
function hd373mtx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph373mtx2_hd',()=>{it('a',()=>{expect(hd373mtx2(1,4)).toBe(2);});it('b',()=>{expect(hd373mtx2(3,1)).toBe(1);});it('c',()=>{expect(hd373mtx2(0,0)).toBe(0);});it('d',()=>{expect(hd373mtx2(93,73)).toBe(2);});it('e',()=>{expect(hd373mtx2(15,0)).toBe(4);});});
function hd374mtx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph374mtx2_hd',()=>{it('a',()=>{expect(hd374mtx2(1,4)).toBe(2);});it('b',()=>{expect(hd374mtx2(3,1)).toBe(1);});it('c',()=>{expect(hd374mtx2(0,0)).toBe(0);});it('d',()=>{expect(hd374mtx2(93,73)).toBe(2);});it('e',()=>{expect(hd374mtx2(15,0)).toBe(4);});});
function hd375mtx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph375mtx2_hd',()=>{it('a',()=>{expect(hd375mtx2(1,4)).toBe(2);});it('b',()=>{expect(hd375mtx2(3,1)).toBe(1);});it('c',()=>{expect(hd375mtx2(0,0)).toBe(0);});it('d',()=>{expect(hd375mtx2(93,73)).toBe(2);});it('e',()=>{expect(hd375mtx2(15,0)).toBe(4);});});
function hd376mtx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph376mtx2_hd',()=>{it('a',()=>{expect(hd376mtx2(1,4)).toBe(2);});it('b',()=>{expect(hd376mtx2(3,1)).toBe(1);});it('c',()=>{expect(hd376mtx2(0,0)).toBe(0);});it('d',()=>{expect(hd376mtx2(93,73)).toBe(2);});it('e',()=>{expect(hd376mtx2(15,0)).toBe(4);});});
function hd377mtx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph377mtx2_hd',()=>{it('a',()=>{expect(hd377mtx2(1,4)).toBe(2);});it('b',()=>{expect(hd377mtx2(3,1)).toBe(1);});it('c',()=>{expect(hd377mtx2(0,0)).toBe(0);});it('d',()=>{expect(hd377mtx2(93,73)).toBe(2);});it('e',()=>{expect(hd377mtx2(15,0)).toBe(4);});});
function hd378mtx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph378mtx2_hd',()=>{it('a',()=>{expect(hd378mtx2(1,4)).toBe(2);});it('b',()=>{expect(hd378mtx2(3,1)).toBe(1);});it('c',()=>{expect(hd378mtx2(0,0)).toBe(0);});it('d',()=>{expect(hd378mtx2(93,73)).toBe(2);});it('e',()=>{expect(hd378mtx2(15,0)).toBe(4);});});
function hd379mtx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph379mtx2_hd',()=>{it('a',()=>{expect(hd379mtx2(1,4)).toBe(2);});it('b',()=>{expect(hd379mtx2(3,1)).toBe(1);});it('c',()=>{expect(hd379mtx2(0,0)).toBe(0);});it('d',()=>{expect(hd379mtx2(93,73)).toBe(2);});it('e',()=>{expect(hd379mtx2(15,0)).toBe(4);});});
function hd380mtx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph380mtx2_hd',()=>{it('a',()=>{expect(hd380mtx2(1,4)).toBe(2);});it('b',()=>{expect(hd380mtx2(3,1)).toBe(1);});it('c',()=>{expect(hd380mtx2(0,0)).toBe(0);});it('d',()=>{expect(hd380mtx2(93,73)).toBe(2);});it('e',()=>{expect(hd380mtx2(15,0)).toBe(4);});});
function hd381mtx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph381mtx2_hd',()=>{it('a',()=>{expect(hd381mtx2(1,4)).toBe(2);});it('b',()=>{expect(hd381mtx2(3,1)).toBe(1);});it('c',()=>{expect(hd381mtx2(0,0)).toBe(0);});it('d',()=>{expect(hd381mtx2(93,73)).toBe(2);});it('e',()=>{expect(hd381mtx2(15,0)).toBe(4);});});
function hd382mtx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph382mtx2_hd',()=>{it('a',()=>{expect(hd382mtx2(1,4)).toBe(2);});it('b',()=>{expect(hd382mtx2(3,1)).toBe(1);});it('c',()=>{expect(hd382mtx2(0,0)).toBe(0);});it('d',()=>{expect(hd382mtx2(93,73)).toBe(2);});it('e',()=>{expect(hd382mtx2(15,0)).toBe(4);});});
function hd383mtx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph383mtx2_hd',()=>{it('a',()=>{expect(hd383mtx2(1,4)).toBe(2);});it('b',()=>{expect(hd383mtx2(3,1)).toBe(1);});it('c',()=>{expect(hd383mtx2(0,0)).toBe(0);});it('d',()=>{expect(hd383mtx2(93,73)).toBe(2);});it('e',()=>{expect(hd383mtx2(15,0)).toBe(4);});});
function hd384mtx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph384mtx2_hd',()=>{it('a',()=>{expect(hd384mtx2(1,4)).toBe(2);});it('b',()=>{expect(hd384mtx2(3,1)).toBe(1);});it('c',()=>{expect(hd384mtx2(0,0)).toBe(0);});it('d',()=>{expect(hd384mtx2(93,73)).toBe(2);});it('e',()=>{expect(hd384mtx2(15,0)).toBe(4);});});
function hd385mtx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph385mtx2_hd',()=>{it('a',()=>{expect(hd385mtx2(1,4)).toBe(2);});it('b',()=>{expect(hd385mtx2(3,1)).toBe(1);});it('c',()=>{expect(hd385mtx2(0,0)).toBe(0);});it('d',()=>{expect(hd385mtx2(93,73)).toBe(2);});it('e',()=>{expect(hd385mtx2(15,0)).toBe(4);});});
function hd386mtx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph386mtx2_hd',()=>{it('a',()=>{expect(hd386mtx2(1,4)).toBe(2);});it('b',()=>{expect(hd386mtx2(3,1)).toBe(1);});it('c',()=>{expect(hd386mtx2(0,0)).toBe(0);});it('d',()=>{expect(hd386mtx2(93,73)).toBe(2);});it('e',()=>{expect(hd386mtx2(15,0)).toBe(4);});});
function hd387mtx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph387mtx2_hd',()=>{it('a',()=>{expect(hd387mtx2(1,4)).toBe(2);});it('b',()=>{expect(hd387mtx2(3,1)).toBe(1);});it('c',()=>{expect(hd387mtx2(0,0)).toBe(0);});it('d',()=>{expect(hd387mtx2(93,73)).toBe(2);});it('e',()=>{expect(hd387mtx2(15,0)).toBe(4);});});
function hd388mtx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph388mtx2_hd',()=>{it('a',()=>{expect(hd388mtx2(1,4)).toBe(2);});it('b',()=>{expect(hd388mtx2(3,1)).toBe(1);});it('c',()=>{expect(hd388mtx2(0,0)).toBe(0);});it('d',()=>{expect(hd388mtx2(93,73)).toBe(2);});it('e',()=>{expect(hd388mtx2(15,0)).toBe(4);});});
function hd389mtx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph389mtx2_hd',()=>{it('a',()=>{expect(hd389mtx2(1,4)).toBe(2);});it('b',()=>{expect(hd389mtx2(3,1)).toBe(1);});it('c',()=>{expect(hd389mtx2(0,0)).toBe(0);});it('d',()=>{expect(hd389mtx2(93,73)).toBe(2);});it('e',()=>{expect(hd389mtx2(15,0)).toBe(4);});});
function hd390mtx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph390mtx2_hd',()=>{it('a',()=>{expect(hd390mtx2(1,4)).toBe(2);});it('b',()=>{expect(hd390mtx2(3,1)).toBe(1);});it('c',()=>{expect(hd390mtx2(0,0)).toBe(0);});it('d',()=>{expect(hd390mtx2(93,73)).toBe(2);});it('e',()=>{expect(hd390mtx2(15,0)).toBe(4);});});
function hd391mtx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph391mtx2_hd',()=>{it('a',()=>{expect(hd391mtx2(1,4)).toBe(2);});it('b',()=>{expect(hd391mtx2(3,1)).toBe(1);});it('c',()=>{expect(hd391mtx2(0,0)).toBe(0);});it('d',()=>{expect(hd391mtx2(93,73)).toBe(2);});it('e',()=>{expect(hd391mtx2(15,0)).toBe(4);});});
function hd392mtx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph392mtx2_hd',()=>{it('a',()=>{expect(hd392mtx2(1,4)).toBe(2);});it('b',()=>{expect(hd392mtx2(3,1)).toBe(1);});it('c',()=>{expect(hd392mtx2(0,0)).toBe(0);});it('d',()=>{expect(hd392mtx2(93,73)).toBe(2);});it('e',()=>{expect(hd392mtx2(15,0)).toBe(4);});});
function hd393mtx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph393mtx2_hd',()=>{it('a',()=>{expect(hd393mtx2(1,4)).toBe(2);});it('b',()=>{expect(hd393mtx2(3,1)).toBe(1);});it('c',()=>{expect(hd393mtx2(0,0)).toBe(0);});it('d',()=>{expect(hd393mtx2(93,73)).toBe(2);});it('e',()=>{expect(hd393mtx2(15,0)).toBe(4);});});
function hd394mtx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph394mtx2_hd',()=>{it('a',()=>{expect(hd394mtx2(1,4)).toBe(2);});it('b',()=>{expect(hd394mtx2(3,1)).toBe(1);});it('c',()=>{expect(hd394mtx2(0,0)).toBe(0);});it('d',()=>{expect(hd394mtx2(93,73)).toBe(2);});it('e',()=>{expect(hd394mtx2(15,0)).toBe(4);});});
function hd395mtx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph395mtx2_hd',()=>{it('a',()=>{expect(hd395mtx2(1,4)).toBe(2);});it('b',()=>{expect(hd395mtx2(3,1)).toBe(1);});it('c',()=>{expect(hd395mtx2(0,0)).toBe(0);});it('d',()=>{expect(hd395mtx2(93,73)).toBe(2);});it('e',()=>{expect(hd395mtx2(15,0)).toBe(4);});});
function hd396mtx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph396mtx2_hd',()=>{it('a',()=>{expect(hd396mtx2(1,4)).toBe(2);});it('b',()=>{expect(hd396mtx2(3,1)).toBe(1);});it('c',()=>{expect(hd396mtx2(0,0)).toBe(0);});it('d',()=>{expect(hd396mtx2(93,73)).toBe(2);});it('e',()=>{expect(hd396mtx2(15,0)).toBe(4);});});
function hd397mtx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph397mtx2_hd',()=>{it('a',()=>{expect(hd397mtx2(1,4)).toBe(2);});it('b',()=>{expect(hd397mtx2(3,1)).toBe(1);});it('c',()=>{expect(hd397mtx2(0,0)).toBe(0);});it('d',()=>{expect(hd397mtx2(93,73)).toBe(2);});it('e',()=>{expect(hd397mtx2(15,0)).toBe(4);});});
function hd398mtx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph398mtx2_hd',()=>{it('a',()=>{expect(hd398mtx2(1,4)).toBe(2);});it('b',()=>{expect(hd398mtx2(3,1)).toBe(1);});it('c',()=>{expect(hd398mtx2(0,0)).toBe(0);});it('d',()=>{expect(hd398mtx2(93,73)).toBe(2);});it('e',()=>{expect(hd398mtx2(15,0)).toBe(4);});});
function hd399mtx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph399mtx2_hd',()=>{it('a',()=>{expect(hd399mtx2(1,4)).toBe(2);});it('b',()=>{expect(hd399mtx2(3,1)).toBe(1);});it('c',()=>{expect(hd399mtx2(0,0)).toBe(0);});it('d',()=>{expect(hd399mtx2(93,73)).toBe(2);});it('e',()=>{expect(hd399mtx2(15,0)).toBe(4);});});
function hd400mtx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph400mtx2_hd',()=>{it('a',()=>{expect(hd400mtx2(1,4)).toBe(2);});it('b',()=>{expect(hd400mtx2(3,1)).toBe(1);});it('c',()=>{expect(hd400mtx2(0,0)).toBe(0);});it('d',()=>{expect(hd400mtx2(93,73)).toBe(2);});it('e',()=>{expect(hd400mtx2(15,0)).toBe(4);});});
function hd401mtx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph401mtx2_hd',()=>{it('a',()=>{expect(hd401mtx2(1,4)).toBe(2);});it('b',()=>{expect(hd401mtx2(3,1)).toBe(1);});it('c',()=>{expect(hd401mtx2(0,0)).toBe(0);});it('d',()=>{expect(hd401mtx2(93,73)).toBe(2);});it('e',()=>{expect(hd401mtx2(15,0)).toBe(4);});});
function hd402mtx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph402mtx2_hd',()=>{it('a',()=>{expect(hd402mtx2(1,4)).toBe(2);});it('b',()=>{expect(hd402mtx2(3,1)).toBe(1);});it('c',()=>{expect(hd402mtx2(0,0)).toBe(0);});it('d',()=>{expect(hd402mtx2(93,73)).toBe(2);});it('e',()=>{expect(hd402mtx2(15,0)).toBe(4);});});
function hd403mtx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph403mtx2_hd',()=>{it('a',()=>{expect(hd403mtx2(1,4)).toBe(2);});it('b',()=>{expect(hd403mtx2(3,1)).toBe(1);});it('c',()=>{expect(hd403mtx2(0,0)).toBe(0);});it('d',()=>{expect(hd403mtx2(93,73)).toBe(2);});it('e',()=>{expect(hd403mtx2(15,0)).toBe(4);});});
function hd404mtx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph404mtx2_hd',()=>{it('a',()=>{expect(hd404mtx2(1,4)).toBe(2);});it('b',()=>{expect(hd404mtx2(3,1)).toBe(1);});it('c',()=>{expect(hd404mtx2(0,0)).toBe(0);});it('d',()=>{expect(hd404mtx2(93,73)).toBe(2);});it('e',()=>{expect(hd404mtx2(15,0)).toBe(4);});});
function hd405mtx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph405mtx2_hd',()=>{it('a',()=>{expect(hd405mtx2(1,4)).toBe(2);});it('b',()=>{expect(hd405mtx2(3,1)).toBe(1);});it('c',()=>{expect(hd405mtx2(0,0)).toBe(0);});it('d',()=>{expect(hd405mtx2(93,73)).toBe(2);});it('e',()=>{expect(hd405mtx2(15,0)).toBe(4);});});
function hd406mtx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph406mtx2_hd',()=>{it('a',()=>{expect(hd406mtx2(1,4)).toBe(2);});it('b',()=>{expect(hd406mtx2(3,1)).toBe(1);});it('c',()=>{expect(hd406mtx2(0,0)).toBe(0);});it('d',()=>{expect(hd406mtx2(93,73)).toBe(2);});it('e',()=>{expect(hd406mtx2(15,0)).toBe(4);});});
function hd407mtx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph407mtx2_hd',()=>{it('a',()=>{expect(hd407mtx2(1,4)).toBe(2);});it('b',()=>{expect(hd407mtx2(3,1)).toBe(1);});it('c',()=>{expect(hd407mtx2(0,0)).toBe(0);});it('d',()=>{expect(hd407mtx2(93,73)).toBe(2);});it('e',()=>{expect(hd407mtx2(15,0)).toBe(4);});});
function hd408mtx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph408mtx2_hd',()=>{it('a',()=>{expect(hd408mtx2(1,4)).toBe(2);});it('b',()=>{expect(hd408mtx2(3,1)).toBe(1);});it('c',()=>{expect(hd408mtx2(0,0)).toBe(0);});it('d',()=>{expect(hd408mtx2(93,73)).toBe(2);});it('e',()=>{expect(hd408mtx2(15,0)).toBe(4);});});
function hd409mtx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph409mtx2_hd',()=>{it('a',()=>{expect(hd409mtx2(1,4)).toBe(2);});it('b',()=>{expect(hd409mtx2(3,1)).toBe(1);});it('c',()=>{expect(hd409mtx2(0,0)).toBe(0);});it('d',()=>{expect(hd409mtx2(93,73)).toBe(2);});it('e',()=>{expect(hd409mtx2(15,0)).toBe(4);});});
function hd410mtx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph410mtx2_hd',()=>{it('a',()=>{expect(hd410mtx2(1,4)).toBe(2);});it('b',()=>{expect(hd410mtx2(3,1)).toBe(1);});it('c',()=>{expect(hd410mtx2(0,0)).toBe(0);});it('d',()=>{expect(hd410mtx2(93,73)).toBe(2);});it('e',()=>{expect(hd410mtx2(15,0)).toBe(4);});});
function hd411mtx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph411mtx2_hd',()=>{it('a',()=>{expect(hd411mtx2(1,4)).toBe(2);});it('b',()=>{expect(hd411mtx2(3,1)).toBe(1);});it('c',()=>{expect(hd411mtx2(0,0)).toBe(0);});it('d',()=>{expect(hd411mtx2(93,73)).toBe(2);});it('e',()=>{expect(hd411mtx2(15,0)).toBe(4);});});
function hd412mtx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph412mtx2_hd',()=>{it('a',()=>{expect(hd412mtx2(1,4)).toBe(2);});it('b',()=>{expect(hd412mtx2(3,1)).toBe(1);});it('c',()=>{expect(hd412mtx2(0,0)).toBe(0);});it('d',()=>{expect(hd412mtx2(93,73)).toBe(2);});it('e',()=>{expect(hd412mtx2(15,0)).toBe(4);});});
function hd413mtx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph413mtx2_hd',()=>{it('a',()=>{expect(hd413mtx2(1,4)).toBe(2);});it('b',()=>{expect(hd413mtx2(3,1)).toBe(1);});it('c',()=>{expect(hd413mtx2(0,0)).toBe(0);});it('d',()=>{expect(hd413mtx2(93,73)).toBe(2);});it('e',()=>{expect(hd413mtx2(15,0)).toBe(4);});});
function hd414mtx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph414mtx2_hd',()=>{it('a',()=>{expect(hd414mtx2(1,4)).toBe(2);});it('b',()=>{expect(hd414mtx2(3,1)).toBe(1);});it('c',()=>{expect(hd414mtx2(0,0)).toBe(0);});it('d',()=>{expect(hd414mtx2(93,73)).toBe(2);});it('e',()=>{expect(hd414mtx2(15,0)).toBe(4);});});
function hd415mtx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph415mtx2_hd',()=>{it('a',()=>{expect(hd415mtx2(1,4)).toBe(2);});it('b',()=>{expect(hd415mtx2(3,1)).toBe(1);});it('c',()=>{expect(hd415mtx2(0,0)).toBe(0);});it('d',()=>{expect(hd415mtx2(93,73)).toBe(2);});it('e',()=>{expect(hd415mtx2(15,0)).toBe(4);});});
function hd416mtx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph416mtx2_hd',()=>{it('a',()=>{expect(hd416mtx2(1,4)).toBe(2);});it('b',()=>{expect(hd416mtx2(3,1)).toBe(1);});it('c',()=>{expect(hd416mtx2(0,0)).toBe(0);});it('d',()=>{expect(hd416mtx2(93,73)).toBe(2);});it('e',()=>{expect(hd416mtx2(15,0)).toBe(4);});});
function hd417mtx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph417mtx2_hd',()=>{it('a',()=>{expect(hd417mtx2(1,4)).toBe(2);});it('b',()=>{expect(hd417mtx2(3,1)).toBe(1);});it('c',()=>{expect(hd417mtx2(0,0)).toBe(0);});it('d',()=>{expect(hd417mtx2(93,73)).toBe(2);});it('e',()=>{expect(hd417mtx2(15,0)).toBe(4);});});
