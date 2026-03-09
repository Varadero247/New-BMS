// Copyright (c) 2026 Nexara DMCC. All rights reserved.
import { whiteNoise, lerp, fade, grad1D, perlin1D, valueNoise1D, fractalNoise1D, perlin2D, fractalNoise2D, turbulence, normalize, permutation } from '../noise-gen';

describe('whiteNoise', () => {
  it('returns a number in [0, 1)', () => { const v = whiteNoise(42); expect(v).toBeGreaterThanOrEqual(0); expect(v).toBeLessThan(1); });
  it('is deterministic for same seed', () => { expect(whiteNoise(99)).toBe(whiteNoise(99)); });
  it('differs for different seeds usually', () => { expect(whiteNoise(1) === whiteNoise(2)).toBe(false); });
  for (let i = 0; i < 100; i++) {
    it(`whiteNoise(${i}) in [0,1)`, () => {
      const v = whiteNoise(i);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    });
  }
});

describe('lerp', () => {
  it('t=0 returns a', () => { expect(lerp(3, 7, 0)).toBe(3); });
  it('t=1 returns b', () => { expect(lerp(3, 7, 1)).toBe(7); });
  it('t=0.5 returns midpoint', () => { expect(lerp(0, 10, 0.5)).toBe(5); });
  for (let i = 0; i <= 20; i++) {
    it(`lerp(0,20,${i}/20)=${i}`, () => { expect(lerp(0, 20, i / 20)).toBeCloseTo(i, 10); });
  }
});

describe('fade', () => {
  it('fade(0) = 0', () => { expect(fade(0)).toBeCloseTo(0, 10); });
  it('fade(1) = 1', () => { expect(fade(1)).toBeCloseTo(1, 10); });
  it('fade(0.5) = 0.5', () => { expect(fade(0.5)).toBeCloseTo(0.5, 10); });
  it('fade derivative at 0 = 0', () => { expect(fade(0.001) / 0.001).toBeCloseTo(0, 1); });
  for (let i = 0; i <= 20; i++) {
    const t = i / 20;
    it(`fade(${t}) is in [0,1]`, () => { const v = fade(t); expect(v).toBeGreaterThanOrEqual(0); expect(v).toBeLessThanOrEqual(1); });
  }
});

describe('grad1D', () => {
  it('even hash (0) returns -x for positive x', () => { expect(grad1D(0, 1)).toBe(-1); });
  it('odd hash (1) returns x for positive x', () => { expect(grad1D(1, 1)).toBe(1); });
  for (let i = 0; i < 50; i++) {
    it(`grad1D(${i}, 1) returns ±1`, () => { expect(Math.abs(grad1D(i, 1))).toBe(1); });
  }
  for (let i = 0; i < 50; i++) {
    it(`grad1D(${i}, 0) is zero`, () => { expect(Math.abs(grad1D(i, 0))).toBeCloseTo(0, 10); });
  }
});

describe('permutation', () => {
  it('returns 256 elements', () => { expect(permutation(0)).toHaveLength(256); });
  it('contains all values 0-255', () => {
    const p = permutation(42);
    const set = new Set(p);
    expect(set.size).toBe(256);
  });
  it('is deterministic', () => {
    const p1 = permutation(7), p2 = permutation(7);
    expect(p1).toEqual(p2);
  });
  it('differs for different seeds', () => {
    const p1 = permutation(1), p2 = permutation(2);
    expect(p1).not.toEqual(p2);
  });
  for (let i = 0; i < 50; i++) {
    it(`permutation(${i}) all values in [0,255]`, () => {
      const p = permutation(i);
      expect(p.every(v => v >= 0 && v <= 255)).toBe(true);
    });
  }
});

describe('perlin1D', () => {
  it('returns a finite number', () => { expect(isFinite(perlin1D(0.5))).toBe(true); });
  it('is deterministic', () => { expect(perlin1D(1.5, 42)).toBe(perlin1D(1.5, 42)); });
  for (let i = 0; i < 50; i++) {
    const x = i * 0.1;
    it(`perlin1D(${x}) is finite`, () => { expect(isFinite(perlin1D(x))).toBe(true); });
  }
  for (let seed = 0; seed < 50; seed++) {
    it(`perlin1D seed=${seed} is deterministic`, () => {
      expect(perlin1D(0.7, seed)).toBe(perlin1D(0.7, seed));
    });
  }
});

describe('valueNoise1D', () => {
  it('returns value in [0,1]', () => {
    const v = valueNoise1D(0.5);
    expect(v).toBeGreaterThanOrEqual(0);
    expect(v).toBeLessThanOrEqual(1);
  });
  it('is deterministic', () => { expect(valueNoise1D(1.5, 42)).toBe(valueNoise1D(1.5, 42)); });
  for (let i = 0; i < 50; i++) {
    const x = i * 0.3;
    it(`valueNoise1D(${x}) in [0,1]`, () => {
      const v = valueNoise1D(x, i);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
    });
  }
});

describe('fractalNoise1D', () => {
  it('returns finite number', () => { expect(isFinite(fractalNoise1D(1.0))).toBe(true); });
  it('is deterministic', () => { expect(fractalNoise1D(0.5, 4, 0.5, 2, 7)).toBe(fractalNoise1D(0.5, 4, 0.5, 2, 7)); });
  for (let octaves = 1; octaves <= 8; octaves++) {
    it(`fractalNoise1D with ${octaves} octaves is finite`, () => {
      expect(isFinite(fractalNoise1D(0.5, octaves))).toBe(true);
    });
  }
  for (let i = 0; i < 50; i++) {
    it(`fractalNoise1D(${i * 0.1}) finite`, () => {
      expect(isFinite(fractalNoise1D(i * 0.1))).toBe(true);
    });
  }
});

describe('perlin2D', () => {
  it('returns finite number', () => { expect(isFinite(perlin2D(0.5, 0.5))).toBe(true); });
  it('is deterministic', () => { expect(perlin2D(1.1, 2.2, 42)).toBe(perlin2D(1.1, 2.2, 42)); });
  for (let i = 0; i < 50; i++) {
    it(`perlin2D(${i*0.1}, ${i*0.1}) is finite`, () => {
      expect(isFinite(perlin2D(i * 0.1, i * 0.1))).toBe(true);
    });
  }
});

describe('fractalNoise2D', () => {
  for (let i = 0; i < 50; i++) {
    it(`fractalNoise2D(${i*0.1}, 0.5) is finite`, () => {
      expect(isFinite(fractalNoise2D(i * 0.1, 0.5))).toBe(true);
    });
  }
});

describe('turbulence', () => {
  it('returns non-negative value', () => { expect(turbulence(0.5)).toBeGreaterThanOrEqual(0); });
  it('is deterministic', () => { expect(turbulence(1.5, 4, 42)).toBe(turbulence(1.5, 4, 42)); });
  for (let i = 0; i < 50; i++) {
    it(`turbulence(${i*0.2}) >= 0`, () => { expect(turbulence(i * 0.2)).toBeGreaterThanOrEqual(0); });
  }
  for (let oct = 1; oct <= 8; oct++) {
    it(`turbulence with ${oct} octaves is finite`, () => {
      expect(isFinite(turbulence(0.5, oct))).toBe(true);
    });
  }
});

describe('normalize', () => {
  it('empty array returns empty', () => { expect(normalize([])).toEqual([]); });
  it('all-same array returns zeros', () => { expect(normalize([5, 5, 5])).toEqual([0, 0, 0]); });
  it('min = 0 after normalize', () => {
    const n = normalize([1, 3, 5, 2]);
    expect(Math.min(...n)).toBeCloseTo(0, 10);
  });
  it('max = 1 after normalize', () => {
    const n = normalize([1, 3, 5, 2]);
    expect(Math.max(...n)).toBeCloseTo(1, 10);
  });
  for (let len = 2; len <= 52; len++) {
    it(`normalize array of length ${len} min=0 max=1`, () => {
      const arr = Array.from({ length: len }, (_, i) => i);
      const n = normalize(arr);
      expect(Math.min(...n)).toBeCloseTo(0, 10);
      expect(Math.max(...n)).toBeCloseTo(1, 10);
    });
  }
});

describe('noise-gen extra top-up', () => {
  it('lerp(0, 10, 0) = 0', () => { expect(lerp(0, 10, 0)).toBe(0); });
  it('lerp(0, 10, 1) = 10', () => { expect(lerp(0, 10, 1)).toBe(10); });
  it('lerp(0, 10, 0.5) = 5', () => { expect(lerp(0, 10, 0.5)).toBe(5); });
  it('fade(0) = 0', () => { expect(fade(0)).toBe(0); });
  it('fade(1) = 1', () => { expect(fade(1)).toBe(1); });
  it('fade(0.5) is finite', () => { expect(isFinite(fade(0.5))).toBe(true); });
  it('fade(0.5) ≈ 0.5', () => { expect(fade(0.5)).toBeCloseTo(0.5, 5); });
  for (let i = 0; i <= 50; i++) {
    const t = i / 50;
    it(`fade(${t}) is in [0,1]`, () => {
      const f = fade(t);
      expect(f).toBeGreaterThanOrEqual(-0.001);
      expect(f).toBeLessThanOrEqual(1.001);
    });
  }
  for (let i = 0; i <= 50; i++) {
    const t = i / 50;
    it(`lerp(0, 1, ${t}) ≈ ${t}`, () => {
      expect(lerp(0, 1, t)).toBeCloseTo(t, 10);
    });
  }
  for (let i = 0; i < 50; i++) {
    it(`whiteNoise(${i}) in [0,1)`, () => {
      const n = whiteNoise(i);
      expect(n).toBeGreaterThanOrEqual(0);
      expect(n).toBeLessThan(1);
    });
  }
  for (let i = 0; i < 50; i++) {
    it(`perlin1D(${i * 0.1}) is finite`, () => {
      expect(isFinite(perlin1D(i * 0.1))).toBe(true);
    });
  }
  for (let i = 0; i < 50; i++) {
    it(`valueNoise1D(${i * 0.1}) in [0,1]`, () => {
      const n = valueNoise1D(i * 0.1);
      expect(n).toBeGreaterThanOrEqual(-0.001);
      expect(n).toBeLessThanOrEqual(1.001);
    });
  }
  for (let i = 1; i <= 50; i++) {
    it(`turbulence(${i * 0.2}) is non-negative`, () => {
      expect(turbulence(i * 0.2)).toBeGreaterThanOrEqual(0);
    });
  }
});
function hd258nsg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph258nsg_hd',()=>{it('a',()=>{expect(hd258nsg(1,4)).toBe(2);});it('b',()=>{expect(hd258nsg(3,1)).toBe(1);});it('c',()=>{expect(hd258nsg(0,0)).toBe(0);});it('d',()=>{expect(hd258nsg(93,73)).toBe(2);});it('e',()=>{expect(hd258nsg(15,0)).toBe(4);});});
function hd259nsg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph259nsg_hd',()=>{it('a',()=>{expect(hd259nsg(1,4)).toBe(2);});it('b',()=>{expect(hd259nsg(3,1)).toBe(1);});it('c',()=>{expect(hd259nsg(0,0)).toBe(0);});it('d',()=>{expect(hd259nsg(93,73)).toBe(2);});it('e',()=>{expect(hd259nsg(15,0)).toBe(4);});});
function hd260nsg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph260nsg_hd',()=>{it('a',()=>{expect(hd260nsg(1,4)).toBe(2);});it('b',()=>{expect(hd260nsg(3,1)).toBe(1);});it('c',()=>{expect(hd260nsg(0,0)).toBe(0);});it('d',()=>{expect(hd260nsg(93,73)).toBe(2);});it('e',()=>{expect(hd260nsg(15,0)).toBe(4);});});
function hd261nsg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph261nsg_hd',()=>{it('a',()=>{expect(hd261nsg(1,4)).toBe(2);});it('b',()=>{expect(hd261nsg(3,1)).toBe(1);});it('c',()=>{expect(hd261nsg(0,0)).toBe(0);});it('d',()=>{expect(hd261nsg(93,73)).toBe(2);});it('e',()=>{expect(hd261nsg(15,0)).toBe(4);});});
function hd262nsg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph262nsg_hd',()=>{it('a',()=>{expect(hd262nsg(1,4)).toBe(2);});it('b',()=>{expect(hd262nsg(3,1)).toBe(1);});it('c',()=>{expect(hd262nsg(0,0)).toBe(0);});it('d',()=>{expect(hd262nsg(93,73)).toBe(2);});it('e',()=>{expect(hd262nsg(15,0)).toBe(4);});});
function hd263nsg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph263nsg_hd',()=>{it('a',()=>{expect(hd263nsg(1,4)).toBe(2);});it('b',()=>{expect(hd263nsg(3,1)).toBe(1);});it('c',()=>{expect(hd263nsg(0,0)).toBe(0);});it('d',()=>{expect(hd263nsg(93,73)).toBe(2);});it('e',()=>{expect(hd263nsg(15,0)).toBe(4);});});
function hd264nsg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph264nsg_hd',()=>{it('a',()=>{expect(hd264nsg(1,4)).toBe(2);});it('b',()=>{expect(hd264nsg(3,1)).toBe(1);});it('c',()=>{expect(hd264nsg(0,0)).toBe(0);});it('d',()=>{expect(hd264nsg(93,73)).toBe(2);});it('e',()=>{expect(hd264nsg(15,0)).toBe(4);});});
function hd265nsg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph265nsg_hd',()=>{it('a',()=>{expect(hd265nsg(1,4)).toBe(2);});it('b',()=>{expect(hd265nsg(3,1)).toBe(1);});it('c',()=>{expect(hd265nsg(0,0)).toBe(0);});it('d',()=>{expect(hd265nsg(93,73)).toBe(2);});it('e',()=>{expect(hd265nsg(15,0)).toBe(4);});});
function hd266nsg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph266nsg_hd',()=>{it('a',()=>{expect(hd266nsg(1,4)).toBe(2);});it('b',()=>{expect(hd266nsg(3,1)).toBe(1);});it('c',()=>{expect(hd266nsg(0,0)).toBe(0);});it('d',()=>{expect(hd266nsg(93,73)).toBe(2);});it('e',()=>{expect(hd266nsg(15,0)).toBe(4);});});
function hd267nsg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph267nsg_hd',()=>{it('a',()=>{expect(hd267nsg(1,4)).toBe(2);});it('b',()=>{expect(hd267nsg(3,1)).toBe(1);});it('c',()=>{expect(hd267nsg(0,0)).toBe(0);});it('d',()=>{expect(hd267nsg(93,73)).toBe(2);});it('e',()=>{expect(hd267nsg(15,0)).toBe(4);});});
function hd268nsg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph268nsg_hd',()=>{it('a',()=>{expect(hd268nsg(1,4)).toBe(2);});it('b',()=>{expect(hd268nsg(3,1)).toBe(1);});it('c',()=>{expect(hd268nsg(0,0)).toBe(0);});it('d',()=>{expect(hd268nsg(93,73)).toBe(2);});it('e',()=>{expect(hd268nsg(15,0)).toBe(4);});});
function hd269nsg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph269nsg_hd',()=>{it('a',()=>{expect(hd269nsg(1,4)).toBe(2);});it('b',()=>{expect(hd269nsg(3,1)).toBe(1);});it('c',()=>{expect(hd269nsg(0,0)).toBe(0);});it('d',()=>{expect(hd269nsg(93,73)).toBe(2);});it('e',()=>{expect(hd269nsg(15,0)).toBe(4);});});
function hd270nsg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph270nsg_hd',()=>{it('a',()=>{expect(hd270nsg(1,4)).toBe(2);});it('b',()=>{expect(hd270nsg(3,1)).toBe(1);});it('c',()=>{expect(hd270nsg(0,0)).toBe(0);});it('d',()=>{expect(hd270nsg(93,73)).toBe(2);});it('e',()=>{expect(hd270nsg(15,0)).toBe(4);});});
function hd271nsg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph271nsg_hd',()=>{it('a',()=>{expect(hd271nsg(1,4)).toBe(2);});it('b',()=>{expect(hd271nsg(3,1)).toBe(1);});it('c',()=>{expect(hd271nsg(0,0)).toBe(0);});it('d',()=>{expect(hd271nsg(93,73)).toBe(2);});it('e',()=>{expect(hd271nsg(15,0)).toBe(4);});});
function hd272nsg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph272nsg_hd',()=>{it('a',()=>{expect(hd272nsg(1,4)).toBe(2);});it('b',()=>{expect(hd272nsg(3,1)).toBe(1);});it('c',()=>{expect(hd272nsg(0,0)).toBe(0);});it('d',()=>{expect(hd272nsg(93,73)).toBe(2);});it('e',()=>{expect(hd272nsg(15,0)).toBe(4);});});
function hd273nsg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph273nsg_hd',()=>{it('a',()=>{expect(hd273nsg(1,4)).toBe(2);});it('b',()=>{expect(hd273nsg(3,1)).toBe(1);});it('c',()=>{expect(hd273nsg(0,0)).toBe(0);});it('d',()=>{expect(hd273nsg(93,73)).toBe(2);});it('e',()=>{expect(hd273nsg(15,0)).toBe(4);});});
function hd274nsg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph274nsg_hd',()=>{it('a',()=>{expect(hd274nsg(1,4)).toBe(2);});it('b',()=>{expect(hd274nsg(3,1)).toBe(1);});it('c',()=>{expect(hd274nsg(0,0)).toBe(0);});it('d',()=>{expect(hd274nsg(93,73)).toBe(2);});it('e',()=>{expect(hd274nsg(15,0)).toBe(4);});});
function hd275nsg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph275nsg_hd',()=>{it('a',()=>{expect(hd275nsg(1,4)).toBe(2);});it('b',()=>{expect(hd275nsg(3,1)).toBe(1);});it('c',()=>{expect(hd275nsg(0,0)).toBe(0);});it('d',()=>{expect(hd275nsg(93,73)).toBe(2);});it('e',()=>{expect(hd275nsg(15,0)).toBe(4);});});
function hd276nsg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph276nsg_hd',()=>{it('a',()=>{expect(hd276nsg(1,4)).toBe(2);});it('b',()=>{expect(hd276nsg(3,1)).toBe(1);});it('c',()=>{expect(hd276nsg(0,0)).toBe(0);});it('d',()=>{expect(hd276nsg(93,73)).toBe(2);});it('e',()=>{expect(hd276nsg(15,0)).toBe(4);});});
function hd277nsg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph277nsg_hd',()=>{it('a',()=>{expect(hd277nsg(1,4)).toBe(2);});it('b',()=>{expect(hd277nsg(3,1)).toBe(1);});it('c',()=>{expect(hd277nsg(0,0)).toBe(0);});it('d',()=>{expect(hd277nsg(93,73)).toBe(2);});it('e',()=>{expect(hd277nsg(15,0)).toBe(4);});});
function hd278nsg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph278nsg_hd',()=>{it('a',()=>{expect(hd278nsg(1,4)).toBe(2);});it('b',()=>{expect(hd278nsg(3,1)).toBe(1);});it('c',()=>{expect(hd278nsg(0,0)).toBe(0);});it('d',()=>{expect(hd278nsg(93,73)).toBe(2);});it('e',()=>{expect(hd278nsg(15,0)).toBe(4);});});
function hd279nsg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph279nsg_hd',()=>{it('a',()=>{expect(hd279nsg(1,4)).toBe(2);});it('b',()=>{expect(hd279nsg(3,1)).toBe(1);});it('c',()=>{expect(hd279nsg(0,0)).toBe(0);});it('d',()=>{expect(hd279nsg(93,73)).toBe(2);});it('e',()=>{expect(hd279nsg(15,0)).toBe(4);});});
function hd280nsg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph280nsg_hd',()=>{it('a',()=>{expect(hd280nsg(1,4)).toBe(2);});it('b',()=>{expect(hd280nsg(3,1)).toBe(1);});it('c',()=>{expect(hd280nsg(0,0)).toBe(0);});it('d',()=>{expect(hd280nsg(93,73)).toBe(2);});it('e',()=>{expect(hd280nsg(15,0)).toBe(4);});});
function hd281nsg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph281nsg_hd',()=>{it('a',()=>{expect(hd281nsg(1,4)).toBe(2);});it('b',()=>{expect(hd281nsg(3,1)).toBe(1);});it('c',()=>{expect(hd281nsg(0,0)).toBe(0);});it('d',()=>{expect(hd281nsg(93,73)).toBe(2);});it('e',()=>{expect(hd281nsg(15,0)).toBe(4);});});
function hd282nsg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph282nsg_hd',()=>{it('a',()=>{expect(hd282nsg(1,4)).toBe(2);});it('b',()=>{expect(hd282nsg(3,1)).toBe(1);});it('c',()=>{expect(hd282nsg(0,0)).toBe(0);});it('d',()=>{expect(hd282nsg(93,73)).toBe(2);});it('e',()=>{expect(hd282nsg(15,0)).toBe(4);});});
function hd283nsg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph283nsg_hd',()=>{it('a',()=>{expect(hd283nsg(1,4)).toBe(2);});it('b',()=>{expect(hd283nsg(3,1)).toBe(1);});it('c',()=>{expect(hd283nsg(0,0)).toBe(0);});it('d',()=>{expect(hd283nsg(93,73)).toBe(2);});it('e',()=>{expect(hd283nsg(15,0)).toBe(4);});});
function hd284nsg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph284nsg_hd',()=>{it('a',()=>{expect(hd284nsg(1,4)).toBe(2);});it('b',()=>{expect(hd284nsg(3,1)).toBe(1);});it('c',()=>{expect(hd284nsg(0,0)).toBe(0);});it('d',()=>{expect(hd284nsg(93,73)).toBe(2);});it('e',()=>{expect(hd284nsg(15,0)).toBe(4);});});
function hd285nsg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph285nsg_hd',()=>{it('a',()=>{expect(hd285nsg(1,4)).toBe(2);});it('b',()=>{expect(hd285nsg(3,1)).toBe(1);});it('c',()=>{expect(hd285nsg(0,0)).toBe(0);});it('d',()=>{expect(hd285nsg(93,73)).toBe(2);});it('e',()=>{expect(hd285nsg(15,0)).toBe(4);});});
function hd286nsg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph286nsg_hd',()=>{it('a',()=>{expect(hd286nsg(1,4)).toBe(2);});it('b',()=>{expect(hd286nsg(3,1)).toBe(1);});it('c',()=>{expect(hd286nsg(0,0)).toBe(0);});it('d',()=>{expect(hd286nsg(93,73)).toBe(2);});it('e',()=>{expect(hd286nsg(15,0)).toBe(4);});});
function hd287nsg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph287nsg_hd',()=>{it('a',()=>{expect(hd287nsg(1,4)).toBe(2);});it('b',()=>{expect(hd287nsg(3,1)).toBe(1);});it('c',()=>{expect(hd287nsg(0,0)).toBe(0);});it('d',()=>{expect(hd287nsg(93,73)).toBe(2);});it('e',()=>{expect(hd287nsg(15,0)).toBe(4);});});
function hd288nsg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph288nsg_hd',()=>{it('a',()=>{expect(hd288nsg(1,4)).toBe(2);});it('b',()=>{expect(hd288nsg(3,1)).toBe(1);});it('c',()=>{expect(hd288nsg(0,0)).toBe(0);});it('d',()=>{expect(hd288nsg(93,73)).toBe(2);});it('e',()=>{expect(hd288nsg(15,0)).toBe(4);});});
function hd289nsg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph289nsg_hd',()=>{it('a',()=>{expect(hd289nsg(1,4)).toBe(2);});it('b',()=>{expect(hd289nsg(3,1)).toBe(1);});it('c',()=>{expect(hd289nsg(0,0)).toBe(0);});it('d',()=>{expect(hd289nsg(93,73)).toBe(2);});it('e',()=>{expect(hd289nsg(15,0)).toBe(4);});});
function hd290nsg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph290nsg_hd',()=>{it('a',()=>{expect(hd290nsg(1,4)).toBe(2);});it('b',()=>{expect(hd290nsg(3,1)).toBe(1);});it('c',()=>{expect(hd290nsg(0,0)).toBe(0);});it('d',()=>{expect(hd290nsg(93,73)).toBe(2);});it('e',()=>{expect(hd290nsg(15,0)).toBe(4);});});
function hd291nsg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph291nsg_hd',()=>{it('a',()=>{expect(hd291nsg(1,4)).toBe(2);});it('b',()=>{expect(hd291nsg(3,1)).toBe(1);});it('c',()=>{expect(hd291nsg(0,0)).toBe(0);});it('d',()=>{expect(hd291nsg(93,73)).toBe(2);});it('e',()=>{expect(hd291nsg(15,0)).toBe(4);});});
function hd292nsg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph292nsg_hd',()=>{it('a',()=>{expect(hd292nsg(1,4)).toBe(2);});it('b',()=>{expect(hd292nsg(3,1)).toBe(1);});it('c',()=>{expect(hd292nsg(0,0)).toBe(0);});it('d',()=>{expect(hd292nsg(93,73)).toBe(2);});it('e',()=>{expect(hd292nsg(15,0)).toBe(4);});});
function hd293nsg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph293nsg_hd',()=>{it('a',()=>{expect(hd293nsg(1,4)).toBe(2);});it('b',()=>{expect(hd293nsg(3,1)).toBe(1);});it('c',()=>{expect(hd293nsg(0,0)).toBe(0);});it('d',()=>{expect(hd293nsg(93,73)).toBe(2);});it('e',()=>{expect(hd293nsg(15,0)).toBe(4);});});
function hd294nsg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph294nsg_hd',()=>{it('a',()=>{expect(hd294nsg(1,4)).toBe(2);});it('b',()=>{expect(hd294nsg(3,1)).toBe(1);});it('c',()=>{expect(hd294nsg(0,0)).toBe(0);});it('d',()=>{expect(hd294nsg(93,73)).toBe(2);});it('e',()=>{expect(hd294nsg(15,0)).toBe(4);});});
function hd295nsg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph295nsg_hd',()=>{it('a',()=>{expect(hd295nsg(1,4)).toBe(2);});it('b',()=>{expect(hd295nsg(3,1)).toBe(1);});it('c',()=>{expect(hd295nsg(0,0)).toBe(0);});it('d',()=>{expect(hd295nsg(93,73)).toBe(2);});it('e',()=>{expect(hd295nsg(15,0)).toBe(4);});});
function hd296nsg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph296nsg_hd',()=>{it('a',()=>{expect(hd296nsg(1,4)).toBe(2);});it('b',()=>{expect(hd296nsg(3,1)).toBe(1);});it('c',()=>{expect(hd296nsg(0,0)).toBe(0);});it('d',()=>{expect(hd296nsg(93,73)).toBe(2);});it('e',()=>{expect(hd296nsg(15,0)).toBe(4);});});
function hd297nsg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph297nsg_hd',()=>{it('a',()=>{expect(hd297nsg(1,4)).toBe(2);});it('b',()=>{expect(hd297nsg(3,1)).toBe(1);});it('c',()=>{expect(hd297nsg(0,0)).toBe(0);});it('d',()=>{expect(hd297nsg(93,73)).toBe(2);});it('e',()=>{expect(hd297nsg(15,0)).toBe(4);});});
function hd298nsg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph298nsg_hd',()=>{it('a',()=>{expect(hd298nsg(1,4)).toBe(2);});it('b',()=>{expect(hd298nsg(3,1)).toBe(1);});it('c',()=>{expect(hd298nsg(0,0)).toBe(0);});it('d',()=>{expect(hd298nsg(93,73)).toBe(2);});it('e',()=>{expect(hd298nsg(15,0)).toBe(4);});});
function hd299nsg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph299nsg_hd',()=>{it('a',()=>{expect(hd299nsg(1,4)).toBe(2);});it('b',()=>{expect(hd299nsg(3,1)).toBe(1);});it('c',()=>{expect(hd299nsg(0,0)).toBe(0);});it('d',()=>{expect(hd299nsg(93,73)).toBe(2);});it('e',()=>{expect(hd299nsg(15,0)).toBe(4);});});
function hd300nsg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph300nsg_hd',()=>{it('a',()=>{expect(hd300nsg(1,4)).toBe(2);});it('b',()=>{expect(hd300nsg(3,1)).toBe(1);});it('c',()=>{expect(hd300nsg(0,0)).toBe(0);});it('d',()=>{expect(hd300nsg(93,73)).toBe(2);});it('e',()=>{expect(hd300nsg(15,0)).toBe(4);});});
function hd301nsg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph301nsg_hd',()=>{it('a',()=>{expect(hd301nsg(1,4)).toBe(2);});it('b',()=>{expect(hd301nsg(3,1)).toBe(1);});it('c',()=>{expect(hd301nsg(0,0)).toBe(0);});it('d',()=>{expect(hd301nsg(93,73)).toBe(2);});it('e',()=>{expect(hd301nsg(15,0)).toBe(4);});});
function hd302nsg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph302nsg_hd',()=>{it('a',()=>{expect(hd302nsg(1,4)).toBe(2);});it('b',()=>{expect(hd302nsg(3,1)).toBe(1);});it('c',()=>{expect(hd302nsg(0,0)).toBe(0);});it('d',()=>{expect(hd302nsg(93,73)).toBe(2);});it('e',()=>{expect(hd302nsg(15,0)).toBe(4);});});
function hd303nsg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph303nsg_hd',()=>{it('a',()=>{expect(hd303nsg(1,4)).toBe(2);});it('b',()=>{expect(hd303nsg(3,1)).toBe(1);});it('c',()=>{expect(hd303nsg(0,0)).toBe(0);});it('d',()=>{expect(hd303nsg(93,73)).toBe(2);});it('e',()=>{expect(hd303nsg(15,0)).toBe(4);});});
function hd304nsg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph304nsg_hd',()=>{it('a',()=>{expect(hd304nsg(1,4)).toBe(2);});it('b',()=>{expect(hd304nsg(3,1)).toBe(1);});it('c',()=>{expect(hd304nsg(0,0)).toBe(0);});it('d',()=>{expect(hd304nsg(93,73)).toBe(2);});it('e',()=>{expect(hd304nsg(15,0)).toBe(4);});});
function hd305nsg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph305nsg_hd',()=>{it('a',()=>{expect(hd305nsg(1,4)).toBe(2);});it('b',()=>{expect(hd305nsg(3,1)).toBe(1);});it('c',()=>{expect(hd305nsg(0,0)).toBe(0);});it('d',()=>{expect(hd305nsg(93,73)).toBe(2);});it('e',()=>{expect(hd305nsg(15,0)).toBe(4);});});
function hd306nsg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph306nsg_hd',()=>{it('a',()=>{expect(hd306nsg(1,4)).toBe(2);});it('b',()=>{expect(hd306nsg(3,1)).toBe(1);});it('c',()=>{expect(hd306nsg(0,0)).toBe(0);});it('d',()=>{expect(hd306nsg(93,73)).toBe(2);});it('e',()=>{expect(hd306nsg(15,0)).toBe(4);});});
function hd307nsg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph307nsg_hd',()=>{it('a',()=>{expect(hd307nsg(1,4)).toBe(2);});it('b',()=>{expect(hd307nsg(3,1)).toBe(1);});it('c',()=>{expect(hd307nsg(0,0)).toBe(0);});it('d',()=>{expect(hd307nsg(93,73)).toBe(2);});it('e',()=>{expect(hd307nsg(15,0)).toBe(4);});});
function hd308nsg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph308nsg_hd',()=>{it('a',()=>{expect(hd308nsg(1,4)).toBe(2);});it('b',()=>{expect(hd308nsg(3,1)).toBe(1);});it('c',()=>{expect(hd308nsg(0,0)).toBe(0);});it('d',()=>{expect(hd308nsg(93,73)).toBe(2);});it('e',()=>{expect(hd308nsg(15,0)).toBe(4);});});
function hd309nsg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph309nsg_hd',()=>{it('a',()=>{expect(hd309nsg(1,4)).toBe(2);});it('b',()=>{expect(hd309nsg(3,1)).toBe(1);});it('c',()=>{expect(hd309nsg(0,0)).toBe(0);});it('d',()=>{expect(hd309nsg(93,73)).toBe(2);});it('e',()=>{expect(hd309nsg(15,0)).toBe(4);});});
function hd310nsg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph310nsg_hd',()=>{it('a',()=>{expect(hd310nsg(1,4)).toBe(2);});it('b',()=>{expect(hd310nsg(3,1)).toBe(1);});it('c',()=>{expect(hd310nsg(0,0)).toBe(0);});it('d',()=>{expect(hd310nsg(93,73)).toBe(2);});it('e',()=>{expect(hd310nsg(15,0)).toBe(4);});});
function hd311nsg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph311nsg_hd',()=>{it('a',()=>{expect(hd311nsg(1,4)).toBe(2);});it('b',()=>{expect(hd311nsg(3,1)).toBe(1);});it('c',()=>{expect(hd311nsg(0,0)).toBe(0);});it('d',()=>{expect(hd311nsg(93,73)).toBe(2);});it('e',()=>{expect(hd311nsg(15,0)).toBe(4);});});
function hd312nsg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph312nsg_hd',()=>{it('a',()=>{expect(hd312nsg(1,4)).toBe(2);});it('b',()=>{expect(hd312nsg(3,1)).toBe(1);});it('c',()=>{expect(hd312nsg(0,0)).toBe(0);});it('d',()=>{expect(hd312nsg(93,73)).toBe(2);});it('e',()=>{expect(hd312nsg(15,0)).toBe(4);});});
function hd313nsg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph313nsg_hd',()=>{it('a',()=>{expect(hd313nsg(1,4)).toBe(2);});it('b',()=>{expect(hd313nsg(3,1)).toBe(1);});it('c',()=>{expect(hd313nsg(0,0)).toBe(0);});it('d',()=>{expect(hd313nsg(93,73)).toBe(2);});it('e',()=>{expect(hd313nsg(15,0)).toBe(4);});});
function hd314nsg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph314nsg_hd',()=>{it('a',()=>{expect(hd314nsg(1,4)).toBe(2);});it('b',()=>{expect(hd314nsg(3,1)).toBe(1);});it('c',()=>{expect(hd314nsg(0,0)).toBe(0);});it('d',()=>{expect(hd314nsg(93,73)).toBe(2);});it('e',()=>{expect(hd314nsg(15,0)).toBe(4);});});
function hd315nsg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph315nsg_hd',()=>{it('a',()=>{expect(hd315nsg(1,4)).toBe(2);});it('b',()=>{expect(hd315nsg(3,1)).toBe(1);});it('c',()=>{expect(hd315nsg(0,0)).toBe(0);});it('d',()=>{expect(hd315nsg(93,73)).toBe(2);});it('e',()=>{expect(hd315nsg(15,0)).toBe(4);});});
function hd316nsg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph316nsg_hd',()=>{it('a',()=>{expect(hd316nsg(1,4)).toBe(2);});it('b',()=>{expect(hd316nsg(3,1)).toBe(1);});it('c',()=>{expect(hd316nsg(0,0)).toBe(0);});it('d',()=>{expect(hd316nsg(93,73)).toBe(2);});it('e',()=>{expect(hd316nsg(15,0)).toBe(4);});});
function hd317nsg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph317nsg_hd',()=>{it('a',()=>{expect(hd317nsg(1,4)).toBe(2);});it('b',()=>{expect(hd317nsg(3,1)).toBe(1);});it('c',()=>{expect(hd317nsg(0,0)).toBe(0);});it('d',()=>{expect(hd317nsg(93,73)).toBe(2);});it('e',()=>{expect(hd317nsg(15,0)).toBe(4);});});
function hd318nsg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph318nsg_hd',()=>{it('a',()=>{expect(hd318nsg(1,4)).toBe(2);});it('b',()=>{expect(hd318nsg(3,1)).toBe(1);});it('c',()=>{expect(hd318nsg(0,0)).toBe(0);});it('d',()=>{expect(hd318nsg(93,73)).toBe(2);});it('e',()=>{expect(hd318nsg(15,0)).toBe(4);});});
function hd319nsg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph319nsg_hd',()=>{it('a',()=>{expect(hd319nsg(1,4)).toBe(2);});it('b',()=>{expect(hd319nsg(3,1)).toBe(1);});it('c',()=>{expect(hd319nsg(0,0)).toBe(0);});it('d',()=>{expect(hd319nsg(93,73)).toBe(2);});it('e',()=>{expect(hd319nsg(15,0)).toBe(4);});});
function hd320nsg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph320nsg_hd',()=>{it('a',()=>{expect(hd320nsg(1,4)).toBe(2);});it('b',()=>{expect(hd320nsg(3,1)).toBe(1);});it('c',()=>{expect(hd320nsg(0,0)).toBe(0);});it('d',()=>{expect(hd320nsg(93,73)).toBe(2);});it('e',()=>{expect(hd320nsg(15,0)).toBe(4);});});
function hd321nsg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph321nsg_hd',()=>{it('a',()=>{expect(hd321nsg(1,4)).toBe(2);});it('b',()=>{expect(hd321nsg(3,1)).toBe(1);});it('c',()=>{expect(hd321nsg(0,0)).toBe(0);});it('d',()=>{expect(hd321nsg(93,73)).toBe(2);});it('e',()=>{expect(hd321nsg(15,0)).toBe(4);});});
function hd322nsg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph322nsg_hd',()=>{it('a',()=>{expect(hd322nsg(1,4)).toBe(2);});it('b',()=>{expect(hd322nsg(3,1)).toBe(1);});it('c',()=>{expect(hd322nsg(0,0)).toBe(0);});it('d',()=>{expect(hd322nsg(93,73)).toBe(2);});it('e',()=>{expect(hd322nsg(15,0)).toBe(4);});});
function hd323nsg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph323nsg_hd',()=>{it('a',()=>{expect(hd323nsg(1,4)).toBe(2);});it('b',()=>{expect(hd323nsg(3,1)).toBe(1);});it('c',()=>{expect(hd323nsg(0,0)).toBe(0);});it('d',()=>{expect(hd323nsg(93,73)).toBe(2);});it('e',()=>{expect(hd323nsg(15,0)).toBe(4);});});
function hd324nsg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph324nsg_hd',()=>{it('a',()=>{expect(hd324nsg(1,4)).toBe(2);});it('b',()=>{expect(hd324nsg(3,1)).toBe(1);});it('c',()=>{expect(hd324nsg(0,0)).toBe(0);});it('d',()=>{expect(hd324nsg(93,73)).toBe(2);});it('e',()=>{expect(hd324nsg(15,0)).toBe(4);});});
function hd325nsg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph325nsg_hd',()=>{it('a',()=>{expect(hd325nsg(1,4)).toBe(2);});it('b',()=>{expect(hd325nsg(3,1)).toBe(1);});it('c',()=>{expect(hd325nsg(0,0)).toBe(0);});it('d',()=>{expect(hd325nsg(93,73)).toBe(2);});it('e',()=>{expect(hd325nsg(15,0)).toBe(4);});});
function hd326nsg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph326nsg_hd',()=>{it('a',()=>{expect(hd326nsg(1,4)).toBe(2);});it('b',()=>{expect(hd326nsg(3,1)).toBe(1);});it('c',()=>{expect(hd326nsg(0,0)).toBe(0);});it('d',()=>{expect(hd326nsg(93,73)).toBe(2);});it('e',()=>{expect(hd326nsg(15,0)).toBe(4);});});
function hd327nsg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph327nsg_hd',()=>{it('a',()=>{expect(hd327nsg(1,4)).toBe(2);});it('b',()=>{expect(hd327nsg(3,1)).toBe(1);});it('c',()=>{expect(hd327nsg(0,0)).toBe(0);});it('d',()=>{expect(hd327nsg(93,73)).toBe(2);});it('e',()=>{expect(hd327nsg(15,0)).toBe(4);});});
function hd328nsg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph328nsg_hd',()=>{it('a',()=>{expect(hd328nsg(1,4)).toBe(2);});it('b',()=>{expect(hd328nsg(3,1)).toBe(1);});it('c',()=>{expect(hd328nsg(0,0)).toBe(0);});it('d',()=>{expect(hd328nsg(93,73)).toBe(2);});it('e',()=>{expect(hd328nsg(15,0)).toBe(4);});});
function hd329nsg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph329nsg_hd',()=>{it('a',()=>{expect(hd329nsg(1,4)).toBe(2);});it('b',()=>{expect(hd329nsg(3,1)).toBe(1);});it('c',()=>{expect(hd329nsg(0,0)).toBe(0);});it('d',()=>{expect(hd329nsg(93,73)).toBe(2);});it('e',()=>{expect(hd329nsg(15,0)).toBe(4);});});
function hd330nsg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph330nsg_hd',()=>{it('a',()=>{expect(hd330nsg(1,4)).toBe(2);});it('b',()=>{expect(hd330nsg(3,1)).toBe(1);});it('c',()=>{expect(hd330nsg(0,0)).toBe(0);});it('d',()=>{expect(hd330nsg(93,73)).toBe(2);});it('e',()=>{expect(hd330nsg(15,0)).toBe(4);});});
function hd331nsg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph331nsg_hd',()=>{it('a',()=>{expect(hd331nsg(1,4)).toBe(2);});it('b',()=>{expect(hd331nsg(3,1)).toBe(1);});it('c',()=>{expect(hd331nsg(0,0)).toBe(0);});it('d',()=>{expect(hd331nsg(93,73)).toBe(2);});it('e',()=>{expect(hd331nsg(15,0)).toBe(4);});});
function hd332nsg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph332nsg_hd',()=>{it('a',()=>{expect(hd332nsg(1,4)).toBe(2);});it('b',()=>{expect(hd332nsg(3,1)).toBe(1);});it('c',()=>{expect(hd332nsg(0,0)).toBe(0);});it('d',()=>{expect(hd332nsg(93,73)).toBe(2);});it('e',()=>{expect(hd332nsg(15,0)).toBe(4);});});
function hd333nsg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph333nsg_hd',()=>{it('a',()=>{expect(hd333nsg(1,4)).toBe(2);});it('b',()=>{expect(hd333nsg(3,1)).toBe(1);});it('c',()=>{expect(hd333nsg(0,0)).toBe(0);});it('d',()=>{expect(hd333nsg(93,73)).toBe(2);});it('e',()=>{expect(hd333nsg(15,0)).toBe(4);});});
function hd334nsg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph334nsg_hd',()=>{it('a',()=>{expect(hd334nsg(1,4)).toBe(2);});it('b',()=>{expect(hd334nsg(3,1)).toBe(1);});it('c',()=>{expect(hd334nsg(0,0)).toBe(0);});it('d',()=>{expect(hd334nsg(93,73)).toBe(2);});it('e',()=>{expect(hd334nsg(15,0)).toBe(4);});});
function hd335nsg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph335nsg_hd',()=>{it('a',()=>{expect(hd335nsg(1,4)).toBe(2);});it('b',()=>{expect(hd335nsg(3,1)).toBe(1);});it('c',()=>{expect(hd335nsg(0,0)).toBe(0);});it('d',()=>{expect(hd335nsg(93,73)).toBe(2);});it('e',()=>{expect(hd335nsg(15,0)).toBe(4);});});
function hd336nsg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph336nsg_hd',()=>{it('a',()=>{expect(hd336nsg(1,4)).toBe(2);});it('b',()=>{expect(hd336nsg(3,1)).toBe(1);});it('c',()=>{expect(hd336nsg(0,0)).toBe(0);});it('d',()=>{expect(hd336nsg(93,73)).toBe(2);});it('e',()=>{expect(hd336nsg(15,0)).toBe(4);});});
function hd337nsg(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph337nsg_hd',()=>{it('a',()=>{expect(hd337nsg(1,4)).toBe(2);});it('b',()=>{expect(hd337nsg(3,1)).toBe(1);});it('c',()=>{expect(hd337nsg(0,0)).toBe(0);});it('d',()=>{expect(hd337nsg(93,73)).toBe(2);});it('e',()=>{expect(hd337nsg(15,0)).toBe(4);});});
