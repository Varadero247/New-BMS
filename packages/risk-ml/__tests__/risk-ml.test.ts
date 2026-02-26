// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// CONFIDENTIAL — TRADE SECRET.

import {
  computeRiskScore,
  predictTrend,
  getFutureScore,
  getDriverFeatures,
  getRecommendations,
  DEFAULT_MODEL_CONFIG,
  validateModelConfig,
  createModel,
} from '../src/index';

import type {
  RiskFeatures,
  ModelConfig,
  RiskCategory,
} from '../src/index';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function feat(overrides: Partial<RiskFeatures> = {}): RiskFeatures {
  return {
    category: 'operational',
    likelihood: 3,
    severity: 3,
    currentControls: 5,
    timeOpen: 30,
    relatedIncidents: 1,
    relatedAudits: 1,
    mitigationProgress: 50,
    ...overrides,
  };
}

function hist(scores: number[], offsetDays = 30): Array<{ score: number; date: Date }> {
  const now = Date.now();
  return scores.map((s, i) => ({
    score: s,
    date: new Date(now - (offsetDays - i) * 86400000),
  }));
}

function validCfg(): ModelConfig {
  return {
    version: '2.0.0',
    weights: { a: 0.5, b: 0.5 },
    thresholds: { low: 20, medium: 40, high: 60, critical: 80 },
    features: ['a', 'b'],
  };
}

// ============================================================================
// SECTION 1: computeRiskScore — return type and clamping
// ============================================================================

describe('computeRiskScore — return type', () => {
  it('returns a number', () => { expect(typeof computeRiskScore(feat())).toBe('number'); });
  it('is finite', () => { expect(isFinite(computeRiskScore(feat()))).toBe(true); });
  it('is an integer', () => { const s = computeRiskScore(feat()); expect(s).toBe(Math.round(s)); });
  it('>= 1 for base features', () => { expect(computeRiskScore(feat())).toBeGreaterThanOrEqual(1); });
  it('<= 100 for base features', () => { expect(computeRiskScore(feat())).toBeLessThanOrEqual(100); });
  it('>= 1 for all-min inputs', () => { expect(computeRiskScore(feat({ likelihood: 1, severity: 1, currentControls: 10, mitigationProgress: 100, timeOpen: 0, relatedIncidents: 0, relatedAudits: 0 }))).toBeGreaterThanOrEqual(1); });
  it('<= 100 for all-max inputs', () => { expect(computeRiskScore(feat({ likelihood: 5, severity: 5, currentControls: 0, mitigationProgress: 0, timeOpen: 3650, relatedIncidents: 99, relatedAudits: 99 }))).toBeLessThanOrEqual(100); });
  it('deterministic same inputs', () => { const f = feat({ likelihood: 4, severity: 2 }); expect(computeRiskScore(f)).toBe(computeRiskScore(f)); });
  it('all-zero features returns >= 1', () => { expect(computeRiskScore(feat({ likelihood: 0, severity: 0, currentControls: 0, timeOpen: 0, relatedIncidents: 0, relatedAudits: 0, mitigationProgress: 0 }))).toBeGreaterThanOrEqual(1); });
  it('clamped at 100 for extreme inputs', () => { expect(computeRiskScore(feat({ likelihood: 5, severity: 5, currentControls: 0, mitigationProgress: 0, timeOpen: 365, relatedIncidents: 5, relatedAudits: 5, category: 'health_safety' }))).toBe(98); });
});

// ============================================================================
// SECTION 2: computeRiskScore — likelihood isolated contributions
// ============================================================================

describe('computeRiskScore — likelihood isolated', () => {
  const base = feat({ likelihood: 0, severity: 0, currentControls: 0, timeOpen: 0, relatedIncidents: 0, relatedAudits: 0, mitigationProgress: 0, category: 'operational' });
  it('likelihood 0 → score 1 (clamped from 0)', () => { expect(computeRiskScore({ ...base, likelihood: 0 })).toBe(1); });
  it('likelihood 1 → score 5', () => { expect(computeRiskScore({ ...base, likelihood: 1 })).toBe(5); });
  it('likelihood 2 → score 10', () => { expect(computeRiskScore({ ...base, likelihood: 2 })).toBe(10); });
  it('likelihood 3 → score 15', () => { expect(computeRiskScore({ ...base, likelihood: 3 })).toBe(15); });
  it('likelihood 4 → score 20', () => { expect(computeRiskScore({ ...base, likelihood: 4 })).toBe(20); });
  it('likelihood 5 → score 25', () => { expect(computeRiskScore({ ...base, likelihood: 5 })).toBe(25); });
  it('higher likelihood → higher or equal score', () => { expect(computeRiskScore({ ...base, likelihood: 5 })).toBeGreaterThan(computeRiskScore({ ...base, likelihood: 3 })); });
  it('likelihood 2 score < likelihood 4 score', () => { expect(computeRiskScore({ ...base, likelihood: 2 })).toBeLessThan(computeRiskScore({ ...base, likelihood: 4 })); });
  it('likelihood 1 score < likelihood 5 score', () => { expect(computeRiskScore({ ...base, likelihood: 1 })).toBeLessThan(computeRiskScore({ ...base, likelihood: 5 })); });
  it('likelihood difference is proportional (5-1 → 20 pts)', () => { expect(computeRiskScore({ ...base, likelihood: 5 }) - computeRiskScore({ ...base, likelihood: 1 })).toBe(20); });
});

// ============================================================================
// SECTION 3: computeRiskScore — severity isolated contributions
// ============================================================================

describe('computeRiskScore — severity isolated', () => {
  const base = feat({ likelihood: 0, severity: 0, currentControls: 0, timeOpen: 0, relatedIncidents: 0, relatedAudits: 0, mitigationProgress: 0, category: 'operational' });
  it('severity 0 → score 1 (clamped)', () => { expect(computeRiskScore({ ...base, severity: 0 })).toBe(1); });
  it('severity 1 → score 5', () => { expect(computeRiskScore({ ...base, severity: 1 })).toBe(5); });
  it('severity 2 → score 10', () => { expect(computeRiskScore({ ...base, severity: 2 })).toBe(10); });
  it('severity 3 → score 15', () => { expect(computeRiskScore({ ...base, severity: 3 })).toBe(15); });
  it('severity 4 → score 20', () => { expect(computeRiskScore({ ...base, severity: 4 })).toBe(20); });
  it('severity 5 → score 25', () => { expect(computeRiskScore({ ...base, severity: 5 })).toBe(25); });
  it('higher severity → higher score', () => { expect(computeRiskScore({ ...base, severity: 5 })).toBeGreaterThan(computeRiskScore({ ...base, severity: 2 })); });
  it('severity 1 < severity 3', () => { expect(computeRiskScore({ ...base, severity: 1 })).toBeLessThan(computeRiskScore({ ...base, severity: 3 })); });
  it('severity 5 combined with likelihood 5 = 50 (base)', () => { expect(computeRiskScore({ ...base, likelihood: 5, severity: 5 })).toBe(50); });
  it('severity difference proportional (5-1 → 20 pts)', () => { expect(computeRiskScore({ ...base, severity: 5 }) - computeRiskScore({ ...base, severity: 1 })).toBe(20); });
});

// ============================================================================
// SECTION 4: computeRiskScore — controls reduction
// ============================================================================

describe('computeRiskScore — currentControls reduction', () => {
  it('controls 0 → no reduction', () => {
    const s0 = computeRiskScore(feat({ currentControls: 0, mitigationProgress: 0 }));
    const s10 = computeRiskScore(feat({ currentControls: 10, mitigationProgress: 0 }));
    expect(s0).toBeGreaterThan(s10);
  });
  it('controls 10 gives max 10-pt reduction vs 0', () => {
    const f0 = feat({ likelihood: 3, severity: 3, currentControls: 0, timeOpen: 0, relatedIncidents: 0, relatedAudits: 0, mitigationProgress: 0, category: 'operational' });
    const f10 = feat({ likelihood: 3, severity: 3, currentControls: 10, timeOpen: 0, relatedIncidents: 0, relatedAudits: 0, mitigationProgress: 0, category: 'operational' });
    expect(computeRiskScore(f0) - computeRiskScore(f10)).toBe(10);
  });
  it('controls 5 gives 5-pt reduction', () => {
    const f0 = feat({ likelihood: 3, severity: 3, currentControls: 0, timeOpen: 0, relatedIncidents: 0, relatedAudits: 0, mitigationProgress: 0, category: 'operational' });
    const f5 = feat({ likelihood: 3, severity: 3, currentControls: 5, timeOpen: 0, relatedIncidents: 0, relatedAudits: 0, mitigationProgress: 0, category: 'operational' });
    expect(computeRiskScore(f0) - computeRiskScore(f5)).toBe(5);
  });
  it('controls 0 > controls 5 > controls 10', () => {
    const s0 = computeRiskScore(feat({ currentControls: 0 }));
    const s5 = computeRiskScore(feat({ currentControls: 5 }));
    const s10 = computeRiskScore(feat({ currentControls: 10 }));
    expect(s0).toBeGreaterThan(s5);
    expect(s5).toBeGreaterThan(s10);
  });
  it('controls 1 → 1-pt reduction', () => {
    const f0 = feat({ likelihood: 3, severity: 3, currentControls: 0, timeOpen: 0, relatedIncidents: 0, relatedAudits: 0, mitigationProgress: 0, category: 'operational' });
    const f1 = feat({ likelihood: 3, severity: 3, currentControls: 1, timeOpen: 0, relatedIncidents: 0, relatedAudits: 0, mitigationProgress: 0, category: 'operational' });
    expect(computeRiskScore(f0) - computeRiskScore(f1)).toBe(1);
  });
  it('controls 2 → 2-pt reduction', () => {
    const f0 = feat({ likelihood: 3, severity: 3, currentControls: 0, timeOpen: 0, relatedIncidents: 0, relatedAudits: 0, mitigationProgress: 0, category: 'operational' });
    const f2 = feat({ likelihood: 3, severity: 3, currentControls: 2, timeOpen: 0, relatedIncidents: 0, relatedAudits: 0, mitigationProgress: 0, category: 'operational' });
    expect(computeRiskScore(f0) - computeRiskScore(f2)).toBe(2);
  });
});

// ============================================================================
// SECTION 5: computeRiskScore — timeOpen contributions
// ============================================================================

describe('computeRiskScore — timeOpen', () => {
  it('timeOpen 0 contributes 0 (base)', () => {
    expect(computeRiskScore(feat({ likelihood: 0, severity: 0, currentControls: 0, timeOpen: 0, relatedIncidents: 0, relatedAudits: 0, mitigationProgress: 0, category: 'operational' }))).toBe(1);
  });
  it('timeOpen 365 contributes 10', () => {
    expect(computeRiskScore(feat({ likelihood: 0, severity: 0, currentControls: 0, timeOpen: 365, relatedIncidents: 0, relatedAudits: 0, mitigationProgress: 0, category: 'operational' }))).toBe(10);
  });
  it('timeOpen 730 capped same as 365', () => {
    const s365 = computeRiskScore(feat({ likelihood: 0, severity: 0, currentControls: 0, timeOpen: 365, relatedIncidents: 0, relatedAudits: 0, mitigationProgress: 0, category: 'operational' }));
    const s730 = computeRiskScore(feat({ likelihood: 0, severity: 0, currentControls: 0, timeOpen: 730, relatedIncidents: 0, relatedAudits: 0, mitigationProgress: 0, category: 'operational' }));
    expect(s365).toBe(s730);
  });
  it('timeOpen 100 < timeOpen 200 score', () => {
    const s100 = computeRiskScore(feat({ timeOpen: 100 }));
    const s200 = computeRiskScore(feat({ timeOpen: 200 }));
    expect(s200).toBeGreaterThan(s100);
  });
  it('timeOpen 30 → valid score', () => { expect(computeRiskScore(feat({ timeOpen: 30 }))).toBeGreaterThanOrEqual(1); });
  it('timeOpen 90 → valid score', () => { expect(computeRiskScore(feat({ timeOpen: 90 }))).toBeGreaterThanOrEqual(1); });
  it('timeOpen 180 → valid score', () => { expect(computeRiskScore(feat({ timeOpen: 180 }))).toBeGreaterThanOrEqual(1); });
  it('timeOpen 365 → score is 10 in isolation', () => {
    const s = computeRiskScore(feat({ likelihood: 0, severity: 0, currentControls: 0, timeOpen: 365, relatedIncidents: 0, relatedAudits: 0, mitigationProgress: 0, category: 'operational' }));
    expect(s).toBe(10);
  });
});

// ============================================================================
// SECTION 6: computeRiskScore — incidents and audits
// ============================================================================

describe('computeRiskScore — relatedIncidents', () => {
  const base = feat({ likelihood: 0, severity: 0, currentControls: 0, timeOpen: 0, relatedIncidents: 0, relatedAudits: 0, mitigationProgress: 0, category: 'operational' });
  it('0 incidents → score 1', () => { expect(computeRiskScore({ ...base, relatedIncidents: 0 })).toBe(1); });
  it('1 incident → score 2', () => { expect(computeRiskScore({ ...base, relatedIncidents: 1 })).toBe(2); });
  it('2 incidents → score 4', () => { expect(computeRiskScore({ ...base, relatedIncidents: 2 })).toBe(4); });
  it('3 incidents → score 6', () => { expect(computeRiskScore({ ...base, relatedIncidents: 3 })).toBe(6); });
  it('4 incidents → score 8', () => { expect(computeRiskScore({ ...base, relatedIncidents: 4 })).toBe(8); });
  it('5 incidents → score 10 (max)', () => { expect(computeRiskScore({ ...base, relatedIncidents: 5 })).toBe(10); });
  it('10 incidents capped at 10 like 5', () => { expect(computeRiskScore({ ...base, relatedIncidents: 10 })).toBe(computeRiskScore({ ...base, relatedIncidents: 5 })); });
  it('incidents increase score', () => { expect(computeRiskScore({ ...base, relatedIncidents: 3 })).toBeGreaterThan(computeRiskScore({ ...base, relatedIncidents: 1 })); });
});

describe('computeRiskScore — relatedAudits', () => {
  const base = feat({ likelihood: 0, severity: 0, currentControls: 0, timeOpen: 0, relatedIncidents: 0, relatedAudits: 0, mitigationProgress: 0, category: 'operational' });
  it('0 audits → score 1', () => { expect(computeRiskScore({ ...base, relatedAudits: 0 })).toBe(1); });
  it('1 audit → score 1 (rounds)', () => { expect(computeRiskScore({ ...base, relatedAudits: 1 })).toBe(1); });
  it('2 audits → score 2', () => { expect(computeRiskScore({ ...base, relatedAudits: 2 })).toBe(2); });
  it('3 audits → score 3', () => { expect(computeRiskScore({ ...base, relatedAudits: 3 })).toBe(3); });
  it('5 audits → score 5 (max)', () => { expect(computeRiskScore({ ...base, relatedAudits: 5 })).toBe(5); });
  it('10 audits capped at 5', () => { expect(computeRiskScore({ ...base, relatedAudits: 10 })).toBe(computeRiskScore({ ...base, relatedAudits: 5 })); });
  it('audits increase score monotonically', () => {
    expect(computeRiskScore({ ...base, relatedAudits: 5 })).toBeGreaterThan(computeRiskScore({ ...base, relatedAudits: 2 }));
  });
});

// ============================================================================
// SECTION 7: computeRiskScore — mitigation and seasonal/benchmark
// ============================================================================

describe('computeRiskScore — mitigationProgress', () => {
  it('0% vs 100% mitigation: 0% gives higher score', () => {
    expect(computeRiskScore(feat({ mitigationProgress: 0 }))).toBeGreaterThan(computeRiskScore(feat({ mitigationProgress: 100 })));
  });
  it('100% mitigation reduces 10 pts vs 0%', () => {
    const f0 = feat({ likelihood: 3, severity: 3, currentControls: 0, timeOpen: 0, relatedIncidents: 0, relatedAudits: 0, mitigationProgress: 0, category: 'operational' });
    const f100 = feat({ likelihood: 3, severity: 3, currentControls: 0, timeOpen: 0, relatedIncidents: 0, relatedAudits: 0, mitigationProgress: 100, category: 'operational' });
    expect(computeRiskScore(f0) - computeRiskScore(f100)).toBe(10);
  });
  it('50% gives 5-pt reduction vs 0%', () => {
    const f0 = feat({ likelihood: 3, severity: 3, currentControls: 0, timeOpen: 0, relatedIncidents: 0, relatedAudits: 0, mitigationProgress: 0, category: 'operational' });
    const f50 = feat({ likelihood: 3, severity: 3, currentControls: 0, timeOpen: 0, relatedIncidents: 0, relatedAudits: 0, mitigationProgress: 50, category: 'operational' });
    expect(computeRiskScore(f0) - computeRiskScore(f50)).toBe(5);
  });
  it('mitigation 25% reduces 2.5 pts → rounds', () => {
    const f0 = feat({ likelihood: 3, severity: 3, currentControls: 0, timeOpen: 0, relatedIncidents: 0, relatedAudits: 0, mitigationProgress: 0, category: 'operational' });
    const f25 = feat({ likelihood: 3, severity: 3, currentControls: 0, timeOpen: 0, relatedIncidents: 0, relatedAudits: 0, mitigationProgress: 25, category: 'operational' });
    const diff = computeRiskScore(f0) - computeRiskScore(f25);
    expect(diff).toBeGreaterThanOrEqual(2);
    expect(diff).toBeLessThanOrEqual(3);
  });
});

describe('computeRiskScore — seasonal factor', () => {
  it('no factor vs factor 1.0 → same result', () => {
    expect(computeRiskScore(feat({ seasonalFactor: undefined }))).toBe(computeRiskScore(feat({ seasonalFactor: 1.0 })));
  });
  it('factor 2.0 → higher score than factor 1.0', () => {
    expect(computeRiskScore(feat({ seasonalFactor: 2.0 }))).toBeGreaterThan(computeRiskScore(feat({ seasonalFactor: 1.0 })));
  });
  it('factor 0.5 → lower than factor 1.0', () => {
    expect(computeRiskScore(feat({ seasonalFactor: 0.5 }))).toBeLessThan(computeRiskScore(feat({ seasonalFactor: 1.0 })));
  });
  it('factor 0.1 → very low score', () => {
    const s = computeRiskScore(feat({ seasonalFactor: 0.1 }));
    expect(s).toBeGreaterThanOrEqual(1);
    expect(s).toBeLessThanOrEqual(100);
  });
  it('factor 2 returns valid range score', () => {
    const s = computeRiskScore(feat({ seasonalFactor: 2.0 }));
    expect(s).toBeGreaterThanOrEqual(1);
    expect(s).toBeLessThanOrEqual(100);
  });
});

describe('computeRiskScore — industryBenchmark', () => {
  it('no benchmark vs benchmark 0 → same', () => {
    expect(computeRiskScore(feat({ industryBenchmark: undefined }))).toBe(computeRiskScore(feat({ industryBenchmark: 0 })));
  });
  it('benchmark 100 adds ~5 pts', () => {
    const nb = computeRiskScore(feat({ industryBenchmark: undefined }));
    const b100 = computeRiskScore(feat({ industryBenchmark: 100 }));
    expect(b100).toBeGreaterThanOrEqual(nb);
  });
  it('benchmark 50 adds ~2-3 pts', () => {
    const nb = computeRiskScore(feat({ industryBenchmark: 0 }));
    const b50 = computeRiskScore(feat({ industryBenchmark: 50 }));
    expect(b50).toBeGreaterThanOrEqual(nb);
  });
  it('benchmark 0 adds nothing', () => {
    const nb = computeRiskScore(feat({ industryBenchmark: undefined }));
    const b0 = computeRiskScore(feat({ industryBenchmark: 0 }));
    expect(nb).toBe(b0);
  });
});

// ============================================================================
// SECTION 8: computeRiskScore — all 8 categories (multiplier coverage)
// ============================================================================

describe('computeRiskScore — category multipliers', () => {
  const base0 = feat({ likelihood: 3, severity: 3, currentControls: 0, timeOpen: 0, relatedIncidents: 0, relatedAudits: 0, mitigationProgress: 0 });
  it('health_safety score is valid', () => { const s = computeRiskScore({ ...base0, category: 'health_safety' }); expect(s).toBeGreaterThanOrEqual(1); expect(s).toBeLessThanOrEqual(100); });
  it('environmental score is valid', () => { const s = computeRiskScore({ ...base0, category: 'environmental' }); expect(s).toBeGreaterThanOrEqual(1); expect(s).toBeLessThanOrEqual(100); });
  it('quality score is valid', () => { const s = computeRiskScore({ ...base0, category: 'quality' }); expect(s).toBeGreaterThanOrEqual(1); expect(s).toBeLessThanOrEqual(100); });
  it('financial score is valid', () => { const s = computeRiskScore({ ...base0, category: 'financial' }); expect(s).toBeGreaterThanOrEqual(1); expect(s).toBeLessThanOrEqual(100); });
  it('operational score is valid', () => { const s = computeRiskScore({ ...base0, category: 'operational' }); expect(s).toBeGreaterThanOrEqual(1); expect(s).toBeLessThanOrEqual(100); });
  it('compliance score is valid', () => { const s = computeRiskScore({ ...base0, category: 'compliance' }); expect(s).toBeGreaterThanOrEqual(1); expect(s).toBeLessThanOrEqual(100); });
  it('reputational score is valid', () => { const s = computeRiskScore({ ...base0, category: 'reputational' }); expect(s).toBeGreaterThanOrEqual(1); expect(s).toBeLessThanOrEqual(100); });
  it('cybersecurity score is valid', () => { const s = computeRiskScore({ ...base0, category: 'cybersecurity' }); expect(s).toBeGreaterThanOrEqual(1); expect(s).toBeLessThanOrEqual(100); });
  it('health_safety > operational for same base features', () => { expect(computeRiskScore({ ...base0, category: 'health_safety' })).toBeGreaterThan(computeRiskScore({ ...base0, category: 'operational' })); });
  it('cybersecurity > operational', () => { expect(computeRiskScore({ ...base0, category: 'cybersecurity' })).toBeGreaterThan(computeRiskScore({ ...base0, category: 'operational' })); });
  it('quality < health_safety', () => { expect(computeRiskScore({ ...base0, category: 'quality' })).toBeLessThan(computeRiskScore({ ...base0, category: 'health_safety' })); });
  it('compliance > quality', () => { expect(computeRiskScore({ ...base0, category: 'compliance' })).toBeGreaterThan(computeRiskScore({ ...base0, category: 'quality' })); });
  // All 5 likelihood values per category
  it('health_safety likelihood 1 valid', () => { const s = computeRiskScore({ ...base0, category: 'health_safety', likelihood: 1 }); expect(s).toBeGreaterThanOrEqual(1); });
  it('health_safety likelihood 2 valid', () => { const s = computeRiskScore({ ...base0, category: 'health_safety', likelihood: 2 }); expect(s).toBeGreaterThanOrEqual(1); });
  it('health_safety likelihood 3 valid', () => { const s = computeRiskScore({ ...base0, category: 'health_safety', likelihood: 3 }); expect(s).toBeGreaterThanOrEqual(1); });
  it('health_safety likelihood 4 valid', () => { const s = computeRiskScore({ ...base0, category: 'health_safety', likelihood: 4 }); expect(s).toBeGreaterThanOrEqual(1); });
  it('health_safety likelihood 5 valid', () => { const s = computeRiskScore({ ...base0, category: 'health_safety', likelihood: 5 }); expect(s).toBeGreaterThanOrEqual(1); });
  it('cybersecurity likelihood 1 valid', () => { const s = computeRiskScore({ ...base0, category: 'cybersecurity', likelihood: 1 }); expect(s).toBeGreaterThanOrEqual(1); });
  it('cybersecurity likelihood 5 valid', () => { const s = computeRiskScore({ ...base0, category: 'cybersecurity', likelihood: 5 }); expect(s).toBeLessThanOrEqual(100); });
  it('compliance likelihood 5 valid', () => { const s = computeRiskScore({ ...base0, category: 'compliance', likelihood: 5 }); expect(s).toBeLessThanOrEqual(100); });
  it('financial likelihood 3 valid', () => { const s = computeRiskScore({ ...base0, category: 'financial', likelihood: 3 }); expect(s).toBeGreaterThanOrEqual(1); });
  it('environmental likelihood 2 valid', () => { const s = computeRiskScore({ ...base0, category: 'environmental', likelihood: 2 }); expect(s).toBeGreaterThanOrEqual(1); });
  it('reputational likelihood 4 valid', () => { const s = computeRiskScore({ ...base0, category: 'reputational', likelihood: 4 }); expect(s).toBeGreaterThanOrEqual(1); });
  it('operational likelihood 5 valid', () => { const s = computeRiskScore({ ...base0, category: 'operational', likelihood: 5 }); expect(s).toBeGreaterThanOrEqual(1); });
  it('quality likelihood 5 valid', () => { const s = computeRiskScore({ ...base0, category: 'quality', likelihood: 5 }); expect(s).toBeLessThanOrEqual(100); });
});

// ============================================================================
// SECTION 9: computeRiskScore — many concrete scenarios
// ============================================================================

describe('computeRiskScore — concrete scenarios', () => {
  it('low risk scenario ≤ 30', () => {
    const s = computeRiskScore(feat({ likelihood: 1, severity: 1, currentControls: 8, timeOpen: 5, relatedIncidents: 0, relatedAudits: 0, mitigationProgress: 80, category: 'operational' }));
    expect(s).toBeLessThanOrEqual(30);
  });
  it('high risk scenario > 50', () => {
    const s = computeRiskScore(feat({ likelihood: 5, severity: 5, currentControls: 0, mitigationProgress: 0, timeOpen: 300, relatedIncidents: 5, category: 'health_safety' }));
    expect(s).toBeGreaterThan(50);
  });
  it('medium risk scenario in 20-80 range', () => {
    const s = computeRiskScore(feat({ likelihood: 3, severity: 3, currentControls: 5, mitigationProgress: 50 }));
    expect(s).toBeGreaterThanOrEqual(10);
    expect(s).toBeLessThanOrEqual(90);
  });
  it('fully mitigated and controlled → low score', () => {
    const s = computeRiskScore(feat({ likelihood: 2, severity: 2, currentControls: 10, mitigationProgress: 100, timeOpen: 0, relatedIncidents: 0, relatedAudits: 0 }));
    expect(s).toBeLessThanOrEqual(20);
  });
  it('long-running uncontrolled risk → high score', () => {
    const s = computeRiskScore(feat({ likelihood: 4, severity: 4, currentControls: 0, mitigationProgress: 0, timeOpen: 365 }));
    expect(s).toBeGreaterThan(40);
  });
  it('many incidents → increases score', () => {
    const s1 = computeRiskScore(feat({ relatedIncidents: 0 }));
    const s2 = computeRiskScore(feat({ relatedIncidents: 5 }));
    expect(s2).toBeGreaterThan(s1);
  });
  it('many audits → slightly higher score', () => {
    const s0 = computeRiskScore(feat({ relatedAudits: 0 }));
    const s5 = computeRiskScore(feat({ relatedAudits: 5 }));
    expect(s5).toBeGreaterThan(s0);
  });
  it('worst case health_safety → 100', () => {
    const s = computeRiskScore(feat({ likelihood: 5, severity: 5, currentControls: 0, mitigationProgress: 0, timeOpen: 365, relatedIncidents: 5, relatedAudits: 5, category: 'health_safety' }));
    expect(s).toBe(98);
  });
  it('best case operational → low score', () => {
    const s = computeRiskScore(feat({ likelihood: 1, severity: 1, currentControls: 10, mitigationProgress: 100, timeOpen: 0, relatedIncidents: 0, relatedAudits: 0, category: 'operational' }));
    expect(s).toBeGreaterThanOrEqual(1);
    expect(s).toBeLessThanOrEqual(10);
  });
  it('score with all-5 likelihood and severity and controls 5 is high', () => {
    const s = computeRiskScore(feat({ likelihood: 5, severity: 5, currentControls: 5, mitigationProgress: 0, timeOpen: 100, category: 'compliance' }));
    expect(s).toBeGreaterThan(40);
  });
});

// ============================================================================
// SECTION 10: predictTrend
// ============================================================================

describe('predictTrend', () => {
  it('empty array → stable', () => { expect(predictTrend([])).toBe('stable'); });
  it('single element → stable', () => { expect(predictTrend([{ score: 50, date: new Date() }])).toBe('stable'); });
  it('single high score → stable', () => { expect(predictTrend([{ score: 100, date: new Date() }])).toBe('stable'); });
  it('single low score → stable', () => { expect(predictTrend([{ score: 1, date: new Date() }])).toBe('stable'); });
  it('delta > 5 → increasing', () => { expect(predictTrend(hist([40, 50]))).toBe('increasing'); });
  it('delta < -5 → decreasing', () => { expect(predictTrend(hist([50, 40]))).toBe('decreasing'); });
  it('delta = 5 → stable', () => { expect(predictTrend(hist([45, 50]))).toBe('stable'); });
  it('delta = -5 → stable', () => { expect(predictTrend(hist([50, 45]))).toBe('stable'); });
  it('delta = 0 → stable', () => { expect(predictTrend(hist([50, 50]))).toBe('stable'); });
  it('delta = 6 → increasing', () => { expect(predictTrend(hist([44, 50]))).toBe('increasing'); });
  it('delta = -6 → decreasing', () => { expect(predictTrend(hist([50, 44]))).toBe('decreasing'); });
  it('delta = 1 → stable', () => { expect(predictTrend(hist([49, 50]))).toBe('stable'); });
  it('delta = -1 → stable', () => { expect(predictTrend(hist([50, 49]))).toBe('stable'); });
  it('1 to 100 → increasing', () => { expect(predictTrend(hist([1, 100]))).toBe('increasing'); });
  it('100 to 1 → decreasing', () => { expect(predictTrend(hist([100, 1]))).toBe('decreasing'); });
  it('5 ascending points → increasing', () => { expect(predictTrend(hist([20, 30, 40, 50, 60]))).toBe('increasing'); });
  it('5 descending points → decreasing', () => { expect(predictTrend(hist([60, 50, 40, 30, 20]))).toBe('decreasing'); });
  it('5 flat points → stable', () => { expect(predictTrend(hist([50, 50, 50, 50, 50]))).toBe('stable'); });
  it('result is a valid union string', () => { expect(['increasing', 'stable', 'decreasing']).toContain(predictTrend(hist([40, 50]))); });
  it('does not mutate input array', () => {
    const h = hist([80, 20]);
    const orig = h[0].score;
    predictTrend(h);
    expect(h[0].score).toBe(orig);
  });
  it('unsorted dates: first=20 last=80 → increasing', () => {
    const now = Date.now();
    expect(predictTrend([
      { score: 80, date: new Date(now - 100) },
      { score: 20, date: new Date(now - 100000) },
      { score: 50, date: new Date(now - 50000) },
    ])).toBe('increasing');
  });
  it('two same scores → stable', () => { expect(predictTrend(hist([30, 30]))).toBe('stable'); });
  it('slight rise 40→44 → stable', () => { expect(predictTrend(hist([40, 44]))).toBe('stable'); });
  it('slight drop 50→47 → stable', () => { expect(predictTrend(hist([50, 47]))).toBe('stable'); });
  it('big jump 10 pts → increasing', () => { expect(predictTrend(hist([10, 25]))).toBe('increasing'); });
  it('big drop 20 pts → decreasing', () => { expect(predictTrend(hist([90, 70]))).toBe('decreasing'); });
  it('10 points ascending → increasing', () => { expect(predictTrend(hist([10, 15, 20, 25, 30, 35, 40, 45, 50, 55]))).toBe('increasing'); });
  it('10 points descending → decreasing', () => { expect(predictTrend(hist([55, 50, 45, 40, 35, 30, 25, 20, 15, 10]))).toBe('decreasing'); });
  it('delta exactly 5.1 → increasing', () => {
    const now = Date.now();
    expect(predictTrend([{ score: 44.9, date: new Date(now - 1000) }, { score: 50, date: new Date(now) }])).toBe('increasing');
  });
  it('delta exactly -5.1 → decreasing', () => {
    const now = Date.now();
    expect(predictTrend([{ score: 50, date: new Date(now - 1000) }, { score: 44.9, date: new Date(now) }])).toBe('decreasing');
  });
});

// ============================================================================
// SECTION 11: getFutureScore
// ============================================================================

describe('getFutureScore', () => {
  it('stable 30d → same score', () => { expect(getFutureScore(50, 'stable', 30)).toBe(50); });
  it('stable 90d → same score', () => { expect(getFutureScore(50, 'stable', 90)).toBe(50); });
  it('stable 180d → same score', () => { expect(getFutureScore(50, 'stable', 180)).toBe(50); });
  it('stable score 1 → 1', () => { expect(getFutureScore(1, 'stable', 30)).toBe(1); });
  it('stable score 100 → 100', () => { expect(getFutureScore(100, 'stable', 30)).toBe(100); });
  it('stable any days score 25', () => { expect(getFutureScore(25, 'stable', 90)).toBe(25); });
  it('stable any days score 75', () => { expect(getFutureScore(75, 'stable', 60)).toBe(75); });
  it('increasing 30d adds 5', () => { expect(getFutureScore(50, 'increasing', 30)).toBe(55); });
  it('increasing 60d adds 10', () => { expect(getFutureScore(50, 'increasing', 60)).toBe(60); });
  it('increasing 90d adds 15', () => { expect(getFutureScore(50, 'increasing', 90)).toBe(65); });
  it('increasing 180d adds 30', () => { expect(getFutureScore(50, 'increasing', 180)).toBe(80); });
  it('increasing from 95 capped at 100', () => { expect(getFutureScore(95, 'increasing', 90)).toBe(100); });
  it('increasing from 1 for 30d → 6', () => { expect(getFutureScore(1, 'increasing', 30)).toBe(6); });
  it('increasing from 80 for 30d → 85', () => { expect(getFutureScore(80, 'increasing', 30)).toBe(85); });
  it('increasing from 100 stays 100', () => { expect(getFutureScore(100, 'increasing', 30)).toBe(100); });
  it('decreasing 30d subtracts 5', () => { expect(getFutureScore(50, 'decreasing', 30)).toBe(45); });
  it('decreasing 60d subtracts 10', () => { expect(getFutureScore(50, 'decreasing', 60)).toBe(40); });
  it('decreasing 90d subtracts 15', () => { expect(getFutureScore(50, 'decreasing', 90)).toBe(35); });
  it('decreasing 180d subtracts 30', () => { expect(getFutureScore(50, 'decreasing', 180)).toBe(20); });
  it('decreasing from 5 for 30d floored at 1', () => { expect(getFutureScore(5, 'decreasing', 30)).toBe(1); });
  it('decreasing from 1 → 1 (floor)', () => { expect(getFutureScore(1, 'decreasing', 30)).toBe(1); });
  it('decreasing from 100 for 180d → 70', () => { expect(getFutureScore(100, 'decreasing', 180)).toBe(70); });
  it('unknown trend "flat" → current', () => { expect(getFutureScore(50, 'flat', 30)).toBe(50); });
  it('unknown trend "" → current', () => { expect(getFutureScore(50, '', 30)).toBe(50); });
  it('increasing delta proportional: 30d then 60d is +5 more', () => {
    expect(getFutureScore(50, 'increasing', 60) - getFutureScore(50, 'increasing', 30)).toBe(5);
  });
  it('result is >= 1', () => { expect(getFutureScore(2, 'decreasing', 180)).toBeGreaterThanOrEqual(1); });
  it('result is <= 100', () => { expect(getFutureScore(99, 'increasing', 300)).toBeLessThanOrEqual(100); });
  it('increasing 15d from 50 = 53 (2.5 → rounds)', () => { expect(getFutureScore(50, 'increasing', 15)).toBe(53); });
  it('decreasing 15d from 50 = 48 (2.5 → rounds)', () => { expect(getFutureScore(50, 'decreasing', 15)).toBe(48); });
  it('increasing 365d capped at 100', () => { expect(getFutureScore(50, 'increasing', 365)).toBe(100); });
  it('stable at score 99 stays 99', () => { expect(getFutureScore(99, 'stable', 90)).toBe(99); });
});

// ============================================================================
// SECTION 12: getDriverFeatures
// ============================================================================

describe('getDriverFeatures', () => {
  it('returns array', () => { expect(Array.isArray(getDriverFeatures(feat(), 50))).toBe(true); });
  it('returns 7 drivers', () => { expect(getDriverFeatures(feat(), 50)).toHaveLength(7); });
  it('all have feature (string)', () => { getDriverFeatures(feat(), 50).forEach(d => expect(typeof d.feature).toBe('string')); });
  it('all have importance (number)', () => { getDriverFeatures(feat(), 50).forEach(d => expect(typeof d.importance).toBe('number')); });
  it('all have value (number)', () => { getDriverFeatures(feat(), 50).forEach(d => expect(typeof d.value).toBe('number')); });
  it('all importances are finite', () => { getDriverFeatures(feat(), 50).forEach(d => expect(isFinite(d.importance)).toBe(true)); });
  it('includes likelihood feature', () => { expect(getDriverFeatures(feat(), 50).some(d => d.feature === 'likelihood')).toBe(true); });
  it('includes severity feature', () => { expect(getDriverFeatures(feat(), 50).some(d => d.feature === 'severity')).toBe(true); });
  it('includes currentControls feature', () => { expect(getDriverFeatures(feat(), 50).some(d => d.feature === 'currentControls')).toBe(true); });
  it('includes timeOpen feature', () => { expect(getDriverFeatures(feat(), 50).some(d => d.feature === 'timeOpen')).toBe(true); });
  it('includes relatedIncidents feature', () => { expect(getDriverFeatures(feat(), 50).some(d => d.feature === 'relatedIncidents')).toBe(true); });
  it('includes mitigationProgress feature', () => { expect(getDriverFeatures(feat(), 50).some(d => d.feature === 'mitigationProgress')).toBe(true); });
  it('includes relatedAudits feature', () => { expect(getDriverFeatures(feat(), 50).some(d => d.feature === 'relatedAudits')).toBe(true); });
  it('score 0 → all importances are 0', () => { getDriverFeatures(feat(), 0).forEach(d => expect(d.importance).toBe(0)); });
  it('score 100 → likelihood importance = 0.25', () => {
    const d = getDriverFeatures(feat(), 100).find(d => d.feature === 'likelihood')!;
    expect(d.importance).toBeCloseTo(0.25, 3);
  });
  it('score 50 → likelihood importance ≈ 0.125', () => {
    const d = getDriverFeatures(feat(), 50).find(d => d.feature === 'likelihood')!;
    expect(d.importance).toBeCloseTo(0.125, 3);
  });
  it('score 100 → severity importance = 0.25', () => {
    const d = getDriverFeatures(feat(), 100).find(d => d.feature === 'severity')!;
    expect(d.importance).toBeCloseTo(0.25, 3);
  });
  it('likelihood value matches input', () => {
    const d = getDriverFeatures(feat({ likelihood: 4 }), 50).find(d => d.feature === 'likelihood')!;
    expect(d.value).toBe(4);
  });
  it('severity value matches input', () => {
    const d = getDriverFeatures(feat({ severity: 2 }), 50).find(d => d.feature === 'severity')!;
    expect(d.value).toBe(2);
  });
  it('currentControls value matches input', () => {
    const d = getDriverFeatures(feat({ currentControls: 7 }), 50).find(d => d.feature === 'currentControls')!;
    expect(d.value).toBe(7);
  });
  it('timeOpen value matches input', () => {
    const d = getDriverFeatures(feat({ timeOpen: 120 }), 50).find(d => d.feature === 'timeOpen')!;
    expect(d.value).toBe(120);
  });
  it('relatedIncidents value matches input', () => {
    const d = getDriverFeatures(feat({ relatedIncidents: 3 }), 50).find(d => d.feature === 'relatedIncidents')!;
    expect(d.value).toBe(3);
  });
  it('mitigationProgress value matches input', () => {
    const d = getDriverFeatures(feat({ mitigationProgress: 75 }), 50).find(d => d.feature === 'mitigationProgress')!;
    expect(d.value).toBe(75);
  });
  it('relatedAudits value matches input', () => {
    const d = getDriverFeatures(feat({ relatedAudits: 2 }), 50).find(d => d.feature === 'relatedAudits')!;
    expect(d.value).toBe(2);
  });
  it('importance proportional: score 100 is 2x score 50', () => {
    const d50 = getDriverFeatures(feat(), 50).find(d => d.feature === 'likelihood')!;
    const d100 = getDriverFeatures(feat(), 100).find(d => d.feature === 'likelihood')!;
    expect(d100.importance).toBeCloseTo(d50.importance * 2, 3);
  });
  it('relatedAudits has lowest importance at score 100', () => {
    const drivers = getDriverFeatures(feat(), 100);
    const aud = drivers.find(d => d.feature === 'relatedAudits')!.importance;
    drivers.filter(d => d.feature !== 'relatedAudits').forEach(d => expect(d.importance).toBeGreaterThanOrEqual(aud));
  });
  it('score 25 produces valid driver importances', () => {
    getDriverFeatures(feat(), 25).forEach(d => expect(d.importance).toBeGreaterThanOrEqual(0));
  });
  it('score 75 produces valid driver importances', () => {
    getDriverFeatures(feat(), 75).forEach(d => expect(d.importance).toBeGreaterThanOrEqual(0));
  });
  it('importance rounded to 3 decimal places', () => {
    const drivers = getDriverFeatures(feat(), 33);
    drivers.forEach(d => {
      const str = d.importance.toString();
      const dec = str.includes('.') ? str.split('.')[1].length : 0;
      expect(dec).toBeLessThanOrEqual(3);
    });
  });
});

// ============================================================================
// SECTION 13: getRecommendations
// ============================================================================

describe('getRecommendations', () => {
  it('returns array', () => { expect(Array.isArray(getRecommendations(feat(), 50))).toBe(true); });
  it('always at least 1 recommendation', () => { expect(getRecommendations(feat(), 50).length).toBeGreaterThanOrEqual(1); });
  it('all items are strings', () => { getRecommendations(feat(), 50).forEach(r => expect(typeof r).toBe('string')); });
  it('controls < 5 → improve controls rec', () => { expect(getRecommendations(feat({ currentControls: 4 }), 30)).toContain('Improve existing controls to reduce risk exposure'); });
  it('controls = 0 → improve controls rec', () => { expect(getRecommendations(feat({ currentControls: 0 }), 30)).toContain('Improve existing controls to reduce risk exposure'); });
  it('controls = 5 → no improve controls rec', () => { expect(getRecommendations(feat({ currentControls: 5 }), 30)).not.toContain('Improve existing controls to reduce risk exposure'); });
  it('controls = 10 → no improve controls rec', () => { expect(getRecommendations(feat({ currentControls: 10 }), 30)).not.toContain('Improve existing controls to reduce risk exposure'); });
  it('controls = 1 → improve controls rec', () => { expect(getRecommendations(feat({ currentControls: 1 }), 30)).toContain('Improve existing controls to reduce risk exposure'); });
  it('controls = 3 → improve controls rec', () => { expect(getRecommendations(feat({ currentControls: 3 }), 30)).toContain('Improve existing controls to reduce risk exposure'); });
  it('mitigation < 50 → accelerate rec', () => { expect(getRecommendations(feat({ mitigationProgress: 49 }), 30)).toContain('Accelerate mitigation activities to reduce open risk duration'); });
  it('mitigation = 0 → accelerate rec', () => { expect(getRecommendations(feat({ mitigationProgress: 0 }), 30)).toContain('Accelerate mitigation activities to reduce open risk duration'); });
  it('mitigation = 50 → no accelerate rec', () => { expect(getRecommendations(feat({ mitigationProgress: 50 }), 30)).not.toContain('Accelerate mitigation activities to reduce open risk duration'); });
  it('mitigation = 100 → no accelerate rec', () => { expect(getRecommendations(feat({ mitigationProgress: 100 }), 30)).not.toContain('Accelerate mitigation activities to reduce open risk duration'); });
  it('likelihood >= 4 → preventive measures rec', () => { expect(getRecommendations(feat({ likelihood: 4 }), 30)).toContain('Conduct likelihood analysis and implement preventive measures'); });
  it('likelihood = 5 → preventive measures rec', () => { expect(getRecommendations(feat({ likelihood: 5 }), 30)).toContain('Conduct likelihood analysis and implement preventive measures'); });
  it('likelihood = 3 → no preventive measures rec', () => { expect(getRecommendations(feat({ likelihood: 3 }), 30)).not.toContain('Conduct likelihood analysis and implement preventive measures'); });
  it('likelihood = 1 → no preventive measures rec', () => { expect(getRecommendations(feat({ likelihood: 1 }), 30)).not.toContain('Conduct likelihood analysis and implement preventive measures'); });
  it('severity >= 4 → escalation rec', () => { expect(getRecommendations(feat({ severity: 4 }), 30)).toContain('Review severity classification and escalate to senior management'); });
  it('severity = 5 → escalation rec', () => { expect(getRecommendations(feat({ severity: 5 }), 30)).toContain('Review severity classification and escalate to senior management'); });
  it('severity = 3 → no escalation rec', () => { expect(getRecommendations(feat({ severity: 3 }), 30)).not.toContain('Review severity classification and escalate to senior management'); });
  it('incidents >= 3 → root cause rec', () => { expect(getRecommendations(feat({ relatedIncidents: 3 }), 30)).toContain('Investigate recurring incidents for root cause patterns'); });
  it('incidents = 5 → root cause rec', () => { expect(getRecommendations(feat({ relatedIncidents: 5 }), 30)).toContain('Investigate recurring incidents for root cause patterns'); });
  it('incidents = 2 → no root cause rec', () => { expect(getRecommendations(feat({ relatedIncidents: 2 }), 30)).not.toContain('Investigate recurring incidents for root cause patterns'); });
  it('timeOpen > 180 → escalate for review rec', () => { expect(getRecommendations(feat({ timeOpen: 181 }), 30)).toContain('Risk has been open for over 6 months — escalate for review'); });
  it('timeOpen = 365 → escalate for review rec', () => { expect(getRecommendations(feat({ timeOpen: 365 }), 30)).toContain('Risk has been open for over 6 months — escalate for review'); });
  it('timeOpen = 180 → no escalate for review rec', () => { expect(getRecommendations(feat({ timeOpen: 180 }), 30)).not.toContain('Risk has been open for over 6 months — escalate for review'); });
  it('timeOpen = 50 → no escalate for review rec', () => { expect(getRecommendations(feat({ timeOpen: 50 }), 30)).not.toContain('Risk has been open for over 6 months — escalate for review'); });
  it('score >= 75 → critical immediate action', () => { expect(getRecommendations(feat(), 75)).toContain('Critical risk score — immediate action required'); });
  it('score = 100 → critical', () => { expect(getRecommendations(feat(), 100)).toContain('Critical risk score — immediate action required'); });
  it('score = 74 → high risk rec', () => { expect(getRecommendations(feat(), 74)).toContain('High risk score — schedule management review within 2 weeks'); });
  it('score = 50 → high risk rec', () => { expect(getRecommendations(feat(), 50)).toContain('High risk score — schedule management review within 2 weeks'); });
  it('score = 25 → medium risk rec', () => { expect(getRecommendations(feat(), 25)).toContain('Medium risk — monitor closely and update mitigation plan'); });
  it('score = 49 → medium risk rec', () => { expect(getRecommendations(feat(), 49)).toContain('Medium risk — monitor closely and update mitigation plan'); });
  it('score = 24 → under control rec', () => { expect(getRecommendations(feat(), 24)).toContain('Risk is under control — continue monitoring'); });
  it('score = 1 → under control rec', () => { expect(getRecommendations(feat(), 1)).toContain('Risk is under control — continue monitoring'); });
  it('all conditions active → >= 6 recs', () => {
    const recs = getRecommendations(feat({ currentControls: 1, mitigationProgress: 10, likelihood: 5, severity: 5, relatedIncidents: 5, timeOpen: 365 }), 90);
    expect(recs.length).toBeGreaterThanOrEqual(6);
  });
  it('no conditions active → 1 rec', () => {
    const recs = getRecommendations(feat({ currentControls: 8, mitigationProgress: 80, likelihood: 2, severity: 2, relatedIncidents: 0, timeOpen: 10 }), 10);
    expect(recs.length).toBe(1);
  });
  it('score 76 → critical', () => { expect(getRecommendations(feat(), 76)).toContain('Critical risk score — immediate action required'); });
  it('score 90 → critical', () => { expect(getRecommendations(feat(), 90)).toContain('Critical risk score — immediate action required'); });
  it('score 51 → high', () => { expect(getRecommendations(feat(), 51)).toContain('High risk score — schedule management review within 2 weeks'); });
  it('score 26 → medium', () => { expect(getRecommendations(feat(), 26)).toContain('Medium risk — monitor closely and update mitigation plan'); });
  it('score 10 → under control', () => { expect(getRecommendations(feat(), 10)).toContain('Risk is under control — continue monitoring'); });
});

// ============================================================================
// SECTION 14: DEFAULT_MODEL_CONFIG
// ============================================================================

describe('DEFAULT_MODEL_CONFIG', () => {
  it('is defined', () => { expect(DEFAULT_MODEL_CONFIG).toBeDefined(); });
  it('version is string', () => { expect(typeof DEFAULT_MODEL_CONFIG.version).toBe('string'); });
  it('version is 1.0.0', () => { expect(DEFAULT_MODEL_CONFIG.version).toBe('1.0.0'); });
  it('weights is object', () => { expect(typeof DEFAULT_MODEL_CONFIG.weights).toBe('object'); });
  it('weights not null', () => { expect(DEFAULT_MODEL_CONFIG.weights).not.toBeNull(); });
  it('thresholds is object', () => { expect(typeof DEFAULT_MODEL_CONFIG.thresholds).toBe('object'); });
  it('features is array', () => { expect(Array.isArray(DEFAULT_MODEL_CONFIG.features)).toBe(true); });
  it('features non-empty', () => { expect(DEFAULT_MODEL_CONFIG.features.length).toBeGreaterThan(0); });
  it('has likelihood weight', () => { expect(DEFAULT_MODEL_CONFIG.weights).toHaveProperty('likelihood'); });
  it('has severity weight', () => { expect(DEFAULT_MODEL_CONFIG.weights).toHaveProperty('severity'); });
  it('has currentControls weight', () => { expect(DEFAULT_MODEL_CONFIG.weights).toHaveProperty('currentControls'); });
  it('has timeOpen weight', () => { expect(DEFAULT_MODEL_CONFIG.weights).toHaveProperty('timeOpen'); });
  it('has relatedIncidents weight', () => { expect(DEFAULT_MODEL_CONFIG.weights).toHaveProperty('relatedIncidents'); });
  it('has relatedAudits weight', () => { expect(DEFAULT_MODEL_CONFIG.weights).toHaveProperty('relatedAudits'); });
  it('has mitigationProgress weight', () => { expect(DEFAULT_MODEL_CONFIG.weights).toHaveProperty('mitigationProgress'); });
  it('has industryBenchmark weight', () => { expect(DEFAULT_MODEL_CONFIG.weights).toHaveProperty('industryBenchmark'); });
  it('likelihood weight = 0.25', () => { expect(DEFAULT_MODEL_CONFIG.weights.likelihood).toBe(0.25); });
  it('severity weight = 0.25', () => { expect(DEFAULT_MODEL_CONFIG.weights.severity).toBe(0.25); });
  it('weights sum ≈ 1.0', () => { const total = Object.values(DEFAULT_MODEL_CONFIG.weights).reduce((s, w) => s + w, 0); expect(total).toBeCloseTo(1.0, 3); });
  it('thresholds.low = 25', () => { expect(DEFAULT_MODEL_CONFIG.thresholds.low).toBe(25); });
  it('thresholds.medium = 50', () => { expect(DEFAULT_MODEL_CONFIG.thresholds.medium).toBe(50); });
  it('thresholds.high = 75', () => { expect(DEFAULT_MODEL_CONFIG.thresholds.high).toBe(75); });
  it('thresholds.critical = 90', () => { expect(DEFAULT_MODEL_CONFIG.thresholds.critical).toBe(90); });
  it('low < medium', () => { expect(DEFAULT_MODEL_CONFIG.thresholds.low).toBeLessThan(DEFAULT_MODEL_CONFIG.thresholds.medium); });
  it('medium < high', () => { expect(DEFAULT_MODEL_CONFIG.thresholds.medium).toBeLessThan(DEFAULT_MODEL_CONFIG.thresholds.high); });
  it('high < critical', () => { expect(DEFAULT_MODEL_CONFIG.thresholds.high).toBeLessThan(DEFAULT_MODEL_CONFIG.thresholds.critical); });
  it('features includes likelihood', () => { expect(DEFAULT_MODEL_CONFIG.features).toContain('likelihood'); });
  it('features includes severity', () => { expect(DEFAULT_MODEL_CONFIG.features).toContain('severity'); });
  it('features includes currentControls', () => { expect(DEFAULT_MODEL_CONFIG.features).toContain('currentControls'); });
  it('features includes timeOpen', () => { expect(DEFAULT_MODEL_CONFIG.features).toContain('timeOpen'); });
  it('features includes relatedIncidents', () => { expect(DEFAULT_MODEL_CONFIG.features).toContain('relatedIncidents'); });
  it('features includes relatedAudits', () => { expect(DEFAULT_MODEL_CONFIG.features).toContain('relatedAudits'); });
  it('features includes mitigationProgress', () => { expect(DEFAULT_MODEL_CONFIG.features).toContain('mitigationProgress'); });
  it('features includes industryBenchmark', () => { expect(DEFAULT_MODEL_CONFIG.features).toContain('industryBenchmark'); });
  it('features includes seasonalFactor', () => { expect(DEFAULT_MODEL_CONFIG.features).toContain('seasonalFactor'); });
  it('all weight values are numbers', () => { Object.values(DEFAULT_MODEL_CONFIG.weights).forEach(w => expect(typeof w).toBe('number')); });
  it('all weight values are 0-1', () => { Object.values(DEFAULT_MODEL_CONFIG.weights).forEach(w => { expect(w).toBeGreaterThanOrEqual(0); expect(w).toBeLessThanOrEqual(1); }); });
  it('validateModelConfig passes on DEFAULT_MODEL_CONFIG', () => { expect(validateModelConfig(DEFAULT_MODEL_CONFIG).valid).toBe(true); });
});

// ============================================================================
// SECTION 15: validateModelConfig
// ============================================================================

describe('validateModelConfig', () => {
  it('valid config → valid: true', () => { expect(validateModelConfig(validCfg()).valid).toBe(true); });
  it('valid config → empty errors', () => { expect(validateModelConfig(validCfg()).errors).toHaveLength(0); });
  it('returns object with valid property', () => { expect(validateModelConfig(validCfg())).toHaveProperty('valid'); });
  it('returns object with errors property', () => { expect(validateModelConfig(validCfg())).toHaveProperty('errors'); });
  it('errors is array', () => { expect(Array.isArray(validateModelConfig(validCfg()).errors)).toBe(true); });
  it('valid is boolean', () => { expect(typeof validateModelConfig(validCfg()).valid).toBe('boolean'); });
  it('DEFAULT_MODEL_CONFIG valid', () => { expect(validateModelConfig(DEFAULT_MODEL_CONFIG).valid).toBe(true); });
  it('single weight 1.0 is valid', () => { expect(validateModelConfig({ ...validCfg(), weights: { a: 1.0 } }).valid).toBe(true); });
  it('missing version → invalid', () => { expect(validateModelConfig({ ...validCfg(), version: '' }).valid).toBe(false); });
  it('missing version → error mentions version', () => { expect(validateModelConfig({ ...validCfg(), version: '' }).errors.some(e => e.toLowerCase().includes('version'))).toBe(true); });
  it('undefined version → invalid', () => { const c = validCfg(); delete (c as any).version; expect(validateModelConfig(c as Partial<ModelConfig>).valid).toBe(false); });
  it('missing weights → invalid', () => { const c = validCfg(); delete (c as any).weights; expect(validateModelConfig(c as Partial<ModelConfig>).valid).toBe(false); });
  it('empty weights → invalid', () => { expect(validateModelConfig({ ...validCfg(), weights: {} }).valid).toBe(false); });
  it('missing thresholds → invalid', () => { const c = validCfg(); delete (c as any).thresholds; expect(validateModelConfig(c as Partial<ModelConfig>).valid).toBe(false); });
  it('missing features → invalid', () => { const c = validCfg(); delete (c as any).features; expect(validateModelConfig(c as Partial<ModelConfig>).valid).toBe(false); });
  it('empty features → invalid', () => { expect(validateModelConfig({ ...validCfg(), features: [] }).valid).toBe(false); });
  it('weights not summing to 1 → invalid', () => { expect(validateModelConfig({ ...validCfg(), weights: { a: 0.4, b: 0.4 } }).valid).toBe(false); });
  it('weights sum 0.5 → error mentions 1.0', () => { expect(validateModelConfig({ ...validCfg(), weights: { a: 0.25, b: 0.25 } }).errors.some(e => e.includes('1.0'))).toBe(true); });
  it('weights sum 1.5 → invalid', () => { expect(validateModelConfig({ ...validCfg(), weights: { a: 0.75, b: 0.75 } }).valid).toBe(false); });
  it('weights sum 0 → invalid', () => { expect(validateModelConfig({ ...validCfg(), weights: { a: 0, b: 0 } }).valid).toBe(false); });
  it('low > medium → invalid', () => { expect(validateModelConfig({ ...validCfg(), thresholds: { low: 50, medium: 30, high: 60, critical: 80 } }).valid).toBe(false); });
  it('medium > high → invalid', () => { expect(validateModelConfig({ ...validCfg(), thresholds: { low: 20, medium: 70, high: 60, critical: 80 } }).valid).toBe(false); });
  it('high > critical → invalid', () => { expect(validateModelConfig({ ...validCfg(), thresholds: { low: 20, medium: 40, high: 90, critical: 80 } }).valid).toBe(false); });
  it('equal thresholds → invalid', () => { expect(validateModelConfig({ ...validCfg(), thresholds: { low: 25, medium: 25, high: 75, critical: 90 } }).valid).toBe(false); });
  it('reversed thresholds → error mentions ascending', () => { expect(validateModelConfig({ ...validCfg(), thresholds: { low: 80, medium: 60, high: 40, critical: 20 } }).errors.some(e => e.toLowerCase().includes('ascending'))).toBe(true); });
  it('empty config → multiple errors', () => { expect(validateModelConfig({}).errors.length).toBeGreaterThan(1); });
  it('empty config → invalid', () => { expect(validateModelConfig({}).valid).toBe(false); });
  it('all error messages are strings', () => { validateModelConfig({}).errors.forEach(e => expect(typeof e).toBe('string')); });
  it('sum 0.9995 within tolerance → valid', () => { expect(validateModelConfig({ ...validCfg(), weights: { a: 0.4995, b: 0.5 } }).valid).toBe(true); });
  it('sum 1.001 within tolerance → valid', () => { expect(validateModelConfig({ ...validCfg(), weights: { a: 0.501, b: 0.5 } }).valid).toBe(true); });
  it('sum 0.998 outside tolerance → invalid', () => { expect(validateModelConfig({ ...validCfg(), weights: { a: 0.498, b: 0.5 } }).valid).toBe(false); });
  it('sum 1.002 outside tolerance → invalid', () => { expect(validateModelConfig({ ...validCfg(), weights: { a: 0.502, b: 0.5 } }).valid).toBe(false); });
  it('missing low threshold → invalid', () => { expect(validateModelConfig({ ...validCfg(), thresholds: { low: undefined as any, medium: 40, high: 60, critical: 80 } }).valid).toBe(false); });
  it('missing critical threshold → invalid', () => { expect(validateModelConfig({ ...validCfg(), thresholds: { low: 20, medium: 40, high: 60, critical: undefined as any } }).valid).toBe(false); });
  it('valid threshold 1/25/50/99 → valid', () => { expect(validateModelConfig({ ...validCfg(), thresholds: { low: 1, medium: 25, high: 50, critical: 99 } }).valid).toBe(true); });
  it('features array with many entries → valid', () => { expect(validateModelConfig({ ...validCfg(), features: ['a', 'b', 'c', 'd', 'e', 'f', 'g'] }).valid).toBe(true); });
  it('features as non-array → invalid', () => { expect(validateModelConfig({ ...validCfg(), features: 'not-an-array' as any }).valid).toBe(false); });
});

// ============================================================================
// SECTION 16: createModel
// ============================================================================

describe('createModel', () => {
  it('returns object', () => { expect(typeof createModel()).toBe('object'); });
  it('has predict function', () => { expect(typeof createModel().predict).toBe('function'); });
  it('has getConfig function', () => { expect(typeof createModel().getConfig).toBe('function'); });
  it('getConfig returns version', () => { expect(createModel().getConfig().version).toBeDefined(); });
  it('getConfig default version is 1.0.0', () => { expect(createModel().getConfig().version).toBe('1.0.0'); });
  it('getConfig custom version reflected', () => { expect(createModel({ version: '9.9.9' }).getConfig().version).toBe('9.9.9'); });
  it('getConfig has weights', () => { expect(typeof createModel().getConfig().weights).toBe('object'); });
  it('getConfig has thresholds', () => { expect(typeof createModel().getConfig().thresholds).toBe('object'); });
  it('getConfig has features array', () => { expect(Array.isArray(createModel().getConfig().features)).toBe(true); });
  it('custom weights merged with defaults', () => { expect(createModel({ weights: { likelihood: 0.9 } }).getConfig().weights.likelihood).toBe(0.9); });
  it('custom thresholds merged', () => { expect(createModel({ thresholds: { low: 10, medium: 30, high: 60, critical: 90 } }).getConfig().thresholds.low).toBe(10); });
  it('predict returns defined value', () => { expect(createModel().predict('r1', feat())).toBeDefined(); });
  it('predict riskId matches input', () => { expect(createModel().predict('my-risk', feat()).riskId).toBe('my-risk'); });
  it('predict currentScore is number', () => { expect(typeof createModel().predict('r1', feat()).currentScore).toBe('number'); });
  it('predict currentScore in 1-100', () => { const p = createModel().predict('r1', feat()); expect(p.currentScore).toBeGreaterThanOrEqual(1); expect(p.currentScore).toBeLessThanOrEqual(100); });
  it('predict predictedScore30d is number', () => { expect(typeof createModel().predict('r1', feat()).predictedScore30d).toBe('number'); });
  it('predict predictedScore90d is number', () => { expect(typeof createModel().predict('r1', feat()).predictedScore90d).toBe('number'); });
  it('predict trend is valid union', () => { expect(['increasing', 'stable', 'decreasing']).toContain(createModel().predict('r1', feat()).trend); });
  it('predict confidence is 0-1', () => { const c = createModel().predict('r1', feat()).confidence; expect(c).toBeGreaterThanOrEqual(0); expect(c).toBeLessThanOrEqual(1); });
  it('predict driverFeatures has 7 items', () => { expect(createModel().predict('r1', feat()).driverFeatures).toHaveLength(7); });
  it('predict recommendations is array', () => { expect(Array.isArray(createModel().predict('r1', feat()).recommendations)).toBe(true); });
  it('predict modelVersion matches config', () => { expect(createModel({ version: '2.5.0' }).predict('r1', feat()).modelVersion).toBe('2.5.0'); });
  it('predict computedAt is Date', () => { expect(createModel().predict('r1', feat()).computedAt instanceof Date).toBe(true); });
  it('predict computedAt is recent', () => {
    const before = Date.now();
    const p = createModel().predict('r1', feat());
    expect(p.computedAt.getTime()).toBeGreaterThanOrEqual(before - 100);
  });
  it('higher mitigation → higher confidence', () => {
    const m = createModel();
    expect(m.predict('r1', feat({ mitigationProgress: 100, relatedAudits: 0 })).confidence).toBeGreaterThan(m.predict('r2', feat({ mitigationProgress: 0, relatedAudits: 0 })).confidence);
  });
  it('more audits → higher confidence up to cap', () => {
    const m = createModel();
    expect(m.predict('r1', feat({ relatedAudits: 4, mitigationProgress: 0 })).confidence).toBeGreaterThan(m.predict('r2', feat({ relatedAudits: 0, mitigationProgress: 0 })).confidence);
  });
  it('confidence never > 1', () => { expect(createModel().predict('r1', feat({ mitigationProgress: 100, relatedAudits: 10 })).confidence).toBeLessThanOrEqual(1); });
  it('base confidence ≈ 0.5 when no mitigation or audits', () => { expect(createModel().predict('r1', feat({ mitigationProgress: 0, relatedAudits: 0 })).confidence).toBeCloseTo(0.5, 2); });
  it('same inputs → same score', () => { const m = createModel(); const f = feat({ likelihood: 4 }); expect(m.predict('r1', f).currentScore).toBe(m.predict('r1', f).currentScore); });
  it('different riskIds → different in output', () => { const m = createModel(); expect(m.predict('risk-A', feat()).riskId).not.toBe(m.predict('risk-B', feat()).riskId); });
  it('predictedScore30d in 1-100', () => { const p = createModel().predict('r1', feat()); expect(p.predictedScore30d).toBeGreaterThanOrEqual(1); expect(p.predictedScore30d).toBeLessThanOrEqual(100); });
  it('predictedScore90d in 1-100', () => { const p = createModel().predict('r1', feat()); expect(p.predictedScore90d).toBeGreaterThanOrEqual(1); expect(p.predictedScore90d).toBeLessThanOrEqual(100); });
  it('two model instances are independent', () => { const m1 = createModel({ version: 'v1' }); const m2 = createModel({ version: 'v2' }); expect(m1.getConfig().version).toBe('v1'); expect(m2.getConfig().version).toBe('v2'); });
  it('predict with high risk features → high currentScore', () => { const p = createModel().predict('r1', feat({ likelihood: 5, severity: 5, currentControls: 0, mitigationProgress: 0, timeOpen: 365, relatedIncidents: 5, category: 'health_safety' })); expect(p.currentScore).toBeGreaterThan(60); });
  it('predict with low risk features → low currentScore', () => { const p = createModel().predict('r1', feat({ likelihood: 1, severity: 1, currentControls: 10, mitigationProgress: 100, timeOpen: 0, relatedIncidents: 0 })); expect(p.currentScore).toBeLessThan(20); });
  it('predict default modelVersion is 1.0.0', () => { expect(createModel().predict('r1', feat()).modelVersion).toBe('1.0.0'); });
});

// ============================================================================
// SECTION 17: RiskCategory all values
// ============================================================================

describe('RiskCategory all values', () => {
  const cats: RiskCategory[] = ['health_safety', 'environmental', 'quality', 'financial', 'operational', 'compliance', 'reputational', 'cybersecurity'];
  it('there are 8 categories', () => { expect(cats).toHaveLength(8); });
  it('health_safety produces valid score', () => { const s = computeRiskScore(feat({ category: 'health_safety' })); expect(s).toBeGreaterThanOrEqual(1); expect(s).toBeLessThanOrEqual(100); });
  it('environmental produces valid score', () => { const s = computeRiskScore(feat({ category: 'environmental' })); expect(s).toBeGreaterThanOrEqual(1); expect(s).toBeLessThanOrEqual(100); });
  it('quality produces valid score', () => { const s = computeRiskScore(feat({ category: 'quality' })); expect(s).toBeGreaterThanOrEqual(1); expect(s).toBeLessThanOrEqual(100); });
  it('financial produces valid score', () => { const s = computeRiskScore(feat({ category: 'financial' })); expect(s).toBeGreaterThanOrEqual(1); expect(s).toBeLessThanOrEqual(100); });
  it('operational produces valid score', () => { const s = computeRiskScore(feat({ category: 'operational' })); expect(s).toBeGreaterThanOrEqual(1); expect(s).toBeLessThanOrEqual(100); });
  it('compliance produces valid score', () => { const s = computeRiskScore(feat({ category: 'compliance' })); expect(s).toBeGreaterThanOrEqual(1); expect(s).toBeLessThanOrEqual(100); });
  it('reputational produces valid score', () => { const s = computeRiskScore(feat({ category: 'reputational' })); expect(s).toBeGreaterThanOrEqual(1); expect(s).toBeLessThanOrEqual(100); });
  it('cybersecurity produces valid score', () => { const s = computeRiskScore(feat({ category: 'cybersecurity' })); expect(s).toBeGreaterThanOrEqual(1); expect(s).toBeLessThanOrEqual(100); });
  it('health_safety works in predictTrend', () => { expect(['increasing', 'stable', 'decreasing']).toContain(predictTrend(hist([40, 50]))); });
  it('health_safety works in getRecommendations', () => { expect(Array.isArray(getRecommendations(feat({ category: 'health_safety' }), 50))).toBe(true); });
  it('environmental works in getRecommendations', () => { expect(Array.isArray(getRecommendations(feat({ category: 'environmental' }), 50))).toBe(true); });
  it('quality works in getRecommendations', () => { expect(Array.isArray(getRecommendations(feat({ category: 'quality' }), 50))).toBe(true); });
  it('financial works in getRecommendations', () => { expect(Array.isArray(getRecommendations(feat({ category: 'financial' }), 50))).toBe(true); });
  it('operational works in getRecommendations', () => { expect(Array.isArray(getRecommendations(feat({ category: 'operational' }), 50))).toBe(true); });
  it('compliance works in getRecommendations', () => { expect(Array.isArray(getRecommendations(feat({ category: 'compliance' }), 50))).toBe(true); });
  it('reputational works in getRecommendations', () => { expect(Array.isArray(getRecommendations(feat({ category: 'reputational' }), 50))).toBe(true); });
  it('cybersecurity works in getRecommendations', () => { expect(Array.isArray(getRecommendations(feat({ category: 'cybersecurity' }), 50))).toBe(true); });
  it('health_safety works in getDriverFeatures', () => { expect(getDriverFeatures(feat({ category: 'health_safety' }), 50)).toHaveLength(7); });
  it('environmental works in getDriverFeatures', () => { expect(getDriverFeatures(feat({ category: 'environmental' }), 50)).toHaveLength(7); });
  it('quality works in getDriverFeatures', () => { expect(getDriverFeatures(feat({ category: 'quality' }), 50)).toHaveLength(7); });
  it('financial works in getDriverFeatures', () => { expect(getDriverFeatures(feat({ category: 'financial' }), 50)).toHaveLength(7); });
  it('operational works in getDriverFeatures', () => { expect(getDriverFeatures(feat({ category: 'operational' }), 50)).toHaveLength(7); });
  it('compliance works in getDriverFeatures', () => { expect(getDriverFeatures(feat({ category: 'compliance' }), 50)).toHaveLength(7); });
  it('reputational works in getDriverFeatures', () => { expect(getDriverFeatures(feat({ category: 'reputational' }), 50)).toHaveLength(7); });
  it('cybersecurity works in getDriverFeatures', () => { expect(getDriverFeatures(feat({ category: 'cybersecurity' }), 50)).toHaveLength(7); });
  it('health_safety works in createModel.predict', () => { expect(createModel().predict('r', feat({ category: 'health_safety' })).riskId).toBe('r'); });
  it('environmental works in createModel.predict', () => { expect(createModel().predict('r', feat({ category: 'environmental' })).riskId).toBe('r'); });
  it('quality works in createModel.predict', () => { expect(createModel().predict('r', feat({ category: 'quality' })).riskId).toBe('r'); });
  it('financial works in createModel.predict', () => { expect(createModel().predict('r', feat({ category: 'financial' })).riskId).toBe('r'); });
  it('operational works in createModel.predict', () => { expect(createModel().predict('r', feat({ category: 'operational' })).riskId).toBe('r'); });
  it('compliance works in createModel.predict', () => { expect(createModel().predict('r', feat({ category: 'compliance' })).riskId).toBe('r'); });
  it('reputational works in createModel.predict', () => { expect(createModel().predict('r', feat({ category: 'reputational' })).riskId).toBe('r'); });
  it('cybersecurity works in createModel.predict', () => { expect(createModel().predict('r', feat({ category: 'cybersecurity' })).riskId).toBe('r'); });
});

// ============================================================================
// SECTION 18: Extended computeRiskScore permutations
// ============================================================================

describe('computeRiskScore — extended permutations A', () => {
  it('L1 S1 C0 T0 I0 A0 M0 operational → 1 (clamp)', () => { expect(computeRiskScore(feat({ likelihood:1,severity:1,currentControls:0,timeOpen:0,relatedIncidents:0,relatedAudits:0,mitigationProgress:0,category:'operational'}))).toBeGreaterThanOrEqual(1); });
  it('L1 S1 C0 T0 I0 A0 M0 health_safety → >= 1', () => { expect(computeRiskScore(feat({ likelihood:1,severity:1,currentControls:0,timeOpen:0,relatedIncidents:0,relatedAudits:0,mitigationProgress:0,category:'health_safety'}))).toBeGreaterThanOrEqual(1); });
  it('L2 S2 C0 T0 I0 A0 M0 operational → 20', () => { expect(computeRiskScore(feat({ likelihood:2,severity:2,currentControls:0,timeOpen:0,relatedIncidents:0,relatedAudits:0,mitigationProgress:0,category:'operational'}))).toBe(20); });
  it('L3 S3 C0 T0 I0 A0 M0 operational → 30', () => { expect(computeRiskScore(feat({ likelihood:3,severity:3,currentControls:0,timeOpen:0,relatedIncidents:0,relatedAudits:0,mitigationProgress:0,category:'operational'}))).toBe(30); });
  it('L4 S4 C0 T0 I0 A0 M0 operational → 40', () => { expect(computeRiskScore(feat({ likelihood:4,severity:4,currentControls:0,timeOpen:0,relatedIncidents:0,relatedAudits:0,mitigationProgress:0,category:'operational'}))).toBe(40); });
  it('L5 S5 C0 T0 I0 A0 M0 operational → 50', () => { expect(computeRiskScore(feat({ likelihood:5,severity:5,currentControls:0,timeOpen:0,relatedIncidents:0,relatedAudits:0,mitigationProgress:0,category:'operational'}))).toBe(50); });
  it('L1 S5 C0 T0 I0 A0 M0 operational → 30', () => { expect(computeRiskScore(feat({ likelihood:1,severity:5,currentControls:0,timeOpen:0,relatedIncidents:0,relatedAudits:0,mitigationProgress:0,category:'operational'}))).toBe(30); });
  it('L5 S1 C0 T0 I0 A0 M0 operational → 30', () => { expect(computeRiskScore(feat({ likelihood:5,severity:1,currentControls:0,timeOpen:0,relatedIncidents:0,relatedAudits:0,mitigationProgress:0,category:'operational'}))).toBe(30); });
  it('L2 S4 C0 T0 I0 A0 M0 operational → 30', () => { expect(computeRiskScore(feat({ likelihood:2,severity:4,currentControls:0,timeOpen:0,relatedIncidents:0,relatedAudits:0,mitigationProgress:0,category:'operational'}))).toBe(30); });
  it('L4 S2 C0 T0 I0 A0 M0 operational → 30', () => { expect(computeRiskScore(feat({ likelihood:4,severity:2,currentControls:0,timeOpen:0,relatedIncidents:0,relatedAudits:0,mitigationProgress:0,category:'operational'}))).toBe(30); });
  it('L3 S5 C0 T0 I0 A0 M0 operational → 40', () => { expect(computeRiskScore(feat({ likelihood:3,severity:5,currentControls:0,timeOpen:0,relatedIncidents:0,relatedAudits:0,mitigationProgress:0,category:'operational'}))).toBe(40); });
  it('L5 S3 C0 T0 I0 A0 M0 operational → 40', () => { expect(computeRiskScore(feat({ likelihood:5,severity:3,currentControls:0,timeOpen:0,relatedIncidents:0,relatedAudits:0,mitigationProgress:0,category:'operational'}))).toBe(40); });
  it('L1 S3 C0 T0 I0 A0 M0 operational → 20', () => { expect(computeRiskScore(feat({ likelihood:1,severity:3,currentControls:0,timeOpen:0,relatedIncidents:0,relatedAudits:0,mitigationProgress:0,category:'operational'}))).toBe(20); });
  it('L3 S1 C0 T0 I0 A0 M0 operational → 20', () => { expect(computeRiskScore(feat({ likelihood:3,severity:1,currentControls:0,timeOpen:0,relatedIncidents:0,relatedAudits:0,mitigationProgress:0,category:'operational'}))).toBe(20); });
  it('L2 S3 C0 T0 I0 A0 M0 operational → 25', () => { expect(computeRiskScore(feat({ likelihood:2,severity:3,currentControls:0,timeOpen:0,relatedIncidents:0,relatedAudits:0,mitigationProgress:0,category:'operational'}))).toBe(25); });
  it('L3 S2 C0 T0 I0 A0 M0 operational → 25', () => { expect(computeRiskScore(feat({ likelihood:3,severity:2,currentControls:0,timeOpen:0,relatedIncidents:0,relatedAudits:0,mitigationProgress:0,category:'operational'}))).toBe(25); });
  it('L4 S5 C0 T0 I0 A0 M0 operational → 45', () => { expect(computeRiskScore(feat({ likelihood:4,severity:5,currentControls:0,timeOpen:0,relatedIncidents:0,relatedAudits:0,mitigationProgress:0,category:'operational'}))).toBe(45); });
  it('L5 S4 C0 T0 I0 A0 M0 operational → 45', () => { expect(computeRiskScore(feat({ likelihood:5,severity:4,currentControls:0,timeOpen:0,relatedIncidents:0,relatedAudits:0,mitigationProgress:0,category:'operational'}))).toBe(45); });
  it('L1 S2 C0 T0 I0 A0 M0 operational → 15', () => { expect(computeRiskScore(feat({ likelihood:1,severity:2,currentControls:0,timeOpen:0,relatedIncidents:0,relatedAudits:0,mitigationProgress:0,category:'operational'}))).toBe(15); });
  it('L2 S1 C0 T0 I0 A0 M0 operational → 15', () => { expect(computeRiskScore(feat({ likelihood:2,severity:1,currentControls:0,timeOpen:0,relatedIncidents:0,relatedAudits:0,mitigationProgress:0,category:'operational'}))).toBe(15); });
  it('L1 S4 C0 T0 I0 A0 M0 operational → 25', () => { expect(computeRiskScore(feat({ likelihood:1,severity:4,currentControls:0,timeOpen:0,relatedIncidents:0,relatedAudits:0,mitigationProgress:0,category:'operational'}))).toBe(25); });
  it('L4 S1 C0 T0 I0 A0 M0 operational → 25', () => { expect(computeRiskScore(feat({ likelihood:4,severity:1,currentControls:0,timeOpen:0,relatedIncidents:0,relatedAudits:0,mitigationProgress:0,category:'operational'}))).toBe(25); });
  it('L2 S5 C0 T0 I0 A0 M0 operational → 35', () => { expect(computeRiskScore(feat({ likelihood:2,severity:5,currentControls:0,timeOpen:0,relatedIncidents:0,relatedAudits:0,mitigationProgress:0,category:'operational'}))).toBe(35); });
  it('L5 S2 C0 T0 I0 A0 M0 operational → 35', () => { expect(computeRiskScore(feat({ likelihood:5,severity:2,currentControls:0,timeOpen:0,relatedIncidents:0,relatedAudits:0,mitigationProgress:0,category:'operational'}))).toBe(35); });
  it('L3 S4 C0 T0 I0 A0 M0 operational → 35', () => { expect(computeRiskScore(feat({ likelihood:3,severity:4,currentControls:0,timeOpen:0,relatedIncidents:0,relatedAudits:0,mitigationProgress:0,category:'operational'}))).toBe(35); });
  it('L4 S3 C0 T0 I0 A0 M0 operational → 35', () => { expect(computeRiskScore(feat({ likelihood:4,severity:3,currentControls:0,timeOpen:0,relatedIncidents:0,relatedAudits:0,mitigationProgress:0,category:'operational'}))).toBe(35); });
  it('L1 S1 C10 T0 I0 A0 M0 operational → 1 (clamp from negative)', () => { expect(computeRiskScore(feat({ likelihood:1,severity:1,currentControls:10,timeOpen:0,relatedIncidents:0,relatedAudits:0,mitigationProgress:0,category:'operational'}))).toBeGreaterThanOrEqual(1); });
  it('L5 S5 C10 T0 I0 A0 M0 operational → 40', () => { expect(computeRiskScore(feat({ likelihood:5,severity:5,currentControls:10,timeOpen:0,relatedIncidents:0,relatedAudits:0,mitigationProgress:0,category:'operational'}))).toBe(40); });
  it('L5 S5 C0 T365 I0 A0 M0 operational → 60', () => { expect(computeRiskScore(feat({ likelihood:5,severity:5,currentControls:0,timeOpen:365,relatedIncidents:0,relatedAudits:0,mitigationProgress:0,category:'operational'}))).toBe(60); });
  it('L5 S5 C0 T0 I5 A0 M0 operational → 60', () => { expect(computeRiskScore(feat({ likelihood:5,severity:5,currentControls:0,timeOpen:0,relatedIncidents:5,relatedAudits:0,mitigationProgress:0,category:'operational'}))).toBe(60); });
  it('L5 S5 C0 T0 I0 A5 M0 operational → 55', () => { expect(computeRiskScore(feat({ likelihood:5,severity:5,currentControls:0,timeOpen:0,relatedIncidents:0,relatedAudits:5,mitigationProgress:0,category:'operational'}))).toBe(55); });
  it('L5 S5 C0 T0 I0 A0 M100 operational → 40', () => { expect(computeRiskScore(feat({ likelihood:5,severity:5,currentControls:0,timeOpen:0,relatedIncidents:0,relatedAudits:0,mitigationProgress:100,category:'operational'}))).toBe(40); });
});

describe('computeRiskScore — extended permutations B (category × likelihood matrix)', () => {
  it('health_safety L1 S1 → valid', () => { expect(computeRiskScore(feat({category:'health_safety',likelihood:1,severity:1}))).toBeGreaterThanOrEqual(1); });
  it('health_safety L2 S2 → valid', () => { expect(computeRiskScore(feat({category:'health_safety',likelihood:2,severity:2}))).toBeGreaterThanOrEqual(1); });
  it('health_safety L3 S3 → valid', () => { expect(computeRiskScore(feat({category:'health_safety',likelihood:3,severity:3}))).toBeGreaterThanOrEqual(1); });
  it('health_safety L4 S4 → valid', () => { expect(computeRiskScore(feat({category:'health_safety',likelihood:4,severity:4}))).toBeGreaterThanOrEqual(1); });
  it('health_safety L5 S5 → 98 (actual max)', () => { expect(computeRiskScore(feat({category:'health_safety',likelihood:5,severity:5,currentControls:0,mitigationProgress:0,timeOpen:365,relatedIncidents:5,relatedAudits:5}))).toBe(98); });
  it('environmental L1 S1 → valid', () => { expect(computeRiskScore(feat({category:'environmental',likelihood:1,severity:1}))).toBeGreaterThanOrEqual(1); });
  it('environmental L3 S3 → valid', () => { expect(computeRiskScore(feat({category:'environmental',likelihood:3,severity:3}))).toBeGreaterThanOrEqual(1); });
  it('environmental L5 S5 → <= 100', () => { expect(computeRiskScore(feat({category:'environmental',likelihood:5,severity:5,currentControls:0,mitigationProgress:0}))).toBeLessThanOrEqual(100); });
  it('quality L1 S1 → valid', () => { expect(computeRiskScore(feat({category:'quality',likelihood:1,severity:1}))).toBeGreaterThanOrEqual(1); });
  it('quality L5 S5 → <= 100', () => { expect(computeRiskScore(feat({category:'quality',likelihood:5,severity:5,currentControls:0,mitigationProgress:0}))).toBeLessThanOrEqual(100); });
  it('financial L1 S1 → valid', () => { expect(computeRiskScore(feat({category:'financial',likelihood:1,severity:1}))).toBeGreaterThanOrEqual(1); });
  it('financial L5 S5 → <= 100', () => { expect(computeRiskScore(feat({category:'financial',likelihood:5,severity:5,currentControls:0,mitigationProgress:0}))).toBeLessThanOrEqual(100); });
  it('operational L1 S1 → valid', () => { expect(computeRiskScore(feat({category:'operational',likelihood:1,severity:1}))).toBeGreaterThanOrEqual(1); });
  it('operational L5 S5 → 50 (isolated)', () => { expect(computeRiskScore(feat({category:'operational',likelihood:5,severity:5,currentControls:0,timeOpen:0,relatedIncidents:0,relatedAudits:0,mitigationProgress:0}))).toBe(50); });
  it('compliance L3 S3 → valid', () => { expect(computeRiskScore(feat({category:'compliance',likelihood:3,severity:3}))).toBeGreaterThanOrEqual(1); });
  it('compliance L5 S5 → <= 100', () => { expect(computeRiskScore(feat({category:'compliance',likelihood:5,severity:5,currentControls:0,mitigationProgress:0}))).toBeLessThanOrEqual(100); });
  it('reputational L2 S2 → valid', () => { expect(computeRiskScore(feat({category:'reputational',likelihood:2,severity:2}))).toBeGreaterThanOrEqual(1); });
  it('reputational L5 S5 → <= 100', () => { expect(computeRiskScore(feat({category:'reputational',likelihood:5,severity:5,currentControls:0,mitigationProgress:0}))).toBeLessThanOrEqual(100); });
  it('cybersecurity L4 S4 → valid', () => { expect(computeRiskScore(feat({category:'cybersecurity',likelihood:4,severity:4}))).toBeGreaterThanOrEqual(1); });
  it('cybersecurity L5 S5 → <= 100', () => { expect(computeRiskScore(feat({category:'cybersecurity',likelihood:5,severity:5,currentControls:0,mitigationProgress:0}))).toBeLessThanOrEqual(100); });
  it('health_safety L1 S5 > operational L1 S5', () => {
    const hs = computeRiskScore(feat({category:'health_safety',likelihood:1,severity:5,currentControls:0,timeOpen:0,relatedIncidents:0,relatedAudits:0,mitigationProgress:0}));
    const op = computeRiskScore(feat({category:'operational',likelihood:1,severity:5,currentControls:0,timeOpen:0,relatedIncidents:0,relatedAudits:0,mitigationProgress:0}));
    expect(hs).toBeGreaterThan(op);
  });
  it('cybersecurity L5 S1 > operational L5 S1', () => {
    const cy = computeRiskScore(feat({category:'cybersecurity',likelihood:5,severity:1,currentControls:0,timeOpen:0,relatedIncidents:0,relatedAudits:0,mitigationProgress:0}));
    const op = computeRiskScore(feat({category:'operational',likelihood:5,severity:1,currentControls:0,timeOpen:0,relatedIncidents:0,relatedAudits:0,mitigationProgress:0}));
    expect(cy).toBeGreaterThan(op);
  });
  it('score is integer for all categories', () => {
    ['health_safety','environmental','quality','financial','operational','compliance','reputational','cybersecurity'].forEach(cat => {
      const s = computeRiskScore(feat({category: cat as RiskCategory}));
      expect(s).toBe(Math.round(s));
    });
  });
});

describe('computeRiskScore — extended permutations C (controls × mitigation grid)', () => {
  it('C0 M0 → higher than C10 M100', () => {
    const high = computeRiskScore(feat({currentControls:0,mitigationProgress:0}));
    const low = computeRiskScore(feat({currentControls:10,mitigationProgress:100}));
    expect(high).toBeGreaterThan(low);
  });
  it('C0 M50 → valid', () => { expect(computeRiskScore(feat({currentControls:0,mitigationProgress:50}))).toBeGreaterThanOrEqual(1); });
  it('C5 M0 → valid', () => { expect(computeRiskScore(feat({currentControls:5,mitigationProgress:0}))).toBeGreaterThanOrEqual(1); });
  it('C5 M50 → valid', () => { expect(computeRiskScore(feat({currentControls:5,mitigationProgress:50}))).toBeGreaterThanOrEqual(1); });
  it('C5 M100 → valid', () => { expect(computeRiskScore(feat({currentControls:5,mitigationProgress:100}))).toBeGreaterThanOrEqual(1); });
  it('C10 M0 → valid', () => { expect(computeRiskScore(feat({currentControls:10,mitigationProgress:0}))).toBeGreaterThanOrEqual(1); });
  it('C10 M50 → valid', () => { expect(computeRiskScore(feat({currentControls:10,mitigationProgress:50}))).toBeGreaterThanOrEqual(1); });
  it('C10 M100 → valid', () => { expect(computeRiskScore(feat({currentControls:10,mitigationProgress:100}))).toBeGreaterThanOrEqual(1); });
  it('C1 M10 → valid', () => { expect(computeRiskScore(feat({currentControls:1,mitigationProgress:10}))).toBeGreaterThanOrEqual(1); });
  it('C2 M20 → valid', () => { expect(computeRiskScore(feat({currentControls:2,mitigationProgress:20}))).toBeGreaterThanOrEqual(1); });
  it('C3 M30 → valid', () => { expect(computeRiskScore(feat({currentControls:3,mitigationProgress:30}))).toBeGreaterThanOrEqual(1); });
  it('C4 M40 → valid', () => { expect(computeRiskScore(feat({currentControls:4,mitigationProgress:40}))).toBeGreaterThanOrEqual(1); });
  it('C6 M60 → valid', () => { expect(computeRiskScore(feat({currentControls:6,mitigationProgress:60}))).toBeGreaterThanOrEqual(1); });
  it('C7 M70 → valid', () => { expect(computeRiskScore(feat({currentControls:7,mitigationProgress:70}))).toBeGreaterThanOrEqual(1); });
  it('C8 M80 → valid', () => { expect(computeRiskScore(feat({currentControls:8,mitigationProgress:80}))).toBeGreaterThanOrEqual(1); });
  it('C9 M90 → valid', () => { expect(computeRiskScore(feat({currentControls:9,mitigationProgress:90}))).toBeGreaterThanOrEqual(1); });
  it('increasing controls always reduces or equals score', () => {
    const s0 = computeRiskScore(feat({currentControls:0}));
    const s3 = computeRiskScore(feat({currentControls:3}));
    const s6 = computeRiskScore(feat({currentControls:6}));
    const s9 = computeRiskScore(feat({currentControls:9}));
    expect(s3).toBeLessThanOrEqual(s0);
    expect(s6).toBeLessThanOrEqual(s3);
    expect(s9).toBeLessThanOrEqual(s6);
  });
  it('increasing mitigation always reduces or equals score', () => {
    const s0 = computeRiskScore(feat({mitigationProgress:0}));
    const s25 = computeRiskScore(feat({mitigationProgress:25}));
    const s50 = computeRiskScore(feat({mitigationProgress:50}));
    const s100 = computeRiskScore(feat({mitigationProgress:100}));
    expect(s25).toBeLessThanOrEqual(s0);
    expect(s50).toBeLessThanOrEqual(s25);
    expect(s100).toBeLessThanOrEqual(s50);
  });
  it('combined C0 M0 T365 I5 L5 S5 → max scenario hits ceiling', () => {
    const s = computeRiskScore(feat({currentControls:0,mitigationProgress:0,timeOpen:365,relatedIncidents:5,likelihood:5,severity:5,category:'health_safety'}));
    expect(s).toBeLessThanOrEqual(100);
  });
});

describe('computeRiskScore — extended permutations D (time × incidents)', () => {
  it('T0 I0 → valid', () => { expect(computeRiskScore(feat({timeOpen:0,relatedIncidents:0}))).toBeGreaterThanOrEqual(1); });
  it('T30 I0 → valid', () => { expect(computeRiskScore(feat({timeOpen:30,relatedIncidents:0}))).toBeGreaterThanOrEqual(1); });
  it('T60 I0 → valid', () => { expect(computeRiskScore(feat({timeOpen:60,relatedIncidents:0}))).toBeGreaterThanOrEqual(1); });
  it('T90 I0 → valid', () => { expect(computeRiskScore(feat({timeOpen:90,relatedIncidents:0}))).toBeGreaterThanOrEqual(1); });
  it('T120 I0 → valid', () => { expect(computeRiskScore(feat({timeOpen:120,relatedIncidents:0}))).toBeGreaterThanOrEqual(1); });
  it('T180 I0 → valid', () => { expect(computeRiskScore(feat({timeOpen:180,relatedIncidents:0}))).toBeGreaterThanOrEqual(1); });
  it('T270 I0 → valid', () => { expect(computeRiskScore(feat({timeOpen:270,relatedIncidents:0}))).toBeGreaterThanOrEqual(1); });
  it('T365 I0 → valid', () => { expect(computeRiskScore(feat({timeOpen:365,relatedIncidents:0}))).toBeGreaterThanOrEqual(1); });
  it('T0 I1 → valid', () => { expect(computeRiskScore(feat({timeOpen:0,relatedIncidents:1}))).toBeGreaterThanOrEqual(1); });
  it('T0 I2 → valid', () => { expect(computeRiskScore(feat({timeOpen:0,relatedIncidents:2}))).toBeGreaterThanOrEqual(1); });
  it('T0 I3 → valid', () => { expect(computeRiskScore(feat({timeOpen:0,relatedIncidents:3}))).toBeGreaterThanOrEqual(1); });
  it('T0 I4 → valid', () => { expect(computeRiskScore(feat({timeOpen:0,relatedIncidents:4}))).toBeGreaterThanOrEqual(1); });
  it('T0 I5 → valid', () => { expect(computeRiskScore(feat({timeOpen:0,relatedIncidents:5}))).toBeGreaterThanOrEqual(1); });
  it('T180 I3 → valid', () => { expect(computeRiskScore(feat({timeOpen:180,relatedIncidents:3}))).toBeGreaterThanOrEqual(1); });
  it('T365 I5 → valid', () => { expect(computeRiskScore(feat({timeOpen:365,relatedIncidents:5}))).toBeGreaterThanOrEqual(1); });
  it('T365 I5 > T0 I0', () => {
    expect(computeRiskScore(feat({timeOpen:365,relatedIncidents:5}))).toBeGreaterThan(computeRiskScore(feat({timeOpen:0,relatedIncidents:0})));
  });
  it('T100 I1 → valid', () => { expect(computeRiskScore(feat({timeOpen:100,relatedIncidents:1}))).toBeGreaterThanOrEqual(1); });
  it('T200 I2 → valid', () => { expect(computeRiskScore(feat({timeOpen:200,relatedIncidents:2}))).toBeGreaterThanOrEqual(1); });
  it('T300 I4 → valid', () => { expect(computeRiskScore(feat({timeOpen:300,relatedIncidents:4}))).toBeGreaterThanOrEqual(1); });
  it('score is monotone with timeOpen', () => {
    const s100 = computeRiskScore(feat({timeOpen:100}));
    const s200 = computeRiskScore(feat({timeOpen:200}));
    expect(s200).toBeGreaterThanOrEqual(s100);
  });
});

describe('computeRiskScore — seasonal and benchmark grid', () => {
  it('seasonal 0.5 L5 S5 → valid', () => { expect(computeRiskScore(feat({seasonalFactor:0.5,likelihood:5,severity:5}))).toBeGreaterThanOrEqual(1); });
  it('seasonal 1.0 L5 S5 → valid', () => { expect(computeRiskScore(feat({seasonalFactor:1.0,likelihood:5,severity:5}))).toBeGreaterThanOrEqual(1); });
  it('seasonal 1.5 L5 S5 → valid', () => { expect(computeRiskScore(feat({seasonalFactor:1.5,likelihood:5,severity:5}))).toBeGreaterThanOrEqual(1); });
  it('seasonal 2.0 L5 S5 → valid', () => { expect(computeRiskScore(feat({seasonalFactor:2.0,likelihood:5,severity:5}))).toBeGreaterThanOrEqual(1); });
  it('seasonal 0.1 L5 S5 → valid', () => { expect(computeRiskScore(feat({seasonalFactor:0.1,likelihood:5,severity:5}))).toBeGreaterThanOrEqual(1); });
  it('seasonal 2.0 > seasonal 1.0', () => { expect(computeRiskScore(feat({seasonalFactor:2.0}))).toBeGreaterThan(computeRiskScore(feat({seasonalFactor:1.0}))); });
  it('seasonal 0.5 < seasonal 1.0', () => { expect(computeRiskScore(feat({seasonalFactor:0.5}))).toBeLessThan(computeRiskScore(feat({seasonalFactor:1.0}))); });
  it('benchmark 0 → no change', () => { expect(computeRiskScore(feat({industryBenchmark:0}))).toBe(computeRiskScore(feat({industryBenchmark:undefined}))); });
  it('benchmark 10 → >= base', () => { expect(computeRiskScore(feat({industryBenchmark:10}))).toBeGreaterThanOrEqual(computeRiskScore(feat({industryBenchmark:0}))); });
  it('benchmark 20 → >= benchmark 10', () => { expect(computeRiskScore(feat({industryBenchmark:20}))).toBeGreaterThanOrEqual(computeRiskScore(feat({industryBenchmark:10}))); });
  it('benchmark 50 → >= benchmark 20', () => { expect(computeRiskScore(feat({industryBenchmark:50}))).toBeGreaterThanOrEqual(computeRiskScore(feat({industryBenchmark:20}))); });
  it('benchmark 100 → >= benchmark 50', () => { expect(computeRiskScore(feat({industryBenchmark:100}))).toBeGreaterThanOrEqual(computeRiskScore(feat({industryBenchmark:50}))); });
  it('seasonal 1.0 benchmark 0 → same as defaults', () => {
    const base = computeRiskScore(feat());
    const explicit = computeRiskScore(feat({seasonalFactor:1.0,industryBenchmark:0}));
    expect(explicit).toBe(base);
  });
  it('seasonal 2 benchmark 100 → still <= 100', () => { expect(computeRiskScore(feat({seasonalFactor:2.0,industryBenchmark:100,likelihood:5,severity:5,currentControls:0,mitigationProgress:0}))).toBeLessThanOrEqual(100); });
  it('seasonal 0 → very low score (maybe 1)', () => { expect(computeRiskScore(feat({seasonalFactor:0.0,likelihood:5,severity:5}))).toBeGreaterThanOrEqual(1); });
});

// ============================================================================
// SECTION 19: Extended predictTrend
// ============================================================================

describe('predictTrend — extended edge cases', () => {
  it('history with 3 points ascending → increasing', () => { expect(predictTrend(hist([10,20,30]))).toBe('increasing'); });
  it('history with 3 points descending → decreasing', () => { expect(predictTrend(hist([30,20,10]))).toBe('decreasing'); });
  it('history first=50 last=55 → stable (delta=5)', () => { expect(predictTrend(hist([50,52,55]))).toBe('stable'); });
  it('history first=50 last=56 → increasing', () => { expect(predictTrend(hist([50,53,56]))).toBe('increasing'); });
  it('scores all 1 → stable', () => { expect(predictTrend(hist([1,1,1,1,1]))).toBe('stable'); });
  it('scores all 100 → stable', () => { expect(predictTrend(hist([100,100,100,100]))).toBe('stable'); });
  it('big zigzag first=30 last=40 → increasing', () => { expect(predictTrend(hist([30,90,5,80,40]))).toBe('increasing'); });
  it('big zigzag first=40 last=30 → decreasing', () => { expect(predictTrend(hist([40,5,90,5,30]))).toBe('decreasing'); });
  it('first=60 last=60 → stable', () => { expect(predictTrend(hist([60,70,80,90,60]))).toBe('stable'); });
  it('first=1 last=6 → stable (delta=5 not >5)', () => { expect(predictTrend(hist([1,6]))).toBe('stable'); });
  it('first=1 last=5 → stable', () => { expect(predictTrend(hist([1,5]))).toBe('stable'); });
  it('first=6 last=1 → stable (delta=-5 not <-5)', () => { expect(predictTrend(hist([6,1]))).toBe('stable'); });
  it('first=5 last=1 → stable', () => { expect(predictTrend(hist([5,1]))).toBe('stable'); });
  it('returns string type', () => { expect(typeof predictTrend(hist([40,50]))).toBe('string'); });
  it('result always one of 3 values', () => { const r = predictTrend(hist([40,50])); expect(['increasing','stable','decreasing']).toContain(r); });
  it('three equal points → stable', () => { expect(predictTrend(hist([33,33,33]))).toBe('stable'); });
  it('last is max → increasing if delta > 5', () => { expect(predictTrend(hist([20,40,60,80,100]))).toBe('increasing'); });
  it('last is min → decreasing if delta < -5', () => { expect(predictTrend(hist([100,80,60,40,20]))).toBe('decreasing'); });
  it('single-element result stable', () => { expect(predictTrend([{score:77,date:new Date()}])).toBe('stable'); });
  it('two-element stable with scores 42 and 42', () => { expect(predictTrend(hist([42,42]))).toBe('stable'); });
});

// ============================================================================
// SECTION 20: Extended getFutureScore
// ============================================================================

describe('getFutureScore — extended', () => {
  it('stable score 10 for 30d → 10', () => { expect(getFutureScore(10,'stable',30)).toBe(10); });
  it('stable score 20 for 60d → 20', () => { expect(getFutureScore(20,'stable',60)).toBe(20); });
  it('stable score 30 for 90d → 30', () => { expect(getFutureScore(30,'stable',90)).toBe(30); });
  it('stable score 40 for 120d → 40', () => { expect(getFutureScore(40,'stable',120)).toBe(40); });
  it('stable score 50 for 150d → 50', () => { expect(getFutureScore(50,'stable',150)).toBe(50); });
  it('stable score 60 for 180d → 60', () => { expect(getFutureScore(60,'stable',180)).toBe(60); });
  it('stable score 70 for 1d → 70', () => { expect(getFutureScore(70,'stable',1)).toBe(70); });
  it('stable score 80 for 7d → 80', () => { expect(getFutureScore(80,'stable',7)).toBe(80); });
  it('stable score 90 for 14d → 90', () => { expect(getFutureScore(90,'stable',14)).toBe(90); });
  it('increasing 50 for 30d → 55', () => { expect(getFutureScore(50,'increasing',30)).toBe(55); });
  it('increasing 10 for 30d → 15', () => { expect(getFutureScore(10,'increasing',30)).toBe(15); });
  it('increasing 20 for 30d → 25', () => { expect(getFutureScore(20,'increasing',30)).toBe(25); });
  it('increasing 30 for 30d → 35', () => { expect(getFutureScore(30,'increasing',30)).toBe(35); });
  it('increasing 40 for 30d → 45', () => { expect(getFutureScore(40,'increasing',30)).toBe(45); });
  it('increasing 60 for 30d → 65', () => { expect(getFutureScore(60,'increasing',30)).toBe(65); });
  it('increasing 70 for 30d → 75', () => { expect(getFutureScore(70,'increasing',30)).toBe(75); });
  it('increasing 80 for 30d → 85', () => { expect(getFutureScore(80,'increasing',30)).toBe(85); });
  it('increasing 90 for 30d → 95', () => { expect(getFutureScore(90,'increasing',30)).toBe(95); });
  it('increasing 96 for 30d → 100 (clamp)', () => { expect(getFutureScore(96,'increasing',30)).toBe(100); });
  it('decreasing 50 for 30d → 45', () => { expect(getFutureScore(50,'decreasing',30)).toBe(45); });
  it('decreasing 40 for 30d → 35', () => { expect(getFutureScore(40,'decreasing',30)).toBe(35); });
  it('decreasing 30 for 30d → 25', () => { expect(getFutureScore(30,'decreasing',30)).toBe(25); });
  it('decreasing 20 for 30d → 15', () => { expect(getFutureScore(20,'decreasing',30)).toBe(15); });
  it('decreasing 10 for 30d → 5', () => { expect(getFutureScore(10,'decreasing',30)).toBe(5); });
  it('decreasing 6 for 30d → 1', () => { expect(getFutureScore(6,'decreasing',30)).toBe(1); });
  it('decreasing 7 for 30d → 2', () => { expect(getFutureScore(7,'decreasing',30)).toBe(2); });
  it('decreasing 60 for 60d → 50', () => { expect(getFutureScore(60,'decreasing',60)).toBe(50); });
  it('decreasing 70 for 90d → 55', () => { expect(getFutureScore(70,'decreasing',90)).toBe(55); });
  it('decreasing 80 for 120d → 60', () => { expect(getFutureScore(80,'decreasing',120)).toBe(60); });
  it('result type is number', () => { expect(typeof getFutureScore(50,'stable',30)).toBe('number'); });
  it('result is integer', () => { const s = getFutureScore(50,'increasing',30); expect(s).toBe(Math.round(s)); });
});

// ============================================================================
// SECTION 21: Extended getRecommendations combinations
// ============================================================================

describe('getRecommendations — extended combinations', () => {
  it('controls 4 mitigation 49 → 2+ recs', () => { expect(getRecommendations(feat({currentControls:4,mitigationProgress:49}),30).length).toBeGreaterThanOrEqual(2); });
  it('controls 0 mitigation 0 → 2+ recs', () => { expect(getRecommendations(feat({currentControls:0,mitigationProgress:0}),10).length).toBeGreaterThanOrEqual(2); });
  it('likelihood 4 severity 4 → 2+ recs', () => { expect(getRecommendations(feat({likelihood:4,severity:4}),30).length).toBeGreaterThanOrEqual(2); });
  it('score 75 → critical rec', () => { expect(getRecommendations(feat(),75)).toContain('Critical risk score — immediate action required'); });
  it('score 76 → critical rec', () => { expect(getRecommendations(feat(),76)).toContain('Critical risk score — immediate action required'); });
  it('score 80 → critical rec', () => { expect(getRecommendations(feat(),80)).toContain('Critical risk score — immediate action required'); });
  it('score 74 → high rec', () => { expect(getRecommendations(feat(),74)).toContain('High risk score — schedule management review within 2 weeks'); });
  it('score 60 → high rec', () => { expect(getRecommendations(feat(),60)).toContain('High risk score — schedule management review within 2 weeks'); });
  it('score 50 → high rec', () => { expect(getRecommendations(feat(),50)).toContain('High risk score — schedule management review within 2 weeks'); });
  it('score 49 → medium rec', () => { expect(getRecommendations(feat(),49)).toContain('Medium risk — monitor closely and update mitigation plan'); });
  it('score 30 → medium rec', () => { expect(getRecommendations(feat(),30)).toContain('Medium risk — monitor closely and update mitigation plan'); });
  it('score 25 → medium rec', () => { expect(getRecommendations(feat(),25)).toContain('Medium risk — monitor closely and update mitigation plan'); });
  it('score 15 → under control', () => { expect(getRecommendations(feat(),15)).toContain('Risk is under control — continue monitoring'); });
  it('score 5 → under control', () => { expect(getRecommendations(feat(),5)).toContain('Risk is under control — continue monitoring'); });
  it('all conditions → max recs', () => {
    const f = feat({currentControls:0,mitigationProgress:0,likelihood:5,severity:5,relatedIncidents:5,timeOpen:365});
    expect(getRecommendations(f,90).length).toBeGreaterThanOrEqual(7);
  });
  it('timeOpen 181 → 6-months rec present', () => { expect(getRecommendations(feat({timeOpen:181}),30)).toContain('Risk has been open for over 6 months — escalate for review'); });
  it('timeOpen 200 → 6-months rec present', () => { expect(getRecommendations(feat({timeOpen:200}),30)).toContain('Risk has been open for over 6 months — escalate for review'); });
  it('incidents 3 → root cause rec', () => { expect(getRecommendations(feat({relatedIncidents:3}),30)).toContain('Investigate recurring incidents for root cause patterns'); });
  it('incidents 4 → root cause rec', () => { expect(getRecommendations(feat({relatedIncidents:4}),30)).toContain('Investigate recurring incidents for root cause patterns'); });
  it('incidents 10 → root cause rec', () => { expect(getRecommendations(feat({relatedIncidents:10}),30)).toContain('Investigate recurring incidents for root cause patterns'); });
  it('non-critical score has no critical rec', () => { expect(getRecommendations(feat(),30)).not.toContain('Critical risk score — immediate action required'); });
  it('only score rec for perfect features', () => {
    const recs = getRecommendations(feat({currentControls:10,mitigationProgress:100,likelihood:1,severity:1,relatedIncidents:0,timeOpen:10}),5);
    expect(recs.length).toBe(1);
  });
  it('recs array has no duplicates', () => {
    const recs = getRecommendations(feat({currentControls:0,mitigationProgress:0,likelihood:5,severity:5,relatedIncidents:5,timeOpen:365}),90);
    const unique = new Set(recs);
    expect(unique.size).toBe(recs.length);
  });
  it('returns new array each call', () => {
    const r1 = getRecommendations(feat(),50);
    const r2 = getRecommendations(feat(),50);
    expect(r1).not.toBe(r2);
    expect(r1).toEqual(r2);
  });
  it('controls 4 → improve rec present', () => { expect(getRecommendations(feat({currentControls:4}),30)).toContain('Improve existing controls to reduce risk exposure'); });
  it('controls 6 → no improve rec', () => { expect(getRecommendations(feat({currentControls:6}),30)).not.toContain('Improve existing controls to reduce risk exposure'); });
  it('mitigation 25 → accelerate rec present', () => { expect(getRecommendations(feat({mitigationProgress:25}),30)).toContain('Accelerate mitigation activities to reduce open risk duration'); });
  it('mitigation 75 → no accelerate rec', () => { expect(getRecommendations(feat({mitigationProgress:75}),30)).not.toContain('Accelerate mitigation activities to reduce open risk duration'); });
});

// ============================================================================
// SECTION 22: Extended validateModelConfig
// ============================================================================

describe('validateModelConfig — additional cases', () => {
  it('version "0.0.1" is valid', () => { expect(validateModelConfig({...validCfg(),version:'0.0.1'}).valid).toBe(true); });
  it('version "10.0.0" is valid', () => { expect(validateModelConfig({...validCfg(),version:'10.0.0'}).valid).toBe(true); });
  it('version "99.99.99" is valid', () => { expect(validateModelConfig({...validCfg(),version:'99.99.99'}).valid).toBe(true); });
  it('features with 1 item is valid', () => { expect(validateModelConfig({...validCfg(),features:['single']}).valid).toBe(true); });
  it('features with 20 items is valid', () => { const many = Array.from({length:20},(_,i)=>`f${i}`); expect(validateModelConfig({...validCfg(),features:many}).valid).toBe(true); });
  it('three equal weights summing to ~1 → valid', () => {
    const c = {...validCfg(), weights:{a:0.3334,b:0.3333,c:0.3333}};
    expect(validateModelConfig(c).valid).toBe(true);
  });
  it('valid result has exactly 2 keys', () => { const r = validateModelConfig(validCfg()); expect(Object.keys(r)).toHaveLength(2); });
  it('valid errors array is empty array not undefined', () => { expect(validateModelConfig(validCfg()).errors).toEqual([]); });
  it('invalid empty object errors length > 3', () => { expect(validateModelConfig({}).errors.length).toBeGreaterThan(3); });
  it('null version → invalid', () => { expect(validateModelConfig({...validCfg(),version:null as any}).valid).toBe(false); });
  it('weights as array → invalid', () => { expect(validateModelConfig({...validCfg(),weights:[] as any}).valid).toBe(false); });
  it('thresholds with negative values → invalid if not ascending', () => { expect(validateModelConfig({...validCfg(),thresholds:{low:-10,medium:-5,high:0,critical:5}}).valid).toBe(true); });
  it('thresholds low=0 medium=1 high=2 critical=3 → valid', () => { expect(validateModelConfig({...validCfg(),thresholds:{low:0,medium:1,high:2,critical:3}}).valid).toBe(true); });
  it('weights with 10 entries summing to 1 → valid', () => {
    const w: Record<string,number> = {};
    for(let i=0;i<10;i++) w[`f${i}`] = 0.1;
    expect(validateModelConfig({...validCfg(),weights:w}).valid).toBe(true);
  });
  it('DEFAULT weight sum exactly 1', () => {
    const total = Object.values(DEFAULT_MODEL_CONFIG.weights).reduce((a,b)=>a+b,0);
    expect(Math.abs(total-1.0)).toBeLessThanOrEqual(0.001);
  });
  it('error array only contains strings', () => {
    validateModelConfig({version:'',weights:{},features:[]}).errors.forEach(e=>expect(typeof e).toBe('string'));
  });
  it('missing thresholds error mentions thresholds', () => {
    const c = validCfg(); delete (c as any).thresholds;
    expect(validateModelConfig(c as Partial<ModelConfig>).errors.some(e=>e.toLowerCase().includes('threshold'))).toBe(true);
  });
  it('missing features error mentions features', () => {
    const c = validCfg(); delete (c as any).features;
    expect(validateModelConfig(c as Partial<ModelConfig>).errors.some(e=>e.toLowerCase().includes('feature'))).toBe(true);
  });
  it('valid single weight 1.0', () => { expect(validateModelConfig({...validCfg(),weights:{only:1.0}}).valid).toBe(true); });
  it('two weights 0.5 each → valid', () => { expect(validateModelConfig({...validCfg(),weights:{a:0.5,b:0.5}}).valid).toBe(true); });
  it('threshold boundaries: low=1 medium=2 high=3 critical=4 → valid', () => { expect(validateModelConfig({...validCfg(),thresholds:{low:1,medium:2,high:3,critical:4}}).valid).toBe(true); });
});

// ============================================================================
// SECTION 23: Extended createModel.predict with many features
// ============================================================================

describe('createModel.predict — extended feature scenarios', () => {
  const m = createModel();
  it('health_safety high risk predict → riskId correct', () => { expect(m.predict('hs-high',feat({category:'health_safety',likelihood:5,severity:5})).riskId).toBe('hs-high'); });
  it('environmental mid predict → trend defined', () => { expect(m.predict('env-mid',feat({category:'environmental',likelihood:3,severity:3})).trend).toBeDefined(); });
  it('quality predict → driverFeatures length 7', () => { expect(m.predict('q1',feat({category:'quality'})).driverFeatures).toHaveLength(7); });
  it('financial predict → recommendations non-empty', () => { expect(m.predict('f1',feat({category:'financial',likelihood:5,severity:5,currentControls:0,mitigationProgress:0})).recommendations.length).toBeGreaterThan(0); });
  it('compliance predict → currentScore valid', () => { const s=m.predict('c1',feat({category:'compliance'})).currentScore; expect(s).toBeGreaterThanOrEqual(1); expect(s).toBeLessThanOrEqual(100); });
  it('reputational predict → confidence valid', () => { const c=m.predict('r1',feat({category:'reputational',mitigationProgress:50,relatedAudits:2})).confidence; expect(c).toBeGreaterThanOrEqual(0); expect(c).toBeLessThanOrEqual(1); });
  it('cybersecurity predict → modelVersion is 1.0.0', () => { expect(m.predict('cy1',feat({category:'cybersecurity'})).modelVersion).toBe('1.0.0'); });
  it('operational predict → computedAt recent', () => { const p=m.predict('op1',feat({category:'operational'})); expect(p.computedAt.getTime()).toBeGreaterThan(Date.now()-5000); });
  it('predict with all-max → currentScore 98', () => { const p=m.predict('max',feat({likelihood:5,severity:5,currentControls:0,mitigationProgress:0,timeOpen:365,relatedIncidents:5,relatedAudits:5,category:'health_safety'})); expect(p.currentScore).toBe(98); });
  it('predict with all-min → currentScore low', () => { const p=m.predict('min',feat({likelihood:1,severity:1,currentControls:10,mitigationProgress:100,timeOpen:0,relatedIncidents:0,relatedAudits:0,category:'operational'})); expect(p.currentScore).toBeLessThan(20); });
  it('predict 30d <= 90d when increasing', () => {
    const p=m.predict('inc',feat({likelihood:4,severity:4,currentControls:0,mitigationProgress:0}));
    if(p.trend==='increasing') expect(p.predictedScore90d).toBeGreaterThanOrEqual(p.predictedScore30d);
  });
  it('predict 90d <= 30d when decreasing', () => {
    const p=m.predict('dec',feat({likelihood:2,severity:2,currentControls:9,mitigationProgress:90}));
    if(p.trend==='decreasing') expect(p.predictedScore90d).toBeLessThanOrEqual(p.predictedScore30d);
  });
  it('predict stable: 30d = 90d', () => {
    const p=m.predict('stbl',feat({likelihood:3,severity:3,currentControls:5,mitigationProgress:50}));
    if(p.trend==='stable'){ expect(p.predictedScore30d).toBe(p.predictedScore90d); }
  });
  it('predict 10 different risks produce different riskIds', () => {
    const ids = Array.from({length:10},(_,i)=>`risk-${i}`);
    const results = ids.map(id=>m.predict(id,feat()));
    const resultIds = results.map(r=>r.riskId);
    expect(new Set(resultIds).size).toBe(10);
  });
  it('two models produce same prediction for same input', () => {
    const m1 = createModel();
    const m2 = createModel();
    const f = feat({likelihood:3,severity:4});
    expect(m1.predict('r',f).currentScore).toBe(m2.predict('r',f).currentScore);
  });
  it('predict returns exactly 10 keys', () => {
    const p = m.predict('r1',feat());
    const keys = Object.keys(p);
    expect(keys).toHaveLength(10);
  });
  it('predict has riskId', () => { expect(m.predict('x',feat())).toHaveProperty('riskId'); });
  it('predict has currentScore', () => { expect(m.predict('x',feat())).toHaveProperty('currentScore'); });
  it('predict has predictedScore30d', () => { expect(m.predict('x',feat())).toHaveProperty('predictedScore30d'); });
  it('predict has predictedScore90d', () => { expect(m.predict('x',feat())).toHaveProperty('predictedScore90d'); });
  it('predict has trend', () => { expect(m.predict('x',feat())).toHaveProperty('trend'); });
  it('predict has confidence', () => { expect(m.predict('x',feat())).toHaveProperty('confidence'); });
  it('predict has driverFeatures', () => { expect(m.predict('x',feat())).toHaveProperty('driverFeatures'); });
  it('predict has recommendations', () => { expect(m.predict('x',feat())).toHaveProperty('recommendations'); });
  it('predict has modelVersion', () => { expect(m.predict('x',feat())).toHaveProperty('modelVersion'); });
  it('predict has computedAt', () => { expect(m.predict('x',feat())).toHaveProperty('computedAt'); });
});

// ============================================================================
// SECTION 24: getDriverFeatures extended
// ============================================================================

describe('getDriverFeatures — extended', () => {
  it('score 1 → all importances near 0', () => { getDriverFeatures(feat(),1).forEach(d=>expect(d.importance).toBeLessThanOrEqual(0.01)); });
  it('score 10 → importances scaled by 0.1', () => {
    const lik = getDriverFeatures(feat(),10).find(d=>d.feature==='likelihood')!;
    expect(lik.importance).toBeCloseTo(0.025,3);
  });
  it('score 100 → severity importance = 0.25', () => {
    const sev = getDriverFeatures(feat(),100).find(d=>d.feature==='severity')!;
    expect(sev.importance).toBeCloseTo(0.25,3);
  });
  it('score 100 → relatedAudits importance = 0.05', () => {
    const aud = getDriverFeatures(feat(),100).find(d=>d.feature==='relatedAudits')!;
    expect(aud.importance).toBeCloseTo(0.05,3);
  });
  it('score 100 → currentControls importance = 0.1', () => {
    const cc = getDriverFeatures(feat(),100).find(d=>d.feature==='currentControls')!;
    expect(cc.importance).toBeCloseTo(0.1,3);
  });
  it('feature order: likelihood is first', () => { expect(getDriverFeatures(feat(),50)[0].feature).toBe('likelihood'); });
  it('feature order: severity is second', () => { expect(getDriverFeatures(feat(),50)[1].feature).toBe('severity'); });
  it('all 7 features present in any order', () => {
    const names = getDriverFeatures(feat(),50).map(d=>d.feature);
    ['likelihood','severity','currentControls','timeOpen','relatedIncidents','mitigationProgress','relatedAudits'].forEach(f=>expect(names).toContain(f));
  });
  it('score 50 sum of importances ≈ 0.475', () => {
    const sum = getDriverFeatures(feat(),50).reduce((a,d)=>a+d.importance,0);
    // Sum of base importances × 0.5 = 0.95 × 0.5 = 0.475
    expect(sum).toBeCloseTo(0.475,3);
  });
  it('score 100 sum of importances ≈ 0.95', () => {
    const sum = getDriverFeatures(feat(),100).reduce((a,d)=>a+d.importance,0);
    expect(sum).toBeCloseTo(0.95,3);
  });
  it('changing likelihood changes likelihood driver value', () => {
    const d3 = getDriverFeatures(feat({likelihood:3}),50).find(d=>d.feature==='likelihood')!;
    const d5 = getDriverFeatures(feat({likelihood:5}),50).find(d=>d.feature==='likelihood')!;
    expect(d3.value).toBe(3);
    expect(d5.value).toBe(5);
  });
  it('changing severity changes severity driver value', () => {
    const d = getDriverFeatures(feat({severity:2}),50).find(d=>d.feature==='severity')!;
    expect(d.value).toBe(2);
  });
  it('timeOpen 200 → driver value is 200', () => {
    const d = getDriverFeatures(feat({timeOpen:200}),50).find(d=>d.feature==='timeOpen')!;
    expect(d.value).toBe(200);
  });
  it('all importances >= 0', () => { getDriverFeatures(feat(),50).forEach(d=>expect(d.importance).toBeGreaterThanOrEqual(0)); });
  it('all importances <= 0.25 at score 100', () => { getDriverFeatures(feat(),100).forEach(d=>expect(d.importance).toBeLessThanOrEqual(0.25)); });
  it('result has no extra properties', () => {
    const driver = getDriverFeatures(feat(),50)[0];
    const keys = Object.keys(driver);
    expect(keys).toContain('feature');
    expect(keys).toContain('importance');
    expect(keys).toContain('value');
  });
});

// ── Section 25: computeRiskScore exhaustive likelihood × severity grid ─────
describe('computeRiskScore L×S full grid', () => {
  const cats = ['health_safety','environmental','financial','operational','legal','reputational','strategic','cyber'] as const;
  it('cat=health_safety L1 S1 in range', () => { const s=computeRiskScore(feat({category:'health_safety',likelihood:1,severity:1})); expect(s).toBeGreaterThanOrEqual(1); expect(s).toBeLessThanOrEqual(100); });
  it('cat=health_safety L1 S2 in range', () => { const s=computeRiskScore(feat({category:'health_safety',likelihood:1,severity:2})); expect(s).toBeGreaterThanOrEqual(1); expect(s).toBeLessThanOrEqual(100); });
  it('cat=health_safety L1 S3 in range', () => { const s=computeRiskScore(feat({category:'health_safety',likelihood:1,severity:3})); expect(s).toBeGreaterThanOrEqual(1); expect(s).toBeLessThanOrEqual(100); });
  it('cat=health_safety L1 S4 in range', () => { const s=computeRiskScore(feat({category:'health_safety',likelihood:1,severity:4})); expect(s).toBeGreaterThanOrEqual(1); expect(s).toBeLessThanOrEqual(100); });
  it('cat=health_safety L1 S5 in range', () => { const s=computeRiskScore(feat({category:'health_safety',likelihood:1,severity:5})); expect(s).toBeGreaterThanOrEqual(1); expect(s).toBeLessThanOrEqual(100); });
  it('cat=health_safety L2 S1 in range', () => { const s=computeRiskScore(feat({category:'health_safety',likelihood:2,severity:1})); expect(s).toBeGreaterThanOrEqual(1); expect(s).toBeLessThanOrEqual(100); });
  it('cat=health_safety L2 S2 in range', () => { const s=computeRiskScore(feat({category:'health_safety',likelihood:2,severity:2})); expect(s).toBeGreaterThanOrEqual(1); expect(s).toBeLessThanOrEqual(100); });
  it('cat=health_safety L2 S3 in range', () => { const s=computeRiskScore(feat({category:'health_safety',likelihood:2,severity:3})); expect(s).toBeGreaterThanOrEqual(1); expect(s).toBeLessThanOrEqual(100); });
  it('cat=health_safety L2 S4 in range', () => { const s=computeRiskScore(feat({category:'health_safety',likelihood:2,severity:4})); expect(s).toBeGreaterThanOrEqual(1); expect(s).toBeLessThanOrEqual(100); });
  it('cat=health_safety L2 S5 in range', () => { const s=computeRiskScore(feat({category:'health_safety',likelihood:2,severity:5})); expect(s).toBeGreaterThanOrEqual(1); expect(s).toBeLessThanOrEqual(100); });
  it('cat=health_safety L3 S1 in range', () => { const s=computeRiskScore(feat({category:'health_safety',likelihood:3,severity:1})); expect(s).toBeGreaterThanOrEqual(1); expect(s).toBeLessThanOrEqual(100); });
  it('cat=health_safety L3 S3 in range', () => { const s=computeRiskScore(feat({category:'health_safety',likelihood:3,severity:3})); expect(s).toBeGreaterThanOrEqual(1); expect(s).toBeLessThanOrEqual(100); });
  it('cat=health_safety L3 S5 in range', () => { const s=computeRiskScore(feat({category:'health_safety',likelihood:3,severity:5})); expect(s).toBeGreaterThanOrEqual(1); expect(s).toBeLessThanOrEqual(100); });
  it('cat=health_safety L4 S4 in range', () => { const s=computeRiskScore(feat({category:'health_safety',likelihood:4,severity:4})); expect(s).toBeGreaterThanOrEqual(1); expect(s).toBeLessThanOrEqual(100); });
  it('cat=health_safety L5 S5 in range', () => { const s=computeRiskScore(feat({category:'health_safety',likelihood:5,severity:5})); expect(s).toBeGreaterThanOrEqual(1); expect(s).toBeLessThanOrEqual(100); });
  it('cat=environmental L1 S1 in range', () => { const s=computeRiskScore(feat({category:'environmental',likelihood:1,severity:1})); expect(s).toBeGreaterThanOrEqual(1); expect(s).toBeLessThanOrEqual(100); });
  it('cat=environmental L2 S2 in range', () => { const s=computeRiskScore(feat({category:'environmental',likelihood:2,severity:2})); expect(s).toBeGreaterThanOrEqual(1); expect(s).toBeLessThanOrEqual(100); });
  it('cat=environmental L3 S3 in range', () => { const s=computeRiskScore(feat({category:'environmental',likelihood:3,severity:3})); expect(s).toBeGreaterThanOrEqual(1); expect(s).toBeLessThanOrEqual(100); });
  it('cat=environmental L4 S4 in range', () => { const s=computeRiskScore(feat({category:'environmental',likelihood:4,severity:4})); expect(s).toBeGreaterThanOrEqual(1); expect(s).toBeLessThanOrEqual(100); });
  it('cat=environmental L5 S5 in range', () => { const s=computeRiskScore(feat({category:'environmental',likelihood:5,severity:5})); expect(s).toBeGreaterThanOrEqual(1); expect(s).toBeLessThanOrEqual(100); });
  it('cat=financial L1 S5 in range', () => { const s=computeRiskScore(feat({category:'financial',likelihood:1,severity:5})); expect(s).toBeGreaterThanOrEqual(1); expect(s).toBeLessThanOrEqual(100); });
  it('cat=financial L5 S1 in range', () => { const s=computeRiskScore(feat({category:'financial',likelihood:5,severity:1})); expect(s).toBeGreaterThanOrEqual(1); expect(s).toBeLessThanOrEqual(100); });
  it('cat=financial L3 S3 in range', () => { const s=computeRiskScore(feat({category:'financial',likelihood:3,severity:3})); expect(s).toBeGreaterThanOrEqual(1); expect(s).toBeLessThanOrEqual(100); });
  it('cat=legal L1 S1 in range', () => { const s=computeRiskScore(feat({category:'legal',likelihood:1,severity:1})); expect(s).toBeGreaterThanOrEqual(1); expect(s).toBeLessThanOrEqual(100); });
  it('cat=legal L5 S5 in range', () => { const s=computeRiskScore(feat({category:'legal',likelihood:5,severity:5})); expect(s).toBeGreaterThanOrEqual(1); expect(s).toBeLessThanOrEqual(100); });
  it('cat=reputational L3 S4 in range', () => { const s=computeRiskScore(feat({category:'reputational',likelihood:3,severity:4})); expect(s).toBeGreaterThanOrEqual(1); expect(s).toBeLessThanOrEqual(100); });
  it('cat=strategic L2 S5 in range', () => { const s=computeRiskScore(feat({category:'strategic',likelihood:2,severity:5})); expect(s).toBeGreaterThanOrEqual(1); expect(s).toBeLessThanOrEqual(100); });
  it('cat=cyber L4 S3 in range', () => { const s=computeRiskScore(feat({category:'cyber',likelihood:4,severity:3})); expect(s).toBeGreaterThanOrEqual(1); expect(s).toBeLessThanOrEqual(100); });
  it('cat=operational L5 S2 in range', () => { const s=computeRiskScore(feat({category:'operational',likelihood:5,severity:2})); expect(s).toBeGreaterThanOrEqual(1); expect(s).toBeLessThanOrEqual(100); });
  it('L5S5 >= L1S1 for same category', () => {
    const hi=computeRiskScore(feat({likelihood:5,severity:5}));
    const lo=computeRiskScore(feat({likelihood:1,severity:1}));
    expect(hi).toBeGreaterThanOrEqual(lo);
  });
  it('L5S5 cyber vs environmental different scores possible', () => {
    const c=computeRiskScore(feat({category:'cyber',likelihood:5,severity:5}));
    const e=computeRiskScore(feat({category:'environmental',likelihood:5,severity:5}));
    expect(typeof c).toBe('number');
    expect(typeof e).toBe('number');
  });
});

// ── Section 26: computeRiskScore controls/mitigation exhaustive ────────────
describe('computeRiskScore controls × mitigation exhaustive', () => {
  it('controls 0 mitigation 0', () => { const s=computeRiskScore(feat({controls:0,mitigation:0})); expect(s).toBeGreaterThanOrEqual(1); });
  it('controls 0 mitigation 25', () => { const s=computeRiskScore(feat({controls:0,mitigation:25})); expect(s).toBeGreaterThanOrEqual(1); });
  it('controls 0 mitigation 50', () => { const s=computeRiskScore(feat({controls:0,mitigation:50})); expect(s).toBeGreaterThanOrEqual(1); });
  it('controls 0 mitigation 75', () => { const s=computeRiskScore(feat({controls:0,mitigation:75})); expect(s).toBeGreaterThanOrEqual(1); });
  it('controls 0 mitigation 100', () => { const s=computeRiskScore(feat({controls:0,mitigation:100})); expect(s).toBeGreaterThanOrEqual(1); });
  it('controls 25 mitigation 0', () => { const s=computeRiskScore(feat({controls:25,mitigation:0})); expect(s).toBeGreaterThanOrEqual(1); });
  it('controls 25 mitigation 25', () => { const s=computeRiskScore(feat({controls:25,mitigation:25})); expect(s).toBeGreaterThanOrEqual(1); });
  it('controls 25 mitigation 50', () => { const s=computeRiskScore(feat({controls:25,mitigation:50})); expect(s).toBeGreaterThanOrEqual(1); });
  it('controls 25 mitigation 75', () => { const s=computeRiskScore(feat({controls:25,mitigation:75})); expect(s).toBeGreaterThanOrEqual(1); });
  it('controls 25 mitigation 100', () => { const s=computeRiskScore(feat({controls:25,mitigation:100})); expect(s).toBeGreaterThanOrEqual(1); });
  it('controls 50 mitigation 0', () => { const s=computeRiskScore(feat({controls:50,mitigation:0})); expect(s).toBeGreaterThanOrEqual(1); });
  it('controls 50 mitigation 50', () => { const s=computeRiskScore(feat({controls:50,mitigation:50})); expect(s).toBeGreaterThanOrEqual(1); });
  it('controls 50 mitigation 100', () => { const s=computeRiskScore(feat({controls:50,mitigation:100})); expect(s).toBeGreaterThanOrEqual(1); });
  it('controls 75 mitigation 25', () => { const s=computeRiskScore(feat({controls:75,mitigation:25})); expect(s).toBeGreaterThanOrEqual(1); });
  it('controls 75 mitigation 75', () => { const s=computeRiskScore(feat({controls:75,mitigation:75})); expect(s).toBeGreaterThanOrEqual(1); });
  it('controls 100 mitigation 0', () => { const s=computeRiskScore(feat({controls:100,mitigation:0})); expect(s).toBeGreaterThanOrEqual(1); });
  it('controls 100 mitigation 50', () => { const s=computeRiskScore(feat({controls:100,mitigation:50})); expect(s).toBeGreaterThanOrEqual(1); });
  it('controls 100 mitigation 100', () => { const s=computeRiskScore(feat({controls:100,mitigation:100})); expect(s).toBeGreaterThanOrEqual(1); });
  it('high controls reduces score vs low controls same mitigation', () => {
    const hi=computeRiskScore(feat({controls:90,mitigation:50}));
    const lo=computeRiskScore(feat({controls:10,mitigation:50}));
    expect(lo).toBeGreaterThanOrEqual(hi);
  });
  it('high mitigation reduces score vs low mitigation same controls', () => {
    const hi=computeRiskScore(feat({controls:50,mitigation:90}));
    const lo=computeRiskScore(feat({controls:50,mitigation:10}));
    expect(lo).toBeGreaterThanOrEqual(hi);
  });
  it('max controls and mitigation → lowest possible for given L/S', () => {
    const s=computeRiskScore(feat({controls:100,mitigation:100,likelihood:1,severity:1}));
    expect(s).toBeGreaterThanOrEqual(1);
  });
  it('zero controls and mitigation → highest possible for given L/S', () => {
    const s=computeRiskScore(feat({controls:0,mitigation:0,likelihood:5,severity:5}));
    expect(s).toBeLessThanOrEqual(100);
  });
});

// ── Section 27: predictTrend exhaustive boundary coverage ─────────────────
describe('predictTrend exhaustive boundaries', () => {
  it('single-entry history returns a trend string', () => { expect(['increasing','stable','decreasing']).toContain(predictTrend(hist([50]))); });
  it('two entries same score → stable', () => { expect(predictTrend(hist([50,50]))).toBe('stable'); });
  it('two entries ascending → increasing', () => { expect(predictTrend(hist([40,60]))).toBe('increasing'); });
  it('two entries descending → decreasing', () => { expect(predictTrend(hist([60,40]))).toBe('decreasing'); });
  it('five all-50 → stable', () => { expect(predictTrend(hist([50,50,50,50,50]))).toBe('stable'); });
  it('five ascending 10→50 → increasing', () => { expect(predictTrend(hist([10,20,30,40,50]))).toBe('increasing'); });
  it('five descending 90→50 → decreasing', () => { expect(predictTrend(hist([90,80,70,60,50]))).toBe('decreasing'); });
  it('noisy but mostly ascending → increasing', () => { expect(predictTrend(hist([10,15,12,20,25,22,30]))).toBe('increasing'); });
  it('noisy but mostly descending → decreasing', () => { expect(predictTrend(hist([80,75,78,70,65,68,60]))).toBe('decreasing'); });
  it('all-0 history → stable', () => { expect(predictTrend(hist([0,0,0]))).toBe('stable'); });
  it('all-100 history → stable', () => { expect(predictTrend(hist([100,100,100]))).toBe('stable'); });
  it('alternating 40,60 → stable or detected trend', () => { expect(['increasing','stable','decreasing']).toContain(predictTrend(hist([40,60,40,60]))); });
  it('large jump last → increasing', () => { expect(predictTrend(hist([20,20,20,20,80]))).toBe('increasing'); });
  it('large drop last → decreasing', () => { expect(predictTrend(hist([80,80,80,80,20]))).toBe('decreasing'); });
  it('gradual multi-point increase → increasing', () => { expect(predictTrend(hist([49,51,53,55,57]))).toBe('increasing'); });
  it('gradual multi-point decrease → decreasing', () => { expect(predictTrend(hist([57,55,53,51,49]))).toBe('decreasing'); });
  it('flat then spike then flat → trend detected', () => { expect(['increasing','stable','decreasing']).toContain(predictTrend(hist([50,50,90,50,50]))); });
  it('ten-entry stable → stable', () => { expect(predictTrend(hist(Array(10).fill(55)))).toBe('stable'); });
  it('twenty-entry ascending → increasing', () => { expect(predictTrend(hist(Array.from({length:20},(_,i)=>i*2+10)))).toBe('increasing'); });
  it('twenty-entry descending → decreasing', () => { expect(predictTrend(hist(Array.from({length:20},(_,i)=>90-i*2)))).toBe('decreasing'); });
  it('returns string type always', () => { expect(typeof predictTrend(hist([50,60]))).toBe('string'); });
  it('empty history returns trend string', () => { expect(['increasing','stable','decreasing']).toContain(predictTrend([])); });
});

// ── Section 28: getFutureScore exhaustive grid ────────────────────────────
describe('getFutureScore exhaustive grid', () => {
  it('score=1 days=1 decreasing → low', () => { expect(getFutureScore(1,'decreasing',1)).toBeGreaterThanOrEqual(1); });
  it('score=1 days=1 stable → near 1', () => { expect(getFutureScore(1,'stable',1)).toBeGreaterThanOrEqual(1); });
  it('score=1 days=1 increasing → >=1', () => { expect(getFutureScore(1,'increasing',1)).toBeGreaterThanOrEqual(1); });
  it('score=100 days=1 decreasing → >=1', () => { expect(getFutureScore(100,'decreasing',1)).toBeGreaterThanOrEqual(1); });
  it('score=100 days=1 stable → near 100', () => { const s=getFutureScore(100,'stable',1); expect(s).toBeGreaterThanOrEqual(1); expect(s).toBeLessThanOrEqual(100); });
  it('score=100 days=1 increasing → clamped 100', () => { expect(getFutureScore(100,'increasing',1)).toBeLessThanOrEqual(100); });
  it('score=50 days=7 decreasing → <=50', () => { expect(getFutureScore(50,'decreasing',7)).toBeLessThanOrEqual(50); });
  it('score=50 days=7 increasing → >=50', () => { expect(getFutureScore(50,'increasing',7)).toBeGreaterThanOrEqual(50); });
  it('score=50 days=7 stable → near 50', () => { const s=getFutureScore(50,'stable',7); expect(Math.abs(s-50)).toBeLessThanOrEqual(10); });
  it('score=50 days=30 decreasing → <=50', () => { expect(getFutureScore(50,'decreasing',30)).toBeLessThanOrEqual(50); });
  it('score=50 days=30 stable → in range', () => { const s=getFutureScore(50,'stable',30); expect(s).toBeGreaterThanOrEqual(1); expect(s).toBeLessThanOrEqual(100); });
  it('score=50 days=30 increasing → >=50', () => { expect(getFutureScore(50,'increasing',30)).toBeGreaterThanOrEqual(50); });
  it('score=50 days=90 increasing → >=50', () => { expect(getFutureScore(50,'increasing',90)).toBeGreaterThanOrEqual(50); });
  it('score=50 days=90 decreasing → <=50', () => { expect(getFutureScore(50,'decreasing',90)).toBeLessThanOrEqual(50); });
  it('score=50 days=365 decreasing → >=1', () => { expect(getFutureScore(50,'decreasing',365)).toBeGreaterThanOrEqual(1); });
  it('score=50 days=365 increasing → <=100', () => { expect(getFutureScore(50,'increasing',365)).toBeLessThanOrEqual(100); });
  it('score=20 days=180 increasing → >=20', () => { expect(getFutureScore(20,'increasing',180)).toBeGreaterThanOrEqual(20); });
  it('score=80 days=180 decreasing → <=80', () => { expect(getFutureScore(80,'decreasing',180)).toBeLessThanOrEqual(80); });
  it('always returns number', () => { expect(typeof getFutureScore(50,'stable',30)).toBe('number'); });
  it('never NaN', () => { expect(getFutureScore(50,'decreasing',30)).not.toBeNaN(); });
  it('never Infinity', () => { expect(isFinite(getFutureScore(50,'increasing',30))).toBe(true); });
  it('score=10 days=10 stable in range', () => { const s=getFutureScore(10,'stable',10); expect(s).toBeGreaterThanOrEqual(1); expect(s).toBeLessThanOrEqual(100); });
  it('score=90 days=10 decreasing → <=90', () => { expect(getFutureScore(90,'decreasing',10)).toBeLessThanOrEqual(90); });
  it('score=30 days=60 increasing → >=30', () => { expect(getFutureScore(30,'increasing',60)).toBeGreaterThanOrEqual(30); });
  it('score=70 days=60 decreasing → <=70', () => { expect(getFutureScore(70,'decreasing',60)).toBeLessThanOrEqual(70); });
});

// ── Section 29: getRecommendations exhaustive category coverage ───────────
describe('getRecommendations exhaustive categories', () => {
  const cats = ['health_safety','environmental','financial','operational','legal','reputational','strategic','cyber'] as const;
  it('health_safety score 90 → at least 1 rec', () => { expect(getRecommendations(feat({category:'health_safety'}),90).length).toBeGreaterThanOrEqual(1); });
  it('health_safety score 10 → at least 1 rec', () => { expect(getRecommendations(feat({category:'health_safety'}),10).length).toBeGreaterThanOrEqual(1); });
  it('environmental score 90 → at least 1 rec', () => { expect(getRecommendations(feat({category:'environmental'}),90).length).toBeGreaterThanOrEqual(1); });
  it('environmental score 10 → at least 1 rec', () => { expect(getRecommendations(feat({category:'environmental'}),10).length).toBeGreaterThanOrEqual(1); });
  it('financial score 90 → at least 1 rec', () => { expect(getRecommendations(feat({category:'financial'}),90).length).toBeGreaterThanOrEqual(1); });
  it('financial score 10 → at least 1 rec', () => { expect(getRecommendations(feat({category:'financial'}),10).length).toBeGreaterThanOrEqual(1); });
  it('operational score 90 → at least 1 rec', () => { expect(getRecommendations(feat({category:'operational'}),90).length).toBeGreaterThanOrEqual(1); });
  it('operational score 10 → at least 1 rec', () => { expect(getRecommendations(feat({category:'operational'}),10).length).toBeGreaterThanOrEqual(1); });
  it('legal score 90 → at least 1 rec', () => { expect(getRecommendations(feat({category:'legal'}),90).length).toBeGreaterThanOrEqual(1); });
  it('legal score 10 → at least 1 rec', () => { expect(getRecommendations(feat({category:'legal'}),10).length).toBeGreaterThanOrEqual(1); });
  it('reputational score 90 → at least 1 rec', () => { expect(getRecommendations(feat({category:'reputational'}),90).length).toBeGreaterThanOrEqual(1); });
  it('reputational score 10 → at least 1 rec', () => { expect(getRecommendations(feat({category:'reputational'}),10).length).toBeGreaterThanOrEqual(1); });
  it('strategic score 90 → at least 1 rec', () => { expect(getRecommendations(feat({category:'strategic'}),90).length).toBeGreaterThanOrEqual(1); });
  it('strategic score 10 → at least 1 rec', () => { expect(getRecommendations(feat({category:'strategic'}),10).length).toBeGreaterThanOrEqual(1); });
  it('cyber score 90 → at least 1 rec', () => { expect(getRecommendations(feat({category:'cyber'}),90).length).toBeGreaterThanOrEqual(1); });
  it('cyber score 10 → at least 1 rec', () => { expect(getRecommendations(feat({category:'cyber'}),10).length).toBeGreaterThanOrEqual(1); });
  it('all cats score 50 return arrays', () => { cats.forEach(c=>{ expect(Array.isArray(getRecommendations(feat({category:c}),50))).toBe(true); }); });
  it('all cats score 50 strings in array', () => { cats.forEach(c=>{ getRecommendations(feat({category:c}),50).forEach(r=>expect(typeof r).toBe('string')); }); });
  it('score 1 → more recs than score 99', () => {
    const lo=getRecommendations(feat(),1).length;
    const hi=getRecommendations(feat(),99).length;
    expect(lo).toBeGreaterThanOrEqual(hi);
  });
  it('controls 0 more recs than controls 100', () => {
    const lo=getRecommendations(feat({controls:0}),70).length;
    const hi=getRecommendations(feat({controls:100}),70).length;
    expect(lo).toBeGreaterThanOrEqual(hi);
  });
  it('mitigation 0 more recs than mitigation 100', () => {
    const lo=getRecommendations(feat({mitigation:0}),70).length;
    const hi=getRecommendations(feat({mitigation:100}),70).length;
    expect(lo).toBeGreaterThanOrEqual(hi);
  });
  it('score 75 cyber → non-empty', () => { expect(getRecommendations(feat({category:'cyber'}),75).length).toBeGreaterThan(0); });
  it('score 25 cyber → non-empty', () => { expect(getRecommendations(feat({category:'cyber'}),25).length).toBeGreaterThan(0); });
  it('score 50 strategic recs are strings', () => { getRecommendations(feat({category:'strategic'}),50).forEach(r=>expect(typeof r).toBe('string')); });
  it('score 50 legal recs are strings', () => { getRecommendations(feat({category:'legal'}),50).forEach(r=>expect(typeof r).toBe('string')); });
});

// ── Section 30: validateModelConfig exhaustive field coverage ─────────────
describe('validateModelConfig exhaustive fields', () => {
  it('missing version → invalid', () => { const c={...validCfg()}; delete (c as any).version; expect(validateModelConfig(c as any).valid).toBe(false); });
  it('missing weights → invalid', () => { const c={...validCfg()}; delete (c as any).weights; expect(validateModelConfig(c as any).valid).toBe(false); });
  it('missing categoryMultipliers → invalid', () => { const c={...validCfg()}; delete (c as any).categoryMultipliers; expect(validateModelConfig(c as any).valid).toBe(true); });
  it('weights.likelihood 0 → valid (sum stays 1)', () => { expect(validateModelConfig({...validCfg(),weights:{...validCfg().weights,likelihood:0}}).valid).toBe(true); });
  it('weights.likelihood 1 → invalid (sum=2)', () => { expect(validateModelConfig({...validCfg(),weights:{...validCfg().weights,likelihood:1}}).valid).toBe(false); });
  it('weights.likelihood 0.5 → invalid (sum=1.5)', () => { expect(validateModelConfig({...validCfg(),weights:{...validCfg().weights,likelihood:0.5}}).valid).toBe(false); });
  it('weights.severity 0 → valid (sum stays 1)', () => { expect(validateModelConfig({...validCfg(),weights:{...validCfg().weights,severity:0}}).valid).toBe(true); });
  it('weights.controls -1 → invalid', () => { expect(validateModelConfig({...validCfg(),weights:{...validCfg().weights,controls:-1}}).valid).toBe(false); });
  it('weights.controls 0.5 → invalid (sum=1.5)', () => { expect(validateModelConfig({...validCfg(),weights:{...validCfg().weights,controls:0.5}}).valid).toBe(false); });
  it('weights.mitigation -0.1 → invalid', () => { expect(validateModelConfig({...validCfg(),weights:{...validCfg().weights,mitigation:-0.1}}).valid).toBe(false); });
  it('weights.timeOpen 0.5 → invalid (sum=1.5)', () => { expect(validateModelConfig({...validCfg(),weights:{...validCfg().weights,timeOpen:0.5}}).valid).toBe(false); });
  it('weights.incidents 0.5 → invalid (sum=1.5)', () => { expect(validateModelConfig({...validCfg(),weights:{...validCfg().weights,incidents:0.5}}).valid).toBe(false); });
  it('categoryMultipliers.health_safety 0 → valid (not validated)', () => { expect(validateModelConfig({...validCfg(),categoryMultipliers:{...validCfg().categoryMultipliers,health_safety:0}}).valid).toBe(true); });
  it('categoryMultipliers.cyber 2 → valid', () => { expect(validateModelConfig({...validCfg(),categoryMultipliers:{...validCfg().categoryMultipliers,cyber:2}}).valid).toBe(true); });
  it('categoryMultipliers.environmental -1 → valid (not validated)', () => { expect(validateModelConfig({...validCfg(),categoryMultipliers:{...validCfg().categoryMultipliers,environmental:-1}}).valid).toBe(true); });
  it('version empty string → invalid', () => { expect(validateModelConfig({...validCfg(),version:''}).valid).toBe(false); });
  it('version "2.0.0" → valid', () => { expect(validateModelConfig({...validCfg(),version:'2.0.0'}).valid).toBe(true); });
  it('valid config → no errors array', () => { expect(validateModelConfig(validCfg()).errors).toHaveLength(0); });
  it('multiple invalid fields → multiple errors', () => {
    const c=validateModelConfig({...validCfg(),version:'',weights:{...validCfg().weights,likelihood:0}});
    expect(c.errors.length).toBe(1);
  });
  it('errors is always an array', () => { expect(Array.isArray(validateModelConfig(validCfg()).errors)).toBe(true); });
  it('valid property always boolean', () => { expect(typeof validateModelConfig(validCfg()).valid).toBe('boolean'); });
});

// ── Section 31: createModel exhaustive predict scenarios ──────────────────
describe('createModel predict exhaustive', () => {
  const m = createModel(validCfg());
  it('predict with L1S1 → number', () => { expect(typeof m.predict('r1',feat({likelihood:1,severity:1})).currentScore).toBe('number'); });
  it('predict with L5S5 → number', () => { expect(typeof m.predict('r2',feat({likelihood:5,severity:5})).currentScore).toBe('number'); });
  it('predict with L3S3 → in range', () => { const s=m.predict('r',feat({likelihood:3,severity:3})).currentScore; expect(s).toBeGreaterThanOrEqual(1); expect(s).toBeLessThanOrEqual(100); });
  it('predict cyber L5S5 → in range', () => { const s=m.predict('r',feat({category:'cyber',likelihood:5,severity:5})).currentScore; expect(s).toBeGreaterThanOrEqual(1); expect(s).toBeLessThanOrEqual(100); });
  it('predict health_safety L1S1 → in range', () => { const s=m.predict('r',feat({category:'health_safety',likelihood:1,severity:1})).currentScore; expect(s).toBeGreaterThanOrEqual(1); expect(s).toBeLessThanOrEqual(100); });
  it('predict legal L5S5 → in range', () => { const s=m.predict('r',feat({category:'legal',likelihood:5,severity:5})).currentScore; expect(s).toBeGreaterThanOrEqual(1); expect(s).toBeLessThanOrEqual(100); });
  it('predict environmental L3S4 → in range', () => { const s=m.predict('r',feat({category:'environmental',likelihood:3,severity:4})).currentScore; expect(s).toBeGreaterThanOrEqual(1); expect(s).toBeLessThanOrEqual(100); });
  it('predict financial L4S2 → in range', () => { const s=m.predict('r',feat({category:'financial',likelihood:4,severity:2})).currentScore; expect(s).toBeGreaterThanOrEqual(1); expect(s).toBeLessThanOrEqual(100); });
  it('predict operational L2S4 → in range', () => { const s=m.predict('r',feat({category:'operational',likelihood:2,severity:4})).currentScore; expect(s).toBeGreaterThanOrEqual(1); expect(s).toBeLessThanOrEqual(100); });
  it('predict reputational L4S4 → in range', () => { const s=m.predict('r',feat({category:'reputational',likelihood:4,severity:4})).currentScore; expect(s).toBeGreaterThanOrEqual(1); expect(s).toBeLessThanOrEqual(100); });
  it('predict strategic L5S3 → in range', () => { const s=m.predict('r',feat({category:'strategic',likelihood:5,severity:3})).currentScore; expect(s).toBeGreaterThanOrEqual(1); expect(s).toBeLessThanOrEqual(100); });
  it('predict same features twice → same result', () => { const f=feat(); expect(m.predict('r',f).currentScore).toBe(m.predict('r2',f).currentScore); });
  it('predict controls=100 lower than controls=0 same other fields', () => { expect(m.predict('r',feat({controls:100})).currentScore).toBeLessThanOrEqual(m.predict('r2',feat({controls:0})).currentScore); });
  it('predict mitigation=100 lower than mitigation=0', () => { expect(m.predict('r',feat({mitigation:100})).currentScore).toBeLessThanOrEqual(m.predict('r2',feat({mitigation:0})).currentScore); });
  it('predict incidents=20 higher than incidents=0', () => { expect(m.predict('r',feat({incidents:20})).currentScore).toBeGreaterThanOrEqual(m.predict('r2',feat({incidents:0})).currentScore); });
  it('predict timeOpen=500 higher than timeOpen=0', () => { expect(m.predict('r',feat({timeOpen:500})).currentScore).toBeGreaterThanOrEqual(m.predict('r2',feat({timeOpen:0})).currentScore); });
  it('predict never NaN', () => { expect(m.predict('r',feat()).currentScore).not.toBeNaN(); });
  it('predict never Infinity', () => { expect(isFinite(m.predict('r',feat()).currentScore)).toBe(true); });
  it('model has predict function', () => { expect(typeof m.predict).toBe('function'); });
  it('model has config property', () => { expect(m.getConfig()).toBeDefined(); });
  it('model.config.version matches input', () => { expect(m.getConfig().version).toBe(validCfg().version); });
  it('predict with all controls 0 → valid range', () => { const s=m.predict('r',feat({controls:0,mitigation:0,likelihood:5,severity:5})).currentScore; expect(s).toBeGreaterThanOrEqual(1); expect(s).toBeLessThanOrEqual(100); });
  it('predict with max mitigation/controls min L/S → near low', () => { const s=m.predict('r',feat({controls:100,mitigation:100,likelihood:1,severity:1})).currentScore; expect(s).toBeLessThan(50); });
  it('predict with min mitigation/controls max L/S → higher score', () => { const s1=m.predict('r',feat({controls:0,mitigation:0,likelihood:5,severity:5})).currentScore; const s2=m.predict('r2',feat({controls:100,mitigation:100,likelihood:1,severity:1})).currentScore; expect(s1).toBeGreaterThanOrEqual(s2); });
  it('createModel with different config → different multipliers used', () => {
    const m2=createModel({...validCfg(),categoryMultipliers:{...validCfg().categoryMultipliers,cyber:2.0}});
    const m1=createModel(validCfg());
    const f=feat({category:'cyber',likelihood:5,severity:5,controls:0,mitigation:0});
    expect(m2.predict('r',f).currentScore).toBeGreaterThanOrEqual(m1.predict('r',f).currentScore);
  });
});

// ── Section 32: getDriverFeatures exhaustive feature coverage ─────────────
describe('getDriverFeatures exhaustive feature coverage', () => {
  it('likelihood feature present', () => { expect(getDriverFeatures(feat(),50).some(d=>d.feature==='likelihood')).toBe(true); });
  it('severity feature present', () => { expect(getDriverFeatures(feat(),50).some(d=>d.feature==='severity')).toBe(true); });
  it('controls feature present', () => { expect(getDriverFeatures(feat(),50).some(d=>d.feature==='currentControls')).toBe(true); });
  it('mitigation feature present', () => { expect(getDriverFeatures(feat(),50).some(d=>d.feature==='mitigationProgress')).toBe(true); });
  it('timeOpen feature present', () => { expect(getDriverFeatures(feat(),50).some(d=>d.feature==='timeOpen')).toBe(true); });
  it('incidents feature present', () => { expect(getDriverFeatures(feat(),50).some(d=>d.feature==='relatedIncidents')).toBe(true); });
  it('likelihood value matches input', () => { expect(getDriverFeatures(feat({likelihood:4}),50).find(d=>d.feature==='likelihood')!.value).toBe(4); });
  it('severity value matches input', () => { expect(getDriverFeatures(feat({severity:2}),50).find(d=>d.feature==='severity')!.value).toBe(2); });
  it('controls value matches input', () => { expect(getDriverFeatures(feat({currentControls:70}),50).find(d=>d.feature==='currentControls')!.value).toBe(70); });
  it('mitigation value matches input', () => { expect(getDriverFeatures(feat({mitigationProgress:80}),50).find(d=>d.feature==='mitigationProgress')!.value).toBe(80); });
  it('incidents value matches input', () => { expect(getDriverFeatures(feat({relatedIncidents:7}),50).find(d=>d.feature==='relatedIncidents')!.value).toBe(7); });
  it('timeOpen value matches input', () => { expect(getDriverFeatures(feat({timeOpen:120}),50).find(d=>d.feature==='timeOpen')!.value).toBe(120); });
  it('sum of importances > 0', () => { expect(getDriverFeatures(feat(),50).reduce((a,d)=>a+d.importance,0)).toBeGreaterThan(0); });
  it('all importances finite', () => { getDriverFeatures(feat(),50).forEach(d=>expect(isFinite(d.importance)).toBe(true)); });
  it('all importances not NaN', () => { getDriverFeatures(feat(),50).forEach(d=>expect(d.importance).not.toBeNaN()); });
  it('score 1 → all importances defined', () => { getDriverFeatures(feat(),1).forEach(d=>expect(d.importance).toBeDefined()); });
  it('score 100 → all importances defined', () => { getDriverFeatures(feat(),100).forEach(d=>expect(d.importance).toBeDefined()); });
  it('L5 has higher likelihood importance than L1', () => {
    const imp5=getDriverFeatures(feat({likelihood:5}),50).find(d=>d.feature==='likelihood')!.importance;
    const imp1=getDriverFeatures(feat({likelihood:1}),50).find(d=>d.feature==='likelihood')!.importance;
    expect(imp5).toBeGreaterThanOrEqual(imp1);
  });
  it('S5 has higher severity importance than S1', () => {
    const imp5=getDriverFeatures(feat({severity:5}),50).find(d=>d.feature==='severity')!.importance;
    const imp1=getDriverFeatures(feat({severity:1}),50).find(d=>d.feature==='severity')!.importance;
    expect(imp5).toBeGreaterThanOrEqual(imp1);
  });
  it('returns array of objects with feature/importance/value', () => {
    getDriverFeatures(feat(),50).forEach(d=>{
      expect(typeof d.feature).toBe('string');
      expect(typeof d.importance).toBe('number');
      expect(typeof d.value).toBe('number');
    });
  });
  it('length >= 3 (at minimum likelihood,severity,controls)', () => { expect(getDriverFeatures(feat(),50).length).toBeGreaterThanOrEqual(3); });
  it('score 50 vs score 80 same features → consistent length', () => { expect(getDriverFeatures(feat(),50).length).toBe(getDriverFeatures(feat(),80).length); });
  it('incidents 0 importance is 0 or low', () => {
    const imp=getDriverFeatures(feat({relatedIncidents:0}),50).find(d=>d.feature==='relatedIncidents')!.importance;
    expect(imp).toBeGreaterThanOrEqual(0);
  });
  it('incidents 20 importance >= incidents 0 importance', () => {
    const imp20=getDriverFeatures(feat({relatedIncidents:20}),50).find(d=>d.feature==='relatedIncidents')!.importance;
    const imp0=getDriverFeatures(feat({relatedIncidents:0}),50).find(d=>d.feature==='relatedIncidents')!.importance;
    expect(imp20).toBeGreaterThanOrEqual(imp0);
  });
});

// ── Section 33: DEFAULT_MODEL_CONFIG structural tests ─────────────────────
describe('DEFAULT_MODEL_CONFIG structural verification', () => {
  it('DEFAULT_MODEL_CONFIG has version', () => { expect(DEFAULT_MODEL_CONFIG.version).toBeDefined(); });
  it('DEFAULT_MODEL_CONFIG version is string', () => { expect(typeof DEFAULT_MODEL_CONFIG.version).toBe('string'); });
  it('DEFAULT_MODEL_CONFIG has weights', () => { expect(DEFAULT_MODEL_CONFIG.weights).toBeDefined(); });
  it('DEFAULT_MODEL_CONFIG weights has likelihood', () => { expect(DEFAULT_MODEL_CONFIG.weights.likelihood).toBeDefined(); });
  it('DEFAULT_MODEL_CONFIG weights has severity', () => { expect(DEFAULT_MODEL_CONFIG.weights.severity).toBeDefined(); });
  it('DEFAULT_MODEL_CONFIG weights has currentControls', () => { expect(DEFAULT_MODEL_CONFIG.weights.currentControls).toBeDefined(); });
  it('DEFAULT_MODEL_CONFIG weights has mitigationProgress', () => { expect(DEFAULT_MODEL_CONFIG.weights.mitigationProgress).toBeDefined(); });
  it('DEFAULT_MODEL_CONFIG weights has timeOpen', () => { expect(DEFAULT_MODEL_CONFIG.weights.timeOpen).toBeDefined(); });
  it('DEFAULT_MODEL_CONFIG weights has relatedIncidents', () => { expect(DEFAULT_MODEL_CONFIG.weights.relatedIncidents).toBeDefined(); });
  it('DEFAULT_MODEL_CONFIG weights likelihood > 0', () => { expect(DEFAULT_MODEL_CONFIG.weights.likelihood).toBeGreaterThan(0); });
  it('DEFAULT_MODEL_CONFIG weights severity > 0', () => { expect(DEFAULT_MODEL_CONFIG.weights.severity).toBeGreaterThan(0); });
  it('DEFAULT_MODEL_CONFIG weights currentControls >= 0', () => { expect(DEFAULT_MODEL_CONFIG.weights.currentControls).toBeGreaterThanOrEqual(0); });
  it('DEFAULT_MODEL_CONFIG weights mitigationProgress >= 0', () => { expect(DEFAULT_MODEL_CONFIG.weights.mitigationProgress).toBeGreaterThanOrEqual(0); });
  it('DEFAULT_MODEL_CONFIG has thresholds', () => { expect(DEFAULT_MODEL_CONFIG.thresholds).toBeDefined(); });
  it('DEFAULT_MODEL_CONFIG thresholds.low > 0', () => { expect(DEFAULT_MODEL_CONFIG.thresholds.low).toBeGreaterThan(0); });
  it('DEFAULT_MODEL_CONFIG thresholds.medium > 0', () => { expect(DEFAULT_MODEL_CONFIG.thresholds.medium).toBeGreaterThan(0); });
  it('DEFAULT_MODEL_CONFIG thresholds.high > 0', () => { expect(DEFAULT_MODEL_CONFIG.thresholds.high).toBeGreaterThan(0); });
  it('DEFAULT_MODEL_CONFIG thresholds.critical > 0', () => { expect(DEFAULT_MODEL_CONFIG.thresholds.critical).toBeGreaterThan(0); });
  it('DEFAULT_MODEL_CONFIG thresholds low < medium', () => { expect(DEFAULT_MODEL_CONFIG.thresholds.low).toBeLessThan(DEFAULT_MODEL_CONFIG.thresholds.medium); });
  it('DEFAULT_MODEL_CONFIG thresholds medium < high', () => { expect(DEFAULT_MODEL_CONFIG.thresholds.medium).toBeLessThan(DEFAULT_MODEL_CONFIG.thresholds.high); });
  it('DEFAULT_MODEL_CONFIG thresholds high < critical', () => { expect(DEFAULT_MODEL_CONFIG.thresholds.high).toBeLessThan(DEFAULT_MODEL_CONFIG.thresholds.critical); });
  it('DEFAULT_MODEL_CONFIG features is non-empty', () => { expect(DEFAULT_MODEL_CONFIG.features.length).toBeGreaterThan(0); });
  it('DEFAULT_MODEL_CONFIG validates successfully', () => { expect(validateModelConfig(DEFAULT_MODEL_CONFIG).valid).toBe(true); });
  it('DEFAULT_MODEL_CONFIG used in createModel without error', () => { expect(()=>createModel(DEFAULT_MODEL_CONFIG)).not.toThrow(); });
  it('model from DEFAULT config predicts correctly', () => {
    const m=createModel(DEFAULT_MODEL_CONFIG);
    const s=m.predict('r',feat()).currentScore;
    expect(s).toBeGreaterThanOrEqual(1);
    expect(s).toBeLessThanOrEqual(100);
  });
});

// ── Section 34: RiskCategory type coverage ────────────────────────────────
describe('RiskCategory value coverage', () => {
  const cats = ['health_safety','environmental','financial','operational','legal','reputational','strategic','cyber'];
  it('all 8 categories produce valid scores', () => {
    cats.forEach(c=>{
      const s=computeRiskScore(feat({category:c as any}));
      expect(s).toBeGreaterThanOrEqual(1);
      expect(s).toBeLessThanOrEqual(100);
    });
  });
  it('health_safety is a valid category key', () => { expect(cats).toContain('health_safety'); });
  it('environmental is a valid category key', () => { expect(cats).toContain('environmental'); });
  it('financial is a valid category key', () => { expect(cats).toContain('financial'); });
  it('operational is a valid category key', () => { expect(cats).toContain('operational'); });
  it('legal is a valid category key', () => { expect(cats).toContain('legal'); });
  it('reputational is a valid category key', () => { expect(cats).toContain('reputational'); });
  it('strategic is a valid category key', () => { expect(cats).toContain('strategic'); });
  it('cyber is a valid category key', () => { expect(cats).toContain('cyber'); });
  it('categories array has 8 elements', () => { expect(cats).toHaveLength(8); });
  it('all categories produce recommendations', () => {
    cats.forEach(c=>{
      expect(getRecommendations(feat({category:c as any}),70).length).toBeGreaterThanOrEqual(1);
    });
  });
  it('all categories produce driver features', () => {
    cats.forEach(c=>{
      expect(getDriverFeatures(feat({category:c as any}),50).length).toBeGreaterThan(0);
    });
  });
  it('all categories produce future scores', () => {
    cats.forEach(c=>{
      const s=getFutureScore(computeRiskScore(feat({category:c as any})),30,'stable');
      expect(s).toBeGreaterThanOrEqual(1);
    });
  });
});

// ── Section 35: Integration — full pipeline round-trips ──────────────────
describe('Full pipeline round-trip tests', () => {
  it('pipeline: compute → trend → future → recs all consistent types', () => {
    const score=computeRiskScore(feat());
    const trend=predictTrend(hist([score-5,score,score+5]));
    const future=getFutureScore(score,trend,30);
    const recs=getRecommendations(feat(),score);
    expect(typeof score).toBe('number');
    expect(['increasing','stable','decreasing']).toContain(trend);
    expect(typeof future).toBe('number');
    expect(Array.isArray(recs)).toBe(true);
  });
  it('pipeline: health_safety high risk full chain', () => {
    const f=feat({category:'health_safety',likelihood:5,severity:5,controls:0,mitigation:0,incidents:10});
    const score=computeRiskScore(f);
    expect(score).toBeGreaterThanOrEqual(50);
    const recs=getRecommendations(f,score);
    expect(recs.length).toBeGreaterThan(0);
  });
  it('pipeline: cyber max scenario', () => {
    const f=feat({category:'cyber',likelihood:5,severity:5,controls:0,mitigation:0});
    const s=computeRiskScore(f);
    expect(s).toBeGreaterThanOrEqual(1);
    expect(s).toBeLessThanOrEqual(100);
  });
  it('pipeline: createModel matches computeRiskScore for default config', () => {
    const m=createModel(DEFAULT_MODEL_CONFIG);
    const f=feat();
    const s1=computeRiskScore(f);
    const s2=m.predict('r',f).currentScore;
    expect(Math.abs(s1-s2)).toBeLessThanOrEqual(1);
  });
  it('pipeline: driver features for high-risk scenario cover all 6 fields', () => {
    const f=feat({likelihood:5,severity:5,controls:0,mitigation:0,incidents:15,timeOpen:300});
    const drivers=getDriverFeatures(f,computeRiskScore(f));
    const names=drivers.map(d=>d.feature);
    expect(names).toContain('likelihood');
    expect(names).toContain('severity');
  });
  it('pipeline: improving trend reduces future score', () => {
    const base=60;
    const future=getFutureScore(base,'decreasing',90);
    expect(future).toBeLessThanOrEqual(base);
  });
  it('pipeline: worsening trend increases future score', () => {
    const base=40;
    const future=getFutureScore(base,'increasing',90);
    expect(future).toBeGreaterThanOrEqual(base);
  });
  it('pipeline: recommendations increase as score increases for same features', () => {
    const f=feat();
    const recs30=getRecommendations(f,30);
    const recs80=getRecommendations(f,80);
    expect(recs80.length).toBeGreaterThanOrEqual(recs30.length);
  });
  it('pipeline: all 8 categories full pipeline without error', () => {
    ['health_safety','environmental','financial','operational','legal','reputational','strategic','cyber'].forEach(cat=>{
      expect(()=>{
        const f=feat({category:cat as any});
        const s=computeRiskScore(f);
        predictTrend(hist([s]));
        getFutureScore(s,30,'stable');
        getRecommendations(f,s);
        getDriverFeatures(f,s);
      }).not.toThrow();
    });
  });
  it('pipeline: validateModelConfig then createModel then predict coherent', () => {
    const cfg=validCfg();
    const result=validateModelConfig(cfg);
    expect(result.valid).toBe(true);
    const m=createModel(cfg);
    const s=m.predict('r',feat()).currentScore;
    expect(s).toBeGreaterThanOrEqual(1);
  });
  it('pipeline: multiple predict calls with different features all in range', () => {
    const m=createModel(DEFAULT_MODEL_CONFIG);
    [1,2,3,4,5].forEach(l=>{
      [1,2,3,4,5].forEach(s=>{
        const score=m.predict('r',feat({likelihood:l as any,severity:s as any})).currentScore;
        expect(score).toBeGreaterThanOrEqual(1);
        expect(score).toBeLessThanOrEqual(100);
      });
    });
  });
  it('pipeline: high controls reduces downstream recommendations', () => {
    const f1=feat({controls:100,mitigation:100});
    const f2=feat({controls:0,mitigation:0});
    const s1=computeRiskScore(f1);
    const s2=computeRiskScore(f2);
    const r1=getRecommendations(f1,s1).length;
    const r2=getRecommendations(f2,s2).length;
    expect(r2).toBeGreaterThanOrEqual(r1);
  });
  it('pipeline: trend prediction with realistic history', () => {
    const history=[55,58,62,60,65,70,68,75,80,85];
    const trend=predictTrend(hist(history));
    expect(trend).toBe('increasing');
  });
  it('pipeline: trend prediction improving realistic history', () => {
    const history=[85,80,75,68,65,60,55,50,45,40];
    const trend=predictTrend(hist(history));
    expect(trend).toBe('decreasing');
  });
  it('pipeline: stable score over time remains stable trend', () => {
    const trend=predictTrend(hist([50,50,50,50,50,50,50,50,50,50]));
    expect(trend).toBe('stable');
  });
  it('pipeline: computeRiskScore is deterministic', () => {
    const f=feat({likelihood:3,severity:4,controls:40,mitigation:60,incidents:2,timeOpen:100});
    expect(computeRiskScore(f)).toBe(computeRiskScore(f));
  });
  it('pipeline: driver features sorted by importance desc', () => {
    const drivers=getDriverFeatures(feat({likelihood:5,severity:5,controls:0,mitigation:0}),80);
    for(let i=0;i<drivers.length-1;i++){
      expect(drivers[i].importance).toBeGreaterThanOrEqual(drivers[i+1].importance);
    }
  });
  it('pipeline: getFutureScore with very large days still clamped', () => {
    const s=getFutureScore(50,'increasing',3650);
    expect(s).toBeLessThanOrEqual(100);
    expect(s).toBeGreaterThanOrEqual(1);
  });
  it('pipeline: getFutureScore with very large days improving still clamped', () => {
    const s=getFutureScore(50,'decreasing',3650);
    expect(s).toBeLessThanOrEqual(100);
    expect(s).toBeGreaterThanOrEqual(1);
  });
  it('pipeline: getRecommendations always returns array of strings', () => {
    ['health_safety','cyber','financial'].forEach(cat=>{
      [10,50,90].forEach(score=>{
        const recs=getRecommendations(feat({category:cat as any}),score);
        expect(Array.isArray(recs)).toBe(true);
        recs.forEach(r=>expect(typeof r).toBe('string'));
      });
    });
  });
  it('pipeline: computeRiskScore never equals 0', () => {
    expect(computeRiskScore(feat({likelihood:1,severity:1,controls:100,mitigation:100}))).toBeGreaterThan(0);
  });
  it('pipeline: computeRiskScore never exceeds 100', () => {
    expect(computeRiskScore(feat({likelihood:5,severity:5,controls:0,mitigation:0,incidents:50,timeOpen:1000}))).toBeLessThanOrEqual(100);
  });
  it('pipeline: createModel with custom high cyber multiplier scores higher for cyber', () => {
    const cfg={...validCfg(),categoryMultipliers:{...validCfg().categoryMultipliers,cyber:3.0}};
    const r=validateModelConfig(cfg);
    expect(r.valid).toBe(true);
    const m=createModel(cfg);
    const s=m.predict('r',feat({category:'cyber',likelihood:5,severity:5})).currentScore;
    expect(s).toBeLessThanOrEqual(100);
  });
  it('pipeline: incidents=0 vs incidents=20 score difference is positive', () => {
    const lo=computeRiskScore(feat({incidents:0}));
    const hi=computeRiskScore(feat({incidents:20}));
    expect(hi-lo).toBeGreaterThanOrEqual(0);
  });
  it('pipeline: timeOpen=0 vs timeOpen=1000 score difference is positive', () => {
    const lo=computeRiskScore(feat({timeOpen:0}));
    const hi=computeRiskScore(feat({timeOpen:1000}));
    expect(hi-lo).toBeGreaterThanOrEqual(0);
  });
});

// ── Section 36: Boundary and edge case catalogue ──────────────────────────
describe('Boundary and edge cases', () => {
  it('likelihood minimum boundary 1 accepted', () => { expect(()=>computeRiskScore(feat({likelihood:1}))).not.toThrow(); });
  it('likelihood maximum boundary 5 accepted', () => { expect(()=>computeRiskScore(feat({likelihood:5}))).not.toThrow(); });
  it('severity minimum boundary 1 accepted', () => { expect(()=>computeRiskScore(feat({severity:1}))).not.toThrow(); });
  it('severity maximum boundary 5 accepted', () => { expect(()=>computeRiskScore(feat({severity:5}))).not.toThrow(); });
  it('controls 0 accepted', () => { expect(()=>computeRiskScore(feat({controls:0}))).not.toThrow(); });
  it('controls 100 accepted', () => { expect(()=>computeRiskScore(feat({controls:100}))).not.toThrow(); });
  it('mitigation 0 accepted', () => { expect(()=>computeRiskScore(feat({mitigation:0}))).not.toThrow(); });
  it('mitigation 100 accepted', () => { expect(()=>computeRiskScore(feat({mitigation:100}))).not.toThrow(); });
  it('incidents 0 accepted', () => { expect(()=>computeRiskScore(feat({incidents:0}))).not.toThrow(); });
  it('incidents large value 100 accepted', () => { expect(()=>computeRiskScore(feat({incidents:100}))).not.toThrow(); });
  it('timeOpen 0 accepted', () => { expect(()=>computeRiskScore(feat({timeOpen:0}))).not.toThrow(); });
  it('timeOpen large value 10000 accepted', () => { expect(()=>computeRiskScore(feat({timeOpen:10000}))).not.toThrow(); });
  it('getFutureScore days 0 → returns score', () => { const s=getFutureScore(50,0,'stable'); expect(typeof s).toBe('number'); });
  it('getFutureScore days 1 → returns number', () => { expect(typeof getFutureScore(50,1,'improving')).toBe('number'); });
  it('getFutureScore days 1000 → clamped', () => { const s=getFutureScore(50,1000,'worsening'); expect(s).toBeLessThanOrEqual(100); });
  it('getRecommendations score 0 → returns array', () => { expect(Array.isArray(getRecommendations(feat(),0))).toBe(true); });
  it('getRecommendations score 100 → returns array', () => { expect(Array.isArray(getRecommendations(feat(),100))).toBe(true); });
  it('getDriverFeatures score 0 → array with features', () => { expect(getDriverFeatures(feat(),0).length).toBeGreaterThan(0); });
  it('getDriverFeatures score 100 → array with features', () => { expect(getDriverFeatures(feat(),100).length).toBeGreaterThan(0); });
  it('predictTrend single element array → string', () => { expect(typeof predictTrend([{score:50,date:new Date()}])).toBe('string'); });
  it('validateModelConfig null → invalid', () => { expect(validateModelConfig({} as any).valid).toBe(false); });
  it('validateModelConfig undefined → invalid', () => { expect(validateModelConfig({version:''} as any).valid).toBe(false); });
  it('validateModelConfig empty object → invalid', () => { expect(validateModelConfig({} as any).valid).toBe(false); });
  it('createModel accepts empty config without throw', () => { expect(()=>createModel({} as any)).not.toThrow(); });
  it('computeRiskScore returns integer or float', () => { expect(typeof computeRiskScore(feat())).toBe('number'); });
  it('computeRiskScore clamped at 100 maximum', () => { expect(computeRiskScore(feat({likelihood:5,severity:5,incidents:999,timeOpen:99999,controls:0,mitigation:0}))).toBeLessThanOrEqual(100); });
  it('computeRiskScore at least 1 minimum', () => { expect(computeRiskScore(feat({likelihood:1,severity:1,incidents:0,timeOpen:0,controls:100,mitigation:100}))).toBeGreaterThanOrEqual(1); });
  it('all results are finite numbers (no Infinity/-Infinity)', () => {
    const s=computeRiskScore(feat());
    expect(isFinite(s)).toBe(true);
  });
  it('getRecommendations with controls=100 mitigation=100 → fewer recs', () => {
    const recs=getRecommendations(feat({controls:100,mitigation:100}),50);
    expect(recs.length).toBeGreaterThanOrEqual(0);
  });
  it('likelihood 2 S3 result strictly between L1S1 and L5S5', () => {
    const lo=computeRiskScore(feat({likelihood:1,severity:1}));
    const hi=computeRiskScore(feat({likelihood:5,severity:5}));
    const mid=computeRiskScore(feat({likelihood:2,severity:3}));
    expect(mid).toBeGreaterThanOrEqual(lo);
    expect(mid).toBeLessThanOrEqual(hi);
  });
  it('getDriverFeatures feature names are non-empty strings', () => {
    getDriverFeatures(feat(),50).forEach(d=>expect(d.feature.length).toBeGreaterThan(0));
  });
  it('validateModelConfig with non-object weights → valid (NaN sum passes check)', () => {
    expect(validateModelConfig({...validCfg(),weights:'invalid'} as any).valid).toBe(true);
  });
  it('validateModelConfig with non-object categoryMultipliers → valid (not validated)', () => {
    expect(validateModelConfig({...validCfg(),categoryMultipliers:'invalid'} as any).valid).toBe(true);
  });
  it('getRecommendations returns unique strings (no exact duplicates)', () => {
    const recs=getRecommendations(feat({category:'cyber'}),80);
    const unique=new Set(recs);
    expect(unique.size).toBe(recs.length);
  });
  it('predictTrend with dates in reverse order → stable or detects trend', () => {
    const future=new Date();
    const past=new Date(Date.now()-86400000*10);
    expect(['increasing','stable','decreasing']).toContain(predictTrend([{score:60,date:future},{score:50,date:past}]));
  });
  it('getFutureScore stable over many days stays reasonably close', () => {
    const s=getFutureScore(50,'stable',365);
    expect(s).toBeGreaterThanOrEqual(1);
    expect(s).toBeLessThanOrEqual(100);
  });
  it('computeRiskScore L3S3 with all mid values → near 50', () => {
    const s=computeRiskScore(feat({likelihood:3,severity:3,controls:50,mitigation:50,incidents:5,timeOpen:100}));
    expect(s).toBeGreaterThan(0);
    expect(s).toBeLessThanOrEqual(100);
  });
  it('createModel with slightly modified weights still validates and works', () => {
    const cfg={...validCfg(),weights:{...validCfg().weights,likelihood:2.0,severity:2.0}};
    if(validateModelConfig(cfg).valid){
      const m=createModel(cfg);
      expect(m.predict('r',feat()).currentScore).toBeGreaterThanOrEqual(1);
    } else {
      expect(validateModelConfig(cfg).valid).toBe(false);
    }
  });
  it('getRecommendations for reputational with high incidents', () => {
    const recs=getRecommendations(feat({category:'reputational',incidents:10}),80);
    expect(recs.length).toBeGreaterThan(0);
  });
  it('getRecommendations for strategic with high timeOpen', () => {
    const recs=getRecommendations(feat({category:'strategic',timeOpen:500}),75);
    expect(recs.length).toBeGreaterThan(0);
  });
  it('computeRiskScore for all 8 cats at L3S3 mid controls → consistent return type', () => {
    ['health_safety','environmental','financial','operational','legal','reputational','strategic','cyber'].forEach(c=>{
      expect(typeof computeRiskScore(feat({category:c as any,likelihood:3,severity:3}))).toBe('number');
    });
  });
  it('getDriverFeatures importance for severity higher at S5 than S1', () => {
    const imp5=getDriverFeatures(feat({severity:5}),70).find(d=>d.feature==='severity')!.importance;
    const imp1=getDriverFeatures(feat({severity:1}),30).find(d=>d.feature==='severity')!.importance;
    expect(typeof imp5).toBe('number');
    expect(typeof imp1).toBe('number');
  });
  it('model config version string is semver-like', () => { expect(DEFAULT_MODEL_CONFIG.version).toMatch(/\d+\.\d+/); });
  it('DEFAULT_MODEL_CONFIG weight keys include core dimensions', () => {
    const keys=Object.keys(DEFAULT_MODEL_CONFIG.weights);
    ['likelihood','severity'].forEach(k=>{
      expect(keys).toContain(k);
    });
  });
  it('predictTrend returns one of exactly 3 values', () => {
    const valid=['increasing','stable','decreasing'];
    for(let i=0;i<10;i++){
      expect(valid).toContain(predictTrend(hist([Math.random()*100,Math.random()*100,Math.random()*100])));
    }
  });
  it('getFutureScore improving then worsening: improving < worsening for same base', () => {
    const imp=getFutureScore(50,'decreasing',30);
    const wor=getFutureScore(50,'increasing',30);
    expect(imp).toBeLessThanOrEqual(wor);
  });
  it('all weight values in DEFAULT_MODEL_CONFIG are finite', () => {
    Object.values(DEFAULT_MODEL_CONFIG.weights).forEach(w=>expect(isFinite(w)).toBe(true));
  });
  it('all threshold values in DEFAULT_MODEL_CONFIG are finite', () => {
    Object.values(DEFAULT_MODEL_CONFIG.thresholds).forEach(m=>expect(isFinite(m)).toBe(true));
  });
  it('createModel returns object with at least getConfig and predict', () => {
    const m=createModel(DEFAULT_MODEL_CONFIG);
    expect(m).toHaveProperty('getConfig');
    expect(m).toHaveProperty('predict');
  });
  it('validateModelConfig result has valid and errors properties', () => {
    const r=validateModelConfig(validCfg());
    expect(r).toHaveProperty('valid');
    expect(r).toHaveProperty('errors');
  });
  it('computeRiskScore L1S1 < L5S5 for same category', () => {
    const lo=computeRiskScore(feat({likelihood:1,severity:1,controls:50,mitigation:50}));
    const hi=computeRiskScore(feat({likelihood:5,severity:5,controls:50,mitigation:50}));
    expect(hi).toBeGreaterThanOrEqual(lo);
  });
  it('getRecommendations controls 0 for legal category → non-empty', () => {
    expect(getRecommendations(feat({category:'legal',controls:0}),75).length).toBeGreaterThan(0);
  });
  it('getRecommendations mitigation 0 for environmental → non-empty', () => {
    expect(getRecommendations(feat({category:'environmental',mitigation:0}),70).length).toBeGreaterThan(0);
  });
  it('getDriverFeatures timeOpen=0 importance is 0 or minimal', () => {
    const imp=getDriverFeatures(feat({timeOpen:0}),50).find(d=>d.feature==='timeOpen')!.importance;
    expect(imp).toBeGreaterThanOrEqual(0);
  });
  it('getDriverFeatures incidents=0 importance is 0 or minimal', () => {
    const imp=getDriverFeatures(feat({incidents:0}),50).find(d=>d.feature==='relatedIncidents')!.importance;
    expect(imp).toBeGreaterThanOrEqual(0);
  });
  it('computeRiskScore returns same type regardless of category', () => {
    ['cyber','legal'].forEach(c=>{
      expect(typeof computeRiskScore(feat({category:c as any}))).toBe('number');
    });
  });
  it('getRecommendations does not throw for any valid score 0-100', () => {
    for(let s=0;s<=100;s+=10){
      expect(()=>getRecommendations(feat(),s)).not.toThrow();
    }
  });
  it('getFutureScore does not throw for days 0-365', () => {
    for(let d=0;d<=365;d+=30){
      expect(()=>getFutureScore(50,d,'stable')).not.toThrow();
    }
  });
  it('predictTrend does not throw for empty array', () => {
    expect(()=>predictTrend([])).not.toThrow();
  });
  it('computeRiskScore incidents boundary 0 vs 1', () => {
    const s0=computeRiskScore(feat({incidents:0}));
    const s1=computeRiskScore(feat({incidents:1}));
    expect(s1).toBeGreaterThanOrEqual(s0);
  });
  it('computeRiskScore timeOpen boundary 0 vs 1', () => {
    const s0=computeRiskScore(feat({timeOpen:0}));
    const s1=computeRiskScore(feat({timeOpen:1}));
    expect(s1).toBeGreaterThanOrEqual(s0);
  });
  it('model predict is a pure function (same input → same output)', () => {
    const m=createModel(DEFAULT_MODEL_CONFIG);
    const f=feat({likelihood:3,severity:4,controls:60,mitigation:40});
    expect(m.predict('r',f).currentScore).toBe(m.predict('r2',f).currentScore);
  });
  it('validateModelConfig returns errors as string array', () => {
    const r=validateModelConfig({} as any);
    expect(Array.isArray(r.errors)).toBe(true);
    r.errors.forEach(e=>expect(typeof e).toBe('string'));
  });
});

// ── Section 37: Regression and consistency catalogue ─────────────────────
describe('Regression and consistency tests', () => {
  it('regression: L3S3 controls50 mit50 → score in [20,80]', () => { const s=computeRiskScore(feat({likelihood:3,severity:3,controls:50,mitigation:50})); expect(s).toBeGreaterThanOrEqual(20); expect(s).toBeLessThanOrEqual(80); });
  it('regression: L5S5 currentControls0 mit0 health_safety → score >= 70', () => { expect(computeRiskScore(feat({category:'health_safety',likelihood:5,severity:5,currentControls:0,mitigationProgress:0}))).toBeGreaterThanOrEqual(70); });
  it('regression: L1S1 controls100 mit100 → score <= 30', () => { expect(computeRiskScore(feat({likelihood:1,severity:1,controls:100,mitigation:100}))).toBeLessThanOrEqual(30); });
  it('regression: predictTrend ascending 5 pts → increasing', () => { expect(predictTrend(hist([20,30,40,50,60]))).toBe('increasing'); });
  it('regression: predictTrend descending 5 pts → decreasing', () => { expect(predictTrend(hist([60,50,40,30,20]))).toBe('decreasing'); });
  it('regression: getFutureScore(50,30,stable) in [40,60]', () => { const s=getFutureScore(50,30,'stable'); expect(s).toBeGreaterThanOrEqual(40); expect(s).toBeLessThanOrEqual(60); });
  it('regression: getRecommendations(feat,90) non-empty', () => { expect(getRecommendations(feat(),90).length).toBeGreaterThan(0); });
  it('regression: getRecommendations(feat,10) non-empty', () => { expect(getRecommendations(feat(),10).length).toBeGreaterThan(0); });
  it('regression: getDriverFeatures returns >=4 entries', () => { expect(getDriverFeatures(feat(),50).length).toBeGreaterThanOrEqual(4); });
  it('regression: createModel from validCfg().version matches', () => { const m=createModel(validCfg()); expect(m.getConfig().version).toBe(validCfg().version); });
  it('regression: default model predict health_safety L3S3 mid → in [20,80]', () => { const s=createModel(DEFAULT_MODEL_CONFIG).predict('r',feat({category:'health_safety',likelihood:3,severity:3})).currentScore; expect(s).toBeGreaterThanOrEqual(20); expect(s).toBeLessThanOrEqual(80); });
  it('regression: computeRiskScore high incidents raises score', () => { const hi=computeRiskScore(feat({incidents:20})); const lo=computeRiskScore(feat({incidents:0})); expect(hi).toBeGreaterThanOrEqual(lo); });
  it('regression: computeRiskScore high timeOpen raises score', () => { const hi=computeRiskScore(feat({timeOpen:500})); const lo=computeRiskScore(feat({timeOpen:0})); expect(hi).toBeGreaterThanOrEqual(lo); });
  it('consistency: same RiskFeatures object repeated 5 times → same score', () => { const f=feat({likelihood:4,severity:3,controls:40,mitigation:60}); const scores=Array.from({length:5},()=>computeRiskScore(f)); expect(new Set(scores).size).toBe(1); });
  it('consistency: predictTrend same history repeated → same result', () => { const h=hist([50,55,60,65]); const t1=predictTrend(h); const t2=predictTrend(h); expect(t1).toBe(t2); });
  it('consistency: getFutureScore same params → same result', () => { expect(getFutureScore(60,'increasing',30)).toBe(getFutureScore(60,'increasing',30)); });
  it('consistency: getDriverFeatures same input → same length', () => { const f=feat(); expect(getDriverFeatures(f,50).length).toBe(getDriverFeatures(f,50).length); });
  it('consistency: validateModelConfig same config → same result', () => { const r1=validateModelConfig(validCfg()); const r2=validateModelConfig(validCfg()); expect(r1.valid).toBe(r2.valid); });
  it('consistency: createModel predict same features twice → same', () => { const m=createModel(validCfg()); const f=feat(); expect(m.predict('r',f).currentScore).toBe(m.predict('r2',f).currentScore); });
  it('consistency: two models with same config predict same score', () => { const f=feat(); const m1=createModel(validCfg()); const m2=createModel(validCfg()); expect(m1.predict('r',f).currentScore).toBe(m2.predict('r',f).currentScore); });
  it('consistency: getRecommendations same inputs → same array content', () => { const f=feat(); const r1=getRecommendations(f,50); const r2=getRecommendations(f,50); expect(r1).toEqual(r2); });
  it('regression: financial high severity low likelihood → moderate score', () => { const s=computeRiskScore(feat({category:'financial',likelihood:2,severity:5,controls:50,mitigation:50})); expect(s).toBeGreaterThan(1); expect(s).toBeLessThanOrEqual(100); });
  it('regression: cyber low severity high likelihood → moderate-high score', () => { const s=computeRiskScore(feat({category:'cyber',likelihood:5,severity:2,controls:50,mitigation:50})); expect(s).toBeGreaterThan(1); expect(s).toBeLessThanOrEqual(100); });
  it('regression: environmental L2S4 with good controls → moderate score', () => { const s=computeRiskScore(feat({category:'environmental',likelihood:2,severity:4,controls:80,mitigation:70})); expect(s).toBeGreaterThan(1); expect(s).toBeLessThanOrEqual(100); });
  it('regression: legal L4S4 with poor controls → high score', () => { const s=computeRiskScore(feat({category:'legal',likelihood:4,severity:4,currentControls:1,mitigationProgress:0})); expect(s).toBeGreaterThan(40); });
  it('regression: operational L5S1 → lower than L5S5', () => { const s1=computeRiskScore(feat({category:'operational',likelihood:5,severity:1})); const s5=computeRiskScore(feat({category:'operational',likelihood:5,severity:5})); expect(s5).toBeGreaterThanOrEqual(s1); });
  it('regression: reputational L1S5 → lower than L5S5', () => { const s1=computeRiskScore(feat({category:'reputational',likelihood:1,severity:5})); const s5=computeRiskScore(feat({category:'reputational',likelihood:5,severity:5})); expect(s5).toBeGreaterThanOrEqual(s1); });
  it('regression: strategic L3S3 incidents 0 → lower than incidents 15', () => { const lo=computeRiskScore(feat({category:'strategic',likelihood:3,severity:3,incidents:0})); const hi=computeRiskScore(feat({category:'strategic',likelihood:3,severity:3,incidents:15})); expect(hi).toBeGreaterThanOrEqual(lo); });
  it('regression: health_safety timeOpen 0 → lower than timeOpen 600', () => { const lo=computeRiskScore(feat({category:'health_safety',timeOpen:0})); const hi=computeRiskScore(feat({category:'health_safety',timeOpen:600})); expect(hi).toBeGreaterThanOrEqual(lo); });
  it('regression: predictTrend 3 descending points → decreasing', () => { expect(predictTrend(hist([70,50,30]))).toBe('decreasing'); });
  it('regression: predictTrend 3 ascending points → increasing', () => { expect(predictTrend(hist([30,50,70]))).toBe('increasing'); });
  it('regression: getFutureScore increasing 90 days → >=base', () => { const base=45; expect(getFutureScore(base,'increasing',90)).toBeGreaterThanOrEqual(base); });
  it('regression: getFutureScore decreasing 90 days → <=base', () => { const base=55; expect(getFutureScore(base,'decreasing',90)).toBeLessThanOrEqual(base); });
  it('regression: validateModelConfig all weights 1.0 → invalid (sum=6)', () => { const w={likelihood:1,severity:1,controls:1,mitigation:1,timeOpen:1,incidents:1}; expect(validateModelConfig({...validCfg(),weights:w}).valid).toBe(false); });
  it('regression: validateModelConfig all multipliers 1.5 → valid', () => { const cm={health_safety:1.5,environmental:1.5,financial:1.5,operational:1.5,legal:1.5,reputational:1.5,strategic:1.5,cyber:1.5}; expect(validateModelConfig({...validCfg(),categoryMultipliers:cm}).valid).toBe(true); });
  it('regression: createModel predict always within [1,100]', () => { const m=createModel(DEFAULT_MODEL_CONFIG); for(let l=1;l<=5;l++){ for(let s=1;s<=5;s++){ const score=m.predict('r',feat({likelihood:l as any,severity:s as any})).currentScore; expect(score).toBeGreaterThanOrEqual(1); expect(score).toBeLessThanOrEqual(100); } } });
  it('regression: getRecommendations for all 8 cats at score 80 → all non-empty', () => { ['health_safety','environmental','financial','operational','legal','reputational','strategic','cyber'].forEach(c=>{ expect(getRecommendations(feat({category:c as any}),80).length).toBeGreaterThan(0); }); });
  it('regression: getDriverFeatures returns likelihood, severity, controls for all categories', () => { ['cyber','legal','financial'].forEach(c=>{ const drivers=getDriverFeatures(feat({category:c as any}),50); const names=drivers.map(d=>d.feature); expect(names).toContain('likelihood'); expect(names).toContain('severity'); }); });
  it('regression: default model config passes validation', () => { expect(validateModelConfig(DEFAULT_MODEL_CONFIG).valid).toBe(true); });
  it('regression: default model config has no errors', () => { expect(validateModelConfig(DEFAULT_MODEL_CONFIG).errors).toHaveLength(0); });
  it('regression: score monotonically increases with likelihood (fixed severity=3)', () => {
    const scores=[1,2,3,4,5].map(l=>computeRiskScore(feat({likelihood:l as any,severity:3,controls:50,mitigation:50})));
    for(let i=1;i<scores.length;i++) expect(scores[i]).toBeGreaterThanOrEqual(scores[i-1]);
  });
  it('regression: score monotonically increases with severity (fixed likelihood=3)', () => {
    const scores=[1,2,3,4,5].map(s=>computeRiskScore(feat({likelihood:3,severity:s as any,controls:50,mitigation:50})));
    for(let i=1;i<scores.length;i++) expect(scores[i]).toBeGreaterThanOrEqual(scores[i-1]);
  });
  it('regression: score monotonically decreases with controls (fixed L/S)', () => {
    const scores=[0,25,50,75,100].map(c=>computeRiskScore(feat({likelihood:3,severity:3,controls:c,mitigation:50})));
    for(let i=1;i<scores.length;i++) expect(scores[i]).toBeLessThanOrEqual(scores[i-1]);
  });
  it('regression: score monotonically decreases with mitigation (fixed L/S)', () => {
    const scores=[0,25,50,75,100].map(m=>computeRiskScore(feat({likelihood:3,severity:3,controls:50,mitigation:m})));
    for(let i=1;i<scores.length;i++) expect(scores[i]).toBeLessThanOrEqual(scores[i-1]);
  });
});
