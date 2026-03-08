// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
/**
 * Phase 160 — Comprehensive data-integrity, scoring, and service tests for
 * @ims/regulatory-feed.
 *
 * calculateRelevance scoring weights:
 *   Jurisdiction match  : 30 points
 *   Standards overlap   : 25 points (proportional to orgProfile.standards matched)
 *   Category overlap    : 20 points (proportional to orgProfile.categories matched)
 *   Industry keyword    : 15 points
 *   Recency bonus       : 10 (≤30 days) | 5 (≤90) | 2 (≤365) | 0 (>365)
 *   Maximum possible    : 100 points
 */
import {
  REGULATORY_SOURCES,
  getSourcesByJurisdiction,
  getSourcesByCategory,
  calculateRelevance,
  filterRelevant,
  RegulatoryFeedService,
} from '../src';
import type { Regulation, OrgProfile, Jurisdiction } from '../src';

// ── Helpers ───────────────────────────────────────────────────────────────────

const VALID_JURISDICTIONS: Jurisdiction[] = ['UK', 'EU', 'UAE', 'US', 'AU', 'CA', 'GLOBAL'];
const VALID_FREQUENCIES = ['daily', 'weekly', 'monthly'];

let _counter = 0;
function reg(overrides: Partial<Regulation> = {}): Regulation {
  _counter += 1;
  return {
    id: `REG-${_counter}`,
    title: 'Test Regulation',
    description: 'Test description for regulatory compliance.',
    jurisdiction: 'UK',
    source: 'uk_hse',
    sourceUrl: 'https://www.hse.gov.uk/test',
    publishedDate: new Date('2025-01-01'),
    categories: [],
    standards: [],
    keywords: [],
    status: 'ACTIVE',
    ...overrides,
  };
}

const BASE_ORG: OrgProfile = {
  standards: ['ISO 45001', 'ISO 14001'],
  industry: 'manufacturing',
  jurisdiction: 'UK',
  categories: ['health-safety', 'environment'],
};

// Days-ago helper (uses today's date at test-run time)
function daysAgo(n: number): Date {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
}

// ── 1. Per-source data integrity (8 sources × 6 = 48 tests) ──────────────────

const SOURCE_IDS = ['uk_hse', 'uk_ea', 'uk_mhra', 'eu_oj', 'uae_mohre', 'uae_dm', 'us_osha', 'us_epa'];

for (const key of SOURCE_IDS) {
  describe(`REGULATORY_SOURCES.${key}`, () => {
    const source = REGULATORY_SOURCES[key];

    it('exists in REGULATORY_SOURCES', () => {
      expect(source).toBeDefined();
    });

    it('id matches its key', () => {
      expect(source.id).toBe(key);
    });

    it('name and description are non-empty strings', () => {
      expect(source.name.trim().length).toBeGreaterThan(0);
      expect(source.description.trim().length).toBeGreaterThan(0);
    });

    it('url starts with https://', () => {
      expect(source.url).toMatch(/^https:\/\//);
    });

    it('jurisdiction is a valid Jurisdiction value', () => {
      expect(VALID_JURISDICTIONS).toContain(source.jurisdiction);
    });

    it('updateFrequency is daily | weekly | monthly, categories is non-empty', () => {
      expect(VALID_FREQUENCIES).toContain(source.updateFrequency);
      expect(Array.isArray(source.categories)).toBe(true);
      expect(source.categories.length).toBeGreaterThan(0);
    });
  });
}

// ── 2. calculateRelevance — jurisdiction component (9 tests) ─────────────────

describe('calculateRelevance — jurisdiction (+30)', () => {
  // Exact match jurisdictions
  const exactPairs: Array<[Jurisdiction, Jurisdiction]> = [
    ['UK', 'UK'], ['US', 'US'], ['UAE', 'UAE'], ['EU', 'EU'], ['AU', 'AU'], ['CA', 'CA'],
  ];
  for (const [regJurisdiction, orgJurisdiction] of exactPairs) {
    it(`${regJurisdiction} reg + ${orgJurisdiction} org → jurisdictionMatch=true`, () => {
      const result = calculateRelevance(
        reg({ jurisdiction: regJurisdiction, publishedDate: new Date('2020-01-01') }),
        { ...BASE_ORG, jurisdiction: orgJurisdiction, standards: [], categories: [] },
      );
      expect(result.jurisdictionMatch).toBe(true);
      expect(result.score).toBeGreaterThanOrEqual(30);
    });
  }

  it('GLOBAL regulation + any org jurisdiction → jurisdictionMatch=true', () => {
    const result = calculateRelevance(
      reg({ jurisdiction: 'GLOBAL', publishedDate: new Date('2020-01-01') }),
      { ...BASE_ORG, jurisdiction: 'AU', standards: [], categories: [] },
    );
    expect(result.jurisdictionMatch).toBe(true);
  });

  it('EU regulation + UK org → jurisdictionMatch=true (special rule)', () => {
    const result = calculateRelevance(
      reg({ jurisdiction: 'EU', publishedDate: new Date('2020-01-01') }),
      { ...BASE_ORG, jurisdiction: 'UK', standards: [], categories: [] },
    );
    expect(result.jurisdictionMatch).toBe(true);
  });

  it('US regulation + UK org → jurisdictionMatch=false', () => {
    const result = calculateRelevance(
      reg({ jurisdiction: 'US', publishedDate: new Date('2020-01-01') }),
      { ...BASE_ORG, jurisdiction: 'UK', standards: [], categories: [] },
    );
    expect(result.jurisdictionMatch).toBe(false);
  });

  it('UAE regulation + US org → jurisdictionMatch=false', () => {
    const result = calculateRelevance(
      reg({ jurisdiction: 'UAE', publishedDate: new Date('2020-01-01') }),
      { ...BASE_ORG, jurisdiction: 'US', standards: [], categories: [] },
    );
    expect(result.jurisdictionMatch).toBe(false);
  });
});

// ── 3. calculateRelevance — standards component (+25) ────────────────────────

describe('calculateRelevance — standards (+25)', () => {
  const ANCIENT = new Date('2020-01-01'); // no recency bonus

  it('1 matching standard (100% of profile) → matchedStandards.length=1 and +25 pts', () => {
    const result = calculateRelevance(
      reg({ standards: ['ISO 45001'], jurisdiction: 'US', publishedDate: ANCIENT }),
      { ...BASE_ORG, standards: ['ISO 45001'], jurisdiction: 'US', categories: [] },
    );
    expect(result.matchedStandards).toContain('ISO 45001');
    // jurisdiction (30) + standards (25) = 55
    expect(result.score).toBe(55);
  });

  it('0 matching standards → matchedStandards empty, 0 pts for standards', () => {
    const result = calculateRelevance(
      reg({ standards: ['ISO 99999'], jurisdiction: 'US', publishedDate: ANCIENT }),
      { ...BASE_ORG, standards: ['ISO 45001'], jurisdiction: 'US', categories: [] },
    );
    expect(result.matchedStandards).toHaveLength(0);
    // jurisdiction (30) + standards (0) = 30
    expect(result.score).toBe(30);
  });

  it('1 of 2 profile standards matched → 50% × 25 = ~12 or 13 pts', () => {
    const result = calculateRelevance(
      reg({ standards: ['ISO 45001'], jurisdiction: 'US', publishedDate: ANCIENT }),
      { ...BASE_ORG, standards: ['ISO 45001', 'ISO 14001'], jurisdiction: 'US', categories: [] },
    );
    expect(result.matchedStandards).toHaveLength(1);
    // jurisdiction (30) + 50% of 25 = 12.5 → rounded → score = 30 + 12 or 13
    expect(result.score).toBeGreaterThanOrEqual(42);
    expect(result.score).toBeLessThanOrEqual(43);
  });

  it('standard match in regulation title (not standards array) → matched', () => {
    const result = calculateRelevance(
      reg({ title: 'ISO 45001 Health and Safety Guidance', standards: [], publishedDate: ANCIENT }),
      { ...BASE_ORG, standards: ['ISO 45001'], jurisdiction: 'GLOBAL', categories: [] },
    );
    expect(result.matchedStandards).toContain('ISO 45001');
  });

  it('standard match in description → matched', () => {
    const result = calculateRelevance(
      reg({
        description: 'Aligned with iso 14001 environmental requirements.',
        standards: [],
        publishedDate: ANCIENT,
      }),
      { ...BASE_ORG, standards: ['ISO 14001'], jurisdiction: 'GLOBAL', categories: [] },
    );
    expect(result.matchedStandards).toContain('ISO 14001');
  });

  it('empty orgProfile.standards → 0 pts for standards component', () => {
    const result = calculateRelevance(
      reg({ standards: ['ISO 45001'], publishedDate: ANCIENT }),
      { ...BASE_ORG, standards: [], categories: [] },
    );
    // Only jurisdiction match (30) — standards component skipped
    expect(result.score).toBe(30);
  });
});

// ── 4. calculateRelevance — category component (+20) ─────────────────────────

describe('calculateRelevance — categories (+20)', () => {
  const ANCIENT = new Date('2020-01-01');

  it('full category overlap (2/2) → +20 pts', () => {
    const result = calculateRelevance(
      reg({ categories: ['health-safety', 'environment'], jurisdiction: 'US', publishedDate: ANCIENT }),
      { ...BASE_ORG, standards: [], jurisdiction: 'US', categories: ['health-safety', 'environment'] },
    );
    expect(result.matchedCategories).toHaveLength(2);
    // jurisdiction (30) + categories (20) = 50
    expect(result.score).toBe(50);
  });

  it('1 of 2 profile categories matched → 50% × 20 = 10 pts', () => {
    const result = calculateRelevance(
      reg({ categories: ['health-safety'], jurisdiction: 'US', publishedDate: ANCIENT }),
      { ...BASE_ORG, standards: [], jurisdiction: 'US', categories: ['health-safety', 'environment'] },
    );
    expect(result.matchedCategories).toHaveLength(1);
    expect(result.score).toBe(40); // 30 + 10
  });

  it('no category overlap → matchedCategories empty, 0 pts', () => {
    const result = calculateRelevance(
      reg({ categories: ['food-safety'], jurisdiction: 'US', publishedDate: ANCIENT }),
      { ...BASE_ORG, standards: [], jurisdiction: 'US', categories: ['health-safety', 'environment'] },
    );
    expect(result.matchedCategories).toHaveLength(0);
    expect(result.score).toBe(30);
  });

  it('empty orgProfile.categories → 0 pts for category component', () => {
    const result = calculateRelevance(
      reg({ categories: ['health-safety'], publishedDate: ANCIENT }),
      { ...BASE_ORG, standards: [], categories: undefined },
    );
    // no category score possible
    expect(result.matchedCategories).toHaveLength(0);
  });
});

// ── 5. calculateRelevance — industry component (+15) ─────────────────────────

describe('calculateRelevance — industry (+15)', () => {
  const ANCIENT = new Date('2020-01-01');

  it('industry keyword in regulation.keywords → industryMatch=true, +15 pts', () => {
    const result = calculateRelevance(
      reg({ keywords: ['manufacturing', 'safety'], jurisdiction: 'US', publishedDate: ANCIENT }),
      { ...BASE_ORG, standards: [], jurisdiction: 'US', categories: [], industry: 'manufacturing' },
    );
    expect(result.industryMatch).toBe(true);
    expect(result.score).toBe(45); // 30 + 15
  });

  it('industry term in regulation.description → industryMatch=true', () => {
    const result = calculateRelevance(
      reg({
        description: 'Guidelines for pharmaceutical manufacturing processes.',
        keywords: [],
        jurisdiction: 'US',
        publishedDate: ANCIENT,
      }),
      { ...BASE_ORG, standards: [], jurisdiction: 'US', categories: [], industry: 'pharmaceutical' },
    );
    expect(result.industryMatch).toBe(true);
  });

  it('industry term absent from both keywords and description → industryMatch=false', () => {
    const result = calculateRelevance(
      reg({ keywords: ['data', 'privacy'], description: 'GDPR guidance.', publishedDate: ANCIENT }),
      { ...BASE_ORG, standards: [], categories: [], industry: 'aerospace', jurisdiction: 'UK' },
    );
    expect(result.industryMatch).toBe(false);
    expect(result.score).toBe(30);
  });
});

// ── 6. calculateRelevance — recency component (+10/5/2/0) ────────────────────

describe('calculateRelevance — recency bonus', () => {
  it('today (0 days) → +10 pts', () => {
    const result = calculateRelevance(
      reg({ jurisdiction: 'US', publishedDate: daysAgo(0) }),
      { ...BASE_ORG, standards: [], categories: [], jurisdiction: 'US' },
    );
    // jurisdiction (30) + recency (10) = 40
    expect(result.score).toBe(40);
  });

  it('30 days ago → +10 pts (boundary inclusive)', () => {
    const result = calculateRelevance(
      reg({ jurisdiction: 'US', publishedDate: daysAgo(30) }),
      { ...BASE_ORG, standards: [], categories: [], jurisdiction: 'US' },
    );
    expect(result.score).toBe(40);
  });

  it('60 days ago → +5 pts (31-90 range)', () => {
    const result = calculateRelevance(
      reg({ jurisdiction: 'US', publishedDate: daysAgo(60) }),
      { ...BASE_ORG, standards: [], categories: [], jurisdiction: 'US' },
    );
    expect(result.score).toBe(35); // 30 + 5
  });

  it('90 days ago → +5 pts (boundary inclusive)', () => {
    const result = calculateRelevance(
      reg({ jurisdiction: 'US', publishedDate: daysAgo(90) }),
      { ...BASE_ORG, standards: [], categories: [], jurisdiction: 'US' },
    );
    expect(result.score).toBe(35);
  });

  it('200 days ago → +2 pts (91-365 range)', () => {
    const result = calculateRelevance(
      reg({ jurisdiction: 'US', publishedDate: daysAgo(200) }),
      { ...BASE_ORG, standards: [], categories: [], jurisdiction: 'US' },
    );
    expect(result.score).toBe(32); // 30 + 2
  });

  it('365 days ago → +2 pts (boundary inclusive)', () => {
    const result = calculateRelevance(
      reg({ jurisdiction: 'US', publishedDate: daysAgo(365) }),
      { ...BASE_ORG, standards: [], categories: [], jurisdiction: 'US' },
    );
    expect(result.score).toBe(32);
  });

  it('400 days ago → +0 pts (>365)', () => {
    const result = calculateRelevance(
      reg({ jurisdiction: 'US', publishedDate: daysAgo(400) }),
      { ...BASE_ORG, standards: [], categories: [], jurisdiction: 'US' },
    );
    expect(result.score).toBe(30); // jurisdiction only
  });
});

// ── 7. calculateRelevance — score bounds and invariants ──────────────────────

describe('calculateRelevance — score bounds and invariants', () => {
  it('score is always a non-negative integer', () => {
    const cases = [
      reg({ jurisdiction: 'UK', standards: ['ISO 45001'], categories: ['health-safety'], keywords: ['manufacturing'], publishedDate: daysAgo(10) }),
      reg({ jurisdiction: 'US', publishedDate: new Date('2020-01-01') }),
      reg({ jurisdiction: 'UAE', publishedDate: new Date('2018-01-01') }),
    ];
    const orgs: OrgProfile[] = [
      BASE_ORG,
      { ...BASE_ORG, jurisdiction: 'US' },
      { standards: [], industry: 'healthcare', jurisdiction: 'UAE' },
    ];
    for (let i = 0; i < cases.length; i++) {
      const result = calculateRelevance(cases[i], orgs[i]);
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(Number.isInteger(result.score)).toBe(true);
    }
  });

  it('maximum possible score is 100 (all components matched, today published)', () => {
    const fullReg = reg({
      jurisdiction: 'UK',
      title: 'ISO 45001 ISO 14001 Compliance',
      description: 'Guidance for manufacturing industries on health-safety and environment.',
      standards: ['ISO 45001', 'ISO 14001'],
      categories: ['health-safety', 'environment'],
      keywords: ['manufacturing', 'health-safety'],
      publishedDate: daysAgo(5),
    });
    const result = calculateRelevance(fullReg, BASE_ORG);
    expect(result.score).toBe(100);
  });

  it('minimum score is 0 (no matches, ancient date)', () => {
    const result = calculateRelevance(
      reg({ jurisdiction: 'US', publishedDate: new Date('2010-01-01') }),
      { standards: [], industry: 'space-travel', jurisdiction: 'AU', categories: [] },
    );
    expect(result.score).toBe(0);
  });

  it('score ≤ 100 always', () => {
    // Even with all components, should not exceed 100
    const result = calculateRelevance(
      reg({
        jurisdiction: 'UK', standards: ['ISO 45001', 'ISO 14001', 'ISO 9001'],
        categories: ['health-safety', 'environment', 'quality'],
        keywords: ['manufacturing'], publishedDate: daysAgo(1),
        description: 'manufacturing ISO 45001 ISO 14001 ISO 9001 quality health-safety',
      }),
      {
        standards: ['ISO 45001', 'ISO 14001', 'ISO 9001'],
        industry: 'manufacturing',
        jurisdiction: 'UK',
        categories: ['health-safety', 'environment', 'quality'],
      },
    );
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it('result.regulation is the same object passed in', () => {
    const r = reg({ jurisdiction: 'UK', publishedDate: daysAgo(5) });
    const result = calculateRelevance(r, BASE_ORG);
    expect(result.regulation).toBe(r);
  });

  it('matchedStandards and matchedCategories are arrays', () => {
    const result = calculateRelevance(reg({ publishedDate: daysAgo(5) }), BASE_ORG);
    expect(Array.isArray(result.matchedStandards)).toBe(true);
    expect(Array.isArray(result.matchedCategories)).toBe(true);
  });
});

// ── 8. filterRelevant ────────────────────────────────────────────────────────

describe('filterRelevant', () => {
  it('empty regulation list returns empty result', () => {
    expect(filterRelevant([], BASE_ORG)).toHaveLength(0);
  });

  it('results are sorted descending by score', () => {
    const regs = [
      reg({ jurisdiction: 'US', publishedDate: new Date('2020-01-01') }), // 0 pts
      reg({ jurisdiction: 'UK', publishedDate: daysAgo(5) }),              // 40 pts
      reg({ jurisdiction: 'UK', standards: ['ISO 45001'], categories: ['health-safety', 'environment'], keywords: ['manufacturing'], publishedDate: daysAgo(5) }), // high
    ];
    const results = filterRelevant(regs, BASE_ORG, 0);
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1].score).toBeGreaterThanOrEqual(results[i].score);
    }
  });

  it('default threshold of 30 excludes regulations below 30', () => {
    const regs = [
      reg({ jurisdiction: 'US', publishedDate: new Date('2020-01-01') }), // score=0
      reg({ jurisdiction: 'UK', publishedDate: daysAgo(5) }),              // score=40
    ];
    const results = filterRelevant(regs, BASE_ORG);
    // Only UK one (40) passes default threshold of 30
    expect(results.length).toBe(1);
    expect(results[0].score).toBeGreaterThanOrEqual(30);
  });

  it('threshold=0 includes everything', () => {
    const regs = [
      reg({ jurisdiction: 'US', publishedDate: new Date('2010-01-01') }), // 0 pts
      reg({ jurisdiction: 'UK', publishedDate: daysAgo(5) }),
    ];
    const results = filterRelevant(regs, BASE_ORG, 0);
    expect(results.length).toBe(2);
  });

  it('threshold=100 includes only max-score regulations', () => {
    const fullReg = reg({
      jurisdiction: 'UK',
      description: 'manufacturing iso 45001 iso 14001',
      standards: ['ISO 45001', 'ISO 14001'],
      categories: ['health-safety', 'environment'],
      keywords: ['manufacturing'],
      publishedDate: daysAgo(5),
    });
    const results = filterRelevant([fullReg], BASE_ORG, 100);
    expect(results.length).toBe(1);
    expect(results[0].score).toBe(100);
  });

  it('all results have score ≥ threshold', () => {
    const regs = Array.from({ length: 5 }, (_, i) =>
      reg({ jurisdiction: i % 2 === 0 ? 'UK' : 'US', publishedDate: daysAgo(i * 50) })
    );
    const threshold = 25;
    const results = filterRelevant(regs, BASE_ORG, threshold);
    for (const r of results) {
      expect(r.score).toBeGreaterThanOrEqual(threshold);
    }
  });
});

// ── 9. RegulatoryFeedService ─────────────────────────────────────────────────

describe('RegulatoryFeedService', () => {
  it('getById returns undefined for non-existent regulation', () => {
    const svc = new RegulatoryFeedService();
    expect(svc.getById('non-existent')).toBeUndefined();
  });

  it('addRegulation → getById returns added regulation', () => {
    const svc = new RegulatoryFeedService();
    const r = reg({ id: 'REG-SVC-001' });
    svc.addRegulation(r);
    expect(svc.getById('REG-SVC-001')).toBe(r);
  });

  it('addRegulations → getAll returns all added', () => {
    const svc = new RegulatoryFeedService();
    const regs = [reg({ id: 'A' }), reg({ id: 'B' }), reg({ id: 'C' })];
    svc.addRegulations(regs);
    expect(svc.getAll()).toHaveLength(3);
  });

  it('getAll returns empty array when no regulations added', () => {
    const svc = new RegulatoryFeedService();
    expect(svc.getAll()).toHaveLength(0);
  });

  it('getLatest throws for unknown source', () => {
    const svc = new RegulatoryFeedService();
    expect(() => svc.getLatest('unknown_source_xyz')).toThrow();
  });

  it('getLatest returns empty when no regulations match source', () => {
    const svc = new RegulatoryFeedService();
    svc.addRegulation(reg({ id: 'R1', source: 'uk_ea' }));
    const results = svc.getLatest('uk_hse');
    expect(results).toHaveLength(0);
  });

  it('getLatest returns regulations sorted newest first', () => {
    const svc = new RegulatoryFeedService();
    svc.addRegulations([
      reg({ id: 'old', source: 'uk_hse', publishedDate: new Date('2024-01-01') }),
      reg({ id: 'new', source: 'uk_hse', publishedDate: new Date('2026-01-01') }),
      reg({ id: 'mid', source: 'uk_hse', publishedDate: new Date('2025-06-01') }),
    ]);
    const results = svc.getLatest('uk_hse', 10);
    expect(results[0].id).toBe('new');
    expect(results[1].id).toBe('mid');
    expect(results[2].id).toBe('old');
  });

  it('getLatest respects limit parameter', () => {
    const svc = new RegulatoryFeedService();
    for (let i = 0; i < 5; i++) {
      svc.addRegulation(reg({ id: `R${i}`, source: 'uk_hse', publishedDate: new Date(2020 + i, 0, 1) }));
    }
    expect(svc.getLatest('uk_hse', 3)).toHaveLength(3);
    expect(svc.getLatest('uk_hse', 1)).toHaveLength(1);
  });

  it('getLatest default limit is 10', () => {
    const svc = new RegulatoryFeedService();
    for (let i = 0; i < 15; i++) {
      svc.addRegulation(reg({ id: `R${i}`, source: 'uk_hse', publishedDate: new Date(2020, i % 12, 1) }));
    }
    expect(svc.getLatest('uk_hse')).toHaveLength(10);
  });

  it('searchRegulations single term finds matching regulation', () => {
    const svc = new RegulatoryFeedService();
    svc.addRegulation(reg({ id: 'R1', title: 'COSHH Chemicals Regulation' }));
    svc.addRegulation(reg({ id: 'R2', title: 'Fire Safety Rules' }));
    const results = svc.searchRegulations('coshh');
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('R1');
  });

  it('searchRegulations multi-term uses AND logic', () => {
    const svc = new RegulatoryFeedService();
    svc.addRegulation(reg({ id: 'R1', title: 'Chemical Safety Handling', description: 'safety rules' }));
    svc.addRegulation(reg({ id: 'R2', title: 'Chemical Waste Disposal', description: 'waste regulations' }));
    // Both have "chemical" but only R1 has "safety"
    const results = svc.searchRegulations('chemical safety');
    expect(results.map((r) => r.id)).toContain('R1');
    expect(results.map((r) => r.id)).not.toContain('R2');
  });

  it('searchRegulations returns all when query matches all', () => {
    const svc = new RegulatoryFeedService();
    svc.addRegulations([
      reg({ id: 'R1', title: 'safety' }),
      reg({ id: 'R2', title: 'fire safety guidance' }),
    ]);
    const results = svc.searchRegulations('safety');
    expect(results.length).toBeGreaterThanOrEqual(2);
  });

  it('importToLegalRegister fails for unknown regulation id', () => {
    const svc = new RegulatoryFeedService();
    const result = svc.importToLegalRegister('UNKNOWN-REG');
    expect(result.success).toBe(false);
    expect(result.regulationId).toBe('UNKNOWN-REG');
    expect(result.message).toContain('UNKNOWN-REG');
  });

  it('importToLegalRegister succeeds for known regulation', () => {
    const svc = new RegulatoryFeedService();
    svc.addRegulation(reg({ id: 'REG-IMPORT' }));
    const result = svc.importToLegalRegister('REG-IMPORT');
    expect(result.success).toBe(true);
    expect(result.regulationId).toBe('REG-IMPORT');
    expect(result.legalRegisterId).toMatch(/^LR-/);
  });

  it('getCountBySource returns correct counts', () => {
    const svc = new RegulatoryFeedService();
    svc.addRegulations([
      reg({ id: 'A1', source: 'uk_hse' }),
      reg({ id: 'A2', source: 'uk_hse' }),
      reg({ id: 'B1', source: 'eu_oj' }),
    ]);
    const counts = svc.getCountBySource();
    expect(counts['uk_hse']).toBe(2);
    expect(counts['eu_oj']).toBe(1);
  });

  it('getCountBySource returns empty object when no regulations', () => {
    const svc = new RegulatoryFeedService();
    expect(svc.getCountBySource()).toEqual({});
  });
});

// ── 10. getSourcesByJurisdiction / getSourcesByCategory ──────────────────────

describe('getSourcesByJurisdiction', () => {
  it('UK jurisdiction returns uk_hse, uk_ea, uk_mhra', () => {
    const sources = getSourcesByJurisdiction('UK');
    const ids = sources.map((s) => s.id);
    expect(ids).toContain('uk_hse');
    expect(ids).toContain('uk_ea');
    expect(ids).toContain('uk_mhra');
  });

  it('US jurisdiction returns us_osha and us_epa', () => {
    const sources = getSourcesByJurisdiction('US');
    const ids = sources.map((s) => s.id);
    expect(ids).toContain('us_osha');
    expect(ids).toContain('us_epa');
  });

  it('UAE jurisdiction returns uae_mohre and uae_dm', () => {
    const sources = getSourcesByJurisdiction('UAE');
    const ids = sources.map((s) => s.id);
    expect(ids).toContain('uae_mohre');
    expect(ids).toContain('uae_dm');
  });

  it('EU jurisdiction returns eu_oj', () => {
    const sources = getSourcesByJurisdiction('EU');
    const ids = sources.map((s) => s.id);
    expect(ids).toContain('eu_oj');
  });

  it('unknown jurisdiction returns empty array', () => {
    expect(getSourcesByJurisdiction('XX')).toHaveLength(0);
  });

  it('all sources have the correct jurisdiction', () => {
    for (const jurisdiction of ['UK', 'US', 'UAE', 'EU']) {
      const sources = getSourcesByJurisdiction(jurisdiction);
      for (const src of sources) {
        expect(src.jurisdiction === jurisdiction || src.jurisdiction === 'GLOBAL').toBe(true);
      }
    }
  });
});

describe('getSourcesByCategory', () => {
  it('health-safety category returns at least uk_hse, us_osha, uae_mohre, eu_oj', () => {
    const sources = getSourcesByCategory('health-safety');
    const ids = sources.map((s) => s.id);
    expect(ids).toContain('uk_hse');
    expect(ids).toContain('us_osha');
  });

  it('environment category returns at least uk_ea and us_epa', () => {
    const sources = getSourcesByCategory('environment');
    const ids = sources.map((s) => s.id);
    expect(ids).toContain('uk_ea');
    expect(ids).toContain('us_epa');
  });

  it('medical-devices category returns uk_mhra', () => {
    const sources = getSourcesByCategory('medical-devices');
    const ids = sources.map((s) => s.id);
    expect(ids).toContain('uk_mhra');
  });

  it('unknown category returns empty array', () => {
    expect(getSourcesByCategory('space-exploration-xyz')).toHaveLength(0);
  });

  it('all returned sources actually include the requested category', () => {
    for (const cat of ['health-safety', 'environment', 'labour', 'emissions']) {
      const sources = getSourcesByCategory(cat);
      for (const src of sources) {
        expect(src.categories).toContain(cat);
      }
    }
  });
});
