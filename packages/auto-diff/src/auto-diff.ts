// Copyright (c) 2026 Nexara DMCC. All rights reserved.

// ---------------------------------------------------------------------------
// Forward-mode AD — Dual numbers
// ---------------------------------------------------------------------------

export class Dual {
  constructor(public real: number, public dual: number = 0) {}

  add(other: Dual): Dual {
    return new Dual(this.real + other.real, this.dual + other.dual);
  }

  sub(other: Dual): Dual {
    return new Dual(this.real - other.real, this.dual - other.dual);
  }

  mul(other: Dual): Dual {
    // (a + b*eps)(c + d*eps) = ac + (ad + bc)*eps
    return new Dual(
      this.real * other.real,
      this.real * other.dual + this.dual * other.real
    );
  }

  div(other: Dual): Dual {
    // (a + b*eps)/(c + d*eps) = a/c + (bc - ad)/c² * eps
    const r = other.real;
    return new Dual(
      this.real / r,
      (this.dual * r - this.real * other.dual) / (r * r)
    );
  }

  neg(): Dual {
    return new Dual(-this.real, -this.dual);
  }

  static sin(x: Dual): Dual {
    return new Dual(Math.sin(x.real), Math.cos(x.real) * x.dual);
  }

  static cos(x: Dual): Dual {
    return new Dual(Math.cos(x.real), -Math.sin(x.real) * x.dual);
  }

  static exp(x: Dual): Dual {
    const e = Math.exp(x.real);
    return new Dual(e, e * x.dual);
  }

  static log(x: Dual): Dual {
    return new Dual(Math.log(x.real), x.dual / x.real);
  }

  static sqrt(x: Dual): Dual {
    const s = Math.sqrt(x.real);
    return new Dual(s, x.dual / (2 * s));
  }

  static pow(x: Dual, n: number): Dual {
    const r = Math.pow(x.real, n);
    const dr = n * Math.pow(x.real, n - 1) * x.dual;
    return new Dual(r, dr);
  }

  static abs(x: Dual): Dual {
    const sign = x.real >= 0 ? 1 : -1;
    return new Dual(Math.abs(x.real), sign * x.dual);
  }

  static variable(x: number): Dual {
    return new Dual(x, 1);
  }

  static constant(x: number): Dual {
    return new Dual(x, 0);
  }
}

// ---------------------------------------------------------------------------
// Reverse-mode AD — Tape / Wengert list
// ---------------------------------------------------------------------------

export interface TapeNode {
  value: number;
  grad: number;
  // internal fields for backward pass
  _backward: () => void;
}

class TapeNodeImpl implements TapeNode {
  value: number;
  grad: number;
  _backward: () => void;

  constructor(value: number, backward: () => void = () => {}) {
    this.value = value;
    this.grad = 0;
    this._backward = backward;
  }
}

export class Tape {
  private nodes: TapeNodeImpl[] = [];

  private track(node: TapeNodeImpl): TapeNodeImpl {
    this.nodes.push(node);
    return node;
  }

  variable(value: number): TapeNode {
    return this.track(new TapeNodeImpl(value));
  }

  constant(value: number): TapeNode {
    return this.track(new TapeNodeImpl(value));
  }

  add(a: TapeNode, b: TapeNode): TapeNode {
    const out = new TapeNodeImpl(a.value + b.value, () => {
      (a as TapeNodeImpl).grad += out.grad;
      (b as TapeNodeImpl).grad += out.grad;
    });
    return this.track(out);
  }

  sub(a: TapeNode, b: TapeNode): TapeNode {
    const out = new TapeNodeImpl(a.value - b.value, () => {
      (a as TapeNodeImpl).grad += out.grad;
      (b as TapeNodeImpl).grad -= out.grad;
    });
    return this.track(out);
  }

  mul(a: TapeNode, b: TapeNode): TapeNode {
    const out = new TapeNodeImpl(a.value * b.value, () => {
      (a as TapeNodeImpl).grad += b.value * out.grad;
      (b as TapeNodeImpl).grad += a.value * out.grad;
    });
    return this.track(out);
  }

  div(a: TapeNode, b: TapeNode): TapeNode {
    const out = new TapeNodeImpl(a.value / b.value, () => {
      (a as TapeNodeImpl).grad += (1 / b.value) * out.grad;
      (b as TapeNodeImpl).grad += (-a.value / (b.value * b.value)) * out.grad;
    });
    return this.track(out);
  }

  sin(a: TapeNode): TapeNode {
    const out = new TapeNodeImpl(Math.sin(a.value), () => {
      (a as TapeNodeImpl).grad += Math.cos(a.value) * out.grad;
    });
    return this.track(out);
  }

  cos(a: TapeNode): TapeNode {
    const out = new TapeNodeImpl(Math.cos(a.value), () => {
      (a as TapeNodeImpl).grad += -Math.sin(a.value) * out.grad;
    });
    return this.track(out);
  }

  exp(a: TapeNode): TapeNode {
    const e = Math.exp(a.value);
    const out = new TapeNodeImpl(e, () => {
      (a as TapeNodeImpl).grad += e * out.grad;
    });
    return this.track(out);
  }

  log(a: TapeNode): TapeNode {
    const out = new TapeNodeImpl(Math.log(a.value), () => {
      (a as TapeNodeImpl).grad += (1 / a.value) * out.grad;
    });
    return this.track(out);
  }

  sqrt(a: TapeNode): TapeNode {
    const s = Math.sqrt(a.value);
    const out = new TapeNodeImpl(s, () => {
      (a as TapeNodeImpl).grad += (1 / (2 * s)) * out.grad;
    });
    return this.track(out);
  }

  pow(a: TapeNode, n: number): TapeNode {
    const r = Math.pow(a.value, n);
    const out = new TapeNodeImpl(r, () => {
      (a as TapeNodeImpl).grad += n * Math.pow(a.value, n - 1) * out.grad;
    });
    return this.track(out);
  }

  backward(node: TapeNode): void {
    // Seed the output gradient
    (node as TapeNodeImpl).grad = 1;
    // Traverse nodes in reverse (they were pushed in topological order)
    const all = this.nodes.slice();
    // Run backward in reverse order of creation
    for (let i = all.length - 1; i >= 0; i--) {
      all[i]._backward();
    }
  }

  gradient(node: TapeNode): number {
    return (node as TapeNodeImpl).grad;
  }

  reset(): void {
    this.nodes = [];
  }
}

// ---------------------------------------------------------------------------
// Standalone convenience functions
// ---------------------------------------------------------------------------

/**
 * Compute the derivative of f at x using forward-mode AD.
 */
export function diff(f: (x: Dual) => Dual, x: number): number {
  return f(Dual.variable(x)).dual;
}

/**
 * Compute the gradient of a multi-variable scalar function using reverse-mode AD.
 * `f` receives a Tape and an array of TapeNode variables, and returns the output TapeNode.
 */
export function gradient(
  f: (tape: Tape, vars: TapeNode[]) => TapeNode,
  values: number[]
): number[] {
  const tape = new Tape();
  const vars = values.map((v) => tape.variable(v));
  const out = f(tape, vars);
  tape.backward(out);
  return vars.map((v) => tape.gradient(v));
}

/**
 * Compute the partial derivative of f w.r.t. the variable at `varIndex`.
 * All other arguments are treated as constants (dual = 0).
 */
export function partialDerivative(
  f: (...args: Dual[]) => Dual,
  args: number[],
  varIndex: number
): number {
  const duals = args.map((v, i) =>
    i === varIndex ? Dual.variable(v) : Dual.constant(v)
  );
  return f(...duals).dual;
}
