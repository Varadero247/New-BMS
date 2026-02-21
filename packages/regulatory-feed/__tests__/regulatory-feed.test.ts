import {
  REGULATORY_SOURCES,
  getSourcesByJurisdiction,
  getSourcesByCategory,
  calculateRelevance,
  filterRelevant,
  RegulatoryFeedService,
} from '../src';
import type { Regulation, OrgProfile } from '../src';

function createTestRegulation(overrides: Partial<Regulation> = {}): Regulation {
  return {
    id: `reg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    title: 'Test Regulation on Workplace Safety',
    description: 'New guidance on managing workplace safety risks in manufacturing environments.',
    jurisdiction: 'UK',
    source: 'uk_hse',
    sourceUrl: 'https://www.hse.gov.uk/test',
    publishedDate: new Date('2026-01-15'),
    categories: ['health-safety', 'workplace-safety'],
    standards: ['ISO 45001'],
    keywords: ['safety', 'manufacturing', 'risk assessment'],
    status: 'NEW',
    ...overrides,
  };
}

const orgProfile: OrgProfile = {
  standards: ['ISO 45001', 'ISO 14001', 'ISO 9001'],
  industry: 'manufacturing',
  jurisdiction: 'UK',
  categories: ['health-safety', 'environment', 'quality'],
};

describe('regulatory-feed', () => {
  describe('REGULATORY_SOURCES', () => {
    it('should have UK HSE source', () => {
      expect(REGULATORY_SOURCES.uk_hse).toBeDefined();
      expect(REGULATORY_SOURCES.uk_hse.jurisdiction).toBe('UK');
    });

    it('should have UK Environment Agency source', () => {
      expect(REGULATORY_SOURCES.uk_ea).toBeDefined();
    });

    it('should have UK MHRA source', () => {
      expect(REGULATORY_SOURCES.uk_mhra).toBeDefined();
    });

    it('should have EU Official Journal source', () => {
      expect(REGULATORY_SOURCES.eu_oj).toBeDefined();
      expect(REGULATORY_SOURCES.eu_oj.jurisdiction).toBe('EU');
    });

    it('should have UAE MOHRE source', () => {
      expect(REGULATORY_SOURCES.uae_mohre).toBeDefined();
    });

    it('should have UAE Dubai Municipality source', () => {
      expect(REGULATORY_SOURCES.uae_dm).toBeDefined();
    });

    it('should have at least 6 sources', () => {
      expect(Object.keys(REGULATORY_SOURCES).length).toBeGreaterThanOrEqual(6);
    });
  });

  describe('getSourcesByJurisdiction', () => {
    it('should find UK sources', () => {
      const ukSources = getSourcesByJurisdiction('UK');
      expect(ukSources.length).toBeGreaterThanOrEqual(3);
      expect(ukSources.every((s) => s.jurisdiction === 'UK')).toBe(true);
    });

    it('should find UAE sources', () => {
      const uaeSources = getSourcesByJurisdiction('UAE');
      expect(uaeSources.length).toBeGreaterThanOrEqual(2);
    });

    it('should return empty for unknown jurisdiction', () => {
      const sources = getSourcesByJurisdiction('XX');
      expect(sources).toEqual([]);
    });
  });

  describe('getSourcesByCategory', () => {
    it('should find health-safety sources', () => {
      const sources = getSourcesByCategory('health-safety');
      expect(sources.length).toBeGreaterThanOrEqual(2);
    });

    it('should find environment sources', () => {
      const sources = getSourcesByCategory('environment');
      expect(sources.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('calculateRelevance', () => {
    it('should score high for matching jurisdiction and standards', () => {
      const reg = createTestRegulation();
      const result = calculateRelevance(reg, orgProfile);
      expect(result.score).toBeGreaterThanOrEqual(50);
      expect(result.jurisdictionMatch).toBe(true);
    });

    it('should score low for non-matching jurisdiction', () => {
      const reg = createTestRegulation({ jurisdiction: 'AU' });
      const result = calculateRelevance(reg, orgProfile);
      expect(result.jurisdictionMatch).toBe(false);
      expect(result.score).toBeLessThan(
        calculateRelevance(createTestRegulation(), orgProfile).score
      );
    });

    it('should match standards', () => {
      const reg = createTestRegulation({ standards: ['ISO 45001', 'ISO 14001'] });
      const result = calculateRelevance(reg, orgProfile);
      expect(result.matchedStandards.length).toBeGreaterThan(0);
    });

    it('should give recency bonus for recent regulations', () => {
      const recent = createTestRegulation({ publishedDate: new Date() });
      const old = createTestRegulation({ publishedDate: new Date('2020-01-01') });
      const recentScore = calculateRelevance(recent, orgProfile);
      const oldScore = calculateRelevance(old, orgProfile);
      expect(recentScore.score).toBeGreaterThan(oldScore.score);
    });

    it('should match industry keywords', () => {
      const reg = createTestRegulation({
        keywords: ['manufacturing', 'production', 'workplace'],
      });
      const result = calculateRelevance(reg, orgProfile);
      expect(result.industryMatch).toBe(true);
    });

    it('GLOBAL jurisdiction matches any org jurisdiction', () => {
      const reg = createTestRegulation({ jurisdiction: 'GLOBAL' });
      const result = calculateRelevance(reg, orgProfile);
      expect(result.jurisdictionMatch).toBe(true);
    });

    it('EU jurisdiction matches UK org (special case)', () => {
      const reg = createTestRegulation({ jurisdiction: 'EU' });
      const result = calculateRelevance(reg, orgProfile); // orgProfile.jurisdiction = 'UK'
      expect(result.jurisdictionMatch).toBe(true);
    });

    it('should score category overlap', () => {
      const reg = createTestRegulation({ categories: ['health-safety', 'environment'] });
      const result = calculateRelevance(reg, orgProfile); // orgProfile.categories includes both
      expect(result.matchedCategories.length).toBeGreaterThan(0);
    });

    it('recency bonus: 31-90 days gives partial bonus', () => {
      const reg60 = createTestRegulation({ publishedDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) });
      const reg7 = createTestRegulation({ publishedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) });
      // 60-day-old regulation gets less than 7-day-old
      expect(calculateRelevance(reg7, orgProfile).score).toBeGreaterThan(
        calculateRelevance(reg60, orgProfile).score
      );
    });
  });

  describe('filterRelevant', () => {
    it('should filter and sort by relevance', () => {
      const regulations = [
        createTestRegulation({ id: 'reg-1', title: 'UK Safety Update', standards: ['ISO 45001'] }),
        createTestRegulation({
          id: 'reg-2',
          title: 'Australian Tax Update',
          jurisdiction: 'AU',
          standards: [],
          keywords: ['tax'],
        }),
        createTestRegulation({
          id: 'reg-3',
          title: 'EU Environment Directive',
          jurisdiction: 'EU',
          standards: ['ISO 14001'],
          categories: ['environment'],
        }),
      ];

      const results = filterRelevant(regulations, orgProfile, 20);
      expect(results.length).toBeGreaterThanOrEqual(1);
      // Results should be sorted by score descending
      for (let i = 1; i < results.length; i++) {
        expect(results[i - 1].score).toBeGreaterThanOrEqual(results[i].score);
      }
    });

    it('should respect threshold', () => {
      const regulations = [
        createTestRegulation({ id: 'reg-high', jurisdiction: 'UK', standards: ['ISO 45001'] }),
        createTestRegulation({
          id: 'reg-low',
          jurisdiction: 'AU',
          standards: [],
          keywords: [],
          categories: [],
        }),
      ];

      const highThreshold = filterRelevant(regulations, orgProfile, 50);
      const lowThreshold = filterRelevant(regulations, orgProfile, 10);
      expect(lowThreshold.length).toBeGreaterThanOrEqual(highThreshold.length);
    });
  });

  describe('RegulatoryFeedService', () => {
    let service: RegulatoryFeedService;

    beforeEach(() => {
      service = new RegulatoryFeedService();
    });

    it('should add and retrieve regulations', () => {
      const reg = createTestRegulation({ id: 'reg-test-1' });
      service.addRegulation(reg);
      expect(service.getById('reg-test-1')).toBeDefined();
    });

    it('should get latest regulations by source', () => {
      service.addRegulations([
        createTestRegulation({ id: 'r1', source: 'uk_hse', publishedDate: new Date('2026-01-01') }),
        createTestRegulation({ id: 'r2', source: 'uk_hse', publishedDate: new Date('2026-02-01') }),
        createTestRegulation({ id: 'r3', source: 'uk_ea', publishedDate: new Date('2026-01-15') }),
      ]);

      const latest = service.getLatest('uk_hse', 10);
      expect(latest.length).toBe(2);
      // Should be sorted newest first
      expect(latest[0].id).toBe('r2');
    });

    it('should throw for unknown source', () => {
      expect(() => service.getLatest('unknown_source')).toThrow('Unknown regulatory source');
    });

    it('should search regulations by keyword', () => {
      service.addRegulations([
        createTestRegulation({ id: 's1', title: 'Noise at Work Regulations 2026' }),
        createTestRegulation({ id: 's2', title: 'Environmental Permitting Update' }),
      ]);

      const results = service.searchRegulations('noise work');
      expect(results.length).toBe(1);
      expect(results[0].id).toBe('s1');
    });

    it('should import to legal register', () => {
      const reg = createTestRegulation({ id: 'import-1' });
      service.addRegulation(reg);

      const result = service.importToLegalRegister('import-1');
      expect(result.success).toBe(true);
      expect(result.legalRegisterId).toBeDefined();
    });

    it('should fail to import unknown regulation', () => {
      const result = service.importToLegalRegister('nonexistent');
      expect(result.success).toBe(false);
    });

    it('should count regulations by source', () => {
      service.addRegulations([
        createTestRegulation({ id: 'c1', source: 'uk_hse' }),
        createTestRegulation({ id: 'c2', source: 'uk_hse' }),
        createTestRegulation({ id: 'c3', source: 'uk_ea' }),
      ]);

      const counts = service.getCountBySource();
      expect(counts['uk_hse']).toBe(2);
      expect(counts['uk_ea']).toBe(1);
    });

    it('should get all regulations', () => {
      service.addRegulations([
        createTestRegulation({ id: 'a1' }),
        createTestRegulation({ id: 'a2' }),
      ]);
      expect(service.getAll().length).toBe(2);
    });
  });
});
