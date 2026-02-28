// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { LegalRegister } from '../legal-register';
import { ObligationTracker } from '../obligation-tracker';
import {
  RequirementType,
  ComplianceStatus,
  Jurisdiction,
  ReviewFrequency,
  ObligationType,
  LegalRequirement,
} from '../types';

// ─── Helpers ────────────────────────────────────────────────────────────────

function makeReq(overrides: Partial<Omit<LegalRequirement, 'isActive'>> = {}): Omit<LegalRequirement, 'isActive'> {
  return {
    id: `req-${Math.random().toString(36).slice(2)}`,
    title: 'Test Requirement',
    type: 'LAW',
    jurisdiction: 'FEDERAL',
    description: 'A test legal requirement',
    applicableTo: ['operations'],
    complianceStatus: 'NOT_ASSESSED',
    reviewFrequency: 'ANNUAL',
    owner: 'owner@example.com',
    effectiveDate: '2026-01-01',
    ...overrides,
  };
}

const REQ_TYPES: RequirementType[] = ['LAW', 'REGULATION', 'PERMIT', 'STANDARD', 'GUIDELINE', 'LICENCE', 'AGREEMENT'];
const JURISDICTIONS: Jurisdiction[] = ['FEDERAL', 'STATE', 'LOCAL', 'INTERNATIONAL', 'INDUSTRY'];
const COMPLIANCE_STATUSES: ComplianceStatus[] = ['COMPLIANT', 'NON_COMPLIANT', 'PARTIAL', 'NOT_ASSESSED', 'NOT_APPLICABLE'];
const REVIEW_FREQS: ReviewFrequency[] = ['MONTHLY', 'QUARTERLY', 'BIANNUAL', 'ANNUAL'];
const OBL_TYPES: ObligationType[] = ['MUST', 'SHOULD', 'MAY'];

// ─── LegalRegister: add ─────────────────────────────────────────────────────

describe('LegalRegister.add', () => {
  let reg: LegalRegister;
  beforeEach(() => { reg = new LegalRegister(); });

  it('returns the added requirement with isActive=true', () => {
    const r = reg.add(makeReq());
    expect(r.isActive).toBe(true);
  });

  it('stores the requirement and getCount increments', () => {
    reg.add(makeReq());
    expect(reg.getCount()).toBe(1);
  });

  it('preserves all supplied fields', () => {
    const input = makeReq({ title: 'My Law', description: 'Desc', owner: 'alice' });
    const r = reg.add(input);
    expect(r.title).toBe('My Law');
    expect(r.description).toBe('Desc');
    expect(r.owner).toBe('alice');
  });

  it('preserves optional referenceNumber', () => {
    const r = reg.add(makeReq({ referenceNumber: 'REF-001' }));
    expect(r.referenceNumber).toBe('REF-001');
  });

  it('preserves optional expiryDate', () => {
    const r = reg.add(makeReq({ expiryDate: '2027-12-31' }));
    expect(r.expiryDate).toBe('2027-12-31');
  });

  it('preserves optional lastReviewDate', () => {
    const r = reg.add(makeReq({ lastReviewDate: '2025-06-01' }));
    expect(r.lastReviewDate).toBe('2025-06-01');
  });

  it('preserves optional nextReviewDate', () => {
    const r = reg.add(makeReq({ nextReviewDate: '2026-06-01' }));
    expect(r.nextReviewDate).toBe('2026-06-01');
  });

  it('preserves applicableTo array', () => {
    const r = reg.add(makeReq({ applicableTo: ['HR', 'Finance'] }));
    expect(r.applicableTo).toEqual(['HR', 'Finance']);
  });

  it('preserves effectiveDate', () => {
    const r = reg.add(makeReq({ effectiveDate: '2025-03-15' }));
    expect(r.effectiveDate).toBe('2025-03-15');
  });

  it('uses the supplied id', () => {
    const r = reg.add(makeReq({ id: 'fixed-id-001' }));
    expect(r.id).toBe('fixed-id-001');
  });

  // Parameterized: all RequirementTypes
  REQ_TYPES.forEach(type => {
    it(`adds requirement with type=${type}`, () => {
      const r = reg.add(makeReq({ type }));
      expect(r.type).toBe(type);
    });
  });

  // Parameterized: all Jurisdictions
  JURISDICTIONS.forEach(j => {
    it(`adds requirement with jurisdiction=${j}`, () => {
      const r = reg.add(makeReq({ jurisdiction: j }));
      expect(r.jurisdiction).toBe(j);
    });
  });

  // Parameterized: all ComplianceStatuses
  COMPLIANCE_STATUSES.forEach(s => {
    it(`adds requirement with complianceStatus=${s}`, () => {
      const r = reg.add(makeReq({ complianceStatus: s }));
      expect(r.complianceStatus).toBe(s);
    });
  });

  // Parameterized: all ReviewFrequencies
  REVIEW_FREQS.forEach(f => {
    it(`adds requirement with reviewFrequency=${f}`, () => {
      const r = reg.add(makeReq({ reviewFrequency: f }));
      expect(r.reviewFrequency).toBe(f);
    });
  });

  // Add 30 unique requirements and check count
  Array.from({ length: 30 }, (_, i) => i).forEach(i => {
    it(`add #${i + 1} increments count to ${i + 1}`, () => {
      Array.from({ length: i + 1 }).forEach(() => reg.add(makeReq()));
      expect(reg.getCount()).toBe(i + 1);
    });
  });
});

// ─── LegalRegister: get ─────────────────────────────────────────────────────

describe('LegalRegister.get', () => {
  let reg: LegalRegister;
  beforeEach(() => { reg = new LegalRegister(); });

  it('returns undefined for unknown id', () => {
    expect(reg.get('no-such-id')).toBeUndefined();
  });

  it('returns a copy of the stored requirement', () => {
    const input = makeReq({ id: 'get-001' });
    reg.add(input);
    const r = reg.get('get-001');
    expect(r).toBeDefined();
    expect(r!.id).toBe('get-001');
  });

  it('returned object is a copy (mutating it does not affect the store)', () => {
    const input = makeReq({ id: 'get-002' });
    reg.add(input);
    const r = reg.get('get-002')!;
    r.title = 'MUTATED';
    expect(reg.get('get-002')!.title).toBe('Test Requirement');
  });

  Array.from({ length: 20 }, (_, i) => i).forEach(i => {
    it(`get returns correct record for entry ${i}`, () => {
      const id = `id-${i}`;
      reg.add(makeReq({ id, title: `Title-${i}` }));
      const r = reg.get(id);
      expect(r?.title).toBe(`Title-${i}`);
    });
  });
});

// ─── LegalRegister: getAll ───────────────────────────────────────────────────

describe('LegalRegister.getAll', () => {
  let reg: LegalRegister;
  beforeEach(() => { reg = new LegalRegister(); });

  it('returns empty array when empty', () => {
    expect(reg.getAll()).toEqual([]);
  });

  Array.from({ length: 25 }, (_, i) => i + 1).forEach(n => {
    it(`returns ${n} items after ${n} adds`, () => {
      Array.from({ length: n }).forEach(() => reg.add(makeReq()));
      expect(reg.getAll()).toHaveLength(n);
    });
  });
});

// ─── LegalRegister: update ───────────────────────────────────────────────────

describe('LegalRegister.update', () => {
  let reg: LegalRegister;
  beforeEach(() => { reg = new LegalRegister(); });

  it('throws for unknown id', () => {
    expect(() => reg.update('no-such', { title: 'X' })).toThrow('LegalRequirement not found: no-such');
  });

  it('updates title', () => {
    reg.add(makeReq({ id: 'u1' }));
    const r = reg.update('u1', { title: 'New Title' });
    expect(r.title).toBe('New Title');
  });

  it('updates description', () => {
    reg.add(makeReq({ id: 'u2' }));
    const r = reg.update('u2', { description: 'Updated desc' });
    expect(r.description).toBe('Updated desc');
  });

  it('updates complianceStatus', () => {
    reg.add(makeReq({ id: 'u3' }));
    const r = reg.update('u3', { complianceStatus: 'COMPLIANT' });
    expect(r.complianceStatus).toBe('COMPLIANT');
  });

  it('updates owner', () => {
    reg.add(makeReq({ id: 'u4' }));
    const r = reg.update('u4', { owner: 'new-owner' });
    expect(r.owner).toBe('new-owner');
  });

  it('updates nextReviewDate', () => {
    reg.add(makeReq({ id: 'u5' }));
    const r = reg.update('u5', { nextReviewDate: '2027-01-01' });
    expect(r.nextReviewDate).toBe('2027-01-01');
  });

  it('update preserves other fields', () => {
    reg.add(makeReq({ id: 'u6', title: 'Keep This', owner: 'owner1' }));
    const r = reg.update('u6', { description: 'Only changed desc' });
    expect(r.title).toBe('Keep This');
    expect(r.owner).toBe('owner1');
  });

  it('update preserves id', () => {
    reg.add(makeReq({ id: 'u7' }));
    const r = reg.update('u7', { title: 'Changed' });
    expect(r.id).toBe('u7');
  });

  it('update persists changes for subsequent get', () => {
    reg.add(makeReq({ id: 'u8' }));
    reg.update('u8', { title: 'Persisted Title' });
    expect(reg.get('u8')!.title).toBe('Persisted Title');
  });

  // Parameterized update for all types
  REQ_TYPES.forEach(type => {
    it(`update sets type to ${type}`, () => {
      reg.add(makeReq({ id: `u-type-${type}` }));
      const r = reg.update(`u-type-${type}`, { type });
      expect(r.type).toBe(type);
    });
  });

  // Parameterized update for all jurisdictions
  JURISDICTIONS.forEach(j => {
    it(`update sets jurisdiction to ${j}`, () => {
      reg.add(makeReq({ id: `u-jur-${j}` }));
      const r = reg.update(`u-jur-${j}`, { jurisdiction: j });
      expect(r.jurisdiction).toBe(j);
    });
  });

  // Parameterized update for all statuses
  COMPLIANCE_STATUSES.forEach(s => {
    it(`update sets complianceStatus to ${s}`, () => {
      reg.add(makeReq({ id: `u-status-${s}` }));
      const r = reg.update(`u-status-${s}`, { complianceStatus: s });
      expect(r.complianceStatus).toBe(s);
    });
  });

  // Parameterized update for all review frequencies
  REVIEW_FREQS.forEach(f => {
    it(`update sets reviewFrequency to ${f}`, () => {
      reg.add(makeReq({ id: `u-freq-${f}` }));
      const r = reg.update(`u-freq-${f}`, { reviewFrequency: f });
      expect(r.reviewFrequency).toBe(f);
    });
  });
});

// ─── LegalRegister: deactivate ───────────────────────────────────────────────

describe('LegalRegister.deactivate', () => {
  let reg: LegalRegister;
  beforeEach(() => { reg = new LegalRegister(); });

  it('throws for unknown id', () => {
    expect(() => reg.deactivate('no-such')).toThrow();
  });

  it('sets isActive to false', () => {
    reg.add(makeReq({ id: 'd1' }));
    const r = reg.deactivate('d1');
    expect(r.isActive).toBe(false);
  });

  it('persists deactivation', () => {
    reg.add(makeReq({ id: 'd2' }));
    reg.deactivate('d2');
    expect(reg.get('d2')!.isActive).toBe(false);
  });

  it('deactivated record is excluded from getActive()', () => {
    reg.add(makeReq({ id: 'd3' }));
    reg.deactivate('d3');
    expect(reg.getActive().map(r => r.id)).not.toContain('d3');
  });

  it('deactivated record still appears in getAll()', () => {
    reg.add(makeReq({ id: 'd4' }));
    reg.deactivate('d4');
    expect(reg.getAll().map(r => r.id)).toContain('d4');
  });

  it('deactivation preserves other fields', () => {
    reg.add(makeReq({ id: 'd5', title: 'Stay Same' }));
    const r = reg.deactivate('d5');
    expect(r.title).toBe('Stay Same');
  });

  Array.from({ length: 20 }, (_, i) => i).forEach(i => {
    it(`deactivates requirement at index ${i}`, () => {
      const id = `deact-${i}`;
      reg.add(makeReq({ id }));
      const r = reg.deactivate(id);
      expect(r.isActive).toBe(false);
    });
  });
});

// ─── LegalRegister: setCompliance ────────────────────────────────────────────

describe('LegalRegister.setCompliance', () => {
  let reg: LegalRegister;
  beforeEach(() => { reg = new LegalRegister(); });

  it('throws for unknown id', () => {
    expect(() => reg.setCompliance('no-such', 'COMPLIANT')).toThrow();
  });

  COMPLIANCE_STATUSES.forEach(s => {
    it(`sets complianceStatus to ${s}`, () => {
      reg.add(makeReq({ id: `sc-${s}` }));
      const r = reg.setCompliance(`sc-${s}`, s);
      expect(r.complianceStatus).toBe(s);
    });
  });

  it('persists status change', () => {
    reg.add(makeReq({ id: 'sc-persist' }));
    reg.setCompliance('sc-persist', 'PARTIAL');
    expect(reg.get('sc-persist')!.complianceStatus).toBe('PARTIAL');
  });

  it('multiple status changes on same req — last wins', () => {
    reg.add(makeReq({ id: 'sc-multi' }));
    reg.setCompliance('sc-multi', 'COMPLIANT');
    reg.setCompliance('sc-multi', 'NON_COMPLIANT');
    expect(reg.get('sc-multi')!.complianceStatus).toBe('NON_COMPLIANT');
  });

  Array.from({ length: 15 }, (_, i) => i).forEach(i => {
    it(`setCompliance loop iteration ${i}`, () => {
      const id = `sc-loop-${i}`;
      const status = COMPLIANCE_STATUSES[i % COMPLIANCE_STATUSES.length];
      reg.add(makeReq({ id }));
      const r = reg.setCompliance(id, status);
      expect(r.complianceStatus).toBe(status);
    });
  });
});

// ─── LegalRegister: getActive ────────────────────────────────────────────────

describe('LegalRegister.getActive', () => {
  let reg: LegalRegister;
  beforeEach(() => { reg = new LegalRegister(); });

  it('empty when no records', () => {
    expect(reg.getActive()).toEqual([]);
  });

  it('all added records are active by default', () => {
    reg.add(makeReq({ id: 'a1' }));
    reg.add(makeReq({ id: 'a2' }));
    expect(reg.getActive()).toHaveLength(2);
  });

  it('deactivated records are excluded', () => {
    reg.add(makeReq({ id: 'a3' }));
    reg.add(makeReq({ id: 'a4' }));
    reg.deactivate('a3');
    expect(reg.getActive()).toHaveLength(1);
    expect(reg.getActive()[0].id).toBe('a4');
  });

  Array.from({ length: 20 }, (_, i) => i + 1).forEach(n => {
    it(`getActive returns ${n} active from ${n * 2} total (half deactivated)`, () => {
      Array.from({ length: n * 2 }, (_, i) => i).forEach(i => {
        reg.add(makeReq({ id: `active-${n}-${i}` }));
      });
      Array.from({ length: n }, (_, i) => i).forEach(i => {
        reg.deactivate(`active-${n}-${i}`);
      });
      expect(reg.getActive()).toHaveLength(n);
    });
  });
});

// ─── LegalRegister: getByType ────────────────────────────────────────────────

describe('LegalRegister.getByType', () => {
  let reg: LegalRegister;
  beforeEach(() => { reg = new LegalRegister(); });

  REQ_TYPES.forEach(type => {
    it(`getByType(${type}) returns only that type`, () => {
      reg.add(makeReq({ id: `type-${type}-1`, type }));
      reg.add(makeReq({ id: `type-${type}-other`, type: type === 'LAW' ? 'REGULATION' : 'LAW' }));
      const results = reg.getByType(type);
      expect(results.every(r => r.type === type)).toBe(true);
    });
  });

  it('returns empty when no matching type', () => {
    reg.add(makeReq({ type: 'LAW' }));
    expect(reg.getByType('PERMIT')).toHaveLength(0);
  });

  Array.from({ length: 15 }, (_, i) => i + 1).forEach(n => {
    it(`getByType returns ${n} LAW records`, () => {
      Array.from({ length: n }).forEach(() => reg.add(makeReq({ type: 'LAW' })));
      reg.add(makeReq({ type: 'PERMIT' }));
      expect(reg.getByType('LAW')).toHaveLength(n);
    });
  });
});

// ─── LegalRegister: getByJurisdiction ───────────────────────────────────────

describe('LegalRegister.getByJurisdiction', () => {
  let reg: LegalRegister;
  beforeEach(() => { reg = new LegalRegister(); });

  JURISDICTIONS.forEach(j => {
    it(`getByJurisdiction(${j}) returns only that jurisdiction`, () => {
      reg.add(makeReq({ id: `jur-${j}`, jurisdiction: j }));
      const other = JURISDICTIONS.find(x => x !== j) || 'STATE';
      reg.add(makeReq({ id: `jur-other-${j}`, jurisdiction: other }));
      const results = reg.getByJurisdiction(j);
      expect(results.every(r => r.jurisdiction === j)).toBe(true);
    });
  });

  it('returns empty when no matching jurisdiction', () => {
    reg.add(makeReq({ jurisdiction: 'FEDERAL' }));
    expect(reg.getByJurisdiction('LOCAL')).toHaveLength(0);
  });

  Array.from({ length: 15 }, (_, i) => i + 1).forEach(n => {
    it(`getByJurisdiction returns ${n} FEDERAL records`, () => {
      Array.from({ length: n }).forEach(() => reg.add(makeReq({ jurisdiction: 'FEDERAL' })));
      reg.add(makeReq({ jurisdiction: 'STATE' }));
      expect(reg.getByJurisdiction('FEDERAL')).toHaveLength(n);
    });
  });
});

// ─── LegalRegister: getByStatus ─────────────────────────────────────────────

describe('LegalRegister.getByStatus', () => {
  let reg: LegalRegister;
  beforeEach(() => { reg = new LegalRegister(); });

  COMPLIANCE_STATUSES.forEach(s => {
    it(`getByStatus(${s}) returns only that status`, () => {
      reg.add(makeReq({ id: `stat-${s}`, complianceStatus: s }));
      const other = COMPLIANCE_STATUSES.find(x => x !== s) || 'COMPLIANT';
      reg.add(makeReq({ id: `stat-other-${s}`, complianceStatus: other }));
      const results = reg.getByStatus(s);
      expect(results.every(r => r.complianceStatus === s)).toBe(true);
    });
  });

  it('returns empty when no matching status', () => {
    reg.add(makeReq({ complianceStatus: 'COMPLIANT' }));
    expect(reg.getByStatus('PARTIAL')).toHaveLength(0);
  });

  Array.from({ length: 15 }, (_, i) => i + 1).forEach(n => {
    it(`getByStatus returns ${n} COMPLIANT records`, () => {
      Array.from({ length: n }).forEach(() => reg.add(makeReq({ complianceStatus: 'COMPLIANT' })));
      reg.add(makeReq({ complianceStatus: 'NON_COMPLIANT' }));
      expect(reg.getByStatus('COMPLIANT')).toHaveLength(n);
    });
  });
});

// ─── LegalRegister: getByOwner ───────────────────────────────────────────────

describe('LegalRegister.getByOwner', () => {
  let reg: LegalRegister;
  beforeEach(() => { reg = new LegalRegister(); });

  it('returns only records matching owner', () => {
    reg.add(makeReq({ id: 'own1', owner: 'alice' }));
    reg.add(makeReq({ id: 'own2', owner: 'bob' }));
    expect(reg.getByOwner('alice')).toHaveLength(1);
    expect(reg.getByOwner('alice')[0].id).toBe('own1');
  });

  it('returns empty for unknown owner', () => {
    reg.add(makeReq({ owner: 'alice' }));
    expect(reg.getByOwner('nobody')).toHaveLength(0);
  });

  it('returns multiple records for same owner', () => {
    reg.add(makeReq({ owner: 'charlie' }));
    reg.add(makeReq({ owner: 'charlie' }));
    reg.add(makeReq({ owner: 'dave' }));
    expect(reg.getByOwner('charlie')).toHaveLength(2);
  });

  Array.from({ length: 20 }, (_, i) => i + 1).forEach(n => {
    it(`getByOwner returns ${n} records for owner-X`, () => {
      Array.from({ length: n }).forEach(() => reg.add(makeReq({ owner: 'owner-X' })));
      reg.add(makeReq({ owner: 'owner-Y' }));
      expect(reg.getByOwner('owner-X')).toHaveLength(n);
    });
  });
});

// ─── LegalRegister: getOverdueReview ─────────────────────────────────────────

describe('LegalRegister.getOverdueReview', () => {
  let reg: LegalRegister;
  beforeEach(() => { reg = new LegalRegister(); });

  it('returns empty when no records', () => {
    expect(reg.getOverdueReview('2026-01-01')).toEqual([]);
  });

  it('returns active record with nextReviewDate before asOf', () => {
    reg.add(makeReq({ id: 'ovr1', nextReviewDate: '2025-12-31' }));
    expect(reg.getOverdueReview('2026-01-01').map(r => r.id)).toContain('ovr1');
  });

  it('excludes record with nextReviewDate equal to asOf', () => {
    reg.add(makeReq({ id: 'ovr2', nextReviewDate: '2026-01-01' }));
    expect(reg.getOverdueReview('2026-01-01').map(r => r.id)).not.toContain('ovr2');
  });

  it('excludes record with nextReviewDate after asOf', () => {
    reg.add(makeReq({ id: 'ovr3', nextReviewDate: '2026-06-01' }));
    expect(reg.getOverdueReview('2026-01-01').map(r => r.id)).not.toContain('ovr3');
  });

  it('excludes inactive record even if overdue', () => {
    reg.add(makeReq({ id: 'ovr4', nextReviewDate: '2025-01-01' }));
    reg.deactivate('ovr4');
    expect(reg.getOverdueReview('2026-01-01').map(r => r.id)).not.toContain('ovr4');
  });

  it('excludes record with no nextReviewDate', () => {
    reg.add(makeReq({ id: 'ovr5' }));
    expect(reg.getOverdueReview('2026-01-01').map(r => r.id)).not.toContain('ovr5');
  });

  Array.from({ length: 20 }, (_, i) => i + 1).forEach(n => {
    it(`getOverdueReview returns ${n} overdue records`, () => {
      Array.from({ length: n }).forEach((_, i) => {
        reg.add(makeReq({ id: `ovrn-${n}-${i}`, nextReviewDate: `202${i % 5}-06-01` < '2026-01-01' ? `202${i % 5}-06-01` : '2025-06-01' }));
      });
      // Add one not overdue
      reg.add(makeReq({ id: `ovrn-${n}-future`, nextReviewDate: '2030-01-01' }));
      const result = reg.getOverdueReview('2026-01-01');
      expect(result.length).toBe(n);
    });
  });
});

// ─── LegalRegister: getNonCompliant ──────────────────────────────────────────

describe('LegalRegister.getNonCompliant', () => {
  let reg: LegalRegister;
  beforeEach(() => { reg = new LegalRegister(); });

  it('returns empty when all compliant', () => {
    reg.add(makeReq({ complianceStatus: 'COMPLIANT' }));
    expect(reg.getNonCompliant()).toHaveLength(0);
  });

  it('returns NON_COMPLIANT records', () => {
    reg.add(makeReq({ id: 'nc1', complianceStatus: 'NON_COMPLIANT' }));
    expect(reg.getNonCompliant().map(r => r.id)).toContain('nc1');
  });

  it('returns PARTIAL records', () => {
    reg.add(makeReq({ id: 'nc2', complianceStatus: 'PARTIAL' }));
    expect(reg.getNonCompliant().map(r => r.id)).toContain('nc2');
  });

  it('does not return COMPLIANT records', () => {
    reg.add(makeReq({ id: 'nc3', complianceStatus: 'COMPLIANT' }));
    expect(reg.getNonCompliant().map(r => r.id)).not.toContain('nc3');
  });

  it('does not return NOT_ASSESSED records', () => {
    reg.add(makeReq({ id: 'nc4', complianceStatus: 'NOT_ASSESSED' }));
    expect(reg.getNonCompliant().map(r => r.id)).not.toContain('nc4');
  });

  it('does not return NOT_APPLICABLE records', () => {
    reg.add(makeReq({ id: 'nc5', complianceStatus: 'NOT_APPLICABLE' }));
    expect(reg.getNonCompliant().map(r => r.id)).not.toContain('nc5');
  });

  it('includes inactive NON_COMPLIANT records', () => {
    reg.add(makeReq({ id: 'nc6', complianceStatus: 'NON_COMPLIANT' }));
    reg.deactivate('nc6');
    expect(reg.getNonCompliant().map(r => r.id)).toContain('nc6');
  });

  Array.from({ length: 20 }, (_, i) => i + 1).forEach(n => {
    it(`getNonCompliant returns ${n} records (mix of NON_COMPLIANT and PARTIAL)`, () => {
      Array.from({ length: n }, (_, i) => i).forEach(i => {
        const status: ComplianceStatus = i % 2 === 0 ? 'NON_COMPLIANT' : 'PARTIAL';
        reg.add(makeReq({ id: `ncn-${n}-${i}`, complianceStatus: status }));
      });
      reg.add(makeReq({ complianceStatus: 'COMPLIANT' }));
      expect(reg.getNonCompliant()).toHaveLength(n);
    });
  });
});

// ─── LegalRegister: getExpiring ──────────────────────────────────────────────

describe('LegalRegister.getExpiring', () => {
  let reg: LegalRegister;
  beforeEach(() => { reg = new LegalRegister(); });

  it('returns empty when no records', () => {
    expect(reg.getExpiring('2026-01-01', 30)).toEqual([]);
  });

  it('returns active record expiring within range', () => {
    reg.add(makeReq({ id: 'exp1', expiryDate: '2026-01-15' }));
    expect(reg.getExpiring('2026-01-01', 30).map(r => r.id)).toContain('exp1');
  });

  it('excludes record expiring before asOf (already expired)', () => {
    reg.add(makeReq({ id: 'exp2', expiryDate: '2025-12-31' }));
    expect(reg.getExpiring('2026-01-01', 30).map(r => r.id)).not.toContain('exp2');
  });

  it('excludes record expiring after the window', () => {
    reg.add(makeReq({ id: 'exp3', expiryDate: '2026-06-01' }));
    expect(reg.getExpiring('2026-01-01', 30).map(r => r.id)).not.toContain('exp3');
  });

  it('includes record expiring on asOf date', () => {
    reg.add(makeReq({ id: 'exp4', expiryDate: '2026-01-01' }));
    expect(reg.getExpiring('2026-01-01', 30).map(r => r.id)).toContain('exp4');
  });

  it('excludes inactive record expiring within range', () => {
    reg.add(makeReq({ id: 'exp5', expiryDate: '2026-01-15' }));
    reg.deactivate('exp5');
    expect(reg.getExpiring('2026-01-01', 30).map(r => r.id)).not.toContain('exp5');
  });

  it('excludes record with no expiryDate', () => {
    reg.add(makeReq({ id: 'exp6' }));
    expect(reg.getExpiring('2026-01-01', 30).map(r => r.id)).not.toContain('exp6');
  });

  Array.from({ length: 15 }, (_, i) => i + 1).forEach(n => {
    it(`getExpiring returns ${n} records expiring within 60 days`, () => {
      // All set to expire 30 days from asOf = 2026-01-01 → 2026-01-31
      Array.from({ length: n }).forEach((_, i) => {
        reg.add(makeReq({ id: `expn-${n}-${i}`, expiryDate: '2026-01-31' }));
      });
      // Add one outside window
      reg.add(makeReq({ id: `expn-${n}-out`, expiryDate: '2026-04-01' }));
      expect(reg.getExpiring('2026-01-01', 60)).toHaveLength(n);
    });
  });
});

// ─── LegalRegister: getCount ─────────────────────────────────────────────────

describe('LegalRegister.getCount', () => {
  let reg: LegalRegister;
  beforeEach(() => { reg = new LegalRegister(); });

  it('starts at 0', () => {
    expect(reg.getCount()).toBe(0);
  });

  Array.from({ length: 30 }, (_, i) => i + 1).forEach(n => {
    it(`getCount returns ${n} after ${n} adds`, () => {
      Array.from({ length: n }).forEach(() => reg.add(makeReq()));
      expect(reg.getCount()).toBe(n);
    });
  });

  it('deactivate does not change count', () => {
    reg.add(makeReq({ id: 'cnt1' }));
    reg.deactivate('cnt1');
    expect(reg.getCount()).toBe(1);
  });
});

// ─── ObligationTracker: add ───────────────────────────────────────────────────

describe('ObligationTracker.add', () => {
  let tracker: ObligationTracker;
  beforeEach(() => { tracker = new ObligationTracker(); });

  it('returns an obligation with auto-generated id starting with obl-', () => {
    const o = tracker.add('req-1', 'Check emission levels', 'MUST', 'alice');
    expect(o.id).toMatch(/^obl-\d+$/);
  });

  it('id is obl-1 for the first obligation', () => {
    const o = tracker.add('req-1', 'Desc', 'MUST', 'alice');
    expect(o.id).toBe('obl-1');
  });

  it('id auto-increments', () => {
    const o1 = tracker.add('req-1', 'Desc', 'MUST', 'alice');
    const o2 = tracker.add('req-1', 'Desc2', 'SHOULD', 'bob');
    expect(o1.id).toBe('obl-1');
    expect(o2.id).toBe('obl-2');
  });

  it('sets requirementId', () => {
    const o = tracker.add('req-99', 'Desc', 'MUST', 'alice');
    expect(o.requirementId).toBe('req-99');
  });

  it('sets description', () => {
    const o = tracker.add('req-1', 'My Description', 'MUST', 'alice');
    expect(o.description).toBe('My Description');
  });

  it('sets assignedTo', () => {
    const o = tracker.add('req-1', 'Desc', 'MUST', 'assigned-person');
    expect(o.assignedTo).toBe('assigned-person');
  });

  it('sets dueDate when provided', () => {
    const o = tracker.add('req-1', 'Desc', 'MUST', 'alice', '2026-03-01');
    expect(o.dueDate).toBe('2026-03-01');
  });

  it('sets evidence when provided', () => {
    const o = tracker.add('req-1', 'Desc', 'MUST', 'alice', undefined, 'doc.pdf');
    expect(o.evidence).toBe('doc.pdf');
  });

  it('sets notes when provided', () => {
    const o = tracker.add('req-1', 'Desc', 'MUST', 'alice', undefined, undefined, 'some notes');
    expect(o.notes).toBe('some notes');
  });

  it('completedDate is undefined initially', () => {
    const o = tracker.add('req-1', 'Desc', 'MUST', 'alice');
    expect(o.completedDate).toBeUndefined();
  });

  // Parameterized: all obligation types
  OBL_TYPES.forEach(type => {
    it(`adds obligation with obligationType=${type}`, () => {
      const o = tracker.add('req-1', 'Desc', type, 'alice');
      expect(o.obligationType).toBe(type);
    });
  });

  Array.from({ length: 25 }, (_, i) => i + 1).forEach(n => {
    it(`after ${n} adds, getCount is ${n}`, () => {
      Array.from({ length: n }).forEach((_v, i) =>
        tracker.add(`req-${i}`, `Desc ${i}`, OBL_TYPES[i % 3], `user-${i}`));
      expect(tracker.getCount()).toBe(n);
    });
  });
});

// ─── ObligationTracker: complete ─────────────────────────────────────────────

describe('ObligationTracker.complete', () => {
  let tracker: ObligationTracker;
  beforeEach(() => { tracker = new ObligationTracker(); });

  it('throws for unknown id', () => {
    expect(() => tracker.complete('no-such', '2026-01-01')).toThrow('ComplianceObligation not found: no-such');
  });

  it('sets completedDate', () => {
    tracker.add('req-1', 'Desc', 'MUST', 'alice');
    const o = tracker.complete('obl-1', '2026-02-01');
    expect(o.completedDate).toBe('2026-02-01');
  });

  it('sets evidence on complete', () => {
    tracker.add('req-1', 'Desc', 'MUST', 'alice');
    const o = tracker.complete('obl-1', '2026-02-01', 'proof.pdf');
    expect(o.evidence).toBe('proof.pdf');
  });

  it('sets notes on complete', () => {
    tracker.add('req-1', 'Desc', 'MUST', 'alice');
    const o = tracker.complete('obl-1', '2026-02-01', undefined, 'completed on time');
    expect(o.notes).toBe('completed on time');
  });

  it('preserves existing fields after complete', () => {
    tracker.add('req-42', 'My desc', 'SHOULD', 'bob', '2026-03-01');
    const o = tracker.complete('obl-1', '2026-02-28');
    expect(o.requirementId).toBe('req-42');
    expect(o.description).toBe('My desc');
    expect(o.obligationType).toBe('SHOULD');
    expect(o.assignedTo).toBe('bob');
    expect(o.dueDate).toBe('2026-03-01');
  });

  it('persists completedDate for subsequent queries', () => {
    tracker.add('req-1', 'Desc', 'MUST', 'alice');
    tracker.complete('obl-1', '2026-02-01');
    expect(tracker.getCompleted()).toHaveLength(1);
  });

  it('completed obligation leaves getPending', () => {
    tracker.add('req-1', 'Desc', 'MUST', 'alice');
    tracker.complete('obl-1', '2026-02-01');
    expect(tracker.getPending()).toHaveLength(0);
  });

  Array.from({ length: 20 }, (_, i) => i).forEach(i => {
    it(`complete iteration ${i} sets completedDate correctly`, () => {
      tracker.add('req-1', 'Desc', 'MUST', 'alice');
      const id = `obl-${i + 1}`;
      // Need to re-instantiate because tracker is reset in beforeEach
      // but we only add one per iteration, so obl-1
      const o = tracker.complete('obl-1', `2026-0${(i % 9) + 1}-01`);
      expect(o.completedDate).toBe(`2026-0${(i % 9) + 1}-01`);
    });
  });
});

// ─── ObligationTracker: getByRequirement ─────────────────────────────────────

describe('ObligationTracker.getByRequirement', () => {
  let tracker: ObligationTracker;
  beforeEach(() => { tracker = new ObligationTracker(); });

  it('returns empty for unknown requirement', () => {
    expect(tracker.getByRequirement('no-req')).toEqual([]);
  });

  it('returns obligations for a given requirement', () => {
    tracker.add('req-A', 'Desc1', 'MUST', 'alice');
    tracker.add('req-A', 'Desc2', 'SHOULD', 'bob');
    tracker.add('req-B', 'Desc3', 'MAY', 'charlie');
    expect(tracker.getByRequirement('req-A')).toHaveLength(2);
  });

  it('does not include obligations for other requirements', () => {
    tracker.add('req-X', 'Desc', 'MUST', 'alice');
    tracker.add('req-Y', 'Desc', 'MUST', 'bob');
    const results = tracker.getByRequirement('req-X');
    expect(results.every(o => o.requirementId === 'req-X')).toBe(true);
  });

  Array.from({ length: 20 }, (_, i) => i + 1).forEach(n => {
    it(`getByRequirement returns ${n} obligations for req-Z`, () => {
      Array.from({ length: n }).forEach((_v, i) =>
        tracker.add('req-Z', `Desc-${i}`, OBL_TYPES[i % 3], `user-${i}`));
      tracker.add('req-W', 'Other', 'MUST', 'other');
      expect(tracker.getByRequirement('req-Z')).toHaveLength(n);
    });
  });
});

// ─── ObligationTracker: getByAssignee ────────────────────────────────────────

describe('ObligationTracker.getByAssignee', () => {
  let tracker: ObligationTracker;
  beforeEach(() => { tracker = new ObligationTracker(); });

  it('returns empty for unknown assignee', () => {
    expect(tracker.getByAssignee('nobody')).toEqual([]);
  });

  it('returns only obligations for the given assignee', () => {
    tracker.add('req-1', 'Desc', 'MUST', 'alice');
    tracker.add('req-2', 'Desc', 'MUST', 'bob');
    expect(tracker.getByAssignee('alice')).toHaveLength(1);
  });

  Array.from({ length: 20 }, (_, i) => i + 1).forEach(n => {
    it(`getByAssignee returns ${n} for assignee 'eve'`, () => {
      Array.from({ length: n }).forEach((_v, i) =>
        tracker.add(`req-${i}`, `Desc`, OBL_TYPES[i % 3], 'eve'));
      tracker.add('req-999', 'Other', 'MUST', 'mallory');
      expect(tracker.getByAssignee('eve')).toHaveLength(n);
    });
  });
});

// ─── ObligationTracker: getByType ────────────────────────────────────────────

describe('ObligationTracker.getByType', () => {
  let tracker: ObligationTracker;
  beforeEach(() => { tracker = new ObligationTracker(); });

  OBL_TYPES.forEach(type => {
    it(`getByType(${type}) returns only that type`, () => {
      tracker.add('req-1', 'Desc', type, 'alice');
      const other = OBL_TYPES.find(t => t !== type) || 'SHOULD';
      tracker.add('req-2', 'Desc', other, 'bob');
      const results = tracker.getByType(type);
      expect(results.every(o => o.obligationType === type)).toBe(true);
    });
  });

  it('returns empty when no matching type', () => {
    tracker.add('req-1', 'Desc', 'MUST', 'alice');
    expect(tracker.getByType('MAY')).toHaveLength(0);
  });

  Array.from({ length: 15 }, (_, i) => i + 1).forEach(n => {
    it(`getByType returns ${n} MUST obligations`, () => {
      Array.from({ length: n }).forEach((_v, i) =>
        tracker.add(`req-${i}`, 'Desc', 'MUST', 'user'));
      tracker.add('req-999', 'Desc', 'SHOULD', 'user2');
      expect(tracker.getByType('MUST')).toHaveLength(n);
    });
  });
});

// ─── ObligationTracker: getPending ───────────────────────────────────────────

describe('ObligationTracker.getPending', () => {
  let tracker: ObligationTracker;
  beforeEach(() => { tracker = new ObligationTracker(); });

  it('returns empty when no obligations', () => {
    expect(tracker.getPending()).toEqual([]);
  });

  it('newly added obligations are pending', () => {
    tracker.add('req-1', 'Desc', 'MUST', 'alice');
    expect(tracker.getPending()).toHaveLength(1);
  });

  it('completed obligations are excluded from pending', () => {
    tracker.add('req-1', 'Desc', 'MUST', 'alice');
    tracker.complete('obl-1', '2026-01-01');
    expect(tracker.getPending()).toHaveLength(0);
  });

  Array.from({ length: 20 }, (_, i) => i + 1).forEach(n => {
    it(`getPending returns ${n} when ${n} of ${n * 2} are pending`, () => {
      Array.from({ length: n * 2 }, (_, i) => i).forEach(i => {
        tracker.add(`req-${i}`, 'Desc', 'MUST', 'user');
      });
      // complete the first n
      Array.from({ length: n }, (_, i) => i + 1).forEach(i => {
        tracker.complete(`obl-${i}`, '2026-01-01');
      });
      expect(tracker.getPending()).toHaveLength(n);
    });
  });
});

// ─── ObligationTracker: getOverdue ───────────────────────────────────────────

describe('ObligationTracker.getOverdue', () => {
  let tracker: ObligationTracker;
  beforeEach(() => { tracker = new ObligationTracker(); });

  it('returns empty when no obligations', () => {
    expect(tracker.getOverdue('2026-01-01')).toEqual([]);
  });

  it('returns pending obligation with dueDate before asOf', () => {
    tracker.add('req-1', 'Desc', 'MUST', 'alice', '2025-12-31');
    expect(tracker.getOverdue('2026-01-01')).toHaveLength(1);
  });

  it('excludes obligation with dueDate equal to asOf', () => {
    tracker.add('req-1', 'Desc', 'MUST', 'alice', '2026-01-01');
    expect(tracker.getOverdue('2026-01-01')).toHaveLength(0);
  });

  it('excludes obligation with dueDate after asOf', () => {
    tracker.add('req-1', 'Desc', 'MUST', 'alice', '2026-06-01');
    expect(tracker.getOverdue('2026-01-01')).toHaveLength(0);
  });

  it('excludes completed obligations even if overdue', () => {
    tracker.add('req-1', 'Desc', 'MUST', 'alice', '2025-12-31');
    tracker.complete('obl-1', '2026-01-15');
    expect(tracker.getOverdue('2026-01-01')).toHaveLength(0);
  });

  it('excludes obligation with no dueDate', () => {
    tracker.add('req-1', 'Desc', 'MUST', 'alice');
    expect(tracker.getOverdue('2026-01-01')).toHaveLength(0);
  });

  Array.from({ length: 20 }, (_, i) => i + 1).forEach(n => {
    it(`getOverdue returns ${n} overdue obligations`, () => {
      Array.from({ length: n }).forEach((_v, i) =>
        tracker.add(`req-${i}`, 'Desc', 'MUST', 'user', '2025-06-01'));
      tracker.add('req-999', 'Desc', 'MUST', 'user', '2030-01-01');
      expect(tracker.getOverdue('2026-01-01')).toHaveLength(n);
    });
  });
});

// ─── ObligationTracker: getCompleted ─────────────────────────────────────────

describe('ObligationTracker.getCompleted', () => {
  let tracker: ObligationTracker;
  beforeEach(() => { tracker = new ObligationTracker(); });

  it('returns empty when no obligations', () => {
    expect(tracker.getCompleted()).toEqual([]);
  });

  it('returns completed obligation', () => {
    tracker.add('req-1', 'Desc', 'MUST', 'alice');
    tracker.complete('obl-1', '2026-01-01');
    expect(tracker.getCompleted()).toHaveLength(1);
  });

  it('excludes pending obligations', () => {
    tracker.add('req-1', 'Desc', 'MUST', 'alice');
    expect(tracker.getCompleted()).toHaveLength(0);
  });

  Array.from({ length: 20 }, (_, i) => i + 1).forEach(n => {
    it(`getCompleted returns ${n} after completing ${n} of ${n + 5}`, () => {
      Array.from({ length: n + 5 }, (_, i) => i).forEach(i => {
        tracker.add(`req-${i}`, 'Desc', 'MUST', 'user');
      });
      Array.from({ length: n }, (_, i) => i + 1).forEach(i => {
        tracker.complete(`obl-${i}`, '2026-01-01');
      });
      expect(tracker.getCompleted()).toHaveLength(n);
    });
  });
});

// ─── ObligationTracker: getCount ─────────────────────────────────────────────

describe('ObligationTracker.getCount', () => {
  let tracker: ObligationTracker;
  beforeEach(() => { tracker = new ObligationTracker(); });

  it('starts at 0', () => {
    expect(tracker.getCount()).toBe(0);
  });

  Array.from({ length: 30 }, (_, i) => i + 1).forEach(n => {
    it(`getCount returns ${n} after ${n} adds`, () => {
      Array.from({ length: n }, (_, i) => i).forEach(i =>
        tracker.add(`req-${i}`, 'Desc', OBL_TYPES[i % 3], `user-${i}`));
      expect(tracker.getCount()).toBe(n);
    });
  });

  it('complete does not change getCount', () => {
    tracker.add('req-1', 'Desc', 'MUST', 'alice');
    tracker.complete('obl-1', '2026-01-01');
    expect(tracker.getCount()).toBe(1);
  });
});

// ─── Integration: LegalRegister + ObligationTracker ──────────────────────────

describe('Integration: LegalRegister + ObligationTracker', () => {
  let reg: LegalRegister;
  let tracker: ObligationTracker;
  beforeEach(() => {
    reg = new LegalRegister();
    tracker = new ObligationTracker();
  });

  it('full lifecycle: add requirement, add obligations, complete them', () => {
    const req = reg.add(makeReq({ id: 'int-req-1', complianceStatus: 'NOT_ASSESSED' }));
    tracker.add(req.id, 'Conduct emissions audit', 'MUST', 'alice', '2026-03-01');
    tracker.add(req.id, 'Train employees', 'SHOULD', 'bob', '2026-04-01');

    expect(tracker.getByRequirement(req.id)).toHaveLength(2);
    expect(tracker.getPending()).toHaveLength(2);

    tracker.complete('obl-1', '2026-02-28', 'audit-report.pdf');
    tracker.complete('obl-2', '2026-03-15');

    expect(tracker.getCompleted()).toHaveLength(2);
    expect(tracker.getPending()).toHaveLength(0);

    reg.setCompliance(req.id, 'COMPLIANT');
    expect(reg.get(req.id)!.complianceStatus).toBe('COMPLIANT');
  });

  it('deactivated requirement can still have obligations tracked', () => {
    reg.add(makeReq({ id: 'int-req-2' }));
    tracker.add('int-req-2', 'Final audit', 'MUST', 'eve');
    reg.deactivate('int-req-2');

    expect(reg.getActive().map(r => r.id)).not.toContain('int-req-2');
    expect(tracker.getByRequirement('int-req-2')).toHaveLength(1);
  });

  it('multiple requirements, each with multiple obligations', () => {
    Array.from({ length: 5 }, (_, i) => i).forEach(i => {
      const req = reg.add(makeReq({ id: `int-req-multi-${i}` }));
      Array.from({ length: 3 }).forEach((_, j) => {
        tracker.add(req.id, `Obligation ${j}`, OBL_TYPES[j % 3], `user-${j}`);
      });
    });
    expect(reg.getCount()).toBe(5);
    expect(tracker.getCount()).toBe(15);
    expect(tracker.getByRequirement('int-req-multi-0')).toHaveLength(3);
  });

  it('overdue obligations match expired requirements', () => {
    const req = reg.add(makeReq({
      id: 'int-req-expired',
      expiryDate: '2026-01-15',
      nextReviewDate: '2025-12-01',
    }));
    tracker.add(req.id, 'Renew permit', 'MUST', 'alice', '2025-12-15');

    expect(reg.getOverdueReview('2026-01-01').map(r => r.id)).toContain('int-req-expired');
    expect(tracker.getOverdue('2026-01-01')).toHaveLength(1);
    expect(reg.getExpiring('2026-01-01', 30).map(r => r.id)).toContain('int-req-expired');
  });

  it('getNonCompliant correctly identifies requirements with partial obligations', () => {
    const req = reg.add(makeReq({ id: 'int-partial', complianceStatus: 'PARTIAL' }));
    tracker.add(req.id, 'Complete gap assessment', 'MUST', 'alice');

    expect(reg.getNonCompliant().map(r => r.id)).toContain('int-partial');
    expect(tracker.getPending()).toHaveLength(1);
  });

  // Integration loop: add N requirements and obligations, verify cross-filtering
  Array.from({ length: 10 }, (_, i) => i + 1).forEach(n => {
    it(`integration loop ${n}: ${n} NON_COMPLIANT reqs each with 2 pending obligations`, () => {
      Array.from({ length: n }, (_, i) => i).forEach(i => {
        const req = reg.add(makeReq({ id: `il-req-${n}-${i}`, complianceStatus: 'NON_COMPLIANT' }));
        tracker.add(req.id, 'Task A', 'MUST', 'alice');
        tracker.add(req.id, 'Task B', 'SHOULD', 'bob');
      });
      expect(reg.getNonCompliant()).toHaveLength(n);
      expect(tracker.getPending()).toHaveLength(n * 2);
    });
  });

  // Integration loop: complete obligations changes pending count
  Array.from({ length: 10 }, (_, i) => i + 1).forEach(n => {
    it(`integration loop ${n}: completing ${n} obligations leaves correct pending`, () => {
      const total = n + 5;
      Array.from({ length: total }, (_, i) => i).forEach(i =>
        tracker.add(`req-${i}`, 'Desc', 'MUST', 'user', '2026-06-01'));
      Array.from({ length: n }, (_, i) => i + 1).forEach(i =>
        tracker.complete(`obl-${i}`, '2026-01-01'));
      expect(tracker.getPending()).toHaveLength(5);
      expect(tracker.getCompleted()).toHaveLength(n);
    });
  });
});

// ─── Error paths ──────────────────────────────────────────────────────────────

describe('Error paths', () => {
  let reg: LegalRegister;
  let tracker: ObligationTracker;
  beforeEach(() => {
    reg = new LegalRegister();
    tracker = new ObligationTracker();
  });

  it('LegalRegister.update throws with correct message', () => {
    expect(() => reg.update('ghost-id', {})).toThrow('LegalRequirement not found: ghost-id');
  });

  it('LegalRegister.deactivate throws for unknown id', () => {
    expect(() => reg.deactivate('ghost-id')).toThrow('LegalRequirement not found: ghost-id');
  });

  it('LegalRegister.setCompliance throws for unknown id', () => {
    expect(() => reg.setCompliance('ghost-id', 'COMPLIANT')).toThrow();
  });

  it('ObligationTracker.complete throws with correct message', () => {
    expect(() => tracker.complete('ghost-obl', '2026-01-01')).toThrow('ComplianceObligation not found: ghost-obl');
  });

  // Parameterized error messages for LegalRegister
  Array.from({ length: 15 }, (_, i) => `error-req-${i}`).forEach(id => {
    it(`LegalRegister.update throws for id=${id}`, () => {
      expect(() => reg.update(id, {})).toThrow(id);
    });
  });

  // Parameterized error messages for ObligationTracker
  Array.from({ length: 15 }, (_, i) => `error-obl-${i}`).forEach(id => {
    it(`ObligationTracker.complete throws for id=${id}`, () => {
      expect(() => tracker.complete(id, '2026-01-01')).toThrow(id);
    });
  });
});

// ─── Additional parameterized coverage ───────────────────────────────────────

describe('LegalRegister edge cases', () => {
  let reg: LegalRegister;
  beforeEach(() => { reg = new LegalRegister(); });

  it('getActive returns copies (mutation-safe)', () => {
    reg.add(makeReq({ id: 'edge-1' }));
    const active = reg.getActive();
    active[0].title = 'MUTATED';
    expect(reg.get('edge-1')!.title).toBe('Test Requirement');
  });

  it('getAll returns copies (mutation-safe)', () => {
    reg.add(makeReq({ id: 'edge-2' }));
    const all = reg.getAll();
    all[0].owner = 'MUTATED';
    expect(reg.get('edge-2')!.owner).toBe('owner@example.com');
  });

  it('can add requirement with applicableTo as empty array', () => {
    const r = reg.add(makeReq({ applicableTo: [] }));
    expect(r.applicableTo).toEqual([]);
  });

  it('can add requirement with multiple applicableTo entries', () => {
    const r = reg.add(makeReq({ applicableTo: ['HR', 'Finance', 'Operations', 'Legal'] }));
    expect(r.applicableTo).toHaveLength(4);
  });

  // 30 parameterized tests verifying getByOwner with unique owners
  Array.from({ length: 30 }, (_, i) => `owner-${i}`).forEach(owner => {
    it(`getByOwner correctly finds records for ${owner}`, () => {
      reg.add(makeReq({ owner }));
      const results = reg.getByOwner(owner);
      expect(results).toHaveLength(1);
      expect(results[0].owner).toBe(owner);
    });
  });
});

describe('ObligationTracker edge cases', () => {
  let tracker: ObligationTracker;
  beforeEach(() => { tracker = new ObligationTracker(); });

  it('getByRequirement returns copies (mutation-safe)', () => {
    tracker.add('req-safe', 'Desc', 'MUST', 'alice');
    const obls = tracker.getByRequirement('req-safe');
    obls[0].description = 'MUTATED';
    expect(tracker.getByRequirement('req-safe')[0].description).toBe('Desc');
  });

  it('getByAssignee returns copies (mutation-safe)', () => {
    tracker.add('req-1', 'Desc', 'MUST', 'alice');
    const obls = tracker.getByAssignee('alice');
    obls[0].description = 'MUTATED';
    expect(tracker.getByAssignee('alice')[0].description).toBe('Desc');
  });

  it('complete can be called with all optional params', () => {
    tracker.add('req-1', 'Desc', 'MUST', 'alice');
    const o = tracker.complete('obl-1', '2026-01-15', 'evidence.pdf', 'all good');
    expect(o.completedDate).toBe('2026-01-15');
    expect(o.evidence).toBe('evidence.pdf');
    expect(o.notes).toBe('all good');
  });

  it('add with all optional params stores them all', () => {
    const o = tracker.add('req-1', 'Desc', 'MUST', 'alice', '2026-03-01', 'ev.pdf', 'notes here');
    expect(o.dueDate).toBe('2026-03-01');
    expect(o.evidence).toBe('ev.pdf');
    expect(o.notes).toBe('notes here');
  });

  // 25 parameterized tests: add obligations with different requirementIds
  Array.from({ length: 25 }, (_, i) => `req-para-${i}`).forEach(reqId => {
    it(`add obligation with requirementId=${reqId}`, () => {
      const o = tracker.add(reqId, 'Desc', 'MUST', 'alice');
      expect(o.requirementId).toBe(reqId);
    });
  });

  // 25 parameterized tests: add obligations with different assignees
  Array.from({ length: 25 }, (_, i) => `assignee-${i}`).forEach(assignee => {
    it(`add obligation with assignedTo=${assignee}`, () => {
      const o = tracker.add('req-1', 'Desc', 'MUST', assignee);
      expect(o.assignedTo).toBe(assignee);
    });
  });
});

// ─── LegalRegister: comprehensive type/jurisdiction combinations ──────────────

describe('LegalRegister: type + jurisdiction combinations', () => {
  let reg: LegalRegister;
  beforeEach(() => { reg = new LegalRegister(); });

  REQ_TYPES.forEach(type => {
    JURISDICTIONS.forEach(j => {
      it(`type=${type} jurisdiction=${j} round-trips correctly`, () => {
        const id = `combo-${type}-${j}`;
        reg.add(makeReq({ id, type, jurisdiction: j }));
        const r = reg.get(id);
        expect(r?.type).toBe(type);
        expect(r?.jurisdiction).toBe(j);
      });
    });
  });
});

// ─── LegalRegister: update multiple fields at once ───────────────────────────

describe('LegalRegister: multi-field updates', () => {
  let reg: LegalRegister;
  beforeEach(() => { reg = new LegalRegister(); });

  Array.from({ length: 20 }, (_, i) => i).forEach(i => {
    it(`multi-field update iteration ${i}`, () => {
      const id = `mfu-${i}`;
      reg.add(makeReq({ id }));
      const type = REQ_TYPES[i % REQ_TYPES.length];
      const status = COMPLIANCE_STATUSES[i % COMPLIANCE_STATUSES.length];
      const freq = REVIEW_FREQS[i % REVIEW_FREQS.length];
      const r = reg.update(id, { type, complianceStatus: status, reviewFrequency: freq });
      expect(r.type).toBe(type);
      expect(r.complianceStatus).toBe(status);
      expect(r.reviewFrequency).toBe(freq);
    });
  });
});

// ─── ObligationTracker: SHOULD obligation full workflow ───────────────────────

describe('ObligationTracker: SHOULD obligations workflow', () => {
  let tracker: ObligationTracker;
  beforeEach(() => { tracker = new ObligationTracker(); });

  Array.from({ length: 20 }, (_, i) => i + 1).forEach(n => {
    it(`${n} SHOULD obligations: all pending then all completed`, () => {
      Array.from({ length: n }, (_, i) => i).forEach(i =>
        tracker.add(`req-${i}`, `Desc ${i}`, 'SHOULD', `user-${i}`, '2026-06-01'));
      expect(tracker.getByType('SHOULD')).toHaveLength(n);
      expect(tracker.getPending()).toHaveLength(n);
      // Complete all
      Array.from({ length: n }, (_, i) => i + 1).forEach(i =>
        tracker.complete(`obl-${i}`, '2026-05-01'));
      expect(tracker.getCompleted()).toHaveLength(n);
      expect(tracker.getPending()).toHaveLength(0);
    });
  });
});

// ─── ObligationTracker: MAY obligation full workflow ─────────────────────────

describe('ObligationTracker: MAY obligations workflow', () => {
  let tracker: ObligationTracker;
  beforeEach(() => { tracker = new ObligationTracker(); });

  Array.from({ length: 20 }, (_, i) => i + 1).forEach(n => {
    it(`${n} MAY obligations, none overdue (no dueDate)`, () => {
      Array.from({ length: n }, (_, i) => i).forEach(i =>
        tracker.add(`req-${i}`, `Desc`, 'MAY', `person-${i}`));
      expect(tracker.getByType('MAY')).toHaveLength(n);
      expect(tracker.getOverdue('2026-01-01')).toHaveLength(0);
    });
  });
});

// ─── LegalRegister: getByType then filter active ─────────────────────────────

describe('LegalRegister: getByType with active/inactive mix', () => {
  let reg: LegalRegister;
  beforeEach(() => { reg = new LegalRegister(); });

  Array.from({ length: 15 }, (_, i) => i + 1).forEach(n => {
    it(`${n} active + ${n} inactive REGULATION records — getByType returns ${n * 2}`, () => {
      Array.from({ length: n }, (_, i) => i).forEach(i => {
        reg.add(makeReq({ id: `reg-active-${n}-${i}`, type: 'REGULATION' }));
      });
      Array.from({ length: n }, (_, i) => i).forEach(i => {
        reg.add(makeReq({ id: `reg-inactive-${n}-${i}`, type: 'REGULATION' }));
        reg.deactivate(`reg-inactive-${n}-${i}`);
      });
      // getByType returns ALL (active + inactive)
      expect(reg.getByType('REGULATION')).toHaveLength(n * 2);
      // getActive filtered by type
      expect(reg.getActive().filter(r => r.type === 'REGULATION')).toHaveLength(n);
    });
  });
});

// ─── LegalRegister: sequential operations stress test ─────────────────────────

describe('LegalRegister: sequential stress tests', () => {
  let reg: LegalRegister;
  beforeEach(() => { reg = new LegalRegister(); });

  Array.from({ length: 15 }, (_, i) => i + 2).forEach(n => {
    it(`stress ${n}: add ${n}, update half, deactivate quarter`, () => {
      const ids = Array.from({ length: n }, (_, i) => {
        const id = `stress-${n}-${i}`;
        reg.add(makeReq({ id }));
        return id;
      });
      // Update first half
      const half = Math.floor(n / 2);
      ids.slice(0, half).forEach(id => reg.update(id, { title: 'Updated' }));
      // Deactivate first quarter
      const quarter = Math.floor(n / 4);
      ids.slice(0, quarter).forEach(id => reg.deactivate(id));

      expect(reg.getCount()).toBe(n);
      expect(reg.getActive()).toHaveLength(n - quarter);
      ids.slice(0, half).forEach(id => {
        expect(reg.get(id)!.title).toBe('Updated');
      });
    });
  });
});

// ─── ObligationTracker: sequential stress test ───────────────────────────────

describe('ObligationTracker: sequential stress tests', () => {
  let tracker: ObligationTracker;
  beforeEach(() => { tracker = new ObligationTracker(); });

  Array.from({ length: 15 }, (_, i) => i + 2).forEach(n => {
    it(`stress ${n}: add ${n}, complete half, check pending/overdue`, () => {
      // Add n obligations, half overdue
      const half = Math.floor(n / 2);
      Array.from({ length: half }, (_, i) => i).forEach(i =>
        tracker.add(`req-${i}`, 'Desc', 'MUST', 'user', '2025-06-01'));
      Array.from({ length: n - half }, (_, i) => i).forEach(i =>
        tracker.add(`req-x-${i}`, 'Desc', 'MUST', 'user', '2030-01-01'));

      expect(tracker.getOverdue('2026-01-01')).toHaveLength(half);
      expect(tracker.getPending()).toHaveLength(n);

      // Complete half of the overdue
      const completeCount = Math.floor(half / 2);
      Array.from({ length: completeCount }, (_, i) => i + 1).forEach(i =>
        tracker.complete(`obl-${i}`, '2026-01-01'));

      expect(tracker.getCompleted()).toHaveLength(completeCount);
      expect(tracker.getPending()).toHaveLength(n - completeCount);
    });
  });
});

// ─── LegalRegister: setCompliance then getNonCompliant consistency ─────────────

describe('LegalRegister: setCompliance and getNonCompliant consistency', () => {
  let reg: LegalRegister;
  beforeEach(() => { reg = new LegalRegister(); });

  Array.from({ length: 25 }, (_, i) => i).forEach(i => {
    it(`iteration ${i}: set to PARTIAL then to COMPLIANT removes from nonCompliant`, () => {
      const id = `sc-nc-${i}`;
      reg.add(makeReq({ id, complianceStatus: 'NOT_ASSESSED' }));
      reg.setCompliance(id, 'PARTIAL');
      expect(reg.getNonCompliant().map(r => r.id)).toContain(id);
      reg.setCompliance(id, 'COMPLIANT');
      expect(reg.getNonCompliant().map(r => r.id)).not.toContain(id);
    });
  });

  Array.from({ length: 25 }, (_, i) => i).forEach(i => {
    it(`iteration ${i}: set to NON_COMPLIANT then NOT_APPLICABLE removes from nonCompliant`, () => {
      const id = `sc-nc2-${i}`;
      reg.add(makeReq({ id, complianceStatus: 'COMPLIANT' }));
      reg.setCompliance(id, 'NON_COMPLIANT');
      expect(reg.getNonCompliant().map(r => r.id)).toContain(id);
      reg.setCompliance(id, 'NOT_APPLICABLE');
      expect(reg.getNonCompliant().map(r => r.id)).not.toContain(id);
    });
  });
});

// ─── ObligationTracker: mixed assignees and types ─────────────────────────────

describe('ObligationTracker: mixed assignees and type filtering', () => {
  let tracker: ObligationTracker;
  beforeEach(() => { tracker = new ObligationTracker(); });

  Array.from({ length: 25 }, (_, i) => i).forEach(i => {
    it(`mixed filter iteration ${i}: getByAssignee and getByType independent`, () => {
      const assignee = `person-${i}`;
      const type = OBL_TYPES[i % 3];
      tracker.add(`req-${i}`, 'Desc', type, assignee, '2026-06-01');
      tracker.add(`req-${i}-other`, 'Desc', OBL_TYPES[(i + 1) % 3], `other-${i}`);
      expect(tracker.getByAssignee(assignee)).toHaveLength(1);
      expect(tracker.getByAssignee(assignee)[0].obligationType).toBe(type);
    });
  });
});
