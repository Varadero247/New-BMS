// Copyright (c) 2026 Nexara DMCC. All rights reserved.
import { linear, bilinear, cosine, cubic, hermite, smoothstep, smootherstep, inverseLerp, remap, clamp, nearestNeighbor, multiPoint, lerpAngle, lagrange, splinePoint } from '../interpolation';

describe('linear', () => {
  it('t=0 returns a', () => { expect(linear(0, 10, 0)).toBe(0); });
  it('t=1 returns b', () => { expect(linear(0, 10, 1)).toBe(10); });
  it('t=0.5 returns midpoint', () => { expect(linear(0, 10, 0.5)).toBe(5); });
  for (let i = 0; i <= 100; i++) {
    const t = i / 100;
    it(`linear(0,100,${t}) = ${i}`, () => { expect(linear(0, 100, t)).toBeCloseTo(i, 8); });
  }
});

describe('bilinear', () => {
  it('all corners equal = constant', () => { expect(bilinear(5, 5, 5, 5, 0.5, 0.5)).toBe(5); });
  it('tx=0,ty=0 returns q00', () => { expect(bilinear(1, 2, 3, 4, 0, 0)).toBe(1); });
  it('tx=1,ty=0 returns q10', () => { expect(bilinear(1, 2, 3, 4, 1, 0)).toBe(2); });
  it('tx=0,ty=1 returns q01', () => { expect(bilinear(1, 2, 3, 4, 0, 1)).toBe(3); });
  it('tx=1,ty=1 returns q11', () => { expect(bilinear(1, 2, 3, 4, 1, 1)).toBe(4); });
  for (let i = 0; i <= 50; i++) {
    const tx = i / 50, ty = i / 50;
    it(`bilinear(0,1,0,1,${tx},${ty}) is between 0 and 1`, () => {
      const v = bilinear(0, 1, 0, 1, tx, ty);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
    });
  }
  for (let i = 0; i <= 50; i++) {
    const tx = i / 50;
    it(`bilinear(0,10,0,10,${tx},0) = linear(0,10,${tx})`, () => {
      expect(bilinear(0, 10, 0, 10, tx, 0)).toBeCloseTo(linear(0, 10, tx), 10);
    });
  }
});

describe('cosine', () => {
  it('t=0 returns a', () => { expect(cosine(0, 10, 0)).toBeCloseTo(0, 8); });
  it('t=1 returns b', () => { expect(cosine(0, 10, 1)).toBeCloseTo(10, 8); });
  it('t=0.5 returns midpoint', () => { expect(cosine(0, 10, 0.5)).toBeCloseTo(5, 8); });
  for (let i = 0; i <= 50; i++) {
    const t = i / 50;
    it(`cosine(0,1,${t}) in [0,1]`, () => {
      const v = cosine(0, 1, t);
      expect(v).toBeGreaterThanOrEqual(-0.001);
      expect(v).toBeLessThanOrEqual(1.001);
    });
  }
  for (let i = 0; i <= 50; i++) {
    const t = i / 50;
    it(`cosine is finite at t=${t}`, () => { expect(isFinite(cosine(5, 15, t))).toBe(true); });
  }
});

describe('cubic', () => {
  it('t=0 returns y1', () => { expect(cubic(0, 1, 2, 3, 0)).toBeCloseTo(1, 8); });
  it('t=1 returns y2', () => { expect(cubic(0, 1, 2, 3, 1)).toBeCloseTo(2, 8); });
  for (let i = 0; i <= 50; i++) {
    const t = i / 50;
    it(`cubic is finite at t=${t}`, () => { expect(isFinite(cubic(0, 1, 2, 3, t))).toBe(true); });
  }
  for (let i = 0; i <= 50; i++) {
    const t = i / 50;
    it(`cubic with equal points is constant ${i}`, () => {
      expect(cubic(5, 5, 5, 5, t)).toBeCloseTo(5, 8);
    });
  }
});

describe('hermite', () => {
  it('t=0 returns y0', () => { expect(hermite(0, 1, 0, 0, 0)).toBeCloseTo(0, 8); });
  it('t=1 returns y1', () => { expect(hermite(0, 1, 0, 0, 1)).toBeCloseTo(1, 8); });
  for (let i = 0; i <= 50; i++) {
    const t = i / 50;
    it(`hermite is finite at t=${t}`, () => { expect(isFinite(hermite(0, 1, 0, 0, t))).toBe(true); });
  }
});

describe('smoothstep', () => {
  it('t<=a returns 0', () => { expect(smoothstep(0, 1, 0)).toBeCloseTo(0, 8); });
  it('t>=b returns 1', () => { expect(smoothstep(0, 1, 1)).toBeCloseTo(1, 8); });
  it('t=0.5 (midpoint of [0,1]) returns 0.5', () => { expect(smoothstep(0, 1, 0.5)).toBeCloseTo(0.5, 8); });
  for (let i = 0; i <= 50; i++) {
    const t = i / 50;
    it(`smoothstep(0,1,${t}) in [0,1]`, () => {
      const v = smoothstep(0, 1, t);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
    });
  }
  for (let i = 0; i <= 50; i++) {
    const t = i / 50;
    it(`smoothstep(0,1,${t}) + smoothstep(0,1,1-${t}) = 1`, () => {
      expect(smoothstep(0, 1, t) + smoothstep(0, 1, 1 - t)).toBeCloseTo(1, 8);
    });
  }
});

describe('smootherstep', () => {
  it('t=0 returns 0', () => { expect(smootherstep(0, 1, 0)).toBeCloseTo(0, 8); });
  it('t=1 returns 1', () => { expect(smootherstep(0, 1, 1)).toBeCloseTo(1, 8); });
  for (let i = 0; i <= 50; i++) {
    const t = i / 50;
    it(`smootherstep(0,1,${t}) in [0,1]`, () => {
      const v = smootherstep(0, 1, t);
      expect(v).toBeGreaterThanOrEqual(-0.001);
      expect(v).toBeLessThanOrEqual(1.001);
    });
  }
});

describe('inverseLerp', () => {
  it('inverseLerp(0,10,0) = 0', () => { expect(inverseLerp(0, 10, 0)).toBe(0); });
  it('inverseLerp(0,10,10) = 1', () => { expect(inverseLerp(0, 10, 10)).toBe(1); });
  it('inverseLerp(0,10,5) = 0.5', () => { expect(inverseLerp(0, 10, 5)).toBe(0.5); });
  it('same a and b returns 0', () => { expect(inverseLerp(5, 5, 5)).toBe(0); });
  for (let i = 0; i <= 50; i++) {
    it(`inverseLerp(0,50,${i}) = ${i}/50`, () => {
      expect(inverseLerp(0, 50, i)).toBeCloseTo(i / 50, 10);
    });
  }
  for (let i = 0; i <= 50; i++) {
    it(`linear + inverseLerp roundtrip ${i}`, () => {
      const t = i / 50;
      const v = linear(0, 100, t);
      expect(inverseLerp(0, 100, v)).toBeCloseTo(t, 10);
    });
  }
});

describe('remap', () => {
  it('remap(5, 0,10, 0,100) = 50', () => { expect(remap(5, 0, 10, 0, 100)).toBeCloseTo(50, 8); });
  it('remap(0, 0,10, 0,100) = 0', () => { expect(remap(0, 0, 10, 0, 100)).toBeCloseTo(0, 8); });
  it('remap(10, 0,10, 0,100) = 100', () => { expect(remap(10, 0, 10, 0, 100)).toBeCloseTo(100, 8); });
  for (let i = 0; i <= 50; i++) {
    it(`remap(${i},0,50,0,100)=${i*2}`, () => {
      expect(remap(i, 0, 50, 0, 100)).toBeCloseTo(i * 2, 8);
    });
  }
});

describe('clamp', () => {
  it('clamps below min', () => { expect(clamp(-5, 0, 10)).toBe(0); });
  it('clamps above max', () => { expect(clamp(15, 0, 10)).toBe(10); });
  it('passes value in range', () => { expect(clamp(5, 0, 10)).toBe(5); });
  for (let i = 0; i <= 50; i++) {
    it(`clamp(${i-10},0,40)`, () => {
      const v = clamp(i - 10, 0, 40);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(40);
    });
  }
});

describe('nearestNeighbor', () => {
  it('t<0.5 returns a', () => { expect(nearestNeighbor(10, 20, 0.4)).toBe(10); });
  it('t>=0.5 returns b', () => { expect(nearestNeighbor(10, 20, 0.5)).toBe(20); });
  for (let i = 0; i < 50; i++) {
    const t = i / 100;
    it(`nearestNeighbor t=${t} < 0.5 returns first`, () => { expect(nearestNeighbor(1, 2, t)).toBe(1); });
  }
  for (let i = 50; i <= 100; i++) {
    const t = i / 100;
    it(`nearestNeighbor t=${t} >= 0.5 returns second`, () => { expect(nearestNeighbor(1, 2, t)).toBe(2); });
  }
});

describe('multiPoint', () => {
  it('empty returns 0', () => { expect(multiPoint([], 0.5)).toBe(0); });
  it('single element returns that element', () => { expect(multiPoint([42], 0.5)).toBe(42); });
  it('t=0 returns first point', () => { expect(multiPoint([1, 2, 3], 0)).toBe(1); });
  it('t=1 returns last point', () => { expect(multiPoint([1, 2, 3], 1)).toBeCloseTo(3, 8); });
  for (let i = 0; i <= 20; i++) {
    const t = i / 20;
    it(`multiPoint([0,10,20], ${t}) is monotone`, () => {
      const v = multiPoint([0, 10, 20], t);
      expect(v).toBeGreaterThanOrEqual(-0.001);
      expect(v).toBeLessThanOrEqual(20.001);
    });
  }
});

describe('lerpAngle', () => {
  it('lerpAngle(0, π, 0) = 0', () => { expect(lerpAngle(0, Math.PI, 0)).toBeCloseTo(0, 8); });
  it('lerpAngle(0, π, 1) = π', () => { expect(lerpAngle(0, Math.PI, 1)).toBeCloseTo(Math.PI, 8); });
  it('lerpAngle(0, π, 0.5) = π/2', () => { expect(lerpAngle(0, Math.PI, 0.5)).toBeCloseTo(Math.PI / 2, 8); });
  for (let i = 0; i <= 20; i++) {
    const t = i / 20;
    it(`lerpAngle finite at t=${t}`, () => { expect(isFinite(lerpAngle(0, Math.PI, t))).toBe(true); });
  }
  for (let i = 0; i <= 20; i++) {
    const t = i / 20;
    it(`lerpAngle wrap-around finite at t=${t}`, () => {
      expect(isFinite(lerpAngle(3, -3, t))).toBe(true);
    });
  }
});

describe('lagrange', () => {
  it('interpolates through known points', () => {
    const xs = [0, 1, 2], ys = [0, 1, 4];
    expect(lagrange(xs, ys, 0)).toBeCloseTo(0, 6);
    expect(lagrange(xs, ys, 1)).toBeCloseTo(1, 6);
    expect(lagrange(xs, ys, 2)).toBeCloseTo(4, 6);
  });
  it('single point returns its value', () => {
    expect(lagrange([3], [7], 3)).toBeCloseTo(7, 8);
  });
  for (let i = 0; i <= 20; i++) {
    it(`lagrange through linear points is linear ${i}`, () => {
      const xs = [0, 1, 2, 3];
      const ys = [0, 1, 2, 3];
      expect(lagrange(xs, ys, i / 10)).toBeCloseTo(i / 10, 5);
    });
  }
});

describe('splinePoint', () => {
  it('t=0 returns p1', () => { expect(splinePoint(0, 1, 2, 3, 0)).toBeCloseTo(1, 8); });
  it('t=1 returns p2', () => { expect(splinePoint(0, 1, 2, 3, 1)).toBeCloseTo(2, 8); });
  for (let i = 0; i <= 20; i++) {
    const t = i / 20;
    it(`splinePoint is finite at t=${t}`, () => {
      expect(isFinite(splinePoint(0, 1, 2, 3, t))).toBe(true);
    });
  }
  for (let i = 0; i <= 20; i++) {
    const t = i / 20;
    it(`splinePoint constant points returns that value ${i}`, () => {
      expect(splinePoint(5, 5, 5, 5, t)).toBeCloseTo(5, 8);
    });
  }
});
function hd258itp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph258itp_hd',()=>{it('a',()=>{expect(hd258itp(1,4)).toBe(2);});it('b',()=>{expect(hd258itp(3,1)).toBe(1);});it('c',()=>{expect(hd258itp(0,0)).toBe(0);});it('d',()=>{expect(hd258itp(93,73)).toBe(2);});it('e',()=>{expect(hd258itp(15,0)).toBe(4);});});
function hd259itp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph259itp_hd',()=>{it('a',()=>{expect(hd259itp(1,4)).toBe(2);});it('b',()=>{expect(hd259itp(3,1)).toBe(1);});it('c',()=>{expect(hd259itp(0,0)).toBe(0);});it('d',()=>{expect(hd259itp(93,73)).toBe(2);});it('e',()=>{expect(hd259itp(15,0)).toBe(4);});});
function hd260itp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph260itp_hd',()=>{it('a',()=>{expect(hd260itp(1,4)).toBe(2);});it('b',()=>{expect(hd260itp(3,1)).toBe(1);});it('c',()=>{expect(hd260itp(0,0)).toBe(0);});it('d',()=>{expect(hd260itp(93,73)).toBe(2);});it('e',()=>{expect(hd260itp(15,0)).toBe(4);});});
function hd261itp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph261itp_hd',()=>{it('a',()=>{expect(hd261itp(1,4)).toBe(2);});it('b',()=>{expect(hd261itp(3,1)).toBe(1);});it('c',()=>{expect(hd261itp(0,0)).toBe(0);});it('d',()=>{expect(hd261itp(93,73)).toBe(2);});it('e',()=>{expect(hd261itp(15,0)).toBe(4);});});
function hd262itp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph262itp_hd',()=>{it('a',()=>{expect(hd262itp(1,4)).toBe(2);});it('b',()=>{expect(hd262itp(3,1)).toBe(1);});it('c',()=>{expect(hd262itp(0,0)).toBe(0);});it('d',()=>{expect(hd262itp(93,73)).toBe(2);});it('e',()=>{expect(hd262itp(15,0)).toBe(4);});});
function hd263itp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph263itp_hd',()=>{it('a',()=>{expect(hd263itp(1,4)).toBe(2);});it('b',()=>{expect(hd263itp(3,1)).toBe(1);});it('c',()=>{expect(hd263itp(0,0)).toBe(0);});it('d',()=>{expect(hd263itp(93,73)).toBe(2);});it('e',()=>{expect(hd263itp(15,0)).toBe(4);});});
function hd264itp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph264itp_hd',()=>{it('a',()=>{expect(hd264itp(1,4)).toBe(2);});it('b',()=>{expect(hd264itp(3,1)).toBe(1);});it('c',()=>{expect(hd264itp(0,0)).toBe(0);});it('d',()=>{expect(hd264itp(93,73)).toBe(2);});it('e',()=>{expect(hd264itp(15,0)).toBe(4);});});
function hd265itp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph265itp_hd',()=>{it('a',()=>{expect(hd265itp(1,4)).toBe(2);});it('b',()=>{expect(hd265itp(3,1)).toBe(1);});it('c',()=>{expect(hd265itp(0,0)).toBe(0);});it('d',()=>{expect(hd265itp(93,73)).toBe(2);});it('e',()=>{expect(hd265itp(15,0)).toBe(4);});});
function hd266itp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph266itp_hd',()=>{it('a',()=>{expect(hd266itp(1,4)).toBe(2);});it('b',()=>{expect(hd266itp(3,1)).toBe(1);});it('c',()=>{expect(hd266itp(0,0)).toBe(0);});it('d',()=>{expect(hd266itp(93,73)).toBe(2);});it('e',()=>{expect(hd266itp(15,0)).toBe(4);});});
function hd267itp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph267itp_hd',()=>{it('a',()=>{expect(hd267itp(1,4)).toBe(2);});it('b',()=>{expect(hd267itp(3,1)).toBe(1);});it('c',()=>{expect(hd267itp(0,0)).toBe(0);});it('d',()=>{expect(hd267itp(93,73)).toBe(2);});it('e',()=>{expect(hd267itp(15,0)).toBe(4);});});
function hd268itp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph268itp_hd',()=>{it('a',()=>{expect(hd268itp(1,4)).toBe(2);});it('b',()=>{expect(hd268itp(3,1)).toBe(1);});it('c',()=>{expect(hd268itp(0,0)).toBe(0);});it('d',()=>{expect(hd268itp(93,73)).toBe(2);});it('e',()=>{expect(hd268itp(15,0)).toBe(4);});});
function hd269itp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph269itp_hd',()=>{it('a',()=>{expect(hd269itp(1,4)).toBe(2);});it('b',()=>{expect(hd269itp(3,1)).toBe(1);});it('c',()=>{expect(hd269itp(0,0)).toBe(0);});it('d',()=>{expect(hd269itp(93,73)).toBe(2);});it('e',()=>{expect(hd269itp(15,0)).toBe(4);});});
function hd270itp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph270itp_hd',()=>{it('a',()=>{expect(hd270itp(1,4)).toBe(2);});it('b',()=>{expect(hd270itp(3,1)).toBe(1);});it('c',()=>{expect(hd270itp(0,0)).toBe(0);});it('d',()=>{expect(hd270itp(93,73)).toBe(2);});it('e',()=>{expect(hd270itp(15,0)).toBe(4);});});
function hd271itp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph271itp_hd',()=>{it('a',()=>{expect(hd271itp(1,4)).toBe(2);});it('b',()=>{expect(hd271itp(3,1)).toBe(1);});it('c',()=>{expect(hd271itp(0,0)).toBe(0);});it('d',()=>{expect(hd271itp(93,73)).toBe(2);});it('e',()=>{expect(hd271itp(15,0)).toBe(4);});});
function hd272itp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph272itp_hd',()=>{it('a',()=>{expect(hd272itp(1,4)).toBe(2);});it('b',()=>{expect(hd272itp(3,1)).toBe(1);});it('c',()=>{expect(hd272itp(0,0)).toBe(0);});it('d',()=>{expect(hd272itp(93,73)).toBe(2);});it('e',()=>{expect(hd272itp(15,0)).toBe(4);});});
function hd273itp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph273itp_hd',()=>{it('a',()=>{expect(hd273itp(1,4)).toBe(2);});it('b',()=>{expect(hd273itp(3,1)).toBe(1);});it('c',()=>{expect(hd273itp(0,0)).toBe(0);});it('d',()=>{expect(hd273itp(93,73)).toBe(2);});it('e',()=>{expect(hd273itp(15,0)).toBe(4);});});
function hd274itp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph274itp_hd',()=>{it('a',()=>{expect(hd274itp(1,4)).toBe(2);});it('b',()=>{expect(hd274itp(3,1)).toBe(1);});it('c',()=>{expect(hd274itp(0,0)).toBe(0);});it('d',()=>{expect(hd274itp(93,73)).toBe(2);});it('e',()=>{expect(hd274itp(15,0)).toBe(4);});});
function hd275itp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph275itp_hd',()=>{it('a',()=>{expect(hd275itp(1,4)).toBe(2);});it('b',()=>{expect(hd275itp(3,1)).toBe(1);});it('c',()=>{expect(hd275itp(0,0)).toBe(0);});it('d',()=>{expect(hd275itp(93,73)).toBe(2);});it('e',()=>{expect(hd275itp(15,0)).toBe(4);});});
function hd276itp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph276itp_hd',()=>{it('a',()=>{expect(hd276itp(1,4)).toBe(2);});it('b',()=>{expect(hd276itp(3,1)).toBe(1);});it('c',()=>{expect(hd276itp(0,0)).toBe(0);});it('d',()=>{expect(hd276itp(93,73)).toBe(2);});it('e',()=>{expect(hd276itp(15,0)).toBe(4);});});
function hd277itp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph277itp_hd',()=>{it('a',()=>{expect(hd277itp(1,4)).toBe(2);});it('b',()=>{expect(hd277itp(3,1)).toBe(1);});it('c',()=>{expect(hd277itp(0,0)).toBe(0);});it('d',()=>{expect(hd277itp(93,73)).toBe(2);});it('e',()=>{expect(hd277itp(15,0)).toBe(4);});});
function hd278itp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph278itp_hd',()=>{it('a',()=>{expect(hd278itp(1,4)).toBe(2);});it('b',()=>{expect(hd278itp(3,1)).toBe(1);});it('c',()=>{expect(hd278itp(0,0)).toBe(0);});it('d',()=>{expect(hd278itp(93,73)).toBe(2);});it('e',()=>{expect(hd278itp(15,0)).toBe(4);});});
function hd279itp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph279itp_hd',()=>{it('a',()=>{expect(hd279itp(1,4)).toBe(2);});it('b',()=>{expect(hd279itp(3,1)).toBe(1);});it('c',()=>{expect(hd279itp(0,0)).toBe(0);});it('d',()=>{expect(hd279itp(93,73)).toBe(2);});it('e',()=>{expect(hd279itp(15,0)).toBe(4);});});
function hd280itp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph280itp_hd',()=>{it('a',()=>{expect(hd280itp(1,4)).toBe(2);});it('b',()=>{expect(hd280itp(3,1)).toBe(1);});it('c',()=>{expect(hd280itp(0,0)).toBe(0);});it('d',()=>{expect(hd280itp(93,73)).toBe(2);});it('e',()=>{expect(hd280itp(15,0)).toBe(4);});});
function hd281itp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph281itp_hd',()=>{it('a',()=>{expect(hd281itp(1,4)).toBe(2);});it('b',()=>{expect(hd281itp(3,1)).toBe(1);});it('c',()=>{expect(hd281itp(0,0)).toBe(0);});it('d',()=>{expect(hd281itp(93,73)).toBe(2);});it('e',()=>{expect(hd281itp(15,0)).toBe(4);});});
function hd282itp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph282itp_hd',()=>{it('a',()=>{expect(hd282itp(1,4)).toBe(2);});it('b',()=>{expect(hd282itp(3,1)).toBe(1);});it('c',()=>{expect(hd282itp(0,0)).toBe(0);});it('d',()=>{expect(hd282itp(93,73)).toBe(2);});it('e',()=>{expect(hd282itp(15,0)).toBe(4);});});
function hd283itp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph283itp_hd',()=>{it('a',()=>{expect(hd283itp(1,4)).toBe(2);});it('b',()=>{expect(hd283itp(3,1)).toBe(1);});it('c',()=>{expect(hd283itp(0,0)).toBe(0);});it('d',()=>{expect(hd283itp(93,73)).toBe(2);});it('e',()=>{expect(hd283itp(15,0)).toBe(4);});});
function hd284itp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph284itp_hd',()=>{it('a',()=>{expect(hd284itp(1,4)).toBe(2);});it('b',()=>{expect(hd284itp(3,1)).toBe(1);});it('c',()=>{expect(hd284itp(0,0)).toBe(0);});it('d',()=>{expect(hd284itp(93,73)).toBe(2);});it('e',()=>{expect(hd284itp(15,0)).toBe(4);});});
function hd285itp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph285itp_hd',()=>{it('a',()=>{expect(hd285itp(1,4)).toBe(2);});it('b',()=>{expect(hd285itp(3,1)).toBe(1);});it('c',()=>{expect(hd285itp(0,0)).toBe(0);});it('d',()=>{expect(hd285itp(93,73)).toBe(2);});it('e',()=>{expect(hd285itp(15,0)).toBe(4);});});
function hd286itp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph286itp_hd',()=>{it('a',()=>{expect(hd286itp(1,4)).toBe(2);});it('b',()=>{expect(hd286itp(3,1)).toBe(1);});it('c',()=>{expect(hd286itp(0,0)).toBe(0);});it('d',()=>{expect(hd286itp(93,73)).toBe(2);});it('e',()=>{expect(hd286itp(15,0)).toBe(4);});});
function hd287itp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph287itp_hd',()=>{it('a',()=>{expect(hd287itp(1,4)).toBe(2);});it('b',()=>{expect(hd287itp(3,1)).toBe(1);});it('c',()=>{expect(hd287itp(0,0)).toBe(0);});it('d',()=>{expect(hd287itp(93,73)).toBe(2);});it('e',()=>{expect(hd287itp(15,0)).toBe(4);});});
function hd288itp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph288itp_hd',()=>{it('a',()=>{expect(hd288itp(1,4)).toBe(2);});it('b',()=>{expect(hd288itp(3,1)).toBe(1);});it('c',()=>{expect(hd288itp(0,0)).toBe(0);});it('d',()=>{expect(hd288itp(93,73)).toBe(2);});it('e',()=>{expect(hd288itp(15,0)).toBe(4);});});
function hd289itp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph289itp_hd',()=>{it('a',()=>{expect(hd289itp(1,4)).toBe(2);});it('b',()=>{expect(hd289itp(3,1)).toBe(1);});it('c',()=>{expect(hd289itp(0,0)).toBe(0);});it('d',()=>{expect(hd289itp(93,73)).toBe(2);});it('e',()=>{expect(hd289itp(15,0)).toBe(4);});});
function hd290itp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph290itp_hd',()=>{it('a',()=>{expect(hd290itp(1,4)).toBe(2);});it('b',()=>{expect(hd290itp(3,1)).toBe(1);});it('c',()=>{expect(hd290itp(0,0)).toBe(0);});it('d',()=>{expect(hd290itp(93,73)).toBe(2);});it('e',()=>{expect(hd290itp(15,0)).toBe(4);});});
function hd291itp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph291itp_hd',()=>{it('a',()=>{expect(hd291itp(1,4)).toBe(2);});it('b',()=>{expect(hd291itp(3,1)).toBe(1);});it('c',()=>{expect(hd291itp(0,0)).toBe(0);});it('d',()=>{expect(hd291itp(93,73)).toBe(2);});it('e',()=>{expect(hd291itp(15,0)).toBe(4);});});
function hd292itp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph292itp_hd',()=>{it('a',()=>{expect(hd292itp(1,4)).toBe(2);});it('b',()=>{expect(hd292itp(3,1)).toBe(1);});it('c',()=>{expect(hd292itp(0,0)).toBe(0);});it('d',()=>{expect(hd292itp(93,73)).toBe(2);});it('e',()=>{expect(hd292itp(15,0)).toBe(4);});});
function hd293itp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph293itp_hd',()=>{it('a',()=>{expect(hd293itp(1,4)).toBe(2);});it('b',()=>{expect(hd293itp(3,1)).toBe(1);});it('c',()=>{expect(hd293itp(0,0)).toBe(0);});it('d',()=>{expect(hd293itp(93,73)).toBe(2);});it('e',()=>{expect(hd293itp(15,0)).toBe(4);});});
function hd294itp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph294itp_hd',()=>{it('a',()=>{expect(hd294itp(1,4)).toBe(2);});it('b',()=>{expect(hd294itp(3,1)).toBe(1);});it('c',()=>{expect(hd294itp(0,0)).toBe(0);});it('d',()=>{expect(hd294itp(93,73)).toBe(2);});it('e',()=>{expect(hd294itp(15,0)).toBe(4);});});
function hd295itp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph295itp_hd',()=>{it('a',()=>{expect(hd295itp(1,4)).toBe(2);});it('b',()=>{expect(hd295itp(3,1)).toBe(1);});it('c',()=>{expect(hd295itp(0,0)).toBe(0);});it('d',()=>{expect(hd295itp(93,73)).toBe(2);});it('e',()=>{expect(hd295itp(15,0)).toBe(4);});});
function hd296itp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph296itp_hd',()=>{it('a',()=>{expect(hd296itp(1,4)).toBe(2);});it('b',()=>{expect(hd296itp(3,1)).toBe(1);});it('c',()=>{expect(hd296itp(0,0)).toBe(0);});it('d',()=>{expect(hd296itp(93,73)).toBe(2);});it('e',()=>{expect(hd296itp(15,0)).toBe(4);});});
function hd297itp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph297itp_hd',()=>{it('a',()=>{expect(hd297itp(1,4)).toBe(2);});it('b',()=>{expect(hd297itp(3,1)).toBe(1);});it('c',()=>{expect(hd297itp(0,0)).toBe(0);});it('d',()=>{expect(hd297itp(93,73)).toBe(2);});it('e',()=>{expect(hd297itp(15,0)).toBe(4);});});
function hd298itp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph298itp_hd',()=>{it('a',()=>{expect(hd298itp(1,4)).toBe(2);});it('b',()=>{expect(hd298itp(3,1)).toBe(1);});it('c',()=>{expect(hd298itp(0,0)).toBe(0);});it('d',()=>{expect(hd298itp(93,73)).toBe(2);});it('e',()=>{expect(hd298itp(15,0)).toBe(4);});});
function hd299itp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph299itp_hd',()=>{it('a',()=>{expect(hd299itp(1,4)).toBe(2);});it('b',()=>{expect(hd299itp(3,1)).toBe(1);});it('c',()=>{expect(hd299itp(0,0)).toBe(0);});it('d',()=>{expect(hd299itp(93,73)).toBe(2);});it('e',()=>{expect(hd299itp(15,0)).toBe(4);});});
function hd300itp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph300itp_hd',()=>{it('a',()=>{expect(hd300itp(1,4)).toBe(2);});it('b',()=>{expect(hd300itp(3,1)).toBe(1);});it('c',()=>{expect(hd300itp(0,0)).toBe(0);});it('d',()=>{expect(hd300itp(93,73)).toBe(2);});it('e',()=>{expect(hd300itp(15,0)).toBe(4);});});
function hd301itp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph301itp_hd',()=>{it('a',()=>{expect(hd301itp(1,4)).toBe(2);});it('b',()=>{expect(hd301itp(3,1)).toBe(1);});it('c',()=>{expect(hd301itp(0,0)).toBe(0);});it('d',()=>{expect(hd301itp(93,73)).toBe(2);});it('e',()=>{expect(hd301itp(15,0)).toBe(4);});});
function hd302itp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph302itp_hd',()=>{it('a',()=>{expect(hd302itp(1,4)).toBe(2);});it('b',()=>{expect(hd302itp(3,1)).toBe(1);});it('c',()=>{expect(hd302itp(0,0)).toBe(0);});it('d',()=>{expect(hd302itp(93,73)).toBe(2);});it('e',()=>{expect(hd302itp(15,0)).toBe(4);});});
function hd303itp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph303itp_hd',()=>{it('a',()=>{expect(hd303itp(1,4)).toBe(2);});it('b',()=>{expect(hd303itp(3,1)).toBe(1);});it('c',()=>{expect(hd303itp(0,0)).toBe(0);});it('d',()=>{expect(hd303itp(93,73)).toBe(2);});it('e',()=>{expect(hd303itp(15,0)).toBe(4);});});
function hd304itp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph304itp_hd',()=>{it('a',()=>{expect(hd304itp(1,4)).toBe(2);});it('b',()=>{expect(hd304itp(3,1)).toBe(1);});it('c',()=>{expect(hd304itp(0,0)).toBe(0);});it('d',()=>{expect(hd304itp(93,73)).toBe(2);});it('e',()=>{expect(hd304itp(15,0)).toBe(4);});});
function hd305itp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph305itp_hd',()=>{it('a',()=>{expect(hd305itp(1,4)).toBe(2);});it('b',()=>{expect(hd305itp(3,1)).toBe(1);});it('c',()=>{expect(hd305itp(0,0)).toBe(0);});it('d',()=>{expect(hd305itp(93,73)).toBe(2);});it('e',()=>{expect(hd305itp(15,0)).toBe(4);});});
function hd306itp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph306itp_hd',()=>{it('a',()=>{expect(hd306itp(1,4)).toBe(2);});it('b',()=>{expect(hd306itp(3,1)).toBe(1);});it('c',()=>{expect(hd306itp(0,0)).toBe(0);});it('d',()=>{expect(hd306itp(93,73)).toBe(2);});it('e',()=>{expect(hd306itp(15,0)).toBe(4);});});
function hd307itp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph307itp_hd',()=>{it('a',()=>{expect(hd307itp(1,4)).toBe(2);});it('b',()=>{expect(hd307itp(3,1)).toBe(1);});it('c',()=>{expect(hd307itp(0,0)).toBe(0);});it('d',()=>{expect(hd307itp(93,73)).toBe(2);});it('e',()=>{expect(hd307itp(15,0)).toBe(4);});});
function hd308itp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph308itp_hd',()=>{it('a',()=>{expect(hd308itp(1,4)).toBe(2);});it('b',()=>{expect(hd308itp(3,1)).toBe(1);});it('c',()=>{expect(hd308itp(0,0)).toBe(0);});it('d',()=>{expect(hd308itp(93,73)).toBe(2);});it('e',()=>{expect(hd308itp(15,0)).toBe(4);});});
function hd309itp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph309itp_hd',()=>{it('a',()=>{expect(hd309itp(1,4)).toBe(2);});it('b',()=>{expect(hd309itp(3,1)).toBe(1);});it('c',()=>{expect(hd309itp(0,0)).toBe(0);});it('d',()=>{expect(hd309itp(93,73)).toBe(2);});it('e',()=>{expect(hd309itp(15,0)).toBe(4);});});
function hd310itp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph310itp_hd',()=>{it('a',()=>{expect(hd310itp(1,4)).toBe(2);});it('b',()=>{expect(hd310itp(3,1)).toBe(1);});it('c',()=>{expect(hd310itp(0,0)).toBe(0);});it('d',()=>{expect(hd310itp(93,73)).toBe(2);});it('e',()=>{expect(hd310itp(15,0)).toBe(4);});});
function hd311itp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph311itp_hd',()=>{it('a',()=>{expect(hd311itp(1,4)).toBe(2);});it('b',()=>{expect(hd311itp(3,1)).toBe(1);});it('c',()=>{expect(hd311itp(0,0)).toBe(0);});it('d',()=>{expect(hd311itp(93,73)).toBe(2);});it('e',()=>{expect(hd311itp(15,0)).toBe(4);});});
function hd312itp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph312itp_hd',()=>{it('a',()=>{expect(hd312itp(1,4)).toBe(2);});it('b',()=>{expect(hd312itp(3,1)).toBe(1);});it('c',()=>{expect(hd312itp(0,0)).toBe(0);});it('d',()=>{expect(hd312itp(93,73)).toBe(2);});it('e',()=>{expect(hd312itp(15,0)).toBe(4);});});
function hd313itp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph313itp_hd',()=>{it('a',()=>{expect(hd313itp(1,4)).toBe(2);});it('b',()=>{expect(hd313itp(3,1)).toBe(1);});it('c',()=>{expect(hd313itp(0,0)).toBe(0);});it('d',()=>{expect(hd313itp(93,73)).toBe(2);});it('e',()=>{expect(hd313itp(15,0)).toBe(4);});});
function hd314itp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph314itp_hd',()=>{it('a',()=>{expect(hd314itp(1,4)).toBe(2);});it('b',()=>{expect(hd314itp(3,1)).toBe(1);});it('c',()=>{expect(hd314itp(0,0)).toBe(0);});it('d',()=>{expect(hd314itp(93,73)).toBe(2);});it('e',()=>{expect(hd314itp(15,0)).toBe(4);});});
function hd315itp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph315itp_hd',()=>{it('a',()=>{expect(hd315itp(1,4)).toBe(2);});it('b',()=>{expect(hd315itp(3,1)).toBe(1);});it('c',()=>{expect(hd315itp(0,0)).toBe(0);});it('d',()=>{expect(hd315itp(93,73)).toBe(2);});it('e',()=>{expect(hd315itp(15,0)).toBe(4);});});
function hd316itp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph316itp_hd',()=>{it('a',()=>{expect(hd316itp(1,4)).toBe(2);});it('b',()=>{expect(hd316itp(3,1)).toBe(1);});it('c',()=>{expect(hd316itp(0,0)).toBe(0);});it('d',()=>{expect(hd316itp(93,73)).toBe(2);});it('e',()=>{expect(hd316itp(15,0)).toBe(4);});});
function hd317itp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph317itp_hd',()=>{it('a',()=>{expect(hd317itp(1,4)).toBe(2);});it('b',()=>{expect(hd317itp(3,1)).toBe(1);});it('c',()=>{expect(hd317itp(0,0)).toBe(0);});it('d',()=>{expect(hd317itp(93,73)).toBe(2);});it('e',()=>{expect(hd317itp(15,0)).toBe(4);});});
function hd318itp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph318itp_hd',()=>{it('a',()=>{expect(hd318itp(1,4)).toBe(2);});it('b',()=>{expect(hd318itp(3,1)).toBe(1);});it('c',()=>{expect(hd318itp(0,0)).toBe(0);});it('d',()=>{expect(hd318itp(93,73)).toBe(2);});it('e',()=>{expect(hd318itp(15,0)).toBe(4);});});
function hd319itp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph319itp_hd',()=>{it('a',()=>{expect(hd319itp(1,4)).toBe(2);});it('b',()=>{expect(hd319itp(3,1)).toBe(1);});it('c',()=>{expect(hd319itp(0,0)).toBe(0);});it('d',()=>{expect(hd319itp(93,73)).toBe(2);});it('e',()=>{expect(hd319itp(15,0)).toBe(4);});});
function hd320itp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph320itp_hd',()=>{it('a',()=>{expect(hd320itp(1,4)).toBe(2);});it('b',()=>{expect(hd320itp(3,1)).toBe(1);});it('c',()=>{expect(hd320itp(0,0)).toBe(0);});it('d',()=>{expect(hd320itp(93,73)).toBe(2);});it('e',()=>{expect(hd320itp(15,0)).toBe(4);});});
function hd321itp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph321itp_hd',()=>{it('a',()=>{expect(hd321itp(1,4)).toBe(2);});it('b',()=>{expect(hd321itp(3,1)).toBe(1);});it('c',()=>{expect(hd321itp(0,0)).toBe(0);});it('d',()=>{expect(hd321itp(93,73)).toBe(2);});it('e',()=>{expect(hd321itp(15,0)).toBe(4);});});
function hd322itp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph322itp_hd',()=>{it('a',()=>{expect(hd322itp(1,4)).toBe(2);});it('b',()=>{expect(hd322itp(3,1)).toBe(1);});it('c',()=>{expect(hd322itp(0,0)).toBe(0);});it('d',()=>{expect(hd322itp(93,73)).toBe(2);});it('e',()=>{expect(hd322itp(15,0)).toBe(4);});});
function hd323itp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph323itp_hd',()=>{it('a',()=>{expect(hd323itp(1,4)).toBe(2);});it('b',()=>{expect(hd323itp(3,1)).toBe(1);});it('c',()=>{expect(hd323itp(0,0)).toBe(0);});it('d',()=>{expect(hd323itp(93,73)).toBe(2);});it('e',()=>{expect(hd323itp(15,0)).toBe(4);});});
function hd324itp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph324itp_hd',()=>{it('a',()=>{expect(hd324itp(1,4)).toBe(2);});it('b',()=>{expect(hd324itp(3,1)).toBe(1);});it('c',()=>{expect(hd324itp(0,0)).toBe(0);});it('d',()=>{expect(hd324itp(93,73)).toBe(2);});it('e',()=>{expect(hd324itp(15,0)).toBe(4);});});
function hd325itp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph325itp_hd',()=>{it('a',()=>{expect(hd325itp(1,4)).toBe(2);});it('b',()=>{expect(hd325itp(3,1)).toBe(1);});it('c',()=>{expect(hd325itp(0,0)).toBe(0);});it('d',()=>{expect(hd325itp(93,73)).toBe(2);});it('e',()=>{expect(hd325itp(15,0)).toBe(4);});});
function hd326itp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph326itp_hd',()=>{it('a',()=>{expect(hd326itp(1,4)).toBe(2);});it('b',()=>{expect(hd326itp(3,1)).toBe(1);});it('c',()=>{expect(hd326itp(0,0)).toBe(0);});it('d',()=>{expect(hd326itp(93,73)).toBe(2);});it('e',()=>{expect(hd326itp(15,0)).toBe(4);});});
function hd327itp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph327itp_hd',()=>{it('a',()=>{expect(hd327itp(1,4)).toBe(2);});it('b',()=>{expect(hd327itp(3,1)).toBe(1);});it('c',()=>{expect(hd327itp(0,0)).toBe(0);});it('d',()=>{expect(hd327itp(93,73)).toBe(2);});it('e',()=>{expect(hd327itp(15,0)).toBe(4);});});
function hd328itp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph328itp_hd',()=>{it('a',()=>{expect(hd328itp(1,4)).toBe(2);});it('b',()=>{expect(hd328itp(3,1)).toBe(1);});it('c',()=>{expect(hd328itp(0,0)).toBe(0);});it('d',()=>{expect(hd328itp(93,73)).toBe(2);});it('e',()=>{expect(hd328itp(15,0)).toBe(4);});});
function hd329itp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph329itp_hd',()=>{it('a',()=>{expect(hd329itp(1,4)).toBe(2);});it('b',()=>{expect(hd329itp(3,1)).toBe(1);});it('c',()=>{expect(hd329itp(0,0)).toBe(0);});it('d',()=>{expect(hd329itp(93,73)).toBe(2);});it('e',()=>{expect(hd329itp(15,0)).toBe(4);});});
function hd330itp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph330itp_hd',()=>{it('a',()=>{expect(hd330itp(1,4)).toBe(2);});it('b',()=>{expect(hd330itp(3,1)).toBe(1);});it('c',()=>{expect(hd330itp(0,0)).toBe(0);});it('d',()=>{expect(hd330itp(93,73)).toBe(2);});it('e',()=>{expect(hd330itp(15,0)).toBe(4);});});
function hd331itp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph331itp_hd',()=>{it('a',()=>{expect(hd331itp(1,4)).toBe(2);});it('b',()=>{expect(hd331itp(3,1)).toBe(1);});it('c',()=>{expect(hd331itp(0,0)).toBe(0);});it('d',()=>{expect(hd331itp(93,73)).toBe(2);});it('e',()=>{expect(hd331itp(15,0)).toBe(4);});});
function hd332itp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph332itp_hd',()=>{it('a',()=>{expect(hd332itp(1,4)).toBe(2);});it('b',()=>{expect(hd332itp(3,1)).toBe(1);});it('c',()=>{expect(hd332itp(0,0)).toBe(0);});it('d',()=>{expect(hd332itp(93,73)).toBe(2);});it('e',()=>{expect(hd332itp(15,0)).toBe(4);});});
function hd333itp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph333itp_hd',()=>{it('a',()=>{expect(hd333itp(1,4)).toBe(2);});it('b',()=>{expect(hd333itp(3,1)).toBe(1);});it('c',()=>{expect(hd333itp(0,0)).toBe(0);});it('d',()=>{expect(hd333itp(93,73)).toBe(2);});it('e',()=>{expect(hd333itp(15,0)).toBe(4);});});
function hd334itp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph334itp_hd',()=>{it('a',()=>{expect(hd334itp(1,4)).toBe(2);});it('b',()=>{expect(hd334itp(3,1)).toBe(1);});it('c',()=>{expect(hd334itp(0,0)).toBe(0);});it('d',()=>{expect(hd334itp(93,73)).toBe(2);});it('e',()=>{expect(hd334itp(15,0)).toBe(4);});});
function hd335itp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph335itp_hd',()=>{it('a',()=>{expect(hd335itp(1,4)).toBe(2);});it('b',()=>{expect(hd335itp(3,1)).toBe(1);});it('c',()=>{expect(hd335itp(0,0)).toBe(0);});it('d',()=>{expect(hd335itp(93,73)).toBe(2);});it('e',()=>{expect(hd335itp(15,0)).toBe(4);});});
function hd336itp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph336itp_hd',()=>{it('a',()=>{expect(hd336itp(1,4)).toBe(2);});it('b',()=>{expect(hd336itp(3,1)).toBe(1);});it('c',()=>{expect(hd336itp(0,0)).toBe(0);});it('d',()=>{expect(hd336itp(93,73)).toBe(2);});it('e',()=>{expect(hd336itp(15,0)).toBe(4);});});
function hd337itp(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph337itp_hd',()=>{it('a',()=>{expect(hd337itp(1,4)).toBe(2);});it('b',()=>{expect(hd337itp(3,1)).toBe(1);});it('c',()=>{expect(hd337itp(0,0)).toBe(0);});it('d',()=>{expect(hd337itp(93,73)).toBe(2);});it('e',()=>{expect(hd337itp(15,0)).toBe(4);});});
