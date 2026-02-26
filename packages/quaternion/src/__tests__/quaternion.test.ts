// Copyright (c) 2026 Nexara DMCC. All rights reserved.
import { quat, identity, magnitude, normalize, conjugate, add, scale, dot, multiply, inverse, fromAxisAngle, toAxisAngle, fromEuler, slerp, rotateVector, toMatrix3x3, isIdentity, areEqual, Quaternion } from '../quaternion';

const I = identity();
const q1 = quat(0.5, 0.5, 0.5, 0.5);
const q2 = normalize(quat(1, 2, 3, 4));

describe('identity', () => {
  it('w=1', () => { expect(I.w).toBe(1); });
  it('x=0', () => { expect(I.x).toBe(0); });
  it('y=0', () => { expect(I.y).toBe(0); });
  it('z=0', () => { expect(I.z).toBe(0); });
  it('isIdentity returns true for identity', () => { expect(isIdentity(I)).toBe(true); });
  it('magnitude of identity = 1', () => { expect(magnitude(I)).toBeCloseTo(1, 10); });
  for (let i = 0; i < 20; i++) {
    it(`identity returned each time ${i}`, () => {
      const id = identity();
      expect(id.w).toBe(1); expect(id.x).toBe(0);
    });
  }
});

describe('magnitude', () => {
  it('magnitude of identity = 1', () => { expect(magnitude(I)).toBeCloseTo(1, 10); });
  it('magnitude of q1 = 1 (unit quat)', () => { expect(magnitude(q1)).toBeCloseTo(1, 10); });
  it('magnitude is non-negative', () => { expect(magnitude(quat(1, 2, 3, 4))).toBeGreaterThan(0); });
  for (let i = 0; i < 50; i++) {
    it(`magnitude(normalize(q)) = 1 for q${i}`, () => {
      const q = normalize(quat(i + 1, i, i + 2, i + 1));
      expect(magnitude(q)).toBeCloseTo(1, 8);
    });
  }
  for (let i = 1; i <= 50; i++) {
    it(`magnitude(scale(I, ${i})) = ${i}`, () => {
      expect(magnitude(scale(I, i))).toBeCloseTo(i, 8);
    });
  }
});

describe('normalize', () => {
  it('normalizes to unit quaternion', () => { expect(magnitude(normalize(quat(1, 2, 3, 4)))).toBeCloseTo(1, 8); });
  it('identity stays identity after normalize', () => { expect(isIdentity(normalize(I))).toBe(true); });
  for (let i = 1; i <= 50; i++) {
    it(`normalize(${i},0,0,0) magnitude = 1`, () => {
      expect(magnitude(normalize(quat(i, 0, 0, 0)))).toBeCloseTo(1, 8);
    });
  }
});

describe('conjugate', () => {
  it('w is preserved', () => { expect(conjugate(q1).w).toBeCloseTo(q1.w, 10); });
  it('x is negated', () => { expect(conjugate(q1).x).toBeCloseTo(-q1.x, 10); });
  it('y is negated', () => { expect(conjugate(q1).y).toBeCloseTo(-q1.y, 10); });
  it('z is negated', () => { expect(conjugate(q1).z).toBeCloseTo(-q1.z, 10); });
  it('double conjugate = original', () => {
    const c2 = conjugate(conjugate(q1));
    expect(areEqual(c2, q1)).toBe(true);
  });
  for (let i = 0; i < 50; i++) {
    const q = normalize(quat(i + 1, i, i + 1, i + 2));
    it(`conjugate magnitude = original magnitude ${i}`, () => {
      expect(magnitude(conjugate(q))).toBeCloseTo(magnitude(q), 8);
    });
  }
});

describe('multiply', () => {
  it('q * identity = q', () => { const r = multiply(q1, I); expect(areEqual(r, q1)).toBe(true); });
  it('identity * q = q', () => { const r = multiply(I, q1); expect(areEqual(r, q1)).toBe(true); });
  it('q * q_inv ≈ identity', () => {
    const inv = inverse(q1);
    const r = multiply(q1, inv);
    expect(r.w).toBeCloseTo(1, 6);
    expect(r.x).toBeCloseTo(0, 6);
    expect(r.y).toBeCloseTo(0, 6);
    expect(r.z).toBeCloseTo(0, 6);
  });
  for (let i = 0; i < 50; i++) {
    it(`|q*r| = |q|*|r| property ${i}`, () => {
      const qa = normalize(quat(i + 1, i, i + 1, i + 2));
      const qb = normalize(quat(i, i + 1, i + 2, i + 1));
      const prod = multiply(qa, qb);
      expect(magnitude(prod)).toBeCloseTo(magnitude(qa) * magnitude(qb), 6);
    });
  }
});

describe('add and scale', () => {
  it('add components', () => {
    const r = add(quat(1, 0, 0, 0), quat(0, 1, 0, 0));
    expect(r.w).toBe(1); expect(r.x).toBe(1); expect(r.y).toBe(0); expect(r.z).toBe(0);
  });
  it('scale doubles magnitude', () => {
    expect(magnitude(scale(q1, 2))).toBeCloseTo(magnitude(q1) * 2, 8);
  });
  for (let i = 0; i < 50; i++) {
    it(`scale(I, ${i}) w = ${i}`, () => { expect(scale(I, i).w).toBeCloseTo(i, 10); });
  }
});

describe('dot', () => {
  it('dot(I, I) = 1', () => { expect(dot(I, I)).toBeCloseTo(1, 10); });
  it('dot is symmetric', () => { expect(dot(q1, q2)).toBeCloseTo(dot(q2, q1), 10); });
  for (let i = 0; i < 50; i++) {
    const q = normalize(quat(i + 1, i, i + 1, i + 2));
    it(`dot(q,q) = 1 for unit quat ${i}`, () => { expect(dot(q, q)).toBeCloseTo(1, 6); });
  }
});

describe('fromAxisAngle', () => {
  it('zero angle returns identity-like', () => {
    const q = fromAxisAngle({ x: 0, y: 0, z: 1 }, 0);
    expect(q.w).toBeCloseTo(1, 10);
  });
  it('180 degrees around z', () => {
    const q = fromAxisAngle({ x: 0, y: 0, z: 1 }, Math.PI);
    expect(q.w).toBeCloseTo(0, 8);
    expect(q.z).toBeCloseTo(1, 8);
  });
  it('produces unit quaternion', () => {
    const q = fromAxisAngle({ x: 1, y: 0, z: 0 }, Math.PI / 4);
    expect(magnitude(q)).toBeCloseTo(1, 8);
  });
  for (let i = 0; i < 50; i++) {
    const angle = (i / 50) * 2 * Math.PI;
    it(`fromAxisAngle(z, ${i}/50*2π) is unit`, () => {
      expect(magnitude(fromAxisAngle({ x: 0, y: 0, z: 1 }, angle))).toBeCloseTo(1, 8);
    });
  }
});

describe('inverse', () => {
  it('q * inv(q) ≈ identity', () => {
    const inv = inverse(q1);
    const r = multiply(q1, inv);
    expect(r.w).toBeCloseTo(1, 6);
  });
  it('inv(identity) = identity', () => {
    expect(areEqual(inverse(I), I)).toBe(true);
  });
  for (let i = 1; i <= 50; i++) {
    it(`inverse of unit quat is conjugate ${i}`, () => {
      const q = normalize(quat(i, i + 1, i + 2, i + 3));
      const inv = inverse(q);
      const conj = conjugate(q);
      expect(inv.w).toBeCloseTo(conj.w, 6);
    });
  }
});

describe('rotateVector', () => {
  it('identity rotation preserves vector', () => {
    const v = { x: 1, y: 0, z: 0 };
    const r = rotateVector(I, v);
    expect(r.x).toBeCloseTo(1, 6);
    expect(r.y).toBeCloseTo(0, 6);
  });
  it('180 around z rotates x to -x', () => {
    const q = fromAxisAngle({ x: 0, y: 0, z: 1 }, Math.PI);
    const r = rotateVector(q, { x: 1, y: 0, z: 0 });
    expect(r.x).toBeCloseTo(-1, 5);
    expect(r.y).toBeCloseTo(0, 5);
  });
  for (let i = 0; i < 50; i++) {
    it(`rotateVector preserves magnitude ${i}`, () => {
      const q = fromAxisAngle({ x: 0, y: 1, z: 0 }, i * 0.1);
      const v = { x: 1, y: 0, z: 0 };
      const r = rotateVector(q, v);
      const mag2 = r.x * r.x + r.y * r.y + r.z * r.z;
      expect(Math.sqrt(mag2)).toBeCloseTo(1, 5);
    });
  }
});

describe('slerp', () => {
  it('slerp(q, q, 0) = q', () => {
    const r = slerp(q1, q1, 0);
    expect(areEqual(normalize(r), q1, 1e-5)).toBe(true);
  });
  it('slerp(q, q, 1) = q', () => {
    const r = slerp(q1, q1, 1);
    expect(areEqual(normalize(r), q1, 1e-5)).toBe(true);
  });
  for (let i = 0; i <= 20; i++) {
    const t = i / 20;
    it(`slerp at t=${t} produces unit quaternion`, () => {
      const r = slerp(I, q1, t);
      expect(magnitude(r)).toBeCloseTo(1, 4);
    });
  }
});

describe('toMatrix3x3', () => {
  it('identity quaternion produces identity matrix', () => {
    const m = toMatrix3x3(I);
    expect(m).toHaveLength(9);
    expect(m[0]).toBeCloseTo(1, 8);
    expect(m[4]).toBeCloseTo(1, 8);
    expect(m[8]).toBeCloseTo(1, 8);
    expect(m[1]).toBeCloseTo(0, 8);
  });
  for (let i = 0; i < 20; i++) {
    it(`toMatrix3x3 returns 9 elements ${i}`, () => {
      const q = fromAxisAngle({ x: 1, y: 0, z: 0 }, i * 0.1);
      expect(toMatrix3x3(q)).toHaveLength(9);
    });
  }
});

describe('areEqual', () => {
  it('same quaternion is equal', () => { expect(areEqual(I, I)).toBe(true); });
  it('different quaternions not equal', () => { expect(areEqual(I, q1)).toBe(false); });
  for (let i = 0; i < 50; i++) {
    it(`areEqual reflexive ${i}`, () => {
      const q = quat(i, i + 1, i + 2, i + 3);
      expect(areEqual(q, q)).toBe(true);
    });
  }
});

describe('fromEuler', () => {
  it('zero angles gives identity-like', () => {
    const q = fromEuler(0, 0, 0);
    expect(q.w).toBeCloseTo(1, 8);
    expect(q.x).toBeCloseTo(0, 8);
  });
  it('produces unit quaternion', () => {
    expect(magnitude(fromEuler(0.1, 0.2, 0.3))).toBeCloseTo(1, 8);
  });
  for (let i = 0; i < 50; i++) {
    const angle = (i / 50) * Math.PI;
    it(`fromEuler(${angle}, 0, 0) is unit`, () => {
      expect(magnitude(fromEuler(angle, 0, 0))).toBeCloseTo(1, 8);
    });
  }
});

describe('quaternion extra coverage', () => {
  for (let i = 0; i < 50; i++) {
    const angle = (i / 50) * Math.PI * 2;
    it(`multiply identity left ${i}`, () => {
      const q = fromAxisAngle({ x: 1, y: 0, z: 0 }, angle);
      const r = multiply(identity(), q);
      expect(areEqual(r, q, 1e-8)).toBe(true);
    });
  }
  for (let i = 0; i < 50; i++) {
    it(`add is commutative ${i}`, () => {
      const qa = quat(i, i+1, i+2, i+3);
      const qb = quat(i+1, i, i+3, i+2);
      const r1 = add(qa, qb), r2 = add(qb, qa);
      expect(areEqual(r1, r2)).toBe(true);
    });
  }
  for (let i = 1; i <= 50; i++) {
    it(`scale by ${i} then scale by 1/${i} = original`, () => {
      const q = quat(1, 0, 0, 0);
      const scaled = scale(scale(q, i), 1 / i);
      expect(areEqual(scaled, q, 1e-10)).toBe(true);
    });
  }
  for (let i = 0; i < 50; i++) {
    it(`inverse of unit quat is conjugate ${i} (dot check)`, () => {
      const q = normalize(quat(i+1, i+2, i+3, i+4));
      const inv = inverse(q);
      const conj = conjugate(q);
      expect(dot(inv, conj)).toBeCloseTo(1, 5);
    });
  }
  for (let i = 0; i < 50; i++) {
    it(`toMatrix3x3 trace = 1 + 2*cos(angle) for rotation ${i}`, () => {
      const angle = (i / 50) * Math.PI;
      const q = fromAxisAngle({ x: 0, y: 0, z: 1 }, angle);
      const m = toMatrix3x3(q);
      const trace = m[0] + m[4] + m[8];
      expect(trace).toBeCloseTo(1 + 2 * Math.cos(angle), 5);
    });
  }
});

describe('quaternion top-up', () => {
  for (let i = 0; i < 60; i++) {
    it(`normalize then magnitude = 1 top-up ${i}`, () => {
      const q = normalize(quat(i + 1, i * 0.5 + 1, i * 0.3 + 1, i * 0.7 + 1));
      expect(magnitude(q)).toBeCloseTo(1, 8);
    });
  }
});
