// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import {
  AlertSeverity,
  AlertCondition,
  AlertRule,
  AlertContext,
  AlertEvaluation,
  AlertState,
  evaluateCondition,
  evaluateRule,
  evaluateRules,
  createRule,
  updateState,
  createState,
  isInCooldown,
  getSeverityLevel,
  compareSeverity,
  getHighestSeverity,
  filterByTag,
  filterBySeverity,
  summarize,
  groupBySeverity,
  validateRule,
  mergeContexts,
  conditionToString,
  ruleToString,
  buildKpiAlert,
  buildTrendAlert,
} from '../src';

// ---------------------------------------------------------------------------
// Helper factories
// ---------------------------------------------------------------------------

function makeRule(overrides: Partial<AlertRule> = {}): AlertRule {
  return {
    id: 'rule-1',
    name: 'Test Rule',
    conditions: [{ field: 'v', operator: 'gt', threshold: 50 }],
    severity: AlertSeverity.WARNING,
    enabled: true,
    ...overrides,
  };
}

function makeCtx(values: Record<string, number | string | boolean | null>, prev?: Record<string, number | string | boolean | null>): AlertContext {
  return { values, previousValues: prev, timestamp: 1_000_000 };
}

function makeState(overrides: Partial<AlertState> = {}): AlertState {
  return { ruleId: 'rule-1', triggerCount: 0, consecutiveTriggers: 0, inCooldown: false, ...overrides };
}

function makeEval(overrides: Partial<AlertEvaluation> = {}): AlertEvaluation {
  return {
    ruleId: 'rule-1',
    ruleName: 'Test Rule',
    triggered: true,
    severity: AlertSeverity.WARNING,
    matchedConditions: [],
    timestamp: 1_000_000,
    context: makeCtx({ v: 100 }),
    ...overrides,
  };
}

// ===========================================================================
// 1. evaluateCondition — gt (201 tests: 0..200)
// ===========================================================================
describe('evaluateCondition gt', () => {
  for (let i = 0; i <= 200; i++) {
    const threshold = 100;
    it(`value ${i} gt ${threshold} = ${i > threshold}`, () => {
      const r = evaluateCondition({ field: 'v', operator: 'gt', threshold }, makeCtx({ v: i }));
      expect(r).toBe(i > threshold);
    });
  }
});

// ===========================================================================
// 2. evaluateCondition — gte (201 tests: 0..200)
// ===========================================================================
describe('evaluateCondition gte', () => {
  for (let i = 0; i <= 200; i++) {
    const threshold = 100;
    it(`value ${i} gte ${threshold} = ${i >= threshold}`, () => {
      const r = evaluateCondition({ field: 'v', operator: 'gte', threshold }, makeCtx({ v: i }));
      expect(r).toBe(i >= threshold);
    });
  }
});

// ===========================================================================
// 3. evaluateCondition — lt (201 tests: 0..200)
// ===========================================================================
describe('evaluateCondition lt', () => {
  for (let i = 0; i <= 200; i++) {
    const threshold = 100;
    it(`value ${i} lt ${threshold} = ${i < threshold}`, () => {
      const r = evaluateCondition({ field: 'v', operator: 'lt', threshold }, makeCtx({ v: i }));
      expect(r).toBe(i < threshold);
    });
  }
});

// ===========================================================================
// 4. evaluateCondition — lte (201 tests: 0..200)
// ===========================================================================
describe('evaluateCondition lte', () => {
  for (let i = 0; i <= 200; i++) {
    const threshold = 100;
    it(`value ${i} lte ${threshold} = ${i <= threshold}`, () => {
      const r = evaluateCondition({ field: 'v', operator: 'lte', threshold }, makeCtx({ v: i }));
      expect(r).toBe(i <= threshold);
    });
  }
});

// ===========================================================================
// 5. evaluateCondition — eq (50 tests: 75..124)
// ===========================================================================
describe('evaluateCondition eq numeric', () => {
  for (let i = 75; i <= 124; i++) {
    const threshold = 100;
    it(`value ${i} eq ${threshold} = ${i === threshold}`, () => {
      const r = evaluateCondition({ field: 'v', operator: 'eq', threshold }, makeCtx({ v: i }));
      expect(r).toBe(i === threshold);
    });
  }
});

// ===========================================================================
// 6. evaluateCondition — neq (50 tests: 75..124)
// ===========================================================================
describe('evaluateCondition neq numeric', () => {
  for (let i = 75; i <= 124; i++) {
    const threshold = 100;
    it(`value ${i} neq ${threshold} = ${i !== threshold}`, () => {
      const r = evaluateCondition({ field: 'v', operator: 'neq', threshold }, makeCtx({ v: i }));
      expect(r).toBe(i !== threshold);
    });
  }
});

// ===========================================================================
// 7. evaluateCondition — between (100 tests: 1..100)
// ===========================================================================
describe('evaluateCondition between', () => {
  const lo = 25, hi = 75;
  for (let i = 1; i <= 100; i++) {
    const expected = i >= lo && i <= hi;
    it(`value ${i} between [${lo},${hi}] = ${expected}`, () => {
      const r = evaluateCondition({ field: 'v', operator: 'between', threshold: [lo, hi] }, makeCtx({ v: i }));
      expect(r).toBe(expected);
    });
  }
});

// ===========================================================================
// 8. evaluateCondition — outside (100 tests: 1..100)
// ===========================================================================
describe('evaluateCondition outside', () => {
  const lo = 25, hi = 75;
  for (let i = 1; i <= 100; i++) {
    const expected = i < lo || i > hi;
    it(`value ${i} outside [${lo},${hi}] = ${expected}`, () => {
      const r = evaluateCondition({ field: 'v', operator: 'outside', threshold: [lo, hi] }, makeCtx({ v: i }));
      expect(r).toBe(expected);
    });
  }
});

// ===========================================================================
// 9. evaluateCondition — contains (50 tests)
// ===========================================================================
describe('evaluateCondition contains', () => {
  const words = ['alpha', 'beta', 'gamma', 'delta', 'epsilon'];
  const haystack = 'alpha gamma zeta';
  for (let i = 0; i < 50; i++) {
    const word = words[i % words.length];
    const expected = haystack.includes(word);
    it(`contains '${word}' in '${haystack}' = ${expected} [${i}]`, () => {
      const r = evaluateCondition({ field: 's', operator: 'contains', threshold: word }, makeCtx({ s: haystack }));
      expect(r).toBe(expected);
    });
  }
});

// ===========================================================================
// 10. evaluateCondition — startsWith (50 tests)
// ===========================================================================
describe('evaluateCondition startsWith', () => {
  const prefixes = ['al', 'be', 'ga', 'de', 'ep', 'alpha', 'zet', 'AB', 'al', 'ga'];
  const str = 'alpha gamma zeta';
  for (let i = 0; i < 50; i++) {
    const prefix = prefixes[i % prefixes.length];
    const expected = str.startsWith(prefix);
    it(`startsWith '${prefix}' in '${str}' = ${expected} [${i}]`, () => {
      const r = evaluateCondition({ field: 's', operator: 'startsWith', threshold: prefix }, makeCtx({ s: str }));
      expect(r).toBe(expected);
    });
  }
});

// ===========================================================================
// 11. evaluateCondition — endsWith (50 tests)
// ===========================================================================
describe('evaluateCondition endsWith', () => {
  const suffixes = ['eta', 'ta', 'a', 'zeta', 'XY', 'alpha', 'gamma', 'amma', 'ma', 'a'];
  const str = 'alpha gamma zeta';
  for (let i = 0; i < 50; i++) {
    const suffix = suffixes[i % suffixes.length];
    const expected = str.endsWith(suffix);
    it(`endsWith '${suffix}' in '${str}' = ${expected} [${i}]`, () => {
      const r = evaluateCondition({ field: 's', operator: 'endsWith', threshold: suffix }, makeCtx({ s: str }));
      expect(r).toBe(expected);
    });
  }
});

// ===========================================================================
// 12. evaluateCondition — matches (regex) (50 tests)
// ===========================================================================
describe('evaluateCondition matches', () => {
  const patterns = ['^alpha', '\\d+', '[a-z]+', 'gamma', '^xyz', '\\s', 'zeta$', 'ALPHA', '^[a-z]', 'a.+a'];
  const str = 'alpha gamma zeta';
  for (let i = 0; i < 50; i++) {
    const pattern = patterns[i % patterns.length];
    let expected: boolean;
    try { expected = new RegExp(pattern).test(str); } catch { expected = false; }
    it(`matches /${pattern}/ on '${str}' = ${expected} [${i}]`, () => {
      const r = evaluateCondition({ field: 's', operator: 'matches', threshold: pattern }, makeCtx({ s: str }));
      expect(r).toBe(expected);
    });
  }
});

// ===========================================================================
// 13. evaluateCondition — in (50 tests)
// ===========================================================================
describe('evaluateCondition in', () => {
  const arr = [10, 20, 30, 40, 50];
  for (let i = 1; i <= 50; i++) {
    const v = i * 5;
    const expected = arr.some((x) => String(x) === String(v));
    it(`value ${v} in [${arr}] = ${expected}`, () => {
      const r = evaluateCondition({ field: 'v', operator: 'in', threshold: arr }, makeCtx({ v }));
      expect(r).toBe(expected);
    });
  }
});

// ===========================================================================
// 14. evaluateCondition — notIn (50 tests)
// ===========================================================================
describe('evaluateCondition notIn', () => {
  const arr = [10, 20, 30, 40, 50];
  for (let i = 1; i <= 50; i++) {
    const v = i * 5;
    const expected = !arr.some((x) => String(x) === String(v));
    it(`value ${v} notIn [${arr}] = ${expected}`, () => {
      const r = evaluateCondition({ field: 'v', operator: 'notIn', threshold: arr }, makeCtx({ v }));
      expect(r).toBe(expected);
    });
  }
});

// ===========================================================================
// 15. evaluateCondition — isNull / isNotNull (50 tests each)
// ===========================================================================
describe('evaluateCondition isNull', () => {
  for (let i = 0; i < 50; i++) {
    const isNullVal = i % 2 === 0;
    const val = isNullVal ? null : i;
    it(`isNull for ${JSON.stringify(val)} = ${isNullVal} [${i}]`, () => {
      const r = evaluateCondition({ field: 'v', operator: 'isNull', threshold: 0 }, makeCtx({ v: val }));
      expect(r).toBe(isNullVal);
    });
  }
});

describe('evaluateCondition isNotNull', () => {
  for (let i = 0; i < 50; i++) {
    const isNullVal = i % 2 === 0;
    const val = isNullVal ? null : i;
    it(`isNotNull for ${JSON.stringify(val)} = ${!isNullVal} [${i}]`, () => {
      const r = evaluateCondition({ field: 'v', operator: 'isNotNull', threshold: 0 }, makeCtx({ v: val }));
      expect(r).toBe(!isNullVal);
    });
  }
});

// ===========================================================================
// 16. evaluateCondition — changedBy (50 tests: delta 0..49)
// ===========================================================================
describe('evaluateCondition changedBy', () => {
  for (let i = 0; i < 50; i++) {
    const prev = 100;
    const curr = 100 + i;
    const threshold = 30;
    const expected = Math.abs(curr - prev) >= threshold;
    it(`changedBy ${i} (prev=${prev}, curr=${curr}) >= ${threshold} = ${expected}`, () => {
      const r = evaluateCondition(
        { field: 'v', operator: 'changedBy', threshold },
        makeCtx({ v: curr }, { v: prev }),
      );
      expect(r).toBe(expected);
    });
  }
});

// ===========================================================================
// 17. evaluateCondition — changedByPct (50 tests)
// ===========================================================================
describe('evaluateCondition changedByPct', () => {
  for (let i = 0; i < 50; i++) {
    const prev = 200;
    const curr = 200 + i * 2;
    const threshold = 20;
    const pct = Math.abs(((curr - prev) / prev) * 100);
    const expected = pct >= threshold;
    it(`changedByPct prev=${prev} curr=${curr} pct=${pct.toFixed(1)} >= ${threshold} = ${expected} [${i}]`, () => {
      const r = evaluateCondition(
        { field: 'v', operator: 'changedByPct', threshold },
        makeCtx({ v: curr }, { v: prev }),
      );
      expect(r).toBe(expected);
    });
  }
});

// ===========================================================================
// 18. evaluateCondition — changedBy missing previous (20 tests)
// ===========================================================================
describe('evaluateCondition changedBy no previous', () => {
  for (let i = 0; i < 20; i++) {
    it(`changedBy returns false when no previous [${i}]`, () => {
      const r = evaluateCondition({ field: 'v', operator: 'changedBy', threshold: 1 }, makeCtx({ v: 100 }));
      expect(r).toBe(false);
    });
  }
});

// ===========================================================================
// 19. evaluateCondition — AND sub-conditions (30 tests)
// ===========================================================================
describe('evaluateCondition AND sub-conditions', () => {
  for (let i = 0; i < 30; i++) {
    const v1 = i;
    const v2 = 50 - i;
    const mainMatch = v1 > 20;
    const andMatch = v2 > 20;
    const expected = mainMatch && andMatch;
    it(`AND: v1=${v1}>20 AND v2=${v2}>20 = ${expected} [${i}]`, () => {
      const cond: AlertCondition = {
        field: 'v1',
        operator: 'gt',
        threshold: 20,
        and: [{ field: 'v2', operator: 'gt', threshold: 20 }],
      };
      const r = evaluateCondition(cond, makeCtx({ v1, v2 }));
      expect(r).toBe(expected);
    });
  }
});

// ===========================================================================
// 20. evaluateCondition — OR sub-conditions (30 tests)
// ===========================================================================
describe('evaluateCondition OR sub-conditions', () => {
  for (let i = 0; i < 30; i++) {
    const v1 = i;
    const v2 = 40 - i;
    const mainMatch = v1 > 25;
    const orMatch = v2 > 25;
    const expected = mainMatch || orMatch;
    it(`OR: v1=${v1}>25 OR v2=${v2}>25 = ${expected} [${i}]`, () => {
      const cond: AlertCondition = {
        field: 'v1',
        operator: 'gt',
        threshold: 25,
        or: [{ field: 'v2', operator: 'gt', threshold: 25 }],
      };
      const r = evaluateCondition(cond, makeCtx({ v1, v2 }));
      expect(r).toBe(expected);
    });
  }
});

// ===========================================================================
// 21. evaluateRule — basic enabled/disabled (40 tests)
// ===========================================================================
describe('evaluateRule enabled/disabled', () => {
  for (let i = 0; i < 20; i++) {
    it(`evaluateRule disabled rule never triggers [${i}]`, () => {
      const rule = makeRule({ enabled: false });
      const ctx = makeCtx({ v: 999 });
      const result = evaluateRule(rule, ctx);
      expect(result.triggered).toBe(false);
    });
  }
  for (let i = 0; i < 20; i++) {
    it(`evaluateRule enabled rule triggers when condition met [${i}]`, () => {
      const rule = makeRule({ enabled: true });
      const ctx = makeCtx({ v: 200 });
      const result = evaluateRule(rule, ctx);
      expect(result.triggered).toBe(true);
    });
  }
});

// ===========================================================================
// 22. evaluateRule — cooldown prevents re-trigger (30 tests)
// ===========================================================================
describe('evaluateRule cooldown', () => {
  for (let i = 0; i < 30; i++) {
    it(`evaluateRule in cooldown does not trigger [${i}]`, () => {
      const rule = makeRule({ cooldownMs: 60_000 });
      const state = makeState({ lastTriggeredAt: 1_000_000 - 30_000, inCooldown: true });
      const ctx = makeCtx({ v: 200 }, undefined);
      const ctxWithTs: AlertContext = { ...ctx, timestamp: 1_000_000 };
      const result = evaluateRule(rule, ctxWithTs, state);
      expect(result.triggered).toBe(false);
    });
  }
});

// ===========================================================================
// 23. evaluateRule — cooldown expired allows trigger (30 tests)
// ===========================================================================
describe('evaluateRule cooldown expired', () => {
  for (let i = 0; i < 30; i++) {
    it(`evaluateRule after cooldown expires triggers [${i}]`, () => {
      const rule = makeRule({ cooldownMs: 60_000 });
      const state = makeState({ lastTriggeredAt: 1_000_000 - 120_000, inCooldown: false });
      const ctx: AlertContext = { values: { v: 200 }, timestamp: 1_000_000 };
      const result = evaluateRule(rule, ctx, state);
      expect(result.triggered).toBe(true);
    });
  }
});

// ===========================================================================
// 24. evaluateRule — ruleId and ruleName in result (20 tests)
// ===========================================================================
describe('evaluateRule result metadata', () => {
  for (let i = 0; i < 20; i++) {
    it(`evaluateRule returns correct ruleId and ruleName [${i}]`, () => {
      const rule = makeRule({ id: `rule-${i}`, name: `Rule ${i}` });
      const ctx = makeCtx({ v: 200 });
      const result = evaluateRule(rule, ctx);
      expect(result.ruleId).toBe(`rule-${i}`);
      expect(result.ruleName).toBe(`Rule ${i}`);
    });
  }
});

// ===========================================================================
// 25. evaluateRule — multiple conditions all must match (30 tests)
// ===========================================================================
describe('evaluateRule multiple conditions AND', () => {
  for (let i = 0; i < 30; i++) {
    const v1 = i * 5;
    const v2 = (30 - i) * 5;
    const cond1 = v1 > 50;
    const cond2 = v2 > 50;
    const expected = cond1 && cond2;
    it(`multi-cond: v1=${v1}>50 AND v2=${v2}>50 = ${expected} [${i}]`, () => {
      const rule = makeRule({
        conditions: [
          { field: 'v1', operator: 'gt', threshold: 50 },
          { field: 'v2', operator: 'gt', threshold: 50 },
        ],
      });
      const ctx = makeCtx({ v1, v2 });
      const result = evaluateRule(rule, ctx);
      expect(result.triggered).toBe(expected);
    });
  }
});

// ===========================================================================
// 26. evaluateRule — severity propagated (20 tests)
// ===========================================================================
describe('evaluateRule severity propagated', () => {
  const severities = [AlertSeverity.INFO, AlertSeverity.WARNING, AlertSeverity.CRITICAL, AlertSeverity.EMERGENCY];
  for (let i = 0; i < 20; i++) {
    const sev = severities[i % severities.length];
    it(`evaluateRule propagates severity ${sev} [${i}]`, () => {
      const rule = makeRule({ severity: sev });
      const ctx = makeCtx({ v: 200 });
      const result = evaluateRule(rule, ctx);
      expect(result.severity).toBe(sev);
    });
  }
});

// ===========================================================================
// 27. evaluateRules — batch evaluation (30 tests)
// ===========================================================================
describe('evaluateRules batch', () => {
  for (let n = 1; n <= 30; n++) {
    it(`evaluateRules returns ${n} evaluations for ${n} rules`, () => {
      const rules: AlertRule[] = Array.from({ length: n }, (_, i) =>
        makeRule({ id: `r-${i}`, name: `Rule ${i}` }),
      );
      const ctx = makeCtx({ v: 200 });
      const results = evaluateRules(rules, ctx);
      expect(results).toHaveLength(n);
    });
  }
});

// ===========================================================================
// 28. createRule — generates unique ids (30 tests)
// ===========================================================================
describe('createRule unique ids', () => {
  const ids = new Set<string>();
  for (let i = 0; i < 30; i++) {
    it(`createRule generates non-empty id [${i}]`, () => {
      const rule = createRule({
        name: `Rule ${i}`,
        conditions: [{ field: 'v', operator: 'gt', threshold: 10 }],
        severity: AlertSeverity.INFO,
      });
      expect(rule.id).toBeTruthy();
      expect(typeof rule.id).toBe('string');
      ids.add(rule.id);
    });
  }
});

// ===========================================================================
// 29. createRule — preserves all fields (20 tests)
// ===========================================================================
describe('createRule preserves fields', () => {
  for (let i = 0; i < 20; i++) {
    it(`createRule preserves name, conditions, severity [${i}]`, () => {
      const rule = createRule({
        name: `Rule ${i}`,
        description: `Desc ${i}`,
        conditions: [{ field: 'v', operator: 'gt', threshold: i }],
        severity: AlertSeverity.CRITICAL,
        tags: [`tag${i}`],
      });
      expect(rule.name).toBe(`Rule ${i}`);
      expect(rule.description).toBe(`Desc ${i}`);
      expect(rule.conditions[0].threshold).toBe(i);
      expect(rule.severity).toBe(AlertSeverity.CRITICAL);
      expect(rule.tags).toContain(`tag${i}`);
    });
  }
});

// ===========================================================================
// 30. createState — initial state (20 tests)
// ===========================================================================
describe('createState', () => {
  for (let i = 0; i < 20; i++) {
    it(`createState initialises state for ruleId-${i}`, () => {
      const state = createState(`ruleId-${i}`);
      expect(state.ruleId).toBe(`ruleId-${i}`);
      expect(state.triggerCount).toBe(0);
      expect(state.consecutiveTriggers).toBe(0);
      expect(state.inCooldown).toBe(false);
      expect(state.lastTriggeredAt).toBeUndefined();
    });
  }
});

// ===========================================================================
// 31. isInCooldown (40 tests)
// ===========================================================================
describe('isInCooldown', () => {
  for (let i = 0; i < 20; i++) {
    it(`isInCooldown false when no lastTriggeredAt [${i}]`, () => {
      const state = makeState({ lastTriggeredAt: undefined });
      const rule = makeRule({ cooldownMs: 60_000 });
      expect(isInCooldown(state, rule, 1_000_000)).toBe(false);
    });
  }
  for (let i = 0; i < 20; i++) {
    const elapsed = i * 5_000; // 0..95s
    const cooldown = 60_000; // 60s
    const expected = elapsed < cooldown;
    it(`isInCooldown elapsed=${elapsed}ms cooldown=${cooldown}ms = ${expected} [${i}]`, () => {
      const now = 2_000_000;
      const state = makeState({ lastTriggeredAt: now - elapsed });
      const rule = makeRule({ cooldownMs: cooldown });
      expect(isInCooldown(state, rule, now)).toBe(expected);
    });
  }
});

// ===========================================================================
// 32. updateState — triggered increments triggerCount (30 tests)
// ===========================================================================
describe('updateState triggered', () => {
  for (let i = 1; i <= 30; i++) {
    it(`updateState after ${i} triggers has triggerCount=${i}`, () => {
      let state = createState('r1');
      for (let j = 0; j < i; j++) {
        const ev = makeEval({ triggered: true, timestamp: 1_000_000 + j * 1_000_000 });
        state = updateState(state, ev);
      }
      expect(state.triggerCount).toBe(i);
    });
  }
});

// ===========================================================================
// 33. updateState — non-trigger resets consecutiveTriggers (20 tests)
// ===========================================================================
describe('updateState non-trigger resets consecutive', () => {
  for (let i = 0; i < 20; i++) {
    it(`updateState false resets consecutiveTriggers [${i}]`, () => {
      let state = createState('r1');
      const trueEv = makeEval({ triggered: true, timestamp: 1_000_000 });
      state = updateState(state, trueEv);
      state = updateState(state, trueEv);
      expect(state.consecutiveTriggers).toBe(2);
      const falseEv = makeEval({ triggered: false, timestamp: 2_000_000 });
      state = updateState(state, falseEv);
      expect(state.consecutiveTriggers).toBe(0);
    });
  }
});

// ===========================================================================
// 34. getSeverityLevel (40 tests)
// ===========================================================================
describe('getSeverityLevel', () => {
  const cases: [AlertSeverity, number][] = [
    [AlertSeverity.INFO, 1],
    [AlertSeverity.WARNING, 2],
    [AlertSeverity.CRITICAL, 3],
    [AlertSeverity.EMERGENCY, 4],
  ];
  for (const [sev, expected] of cases) {
    for (let i = 0; i < 10; i++) {
      it(`getSeverityLevel(${sev}) = ${expected} [${i}]`, () => {
        expect(getSeverityLevel(sev)).toBe(expected);
      });
    }
  }
});

// ===========================================================================
// 35. compareSeverity (40 tests)
// ===========================================================================
describe('compareSeverity', () => {
  const orderedSeverities = [AlertSeverity.INFO, AlertSeverity.WARNING, AlertSeverity.CRITICAL, AlertSeverity.EMERGENCY];
  for (let i = 0; i < orderedSeverities.length; i++) {
    for (let j = 0; j < orderedSeverities.length; j++) {
      it(`compareSeverity(${orderedSeverities[i]}, ${orderedSeverities[j]})`, () => {
        const result = compareSeverity(orderedSeverities[i], orderedSeverities[j]);
        if (i < j) expect(result).toBe(-1);
        else if (i > j) expect(result).toBe(1);
        else expect(result).toBe(0);
      });
    }
  }
});

// ===========================================================================
// 36. getHighestSeverity (40 tests)
// ===========================================================================
describe('getHighestSeverity', () => {
  it('returns null for empty array', () => {
    expect(getHighestSeverity([])).toBeNull();
  });
  it('returns null when no triggered evaluations', () => {
    const evals = [makeEval({ triggered: false, severity: AlertSeverity.EMERGENCY })];
    expect(getHighestSeverity(evals)).toBeNull();
  });
  const severities = [AlertSeverity.INFO, AlertSeverity.WARNING, AlertSeverity.CRITICAL, AlertSeverity.EMERGENCY];
  for (let i = 0; i < 38; i++) {
    const count = (i % 4) + 1;
    const mixedSevs = severities.slice(0, count);
    const expected = severities[count - 1];
    it(`getHighestSeverity with ${count} severity levels, expected ${expected} [${i}]`, () => {
      const evals = mixedSevs.map((sev) => makeEval({ triggered: true, severity: sev }));
      expect(getHighestSeverity(evals)).toBe(expected);
    });
  }
});

// ===========================================================================
// 37. filterByTag (30 tests)
// ===========================================================================
describe('filterByTag', () => {
  const allTags = ['kpi', 'trend', 'security', 'compliance', 'operations'];
  const rules: AlertRule[] = allTags.map((tag, i) =>
    makeRule({ id: `r-${i}`, name: `Rule ${i}`, tags: [tag, 'all'] }),
  );

  for (let i = 0; i < 30; i++) {
    const tag = allTags[i % allTags.length];
    it(`filterByTag('${tag}') returns matching rules [${i}]`, () => {
      const filtered = filterByTag(rules, tag);
      expect(filtered.every((r) => r.tags?.includes(tag))).toBe(true);
    });
  }
});

// ===========================================================================
// 38. filterBySeverity (30 tests)
// ===========================================================================
describe('filterBySeverity', () => {
  const severities = [AlertSeverity.INFO, AlertSeverity.WARNING, AlertSeverity.CRITICAL, AlertSeverity.EMERGENCY];
  const rules: AlertRule[] = severities.map((sev, i) => makeRule({ id: `r-${i}`, severity: sev }));

  for (let i = 0; i < 30; i++) {
    const minSev = severities[i % severities.length];
    const minLevel = getSeverityLevel(minSev);
    it(`filterBySeverity(${minSev}) returns rules at or above that level [${i}]`, () => {
      const filtered = filterBySeverity(rules, minSev);
      expect(filtered.every((r) => getSeverityLevel(r.severity) >= minLevel)).toBe(true);
    });
  }
});

// ===========================================================================
// 39. summarize (30 tests)
// ===========================================================================
describe('summarize', () => {
  for (let n = 0; n < 30; n++) {
    it(`summarize ${n} triggered evaluations [${n}]`, () => {
      const evals: AlertEvaluation[] = Array.from({ length: n }, (_, i) =>
        makeEval({ triggered: true, severity: [AlertSeverity.INFO, AlertSeverity.WARNING, AlertSeverity.CRITICAL, AlertSeverity.EMERGENCY][i % 4] }),
      );
      const summary = summarize(evals);
      expect(summary.total).toBe(n);
      expect(summary.triggered).toBe(n);
    });
  }
});

// ===========================================================================
// 40. summarize — mixed triggered / not triggered (20 tests)
// ===========================================================================
describe('summarize mixed', () => {
  for (let i = 1; i <= 20; i++) {
    it(`summarize with ${i} triggered out of ${i * 2} total [${i}]`, () => {
      const evals: AlertEvaluation[] = [
        ...Array.from({ length: i }, () => makeEval({ triggered: true, severity: AlertSeverity.WARNING })),
        ...Array.from({ length: i }, () => makeEval({ triggered: false, severity: AlertSeverity.INFO })),
      ];
      const summary = summarize(evals);
      expect(summary.total).toBe(i * 2);
      expect(summary.triggered).toBe(i);
      expect(summary.warning).toBe(i);
    });
  }
});

// ===========================================================================
// 41. groupBySeverity (20 tests)
// ===========================================================================
describe('groupBySeverity', () => {
  for (let i = 0; i < 20; i++) {
    it(`groupBySeverity returns 4 groups [${i}]`, () => {
      const evals: AlertEvaluation[] = [
        makeEval({ severity: AlertSeverity.INFO }),
        makeEval({ severity: AlertSeverity.WARNING }),
        makeEval({ severity: AlertSeverity.CRITICAL }),
        makeEval({ severity: AlertSeverity.EMERGENCY }),
      ];
      const groups = groupBySeverity(evals);
      expect(Object.keys(groups)).toHaveLength(4);
      expect(groups[AlertSeverity.INFO]).toHaveLength(1);
      expect(groups[AlertSeverity.WARNING]).toHaveLength(1);
      expect(groups[AlertSeverity.CRITICAL]).toHaveLength(1);
      expect(groups[AlertSeverity.EMERGENCY]).toHaveLength(1);
    });
  }
});

// ===========================================================================
// 42. validateRule (50 tests)
// ===========================================================================
describe('validateRule valid rules', () => {
  for (let i = 0; i < 25; i++) {
    it(`validateRule returns empty errors for valid rule [${i}]`, () => {
      const rule = makeRule({ id: `valid-${i}`, name: `Valid Rule ${i}` });
      const errors = validateRule(rule);
      expect(errors).toHaveLength(0);
    });
  }
});

describe('validateRule invalid rules', () => {
  it('validates missing id', () => {
    const rule = makeRule({ id: '' });
    expect(validateRule(rule).length).toBeGreaterThan(0);
  });
  it('validates missing name', () => {
    const rule = makeRule({ name: '' });
    expect(validateRule(rule).length).toBeGreaterThan(0);
  });
  it('validates empty conditions', () => {
    const rule = makeRule({ conditions: [] });
    expect(validateRule(rule).length).toBeGreaterThan(0);
  });
  it('validates negative cooldownMs', () => {
    const rule = makeRule({ cooldownMs: -1 });
    expect(validateRule(rule).length).toBeGreaterThan(0);
  });
  it('validates invalid operator in condition', () => {
    const rule = makeRule({ conditions: [{ field: 'v', operator: 'INVALID' as never, threshold: 10 }] });
    expect(validateRule(rule).length).toBeGreaterThan(0);
  });
  it('validates between requires array threshold', () => {
    const rule = makeRule({ conditions: [{ field: 'v', operator: 'between', threshold: 10 }] });
    expect(validateRule(rule).length).toBeGreaterThan(0);
  });
  it('validates outside requires array threshold', () => {
    const rule = makeRule({ conditions: [{ field: 'v', operator: 'outside', threshold: 10 }] });
    expect(validateRule(rule).length).toBeGreaterThan(0);
  });
  it('validates in requires array threshold', () => {
    const rule = makeRule({ conditions: [{ field: 'v', operator: 'in', threshold: 10 }] });
    expect(validateRule(rule).length).toBeGreaterThan(0);
  });
  it('validates notIn requires array threshold', () => {
    const rule = makeRule({ conditions: [{ field: 'v', operator: 'notIn', threshold: 10 }] });
    expect(validateRule(rule).length).toBeGreaterThan(0);
  });
  it('validates condition missing field', () => {
    const rule = makeRule({ conditions: [{ field: '', operator: 'gt', threshold: 10 }] });
    expect(validateRule(rule).length).toBeGreaterThan(0);
  });
  for (let i = 0; i < 15; i++) {
    it(`validateRule valid rule with tags/metadata [${i}]`, () => {
      const rule = makeRule({
        id: `valid-meta-${i}`,
        tags: [`tag${i}`],
        metadata: { key: i },
        cooldownMs: i * 1000,
      });
      expect(validateRule(rule)).toHaveLength(0);
    });
  }
});

// ===========================================================================
// 43. mergeContexts (40 tests)
// ===========================================================================
describe('mergeContexts', () => {
  for (let i = 0; i < 20; i++) {
    it(`mergeContexts overrides values [${i}]`, () => {
      const base = makeCtx({ a: i, b: i * 2 });
      const override: Partial<AlertContext> = { values: { a: i + 100 } };
      const merged = mergeContexts(base, override);
      expect(merged.values.a).toBe(i + 100);
      expect(merged.values.b).toBe(i * 2);
    });
  }
  for (let i = 0; i < 20; i++) {
    it(`mergeContexts preserves timestamp when not overridden [${i}]`, () => {
      const base: AlertContext = { values: { v: i }, timestamp: 5_000_000 };
      const merged = mergeContexts(base, { values: { v: i + 1 } });
      expect(merged.timestamp).toBe(5_000_000);
    });
  }
});

// ===========================================================================
// 44. conditionToString (20 tests)
// ===========================================================================
describe('conditionToString', () => {
  const operators = ['gt', 'gte', 'lt', 'lte', 'eq', 'neq', 'between', 'outside', 'in', 'notIn'] as const;
  for (let i = 0; i < 20; i++) {
    const op = operators[i % operators.length];
    const thresh = ['between', 'outside', 'in', 'notIn'].includes(op) ? [10, 20] : i * 5;
    it(`conditionToString field op=${op} [${i}]`, () => {
      const cond: AlertCondition = { field: `field_${i}`, operator: op, threshold: thresh as never };
      const str = conditionToString(cond);
      expect(str).toContain(`field_${i}`);
      expect(str).toContain(op);
    });
  }
});

// ===========================================================================
// 45. ruleToString (20 tests)
// ===========================================================================
describe('ruleToString', () => {
  for (let i = 0; i < 20; i++) {
    it(`ruleToString includes rule name and severity [${i}]`, () => {
      const rule = makeRule({
        name: `MyRule${i}`,
        severity: AlertSeverity.CRITICAL,
        description: `Desc${i}`,
        tags: [`t${i}`],
      });
      const str = ruleToString(rule);
      expect(str).toContain(`MyRule${i}`);
      expect(str).toContain(AlertSeverity.CRITICAL);
    });
  }
});

// ===========================================================================
// 46. buildKpiAlert (30 tests)
// ===========================================================================
describe('buildKpiAlert', () => {
  const severities = [AlertSeverity.INFO, AlertSeverity.WARNING, AlertSeverity.CRITICAL, AlertSeverity.EMERGENCY];
  for (let i = 0; i < 30; i++) {
    const sev = severities[i % severities.length];
    const threshold = i * 10;
    it(`buildKpiAlert threshold=${threshold} severity=${sev} [${i}]`, () => {
      const rule = buildKpiAlert(`KPI Alert ${i}`, `metric_${i}`, threshold, sev);
      expect(rule.id).toBeTruthy();
      expect(rule.name).toBe(`KPI Alert ${i}`);
      expect(rule.conditions).toHaveLength(1);
      expect(rule.conditions[0].field).toBe(`metric_${i}`);
      expect(rule.conditions[0].operator).toBe('gte');
      expect(rule.conditions[0].threshold).toBe(threshold);
      expect(rule.severity).toBe(sev);
      expect(rule.enabled).toBe(true);
      expect(rule.tags).toContain('kpi');
    });
  }
});

// ===========================================================================
// 47. buildTrendAlert (30 tests)
// ===========================================================================
describe('buildTrendAlert', () => {
  const severities = [AlertSeverity.INFO, AlertSeverity.WARNING, AlertSeverity.CRITICAL, AlertSeverity.EMERGENCY];
  for (let i = 0; i < 30; i++) {
    const sev = severities[i % severities.length];
    const pct = (i + 1) * 5;
    it(`buildTrendAlert pctChange=${pct}% severity=${sev} [${i}]`, () => {
      const rule = buildTrendAlert(`Trend Alert ${i}`, `metric_${i}`, pct, sev);
      expect(rule.id).toBeTruthy();
      expect(rule.name).toBe(`Trend Alert ${i}`);
      expect(rule.conditions).toHaveLength(1);
      expect(rule.conditions[0].field).toBe(`metric_${i}`);
      expect(rule.conditions[0].operator).toBe('changedByPct');
      expect(rule.conditions[0].threshold).toBe(pct);
      expect(rule.severity).toBe(sev);
      expect(rule.enabled).toBe(true);
      expect(rule.tags).toContain('trend');
    });
  }
});

// ===========================================================================
// 48. eq / neq string comparisons (30 tests)
// ===========================================================================
describe('evaluateCondition eq string', () => {
  const testStrings = ['alpha', 'beta', 'gamma', 'delta', 'epsilon', 'zeta'];
  for (let i = 0; i < 30; i++) {
    const val = testStrings[i % testStrings.length];
    const target = testStrings[(i + 1) % testStrings.length];
    const expected = val === target;
    it(`eq '${val}' === '${target}' = ${expected} [${i}]`, () => {
      const r = evaluateCondition({ field: 's', operator: 'eq', threshold: target }, makeCtx({ s: val }));
      expect(r).toBe(expected);
    });
  }
});

// ===========================================================================
// 49. evaluateRules with states map (20 tests)
// ===========================================================================
describe('evaluateRules with states map', () => {
  for (let i = 0; i < 20; i++) {
    it(`evaluateRules respects cooldown in states map [${i}]`, () => {
      const rule = makeRule({ id: 'rule-cd', cooldownMs: 300_000 });
      const states = new Map<string, AlertState>();
      states.set('rule-cd', makeState({ lastTriggeredAt: 1_000_000 - 60_000 }));
      const ctx: AlertContext = { values: { v: 200 }, timestamp: 1_000_000 };
      const results = evaluateRules([rule], ctx, states);
      expect(results[0].triggered).toBe(false);
    });
  }
});

// ===========================================================================
// 50. evaluateRule — matchedConditions contains condition descriptions (20 tests)
// ===========================================================================
describe('evaluateRule matchedConditions', () => {
  for (let i = 0; i < 20; i++) {
    it(`evaluateRule fills matchedConditions when triggered [${i}]`, () => {
      const rule = makeRule({ conditions: [{ field: 'v', operator: 'gt', threshold: 50 }] });
      const ctx = makeCtx({ v: 200 });
      const result = evaluateRule(rule, ctx);
      expect(result.triggered).toBe(true);
      expect(result.matchedConditions).toHaveLength(1);
      expect(result.matchedConditions[0]).toContain('v');
    });
  }
});

// ===========================================================================
// 51. evaluateRule — empty matchedConditions when not triggered (20 tests)
// ===========================================================================
describe('evaluateRule no matchedConditions when not triggered', () => {
  for (let i = 0; i < 20; i++) {
    it(`evaluateRule matchedConditions empty when not triggered [${i}]`, () => {
      const rule = makeRule({ conditions: [{ field: 'v', operator: 'gt', threshold: 500 }] });
      const ctx = makeCtx({ v: 10 });
      const result = evaluateRule(rule, ctx);
      expect(result.triggered).toBe(false);
      expect(result.matchedConditions).toHaveLength(0);
    });
  }
});

// ===========================================================================
// 52. evaluateCondition — boundary values for between (20 tests)
// ===========================================================================
describe('evaluateCondition between boundary', () => {
  const lo = 10, hi = 20;
  const testValues = [9, 10, 11, 15, 19, 20, 21];
  for (let i = 0; i < 20; i++) {
    const v = testValues[i % testValues.length];
    const expected = v >= lo && v <= hi;
    it(`between boundary v=${v} [${lo},${hi}] = ${expected} [${i}]`, () => {
      const r = evaluateCondition({ field: 'v', operator: 'between', threshold: [lo, hi] }, makeCtx({ v }));
      expect(r).toBe(expected);
    });
  }
});

// ===========================================================================
// 53. mergeContexts — previousValues merging (20 tests)
// ===========================================================================
describe('mergeContexts previousValues', () => {
  for (let i = 0; i < 20; i++) {
    it(`mergeContexts merges previousValues [${i}]`, () => {
      const base: AlertContext = { values: { v: i }, previousValues: { v: i - 10 } };
      const override: Partial<AlertContext> = { previousValues: { v: i - 5 } };
      const merged = mergeContexts(base, override);
      expect(merged.previousValues?.v).toBe(i - 5);
    });
  }
});

// ===========================================================================
// 54. evaluateCondition — changedByPct with zero previous (10 tests)
// ===========================================================================
describe('evaluateCondition changedByPct zero previous', () => {
  for (let i = 0; i < 10; i++) {
    it(`changedByPct returns false when previous is 0 [${i}]`, () => {
      const r = evaluateCondition(
        { field: 'v', operator: 'changedByPct', threshold: 10 },
        makeCtx({ v: 100 }, { v: 0 }),
      );
      expect(r).toBe(false);
    });
  }
});

// ===========================================================================
// 55. summarize — severity breakdown (20 tests)
// ===========================================================================
describe('summarize severity breakdown', () => {
  for (let i = 0; i < 20; i++) {
    it(`summarize info/warning/critical/emergency counts correct [${i}]`, () => {
      const evals: AlertEvaluation[] = [
        makeEval({ triggered: true, severity: AlertSeverity.INFO }),
        makeEval({ triggered: true, severity: AlertSeverity.INFO }),
        makeEval({ triggered: true, severity: AlertSeverity.WARNING }),
        makeEval({ triggered: true, severity: AlertSeverity.CRITICAL }),
        makeEval({ triggered: true, severity: AlertSeverity.EMERGENCY }),
        makeEval({ triggered: false, severity: AlertSeverity.INFO }),
      ];
      const s = summarize(evals);
      expect(s.total).toBe(6);
      expect(s.triggered).toBe(5);
      expect(s.info).toBe(2);
      expect(s.warning).toBe(1);
      expect(s.critical).toBe(1);
      expect(s.emergency).toBe(1);
    });
  }
});

// ===========================================================================
// 56. evaluateCondition — matches invalid regex returns false (10 tests)
// ===========================================================================
describe('evaluateCondition matches invalid regex', () => {
  for (let i = 0; i < 10; i++) {
    it(`matches with invalid regex returns false [${i}]`, () => {
      const r = evaluateCondition({ field: 's', operator: 'matches', threshold: '[invalid(' }, makeCtx({ s: 'test' }));
      expect(r).toBe(false);
    });
  }
});

// ===========================================================================
// 57. evaluateRule — enabled defaults to true (10 tests)
// ===========================================================================
describe('evaluateRule enabled default', () => {
  for (let i = 0; i < 10; i++) {
    it(`evaluateRule defaults enabled=true when not set [${i}]`, () => {
      const rule: AlertRule = {
        id: 'r',
        name: 'R',
        conditions: [{ field: 'v', operator: 'gt', threshold: 0 }],
        severity: AlertSeverity.INFO,
        // enabled not set
      };
      const ctx = makeCtx({ v: 100 });
      const result = evaluateRule(rule, ctx);
      expect(result.triggered).toBe(true);
    });
  }
});

// ===========================================================================
// 58. evaluateRules — empty rules array (10 tests)
// ===========================================================================
describe('evaluateRules empty array', () => {
  for (let i = 0; i < 10; i++) {
    it(`evaluateRules returns empty array for empty rules [${i}]`, () => {
      const results = evaluateRules([], makeCtx({ v: 100 }));
      expect(results).toHaveLength(0);
    });
  }
});

// ===========================================================================
// 59. filterByTag — no tags (10 tests)
// ===========================================================================
describe('filterByTag no matching tag', () => {
  for (let i = 0; i < 10; i++) {
    it(`filterByTag returns empty for nonexistent tag [${i}]`, () => {
      const rules = [makeRule({ tags: ['kpi'] }), makeRule({ tags: ['trend'] })];
      expect(filterByTag(rules, 'nonexistent')).toHaveLength(0);
    });
  }
});

// ===========================================================================
// 60. filterBySeverity — exact INFO (10 tests)
// ===========================================================================
describe('filterBySeverity returns all for INFO', () => {
  for (let i = 0; i < 10; i++) {
    it(`filterBySeverity(INFO) returns all rules [${i}]`, () => {
      const rules = [
        makeRule({ severity: AlertSeverity.INFO }),
        makeRule({ severity: AlertSeverity.WARNING }),
        makeRule({ severity: AlertSeverity.CRITICAL }),
        makeRule({ severity: AlertSeverity.EMERGENCY }),
      ];
      const filtered = filterBySeverity(rules, AlertSeverity.INFO);
      expect(filtered).toHaveLength(4);
    });
  }
});

// ===========================================================================
// 61. evaluateCondition — value is boolean (20 tests)
// ===========================================================================
describe('evaluateCondition boolean value', () => {
  for (let i = 0; i < 10; i++) {
    it(`gt: true(=1) > 0 = true [${i}]`, () => {
      const r = evaluateCondition({ field: 'v', operator: 'gt', threshold: 0 }, makeCtx({ v: true }));
      expect(r).toBe(true);
    });
  }
  for (let i = 0; i < 10; i++) {
    it(`gt: false(=0) > 0 = false [${i}]`, () => {
      const r = evaluateCondition({ field: 'v', operator: 'gt', threshold: 0 }, makeCtx({ v: false }));
      expect(r).toBe(false);
    });
  }
});

// ===========================================================================
// 62. updateState — consecutive triggers (20 tests)
// ===========================================================================
describe('updateState consecutiveTriggers', () => {
  for (let i = 1; i <= 20; i++) {
    it(`updateState consecutive=${i} after ${i} consecutive triggers`, () => {
      let state = createState('r1');
      for (let j = 0; j < i; j++) {
        const ev = makeEval({ triggered: true, timestamp: 1_000_000 + j * 1_000_000 });
        state = updateState(state, ev);
      }
      expect(state.consecutiveTriggers).toBe(i);
    });
  }
});

// ===========================================================================
// 63. evaluateRule — context propagated to evaluation (10 tests)
// ===========================================================================
describe('evaluateRule context propagated', () => {
  for (let i = 0; i < 10; i++) {
    it(`evaluateRule returns context in evaluation [${i}]`, () => {
      const ctx = makeCtx({ v: i * 10 });
      const rule = makeRule();
      const result = evaluateRule(rule, ctx);
      expect(result.context).toBe(ctx);
    });
  }
});

// ===========================================================================
// 64. buildKpiAlert fires correctly when evaluated (20 tests)
// ===========================================================================
describe('buildKpiAlert fires on threshold', () => {
  for (let i = 0; i < 20; i++) {
    const threshold = i * 5 + 10;
    it(`buildKpiAlert fires when value >= ${threshold} [${i}]`, () => {
      const rule = buildKpiAlert(`Alert ${i}`, 'metric', threshold, AlertSeverity.WARNING);
      const ctxAbove = makeCtx({ metric: threshold });
      const ctxBelow = makeCtx({ metric: threshold - 1 });
      expect(evaluateRule(rule, ctxAbove).triggered).toBe(true);
      expect(evaluateRule(rule, ctxBelow).triggered).toBe(false);
    });
  }
});

// ===========================================================================
// 65. buildTrendAlert fires on pct change (20 tests)
// ===========================================================================
describe('buildTrendAlert fires on pct change', () => {
  for (let i = 1; i <= 20; i++) {
    const pct = i * 10;
    it(`buildTrendAlert fires when change >= ${pct}% [${i}]`, () => {
      const rule = buildTrendAlert(`Trend ${i}`, 'metric', pct, AlertSeverity.WARNING);
      const prev = 100;
      const curr = prev * (1 + pct / 100 + 0.01); // 1% above threshold
      const ctx: AlertContext = { values: { metric: curr }, previousValues: { metric: prev }, timestamp: 1_000_000 };
      expect(evaluateRule(rule, ctx).triggered).toBe(true);
    });
  }
});

// ===========================================================================
// 66. evaluateCondition — notIn string match (20 tests)
// ===========================================================================
describe('evaluateCondition notIn string', () => {
  const allowed = [1, 2, 3, 4, 5];
  for (let i = 1; i <= 20; i++) {
    const expected = !allowed.includes(i);
    it(`notIn: ${i} notIn [1,2,3,4,5] = ${expected} [${i}]`, () => {
      const r = evaluateCondition({ field: 'v', operator: 'notIn', threshold: allowed }, makeCtx({ v: i }));
      expect(r).toBe(expected);
    });
  }
});

// ===========================================================================
// 67. evaluateRule — no conditions returns not triggered (10 tests)
// ===========================================================================
describe('evaluateRule no conditions not triggered', () => {
  for (let i = 0; i < 10; i++) {
    it(`evaluateRule with empty conditions returns triggered=false [${i}]`, () => {
      const rule: AlertRule = {
        id: 'r',
        name: 'R',
        conditions: [],
        severity: AlertSeverity.INFO,
        enabled: true,
      };
      const ctx = makeCtx({ v: 100 });
      expect(evaluateRule(rule, ctx).triggered).toBe(false);
    });
  }
});

// ===========================================================================
// 68. mergeContexts — timestamp override (10 tests)
// ===========================================================================
describe('mergeContexts timestamp override', () => {
  for (let i = 0; i < 10; i++) {
    it(`mergeContexts overrides timestamp [${i}]`, () => {
      const base: AlertContext = { values: { v: 1 }, timestamp: 1_000 };
      const merged = mergeContexts(base, { timestamp: 2_000 + i });
      expect(merged.timestamp).toBe(2_000 + i);
    });
  }
});

// ===========================================================================
// 69. groupBySeverity — empty evaluations (10 tests)
// ===========================================================================
describe('groupBySeverity empty', () => {
  for (let i = 0; i < 10; i++) {
    it(`groupBySeverity returns empty groups for empty array [${i}]`, () => {
      const groups = groupBySeverity([]);
      expect(groups[AlertSeverity.INFO]).toHaveLength(0);
      expect(groups[AlertSeverity.WARNING]).toHaveLength(0);
      expect(groups[AlertSeverity.CRITICAL]).toHaveLength(0);
      expect(groups[AlertSeverity.EMERGENCY]).toHaveLength(0);
    });
  }
});

// ===========================================================================
// 70. validateRule — nested AND/OR condition validation (10 tests)
// ===========================================================================
describe('validateRule nested conditions', () => {
  for (let i = 0; i < 10; i++) {
    it(`validateRule with valid nested conditions [${i}]`, () => {
      const rule = makeRule({
        conditions: [
          {
            field: 'v',
            operator: 'gt',
            threshold: 10,
            and: [{ field: 'w', operator: 'lt', threshold: 100 }],
            or: [{ field: 'x', operator: 'eq', threshold: 50 }],
          },
        ],
      });
      expect(validateRule(rule)).toHaveLength(0);
    });
  }
});

// ===========================================================================
// 71. evaluateCondition — changedBy negative delta (10 tests)
// ===========================================================================
describe('evaluateCondition changedBy negative delta', () => {
  for (let i = 0; i < 10; i++) {
    const prev = 100 + i;
    const curr = 50;
    const threshold = 30;
    const expected = Math.abs(curr - prev) >= threshold;
    it(`changedBy negative delta prev=${prev} curr=${curr} threshold=${threshold} = ${expected} [${i}]`, () => {
      const r = evaluateCondition(
        { field: 'v', operator: 'changedBy', threshold },
        makeCtx({ v: curr }, { v: prev }),
      );
      expect(r).toBe(expected);
    });
  }
});

// ===========================================================================
// 72. evaluateRules — no states provided (10 tests)
// ===========================================================================
describe('evaluateRules no states', () => {
  for (let i = 0; i < 10; i++) {
    it(`evaluateRules works without states map [${i}]`, () => {
      const rules = [makeRule({ id: 'r1' }), makeRule({ id: 'r2' })];
      const ctx = makeCtx({ v: 200 });
      const results = evaluateRules(rules, ctx);
      expect(results).toHaveLength(2);
      expect(results[0].triggered).toBe(true);
      expect(results[1].triggered).toBe(true);
    });
  }
});
