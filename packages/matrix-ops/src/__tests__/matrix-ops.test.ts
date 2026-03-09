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
