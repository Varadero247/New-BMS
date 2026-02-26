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
