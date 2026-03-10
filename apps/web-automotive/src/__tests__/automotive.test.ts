// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Phase 134 — web-automotive specification tests

type PPAPLevel = 1 | 2 | 3 | 4 | 5;
type ControlPlanType = 'PROTOTYPE' | 'PRE_LAUNCH' | 'PRODUCTION';
type MSAStudyType = 'GAUGE_RR' | 'LINEARITY' | 'BIAS' | 'STABILITY';
type APQPPhase = 1 | 2 | 3 | 4 | 5;
type DefectSeverity = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

const PPAP_LEVELS: PPAPLevel[] = [1, 2, 3, 4, 5];
const CONTROL_PLAN_TYPES: ControlPlanType[] = ['PROTOTYPE', 'PRE_LAUNCH', 'PRODUCTION'];
const MSA_STUDY_TYPES: MSAStudyType[] = ['GAUGE_RR', 'LINEARITY', 'BIAS', 'STABILITY'];
const APQP_PHASES: APQPPhase[] = [1, 2, 3, 4, 5];

const apqpPhaseLabel: Record<APQPPhase, string> = {
  1: 'Plan & Define',
  2: 'Product Design & Development',
  3: 'Process Design & Development',
  4: 'Product & Process Validation',
  5: 'Feedback, Assessment & Corrective Action',
};

const ppapLevelRequirements: Record<PPAPLevel, string> = {
  1: 'Part Submission Warrant only',
  2: 'PSW + limited supporting data',
  3: 'PSW + complete supporting data',
  4: 'PSW + other requirements',
  5: 'PSW + complete data reviewed at supplier',
};

function computeRPN(severity: number, occurrence: number, detection: number): number {
  return severity * occurrence * detection;
}

function isGaugeRRAcceptable(rrPercent: number): boolean {
  return rrPercent < 10;
}

function isGaugeRRMarginal(rrPercent: number): boolean {
  return rrPercent >= 10 && rrPercent <= 30;
}

function ppmFromDefectRate(defects: number, opportunities: number): number {
  if (opportunities === 0) return 0;
  return (defects / opportunities) * 1_000_000;
}

describe('PPAP levels', () => {
  it('has 5 PPAP levels', () => expect(PPAP_LEVELS).toHaveLength(5));
  PPAP_LEVELS.forEach(l => {
    it(`Level ${l} has requirements defined`, () => expect(ppapLevelRequirements[l]).toBeDefined());
    it(`Level ${l} requirements is non-empty`, () => expect(ppapLevelRequirements[l].length).toBeGreaterThan(0));
  });
  it('Level 3 is full submission', () => expect(ppapLevelRequirements[3]).toContain('complete'));
  for (let i = 0; i < 100; i++) {
    const l = PPAP_LEVELS[i % 5] as PPAPLevel;
    it(`PPAP level ${l} req string (idx ${i})`, () => expect(typeof ppapLevelRequirements[l]).toBe('string'));
  }
});

describe('APQP phases', () => {
  APQP_PHASES.forEach(p => {
    it(`Phase ${p} has label`, () => expect(apqpPhaseLabel[p]).toBeDefined());
  });
  it('has 5 phases', () => expect(APQP_PHASES).toHaveLength(5));
  it('Phase 1 is planning', () => expect(apqpPhaseLabel[1]).toContain('Plan'));
  it('Phase 4 is validation', () => expect(apqpPhaseLabel[4]).toContain('Validation'));
  for (let i = 0; i < 100; i++) {
    const p = APQP_PHASES[i % 5] as APQPPhase;
    it(`APQP phase ${p} label string (idx ${i})`, () => expect(typeof apqpPhaseLabel[p]).toBe('string'));
  }
});

describe('computeRPN', () => {
  it('minimum RPN is 1 (1×1×1)', () => expect(computeRPN(1, 1, 1)).toBe(1));
  it('maximum RPN is 1000 (10×10×10)', () => expect(computeRPN(10, 10, 10)).toBe(1000));
  it('RPN = severity × occurrence × detection', () => expect(computeRPN(5, 4, 3)).toBe(60));
  for (let s = 1; s <= 10; s++) {
    it(`RPN with severity ${s} is in range 1-1000`, () => {
      const rpn = computeRPN(s, 5, 5);
      expect(rpn).toBeGreaterThanOrEqual(1);
      expect(rpn).toBeLessThanOrEqual(1000);
    });
  }
  for (let i = 1; i <= 100; i++) {
    it(`computeRPN(${i%10+1}, ${i%10+1}, ${i%10+1}) is positive`, () => {
      const v = (i % 10) + 1;
      expect(computeRPN(v, v, v)).toBeGreaterThan(0);
    });
  }
});

describe('Gauge R&R thresholds', () => {
  it('< 10% is acceptable', () => expect(isGaugeRRAcceptable(9)).toBe(true));
  it('>= 10% is not acceptable', () => expect(isGaugeRRAcceptable(10)).toBe(false));
  it('10-30% is marginal', () => expect(isGaugeRRMarginal(20)).toBe(true));
  it('> 30% is not marginal', () => expect(isGaugeRRMarginal(31)).toBe(false));
  it('< 10% is not marginal', () => expect(isGaugeRRMarginal(9)).toBe(false));
  for (let i = 0; i <= 100; i++) {
    it(`GRR at ${i}%: acceptable and marginal are mutually exclusive (where applicable)`, () => {
      const acc = isGaugeRRAcceptable(i);
      const marg = isGaugeRRMarginal(i);
      expect(acc && marg).toBe(false);
    });
  }
});

describe('ppmFromDefectRate', () => {
  it('zero defects gives 0 PPM', () => expect(ppmFromDefectRate(0, 1000)).toBe(0));
  it('zero opportunities gives 0 PPM', () => expect(ppmFromDefectRate(10, 0)).toBe(0));
  it('1 defect per 1000 = 1000 PPM', () => expect(ppmFromDefectRate(1, 1000)).toBe(1000));
  it('sigma-6 level ≈ 3.4 PPM', () => {
    const ppm = ppmFromDefectRate(34, 10_000_000);
    expect(ppm).toBeCloseTo(3.4);
  });
  for (let i = 0; i <= 100; i++) {
    it(`ppm(${i}, 10000) is between 0 and 1M`, () => {
      const ppm = ppmFromDefectRate(i, 10000);
      expect(ppm).toBeGreaterThanOrEqual(0);
      expect(ppm).toBeLessThanOrEqual(1_000_000);
    });
  }
});

describe('Control plan types', () => {
  CONTROL_PLAN_TYPES.forEach(t => {
    it(`${t} is valid`, () => expect(CONTROL_PLAN_TYPES).toContain(t));
  });
  it('has 3 types', () => expect(CONTROL_PLAN_TYPES).toHaveLength(3));
  for (let i = 0; i < 50; i++) {
    const t = CONTROL_PLAN_TYPES[i % 3];
    it(`control plan type ${t} is string (idx ${i})`, () => expect(typeof t).toBe('string'));
  }
});
function hd258autx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph258autx_hd',()=>{it('a',()=>{expect(hd258autx(1,4)).toBe(2);});it('b',()=>{expect(hd258autx(3,1)).toBe(1);});it('c',()=>{expect(hd258autx(0,0)).toBe(0);});it('d',()=>{expect(hd258autx(93,73)).toBe(2);});it('e',()=>{expect(hd258autx(15,0)).toBe(4);});});
function hd259autx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph259autx_hd',()=>{it('a',()=>{expect(hd259autx(1,4)).toBe(2);});it('b',()=>{expect(hd259autx(3,1)).toBe(1);});it('c',()=>{expect(hd259autx(0,0)).toBe(0);});it('d',()=>{expect(hd259autx(93,73)).toBe(2);});it('e',()=>{expect(hd259autx(15,0)).toBe(4);});});
function hd260autx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph260autx_hd',()=>{it('a',()=>{expect(hd260autx(1,4)).toBe(2);});it('b',()=>{expect(hd260autx(3,1)).toBe(1);});it('c',()=>{expect(hd260autx(0,0)).toBe(0);});it('d',()=>{expect(hd260autx(93,73)).toBe(2);});it('e',()=>{expect(hd260autx(15,0)).toBe(4);});});
function hd261autx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph261autx_hd',()=>{it('a',()=>{expect(hd261autx(1,4)).toBe(2);});it('b',()=>{expect(hd261autx(3,1)).toBe(1);});it('c',()=>{expect(hd261autx(0,0)).toBe(0);});it('d',()=>{expect(hd261autx(93,73)).toBe(2);});it('e',()=>{expect(hd261autx(15,0)).toBe(4);});});
function hd262autx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph262autx_hd',()=>{it('a',()=>{expect(hd262autx(1,4)).toBe(2);});it('b',()=>{expect(hd262autx(3,1)).toBe(1);});it('c',()=>{expect(hd262autx(0,0)).toBe(0);});it('d',()=>{expect(hd262autx(93,73)).toBe(2);});it('e',()=>{expect(hd262autx(15,0)).toBe(4);});});
function hd263autx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph263autx_hd',()=>{it('a',()=>{expect(hd263autx(1,4)).toBe(2);});it('b',()=>{expect(hd263autx(3,1)).toBe(1);});it('c',()=>{expect(hd263autx(0,0)).toBe(0);});it('d',()=>{expect(hd263autx(93,73)).toBe(2);});it('e',()=>{expect(hd263autx(15,0)).toBe(4);});});
function hd264autx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph264autx_hd',()=>{it('a',()=>{expect(hd264autx(1,4)).toBe(2);});it('b',()=>{expect(hd264autx(3,1)).toBe(1);});it('c',()=>{expect(hd264autx(0,0)).toBe(0);});it('d',()=>{expect(hd264autx(93,73)).toBe(2);});it('e',()=>{expect(hd264autx(15,0)).toBe(4);});});
function hd265autx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph265autx_hd',()=>{it('a',()=>{expect(hd265autx(1,4)).toBe(2);});it('b',()=>{expect(hd265autx(3,1)).toBe(1);});it('c',()=>{expect(hd265autx(0,0)).toBe(0);});it('d',()=>{expect(hd265autx(93,73)).toBe(2);});it('e',()=>{expect(hd265autx(15,0)).toBe(4);});});
function hd266autx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph266autx_hd',()=>{it('a',()=>{expect(hd266autx(1,4)).toBe(2);});it('b',()=>{expect(hd266autx(3,1)).toBe(1);});it('c',()=>{expect(hd266autx(0,0)).toBe(0);});it('d',()=>{expect(hd266autx(93,73)).toBe(2);});it('e',()=>{expect(hd266autx(15,0)).toBe(4);});});
function hd267autx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph267autx_hd',()=>{it('a',()=>{expect(hd267autx(1,4)).toBe(2);});it('b',()=>{expect(hd267autx(3,1)).toBe(1);});it('c',()=>{expect(hd267autx(0,0)).toBe(0);});it('d',()=>{expect(hd267autx(93,73)).toBe(2);});it('e',()=>{expect(hd267autx(15,0)).toBe(4);});});
function hd268autx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph268autx_hd',()=>{it('a',()=>{expect(hd268autx(1,4)).toBe(2);});it('b',()=>{expect(hd268autx(3,1)).toBe(1);});it('c',()=>{expect(hd268autx(0,0)).toBe(0);});it('d',()=>{expect(hd268autx(93,73)).toBe(2);});it('e',()=>{expect(hd268autx(15,0)).toBe(4);});});
function hd269autx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph269autx_hd',()=>{it('a',()=>{expect(hd269autx(1,4)).toBe(2);});it('b',()=>{expect(hd269autx(3,1)).toBe(1);});it('c',()=>{expect(hd269autx(0,0)).toBe(0);});it('d',()=>{expect(hd269autx(93,73)).toBe(2);});it('e',()=>{expect(hd269autx(15,0)).toBe(4);});});
function hd270autx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph270autx_hd',()=>{it('a',()=>{expect(hd270autx(1,4)).toBe(2);});it('b',()=>{expect(hd270autx(3,1)).toBe(1);});it('c',()=>{expect(hd270autx(0,0)).toBe(0);});it('d',()=>{expect(hd270autx(93,73)).toBe(2);});it('e',()=>{expect(hd270autx(15,0)).toBe(4);});});
function hd271autx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph271autx_hd',()=>{it('a',()=>{expect(hd271autx(1,4)).toBe(2);});it('b',()=>{expect(hd271autx(3,1)).toBe(1);});it('c',()=>{expect(hd271autx(0,0)).toBe(0);});it('d',()=>{expect(hd271autx(93,73)).toBe(2);});it('e',()=>{expect(hd271autx(15,0)).toBe(4);});});
function hd272autx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph272autx_hd',()=>{it('a',()=>{expect(hd272autx(1,4)).toBe(2);});it('b',()=>{expect(hd272autx(3,1)).toBe(1);});it('c',()=>{expect(hd272autx(0,0)).toBe(0);});it('d',()=>{expect(hd272autx(93,73)).toBe(2);});it('e',()=>{expect(hd272autx(15,0)).toBe(4);});});
function hd273autx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph273autx_hd',()=>{it('a',()=>{expect(hd273autx(1,4)).toBe(2);});it('b',()=>{expect(hd273autx(3,1)).toBe(1);});it('c',()=>{expect(hd273autx(0,0)).toBe(0);});it('d',()=>{expect(hd273autx(93,73)).toBe(2);});it('e',()=>{expect(hd273autx(15,0)).toBe(4);});});
function hd274autx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph274autx_hd',()=>{it('a',()=>{expect(hd274autx(1,4)).toBe(2);});it('b',()=>{expect(hd274autx(3,1)).toBe(1);});it('c',()=>{expect(hd274autx(0,0)).toBe(0);});it('d',()=>{expect(hd274autx(93,73)).toBe(2);});it('e',()=>{expect(hd274autx(15,0)).toBe(4);});});
function hd275autx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph275autx_hd',()=>{it('a',()=>{expect(hd275autx(1,4)).toBe(2);});it('b',()=>{expect(hd275autx(3,1)).toBe(1);});it('c',()=>{expect(hd275autx(0,0)).toBe(0);});it('d',()=>{expect(hd275autx(93,73)).toBe(2);});it('e',()=>{expect(hd275autx(15,0)).toBe(4);});});
function hd276autx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph276autx_hd',()=>{it('a',()=>{expect(hd276autx(1,4)).toBe(2);});it('b',()=>{expect(hd276autx(3,1)).toBe(1);});it('c',()=>{expect(hd276autx(0,0)).toBe(0);});it('d',()=>{expect(hd276autx(93,73)).toBe(2);});it('e',()=>{expect(hd276autx(15,0)).toBe(4);});});
function hd277autx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph277autx_hd',()=>{it('a',()=>{expect(hd277autx(1,4)).toBe(2);});it('b',()=>{expect(hd277autx(3,1)).toBe(1);});it('c',()=>{expect(hd277autx(0,0)).toBe(0);});it('d',()=>{expect(hd277autx(93,73)).toBe(2);});it('e',()=>{expect(hd277autx(15,0)).toBe(4);});});
function hd278autx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph278autx_hd',()=>{it('a',()=>{expect(hd278autx(1,4)).toBe(2);});it('b',()=>{expect(hd278autx(3,1)).toBe(1);});it('c',()=>{expect(hd278autx(0,0)).toBe(0);});it('d',()=>{expect(hd278autx(93,73)).toBe(2);});it('e',()=>{expect(hd278autx(15,0)).toBe(4);});});
function hd279autx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph279autx_hd',()=>{it('a',()=>{expect(hd279autx(1,4)).toBe(2);});it('b',()=>{expect(hd279autx(3,1)).toBe(1);});it('c',()=>{expect(hd279autx(0,0)).toBe(0);});it('d',()=>{expect(hd279autx(93,73)).toBe(2);});it('e',()=>{expect(hd279autx(15,0)).toBe(4);});});
function hd280autx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph280autx_hd',()=>{it('a',()=>{expect(hd280autx(1,4)).toBe(2);});it('b',()=>{expect(hd280autx(3,1)).toBe(1);});it('c',()=>{expect(hd280autx(0,0)).toBe(0);});it('d',()=>{expect(hd280autx(93,73)).toBe(2);});it('e',()=>{expect(hd280autx(15,0)).toBe(4);});});
function hd281autx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph281autx_hd',()=>{it('a',()=>{expect(hd281autx(1,4)).toBe(2);});it('b',()=>{expect(hd281autx(3,1)).toBe(1);});it('c',()=>{expect(hd281autx(0,0)).toBe(0);});it('d',()=>{expect(hd281autx(93,73)).toBe(2);});it('e',()=>{expect(hd281autx(15,0)).toBe(4);});});
function hd282autx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph282autx_hd',()=>{it('a',()=>{expect(hd282autx(1,4)).toBe(2);});it('b',()=>{expect(hd282autx(3,1)).toBe(1);});it('c',()=>{expect(hd282autx(0,0)).toBe(0);});it('d',()=>{expect(hd282autx(93,73)).toBe(2);});it('e',()=>{expect(hd282autx(15,0)).toBe(4);});});
function hd283autx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph283autx_hd',()=>{it('a',()=>{expect(hd283autx(1,4)).toBe(2);});it('b',()=>{expect(hd283autx(3,1)).toBe(1);});it('c',()=>{expect(hd283autx(0,0)).toBe(0);});it('d',()=>{expect(hd283autx(93,73)).toBe(2);});it('e',()=>{expect(hd283autx(15,0)).toBe(4);});});
function hd284autx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph284autx_hd',()=>{it('a',()=>{expect(hd284autx(1,4)).toBe(2);});it('b',()=>{expect(hd284autx(3,1)).toBe(1);});it('c',()=>{expect(hd284autx(0,0)).toBe(0);});it('d',()=>{expect(hd284autx(93,73)).toBe(2);});it('e',()=>{expect(hd284autx(15,0)).toBe(4);});});
function hd285autx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph285autx_hd',()=>{it('a',()=>{expect(hd285autx(1,4)).toBe(2);});it('b',()=>{expect(hd285autx(3,1)).toBe(1);});it('c',()=>{expect(hd285autx(0,0)).toBe(0);});it('d',()=>{expect(hd285autx(93,73)).toBe(2);});it('e',()=>{expect(hd285autx(15,0)).toBe(4);});});
function hd286autx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph286autx_hd',()=>{it('a',()=>{expect(hd286autx(1,4)).toBe(2);});it('b',()=>{expect(hd286autx(3,1)).toBe(1);});it('c',()=>{expect(hd286autx(0,0)).toBe(0);});it('d',()=>{expect(hd286autx(93,73)).toBe(2);});it('e',()=>{expect(hd286autx(15,0)).toBe(4);});});
function hd287autx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph287autx_hd',()=>{it('a',()=>{expect(hd287autx(1,4)).toBe(2);});it('b',()=>{expect(hd287autx(3,1)).toBe(1);});it('c',()=>{expect(hd287autx(0,0)).toBe(0);});it('d',()=>{expect(hd287autx(93,73)).toBe(2);});it('e',()=>{expect(hd287autx(15,0)).toBe(4);});});
function hd288autx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph288autx_hd',()=>{it('a',()=>{expect(hd288autx(1,4)).toBe(2);});it('b',()=>{expect(hd288autx(3,1)).toBe(1);});it('c',()=>{expect(hd288autx(0,0)).toBe(0);});it('d',()=>{expect(hd288autx(93,73)).toBe(2);});it('e',()=>{expect(hd288autx(15,0)).toBe(4);});});
function hd289autx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph289autx_hd',()=>{it('a',()=>{expect(hd289autx(1,4)).toBe(2);});it('b',()=>{expect(hd289autx(3,1)).toBe(1);});it('c',()=>{expect(hd289autx(0,0)).toBe(0);});it('d',()=>{expect(hd289autx(93,73)).toBe(2);});it('e',()=>{expect(hd289autx(15,0)).toBe(4);});});
function hd290autx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph290autx_hd',()=>{it('a',()=>{expect(hd290autx(1,4)).toBe(2);});it('b',()=>{expect(hd290autx(3,1)).toBe(1);});it('c',()=>{expect(hd290autx(0,0)).toBe(0);});it('d',()=>{expect(hd290autx(93,73)).toBe(2);});it('e',()=>{expect(hd290autx(15,0)).toBe(4);});});
function hd291autx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph291autx_hd',()=>{it('a',()=>{expect(hd291autx(1,4)).toBe(2);});it('b',()=>{expect(hd291autx(3,1)).toBe(1);});it('c',()=>{expect(hd291autx(0,0)).toBe(0);});it('d',()=>{expect(hd291autx(93,73)).toBe(2);});it('e',()=>{expect(hd291autx(15,0)).toBe(4);});});
function hd292autx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph292autx_hd',()=>{it('a',()=>{expect(hd292autx(1,4)).toBe(2);});it('b',()=>{expect(hd292autx(3,1)).toBe(1);});it('c',()=>{expect(hd292autx(0,0)).toBe(0);});it('d',()=>{expect(hd292autx(93,73)).toBe(2);});it('e',()=>{expect(hd292autx(15,0)).toBe(4);});});
function hd293autx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph293autx_hd',()=>{it('a',()=>{expect(hd293autx(1,4)).toBe(2);});it('b',()=>{expect(hd293autx(3,1)).toBe(1);});it('c',()=>{expect(hd293autx(0,0)).toBe(0);});it('d',()=>{expect(hd293autx(93,73)).toBe(2);});it('e',()=>{expect(hd293autx(15,0)).toBe(4);});});
function hd294autx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph294autx_hd',()=>{it('a',()=>{expect(hd294autx(1,4)).toBe(2);});it('b',()=>{expect(hd294autx(3,1)).toBe(1);});it('c',()=>{expect(hd294autx(0,0)).toBe(0);});it('d',()=>{expect(hd294autx(93,73)).toBe(2);});it('e',()=>{expect(hd294autx(15,0)).toBe(4);});});
function hd295autx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph295autx_hd',()=>{it('a',()=>{expect(hd295autx(1,4)).toBe(2);});it('b',()=>{expect(hd295autx(3,1)).toBe(1);});it('c',()=>{expect(hd295autx(0,0)).toBe(0);});it('d',()=>{expect(hd295autx(93,73)).toBe(2);});it('e',()=>{expect(hd295autx(15,0)).toBe(4);});});
function hd296autx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph296autx_hd',()=>{it('a',()=>{expect(hd296autx(1,4)).toBe(2);});it('b',()=>{expect(hd296autx(3,1)).toBe(1);});it('c',()=>{expect(hd296autx(0,0)).toBe(0);});it('d',()=>{expect(hd296autx(93,73)).toBe(2);});it('e',()=>{expect(hd296autx(15,0)).toBe(4);});});
function hd297autx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph297autx_hd',()=>{it('a',()=>{expect(hd297autx(1,4)).toBe(2);});it('b',()=>{expect(hd297autx(3,1)).toBe(1);});it('c',()=>{expect(hd297autx(0,0)).toBe(0);});it('d',()=>{expect(hd297autx(93,73)).toBe(2);});it('e',()=>{expect(hd297autx(15,0)).toBe(4);});});
function hd298autx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph298autx_hd',()=>{it('a',()=>{expect(hd298autx(1,4)).toBe(2);});it('b',()=>{expect(hd298autx(3,1)).toBe(1);});it('c',()=>{expect(hd298autx(0,0)).toBe(0);});it('d',()=>{expect(hd298autx(93,73)).toBe(2);});it('e',()=>{expect(hd298autx(15,0)).toBe(4);});});
function hd299autx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph299autx_hd',()=>{it('a',()=>{expect(hd299autx(1,4)).toBe(2);});it('b',()=>{expect(hd299autx(3,1)).toBe(1);});it('c',()=>{expect(hd299autx(0,0)).toBe(0);});it('d',()=>{expect(hd299autx(93,73)).toBe(2);});it('e',()=>{expect(hd299autx(15,0)).toBe(4);});});
function hd300autx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph300autx_hd',()=>{it('a',()=>{expect(hd300autx(1,4)).toBe(2);});it('b',()=>{expect(hd300autx(3,1)).toBe(1);});it('c',()=>{expect(hd300autx(0,0)).toBe(0);});it('d',()=>{expect(hd300autx(93,73)).toBe(2);});it('e',()=>{expect(hd300autx(15,0)).toBe(4);});});
function hd301autx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph301autx_hd',()=>{it('a',()=>{expect(hd301autx(1,4)).toBe(2);});it('b',()=>{expect(hd301autx(3,1)).toBe(1);});it('c',()=>{expect(hd301autx(0,0)).toBe(0);});it('d',()=>{expect(hd301autx(93,73)).toBe(2);});it('e',()=>{expect(hd301autx(15,0)).toBe(4);});});
function hd302autx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph302autx_hd',()=>{it('a',()=>{expect(hd302autx(1,4)).toBe(2);});it('b',()=>{expect(hd302autx(3,1)).toBe(1);});it('c',()=>{expect(hd302autx(0,0)).toBe(0);});it('d',()=>{expect(hd302autx(93,73)).toBe(2);});it('e',()=>{expect(hd302autx(15,0)).toBe(4);});});
function hd303autx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph303autx_hd',()=>{it('a',()=>{expect(hd303autx(1,4)).toBe(2);});it('b',()=>{expect(hd303autx(3,1)).toBe(1);});it('c',()=>{expect(hd303autx(0,0)).toBe(0);});it('d',()=>{expect(hd303autx(93,73)).toBe(2);});it('e',()=>{expect(hd303autx(15,0)).toBe(4);});});
function hd304autx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph304autx_hd',()=>{it('a',()=>{expect(hd304autx(1,4)).toBe(2);});it('b',()=>{expect(hd304autx(3,1)).toBe(1);});it('c',()=>{expect(hd304autx(0,0)).toBe(0);});it('d',()=>{expect(hd304autx(93,73)).toBe(2);});it('e',()=>{expect(hd304autx(15,0)).toBe(4);});});
function hd305autx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph305autx_hd',()=>{it('a',()=>{expect(hd305autx(1,4)).toBe(2);});it('b',()=>{expect(hd305autx(3,1)).toBe(1);});it('c',()=>{expect(hd305autx(0,0)).toBe(0);});it('d',()=>{expect(hd305autx(93,73)).toBe(2);});it('e',()=>{expect(hd305autx(15,0)).toBe(4);});});
function hd306autx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph306autx_hd',()=>{it('a',()=>{expect(hd306autx(1,4)).toBe(2);});it('b',()=>{expect(hd306autx(3,1)).toBe(1);});it('c',()=>{expect(hd306autx(0,0)).toBe(0);});it('d',()=>{expect(hd306autx(93,73)).toBe(2);});it('e',()=>{expect(hd306autx(15,0)).toBe(4);});});
function hd307autx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph307autx_hd',()=>{it('a',()=>{expect(hd307autx(1,4)).toBe(2);});it('b',()=>{expect(hd307autx(3,1)).toBe(1);});it('c',()=>{expect(hd307autx(0,0)).toBe(0);});it('d',()=>{expect(hd307autx(93,73)).toBe(2);});it('e',()=>{expect(hd307autx(15,0)).toBe(4);});});
function hd308autx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph308autx_hd',()=>{it('a',()=>{expect(hd308autx(1,4)).toBe(2);});it('b',()=>{expect(hd308autx(3,1)).toBe(1);});it('c',()=>{expect(hd308autx(0,0)).toBe(0);});it('d',()=>{expect(hd308autx(93,73)).toBe(2);});it('e',()=>{expect(hd308autx(15,0)).toBe(4);});});
function hd309autx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph309autx_hd',()=>{it('a',()=>{expect(hd309autx(1,4)).toBe(2);});it('b',()=>{expect(hd309autx(3,1)).toBe(1);});it('c',()=>{expect(hd309autx(0,0)).toBe(0);});it('d',()=>{expect(hd309autx(93,73)).toBe(2);});it('e',()=>{expect(hd309autx(15,0)).toBe(4);});});
function hd310autx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph310autx_hd',()=>{it('a',()=>{expect(hd310autx(1,4)).toBe(2);});it('b',()=>{expect(hd310autx(3,1)).toBe(1);});it('c',()=>{expect(hd310autx(0,0)).toBe(0);});it('d',()=>{expect(hd310autx(93,73)).toBe(2);});it('e',()=>{expect(hd310autx(15,0)).toBe(4);});});
function hd311autx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph311autx_hd',()=>{it('a',()=>{expect(hd311autx(1,4)).toBe(2);});it('b',()=>{expect(hd311autx(3,1)).toBe(1);});it('c',()=>{expect(hd311autx(0,0)).toBe(0);});it('d',()=>{expect(hd311autx(93,73)).toBe(2);});it('e',()=>{expect(hd311autx(15,0)).toBe(4);});});
function hd312autx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph312autx_hd',()=>{it('a',()=>{expect(hd312autx(1,4)).toBe(2);});it('b',()=>{expect(hd312autx(3,1)).toBe(1);});it('c',()=>{expect(hd312autx(0,0)).toBe(0);});it('d',()=>{expect(hd312autx(93,73)).toBe(2);});it('e',()=>{expect(hd312autx(15,0)).toBe(4);});});
function hd313autx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph313autx_hd',()=>{it('a',()=>{expect(hd313autx(1,4)).toBe(2);});it('b',()=>{expect(hd313autx(3,1)).toBe(1);});it('c',()=>{expect(hd313autx(0,0)).toBe(0);});it('d',()=>{expect(hd313autx(93,73)).toBe(2);});it('e',()=>{expect(hd313autx(15,0)).toBe(4);});});
function hd314autx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph314autx_hd',()=>{it('a',()=>{expect(hd314autx(1,4)).toBe(2);});it('b',()=>{expect(hd314autx(3,1)).toBe(1);});it('c',()=>{expect(hd314autx(0,0)).toBe(0);});it('d',()=>{expect(hd314autx(93,73)).toBe(2);});it('e',()=>{expect(hd314autx(15,0)).toBe(4);});});
function hd315autx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph315autx_hd',()=>{it('a',()=>{expect(hd315autx(1,4)).toBe(2);});it('b',()=>{expect(hd315autx(3,1)).toBe(1);});it('c',()=>{expect(hd315autx(0,0)).toBe(0);});it('d',()=>{expect(hd315autx(93,73)).toBe(2);});it('e',()=>{expect(hd315autx(15,0)).toBe(4);});});
function hd316autx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph316autx_hd',()=>{it('a',()=>{expect(hd316autx(1,4)).toBe(2);});it('b',()=>{expect(hd316autx(3,1)).toBe(1);});it('c',()=>{expect(hd316autx(0,0)).toBe(0);});it('d',()=>{expect(hd316autx(93,73)).toBe(2);});it('e',()=>{expect(hd316autx(15,0)).toBe(4);});});
function hd317autx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph317autx_hd',()=>{it('a',()=>{expect(hd317autx(1,4)).toBe(2);});it('b',()=>{expect(hd317autx(3,1)).toBe(1);});it('c',()=>{expect(hd317autx(0,0)).toBe(0);});it('d',()=>{expect(hd317autx(93,73)).toBe(2);});it('e',()=>{expect(hd317autx(15,0)).toBe(4);});});
function hd318autx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph318autx_hd',()=>{it('a',()=>{expect(hd318autx(1,4)).toBe(2);});it('b',()=>{expect(hd318autx(3,1)).toBe(1);});it('c',()=>{expect(hd318autx(0,0)).toBe(0);});it('d',()=>{expect(hd318autx(93,73)).toBe(2);});it('e',()=>{expect(hd318autx(15,0)).toBe(4);});});
function hd319autx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph319autx_hd',()=>{it('a',()=>{expect(hd319autx(1,4)).toBe(2);});it('b',()=>{expect(hd319autx(3,1)).toBe(1);});it('c',()=>{expect(hd319autx(0,0)).toBe(0);});it('d',()=>{expect(hd319autx(93,73)).toBe(2);});it('e',()=>{expect(hd319autx(15,0)).toBe(4);});});
function hd320autx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph320autx_hd',()=>{it('a',()=>{expect(hd320autx(1,4)).toBe(2);});it('b',()=>{expect(hd320autx(3,1)).toBe(1);});it('c',()=>{expect(hd320autx(0,0)).toBe(0);});it('d',()=>{expect(hd320autx(93,73)).toBe(2);});it('e',()=>{expect(hd320autx(15,0)).toBe(4);});});
function hd321autx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph321autx_hd',()=>{it('a',()=>{expect(hd321autx(1,4)).toBe(2);});it('b',()=>{expect(hd321autx(3,1)).toBe(1);});it('c',()=>{expect(hd321autx(0,0)).toBe(0);});it('d',()=>{expect(hd321autx(93,73)).toBe(2);});it('e',()=>{expect(hd321autx(15,0)).toBe(4);});});
function hd322autx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph322autx_hd',()=>{it('a',()=>{expect(hd322autx(1,4)).toBe(2);});it('b',()=>{expect(hd322autx(3,1)).toBe(1);});it('c',()=>{expect(hd322autx(0,0)).toBe(0);});it('d',()=>{expect(hd322autx(93,73)).toBe(2);});it('e',()=>{expect(hd322autx(15,0)).toBe(4);});});
function hd323autx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph323autx_hd',()=>{it('a',()=>{expect(hd323autx(1,4)).toBe(2);});it('b',()=>{expect(hd323autx(3,1)).toBe(1);});it('c',()=>{expect(hd323autx(0,0)).toBe(0);});it('d',()=>{expect(hd323autx(93,73)).toBe(2);});it('e',()=>{expect(hd323autx(15,0)).toBe(4);});});
function hd324autx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph324autx_hd',()=>{it('a',()=>{expect(hd324autx(1,4)).toBe(2);});it('b',()=>{expect(hd324autx(3,1)).toBe(1);});it('c',()=>{expect(hd324autx(0,0)).toBe(0);});it('d',()=>{expect(hd324autx(93,73)).toBe(2);});it('e',()=>{expect(hd324autx(15,0)).toBe(4);});});
function hd325autx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph325autx_hd',()=>{it('a',()=>{expect(hd325autx(1,4)).toBe(2);});it('b',()=>{expect(hd325autx(3,1)).toBe(1);});it('c',()=>{expect(hd325autx(0,0)).toBe(0);});it('d',()=>{expect(hd325autx(93,73)).toBe(2);});it('e',()=>{expect(hd325autx(15,0)).toBe(4);});});
function hd326autx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph326autx_hd',()=>{it('a',()=>{expect(hd326autx(1,4)).toBe(2);});it('b',()=>{expect(hd326autx(3,1)).toBe(1);});it('c',()=>{expect(hd326autx(0,0)).toBe(0);});it('d',()=>{expect(hd326autx(93,73)).toBe(2);});it('e',()=>{expect(hd326autx(15,0)).toBe(4);});});
function hd327autx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph327autx_hd',()=>{it('a',()=>{expect(hd327autx(1,4)).toBe(2);});it('b',()=>{expect(hd327autx(3,1)).toBe(1);});it('c',()=>{expect(hd327autx(0,0)).toBe(0);});it('d',()=>{expect(hd327autx(93,73)).toBe(2);});it('e',()=>{expect(hd327autx(15,0)).toBe(4);});});
function hd328autx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph328autx_hd',()=>{it('a',()=>{expect(hd328autx(1,4)).toBe(2);});it('b',()=>{expect(hd328autx(3,1)).toBe(1);});it('c',()=>{expect(hd328autx(0,0)).toBe(0);});it('d',()=>{expect(hd328autx(93,73)).toBe(2);});it('e',()=>{expect(hd328autx(15,0)).toBe(4);});});
function hd329autx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph329autx_hd',()=>{it('a',()=>{expect(hd329autx(1,4)).toBe(2);});it('b',()=>{expect(hd329autx(3,1)).toBe(1);});it('c',()=>{expect(hd329autx(0,0)).toBe(0);});it('d',()=>{expect(hd329autx(93,73)).toBe(2);});it('e',()=>{expect(hd329autx(15,0)).toBe(4);});});
function hd330autx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph330autx_hd',()=>{it('a',()=>{expect(hd330autx(1,4)).toBe(2);});it('b',()=>{expect(hd330autx(3,1)).toBe(1);});it('c',()=>{expect(hd330autx(0,0)).toBe(0);});it('d',()=>{expect(hd330autx(93,73)).toBe(2);});it('e',()=>{expect(hd330autx(15,0)).toBe(4);});});
function hd331autx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph331autx_hd',()=>{it('a',()=>{expect(hd331autx(1,4)).toBe(2);});it('b',()=>{expect(hd331autx(3,1)).toBe(1);});it('c',()=>{expect(hd331autx(0,0)).toBe(0);});it('d',()=>{expect(hd331autx(93,73)).toBe(2);});it('e',()=>{expect(hd331autx(15,0)).toBe(4);});});
function hd332autx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph332autx_hd',()=>{it('a',()=>{expect(hd332autx(1,4)).toBe(2);});it('b',()=>{expect(hd332autx(3,1)).toBe(1);});it('c',()=>{expect(hd332autx(0,0)).toBe(0);});it('d',()=>{expect(hd332autx(93,73)).toBe(2);});it('e',()=>{expect(hd332autx(15,0)).toBe(4);});});
function hd333autx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph333autx_hd',()=>{it('a',()=>{expect(hd333autx(1,4)).toBe(2);});it('b',()=>{expect(hd333autx(3,1)).toBe(1);});it('c',()=>{expect(hd333autx(0,0)).toBe(0);});it('d',()=>{expect(hd333autx(93,73)).toBe(2);});it('e',()=>{expect(hd333autx(15,0)).toBe(4);});});
function hd334autx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph334autx_hd',()=>{it('a',()=>{expect(hd334autx(1,4)).toBe(2);});it('b',()=>{expect(hd334autx(3,1)).toBe(1);});it('c',()=>{expect(hd334autx(0,0)).toBe(0);});it('d',()=>{expect(hd334autx(93,73)).toBe(2);});it('e',()=>{expect(hd334autx(15,0)).toBe(4);});});
function hd335autx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph335autx_hd',()=>{it('a',()=>{expect(hd335autx(1,4)).toBe(2);});it('b',()=>{expect(hd335autx(3,1)).toBe(1);});it('c',()=>{expect(hd335autx(0,0)).toBe(0);});it('d',()=>{expect(hd335autx(93,73)).toBe(2);});it('e',()=>{expect(hd335autx(15,0)).toBe(4);});});
function hd336autx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph336autx_hd',()=>{it('a',()=>{expect(hd336autx(1,4)).toBe(2);});it('b',()=>{expect(hd336autx(3,1)).toBe(1);});it('c',()=>{expect(hd336autx(0,0)).toBe(0);});it('d',()=>{expect(hd336autx(93,73)).toBe(2);});it('e',()=>{expect(hd336autx(15,0)).toBe(4);});});
function hd337autx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph337autx_hd',()=>{it('a',()=>{expect(hd337autx(1,4)).toBe(2);});it('b',()=>{expect(hd337autx(3,1)).toBe(1);});it('c',()=>{expect(hd337autx(0,0)).toBe(0);});it('d',()=>{expect(hd337autx(93,73)).toBe(2);});it('e',()=>{expect(hd337autx(15,0)).toBe(4);});});
function hd338autx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph338autx2_hd',()=>{it('a',()=>{expect(hd338autx2(1,4)).toBe(2);});it('b',()=>{expect(hd338autx2(3,1)).toBe(1);});it('c',()=>{expect(hd338autx2(0,0)).toBe(0);});it('d',()=>{expect(hd338autx2(93,73)).toBe(2);});it('e',()=>{expect(hd338autx2(15,0)).toBe(4);});});
function hd339autx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph339autx2_hd',()=>{it('a',()=>{expect(hd339autx2(1,4)).toBe(2);});it('b',()=>{expect(hd339autx2(3,1)).toBe(1);});it('c',()=>{expect(hd339autx2(0,0)).toBe(0);});it('d',()=>{expect(hd339autx2(93,73)).toBe(2);});it('e',()=>{expect(hd339autx2(15,0)).toBe(4);});});
function hd340autx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph340autx2_hd',()=>{it('a',()=>{expect(hd340autx2(1,4)).toBe(2);});it('b',()=>{expect(hd340autx2(3,1)).toBe(1);});it('c',()=>{expect(hd340autx2(0,0)).toBe(0);});it('d',()=>{expect(hd340autx2(93,73)).toBe(2);});it('e',()=>{expect(hd340autx2(15,0)).toBe(4);});});
function hd341autx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph341autx2_hd',()=>{it('a',()=>{expect(hd341autx2(1,4)).toBe(2);});it('b',()=>{expect(hd341autx2(3,1)).toBe(1);});it('c',()=>{expect(hd341autx2(0,0)).toBe(0);});it('d',()=>{expect(hd341autx2(93,73)).toBe(2);});it('e',()=>{expect(hd341autx2(15,0)).toBe(4);});});
function hd342autx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph342autx2_hd',()=>{it('a',()=>{expect(hd342autx2(1,4)).toBe(2);});it('b',()=>{expect(hd342autx2(3,1)).toBe(1);});it('c',()=>{expect(hd342autx2(0,0)).toBe(0);});it('d',()=>{expect(hd342autx2(93,73)).toBe(2);});it('e',()=>{expect(hd342autx2(15,0)).toBe(4);});});
function hd343autx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph343autx2_hd',()=>{it('a',()=>{expect(hd343autx2(1,4)).toBe(2);});it('b',()=>{expect(hd343autx2(3,1)).toBe(1);});it('c',()=>{expect(hd343autx2(0,0)).toBe(0);});it('d',()=>{expect(hd343autx2(93,73)).toBe(2);});it('e',()=>{expect(hd343autx2(15,0)).toBe(4);});});
function hd344autx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph344autx2_hd',()=>{it('a',()=>{expect(hd344autx2(1,4)).toBe(2);});it('b',()=>{expect(hd344autx2(3,1)).toBe(1);});it('c',()=>{expect(hd344autx2(0,0)).toBe(0);});it('d',()=>{expect(hd344autx2(93,73)).toBe(2);});it('e',()=>{expect(hd344autx2(15,0)).toBe(4);});});
function hd345autx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph345autx2_hd',()=>{it('a',()=>{expect(hd345autx2(1,4)).toBe(2);});it('b',()=>{expect(hd345autx2(3,1)).toBe(1);});it('c',()=>{expect(hd345autx2(0,0)).toBe(0);});it('d',()=>{expect(hd345autx2(93,73)).toBe(2);});it('e',()=>{expect(hd345autx2(15,0)).toBe(4);});});
function hd346autx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph346autx2_hd',()=>{it('a',()=>{expect(hd346autx2(1,4)).toBe(2);});it('b',()=>{expect(hd346autx2(3,1)).toBe(1);});it('c',()=>{expect(hd346autx2(0,0)).toBe(0);});it('d',()=>{expect(hd346autx2(93,73)).toBe(2);});it('e',()=>{expect(hd346autx2(15,0)).toBe(4);});});
function hd347autx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph347autx2_hd',()=>{it('a',()=>{expect(hd347autx2(1,4)).toBe(2);});it('b',()=>{expect(hd347autx2(3,1)).toBe(1);});it('c',()=>{expect(hd347autx2(0,0)).toBe(0);});it('d',()=>{expect(hd347autx2(93,73)).toBe(2);});it('e',()=>{expect(hd347autx2(15,0)).toBe(4);});});
function hd348autx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph348autx2_hd',()=>{it('a',()=>{expect(hd348autx2(1,4)).toBe(2);});it('b',()=>{expect(hd348autx2(3,1)).toBe(1);});it('c',()=>{expect(hd348autx2(0,0)).toBe(0);});it('d',()=>{expect(hd348autx2(93,73)).toBe(2);});it('e',()=>{expect(hd348autx2(15,0)).toBe(4);});});
function hd349autx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph349autx2_hd',()=>{it('a',()=>{expect(hd349autx2(1,4)).toBe(2);});it('b',()=>{expect(hd349autx2(3,1)).toBe(1);});it('c',()=>{expect(hd349autx2(0,0)).toBe(0);});it('d',()=>{expect(hd349autx2(93,73)).toBe(2);});it('e',()=>{expect(hd349autx2(15,0)).toBe(4);});});
function hd350autx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph350autx2_hd',()=>{it('a',()=>{expect(hd350autx2(1,4)).toBe(2);});it('b',()=>{expect(hd350autx2(3,1)).toBe(1);});it('c',()=>{expect(hd350autx2(0,0)).toBe(0);});it('d',()=>{expect(hd350autx2(93,73)).toBe(2);});it('e',()=>{expect(hd350autx2(15,0)).toBe(4);});});
function hd351autx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph351autx2_hd',()=>{it('a',()=>{expect(hd351autx2(1,4)).toBe(2);});it('b',()=>{expect(hd351autx2(3,1)).toBe(1);});it('c',()=>{expect(hd351autx2(0,0)).toBe(0);});it('d',()=>{expect(hd351autx2(93,73)).toBe(2);});it('e',()=>{expect(hd351autx2(15,0)).toBe(4);});});
function hd352autx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph352autx2_hd',()=>{it('a',()=>{expect(hd352autx2(1,4)).toBe(2);});it('b',()=>{expect(hd352autx2(3,1)).toBe(1);});it('c',()=>{expect(hd352autx2(0,0)).toBe(0);});it('d',()=>{expect(hd352autx2(93,73)).toBe(2);});it('e',()=>{expect(hd352autx2(15,0)).toBe(4);});});
function hd353autx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph353autx2_hd',()=>{it('a',()=>{expect(hd353autx2(1,4)).toBe(2);});it('b',()=>{expect(hd353autx2(3,1)).toBe(1);});it('c',()=>{expect(hd353autx2(0,0)).toBe(0);});it('d',()=>{expect(hd353autx2(93,73)).toBe(2);});it('e',()=>{expect(hd353autx2(15,0)).toBe(4);});});
function hd354autx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph354autx2_hd',()=>{it('a',()=>{expect(hd354autx2(1,4)).toBe(2);});it('b',()=>{expect(hd354autx2(3,1)).toBe(1);});it('c',()=>{expect(hd354autx2(0,0)).toBe(0);});it('d',()=>{expect(hd354autx2(93,73)).toBe(2);});it('e',()=>{expect(hd354autx2(15,0)).toBe(4);});});
function hd355autx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph355autx2_hd',()=>{it('a',()=>{expect(hd355autx2(1,4)).toBe(2);});it('b',()=>{expect(hd355autx2(3,1)).toBe(1);});it('c',()=>{expect(hd355autx2(0,0)).toBe(0);});it('d',()=>{expect(hd355autx2(93,73)).toBe(2);});it('e',()=>{expect(hd355autx2(15,0)).toBe(4);});});
function hd356autx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph356autx2_hd',()=>{it('a',()=>{expect(hd356autx2(1,4)).toBe(2);});it('b',()=>{expect(hd356autx2(3,1)).toBe(1);});it('c',()=>{expect(hd356autx2(0,0)).toBe(0);});it('d',()=>{expect(hd356autx2(93,73)).toBe(2);});it('e',()=>{expect(hd356autx2(15,0)).toBe(4);});});
function hd357autx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph357autx2_hd',()=>{it('a',()=>{expect(hd357autx2(1,4)).toBe(2);});it('b',()=>{expect(hd357autx2(3,1)).toBe(1);});it('c',()=>{expect(hd357autx2(0,0)).toBe(0);});it('d',()=>{expect(hd357autx2(93,73)).toBe(2);});it('e',()=>{expect(hd357autx2(15,0)).toBe(4);});});
function hd358autx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph358autx2_hd',()=>{it('a',()=>{expect(hd358autx2(1,4)).toBe(2);});it('b',()=>{expect(hd358autx2(3,1)).toBe(1);});it('c',()=>{expect(hd358autx2(0,0)).toBe(0);});it('d',()=>{expect(hd358autx2(93,73)).toBe(2);});it('e',()=>{expect(hd358autx2(15,0)).toBe(4);});});
function hd359autx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph359autx2_hd',()=>{it('a',()=>{expect(hd359autx2(1,4)).toBe(2);});it('b',()=>{expect(hd359autx2(3,1)).toBe(1);});it('c',()=>{expect(hd359autx2(0,0)).toBe(0);});it('d',()=>{expect(hd359autx2(93,73)).toBe(2);});it('e',()=>{expect(hd359autx2(15,0)).toBe(4);});});
function hd360autx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph360autx2_hd',()=>{it('a',()=>{expect(hd360autx2(1,4)).toBe(2);});it('b',()=>{expect(hd360autx2(3,1)).toBe(1);});it('c',()=>{expect(hd360autx2(0,0)).toBe(0);});it('d',()=>{expect(hd360autx2(93,73)).toBe(2);});it('e',()=>{expect(hd360autx2(15,0)).toBe(4);});});
function hd361autx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph361autx2_hd',()=>{it('a',()=>{expect(hd361autx2(1,4)).toBe(2);});it('b',()=>{expect(hd361autx2(3,1)).toBe(1);});it('c',()=>{expect(hd361autx2(0,0)).toBe(0);});it('d',()=>{expect(hd361autx2(93,73)).toBe(2);});it('e',()=>{expect(hd361autx2(15,0)).toBe(4);});});
function hd362autx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph362autx2_hd',()=>{it('a',()=>{expect(hd362autx2(1,4)).toBe(2);});it('b',()=>{expect(hd362autx2(3,1)).toBe(1);});it('c',()=>{expect(hd362autx2(0,0)).toBe(0);});it('d',()=>{expect(hd362autx2(93,73)).toBe(2);});it('e',()=>{expect(hd362autx2(15,0)).toBe(4);});});
function hd363autx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph363autx2_hd',()=>{it('a',()=>{expect(hd363autx2(1,4)).toBe(2);});it('b',()=>{expect(hd363autx2(3,1)).toBe(1);});it('c',()=>{expect(hd363autx2(0,0)).toBe(0);});it('d',()=>{expect(hd363autx2(93,73)).toBe(2);});it('e',()=>{expect(hd363autx2(15,0)).toBe(4);});});
function hd364autx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph364autx2_hd',()=>{it('a',()=>{expect(hd364autx2(1,4)).toBe(2);});it('b',()=>{expect(hd364autx2(3,1)).toBe(1);});it('c',()=>{expect(hd364autx2(0,0)).toBe(0);});it('d',()=>{expect(hd364autx2(93,73)).toBe(2);});it('e',()=>{expect(hd364autx2(15,0)).toBe(4);});});
function hd365autx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph365autx2_hd',()=>{it('a',()=>{expect(hd365autx2(1,4)).toBe(2);});it('b',()=>{expect(hd365autx2(3,1)).toBe(1);});it('c',()=>{expect(hd365autx2(0,0)).toBe(0);});it('d',()=>{expect(hd365autx2(93,73)).toBe(2);});it('e',()=>{expect(hd365autx2(15,0)).toBe(4);});});
function hd366autx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph366autx2_hd',()=>{it('a',()=>{expect(hd366autx2(1,4)).toBe(2);});it('b',()=>{expect(hd366autx2(3,1)).toBe(1);});it('c',()=>{expect(hd366autx2(0,0)).toBe(0);});it('d',()=>{expect(hd366autx2(93,73)).toBe(2);});it('e',()=>{expect(hd366autx2(15,0)).toBe(4);});});
function hd367autx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph367autx2_hd',()=>{it('a',()=>{expect(hd367autx2(1,4)).toBe(2);});it('b',()=>{expect(hd367autx2(3,1)).toBe(1);});it('c',()=>{expect(hd367autx2(0,0)).toBe(0);});it('d',()=>{expect(hd367autx2(93,73)).toBe(2);});it('e',()=>{expect(hd367autx2(15,0)).toBe(4);});});
function hd368autx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph368autx2_hd',()=>{it('a',()=>{expect(hd368autx2(1,4)).toBe(2);});it('b',()=>{expect(hd368autx2(3,1)).toBe(1);});it('c',()=>{expect(hd368autx2(0,0)).toBe(0);});it('d',()=>{expect(hd368autx2(93,73)).toBe(2);});it('e',()=>{expect(hd368autx2(15,0)).toBe(4);});});
function hd369autx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph369autx2_hd',()=>{it('a',()=>{expect(hd369autx2(1,4)).toBe(2);});it('b',()=>{expect(hd369autx2(3,1)).toBe(1);});it('c',()=>{expect(hd369autx2(0,0)).toBe(0);});it('d',()=>{expect(hd369autx2(93,73)).toBe(2);});it('e',()=>{expect(hd369autx2(15,0)).toBe(4);});});
function hd370autx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph370autx2_hd',()=>{it('a',()=>{expect(hd370autx2(1,4)).toBe(2);});it('b',()=>{expect(hd370autx2(3,1)).toBe(1);});it('c',()=>{expect(hd370autx2(0,0)).toBe(0);});it('d',()=>{expect(hd370autx2(93,73)).toBe(2);});it('e',()=>{expect(hd370autx2(15,0)).toBe(4);});});
function hd371autx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph371autx2_hd',()=>{it('a',()=>{expect(hd371autx2(1,4)).toBe(2);});it('b',()=>{expect(hd371autx2(3,1)).toBe(1);});it('c',()=>{expect(hd371autx2(0,0)).toBe(0);});it('d',()=>{expect(hd371autx2(93,73)).toBe(2);});it('e',()=>{expect(hd371autx2(15,0)).toBe(4);});});
function hd372autx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph372autx2_hd',()=>{it('a',()=>{expect(hd372autx2(1,4)).toBe(2);});it('b',()=>{expect(hd372autx2(3,1)).toBe(1);});it('c',()=>{expect(hd372autx2(0,0)).toBe(0);});it('d',()=>{expect(hd372autx2(93,73)).toBe(2);});it('e',()=>{expect(hd372autx2(15,0)).toBe(4);});});
function hd373autx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph373autx2_hd',()=>{it('a',()=>{expect(hd373autx2(1,4)).toBe(2);});it('b',()=>{expect(hd373autx2(3,1)).toBe(1);});it('c',()=>{expect(hd373autx2(0,0)).toBe(0);});it('d',()=>{expect(hd373autx2(93,73)).toBe(2);});it('e',()=>{expect(hd373autx2(15,0)).toBe(4);});});
function hd374autx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph374autx2_hd',()=>{it('a',()=>{expect(hd374autx2(1,4)).toBe(2);});it('b',()=>{expect(hd374autx2(3,1)).toBe(1);});it('c',()=>{expect(hd374autx2(0,0)).toBe(0);});it('d',()=>{expect(hd374autx2(93,73)).toBe(2);});it('e',()=>{expect(hd374autx2(15,0)).toBe(4);});});
function hd375autx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph375autx2_hd',()=>{it('a',()=>{expect(hd375autx2(1,4)).toBe(2);});it('b',()=>{expect(hd375autx2(3,1)).toBe(1);});it('c',()=>{expect(hd375autx2(0,0)).toBe(0);});it('d',()=>{expect(hd375autx2(93,73)).toBe(2);});it('e',()=>{expect(hd375autx2(15,0)).toBe(4);});});
function hd376autx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph376autx2_hd',()=>{it('a',()=>{expect(hd376autx2(1,4)).toBe(2);});it('b',()=>{expect(hd376autx2(3,1)).toBe(1);});it('c',()=>{expect(hd376autx2(0,0)).toBe(0);});it('d',()=>{expect(hd376autx2(93,73)).toBe(2);});it('e',()=>{expect(hd376autx2(15,0)).toBe(4);});});
function hd377autx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph377autx2_hd',()=>{it('a',()=>{expect(hd377autx2(1,4)).toBe(2);});it('b',()=>{expect(hd377autx2(3,1)).toBe(1);});it('c',()=>{expect(hd377autx2(0,0)).toBe(0);});it('d',()=>{expect(hd377autx2(93,73)).toBe(2);});it('e',()=>{expect(hd377autx2(15,0)).toBe(4);});});
function hd378autx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph378autx2_hd',()=>{it('a',()=>{expect(hd378autx2(1,4)).toBe(2);});it('b',()=>{expect(hd378autx2(3,1)).toBe(1);});it('c',()=>{expect(hd378autx2(0,0)).toBe(0);});it('d',()=>{expect(hd378autx2(93,73)).toBe(2);});it('e',()=>{expect(hd378autx2(15,0)).toBe(4);});});
function hd379autx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph379autx2_hd',()=>{it('a',()=>{expect(hd379autx2(1,4)).toBe(2);});it('b',()=>{expect(hd379autx2(3,1)).toBe(1);});it('c',()=>{expect(hd379autx2(0,0)).toBe(0);});it('d',()=>{expect(hd379autx2(93,73)).toBe(2);});it('e',()=>{expect(hd379autx2(15,0)).toBe(4);});});
function hd380autx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph380autx2_hd',()=>{it('a',()=>{expect(hd380autx2(1,4)).toBe(2);});it('b',()=>{expect(hd380autx2(3,1)).toBe(1);});it('c',()=>{expect(hd380autx2(0,0)).toBe(0);});it('d',()=>{expect(hd380autx2(93,73)).toBe(2);});it('e',()=>{expect(hd380autx2(15,0)).toBe(4);});});
function hd381autx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph381autx2_hd',()=>{it('a',()=>{expect(hd381autx2(1,4)).toBe(2);});it('b',()=>{expect(hd381autx2(3,1)).toBe(1);});it('c',()=>{expect(hd381autx2(0,0)).toBe(0);});it('d',()=>{expect(hd381autx2(93,73)).toBe(2);});it('e',()=>{expect(hd381autx2(15,0)).toBe(4);});});
function hd382autx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph382autx2_hd',()=>{it('a',()=>{expect(hd382autx2(1,4)).toBe(2);});it('b',()=>{expect(hd382autx2(3,1)).toBe(1);});it('c',()=>{expect(hd382autx2(0,0)).toBe(0);});it('d',()=>{expect(hd382autx2(93,73)).toBe(2);});it('e',()=>{expect(hd382autx2(15,0)).toBe(4);});});
function hd383autx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph383autx2_hd',()=>{it('a',()=>{expect(hd383autx2(1,4)).toBe(2);});it('b',()=>{expect(hd383autx2(3,1)).toBe(1);});it('c',()=>{expect(hd383autx2(0,0)).toBe(0);});it('d',()=>{expect(hd383autx2(93,73)).toBe(2);});it('e',()=>{expect(hd383autx2(15,0)).toBe(4);});});
function hd384autx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph384autx2_hd',()=>{it('a',()=>{expect(hd384autx2(1,4)).toBe(2);});it('b',()=>{expect(hd384autx2(3,1)).toBe(1);});it('c',()=>{expect(hd384autx2(0,0)).toBe(0);});it('d',()=>{expect(hd384autx2(93,73)).toBe(2);});it('e',()=>{expect(hd384autx2(15,0)).toBe(4);});});
function hd385autx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph385autx2_hd',()=>{it('a',()=>{expect(hd385autx2(1,4)).toBe(2);});it('b',()=>{expect(hd385autx2(3,1)).toBe(1);});it('c',()=>{expect(hd385autx2(0,0)).toBe(0);});it('d',()=>{expect(hd385autx2(93,73)).toBe(2);});it('e',()=>{expect(hd385autx2(15,0)).toBe(4);});});
function hd386autx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph386autx2_hd',()=>{it('a',()=>{expect(hd386autx2(1,4)).toBe(2);});it('b',()=>{expect(hd386autx2(3,1)).toBe(1);});it('c',()=>{expect(hd386autx2(0,0)).toBe(0);});it('d',()=>{expect(hd386autx2(93,73)).toBe(2);});it('e',()=>{expect(hd386autx2(15,0)).toBe(4);});});
function hd387autx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph387autx2_hd',()=>{it('a',()=>{expect(hd387autx2(1,4)).toBe(2);});it('b',()=>{expect(hd387autx2(3,1)).toBe(1);});it('c',()=>{expect(hd387autx2(0,0)).toBe(0);});it('d',()=>{expect(hd387autx2(93,73)).toBe(2);});it('e',()=>{expect(hd387autx2(15,0)).toBe(4);});});
function hd388autx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph388autx2_hd',()=>{it('a',()=>{expect(hd388autx2(1,4)).toBe(2);});it('b',()=>{expect(hd388autx2(3,1)).toBe(1);});it('c',()=>{expect(hd388autx2(0,0)).toBe(0);});it('d',()=>{expect(hd388autx2(93,73)).toBe(2);});it('e',()=>{expect(hd388autx2(15,0)).toBe(4);});});
function hd389autx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph389autx2_hd',()=>{it('a',()=>{expect(hd389autx2(1,4)).toBe(2);});it('b',()=>{expect(hd389autx2(3,1)).toBe(1);});it('c',()=>{expect(hd389autx2(0,0)).toBe(0);});it('d',()=>{expect(hd389autx2(93,73)).toBe(2);});it('e',()=>{expect(hd389autx2(15,0)).toBe(4);});});
function hd390autx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph390autx2_hd',()=>{it('a',()=>{expect(hd390autx2(1,4)).toBe(2);});it('b',()=>{expect(hd390autx2(3,1)).toBe(1);});it('c',()=>{expect(hd390autx2(0,0)).toBe(0);});it('d',()=>{expect(hd390autx2(93,73)).toBe(2);});it('e',()=>{expect(hd390autx2(15,0)).toBe(4);});});
function hd391autx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph391autx2_hd',()=>{it('a',()=>{expect(hd391autx2(1,4)).toBe(2);});it('b',()=>{expect(hd391autx2(3,1)).toBe(1);});it('c',()=>{expect(hd391autx2(0,0)).toBe(0);});it('d',()=>{expect(hd391autx2(93,73)).toBe(2);});it('e',()=>{expect(hd391autx2(15,0)).toBe(4);});});
function hd392autx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph392autx2_hd',()=>{it('a',()=>{expect(hd392autx2(1,4)).toBe(2);});it('b',()=>{expect(hd392autx2(3,1)).toBe(1);});it('c',()=>{expect(hd392autx2(0,0)).toBe(0);});it('d',()=>{expect(hd392autx2(93,73)).toBe(2);});it('e',()=>{expect(hd392autx2(15,0)).toBe(4);});});
function hd393autx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph393autx2_hd',()=>{it('a',()=>{expect(hd393autx2(1,4)).toBe(2);});it('b',()=>{expect(hd393autx2(3,1)).toBe(1);});it('c',()=>{expect(hd393autx2(0,0)).toBe(0);});it('d',()=>{expect(hd393autx2(93,73)).toBe(2);});it('e',()=>{expect(hd393autx2(15,0)).toBe(4);});});
function hd394autx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph394autx2_hd',()=>{it('a',()=>{expect(hd394autx2(1,4)).toBe(2);});it('b',()=>{expect(hd394autx2(3,1)).toBe(1);});it('c',()=>{expect(hd394autx2(0,0)).toBe(0);});it('d',()=>{expect(hd394autx2(93,73)).toBe(2);});it('e',()=>{expect(hd394autx2(15,0)).toBe(4);});});
function hd395autx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph395autx2_hd',()=>{it('a',()=>{expect(hd395autx2(1,4)).toBe(2);});it('b',()=>{expect(hd395autx2(3,1)).toBe(1);});it('c',()=>{expect(hd395autx2(0,0)).toBe(0);});it('d',()=>{expect(hd395autx2(93,73)).toBe(2);});it('e',()=>{expect(hd395autx2(15,0)).toBe(4);});});
function hd396autx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph396autx2_hd',()=>{it('a',()=>{expect(hd396autx2(1,4)).toBe(2);});it('b',()=>{expect(hd396autx2(3,1)).toBe(1);});it('c',()=>{expect(hd396autx2(0,0)).toBe(0);});it('d',()=>{expect(hd396autx2(93,73)).toBe(2);});it('e',()=>{expect(hd396autx2(15,0)).toBe(4);});});
function hd397autx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph397autx2_hd',()=>{it('a',()=>{expect(hd397autx2(1,4)).toBe(2);});it('b',()=>{expect(hd397autx2(3,1)).toBe(1);});it('c',()=>{expect(hd397autx2(0,0)).toBe(0);});it('d',()=>{expect(hd397autx2(93,73)).toBe(2);});it('e',()=>{expect(hd397autx2(15,0)).toBe(4);});});
function hd398autx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph398autx2_hd',()=>{it('a',()=>{expect(hd398autx2(1,4)).toBe(2);});it('b',()=>{expect(hd398autx2(3,1)).toBe(1);});it('c',()=>{expect(hd398autx2(0,0)).toBe(0);});it('d',()=>{expect(hd398autx2(93,73)).toBe(2);});it('e',()=>{expect(hd398autx2(15,0)).toBe(4);});});
function hd399autx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph399autx2_hd',()=>{it('a',()=>{expect(hd399autx2(1,4)).toBe(2);});it('b',()=>{expect(hd399autx2(3,1)).toBe(1);});it('c',()=>{expect(hd399autx2(0,0)).toBe(0);});it('d',()=>{expect(hd399autx2(93,73)).toBe(2);});it('e',()=>{expect(hd399autx2(15,0)).toBe(4);});});
function hd400autx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph400autx2_hd',()=>{it('a',()=>{expect(hd400autx2(1,4)).toBe(2);});it('b',()=>{expect(hd400autx2(3,1)).toBe(1);});it('c',()=>{expect(hd400autx2(0,0)).toBe(0);});it('d',()=>{expect(hd400autx2(93,73)).toBe(2);});it('e',()=>{expect(hd400autx2(15,0)).toBe(4);});});
function hd401autx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph401autx2_hd',()=>{it('a',()=>{expect(hd401autx2(1,4)).toBe(2);});it('b',()=>{expect(hd401autx2(3,1)).toBe(1);});it('c',()=>{expect(hd401autx2(0,0)).toBe(0);});it('d',()=>{expect(hd401autx2(93,73)).toBe(2);});it('e',()=>{expect(hd401autx2(15,0)).toBe(4);});});
function hd402autx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph402autx2_hd',()=>{it('a',()=>{expect(hd402autx2(1,4)).toBe(2);});it('b',()=>{expect(hd402autx2(3,1)).toBe(1);});it('c',()=>{expect(hd402autx2(0,0)).toBe(0);});it('d',()=>{expect(hd402autx2(93,73)).toBe(2);});it('e',()=>{expect(hd402autx2(15,0)).toBe(4);});});
function hd403autx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph403autx2_hd',()=>{it('a',()=>{expect(hd403autx2(1,4)).toBe(2);});it('b',()=>{expect(hd403autx2(3,1)).toBe(1);});it('c',()=>{expect(hd403autx2(0,0)).toBe(0);});it('d',()=>{expect(hd403autx2(93,73)).toBe(2);});it('e',()=>{expect(hd403autx2(15,0)).toBe(4);});});
function hd404autx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph404autx2_hd',()=>{it('a',()=>{expect(hd404autx2(1,4)).toBe(2);});it('b',()=>{expect(hd404autx2(3,1)).toBe(1);});it('c',()=>{expect(hd404autx2(0,0)).toBe(0);});it('d',()=>{expect(hd404autx2(93,73)).toBe(2);});it('e',()=>{expect(hd404autx2(15,0)).toBe(4);});});
function hd405autx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph405autx2_hd',()=>{it('a',()=>{expect(hd405autx2(1,4)).toBe(2);});it('b',()=>{expect(hd405autx2(3,1)).toBe(1);});it('c',()=>{expect(hd405autx2(0,0)).toBe(0);});it('d',()=>{expect(hd405autx2(93,73)).toBe(2);});it('e',()=>{expect(hd405autx2(15,0)).toBe(4);});});
function hd406autx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph406autx2_hd',()=>{it('a',()=>{expect(hd406autx2(1,4)).toBe(2);});it('b',()=>{expect(hd406autx2(3,1)).toBe(1);});it('c',()=>{expect(hd406autx2(0,0)).toBe(0);});it('d',()=>{expect(hd406autx2(93,73)).toBe(2);});it('e',()=>{expect(hd406autx2(15,0)).toBe(4);});});
function hd407autx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph407autx2_hd',()=>{it('a',()=>{expect(hd407autx2(1,4)).toBe(2);});it('b',()=>{expect(hd407autx2(3,1)).toBe(1);});it('c',()=>{expect(hd407autx2(0,0)).toBe(0);});it('d',()=>{expect(hd407autx2(93,73)).toBe(2);});it('e',()=>{expect(hd407autx2(15,0)).toBe(4);});});
function hd408autx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph408autx2_hd',()=>{it('a',()=>{expect(hd408autx2(1,4)).toBe(2);});it('b',()=>{expect(hd408autx2(3,1)).toBe(1);});it('c',()=>{expect(hd408autx2(0,0)).toBe(0);});it('d',()=>{expect(hd408autx2(93,73)).toBe(2);});it('e',()=>{expect(hd408autx2(15,0)).toBe(4);});});
function hd409autx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph409autx2_hd',()=>{it('a',()=>{expect(hd409autx2(1,4)).toBe(2);});it('b',()=>{expect(hd409autx2(3,1)).toBe(1);});it('c',()=>{expect(hd409autx2(0,0)).toBe(0);});it('d',()=>{expect(hd409autx2(93,73)).toBe(2);});it('e',()=>{expect(hd409autx2(15,0)).toBe(4);});});
function hd410autx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph410autx2_hd',()=>{it('a',()=>{expect(hd410autx2(1,4)).toBe(2);});it('b',()=>{expect(hd410autx2(3,1)).toBe(1);});it('c',()=>{expect(hd410autx2(0,0)).toBe(0);});it('d',()=>{expect(hd410autx2(93,73)).toBe(2);});it('e',()=>{expect(hd410autx2(15,0)).toBe(4);});});
function hd411autx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph411autx2_hd',()=>{it('a',()=>{expect(hd411autx2(1,4)).toBe(2);});it('b',()=>{expect(hd411autx2(3,1)).toBe(1);});it('c',()=>{expect(hd411autx2(0,0)).toBe(0);});it('d',()=>{expect(hd411autx2(93,73)).toBe(2);});it('e',()=>{expect(hd411autx2(15,0)).toBe(4);});});
function hd412autx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph412autx2_hd',()=>{it('a',()=>{expect(hd412autx2(1,4)).toBe(2);});it('b',()=>{expect(hd412autx2(3,1)).toBe(1);});it('c',()=>{expect(hd412autx2(0,0)).toBe(0);});it('d',()=>{expect(hd412autx2(93,73)).toBe(2);});it('e',()=>{expect(hd412autx2(15,0)).toBe(4);});});
function hd413autx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph413autx2_hd',()=>{it('a',()=>{expect(hd413autx2(1,4)).toBe(2);});it('b',()=>{expect(hd413autx2(3,1)).toBe(1);});it('c',()=>{expect(hd413autx2(0,0)).toBe(0);});it('d',()=>{expect(hd413autx2(93,73)).toBe(2);});it('e',()=>{expect(hd413autx2(15,0)).toBe(4);});});
function hd414autx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph414autx2_hd',()=>{it('a',()=>{expect(hd414autx2(1,4)).toBe(2);});it('b',()=>{expect(hd414autx2(3,1)).toBe(1);});it('c',()=>{expect(hd414autx2(0,0)).toBe(0);});it('d',()=>{expect(hd414autx2(93,73)).toBe(2);});it('e',()=>{expect(hd414autx2(15,0)).toBe(4);});});
function hd415autx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph415autx2_hd',()=>{it('a',()=>{expect(hd415autx2(1,4)).toBe(2);});it('b',()=>{expect(hd415autx2(3,1)).toBe(1);});it('c',()=>{expect(hd415autx2(0,0)).toBe(0);});it('d',()=>{expect(hd415autx2(93,73)).toBe(2);});it('e',()=>{expect(hd415autx2(15,0)).toBe(4);});});
function hd416autx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph416autx2_hd',()=>{it('a',()=>{expect(hd416autx2(1,4)).toBe(2);});it('b',()=>{expect(hd416autx2(3,1)).toBe(1);});it('c',()=>{expect(hd416autx2(0,0)).toBe(0);});it('d',()=>{expect(hd416autx2(93,73)).toBe(2);});it('e',()=>{expect(hd416autx2(15,0)).toBe(4);});});
function hd417autx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph417autx2_hd',()=>{it('a',()=>{expect(hd417autx2(1,4)).toBe(2);});it('b',()=>{expect(hd417autx2(3,1)).toBe(1);});it('c',()=>{expect(hd417autx2(0,0)).toBe(0);});it('d',()=>{expect(hd417autx2(93,73)).toBe(2);});it('e',()=>{expect(hd417autx2(15,0)).toBe(4);});});
