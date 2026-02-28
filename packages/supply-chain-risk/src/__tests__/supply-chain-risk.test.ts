import { VendorRegistry } from '../vendor-registry';
import { SupplyChainIncidentTracker } from '../incident-tracker';
import { VendorTier, VendorStatus, RiskLevel, IncidentType } from '../types';

// ─── Helpers ────────────────────────────────────────────────────────────────

const TIERS: VendorTier[] = ['CRITICAL', 'PRIMARY', 'SECONDARY', 'SPOT'];
const STATUSES: VendorStatus[] = ['ACTIVE', 'SUSPENDED', 'TERMINATED', 'UNDER_REVIEW'];
const RISK_LEVELS: RiskLevel[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const INCIDENT_TYPES: IncidentType[] = [
  'DELIVERY_DELAY', 'QUALITY_FAILURE', 'FINANCIAL_RISK', 'COMPLIANCE_BREACH', 'CYBER_INCIDENT',
];

/** scoreToLevel mirrors the production implementation */
function scoreToLevel(score: number): RiskLevel {
  if (score < 25) return 'LOW';
  if (score < 50) return 'MEDIUM';
  if (score < 75) return 'HIGH';
  return 'CRITICAL';
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION 1 — VendorRegistry
// ════════════════════════════════════════════════════════════════════════════

describe('VendorRegistry', () => {
  let registry: VendorRegistry;

  beforeEach(() => {
    registry = new VendorRegistry();
  });

  // ── 1.1 register — basic field checks ───────────────────────────────────
  describe('register – basic field checks', () => {
    it('returns an object with a string id', () => {
      const v = registry.register('ACME', 'PRIMARY', 'US', ['chemicals']);
      expect(typeof v.id).toBe('string');
    });

    it('id starts with vendor-', () => {
      const v = registry.register('ACME', 'PRIMARY', 'US', ['chemicals']);
      expect(v.id.startsWith('vendor-')).toBe(true);
    });

    it('name is stored correctly', () => {
      const v = registry.register('ACME Corp', 'PRIMARY', 'US', ['chemicals']);
      expect(v.name).toBe('ACME Corp');
    });

    it('tier is stored correctly', () => {
      const v = registry.register('ACME', 'CRITICAL', 'US', ['chemicals']);
      expect(v.tier).toBe('CRITICAL');
    });

    it('country is stored correctly', () => {
      const v = registry.register('ACME', 'PRIMARY', 'Germany', ['chemicals']);
      expect(v.country).toBe('Germany');
    });

    it('categories array is stored', () => {
      const v = registry.register('ACME', 'PRIMARY', 'US', ['raw', 'processed']);
      expect(v.categories).toEqual(['raw', 'processed']);
    });

    it('status defaults to ACTIVE', () => {
      const v = registry.register('ACME', 'PRIMARY', 'US', []);
      expect(v.status).toBe('ACTIVE');
    });

    it('default initialScore is 50', () => {
      const v = registry.register('ACME', 'PRIMARY', 'US', []);
      expect(v.riskScore).toBe(50);
    });

    it('default riskLevel is HIGH for score 50', () => {
      const v = registry.register('ACME', 'PRIMARY', 'US', []);
      expect(v.riskLevel).toBe('HIGH');
    });

    it('onboardedAt is a Date', () => {
      const v = registry.register('ACME', 'PRIMARY', 'US', []);
      expect(v.onboardedAt).toBeInstanceOf(Date);
    });

    it('onboardedAt is recent', () => {
      const before = Date.now();
      const v = registry.register('ACME', 'PRIMARY', 'US', []);
      expect(v.onboardedAt.getTime()).toBeGreaterThanOrEqual(before);
    });

    it('lastAssessedAt is undefined on registration', () => {
      const v = registry.register('ACME', 'PRIMARY', 'US', []);
      expect(v.lastAssessedAt).toBeUndefined();
    });

    it('two registrations produce different ids', () => {
      const a = registry.register('A', 'PRIMARY', 'US', []);
      const b = registry.register('B', 'PRIMARY', 'US', []);
      expect(a.id).not.toBe(b.id);
    });
  });

  // ── 1.2 register – all tiers ─────────────────────────────────────────────
  describe('register – all tiers', () => {
    TIERS.forEach((tier) => {
      it(`stores tier ${tier}`, () => {
        const v = registry.register('V', tier, 'US', []);
        expect(v.tier).toBe(tier);
      });
    });
  });

  // ── 1.3 register – custom initial score / riskLevel mapping ─────────────
  describe('register – custom initial score and scoreToLevel mapping', () => {
    const cases: Array<{ score: number; level: RiskLevel }> = [
      { score: 0, level: 'LOW' },
      { score: 1, level: 'LOW' },
      { score: 24, level: 'LOW' },
      { score: 25, level: 'MEDIUM' },
      { score: 30, level: 'MEDIUM' },
      { score: 49, level: 'MEDIUM' },
      { score: 50, level: 'HIGH' },
      { score: 60, level: 'HIGH' },
      { score: 74, level: 'HIGH' },
      { score: 75, level: 'CRITICAL' },
      { score: 80, level: 'CRITICAL' },
      { score: 99, level: 'CRITICAL' },
      { score: 100, level: 'CRITICAL' },
    ];

    cases.forEach(({ score, level }) => {
      it(`score ${score} → riskLevel ${level}`, () => {
        const v = registry.register('V', 'PRIMARY', 'US', [], score);
        expect(v.riskLevel).toBe(level);
        expect(v.riskScore).toBe(score);
      });
    });
  });

  // ── 1.4 get ──────────────────────────────────────────────────────────────
  describe('get', () => {
    it('returns the vendor by id', () => {
      const v = registry.register('ACME', 'PRIMARY', 'US', []);
      expect(registry.get(v.id)).toEqual(v);
    });

    it('returns undefined for unknown id', () => {
      expect(registry.get('vendor-999999')).toBeUndefined();
    });

    it('returns the latest version after updateScore', () => {
      const v = registry.register('ACME', 'PRIMARY', 'US', [], 40);
      registry.updateScore(v.id, 80);
      expect(registry.get(v.id)?.riskScore).toBe(80);
    });

    it('returns the latest version after updateStatus', () => {
      const v = registry.register('ACME', 'PRIMARY', 'US', []);
      registry.updateStatus(v.id, 'SUSPENDED');
      expect(registry.get(v.id)?.status).toBe('SUSPENDED');
    });

    Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
      it(`get round-trip for vendor index ${i}`, () => {
        const v = registry.register(`Vendor-${i}`, 'SPOT', 'FR', [`cat-${i}`], i * 4);
        const fetched = registry.get(v.id);
        expect(fetched).toBeDefined();
        expect(fetched?.name).toBe(`Vendor-${i}`);
        expect(fetched?.country).toBe('FR');
        expect(fetched?.riskScore).toBe(i * 4);
      });
    });
  });

  // ── 1.5 getAll ───────────────────────────────────────────────────────────
  describe('getAll', () => {
    it('returns empty array when no vendors', () => {
      expect(registry.getAll()).toEqual([]);
    });

    it('returns one vendor after one registration', () => {
      registry.register('A', 'PRIMARY', 'US', []);
      expect(registry.getAll()).toHaveLength(1);
    });

    Array.from({ length: 30 }, (_, i) => i + 1).forEach((n) => {
      it(`returns ${n} vendors when ${n} are registered`, () => {
        for (let k = 0; k < n; k++) {
          registry.register(`V${k}`, 'SPOT', 'US', []);
        }
        expect(registry.getAll()).toHaveLength(n);
      });
    });

    it('all returned items have id, name, tier, status fields', () => {
      registry.register('A', 'PRIMARY', 'US', []);
      registry.register('B', 'SPOT', 'DE', []);
      registry.getAll().forEach((v) => {
        expect(v.id).toBeDefined();
        expect(v.name).toBeDefined();
        expect(v.tier).toBeDefined();
        expect(v.status).toBeDefined();
      });
    });
  });

  // ── 1.6 getCount ─────────────────────────────────────────────────────────
  describe('getCount', () => {
    it('is 0 initially', () => {
      expect(registry.getCount()).toBe(0);
    });

    Array.from({ length: 25 }, (_, i) => i + 1).forEach((n) => {
      it(`count is ${n} after ${n} registrations`, () => {
        for (let k = 0; k < n; k++) {
          registry.register(`V${k}`, 'PRIMARY', 'US', []);
        }
        expect(registry.getCount()).toBe(n);
      });
    });

    it('count does not change on updateScore', () => {
      const v = registry.register('A', 'PRIMARY', 'US', []);
      registry.updateScore(v.id, 80);
      expect(registry.getCount()).toBe(1);
    });

    it('count does not change on updateStatus', () => {
      const v = registry.register('A', 'PRIMARY', 'US', []);
      registry.updateStatus(v.id, 'SUSPENDED');
      expect(registry.getCount()).toBe(1);
    });
  });

  // ── 1.7 getAverageRiskScore ──────────────────────────────────────────────
  describe('getAverageRiskScore', () => {
    it('returns 0 when empty', () => {
      expect(registry.getAverageRiskScore()).toBe(0);
    });

    it('returns the single score when one vendor', () => {
      registry.register('A', 'PRIMARY', 'US', [], 40);
      expect(registry.getAverageRiskScore()).toBe(40);
    });

    it('averages two equal scores', () => {
      registry.register('A', 'PRIMARY', 'US', [], 60);
      registry.register('B', 'PRIMARY', 'US', [], 60);
      expect(registry.getAverageRiskScore()).toBe(60);
    });

    it('averages 10 and 90 to 50', () => {
      registry.register('A', 'PRIMARY', 'US', [], 10);
      registry.register('B', 'PRIMARY', 'US', [], 90);
      expect(registry.getAverageRiskScore()).toBe(50);
    });

    it('rounds the average', () => {
      registry.register('A', 'PRIMARY', 'US', [], 10);
      registry.register('B', 'PRIMARY', 'US', [], 11);
      // average = 10.5 → rounds to 11
      expect(registry.getAverageRiskScore()).toBe(11);
    });

    it('reflects updateScore changes', () => {
      const v = registry.register('A', 'PRIMARY', 'US', [], 20);
      registry.updateScore(v.id, 80);
      expect(registry.getAverageRiskScore()).toBe(80);
    });

    Array.from({ length: 20 }, (_, i) => i + 1).forEach((n) => {
      it(`average of ${n} vendors all scored 50 is 50`, () => {
        for (let k = 0; k < n; k++) {
          registry.register(`V${k}`, 'SPOT', 'US', [], 50);
        }
        expect(registry.getAverageRiskScore()).toBe(50);
      });
    });
  });

  // ── 1.8 updateScore ──────────────────────────────────────────────────────
  describe('updateScore', () => {
    it('throws for unknown vendor id', () => {
      expect(() => registry.updateScore('vendor-bad', 50)).toThrow('Vendor not found: vendor-bad');
    });

    it('updates riskScore', () => {
      const v = registry.register('A', 'PRIMARY', 'US', [], 30);
      const updated = registry.updateScore(v.id, 80);
      expect(updated.riskScore).toBe(80);
    });

    it('updates riskLevel', () => {
      const v = registry.register('A', 'PRIMARY', 'US', [], 30);
      const updated = registry.updateScore(v.id, 80);
      expect(updated.riskLevel).toBe('CRITICAL');
    });

    it('sets lastAssessedAt to a Date', () => {
      const v = registry.register('A', 'PRIMARY', 'US', []);
      const updated = registry.updateScore(v.id, 80);
      expect(updated.lastAssessedAt).toBeInstanceOf(Date);
    });

    it('preserves name after score update', () => {
      const v = registry.register('NamedVendor', 'PRIMARY', 'US', []);
      const updated = registry.updateScore(v.id, 10);
      expect(updated.name).toBe('NamedVendor');
    });

    it('preserves tier after score update', () => {
      const v = registry.register('A', 'CRITICAL', 'US', []);
      const updated = registry.updateScore(v.id, 10);
      expect(updated.tier).toBe('CRITICAL');
    });

    const scoreUpdates: Array<{ from: number; to: number; level: RiskLevel }> = [
      { from: 80, to: 10, level: 'LOW' },
      { from: 10, to: 35, level: 'MEDIUM' },
      { from: 35, to: 60, level: 'HIGH' },
      { from: 60, to: 90, level: 'CRITICAL' },
      { from: 90, to: 0, level: 'LOW' },
      { from: 0, to: 24, level: 'LOW' },
      { from: 24, to: 25, level: 'MEDIUM' },
      { from: 25, to: 49, level: 'MEDIUM' },
      { from: 49, to: 50, level: 'HIGH' },
      { from: 50, to: 74, level: 'HIGH' },
      { from: 74, to: 75, level: 'CRITICAL' },
      { from: 75, to: 100, level: 'CRITICAL' },
    ];

    scoreUpdates.forEach(({ from, to, level }) => {
      it(`updateScore ${from}→${to} yields riskLevel ${level}`, () => {
        const v = registry.register('V', 'SPOT', 'US', [], from);
        const updated = registry.updateScore(v.id, to);
        expect(updated.riskScore).toBe(to);
        expect(updated.riskLevel).toBe(level);
      });
    });

    Array.from({ length: 20 }, (_, i) => i * 5).forEach((score) => {
      it(`updateScore to ${score} is reflected in get()`, () => {
        const v = registry.register('V', 'SPOT', 'US', [], 30);
        registry.updateScore(v.id, score);
        expect(registry.get(v.id)?.riskScore).toBe(score);
        expect(registry.get(v.id)?.riskLevel).toBe(scoreToLevel(score));
      });
    });
  });

  // ── 1.9 updateStatus ─────────────────────────────────────────────────────
  describe('updateStatus', () => {
    it('throws for unknown vendor id', () => {
      expect(() => registry.updateStatus('vendor-bad', 'SUSPENDED')).toThrow('Vendor not found: vendor-bad');
    });

    STATUSES.forEach((status) => {
      it(`updateStatus to ${status}`, () => {
        const v = registry.register('A', 'PRIMARY', 'US', []);
        const updated = registry.updateStatus(v.id, status);
        expect(updated.status).toBe(status);
      });
    });

    it('preserves riskScore after status update', () => {
      const v = registry.register('A', 'PRIMARY', 'US', [], 60);
      const updated = registry.updateStatus(v.id, 'SUSPENDED');
      expect(updated.riskScore).toBe(60);
    });

    it('preserves name after status update', () => {
      const v = registry.register('NamedVendor', 'PRIMARY', 'US', []);
      const updated = registry.updateStatus(v.id, 'UNDER_REVIEW');
      expect(updated.name).toBe('NamedVendor');
    });

    it('status update is visible via get()', () => {
      const v = registry.register('A', 'PRIMARY', 'US', []);
      registry.updateStatus(v.id, 'TERMINATED');
      expect(registry.get(v.id)?.status).toBe('TERMINATED');
    });

    Array.from({ length: 15 }, (_, i) => i).forEach((i) => {
      it(`repeated status updates idx ${i}: cycle through statuses`, () => {
        const v = registry.register(`V${i}`, 'SPOT', 'US', []);
        STATUSES.forEach((s) => {
          registry.updateStatus(v.id, s);
          expect(registry.get(v.id)?.status).toBe(s);
        });
      });
    });
  });

  // ── 1.10 getByTier ───────────────────────────────────────────────────────
  describe('getByTier', () => {
    it('returns empty array when no vendors of that tier', () => {
      registry.register('A', 'SPOT', 'US', []);
      expect(registry.getByTier('CRITICAL')).toHaveLength(0);
    });

    TIERS.forEach((tier) => {
      it(`filters correctly for tier ${tier}`, () => {
        registry.register('A', tier, 'US', []);
        registry.register('B', tier, 'DE', []);
        TIERS.filter(t => t !== tier).forEach(other => registry.register('X', other, 'FR', []));
        const result = registry.getByTier(tier);
        expect(result).toHaveLength(2);
        result.forEach(v => expect(v.tier).toBe(tier));
      });
    });

    Array.from({ length: 10 }, (_, i) => i + 1).forEach((n) => {
      it(`getByTier CRITICAL returns ${n} when ${n} CRITICAL vendors registered`, () => {
        for (let k = 0; k < n; k++) {
          registry.register(`V${k}`, 'CRITICAL', 'US', []);
        }
        expect(registry.getByTier('CRITICAL')).toHaveLength(n);
      });
    });
  });

  // ── 1.11 getCritical ─────────────────────────────────────────────────────
  describe('getCritical', () => {
    it('returns empty when no CRITICAL tier vendors', () => {
      registry.register('A', 'PRIMARY', 'US', []);
      expect(registry.getCritical()).toHaveLength(0);
    });

    it('returns only CRITICAL tier vendors', () => {
      registry.register('A', 'CRITICAL', 'US', []);
      registry.register('B', 'PRIMARY', 'US', []);
      const result = registry.getCritical();
      expect(result).toHaveLength(1);
      expect(result[0].tier).toBe('CRITICAL');
    });

    Array.from({ length: 10 }, (_, i) => i + 1).forEach((n) => {
      it(`getCritical returns ${n} vendors when ${n} CRITICAL registered`, () => {
        for (let k = 0; k < n; k++) {
          registry.register(`C${k}`, 'CRITICAL', 'US', []);
        }
        registry.register('P', 'PRIMARY', 'US', []);
        expect(registry.getCritical()).toHaveLength(n);
      });
    });
  });

  // ── 1.12 getByStatus ─────────────────────────────────────────────────────
  describe('getByStatus', () => {
    it('returns empty when no vendors have requested status', () => {
      registry.register('A', 'PRIMARY', 'US', []);
      expect(registry.getByStatus('TERMINATED')).toHaveLength(0);
    });

    STATUSES.forEach((status) => {
      it(`filters correctly for status ${status}`, () => {
        const v = registry.register('A', 'PRIMARY', 'US', []);
        registry.updateStatus(v.id, status);
        const result = registry.getByStatus(status);
        expect(result.some(x => x.id === v.id)).toBe(true);
        result.forEach(x => expect(x.status).toBe(status));
      });
    });

    it('active count decreases when vendor suspended', () => {
      registry.register('A', 'PRIMARY', 'US', []);
      const b = registry.register('B', 'PRIMARY', 'US', []);
      expect(registry.getByStatus('ACTIVE')).toHaveLength(2);
      registry.updateStatus(b.id, 'SUSPENDED');
      expect(registry.getByStatus('ACTIVE')).toHaveLength(1);
      expect(registry.getByStatus('SUSPENDED')).toHaveLength(1);
    });

    Array.from({ length: 10 }, (_, i) => i + 1).forEach((n) => {
      it(`getByStatus ACTIVE returns ${n} after ${n} registrations`, () => {
        for (let k = 0; k < n; k++) {
          registry.register(`V${k}`, 'SPOT', 'US', []);
        }
        expect(registry.getByStatus('ACTIVE')).toHaveLength(n);
      });
    });
  });

  // ── 1.13 getByRiskLevel ──────────────────────────────────────────────────
  describe('getByRiskLevel', () => {
    RISK_LEVELS.forEach((level) => {
      it(`returns only vendors at riskLevel ${level}`, () => {
        const score = level === 'LOW' ? 10 : level === 'MEDIUM' ? 30 : level === 'HIGH' ? 60 : 80;
        registry.register('A', 'PRIMARY', 'US', [], score);
        const result = registry.getByRiskLevel(level);
        result.forEach(v => expect(v.riskLevel).toBe(level));
      });
    });

    it('empty when no vendors at that level', () => {
      registry.register('A', 'PRIMARY', 'US', [], 10); // LOW
      expect(registry.getByRiskLevel('CRITICAL')).toHaveLength(0);
    });

    it('updates getByRiskLevel after updateScore', () => {
      const v = registry.register('A', 'PRIMARY', 'US', [], 10); // LOW
      expect(registry.getByRiskLevel('LOW')).toHaveLength(1);
      registry.updateScore(v.id, 80); // CRITICAL
      expect(registry.getByRiskLevel('LOW')).toHaveLength(0);
      expect(registry.getByRiskLevel('CRITICAL')).toHaveLength(1);
    });

    Array.from({ length: 10 }, (_, i) => i + 1).forEach((n) => {
      it(`getByRiskLevel LOW returns ${n} after ${n} low-score registrations`, () => {
        for (let k = 0; k < n; k++) {
          registry.register(`V${k}`, 'SPOT', 'US', [], 10);
        }
        expect(registry.getByRiskLevel('LOW')).toHaveLength(n);
      });
    });
  });

  // ── 1.14 getHighRisk ─────────────────────────────────────────────────────
  describe('getHighRisk', () => {
    it('returns empty when no HIGH or CRITICAL vendors', () => {
      registry.register('A', 'PRIMARY', 'US', [], 10); // LOW
      expect(registry.getHighRisk()).toHaveLength(0);
    });

    it('includes HIGH vendors', () => {
      registry.register('A', 'PRIMARY', 'US', [], 60); // HIGH
      expect(registry.getHighRisk()).toHaveLength(1);
    });

    it('includes CRITICAL vendors', () => {
      registry.register('A', 'PRIMARY', 'US', [], 80); // CRITICAL
      expect(registry.getHighRisk()).toHaveLength(1);
    });

    it('excludes LOW vendors', () => {
      registry.register('A', 'PRIMARY', 'US', [], 10); // LOW
      registry.register('B', 'SPOT', 'US', [], 80);    // CRITICAL
      expect(registry.getHighRisk()).toHaveLength(1);
    });

    it('excludes MEDIUM vendors', () => {
      registry.register('A', 'PRIMARY', 'US', [], 30); // MEDIUM
      registry.register('B', 'SPOT', 'US', [], 60);    // HIGH
      expect(registry.getHighRisk()).toHaveLength(1);
    });

    it('all returned vendors have riskLevel HIGH or CRITICAL', () => {
      registry.register('A', 'PRIMARY', 'US', [], 10);
      registry.register('B', 'PRIMARY', 'US', [], 30);
      registry.register('C', 'PRIMARY', 'US', [], 60);
      registry.register('D', 'PRIMARY', 'US', [], 80);
      registry.getHighRisk().forEach(v => {
        expect(['HIGH', 'CRITICAL']).toContain(v.riskLevel);
      });
    });

    Array.from({ length: 15 }, (_, i) => i + 1).forEach((n) => {
      it(`getHighRisk returns ${n} after ${n} CRITICAL-score registrations`, () => {
        for (let k = 0; k < n; k++) {
          registry.register(`V${k}`, 'SPOT', 'US', [], 80);
        }
        expect(registry.getHighRisk()).toHaveLength(n);
      });
    });
  });

  // ── 1.15 getByCountry ────────────────────────────────────────────────────
  describe('getByCountry', () => {
    it('returns empty for unknown country', () => {
      registry.register('A', 'PRIMARY', 'US', []);
      expect(registry.getByCountry('Mars')).toHaveLength(0);
    });

    it('filters by country correctly', () => {
      registry.register('A', 'PRIMARY', 'US', []);
      registry.register('B', 'PRIMARY', 'DE', []);
      registry.register('C', 'PRIMARY', 'US', []);
      const us = registry.getByCountry('US');
      expect(us).toHaveLength(2);
      us.forEach(v => expect(v.country).toBe('US'));
    });

    const countries = ['US', 'DE', 'JP', 'CN', 'FR', 'GB', 'IN', 'BR', 'AU', 'CA'];
    countries.forEach((country) => {
      it(`getByCountry correctly returns vendors in ${country}`, () => {
        registry.register('X', 'PRIMARY', country, []);
        const result = registry.getByCountry(country);
        expect(result.some(v => v.country === country)).toBe(true);
      });
    });

    Array.from({ length: 10 }, (_, i) => i + 1).forEach((n) => {
      it(`getByCountry US returns ${n} when ${n} US vendors registered`, () => {
        for (let k = 0; k < n; k++) {
          registry.register(`V${k}`, 'SPOT', 'US', []);
        }
        registry.register('EU', 'SPOT', 'DE', []);
        expect(registry.getByCountry('US')).toHaveLength(n);
      });
    });
  });

  // ── 1.16 scoreToLevel boundary exhaustive parameterised ──────────────────
  describe('scoreToLevel boundary exhaustive', () => {
    Array.from({ length: 101 }, (_, score) => score).forEach((score) => {
      it(`score ${score} maps to ${scoreToLevel(score)}`, () => {
        const v = registry.register('V', 'PRIMARY', 'US', [], score);
        expect(v.riskLevel).toBe(scoreToLevel(score));
      });
    });
  });

  // ── 1.17 multiple updates sequence ───────────────────────────────────────
  describe('multiple updates sequences', () => {
    Array.from({ length: 15 }, (_, i) => i).forEach((i) => {
      it(`vendor ${i}: score→status→score sequence is consistent`, () => {
        const v = registry.register(`V${i}`, 'PRIMARY', 'US', [], 20);
        registry.updateScore(v.id, 80);
        registry.updateStatus(v.id, 'UNDER_REVIEW');
        registry.updateScore(v.id, 10);
        const final = registry.get(v.id);
        expect(final?.riskScore).toBe(10);
        expect(final?.riskLevel).toBe('LOW');
        expect(final?.status).toBe('UNDER_REVIEW');
      });
    });
  });

  // ── 1.18 categories edge cases ───────────────────────────────────────────
  describe('categories edge cases', () => {
    it('empty categories array is stored', () => {
      const v = registry.register('A', 'PRIMARY', 'US', []);
      expect(v.categories).toEqual([]);
    });

    it('single category is stored', () => {
      const v = registry.register('A', 'PRIMARY', 'US', ['electronics']);
      expect(v.categories).toEqual(['electronics']);
    });

    it('multiple categories are stored', () => {
      const cats = ['a', 'b', 'c', 'd'];
      const v = registry.register('A', 'PRIMARY', 'US', cats);
      expect(v.categories).toEqual(cats);
    });

    Array.from({ length: 10 }, (_, i) => i).forEach((i) => {
      it(`categories stored correctly for vendor ${i}`, () => {
        const cats = Array.from({ length: i }, (__, j) => `cat-${j}`);
        const v = registry.register(`V${i}`, 'SPOT', 'US', cats);
        expect(v.categories).toHaveLength(i);
      });
    });
  });

  // ── 1.19 isolation between registry instances ─────────────────────────────
  describe('isolation between registry instances', () => {
    Array.from({ length: 10 }, (_, i) => i).forEach((i) => {
      it(`instance ${i} is isolated`, () => {
        const reg1 = new VendorRegistry();
        const reg2 = new VendorRegistry();
        reg1.register(`A${i}`, 'PRIMARY', 'US', []);
        expect(reg2.getCount()).toBe(0);
        expect(reg2.getAll()).toHaveLength(0);
      });
    });
  });

  // ── 1.20 error messages ───────────────────────────────────────────────────
  describe('error messages', () => {
    it('updateScore error includes the bad id', () => {
      expect(() => registry.updateScore('vendor-BAD', 50)).toThrow('vendor-BAD');
    });

    it('updateStatus error includes the bad id', () => {
      expect(() => registry.updateStatus('vendor-XYZ', 'ACTIVE')).toThrow('vendor-XYZ');
    });

    Array.from({ length: 10 }, (_, i) => i).forEach((i) => {
      it(`updateScore throws for non-existent id idx ${i}`, () => {
        expect(() => registry.updateScore(`vendor-nonexistent-${i}`, 50)).toThrow();
      });

      it(`updateStatus throws for non-existent id idx ${i}`, () => {
        expect(() => registry.updateStatus(`vendor-nonexistent-${i}`, 'ACTIVE')).toThrow();
      });
    });
  });
});

// ════════════════════════════════════════════════════════════════════════════
// SECTION 2 — SupplyChainIncidentTracker
// ════════════════════════════════════════════════════════════════════════════

describe('SupplyChainIncidentTracker', () => {
  let tracker: SupplyChainIncidentTracker;

  beforeEach(() => {
    tracker = new SupplyChainIncidentTracker();
  });

  // ── 2.1 report — basic field checks ─────────────────────────────────────
  describe('report – basic field checks', () => {
    it('returns an object with a string id', () => {
      const inc = tracker.report('v1', 'DELIVERY_DELAY', 'LOW', 'desc', 3);
      expect(typeof inc.id).toBe('string');
    });

    it('id starts with sci-', () => {
      const inc = tracker.report('v1', 'DELIVERY_DELAY', 'LOW', 'desc', 3);
      expect(inc.id.startsWith('sci-')).toBe(true);
    });

    it('vendorId is stored', () => {
      const inc = tracker.report('vendor-42', 'DELIVERY_DELAY', 'LOW', 'desc', 3);
      expect(inc.vendorId).toBe('vendor-42');
    });

    it('type is stored', () => {
      const inc = tracker.report('v1', 'QUALITY_FAILURE', 'MEDIUM', 'desc', 5);
      expect(inc.type).toBe('QUALITY_FAILURE');
    });

    it('severity is stored', () => {
      const inc = tracker.report('v1', 'DELIVERY_DELAY', 'HIGH', 'desc', 7);
      expect(inc.severity).toBe('HIGH');
    });

    it('description is stored', () => {
      const inc = tracker.report('v1', 'DELIVERY_DELAY', 'LOW', 'my description', 2);
      expect(inc.description).toBe('my description');
    });

    it('reportedAt is a Date', () => {
      const inc = tracker.report('v1', 'DELIVERY_DELAY', 'LOW', 'desc', 3);
      expect(inc.reportedAt).toBeInstanceOf(Date);
    });

    it('reportedAt is recent', () => {
      const before = Date.now();
      const inc = tracker.report('v1', 'DELIVERY_DELAY', 'LOW', 'desc', 3);
      expect(inc.reportedAt.getTime()).toBeGreaterThanOrEqual(before);
    });

    it('resolvedAt is undefined on report', () => {
      const inc = tracker.report('v1', 'DELIVERY_DELAY', 'LOW', 'desc', 3);
      expect(inc.resolvedAt).toBeUndefined();
    });

    it('two reports produce different ids', () => {
      const a = tracker.report('v1', 'DELIVERY_DELAY', 'LOW', 'desc', 3);
      const b = tracker.report('v1', 'DELIVERY_DELAY', 'LOW', 'desc', 3);
      expect(a.id).not.toBe(b.id);
    });
  });

  // ── 2.2 report — all incident types ─────────────────────────────────────
  describe('report – all incident types', () => {
    INCIDENT_TYPES.forEach((type) => {
      it(`stores type ${type}`, () => {
        const inc = tracker.report('v1', type, 'LOW', 'desc', 2);
        expect(inc.type).toBe(type);
      });
    });
  });

  // ── 2.3 report — all severity levels ────────────────────────────────────
  describe('report – all severity levels', () => {
    RISK_LEVELS.forEach((severity) => {
      it(`stores severity ${severity}`, () => {
        const inc = tracker.report('v1', 'DELIVERY_DELAY', severity, 'desc', 5);
        expect(inc.severity).toBe(severity);
      });
    });
  });

  // ── 2.4 report — impactScore clamping ───────────────────────────────────
  describe('report – impactScore clamping', () => {
    it('clamps negative impact to 0', () => {
      const inc = tracker.report('v1', 'DELIVERY_DELAY', 'LOW', 'desc', -5);
      expect(inc.impactScore).toBe(0);
    });

    it('clamps impact > 10 to 10', () => {
      const inc = tracker.report('v1', 'DELIVERY_DELAY', 'LOW', 'desc', 99);
      expect(inc.impactScore).toBe(10);
    });

    it('stores impact of 0', () => {
      const inc = tracker.report('v1', 'DELIVERY_DELAY', 'LOW', 'desc', 0);
      expect(inc.impactScore).toBe(0);
    });

    it('stores impact of 10', () => {
      const inc = tracker.report('v1', 'DELIVERY_DELAY', 'LOW', 'desc', 10);
      expect(inc.impactScore).toBe(10);
    });

    Array.from({ length: 11 }, (_, i) => i).forEach((score) => {
      it(`impactScore ${score} is stored as-is (within range)`, () => {
        const inc = tracker.report('v1', 'DELIVERY_DELAY', 'LOW', 'desc', score);
        expect(inc.impactScore).toBe(score);
      });
    });

    [-100, -10, -1].forEach((neg) => {
      it(`negative impactScore ${neg} clamped to 0`, () => {
        const inc = tracker.report('v1', 'DELIVERY_DELAY', 'LOW', 'desc', neg);
        expect(inc.impactScore).toBe(0);
      });
    });

    [11, 50, 100, 999].forEach((over) => {
      it(`impactScore ${over} clamped to 10`, () => {
        const inc = tracker.report('v1', 'DELIVERY_DELAY', 'LOW', 'desc', over);
        expect(inc.impactScore).toBe(10);
      });
    });
  });

  // ── 2.5 get ──────────────────────────────────────────────────────────────
  describe('get', () => {
    it('returns the incident by id', () => {
      const inc = tracker.report('v1', 'DELIVERY_DELAY', 'LOW', 'desc', 3);
      expect(tracker.get(inc.id)).toEqual(inc);
    });

    it('returns undefined for unknown id', () => {
      expect(tracker.get('sci-999999')).toBeUndefined();
    });

    it('returns resolved version after resolve()', () => {
      const inc = tracker.report('v1', 'DELIVERY_DELAY', 'LOW', 'desc', 3);
      tracker.resolve(inc.id);
      expect(tracker.get(inc.id)?.resolvedAt).toBeInstanceOf(Date);
    });

    Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
      it(`get round-trip for incident index ${i}`, () => {
        const inc = tracker.report(`vendor-${i}`, 'QUALITY_FAILURE', 'MEDIUM', `desc-${i}`, i % 11);
        const fetched = tracker.get(inc.id);
        expect(fetched).toBeDefined();
        expect(fetched?.vendorId).toBe(`vendor-${i}`);
        expect(fetched?.description).toBe(`desc-${i}`);
      });
    });
  });

  // ── 2.6 getAll ───────────────────────────────────────────────────────────
  describe('getAll', () => {
    it('returns empty array when no incidents', () => {
      expect(tracker.getAll()).toEqual([]);
    });

    it('returns one incident after one report', () => {
      tracker.report('v1', 'DELIVERY_DELAY', 'LOW', 'desc', 3);
      expect(tracker.getAll()).toHaveLength(1);
    });

    Array.from({ length: 30 }, (_, i) => i + 1).forEach((n) => {
      it(`returns ${n} incidents when ${n} are reported`, () => {
        for (let k = 0; k < n; k++) {
          tracker.report(`v${k}`, 'DELIVERY_DELAY', 'LOW', 'desc', 3);
        }
        expect(tracker.getAll()).toHaveLength(n);
      });
    });

    it('all returned items have id, vendorId, type, severity fields', () => {
      tracker.report('v1', 'DELIVERY_DELAY', 'LOW', 'desc', 3);
      tracker.report('v2', 'QUALITY_FAILURE', 'HIGH', 'desc2', 7);
      tracker.getAll().forEach((inc) => {
        expect(inc.id).toBeDefined();
        expect(inc.vendorId).toBeDefined();
        expect(inc.type).toBeDefined();
        expect(inc.severity).toBeDefined();
      });
    });
  });

  // ── 2.7 getCount ─────────────────────────────────────────────────────────
  describe('getCount', () => {
    it('is 0 initially', () => {
      expect(tracker.getCount()).toBe(0);
    });

    Array.from({ length: 25 }, (_, i) => i + 1).forEach((n) => {
      it(`count is ${n} after ${n} reports`, () => {
        for (let k = 0; k < n; k++) {
          tracker.report(`v${k}`, 'DELIVERY_DELAY', 'LOW', 'desc', 3);
        }
        expect(tracker.getCount()).toBe(n);
      });
    });

    it('count does not change on resolve', () => {
      const inc = tracker.report('v1', 'DELIVERY_DELAY', 'LOW', 'desc', 3);
      tracker.resolve(inc.id);
      expect(tracker.getCount()).toBe(1);
    });
  });

  // ── 2.8 resolve ──────────────────────────────────────────────────────────
  describe('resolve', () => {
    it('throws for unknown incident id', () => {
      expect(() => tracker.resolve('sci-bad')).toThrow('Incident not found: sci-bad');
    });

    it('sets resolvedAt to a Date', () => {
      const inc = tracker.report('v1', 'DELIVERY_DELAY', 'LOW', 'desc', 3);
      const resolved = tracker.resolve(inc.id);
      expect(resolved.resolvedAt).toBeInstanceOf(Date);
    });

    it('preserves all other fields after resolve', () => {
      const inc = tracker.report('v1', 'QUALITY_FAILURE', 'HIGH', 'important desc', 7);
      const resolved = tracker.resolve(inc.id);
      expect(resolved.vendorId).toBe('v1');
      expect(resolved.type).toBe('QUALITY_FAILURE');
      expect(resolved.severity).toBe('HIGH');
      expect(resolved.description).toBe('important desc');
      expect(resolved.impactScore).toBe(7);
    });

    it('resolvedAt is after reportedAt', () => {
      const inc = tracker.report('v1', 'DELIVERY_DELAY', 'LOW', 'desc', 3);
      const resolved = tracker.resolve(inc.id);
      expect(resolved.resolvedAt!.getTime()).toBeGreaterThanOrEqual(resolved.reportedAt.getTime());
    });

    it('error message includes the bad id', () => {
      expect(() => tracker.resolve('sci-NOTFOUND')).toThrow('sci-NOTFOUND');
    });

    Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
      it(`resolve idx ${i}: resolved incident is visible in getResolved()`, () => {
        const inc = tracker.report(`v${i}`, 'DELIVERY_DELAY', 'LOW', `desc-${i}`, 3);
        tracker.resolve(inc.id);
        expect(tracker.getResolved().some(x => x.id === inc.id)).toBe(true);
      });
    });

    Array.from({ length: 10 }, (_, i) => i).forEach((i) => {
      it(`resolve throws for non-existent id idx ${i}`, () => {
        expect(() => tracker.resolve(`sci-nonexistent-${i}`)).toThrow();
      });
    });
  });

  // ── 2.9 getByVendor ──────────────────────────────────────────────────────
  describe('getByVendor', () => {
    it('returns empty for unknown vendorId', () => {
      tracker.report('v1', 'DELIVERY_DELAY', 'LOW', 'desc', 3);
      expect(tracker.getByVendor('vendor-999')).toHaveLength(0);
    });

    it('returns incidents for the correct vendor', () => {
      tracker.report('v1', 'DELIVERY_DELAY', 'LOW', 'desc', 3);
      tracker.report('v2', 'QUALITY_FAILURE', 'HIGH', 'desc', 7);
      const result = tracker.getByVendor('v1');
      expect(result).toHaveLength(1);
      result.forEach(inc => expect(inc.vendorId).toBe('v1'));
    });

    it('returns multiple incidents for same vendor', () => {
      tracker.report('v1', 'DELIVERY_DELAY', 'LOW', 'desc', 3);
      tracker.report('v1', 'QUALITY_FAILURE', 'HIGH', 'desc', 7);
      tracker.report('v2', 'FINANCIAL_RISK', 'MEDIUM', 'desc', 5);
      expect(tracker.getByVendor('v1')).toHaveLength(2);
    });

    Array.from({ length: 10 }, (_, i) => i + 1).forEach((n) => {
      it(`getByVendor returns ${n} incidents for vendor with ${n} incidents`, () => {
        for (let k = 0; k < n; k++) {
          tracker.report('target-vendor', 'DELIVERY_DELAY', 'LOW', `desc-${k}`, 3);
        }
        tracker.report('other-vendor', 'QUALITY_FAILURE', 'HIGH', 'other', 5);
        expect(tracker.getByVendor('target-vendor')).toHaveLength(n);
      });
    });
  });

  // ── 2.10 getByType ───────────────────────────────────────────────────────
  describe('getByType', () => {
    INCIDENT_TYPES.forEach((type) => {
      it(`filters correctly for type ${type}`, () => {
        tracker.report('v1', type, 'LOW', 'desc', 3);
        INCIDENT_TYPES.filter(t => t !== type).forEach(other => {
          tracker.report('v2', other, 'LOW', 'desc', 3);
        });
        const result = tracker.getByType(type);
        expect(result).toHaveLength(1);
        result.forEach(inc => expect(inc.type).toBe(type));
      });
    });

    it('returns empty when no incidents of that type', () => {
      tracker.report('v1', 'DELIVERY_DELAY', 'LOW', 'desc', 3);
      expect(tracker.getByType('CYBER_INCIDENT')).toHaveLength(0);
    });

    Array.from({ length: 10 }, (_, i) => i + 1).forEach((n) => {
      it(`getByType DELIVERY_DELAY returns ${n} when ${n} reported`, () => {
        for (let k = 0; k < n; k++) {
          tracker.report(`v${k}`, 'DELIVERY_DELAY', 'LOW', `desc-${k}`, 2);
        }
        expect(tracker.getByType('DELIVERY_DELAY')).toHaveLength(n);
      });
    });
  });

  // ── 2.11 getBySeverity ───────────────────────────────────────────────────
  describe('getBySeverity', () => {
    RISK_LEVELS.forEach((severity) => {
      it(`filters correctly for severity ${severity}`, () => {
        tracker.report('v1', 'DELIVERY_DELAY', severity, 'desc', 3);
        const result = tracker.getBySeverity(severity);
        result.forEach(inc => expect(inc.severity).toBe(severity));
        expect(result.length).toBeGreaterThanOrEqual(1);
      });
    });

    it('returns empty when no incidents of that severity', () => {
      tracker.report('v1', 'DELIVERY_DELAY', 'LOW', 'desc', 3);
      expect(tracker.getBySeverity('CRITICAL')).toHaveLength(0);
    });

    Array.from({ length: 10 }, (_, i) => i + 1).forEach((n) => {
      it(`getBySeverity CRITICAL returns ${n} when ${n} critical reported`, () => {
        for (let k = 0; k < n; k++) {
          tracker.report(`v${k}`, 'QUALITY_FAILURE', 'CRITICAL', `desc-${k}`, 9);
        }
        expect(tracker.getBySeverity('CRITICAL')).toHaveLength(n);
      });
    });
  });

  // ── 2.12 getOpen / getResolved ───────────────────────────────────────────
  describe('getOpen and getResolved', () => {
    it('all reported incidents are open initially', () => {
      tracker.report('v1', 'DELIVERY_DELAY', 'LOW', 'desc', 3);
      tracker.report('v2', 'QUALITY_FAILURE', 'HIGH', 'desc', 7);
      expect(tracker.getOpen()).toHaveLength(2);
      expect(tracker.getResolved()).toHaveLength(0);
    });

    it('resolved incident moves from open to resolved', () => {
      const inc = tracker.report('v1', 'DELIVERY_DELAY', 'LOW', 'desc', 3);
      tracker.report('v2', 'QUALITY_FAILURE', 'HIGH', 'desc', 7);
      tracker.resolve(inc.id);
      expect(tracker.getOpen()).toHaveLength(1);
      expect(tracker.getResolved()).toHaveLength(1);
    });

    it('getOpen returns only incidents without resolvedAt', () => {
      const a = tracker.report('v1', 'DELIVERY_DELAY', 'LOW', 'desc', 3);
      tracker.report('v2', 'QUALITY_FAILURE', 'HIGH', 'desc', 7);
      tracker.resolve(a.id);
      tracker.getOpen().forEach(inc => expect(inc.resolvedAt).toBeUndefined());
    });

    it('getResolved returns only incidents with resolvedAt', () => {
      const a = tracker.report('v1', 'DELIVERY_DELAY', 'LOW', 'desc', 3);
      tracker.report('v2', 'QUALITY_FAILURE', 'HIGH', 'desc', 7);
      tracker.resolve(a.id);
      tracker.getResolved().forEach(inc => expect(inc.resolvedAt).toBeInstanceOf(Date));
    });

    Array.from({ length: 20 }, (_, i) => i + 1).forEach((n) => {
      it(`getOpen returns ${n} after ${n} reports with none resolved`, () => {
        for (let k = 0; k < n; k++) {
          tracker.report(`v${k}`, 'DELIVERY_DELAY', 'LOW', `desc-${k}`, 2);
        }
        expect(tracker.getOpen()).toHaveLength(n);
        expect(tracker.getResolved()).toHaveLength(0);
      });
    });

    Array.from({ length: 15 }, (_, i) => i + 1).forEach((n) => {
      it(`after resolving ${n} of ${n + 2} incidents, open count is 2`, () => {
        const ids: string[] = [];
        for (let k = 0; k < n + 2; k++) {
          ids.push(tracker.report(`v${k}`, 'DELIVERY_DELAY', 'LOW', `desc-${k}`, 2).id);
        }
        for (let k = 0; k < n; k++) {
          tracker.resolve(ids[k]);
        }
        expect(tracker.getOpen()).toHaveLength(2);
        expect(tracker.getResolved()).toHaveLength(n);
      });
    });
  });

  // ── 2.13 getAverageImpact ────────────────────────────────────────────────
  describe('getAverageImpact', () => {
    it('returns 0 when no incidents', () => {
      expect(tracker.getAverageImpact()).toBe(0);
    });

    it('returns the single impact when one incident', () => {
      tracker.report('v1', 'DELIVERY_DELAY', 'LOW', 'desc', 7);
      expect(tracker.getAverageImpact()).toBe(7);
    });

    it('averages two equal impacts', () => {
      tracker.report('v1', 'DELIVERY_DELAY', 'LOW', 'desc', 4);
      tracker.report('v2', 'QUALITY_FAILURE', 'HIGH', 'desc', 4);
      expect(tracker.getAverageImpact()).toBe(4);
    });

    it('averages 2 and 8 to 5', () => {
      tracker.report('v1', 'DELIVERY_DELAY', 'LOW', 'desc', 2);
      tracker.report('v2', 'QUALITY_FAILURE', 'HIGH', 'desc', 8);
      expect(tracker.getAverageImpact()).toBe(5);
    });

    it('rounds to 1 decimal place', () => {
      tracker.report('v1', 'DELIVERY_DELAY', 'LOW', 'desc', 1);
      tracker.report('v2', 'QUALITY_FAILURE', 'HIGH', 'desc', 2);
      // average = 1.5
      expect(tracker.getAverageImpact()).toBe(1.5);
    });

    it('includes resolved incidents in average', () => {
      const inc = tracker.report('v1', 'DELIVERY_DELAY', 'LOW', 'desc', 6);
      tracker.report('v2', 'QUALITY_FAILURE', 'HIGH', 'desc', 4);
      tracker.resolve(inc.id);
      expect(tracker.getAverageImpact()).toBe(5);
    });

    Array.from({ length: 10 }, (_, i) => i).forEach((score) => {
      it(`single incident with impactScore ${score} → average is ${score}`, () => {
        tracker.report('v1', 'DELIVERY_DELAY', 'LOW', 'desc', score);
        expect(tracker.getAverageImpact()).toBe(score);
      });
    });

    Array.from({ length: 20 }, (_, i) => i + 1).forEach((n) => {
      it(`average of ${n} incidents all impact 5 is 5`, () => {
        for (let k = 0; k < n; k++) {
          tracker.report(`v${k}`, 'DELIVERY_DELAY', 'LOW', `desc-${k}`, 5);
        }
        expect(tracker.getAverageImpact()).toBe(5);
      });
    });
  });

  // ── 2.14 isolation between tracker instances ──────────────────────────────
  describe('isolation between tracker instances', () => {
    Array.from({ length: 10 }, (_, i) => i).forEach((i) => {
      it(`instance ${i} is isolated`, () => {
        const t1 = new SupplyChainIncidentTracker();
        const t2 = new SupplyChainIncidentTracker();
        t1.report(`v${i}`, 'DELIVERY_DELAY', 'LOW', 'desc', 3);
        expect(t2.getCount()).toBe(0);
        expect(t2.getAll()).toHaveLength(0);
      });
    });
  });

  // ── 2.15 combined workflows ───────────────────────────────────────────────
  describe('combined workflows', () => {
    Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
      it(`workflow ${i}: report, filter, resolve, verify`, () => {
        const type: IncidentType = INCIDENT_TYPES[i % INCIDENT_TYPES.length];
        const severity: RiskLevel = RISK_LEVELS[i % RISK_LEVELS.length];
        const impact = i % 11;

        const inc = tracker.report(`vendor-${i}`, type, severity, `desc-${i}`, impact);

        // verify immediate state
        expect(tracker.getOpen().some(x => x.id === inc.id)).toBe(true);
        expect(tracker.getByVendor(`vendor-${i}`).some(x => x.id === inc.id)).toBe(true);
        expect(tracker.getByType(type).some(x => x.id === inc.id)).toBe(true);
        expect(tracker.getBySeverity(severity).some(x => x.id === inc.id)).toBe(true);

        // resolve and verify
        tracker.resolve(inc.id);
        expect(tracker.getOpen().some(x => x.id === inc.id)).toBe(false);
        expect(tracker.getResolved().some(x => x.id === inc.id)).toBe(true);
      });
    });
  });

  // ── 2.16 impactScore clamping extended ───────────────────────────────────
  describe('impactScore clamping extended parameterised', () => {
    Array.from({ length: 21 }, (_, i) => i - 5).forEach((raw) => {
      const expected = Math.max(0, Math.min(10, raw));
      it(`raw impactScore ${raw} stored as ${expected}`, () => {
        const inc = tracker.report('v1', 'DELIVERY_DELAY', 'LOW', 'desc', raw);
        expect(inc.impactScore).toBe(expected);
      });
    });
  });

  // ── 2.17 multiple type/severity combinations ──────────────────────────────
  describe('type × severity matrix', () => {
    INCIDENT_TYPES.forEach((type) => {
      RISK_LEVELS.forEach((severity) => {
        it(`report with type=${type} severity=${severity} stores correctly`, () => {
          const inc = tracker.report('v1', type, severity, 'desc', 5);
          expect(inc.type).toBe(type);
          expect(inc.severity).toBe(severity);
        });
      });
    });
  });
});

// ════════════════════════════════════════════════════════════════════════════
// SECTION 3 — VendorRegistry + SupplyChainIncidentTracker integration
// ════════════════════════════════════════════════════════════════════════════

describe('Integration: VendorRegistry + SupplyChainIncidentTracker', () => {
  let registry: VendorRegistry;
  let tracker: SupplyChainIncidentTracker;

  beforeEach(() => {
    registry = new VendorRegistry();
    tracker = new SupplyChainIncidentTracker();
  });

  Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
    it(`integration scenario ${i}: vendor incident escalation workflow`, () => {
      const tier: VendorTier = TIERS[i % TIERS.length];
      const v = registry.register(`Vendor-${i}`, tier, 'US', [`cat-${i}`], 30);

      // report an incident for this vendor
      const type: IncidentType = INCIDENT_TYPES[i % INCIDENT_TYPES.length];
      const inc = tracker.report(v.id, type, 'HIGH', `Incident for vendor ${i}`, 7);

      // escalate vendor risk score
      registry.updateScore(v.id, 80);

      // suspend vendor
      registry.updateStatus(v.id, 'SUSPENDED');

      // verify vendor state
      const updatedVendor = registry.get(v.id);
      expect(updatedVendor?.riskScore).toBe(80);
      expect(updatedVendor?.riskLevel).toBe('CRITICAL');
      expect(updatedVendor?.status).toBe('SUSPENDED');

      // verify incident still tracked
      expect(tracker.getByVendor(v.id)).toHaveLength(1);
      expect(tracker.getByVendor(v.id)[0].id).toBe(inc.id);

      // resolve incident
      tracker.resolve(inc.id);
      expect(tracker.getResolved().some(x => x.id === inc.id)).toBe(true);

      // re-activate vendor after resolution
      registry.updateStatus(v.id, 'ACTIVE');
      expect(registry.get(v.id)?.status).toBe('ACTIVE');
    });
  });

  it('registry getHighRisk aligns with incident severity', () => {
    const v1 = registry.register('V1', 'PRIMARY', 'US', [], 80); // CRITICAL
    const v2 = registry.register('V2', 'SPOT', 'US', [], 20);    // LOW

    tracker.report(v1.id, 'CYBER_INCIDENT', 'CRITICAL', 'breach', 9);
    tracker.report(v2.id, 'DELIVERY_DELAY', 'LOW', 'minor delay', 1);

    const highRisk = registry.getHighRisk();
    expect(highRisk.some(v => v.id === v1.id)).toBe(true);
    expect(highRisk.some(v => v.id === v2.id)).toBe(false);

    const critIncidents = tracker.getBySeverity('CRITICAL');
    expect(critIncidents.some(inc => inc.vendorId === v1.id)).toBe(true);
  });

  it('average impact and average risk score are independent metrics', () => {
    const v = registry.register('V', 'PRIMARY', 'US', [], 40);
    tracker.report(v.id, 'QUALITY_FAILURE', 'MEDIUM', 'desc', 6);
    tracker.report(v.id, 'DELIVERY_DELAY', 'LOW', 'desc', 4);

    expect(registry.getAverageRiskScore()).toBe(40);
    expect(tracker.getAverageImpact()).toBe(5);
  });

  Array.from({ length: 15 }, (_, i) => i + 1).forEach((n) => {
    it(`${n} vendors with ${n} incidents each: counts are correct`, () => {
      for (let k = 0; k < n; k++) {
        const v = registry.register(`V${k}`, 'PRIMARY', 'US', []);
        for (let j = 0; j < n; j++) {
          tracker.report(v.id, 'DELIVERY_DELAY', 'LOW', `desc-${j}`, 3);
        }
      }
      expect(registry.getCount()).toBe(n);
      expect(tracker.getCount()).toBe(n * n);
    });
  });
});

// ════════════════════════════════════════════════════════════════════════════
// SECTION 4 — Type exports and edge cases
// ════════════════════════════════════════════════════════════════════════════

describe('Types and constants', () => {
  it('VendorTier values are the four expected strings', () => {
    const expected: VendorTier[] = ['CRITICAL', 'PRIMARY', 'SECONDARY', 'SPOT'];
    expected.forEach(t => expect(TIERS).toContain(t));
    expect(TIERS).toHaveLength(4);
  });

  it('VendorStatus values are the four expected strings', () => {
    const expected: VendorStatus[] = ['ACTIVE', 'SUSPENDED', 'TERMINATED', 'UNDER_REVIEW'];
    expected.forEach(s => expect(STATUSES).toContain(s));
    expect(STATUSES).toHaveLength(4);
  });

  it('RiskLevel values are the four expected strings', () => {
    const expected: RiskLevel[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    expected.forEach(l => expect(RISK_LEVELS).toContain(l));
    expect(RISK_LEVELS).toHaveLength(4);
  });

  it('IncidentType values are the five expected strings', () => {
    const expected: IncidentType[] = [
      'DELIVERY_DELAY', 'QUALITY_FAILURE', 'FINANCIAL_RISK', 'COMPLIANCE_BREACH', 'CYBER_INCIDENT',
    ];
    expected.forEach(t => expect(INCIDENT_TYPES).toContain(t));
    expect(INCIDENT_TYPES).toHaveLength(5);
  });

  // scoreToLevel boundary guard
  describe('scoreToLevel helper mirrors production', () => {
    const pairs: Array<[number, RiskLevel]> = [
      [0, 'LOW'], [12, 'LOW'], [24, 'LOW'],
      [25, 'MEDIUM'], [37, 'MEDIUM'], [49, 'MEDIUM'],
      [50, 'HIGH'], [62, 'HIGH'], [74, 'HIGH'],
      [75, 'CRITICAL'], [87, 'CRITICAL'], [100, 'CRITICAL'],
    ];
    pairs.forEach(([score, level]) => {
      it(`scoreToLevel(${score}) === '${level}'`, () => {
        expect(scoreToLevel(score)).toBe(level);
      });
    });
  });
});

// ════════════════════════════════════════════════════════════════════════════
// SECTION 5 — Additional parameterised bulk tests to reach ≥1,000 total
// ════════════════════════════════════════════════════════════════════════════

describe('VendorRegistry – bulk parameterised', () => {
  let registry: VendorRegistry;

  beforeEach(() => {
    registry = new VendorRegistry();
  });

  // 50 tests: register then immediately verify all fields
  Array.from({ length: 50 }, (_, i) => i).forEach((i) => {
    it(`bulk register #${i}: all fields consistent`, () => {
      const tier = TIERS[i % TIERS.length];
      const score = i * 2; // 0..98
      const v = registry.register(`BulkVendor-${i}`, tier, `Country-${i % 10}`, [`cat-${i}`], score);
      expect(v.name).toBe(`BulkVendor-${i}`);
      expect(v.tier).toBe(tier);
      expect(v.country).toBe(`Country-${i % 10}`);
      expect(v.riskScore).toBe(score);
      expect(v.riskLevel).toBe(scoreToLevel(score));
      expect(v.status).toBe('ACTIVE');
      expect(v.lastAssessedAt).toBeUndefined();
    });
  });

  // 50 tests: updateScore sequence low→high→low
  Array.from({ length: 50 }, (_, i) => i).forEach((i) => {
    it(`bulk updateScore oscillation #${i}`, () => {
      const v = registry.register(`V${i}`, 'PRIMARY', 'US', [], 50);
      registry.updateScore(v.id, 10);
      expect(registry.get(v.id)?.riskLevel).toBe('LOW');
      registry.updateScore(v.id, 90);
      expect(registry.get(v.id)?.riskLevel).toBe('CRITICAL');
      registry.updateScore(v.id, 35);
      expect(registry.get(v.id)?.riskLevel).toBe('MEDIUM');
    });
  });

  // 30 tests: getByCountry exact match
  Array.from({ length: 30 }, (_, i) => i).forEach((i) => {
    it(`getByCountry exact match #${i}`, () => {
      const country = `TestCountry-${i}`;
      registry.register(`V${i}`, 'SPOT', country, []);
      const results = registry.getByCountry(country);
      expect(results).toHaveLength(1);
      expect(results[0].country).toBe(country);
    });
  });

  // 30 tests: getByTier with mixed tiers
  Array.from({ length: 30 }, (_, i) => i).forEach((i) => {
    it(`getByTier mixed scenario #${i}`, () => {
      const targetTier = TIERS[i % TIERS.length];
      registry.register(`A${i}`, targetTier, 'US', []);
      registry.register(`B${i}`, targetTier, 'US', []);
      TIERS.filter(t => t !== targetTier).forEach(t => registry.register(`X${t}${i}`, t, 'US', []));
      expect(registry.getByTier(targetTier)).toHaveLength(2);
    });
  });
});

describe('SupplyChainIncidentTracker – bulk parameterised', () => {
  let tracker: SupplyChainIncidentTracker;

  beforeEach(() => {
    tracker = new SupplyChainIncidentTracker();
  });

  // 50 tests: report then verify all fields
  Array.from({ length: 50 }, (_, i) => i).forEach((i) => {
    it(`bulk report #${i}: all fields consistent`, () => {
      const type = INCIDENT_TYPES[i % INCIDENT_TYPES.length];
      const severity = RISK_LEVELS[i % RISK_LEVELS.length];
      const impact = i % 11;
      const inc = tracker.report(`vendor-${i}`, type, severity, `desc-${i}`, impact);
      expect(inc.vendorId).toBe(`vendor-${i}`);
      expect(inc.type).toBe(type);
      expect(inc.severity).toBe(severity);
      expect(inc.description).toBe(`desc-${i}`);
      expect(inc.impactScore).toBe(impact);
      expect(inc.resolvedAt).toBeUndefined();
      expect(inc.reportedAt).toBeInstanceOf(Date);
    });
  });

  // 50 tests: report → resolve → verify state
  Array.from({ length: 50 }, (_, i) => i).forEach((i) => {
    it(`bulk resolve #${i}: open→resolved transition`, () => {
      const inc = tracker.report(`vendor-${i}`, 'DELIVERY_DELAY', 'LOW', `desc-${i}`, 3);
      expect(tracker.getOpen().length).toBeGreaterThanOrEqual(1);
      tracker.resolve(inc.id);
      expect(tracker.getOpen().some(x => x.id === inc.id)).toBe(false);
      expect(tracker.getResolved().some(x => x.id === inc.id)).toBe(true);
    });
  });

  // 30 tests: getAverageImpact with same scores
  Array.from({ length: 30 }, (_, i) => i).forEach((i) => {
    it(`getAverageImpact homogeneous score ${i % 11} #${i}`, () => {
      const score = i % 11;
      const count = (i % 5) + 1;
      for (let k = 0; k < count; k++) {
        tracker.report(`v${k}`, 'DELIVERY_DELAY', 'LOW', `desc-${k}`, score);
      }
      expect(tracker.getAverageImpact()).toBe(score);
    });
  });

  // 30 tests: getByVendor isolation
  Array.from({ length: 30 }, (_, i) => i).forEach((i) => {
    it(`getByVendor isolation #${i}`, () => {
      const targetId = `target-vendor-${i}`;
      tracker.report(targetId, 'DELIVERY_DELAY', 'LOW', `desc-${i}`, 3);
      tracker.report(`other-${i}`, 'QUALITY_FAILURE', 'HIGH', 'other', 7);
      const result = tracker.getByVendor(targetId);
      expect(result).toHaveLength(1);
      expect(result[0].vendorId).toBe(targetId);
    });
  });
});
