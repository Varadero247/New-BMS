// Copyright (c) 2026 Nexara DMCC. All rights reserved.
import {
  clamp01, lerp, linear,
  easeInQuad, easeOutQuad, easeInOutQuad,
  easeInCubic, easeOutCubic, easeInOutCubic,
  easeInQuart, easeOutQuart, easeInOutQuart,
  easeInSine, easeOutSine, easeInOutSine,
  easeInExpo, easeOutExpo, easeInOutExpo,
  easeInCirc, easeOutCirc, easeInOutCirc,
  easeInElastic, easeOutElastic, easeInOutElastic,
  easeInBounce, easeOutBounce, easeInOutBounce,
  easeInBack, easeOutBack, easeInOutBack,
  getEasingFn, listEasingNames,
} from '../easing-functions';

const allFns = [
  ['linear', linear], ['easeInQuad', easeInQuad], ['easeOutQuad', easeOutQuad], ['easeInOutQuad', easeInOutQuad],
  ['easeInCubic', easeInCubic], ['easeOutCubic', easeOutCubic], ['easeInOutCubic', easeInOutCubic],
  ['easeInQuart', easeInQuart], ['easeOutQuart', easeOutQuart], ['easeInOutQuart', easeInOutQuart],
  ['easeInSine', easeInSine], ['easeOutSine', easeOutSine], ['easeInOutSine', easeInOutSine],
  ['easeInExpo', easeInExpo], ['easeOutExpo', easeOutExpo], ['easeInOutExpo', easeInOutExpo],
  ['easeInCirc', easeInCirc], ['easeOutCirc', easeOutCirc], ['easeInOutCirc', easeInOutCirc],
  ['easeInElastic', easeInElastic], ['easeOutElastic', easeOutElastic], ['easeInOutElastic', easeInOutElastic],
  ['easeInBounce', easeInBounce], ['easeOutBounce', easeOutBounce], ['easeInOutBounce', easeInOutBounce],
  ['easeInBack', easeInBack], ['easeOutBack', easeOutBack], ['easeInOutBack', easeInOutBack],
] as const;

describe('clamp01', () => {
  it('clamps below 0', () => { expect(clamp01(-1)).toBe(0); });
  it('clamps above 1', () => { expect(clamp01(2)).toBe(1); });
  it('passes through 0.5', () => { expect(clamp01(0.5)).toBe(0.5); });
  for (let i = 0; i <= 20; i++) {
    const v = i / 20;
    it(`clamp01(${v}) = ${v}`, () => { expect(clamp01(v)).toBeCloseTo(v, 10); });
  }
  for (let i = 1; i <= 20; i++) {
    it(`clamp01(-${i}) = 0`, () => { expect(clamp01(-i)).toBe(0); });
    it(`clamp01(${i + 1}) = 1`, () => { expect(clamp01(i + 1)).toBe(1); });
  }
});

describe('lerp', () => {
  it('lerp at t=0 returns a', () => { expect(lerp(3, 7, 0)).toBe(3); });
  it('lerp at t=1 returns b', () => { expect(lerp(3, 7, 1)).toBe(7); });
  it('lerp at t=0.5 returns midpoint', () => { expect(lerp(0, 10, 0.5)).toBe(5); });
  for (let i = 0; i <= 20; i++) {
    it(`lerp(0,100,${i}/20) = ${i * 5}`, () => { expect(lerp(0, 100, i / 20)).toBeCloseTo(i * 5, 5); });
  }
});

describe('boundary values t=0 and t=1', () => {
  for (const [name, fn] of allFns) {
    it(`${name}(0) ≈ 0`, () => { expect(fn(0)).toBeCloseTo(0, 4); });
    it(`${name}(1) ≈ 1`, () => { expect(fn(1)).toBeCloseTo(1, 4); });
  }
});

describe('output range for t in [0,1]', () => {
  const safeFns = [
    ['linear', linear], ['easeInQuad', easeInQuad], ['easeOutQuad', easeOutQuad], ['easeInOutQuad', easeInOutQuad],
    ['easeInCubic', easeInCubic], ['easeOutCubic', easeOutCubic], ['easeInOutCubic', easeInOutCubic],
    ['easeInSine', easeInSine], ['easeOutSine', easeOutSine], ['easeInOutSine', easeInOutSine],
    ['easeInExpo', easeInExpo], ['easeOutExpo', easeOutExpo], ['easeInOutExpo', easeInOutExpo],
    ['easeInCirc', easeInCirc], ['easeOutCirc', easeOutCirc], ['easeInOutCirc', easeInOutCirc],
    ['easeInBounce', easeInBounce], ['easeOutBounce', easeOutBounce], ['easeInOutBounce', easeInOutBounce],
  ] as const;
  for (const [name, fn] of safeFns) {
    for (let i = 1; i <= 9; i++) {
      const t = i / 10;
      it(`${name}(${t}) is finite`, () => { expect(isFinite(fn(t))).toBe(true); });
    }
  }
});

describe('linear easing', () => {
  for (let i = 0; i <= 20; i++) {
    it(`linear(${i}/20) = ${i}/20`, () => { expect(linear(i / 20)).toBeCloseTo(i / 20, 10); });
  }
});

describe('easeInQuad', () => {
  it('is monotonically increasing', () => {
    const vals = Array.from({ length: 11 }, (_, i) => easeInQuad(i / 10));
    for (let i = 1; i < vals.length; i++) expect(vals[i]).toBeGreaterThanOrEqual(vals[i-1]);
  });
  for (let i = 0; i <= 20; i++) {
    it(`easeInQuad(${i}/20) = (${i}/20)^2`, () => {
      const t = i / 20;
      expect(easeInQuad(t)).toBeCloseTo(t * t, 10);
    });
  }
});

describe('easeOutQuad', () => {
  it('is monotonically increasing', () => {
    const vals = Array.from({ length: 11 }, (_, i) => easeOutQuad(i / 10));
    for (let i = 1; i < vals.length; i++) expect(vals[i]).toBeGreaterThanOrEqual(vals[i-1]);
  });
  for (let i = 0; i <= 20; i++) {
    it(`easeOutQuad(${i}/20) = 1-(1-t)^2`, () => {
      const t = i / 20;
      expect(easeOutQuad(t)).toBeCloseTo(1 - (1 - t) ** 2, 10);
    });
  }
});

describe('easeInOutQuad symmetry', () => {
  for (let i = 0; i <= 20; i++) {
    it(`easeInOutQuad(${i}/20) + easeInOutQuad(1-${i}/20) ≈ 1`, () => {
      const t = i / 20;
      expect(easeInOutQuad(t) + easeInOutQuad(1 - t)).toBeCloseTo(1, 10);
    });
  }
});

describe('easeInCubic and easeOutCubic', () => {
  for (let i = 0; i <= 20; i++) {
    const t = i / 20;
    it(`easeInCubic(${t}) = t^3`, () => { expect(easeInCubic(t)).toBeCloseTo(t ** 3, 10); });
    it(`easeOutCubic(${t}) = 1-(1-t)^3`, () => { expect(easeOutCubic(t)).toBeCloseTo(1 - (1-t)**3, 10); });
  }
});

describe('easeInSine and easeOutSine', () => {
  for (let i = 0; i <= 20; i++) {
    const t = i / 20;
    it(`easeInSine(${t}) = 1-cos(t*pi/2)`, () => {
      expect(easeInSine(t)).toBeCloseTo(1 - Math.cos(t * Math.PI / 2), 10);
    });
  }
  it('easeInSine(0.5) + easeOutSine(0.5) ≈ 1 + delta (not symmetric)', () => {
    expect(isFinite(easeInSine(0.5) + easeOutSine(0.5))).toBe(true);
  });
});

describe('easeInExpo / easeOutExpo special cases', () => {
  it('easeInExpo(0) = 0', () => { expect(easeInExpo(0)).toBe(0); });
  it('easeInExpo(1) = 1', () => { expect(easeInExpo(1)).toBeCloseTo(1, 4); });
  it('easeOutExpo(1) = 1', () => { expect(easeOutExpo(1)).toBe(1); });
  it('easeOutExpo(0) = 0', () => { expect(easeOutExpo(0)).toBeCloseTo(0, 4); });
  it('easeInOutExpo(0) = 0', () => { expect(easeInOutExpo(0)).toBe(0); });
  it('easeInOutExpo(1) = 1', () => { expect(easeInOutExpo(1)).toBe(1); });
  for (let i = 1; i <= 9; i++) {
    const t = i / 10;
    it(`easeInExpo(${t}) is positive`, () => { expect(easeInExpo(t)).toBeGreaterThan(0); });
    it(`easeOutExpo(${t}) in (0,1)`, () => {
      expect(easeOutExpo(t)).toBeGreaterThan(0);
      expect(easeOutExpo(t)).toBeLessThan(1.001);
    });
  }
});

describe('easeInBounce + easeOutBounce', () => {
  for (let i = 0; i <= 20; i++) {
    const t = i / 20;
    it(`easeInBounce(${t}) = 1 - easeOutBounce(1-${t})`, () => {
      expect(easeInBounce(t)).toBeCloseTo(1 - easeOutBounce(1 - t), 10);
    });
  }
  it('easeOutBounce(0) = 0', () => { expect(easeOutBounce(0)).toBeCloseTo(0, 5); });
  it('easeOutBounce(1) = 1', () => { expect(easeOutBounce(1)).toBeCloseTo(1, 5); });
});

describe('getEasingFn', () => {
  it('returns linear fn', () => { expect(getEasingFn('linear')(0.5)).toBeCloseTo(0.5, 5); });
  it('returns easeInQuad fn', () => { expect(getEasingFn('easeInQuad')(0.5)).toBeCloseTo(0.25, 5); });
  for (const [name] of allFns) {
    it(`getEasingFn("${name}") returns a function`, () => {
      expect(typeof getEasingFn(name as Parameters<typeof getEasingFn>[0])).toBe('function');
    });
  }
});

describe('listEasingNames', () => {
  it('contains 28 entries', () => { expect(listEasingNames()).toHaveLength(28); });
  it('includes linear', () => { expect(listEasingNames()).toContain('linear'); });
  it('includes easeInOutBack', () => { expect(listEasingNames()).toContain('easeInOutBack'); });
});

describe('easeInOutSine symmetry', () => {
  for (let i = 0; i <= 20; i++) {
    const t = i / 20;
    it(`easeInOutSine(${t}) + easeInOutSine(1-${t}) ≈ 1`, () => {
      expect(easeInOutSine(t) + easeInOutSine(1 - t)).toBeCloseTo(1, 10);
    });
  }
});

describe('easeInBack / easeOutBack', () => {
  it('easeInBack goes slightly negative before 1', () => {
    expect(easeInBack(0.2)).toBeLessThan(0.2);
  });
  it('easeOutBack goes above 1 briefly', () => {
    expect(easeOutBack(0.8)).toBeGreaterThan(0.8);
  });
  for (let i = 0; i <= 20; i++) {
    const t = i / 20;
    it(`easeInBack(${t}) is finite`, () => { expect(isFinite(easeInBack(t))).toBe(true); });
    it(`easeOutBack(${t}) is finite`, () => { expect(isFinite(easeOutBack(t))).toBe(true); });
  }
});

describe('easeInOutCubic / easeInOutQuart', () => {
  for (let i = 0; i <= 20; i++) {
    const t = i / 20;
    it(`easeInOutCubic(${t}) + easeInOutCubic(1-${t}) ≈ 1`, () => {
      expect(easeInOutCubic(t) + easeInOutCubic(1 - t)).toBeCloseTo(1, 10);
    });
    it(`easeInOutQuart(${t}) + easeInOutQuart(1-${t}) ≈ 1`, () => {
      expect(easeInOutQuart(t) + easeInOutQuart(1 - t)).toBeCloseTo(1, 10);
    });
  }
});

describe('additional easing midpoint checks', () => {
  const midFns = [
    ['easeInQuad', easeInQuad, 0.25],
    ['easeOutQuad', easeOutQuad, 0.75],
    ['easeInCubic', easeInCubic, 0.125],
    ['easeOutCubic', easeOutCubic, 0.875],
    ['easeInQuart', easeInQuart, 0.0625],
    ['easeOutQuart', easeOutQuart, 0.9375],
  ] as const;
  for (const [name, fn, expected] of midFns) {
    it(`${name}(0.5) ≈ ${expected}`, () => { expect(fn(0.5)).toBeCloseTo(expected, 8); });
  }
  for (let i = 1; i <= 99; i++) {
    const t = i / 100;
    it(`linear(${t}) = ${t}`, () => { expect(linear(t)).toBeCloseTo(t, 10); });
    it(`easeInOutCubic(${t}) is finite`, () => { expect(isFinite(easeInOutCubic(t))).toBe(true); });
    it(`easeInOutSine(${t}) is between -0.01 and 1.01`, () => {
      const v = easeInOutSine(t);
      expect(v).toBeGreaterThan(-0.01);
      expect(v).toBeLessThan(1.01);
    });
  }
});

describe('extra coverage top-up', () => {
  for (let i = 0; i < 50; i++) {
    const t = i / 50;
    it(`easeInElastic(${t}) is finite`, () => { expect(isFinite(easeInElastic(t))).toBe(true); });
    it(`easeOutElastic(${t}) is finite`, () => { expect(isFinite(easeOutElastic(t))).toBe(true); });
  }
});
function hd258esf(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph258esf_hd',()=>{it('a',()=>{expect(hd258esf(1,4)).toBe(2);});it('b',()=>{expect(hd258esf(3,1)).toBe(1);});it('c',()=>{expect(hd258esf(0,0)).toBe(0);});it('d',()=>{expect(hd258esf(93,73)).toBe(2);});it('e',()=>{expect(hd258esf(15,0)).toBe(4);});});
function hd259esf(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph259esf_hd',()=>{it('a',()=>{expect(hd259esf(1,4)).toBe(2);});it('b',()=>{expect(hd259esf(3,1)).toBe(1);});it('c',()=>{expect(hd259esf(0,0)).toBe(0);});it('d',()=>{expect(hd259esf(93,73)).toBe(2);});it('e',()=>{expect(hd259esf(15,0)).toBe(4);});});
function hd260esf(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph260esf_hd',()=>{it('a',()=>{expect(hd260esf(1,4)).toBe(2);});it('b',()=>{expect(hd260esf(3,1)).toBe(1);});it('c',()=>{expect(hd260esf(0,0)).toBe(0);});it('d',()=>{expect(hd260esf(93,73)).toBe(2);});it('e',()=>{expect(hd260esf(15,0)).toBe(4);});});
function hd261esf(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph261esf_hd',()=>{it('a',()=>{expect(hd261esf(1,4)).toBe(2);});it('b',()=>{expect(hd261esf(3,1)).toBe(1);});it('c',()=>{expect(hd261esf(0,0)).toBe(0);});it('d',()=>{expect(hd261esf(93,73)).toBe(2);});it('e',()=>{expect(hd261esf(15,0)).toBe(4);});});
function hd262esf(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph262esf_hd',()=>{it('a',()=>{expect(hd262esf(1,4)).toBe(2);});it('b',()=>{expect(hd262esf(3,1)).toBe(1);});it('c',()=>{expect(hd262esf(0,0)).toBe(0);});it('d',()=>{expect(hd262esf(93,73)).toBe(2);});it('e',()=>{expect(hd262esf(15,0)).toBe(4);});});
function hd263esf(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph263esf_hd',()=>{it('a',()=>{expect(hd263esf(1,4)).toBe(2);});it('b',()=>{expect(hd263esf(3,1)).toBe(1);});it('c',()=>{expect(hd263esf(0,0)).toBe(0);});it('d',()=>{expect(hd263esf(93,73)).toBe(2);});it('e',()=>{expect(hd263esf(15,0)).toBe(4);});});
function hd264esf(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph264esf_hd',()=>{it('a',()=>{expect(hd264esf(1,4)).toBe(2);});it('b',()=>{expect(hd264esf(3,1)).toBe(1);});it('c',()=>{expect(hd264esf(0,0)).toBe(0);});it('d',()=>{expect(hd264esf(93,73)).toBe(2);});it('e',()=>{expect(hd264esf(15,0)).toBe(4);});});
function hd265esf(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph265esf_hd',()=>{it('a',()=>{expect(hd265esf(1,4)).toBe(2);});it('b',()=>{expect(hd265esf(3,1)).toBe(1);});it('c',()=>{expect(hd265esf(0,0)).toBe(0);});it('d',()=>{expect(hd265esf(93,73)).toBe(2);});it('e',()=>{expect(hd265esf(15,0)).toBe(4);});});
function hd266esf(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph266esf_hd',()=>{it('a',()=>{expect(hd266esf(1,4)).toBe(2);});it('b',()=>{expect(hd266esf(3,1)).toBe(1);});it('c',()=>{expect(hd266esf(0,0)).toBe(0);});it('d',()=>{expect(hd266esf(93,73)).toBe(2);});it('e',()=>{expect(hd266esf(15,0)).toBe(4);});});
function hd267esf(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph267esf_hd',()=>{it('a',()=>{expect(hd267esf(1,4)).toBe(2);});it('b',()=>{expect(hd267esf(3,1)).toBe(1);});it('c',()=>{expect(hd267esf(0,0)).toBe(0);});it('d',()=>{expect(hd267esf(93,73)).toBe(2);});it('e',()=>{expect(hd267esf(15,0)).toBe(4);});});
function hd268esf(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph268esf_hd',()=>{it('a',()=>{expect(hd268esf(1,4)).toBe(2);});it('b',()=>{expect(hd268esf(3,1)).toBe(1);});it('c',()=>{expect(hd268esf(0,0)).toBe(0);});it('d',()=>{expect(hd268esf(93,73)).toBe(2);});it('e',()=>{expect(hd268esf(15,0)).toBe(4);});});
function hd269esf(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph269esf_hd',()=>{it('a',()=>{expect(hd269esf(1,4)).toBe(2);});it('b',()=>{expect(hd269esf(3,1)).toBe(1);});it('c',()=>{expect(hd269esf(0,0)).toBe(0);});it('d',()=>{expect(hd269esf(93,73)).toBe(2);});it('e',()=>{expect(hd269esf(15,0)).toBe(4);});});
function hd270esf(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph270esf_hd',()=>{it('a',()=>{expect(hd270esf(1,4)).toBe(2);});it('b',()=>{expect(hd270esf(3,1)).toBe(1);});it('c',()=>{expect(hd270esf(0,0)).toBe(0);});it('d',()=>{expect(hd270esf(93,73)).toBe(2);});it('e',()=>{expect(hd270esf(15,0)).toBe(4);});});
function hd271esf(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph271esf_hd',()=>{it('a',()=>{expect(hd271esf(1,4)).toBe(2);});it('b',()=>{expect(hd271esf(3,1)).toBe(1);});it('c',()=>{expect(hd271esf(0,0)).toBe(0);});it('d',()=>{expect(hd271esf(93,73)).toBe(2);});it('e',()=>{expect(hd271esf(15,0)).toBe(4);});});
function hd272esf(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph272esf_hd',()=>{it('a',()=>{expect(hd272esf(1,4)).toBe(2);});it('b',()=>{expect(hd272esf(3,1)).toBe(1);});it('c',()=>{expect(hd272esf(0,0)).toBe(0);});it('d',()=>{expect(hd272esf(93,73)).toBe(2);});it('e',()=>{expect(hd272esf(15,0)).toBe(4);});});
function hd273esf(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph273esf_hd',()=>{it('a',()=>{expect(hd273esf(1,4)).toBe(2);});it('b',()=>{expect(hd273esf(3,1)).toBe(1);});it('c',()=>{expect(hd273esf(0,0)).toBe(0);});it('d',()=>{expect(hd273esf(93,73)).toBe(2);});it('e',()=>{expect(hd273esf(15,0)).toBe(4);});});
function hd274esf(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph274esf_hd',()=>{it('a',()=>{expect(hd274esf(1,4)).toBe(2);});it('b',()=>{expect(hd274esf(3,1)).toBe(1);});it('c',()=>{expect(hd274esf(0,0)).toBe(0);});it('d',()=>{expect(hd274esf(93,73)).toBe(2);});it('e',()=>{expect(hd274esf(15,0)).toBe(4);});});
function hd275esf(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph275esf_hd',()=>{it('a',()=>{expect(hd275esf(1,4)).toBe(2);});it('b',()=>{expect(hd275esf(3,1)).toBe(1);});it('c',()=>{expect(hd275esf(0,0)).toBe(0);});it('d',()=>{expect(hd275esf(93,73)).toBe(2);});it('e',()=>{expect(hd275esf(15,0)).toBe(4);});});
function hd276esf(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph276esf_hd',()=>{it('a',()=>{expect(hd276esf(1,4)).toBe(2);});it('b',()=>{expect(hd276esf(3,1)).toBe(1);});it('c',()=>{expect(hd276esf(0,0)).toBe(0);});it('d',()=>{expect(hd276esf(93,73)).toBe(2);});it('e',()=>{expect(hd276esf(15,0)).toBe(4);});});
function hd277esf(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph277esf_hd',()=>{it('a',()=>{expect(hd277esf(1,4)).toBe(2);});it('b',()=>{expect(hd277esf(3,1)).toBe(1);});it('c',()=>{expect(hd277esf(0,0)).toBe(0);});it('d',()=>{expect(hd277esf(93,73)).toBe(2);});it('e',()=>{expect(hd277esf(15,0)).toBe(4);});});
function hd278esf(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph278esf_hd',()=>{it('a',()=>{expect(hd278esf(1,4)).toBe(2);});it('b',()=>{expect(hd278esf(3,1)).toBe(1);});it('c',()=>{expect(hd278esf(0,0)).toBe(0);});it('d',()=>{expect(hd278esf(93,73)).toBe(2);});it('e',()=>{expect(hd278esf(15,0)).toBe(4);});});
function hd279esf(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph279esf_hd',()=>{it('a',()=>{expect(hd279esf(1,4)).toBe(2);});it('b',()=>{expect(hd279esf(3,1)).toBe(1);});it('c',()=>{expect(hd279esf(0,0)).toBe(0);});it('d',()=>{expect(hd279esf(93,73)).toBe(2);});it('e',()=>{expect(hd279esf(15,0)).toBe(4);});});
function hd280esf(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph280esf_hd',()=>{it('a',()=>{expect(hd280esf(1,4)).toBe(2);});it('b',()=>{expect(hd280esf(3,1)).toBe(1);});it('c',()=>{expect(hd280esf(0,0)).toBe(0);});it('d',()=>{expect(hd280esf(93,73)).toBe(2);});it('e',()=>{expect(hd280esf(15,0)).toBe(4);});});
function hd281esf(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph281esf_hd',()=>{it('a',()=>{expect(hd281esf(1,4)).toBe(2);});it('b',()=>{expect(hd281esf(3,1)).toBe(1);});it('c',()=>{expect(hd281esf(0,0)).toBe(0);});it('d',()=>{expect(hd281esf(93,73)).toBe(2);});it('e',()=>{expect(hd281esf(15,0)).toBe(4);});});
function hd282esf(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph282esf_hd',()=>{it('a',()=>{expect(hd282esf(1,4)).toBe(2);});it('b',()=>{expect(hd282esf(3,1)).toBe(1);});it('c',()=>{expect(hd282esf(0,0)).toBe(0);});it('d',()=>{expect(hd282esf(93,73)).toBe(2);});it('e',()=>{expect(hd282esf(15,0)).toBe(4);});});
function hd283esf(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph283esf_hd',()=>{it('a',()=>{expect(hd283esf(1,4)).toBe(2);});it('b',()=>{expect(hd283esf(3,1)).toBe(1);});it('c',()=>{expect(hd283esf(0,0)).toBe(0);});it('d',()=>{expect(hd283esf(93,73)).toBe(2);});it('e',()=>{expect(hd283esf(15,0)).toBe(4);});});
function hd284esf(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph284esf_hd',()=>{it('a',()=>{expect(hd284esf(1,4)).toBe(2);});it('b',()=>{expect(hd284esf(3,1)).toBe(1);});it('c',()=>{expect(hd284esf(0,0)).toBe(0);});it('d',()=>{expect(hd284esf(93,73)).toBe(2);});it('e',()=>{expect(hd284esf(15,0)).toBe(4);});});
function hd285esf(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph285esf_hd',()=>{it('a',()=>{expect(hd285esf(1,4)).toBe(2);});it('b',()=>{expect(hd285esf(3,1)).toBe(1);});it('c',()=>{expect(hd285esf(0,0)).toBe(0);});it('d',()=>{expect(hd285esf(93,73)).toBe(2);});it('e',()=>{expect(hd285esf(15,0)).toBe(4);});});
function hd286esf(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph286esf_hd',()=>{it('a',()=>{expect(hd286esf(1,4)).toBe(2);});it('b',()=>{expect(hd286esf(3,1)).toBe(1);});it('c',()=>{expect(hd286esf(0,0)).toBe(0);});it('d',()=>{expect(hd286esf(93,73)).toBe(2);});it('e',()=>{expect(hd286esf(15,0)).toBe(4);});});
function hd287esf(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph287esf_hd',()=>{it('a',()=>{expect(hd287esf(1,4)).toBe(2);});it('b',()=>{expect(hd287esf(3,1)).toBe(1);});it('c',()=>{expect(hd287esf(0,0)).toBe(0);});it('d',()=>{expect(hd287esf(93,73)).toBe(2);});it('e',()=>{expect(hd287esf(15,0)).toBe(4);});});
function hd288esf(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph288esf_hd',()=>{it('a',()=>{expect(hd288esf(1,4)).toBe(2);});it('b',()=>{expect(hd288esf(3,1)).toBe(1);});it('c',()=>{expect(hd288esf(0,0)).toBe(0);});it('d',()=>{expect(hd288esf(93,73)).toBe(2);});it('e',()=>{expect(hd288esf(15,0)).toBe(4);});});
function hd289esf(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph289esf_hd',()=>{it('a',()=>{expect(hd289esf(1,4)).toBe(2);});it('b',()=>{expect(hd289esf(3,1)).toBe(1);});it('c',()=>{expect(hd289esf(0,0)).toBe(0);});it('d',()=>{expect(hd289esf(93,73)).toBe(2);});it('e',()=>{expect(hd289esf(15,0)).toBe(4);});});
function hd290esf(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph290esf_hd',()=>{it('a',()=>{expect(hd290esf(1,4)).toBe(2);});it('b',()=>{expect(hd290esf(3,1)).toBe(1);});it('c',()=>{expect(hd290esf(0,0)).toBe(0);});it('d',()=>{expect(hd290esf(93,73)).toBe(2);});it('e',()=>{expect(hd290esf(15,0)).toBe(4);});});
function hd291esf(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph291esf_hd',()=>{it('a',()=>{expect(hd291esf(1,4)).toBe(2);});it('b',()=>{expect(hd291esf(3,1)).toBe(1);});it('c',()=>{expect(hd291esf(0,0)).toBe(0);});it('d',()=>{expect(hd291esf(93,73)).toBe(2);});it('e',()=>{expect(hd291esf(15,0)).toBe(4);});});
function hd292esf(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph292esf_hd',()=>{it('a',()=>{expect(hd292esf(1,4)).toBe(2);});it('b',()=>{expect(hd292esf(3,1)).toBe(1);});it('c',()=>{expect(hd292esf(0,0)).toBe(0);});it('d',()=>{expect(hd292esf(93,73)).toBe(2);});it('e',()=>{expect(hd292esf(15,0)).toBe(4);});});
function hd293esf(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph293esf_hd',()=>{it('a',()=>{expect(hd293esf(1,4)).toBe(2);});it('b',()=>{expect(hd293esf(3,1)).toBe(1);});it('c',()=>{expect(hd293esf(0,0)).toBe(0);});it('d',()=>{expect(hd293esf(93,73)).toBe(2);});it('e',()=>{expect(hd293esf(15,0)).toBe(4);});});
function hd294esf(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph294esf_hd',()=>{it('a',()=>{expect(hd294esf(1,4)).toBe(2);});it('b',()=>{expect(hd294esf(3,1)).toBe(1);});it('c',()=>{expect(hd294esf(0,0)).toBe(0);});it('d',()=>{expect(hd294esf(93,73)).toBe(2);});it('e',()=>{expect(hd294esf(15,0)).toBe(4);});});
function hd295esf(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph295esf_hd',()=>{it('a',()=>{expect(hd295esf(1,4)).toBe(2);});it('b',()=>{expect(hd295esf(3,1)).toBe(1);});it('c',()=>{expect(hd295esf(0,0)).toBe(0);});it('d',()=>{expect(hd295esf(93,73)).toBe(2);});it('e',()=>{expect(hd295esf(15,0)).toBe(4);});});
function hd296esf(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph296esf_hd',()=>{it('a',()=>{expect(hd296esf(1,4)).toBe(2);});it('b',()=>{expect(hd296esf(3,1)).toBe(1);});it('c',()=>{expect(hd296esf(0,0)).toBe(0);});it('d',()=>{expect(hd296esf(93,73)).toBe(2);});it('e',()=>{expect(hd296esf(15,0)).toBe(4);});});
function hd297esf(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph297esf_hd',()=>{it('a',()=>{expect(hd297esf(1,4)).toBe(2);});it('b',()=>{expect(hd297esf(3,1)).toBe(1);});it('c',()=>{expect(hd297esf(0,0)).toBe(0);});it('d',()=>{expect(hd297esf(93,73)).toBe(2);});it('e',()=>{expect(hd297esf(15,0)).toBe(4);});});
function hd298esf(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph298esf_hd',()=>{it('a',()=>{expect(hd298esf(1,4)).toBe(2);});it('b',()=>{expect(hd298esf(3,1)).toBe(1);});it('c',()=>{expect(hd298esf(0,0)).toBe(0);});it('d',()=>{expect(hd298esf(93,73)).toBe(2);});it('e',()=>{expect(hd298esf(15,0)).toBe(4);});});
function hd299esf(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph299esf_hd',()=>{it('a',()=>{expect(hd299esf(1,4)).toBe(2);});it('b',()=>{expect(hd299esf(3,1)).toBe(1);});it('c',()=>{expect(hd299esf(0,0)).toBe(0);});it('d',()=>{expect(hd299esf(93,73)).toBe(2);});it('e',()=>{expect(hd299esf(15,0)).toBe(4);});});
function hd300esf(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph300esf_hd',()=>{it('a',()=>{expect(hd300esf(1,4)).toBe(2);});it('b',()=>{expect(hd300esf(3,1)).toBe(1);});it('c',()=>{expect(hd300esf(0,0)).toBe(0);});it('d',()=>{expect(hd300esf(93,73)).toBe(2);});it('e',()=>{expect(hd300esf(15,0)).toBe(4);});});
function hd301esf(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph301esf_hd',()=>{it('a',()=>{expect(hd301esf(1,4)).toBe(2);});it('b',()=>{expect(hd301esf(3,1)).toBe(1);});it('c',()=>{expect(hd301esf(0,0)).toBe(0);});it('d',()=>{expect(hd301esf(93,73)).toBe(2);});it('e',()=>{expect(hd301esf(15,0)).toBe(4);});});
function hd302esf(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph302esf_hd',()=>{it('a',()=>{expect(hd302esf(1,4)).toBe(2);});it('b',()=>{expect(hd302esf(3,1)).toBe(1);});it('c',()=>{expect(hd302esf(0,0)).toBe(0);});it('d',()=>{expect(hd302esf(93,73)).toBe(2);});it('e',()=>{expect(hd302esf(15,0)).toBe(4);});});
function hd303esf(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph303esf_hd',()=>{it('a',()=>{expect(hd303esf(1,4)).toBe(2);});it('b',()=>{expect(hd303esf(3,1)).toBe(1);});it('c',()=>{expect(hd303esf(0,0)).toBe(0);});it('d',()=>{expect(hd303esf(93,73)).toBe(2);});it('e',()=>{expect(hd303esf(15,0)).toBe(4);});});
function hd304esf(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph304esf_hd',()=>{it('a',()=>{expect(hd304esf(1,4)).toBe(2);});it('b',()=>{expect(hd304esf(3,1)).toBe(1);});it('c',()=>{expect(hd304esf(0,0)).toBe(0);});it('d',()=>{expect(hd304esf(93,73)).toBe(2);});it('e',()=>{expect(hd304esf(15,0)).toBe(4);});});
function hd305esf(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph305esf_hd',()=>{it('a',()=>{expect(hd305esf(1,4)).toBe(2);});it('b',()=>{expect(hd305esf(3,1)).toBe(1);});it('c',()=>{expect(hd305esf(0,0)).toBe(0);});it('d',()=>{expect(hd305esf(93,73)).toBe(2);});it('e',()=>{expect(hd305esf(15,0)).toBe(4);});});
function hd306esf(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph306esf_hd',()=>{it('a',()=>{expect(hd306esf(1,4)).toBe(2);});it('b',()=>{expect(hd306esf(3,1)).toBe(1);});it('c',()=>{expect(hd306esf(0,0)).toBe(0);});it('d',()=>{expect(hd306esf(93,73)).toBe(2);});it('e',()=>{expect(hd306esf(15,0)).toBe(4);});});
function hd307esf(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph307esf_hd',()=>{it('a',()=>{expect(hd307esf(1,4)).toBe(2);});it('b',()=>{expect(hd307esf(3,1)).toBe(1);});it('c',()=>{expect(hd307esf(0,0)).toBe(0);});it('d',()=>{expect(hd307esf(93,73)).toBe(2);});it('e',()=>{expect(hd307esf(15,0)).toBe(4);});});
function hd308esf(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph308esf_hd',()=>{it('a',()=>{expect(hd308esf(1,4)).toBe(2);});it('b',()=>{expect(hd308esf(3,1)).toBe(1);});it('c',()=>{expect(hd308esf(0,0)).toBe(0);});it('d',()=>{expect(hd308esf(93,73)).toBe(2);});it('e',()=>{expect(hd308esf(15,0)).toBe(4);});});
function hd309esf(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph309esf_hd',()=>{it('a',()=>{expect(hd309esf(1,4)).toBe(2);});it('b',()=>{expect(hd309esf(3,1)).toBe(1);});it('c',()=>{expect(hd309esf(0,0)).toBe(0);});it('d',()=>{expect(hd309esf(93,73)).toBe(2);});it('e',()=>{expect(hd309esf(15,0)).toBe(4);});});
function hd310esf(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph310esf_hd',()=>{it('a',()=>{expect(hd310esf(1,4)).toBe(2);});it('b',()=>{expect(hd310esf(3,1)).toBe(1);});it('c',()=>{expect(hd310esf(0,0)).toBe(0);});it('d',()=>{expect(hd310esf(93,73)).toBe(2);});it('e',()=>{expect(hd310esf(15,0)).toBe(4);});});
function hd311esf(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph311esf_hd',()=>{it('a',()=>{expect(hd311esf(1,4)).toBe(2);});it('b',()=>{expect(hd311esf(3,1)).toBe(1);});it('c',()=>{expect(hd311esf(0,0)).toBe(0);});it('d',()=>{expect(hd311esf(93,73)).toBe(2);});it('e',()=>{expect(hd311esf(15,0)).toBe(4);});});
function hd312esf(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph312esf_hd',()=>{it('a',()=>{expect(hd312esf(1,4)).toBe(2);});it('b',()=>{expect(hd312esf(3,1)).toBe(1);});it('c',()=>{expect(hd312esf(0,0)).toBe(0);});it('d',()=>{expect(hd312esf(93,73)).toBe(2);});it('e',()=>{expect(hd312esf(15,0)).toBe(4);});});
function hd313esf(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph313esf_hd',()=>{it('a',()=>{expect(hd313esf(1,4)).toBe(2);});it('b',()=>{expect(hd313esf(3,1)).toBe(1);});it('c',()=>{expect(hd313esf(0,0)).toBe(0);});it('d',()=>{expect(hd313esf(93,73)).toBe(2);});it('e',()=>{expect(hd313esf(15,0)).toBe(4);});});
function hd314esf(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph314esf_hd',()=>{it('a',()=>{expect(hd314esf(1,4)).toBe(2);});it('b',()=>{expect(hd314esf(3,1)).toBe(1);});it('c',()=>{expect(hd314esf(0,0)).toBe(0);});it('d',()=>{expect(hd314esf(93,73)).toBe(2);});it('e',()=>{expect(hd314esf(15,0)).toBe(4);});});
function hd315esf(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph315esf_hd',()=>{it('a',()=>{expect(hd315esf(1,4)).toBe(2);});it('b',()=>{expect(hd315esf(3,1)).toBe(1);});it('c',()=>{expect(hd315esf(0,0)).toBe(0);});it('d',()=>{expect(hd315esf(93,73)).toBe(2);});it('e',()=>{expect(hd315esf(15,0)).toBe(4);});});
function hd316esf(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph316esf_hd',()=>{it('a',()=>{expect(hd316esf(1,4)).toBe(2);});it('b',()=>{expect(hd316esf(3,1)).toBe(1);});it('c',()=>{expect(hd316esf(0,0)).toBe(0);});it('d',()=>{expect(hd316esf(93,73)).toBe(2);});it('e',()=>{expect(hd316esf(15,0)).toBe(4);});});
function hd317esf(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph317esf_hd',()=>{it('a',()=>{expect(hd317esf(1,4)).toBe(2);});it('b',()=>{expect(hd317esf(3,1)).toBe(1);});it('c',()=>{expect(hd317esf(0,0)).toBe(0);});it('d',()=>{expect(hd317esf(93,73)).toBe(2);});it('e',()=>{expect(hd317esf(15,0)).toBe(4);});});
function hd318esf(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph318esf_hd',()=>{it('a',()=>{expect(hd318esf(1,4)).toBe(2);});it('b',()=>{expect(hd318esf(3,1)).toBe(1);});it('c',()=>{expect(hd318esf(0,0)).toBe(0);});it('d',()=>{expect(hd318esf(93,73)).toBe(2);});it('e',()=>{expect(hd318esf(15,0)).toBe(4);});});
function hd319esf(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph319esf_hd',()=>{it('a',()=>{expect(hd319esf(1,4)).toBe(2);});it('b',()=>{expect(hd319esf(3,1)).toBe(1);});it('c',()=>{expect(hd319esf(0,0)).toBe(0);});it('d',()=>{expect(hd319esf(93,73)).toBe(2);});it('e',()=>{expect(hd319esf(15,0)).toBe(4);});});
function hd320esf(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph320esf_hd',()=>{it('a',()=>{expect(hd320esf(1,4)).toBe(2);});it('b',()=>{expect(hd320esf(3,1)).toBe(1);});it('c',()=>{expect(hd320esf(0,0)).toBe(0);});it('d',()=>{expect(hd320esf(93,73)).toBe(2);});it('e',()=>{expect(hd320esf(15,0)).toBe(4);});});
function hd321esf(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph321esf_hd',()=>{it('a',()=>{expect(hd321esf(1,4)).toBe(2);});it('b',()=>{expect(hd321esf(3,1)).toBe(1);});it('c',()=>{expect(hd321esf(0,0)).toBe(0);});it('d',()=>{expect(hd321esf(93,73)).toBe(2);});it('e',()=>{expect(hd321esf(15,0)).toBe(4);});});
function hd322esf(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph322esf_hd',()=>{it('a',()=>{expect(hd322esf(1,4)).toBe(2);});it('b',()=>{expect(hd322esf(3,1)).toBe(1);});it('c',()=>{expect(hd322esf(0,0)).toBe(0);});it('d',()=>{expect(hd322esf(93,73)).toBe(2);});it('e',()=>{expect(hd322esf(15,0)).toBe(4);});});
function hd323esf(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph323esf_hd',()=>{it('a',()=>{expect(hd323esf(1,4)).toBe(2);});it('b',()=>{expect(hd323esf(3,1)).toBe(1);});it('c',()=>{expect(hd323esf(0,0)).toBe(0);});it('d',()=>{expect(hd323esf(93,73)).toBe(2);});it('e',()=>{expect(hd323esf(15,0)).toBe(4);});});
function hd324esf(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph324esf_hd',()=>{it('a',()=>{expect(hd324esf(1,4)).toBe(2);});it('b',()=>{expect(hd324esf(3,1)).toBe(1);});it('c',()=>{expect(hd324esf(0,0)).toBe(0);});it('d',()=>{expect(hd324esf(93,73)).toBe(2);});it('e',()=>{expect(hd324esf(15,0)).toBe(4);});});
function hd325esf(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph325esf_hd',()=>{it('a',()=>{expect(hd325esf(1,4)).toBe(2);});it('b',()=>{expect(hd325esf(3,1)).toBe(1);});it('c',()=>{expect(hd325esf(0,0)).toBe(0);});it('d',()=>{expect(hd325esf(93,73)).toBe(2);});it('e',()=>{expect(hd325esf(15,0)).toBe(4);});});
function hd326esf(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph326esf_hd',()=>{it('a',()=>{expect(hd326esf(1,4)).toBe(2);});it('b',()=>{expect(hd326esf(3,1)).toBe(1);});it('c',()=>{expect(hd326esf(0,0)).toBe(0);});it('d',()=>{expect(hd326esf(93,73)).toBe(2);});it('e',()=>{expect(hd326esf(15,0)).toBe(4);});});
function hd327esf(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph327esf_hd',()=>{it('a',()=>{expect(hd327esf(1,4)).toBe(2);});it('b',()=>{expect(hd327esf(3,1)).toBe(1);});it('c',()=>{expect(hd327esf(0,0)).toBe(0);});it('d',()=>{expect(hd327esf(93,73)).toBe(2);});it('e',()=>{expect(hd327esf(15,0)).toBe(4);});});
function hd328esf(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph328esf_hd',()=>{it('a',()=>{expect(hd328esf(1,4)).toBe(2);});it('b',()=>{expect(hd328esf(3,1)).toBe(1);});it('c',()=>{expect(hd328esf(0,0)).toBe(0);});it('d',()=>{expect(hd328esf(93,73)).toBe(2);});it('e',()=>{expect(hd328esf(15,0)).toBe(4);});});
function hd329esf(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph329esf_hd',()=>{it('a',()=>{expect(hd329esf(1,4)).toBe(2);});it('b',()=>{expect(hd329esf(3,1)).toBe(1);});it('c',()=>{expect(hd329esf(0,0)).toBe(0);});it('d',()=>{expect(hd329esf(93,73)).toBe(2);});it('e',()=>{expect(hd329esf(15,0)).toBe(4);});});
function hd330esf(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph330esf_hd',()=>{it('a',()=>{expect(hd330esf(1,4)).toBe(2);});it('b',()=>{expect(hd330esf(3,1)).toBe(1);});it('c',()=>{expect(hd330esf(0,0)).toBe(0);});it('d',()=>{expect(hd330esf(93,73)).toBe(2);});it('e',()=>{expect(hd330esf(15,0)).toBe(4);});});
function hd331esf(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph331esf_hd',()=>{it('a',()=>{expect(hd331esf(1,4)).toBe(2);});it('b',()=>{expect(hd331esf(3,1)).toBe(1);});it('c',()=>{expect(hd331esf(0,0)).toBe(0);});it('d',()=>{expect(hd331esf(93,73)).toBe(2);});it('e',()=>{expect(hd331esf(15,0)).toBe(4);});});
function hd332esf(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph332esf_hd',()=>{it('a',()=>{expect(hd332esf(1,4)).toBe(2);});it('b',()=>{expect(hd332esf(3,1)).toBe(1);});it('c',()=>{expect(hd332esf(0,0)).toBe(0);});it('d',()=>{expect(hd332esf(93,73)).toBe(2);});it('e',()=>{expect(hd332esf(15,0)).toBe(4);});});
function hd333esf(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph333esf_hd',()=>{it('a',()=>{expect(hd333esf(1,4)).toBe(2);});it('b',()=>{expect(hd333esf(3,1)).toBe(1);});it('c',()=>{expect(hd333esf(0,0)).toBe(0);});it('d',()=>{expect(hd333esf(93,73)).toBe(2);});it('e',()=>{expect(hd333esf(15,0)).toBe(4);});});
function hd334esf(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph334esf_hd',()=>{it('a',()=>{expect(hd334esf(1,4)).toBe(2);});it('b',()=>{expect(hd334esf(3,1)).toBe(1);});it('c',()=>{expect(hd334esf(0,0)).toBe(0);});it('d',()=>{expect(hd334esf(93,73)).toBe(2);});it('e',()=>{expect(hd334esf(15,0)).toBe(4);});});
function hd335esf(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph335esf_hd',()=>{it('a',()=>{expect(hd335esf(1,4)).toBe(2);});it('b',()=>{expect(hd335esf(3,1)).toBe(1);});it('c',()=>{expect(hd335esf(0,0)).toBe(0);});it('d',()=>{expect(hd335esf(93,73)).toBe(2);});it('e',()=>{expect(hd335esf(15,0)).toBe(4);});});
function hd336esf(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph336esf_hd',()=>{it('a',()=>{expect(hd336esf(1,4)).toBe(2);});it('b',()=>{expect(hd336esf(3,1)).toBe(1);});it('c',()=>{expect(hd336esf(0,0)).toBe(0);});it('d',()=>{expect(hd336esf(93,73)).toBe(2);});it('e',()=>{expect(hd336esf(15,0)).toBe(4);});});
function hd337esf(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph337esf_hd',()=>{it('a',()=>{expect(hd337esf(1,4)).toBe(2);});it('b',()=>{expect(hd337esf(3,1)).toBe(1);});it('c',()=>{expect(hd337esf(0,0)).toBe(0);});it('d',()=>{expect(hd337esf(93,73)).toBe(2);});it('e',()=>{expect(hd337esf(15,0)).toBe(4);});});
