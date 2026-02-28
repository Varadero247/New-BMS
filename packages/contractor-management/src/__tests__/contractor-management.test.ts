// Copyright (c) 2026 Nexara DMCC. All rights reserved. Confidential and proprietary.

import { ContractorRegistry } from '../contractor-registry';
import { InductionTracker } from '../induction-tracker';
import {
  ContractorStatus,
  ContractorType,
  ComplianceItem,
  InductionType,
  InductionStatus,
} from '../types';

// ---------------------------------------------------------------------------
// Helper factories
// ---------------------------------------------------------------------------
function makeRegistry(): ContractorRegistry {
  return new ContractorRegistry();
}
function makeTracker(): InductionTracker {
  return new InductionTracker();
}

const ALL_STATUSES: ContractorStatus[] = [
  'PENDING_APPROVAL',
  'APPROVED',
  'SUSPENDED',
  'BLACKLISTED',
  'EXPIRED',
];
const ALL_TYPES: ContractorType[] = ['INDIVIDUAL', 'COMPANY', 'AGENCY'];
const ALL_COMPLIANCE: ComplianceItem[] = [
  'PUBLIC_LIABILITY',
  'EMPLOYERS_LIABILITY',
  'PROFESSIONAL_INDEMNITY',
  'ISO_CERTIFICATION',
  'HEALTH_AND_SAFETY_POLICY',
];
const ALL_INDUCTION_TYPES: InductionType[] = [
  'SITE_SAFETY',
  'ENVIRONMENTAL',
  'QUALITY',
  'SECURITY',
  'EMERGENCY',
];
const ALL_INDUCTION_STATUSES: InductionStatus[] = [
  'NOT_STARTED',
  'IN_PROGRESS',
  'COMPLETED',
  'EXPIRED',
  'WAIVED',
];

// ---------------------------------------------------------------------------
// ContractorRegistry Tests
// ---------------------------------------------------------------------------
describe('ContractorRegistry', () => {
  // ── register ──────────────────────────────────────────────────────────────
  describe('register()', () => {
    let registry: ContractorRegistry;
    beforeEach(() => {
      registry = makeRegistry();
    });

    it('returns a record with status PENDING_APPROVAL', () => {
      const r = registry.register('Acme Ltd', 'COMPANY', 'a@b.com', 'Electrical', 'LOW', []);
      expect(r.status).toBe('PENDING_APPROVAL');
    });

    it('assigns a unique id', () => {
      const r = registry.register('Acme', 'COMPANY', 'a@b.com', 'Plumbing', 'LOW', []);
      expect(typeof r.id).toBe('string');
      expect(r.id.length).toBeGreaterThan(0);
    });

    it('stores the name', () => {
      const r = registry.register('Bob', 'INDIVIDUAL', 'b@b.com', 'Cleaning', 'LOW', []);
      expect(r.name).toBe('Bob');
    });

    it('stores the type', () => {
      const r = registry.register('Bob', 'AGENCY', 'b@b.com', 'IT', 'MEDIUM', []);
      expect(r.type).toBe('AGENCY');
    });

    it('stores contactEmail', () => {
      const r = registry.register('X', 'INDIVIDUAL', 'x@x.com', 'IT', 'HIGH', []);
      expect(r.contactEmail).toBe('x@x.com');
    });

    it('stores trade', () => {
      const r = registry.register('X', 'INDIVIDUAL', 'x@x.com', 'Welding', 'LOW', []);
      expect(r.trade).toBe('Welding');
    });

    it('stores riskRating LOW', () => {
      const r = registry.register('X', 'COMPANY', 'x@x.com', 'T', 'LOW', []);
      expect(r.riskRating).toBe('LOW');
    });

    it('stores riskRating MEDIUM', () => {
      const r = registry.register('X', 'COMPANY', 'x@x.com', 'T', 'MEDIUM', []);
      expect(r.riskRating).toBe('MEDIUM');
    });

    it('stores riskRating HIGH', () => {
      const r = registry.register('X', 'COMPANY', 'x@x.com', 'T', 'HIGH', []);
      expect(r.riskRating).toBe('HIGH');
    });

    it('stores complianceItems', () => {
      const r = registry.register('X', 'COMPANY', 'x@x.com', 'T', 'LOW', ['PUBLIC_LIABILITY']);
      expect(r.complianceItems).toContain('PUBLIC_LIABILITY');
    });

    it('stores optional contactPhone', () => {
      const r = registry.register('X', 'INDIVIDUAL', 'x@x.com', 'T', 'LOW', [], '+44123456789');
      expect(r.contactPhone).toBe('+44123456789');
    });

    it('stores optional notes', () => {
      const r = registry.register('X', 'INDIVIDUAL', 'x@x.com', 'T', 'LOW', [], undefined, 'Note A');
      expect(r.notes).toBe('Note A');
    });

    it('increments count after registration', () => {
      registry.register('X', 'COMPANY', 'x@x.com', 'T', 'LOW', []);
      expect(registry.getCount()).toBe(1);
    });

    it('each registration produces unique id', () => {
      const ids = Array.from({ length: 20 }, (_, i) =>
        registry.register(`C${i}`, 'COMPANY', `c${i}@c.com`, 'T', 'LOW', []).id,
      );
      expect(new Set(ids).size).toBe(20);
    });

    it('complianceItems is a copy (mutation does not affect registry)', () => {
      const items: ComplianceItem[] = ['PUBLIC_LIABILITY'];
      const r = registry.register('X', 'COMPANY', 'x@x.com', 'T', 'LOW', items);
      items.push('ISO_CERTIFICATION');
      expect(r.complianceItems).toHaveLength(1);
    });

    it('returned record is a snapshot (mutation does not affect store)', () => {
      const r = registry.register('X', 'COMPANY', 'x@x.com', 'T', 'LOW', []);
      (r as any).status = 'APPROVED';
      expect(registry.get(r.id)!.status).toBe('PENDING_APPROVAL');
    });

    // 50 parameterized registrations
    Array.from({ length: 50 }, (_, i) => i).forEach((i) => {
      it(`registers contractor #${i} with correct trade`, () => {
        const reg = makeRegistry();
        const trade = `Trade_${i}`;
        const r = reg.register(`Name${i}`, 'COMPANY', `e${i}@t.com`, trade, 'LOW', []);
        expect(r.trade).toBe(trade);
        expect(r.status).toBe('PENDING_APPROVAL');
      });
    });

    // all types
    ALL_TYPES.forEach((type) => {
      it(`registers type ${type}`, () => {
        const reg = makeRegistry();
        const r = reg.register('N', type, 'n@n.com', 'T', 'LOW', []);
        expect(r.type).toBe(type);
      });
    });

    // all compliance items
    ALL_COMPLIANCE.forEach((item) => {
      it(`registers with compliance item ${item}`, () => {
        const reg = makeRegistry();
        const r = reg.register('N', 'COMPANY', 'n@n.com', 'T', 'LOW', [item]);
        expect(r.complianceItems).toContain(item);
      });
    });
  });

  // ── approve ───────────────────────────────────────────────────────────────
  describe('approve()', () => {
    let registry: ContractorRegistry;
    beforeEach(() => {
      registry = makeRegistry();
    });

    it('sets status to APPROVED', () => {
      const r = registry.register('A', 'COMPANY', 'a@a.com', 'T', 'LOW', []);
      const approved = registry.approve(r.id, 'manager@a.com', '2026-01-01');
      expect(approved.status).toBe('APPROVED');
    });

    it('stores approvedBy', () => {
      const r = registry.register('A', 'COMPANY', 'a@a.com', 'T', 'LOW', []);
      const approved = registry.approve(r.id, 'mgr@a.com', '2026-01-01');
      expect(approved.approvedBy).toBe('mgr@a.com');
    });

    it('stores approvedAt', () => {
      const r = registry.register('A', 'COMPANY', 'a@a.com', 'T', 'LOW', []);
      const approved = registry.approve(r.id, 'mgr', '2026-02-15');
      expect(approved.approvedAt).toBe('2026-02-15');
    });

    it('stores expiryDate when provided', () => {
      const r = registry.register('A', 'COMPANY', 'a@a.com', 'T', 'LOW', []);
      const approved = registry.approve(r.id, 'mgr', '2026-01-01', '2027-01-01');
      expect(approved.expiryDate).toBe('2027-01-01');
    });

    it('throws on unknown id', () => {
      expect(() => registry.approve('nonexistent', 'mgr', '2026-01-01')).toThrow();
    });

    it('approved record is retrievable via get()', () => {
      const r = registry.register('A', 'COMPANY', 'a@a.com', 'T', 'LOW', []);
      registry.approve(r.id, 'mgr', '2026-01-01');
      expect(registry.get(r.id)!.status).toBe('APPROVED');
    });

    it('approved record appears in getApproved()', () => {
      const r = registry.register('A', 'COMPANY', 'a@a.com', 'T', 'LOW', []);
      registry.approve(r.id, 'mgr', '2026-01-01');
      const list = registry.getApproved();
      expect(list.some((c) => c.id === r.id)).toBe(true);
    });

    // 50 parameterized approvals
    Array.from({ length: 50 }, (_, i) => i).forEach((i) => {
      it(`approve contractor #${i} sets APPROVED`, () => {
        const reg = makeRegistry();
        const r = reg.register(`N${i}`, 'COMPANY', `e${i}@t.com`, 'T', 'LOW', []);
        const a = reg.approve(r.id, `mgr${i}`, `2026-01-${String(i % 28 + 1).padStart(2, '0')}`);
        expect(a.status).toBe('APPROVED');
        expect(a.approvedBy).toBe(`mgr${i}`);
      });
    });
  });

  // ── suspend ───────────────────────────────────────────────────────────────
  describe('suspend()', () => {
    let registry: ContractorRegistry;
    beforeEach(() => {
      registry = makeRegistry();
    });

    it('sets status to SUSPENDED', () => {
      const r = registry.register('A', 'COMPANY', 'a@a.com', 'T', 'LOW', []);
      expect(registry.suspend(r.id).status).toBe('SUSPENDED');
    });

    it('throws on unknown id', () => {
      expect(() => registry.suspend('bad')).toThrow();
    });

    it('suspended contractor appears in getByStatus(SUSPENDED)', () => {
      const r = registry.register('A', 'COMPANY', 'a@a.com', 'T', 'LOW', []);
      registry.suspend(r.id);
      expect(registry.getByStatus('SUSPENDED').some((c) => c.id === r.id)).toBe(true);
    });

    it('suspended contractor no longer in PENDING_APPROVAL list', () => {
      const r = registry.register('A', 'COMPANY', 'a@a.com', 'T', 'LOW', []);
      registry.suspend(r.id);
      expect(registry.getByStatus('PENDING_APPROVAL').some((c) => c.id === r.id)).toBe(false);
    });

    Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
      it(`suspend #${i} works`, () => {
        const reg = makeRegistry();
        const r = reg.register(`N${i}`, 'AGENCY', `e${i}@t.com`, 'T', 'MEDIUM', []);
        expect(reg.suspend(r.id).status).toBe('SUSPENDED');
      });
    });
  });

  // ── blacklist ─────────────────────────────────────────────────────────────
  describe('blacklist()', () => {
    let registry: ContractorRegistry;
    beforeEach(() => {
      registry = makeRegistry();
    });

    it('sets status to BLACKLISTED', () => {
      const r = registry.register('A', 'COMPANY', 'a@a.com', 'T', 'LOW', []);
      expect(registry.blacklist(r.id).status).toBe('BLACKLISTED');
    });

    it('throws on unknown id', () => {
      expect(() => registry.blacklist('bad')).toThrow();
    });

    it('blacklisted contractor appears in getByStatus(BLACKLISTED)', () => {
      const r = registry.register('A', 'COMPANY', 'a@a.com', 'T', 'LOW', []);
      registry.blacklist(r.id);
      expect(registry.getByStatus('BLACKLISTED').some((c) => c.id === r.id)).toBe(true);
    });

    Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
      it(`blacklist #${i} works`, () => {
        const reg = makeRegistry();
        const r = reg.register(`N${i}`, 'INDIVIDUAL', `e${i}@t.com`, 'T', 'HIGH', []);
        expect(reg.blacklist(r.id).status).toBe('BLACKLISTED');
      });
    });
  });

  // ── expire ────────────────────────────────────────────────────────────────
  describe('expire()', () => {
    let registry: ContractorRegistry;
    beforeEach(() => {
      registry = makeRegistry();
    });

    it('sets status to EXPIRED', () => {
      const r = registry.register('A', 'COMPANY', 'a@a.com', 'T', 'LOW', []);
      expect(registry.expire(r.id).status).toBe('EXPIRED');
    });

    it('throws on unknown id', () => {
      expect(() => registry.expire('bad')).toThrow();
    });

    it('expired contractor appears in getByStatus(EXPIRED)', () => {
      const r = registry.register('A', 'COMPANY', 'a@a.com', 'T', 'LOW', []);
      registry.expire(r.id);
      expect(registry.getByStatus('EXPIRED').some((c) => c.id === r.id)).toBe(true);
    });

    Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
      it(`expire #${i} works`, () => {
        const reg = makeRegistry();
        const r = reg.register(`N${i}`, 'COMPANY', `e${i}@t.com`, 'T', 'LOW', []);
        expect(reg.expire(r.id).status).toBe('EXPIRED');
      });
    });
  });

  // ── addComplianceItem ─────────────────────────────────────────────────────
  describe('addComplianceItem()', () => {
    let registry: ContractorRegistry;
    beforeEach(() => {
      registry = makeRegistry();
    });

    it('adds a new compliance item', () => {
      const r = registry.register('A', 'COMPANY', 'a@a.com', 'T', 'LOW', []);
      const updated = registry.addComplianceItem(r.id, 'PUBLIC_LIABILITY');
      expect(updated.complianceItems).toContain('PUBLIC_LIABILITY');
    });

    it('does not duplicate existing compliance item', () => {
      const r = registry.register('A', 'COMPANY', 'a@a.com', 'T', 'LOW', ['PUBLIC_LIABILITY']);
      registry.addComplianceItem(r.id, 'PUBLIC_LIABILITY');
      expect(registry.get(r.id)!.complianceItems.filter((x) => x === 'PUBLIC_LIABILITY')).toHaveLength(1);
    });

    it('throws on unknown id', () => {
      expect(() => registry.addComplianceItem('bad', 'PUBLIC_LIABILITY')).toThrow();
    });

    ALL_COMPLIANCE.forEach((item) => {
      it(`adds compliance item ${item}`, () => {
        const reg = makeRegistry();
        const r = reg.register('N', 'COMPANY', 'n@n.com', 'T', 'LOW', []);
        const updated = reg.addComplianceItem(r.id, item);
        expect(updated.complianceItems).toContain(item);
      });
    });

    Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
      it(`addComplianceItem idempotent for item index ${i % ALL_COMPLIANCE.length}`, () => {
        const reg = makeRegistry();
        const item = ALL_COMPLIANCE[i % ALL_COMPLIANCE.length];
        const r = reg.register(`N${i}`, 'COMPANY', `e${i}@t.com`, 'T', 'LOW', [item]);
        reg.addComplianceItem(r.id, item);
        expect(reg.get(r.id)!.complianceItems.filter((x) => x === item)).toHaveLength(1);
      });
    });
  });

  // ── get / getAll ──────────────────────────────────────────────────────────
  describe('get() and getAll()', () => {
    let registry: ContractorRegistry;
    beforeEach(() => {
      registry = makeRegistry();
    });

    it('get() returns undefined for unknown id', () => {
      expect(registry.get('none')).toBeUndefined();
    });

    it('get() returns registered contractor', () => {
      const r = registry.register('A', 'COMPANY', 'a@a.com', 'T', 'LOW', []);
      expect(registry.get(r.id)).toBeDefined();
    });

    it('getAll() returns empty array initially', () => {
      expect(registry.getAll()).toHaveLength(0);
    });

    it('getAll() returns all registered contractors', () => {
      registry.register('A', 'COMPANY', 'a@a.com', 'T', 'LOW', []);
      registry.register('B', 'AGENCY', 'b@b.com', 'T', 'MEDIUM', []);
      expect(registry.getAll()).toHaveLength(2);
    });

    it('getAll() returns copies (mutation does not affect store)', () => {
      const r = registry.register('A', 'COMPANY', 'a@a.com', 'T', 'LOW', []);
      const all = registry.getAll();
      (all[0] as any).status = 'BLACKLISTED';
      expect(registry.get(r.id)!.status).toBe('PENDING_APPROVAL');
    });

    Array.from({ length: 30 }, (_, i) => i).forEach((i) => {
      it(`getAll() count correct after ${i + 1} registrations`, () => {
        const reg = makeRegistry();
        Array.from({ length: i + 1 }, (_, j) =>
          reg.register(`N${j}`, 'COMPANY', `e${j}@t.com`, 'T', 'LOW', []),
        );
        expect(reg.getAll()).toHaveLength(i + 1);
      });
    });
  });

  // ── getByStatus ───────────────────────────────────────────────────────────
  describe('getByStatus()', () => {
    let registry: ContractorRegistry;
    beforeEach(() => {
      registry = makeRegistry();
    });

    ALL_STATUSES.forEach((status) => {
      it(`getByStatus(${status}) returns empty when none`, () => {
        expect(registry.getByStatus(status)).toHaveLength(0);
      });
    });

    it('getByStatus(PENDING_APPROVAL) returns newly registered contractor', () => {
      const r = registry.register('A', 'COMPANY', 'a@a.com', 'T', 'LOW', []);
      expect(registry.getByStatus('PENDING_APPROVAL').some((c) => c.id === r.id)).toBe(true);
    });

    it('getByStatus(APPROVED) after approve', () => {
      const r = registry.register('A', 'COMPANY', 'a@a.com', 'T', 'LOW', []);
      registry.approve(r.id, 'mgr', '2026-01-01');
      expect(registry.getByStatus('APPROVED').some((c) => c.id === r.id)).toBe(true);
    });

    it('getByStatus(SUSPENDED) after suspend', () => {
      const r = registry.register('A', 'COMPANY', 'a@a.com', 'T', 'LOW', []);
      registry.suspend(r.id);
      expect(registry.getByStatus('SUSPENDED').some((c) => c.id === r.id)).toBe(true);
    });

    it('getByStatus(BLACKLISTED) after blacklist', () => {
      const r = registry.register('A', 'COMPANY', 'a@a.com', 'T', 'LOW', []);
      registry.blacklist(r.id);
      expect(registry.getByStatus('BLACKLISTED').some((c) => c.id === r.id)).toBe(true);
    });

    it('getByStatus(EXPIRED) after expire', () => {
      const r = registry.register('A', 'COMPANY', 'a@a.com', 'T', 'LOW', []);
      registry.expire(r.id);
      expect(registry.getByStatus('EXPIRED').some((c) => c.id === r.id)).toBe(true);
    });

    Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
      it(`getByStatus parameterized #${i} - correct count after mixed ops`, () => {
        const reg = makeRegistry();
        const r1 = reg.register(`A${i}`, 'COMPANY', `a${i}@a.com`, 'T', 'LOW', []);
        const r2 = reg.register(`B${i}`, 'AGENCY', `b${i}@b.com`, 'T', 'MEDIUM', []);
        reg.approve(r1.id, 'mgr', '2026-01-01');
        reg.suspend(r2.id);
        expect(reg.getByStatus('APPROVED')).toHaveLength(1);
        expect(reg.getByStatus('SUSPENDED')).toHaveLength(1);
        expect(reg.getByStatus('PENDING_APPROVAL')).toHaveLength(0);
      });
    });
  });

  // ── getByType ─────────────────────────────────────────────────────────────
  describe('getByType()', () => {
    let registry: ContractorRegistry;
    beforeEach(() => {
      registry = makeRegistry();
    });

    ALL_TYPES.forEach((type) => {
      it(`getByType(${type}) returns empty when none`, () => {
        expect(registry.getByType(type)).toHaveLength(0);
      });

      it(`getByType(${type}) returns correct contractors`, () => {
        const reg = makeRegistry();
        const r = reg.register('N', type, 'n@n.com', 'T', 'LOW', []);
        expect(reg.getByType(type).some((c) => c.id === r.id)).toBe(true);
      });
    });

    it('getByType does not mix types', () => {
      const ri = registry.register('I', 'INDIVIDUAL', 'i@i.com', 'T', 'LOW', []);
      const rc = registry.register('C', 'COMPANY', 'c@c.com', 'T', 'LOW', []);
      expect(registry.getByType('INDIVIDUAL').some((c) => c.id === rc.id)).toBe(false);
      expect(registry.getByType('COMPANY').some((c) => c.id === ri.id)).toBe(false);
    });

    Array.from({ length: 15 }, (_, i) => i).forEach((i) => {
      it(`getByType parameterized #${i}`, () => {
        const reg = makeRegistry();
        const type = ALL_TYPES[i % ALL_TYPES.length];
        const r = reg.register(`N${i}`, type, `e${i}@t.com`, 'T', 'LOW', []);
        expect(reg.getByType(type).some((c) => c.id === r.id)).toBe(true);
      });
    });
  });

  // ── getByRiskRating ───────────────────────────────────────────────────────
  describe('getByRiskRating()', () => {
    let registry: ContractorRegistry;
    beforeEach(() => {
      registry = makeRegistry();
    });

    (['LOW', 'MEDIUM', 'HIGH'] as const).forEach((rating) => {
      it(`getByRiskRating(${rating}) empty when none`, () => {
        expect(registry.getByRiskRating(rating)).toHaveLength(0);
      });

      it(`getByRiskRating(${rating}) returns correct contractor`, () => {
        const reg = makeRegistry();
        const r = reg.register('N', 'COMPANY', 'n@n.com', 'T', rating, []);
        expect(reg.getByRiskRating(rating).some((c) => c.id === r.id)).toBe(true);
      });
    });

    it('does not mix risk ratings', () => {
      const rL = registry.register('L', 'COMPANY', 'l@l.com', 'T', 'LOW', []);
      const rH = registry.register('H', 'COMPANY', 'h@h.com', 'T', 'HIGH', []);
      expect(registry.getByRiskRating('LOW').some((c) => c.id === rH.id)).toBe(false);
      expect(registry.getByRiskRating('HIGH').some((c) => c.id === rL.id)).toBe(false);
    });

    Array.from({ length: 15 }, (_, i) => i).forEach((i) => {
      it(`getByRiskRating parameterized #${i}`, () => {
        const reg = makeRegistry();
        const ratings: Array<'LOW' | 'MEDIUM' | 'HIGH'> = ['LOW', 'MEDIUM', 'HIGH'];
        const rating = ratings[i % 3];
        const r = reg.register(`N${i}`, 'COMPANY', `e${i}@t.com`, 'T', rating, []);
        expect(reg.getByRiskRating(rating).some((c) => c.id === r.id)).toBe(true);
      });
    });
  });

  // ── getByTrade ────────────────────────────────────────────────────────────
  describe('getByTrade()', () => {
    let registry: ContractorRegistry;
    beforeEach(() => {
      registry = makeRegistry();
    });

    it('returns empty array when no contractors with that trade', () => {
      expect(registry.getByTrade('Electrical')).toHaveLength(0);
    });

    it('returns contractor with matching trade', () => {
      const r = registry.register('A', 'COMPANY', 'a@a.com', 'Electrical', 'LOW', []);
      expect(registry.getByTrade('Electrical').some((c) => c.id === r.id)).toBe(true);
    });

    it('does not return contractors with different trade', () => {
      registry.register('A', 'COMPANY', 'a@a.com', 'Plumbing', 'LOW', []);
      expect(registry.getByTrade('Electrical')).toHaveLength(0);
    });

    Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
      it(`getByTrade parameterized #${i}`, () => {
        const reg = makeRegistry();
        const trade = `Trade_${i % 5}`;
        const r = reg.register(`N${i}`, 'COMPANY', `e${i}@t.com`, trade, 'LOW', []);
        expect(reg.getByTrade(trade).some((c) => c.id === r.id)).toBe(true);
      });
    });
  });

  // ── getApproved ───────────────────────────────────────────────────────────
  describe('getApproved()', () => {
    let registry: ContractorRegistry;
    beforeEach(() => {
      registry = makeRegistry();
    });

    it('returns empty array initially', () => {
      expect(registry.getApproved()).toHaveLength(0);
    });

    it('returns only APPROVED contractors', () => {
      const r1 = registry.register('A', 'COMPANY', 'a@a.com', 'T', 'LOW', []);
      const r2 = registry.register('B', 'COMPANY', 'b@b.com', 'T', 'LOW', []);
      registry.approve(r1.id, 'mgr', '2026-01-01');
      const approved = registry.getApproved();
      expect(approved.some((c) => c.id === r1.id)).toBe(true);
      expect(approved.some((c) => c.id === r2.id)).toBe(false);
    });

    Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
      it(`getApproved count ${i}`, () => {
        const reg = makeRegistry();
        const contractors = Array.from({ length: i }, (_, j) =>
          reg.register(`N${j}`, 'COMPANY', `e${j}@t.com`, 'T', 'LOW', []),
        );
        contractors.forEach((c) => reg.approve(c.id, 'mgr', '2026-01-01'));
        expect(reg.getApproved()).toHaveLength(i);
      });
    });
  });

  // ── getExpired ────────────────────────────────────────────────────────────
  describe('getExpired()', () => {
    let registry: ContractorRegistry;
    beforeEach(() => {
      registry = makeRegistry();
    });

    it('returns empty initially', () => {
      expect(registry.getExpired('2026-01-01')).toHaveLength(0);
    });

    it('returns APPROVED contractor with expiryDate before asOf', () => {
      const r = registry.register('A', 'COMPANY', 'a@a.com', 'T', 'LOW', []);
      registry.approve(r.id, 'mgr', '2025-01-01', '2025-12-31');
      expect(registry.getExpired('2026-01-01').some((c) => c.id === r.id)).toBe(true);
    });

    it('does not return APPROVED contractor with future expiryDate', () => {
      const r = registry.register('A', 'COMPANY', 'a@a.com', 'T', 'LOW', []);
      registry.approve(r.id, 'mgr', '2026-01-01', '2027-01-01');
      expect(registry.getExpired('2026-06-01').some((c) => c.id === r.id)).toBe(false);
    });

    it('does not return non-APPROVED contractor', () => {
      const r = registry.register('A', 'COMPANY', 'a@a.com', 'T', 'LOW', []);
      registry.expire(r.id);
      expect(registry.getExpired('2030-01-01').some((c) => c.id === r.id)).toBe(false);
    });

    it('does not return APPROVED contractor without expiryDate', () => {
      const r = registry.register('A', 'COMPANY', 'a@a.com', 'T', 'LOW', []);
      registry.approve(r.id, 'mgr', '2026-01-01');
      expect(registry.getExpired('2030-01-01').some((c) => c.id === r.id)).toBe(false);
    });

    Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
      it(`getExpired parameterized #${i}`, () => {
        const reg = makeRegistry();
        const r = reg.register(`N${i}`, 'COMPANY', `e${i}@t.com`, 'T', 'LOW', []);
        const expiry = `202${(i % 4) + 3}-01-01`;
        reg.approve(r.id, 'mgr', '2023-01-01', expiry);
        const asOf = '2030-01-01';
        expect(reg.getExpired(asOf).some((c) => c.id === r.id)).toBe(true);
      });
    });
  });

  // ── getCount ──────────────────────────────────────────────────────────────
  describe('getCount()', () => {
    let registry: ContractorRegistry;
    beforeEach(() => {
      registry = makeRegistry();
    });

    it('returns 0 initially', () => {
      expect(registry.getCount()).toBe(0);
    });

    Array.from({ length: 30 }, (_, i) => i).forEach((i) => {
      it(`getCount() returns ${i + 1} after ${i + 1} registrations`, () => {
        const reg = makeRegistry();
        Array.from({ length: i + 1 }, (_, j) =>
          reg.register(`N${j}`, 'COMPANY', `e${j}@t.com`, 'T', 'LOW', []),
        );
        expect(reg.getCount()).toBe(i + 1);
      });
    });
  });

  // ── status transitions (comprehensive) ───────────────────────────────────
  describe('status transitions', () => {
    let registry: ContractorRegistry;
    beforeEach(() => {
      registry = makeRegistry();
    });

    it('PENDING_APPROVAL → APPROVED', () => {
      const r = registry.register('A', 'COMPANY', 'a@a.com', 'T', 'LOW', []);
      expect(registry.approve(r.id, 'mgr', '2026-01-01').status).toBe('APPROVED');
    });

    it('PENDING_APPROVAL → SUSPENDED', () => {
      const r = registry.register('A', 'COMPANY', 'a@a.com', 'T', 'LOW', []);
      expect(registry.suspend(r.id).status).toBe('SUSPENDED');
    });

    it('PENDING_APPROVAL → BLACKLISTED', () => {
      const r = registry.register('A', 'COMPANY', 'a@a.com', 'T', 'LOW', []);
      expect(registry.blacklist(r.id).status).toBe('BLACKLISTED');
    });

    it('PENDING_APPROVAL → EXPIRED', () => {
      const r = registry.register('A', 'COMPANY', 'a@a.com', 'T', 'LOW', []);
      expect(registry.expire(r.id).status).toBe('EXPIRED');
    });

    it('APPROVED → SUSPENDED', () => {
      const r = registry.register('A', 'COMPANY', 'a@a.com', 'T', 'LOW', []);
      registry.approve(r.id, 'mgr', '2026-01-01');
      expect(registry.suspend(r.id).status).toBe('SUSPENDED');
    });

    it('APPROVED → BLACKLISTED', () => {
      const r = registry.register('A', 'COMPANY', 'a@a.com', 'T', 'LOW', []);
      registry.approve(r.id, 'mgr', '2026-01-01');
      expect(registry.blacklist(r.id).status).toBe('BLACKLISTED');
    });

    it('APPROVED → EXPIRED', () => {
      const r = registry.register('A', 'COMPANY', 'a@a.com', 'T', 'LOW', []);
      registry.approve(r.id, 'mgr', '2026-01-01');
      expect(registry.expire(r.id).status).toBe('EXPIRED');
    });

    it('SUSPENDED → BLACKLISTED', () => {
      const r = registry.register('A', 'COMPANY', 'a@a.com', 'T', 'LOW', []);
      registry.suspend(r.id);
      expect(registry.blacklist(r.id).status).toBe('BLACKLISTED');
    });

    it('SUSPENDED → APPROVED', () => {
      const r = registry.register('A', 'COMPANY', 'a@a.com', 'T', 'LOW', []);
      registry.suspend(r.id);
      expect(registry.approve(r.id, 'mgr', '2026-01-01').status).toBe('APPROVED');
    });

    Array.from({ length: 10 }, (_, i) => i).forEach((i) => {
      it(`transition sequence #${i}: register → approve → suspend → blacklist`, () => {
        const reg = makeRegistry();
        const r = reg.register(`N${i}`, 'COMPANY', `e${i}@t.com`, 'T', 'LOW', []);
        expect(reg.approve(r.id, 'mgr', '2026-01-01').status).toBe('APPROVED');
        expect(reg.suspend(r.id).status).toBe('SUSPENDED');
        expect(reg.blacklist(r.id).status).toBe('BLACKLISTED');
      });
    });
  });

  // ── mixed scenario ────────────────────────────────────────────────────────
  describe('mixed scenarios', () => {
    let registry: ContractorRegistry;
    beforeEach(() => {
      registry = makeRegistry();
    });

    Array.from({ length: 30 }, (_, i) => i).forEach((i) => {
      it(`mixed scenario #${i}`, () => {
        const reg = makeRegistry();
        const r1 = reg.register(`A${i}`, 'COMPANY', `a${i}@a.com`, `TradeA${i}`, 'LOW', ['PUBLIC_LIABILITY']);
        const r2 = reg.register(`B${i}`, 'INDIVIDUAL', `b${i}@b.com`, `TradeB${i}`, 'HIGH', []);
        const r3 = reg.register(`C${i}`, 'AGENCY', `c${i}@c.com`, `TradeA${i}`, 'MEDIUM', ['ISO_CERTIFICATION']);

        reg.approve(r1.id, 'mgr', '2026-01-01', '2027-01-01');
        reg.suspend(r2.id);
        reg.blacklist(r3.id);

        expect(reg.getByStatus('APPROVED')).toHaveLength(1);
        expect(reg.getByStatus('SUSPENDED')).toHaveLength(1);
        expect(reg.getByStatus('BLACKLISTED')).toHaveLength(1);
        expect(reg.getByTrade(`TradeA${i}`)).toHaveLength(2);
        expect(reg.getByRiskRating('HIGH').some((c) => c.id === r2.id)).toBe(true);
        expect(reg.getCount()).toBe(3);
      });
    });
  });
});

// ---------------------------------------------------------------------------
// InductionTracker Tests
// ---------------------------------------------------------------------------
describe('InductionTracker', () => {
  // ── create ────────────────────────────────────────────────────────────────
  describe('create()', () => {
    let tracker: InductionTracker;
    beforeEach(() => {
      tracker = makeTracker();
    });

    it('returns a record with status NOT_STARTED', () => {
      const r = tracker.create('c1', 'SITE_SAFETY');
      expect(r.status).toBe('NOT_STARTED');
    });

    it('assigns a unique id', () => {
      const r = tracker.create('c1', 'SITE_SAFETY');
      expect(typeof r.id).toBe('string');
      expect(r.id.length).toBeGreaterThan(0);
    });

    it('stores contractorId', () => {
      const r = tracker.create('cid-123', 'ENVIRONMENTAL');
      expect(r.contractorId).toBe('cid-123');
    });

    it('stores type', () => {
      const r = tracker.create('c1', 'QUALITY');
      expect(r.type).toBe('QUALITY');
    });

    it('increments count', () => {
      tracker.create('c1', 'SITE_SAFETY');
      expect(tracker.getCount()).toBe(1);
    });

    it('each creation has unique id', () => {
      const ids = Array.from({ length: 20 }, (_, i) =>
        tracker.create(`c${i}`, 'SITE_SAFETY').id,
      );
      expect(new Set(ids).size).toBe(20);
    });

    it('returned record is a snapshot', () => {
      const r = tracker.create('c1', 'SITE_SAFETY');
      (r as any).status = 'COMPLETED';
      expect(tracker.getByContractor('c1')[0].status).toBe('NOT_STARTED');
    });

    // all induction types
    ALL_INDUCTION_TYPES.forEach((type) => {
      it(`create with type ${type}`, () => {
        const t = makeTracker();
        const r = t.create('c1', type);
        expect(r.type).toBe(type);
        expect(r.status).toBe('NOT_STARTED');
      });
    });

    // 50 parameterized
    Array.from({ length: 50 }, (_, i) => i).forEach((i) => {
      it(`create induction #${i}`, () => {
        const t = makeTracker();
        const type = ALL_INDUCTION_TYPES[i % ALL_INDUCTION_TYPES.length];
        const r = t.create(`c${i}`, type);
        expect(r.status).toBe('NOT_STARTED');
        expect(r.contractorId).toBe(`c${i}`);
        expect(r.type).toBe(type);
      });
    });
  });

  // ── start ─────────────────────────────────────────────────────────────────
  describe('start()', () => {
    let tracker: InductionTracker;
    beforeEach(() => {
      tracker = makeTracker();
    });

    it('sets status to IN_PROGRESS', () => {
      const r = tracker.create('c1', 'SITE_SAFETY');
      expect(tracker.start(r.id, 'trainer@a.com').status).toBe('IN_PROGRESS');
    });

    it('stores conductedBy', () => {
      const r = tracker.create('c1', 'SITE_SAFETY');
      expect(tracker.start(r.id, 'trainer@a.com').conductedBy).toBe('trainer@a.com');
    });

    it('throws on unknown id', () => {
      expect(() => tracker.start('bad', 'trainer')).toThrow();
    });

    it('started induction appears in getPending()', () => {
      const r = tracker.create('c1', 'SITE_SAFETY');
      tracker.start(r.id, 'trainer');
      expect(tracker.getPending().some((i) => i.id === r.id)).toBe(true);
    });

    Array.from({ length: 30 }, (_, i) => i).forEach((i) => {
      it(`start parameterized #${i}`, () => {
        const t = makeTracker();
        const r = t.create(`c${i}`, 'SECURITY');
        const started = t.start(r.id, `trainer${i}`);
        expect(started.status).toBe('IN_PROGRESS');
        expect(started.conductedBy).toBe(`trainer${i}`);
      });
    });
  });

  // ── complete ──────────────────────────────────────────────────────────────
  describe('complete()', () => {
    let tracker: InductionTracker;
    beforeEach(() => {
      tracker = makeTracker();
    });

    it('sets status to COMPLETED', () => {
      const r = tracker.create('c1', 'SITE_SAFETY');
      tracker.start(r.id, 'trainer');
      expect(tracker.complete(r.id, '2026-01-15', 85, true).status).toBe('COMPLETED');
    });

    it('stores conductedAt', () => {
      const r = tracker.create('c1', 'SITE_SAFETY');
      tracker.start(r.id, 'trainer');
      expect(tracker.complete(r.id, '2026-01-15', 85, true).conductedAt).toBe('2026-01-15');
    });

    it('stores score', () => {
      const r = tracker.create('c1', 'SITE_SAFETY');
      tracker.start(r.id, 'trainer');
      expect(tracker.complete(r.id, '2026-01-15', 92, true).score).toBe(92);
    });

    it('stores passed=true', () => {
      const r = tracker.create('c1', 'SITE_SAFETY');
      tracker.start(r.id, 'trainer');
      expect(tracker.complete(r.id, '2026-01-15', 75, true).passed).toBe(true);
    });

    it('stores passed=false', () => {
      const r = tracker.create('c1', 'SITE_SAFETY');
      tracker.start(r.id, 'trainer');
      expect(tracker.complete(r.id, '2026-01-15', 40, false).passed).toBe(false);
    });

    it('stores expiryDate when provided', () => {
      const r = tracker.create('c1', 'SITE_SAFETY');
      tracker.start(r.id, 'trainer');
      expect(tracker.complete(r.id, '2026-01-15', 85, true, '2027-01-15').expiryDate).toBe('2027-01-15');
    });

    it('stores notes when provided', () => {
      const r = tracker.create('c1', 'SITE_SAFETY');
      tracker.start(r.id, 'trainer');
      expect(tracker.complete(r.id, '2026-01-15', 85, true, undefined, 'Good job').notes).toBe('Good job');
    });

    it('throws on unknown id', () => {
      expect(() => tracker.complete('bad', '2026-01-15', 85, true)).toThrow();
    });

    it('completed induction no longer in getPending()', () => {
      const r = tracker.create('c1', 'SITE_SAFETY');
      tracker.start(r.id, 'trainer');
      tracker.complete(r.id, '2026-01-15', 85, true);
      expect(tracker.getPending().some((i) => i.id === r.id)).toBe(false);
    });

    it('completed induction appears in getByStatus(COMPLETED)', () => {
      const r = tracker.create('c1', 'SITE_SAFETY');
      tracker.start(r.id, 'trainer');
      tracker.complete(r.id, '2026-01-15', 85, true);
      expect(tracker.getByStatus('COMPLETED').some((i) => i.id === r.id)).toBe(true);
    });

    // 50 parameterized completions
    Array.from({ length: 50 }, (_, i) => i).forEach((i) => {
      it(`complete induction #${i}`, () => {
        const t = makeTracker();
        const r = t.create(`c${i}`, ALL_INDUCTION_TYPES[i % ALL_INDUCTION_TYPES.length]);
        t.start(r.id, `trainer${i}`);
        const score = (i * 2) % 101;
        const passed = score >= 50;
        const completed = t.complete(r.id, `2026-01-${String((i % 28) + 1).padStart(2, '0')}`, score, passed);
        expect(completed.status).toBe('COMPLETED');
        expect(completed.score).toBe(score);
        expect(completed.passed).toBe(passed);
      });
    });
  });

  // ── expire ────────────────────────────────────────────────────────────────
  describe('expire()', () => {
    let tracker: InductionTracker;
    beforeEach(() => {
      tracker = makeTracker();
    });

    it('sets status to EXPIRED', () => {
      const r = tracker.create('c1', 'SITE_SAFETY');
      expect(tracker.expire(r.id).status).toBe('EXPIRED');
    });

    it('throws on unknown id', () => {
      expect(() => tracker.expire('bad')).toThrow();
    });

    it('expired induction appears in getByStatus(EXPIRED)', () => {
      const r = tracker.create('c1', 'SITE_SAFETY');
      tracker.expire(r.id);
      expect(tracker.getByStatus('EXPIRED').some((i) => i.id === r.id)).toBe(true);
    });

    Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
      it(`expire induction #${i}`, () => {
        const t = makeTracker();
        const r = t.create(`c${i}`, 'EMERGENCY');
        expect(t.expire(r.id).status).toBe('EXPIRED');
      });
    });
  });

  // ── waive ─────────────────────────────────────────────────────────────────
  describe('waive()', () => {
    let tracker: InductionTracker;
    beforeEach(() => {
      tracker = makeTracker();
    });

    it('sets status to WAIVED', () => {
      const r = tracker.create('c1', 'SITE_SAFETY');
      expect(tracker.waive(r.id, 'Experienced contractor').status).toBe('WAIVED');
    });

    it('stores reason in notes', () => {
      const r = tracker.create('c1', 'SITE_SAFETY');
      expect(tracker.waive(r.id, 'Experienced').notes).toBe('Experienced');
    });

    it('throws on unknown id', () => {
      expect(() => tracker.waive('bad', 'reason')).toThrow();
    });

    it('waived induction appears in getByStatus(WAIVED)', () => {
      const r = tracker.create('c1', 'SITE_SAFETY');
      tracker.waive(r.id, 'reason');
      expect(tracker.getByStatus('WAIVED').some((i) => i.id === r.id)).toBe(true);
    });

    it('waived induction not in getPending()', () => {
      const r = tracker.create('c1', 'SITE_SAFETY');
      tracker.waive(r.id, 'reason');
      expect(tracker.getPending().some((i) => i.id === r.id)).toBe(false);
    });

    Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
      it(`waive induction #${i} stores reason correctly`, () => {
        const t = makeTracker();
        const r = t.create(`c${i}`, 'QUALITY');
        const reason = `Reason_${i}`;
        const waived = t.waive(r.id, reason);
        expect(waived.status).toBe('WAIVED');
        expect(waived.notes).toBe(reason);
      });
    });
  });

  // ── getByContractor ───────────────────────────────────────────────────────
  describe('getByContractor()', () => {
    let tracker: InductionTracker;
    beforeEach(() => {
      tracker = makeTracker();
    });

    it('returns empty array for unknown contractor', () => {
      expect(tracker.getByContractor('unknown')).toHaveLength(0);
    });

    it('returns all inductions for a given contractor', () => {
      tracker.create('c1', 'SITE_SAFETY');
      tracker.create('c1', 'QUALITY');
      tracker.create('c2', 'EMERGENCY');
      expect(tracker.getByContractor('c1')).toHaveLength(2);
    });

    it('does not return inductions from other contractors', () => {
      tracker.create('c1', 'SITE_SAFETY');
      tracker.create('c2', 'QUALITY');
      const result = tracker.getByContractor('c1');
      expect(result.every((r) => r.contractorId === 'c1')).toBe(true);
    });

    Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
      it(`getByContractor parameterized #${i}`, () => {
        const t = makeTracker();
        const contractorId = `c${i}`;
        const count = (i % 5) + 1;
        Array.from({ length: count }, (_, j) =>
          t.create(contractorId, ALL_INDUCTION_TYPES[j % ALL_INDUCTION_TYPES.length]),
        );
        expect(t.getByContractor(contractorId)).toHaveLength(count);
      });
    });
  });

  // ── getByType ─────────────────────────────────────────────────────────────
  describe('getByType()', () => {
    let tracker: InductionTracker;
    beforeEach(() => {
      tracker = makeTracker();
    });

    ALL_INDUCTION_TYPES.forEach((type) => {
      it(`getByType(${type}) returns empty when none`, () => {
        expect(tracker.getByType(type)).toHaveLength(0);
      });

      it(`getByType(${type}) returns correct inductions`, () => {
        const t = makeTracker();
        const r = t.create('c1', type);
        expect(t.getByType(type).some((i) => i.id === r.id)).toBe(true);
      });
    });

    it('does not mix types', () => {
      const r1 = tracker.create('c1', 'SITE_SAFETY');
      const r2 = tracker.create('c2', 'QUALITY');
      expect(tracker.getByType('SITE_SAFETY').some((i) => i.id === r2.id)).toBe(false);
      expect(tracker.getByType('QUALITY').some((i) => i.id === r1.id)).toBe(false);
    });

    Array.from({ length: 15 }, (_, i) => i).forEach((i) => {
      it(`getByType parameterized #${i}`, () => {
        const t = makeTracker();
        const type = ALL_INDUCTION_TYPES[i % ALL_INDUCTION_TYPES.length];
        const r = t.create(`c${i}`, type);
        expect(t.getByType(type).some((ind) => ind.id === r.id)).toBe(true);
      });
    });
  });

  // ── getByStatus ───────────────────────────────────────────────────────────
  describe('getByStatus()', () => {
    let tracker: InductionTracker;
    beforeEach(() => {
      tracker = makeTracker();
    });

    ALL_INDUCTION_STATUSES.forEach((status) => {
      it(`getByStatus(${status}) returns empty when none`, () => {
        expect(tracker.getByStatus(status)).toHaveLength(0);
      });
    });

    it('getByStatus(NOT_STARTED) returns new induction', () => {
      const r = tracker.create('c1', 'SITE_SAFETY');
      expect(tracker.getByStatus('NOT_STARTED').some((i) => i.id === r.id)).toBe(true);
    });

    it('getByStatus(IN_PROGRESS) after start', () => {
      const r = tracker.create('c1', 'SITE_SAFETY');
      tracker.start(r.id, 'trainer');
      expect(tracker.getByStatus('IN_PROGRESS').some((i) => i.id === r.id)).toBe(true);
    });

    it('getByStatus(COMPLETED) after complete', () => {
      const r = tracker.create('c1', 'SITE_SAFETY');
      tracker.start(r.id, 'trainer');
      tracker.complete(r.id, '2026-01-01', 80, true);
      expect(tracker.getByStatus('COMPLETED').some((i) => i.id === r.id)).toBe(true);
    });

    it('getByStatus(EXPIRED) after expire', () => {
      const r = tracker.create('c1', 'SITE_SAFETY');
      tracker.expire(r.id);
      expect(tracker.getByStatus('EXPIRED').some((i) => i.id === r.id)).toBe(true);
    });

    it('getByStatus(WAIVED) after waive', () => {
      const r = tracker.create('c1', 'SITE_SAFETY');
      tracker.waive(r.id, 'reason');
      expect(tracker.getByStatus('WAIVED').some((i) => i.id === r.id)).toBe(true);
    });

    Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
      it(`getByStatus parameterized #${i}`, () => {
        const t = makeTracker();
        const r1 = t.create(`ca${i}`, 'SITE_SAFETY');
        const r2 = t.create(`cb${i}`, 'QUALITY');
        t.start(r1.id, 'trainer');
        t.waive(r2.id, 'waived');
        expect(t.getByStatus('IN_PROGRESS')).toHaveLength(1);
        expect(t.getByStatus('WAIVED')).toHaveLength(1);
        expect(t.getByStatus('NOT_STARTED')).toHaveLength(0);
      });
    });
  });

  // ── getExpired (tracker) ──────────────────────────────────────────────────
  describe('getExpired(asOf)', () => {
    let tracker: InductionTracker;
    beforeEach(() => {
      tracker = makeTracker();
    });

    it('returns empty initially', () => {
      expect(tracker.getExpired('2026-01-01')).toHaveLength(0);
    });

    it('returns COMPLETED induction with expiryDate before asOf', () => {
      const r = tracker.create('c1', 'SITE_SAFETY');
      tracker.start(r.id, 'trainer');
      tracker.complete(r.id, '2025-01-01', 80, true, '2025-12-31');
      expect(tracker.getExpired('2026-01-01').some((i) => i.id === r.id)).toBe(true);
    });

    it('does not return COMPLETED induction with future expiryDate', () => {
      const r = tracker.create('c1', 'SITE_SAFETY');
      tracker.start(r.id, 'trainer');
      tracker.complete(r.id, '2026-01-01', 80, true, '2027-01-01');
      expect(tracker.getExpired('2026-06-01').some((i) => i.id === r.id)).toBe(false);
    });

    it('does not return non-COMPLETED induction', () => {
      const r = tracker.create('c1', 'SITE_SAFETY');
      tracker.expire(r.id);
      expect(tracker.getExpired('2030-01-01').some((i) => i.id === r.id)).toBe(false);
    });

    it('does not return COMPLETED induction without expiryDate', () => {
      const r = tracker.create('c1', 'SITE_SAFETY');
      tracker.start(r.id, 'trainer');
      tracker.complete(r.id, '2026-01-01', 80, true);
      expect(tracker.getExpired('2030-01-01').some((i) => i.id === r.id)).toBe(false);
    });

    Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
      it(`getExpired parameterized #${i}`, () => {
        const t = makeTracker();
        const r = t.create(`c${i}`, ALL_INDUCTION_TYPES[i % ALL_INDUCTION_TYPES.length]);
        t.start(r.id, 'trainer');
        t.complete(r.id, '2023-01-01', 80, true, '2024-01-01');
        expect(t.getExpired('2025-01-01').some((ind) => ind.id === r.id)).toBe(true);
      });
    });
  });

  // ── getPending ────────────────────────────────────────────────────────────
  describe('getPending()', () => {
    let tracker: InductionTracker;
    beforeEach(() => {
      tracker = makeTracker();
    });

    it('returns empty initially', () => {
      expect(tracker.getPending()).toHaveLength(0);
    });

    it('NOT_STARTED is in pending', () => {
      const r = tracker.create('c1', 'SITE_SAFETY');
      expect(tracker.getPending().some((i) => i.id === r.id)).toBe(true);
    });

    it('IN_PROGRESS is in pending', () => {
      const r = tracker.create('c1', 'SITE_SAFETY');
      tracker.start(r.id, 'trainer');
      expect(tracker.getPending().some((i) => i.id === r.id)).toBe(true);
    });

    it('COMPLETED is NOT in pending', () => {
      const r = tracker.create('c1', 'SITE_SAFETY');
      tracker.start(r.id, 'trainer');
      tracker.complete(r.id, '2026-01-01', 80, true);
      expect(tracker.getPending().some((i) => i.id === r.id)).toBe(false);
    });

    it('EXPIRED is NOT in pending', () => {
      const r = tracker.create('c1', 'SITE_SAFETY');
      tracker.expire(r.id);
      expect(tracker.getPending().some((i) => i.id === r.id)).toBe(false);
    });

    it('WAIVED is NOT in pending', () => {
      const r = tracker.create('c1', 'SITE_SAFETY');
      tracker.waive(r.id, 'reason');
      expect(tracker.getPending().some((i) => i.id === r.id)).toBe(false);
    });

    Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
      it(`getPending count correct #${i}`, () => {
        const t = makeTracker();
        const r1 = t.create(`ca${i}`, 'SITE_SAFETY');
        const r2 = t.create(`cb${i}`, 'QUALITY');
        t.start(r1.id, 'trainer');
        t.complete(r1.id, '2026-01-01', 80, true);
        // r2 is NOT_STARTED, r1 is COMPLETED
        expect(t.getPending().some((r) => r.id === r2.id)).toBe(true);
        expect(t.getPending().some((r) => r.id === r1.id)).toBe(false);
      });
    });
  });

  // ── getCompletionRate ─────────────────────────────────────────────────────
  describe('getCompletionRate()', () => {
    let tracker: InductionTracker;
    beforeEach(() => {
      tracker = makeTracker();
    });

    it('returns 0 when no inductions exist', () => {
      expect(tracker.getCompletionRate()).toBe(0);
    });

    it('returns 0 when none are completed', () => {
      tracker.create('c1', 'SITE_SAFETY');
      expect(tracker.getCompletionRate()).toBe(0);
    });

    it('returns 100 when all are completed', () => {
      const r = tracker.create('c1', 'SITE_SAFETY');
      tracker.start(r.id, 'trainer');
      tracker.complete(r.id, '2026-01-01', 80, true);
      expect(tracker.getCompletionRate()).toBe(100);
    });

    it('returns 50 when half are completed', () => {
      const r1 = tracker.create('c1', 'SITE_SAFETY');
      tracker.create('c2', 'QUALITY');
      tracker.start(r1.id, 'trainer');
      tracker.complete(r1.id, '2026-01-01', 80, true);
      expect(tracker.getCompletionRate()).toBe(50);
    });

    it('returns 25 when 1/4 are completed', () => {
      const r1 = tracker.create('c1', 'SITE_SAFETY');
      tracker.create('c2', 'QUALITY');
      tracker.create('c3', 'EMERGENCY');
      tracker.create('c4', 'SECURITY');
      tracker.start(r1.id, 'trainer');
      tracker.complete(r1.id, '2026-01-01', 80, true);
      expect(tracker.getCompletionRate()).toBe(25);
    });

    // parameterized fraction tests
    Array.from({ length: 10 }, (_, i) => i + 1).forEach((completed) => {
      it(`getCompletionRate with ${completed}/10 completed`, () => {
        const t = makeTracker();
        const records = Array.from({ length: 10 }, (_, j) => t.create(`c${j}`, 'SITE_SAFETY'));
        records.slice(0, completed).forEach((r) => {
          t.start(r.id, 'trainer');
          t.complete(r.id, '2026-01-01', 80, true);
        });
        expect(t.getCompletionRate()).toBeCloseTo((completed / 10) * 100);
      });
    });

    Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
      it(`getCompletionRate parameterized #${i}`, () => {
        const t = makeTracker();
        const total = (i % 5) + 2;
        const completedCount = i % (total + 1);
        const records = Array.from({ length: total }, (_, j) => t.create(`c${j}`, 'SITE_SAFETY'));
        records.slice(0, completedCount).forEach((r) => {
          t.start(r.id, 'trainer');
          t.complete(r.id, '2026-01-01', 80, true);
        });
        const expected = (completedCount / total) * 100;
        expect(t.getCompletionRate()).toBeCloseTo(expected);
      });
    });
  });

  // ── getCount ──────────────────────────────────────────────────────────────
  describe('getCount()', () => {
    let tracker: InductionTracker;
    beforeEach(() => {
      tracker = makeTracker();
    });

    it('returns 0 initially', () => {
      expect(tracker.getCount()).toBe(0);
    });

    Array.from({ length: 30 }, (_, i) => i).forEach((i) => {
      it(`getCount() returns ${i + 1} after ${i + 1} creations`, () => {
        const t = makeTracker();
        Array.from({ length: i + 1 }, (_, j) => t.create(`c${j}`, 'SITE_SAFETY'));
        expect(t.getCount()).toBe(i + 1);
      });
    });
  });

  // ── status transitions (induction) ───────────────────────────────────────
  describe('status transitions', () => {
    let tracker: InductionTracker;
    beforeEach(() => {
      tracker = makeTracker();
    });

    it('NOT_STARTED → IN_PROGRESS via start()', () => {
      const r = tracker.create('c1', 'SITE_SAFETY');
      expect(tracker.start(r.id, 'trainer').status).toBe('IN_PROGRESS');
    });

    it('IN_PROGRESS → COMPLETED via complete()', () => {
      const r = tracker.create('c1', 'SITE_SAFETY');
      tracker.start(r.id, 'trainer');
      expect(tracker.complete(r.id, '2026-01-01', 80, true).status).toBe('COMPLETED');
    });

    it('NOT_STARTED → EXPIRED via expire()', () => {
      const r = tracker.create('c1', 'SITE_SAFETY');
      expect(tracker.expire(r.id).status).toBe('EXPIRED');
    });

    it('NOT_STARTED → WAIVED via waive()', () => {
      const r = tracker.create('c1', 'SITE_SAFETY');
      expect(tracker.waive(r.id, 'reason').status).toBe('WAIVED');
    });

    it('COMPLETED → EXPIRED via expire()', () => {
      const r = tracker.create('c1', 'SITE_SAFETY');
      tracker.start(r.id, 'trainer');
      tracker.complete(r.id, '2026-01-01', 80, true);
      expect(tracker.expire(r.id).status).toBe('EXPIRED');
    });

    it('IN_PROGRESS → WAIVED via waive()', () => {
      const r = tracker.create('c1', 'SITE_SAFETY');
      tracker.start(r.id, 'trainer');
      expect(tracker.waive(r.id, 'reason').status).toBe('WAIVED');
    });

    Array.from({ length: 10 }, (_, i) => i).forEach((i) => {
      it(`full lifecycle #${i}: create → start → complete → expire`, () => {
        const t = makeTracker();
        const r = t.create(`c${i}`, ALL_INDUCTION_TYPES[i % ALL_INDUCTION_TYPES.length]);
        expect(r.status).toBe('NOT_STARTED');
        expect(t.start(r.id, 'trainer').status).toBe('IN_PROGRESS');
        expect(t.complete(r.id, '2026-01-01', 80, true, '2027-01-01').status).toBe('COMPLETED');
        expect(t.expire(r.id).status).toBe('EXPIRED');
      });
    });
  });

  // ── mixed scenarios ───────────────────────────────────────────────────────
  describe('mixed scenarios', () => {
    let tracker: InductionTracker;
    beforeEach(() => {
      tracker = makeTracker();
    });

    Array.from({ length: 30 }, (_, i) => i).forEach((i) => {
      it(`mixed scenario #${i}`, () => {
        const t = makeTracker();
        const cid = `contractor_${i}`;
        const r1 = t.create(cid, 'SITE_SAFETY');
        const r2 = t.create(cid, 'QUALITY');
        const r3 = t.create(cid, 'EMERGENCY');
        const r4 = t.create('other', 'SECURITY');

        t.start(r1.id, 'trainer');
        t.complete(r1.id, '2026-01-01', 85, true, '2027-01-01');
        t.start(r2.id, 'trainer');
        t.waive(r3.id, 'Experienced');

        expect(t.getByContractor(cid)).toHaveLength(3);
        expect(t.getByStatus('COMPLETED')).toHaveLength(1);
        expect(t.getByStatus('IN_PROGRESS')).toHaveLength(1);
        expect(t.getByStatus('WAIVED')).toHaveLength(1);
        expect(t.getPending().some((r) => r.id === r4.id)).toBe(true);
        expect(t.getCompletionRate()).toBeCloseTo(25); // 1 completed / 4 total
        expect(t.getCount()).toBe(4);
      });
    });
  });
});

// ---------------------------------------------------------------------------
// Integration: ContractorRegistry + InductionTracker
// ---------------------------------------------------------------------------
describe('Integration: Registry + Tracker', () => {
  let registry: ContractorRegistry;
  let tracker: InductionTracker;
  beforeEach(() => {
    registry = makeRegistry();
    tracker = makeTracker();
  });

  it('approved contractor can have inductions tracked', () => {
    const c = registry.register('SafeWork', 'COMPANY', 'sw@sw.com', 'Construction', 'HIGH', ['PUBLIC_LIABILITY']);
    registry.approve(c.id, 'hse@co.com', '2026-01-01', '2027-01-01');
    const ind = tracker.create(c.id, 'SITE_SAFETY');
    tracker.start(ind.id, 'trainer@co.com');
    tracker.complete(ind.id, '2026-01-15', 90, true, '2027-01-15');
    expect(tracker.getByContractor(c.id)).toHaveLength(1);
    expect(tracker.getByStatus('COMPLETED')[0].contractorId).toBe(c.id);
  });

  it('suspended contractor inductions still tracked', () => {
    const c = registry.register('BadCo', 'COMPANY', 'bad@co.com', 'IT', 'MEDIUM', []);
    const ind = tracker.create(c.id, 'SECURITY');
    registry.suspend(c.id);
    expect(tracker.getByContractor(c.id)).toHaveLength(1);
    expect(registry.get(c.id)!.status).toBe('SUSPENDED');
    expect(tracker.getByStatus('NOT_STARTED').some((i) => i.id === ind.id)).toBe(true);
  });

  it('multiple induction types for one contractor', () => {
    const c = registry.register('Multi', 'COMPANY', 'm@m.com', 'Multi', 'LOW', []);
    ALL_INDUCTION_TYPES.forEach((type) => {
      const ind = tracker.create(c.id, type);
      tracker.start(ind.id, 'trainer');
      tracker.complete(ind.id, '2026-01-01', 80, true, '2027-01-01');
    });
    expect(tracker.getByContractor(c.id)).toHaveLength(ALL_INDUCTION_TYPES.length);
    expect(tracker.getCompletionRate()).toBe(100);
  });

  Array.from({ length: 30 }, (_, i) => i).forEach((i) => {
    it(`integration scenario #${i}: register + multiple inductions`, () => {
      const reg = makeRegistry();
      const trk = makeTracker();

      const c = reg.register(`Contractor${i}`, ALL_TYPES[i % ALL_TYPES.length], `c${i}@c.com`, `Trade${i}`, 'MEDIUM', []);
      if (i % 2 === 0) reg.approve(c.id, 'mgr', '2026-01-01', '2027-01-01');

      const inductionCount = (i % 4) + 1;
      const inductions = Array.from({ length: inductionCount }, (_, j) =>
        trk.create(c.id, ALL_INDUCTION_TYPES[j % ALL_INDUCTION_TYPES.length]),
      );

      inductions.forEach((ind) => {
        trk.start(ind.id, 'trainer');
        trk.complete(ind.id, '2026-01-01', 75, true);
      });

      expect(trk.getByContractor(c.id)).toHaveLength(inductionCount);
      expect(trk.getCompletionRate()).toBe(100);
      if (i % 2 === 0) {
        expect(reg.get(c.id)!.status).toBe('APPROVED');
      }
    });
  });
});

// ---------------------------------------------------------------------------
// Extra coverage: ContractorRegistry edge cases
// ---------------------------------------------------------------------------
describe('ContractorRegistry — additional edge cases', () => {
  let registry: ContractorRegistry;
  beforeEach(() => {
    registry = makeRegistry();
  });

  it('get() after approve returns APPROVED record', () => {
    const r = registry.register('A', 'COMPANY', 'a@a.com', 'T', 'LOW', []);
    registry.approve(r.id, 'mgr', '2026-01-01');
    expect(registry.get(r.id)!.status).toBe('APPROVED');
  });

  it('get() after blacklist returns BLACKLISTED record', () => {
    const r = registry.register('A', 'COMPANY', 'a@a.com', 'T', 'LOW', []);
    registry.blacklist(r.id);
    expect(registry.get(r.id)!.status).toBe('BLACKLISTED');
  });

  it('get() after suspend returns SUSPENDED record', () => {
    const r = registry.register('A', 'COMPANY', 'a@a.com', 'T', 'LOW', []);
    registry.suspend(r.id);
    expect(registry.get(r.id)!.status).toBe('SUSPENDED');
  });

  it('getAll() count is stable after same-id operations', () => {
    const r = registry.register('A', 'COMPANY', 'a@a.com', 'T', 'LOW', []);
    registry.approve(r.id, 'mgr', '2026-01-01');
    registry.suspend(r.id);
    expect(registry.getCount()).toBe(1);
  });

  it('approve preserves name', () => {
    const r = registry.register('UniqueNameXYZ', 'COMPANY', 'a@a.com', 'T', 'LOW', []);
    const approved = registry.approve(r.id, 'mgr', '2026-01-01');
    expect(approved.name).toBe('UniqueNameXYZ');
  });

  it('approve preserves trade', () => {
    const r = registry.register('A', 'COMPANY', 'a@a.com', 'SpecificTrade', 'LOW', []);
    const approved = registry.approve(r.id, 'mgr', '2026-01-01');
    expect(approved.trade).toBe('SpecificTrade');
  });

  it('approve preserves riskRating', () => {
    const r = registry.register('A', 'COMPANY', 'a@a.com', 'T', 'HIGH', []);
    const approved = registry.approve(r.id, 'mgr', '2026-01-01');
    expect(approved.riskRating).toBe('HIGH');
  });

  it('addComplianceItem adds multiple distinct items', () => {
    const r = registry.register('A', 'COMPANY', 'a@a.com', 'T', 'LOW', []);
    registry.addComplianceItem(r.id, 'PUBLIC_LIABILITY');
    registry.addComplianceItem(r.id, 'ISO_CERTIFICATION');
    const record = registry.get(r.id)!;
    expect(record.complianceItems).toContain('PUBLIC_LIABILITY');
    expect(record.complianceItems).toContain('ISO_CERTIFICATION');
    expect(record.complianceItems).toHaveLength(2);
  });

  it('getByTrade returns multiple contractors with same trade', () => {
    registry.register('A', 'COMPANY', 'a@a.com', 'Electrical', 'LOW', []);
    registry.register('B', 'INDIVIDUAL', 'b@b.com', 'Electrical', 'MEDIUM', []);
    registry.register('C', 'AGENCY', 'c@c.com', 'Plumbing', 'HIGH', []);
    expect(registry.getByTrade('Electrical')).toHaveLength(2);
    expect(registry.getByTrade('Plumbing')).toHaveLength(1);
  });

  it('getApproved() count increases with each approval', () => {
    const r1 = registry.register('A', 'COMPANY', 'a@a.com', 'T', 'LOW', []);
    const r2 = registry.register('B', 'COMPANY', 'b@b.com', 'T', 'LOW', []);
    registry.approve(r1.id, 'mgr', '2026-01-01');
    expect(registry.getApproved()).toHaveLength(1);
    registry.approve(r2.id, 'mgr', '2026-01-01');
    expect(registry.getApproved()).toHaveLength(2);
  });

  it('getExpired() with multiple expired contractors', () => {
    const r1 = registry.register('A', 'COMPANY', 'a@a.com', 'T', 'LOW', []);
    const r2 = registry.register('B', 'COMPANY', 'b@b.com', 'T', 'LOW', []);
    registry.approve(r1.id, 'mgr', '2025-01-01', '2025-06-01');
    registry.approve(r2.id, 'mgr', '2025-01-01', '2025-09-01');
    expect(registry.getExpired('2026-01-01')).toHaveLength(2);
  });

  // 10 more parameterized tests
  Array.from({ length: 10 }, (_, i) => i).forEach((i) => {
    it(`edge case #${i}: addComplianceItem then getAll`, () => {
      const reg = makeRegistry();
      const r = reg.register(`N${i}`, 'COMPANY', `e${i}@t.com`, 'T', 'LOW', []);
      const item = ALL_COMPLIANCE[i % ALL_COMPLIANCE.length];
      reg.addComplianceItem(r.id, item);
      const all = reg.getAll();
      expect(all.some((c) => c.complianceItems.includes(item))).toBe(true);
    });
  });
});

// ---------------------------------------------------------------------------
// Extra coverage: InductionTracker edge cases
// ---------------------------------------------------------------------------
describe('InductionTracker — additional edge cases', () => {
  let tracker: InductionTracker;
  beforeEach(() => {
    tracker = makeTracker();
  });

  it('getByContractor returns copies (snapshot)', () => {
    const r = tracker.create('c1', 'SITE_SAFETY');
    const result = tracker.getByContractor('c1');
    (result[0] as any).status = 'WAIVED';
    expect(tracker.getByStatus('NOT_STARTED').some((i) => i.id === r.id)).toBe(true);
  });

  it('complete without prior start still works', () => {
    const r = tracker.create('c1', 'SITE_SAFETY');
    const completed = tracker.complete(r.id, '2026-01-01', 80, true);
    expect(completed.status).toBe('COMPLETED');
  });

  it('waive updates notes even if notes already existed', () => {
    const r = tracker.create('c1', 'SITE_SAFETY');
    tracker.start(r.id, 'trainer');
    tracker.complete(r.id, '2026-01-01', 80, true, undefined, 'Original note');
    tracker.waive(r.id, 'New waiver reason');
    expect(tracker.getByStatus('WAIVED')[0].notes).toBe('New waiver reason');
  });

  it('getByType returns all inductions of that type across contractors', () => {
    tracker.create('c1', 'SITE_SAFETY');
    tracker.create('c2', 'SITE_SAFETY');
    tracker.create('c3', 'QUALITY');
    expect(tracker.getByType('SITE_SAFETY')).toHaveLength(2);
    expect(tracker.getByType('QUALITY')).toHaveLength(1);
  });

  it('getExpired returns nothing when all are future-dated', () => {
    const r1 = tracker.create('c1', 'SITE_SAFETY');
    const r2 = tracker.create('c2', 'QUALITY');
    tracker.start(r1.id, 't'); tracker.complete(r1.id, '2026-01-01', 80, true, '2028-01-01');
    tracker.start(r2.id, 't'); tracker.complete(r2.id, '2026-01-01', 80, true, '2029-01-01');
    expect(tracker.getExpired('2026-06-01')).toHaveLength(0);
  });

  it('getCount() includes all statuses', () => {
    const r1 = tracker.create('c1', 'SITE_SAFETY');
    const r2 = tracker.create('c2', 'QUALITY');
    const r3 = tracker.create('c3', 'EMERGENCY');
    tracker.expire(r1.id);
    tracker.waive(r2.id, 'reason');
    tracker.start(r3.id, 'trainer');
    expect(tracker.getCount()).toBe(3);
  });

  it('getCompletionRate is 0 with only EXPIRED records', () => {
    const r = tracker.create('c1', 'SITE_SAFETY');
    tracker.expire(r.id);
    expect(tracker.getCompletionRate()).toBe(0);
  });

  it('getCompletionRate is 0 with only WAIVED records', () => {
    const r = tracker.create('c1', 'SITE_SAFETY');
    tracker.waive(r.id, 'reason');
    expect(tracker.getCompletionRate()).toBe(0);
  });

  it('getPending returns NOT_STARTED and IN_PROGRESS but not WAIVED', () => {
    const r1 = tracker.create('c1', 'SITE_SAFETY');
    const r2 = tracker.create('c2', 'QUALITY');
    tracker.start(r2.id, 'trainer');
    const r3 = tracker.create('c3', 'EMERGENCY');
    tracker.waive(r3.id, 'reason');
    const pending = tracker.getPending();
    expect(pending.some((i) => i.id === r1.id)).toBe(true);
    expect(pending.some((i) => i.id === r2.id)).toBe(true);
    expect(pending.some((i) => i.id === r3.id)).toBe(false);
  });

  // 10 more parameterized tests
  Array.from({ length: 10 }, (_, i) => i).forEach((i) => {
    it(`tracker edge case #${i}: create + expire + getByStatus`, () => {
      const t = makeTracker();
      const type = ALL_INDUCTION_TYPES[i % ALL_INDUCTION_TYPES.length];
      const r = t.create(`c${i}`, type);
      t.expire(r.id);
      expect(t.getByStatus('EXPIRED').some((ind) => ind.id === r.id)).toBe(true);
      expect(t.getPending().some((ind) => ind.id === r.id)).toBe(false);
    });
  });
});
