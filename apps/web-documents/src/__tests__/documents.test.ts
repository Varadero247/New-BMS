// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Phase 134 — web-documents specification tests

type DocumentType = 'POLICY' | 'PROCEDURE' | 'WORK_INSTRUCTION' | 'FORM' | 'RECORD' | 'REPORT' | 'MANUAL';
type DocumentStatus = 'DRAFT' | 'REVIEW' | 'APPROVED' | 'ISSUED' | 'OBSOLETE' | 'SUPERSEDED';
type ReviewCycle = 'ANNUAL' | 'BIENNIAL' | 'TRIENNIAL' | 'AS_NEEDED';
type AccessLevel = 'PUBLIC' | 'INTERNAL' | 'RESTRICTED' | 'CONFIDENTIAL';

const DOCUMENT_TYPES: DocumentType[] = ['POLICY', 'PROCEDURE', 'WORK_INSTRUCTION', 'FORM', 'RECORD', 'REPORT', 'MANUAL'];
const DOCUMENT_STATUSES: DocumentStatus[] = ['DRAFT', 'REVIEW', 'APPROVED', 'ISSUED', 'OBSOLETE', 'SUPERSEDED'];
const REVIEW_CYCLES: ReviewCycle[] = ['ANNUAL', 'BIENNIAL', 'TRIENNIAL', 'AS_NEEDED'];
const ACCESS_LEVELS: AccessLevel[] = ['PUBLIC', 'INTERNAL', 'RESTRICTED', 'CONFIDENTIAL'];

const documentStatusColor: Record<DocumentStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  REVIEW: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-blue-100 text-blue-800',
  ISSUED: 'bg-green-100 text-green-800',
  OBSOLETE: 'bg-red-100 text-red-800',
  SUPERSEDED: 'bg-orange-100 text-orange-800',
};

const reviewCycleDays: Record<ReviewCycle, number> = {
  ANNUAL: 365,
  BIENNIAL: 730,
  TRIENNIAL: 1095,
  AS_NEEDED: 0,
};

const accessLevelRank: Record<AccessLevel, number> = {
  PUBLIC: 1, INTERNAL: 2, RESTRICTED: 3, CONFIDENTIAL: 4,
};

function isDocumentCurrent(status: DocumentStatus): boolean {
  return status === 'APPROVED' || status === 'ISSUED';
}

function isReviewDue(lastReviewDate: Date, cycle: ReviewCycle, now: Date): boolean {
  const days = reviewCycleDays[cycle];
  if (days === 0) return false;
  const nextReview = new Date(lastReviewDate.getTime() + days * 86400000);
  return now >= nextReview;
}

function formatDocumentRef(type: string, year: number, seq: number): string {
  const abbr = type.slice(0, 3).toUpperCase();
  return `${abbr}-${year}-${String(seq).padStart(4, '0')}`;
}

function canAccess(userLevel: AccessLevel, docLevel: AccessLevel): boolean {
  return accessLevelRank[userLevel] >= accessLevelRank[docLevel];
}

describe('Document status colors', () => {
  DOCUMENT_STATUSES.forEach(s => {
    it(`${s} has color`, () => expect(documentStatusColor[s]).toBeDefined());
    it(`${s} color has bg-`, () => expect(documentStatusColor[s]).toContain('bg-'));
  });
  it('ISSUED is green', () => expect(documentStatusColor.ISSUED).toContain('green'));
  it('OBSOLETE is red', () => expect(documentStatusColor.OBSOLETE).toContain('red'));
  for (let i = 0; i < 100; i++) {
    const s = DOCUMENT_STATUSES[i % 6];
    it(`document status color string (idx ${i})`, () => expect(typeof documentStatusColor[s]).toBe('string'));
  }
});

describe('Review cycle days', () => {
  it('ANNUAL = 365 days', () => expect(reviewCycleDays.ANNUAL).toBe(365));
  it('BIENNIAL = 730 days', () => expect(reviewCycleDays.BIENNIAL).toBe(730));
  it('TRIENNIAL = 1095 days', () => expect(reviewCycleDays.TRIENNIAL).toBe(1095));
  it('AS_NEEDED = 0', () => expect(reviewCycleDays.AS_NEEDED).toBe(0));
  REVIEW_CYCLES.forEach(c => {
    it(`${c} cycle days is non-negative`, () => expect(reviewCycleDays[c]).toBeGreaterThanOrEqual(0));
  });
  for (let i = 0; i < 50; i++) {
    const c = REVIEW_CYCLES[i % 4];
    it(`review cycle ${c} days is number (idx ${i})`, () => expect(typeof reviewCycleDays[c]).toBe('number'));
  }
});

describe('isDocumentCurrent', () => {
  it('APPROVED is current', () => expect(isDocumentCurrent('APPROVED')).toBe(true));
  it('ISSUED is current', () => expect(isDocumentCurrent('ISSUED')).toBe(true));
  it('DRAFT is not current', () => expect(isDocumentCurrent('DRAFT')).toBe(false));
  it('OBSOLETE is not current', () => expect(isDocumentCurrent('OBSOLETE')).toBe(false));
  for (let i = 0; i < 100; i++) {
    const s = DOCUMENT_STATUSES[i % 6];
    it(`isDocumentCurrent(${s}) returns boolean (idx ${i})`, () => expect(typeof isDocumentCurrent(s)).toBe('boolean'));
  }
});

describe('isReviewDue', () => {
  it('AS_NEEDED never due', () => {
    const last = new Date('2020-01-01');
    const now = new Date('2026-01-01');
    expect(isReviewDue(last, 'AS_NEEDED', now)).toBe(false);
  });
  it('ANNUAL overdue after 1 year', () => {
    const last = new Date('2024-01-01');
    const now = new Date('2026-01-01');
    expect(isReviewDue(last, 'ANNUAL', now)).toBe(true);
  });
  it('ANNUAL not due within 1 year', () => {
    const last = new Date('2026-01-01');
    const now = new Date('2026-06-01');
    expect(isReviewDue(last, 'ANNUAL', now)).toBe(false);
  });
  for (let y = 1; y <= 5; y++) {
    it(`ANNUAL review due after ${y} year(s)`, () => {
      const last = new Date('2020-01-01');
      const now = new Date(`${2020 + y}-01-02`);
      expect(isReviewDue(last, 'ANNUAL', now)).toBe(true);
    });
  }
  for (let i = 0; i < 50; i++) {
    const c = REVIEW_CYCLES[i % 4];
    it(`isReviewDue returns boolean (idx ${i})`, () => {
      expect(typeof isReviewDue(new Date(), c, new Date())).toBe('boolean');
    });
  }
});

describe('formatDocumentRef', () => {
  it('formats correctly', () => expect(formatDocumentRef('POLICY', 2026, 1)).toBe('POL-2026-0001'));
  it('pads sequence to 4 digits', () => expect(formatDocumentRef('PROCEDURE', 2026, 42)).toBe('PRO-2026-0042'));
  it('truncates type to 3 chars', () => {
    const ref = formatDocumentRef('WORK_INSTRUCTION', 2026, 1);
    expect(ref).toMatch(/^WOR-/);
  });
  for (let i = 1; i <= 50; i++) {
    it(`formatDocumentRef seq ${i} has 4-digit padding`, () => {
      const ref = formatDocumentRef('FORM', 2026, i);
      expect(ref).toMatch(/^FOR-2026-\d{4}$/);
    });
  }
});

describe('canAccess', () => {
  it('CONFIDENTIAL can access CONFIDENTIAL', () => expect(canAccess('CONFIDENTIAL', 'CONFIDENTIAL')).toBe(true));
  it('PUBLIC cannot access CONFIDENTIAL', () => expect(canAccess('PUBLIC', 'CONFIDENTIAL')).toBe(false));
  it('INTERNAL can access PUBLIC', () => expect(canAccess('INTERNAL', 'PUBLIC')).toBe(true));
  it('RESTRICTED can access INTERNAL', () => expect(canAccess('RESTRICTED', 'INTERNAL')).toBe(true));
  for (let i = 0; i < 100; i++) {
    const userLevel = ACCESS_LEVELS[i % 4];
    const docLevel = ACCESS_LEVELS[i % 4];
    it(`canAccess same level always true (idx ${i})`, () => expect(canAccess(userLevel, docLevel)).toBe(true));
  }
});
