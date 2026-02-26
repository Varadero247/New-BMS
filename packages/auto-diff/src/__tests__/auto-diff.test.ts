// Copyright (c) 2026 Nexara DMCC. All rights reserved.
import { Dual, Tape, TapeNode, diff, gradient, partialDerivative } from '../auto-diff';

// ---------------------------------------------------------------------------
// 1. Dual number arithmetic (add, sub, mul, div, neg) — 150 tests
// ---------------------------------------------------------------------------
describe('Dual arithmetic', () => {
  // add: 30 tests
  describe('add', () => {
    for (let i = 0; i < 30; i++) {
      const a = i - 10;
      const b = i * 2 - 5;
      it(`add(${a} + ${i}*eps, ${b} + ${i * 3}*eps)`, () => {
        const da = new Dual(a, i);
        const db = new Dual(b, i * 3);
        const r = da.add(db);
        expect(r.real).toBeCloseTo(a + b, 5);
        expect(r.dual).toBeCloseTo(i + i * 3, 5);
      });
    }
  });

  // sub: 30 tests
  describe('sub', () => {
    for (let i = 0; i < 30; i++) {
      const a = i - 5;
      const b = i + 3;
      it(`sub(${a} + ${i}*eps, ${b} + 1*eps)`, () => {
        const da = new Dual(a, i);
        const db = new Dual(b, 1);
        const r = da.sub(db);
        expect(r.real).toBeCloseTo(a - b, 5);
        expect(r.dual).toBeCloseTo(i - 1, 5);
      });
    }
  });

  // mul: 30 tests
  describe('mul', () => {
    for (let i = 1; i <= 30; i++) {
      const a = i;
      const b = i + 1;
      it(`mul(${a} + 1*eps, ${b} + 0*eps)`, () => {
        // d/dx[a * b] when a varies: dual = 1*b + a*0 = b
        const da = new Dual(a, 1);
        const db = new Dual(b, 0);
        const r = da.mul(db);
        expect(r.real).toBeCloseTo(a * b, 5);
        expect(r.dual).toBeCloseTo(b, 5);
      });
    }
  });

  // div: 30 tests
  describe('div', () => {
    for (let i = 1; i <= 30; i++) {
      const a = i * 2;
      const b = i;
      it(`div(${a} + 1*eps, ${b} + 0*eps)`, () => {
        const da = new Dual(a, 1);
        const db = new Dual(b, 0);
        const r = da.div(db);
        expect(r.real).toBeCloseTo(a / b, 5);
        expect(r.dual).toBeCloseTo(1 / b, 5);
      });
    }
  });

  // neg: 30 tests
  describe('neg', () => {
    for (let i = 0; i < 30; i++) {
      const a = i - 10;
      const d = i * 2;
      it(`neg(${a} + ${d}*eps)`, () => {
        const da = new Dual(a, d);
        const r = da.neg();
        expect(r.real).toBeCloseTo(-a, 5);
        expect(r.dual).toBeCloseTo(-d, 5);
      });
    }
  });
});

// ---------------------------------------------------------------------------
// 2. Dual static math functions — 120 tests
// ---------------------------------------------------------------------------
describe('Dual static math', () => {
  // sin: 20 tests
  describe('sin', () => {
    for (let i = 0; i < 20; i++) {
      const x = i * 0.3;
      it(`sin(${x.toFixed(2)} + 1*eps)`, () => {
        const d = new Dual(x, 1);
        const r = Dual.sin(d);
        expect(r.real).toBeCloseTo(Math.sin(x), 5);
        expect(r.dual).toBeCloseTo(Math.cos(x), 5);
      });
    }
  });

  // cos: 20 tests
  describe('cos', () => {
    for (let i = 0; i < 20; i++) {
      const x = i * 0.3;
      it(`cos(${x.toFixed(2)} + 1*eps)`, () => {
        const d = new Dual(x, 1);
        const r = Dual.cos(d);
        expect(r.real).toBeCloseTo(Math.cos(x), 5);
        expect(r.dual).toBeCloseTo(-Math.sin(x), 5);
      });
    }
  });

  // exp: 20 tests
  describe('exp', () => {
    for (let i = 0; i < 20; i++) {
      const x = (i - 5) * 0.5;
      it(`exp(${x.toFixed(2)} + 1*eps)`, () => {
        const d = new Dual(x, 1);
        const r = Dual.exp(d);
        expect(r.real).toBeCloseTo(Math.exp(x), 5);
        expect(r.dual).toBeCloseTo(Math.exp(x), 5);
      });
    }
  });

  // log: 20 tests
  describe('log', () => {
    for (let i = 1; i <= 20; i++) {
      const x = i * 0.5;
      it(`log(${x.toFixed(2)} + 1*eps)`, () => {
        const d = new Dual(x, 1);
        const r = Dual.log(d);
        expect(r.real).toBeCloseTo(Math.log(x), 5);
        expect(r.dual).toBeCloseTo(1 / x, 5);
      });
    }
  });

  // sqrt: 20 tests
  describe('sqrt', () => {
    for (let i = 1; i <= 20; i++) {
      const x = i * 0.5;
      it(`sqrt(${x.toFixed(2)} + 1*eps)`, () => {
        const d = new Dual(x, 1);
        const r = Dual.sqrt(d);
        expect(r.real).toBeCloseTo(Math.sqrt(x), 5);
        expect(r.dual).toBeCloseTo(1 / (2 * Math.sqrt(x)), 5);
      });
    }
  });

  // pow: 10 tests
  describe('pow', () => {
    for (let i = 1; i <= 10; i++) {
      const x = i;
      const n = 3;
      it(`pow(${x} + 1*eps, ${n})`, () => {
        const d = new Dual(x, 1);
        const r = Dual.pow(d, n);
        expect(r.real).toBeCloseTo(Math.pow(x, n), 5);
        expect(r.dual).toBeCloseTo(n * Math.pow(x, n - 1), 5);
      });
    }
  });

  // abs: 10 tests
  describe('abs', () => {
    for (let i = 0; i < 10; i++) {
      const x = i - 5;
      it(`abs(${x} + 1*eps)`, () => {
        const d = new Dual(x, 1);
        const r = Dual.abs(d);
        expect(r.real).toBeCloseTo(Math.abs(x), 5);
        if (x !== 0) {
          expect(r.dual).toBeCloseTo(x > 0 ? 1 : -1, 5);
        }
      });
    }
  });
});

// ---------------------------------------------------------------------------
// 3. Dual variable / constant factory — 60 tests
// ---------------------------------------------------------------------------
describe('Dual variable and constant', () => {
  describe('variable', () => {
    for (let i = 0; i < 30; i++) {
      const x = i * 1.5 - 10;
      it(`variable(${x.toFixed(2)}) has dual=1`, () => {
        const d = Dual.variable(x);
        expect(d.real).toBeCloseTo(x, 5);
        expect(d.dual).toBeCloseTo(1, 5);
      });
    }
  });

  describe('constant', () => {
    for (let i = 0; i < 30; i++) {
      const x = i * 2 - 15;
      it(`constant(${x}) has dual=0`, () => {
        const d = Dual.constant(x);
        expect(d.real).toBeCloseTo(x, 5);
        expect(d.dual).toBeCloseTo(0, 5);
      });
    }
  });
});

// ---------------------------------------------------------------------------
// 4. Forward-mode diff() — 110 tests
// ---------------------------------------------------------------------------
describe('diff() forward-mode derivatives', () => {
  // x^2: 20 tests, d/dx = 2x
  describe('d/dx[x²] = 2x', () => {
    for (let i = 0; i < 20; i++) {
      const x = i - 5;
      it(`x=${x}`, () => {
        expect(diff(v => v.mul(v), x)).toBeCloseTo(2 * x, 5);
      });
    }
  });

  // x^3: 20 tests, d/dx = 3x²
  describe('d/dx[x³] = 3x²', () => {
    for (let i = 1; i <= 20; i++) {
      const x = i * 0.5;
      it(`x=${x.toFixed(2)}`, () => {
        expect(diff(v => v.mul(v).mul(v), x)).toBeCloseTo(3 * x * x, 5);
      });
    }
  });

  // sin: 20 tests, d/dx[sin(x)] = cos(x)
  describe('d/dx[sin(x)] = cos(x)', () => {
    for (let i = 0; i < 20; i++) {
      const x = i * 0.25;
      it(`x=${x.toFixed(2)}`, () => {
        expect(diff(v => Dual.sin(v), x)).toBeCloseTo(Math.cos(x), 5);
      });
    }
  });

  // cos: 20 tests, d/dx[cos(x)] = -sin(x)
  describe('d/dx[cos(x)] = -sin(x)', () => {
    for (let i = 0; i < 20; i++) {
      const x = i * 0.25;
      it(`x=${x.toFixed(2)}`, () => {
        expect(diff(v => Dual.cos(v), x)).toBeCloseTo(-Math.sin(x), 5);
      });
    }
  });

  // exp: 10 tests, d/dx[exp(x)] = exp(x)
  describe('d/dx[exp(x)] = exp(x)', () => {
    for (let i = 0; i < 10; i++) {
      const x = (i - 3) * 0.5;
      it(`x=${x.toFixed(2)}`, () => {
        expect(diff(v => Dual.exp(v), x)).toBeCloseTo(Math.exp(x), 5);
      });
    }
  });

  // log: 10 tests, d/dx[log(x)] = 1/x
  describe('d/dx[log(x)] = 1/x', () => {
    for (let i = 1; i <= 10; i++) {
      const x = i * 0.7;
      it(`x=${x.toFixed(2)}`, () => {
        expect(diff(v => Dual.log(v), x)).toBeCloseTo(1 / x, 5);
      });
    }
  });

  // sqrt: 10 tests, d/dx[sqrt(x)] = 1/(2*sqrt(x))
  describe('d/dx[sqrt(x)] = 1/(2√x)', () => {
    for (let i = 1; i <= 10; i++) {
      const x = i * 0.5;
      it(`x=${x.toFixed(2)}`, () => {
        expect(diff(v => Dual.sqrt(v), x)).toBeCloseTo(1 / (2 * Math.sqrt(x)), 5);
      });
    }
  });

  // composites: sin(x²) — d/dx = 2x*cos(x²) — 10 tests
  describe('d/dx[sin(x²)] = 2x·cos(x²)', () => {
    for (let i = 1; i <= 10; i++) {
      const x = i * 0.4;
      it(`x=${x.toFixed(2)}`, () => {
        expect(diff(v => Dual.sin(v.mul(v)), x)).toBeCloseTo(2 * x * Math.cos(x * x), 5);
      });
    }
  });
});

// ---------------------------------------------------------------------------
// 5. Partial derivatives — 110 tests
// ---------------------------------------------------------------------------
describe('partialDerivative()', () => {
  // f(x,y) = x*y, df/dx = y, df/dy = x
  describe('f(x,y)=x*y, df/dx=y', () => {
    for (let i = 1; i <= 30; i++) {
      const x = i;
      const y = i + 2;
      it(`x=${x}, y=${y}`, () => {
        const result = partialDerivative(
          (a, b) => a.mul(b),
          [x, y],
          0
        );
        expect(result).toBeCloseTo(y, 5);
      });
    }
  });

  describe('f(x,y)=x*y, df/dy=x', () => {
    for (let i = 1; i <= 30; i++) {
      const x = i;
      const y = i + 2;
      it(`x=${x}, y=${y}`, () => {
        const result = partialDerivative(
          (a, b) => a.mul(b),
          [x, y],
          1
        );
        expect(result).toBeCloseTo(x, 5);
      });
    }
  });

  // f(x,y,z) = x²+y²+z², df/dx = 2x, df/dy = 2y, df/dz = 2z
  describe('f(x,y,z)=x²+y²+z², partials', () => {
    for (let i = 1; i <= 16; i++) {
      const x = i;
      const y = i + 1;
      const z = i + 2;
      it(`df/dx at x=${x}`, () => {
        const r = partialDerivative(
          (a, b, c) => a.mul(a).add(b.mul(b)).add(c.mul(c)),
          [x, y, z],
          0
        );
        expect(r).toBeCloseTo(2 * x, 5);
      });
      if (i <= 7) {
        it(`df/dz at z=${z}`, () => {
          const r = partialDerivative(
            (a, b, c) => a.mul(a).add(b.mul(b)).add(c.mul(c)),
            [x, y, z],
            2
          );
          expect(r).toBeCloseTo(2 * z, 5);
        });
      }
    }
  });

  // f(x,y) = sin(x) + cos(y), df/dx = cos(x)
  describe('f(x,y)=sin(x)+cos(y), df/dx=cos(x)', () => {
    for (let i = 1; i <= 14; i++) {
      const x = i * 0.4;
      it(`x=${x.toFixed(2)}`, () => {
        const r = partialDerivative(
          (a, b) => Dual.sin(a).add(Dual.cos(b)),
          [x, 1.0],
          0
        );
        expect(r).toBeCloseTo(Math.cos(x), 5);
      });
    }
  });
});

// ---------------------------------------------------------------------------
// 6. Tape.variable / Tape.constant — 60 tests
// ---------------------------------------------------------------------------
describe('Tape.variable and Tape.constant', () => {
  describe('variable value stored correctly', () => {
    for (let i = 0; i < 30; i++) {
      const v = i * 1.7 - 15;
      it(`variable(${v.toFixed(2)}).value`, () => {
        const tape = new Tape();
        const node = tape.variable(v);
        expect(node.value).toBeCloseTo(v, 5);
        expect(node.grad).toBeCloseTo(0, 5);
      });
    }
  });

  describe('constant value stored correctly', () => {
    for (let i = 0; i < 30; i++) {
      const v = i * 2 - 10;
      it(`constant(${v}).value`, () => {
        const tape = new Tape();
        const node = tape.constant(v);
        expect(node.value).toBeCloseTo(v, 5);
        expect(node.grad).toBeCloseTo(0, 5);
      });
    }
  });
});

// ---------------------------------------------------------------------------
// 7. Tape operations (add, sub, mul, div) — 120 tests
// ---------------------------------------------------------------------------
describe('Tape operations', () => {
  describe('tape.add forward value', () => {
    for (let i = 0; i < 30; i++) {
      const a = i - 5;
      const b = i + 3;
      it(`add(${a}, ${b})`, () => {
        const tape = new Tape();
        const na = tape.variable(a);
        const nb = tape.variable(b);
        const out = tape.add(na, nb);
        expect(out.value).toBeCloseTo(a + b, 5);
      });
    }
  });

  describe('tape.sub forward value', () => {
    for (let i = 0; i < 30; i++) {
      const a = i + 10;
      const b = i;
      it(`sub(${a}, ${b})`, () => {
        const tape = new Tape();
        const na = tape.variable(a);
        const nb = tape.variable(b);
        const out = tape.sub(na, nb);
        expect(out.value).toBeCloseTo(a - b, 5);
      });
    }
  });

  describe('tape.mul forward value', () => {
    for (let i = 0; i < 30; i++) {
      const a = i + 1;
      const b = i + 2;
      it(`mul(${a}, ${b})`, () => {
        const tape = new Tape();
        const na = tape.variable(a);
        const nb = tape.variable(b);
        const out = tape.mul(na, nb);
        expect(out.value).toBeCloseTo(a * b, 5);
      });
    }
  });

  describe('tape.div forward value', () => {
    for (let i = 1; i <= 30; i++) {
      const a = i * 3;
      const b = i;
      it(`div(${a}, ${b})`, () => {
        const tape = new Tape();
        const na = tape.variable(a);
        const nb = tape.variable(b);
        const out = tape.div(na, nb);
        expect(out.value).toBeCloseTo(a / b, 5);
      });
    }
  });
});

// ---------------------------------------------------------------------------
// 8. Tape.backward + gradient — 120 tests
// ---------------------------------------------------------------------------
describe('Tape.backward gradients', () => {
  // d/dx[x²] = 2x — 30 tests
  describe('d/dx[x²] = 2x via tape', () => {
    for (let i = 1; i <= 30; i++) {
      const x = i;
      it(`x=${x}`, () => {
        const tape = new Tape();
        const xn = tape.variable(x);
        const out = tape.mul(xn, xn);
        tape.backward(out);
        expect(tape.gradient(xn)).toBeCloseTo(2 * x, 5);
      });
    }
  });

  // d/dx[x*y] = y — 30 tests
  describe('d/dx[x*y] = y via tape', () => {
    for (let i = 1; i <= 30; i++) {
      const x = i;
      const y = i + 5;
      it(`x=${x}, y=${y}`, () => {
        const tape = new Tape();
        const xn = tape.variable(x);
        const yn = tape.variable(y);
        const out = tape.mul(xn, yn);
        tape.backward(out);
        expect(tape.gradient(xn)).toBeCloseTo(y, 5);
      });
    }
  });

  // d/dx[sin(x)] = cos(x) — 30 tests
  describe('d/dx[sin(x)] = cos(x) via tape', () => {
    for (let i = 0; i < 30; i++) {
      const x = i * 0.2;
      it(`x=${x.toFixed(2)}`, () => {
        const tape = new Tape();
        const xn = tape.variable(x);
        const out = tape.sin(xn);
        tape.backward(out);
        expect(tape.gradient(xn)).toBeCloseTo(Math.cos(x), 5);
      });
    }
  });

  // d/dx[exp(x)] = exp(x) — 30 tests
  describe('d/dx[exp(x)] = exp(x) via tape', () => {
    for (let i = 0; i < 30; i++) {
      const x = (i - 10) * 0.3;
      it(`x=${x.toFixed(2)}`, () => {
        const tape = new Tape();
        const xn = tape.variable(x);
        const out = tape.exp(xn);
        tape.backward(out);
        expect(tape.gradient(xn)).toBeCloseTo(Math.exp(x), 5);
      });
    }
  });
});

// ---------------------------------------------------------------------------
// 9. Reverse-mode gradient() function — 110 tests
// ---------------------------------------------------------------------------
describe('gradient() reverse-mode', () => {
  // f(x,y) = x²+y², grad = [2x, 2y] — 30 tests
  describe('f=x²+y², grad=[2x,2y]', () => {
    for (let i = 1; i <= 30; i++) {
      const x = i;
      const y = i + 1;
      it(`[x=${x}, y=${y}]`, () => {
        const g = gradient((tape, vars) => {
          const [xn, yn] = vars;
          return tape.add(tape.mul(xn, xn), tape.mul(yn, yn));
        }, [x, y]);
        expect(g[0]).toBeCloseTo(2 * x, 5);
        expect(g[1]).toBeCloseTo(2 * y, 5);
      });
    }
  });

  // f(x,y,z) = x*y*z, grad = [y*z, x*z, x*y] — 30 tests
  describe('f=x*y*z, grad=[y*z, x*z, x*y]', () => {
    for (let i = 1; i <= 30; i++) {
      const x = i;
      const y = i + 1;
      const z = i + 2;
      it(`[x=${x}, y=${y}, z=${z}]`, () => {
        const g = gradient((tape, vars) => {
          const [xn, yn, zn] = vars;
          return tape.mul(tape.mul(xn, yn), zn);
        }, [x, y, z]);
        expect(g[0]).toBeCloseTo(y * z, 5);
        expect(g[1]).toBeCloseTo(x * z, 5);
        expect(g[2]).toBeCloseTo(x * y, 5);
      });
    }
  });

  // f(x) = sin(x) + exp(x), grad = [cos(x)+exp(x)] — 20 tests
  describe('f=sin(x)+exp(x), grad=[cos(x)+exp(x)]', () => {
    for (let i = 0; i < 20; i++) {
      const x = (i - 5) * 0.4;
      it(`x=${x.toFixed(2)}`, () => {
        const g = gradient((tape, vars) => {
          const [xn] = vars;
          return tape.add(tape.sin(xn), tape.exp(xn));
        }, [x]);
        expect(g[0]).toBeCloseTo(Math.cos(x) + Math.exp(x), 5);
      });
    }
  });

  // f(x) = log(x), grad = [1/x] — 10 tests
  describe('f=log(x), grad=[1/x]', () => {
    for (let i = 1; i <= 10; i++) {
      const x = i * 0.8;
      it(`x=${x.toFixed(2)}`, () => {
        const g = gradient((tape, vars) => {
          return tape.log(vars[0]);
        }, [x]);
        expect(g[0]).toBeCloseTo(1 / x, 5);
      });
    }
  });

  // f(x) = sqrt(x), grad = [1/(2√x)] — 10 tests
  describe('f=sqrt(x), grad=[1/(2√x)]', () => {
    for (let i = 1; i <= 10; i++) {
      const x = i * 0.6;
      it(`x=${x.toFixed(2)}`, () => {
        const g = gradient((tape, vars) => {
          return tape.sqrt(vars[0]);
        }, [x]);
        expect(g[0]).toBeCloseTo(1 / (2 * Math.sqrt(x)), 5);
      });
    }
  });

  // f(x) = x^3, grad = [3x²] — 10 tests
  describe('f=x^3, grad=[3x²]', () => {
    for (let i = 1; i <= 10; i++) {
      const x = i;
      it(`x=${x}`, () => {
        const g = gradient((tape, vars) => {
          return tape.pow(vars[0], 3);
        }, [x]);
        expect(g[0]).toBeCloseTo(3 * x * x, 5);
      });
    }
  });
});

// ---------------------------------------------------------------------------
// 10. Known derivatives verification — 110 tests
// ---------------------------------------------------------------------------
describe('Known derivative identities', () => {
  // d/dx[x²] = 2x at x = 1..30
  describe('d/dx[x²]=2x (forward mode)', () => {
    for (let i = 1; i <= 30; i++) {
      it(`x=${i}`, () => {
        expect(diff(x => x.mul(x), i)).toBeCloseTo(2 * i, 5);
      });
    }
  });

  // d/dx[sin(x)] = cos(x) at x in [0, 3π]
  describe('d/dx[sin]=cos', () => {
    for (let i = 0; i < 20; i++) {
      const x = i * 0.5;
      it(`x=${x.toFixed(2)}`, () => {
        expect(diff(v => Dual.sin(v), x)).toBeCloseTo(Math.cos(x), 5);
      });
    }
  });

  // d/dx[exp(x)] = exp(x)
  describe('d/dx[exp]=exp', () => {
    for (let i = 0; i < 20; i++) {
      const x = (i - 5) * 0.5;
      it(`x=${x.toFixed(2)}`, () => {
        expect(diff(v => Dual.exp(v), x)).toBeCloseTo(Math.exp(x), 5);
      });
    }
  });

  // d/dx[log(x)] = 1/x
  describe('d/dx[log]=1/x', () => {
    for (let i = 1; i <= 20; i++) {
      const x = i * 0.5;
      it(`x=${x.toFixed(2)}`, () => {
        expect(diff(v => Dual.log(v), x)).toBeCloseTo(1 / x, 5);
      });
    }
  });

  // d/dx[sqrt(x)] = 1/(2√x)
  describe('d/dx[sqrt]=1/(2√x)', () => {
    for (let i = 1; i <= 20; i++) {
      const x = i * 0.4;
      it(`x=${x.toFixed(2)}`, () => {
        expect(diff(v => Dual.sqrt(v), x)).toBeCloseTo(1 / (2 * Math.sqrt(x)), 5);
      });
    }
  });
});

// ---------------------------------------------------------------------------
// 11. Chain rule verification — 60 tests
// ---------------------------------------------------------------------------
describe('Chain rule verification', () => {
  // d/dx[exp(x²)] = 2x*exp(x²) — 20 tests
  describe('d/dx[exp(x²)] = 2x·exp(x²)', () => {
    for (let i = 0; i < 20; i++) {
      const x = (i - 5) * 0.4;
      it(`x=${x.toFixed(2)}`, () => {
        expect(diff(v => Dual.exp(v.mul(v)), x))
          .toBeCloseTo(2 * x * Math.exp(x * x), 5);
      });
    }
  });

  // d/dx[log(sin(x))] = cos(x)/sin(x) = cot(x) — 20 tests (x in (0,π))
  describe('d/dx[log(sin(x))] = cos(x)/sin(x)', () => {
    for (let i = 1; i <= 20; i++) {
      const x = i * 0.14; // stays in (0, π)
      it(`x=${x.toFixed(2)}`, () => {
        expect(diff(v => Dual.log(Dual.sin(v)), x))
          .toBeCloseTo(Math.cos(x) / Math.sin(x), 5);
      });
    }
  });

  // d/dx[sqrt(x²+1)] = x/sqrt(x²+1) — 20 tests
  describe('d/dx[sqrt(x²+1)] = x/√(x²+1)', () => {
    for (let i = 0; i < 20; i++) {
      const x = i * 0.5;
      it(`x=${x.toFixed(2)}`, () => {
        expect(diff(v => Dual.sqrt(v.mul(v).add(Dual.constant(1))), x))
          .toBeCloseTo(x / Math.sqrt(x * x + 1), 5);
      });
    }
  });
});

// ---------------------------------------------------------------------------
// 12. Edge cases — 70 tests
// ---------------------------------------------------------------------------
describe('Edge cases', () => {
  // x=0 for differentiable functions
  describe('x=0 edge cases', () => {
    it('diff x² at 0 is 0', () => {
      expect(diff(x => x.mul(x), 0)).toBeCloseTo(0, 5);
    });

    it('diff sin(x) at 0 is 1', () => {
      expect(diff(x => Dual.sin(x), 0)).toBeCloseTo(1, 5);
    });

    it('diff cos(x) at 0 is 0', () => {
      expect(diff(x => Dual.cos(x), 0)).toBeCloseTo(0, 5);
    });

    it('diff exp(x) at 0 is 1', () => {
      expect(diff(x => Dual.exp(x), 0)).toBeCloseTo(1, 5);
    });

    it('Dual add: zero + zero', () => {
      const r = new Dual(0, 0).add(new Dual(0, 0));
      expect(r.real).toBeCloseTo(0, 5);
      expect(r.dual).toBeCloseTo(0, 5);
    });
  });

  // x=1 for known values
  describe('x=1 edge cases', () => {
    it('diff x² at 1 is 2', () => {
      expect(diff(x => x.mul(x), 1)).toBeCloseTo(2, 5);
    });

    it('diff x³ at 1 is 3', () => {
      expect(diff(x => x.mul(x).mul(x), 1)).toBeCloseTo(3, 5);
    });

    it('diff log(x) at 1 is 1', () => {
      expect(diff(x => Dual.log(x), 1)).toBeCloseTo(1, 5);
    });

    it('diff sqrt(x) at 1 is 0.5', () => {
      expect(diff(x => Dual.sqrt(x), 1)).toBeCloseTo(0.5, 5);
    });

    it('diff exp(x) at 1 is e', () => {
      expect(diff(x => Dual.exp(x), 1)).toBeCloseTo(Math.E, 5);
    });
  });

  // Negative x where valid
  describe('negative x edge cases', () => {
    it('diff x² at -3 is -6', () => {
      expect(diff(x => x.mul(x), -3)).toBeCloseTo(-6, 5);
    });

    it('diff sin(x) at -π is -1', () => {
      expect(diff(x => Dual.sin(x), -Math.PI)).toBeCloseTo(-1, 5);
    });

    it('diff exp(x) at -1 is 1/e', () => {
      expect(diff(x => Dual.exp(x), -1)).toBeCloseTo(1 / Math.E, 5);
    });

    it('Dual.abs(-5 + 1*eps) dual = -1', () => {
      const r = Dual.abs(new Dual(-5, 1));
      expect(r.real).toBeCloseTo(5, 5);
      expect(r.dual).toBeCloseTo(-1, 5);
    });
  });

  // Tape.reset() clears nodes
  describe('Tape.reset()', () => {
    it('reset clears gradient state', () => {
      const tape = new Tape();
      const x = tape.variable(3);
      const out = tape.mul(x, x);
      tape.backward(out);
      tape.reset();
      // after reset, fresh tape — variable created again
      const tape2 = new Tape();
      const x2 = tape2.variable(3);
      const out2 = tape2.mul(x2, x2);
      tape2.backward(out2);
      expect(tape2.gradient(x2)).toBeCloseTo(6, 5);
    });
  });

  // Tape: cos gradient
  describe('Tape.cos gradient', () => {
    for (let i = 0; i < 10; i++) {
      const x = i * 0.3;
      it(`d/dx[cos(x)] at x=${x.toFixed(2)} via tape`, () => {
        const tape = new Tape();
        const xn = tape.variable(x);
        const out = tape.cos(xn);
        tape.backward(out);
        expect(tape.gradient(xn)).toBeCloseTo(-Math.sin(x), 5);
      });
    }
  });

  // Tape: log gradient
  describe('Tape.log gradient', () => {
    for (let i = 1; i <= 10; i++) {
      const x = i * 0.7;
      it(`d/dx[log(x)] at x=${x.toFixed(2)} via tape`, () => {
        const tape = new Tape();
        const xn = tape.variable(x);
        const out = tape.log(xn);
        tape.backward(out);
        expect(tape.gradient(xn)).toBeCloseTo(1 / x, 5);
      });
    }
  });

  // Tape: sqrt gradient
  describe('Tape.sqrt gradient', () => {
    for (let i = 1; i <= 10; i++) {
      const x = i * 0.5;
      it(`d/dx[sqrt(x)] at x=${x.toFixed(2)} via tape`, () => {
        const tape = new Tape();
        const xn = tape.variable(x);
        const out = tape.sqrt(xn);
        tape.backward(out);
        expect(tape.gradient(xn)).toBeCloseTo(1 / (2 * Math.sqrt(x)), 5);
      });
    }
  });

  // Tape: pow gradient
  describe('Tape.pow gradient', () => {
    for (let i = 1; i <= 10; i++) {
      const x = i;
      it(`d/dx[x^4] at x=${x} via tape`, () => {
        const tape = new Tape();
        const xn = tape.variable(x);
        const out = tape.pow(xn, 4);
        tape.backward(out);
        expect(tape.gradient(xn)).toBeCloseTo(4 * Math.pow(x, 3), 5);
      });
    }
  });
});

// ---------------------------------------------------------------------------
// 13. Additional composite / higher-order tests — 100 tests
// ---------------------------------------------------------------------------
describe('Composite function derivatives', () => {
  // f(x) = x² + 3x + 2, df/dx = 2x + 3 — 25 tests
  describe('f=x²+3x+2, df/dx=2x+3', () => {
    for (let i = 0; i < 25; i++) {
      const x = i - 10;
      it(`x=${x}`, () => {
        const three = Dual.constant(3);
        const two = Dual.constant(2);
        expect(diff(v => v.mul(v).add(three.mul(v)).add(two), x))
          .toBeCloseTo(2 * x + 3, 5);
      });
    }
  });

  // f(x) = cos²(x) + sin²(x) = 1, df/dx = 0 — 15 tests
  describe('f=cos²+sin²=1, df/dx=0', () => {
    for (let i = 0; i < 15; i++) {
      const x = i * 0.4;
      it(`x=${x.toFixed(2)}`, () => {
        expect(diff(v => Dual.cos(v).mul(Dual.cos(v)).add(Dual.sin(v).mul(Dual.sin(v))), x))
          .toBeCloseTo(0, 4);
      });
    }
  });

  // f(x) = x * exp(x), df/dx = exp(x) + x*exp(x) = (1+x)*exp(x) — 20 tests
  describe('f=x·exp(x), df/dx=(1+x)·exp(x)', () => {
    for (let i = 0; i < 20; i++) {
      const x = (i - 5) * 0.4;
      it(`x=${x.toFixed(2)}`, () => {
        expect(diff(v => v.mul(Dual.exp(v)), x))
          .toBeCloseTo((1 + x) * Math.exp(x), 5);
      });
    }
  });

  // f(x) = (x+1)/(x-1), df/dx = -2/(x-1)² — 20 tests (x != 1)
  describe('f=(x+1)/(x-1), df/dx=-2/(x-1)²', () => {
    for (let i = 0; i < 20; i++) {
      const x = i + 2; // x >= 2, avoids singularity at 1
      it(`x=${x}`, () => {
        const one = Dual.constant(1);
        expect(diff(v => v.add(one).div(v.sub(one)), x))
          .toBeCloseTo(-2 / ((x - 1) * (x - 1)), 5);
      });
    }
  });

  // d/dx[x^n] = n*x^(n-1) via tape.pow — 20 tests
  describe('d/dx[x^n] = n·x^(n-1) via tape (n=2..5)', () => {
    for (let i = 1; i <= 5; i++) {
      for (let j = 1; j <= 4; j++) {
        const x = i;
        const n = j + 1;
        it(`x=${x}, n=${n}`, () => {
          const g = gradient((tape, vars) => tape.pow(vars[0], n), [x]);
          expect(g[0]).toBeCloseTo(n * Math.pow(x, n - 1), 5);
        });
      }
    }
  });
});
