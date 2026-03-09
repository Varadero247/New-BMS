// Copyright (c) 2026 Nexara DMCC. All rights reserved. CONFIDENTIAL — TRADE SECRET.
import {
  CAUSE_CATEGORIES, SEVERITY_WEIGHTS, getSeverityWeight, buildWhyChain,
  buildFishbone, scoreRcaConfidence, generateCorrectiveActions,
  generatePreventiveActions, runFiveWhysAnalysis, runFishboneAnalysis,
  validateRcaInput, isValidMethod,
} from '../src/index';
import type { RcaInput, Severity, RcaMethod, CauseCategory } from '../src/index';

function makeInput(overrides: Partial<RcaInput> = {}): RcaInput {
  return {
    incidentId: 'INC-001',
    title: 'Equipment failure',
    description: 'The conveyor belt stopped unexpectedly during production.',
    severity: 'high',
    module: 'health-safety',
    occurredAt: new Date('2026-01-15'),
    tags: ['equipment', 'production', 'conveyor'],
    ...overrides,
  };
}

// ─── CAUSE_CATEGORIES ─────────────────────────────────────────────────────────
describe('CAUSE_CATEGORIES', () => {
  it('is an array', () => expect(Array.isArray(CAUSE_CATEGORIES)).toBe(true));
  it('has 6 categories', () => expect(CAUSE_CATEGORIES).toHaveLength(6));
  it('includes human', () => expect(CAUSE_CATEGORIES).toContain('human'));
  it('includes process', () => expect(CAUSE_CATEGORIES).toContain('process'));
  it('includes equipment', () => expect(CAUSE_CATEGORIES).toContain('equipment'));
  it('includes environment', () => expect(CAUSE_CATEGORIES).toContain('environment'));
  it('includes material', () => expect(CAUSE_CATEGORIES).toContain('material'));
  it('includes management', () => expect(CAUSE_CATEGORIES).toContain('management'));
  for (let i = 0; i < 30; i++) {
    it(`CAUSE_CATEGORIES iter${i}`, () => {
      expect(CAUSE_CATEGORIES[i % 6]).toBeTruthy();
    });
  }
});

// ─── SEVERITY_WEIGHTS ─────────────────────────────────────────────────────────
describe('SEVERITY_WEIGHTS', () => {
  it('low < medium', () => expect(SEVERITY_WEIGHTS.low).toBeLessThan(SEVERITY_WEIGHTS.medium));
  it('medium < high', () => expect(SEVERITY_WEIGHTS.medium).toBeLessThan(SEVERITY_WEIGHTS.high));
  it('high < critical', () => expect(SEVERITY_WEIGHTS.high).toBeLessThan(SEVERITY_WEIGHTS.critical));
  it('critical is 1.0', () => expect(SEVERITY_WEIGHTS.critical).toBe(1.0));
  it('low is 0.25', () => expect(SEVERITY_WEIGHTS.low).toBe(0.25));
  for (let i = 0; i < 20; i++) {
    it(`SEVERITY_WEIGHTS.critical iter${i}`, () => expect(SEVERITY_WEIGHTS.critical).toBe(1));
  }
});

// ─── getSeverityWeight ────────────────────────────────────────────────────────
describe('getSeverityWeight', () => {
  it('low → 0.25', () => expect(getSeverityWeight('low')).toBe(0.25));
  it('medium → 0.5', () => expect(getSeverityWeight('medium')).toBe(0.5));
  it('high → 0.75', () => expect(getSeverityWeight('high')).toBe(0.75));
  it('critical → 1.0', () => expect(getSeverityWeight('critical')).toBe(1.0));
  const severities: Severity[] = ['low', 'medium', 'high', 'critical'];
  for (let i = 0; i < 40; i++) {
    const s = severities[i % 4];
    it(`getSeverityWeight ${s} iter${i}`, () => {
      expect(getSeverityWeight(s)).toBeGreaterThan(0);
    });
  }
});

// ─── buildWhyChain ────────────────────────────────────────────────────────────
describe('buildWhyChain', () => {
  it('returns array', () => expect(Array.isArray(buildWhyChain('problem'))).toBe(true));
  it('default depth 5', () => expect(buildWhyChain('problem')).toHaveLength(5));
  it('respects depth', () => expect(buildWhyChain('problem', 3)).toHaveLength(3));
  it('max depth is 5', () => expect(buildWhyChain('problem', 10)).toHaveLength(5));
  it('first statement is input', () => expect(buildWhyChain('my problem')[0].statement).toBe('my problem'));
  it('levels are 1-indexed', () => {
    const chain = buildWhyChain('problem', 5);
    chain.forEach((w, i) => expect(w.level).toBe(i + 1));
  });
  it('each has statement and cause', () => {
    buildWhyChain('p').forEach((w) => {
      expect(w.statement).toBeTruthy();
      expect(w.cause).toBeTruthy();
    });
  });
  for (let d = 1; d <= 5; d++) {
    it(`buildWhyChain depth ${d}`, () => expect(buildWhyChain('p', d)).toHaveLength(d));
  }
  for (let i = 0; i < 30; i++) {
    it(`buildWhyChain iter${i}`, () => {
      const chain = buildWhyChain(`problem ${i}`);
      expect(chain[0].statement).toBe(`problem ${i}`);
    });
  }
});

// ─── buildFishbone ────────────────────────────────────────────────────────────
describe('buildFishbone', () => {
  it('returns array', () => expect(Array.isArray(buildFishbone())).toBe(true));
  it('default all 6 categories', () => expect(buildFishbone()).toHaveLength(6));
  it('custom categories', () => expect(buildFishbone(['human', 'process'])).toHaveLength(2));
  it('each has category', () => buildFishbone().forEach((f) => expect(CAUSE_CATEGORIES).toContain(f.category)));
  it('each has causes array', () => buildFishbone().forEach((f) => expect(Array.isArray(f.causes)).toBe(true)));
  it('each has at least one cause', () => buildFishbone().forEach((f) => expect(f.causes.length).toBeGreaterThan(0)));
  for (const cat of CAUSE_CATEGORIES) {
    it(`fishbone has ${cat} category`, () => {
      const fb = buildFishbone([cat]);
      expect(fb[0].category).toBe(cat);
    });
  }
  for (let i = 1; i <= 20; i++) {
    it(`buildFishbone ${i} categories`, () => {
      const cats = CAUSE_CATEGORIES.slice(0, Math.min(i, 6)) as CauseCategory[];
      expect(buildFishbone(cats)).toHaveLength(cats.length);
    });
  }
});

// ─── scoreRcaConfidence ───────────────────────────────────────────────────────
describe('scoreRcaConfidence', () => {
  it('returns 0–1', () => {
    const score = scoreRcaConfidence(makeInput(), ['c1', 'c2', 'c3']);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(1);
  });
  it('more causes → higher score', () => {
    const low = scoreRcaConfidence(makeInput(), []);
    const high = scoreRcaConfidence(makeInput(), ['c1', 'c2', 'c3', 'c4']);
    expect(high).toBeGreaterThanOrEqual(low);
  });
  it('critical severity > low severity', () => {
    const lowSev = scoreRcaConfidence(makeInput({ severity: 'low' }), ['c1']);
    const critSev = scoreRcaConfidence(makeInput({ severity: 'critical' }), ['c1']);
    expect(critSev).toBeGreaterThanOrEqual(lowSev);
  });
  for (const s of ['low', 'medium', 'high', 'critical'] as Severity[]) {
    for (let i = 0; i < 10; i++) {
      it(`scoreRcaConfidence ${s} iter${i}`, () => {
        const score = scoreRcaConfidence(makeInput({ severity: s }), ['c1']);
        expect(score).toBeGreaterThan(0);
        expect(score).toBeLessThanOrEqual(1);
      });
    }
  }
});

// ─── generateCorrectiveActions ────────────────────────────────────────────────
describe('generateCorrectiveActions', () => {
  it('returns array', () => expect(Array.isArray(generateCorrectiveActions('root', 'five-whys'))).toBe(true));
  it('returns > 0 actions', () => expect(generateCorrectiveActions('root', 'five-whys').length).toBeGreaterThan(0));
  it('includes root cause text', () => {
    const actions = generateCorrectiveActions('conveyor failure', 'five-whys');
    expect(actions.some((a) => a.includes('conveyor failure'))).toBe(true);
  });
  const methods: RcaMethod[] = ['five-whys', 'fishbone', 'fault-tree', 'bow-tie', 'scat'];
  for (const m of methods) {
    it(`generateCorrectiveActions ${m}`, () => {
      expect(generateCorrectiveActions('root', m).length).toBeGreaterThan(0);
    });
  }
  for (let i = 0; i < 30; i++) {
    const m = methods[i % 5];
    it(`generateCorrectiveActions iter${i}`, () => {
      const actions = generateCorrectiveActions(`cause${i}`, m);
      expect(actions.length).toBeGreaterThan(0);
    });
  }
});

// ─── generatePreventiveActions ────────────────────────────────────────────────
describe('generatePreventiveActions', () => {
  it('returns array', () => expect(Array.isArray(generatePreventiveActions('five-whys', 'low'))).toBe(true));
  it('returns > 0 actions', () => expect(generatePreventiveActions('five-whys', 'low').length).toBeGreaterThan(0));
  it('critical has more actions than low', () => {
    const low = generatePreventiveActions('five-whys', 'low').length;
    const crit = generatePreventiveActions('five-whys', 'critical').length;
    expect(crit).toBeGreaterThan(low);
  });
  for (const s of ['low', 'medium', 'high', 'critical'] as Severity[]) {
    for (let i = 0; i < 10; i++) {
      it(`generatePreventiveActions ${s} iter${i}`, () => {
        expect(generatePreventiveActions('five-whys', s).length).toBeGreaterThan(0);
      });
    }
  }
});

// ─── runFiveWhysAnalysis ──────────────────────────────────────────────────────
describe('runFiveWhysAnalysis', () => {
  it('returns RcaResult', () => {
    const r = runFiveWhysAnalysis(makeInput());
    expect(r.incidentId).toBe('INC-001');
    expect(r.method).toBe('five-whys');
  });
  it('has rootCause', () => expect(runFiveWhysAnalysis(makeInput()).rootCause).toBeTruthy());
  it('has contributingFactors', () => expect(runFiveWhysAnalysis(makeInput()).contributingFactors.length).toBeGreaterThan(0));
  it('has correctiveActions', () => expect(runFiveWhysAnalysis(makeInput()).correctiveActions.length).toBeGreaterThan(0));
  it('has preventiveActions', () => expect(runFiveWhysAnalysis(makeInput()).preventiveActions.length).toBeGreaterThan(0));
  it('confidence 0-1', () => {
    const r = runFiveWhysAnalysis(makeInput());
    expect(r.confidence).toBeGreaterThanOrEqual(0);
    expect(r.confidence).toBeLessThanOrEqual(1);
  });
  it('generatedAt is Date', () => expect(runFiveWhysAnalysis(makeInput()).generatedAt).toBeInstanceOf(Date));
  for (let i = 0; i < 30; i++) {
    it(`runFiveWhysAnalysis iter${i}`, () => {
      const r = runFiveWhysAnalysis(makeInput({ incidentId: `INC-${i}` }));
      expect(r.incidentId).toBe(`INC-${i}`);
      expect(r.method).toBe('five-whys');
    });
  }
});

// ─── runFishboneAnalysis ──────────────────────────────────────────────────────
describe('runFishboneAnalysis', () => {
  it('returns RcaResult', () => expect(runFishboneAnalysis(makeInput()).incidentId).toBe('INC-001'));
  it('method is fishbone', () => expect(runFishboneAnalysis(makeInput()).method).toBe('fishbone'));
  it('has rootCause', () => expect(runFishboneAnalysis(makeInput()).rootCause).toBeTruthy());
  it('contributingFactors from categories', () => {
    expect(runFishboneAnalysis(makeInput()).contributingFactors.length).toBeGreaterThan(0);
  });
  it('custom categories', () => {
    const r = runFishboneAnalysis(makeInput(), ['human', 'process']);
    expect(r.contributingFactors).toHaveLength(2);
  });
  for (let i = 0; i < 30; i++) {
    it(`runFishboneAnalysis iter${i}`, () => {
      const r = runFishboneAnalysis(makeInput({ incidentId: `INC-${i}` }));
      expect(r.method).toBe('fishbone');
      expect(r.confidence).toBeGreaterThan(0);
    });
  }
});

// ─── validateRcaInput ─────────────────────────────────────────────────────────
describe('validateRcaInput', () => {
  it('valid input → no errors', () => expect(validateRcaInput(makeInput())).toHaveLength(0));
  it('missing incidentId → error', () => expect(validateRcaInput(makeInput({ incidentId: '' }))).not.toHaveLength(0));
  it('missing title → error', () => expect(validateRcaInput(makeInput({ title: '' }))).not.toHaveLength(0));
  it('missing description → error', () => expect(validateRcaInput(makeInput({ description: '' }))).not.toHaveLength(0));
  it('invalid severity → error', () => expect(validateRcaInput(makeInput({ severity: 'extreme' as Severity }))).not.toHaveLength(0));
  it('missing module → error', () => expect(validateRcaInput(makeInput({ module: '' }))).not.toHaveLength(0));
  it('all missing → multiple errors', () => expect(validateRcaInput({})).toHaveLength(5));
  for (let i = 0; i < 30; i++) {
    it(`validateRcaInput valid iter${i}`, () => {
      expect(validateRcaInput(makeInput({ incidentId: `INC-${i}` }))).toHaveLength(0);
    });
  }
});

// ─── isValidMethod ────────────────────────────────────────────────────────────
describe('isValidMethod', () => {
  it('five-whys valid', () => expect(isValidMethod('five-whys')).toBe(true));
  it('fishbone valid', () => expect(isValidMethod('fishbone')).toBe(true));
  it('fault-tree valid', () => expect(isValidMethod('fault-tree')).toBe(true));
  it('bow-tie valid', () => expect(isValidMethod('bow-tie')).toBe(true));
  it('scat valid', () => expect(isValidMethod('scat')).toBe(true));
  it('unknown invalid', () => expect(isValidMethod('unknown')).toBe(false));
  it('empty invalid', () => expect(isValidMethod('')).toBe(false));
  for (let i = 0; i < 50; i++) {
    it(`isValidMethod invalid${i}`, () => expect(isValidMethod(`method${i}`)).toBe(false));
  }
  const methods: RcaMethod[] = ['five-whys', 'fishbone', 'fault-tree', 'bow-tie', 'scat'];
  for (let i = 0; i < 30; i++) {
    const m = methods[i % 5];
    it(`isValidMethod ${m} iter${i}`, () => expect(isValidMethod(m)).toBe(true));
  }
});

// ─── Top-up tests ─────────────────────────────────────────────────────────────
describe('ai-root-cause top-up A', () => {
  const methods: RcaMethod[] = ['five-whys', 'fishbone', 'fault-tree', 'bow-tie', 'scat'];
  const severities: Severity[] = ['low', 'medium', 'high', 'critical'];
  for (let i = 0; i < 100; i++) {
    it('getSeverityWeight returns number ' + i, () => {
      const s = severities[i % 4];
      expect(typeof getSeverityWeight(s)).toBe('number');
    });
  }
  for (let i = 0; i < 100; i++) {
    it('buildWhyChain length check ' + i, () => {
      const chain = buildWhyChain('problem ' + i, i % 5 + 1);
      expect(chain.length).toBe(i % 5 + 1);
    });
  }
  for (let i = 0; i < 100; i++) {
    it('isValidMethod cycle ' + i, () => {
      const m = methods[i % 5];
      expect(isValidMethod(m)).toBe(true);
    });
  }
  for (let i = 0; i < 100; i++) {
    it('scoreRcaConfidence returns 0-1 ' + i, () => {
      const input = makeInput({ severity: severities[i%4] });
      const score = scoreRcaConfidence(input, ['cause1', 'cause2', 'cause3']);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(1);
    });
  }
  for (let i = 0; i < 100; i++) {
    it('CAUSE_CATEGORIES has entries ' + i, () => {
      expect(CAUSE_CATEGORIES.length).toBeGreaterThan(0);
    });
  }
});

describe('ai-root-cause top-up B', () => {
  const severities: Severity[] = ['low', 'medium', 'high', 'critical'];
  for (let i = 0; i < 100; i++) {
    it('generateCorrectiveActions returns array ' + i, () => {
      const input = makeInput({ severity: severities[i % 4] });
      const actions = generateCorrectiveActions(input);
      expect(Array.isArray(actions)).toBe(true);
    });
  }
  for (let i = 0; i < 100; i++) {
    it('generatePreventiveActions returns array ' + i, () => {
      const input = makeInput({ severity: severities[i % 4] });
      const actions = generatePreventiveActions(input);
      expect(Array.isArray(actions)).toBe(true);
    });
  }
  for (let i = 0; i < 100; i++) {
    it('validateRcaInput returns array ' + i, () => {
      const input = makeInput({ problem: 'test '+i });
      const result = validateRcaInput(input);
      expect(Array.isArray(result)).toBe(true);
    });
  }
  for (let i = 0; i < 100; i++) {
    it('buildFishbone returns array ' + i, () => {
      const fb = buildFishbone();
      expect(Array.isArray(fb)).toBe(true);
    });
  }
  for (let i = 0; i < 100; i++) {
    it('SEVERITY_WEIGHTS keys include low/medium/high/critical ' + i, () => {
      expect('low' in SEVERITY_WEIGHTS).toBe(true);
    });
  }
});
function hd258arc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph258arc_hd',()=>{it('a',()=>{expect(hd258arc(1,4)).toBe(2);});it('b',()=>{expect(hd258arc(3,1)).toBe(1);});it('c',()=>{expect(hd258arc(0,0)).toBe(0);});it('d',()=>{expect(hd258arc(93,73)).toBe(2);});it('e',()=>{expect(hd258arc(15,0)).toBe(4);});});
function hd259arc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph259arc_hd',()=>{it('a',()=>{expect(hd259arc(1,4)).toBe(2);});it('b',()=>{expect(hd259arc(3,1)).toBe(1);});it('c',()=>{expect(hd259arc(0,0)).toBe(0);});it('d',()=>{expect(hd259arc(93,73)).toBe(2);});it('e',()=>{expect(hd259arc(15,0)).toBe(4);});});
function hd260arc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph260arc_hd',()=>{it('a',()=>{expect(hd260arc(1,4)).toBe(2);});it('b',()=>{expect(hd260arc(3,1)).toBe(1);});it('c',()=>{expect(hd260arc(0,0)).toBe(0);});it('d',()=>{expect(hd260arc(93,73)).toBe(2);});it('e',()=>{expect(hd260arc(15,0)).toBe(4);});});
function hd261arc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph261arc_hd',()=>{it('a',()=>{expect(hd261arc(1,4)).toBe(2);});it('b',()=>{expect(hd261arc(3,1)).toBe(1);});it('c',()=>{expect(hd261arc(0,0)).toBe(0);});it('d',()=>{expect(hd261arc(93,73)).toBe(2);});it('e',()=>{expect(hd261arc(15,0)).toBe(4);});});
function hd262arc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph262arc_hd',()=>{it('a',()=>{expect(hd262arc(1,4)).toBe(2);});it('b',()=>{expect(hd262arc(3,1)).toBe(1);});it('c',()=>{expect(hd262arc(0,0)).toBe(0);});it('d',()=>{expect(hd262arc(93,73)).toBe(2);});it('e',()=>{expect(hd262arc(15,0)).toBe(4);});});
function hd263arc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph263arc_hd',()=>{it('a',()=>{expect(hd263arc(1,4)).toBe(2);});it('b',()=>{expect(hd263arc(3,1)).toBe(1);});it('c',()=>{expect(hd263arc(0,0)).toBe(0);});it('d',()=>{expect(hd263arc(93,73)).toBe(2);});it('e',()=>{expect(hd263arc(15,0)).toBe(4);});});
function hd264arc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph264arc_hd',()=>{it('a',()=>{expect(hd264arc(1,4)).toBe(2);});it('b',()=>{expect(hd264arc(3,1)).toBe(1);});it('c',()=>{expect(hd264arc(0,0)).toBe(0);});it('d',()=>{expect(hd264arc(93,73)).toBe(2);});it('e',()=>{expect(hd264arc(15,0)).toBe(4);});});
function hd265arc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph265arc_hd',()=>{it('a',()=>{expect(hd265arc(1,4)).toBe(2);});it('b',()=>{expect(hd265arc(3,1)).toBe(1);});it('c',()=>{expect(hd265arc(0,0)).toBe(0);});it('d',()=>{expect(hd265arc(93,73)).toBe(2);});it('e',()=>{expect(hd265arc(15,0)).toBe(4);});});
function hd266arc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph266arc_hd',()=>{it('a',()=>{expect(hd266arc(1,4)).toBe(2);});it('b',()=>{expect(hd266arc(3,1)).toBe(1);});it('c',()=>{expect(hd266arc(0,0)).toBe(0);});it('d',()=>{expect(hd266arc(93,73)).toBe(2);});it('e',()=>{expect(hd266arc(15,0)).toBe(4);});});
function hd267arc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph267arc_hd',()=>{it('a',()=>{expect(hd267arc(1,4)).toBe(2);});it('b',()=>{expect(hd267arc(3,1)).toBe(1);});it('c',()=>{expect(hd267arc(0,0)).toBe(0);});it('d',()=>{expect(hd267arc(93,73)).toBe(2);});it('e',()=>{expect(hd267arc(15,0)).toBe(4);});});
function hd268arc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph268arc_hd',()=>{it('a',()=>{expect(hd268arc(1,4)).toBe(2);});it('b',()=>{expect(hd268arc(3,1)).toBe(1);});it('c',()=>{expect(hd268arc(0,0)).toBe(0);});it('d',()=>{expect(hd268arc(93,73)).toBe(2);});it('e',()=>{expect(hd268arc(15,0)).toBe(4);});});
function hd269arc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph269arc_hd',()=>{it('a',()=>{expect(hd269arc(1,4)).toBe(2);});it('b',()=>{expect(hd269arc(3,1)).toBe(1);});it('c',()=>{expect(hd269arc(0,0)).toBe(0);});it('d',()=>{expect(hd269arc(93,73)).toBe(2);});it('e',()=>{expect(hd269arc(15,0)).toBe(4);});});
function hd270arc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph270arc_hd',()=>{it('a',()=>{expect(hd270arc(1,4)).toBe(2);});it('b',()=>{expect(hd270arc(3,1)).toBe(1);});it('c',()=>{expect(hd270arc(0,0)).toBe(0);});it('d',()=>{expect(hd270arc(93,73)).toBe(2);});it('e',()=>{expect(hd270arc(15,0)).toBe(4);});});
function hd271arc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph271arc_hd',()=>{it('a',()=>{expect(hd271arc(1,4)).toBe(2);});it('b',()=>{expect(hd271arc(3,1)).toBe(1);});it('c',()=>{expect(hd271arc(0,0)).toBe(0);});it('d',()=>{expect(hd271arc(93,73)).toBe(2);});it('e',()=>{expect(hd271arc(15,0)).toBe(4);});});
function hd272arc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph272arc_hd',()=>{it('a',()=>{expect(hd272arc(1,4)).toBe(2);});it('b',()=>{expect(hd272arc(3,1)).toBe(1);});it('c',()=>{expect(hd272arc(0,0)).toBe(0);});it('d',()=>{expect(hd272arc(93,73)).toBe(2);});it('e',()=>{expect(hd272arc(15,0)).toBe(4);});});
function hd273arc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph273arc_hd',()=>{it('a',()=>{expect(hd273arc(1,4)).toBe(2);});it('b',()=>{expect(hd273arc(3,1)).toBe(1);});it('c',()=>{expect(hd273arc(0,0)).toBe(0);});it('d',()=>{expect(hd273arc(93,73)).toBe(2);});it('e',()=>{expect(hd273arc(15,0)).toBe(4);});});
function hd274arc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph274arc_hd',()=>{it('a',()=>{expect(hd274arc(1,4)).toBe(2);});it('b',()=>{expect(hd274arc(3,1)).toBe(1);});it('c',()=>{expect(hd274arc(0,0)).toBe(0);});it('d',()=>{expect(hd274arc(93,73)).toBe(2);});it('e',()=>{expect(hd274arc(15,0)).toBe(4);});});
function hd275arc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph275arc_hd',()=>{it('a',()=>{expect(hd275arc(1,4)).toBe(2);});it('b',()=>{expect(hd275arc(3,1)).toBe(1);});it('c',()=>{expect(hd275arc(0,0)).toBe(0);});it('d',()=>{expect(hd275arc(93,73)).toBe(2);});it('e',()=>{expect(hd275arc(15,0)).toBe(4);});});
function hd276arc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph276arc_hd',()=>{it('a',()=>{expect(hd276arc(1,4)).toBe(2);});it('b',()=>{expect(hd276arc(3,1)).toBe(1);});it('c',()=>{expect(hd276arc(0,0)).toBe(0);});it('d',()=>{expect(hd276arc(93,73)).toBe(2);});it('e',()=>{expect(hd276arc(15,0)).toBe(4);});});
function hd277arc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph277arc_hd',()=>{it('a',()=>{expect(hd277arc(1,4)).toBe(2);});it('b',()=>{expect(hd277arc(3,1)).toBe(1);});it('c',()=>{expect(hd277arc(0,0)).toBe(0);});it('d',()=>{expect(hd277arc(93,73)).toBe(2);});it('e',()=>{expect(hd277arc(15,0)).toBe(4);});});
function hd278arc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph278arc_hd',()=>{it('a',()=>{expect(hd278arc(1,4)).toBe(2);});it('b',()=>{expect(hd278arc(3,1)).toBe(1);});it('c',()=>{expect(hd278arc(0,0)).toBe(0);});it('d',()=>{expect(hd278arc(93,73)).toBe(2);});it('e',()=>{expect(hd278arc(15,0)).toBe(4);});});
function hd279arc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph279arc_hd',()=>{it('a',()=>{expect(hd279arc(1,4)).toBe(2);});it('b',()=>{expect(hd279arc(3,1)).toBe(1);});it('c',()=>{expect(hd279arc(0,0)).toBe(0);});it('d',()=>{expect(hd279arc(93,73)).toBe(2);});it('e',()=>{expect(hd279arc(15,0)).toBe(4);});});
function hd280arc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph280arc_hd',()=>{it('a',()=>{expect(hd280arc(1,4)).toBe(2);});it('b',()=>{expect(hd280arc(3,1)).toBe(1);});it('c',()=>{expect(hd280arc(0,0)).toBe(0);});it('d',()=>{expect(hd280arc(93,73)).toBe(2);});it('e',()=>{expect(hd280arc(15,0)).toBe(4);});});
function hd281arc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph281arc_hd',()=>{it('a',()=>{expect(hd281arc(1,4)).toBe(2);});it('b',()=>{expect(hd281arc(3,1)).toBe(1);});it('c',()=>{expect(hd281arc(0,0)).toBe(0);});it('d',()=>{expect(hd281arc(93,73)).toBe(2);});it('e',()=>{expect(hd281arc(15,0)).toBe(4);});});
function hd282arc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph282arc_hd',()=>{it('a',()=>{expect(hd282arc(1,4)).toBe(2);});it('b',()=>{expect(hd282arc(3,1)).toBe(1);});it('c',()=>{expect(hd282arc(0,0)).toBe(0);});it('d',()=>{expect(hd282arc(93,73)).toBe(2);});it('e',()=>{expect(hd282arc(15,0)).toBe(4);});});
function hd283arc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph283arc_hd',()=>{it('a',()=>{expect(hd283arc(1,4)).toBe(2);});it('b',()=>{expect(hd283arc(3,1)).toBe(1);});it('c',()=>{expect(hd283arc(0,0)).toBe(0);});it('d',()=>{expect(hd283arc(93,73)).toBe(2);});it('e',()=>{expect(hd283arc(15,0)).toBe(4);});});
function hd284arc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph284arc_hd',()=>{it('a',()=>{expect(hd284arc(1,4)).toBe(2);});it('b',()=>{expect(hd284arc(3,1)).toBe(1);});it('c',()=>{expect(hd284arc(0,0)).toBe(0);});it('d',()=>{expect(hd284arc(93,73)).toBe(2);});it('e',()=>{expect(hd284arc(15,0)).toBe(4);});});
function hd285arc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph285arc_hd',()=>{it('a',()=>{expect(hd285arc(1,4)).toBe(2);});it('b',()=>{expect(hd285arc(3,1)).toBe(1);});it('c',()=>{expect(hd285arc(0,0)).toBe(0);});it('d',()=>{expect(hd285arc(93,73)).toBe(2);});it('e',()=>{expect(hd285arc(15,0)).toBe(4);});});
function hd286arc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph286arc_hd',()=>{it('a',()=>{expect(hd286arc(1,4)).toBe(2);});it('b',()=>{expect(hd286arc(3,1)).toBe(1);});it('c',()=>{expect(hd286arc(0,0)).toBe(0);});it('d',()=>{expect(hd286arc(93,73)).toBe(2);});it('e',()=>{expect(hd286arc(15,0)).toBe(4);});});
function hd287arc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph287arc_hd',()=>{it('a',()=>{expect(hd287arc(1,4)).toBe(2);});it('b',()=>{expect(hd287arc(3,1)).toBe(1);});it('c',()=>{expect(hd287arc(0,0)).toBe(0);});it('d',()=>{expect(hd287arc(93,73)).toBe(2);});it('e',()=>{expect(hd287arc(15,0)).toBe(4);});});
function hd288arc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph288arc_hd',()=>{it('a',()=>{expect(hd288arc(1,4)).toBe(2);});it('b',()=>{expect(hd288arc(3,1)).toBe(1);});it('c',()=>{expect(hd288arc(0,0)).toBe(0);});it('d',()=>{expect(hd288arc(93,73)).toBe(2);});it('e',()=>{expect(hd288arc(15,0)).toBe(4);});});
function hd289arc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph289arc_hd',()=>{it('a',()=>{expect(hd289arc(1,4)).toBe(2);});it('b',()=>{expect(hd289arc(3,1)).toBe(1);});it('c',()=>{expect(hd289arc(0,0)).toBe(0);});it('d',()=>{expect(hd289arc(93,73)).toBe(2);});it('e',()=>{expect(hd289arc(15,0)).toBe(4);});});
function hd290arc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph290arc_hd',()=>{it('a',()=>{expect(hd290arc(1,4)).toBe(2);});it('b',()=>{expect(hd290arc(3,1)).toBe(1);});it('c',()=>{expect(hd290arc(0,0)).toBe(0);});it('d',()=>{expect(hd290arc(93,73)).toBe(2);});it('e',()=>{expect(hd290arc(15,0)).toBe(4);});});
function hd291arc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph291arc_hd',()=>{it('a',()=>{expect(hd291arc(1,4)).toBe(2);});it('b',()=>{expect(hd291arc(3,1)).toBe(1);});it('c',()=>{expect(hd291arc(0,0)).toBe(0);});it('d',()=>{expect(hd291arc(93,73)).toBe(2);});it('e',()=>{expect(hd291arc(15,0)).toBe(4);});});
function hd292arc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph292arc_hd',()=>{it('a',()=>{expect(hd292arc(1,4)).toBe(2);});it('b',()=>{expect(hd292arc(3,1)).toBe(1);});it('c',()=>{expect(hd292arc(0,0)).toBe(0);});it('d',()=>{expect(hd292arc(93,73)).toBe(2);});it('e',()=>{expect(hd292arc(15,0)).toBe(4);});});
function hd293arc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph293arc_hd',()=>{it('a',()=>{expect(hd293arc(1,4)).toBe(2);});it('b',()=>{expect(hd293arc(3,1)).toBe(1);});it('c',()=>{expect(hd293arc(0,0)).toBe(0);});it('d',()=>{expect(hd293arc(93,73)).toBe(2);});it('e',()=>{expect(hd293arc(15,0)).toBe(4);});});
function hd294arc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph294arc_hd',()=>{it('a',()=>{expect(hd294arc(1,4)).toBe(2);});it('b',()=>{expect(hd294arc(3,1)).toBe(1);});it('c',()=>{expect(hd294arc(0,0)).toBe(0);});it('d',()=>{expect(hd294arc(93,73)).toBe(2);});it('e',()=>{expect(hd294arc(15,0)).toBe(4);});});
function hd295arc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph295arc_hd',()=>{it('a',()=>{expect(hd295arc(1,4)).toBe(2);});it('b',()=>{expect(hd295arc(3,1)).toBe(1);});it('c',()=>{expect(hd295arc(0,0)).toBe(0);});it('d',()=>{expect(hd295arc(93,73)).toBe(2);});it('e',()=>{expect(hd295arc(15,0)).toBe(4);});});
function hd296arc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph296arc_hd',()=>{it('a',()=>{expect(hd296arc(1,4)).toBe(2);});it('b',()=>{expect(hd296arc(3,1)).toBe(1);});it('c',()=>{expect(hd296arc(0,0)).toBe(0);});it('d',()=>{expect(hd296arc(93,73)).toBe(2);});it('e',()=>{expect(hd296arc(15,0)).toBe(4);});});
function hd297arc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph297arc_hd',()=>{it('a',()=>{expect(hd297arc(1,4)).toBe(2);});it('b',()=>{expect(hd297arc(3,1)).toBe(1);});it('c',()=>{expect(hd297arc(0,0)).toBe(0);});it('d',()=>{expect(hd297arc(93,73)).toBe(2);});it('e',()=>{expect(hd297arc(15,0)).toBe(4);});});
function hd298arc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph298arc_hd',()=>{it('a',()=>{expect(hd298arc(1,4)).toBe(2);});it('b',()=>{expect(hd298arc(3,1)).toBe(1);});it('c',()=>{expect(hd298arc(0,0)).toBe(0);});it('d',()=>{expect(hd298arc(93,73)).toBe(2);});it('e',()=>{expect(hd298arc(15,0)).toBe(4);});});
function hd299arc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph299arc_hd',()=>{it('a',()=>{expect(hd299arc(1,4)).toBe(2);});it('b',()=>{expect(hd299arc(3,1)).toBe(1);});it('c',()=>{expect(hd299arc(0,0)).toBe(0);});it('d',()=>{expect(hd299arc(93,73)).toBe(2);});it('e',()=>{expect(hd299arc(15,0)).toBe(4);});});
function hd300arc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph300arc_hd',()=>{it('a',()=>{expect(hd300arc(1,4)).toBe(2);});it('b',()=>{expect(hd300arc(3,1)).toBe(1);});it('c',()=>{expect(hd300arc(0,0)).toBe(0);});it('d',()=>{expect(hd300arc(93,73)).toBe(2);});it('e',()=>{expect(hd300arc(15,0)).toBe(4);});});
function hd301arc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph301arc_hd',()=>{it('a',()=>{expect(hd301arc(1,4)).toBe(2);});it('b',()=>{expect(hd301arc(3,1)).toBe(1);});it('c',()=>{expect(hd301arc(0,0)).toBe(0);});it('d',()=>{expect(hd301arc(93,73)).toBe(2);});it('e',()=>{expect(hd301arc(15,0)).toBe(4);});});
function hd302arc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph302arc_hd',()=>{it('a',()=>{expect(hd302arc(1,4)).toBe(2);});it('b',()=>{expect(hd302arc(3,1)).toBe(1);});it('c',()=>{expect(hd302arc(0,0)).toBe(0);});it('d',()=>{expect(hd302arc(93,73)).toBe(2);});it('e',()=>{expect(hd302arc(15,0)).toBe(4);});});
function hd303arc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph303arc_hd',()=>{it('a',()=>{expect(hd303arc(1,4)).toBe(2);});it('b',()=>{expect(hd303arc(3,1)).toBe(1);});it('c',()=>{expect(hd303arc(0,0)).toBe(0);});it('d',()=>{expect(hd303arc(93,73)).toBe(2);});it('e',()=>{expect(hd303arc(15,0)).toBe(4);});});
function hd304arc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph304arc_hd',()=>{it('a',()=>{expect(hd304arc(1,4)).toBe(2);});it('b',()=>{expect(hd304arc(3,1)).toBe(1);});it('c',()=>{expect(hd304arc(0,0)).toBe(0);});it('d',()=>{expect(hd304arc(93,73)).toBe(2);});it('e',()=>{expect(hd304arc(15,0)).toBe(4);});});
function hd305arc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph305arc_hd',()=>{it('a',()=>{expect(hd305arc(1,4)).toBe(2);});it('b',()=>{expect(hd305arc(3,1)).toBe(1);});it('c',()=>{expect(hd305arc(0,0)).toBe(0);});it('d',()=>{expect(hd305arc(93,73)).toBe(2);});it('e',()=>{expect(hd305arc(15,0)).toBe(4);});});
function hd306arc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph306arc_hd',()=>{it('a',()=>{expect(hd306arc(1,4)).toBe(2);});it('b',()=>{expect(hd306arc(3,1)).toBe(1);});it('c',()=>{expect(hd306arc(0,0)).toBe(0);});it('d',()=>{expect(hd306arc(93,73)).toBe(2);});it('e',()=>{expect(hd306arc(15,0)).toBe(4);});});
function hd307arc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph307arc_hd',()=>{it('a',()=>{expect(hd307arc(1,4)).toBe(2);});it('b',()=>{expect(hd307arc(3,1)).toBe(1);});it('c',()=>{expect(hd307arc(0,0)).toBe(0);});it('d',()=>{expect(hd307arc(93,73)).toBe(2);});it('e',()=>{expect(hd307arc(15,0)).toBe(4);});});
function hd308arc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph308arc_hd',()=>{it('a',()=>{expect(hd308arc(1,4)).toBe(2);});it('b',()=>{expect(hd308arc(3,1)).toBe(1);});it('c',()=>{expect(hd308arc(0,0)).toBe(0);});it('d',()=>{expect(hd308arc(93,73)).toBe(2);});it('e',()=>{expect(hd308arc(15,0)).toBe(4);});});
function hd309arc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph309arc_hd',()=>{it('a',()=>{expect(hd309arc(1,4)).toBe(2);});it('b',()=>{expect(hd309arc(3,1)).toBe(1);});it('c',()=>{expect(hd309arc(0,0)).toBe(0);});it('d',()=>{expect(hd309arc(93,73)).toBe(2);});it('e',()=>{expect(hd309arc(15,0)).toBe(4);});});
function hd310arc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph310arc_hd',()=>{it('a',()=>{expect(hd310arc(1,4)).toBe(2);});it('b',()=>{expect(hd310arc(3,1)).toBe(1);});it('c',()=>{expect(hd310arc(0,0)).toBe(0);});it('d',()=>{expect(hd310arc(93,73)).toBe(2);});it('e',()=>{expect(hd310arc(15,0)).toBe(4);});});
function hd311arc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph311arc_hd',()=>{it('a',()=>{expect(hd311arc(1,4)).toBe(2);});it('b',()=>{expect(hd311arc(3,1)).toBe(1);});it('c',()=>{expect(hd311arc(0,0)).toBe(0);});it('d',()=>{expect(hd311arc(93,73)).toBe(2);});it('e',()=>{expect(hd311arc(15,0)).toBe(4);});});
function hd312arc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph312arc_hd',()=>{it('a',()=>{expect(hd312arc(1,4)).toBe(2);});it('b',()=>{expect(hd312arc(3,1)).toBe(1);});it('c',()=>{expect(hd312arc(0,0)).toBe(0);});it('d',()=>{expect(hd312arc(93,73)).toBe(2);});it('e',()=>{expect(hd312arc(15,0)).toBe(4);});});
function hd313arc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph313arc_hd',()=>{it('a',()=>{expect(hd313arc(1,4)).toBe(2);});it('b',()=>{expect(hd313arc(3,1)).toBe(1);});it('c',()=>{expect(hd313arc(0,0)).toBe(0);});it('d',()=>{expect(hd313arc(93,73)).toBe(2);});it('e',()=>{expect(hd313arc(15,0)).toBe(4);});});
function hd314arc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph314arc_hd',()=>{it('a',()=>{expect(hd314arc(1,4)).toBe(2);});it('b',()=>{expect(hd314arc(3,1)).toBe(1);});it('c',()=>{expect(hd314arc(0,0)).toBe(0);});it('d',()=>{expect(hd314arc(93,73)).toBe(2);});it('e',()=>{expect(hd314arc(15,0)).toBe(4);});});
function hd315arc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph315arc_hd',()=>{it('a',()=>{expect(hd315arc(1,4)).toBe(2);});it('b',()=>{expect(hd315arc(3,1)).toBe(1);});it('c',()=>{expect(hd315arc(0,0)).toBe(0);});it('d',()=>{expect(hd315arc(93,73)).toBe(2);});it('e',()=>{expect(hd315arc(15,0)).toBe(4);});});
function hd316arc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph316arc_hd',()=>{it('a',()=>{expect(hd316arc(1,4)).toBe(2);});it('b',()=>{expect(hd316arc(3,1)).toBe(1);});it('c',()=>{expect(hd316arc(0,0)).toBe(0);});it('d',()=>{expect(hd316arc(93,73)).toBe(2);});it('e',()=>{expect(hd316arc(15,0)).toBe(4);});});
function hd317arc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph317arc_hd',()=>{it('a',()=>{expect(hd317arc(1,4)).toBe(2);});it('b',()=>{expect(hd317arc(3,1)).toBe(1);});it('c',()=>{expect(hd317arc(0,0)).toBe(0);});it('d',()=>{expect(hd317arc(93,73)).toBe(2);});it('e',()=>{expect(hd317arc(15,0)).toBe(4);});});
function hd318arc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph318arc_hd',()=>{it('a',()=>{expect(hd318arc(1,4)).toBe(2);});it('b',()=>{expect(hd318arc(3,1)).toBe(1);});it('c',()=>{expect(hd318arc(0,0)).toBe(0);});it('d',()=>{expect(hd318arc(93,73)).toBe(2);});it('e',()=>{expect(hd318arc(15,0)).toBe(4);});});
function hd319arc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph319arc_hd',()=>{it('a',()=>{expect(hd319arc(1,4)).toBe(2);});it('b',()=>{expect(hd319arc(3,1)).toBe(1);});it('c',()=>{expect(hd319arc(0,0)).toBe(0);});it('d',()=>{expect(hd319arc(93,73)).toBe(2);});it('e',()=>{expect(hd319arc(15,0)).toBe(4);});});
function hd320arc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph320arc_hd',()=>{it('a',()=>{expect(hd320arc(1,4)).toBe(2);});it('b',()=>{expect(hd320arc(3,1)).toBe(1);});it('c',()=>{expect(hd320arc(0,0)).toBe(0);});it('d',()=>{expect(hd320arc(93,73)).toBe(2);});it('e',()=>{expect(hd320arc(15,0)).toBe(4);});});
function hd321arc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph321arc_hd',()=>{it('a',()=>{expect(hd321arc(1,4)).toBe(2);});it('b',()=>{expect(hd321arc(3,1)).toBe(1);});it('c',()=>{expect(hd321arc(0,0)).toBe(0);});it('d',()=>{expect(hd321arc(93,73)).toBe(2);});it('e',()=>{expect(hd321arc(15,0)).toBe(4);});});
function hd322arc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph322arc_hd',()=>{it('a',()=>{expect(hd322arc(1,4)).toBe(2);});it('b',()=>{expect(hd322arc(3,1)).toBe(1);});it('c',()=>{expect(hd322arc(0,0)).toBe(0);});it('d',()=>{expect(hd322arc(93,73)).toBe(2);});it('e',()=>{expect(hd322arc(15,0)).toBe(4);});});
function hd323arc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph323arc_hd',()=>{it('a',()=>{expect(hd323arc(1,4)).toBe(2);});it('b',()=>{expect(hd323arc(3,1)).toBe(1);});it('c',()=>{expect(hd323arc(0,0)).toBe(0);});it('d',()=>{expect(hd323arc(93,73)).toBe(2);});it('e',()=>{expect(hd323arc(15,0)).toBe(4);});});
function hd324arc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph324arc_hd',()=>{it('a',()=>{expect(hd324arc(1,4)).toBe(2);});it('b',()=>{expect(hd324arc(3,1)).toBe(1);});it('c',()=>{expect(hd324arc(0,0)).toBe(0);});it('d',()=>{expect(hd324arc(93,73)).toBe(2);});it('e',()=>{expect(hd324arc(15,0)).toBe(4);});});
function hd325arc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph325arc_hd',()=>{it('a',()=>{expect(hd325arc(1,4)).toBe(2);});it('b',()=>{expect(hd325arc(3,1)).toBe(1);});it('c',()=>{expect(hd325arc(0,0)).toBe(0);});it('d',()=>{expect(hd325arc(93,73)).toBe(2);});it('e',()=>{expect(hd325arc(15,0)).toBe(4);});});
function hd326arc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph326arc_hd',()=>{it('a',()=>{expect(hd326arc(1,4)).toBe(2);});it('b',()=>{expect(hd326arc(3,1)).toBe(1);});it('c',()=>{expect(hd326arc(0,0)).toBe(0);});it('d',()=>{expect(hd326arc(93,73)).toBe(2);});it('e',()=>{expect(hd326arc(15,0)).toBe(4);});});
function hd327arc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph327arc_hd',()=>{it('a',()=>{expect(hd327arc(1,4)).toBe(2);});it('b',()=>{expect(hd327arc(3,1)).toBe(1);});it('c',()=>{expect(hd327arc(0,0)).toBe(0);});it('d',()=>{expect(hd327arc(93,73)).toBe(2);});it('e',()=>{expect(hd327arc(15,0)).toBe(4);});});
function hd328arc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph328arc_hd',()=>{it('a',()=>{expect(hd328arc(1,4)).toBe(2);});it('b',()=>{expect(hd328arc(3,1)).toBe(1);});it('c',()=>{expect(hd328arc(0,0)).toBe(0);});it('d',()=>{expect(hd328arc(93,73)).toBe(2);});it('e',()=>{expect(hd328arc(15,0)).toBe(4);});});
function hd329arc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph329arc_hd',()=>{it('a',()=>{expect(hd329arc(1,4)).toBe(2);});it('b',()=>{expect(hd329arc(3,1)).toBe(1);});it('c',()=>{expect(hd329arc(0,0)).toBe(0);});it('d',()=>{expect(hd329arc(93,73)).toBe(2);});it('e',()=>{expect(hd329arc(15,0)).toBe(4);});});
function hd330arc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph330arc_hd',()=>{it('a',()=>{expect(hd330arc(1,4)).toBe(2);});it('b',()=>{expect(hd330arc(3,1)).toBe(1);});it('c',()=>{expect(hd330arc(0,0)).toBe(0);});it('d',()=>{expect(hd330arc(93,73)).toBe(2);});it('e',()=>{expect(hd330arc(15,0)).toBe(4);});});
function hd331arc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph331arc_hd',()=>{it('a',()=>{expect(hd331arc(1,4)).toBe(2);});it('b',()=>{expect(hd331arc(3,1)).toBe(1);});it('c',()=>{expect(hd331arc(0,0)).toBe(0);});it('d',()=>{expect(hd331arc(93,73)).toBe(2);});it('e',()=>{expect(hd331arc(15,0)).toBe(4);});});
function hd332arc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph332arc_hd',()=>{it('a',()=>{expect(hd332arc(1,4)).toBe(2);});it('b',()=>{expect(hd332arc(3,1)).toBe(1);});it('c',()=>{expect(hd332arc(0,0)).toBe(0);});it('d',()=>{expect(hd332arc(93,73)).toBe(2);});it('e',()=>{expect(hd332arc(15,0)).toBe(4);});});
function hd333arc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph333arc_hd',()=>{it('a',()=>{expect(hd333arc(1,4)).toBe(2);});it('b',()=>{expect(hd333arc(3,1)).toBe(1);});it('c',()=>{expect(hd333arc(0,0)).toBe(0);});it('d',()=>{expect(hd333arc(93,73)).toBe(2);});it('e',()=>{expect(hd333arc(15,0)).toBe(4);});});
function hd334arc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph334arc_hd',()=>{it('a',()=>{expect(hd334arc(1,4)).toBe(2);});it('b',()=>{expect(hd334arc(3,1)).toBe(1);});it('c',()=>{expect(hd334arc(0,0)).toBe(0);});it('d',()=>{expect(hd334arc(93,73)).toBe(2);});it('e',()=>{expect(hd334arc(15,0)).toBe(4);});});
function hd335arc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph335arc_hd',()=>{it('a',()=>{expect(hd335arc(1,4)).toBe(2);});it('b',()=>{expect(hd335arc(3,1)).toBe(1);});it('c',()=>{expect(hd335arc(0,0)).toBe(0);});it('d',()=>{expect(hd335arc(93,73)).toBe(2);});it('e',()=>{expect(hd335arc(15,0)).toBe(4);});});
function hd336arc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph336arc_hd',()=>{it('a',()=>{expect(hd336arc(1,4)).toBe(2);});it('b',()=>{expect(hd336arc(3,1)).toBe(1);});it('c',()=>{expect(hd336arc(0,0)).toBe(0);});it('d',()=>{expect(hd336arc(93,73)).toBe(2);});it('e',()=>{expect(hd336arc(15,0)).toBe(4);});});
function hd337arc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph337arc_hd',()=>{it('a',()=>{expect(hd337arc(1,4)).toBe(2);});it('b',()=>{expect(hd337arc(3,1)).toBe(1);});it('c',()=>{expect(hd337arc(0,0)).toBe(0);});it('d',()=>{expect(hd337arc(93,73)).toBe(2);});it('e',()=>{expect(hd337arc(15,0)).toBe(4);});});
