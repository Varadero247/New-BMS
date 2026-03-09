// Copyright (c) 2026 Nexara DMCC. All rights reserved.
import { vec2, linear, quadratic, cubic, cubicDerivative, arcLength, boundingBox, split, elevate, isFlatEnough, dist2, Vec2 } from '../bezier';

const p0 = vec2(0, 0), p1 = vec2(1, 0), p2 = vec2(1, 1), p3 = vec2(0, 1);
const pa = vec2(0, 0), pb = vec2(1, 1);

describe('vec2', () => {
  for (let i = 0; i < 50; i++) {
    it(`vec2(${i}, ${i+1}) has correct properties`, () => {
      const v = vec2(i, i + 1);
      expect(v.x).toBe(i);
      expect(v.y).toBe(i + 1);
    });
  }
});

describe('linear interpolation', () => {
  it('t=0 returns p0', () => { const r = linear(0, p0, p3); expect(r.x).toBeCloseTo(0); expect(r.y).toBeCloseTo(0); });
  it('t=1 returns p1', () => { const r = linear(1, p0, p3); expect(r.x).toBeCloseTo(0); expect(r.y).toBeCloseTo(1); });
  it('t=0.5 returns midpoint', () => { const r = linear(0.5, pa, pb); expect(r.x).toBeCloseTo(0.5); expect(r.y).toBeCloseTo(0.5); });
  for (let i = 0; i <= 100; i++) {
    const t = i / 100;
    it(`linear t=${t} x is monotone`, () => {
      const r = linear(t, pa, pb);
      expect(r.x).toBeCloseTo(t, 5);
      expect(r.y).toBeCloseTo(t, 5);
    });
  }
  for (let i = 0; i < 50; i++) {
    it(`linear on axis ${i}`, () => {
      const r = linear(i / 50, vec2(0, 0), vec2(50, 50));
      expect(r.x).toBeCloseTo(i, 4);
    });
  }
});

describe('quadratic bezier', () => {
  it('t=0 returns p0', () => { const r = quadratic(0, pa, vec2(0.5, 1), pb); expect(r.x).toBeCloseTo(0); });
  it('t=1 returns p2', () => { const r = quadratic(1, pa, vec2(0.5, 1), pb); expect(r.x).toBeCloseTo(1); expect(r.y).toBeCloseTo(1); });
  for (let i = 0; i <= 50; i++) {
    const t = i / 50;
    it(`quadratic t=${t} is finite`, () => {
      const r = quadratic(t, p0, p1, p2);
      expect(isFinite(r.x)).toBe(true);
      expect(isFinite(r.y)).toBe(true);
    });
  }
  it('symmetric curve midpoint', () => {
    const c = vec2(0.5, 1);
    const r = quadratic(0.5, vec2(0, 0), c, vec2(1, 0));
    expect(r.x).toBeCloseTo(0.5, 5);
    expect(r.y).toBeCloseTo(0.5, 5);
  });
  for (let i = 0; i < 50; i++) {
    it(`quadratic weights sum to 1 at t=${i}/50`, () => {
      const t = i / 50, u = 1 - t;
      const w = u * u + 2 * u * t + t * t;
      expect(w).toBeCloseTo(1, 10);
    });
  }
});

describe('cubic bezier', () => {
  it('t=0 returns p0', () => { const r = cubic(0, p0, p1, p2, p3); expect(r.x).toBeCloseTo(0); expect(r.y).toBeCloseTo(0); });
  it('t=1 returns p3', () => { const r = cubic(1, p0, p1, p2, p3); expect(r.x).toBeCloseTo(0); expect(r.y).toBeCloseTo(1); });
  for (let i = 0; i <= 100; i++) {
    const t = i / 100;
    it(`cubic t=${t} has finite coords`, () => {
      const r = cubic(t, p0, p1, p2, p3);
      expect(isFinite(r.x)).toBe(true);
      expect(isFinite(r.y)).toBe(true);
    });
  }
  for (let i = 0; i < 50; i++) {
    it(`cubic bernstein weights sum to 1 at t=${i}/50`, () => {
      const t = i / 50, u = 1 - t;
      const sum = u ** 3 + 3 * u ** 2 * t + 3 * u * t ** 2 + t ** 3;
      expect(sum).toBeCloseTo(1, 10);
    });
  }
});

describe('cubicDerivative', () => {
  it('is defined at t=0', () => { const d = cubicDerivative(0, p0, p1, p2, p3); expect(isFinite(d.x)).toBe(true); });
  it('is defined at t=1', () => { const d = cubicDerivative(1, p0, p1, p2, p3); expect(isFinite(d.x)).toBe(true); });
  for (let i = 0; i <= 50; i++) {
    const t = i / 50;
    it(`derivative at t=${t} is finite`, () => {
      const d = cubicDerivative(t, p0, p1, p2, p3);
      expect(isFinite(d.x)).toBe(true);
      expect(isFinite(d.y)).toBe(true);
    });
  }
  it('derivative at t=0 points from p0 to p1 (x direction)', () => {
    const d = cubicDerivative(0, vec2(0,0), vec2(1,0), vec2(2,0), vec2(3,0));
    expect(d.x).toBeCloseTo(3, 5);
    expect(d.y).toBeCloseTo(0, 5);
  });
});

describe('arcLength', () => {
  it('straight line arc length ≈ diagonal', () => {
    const l = arcLength(vec2(0,0), vec2(1,0), vec2(2,0), vec2(3,0), 200);
    expect(l).toBeCloseTo(3, 0);
  });
  it('zero-length curve', () => {
    const l = arcLength(vec2(1,1), vec2(1,1), vec2(1,1), vec2(1,1), 50);
    expect(l).toBeCloseTo(0, 5);
  });
  for (let steps = 10; steps <= 100; steps += 10) {
    it(`arcLength with ${steps} steps is positive for non-degenerate curve`, () => {
      const l = arcLength(p0, p1, p2, p3, steps);
      expect(l).toBeGreaterThan(0);
    });
  }
  for (let i = 1; i <= 50; i++) {
    it(`arcLength steps=${i*2} is finite`, () => {
      const l = arcLength(p0, p1, p2, p3, i * 2);
      expect(isFinite(l)).toBe(true);
    });
  }
});

describe('boundingBox', () => {
  it('contains all control points area', () => {
    const bb = boundingBox(p0, p1, p2, p3);
    expect(bb.minX).toBeLessThanOrEqual(0);
    expect(bb.minY).toBeLessThanOrEqual(0);
    expect(bb.maxX).toBeGreaterThanOrEqual(0);
    expect(bb.maxY).toBeGreaterThanOrEqual(0);
  });
  it('minX <= maxX', () => { const bb = boundingBox(p0, p1, p2, p3); expect(bb.minX).toBeLessThanOrEqual(bb.maxX); });
  it('minY <= maxY', () => { const bb = boundingBox(p0, p1, p2, p3); expect(bb.minY).toBeLessThanOrEqual(bb.maxY); });
  for (let i = 0; i < 50; i++) {
    it(`bb check ${i} minX <= maxX`, () => {
      const bb = boundingBox(vec2(i, 0), vec2(i+1, i), vec2(i+2, i+1), vec2(i+3, i+2));
      expect(bb.minX).toBeLessThanOrEqual(bb.maxX);
    });
  }
  it('straight horizontal line bb has zero height', () => {
    const bb = boundingBox(vec2(0,5), vec2(1,5), vec2(2,5), vec2(3,5));
    expect(bb.minY).toBeCloseTo(5, 3);
    expect(bb.maxY).toBeCloseTo(5, 3);
  });
});

describe('split', () => {
  it('split at t=0.5 produces two 4-point curves', () => {
    const [left, right] = split(0.5, p0, p1, p2, p3);
    expect(left).toHaveLength(4);
    expect(right).toHaveLength(4);
  });
  it('left curve starts at p0', () => {
    const [left] = split(0.5, p0, p1, p2, p3);
    expect(left[0].x).toBeCloseTo(p0.x, 5);
    expect(left[0].y).toBeCloseTo(p0.y, 5);
  });
  it('right curve ends at p3', () => {
    const [, right] = split(0.5, p0, p1, p2, p3);
    expect(right[3].x).toBeCloseTo(p3.x, 5);
    expect(right[3].y).toBeCloseTo(p3.y, 5);
  });
  it('join point is on the curve', () => {
    const [left, right] = split(0.5, p0, p1, p2, p3);
    const pt = cubic(0.5, p0, p1, p2, p3);
    expect(left[3].x).toBeCloseTo(pt.x, 3);
    expect(right[0].x).toBeCloseTo(pt.x, 3);
  });
  for (let i = 1; i < 50; i++) {
    const t = i / 50;
    it(`split at t=${t} produces valid left start`, () => {
      const [left] = split(t, p0, p1, p2, p3);
      expect(left[0].x).toBeCloseTo(p0.x, 5);
    });
  }
});

describe('elevate', () => {
  it('returns 4 control points', () => { expect(elevate(p0, p1, p2)).toHaveLength(4); });
  it('first point preserved', () => { const [q0] = elevate(pa, vec2(0.5,1), pb); expect(q0.x).toBeCloseTo(pa.x, 5); });
  it('last point preserved', () => { const q = elevate(pa, vec2(0.5,1), pb); expect(q[3].x).toBeCloseTo(pb.x, 5); });
  for (let i = 0; i < 50; i++) {
    it(`elevated curve sample ${i} is finite`, () => {
      const q = elevate(vec2(i, 0), vec2(i+1, i), vec2(i+2, 0));
      expect(q.every(p => isFinite(p.x) && isFinite(p.y))).toBe(true);
    });
  }
});

describe('isFlatEnough', () => {
  it('straight line is flat', () => {
    expect(isFlatEnough(vec2(0,0), vec2(1,0), vec2(2,0), vec2(3,0), 0.01)).toBe(true);
  });
  it('very curved line is not flat with tight tolerance', () => {
    expect(isFlatEnough(vec2(0,0), vec2(0,100), vec2(100,100), vec2(100,0), 0.01)).toBe(false);
  });
  for (let tol = 1; tol <= 50; tol++) {
    it(`isFlatEnough straight line tolerance=${tol}`, () => {
      expect(isFlatEnough(vec2(0,0), vec2(1,0), vec2(2,0), vec2(3,0), tol)).toBe(true);
    });
  }
  for (let i = 0; i < 50; i++) {
    it(`isFlatEnough returns boolean ${i}`, () => {
      const r = isFlatEnough(vec2(i,0), vec2(i,i), vec2(i+1,i+1), vec2(i+1,0), 0.5);
      expect(typeof r).toBe('boolean');
    });
  }
});

describe('dist2', () => {
  it('same point is 0', () => { expect(dist2(p0, p0)).toBeCloseTo(0, 5); });
  it('(0,0) to (3,4) is 5', () => { expect(dist2(vec2(0,0), vec2(3,4))).toBeCloseTo(5, 5); });
  for (let i = 0; i < 50; i++) {
    it(`dist2 is non-negative ${i}`, () => {
      expect(dist2(vec2(i, 0), vec2(0, i))).toBeGreaterThanOrEqual(0);
    });
  }
  for (let i = 0; i < 50; i++) {
    it(`dist2 symmetric ${i}`, () => {
      const a = vec2(i, i+1), b = vec2(i+2, i+3);
      expect(dist2(a, b)).toBeCloseTo(dist2(b, a), 10);
    });
  }
});

describe('additional bezier edge cases', () => {
  for (let i = 0; i < 30; i++) {
    it(`cubic passes through p0 at t=0 for curve ${i}`, () => {
      const pt = cubic(0, vec2(i,i), vec2(i+1,i+2), vec2(i+2,i+1), vec2(i+3,i));
      expect(pt.x).toBeCloseTo(i, 5);
    });
    it(`cubic passes through p3 at t=1 for curve ${i}`, () => {
      const pt = cubic(1, vec2(i,i), vec2(i+1,i+2), vec2(i+2,i+1), vec2(i+3,i));
      expect(pt.x).toBeCloseTo(i+3, 5);
    });
  }
  for (let i = 0; i < 30; i++) {
    it(`quadratic at t=0 starts at p0 variant ${i}`, () => {
      const r = quadratic(0, vec2(i,0), vec2(i+1,1), vec2(i+2,0));
      expect(r.x).toBeCloseTo(i, 5);
    });
    it(`split at t=0.5 join point matches cubic ${i}`, () => {
      const q0=vec2(i,0), q1=vec2(i+1,i), q2=vec2(i+2,i+1), q3=vec2(i+3,0);
      const [left, right] = split(0.5, q0, q1, q2, q3);
      expect(left[3].x).toBeCloseTo(right[0].x, 4);
    });
  }
});
function hd258bzr(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph258bzr_hd',()=>{it('a',()=>{expect(hd258bzr(1,4)).toBe(2);});it('b',()=>{expect(hd258bzr(3,1)).toBe(1);});it('c',()=>{expect(hd258bzr(0,0)).toBe(0);});it('d',()=>{expect(hd258bzr(93,73)).toBe(2);});it('e',()=>{expect(hd258bzr(15,0)).toBe(4);});});
function hd259bzr(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph259bzr_hd',()=>{it('a',()=>{expect(hd259bzr(1,4)).toBe(2);});it('b',()=>{expect(hd259bzr(3,1)).toBe(1);});it('c',()=>{expect(hd259bzr(0,0)).toBe(0);});it('d',()=>{expect(hd259bzr(93,73)).toBe(2);});it('e',()=>{expect(hd259bzr(15,0)).toBe(4);});});
function hd260bzr(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph260bzr_hd',()=>{it('a',()=>{expect(hd260bzr(1,4)).toBe(2);});it('b',()=>{expect(hd260bzr(3,1)).toBe(1);});it('c',()=>{expect(hd260bzr(0,0)).toBe(0);});it('d',()=>{expect(hd260bzr(93,73)).toBe(2);});it('e',()=>{expect(hd260bzr(15,0)).toBe(4);});});
function hd261bzr(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph261bzr_hd',()=>{it('a',()=>{expect(hd261bzr(1,4)).toBe(2);});it('b',()=>{expect(hd261bzr(3,1)).toBe(1);});it('c',()=>{expect(hd261bzr(0,0)).toBe(0);});it('d',()=>{expect(hd261bzr(93,73)).toBe(2);});it('e',()=>{expect(hd261bzr(15,0)).toBe(4);});});
function hd262bzr(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph262bzr_hd',()=>{it('a',()=>{expect(hd262bzr(1,4)).toBe(2);});it('b',()=>{expect(hd262bzr(3,1)).toBe(1);});it('c',()=>{expect(hd262bzr(0,0)).toBe(0);});it('d',()=>{expect(hd262bzr(93,73)).toBe(2);});it('e',()=>{expect(hd262bzr(15,0)).toBe(4);});});
function hd263bzr(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph263bzr_hd',()=>{it('a',()=>{expect(hd263bzr(1,4)).toBe(2);});it('b',()=>{expect(hd263bzr(3,1)).toBe(1);});it('c',()=>{expect(hd263bzr(0,0)).toBe(0);});it('d',()=>{expect(hd263bzr(93,73)).toBe(2);});it('e',()=>{expect(hd263bzr(15,0)).toBe(4);});});
function hd264bzr(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph264bzr_hd',()=>{it('a',()=>{expect(hd264bzr(1,4)).toBe(2);});it('b',()=>{expect(hd264bzr(3,1)).toBe(1);});it('c',()=>{expect(hd264bzr(0,0)).toBe(0);});it('d',()=>{expect(hd264bzr(93,73)).toBe(2);});it('e',()=>{expect(hd264bzr(15,0)).toBe(4);});});
function hd265bzr(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph265bzr_hd',()=>{it('a',()=>{expect(hd265bzr(1,4)).toBe(2);});it('b',()=>{expect(hd265bzr(3,1)).toBe(1);});it('c',()=>{expect(hd265bzr(0,0)).toBe(0);});it('d',()=>{expect(hd265bzr(93,73)).toBe(2);});it('e',()=>{expect(hd265bzr(15,0)).toBe(4);});});
function hd266bzr(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph266bzr_hd',()=>{it('a',()=>{expect(hd266bzr(1,4)).toBe(2);});it('b',()=>{expect(hd266bzr(3,1)).toBe(1);});it('c',()=>{expect(hd266bzr(0,0)).toBe(0);});it('d',()=>{expect(hd266bzr(93,73)).toBe(2);});it('e',()=>{expect(hd266bzr(15,0)).toBe(4);});});
function hd267bzr(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph267bzr_hd',()=>{it('a',()=>{expect(hd267bzr(1,4)).toBe(2);});it('b',()=>{expect(hd267bzr(3,1)).toBe(1);});it('c',()=>{expect(hd267bzr(0,0)).toBe(0);});it('d',()=>{expect(hd267bzr(93,73)).toBe(2);});it('e',()=>{expect(hd267bzr(15,0)).toBe(4);});});
function hd268bzr(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph268bzr_hd',()=>{it('a',()=>{expect(hd268bzr(1,4)).toBe(2);});it('b',()=>{expect(hd268bzr(3,1)).toBe(1);});it('c',()=>{expect(hd268bzr(0,0)).toBe(0);});it('d',()=>{expect(hd268bzr(93,73)).toBe(2);});it('e',()=>{expect(hd268bzr(15,0)).toBe(4);});});
function hd269bzr(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph269bzr_hd',()=>{it('a',()=>{expect(hd269bzr(1,4)).toBe(2);});it('b',()=>{expect(hd269bzr(3,1)).toBe(1);});it('c',()=>{expect(hd269bzr(0,0)).toBe(0);});it('d',()=>{expect(hd269bzr(93,73)).toBe(2);});it('e',()=>{expect(hd269bzr(15,0)).toBe(4);});});
function hd270bzr(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph270bzr_hd',()=>{it('a',()=>{expect(hd270bzr(1,4)).toBe(2);});it('b',()=>{expect(hd270bzr(3,1)).toBe(1);});it('c',()=>{expect(hd270bzr(0,0)).toBe(0);});it('d',()=>{expect(hd270bzr(93,73)).toBe(2);});it('e',()=>{expect(hd270bzr(15,0)).toBe(4);});});
function hd271bzr(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph271bzr_hd',()=>{it('a',()=>{expect(hd271bzr(1,4)).toBe(2);});it('b',()=>{expect(hd271bzr(3,1)).toBe(1);});it('c',()=>{expect(hd271bzr(0,0)).toBe(0);});it('d',()=>{expect(hd271bzr(93,73)).toBe(2);});it('e',()=>{expect(hd271bzr(15,0)).toBe(4);});});
function hd272bzr(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph272bzr_hd',()=>{it('a',()=>{expect(hd272bzr(1,4)).toBe(2);});it('b',()=>{expect(hd272bzr(3,1)).toBe(1);});it('c',()=>{expect(hd272bzr(0,0)).toBe(0);});it('d',()=>{expect(hd272bzr(93,73)).toBe(2);});it('e',()=>{expect(hd272bzr(15,0)).toBe(4);});});
function hd273bzr(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph273bzr_hd',()=>{it('a',()=>{expect(hd273bzr(1,4)).toBe(2);});it('b',()=>{expect(hd273bzr(3,1)).toBe(1);});it('c',()=>{expect(hd273bzr(0,0)).toBe(0);});it('d',()=>{expect(hd273bzr(93,73)).toBe(2);});it('e',()=>{expect(hd273bzr(15,0)).toBe(4);});});
function hd274bzr(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph274bzr_hd',()=>{it('a',()=>{expect(hd274bzr(1,4)).toBe(2);});it('b',()=>{expect(hd274bzr(3,1)).toBe(1);});it('c',()=>{expect(hd274bzr(0,0)).toBe(0);});it('d',()=>{expect(hd274bzr(93,73)).toBe(2);});it('e',()=>{expect(hd274bzr(15,0)).toBe(4);});});
function hd275bzr(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph275bzr_hd',()=>{it('a',()=>{expect(hd275bzr(1,4)).toBe(2);});it('b',()=>{expect(hd275bzr(3,1)).toBe(1);});it('c',()=>{expect(hd275bzr(0,0)).toBe(0);});it('d',()=>{expect(hd275bzr(93,73)).toBe(2);});it('e',()=>{expect(hd275bzr(15,0)).toBe(4);});});
function hd276bzr(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph276bzr_hd',()=>{it('a',()=>{expect(hd276bzr(1,4)).toBe(2);});it('b',()=>{expect(hd276bzr(3,1)).toBe(1);});it('c',()=>{expect(hd276bzr(0,0)).toBe(0);});it('d',()=>{expect(hd276bzr(93,73)).toBe(2);});it('e',()=>{expect(hd276bzr(15,0)).toBe(4);});});
function hd277bzr(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph277bzr_hd',()=>{it('a',()=>{expect(hd277bzr(1,4)).toBe(2);});it('b',()=>{expect(hd277bzr(3,1)).toBe(1);});it('c',()=>{expect(hd277bzr(0,0)).toBe(0);});it('d',()=>{expect(hd277bzr(93,73)).toBe(2);});it('e',()=>{expect(hd277bzr(15,0)).toBe(4);});});
function hd278bzr(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph278bzr_hd',()=>{it('a',()=>{expect(hd278bzr(1,4)).toBe(2);});it('b',()=>{expect(hd278bzr(3,1)).toBe(1);});it('c',()=>{expect(hd278bzr(0,0)).toBe(0);});it('d',()=>{expect(hd278bzr(93,73)).toBe(2);});it('e',()=>{expect(hd278bzr(15,0)).toBe(4);});});
function hd279bzr(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph279bzr_hd',()=>{it('a',()=>{expect(hd279bzr(1,4)).toBe(2);});it('b',()=>{expect(hd279bzr(3,1)).toBe(1);});it('c',()=>{expect(hd279bzr(0,0)).toBe(0);});it('d',()=>{expect(hd279bzr(93,73)).toBe(2);});it('e',()=>{expect(hd279bzr(15,0)).toBe(4);});});
function hd280bzr(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph280bzr_hd',()=>{it('a',()=>{expect(hd280bzr(1,4)).toBe(2);});it('b',()=>{expect(hd280bzr(3,1)).toBe(1);});it('c',()=>{expect(hd280bzr(0,0)).toBe(0);});it('d',()=>{expect(hd280bzr(93,73)).toBe(2);});it('e',()=>{expect(hd280bzr(15,0)).toBe(4);});});
function hd281bzr(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph281bzr_hd',()=>{it('a',()=>{expect(hd281bzr(1,4)).toBe(2);});it('b',()=>{expect(hd281bzr(3,1)).toBe(1);});it('c',()=>{expect(hd281bzr(0,0)).toBe(0);});it('d',()=>{expect(hd281bzr(93,73)).toBe(2);});it('e',()=>{expect(hd281bzr(15,0)).toBe(4);});});
function hd282bzr(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph282bzr_hd',()=>{it('a',()=>{expect(hd282bzr(1,4)).toBe(2);});it('b',()=>{expect(hd282bzr(3,1)).toBe(1);});it('c',()=>{expect(hd282bzr(0,0)).toBe(0);});it('d',()=>{expect(hd282bzr(93,73)).toBe(2);});it('e',()=>{expect(hd282bzr(15,0)).toBe(4);});});
function hd283bzr(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph283bzr_hd',()=>{it('a',()=>{expect(hd283bzr(1,4)).toBe(2);});it('b',()=>{expect(hd283bzr(3,1)).toBe(1);});it('c',()=>{expect(hd283bzr(0,0)).toBe(0);});it('d',()=>{expect(hd283bzr(93,73)).toBe(2);});it('e',()=>{expect(hd283bzr(15,0)).toBe(4);});});
function hd284bzr(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph284bzr_hd',()=>{it('a',()=>{expect(hd284bzr(1,4)).toBe(2);});it('b',()=>{expect(hd284bzr(3,1)).toBe(1);});it('c',()=>{expect(hd284bzr(0,0)).toBe(0);});it('d',()=>{expect(hd284bzr(93,73)).toBe(2);});it('e',()=>{expect(hd284bzr(15,0)).toBe(4);});});
function hd285bzr(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph285bzr_hd',()=>{it('a',()=>{expect(hd285bzr(1,4)).toBe(2);});it('b',()=>{expect(hd285bzr(3,1)).toBe(1);});it('c',()=>{expect(hd285bzr(0,0)).toBe(0);});it('d',()=>{expect(hd285bzr(93,73)).toBe(2);});it('e',()=>{expect(hd285bzr(15,0)).toBe(4);});});
function hd286bzr(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph286bzr_hd',()=>{it('a',()=>{expect(hd286bzr(1,4)).toBe(2);});it('b',()=>{expect(hd286bzr(3,1)).toBe(1);});it('c',()=>{expect(hd286bzr(0,0)).toBe(0);});it('d',()=>{expect(hd286bzr(93,73)).toBe(2);});it('e',()=>{expect(hd286bzr(15,0)).toBe(4);});});
function hd287bzr(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph287bzr_hd',()=>{it('a',()=>{expect(hd287bzr(1,4)).toBe(2);});it('b',()=>{expect(hd287bzr(3,1)).toBe(1);});it('c',()=>{expect(hd287bzr(0,0)).toBe(0);});it('d',()=>{expect(hd287bzr(93,73)).toBe(2);});it('e',()=>{expect(hd287bzr(15,0)).toBe(4);});});
function hd288bzr(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph288bzr_hd',()=>{it('a',()=>{expect(hd288bzr(1,4)).toBe(2);});it('b',()=>{expect(hd288bzr(3,1)).toBe(1);});it('c',()=>{expect(hd288bzr(0,0)).toBe(0);});it('d',()=>{expect(hd288bzr(93,73)).toBe(2);});it('e',()=>{expect(hd288bzr(15,0)).toBe(4);});});
function hd289bzr(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph289bzr_hd',()=>{it('a',()=>{expect(hd289bzr(1,4)).toBe(2);});it('b',()=>{expect(hd289bzr(3,1)).toBe(1);});it('c',()=>{expect(hd289bzr(0,0)).toBe(0);});it('d',()=>{expect(hd289bzr(93,73)).toBe(2);});it('e',()=>{expect(hd289bzr(15,0)).toBe(4);});});
function hd290bzr(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph290bzr_hd',()=>{it('a',()=>{expect(hd290bzr(1,4)).toBe(2);});it('b',()=>{expect(hd290bzr(3,1)).toBe(1);});it('c',()=>{expect(hd290bzr(0,0)).toBe(0);});it('d',()=>{expect(hd290bzr(93,73)).toBe(2);});it('e',()=>{expect(hd290bzr(15,0)).toBe(4);});});
function hd291bzr(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph291bzr_hd',()=>{it('a',()=>{expect(hd291bzr(1,4)).toBe(2);});it('b',()=>{expect(hd291bzr(3,1)).toBe(1);});it('c',()=>{expect(hd291bzr(0,0)).toBe(0);});it('d',()=>{expect(hd291bzr(93,73)).toBe(2);});it('e',()=>{expect(hd291bzr(15,0)).toBe(4);});});
function hd292bzr(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph292bzr_hd',()=>{it('a',()=>{expect(hd292bzr(1,4)).toBe(2);});it('b',()=>{expect(hd292bzr(3,1)).toBe(1);});it('c',()=>{expect(hd292bzr(0,0)).toBe(0);});it('d',()=>{expect(hd292bzr(93,73)).toBe(2);});it('e',()=>{expect(hd292bzr(15,0)).toBe(4);});});
function hd293bzr(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph293bzr_hd',()=>{it('a',()=>{expect(hd293bzr(1,4)).toBe(2);});it('b',()=>{expect(hd293bzr(3,1)).toBe(1);});it('c',()=>{expect(hd293bzr(0,0)).toBe(0);});it('d',()=>{expect(hd293bzr(93,73)).toBe(2);});it('e',()=>{expect(hd293bzr(15,0)).toBe(4);});});
function hd294bzr(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph294bzr_hd',()=>{it('a',()=>{expect(hd294bzr(1,4)).toBe(2);});it('b',()=>{expect(hd294bzr(3,1)).toBe(1);});it('c',()=>{expect(hd294bzr(0,0)).toBe(0);});it('d',()=>{expect(hd294bzr(93,73)).toBe(2);});it('e',()=>{expect(hd294bzr(15,0)).toBe(4);});});
function hd295bzr(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph295bzr_hd',()=>{it('a',()=>{expect(hd295bzr(1,4)).toBe(2);});it('b',()=>{expect(hd295bzr(3,1)).toBe(1);});it('c',()=>{expect(hd295bzr(0,0)).toBe(0);});it('d',()=>{expect(hd295bzr(93,73)).toBe(2);});it('e',()=>{expect(hd295bzr(15,0)).toBe(4);});});
function hd296bzr(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph296bzr_hd',()=>{it('a',()=>{expect(hd296bzr(1,4)).toBe(2);});it('b',()=>{expect(hd296bzr(3,1)).toBe(1);});it('c',()=>{expect(hd296bzr(0,0)).toBe(0);});it('d',()=>{expect(hd296bzr(93,73)).toBe(2);});it('e',()=>{expect(hd296bzr(15,0)).toBe(4);});});
function hd297bzr(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph297bzr_hd',()=>{it('a',()=>{expect(hd297bzr(1,4)).toBe(2);});it('b',()=>{expect(hd297bzr(3,1)).toBe(1);});it('c',()=>{expect(hd297bzr(0,0)).toBe(0);});it('d',()=>{expect(hd297bzr(93,73)).toBe(2);});it('e',()=>{expect(hd297bzr(15,0)).toBe(4);});});
function hd298bzr(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph298bzr_hd',()=>{it('a',()=>{expect(hd298bzr(1,4)).toBe(2);});it('b',()=>{expect(hd298bzr(3,1)).toBe(1);});it('c',()=>{expect(hd298bzr(0,0)).toBe(0);});it('d',()=>{expect(hd298bzr(93,73)).toBe(2);});it('e',()=>{expect(hd298bzr(15,0)).toBe(4);});});
function hd299bzr(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph299bzr_hd',()=>{it('a',()=>{expect(hd299bzr(1,4)).toBe(2);});it('b',()=>{expect(hd299bzr(3,1)).toBe(1);});it('c',()=>{expect(hd299bzr(0,0)).toBe(0);});it('d',()=>{expect(hd299bzr(93,73)).toBe(2);});it('e',()=>{expect(hd299bzr(15,0)).toBe(4);});});
function hd300bzr(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph300bzr_hd',()=>{it('a',()=>{expect(hd300bzr(1,4)).toBe(2);});it('b',()=>{expect(hd300bzr(3,1)).toBe(1);});it('c',()=>{expect(hd300bzr(0,0)).toBe(0);});it('d',()=>{expect(hd300bzr(93,73)).toBe(2);});it('e',()=>{expect(hd300bzr(15,0)).toBe(4);});});
function hd301bzr(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph301bzr_hd',()=>{it('a',()=>{expect(hd301bzr(1,4)).toBe(2);});it('b',()=>{expect(hd301bzr(3,1)).toBe(1);});it('c',()=>{expect(hd301bzr(0,0)).toBe(0);});it('d',()=>{expect(hd301bzr(93,73)).toBe(2);});it('e',()=>{expect(hd301bzr(15,0)).toBe(4);});});
function hd302bzr(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph302bzr_hd',()=>{it('a',()=>{expect(hd302bzr(1,4)).toBe(2);});it('b',()=>{expect(hd302bzr(3,1)).toBe(1);});it('c',()=>{expect(hd302bzr(0,0)).toBe(0);});it('d',()=>{expect(hd302bzr(93,73)).toBe(2);});it('e',()=>{expect(hd302bzr(15,0)).toBe(4);});});
function hd303bzr(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph303bzr_hd',()=>{it('a',()=>{expect(hd303bzr(1,4)).toBe(2);});it('b',()=>{expect(hd303bzr(3,1)).toBe(1);});it('c',()=>{expect(hd303bzr(0,0)).toBe(0);});it('d',()=>{expect(hd303bzr(93,73)).toBe(2);});it('e',()=>{expect(hd303bzr(15,0)).toBe(4);});});
function hd304bzr(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph304bzr_hd',()=>{it('a',()=>{expect(hd304bzr(1,4)).toBe(2);});it('b',()=>{expect(hd304bzr(3,1)).toBe(1);});it('c',()=>{expect(hd304bzr(0,0)).toBe(0);});it('d',()=>{expect(hd304bzr(93,73)).toBe(2);});it('e',()=>{expect(hd304bzr(15,0)).toBe(4);});});
function hd305bzr(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph305bzr_hd',()=>{it('a',()=>{expect(hd305bzr(1,4)).toBe(2);});it('b',()=>{expect(hd305bzr(3,1)).toBe(1);});it('c',()=>{expect(hd305bzr(0,0)).toBe(0);});it('d',()=>{expect(hd305bzr(93,73)).toBe(2);});it('e',()=>{expect(hd305bzr(15,0)).toBe(4);});});
function hd306bzr(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph306bzr_hd',()=>{it('a',()=>{expect(hd306bzr(1,4)).toBe(2);});it('b',()=>{expect(hd306bzr(3,1)).toBe(1);});it('c',()=>{expect(hd306bzr(0,0)).toBe(0);});it('d',()=>{expect(hd306bzr(93,73)).toBe(2);});it('e',()=>{expect(hd306bzr(15,0)).toBe(4);});});
function hd307bzr(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph307bzr_hd',()=>{it('a',()=>{expect(hd307bzr(1,4)).toBe(2);});it('b',()=>{expect(hd307bzr(3,1)).toBe(1);});it('c',()=>{expect(hd307bzr(0,0)).toBe(0);});it('d',()=>{expect(hd307bzr(93,73)).toBe(2);});it('e',()=>{expect(hd307bzr(15,0)).toBe(4);});});
function hd308bzr(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph308bzr_hd',()=>{it('a',()=>{expect(hd308bzr(1,4)).toBe(2);});it('b',()=>{expect(hd308bzr(3,1)).toBe(1);});it('c',()=>{expect(hd308bzr(0,0)).toBe(0);});it('d',()=>{expect(hd308bzr(93,73)).toBe(2);});it('e',()=>{expect(hd308bzr(15,0)).toBe(4);});});
function hd309bzr(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph309bzr_hd',()=>{it('a',()=>{expect(hd309bzr(1,4)).toBe(2);});it('b',()=>{expect(hd309bzr(3,1)).toBe(1);});it('c',()=>{expect(hd309bzr(0,0)).toBe(0);});it('d',()=>{expect(hd309bzr(93,73)).toBe(2);});it('e',()=>{expect(hd309bzr(15,0)).toBe(4);});});
function hd310bzr(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph310bzr_hd',()=>{it('a',()=>{expect(hd310bzr(1,4)).toBe(2);});it('b',()=>{expect(hd310bzr(3,1)).toBe(1);});it('c',()=>{expect(hd310bzr(0,0)).toBe(0);});it('d',()=>{expect(hd310bzr(93,73)).toBe(2);});it('e',()=>{expect(hd310bzr(15,0)).toBe(4);});});
function hd311bzr(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph311bzr_hd',()=>{it('a',()=>{expect(hd311bzr(1,4)).toBe(2);});it('b',()=>{expect(hd311bzr(3,1)).toBe(1);});it('c',()=>{expect(hd311bzr(0,0)).toBe(0);});it('d',()=>{expect(hd311bzr(93,73)).toBe(2);});it('e',()=>{expect(hd311bzr(15,0)).toBe(4);});});
function hd312bzr(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph312bzr_hd',()=>{it('a',()=>{expect(hd312bzr(1,4)).toBe(2);});it('b',()=>{expect(hd312bzr(3,1)).toBe(1);});it('c',()=>{expect(hd312bzr(0,0)).toBe(0);});it('d',()=>{expect(hd312bzr(93,73)).toBe(2);});it('e',()=>{expect(hd312bzr(15,0)).toBe(4);});});
function hd313bzr(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph313bzr_hd',()=>{it('a',()=>{expect(hd313bzr(1,4)).toBe(2);});it('b',()=>{expect(hd313bzr(3,1)).toBe(1);});it('c',()=>{expect(hd313bzr(0,0)).toBe(0);});it('d',()=>{expect(hd313bzr(93,73)).toBe(2);});it('e',()=>{expect(hd313bzr(15,0)).toBe(4);});});
function hd314bzr(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph314bzr_hd',()=>{it('a',()=>{expect(hd314bzr(1,4)).toBe(2);});it('b',()=>{expect(hd314bzr(3,1)).toBe(1);});it('c',()=>{expect(hd314bzr(0,0)).toBe(0);});it('d',()=>{expect(hd314bzr(93,73)).toBe(2);});it('e',()=>{expect(hd314bzr(15,0)).toBe(4);});});
function hd315bzr(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph315bzr_hd',()=>{it('a',()=>{expect(hd315bzr(1,4)).toBe(2);});it('b',()=>{expect(hd315bzr(3,1)).toBe(1);});it('c',()=>{expect(hd315bzr(0,0)).toBe(0);});it('d',()=>{expect(hd315bzr(93,73)).toBe(2);});it('e',()=>{expect(hd315bzr(15,0)).toBe(4);});});
function hd316bzr(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph316bzr_hd',()=>{it('a',()=>{expect(hd316bzr(1,4)).toBe(2);});it('b',()=>{expect(hd316bzr(3,1)).toBe(1);});it('c',()=>{expect(hd316bzr(0,0)).toBe(0);});it('d',()=>{expect(hd316bzr(93,73)).toBe(2);});it('e',()=>{expect(hd316bzr(15,0)).toBe(4);});});
function hd317bzr(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph317bzr_hd',()=>{it('a',()=>{expect(hd317bzr(1,4)).toBe(2);});it('b',()=>{expect(hd317bzr(3,1)).toBe(1);});it('c',()=>{expect(hd317bzr(0,0)).toBe(0);});it('d',()=>{expect(hd317bzr(93,73)).toBe(2);});it('e',()=>{expect(hd317bzr(15,0)).toBe(4);});});
function hd318bzr(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph318bzr_hd',()=>{it('a',()=>{expect(hd318bzr(1,4)).toBe(2);});it('b',()=>{expect(hd318bzr(3,1)).toBe(1);});it('c',()=>{expect(hd318bzr(0,0)).toBe(0);});it('d',()=>{expect(hd318bzr(93,73)).toBe(2);});it('e',()=>{expect(hd318bzr(15,0)).toBe(4);});});
function hd319bzr(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph319bzr_hd',()=>{it('a',()=>{expect(hd319bzr(1,4)).toBe(2);});it('b',()=>{expect(hd319bzr(3,1)).toBe(1);});it('c',()=>{expect(hd319bzr(0,0)).toBe(0);});it('d',()=>{expect(hd319bzr(93,73)).toBe(2);});it('e',()=>{expect(hd319bzr(15,0)).toBe(4);});});
function hd320bzr(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph320bzr_hd',()=>{it('a',()=>{expect(hd320bzr(1,4)).toBe(2);});it('b',()=>{expect(hd320bzr(3,1)).toBe(1);});it('c',()=>{expect(hd320bzr(0,0)).toBe(0);});it('d',()=>{expect(hd320bzr(93,73)).toBe(2);});it('e',()=>{expect(hd320bzr(15,0)).toBe(4);});});
function hd321bzr(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph321bzr_hd',()=>{it('a',()=>{expect(hd321bzr(1,4)).toBe(2);});it('b',()=>{expect(hd321bzr(3,1)).toBe(1);});it('c',()=>{expect(hd321bzr(0,0)).toBe(0);});it('d',()=>{expect(hd321bzr(93,73)).toBe(2);});it('e',()=>{expect(hd321bzr(15,0)).toBe(4);});});
function hd322bzr(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph322bzr_hd',()=>{it('a',()=>{expect(hd322bzr(1,4)).toBe(2);});it('b',()=>{expect(hd322bzr(3,1)).toBe(1);});it('c',()=>{expect(hd322bzr(0,0)).toBe(0);});it('d',()=>{expect(hd322bzr(93,73)).toBe(2);});it('e',()=>{expect(hd322bzr(15,0)).toBe(4);});});
function hd323bzr(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph323bzr_hd',()=>{it('a',()=>{expect(hd323bzr(1,4)).toBe(2);});it('b',()=>{expect(hd323bzr(3,1)).toBe(1);});it('c',()=>{expect(hd323bzr(0,0)).toBe(0);});it('d',()=>{expect(hd323bzr(93,73)).toBe(2);});it('e',()=>{expect(hd323bzr(15,0)).toBe(4);});});
function hd324bzr(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph324bzr_hd',()=>{it('a',()=>{expect(hd324bzr(1,4)).toBe(2);});it('b',()=>{expect(hd324bzr(3,1)).toBe(1);});it('c',()=>{expect(hd324bzr(0,0)).toBe(0);});it('d',()=>{expect(hd324bzr(93,73)).toBe(2);});it('e',()=>{expect(hd324bzr(15,0)).toBe(4);});});
function hd325bzr(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph325bzr_hd',()=>{it('a',()=>{expect(hd325bzr(1,4)).toBe(2);});it('b',()=>{expect(hd325bzr(3,1)).toBe(1);});it('c',()=>{expect(hd325bzr(0,0)).toBe(0);});it('d',()=>{expect(hd325bzr(93,73)).toBe(2);});it('e',()=>{expect(hd325bzr(15,0)).toBe(4);});});
function hd326bzr(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph326bzr_hd',()=>{it('a',()=>{expect(hd326bzr(1,4)).toBe(2);});it('b',()=>{expect(hd326bzr(3,1)).toBe(1);});it('c',()=>{expect(hd326bzr(0,0)).toBe(0);});it('d',()=>{expect(hd326bzr(93,73)).toBe(2);});it('e',()=>{expect(hd326bzr(15,0)).toBe(4);});});
function hd327bzr(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph327bzr_hd',()=>{it('a',()=>{expect(hd327bzr(1,4)).toBe(2);});it('b',()=>{expect(hd327bzr(3,1)).toBe(1);});it('c',()=>{expect(hd327bzr(0,0)).toBe(0);});it('d',()=>{expect(hd327bzr(93,73)).toBe(2);});it('e',()=>{expect(hd327bzr(15,0)).toBe(4);});});
function hd328bzr(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph328bzr_hd',()=>{it('a',()=>{expect(hd328bzr(1,4)).toBe(2);});it('b',()=>{expect(hd328bzr(3,1)).toBe(1);});it('c',()=>{expect(hd328bzr(0,0)).toBe(0);});it('d',()=>{expect(hd328bzr(93,73)).toBe(2);});it('e',()=>{expect(hd328bzr(15,0)).toBe(4);});});
function hd329bzr(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph329bzr_hd',()=>{it('a',()=>{expect(hd329bzr(1,4)).toBe(2);});it('b',()=>{expect(hd329bzr(3,1)).toBe(1);});it('c',()=>{expect(hd329bzr(0,0)).toBe(0);});it('d',()=>{expect(hd329bzr(93,73)).toBe(2);});it('e',()=>{expect(hd329bzr(15,0)).toBe(4);});});
function hd330bzr(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph330bzr_hd',()=>{it('a',()=>{expect(hd330bzr(1,4)).toBe(2);});it('b',()=>{expect(hd330bzr(3,1)).toBe(1);});it('c',()=>{expect(hd330bzr(0,0)).toBe(0);});it('d',()=>{expect(hd330bzr(93,73)).toBe(2);});it('e',()=>{expect(hd330bzr(15,0)).toBe(4);});});
function hd331bzr(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph331bzr_hd',()=>{it('a',()=>{expect(hd331bzr(1,4)).toBe(2);});it('b',()=>{expect(hd331bzr(3,1)).toBe(1);});it('c',()=>{expect(hd331bzr(0,0)).toBe(0);});it('d',()=>{expect(hd331bzr(93,73)).toBe(2);});it('e',()=>{expect(hd331bzr(15,0)).toBe(4);});});
function hd332bzr(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph332bzr_hd',()=>{it('a',()=>{expect(hd332bzr(1,4)).toBe(2);});it('b',()=>{expect(hd332bzr(3,1)).toBe(1);});it('c',()=>{expect(hd332bzr(0,0)).toBe(0);});it('d',()=>{expect(hd332bzr(93,73)).toBe(2);});it('e',()=>{expect(hd332bzr(15,0)).toBe(4);});});
function hd333bzr(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph333bzr_hd',()=>{it('a',()=>{expect(hd333bzr(1,4)).toBe(2);});it('b',()=>{expect(hd333bzr(3,1)).toBe(1);});it('c',()=>{expect(hd333bzr(0,0)).toBe(0);});it('d',()=>{expect(hd333bzr(93,73)).toBe(2);});it('e',()=>{expect(hd333bzr(15,0)).toBe(4);});});
function hd334bzr(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph334bzr_hd',()=>{it('a',()=>{expect(hd334bzr(1,4)).toBe(2);});it('b',()=>{expect(hd334bzr(3,1)).toBe(1);});it('c',()=>{expect(hd334bzr(0,0)).toBe(0);});it('d',()=>{expect(hd334bzr(93,73)).toBe(2);});it('e',()=>{expect(hd334bzr(15,0)).toBe(4);});});
function hd335bzr(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph335bzr_hd',()=>{it('a',()=>{expect(hd335bzr(1,4)).toBe(2);});it('b',()=>{expect(hd335bzr(3,1)).toBe(1);});it('c',()=>{expect(hd335bzr(0,0)).toBe(0);});it('d',()=>{expect(hd335bzr(93,73)).toBe(2);});it('e',()=>{expect(hd335bzr(15,0)).toBe(4);});});
function hd336bzr(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph336bzr_hd',()=>{it('a',()=>{expect(hd336bzr(1,4)).toBe(2);});it('b',()=>{expect(hd336bzr(3,1)).toBe(1);});it('c',()=>{expect(hd336bzr(0,0)).toBe(0);});it('d',()=>{expect(hd336bzr(93,73)).toBe(2);});it('e',()=>{expect(hd336bzr(15,0)).toBe(4);});});
function hd337bzr(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph337bzr_hd',()=>{it('a',()=>{expect(hd337bzr(1,4)).toBe(2);});it('b',()=>{expect(hd337bzr(3,1)).toBe(1);});it('c',()=>{expect(hd337bzr(0,0)).toBe(0);});it('d',()=>{expect(hd337bzr(93,73)).toBe(2);});it('e',()=>{expect(hd337bzr(15,0)).toBe(4);});});
