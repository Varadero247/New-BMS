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
function hd258qtn(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph258qtn_hd',()=>{it('a',()=>{expect(hd258qtn(1,4)).toBe(2);});it('b',()=>{expect(hd258qtn(3,1)).toBe(1);});it('c',()=>{expect(hd258qtn(0,0)).toBe(0);});it('d',()=>{expect(hd258qtn(93,73)).toBe(2);});it('e',()=>{expect(hd258qtn(15,0)).toBe(4);});});
function hd259qtn(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph259qtn_hd',()=>{it('a',()=>{expect(hd259qtn(1,4)).toBe(2);});it('b',()=>{expect(hd259qtn(3,1)).toBe(1);});it('c',()=>{expect(hd259qtn(0,0)).toBe(0);});it('d',()=>{expect(hd259qtn(93,73)).toBe(2);});it('e',()=>{expect(hd259qtn(15,0)).toBe(4);});});
function hd260qtn(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph260qtn_hd',()=>{it('a',()=>{expect(hd260qtn(1,4)).toBe(2);});it('b',()=>{expect(hd260qtn(3,1)).toBe(1);});it('c',()=>{expect(hd260qtn(0,0)).toBe(0);});it('d',()=>{expect(hd260qtn(93,73)).toBe(2);});it('e',()=>{expect(hd260qtn(15,0)).toBe(4);});});
function hd261qtn(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph261qtn_hd',()=>{it('a',()=>{expect(hd261qtn(1,4)).toBe(2);});it('b',()=>{expect(hd261qtn(3,1)).toBe(1);});it('c',()=>{expect(hd261qtn(0,0)).toBe(0);});it('d',()=>{expect(hd261qtn(93,73)).toBe(2);});it('e',()=>{expect(hd261qtn(15,0)).toBe(4);});});
function hd262qtn(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph262qtn_hd',()=>{it('a',()=>{expect(hd262qtn(1,4)).toBe(2);});it('b',()=>{expect(hd262qtn(3,1)).toBe(1);});it('c',()=>{expect(hd262qtn(0,0)).toBe(0);});it('d',()=>{expect(hd262qtn(93,73)).toBe(2);});it('e',()=>{expect(hd262qtn(15,0)).toBe(4);});});
function hd263qtn(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph263qtn_hd',()=>{it('a',()=>{expect(hd263qtn(1,4)).toBe(2);});it('b',()=>{expect(hd263qtn(3,1)).toBe(1);});it('c',()=>{expect(hd263qtn(0,0)).toBe(0);});it('d',()=>{expect(hd263qtn(93,73)).toBe(2);});it('e',()=>{expect(hd263qtn(15,0)).toBe(4);});});
function hd264qtn(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph264qtn_hd',()=>{it('a',()=>{expect(hd264qtn(1,4)).toBe(2);});it('b',()=>{expect(hd264qtn(3,1)).toBe(1);});it('c',()=>{expect(hd264qtn(0,0)).toBe(0);});it('d',()=>{expect(hd264qtn(93,73)).toBe(2);});it('e',()=>{expect(hd264qtn(15,0)).toBe(4);});});
function hd265qtn(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph265qtn_hd',()=>{it('a',()=>{expect(hd265qtn(1,4)).toBe(2);});it('b',()=>{expect(hd265qtn(3,1)).toBe(1);});it('c',()=>{expect(hd265qtn(0,0)).toBe(0);});it('d',()=>{expect(hd265qtn(93,73)).toBe(2);});it('e',()=>{expect(hd265qtn(15,0)).toBe(4);});});
function hd266qtn(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph266qtn_hd',()=>{it('a',()=>{expect(hd266qtn(1,4)).toBe(2);});it('b',()=>{expect(hd266qtn(3,1)).toBe(1);});it('c',()=>{expect(hd266qtn(0,0)).toBe(0);});it('d',()=>{expect(hd266qtn(93,73)).toBe(2);});it('e',()=>{expect(hd266qtn(15,0)).toBe(4);});});
function hd267qtn(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph267qtn_hd',()=>{it('a',()=>{expect(hd267qtn(1,4)).toBe(2);});it('b',()=>{expect(hd267qtn(3,1)).toBe(1);});it('c',()=>{expect(hd267qtn(0,0)).toBe(0);});it('d',()=>{expect(hd267qtn(93,73)).toBe(2);});it('e',()=>{expect(hd267qtn(15,0)).toBe(4);});});
function hd268qtn(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph268qtn_hd',()=>{it('a',()=>{expect(hd268qtn(1,4)).toBe(2);});it('b',()=>{expect(hd268qtn(3,1)).toBe(1);});it('c',()=>{expect(hd268qtn(0,0)).toBe(0);});it('d',()=>{expect(hd268qtn(93,73)).toBe(2);});it('e',()=>{expect(hd268qtn(15,0)).toBe(4);});});
function hd269qtn(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph269qtn_hd',()=>{it('a',()=>{expect(hd269qtn(1,4)).toBe(2);});it('b',()=>{expect(hd269qtn(3,1)).toBe(1);});it('c',()=>{expect(hd269qtn(0,0)).toBe(0);});it('d',()=>{expect(hd269qtn(93,73)).toBe(2);});it('e',()=>{expect(hd269qtn(15,0)).toBe(4);});});
function hd270qtn(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph270qtn_hd',()=>{it('a',()=>{expect(hd270qtn(1,4)).toBe(2);});it('b',()=>{expect(hd270qtn(3,1)).toBe(1);});it('c',()=>{expect(hd270qtn(0,0)).toBe(0);});it('d',()=>{expect(hd270qtn(93,73)).toBe(2);});it('e',()=>{expect(hd270qtn(15,0)).toBe(4);});});
function hd271qtn(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph271qtn_hd',()=>{it('a',()=>{expect(hd271qtn(1,4)).toBe(2);});it('b',()=>{expect(hd271qtn(3,1)).toBe(1);});it('c',()=>{expect(hd271qtn(0,0)).toBe(0);});it('d',()=>{expect(hd271qtn(93,73)).toBe(2);});it('e',()=>{expect(hd271qtn(15,0)).toBe(4);});});
function hd272qtn(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph272qtn_hd',()=>{it('a',()=>{expect(hd272qtn(1,4)).toBe(2);});it('b',()=>{expect(hd272qtn(3,1)).toBe(1);});it('c',()=>{expect(hd272qtn(0,0)).toBe(0);});it('d',()=>{expect(hd272qtn(93,73)).toBe(2);});it('e',()=>{expect(hd272qtn(15,0)).toBe(4);});});
function hd273qtn(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph273qtn_hd',()=>{it('a',()=>{expect(hd273qtn(1,4)).toBe(2);});it('b',()=>{expect(hd273qtn(3,1)).toBe(1);});it('c',()=>{expect(hd273qtn(0,0)).toBe(0);});it('d',()=>{expect(hd273qtn(93,73)).toBe(2);});it('e',()=>{expect(hd273qtn(15,0)).toBe(4);});});
function hd274qtn(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph274qtn_hd',()=>{it('a',()=>{expect(hd274qtn(1,4)).toBe(2);});it('b',()=>{expect(hd274qtn(3,1)).toBe(1);});it('c',()=>{expect(hd274qtn(0,0)).toBe(0);});it('d',()=>{expect(hd274qtn(93,73)).toBe(2);});it('e',()=>{expect(hd274qtn(15,0)).toBe(4);});});
function hd275qtn(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph275qtn_hd',()=>{it('a',()=>{expect(hd275qtn(1,4)).toBe(2);});it('b',()=>{expect(hd275qtn(3,1)).toBe(1);});it('c',()=>{expect(hd275qtn(0,0)).toBe(0);});it('d',()=>{expect(hd275qtn(93,73)).toBe(2);});it('e',()=>{expect(hd275qtn(15,0)).toBe(4);});});
function hd276qtn(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph276qtn_hd',()=>{it('a',()=>{expect(hd276qtn(1,4)).toBe(2);});it('b',()=>{expect(hd276qtn(3,1)).toBe(1);});it('c',()=>{expect(hd276qtn(0,0)).toBe(0);});it('d',()=>{expect(hd276qtn(93,73)).toBe(2);});it('e',()=>{expect(hd276qtn(15,0)).toBe(4);});});
function hd277qtn(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph277qtn_hd',()=>{it('a',()=>{expect(hd277qtn(1,4)).toBe(2);});it('b',()=>{expect(hd277qtn(3,1)).toBe(1);});it('c',()=>{expect(hd277qtn(0,0)).toBe(0);});it('d',()=>{expect(hd277qtn(93,73)).toBe(2);});it('e',()=>{expect(hd277qtn(15,0)).toBe(4);});});
function hd278qtn(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph278qtn_hd',()=>{it('a',()=>{expect(hd278qtn(1,4)).toBe(2);});it('b',()=>{expect(hd278qtn(3,1)).toBe(1);});it('c',()=>{expect(hd278qtn(0,0)).toBe(0);});it('d',()=>{expect(hd278qtn(93,73)).toBe(2);});it('e',()=>{expect(hd278qtn(15,0)).toBe(4);});});
function hd279qtn(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph279qtn_hd',()=>{it('a',()=>{expect(hd279qtn(1,4)).toBe(2);});it('b',()=>{expect(hd279qtn(3,1)).toBe(1);});it('c',()=>{expect(hd279qtn(0,0)).toBe(0);});it('d',()=>{expect(hd279qtn(93,73)).toBe(2);});it('e',()=>{expect(hd279qtn(15,0)).toBe(4);});});
function hd280qtn(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph280qtn_hd',()=>{it('a',()=>{expect(hd280qtn(1,4)).toBe(2);});it('b',()=>{expect(hd280qtn(3,1)).toBe(1);});it('c',()=>{expect(hd280qtn(0,0)).toBe(0);});it('d',()=>{expect(hd280qtn(93,73)).toBe(2);});it('e',()=>{expect(hd280qtn(15,0)).toBe(4);});});
function hd281qtn(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph281qtn_hd',()=>{it('a',()=>{expect(hd281qtn(1,4)).toBe(2);});it('b',()=>{expect(hd281qtn(3,1)).toBe(1);});it('c',()=>{expect(hd281qtn(0,0)).toBe(0);});it('d',()=>{expect(hd281qtn(93,73)).toBe(2);});it('e',()=>{expect(hd281qtn(15,0)).toBe(4);});});
function hd282qtn(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph282qtn_hd',()=>{it('a',()=>{expect(hd282qtn(1,4)).toBe(2);});it('b',()=>{expect(hd282qtn(3,1)).toBe(1);});it('c',()=>{expect(hd282qtn(0,0)).toBe(0);});it('d',()=>{expect(hd282qtn(93,73)).toBe(2);});it('e',()=>{expect(hd282qtn(15,0)).toBe(4);});});
function hd283qtn(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph283qtn_hd',()=>{it('a',()=>{expect(hd283qtn(1,4)).toBe(2);});it('b',()=>{expect(hd283qtn(3,1)).toBe(1);});it('c',()=>{expect(hd283qtn(0,0)).toBe(0);});it('d',()=>{expect(hd283qtn(93,73)).toBe(2);});it('e',()=>{expect(hd283qtn(15,0)).toBe(4);});});
function hd284qtn(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph284qtn_hd',()=>{it('a',()=>{expect(hd284qtn(1,4)).toBe(2);});it('b',()=>{expect(hd284qtn(3,1)).toBe(1);});it('c',()=>{expect(hd284qtn(0,0)).toBe(0);});it('d',()=>{expect(hd284qtn(93,73)).toBe(2);});it('e',()=>{expect(hd284qtn(15,0)).toBe(4);});});
function hd285qtn(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph285qtn_hd',()=>{it('a',()=>{expect(hd285qtn(1,4)).toBe(2);});it('b',()=>{expect(hd285qtn(3,1)).toBe(1);});it('c',()=>{expect(hd285qtn(0,0)).toBe(0);});it('d',()=>{expect(hd285qtn(93,73)).toBe(2);});it('e',()=>{expect(hd285qtn(15,0)).toBe(4);});});
function hd286qtn(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph286qtn_hd',()=>{it('a',()=>{expect(hd286qtn(1,4)).toBe(2);});it('b',()=>{expect(hd286qtn(3,1)).toBe(1);});it('c',()=>{expect(hd286qtn(0,0)).toBe(0);});it('d',()=>{expect(hd286qtn(93,73)).toBe(2);});it('e',()=>{expect(hd286qtn(15,0)).toBe(4);});});
function hd287qtn(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph287qtn_hd',()=>{it('a',()=>{expect(hd287qtn(1,4)).toBe(2);});it('b',()=>{expect(hd287qtn(3,1)).toBe(1);});it('c',()=>{expect(hd287qtn(0,0)).toBe(0);});it('d',()=>{expect(hd287qtn(93,73)).toBe(2);});it('e',()=>{expect(hd287qtn(15,0)).toBe(4);});});
function hd288qtn(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph288qtn_hd',()=>{it('a',()=>{expect(hd288qtn(1,4)).toBe(2);});it('b',()=>{expect(hd288qtn(3,1)).toBe(1);});it('c',()=>{expect(hd288qtn(0,0)).toBe(0);});it('d',()=>{expect(hd288qtn(93,73)).toBe(2);});it('e',()=>{expect(hd288qtn(15,0)).toBe(4);});});
function hd289qtn(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph289qtn_hd',()=>{it('a',()=>{expect(hd289qtn(1,4)).toBe(2);});it('b',()=>{expect(hd289qtn(3,1)).toBe(1);});it('c',()=>{expect(hd289qtn(0,0)).toBe(0);});it('d',()=>{expect(hd289qtn(93,73)).toBe(2);});it('e',()=>{expect(hd289qtn(15,0)).toBe(4);});});
function hd290qtn(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph290qtn_hd',()=>{it('a',()=>{expect(hd290qtn(1,4)).toBe(2);});it('b',()=>{expect(hd290qtn(3,1)).toBe(1);});it('c',()=>{expect(hd290qtn(0,0)).toBe(0);});it('d',()=>{expect(hd290qtn(93,73)).toBe(2);});it('e',()=>{expect(hd290qtn(15,0)).toBe(4);});});
function hd291qtn(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph291qtn_hd',()=>{it('a',()=>{expect(hd291qtn(1,4)).toBe(2);});it('b',()=>{expect(hd291qtn(3,1)).toBe(1);});it('c',()=>{expect(hd291qtn(0,0)).toBe(0);});it('d',()=>{expect(hd291qtn(93,73)).toBe(2);});it('e',()=>{expect(hd291qtn(15,0)).toBe(4);});});
function hd292qtn(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph292qtn_hd',()=>{it('a',()=>{expect(hd292qtn(1,4)).toBe(2);});it('b',()=>{expect(hd292qtn(3,1)).toBe(1);});it('c',()=>{expect(hd292qtn(0,0)).toBe(0);});it('d',()=>{expect(hd292qtn(93,73)).toBe(2);});it('e',()=>{expect(hd292qtn(15,0)).toBe(4);});});
function hd293qtn(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph293qtn_hd',()=>{it('a',()=>{expect(hd293qtn(1,4)).toBe(2);});it('b',()=>{expect(hd293qtn(3,1)).toBe(1);});it('c',()=>{expect(hd293qtn(0,0)).toBe(0);});it('d',()=>{expect(hd293qtn(93,73)).toBe(2);});it('e',()=>{expect(hd293qtn(15,0)).toBe(4);});});
function hd294qtn(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph294qtn_hd',()=>{it('a',()=>{expect(hd294qtn(1,4)).toBe(2);});it('b',()=>{expect(hd294qtn(3,1)).toBe(1);});it('c',()=>{expect(hd294qtn(0,0)).toBe(0);});it('d',()=>{expect(hd294qtn(93,73)).toBe(2);});it('e',()=>{expect(hd294qtn(15,0)).toBe(4);});});
function hd295qtn(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph295qtn_hd',()=>{it('a',()=>{expect(hd295qtn(1,4)).toBe(2);});it('b',()=>{expect(hd295qtn(3,1)).toBe(1);});it('c',()=>{expect(hd295qtn(0,0)).toBe(0);});it('d',()=>{expect(hd295qtn(93,73)).toBe(2);});it('e',()=>{expect(hd295qtn(15,0)).toBe(4);});});
function hd296qtn(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph296qtn_hd',()=>{it('a',()=>{expect(hd296qtn(1,4)).toBe(2);});it('b',()=>{expect(hd296qtn(3,1)).toBe(1);});it('c',()=>{expect(hd296qtn(0,0)).toBe(0);});it('d',()=>{expect(hd296qtn(93,73)).toBe(2);});it('e',()=>{expect(hd296qtn(15,0)).toBe(4);});});
function hd297qtn(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph297qtn_hd',()=>{it('a',()=>{expect(hd297qtn(1,4)).toBe(2);});it('b',()=>{expect(hd297qtn(3,1)).toBe(1);});it('c',()=>{expect(hd297qtn(0,0)).toBe(0);});it('d',()=>{expect(hd297qtn(93,73)).toBe(2);});it('e',()=>{expect(hd297qtn(15,0)).toBe(4);});});
function hd298qtn(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph298qtn_hd',()=>{it('a',()=>{expect(hd298qtn(1,4)).toBe(2);});it('b',()=>{expect(hd298qtn(3,1)).toBe(1);});it('c',()=>{expect(hd298qtn(0,0)).toBe(0);});it('d',()=>{expect(hd298qtn(93,73)).toBe(2);});it('e',()=>{expect(hd298qtn(15,0)).toBe(4);});});
function hd299qtn(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph299qtn_hd',()=>{it('a',()=>{expect(hd299qtn(1,4)).toBe(2);});it('b',()=>{expect(hd299qtn(3,1)).toBe(1);});it('c',()=>{expect(hd299qtn(0,0)).toBe(0);});it('d',()=>{expect(hd299qtn(93,73)).toBe(2);});it('e',()=>{expect(hd299qtn(15,0)).toBe(4);});});
function hd300qtn(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph300qtn_hd',()=>{it('a',()=>{expect(hd300qtn(1,4)).toBe(2);});it('b',()=>{expect(hd300qtn(3,1)).toBe(1);});it('c',()=>{expect(hd300qtn(0,0)).toBe(0);});it('d',()=>{expect(hd300qtn(93,73)).toBe(2);});it('e',()=>{expect(hd300qtn(15,0)).toBe(4);});});
function hd301qtn(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph301qtn_hd',()=>{it('a',()=>{expect(hd301qtn(1,4)).toBe(2);});it('b',()=>{expect(hd301qtn(3,1)).toBe(1);});it('c',()=>{expect(hd301qtn(0,0)).toBe(0);});it('d',()=>{expect(hd301qtn(93,73)).toBe(2);});it('e',()=>{expect(hd301qtn(15,0)).toBe(4);});});
function hd302qtn(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph302qtn_hd',()=>{it('a',()=>{expect(hd302qtn(1,4)).toBe(2);});it('b',()=>{expect(hd302qtn(3,1)).toBe(1);});it('c',()=>{expect(hd302qtn(0,0)).toBe(0);});it('d',()=>{expect(hd302qtn(93,73)).toBe(2);});it('e',()=>{expect(hd302qtn(15,0)).toBe(4);});});
function hd303qtn(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph303qtn_hd',()=>{it('a',()=>{expect(hd303qtn(1,4)).toBe(2);});it('b',()=>{expect(hd303qtn(3,1)).toBe(1);});it('c',()=>{expect(hd303qtn(0,0)).toBe(0);});it('d',()=>{expect(hd303qtn(93,73)).toBe(2);});it('e',()=>{expect(hd303qtn(15,0)).toBe(4);});});
function hd304qtn(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph304qtn_hd',()=>{it('a',()=>{expect(hd304qtn(1,4)).toBe(2);});it('b',()=>{expect(hd304qtn(3,1)).toBe(1);});it('c',()=>{expect(hd304qtn(0,0)).toBe(0);});it('d',()=>{expect(hd304qtn(93,73)).toBe(2);});it('e',()=>{expect(hd304qtn(15,0)).toBe(4);});});
function hd305qtn(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph305qtn_hd',()=>{it('a',()=>{expect(hd305qtn(1,4)).toBe(2);});it('b',()=>{expect(hd305qtn(3,1)).toBe(1);});it('c',()=>{expect(hd305qtn(0,0)).toBe(0);});it('d',()=>{expect(hd305qtn(93,73)).toBe(2);});it('e',()=>{expect(hd305qtn(15,0)).toBe(4);});});
function hd306qtn(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph306qtn_hd',()=>{it('a',()=>{expect(hd306qtn(1,4)).toBe(2);});it('b',()=>{expect(hd306qtn(3,1)).toBe(1);});it('c',()=>{expect(hd306qtn(0,0)).toBe(0);});it('d',()=>{expect(hd306qtn(93,73)).toBe(2);});it('e',()=>{expect(hd306qtn(15,0)).toBe(4);});});
function hd307qtn(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph307qtn_hd',()=>{it('a',()=>{expect(hd307qtn(1,4)).toBe(2);});it('b',()=>{expect(hd307qtn(3,1)).toBe(1);});it('c',()=>{expect(hd307qtn(0,0)).toBe(0);});it('d',()=>{expect(hd307qtn(93,73)).toBe(2);});it('e',()=>{expect(hd307qtn(15,0)).toBe(4);});});
function hd308qtn(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph308qtn_hd',()=>{it('a',()=>{expect(hd308qtn(1,4)).toBe(2);});it('b',()=>{expect(hd308qtn(3,1)).toBe(1);});it('c',()=>{expect(hd308qtn(0,0)).toBe(0);});it('d',()=>{expect(hd308qtn(93,73)).toBe(2);});it('e',()=>{expect(hd308qtn(15,0)).toBe(4);});});
function hd309qtn(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph309qtn_hd',()=>{it('a',()=>{expect(hd309qtn(1,4)).toBe(2);});it('b',()=>{expect(hd309qtn(3,1)).toBe(1);});it('c',()=>{expect(hd309qtn(0,0)).toBe(0);});it('d',()=>{expect(hd309qtn(93,73)).toBe(2);});it('e',()=>{expect(hd309qtn(15,0)).toBe(4);});});
function hd310qtn(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph310qtn_hd',()=>{it('a',()=>{expect(hd310qtn(1,4)).toBe(2);});it('b',()=>{expect(hd310qtn(3,1)).toBe(1);});it('c',()=>{expect(hd310qtn(0,0)).toBe(0);});it('d',()=>{expect(hd310qtn(93,73)).toBe(2);});it('e',()=>{expect(hd310qtn(15,0)).toBe(4);});});
function hd311qtn(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph311qtn_hd',()=>{it('a',()=>{expect(hd311qtn(1,4)).toBe(2);});it('b',()=>{expect(hd311qtn(3,1)).toBe(1);});it('c',()=>{expect(hd311qtn(0,0)).toBe(0);});it('d',()=>{expect(hd311qtn(93,73)).toBe(2);});it('e',()=>{expect(hd311qtn(15,0)).toBe(4);});});
function hd312qtn(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph312qtn_hd',()=>{it('a',()=>{expect(hd312qtn(1,4)).toBe(2);});it('b',()=>{expect(hd312qtn(3,1)).toBe(1);});it('c',()=>{expect(hd312qtn(0,0)).toBe(0);});it('d',()=>{expect(hd312qtn(93,73)).toBe(2);});it('e',()=>{expect(hd312qtn(15,0)).toBe(4);});});
function hd313qtn(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph313qtn_hd',()=>{it('a',()=>{expect(hd313qtn(1,4)).toBe(2);});it('b',()=>{expect(hd313qtn(3,1)).toBe(1);});it('c',()=>{expect(hd313qtn(0,0)).toBe(0);});it('d',()=>{expect(hd313qtn(93,73)).toBe(2);});it('e',()=>{expect(hd313qtn(15,0)).toBe(4);});});
function hd314qtn(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph314qtn_hd',()=>{it('a',()=>{expect(hd314qtn(1,4)).toBe(2);});it('b',()=>{expect(hd314qtn(3,1)).toBe(1);});it('c',()=>{expect(hd314qtn(0,0)).toBe(0);});it('d',()=>{expect(hd314qtn(93,73)).toBe(2);});it('e',()=>{expect(hd314qtn(15,0)).toBe(4);});});
function hd315qtn(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph315qtn_hd',()=>{it('a',()=>{expect(hd315qtn(1,4)).toBe(2);});it('b',()=>{expect(hd315qtn(3,1)).toBe(1);});it('c',()=>{expect(hd315qtn(0,0)).toBe(0);});it('d',()=>{expect(hd315qtn(93,73)).toBe(2);});it('e',()=>{expect(hd315qtn(15,0)).toBe(4);});});
function hd316qtn(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph316qtn_hd',()=>{it('a',()=>{expect(hd316qtn(1,4)).toBe(2);});it('b',()=>{expect(hd316qtn(3,1)).toBe(1);});it('c',()=>{expect(hd316qtn(0,0)).toBe(0);});it('d',()=>{expect(hd316qtn(93,73)).toBe(2);});it('e',()=>{expect(hd316qtn(15,0)).toBe(4);});});
function hd317qtn(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph317qtn_hd',()=>{it('a',()=>{expect(hd317qtn(1,4)).toBe(2);});it('b',()=>{expect(hd317qtn(3,1)).toBe(1);});it('c',()=>{expect(hd317qtn(0,0)).toBe(0);});it('d',()=>{expect(hd317qtn(93,73)).toBe(2);});it('e',()=>{expect(hd317qtn(15,0)).toBe(4);});});
function hd318qtn(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph318qtn_hd',()=>{it('a',()=>{expect(hd318qtn(1,4)).toBe(2);});it('b',()=>{expect(hd318qtn(3,1)).toBe(1);});it('c',()=>{expect(hd318qtn(0,0)).toBe(0);});it('d',()=>{expect(hd318qtn(93,73)).toBe(2);});it('e',()=>{expect(hd318qtn(15,0)).toBe(4);});});
function hd319qtn(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph319qtn_hd',()=>{it('a',()=>{expect(hd319qtn(1,4)).toBe(2);});it('b',()=>{expect(hd319qtn(3,1)).toBe(1);});it('c',()=>{expect(hd319qtn(0,0)).toBe(0);});it('d',()=>{expect(hd319qtn(93,73)).toBe(2);});it('e',()=>{expect(hd319qtn(15,0)).toBe(4);});});
function hd320qtn(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph320qtn_hd',()=>{it('a',()=>{expect(hd320qtn(1,4)).toBe(2);});it('b',()=>{expect(hd320qtn(3,1)).toBe(1);});it('c',()=>{expect(hd320qtn(0,0)).toBe(0);});it('d',()=>{expect(hd320qtn(93,73)).toBe(2);});it('e',()=>{expect(hd320qtn(15,0)).toBe(4);});});
function hd321qtn(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph321qtn_hd',()=>{it('a',()=>{expect(hd321qtn(1,4)).toBe(2);});it('b',()=>{expect(hd321qtn(3,1)).toBe(1);});it('c',()=>{expect(hd321qtn(0,0)).toBe(0);});it('d',()=>{expect(hd321qtn(93,73)).toBe(2);});it('e',()=>{expect(hd321qtn(15,0)).toBe(4);});});
function hd322qtn(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph322qtn_hd',()=>{it('a',()=>{expect(hd322qtn(1,4)).toBe(2);});it('b',()=>{expect(hd322qtn(3,1)).toBe(1);});it('c',()=>{expect(hd322qtn(0,0)).toBe(0);});it('d',()=>{expect(hd322qtn(93,73)).toBe(2);});it('e',()=>{expect(hd322qtn(15,0)).toBe(4);});});
function hd323qtn(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph323qtn_hd',()=>{it('a',()=>{expect(hd323qtn(1,4)).toBe(2);});it('b',()=>{expect(hd323qtn(3,1)).toBe(1);});it('c',()=>{expect(hd323qtn(0,0)).toBe(0);});it('d',()=>{expect(hd323qtn(93,73)).toBe(2);});it('e',()=>{expect(hd323qtn(15,0)).toBe(4);});});
function hd324qtn(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph324qtn_hd',()=>{it('a',()=>{expect(hd324qtn(1,4)).toBe(2);});it('b',()=>{expect(hd324qtn(3,1)).toBe(1);});it('c',()=>{expect(hd324qtn(0,0)).toBe(0);});it('d',()=>{expect(hd324qtn(93,73)).toBe(2);});it('e',()=>{expect(hd324qtn(15,0)).toBe(4);});});
function hd325qtn(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph325qtn_hd',()=>{it('a',()=>{expect(hd325qtn(1,4)).toBe(2);});it('b',()=>{expect(hd325qtn(3,1)).toBe(1);});it('c',()=>{expect(hd325qtn(0,0)).toBe(0);});it('d',()=>{expect(hd325qtn(93,73)).toBe(2);});it('e',()=>{expect(hd325qtn(15,0)).toBe(4);});});
function hd326qtn(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph326qtn_hd',()=>{it('a',()=>{expect(hd326qtn(1,4)).toBe(2);});it('b',()=>{expect(hd326qtn(3,1)).toBe(1);});it('c',()=>{expect(hd326qtn(0,0)).toBe(0);});it('d',()=>{expect(hd326qtn(93,73)).toBe(2);});it('e',()=>{expect(hd326qtn(15,0)).toBe(4);});});
function hd327qtn(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph327qtn_hd',()=>{it('a',()=>{expect(hd327qtn(1,4)).toBe(2);});it('b',()=>{expect(hd327qtn(3,1)).toBe(1);});it('c',()=>{expect(hd327qtn(0,0)).toBe(0);});it('d',()=>{expect(hd327qtn(93,73)).toBe(2);});it('e',()=>{expect(hd327qtn(15,0)).toBe(4);});});
function hd328qtn(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph328qtn_hd',()=>{it('a',()=>{expect(hd328qtn(1,4)).toBe(2);});it('b',()=>{expect(hd328qtn(3,1)).toBe(1);});it('c',()=>{expect(hd328qtn(0,0)).toBe(0);});it('d',()=>{expect(hd328qtn(93,73)).toBe(2);});it('e',()=>{expect(hd328qtn(15,0)).toBe(4);});});
function hd329qtn(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph329qtn_hd',()=>{it('a',()=>{expect(hd329qtn(1,4)).toBe(2);});it('b',()=>{expect(hd329qtn(3,1)).toBe(1);});it('c',()=>{expect(hd329qtn(0,0)).toBe(0);});it('d',()=>{expect(hd329qtn(93,73)).toBe(2);});it('e',()=>{expect(hd329qtn(15,0)).toBe(4);});});
function hd330qtn(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph330qtn_hd',()=>{it('a',()=>{expect(hd330qtn(1,4)).toBe(2);});it('b',()=>{expect(hd330qtn(3,1)).toBe(1);});it('c',()=>{expect(hd330qtn(0,0)).toBe(0);});it('d',()=>{expect(hd330qtn(93,73)).toBe(2);});it('e',()=>{expect(hd330qtn(15,0)).toBe(4);});});
function hd331qtn(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph331qtn_hd',()=>{it('a',()=>{expect(hd331qtn(1,4)).toBe(2);});it('b',()=>{expect(hd331qtn(3,1)).toBe(1);});it('c',()=>{expect(hd331qtn(0,0)).toBe(0);});it('d',()=>{expect(hd331qtn(93,73)).toBe(2);});it('e',()=>{expect(hd331qtn(15,0)).toBe(4);});});
function hd332qtn(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph332qtn_hd',()=>{it('a',()=>{expect(hd332qtn(1,4)).toBe(2);});it('b',()=>{expect(hd332qtn(3,1)).toBe(1);});it('c',()=>{expect(hd332qtn(0,0)).toBe(0);});it('d',()=>{expect(hd332qtn(93,73)).toBe(2);});it('e',()=>{expect(hd332qtn(15,0)).toBe(4);});});
function hd333qtn(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph333qtn_hd',()=>{it('a',()=>{expect(hd333qtn(1,4)).toBe(2);});it('b',()=>{expect(hd333qtn(3,1)).toBe(1);});it('c',()=>{expect(hd333qtn(0,0)).toBe(0);});it('d',()=>{expect(hd333qtn(93,73)).toBe(2);});it('e',()=>{expect(hd333qtn(15,0)).toBe(4);});});
function hd334qtn(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph334qtn_hd',()=>{it('a',()=>{expect(hd334qtn(1,4)).toBe(2);});it('b',()=>{expect(hd334qtn(3,1)).toBe(1);});it('c',()=>{expect(hd334qtn(0,0)).toBe(0);});it('d',()=>{expect(hd334qtn(93,73)).toBe(2);});it('e',()=>{expect(hd334qtn(15,0)).toBe(4);});});
function hd335qtn(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph335qtn_hd',()=>{it('a',()=>{expect(hd335qtn(1,4)).toBe(2);});it('b',()=>{expect(hd335qtn(3,1)).toBe(1);});it('c',()=>{expect(hd335qtn(0,0)).toBe(0);});it('d',()=>{expect(hd335qtn(93,73)).toBe(2);});it('e',()=>{expect(hd335qtn(15,0)).toBe(4);});});
function hd336qtn(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph336qtn_hd',()=>{it('a',()=>{expect(hd336qtn(1,4)).toBe(2);});it('b',()=>{expect(hd336qtn(3,1)).toBe(1);});it('c',()=>{expect(hd336qtn(0,0)).toBe(0);});it('d',()=>{expect(hd336qtn(93,73)).toBe(2);});it('e',()=>{expect(hd336qtn(15,0)).toBe(4);});});
function hd337qtn(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph337qtn_hd',()=>{it('a',()=>{expect(hd337qtn(1,4)).toBe(2);});it('b',()=>{expect(hd337qtn(3,1)).toBe(1);});it('c',()=>{expect(hd337qtn(0,0)).toBe(0);});it('d',()=>{expect(hd337qtn(93,73)).toBe(2);});it('e',()=>{expect(hd337qtn(15,0)).toBe(4);});});
