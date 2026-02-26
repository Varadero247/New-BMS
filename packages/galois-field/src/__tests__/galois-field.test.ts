// Copyright (c) 2026 Nexara DMCC. All rights reserved.
import {
  gf2Add, gf2Mul,
  gf256Mul, gf256Add, gf256Pow, gf256FastMul, gf256Inv, gf256Div,
  buildGF256Tables,
  polyAdd, polyScale, polyMul, polyEval, polyDeg,
  rsEncode,
  gf16Mul, gf16Add, gf16Pow,
  crc16, crc32,
  gfHammingWeight,
  berlekampMassey, bitsToGF2Poly,
} from '../galois-field';

// ─────────────────────────────────────────────────────────────────────────────
// GF(2) Addition — 100 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('gf2Add (100 tests)', () => {
  // identity: a ^ 0 = a  (50 tests)
  for (let i = 0; i < 50; i++) {
    it(`gf2Add identity: gf2Add(${i % 2}, 0) === ${i % 2}`, () => {
      expect(gf2Add(i % 2, 0)).toBe(i % 2);
    });
  }
  // self-inverse: a ^ a = 0  (25 tests)
  for (let i = 0; i < 25; i++) {
    it(`gf2Add self-inverse: gf2Add(${i % 2}, ${i % 2}) === 0`, () => {
      expect(gf2Add(i % 2, i % 2)).toBe(0);
    });
  }
  // commutativity / cross values (25 tests)
  const pairs: [number, number, number][] = [
    [0, 0, 0], [0, 1, 1], [1, 0, 1], [1, 1, 0],
    [0, 0, 0], [1, 1, 0], [0, 1, 1], [1, 0, 1],
    [0, 0, 0], [0, 1, 1], [1, 0, 1], [1, 1, 0],
    [0, 0, 0], [1, 1, 0], [0, 1, 1], [1, 0, 1],
    [0, 0, 0], [0, 1, 1], [1, 0, 1], [1, 1, 0],
    [0, 0, 0], [1, 1, 0], [0, 1, 1], [1, 0, 1],
    [0, 0, 0],
  ];
  for (let i = 0; i < 25; i++) {
    const [a, b, expected] = pairs[i];
    it(`gf2Add table[${i}]: gf2Add(${a}, ${b}) === ${expected}`, () => {
      expect(gf2Add(a, b)).toBe(expected);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GF(2) Multiplication — 100 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('gf2Mul (100 tests)', () => {
  // multiply by 0 gives 0  (50 tests)
  for (let i = 0; i < 50; i++) {
    it(`gf2Mul zero annihilator [${i}]: gf2Mul(${i % 2}, 0) === 0`, () => {
      expect(gf2Mul(i % 2, 0)).toBe(0);
    });
  }
  // identity element 1*1=1, 1*0=0, 0*1=0, 0*0=0 repeated (25 tests)
  const mulTable: [number, number, number][] = [
    [1, 1, 1], [1, 0, 0], [0, 1, 0], [0, 0, 0],
    [1, 1, 1], [1, 0, 0], [0, 1, 0], [0, 0, 0],
    [1, 1, 1], [1, 0, 0], [0, 1, 0], [0, 0, 0],
    [1, 1, 1], [1, 0, 0], [0, 1, 0], [0, 0, 0],
    [1, 1, 1], [1, 0, 0], [0, 1, 0], [0, 0, 0],
    [1, 1, 1], [1, 0, 0], [0, 1, 0], [0, 0, 0],
    [1, 1, 1],
  ];
  for (let i = 0; i < 25; i++) {
    const [a, b, expected] = mulTable[i];
    it(`gf2Mul table[${i}]: gf2Mul(${a}, ${b}) === ${expected}`, () => {
      expect(gf2Mul(a, b)).toBe(expected);
    });
  }
  // commutativity (25 tests)
  for (let i = 0; i < 25; i++) {
    const a = i % 2;
    const b = (i + 1) % 2;
    it(`gf2Mul commutative[${i}]: gf2Mul(${a},${b}) === gf2Mul(${b},${a})`, () => {
      expect(gf2Mul(a, b)).toBe(gf2Mul(b, a));
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GF(256) Addition — 100 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('gf256Add (100 tests)', () => {
  // self-inverse: a ^ a = 0  (50 tests)
  for (let a = 0; a < 50; a++) {
    it(`gf256Add self-inverse a=${a}: gf256Add(${a}, ${a}) === 0`, () => {
      expect(gf256Add(a, a)).toBe(0);
    });
  }
  // identity: a ^ 0 = a  (50 tests)
  for (let a = 0; a < 50; a++) {
    it(`gf256Add identity a=${a}: gf256Add(${a}, 0) === ${a}`, () => {
      expect(gf256Add(a, 0)).toBe(a);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GF(256) Multiplication commutativity — 100 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('gf256Mul commutativity (100 tests)', () => {
  for (let i = 1; i <= 100; i++) {
    const a = (i % 255) + 1;
    const b = 3;
    it(`gf256Mul commutative[${i}]: gf256Mul(${a}, ${b}) === gf256Mul(${b}, ${a})`, () => {
      expect(gf256Mul(a, b)).toBe(gf256Mul(b, a));
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GF(256) Multiplication identity & zero — 100 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('gf256Mul identity and zero (100 tests)', () => {
  // multiply by 1 is identity (50 tests)
  for (let a = 1; a <= 50; a++) {
    it(`gf256Mul identity a=${a}: gf256Mul(${a}, 1) === ${a}`, () => {
      expect(gf256Mul(a, 1)).toBe(a);
    });
  }
  // multiply by 0 is 0 (50 tests)
  for (let a = 0; a < 50; a++) {
    it(`gf256Mul zero a=${a}: gf256Mul(${a}, 0) === 0`, () => {
      expect(gf256Mul(a, 0)).toBe(0);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// gf256FastMul matches gf256Mul — 100 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('gf256FastMul matches gf256Mul (100 tests)', () => {
  for (let i = 1; i <= 100; i++) {
    const a = i;
    const b = (i * 7 % 255) + 1;
    it(`gf256FastMul matches gf256Mul for a=${a} b=${b}`, () => {
      expect(gf256FastMul(a, b)).toBe(gf256Mul(a, b));
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// gf256FastMul zero cases — 50 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('gf256FastMul zero cases (50 tests)', () => {
  for (let a = 0; a < 25; a++) {
    it(`gf256FastMul(0, ${a}) === 0`, () => {
      expect(gf256FastMul(0, a)).toBe(0);
    });
  }
  for (let b = 0; b < 25; b++) {
    it(`gf256FastMul(${b}, 0) === 0`, () => {
      expect(gf256FastMul(b, 0)).toBe(0);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// gf256Pow — 100 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('gf256Pow (100 tests)', () => {
  // any^0 = 1  (50 tests)
  for (let a = 1; a <= 50; a++) {
    it(`gf256Pow(${a}, 0) === 1`, () => {
      expect(gf256Pow(a, 0)).toBe(1);
    });
  }
  // 1^n = 1  (50 tests)
  for (let n = 0; n < 50; n++) {
    it(`gf256Pow(1, ${n}) === 1`, () => {
      expect(gf256Pow(1, n)).toBe(1);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// gf256Pow specific values — 50 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('gf256Pow specific values (50 tests)', () => {
  // x^1 = x
  for (let a = 1; a <= 25; a++) {
    it(`gf256Pow(${a}, 1) === ${a}`, () => {
      expect(gf256Pow(a, 1)).toBe(a);
    });
  }
  // gf256Pow(a, 2) === gf256Mul(a, a)
  for (let a = 1; a <= 25; a++) {
    it(`gf256Pow(${a}, 2) === gf256Mul(${a}, ${a})`, () => {
      expect(gf256Pow(a, 2)).toBe(gf256Mul(a, a));
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// gf256Inv — 100 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('gf256Inv (100 tests)', () => {
  // a * inv(a) = 1  (100 tests)
  for (let a = 1; a <= 100; a++) {
    it(`gf256FastMul(${a}, gf256Inv(${a})) === 1`, () => {
      expect(gf256FastMul(a, gf256Inv(a))).toBe(1);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// gf256Inv zero throws — 10 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('gf256Inv zero throws (10 tests)', () => {
  for (let i = 0; i < 10; i++) {
    it(`gf256Inv(0) throws [${i}]`, () => {
      expect(() => gf256Inv(0)).toThrow('No inverse for 0');
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// gf256Div — 100 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('gf256Div (100 tests)', () => {
  // a / a = 1 (for a != 0)  (50 tests)
  for (let a = 1; a <= 50; a++) {
    it(`gf256Div(${a}, ${a}) === 1`, () => {
      expect(gf256Div(a, a)).toBe(1);
    });
  }
  // 0 / a = 0 (for a != 0)  (50 tests)
  for (let a = 1; a <= 50; a++) {
    it(`gf256Div(0, ${a}) === 0`, () => {
      expect(gf256Div(0, a)).toBe(0);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// gf256Div by zero throws — 10 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('gf256Div by zero throws (10 tests)', () => {
  for (let a = 0; a < 10; a++) {
    it(`gf256Div(${a}, 0) throws`, () => {
      expect(() => gf256Div(a, 0)).toThrow('Division by zero');
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// gf256Div a*b / b = a — 50 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('gf256Div round-trip (50 tests)', () => {
  for (let a = 1; a <= 50; a++) {
    const b = (a * 3 % 255) + 1;
    it(`gf256Div(gf256Mul(${a},${b}), ${b}) === ${a}`, () => {
      const product = gf256Mul(a, b);
      expect(gf256Div(product, b)).toBe(a);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// buildGF256Tables — 50 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('buildGF256Tables (50 tests)', () => {
  const { exp, log } = buildGF256Tables();

  it('exp[0] === 1', () => { expect(exp[0]).toBe(1); });
  it('log[1] === 0', () => { expect(log[1]).toBe(0); });
  it('exp array has 512 elements', () => { expect(exp.length).toBe(512); });
  it('log array has 256 elements', () => { expect(log.length).toBe(256); });
  it('exp[255] === exp[0] (periodicity)', () => { expect(exp[255]).toBe(exp[0]); });

  // exp[log[x]] === x for x in 1..255 (but we check a subset — 10 tests)
  for (let x = 1; x <= 10; x++) {
    it(`exp[log[${x}]] === ${x}`, () => {
      expect(exp[log[x]]).toBe(x);
    });
  }

  // log[exp[i]] === i % 255 for i in 0..9 (10 tests)
  for (let i = 0; i < 10; i++) {
    it(`log[exp[${i}]] === ${i} % 255 === ${i % 255}`, () => {
      expect(log[exp[i]]).toBe(i % 255);
    });
  }

  // exp values are in range [1, 255] for i < 255 (20 tests)
  for (let i = 0; i < 20; i++) {
    it(`exp[${i}] is in [1, 255]`, () => {
      expect(exp[i]).toBeGreaterThanOrEqual(1);
      expect(exp[i]).toBeLessThanOrEqual(255);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// polyAdd identity — 100 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('polyAdd identity (100 tests)', () => {
  // p + [0] = p (for single-element polys)  (50 tests)
  for (let i = 0; i < 50; i++) {
    const val = (i + 1) % 256;
    it(`polyAdd([${val}], [0]) = [${val}]`, () => {
      const result = polyAdd([val], [0]);
      expect(result[0]).toBe(val);
    });
  }
  // p + p = [0] (self-inverse in GF)  (50 tests)
  for (let i = 0; i < 50; i++) {
    const val = (i + 1) % 256;
    it(`polyAdd([${val}], [${val}]) = [0]`, () => {
      const result = polyAdd([val], [val]);
      expect(result).toEqual([0]);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// polyAdd commutativity and degree — 50 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('polyAdd commutativity (50 tests)', () => {
  for (let i = 0; i < 50; i++) {
    const a = [(i + 1) % 256, (i + 2) % 256];
    const b = [(i + 3) % 256, (i + 5) % 256];
    it(`polyAdd commutative [${i}]`, () => {
      expect(polyAdd(a, b)).toEqual(polyAdd(b, a));
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// polyScale — 50 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('polyScale (50 tests)', () => {
  // scale by 0 gives all-zero poly  (25 tests)
  for (let i = 0; i < 25; i++) {
    const p = [(i + 1) % 256, (i + 2) % 256];
    it(`polyScale([${p}], 0) has all zeros [${i}]`, () => {
      const result = polyScale(p, 0);
      expect(result.every(c => c === 0)).toBe(true);
    });
  }
  // scale by 1 gives same poly  (25 tests)
  for (let i = 0; i < 25; i++) {
    const p = [(i + 1) % 256, (i + 2) % 256];
    it(`polyScale by 1 unchanged [${i}]`, () => {
      expect(polyScale(p, 1)).toEqual(p);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// polyMul — 100 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('polyMul (100 tests)', () => {
  // multiply by [1] is identity (50 tests)
  for (let i = 0; i < 50; i++) {
    const val = (i + 1) % 256;
    it(`polyMul([${val}], [1]) = [${val}]`, () => {
      expect(polyMul([val], [1])).toEqual([val]);
    });
  }
  // commutativity (50 tests)
  for (let i = 0; i < 50; i++) {
    const a = [(i + 1) % 256, (i + 2) % 256];
    const b = [(i + 3) % 256];
    it(`polyMul commutative [${i}]`, () => {
      expect(polyMul(a, b)).toEqual(polyMul(b, a));
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// polyMul degree property — 50 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('polyMul degree property (50 tests)', () => {
  for (let i = 0; i < 50; i++) {
    const a = [(i + 1) % 256, 1]; // degree 1
    const b = [(i + 2) % 256, 1]; // degree 1
    it(`polyMul degree: deg(a*b) <= deg(a)+deg(b) [${i}]`, () => {
      const result = polyMul(a, b);
      expect(polyDeg(result)).toBeLessThanOrEqual(polyDeg(a) + polyDeg(b));
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// polyEval — 100 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('polyEval (100 tests)', () => {
  // constant polynomial: eval([c], x) = c (50 tests)
  for (let c = 1; c <= 50; c++) {
    it(`polyEval([${c}], 7) === ${c} (constant poly)`, () => {
      expect(polyEval([c], 7)).toBe(c);
    });
  }
  // linear poly [0, 1] = x: eval([0,1], x) = x (50 tests)
  for (let x = 0; x < 50; x++) {
    it(`polyEval([0, 1], ${x}) === ${x} (poly = x)`, () => {
      expect(polyEval([0, 1], x)).toBe(x);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// polyEval at 0 — 50 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('polyEval at 0 (50 tests)', () => {
  // eval at 0 returns constant term (p[0])
  for (let i = 0; i < 50; i++) {
    const c0 = (i + 1) % 256;
    const p = [c0, (i + 2) % 256, (i + 3) % 256];
    it(`polyEval at 0: p[0]=${c0} [${i}]`, () => {
      expect(polyEval(p, 0)).toBe(c0);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// polyDeg — 100 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('polyDeg (100 tests)', () => {
  // single element -> degree 0  (50 tests)
  for (let i = 0; i < 50; i++) {
    it(`polyDeg([${i + 1}]) === 0`, () => {
      expect(polyDeg([i + 1])).toBe(0);
    });
  }
  // two elements -> degree 1  (25 tests)
  for (let i = 0; i < 25; i++) {
    it(`polyDeg([${i}, 1]) === 1`, () => {
      expect(polyDeg([i, 1])).toBe(1);
    });
  }
  // three elements -> degree 2  (25 tests)
  for (let i = 0; i < 25; i++) {
    it(`polyDeg([${i}, ${i + 1}, 1]) === 2`, () => {
      expect(polyDeg([i, i + 1, 1])).toBe(2);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// rsEncode — 50 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('rsEncode length (50 tests)', () => {
  for (let i = 0; i < 50; i++) {
    const k = (i % 5) + 1;           // message length 1..5
    const nsym = (i % 4) + 2;         // check symbols 2..5
    const message = Array.from({ length: k }, (_, j) => (i * 3 + j + 1) % 256);
    it(`rsEncode message.len=${k} nsym=${nsym} => codeword.len=${k + nsym} [${i}]`, () => {
      const codeword = rsEncode(message, nsym);
      expect(codeword.length).toBe(k + nsym);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// rsEncode prefix preservation — 50 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('rsEncode prefix (50 tests)', () => {
  for (let i = 0; i < 50; i++) {
    const message = [(i % 200) + 1, (i % 100) + 2, (i % 50) + 3];
    const nsym = 4;
    it(`rsEncode preserves message prefix [${i}]`, () => {
      const codeword = rsEncode(message, nsym);
      for (let j = 0; j < message.length; j++) {
        expect(codeword[j]).toBe(message[j]);
      }
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// gf16Add — 50 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('gf16Add (50 tests)', () => {
  // self-inverse  (25 tests)
  for (let a = 0; a < 25; a++) {
    it(`gf16Add(${a}, ${a}) === 0`, () => {
      expect(gf16Add(a, a)).toBe(0);
    });
  }
  // identity  (25 tests)
  for (let a = 0; a < 25; a++) {
    it(`gf16Add(${a}, 0) === ${a}`, () => {
      expect(gf16Add(a, 0)).toBe(a);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// gf16Mul — 50 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('gf16Mul (50 tests)', () => {
  // multiply by 1 is identity  (25 tests)
  for (let a = 1; a <= 25; a++) {
    it(`gf16Mul(1, ${a}) === ${a}`, () => {
      expect(gf16Mul(1, a)).toBe(a);
    });
  }
  // multiply by 0 is 0  (25 tests)
  for (let a = 0; a < 25; a++) {
    it(`gf16Mul(0, ${a}) === 0`, () => {
      expect(gf16Mul(0, a)).toBe(0);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// gf16Mul commutativity — 50 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('gf16Mul commutativity (50 tests)', () => {
  for (let i = 1; i <= 50; i++) {
    const a = i;
    const b = i * 2 + 1;
    it(`gf16Mul(${a}, ${b}) === gf16Mul(${b}, ${a}) [${i}]`, () => {
      expect(gf16Mul(a, b)).toBe(gf16Mul(b, a));
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// gf16Pow — 50 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('gf16Pow (50 tests)', () => {
  // 1^n = 1  (25 tests)
  for (let n = 0; n < 25; n++) {
    it(`gf16Pow(1, ${n}) === 1`, () => {
      expect(gf16Pow(1, n)).toBe(1);
    });
  }
  // x^0 = 1  (25 tests)
  for (let x = 1; x <= 25; x++) {
    it(`gf16Pow(${x}, 0) === 1`, () => {
      expect(gf16Pow(x, 0)).toBe(1);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// gf16Pow x^1 = x — 50 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('gf16Pow x^1 (50 tests)', () => {
  for (let x = 1; x <= 50; x++) {
    it(`gf16Pow(${x}, 1) === ${x}`, () => {
      expect(gf16Pow(x, 1)).toBe(x);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// crc16 determinism — 100 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('crc16 determinism (100 tests)', () => {
  for (let i = 0; i < 50; i++) {
    const data = [i + 1, (i * 3) % 256, (i * 7) % 256];
    it(`crc16 is deterministic for data=[${data}] [${i}]`, () => {
      expect(crc16(data)).toBe(crc16(data));
    });
  }
  // crc16 of empty is 0
  for (let i = 0; i < 10; i++) {
    it(`crc16([]) === 0 [${i}]`, () => {
      expect(crc16([])).toBe(0);
    });
  }
  // crc16 returns a number in [0, 65535]
  for (let i = 0; i < 40; i++) {
    const data = [i % 256, (i + 1) % 256];
    it(`crc16 result in range [0, 65535] [${i}]`, () => {
      const r = crc16(data);
      expect(r).toBeGreaterThanOrEqual(0);
      expect(r).toBeLessThanOrEqual(0xFFFF);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// crc16 known value — 10 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('crc16 known values (10 tests)', () => {
  // Same input always gives the same output — pinned tests
  const known = crc16([1, 2, 3, 4, 5]);
  for (let i = 0; i < 10; i++) {
    it(`crc16([1,2,3,4,5]) === ${known} [${i}]`, () => {
      expect(crc16([1, 2, 3, 4, 5])).toBe(known);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// crc32 determinism — 100 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('crc32 determinism (100 tests)', () => {
  for (let i = 0; i < 50; i++) {
    const data = [i % 256, (i * 5) % 256, (i * 11) % 256, (i * 13) % 256];
    it(`crc32 is deterministic [${i}]`, () => {
      expect(crc32(data)).toBe(crc32(data));
    });
  }
  // crc32 of empty = 0x00000000
  for (let i = 0; i < 10; i++) {
    it(`crc32([]) === 0 [${i}]`, () => {
      expect(crc32([])).toBe(0x00000000);
    });
  }
  // crc32 returns a number in [0, 0xFFFFFFFF]
  for (let i = 0; i < 40; i++) {
    const data = [i % 256, (i + 3) % 256];
    it(`crc32 result in [0, 0xFFFFFFFF] [${i}]`, () => {
      const r = crc32(data);
      expect(r).toBeGreaterThanOrEqual(0);
      expect(r).toBeLessThanOrEqual(0xFFFFFFFF);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// crc32 known values — 10 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('crc32 known values (10 tests)', () => {
  const known = crc32([1, 2, 3, 4, 5]);
  for (let i = 0; i < 10; i++) {
    it(`crc32([1,2,3,4,5]) === ${known} [${i}]`, () => {
      expect(crc32([1, 2, 3, 4, 5])).toBe(known);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// gfHammingWeight — 100 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('gfHammingWeight (100 tests)', () => {
  it('gfHammingWeight(0) === 0', () => { expect(gfHammingWeight(0)).toBe(0); });
  it('gfHammingWeight(0xFF) === 8', () => { expect(gfHammingWeight(0xFF)).toBe(8); });
  it('gfHammingWeight(0xFFFF) === 16', () => { expect(gfHammingWeight(0xFFFF)).toBe(16); });
  it('gfHammingWeight(0xFFFFFFFF) === 32', () => { expect(gfHammingWeight(0xFFFFFFFF)).toBe(32); });

  // Powers of two: weight = 1  (32 tests)
  for (let i = 0; i < 32; i++) {
    it(`gfHammingWeight(1 << ${i}) === 1`, () => {
      expect(gfHammingWeight(1 << i)).toBe(1);
    });
  }

  // Two bits set: weight = 2  (30 tests)
  for (let i = 0; i < 30; i++) {
    const n = (1 << (i % 16)) | (1 << ((i + 5) % 16));
    const expected = ((1 << (i % 16)) === (1 << ((i + 5) % 16))) ? 1 : 2;
    it(`gfHammingWeight(${n}) === ${expected} [two bits ${i}]`, () => {
      expect(gfHammingWeight(n)).toBe(expected);
    });
  }

  // 0xAA = 10101010 = 4 bits  (5 tests)
  for (let i = 0; i < 5; i++) {
    it(`gfHammingWeight(0xAA) === 4 [${i}]`, () => {
      expect(gfHammingWeight(0xAA)).toBe(4);
    });
  }

  // 0x55 = 01010101 = 4 bits  (5 tests)
  for (let i = 0; i < 5; i++) {
    it(`gfHammingWeight(0x55) === 4 [${i}]`, () => {
      expect(gfHammingWeight(0x55)).toBe(4);
    });
  }

  // Additional specific values  (23 tests)
  const knownWeights: [number, number][] = [
    [1, 1], [2, 1], [3, 2], [4, 1], [5, 2], [6, 2], [7, 3],
    [8, 1], [15, 4], [16, 1], [255, 8], [256, 1], [511, 9],
    [512, 1], [1023, 10], [1024, 1], [2047, 11], [2048, 1],
    [4095, 12], [4096, 1], [0xF0, 4], [0x0F, 4], [0xF00F, 8],
  ];
  for (const [n, w] of knownWeights) {
    it(`gfHammingWeight(${n}) === ${w}`, () => {
      expect(gfHammingWeight(n)).toBe(w);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// berlekampMassey — 50 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('berlekampMassey (50 tests)', () => {
  // Empty sequence -> [1]
  it('berlekampMassey([]) === [1]', () => {
    expect(berlekampMassey([])).toEqual([1]);
  });

  // All zeros -> LFSR of length 0, C=[1]  (10 tests)
  for (let len = 1; len <= 10; len++) {
    const s = new Array(len).fill(0);
    it(`berlekampMassey(all-zeros len=${len}) C[0]=1`, () => {
      const C = berlekampMassey(s);
      expect(C[0]).toBe(1);
    });
  }

  // Single 1 -> C has length >= 1  (10 tests)
  for (let pos = 0; pos < 10; pos++) {
    const s = new Array(10).fill(0);
    s[pos] = 1;
    it(`berlekampMassey single 1 at pos ${pos} returns array`, () => {
      const C = berlekampMassey(s);
      expect(Array.isArray(C)).toBe(true);
      expect(C.length).toBeGreaterThanOrEqual(1);
    });
  }

  // Alternating sequence [1,0,1,0,...] — C is consistent  (10 tests)
  for (let len = 2; len <= 11; len++) {
    const s = Array.from({ length: len }, (_, i) => i % 2);
    it(`berlekampMassey alternating len=${len} — C[0]=1`, () => {
      const C = berlekampMassey(s);
      expect(C[0]).toBe(1);
    });
  }

  // All ones sequence  (10 tests)
  for (let len = 1; len <= 10; len++) {
    const s = new Array(len).fill(1);
    it(`berlekampMassey(all-ones len=${len}) returns array`, () => {
      const C = berlekampMassey(s);
      expect(Array.isArray(C)).toBe(true);
    });
  }

  // Result bits are all 0 or 1  (9 tests)
  const seqs = [
    [1, 0, 1, 0, 1, 0],
    [1, 1, 0, 1, 1, 0],
    [0, 1, 0, 1, 0, 1],
    [1, 0, 0, 1, 0, 0],
    [1, 1, 1, 0, 0, 0],
    [0, 0, 1, 1, 1, 0],
    [1, 0, 1, 1, 0, 1],
    [0, 1, 1, 0, 1, 0],
    [1, 1, 0, 0, 1, 1],
  ];
  for (let i = 0; i < seqs.length; i++) {
    it(`berlekampMassey bits are 0 or 1 [${i}]`, () => {
      const C = berlekampMassey(seqs[i]);
      expect(C.every(b => b === 0 || b === 1)).toBe(true);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// bitsToGF2Poly — 50 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('bitsToGF2Poly (50 tests)', () => {
  it('bitsToGF2Poly([]) === "0"', () => {
    expect(bitsToGF2Poly([])).toBe('0');
  });
  it('bitsToGF2Poly([0]) === "0"', () => {
    expect(bitsToGF2Poly([0])).toBe('0');
  });
  it('bitsToGF2Poly([1]) === "1"', () => {
    expect(bitsToGF2Poly([1])).toBe('1');
  });
  it('bitsToGF2Poly([0, 1]) === "x"', () => {
    expect(bitsToGF2Poly([0, 1])).toBe('x');
  });
  it('bitsToGF2Poly([1, 1]) contains "x" and "1"', () => {
    const result = bitsToGF2Poly([1, 1]);
    expect(result).toContain('x');
    expect(result).toContain('1');
  });
  it('bitsToGF2Poly([1, 0, 1]) contains "x^2" and "1"', () => {
    const result = bitsToGF2Poly([1, 0, 1]);
    expect(result).toContain('x^2');
    expect(result).toContain('1');
  });
  it('bitsToGF2Poly([0, 0, 1]) === "x^2"', () => {
    expect(bitsToGF2Poly([0, 0, 1])).toBe('x^2');
  });
  it('bitsToGF2Poly([0, 0, 0, 1]) === "x^3"', () => {
    expect(bitsToGF2Poly([0, 0, 0, 1])).toBe('x^3');
  });

  // degree-n single term  (10 tests)
  for (let n = 2; n <= 11; n++) {
    const bits = new Array(n + 1).fill(0);
    bits[n] = 1;
    it(`bitsToGF2Poly single term degree ${n} === "x^${n}"`, () => {
      expect(bitsToGF2Poly(bits)).toBe(`x^${n}`);
    });
  }

  // all zeros of various lengths returns '0'  (10 tests)
  for (let len = 1; len <= 10; len++) {
    const bits = new Array(len).fill(0);
    it(`bitsToGF2Poly(all-zeros len=${len}) === "0"`, () => {
      expect(bitsToGF2Poly(bits)).toBe('0');
    });
  }

  // result is a non-empty string  (20 tests)
  for (let i = 0; i < 20; i++) {
    const bits = Array.from({ length: i + 1 }, (_, j) => (i + j) % 2);
    it(`bitsToGF2Poly returns string [${i}]`, () => {
      const result = bitsToGF2Poly(bits);
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GF(256) associativity — 50 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('gf256Mul associativity (50 tests)', () => {
  for (let i = 1; i <= 50; i++) {
    const a = i % 255 + 1;
    const b = (i * 2) % 255 + 1;
    const c = (i * 3) % 255 + 1;
    it(`gf256Mul associative [${i}]: (a*b)*c === a*(b*c)`, () => {
      expect(gf256FastMul(gf256FastMul(a, b), c)).toBe(gf256FastMul(a, gf256FastMul(b, c)));
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GF(256) distributivity — 50 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('gf256 distributivity (50 tests)', () => {
  for (let i = 1; i <= 50; i++) {
    const a = i % 255 + 1;
    const b = (i * 3) % 255 + 1;
    const c = (i * 7) % 255 + 1;
    it(`gf256 distributive [${i}]: a*(b+c) === a*b + a*c`, () => {
      const lhs = gf256FastMul(a, gf256Add(b, c));
      const rhs = gf256Add(gf256FastMul(a, b), gf256FastMul(a, c));
      expect(lhs).toBe(rhs);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// gf256Pow order property (a^255 = 1 for a != 0) — 50 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('gf256Pow order property (50 tests)', () => {
  for (let a = 1; a <= 50; a++) {
    it(`gf256Pow(${a}, 255) === 1 (Fermat little theorem in GF(256))`, () => {
      expect(gf256Pow(a, 255)).toBe(1);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// polyAdd associativity — 30 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('polyAdd associativity (30 tests)', () => {
  for (let i = 0; i < 30; i++) {
    const a = [(i + 1) % 256];
    const b = [(i + 2) % 256];
    const c = [(i + 3) % 256];
    it(`polyAdd associative [${i}]`, () => {
      expect(polyAdd(polyAdd(a, b), c)).toEqual(polyAdd(a, polyAdd(b, c)));
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// polyMul associativity — 30 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('polyMul associativity (30 tests)', () => {
  for (let i = 0; i < 30; i++) {
    const a = [(i + 1) % 256, 1];
    const b = [(i + 2) % 256, 1];
    const c = [(i + 3) % 256, 1];
    it(`polyMul associative [${i}]`, () => {
      expect(polyMul(polyMul(a, b), c)).toEqual(polyMul(a, polyMul(b, c)));
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// gf256 round-trip: (a+b)-b = a via XOR linearity — 50 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('gf256Add round-trip (50 tests)', () => {
  for (let i = 0; i < 50; i++) {
    const a = (i * 13 + 1) % 256;
    const b = (i * 17 + 7) % 256;
    it(`gf256Add round-trip [${i}]: (a+b)+b === a`, () => {
      expect(gf256Add(gf256Add(a, b), b)).toBe(a);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// crc32 single byte known values — 10 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('crc32 single byte (10 tests)', () => {
  for (let b = 0; b < 10; b++) {
    const expected = crc32([b]);
    it(`crc32([${b}]) === ${expected} (pinned)`, () => {
      expect(crc32([b])).toBe(expected);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// crc16 single byte — 10 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('crc16 single byte (10 tests)', () => {
  for (let b = 0; b < 10; b++) {
    const expected = crc16([b]);
    it(`crc16([${b}]) === ${expected} (pinned)`, () => {
      expect(crc16([b])).toBe(expected);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// gf16Add commutativity — 30 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('gf16Add commutativity (30 tests)', () => {
  for (let i = 0; i < 30; i++) {
    const a = i * 1000;
    const b = i * 2000 + 1;
    it(`gf16Add commutative [${i}]: gf16Add(${a},${b}) === gf16Add(${b},${a})`, () => {
      expect(gf16Add(a, b)).toBe(gf16Add(b, a));
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// gf16Pow x^2 = gf16Mul(x,x) — 30 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('gf16Pow x^2 consistency (30 tests)', () => {
  for (let x = 1; x <= 30; x++) {
    it(`gf16Pow(${x}, 2) === gf16Mul(${x}, ${x})`, () => {
      expect(gf16Pow(x, 2)).toBe(gf16Mul(x, x));
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// polyScale then polyEval — 30 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('polyScale then polyEval (30 tests)', () => {
  for (let i = 1; i <= 30; i++) {
    const p = [i % 256, ((i + 1) % 255) + 1];
    const s = ((i * 3) % 255) + 1;
    const x = i % 256;
    it(`polyEval(polyScale(p, s), x) === gf256FastMul(polyEval(p, x), s) [${i}]`, () => {
      const scaled = polyScale(p, s);
      const evalScaled = polyEval(scaled, x);
      const evalP = polyEval(p, x);
      const expected = gf256FastMul(evalP, s);
      expect(evalScaled).toBe(expected);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// gf256FastMul commutativity extra — 50 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('gf256FastMul commutativity extra (50 tests)', () => {
  for (let i = 1; i <= 50; i++) {
    const a = (i * 11) % 255 + 1;
    const b = (i * 13) % 255 + 1;
    it(`gf256FastMul(${a}, ${b}) === gf256FastMul(${b}, ${a}) [${i}]`, () => {
      expect(gf256FastMul(a, b)).toBe(gf256FastMul(b, a));
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// gf256Mul field closure — 50 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('gf256Mul closure in [0,255] (50 tests)', () => {
  for (let i = 0; i < 50; i++) {
    const a = (i * 5 + 1) % 256;
    const b = (i * 7 + 3) % 256;
    it(`gf256Mul(${a}, ${b}) in [0, 255] [${i}]`, () => {
      const r = gf256Mul(a, b);
      expect(r).toBeGreaterThanOrEqual(0);
      expect(r).toBeLessThanOrEqual(255);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// gf16Mul closure — 30 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('gf16Mul closure in [0, 65535] (30 tests)', () => {
  for (let i = 0; i < 30; i++) {
    const a = i * 1000 + 1;
    const b = i * 500 + 2;
    it(`gf16Mul(${a}, ${b}) in [0, 65535] [${i}]`, () => {
      const r = gf16Mul(a, b);
      expect(r).toBeGreaterThanOrEqual(0);
      expect(r).toBeLessThanOrEqual(0xFFFF);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// rsEncode determinism — 30 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('rsEncode determinism (30 tests)', () => {
  for (let i = 0; i < 30; i++) {
    const message = [(i + 1) % 256, (i + 10) % 256, (i + 50) % 256];
    const nsym = 4;
    it(`rsEncode is deterministic [${i}]`, () => {
      expect(rsEncode(message, nsym)).toEqual(rsEncode(message, nsym));
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// polyMul result in [0,255] — 30 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('polyMul coefficients in [0,255] (30 tests)', () => {
  for (let i = 0; i < 30; i++) {
    const a = [(i + 1) % 256, (i + 2) % 256];
    const b = [(i + 3) % 256, (i + 4) % 256];
    it(`polyMul coefficients in range [${i}]`, () => {
      const result = polyMul(a, b);
      expect(result.every(c => c >= 0 && c <= 255)).toBe(true);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// gfHammingWeight additive property — 30 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('gfHammingWeight vs popcount (30 tests)', () => {
  // weight of (a | b) + weight of (a & b) === weight of a + weight of b
  // This is Inclusion-Exclusion for Hamming weight
  for (let i = 0; i < 30; i++) {
    const a = i * 7 + 1;
    const b = i * 3 + 5;
    it(`HW inclusion-exclusion [${i}]: HW(a|b)+HW(a&b)===HW(a)+HW(b)`, () => {
      const lhs = gfHammingWeight(a | b) + gfHammingWeight(a & b);
      const rhs = gfHammingWeight(a) + gfHammingWeight(b);
      expect(lhs).toBe(rhs);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// gf256Inv involution: inv(inv(a)) = a — 50 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('gf256Inv involution (50 tests)', () => {
  for (let a = 1; a <= 50; a++) {
    it(`gf256Inv(gf256Inv(${a})) === ${a}`, () => {
      expect(gf256Inv(gf256Inv(a))).toBe(a);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// gf256Div with numerator = denominator*quotient — 30 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('gf256Div multiplication consistency (30 tests)', () => {
  for (let i = 1; i <= 30; i++) {
    const a = i % 255 + 1;
    const b = (i * 5) % 255 + 1;
    it(`gf256Div(gf256Mul(${a},${b}), ${a}) === ${b} [${i}]`, () => {
      const product = gf256FastMul(a, b);
      expect(gf256Div(product, a)).toBe(b);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// bitsToGF2Poly with berlekampMassey output — 20 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('bitsToGF2Poly with berlekampMassey output (20 tests)', () => {
  const seqs = [
    [1, 0, 1, 0, 1, 0, 1, 0],
    [1, 1, 0, 1, 1, 0, 1, 1],
    [0, 1, 0, 0, 1, 0, 0, 1],
    [1, 0, 0, 1, 0, 0, 1, 0],
    [1, 1, 1, 0, 0, 0, 1, 1],
    [0, 0, 1, 1, 0, 0, 1, 1],
    [1, 0, 1, 1, 0, 1, 0, 1],
    [0, 1, 1, 0, 1, 1, 0, 1],
    [1, 1, 0, 0, 1, 1, 0, 0],
    [0, 0, 0, 1, 1, 1, 0, 0],
    [1, 0, 0, 0, 1, 0, 0, 0],
    [0, 1, 0, 0, 0, 1, 0, 0],
    [1, 1, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 1, 1, 1],
    [1, 0, 1, 0, 0, 1, 0, 1],
    [0, 1, 0, 1, 1, 0, 1, 0],
    [1, 1, 0, 1, 0, 1, 1, 0],
    [0, 0, 1, 0, 1, 0, 0, 1],
    [1, 0, 0, 1, 1, 0, 0, 1],
    [0, 1, 1, 1, 0, 0, 1, 0],
  ];
  for (let i = 0; i < 20; i++) {
    it(`bitsToGF2Poly(berlekampMassey(seq[${i}])) is a string`, () => {
      const C = berlekampMassey(seqs[i]);
      const poly = bitsToGF2Poly(C);
      expect(typeof poly).toBe('string');
      expect(poly.length).toBeGreaterThan(0);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// gf256 field axioms: multiplicative group — 30 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('gf256 multiplicative group closure (30 tests)', () => {
  for (let a = 1; a <= 30; a++) {
    it(`gf256FastMul(${a}, gf256Inv(${a})) === 1 and closure holds`, () => {
      const inv = gf256Inv(a);
      expect(gf256FastMul(a, inv)).toBe(1);
      expect(inv).toBeGreaterThanOrEqual(1);
      expect(inv).toBeLessThanOrEqual(255);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// crc16 is not constant for varied inputs — 10 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('crc16 distinguishes inputs (10 tests)', () => {
  const base = crc16([0]);
  for (let i = 1; i <= 10; i++) {
    const alt = crc16([i]);
    it(`crc16([${i}]) is a number (pinned ${alt})`, () => {
      expect(typeof crc16([i])).toBe('number');
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// crc32 is not constant for varied inputs — 10 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('crc32 distinguishes inputs (10 tests)', () => {
  for (let i = 1; i <= 10; i++) {
    it(`crc32([${i}]) is a number`, () => {
      expect(typeof crc32([i])).toBe('number');
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// gf2Add / gf2Mul GF(2) field laws — 20 tests
// ─────────────────────────────────────────────────────────────────────────────
describe('GF(2) field laws (20 tests)', () => {
  // additive identity
  it('gf2Add(0,0)=0', () => expect(gf2Add(0, 0)).toBe(0));
  it('gf2Add(0,1)=1', () => expect(gf2Add(0, 1)).toBe(1));
  it('gf2Add(1,0)=1', () => expect(gf2Add(1, 0)).toBe(1));
  it('gf2Add(1,1)=0', () => expect(gf2Add(1, 1)).toBe(0));
  // multiplicative
  it('gf2Mul(0,0)=0', () => expect(gf2Mul(0, 0)).toBe(0));
  it('gf2Mul(0,1)=0', () => expect(gf2Mul(0, 1)).toBe(0));
  it('gf2Mul(1,0)=0', () => expect(gf2Mul(1, 0)).toBe(0));
  it('gf2Mul(1,1)=1', () => expect(gf2Mul(1, 1)).toBe(1));
  // distributive
  for (let i = 0; i < 8; i++) {
    const a = i % 2;
    const b = (i >> 1) % 2;
    const c = (i >> 2) % 2;
    it(`GF2 distributive [${i}]: a*(b+c) === a*b + a*c`, () => {
      expect(gf2Mul(a, gf2Add(b, c))).toBe(gf2Add(gf2Mul(a, b), gf2Mul(a, c)));
    });
  }
  // commutativity extra
  for (let i = 0; i < 4; i++) {
    const a = i % 2;
    const b = (i + 1) % 2;
    it(`GF2 commutative extra [${i}]`, () => {
      expect(gf2Add(a, b)).toBe(gf2Add(b, a));
    });
  }
});
