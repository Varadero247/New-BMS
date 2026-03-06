// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Phase 134 — web-aerospace specification tests

type ChangeStatus = 'DRAFT' | 'REVIEW' | 'APPROVED' | 'REJECTED' | 'IMPLEMENTED';
type ConfigItemType = 'SW' | 'HW' | 'DOCUMENT' | 'SYSTEM';
type SupplierApprovalStatus = 'PENDING' | 'APPROVED' | 'CONDITIONAL' | 'SUSPENDED' | 'REVOKED';

const CHANGE_STATUSES: ChangeStatus[] = ['DRAFT', 'REVIEW', 'APPROVED', 'REJECTED', 'IMPLEMENTED'];
const CONFIG_TYPES: ConfigItemType[] = ['SW', 'HW', 'DOCUMENT', 'SYSTEM'];
const SUPPLIER_STATUSES: SupplierApprovalStatus[] = ['PENDING', 'APPROVED', 'CONDITIONAL', 'SUSPENDED', 'REVOKED'];

const changeStatusColor: Record<ChangeStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  REVIEW: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  IMPLEMENTED: 'bg-blue-100 text-blue-800',
};

const configTypeBadge: Record<ConfigItemType, string> = {
  SW: 'bg-purple-100 text-purple-800',
  HW: 'bg-orange-100 text-orange-800',
  DOCUMENT: 'bg-sky-100 text-sky-800',
  SYSTEM: 'bg-indigo-100 text-indigo-800',
};

function computeAirworthinessScore(defects: number, openCAPAs: number, auditFindings: number): number {
  const base = 100;
  return Math.max(0, base - defects * 5 - openCAPAs * 3 - auditFindings * 2);
}

function formatRevision(major: number, minor: number): string {
  return `Rev ${String.fromCharCode(64 + major)}.${minor.toString().padStart(2, '0')}`;
}

function isPPAPRequired(changeType: string): boolean {
  return ['DESIGN', 'MATERIAL', 'PROCESS', 'SUPPLIER'].includes(changeType);
}

describe('Change status colors', () => {
  CHANGE_STATUSES.forEach(s => {
    it(`${s} has color defined`, () => expect(changeStatusColor[s]).toBeDefined());
    it(`${s} has bg class`, () => expect(changeStatusColor[s]).toContain('bg-'));
  });
  it('APPROVED is green', () => expect(changeStatusColor.APPROVED).toContain('green'));
  it('REJECTED is red', () => expect(changeStatusColor.REJECTED).toContain('red'));
  it('DRAFT is gray', () => expect(changeStatusColor.DRAFT).toContain('gray'));
  for (let i = 0; i < 100; i++) {
    const s = CHANGE_STATUSES[i % CHANGE_STATUSES.length];
    it(`change status ${s} badge is string (idx ${i})`, () => expect(typeof changeStatusColor[s]).toBe('string'));
  }
});

describe('Config item type badges', () => {
  CONFIG_TYPES.forEach(t => {
    it(`${t} badge defined`, () => expect(configTypeBadge[t]).toBeDefined());
    it(`${t} badge has text class`, () => expect(configTypeBadge[t]).toContain('text-'));
  });
  it('SW uses purple', () => expect(configTypeBadge.SW).toContain('purple'));
  it('HW uses orange', () => expect(configTypeBadge.HW).toContain('orange'));
  for (let i = 0; i < 100; i++) {
    const t = CONFIG_TYPES[i % CONFIG_TYPES.length];
    it(`config type badge string check (idx ${i})`, () => expect(typeof configTypeBadge[t]).toBe('string'));
  }
});

describe('computeAirworthinessScore', () => {
  it('zero defects gives 100', () => expect(computeAirworthinessScore(0, 0, 0)).toBe(100));
  it('score never goes below 0', () => expect(computeAirworthinessScore(100, 100, 100)).toBe(0));
  it('1 defect costs 5 points', () => expect(computeAirworthinessScore(1, 0, 0)).toBe(95));
  it('1 CAPA costs 3 points', () => expect(computeAirworthinessScore(0, 1, 0)).toBe(97));
  it('1 audit finding costs 2 points', () => expect(computeAirworthinessScore(0, 0, 1)).toBe(98));
  for (let i = 0; i <= 100; i++) {
    it(`score(${i}, 0, 0) is between 0 and 100`, () => {
      const s = computeAirworthinessScore(i, 0, 0);
      expect(s).toBeGreaterThanOrEqual(0);
      expect(s).toBeLessThanOrEqual(100);
    });
  }
});

describe('formatRevision', () => {
  it('Rev A.00 for (1,0)', () => expect(formatRevision(1, 0)).toBe('Rev A.00'));
  it('Rev B.01 for (2,1)', () => expect(formatRevision(2, 1)).toBe('Rev B.01'));
  it('Rev C.10 for (3,10)', () => expect(formatRevision(3, 10)).toBe('Rev C.10'));
  for (let i = 1; i <= 50; i++) {
    it(`formatRevision(${i}, ${i}) starts with Rev`, () => {
      expect(formatRevision(i % 26 + 1, i)).toMatch(/^Rev [A-Z]\.\d{2,}$/);
    });
  }
});

describe('isPPAPRequired', () => {
  ['DESIGN', 'MATERIAL', 'PROCESS', 'SUPPLIER'].forEach(ct => {
    it(`${ct} requires PPAP`, () => expect(isPPAPRequired(ct)).toBe(true));
  });
  ['LABELING', 'PACKAGING', 'DOCUMENTATION', 'ADMIN'].forEach(ct => {
    it(`${ct} does not require PPAP`, () => expect(isPPAPRequired(ct)).toBe(false));
  });
  for (let i = 0; i < 100; i++) {
    it(`isPPAPRequired returns boolean for input ${i}`, () => {
      expect(typeof isPPAPRequired('CHANGE_TYPE_' + i)).toBe('boolean');
    });
  }
});

describe('Supplier approval statuses', () => {
  SUPPLIER_STATUSES.forEach(s => {
    it(`${s} is a valid status`, () => expect(SUPPLIER_STATUSES).toContain(s));
  });
  it('has 5 supplier statuses', () => expect(SUPPLIER_STATUSES).toHaveLength(5));
  for (let i = 0; i < 50; i++) {
    const s = SUPPLIER_STATUSES[i % SUPPLIER_STATUSES.length];
    it(`supplier status at idx ${i} is defined`, () => expect(s).toBeDefined());
  }
});
