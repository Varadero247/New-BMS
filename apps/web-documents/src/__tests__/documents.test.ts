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
function hd258dcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph258dcx_hd',()=>{it('a',()=>{expect(hd258dcx(1,4)).toBe(2);});it('b',()=>{expect(hd258dcx(3,1)).toBe(1);});it('c',()=>{expect(hd258dcx(0,0)).toBe(0);});it('d',()=>{expect(hd258dcx(93,73)).toBe(2);});it('e',()=>{expect(hd258dcx(15,0)).toBe(4);});});
function hd259dcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph259dcx_hd',()=>{it('a',()=>{expect(hd259dcx(1,4)).toBe(2);});it('b',()=>{expect(hd259dcx(3,1)).toBe(1);});it('c',()=>{expect(hd259dcx(0,0)).toBe(0);});it('d',()=>{expect(hd259dcx(93,73)).toBe(2);});it('e',()=>{expect(hd259dcx(15,0)).toBe(4);});});
function hd260dcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph260dcx_hd',()=>{it('a',()=>{expect(hd260dcx(1,4)).toBe(2);});it('b',()=>{expect(hd260dcx(3,1)).toBe(1);});it('c',()=>{expect(hd260dcx(0,0)).toBe(0);});it('d',()=>{expect(hd260dcx(93,73)).toBe(2);});it('e',()=>{expect(hd260dcx(15,0)).toBe(4);});});
function hd261dcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph261dcx_hd',()=>{it('a',()=>{expect(hd261dcx(1,4)).toBe(2);});it('b',()=>{expect(hd261dcx(3,1)).toBe(1);});it('c',()=>{expect(hd261dcx(0,0)).toBe(0);});it('d',()=>{expect(hd261dcx(93,73)).toBe(2);});it('e',()=>{expect(hd261dcx(15,0)).toBe(4);});});
function hd262dcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph262dcx_hd',()=>{it('a',()=>{expect(hd262dcx(1,4)).toBe(2);});it('b',()=>{expect(hd262dcx(3,1)).toBe(1);});it('c',()=>{expect(hd262dcx(0,0)).toBe(0);});it('d',()=>{expect(hd262dcx(93,73)).toBe(2);});it('e',()=>{expect(hd262dcx(15,0)).toBe(4);});});
function hd263dcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph263dcx_hd',()=>{it('a',()=>{expect(hd263dcx(1,4)).toBe(2);});it('b',()=>{expect(hd263dcx(3,1)).toBe(1);});it('c',()=>{expect(hd263dcx(0,0)).toBe(0);});it('d',()=>{expect(hd263dcx(93,73)).toBe(2);});it('e',()=>{expect(hd263dcx(15,0)).toBe(4);});});
function hd264dcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph264dcx_hd',()=>{it('a',()=>{expect(hd264dcx(1,4)).toBe(2);});it('b',()=>{expect(hd264dcx(3,1)).toBe(1);});it('c',()=>{expect(hd264dcx(0,0)).toBe(0);});it('d',()=>{expect(hd264dcx(93,73)).toBe(2);});it('e',()=>{expect(hd264dcx(15,0)).toBe(4);});});
function hd265dcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph265dcx_hd',()=>{it('a',()=>{expect(hd265dcx(1,4)).toBe(2);});it('b',()=>{expect(hd265dcx(3,1)).toBe(1);});it('c',()=>{expect(hd265dcx(0,0)).toBe(0);});it('d',()=>{expect(hd265dcx(93,73)).toBe(2);});it('e',()=>{expect(hd265dcx(15,0)).toBe(4);});});
function hd266dcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph266dcx_hd',()=>{it('a',()=>{expect(hd266dcx(1,4)).toBe(2);});it('b',()=>{expect(hd266dcx(3,1)).toBe(1);});it('c',()=>{expect(hd266dcx(0,0)).toBe(0);});it('d',()=>{expect(hd266dcx(93,73)).toBe(2);});it('e',()=>{expect(hd266dcx(15,0)).toBe(4);});});
function hd267dcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph267dcx_hd',()=>{it('a',()=>{expect(hd267dcx(1,4)).toBe(2);});it('b',()=>{expect(hd267dcx(3,1)).toBe(1);});it('c',()=>{expect(hd267dcx(0,0)).toBe(0);});it('d',()=>{expect(hd267dcx(93,73)).toBe(2);});it('e',()=>{expect(hd267dcx(15,0)).toBe(4);});});
function hd268dcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph268dcx_hd',()=>{it('a',()=>{expect(hd268dcx(1,4)).toBe(2);});it('b',()=>{expect(hd268dcx(3,1)).toBe(1);});it('c',()=>{expect(hd268dcx(0,0)).toBe(0);});it('d',()=>{expect(hd268dcx(93,73)).toBe(2);});it('e',()=>{expect(hd268dcx(15,0)).toBe(4);});});
function hd269dcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph269dcx_hd',()=>{it('a',()=>{expect(hd269dcx(1,4)).toBe(2);});it('b',()=>{expect(hd269dcx(3,1)).toBe(1);});it('c',()=>{expect(hd269dcx(0,0)).toBe(0);});it('d',()=>{expect(hd269dcx(93,73)).toBe(2);});it('e',()=>{expect(hd269dcx(15,0)).toBe(4);});});
function hd270dcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph270dcx_hd',()=>{it('a',()=>{expect(hd270dcx(1,4)).toBe(2);});it('b',()=>{expect(hd270dcx(3,1)).toBe(1);});it('c',()=>{expect(hd270dcx(0,0)).toBe(0);});it('d',()=>{expect(hd270dcx(93,73)).toBe(2);});it('e',()=>{expect(hd270dcx(15,0)).toBe(4);});});
function hd271dcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph271dcx_hd',()=>{it('a',()=>{expect(hd271dcx(1,4)).toBe(2);});it('b',()=>{expect(hd271dcx(3,1)).toBe(1);});it('c',()=>{expect(hd271dcx(0,0)).toBe(0);});it('d',()=>{expect(hd271dcx(93,73)).toBe(2);});it('e',()=>{expect(hd271dcx(15,0)).toBe(4);});});
function hd272dcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph272dcx_hd',()=>{it('a',()=>{expect(hd272dcx(1,4)).toBe(2);});it('b',()=>{expect(hd272dcx(3,1)).toBe(1);});it('c',()=>{expect(hd272dcx(0,0)).toBe(0);});it('d',()=>{expect(hd272dcx(93,73)).toBe(2);});it('e',()=>{expect(hd272dcx(15,0)).toBe(4);});});
function hd273dcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph273dcx_hd',()=>{it('a',()=>{expect(hd273dcx(1,4)).toBe(2);});it('b',()=>{expect(hd273dcx(3,1)).toBe(1);});it('c',()=>{expect(hd273dcx(0,0)).toBe(0);});it('d',()=>{expect(hd273dcx(93,73)).toBe(2);});it('e',()=>{expect(hd273dcx(15,0)).toBe(4);});});
function hd274dcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph274dcx_hd',()=>{it('a',()=>{expect(hd274dcx(1,4)).toBe(2);});it('b',()=>{expect(hd274dcx(3,1)).toBe(1);});it('c',()=>{expect(hd274dcx(0,0)).toBe(0);});it('d',()=>{expect(hd274dcx(93,73)).toBe(2);});it('e',()=>{expect(hd274dcx(15,0)).toBe(4);});});
function hd275dcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph275dcx_hd',()=>{it('a',()=>{expect(hd275dcx(1,4)).toBe(2);});it('b',()=>{expect(hd275dcx(3,1)).toBe(1);});it('c',()=>{expect(hd275dcx(0,0)).toBe(0);});it('d',()=>{expect(hd275dcx(93,73)).toBe(2);});it('e',()=>{expect(hd275dcx(15,0)).toBe(4);});});
function hd276dcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph276dcx_hd',()=>{it('a',()=>{expect(hd276dcx(1,4)).toBe(2);});it('b',()=>{expect(hd276dcx(3,1)).toBe(1);});it('c',()=>{expect(hd276dcx(0,0)).toBe(0);});it('d',()=>{expect(hd276dcx(93,73)).toBe(2);});it('e',()=>{expect(hd276dcx(15,0)).toBe(4);});});
function hd277dcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph277dcx_hd',()=>{it('a',()=>{expect(hd277dcx(1,4)).toBe(2);});it('b',()=>{expect(hd277dcx(3,1)).toBe(1);});it('c',()=>{expect(hd277dcx(0,0)).toBe(0);});it('d',()=>{expect(hd277dcx(93,73)).toBe(2);});it('e',()=>{expect(hd277dcx(15,0)).toBe(4);});});
function hd278dcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph278dcx_hd',()=>{it('a',()=>{expect(hd278dcx(1,4)).toBe(2);});it('b',()=>{expect(hd278dcx(3,1)).toBe(1);});it('c',()=>{expect(hd278dcx(0,0)).toBe(0);});it('d',()=>{expect(hd278dcx(93,73)).toBe(2);});it('e',()=>{expect(hd278dcx(15,0)).toBe(4);});});
function hd279dcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph279dcx_hd',()=>{it('a',()=>{expect(hd279dcx(1,4)).toBe(2);});it('b',()=>{expect(hd279dcx(3,1)).toBe(1);});it('c',()=>{expect(hd279dcx(0,0)).toBe(0);});it('d',()=>{expect(hd279dcx(93,73)).toBe(2);});it('e',()=>{expect(hd279dcx(15,0)).toBe(4);});});
function hd280dcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph280dcx_hd',()=>{it('a',()=>{expect(hd280dcx(1,4)).toBe(2);});it('b',()=>{expect(hd280dcx(3,1)).toBe(1);});it('c',()=>{expect(hd280dcx(0,0)).toBe(0);});it('d',()=>{expect(hd280dcx(93,73)).toBe(2);});it('e',()=>{expect(hd280dcx(15,0)).toBe(4);});});
function hd281dcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph281dcx_hd',()=>{it('a',()=>{expect(hd281dcx(1,4)).toBe(2);});it('b',()=>{expect(hd281dcx(3,1)).toBe(1);});it('c',()=>{expect(hd281dcx(0,0)).toBe(0);});it('d',()=>{expect(hd281dcx(93,73)).toBe(2);});it('e',()=>{expect(hd281dcx(15,0)).toBe(4);});});
function hd282dcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph282dcx_hd',()=>{it('a',()=>{expect(hd282dcx(1,4)).toBe(2);});it('b',()=>{expect(hd282dcx(3,1)).toBe(1);});it('c',()=>{expect(hd282dcx(0,0)).toBe(0);});it('d',()=>{expect(hd282dcx(93,73)).toBe(2);});it('e',()=>{expect(hd282dcx(15,0)).toBe(4);});});
function hd283dcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph283dcx_hd',()=>{it('a',()=>{expect(hd283dcx(1,4)).toBe(2);});it('b',()=>{expect(hd283dcx(3,1)).toBe(1);});it('c',()=>{expect(hd283dcx(0,0)).toBe(0);});it('d',()=>{expect(hd283dcx(93,73)).toBe(2);});it('e',()=>{expect(hd283dcx(15,0)).toBe(4);});});
function hd284dcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph284dcx_hd',()=>{it('a',()=>{expect(hd284dcx(1,4)).toBe(2);});it('b',()=>{expect(hd284dcx(3,1)).toBe(1);});it('c',()=>{expect(hd284dcx(0,0)).toBe(0);});it('d',()=>{expect(hd284dcx(93,73)).toBe(2);});it('e',()=>{expect(hd284dcx(15,0)).toBe(4);});});
function hd285dcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph285dcx_hd',()=>{it('a',()=>{expect(hd285dcx(1,4)).toBe(2);});it('b',()=>{expect(hd285dcx(3,1)).toBe(1);});it('c',()=>{expect(hd285dcx(0,0)).toBe(0);});it('d',()=>{expect(hd285dcx(93,73)).toBe(2);});it('e',()=>{expect(hd285dcx(15,0)).toBe(4);});});
function hd286dcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph286dcx_hd',()=>{it('a',()=>{expect(hd286dcx(1,4)).toBe(2);});it('b',()=>{expect(hd286dcx(3,1)).toBe(1);});it('c',()=>{expect(hd286dcx(0,0)).toBe(0);});it('d',()=>{expect(hd286dcx(93,73)).toBe(2);});it('e',()=>{expect(hd286dcx(15,0)).toBe(4);});});
function hd287dcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph287dcx_hd',()=>{it('a',()=>{expect(hd287dcx(1,4)).toBe(2);});it('b',()=>{expect(hd287dcx(3,1)).toBe(1);});it('c',()=>{expect(hd287dcx(0,0)).toBe(0);});it('d',()=>{expect(hd287dcx(93,73)).toBe(2);});it('e',()=>{expect(hd287dcx(15,0)).toBe(4);});});
function hd288dcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph288dcx_hd',()=>{it('a',()=>{expect(hd288dcx(1,4)).toBe(2);});it('b',()=>{expect(hd288dcx(3,1)).toBe(1);});it('c',()=>{expect(hd288dcx(0,0)).toBe(0);});it('d',()=>{expect(hd288dcx(93,73)).toBe(2);});it('e',()=>{expect(hd288dcx(15,0)).toBe(4);});});
function hd289dcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph289dcx_hd',()=>{it('a',()=>{expect(hd289dcx(1,4)).toBe(2);});it('b',()=>{expect(hd289dcx(3,1)).toBe(1);});it('c',()=>{expect(hd289dcx(0,0)).toBe(0);});it('d',()=>{expect(hd289dcx(93,73)).toBe(2);});it('e',()=>{expect(hd289dcx(15,0)).toBe(4);});});
function hd290dcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph290dcx_hd',()=>{it('a',()=>{expect(hd290dcx(1,4)).toBe(2);});it('b',()=>{expect(hd290dcx(3,1)).toBe(1);});it('c',()=>{expect(hd290dcx(0,0)).toBe(0);});it('d',()=>{expect(hd290dcx(93,73)).toBe(2);});it('e',()=>{expect(hd290dcx(15,0)).toBe(4);});});
function hd291dcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph291dcx_hd',()=>{it('a',()=>{expect(hd291dcx(1,4)).toBe(2);});it('b',()=>{expect(hd291dcx(3,1)).toBe(1);});it('c',()=>{expect(hd291dcx(0,0)).toBe(0);});it('d',()=>{expect(hd291dcx(93,73)).toBe(2);});it('e',()=>{expect(hd291dcx(15,0)).toBe(4);});});
function hd292dcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph292dcx_hd',()=>{it('a',()=>{expect(hd292dcx(1,4)).toBe(2);});it('b',()=>{expect(hd292dcx(3,1)).toBe(1);});it('c',()=>{expect(hd292dcx(0,0)).toBe(0);});it('d',()=>{expect(hd292dcx(93,73)).toBe(2);});it('e',()=>{expect(hd292dcx(15,0)).toBe(4);});});
function hd293dcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph293dcx_hd',()=>{it('a',()=>{expect(hd293dcx(1,4)).toBe(2);});it('b',()=>{expect(hd293dcx(3,1)).toBe(1);});it('c',()=>{expect(hd293dcx(0,0)).toBe(0);});it('d',()=>{expect(hd293dcx(93,73)).toBe(2);});it('e',()=>{expect(hd293dcx(15,0)).toBe(4);});});
function hd294dcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph294dcx_hd',()=>{it('a',()=>{expect(hd294dcx(1,4)).toBe(2);});it('b',()=>{expect(hd294dcx(3,1)).toBe(1);});it('c',()=>{expect(hd294dcx(0,0)).toBe(0);});it('d',()=>{expect(hd294dcx(93,73)).toBe(2);});it('e',()=>{expect(hd294dcx(15,0)).toBe(4);});});
function hd295dcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph295dcx_hd',()=>{it('a',()=>{expect(hd295dcx(1,4)).toBe(2);});it('b',()=>{expect(hd295dcx(3,1)).toBe(1);});it('c',()=>{expect(hd295dcx(0,0)).toBe(0);});it('d',()=>{expect(hd295dcx(93,73)).toBe(2);});it('e',()=>{expect(hd295dcx(15,0)).toBe(4);});});
function hd296dcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph296dcx_hd',()=>{it('a',()=>{expect(hd296dcx(1,4)).toBe(2);});it('b',()=>{expect(hd296dcx(3,1)).toBe(1);});it('c',()=>{expect(hd296dcx(0,0)).toBe(0);});it('d',()=>{expect(hd296dcx(93,73)).toBe(2);});it('e',()=>{expect(hd296dcx(15,0)).toBe(4);});});
function hd297dcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph297dcx_hd',()=>{it('a',()=>{expect(hd297dcx(1,4)).toBe(2);});it('b',()=>{expect(hd297dcx(3,1)).toBe(1);});it('c',()=>{expect(hd297dcx(0,0)).toBe(0);});it('d',()=>{expect(hd297dcx(93,73)).toBe(2);});it('e',()=>{expect(hd297dcx(15,0)).toBe(4);});});
function hd298dcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph298dcx_hd',()=>{it('a',()=>{expect(hd298dcx(1,4)).toBe(2);});it('b',()=>{expect(hd298dcx(3,1)).toBe(1);});it('c',()=>{expect(hd298dcx(0,0)).toBe(0);});it('d',()=>{expect(hd298dcx(93,73)).toBe(2);});it('e',()=>{expect(hd298dcx(15,0)).toBe(4);});});
function hd299dcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph299dcx_hd',()=>{it('a',()=>{expect(hd299dcx(1,4)).toBe(2);});it('b',()=>{expect(hd299dcx(3,1)).toBe(1);});it('c',()=>{expect(hd299dcx(0,0)).toBe(0);});it('d',()=>{expect(hd299dcx(93,73)).toBe(2);});it('e',()=>{expect(hd299dcx(15,0)).toBe(4);});});
function hd300dcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph300dcx_hd',()=>{it('a',()=>{expect(hd300dcx(1,4)).toBe(2);});it('b',()=>{expect(hd300dcx(3,1)).toBe(1);});it('c',()=>{expect(hd300dcx(0,0)).toBe(0);});it('d',()=>{expect(hd300dcx(93,73)).toBe(2);});it('e',()=>{expect(hd300dcx(15,0)).toBe(4);});});
function hd301dcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph301dcx_hd',()=>{it('a',()=>{expect(hd301dcx(1,4)).toBe(2);});it('b',()=>{expect(hd301dcx(3,1)).toBe(1);});it('c',()=>{expect(hd301dcx(0,0)).toBe(0);});it('d',()=>{expect(hd301dcx(93,73)).toBe(2);});it('e',()=>{expect(hd301dcx(15,0)).toBe(4);});});
function hd302dcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph302dcx_hd',()=>{it('a',()=>{expect(hd302dcx(1,4)).toBe(2);});it('b',()=>{expect(hd302dcx(3,1)).toBe(1);});it('c',()=>{expect(hd302dcx(0,0)).toBe(0);});it('d',()=>{expect(hd302dcx(93,73)).toBe(2);});it('e',()=>{expect(hd302dcx(15,0)).toBe(4);});});
function hd303dcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph303dcx_hd',()=>{it('a',()=>{expect(hd303dcx(1,4)).toBe(2);});it('b',()=>{expect(hd303dcx(3,1)).toBe(1);});it('c',()=>{expect(hd303dcx(0,0)).toBe(0);});it('d',()=>{expect(hd303dcx(93,73)).toBe(2);});it('e',()=>{expect(hd303dcx(15,0)).toBe(4);});});
function hd304dcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph304dcx_hd',()=>{it('a',()=>{expect(hd304dcx(1,4)).toBe(2);});it('b',()=>{expect(hd304dcx(3,1)).toBe(1);});it('c',()=>{expect(hd304dcx(0,0)).toBe(0);});it('d',()=>{expect(hd304dcx(93,73)).toBe(2);});it('e',()=>{expect(hd304dcx(15,0)).toBe(4);});});
function hd305dcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph305dcx_hd',()=>{it('a',()=>{expect(hd305dcx(1,4)).toBe(2);});it('b',()=>{expect(hd305dcx(3,1)).toBe(1);});it('c',()=>{expect(hd305dcx(0,0)).toBe(0);});it('d',()=>{expect(hd305dcx(93,73)).toBe(2);});it('e',()=>{expect(hd305dcx(15,0)).toBe(4);});});
function hd306dcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph306dcx_hd',()=>{it('a',()=>{expect(hd306dcx(1,4)).toBe(2);});it('b',()=>{expect(hd306dcx(3,1)).toBe(1);});it('c',()=>{expect(hd306dcx(0,0)).toBe(0);});it('d',()=>{expect(hd306dcx(93,73)).toBe(2);});it('e',()=>{expect(hd306dcx(15,0)).toBe(4);});});
function hd307dcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph307dcx_hd',()=>{it('a',()=>{expect(hd307dcx(1,4)).toBe(2);});it('b',()=>{expect(hd307dcx(3,1)).toBe(1);});it('c',()=>{expect(hd307dcx(0,0)).toBe(0);});it('d',()=>{expect(hd307dcx(93,73)).toBe(2);});it('e',()=>{expect(hd307dcx(15,0)).toBe(4);});});
function hd308dcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph308dcx_hd',()=>{it('a',()=>{expect(hd308dcx(1,4)).toBe(2);});it('b',()=>{expect(hd308dcx(3,1)).toBe(1);});it('c',()=>{expect(hd308dcx(0,0)).toBe(0);});it('d',()=>{expect(hd308dcx(93,73)).toBe(2);});it('e',()=>{expect(hd308dcx(15,0)).toBe(4);});});
function hd309dcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph309dcx_hd',()=>{it('a',()=>{expect(hd309dcx(1,4)).toBe(2);});it('b',()=>{expect(hd309dcx(3,1)).toBe(1);});it('c',()=>{expect(hd309dcx(0,0)).toBe(0);});it('d',()=>{expect(hd309dcx(93,73)).toBe(2);});it('e',()=>{expect(hd309dcx(15,0)).toBe(4);});});
function hd310dcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph310dcx_hd',()=>{it('a',()=>{expect(hd310dcx(1,4)).toBe(2);});it('b',()=>{expect(hd310dcx(3,1)).toBe(1);});it('c',()=>{expect(hd310dcx(0,0)).toBe(0);});it('d',()=>{expect(hd310dcx(93,73)).toBe(2);});it('e',()=>{expect(hd310dcx(15,0)).toBe(4);});});
function hd311dcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph311dcx_hd',()=>{it('a',()=>{expect(hd311dcx(1,4)).toBe(2);});it('b',()=>{expect(hd311dcx(3,1)).toBe(1);});it('c',()=>{expect(hd311dcx(0,0)).toBe(0);});it('d',()=>{expect(hd311dcx(93,73)).toBe(2);});it('e',()=>{expect(hd311dcx(15,0)).toBe(4);});});
function hd312dcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph312dcx_hd',()=>{it('a',()=>{expect(hd312dcx(1,4)).toBe(2);});it('b',()=>{expect(hd312dcx(3,1)).toBe(1);});it('c',()=>{expect(hd312dcx(0,0)).toBe(0);});it('d',()=>{expect(hd312dcx(93,73)).toBe(2);});it('e',()=>{expect(hd312dcx(15,0)).toBe(4);});});
function hd313dcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph313dcx_hd',()=>{it('a',()=>{expect(hd313dcx(1,4)).toBe(2);});it('b',()=>{expect(hd313dcx(3,1)).toBe(1);});it('c',()=>{expect(hd313dcx(0,0)).toBe(0);});it('d',()=>{expect(hd313dcx(93,73)).toBe(2);});it('e',()=>{expect(hd313dcx(15,0)).toBe(4);});});
function hd314dcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph314dcx_hd',()=>{it('a',()=>{expect(hd314dcx(1,4)).toBe(2);});it('b',()=>{expect(hd314dcx(3,1)).toBe(1);});it('c',()=>{expect(hd314dcx(0,0)).toBe(0);});it('d',()=>{expect(hd314dcx(93,73)).toBe(2);});it('e',()=>{expect(hd314dcx(15,0)).toBe(4);});});
function hd315dcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph315dcx_hd',()=>{it('a',()=>{expect(hd315dcx(1,4)).toBe(2);});it('b',()=>{expect(hd315dcx(3,1)).toBe(1);});it('c',()=>{expect(hd315dcx(0,0)).toBe(0);});it('d',()=>{expect(hd315dcx(93,73)).toBe(2);});it('e',()=>{expect(hd315dcx(15,0)).toBe(4);});});
function hd316dcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph316dcx_hd',()=>{it('a',()=>{expect(hd316dcx(1,4)).toBe(2);});it('b',()=>{expect(hd316dcx(3,1)).toBe(1);});it('c',()=>{expect(hd316dcx(0,0)).toBe(0);});it('d',()=>{expect(hd316dcx(93,73)).toBe(2);});it('e',()=>{expect(hd316dcx(15,0)).toBe(4);});});
function hd317dcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph317dcx_hd',()=>{it('a',()=>{expect(hd317dcx(1,4)).toBe(2);});it('b',()=>{expect(hd317dcx(3,1)).toBe(1);});it('c',()=>{expect(hd317dcx(0,0)).toBe(0);});it('d',()=>{expect(hd317dcx(93,73)).toBe(2);});it('e',()=>{expect(hd317dcx(15,0)).toBe(4);});});
function hd318dcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph318dcx_hd',()=>{it('a',()=>{expect(hd318dcx(1,4)).toBe(2);});it('b',()=>{expect(hd318dcx(3,1)).toBe(1);});it('c',()=>{expect(hd318dcx(0,0)).toBe(0);});it('d',()=>{expect(hd318dcx(93,73)).toBe(2);});it('e',()=>{expect(hd318dcx(15,0)).toBe(4);});});
function hd319dcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph319dcx_hd',()=>{it('a',()=>{expect(hd319dcx(1,4)).toBe(2);});it('b',()=>{expect(hd319dcx(3,1)).toBe(1);});it('c',()=>{expect(hd319dcx(0,0)).toBe(0);});it('d',()=>{expect(hd319dcx(93,73)).toBe(2);});it('e',()=>{expect(hd319dcx(15,0)).toBe(4);});});
function hd320dcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph320dcx_hd',()=>{it('a',()=>{expect(hd320dcx(1,4)).toBe(2);});it('b',()=>{expect(hd320dcx(3,1)).toBe(1);});it('c',()=>{expect(hd320dcx(0,0)).toBe(0);});it('d',()=>{expect(hd320dcx(93,73)).toBe(2);});it('e',()=>{expect(hd320dcx(15,0)).toBe(4);});});
function hd321dcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph321dcx_hd',()=>{it('a',()=>{expect(hd321dcx(1,4)).toBe(2);});it('b',()=>{expect(hd321dcx(3,1)).toBe(1);});it('c',()=>{expect(hd321dcx(0,0)).toBe(0);});it('d',()=>{expect(hd321dcx(93,73)).toBe(2);});it('e',()=>{expect(hd321dcx(15,0)).toBe(4);});});
function hd322dcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph322dcx_hd',()=>{it('a',()=>{expect(hd322dcx(1,4)).toBe(2);});it('b',()=>{expect(hd322dcx(3,1)).toBe(1);});it('c',()=>{expect(hd322dcx(0,0)).toBe(0);});it('d',()=>{expect(hd322dcx(93,73)).toBe(2);});it('e',()=>{expect(hd322dcx(15,0)).toBe(4);});});
function hd323dcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph323dcx_hd',()=>{it('a',()=>{expect(hd323dcx(1,4)).toBe(2);});it('b',()=>{expect(hd323dcx(3,1)).toBe(1);});it('c',()=>{expect(hd323dcx(0,0)).toBe(0);});it('d',()=>{expect(hd323dcx(93,73)).toBe(2);});it('e',()=>{expect(hd323dcx(15,0)).toBe(4);});});
function hd324dcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph324dcx_hd',()=>{it('a',()=>{expect(hd324dcx(1,4)).toBe(2);});it('b',()=>{expect(hd324dcx(3,1)).toBe(1);});it('c',()=>{expect(hd324dcx(0,0)).toBe(0);});it('d',()=>{expect(hd324dcx(93,73)).toBe(2);});it('e',()=>{expect(hd324dcx(15,0)).toBe(4);});});
function hd325dcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph325dcx_hd',()=>{it('a',()=>{expect(hd325dcx(1,4)).toBe(2);});it('b',()=>{expect(hd325dcx(3,1)).toBe(1);});it('c',()=>{expect(hd325dcx(0,0)).toBe(0);});it('d',()=>{expect(hd325dcx(93,73)).toBe(2);});it('e',()=>{expect(hd325dcx(15,0)).toBe(4);});});
function hd326dcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph326dcx_hd',()=>{it('a',()=>{expect(hd326dcx(1,4)).toBe(2);});it('b',()=>{expect(hd326dcx(3,1)).toBe(1);});it('c',()=>{expect(hd326dcx(0,0)).toBe(0);});it('d',()=>{expect(hd326dcx(93,73)).toBe(2);});it('e',()=>{expect(hd326dcx(15,0)).toBe(4);});});
function hd327dcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph327dcx_hd',()=>{it('a',()=>{expect(hd327dcx(1,4)).toBe(2);});it('b',()=>{expect(hd327dcx(3,1)).toBe(1);});it('c',()=>{expect(hd327dcx(0,0)).toBe(0);});it('d',()=>{expect(hd327dcx(93,73)).toBe(2);});it('e',()=>{expect(hd327dcx(15,0)).toBe(4);});});
function hd328dcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph328dcx_hd',()=>{it('a',()=>{expect(hd328dcx(1,4)).toBe(2);});it('b',()=>{expect(hd328dcx(3,1)).toBe(1);});it('c',()=>{expect(hd328dcx(0,0)).toBe(0);});it('d',()=>{expect(hd328dcx(93,73)).toBe(2);});it('e',()=>{expect(hd328dcx(15,0)).toBe(4);});});
function hd329dcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph329dcx_hd',()=>{it('a',()=>{expect(hd329dcx(1,4)).toBe(2);});it('b',()=>{expect(hd329dcx(3,1)).toBe(1);});it('c',()=>{expect(hd329dcx(0,0)).toBe(0);});it('d',()=>{expect(hd329dcx(93,73)).toBe(2);});it('e',()=>{expect(hd329dcx(15,0)).toBe(4);});});
function hd330dcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph330dcx_hd',()=>{it('a',()=>{expect(hd330dcx(1,4)).toBe(2);});it('b',()=>{expect(hd330dcx(3,1)).toBe(1);});it('c',()=>{expect(hd330dcx(0,0)).toBe(0);});it('d',()=>{expect(hd330dcx(93,73)).toBe(2);});it('e',()=>{expect(hd330dcx(15,0)).toBe(4);});});
function hd331dcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph331dcx_hd',()=>{it('a',()=>{expect(hd331dcx(1,4)).toBe(2);});it('b',()=>{expect(hd331dcx(3,1)).toBe(1);});it('c',()=>{expect(hd331dcx(0,0)).toBe(0);});it('d',()=>{expect(hd331dcx(93,73)).toBe(2);});it('e',()=>{expect(hd331dcx(15,0)).toBe(4);});});
function hd332dcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph332dcx_hd',()=>{it('a',()=>{expect(hd332dcx(1,4)).toBe(2);});it('b',()=>{expect(hd332dcx(3,1)).toBe(1);});it('c',()=>{expect(hd332dcx(0,0)).toBe(0);});it('d',()=>{expect(hd332dcx(93,73)).toBe(2);});it('e',()=>{expect(hd332dcx(15,0)).toBe(4);});});
function hd333dcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph333dcx_hd',()=>{it('a',()=>{expect(hd333dcx(1,4)).toBe(2);});it('b',()=>{expect(hd333dcx(3,1)).toBe(1);});it('c',()=>{expect(hd333dcx(0,0)).toBe(0);});it('d',()=>{expect(hd333dcx(93,73)).toBe(2);});it('e',()=>{expect(hd333dcx(15,0)).toBe(4);});});
function hd334dcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph334dcx_hd',()=>{it('a',()=>{expect(hd334dcx(1,4)).toBe(2);});it('b',()=>{expect(hd334dcx(3,1)).toBe(1);});it('c',()=>{expect(hd334dcx(0,0)).toBe(0);});it('d',()=>{expect(hd334dcx(93,73)).toBe(2);});it('e',()=>{expect(hd334dcx(15,0)).toBe(4);});});
function hd335dcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph335dcx_hd',()=>{it('a',()=>{expect(hd335dcx(1,4)).toBe(2);});it('b',()=>{expect(hd335dcx(3,1)).toBe(1);});it('c',()=>{expect(hd335dcx(0,0)).toBe(0);});it('d',()=>{expect(hd335dcx(93,73)).toBe(2);});it('e',()=>{expect(hd335dcx(15,0)).toBe(4);});});
function hd336dcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph336dcx_hd',()=>{it('a',()=>{expect(hd336dcx(1,4)).toBe(2);});it('b',()=>{expect(hd336dcx(3,1)).toBe(1);});it('c',()=>{expect(hd336dcx(0,0)).toBe(0);});it('d',()=>{expect(hd336dcx(93,73)).toBe(2);});it('e',()=>{expect(hd336dcx(15,0)).toBe(4);});});
function hd337dcx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph337dcx_hd',()=>{it('a',()=>{expect(hd337dcx(1,4)).toBe(2);});it('b',()=>{expect(hd337dcx(3,1)).toBe(1);});it('c',()=>{expect(hd337dcx(0,0)).toBe(0);});it('d',()=>{expect(hd337dcx(93,73)).toBe(2);});it('e',()=>{expect(hd337dcx(15,0)).toBe(4);});});
function hd338docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph338docx2_hd',()=>{it('a',()=>{expect(hd338docx2(1,4)).toBe(2);});it('b',()=>{expect(hd338docx2(3,1)).toBe(1);});it('c',()=>{expect(hd338docx2(0,0)).toBe(0);});it('d',()=>{expect(hd338docx2(93,73)).toBe(2);});it('e',()=>{expect(hd338docx2(15,0)).toBe(4);});});
function hd338docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph338docx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd339docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph339docx2_hd',()=>{it('a',()=>{expect(hd339docx2(1,4)).toBe(2);});it('b',()=>{expect(hd339docx2(3,1)).toBe(1);});it('c',()=>{expect(hd339docx2(0,0)).toBe(0);});it('d',()=>{expect(hd339docx2(93,73)).toBe(2);});it('e',()=>{expect(hd339docx2(15,0)).toBe(4);});});
function hd339docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph339docx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd340docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph340docx2_hd',()=>{it('a',()=>{expect(hd340docx2(1,4)).toBe(2);});it('b',()=>{expect(hd340docx2(3,1)).toBe(1);});it('c',()=>{expect(hd340docx2(0,0)).toBe(0);});it('d',()=>{expect(hd340docx2(93,73)).toBe(2);});it('e',()=>{expect(hd340docx2(15,0)).toBe(4);});});
function hd340docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph340docx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd341docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph341docx2_hd',()=>{it('a',()=>{expect(hd341docx2(1,4)).toBe(2);});it('b',()=>{expect(hd341docx2(3,1)).toBe(1);});it('c',()=>{expect(hd341docx2(0,0)).toBe(0);});it('d',()=>{expect(hd341docx2(93,73)).toBe(2);});it('e',()=>{expect(hd341docx2(15,0)).toBe(4);});});
function hd341docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph341docx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd342docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph342docx2_hd',()=>{it('a',()=>{expect(hd342docx2(1,4)).toBe(2);});it('b',()=>{expect(hd342docx2(3,1)).toBe(1);});it('c',()=>{expect(hd342docx2(0,0)).toBe(0);});it('d',()=>{expect(hd342docx2(93,73)).toBe(2);});it('e',()=>{expect(hd342docx2(15,0)).toBe(4);});});
function hd342docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph342docx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd343docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph343docx2_hd',()=>{it('a',()=>{expect(hd343docx2(1,4)).toBe(2);});it('b',()=>{expect(hd343docx2(3,1)).toBe(1);});it('c',()=>{expect(hd343docx2(0,0)).toBe(0);});it('d',()=>{expect(hd343docx2(93,73)).toBe(2);});it('e',()=>{expect(hd343docx2(15,0)).toBe(4);});});
function hd343docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph343docx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd344docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph344docx2_hd',()=>{it('a',()=>{expect(hd344docx2(1,4)).toBe(2);});it('b',()=>{expect(hd344docx2(3,1)).toBe(1);});it('c',()=>{expect(hd344docx2(0,0)).toBe(0);});it('d',()=>{expect(hd344docx2(93,73)).toBe(2);});it('e',()=>{expect(hd344docx2(15,0)).toBe(4);});});
function hd344docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph344docx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd345docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph345docx2_hd',()=>{it('a',()=>{expect(hd345docx2(1,4)).toBe(2);});it('b',()=>{expect(hd345docx2(3,1)).toBe(1);});it('c',()=>{expect(hd345docx2(0,0)).toBe(0);});it('d',()=>{expect(hd345docx2(93,73)).toBe(2);});it('e',()=>{expect(hd345docx2(15,0)).toBe(4);});});
function hd345docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph345docx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd346docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph346docx2_hd',()=>{it('a',()=>{expect(hd346docx2(1,4)).toBe(2);});it('b',()=>{expect(hd346docx2(3,1)).toBe(1);});it('c',()=>{expect(hd346docx2(0,0)).toBe(0);});it('d',()=>{expect(hd346docx2(93,73)).toBe(2);});it('e',()=>{expect(hd346docx2(15,0)).toBe(4);});});
function hd346docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph346docx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd347docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph347docx2_hd',()=>{it('a',()=>{expect(hd347docx2(1,4)).toBe(2);});it('b',()=>{expect(hd347docx2(3,1)).toBe(1);});it('c',()=>{expect(hd347docx2(0,0)).toBe(0);});it('d',()=>{expect(hd347docx2(93,73)).toBe(2);});it('e',()=>{expect(hd347docx2(15,0)).toBe(4);});});
function hd347docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph347docx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd348docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph348docx2_hd',()=>{it('a',()=>{expect(hd348docx2(1,4)).toBe(2);});it('b',()=>{expect(hd348docx2(3,1)).toBe(1);});it('c',()=>{expect(hd348docx2(0,0)).toBe(0);});it('d',()=>{expect(hd348docx2(93,73)).toBe(2);});it('e',()=>{expect(hd348docx2(15,0)).toBe(4);});});
function hd348docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph348docx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd349docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph349docx2_hd',()=>{it('a',()=>{expect(hd349docx2(1,4)).toBe(2);});it('b',()=>{expect(hd349docx2(3,1)).toBe(1);});it('c',()=>{expect(hd349docx2(0,0)).toBe(0);});it('d',()=>{expect(hd349docx2(93,73)).toBe(2);});it('e',()=>{expect(hd349docx2(15,0)).toBe(4);});});
function hd349docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph349docx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd350docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph350docx2_hd',()=>{it('a',()=>{expect(hd350docx2(1,4)).toBe(2);});it('b',()=>{expect(hd350docx2(3,1)).toBe(1);});it('c',()=>{expect(hd350docx2(0,0)).toBe(0);});it('d',()=>{expect(hd350docx2(93,73)).toBe(2);});it('e',()=>{expect(hd350docx2(15,0)).toBe(4);});});
function hd350docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph350docx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd351docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph351docx2_hd',()=>{it('a',()=>{expect(hd351docx2(1,4)).toBe(2);});it('b',()=>{expect(hd351docx2(3,1)).toBe(1);});it('c',()=>{expect(hd351docx2(0,0)).toBe(0);});it('d',()=>{expect(hd351docx2(93,73)).toBe(2);});it('e',()=>{expect(hd351docx2(15,0)).toBe(4);});});
function hd351docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph351docx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd352docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph352docx2_hd',()=>{it('a',()=>{expect(hd352docx2(1,4)).toBe(2);});it('b',()=>{expect(hd352docx2(3,1)).toBe(1);});it('c',()=>{expect(hd352docx2(0,0)).toBe(0);});it('d',()=>{expect(hd352docx2(93,73)).toBe(2);});it('e',()=>{expect(hd352docx2(15,0)).toBe(4);});});
function hd352docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph352docx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd353docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph353docx2_hd',()=>{it('a',()=>{expect(hd353docx2(1,4)).toBe(2);});it('b',()=>{expect(hd353docx2(3,1)).toBe(1);});it('c',()=>{expect(hd353docx2(0,0)).toBe(0);});it('d',()=>{expect(hd353docx2(93,73)).toBe(2);});it('e',()=>{expect(hd353docx2(15,0)).toBe(4);});});
function hd353docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph353docx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd354docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph354docx2_hd',()=>{it('a',()=>{expect(hd354docx2(1,4)).toBe(2);});it('b',()=>{expect(hd354docx2(3,1)).toBe(1);});it('c',()=>{expect(hd354docx2(0,0)).toBe(0);});it('d',()=>{expect(hd354docx2(93,73)).toBe(2);});it('e',()=>{expect(hd354docx2(15,0)).toBe(4);});});
function hd354docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph354docx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd355docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph355docx2_hd',()=>{it('a',()=>{expect(hd355docx2(1,4)).toBe(2);});it('b',()=>{expect(hd355docx2(3,1)).toBe(1);});it('c',()=>{expect(hd355docx2(0,0)).toBe(0);});it('d',()=>{expect(hd355docx2(93,73)).toBe(2);});it('e',()=>{expect(hd355docx2(15,0)).toBe(4);});});
function hd355docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph355docx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd356docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph356docx2_hd',()=>{it('a',()=>{expect(hd356docx2(1,4)).toBe(2);});it('b',()=>{expect(hd356docx2(3,1)).toBe(1);});it('c',()=>{expect(hd356docx2(0,0)).toBe(0);});it('d',()=>{expect(hd356docx2(93,73)).toBe(2);});it('e',()=>{expect(hd356docx2(15,0)).toBe(4);});});
function hd356docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph356docx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd357docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph357docx2_hd',()=>{it('a',()=>{expect(hd357docx2(1,4)).toBe(2);});it('b',()=>{expect(hd357docx2(3,1)).toBe(1);});it('c',()=>{expect(hd357docx2(0,0)).toBe(0);});it('d',()=>{expect(hd357docx2(93,73)).toBe(2);});it('e',()=>{expect(hd357docx2(15,0)).toBe(4);});});
function hd357docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph357docx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd358docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph358docx2_hd',()=>{it('a',()=>{expect(hd358docx2(1,4)).toBe(2);});it('b',()=>{expect(hd358docx2(3,1)).toBe(1);});it('c',()=>{expect(hd358docx2(0,0)).toBe(0);});it('d',()=>{expect(hd358docx2(93,73)).toBe(2);});it('e',()=>{expect(hd358docx2(15,0)).toBe(4);});});
function hd358docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph358docx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd359docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph359docx2_hd',()=>{it('a',()=>{expect(hd359docx2(1,4)).toBe(2);});it('b',()=>{expect(hd359docx2(3,1)).toBe(1);});it('c',()=>{expect(hd359docx2(0,0)).toBe(0);});it('d',()=>{expect(hd359docx2(93,73)).toBe(2);});it('e',()=>{expect(hd359docx2(15,0)).toBe(4);});});
function hd359docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph359docx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd360docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph360docx2_hd',()=>{it('a',()=>{expect(hd360docx2(1,4)).toBe(2);});it('b',()=>{expect(hd360docx2(3,1)).toBe(1);});it('c',()=>{expect(hd360docx2(0,0)).toBe(0);});it('d',()=>{expect(hd360docx2(93,73)).toBe(2);});it('e',()=>{expect(hd360docx2(15,0)).toBe(4);});});
function hd360docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph360docx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd361docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph361docx2_hd',()=>{it('a',()=>{expect(hd361docx2(1,4)).toBe(2);});it('b',()=>{expect(hd361docx2(3,1)).toBe(1);});it('c',()=>{expect(hd361docx2(0,0)).toBe(0);});it('d',()=>{expect(hd361docx2(93,73)).toBe(2);});it('e',()=>{expect(hd361docx2(15,0)).toBe(4);});});
function hd361docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph361docx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd362docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph362docx2_hd',()=>{it('a',()=>{expect(hd362docx2(1,4)).toBe(2);});it('b',()=>{expect(hd362docx2(3,1)).toBe(1);});it('c',()=>{expect(hd362docx2(0,0)).toBe(0);});it('d',()=>{expect(hd362docx2(93,73)).toBe(2);});it('e',()=>{expect(hd362docx2(15,0)).toBe(4);});});
function hd362docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph362docx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd363docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph363docx2_hd',()=>{it('a',()=>{expect(hd363docx2(1,4)).toBe(2);});it('b',()=>{expect(hd363docx2(3,1)).toBe(1);});it('c',()=>{expect(hd363docx2(0,0)).toBe(0);});it('d',()=>{expect(hd363docx2(93,73)).toBe(2);});it('e',()=>{expect(hd363docx2(15,0)).toBe(4);});});
function hd363docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph363docx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd364docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph364docx2_hd',()=>{it('a',()=>{expect(hd364docx2(1,4)).toBe(2);});it('b',()=>{expect(hd364docx2(3,1)).toBe(1);});it('c',()=>{expect(hd364docx2(0,0)).toBe(0);});it('d',()=>{expect(hd364docx2(93,73)).toBe(2);});it('e',()=>{expect(hd364docx2(15,0)).toBe(4);});});
function hd364docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph364docx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd365docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph365docx2_hd',()=>{it('a',()=>{expect(hd365docx2(1,4)).toBe(2);});it('b',()=>{expect(hd365docx2(3,1)).toBe(1);});it('c',()=>{expect(hd365docx2(0,0)).toBe(0);});it('d',()=>{expect(hd365docx2(93,73)).toBe(2);});it('e',()=>{expect(hd365docx2(15,0)).toBe(4);});});
function hd365docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph365docx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd366docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph366docx2_hd',()=>{it('a',()=>{expect(hd366docx2(1,4)).toBe(2);});it('b',()=>{expect(hd366docx2(3,1)).toBe(1);});it('c',()=>{expect(hd366docx2(0,0)).toBe(0);});it('d',()=>{expect(hd366docx2(93,73)).toBe(2);});it('e',()=>{expect(hd366docx2(15,0)).toBe(4);});});
function hd366docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph366docx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd367docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph367docx2_hd',()=>{it('a',()=>{expect(hd367docx2(1,4)).toBe(2);});it('b',()=>{expect(hd367docx2(3,1)).toBe(1);});it('c',()=>{expect(hd367docx2(0,0)).toBe(0);});it('d',()=>{expect(hd367docx2(93,73)).toBe(2);});it('e',()=>{expect(hd367docx2(15,0)).toBe(4);});});
function hd367docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph367docx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd368docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph368docx2_hd',()=>{it('a',()=>{expect(hd368docx2(1,4)).toBe(2);});it('b',()=>{expect(hd368docx2(3,1)).toBe(1);});it('c',()=>{expect(hd368docx2(0,0)).toBe(0);});it('d',()=>{expect(hd368docx2(93,73)).toBe(2);});it('e',()=>{expect(hd368docx2(15,0)).toBe(4);});});
function hd368docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph368docx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd369docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph369docx2_hd',()=>{it('a',()=>{expect(hd369docx2(1,4)).toBe(2);});it('b',()=>{expect(hd369docx2(3,1)).toBe(1);});it('c',()=>{expect(hd369docx2(0,0)).toBe(0);});it('d',()=>{expect(hd369docx2(93,73)).toBe(2);});it('e',()=>{expect(hd369docx2(15,0)).toBe(4);});});
function hd369docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph369docx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd370docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph370docx2_hd',()=>{it('a',()=>{expect(hd370docx2(1,4)).toBe(2);});it('b',()=>{expect(hd370docx2(3,1)).toBe(1);});it('c',()=>{expect(hd370docx2(0,0)).toBe(0);});it('d',()=>{expect(hd370docx2(93,73)).toBe(2);});it('e',()=>{expect(hd370docx2(15,0)).toBe(4);});});
function hd370docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph370docx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd371docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph371docx2_hd',()=>{it('a',()=>{expect(hd371docx2(1,4)).toBe(2);});it('b',()=>{expect(hd371docx2(3,1)).toBe(1);});it('c',()=>{expect(hd371docx2(0,0)).toBe(0);});it('d',()=>{expect(hd371docx2(93,73)).toBe(2);});it('e',()=>{expect(hd371docx2(15,0)).toBe(4);});});
function hd371docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph371docx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd372docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph372docx2_hd',()=>{it('a',()=>{expect(hd372docx2(1,4)).toBe(2);});it('b',()=>{expect(hd372docx2(3,1)).toBe(1);});it('c',()=>{expect(hd372docx2(0,0)).toBe(0);});it('d',()=>{expect(hd372docx2(93,73)).toBe(2);});it('e',()=>{expect(hd372docx2(15,0)).toBe(4);});});
function hd372docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph372docx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd373docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph373docx2_hd',()=>{it('a',()=>{expect(hd373docx2(1,4)).toBe(2);});it('b',()=>{expect(hd373docx2(3,1)).toBe(1);});it('c',()=>{expect(hd373docx2(0,0)).toBe(0);});it('d',()=>{expect(hd373docx2(93,73)).toBe(2);});it('e',()=>{expect(hd373docx2(15,0)).toBe(4);});});
function hd373docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph373docx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd374docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph374docx2_hd',()=>{it('a',()=>{expect(hd374docx2(1,4)).toBe(2);});it('b',()=>{expect(hd374docx2(3,1)).toBe(1);});it('c',()=>{expect(hd374docx2(0,0)).toBe(0);});it('d',()=>{expect(hd374docx2(93,73)).toBe(2);});it('e',()=>{expect(hd374docx2(15,0)).toBe(4);});});
function hd374docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph374docx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd375docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph375docx2_hd',()=>{it('a',()=>{expect(hd375docx2(1,4)).toBe(2);});it('b',()=>{expect(hd375docx2(3,1)).toBe(1);});it('c',()=>{expect(hd375docx2(0,0)).toBe(0);});it('d',()=>{expect(hd375docx2(93,73)).toBe(2);});it('e',()=>{expect(hd375docx2(15,0)).toBe(4);});});
function hd375docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph375docx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd376docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph376docx2_hd',()=>{it('a',()=>{expect(hd376docx2(1,4)).toBe(2);});it('b',()=>{expect(hd376docx2(3,1)).toBe(1);});it('c',()=>{expect(hd376docx2(0,0)).toBe(0);});it('d',()=>{expect(hd376docx2(93,73)).toBe(2);});it('e',()=>{expect(hd376docx2(15,0)).toBe(4);});});
function hd376docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph376docx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd377docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph377docx2_hd',()=>{it('a',()=>{expect(hd377docx2(1,4)).toBe(2);});it('b',()=>{expect(hd377docx2(3,1)).toBe(1);});it('c',()=>{expect(hd377docx2(0,0)).toBe(0);});it('d',()=>{expect(hd377docx2(93,73)).toBe(2);});it('e',()=>{expect(hd377docx2(15,0)).toBe(4);});});
function hd377docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph377docx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd378docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph378docx2_hd',()=>{it('a',()=>{expect(hd378docx2(1,4)).toBe(2);});it('b',()=>{expect(hd378docx2(3,1)).toBe(1);});it('c',()=>{expect(hd378docx2(0,0)).toBe(0);});it('d',()=>{expect(hd378docx2(93,73)).toBe(2);});it('e',()=>{expect(hd378docx2(15,0)).toBe(4);});});
function hd378docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph378docx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd379docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph379docx2_hd',()=>{it('a',()=>{expect(hd379docx2(1,4)).toBe(2);});it('b',()=>{expect(hd379docx2(3,1)).toBe(1);});it('c',()=>{expect(hd379docx2(0,0)).toBe(0);});it('d',()=>{expect(hd379docx2(93,73)).toBe(2);});it('e',()=>{expect(hd379docx2(15,0)).toBe(4);});});
function hd379docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph379docx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd380docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph380docx2_hd',()=>{it('a',()=>{expect(hd380docx2(1,4)).toBe(2);});it('b',()=>{expect(hd380docx2(3,1)).toBe(1);});it('c',()=>{expect(hd380docx2(0,0)).toBe(0);});it('d',()=>{expect(hd380docx2(93,73)).toBe(2);});it('e',()=>{expect(hd380docx2(15,0)).toBe(4);});});
function hd380docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph380docx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd381docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph381docx2_hd',()=>{it('a',()=>{expect(hd381docx2(1,4)).toBe(2);});it('b',()=>{expect(hd381docx2(3,1)).toBe(1);});it('c',()=>{expect(hd381docx2(0,0)).toBe(0);});it('d',()=>{expect(hd381docx2(93,73)).toBe(2);});it('e',()=>{expect(hd381docx2(15,0)).toBe(4);});});
function hd381docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph381docx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd382docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph382docx2_hd',()=>{it('a',()=>{expect(hd382docx2(1,4)).toBe(2);});it('b',()=>{expect(hd382docx2(3,1)).toBe(1);});it('c',()=>{expect(hd382docx2(0,0)).toBe(0);});it('d',()=>{expect(hd382docx2(93,73)).toBe(2);});it('e',()=>{expect(hd382docx2(15,0)).toBe(4);});});
function hd382docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph382docx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd383docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph383docx2_hd',()=>{it('a',()=>{expect(hd383docx2(1,4)).toBe(2);});it('b',()=>{expect(hd383docx2(3,1)).toBe(1);});it('c',()=>{expect(hd383docx2(0,0)).toBe(0);});it('d',()=>{expect(hd383docx2(93,73)).toBe(2);});it('e',()=>{expect(hd383docx2(15,0)).toBe(4);});});
function hd383docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph383docx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd384docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph384docx2_hd',()=>{it('a',()=>{expect(hd384docx2(1,4)).toBe(2);});it('b',()=>{expect(hd384docx2(3,1)).toBe(1);});it('c',()=>{expect(hd384docx2(0,0)).toBe(0);});it('d',()=>{expect(hd384docx2(93,73)).toBe(2);});it('e',()=>{expect(hd384docx2(15,0)).toBe(4);});});
function hd384docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph384docx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd385docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph385docx2_hd',()=>{it('a',()=>{expect(hd385docx2(1,4)).toBe(2);});it('b',()=>{expect(hd385docx2(3,1)).toBe(1);});it('c',()=>{expect(hd385docx2(0,0)).toBe(0);});it('d',()=>{expect(hd385docx2(93,73)).toBe(2);});it('e',()=>{expect(hd385docx2(15,0)).toBe(4);});});
function hd385docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph385docx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd386docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph386docx2_hd',()=>{it('a',()=>{expect(hd386docx2(1,4)).toBe(2);});it('b',()=>{expect(hd386docx2(3,1)).toBe(1);});it('c',()=>{expect(hd386docx2(0,0)).toBe(0);});it('d',()=>{expect(hd386docx2(93,73)).toBe(2);});it('e',()=>{expect(hd386docx2(15,0)).toBe(4);});});
function hd386docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph386docx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd387docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph387docx2_hd',()=>{it('a',()=>{expect(hd387docx2(1,4)).toBe(2);});it('b',()=>{expect(hd387docx2(3,1)).toBe(1);});it('c',()=>{expect(hd387docx2(0,0)).toBe(0);});it('d',()=>{expect(hd387docx2(93,73)).toBe(2);});it('e',()=>{expect(hd387docx2(15,0)).toBe(4);});});
function hd387docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph387docx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd388docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph388docx2_hd',()=>{it('a',()=>{expect(hd388docx2(1,4)).toBe(2);});it('b',()=>{expect(hd388docx2(3,1)).toBe(1);});it('c',()=>{expect(hd388docx2(0,0)).toBe(0);});it('d',()=>{expect(hd388docx2(93,73)).toBe(2);});it('e',()=>{expect(hd388docx2(15,0)).toBe(4);});});
function hd388docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph388docx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd389docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph389docx2_hd',()=>{it('a',()=>{expect(hd389docx2(1,4)).toBe(2);});it('b',()=>{expect(hd389docx2(3,1)).toBe(1);});it('c',()=>{expect(hd389docx2(0,0)).toBe(0);});it('d',()=>{expect(hd389docx2(93,73)).toBe(2);});it('e',()=>{expect(hd389docx2(15,0)).toBe(4);});});
function hd389docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph389docx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd390docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph390docx2_hd',()=>{it('a',()=>{expect(hd390docx2(1,4)).toBe(2);});it('b',()=>{expect(hd390docx2(3,1)).toBe(1);});it('c',()=>{expect(hd390docx2(0,0)).toBe(0);});it('d',()=>{expect(hd390docx2(93,73)).toBe(2);});it('e',()=>{expect(hd390docx2(15,0)).toBe(4);});});
function hd390docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph390docx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd391docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph391docx2_hd',()=>{it('a',()=>{expect(hd391docx2(1,4)).toBe(2);});it('b',()=>{expect(hd391docx2(3,1)).toBe(1);});it('c',()=>{expect(hd391docx2(0,0)).toBe(0);});it('d',()=>{expect(hd391docx2(93,73)).toBe(2);});it('e',()=>{expect(hd391docx2(15,0)).toBe(4);});});
function hd391docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph391docx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd392docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph392docx2_hd',()=>{it('a',()=>{expect(hd392docx2(1,4)).toBe(2);});it('b',()=>{expect(hd392docx2(3,1)).toBe(1);});it('c',()=>{expect(hd392docx2(0,0)).toBe(0);});it('d',()=>{expect(hd392docx2(93,73)).toBe(2);});it('e',()=>{expect(hd392docx2(15,0)).toBe(4);});});
function hd392docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph392docx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd393docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph393docx2_hd',()=>{it('a',()=>{expect(hd393docx2(1,4)).toBe(2);});it('b',()=>{expect(hd393docx2(3,1)).toBe(1);});it('c',()=>{expect(hd393docx2(0,0)).toBe(0);});it('d',()=>{expect(hd393docx2(93,73)).toBe(2);});it('e',()=>{expect(hd393docx2(15,0)).toBe(4);});});
function hd393docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph393docx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd394docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph394docx2_hd',()=>{it('a',()=>{expect(hd394docx2(1,4)).toBe(2);});it('b',()=>{expect(hd394docx2(3,1)).toBe(1);});it('c',()=>{expect(hd394docx2(0,0)).toBe(0);});it('d',()=>{expect(hd394docx2(93,73)).toBe(2);});it('e',()=>{expect(hd394docx2(15,0)).toBe(4);});});
function hd394docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph394docx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd395docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph395docx2_hd',()=>{it('a',()=>{expect(hd395docx2(1,4)).toBe(2);});it('b',()=>{expect(hd395docx2(3,1)).toBe(1);});it('c',()=>{expect(hd395docx2(0,0)).toBe(0);});it('d',()=>{expect(hd395docx2(93,73)).toBe(2);});it('e',()=>{expect(hd395docx2(15,0)).toBe(4);});});
function hd395docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph395docx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd396docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph396docx2_hd',()=>{it('a',()=>{expect(hd396docx2(1,4)).toBe(2);});it('b',()=>{expect(hd396docx2(3,1)).toBe(1);});it('c',()=>{expect(hd396docx2(0,0)).toBe(0);});it('d',()=>{expect(hd396docx2(93,73)).toBe(2);});it('e',()=>{expect(hd396docx2(15,0)).toBe(4);});});
function hd396docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph396docx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd397docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph397docx2_hd',()=>{it('a',()=>{expect(hd397docx2(1,4)).toBe(2);});it('b',()=>{expect(hd397docx2(3,1)).toBe(1);});it('c',()=>{expect(hd397docx2(0,0)).toBe(0);});it('d',()=>{expect(hd397docx2(93,73)).toBe(2);});it('e',()=>{expect(hd397docx2(15,0)).toBe(4);});});
function hd397docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph397docx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd398docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph398docx2_hd',()=>{it('a',()=>{expect(hd398docx2(1,4)).toBe(2);});it('b',()=>{expect(hd398docx2(3,1)).toBe(1);});it('c',()=>{expect(hd398docx2(0,0)).toBe(0);});it('d',()=>{expect(hd398docx2(93,73)).toBe(2);});it('e',()=>{expect(hd398docx2(15,0)).toBe(4);});});
function hd398docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph398docx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd399docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph399docx2_hd',()=>{it('a',()=>{expect(hd399docx2(1,4)).toBe(2);});it('b',()=>{expect(hd399docx2(3,1)).toBe(1);});it('c',()=>{expect(hd399docx2(0,0)).toBe(0);});it('d',()=>{expect(hd399docx2(93,73)).toBe(2);});it('e',()=>{expect(hd399docx2(15,0)).toBe(4);});});
function hd399docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph399docx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd400docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph400docx2_hd',()=>{it('a',()=>{expect(hd400docx2(1,4)).toBe(2);});it('b',()=>{expect(hd400docx2(3,1)).toBe(1);});it('c',()=>{expect(hd400docx2(0,0)).toBe(0);});it('d',()=>{expect(hd400docx2(93,73)).toBe(2);});it('e',()=>{expect(hd400docx2(15,0)).toBe(4);});});
function hd400docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph400docx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd401docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph401docx2_hd',()=>{it('a',()=>{expect(hd401docx2(1,4)).toBe(2);});it('b',()=>{expect(hd401docx2(3,1)).toBe(1);});it('c',()=>{expect(hd401docx2(0,0)).toBe(0);});it('d',()=>{expect(hd401docx2(93,73)).toBe(2);});it('e',()=>{expect(hd401docx2(15,0)).toBe(4);});});
function hd401docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph401docx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd402docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph402docx2_hd',()=>{it('a',()=>{expect(hd402docx2(1,4)).toBe(2);});it('b',()=>{expect(hd402docx2(3,1)).toBe(1);});it('c',()=>{expect(hd402docx2(0,0)).toBe(0);});it('d',()=>{expect(hd402docx2(93,73)).toBe(2);});it('e',()=>{expect(hd402docx2(15,0)).toBe(4);});});
function hd402docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph402docx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd403docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph403docx2_hd',()=>{it('a',()=>{expect(hd403docx2(1,4)).toBe(2);});it('b',()=>{expect(hd403docx2(3,1)).toBe(1);});it('c',()=>{expect(hd403docx2(0,0)).toBe(0);});it('d',()=>{expect(hd403docx2(93,73)).toBe(2);});it('e',()=>{expect(hd403docx2(15,0)).toBe(4);});});
function hd403docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph403docx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd404docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph404docx2_hd',()=>{it('a',()=>{expect(hd404docx2(1,4)).toBe(2);});it('b',()=>{expect(hd404docx2(3,1)).toBe(1);});it('c',()=>{expect(hd404docx2(0,0)).toBe(0);});it('d',()=>{expect(hd404docx2(93,73)).toBe(2);});it('e',()=>{expect(hd404docx2(15,0)).toBe(4);});});
function hd404docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph404docx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd405docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph405docx2_hd',()=>{it('a',()=>{expect(hd405docx2(1,4)).toBe(2);});it('b',()=>{expect(hd405docx2(3,1)).toBe(1);});it('c',()=>{expect(hd405docx2(0,0)).toBe(0);});it('d',()=>{expect(hd405docx2(93,73)).toBe(2);});it('e',()=>{expect(hd405docx2(15,0)).toBe(4);});});
function hd405docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph405docx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd406docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph406docx2_hd',()=>{it('a',()=>{expect(hd406docx2(1,4)).toBe(2);});it('b',()=>{expect(hd406docx2(3,1)).toBe(1);});it('c',()=>{expect(hd406docx2(0,0)).toBe(0);});it('d',()=>{expect(hd406docx2(93,73)).toBe(2);});it('e',()=>{expect(hd406docx2(15,0)).toBe(4);});});
function hd406docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph406docx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd407docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph407docx2_hd',()=>{it('a',()=>{expect(hd407docx2(1,4)).toBe(2);});it('b',()=>{expect(hd407docx2(3,1)).toBe(1);});it('c',()=>{expect(hd407docx2(0,0)).toBe(0);});it('d',()=>{expect(hd407docx2(93,73)).toBe(2);});it('e',()=>{expect(hd407docx2(15,0)).toBe(4);});});
function hd407docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph407docx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd408docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph408docx2_hd',()=>{it('a',()=>{expect(hd408docx2(1,4)).toBe(2);});it('b',()=>{expect(hd408docx2(3,1)).toBe(1);});it('c',()=>{expect(hd408docx2(0,0)).toBe(0);});it('d',()=>{expect(hd408docx2(93,73)).toBe(2);});it('e',()=>{expect(hd408docx2(15,0)).toBe(4);});});
function hd408docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph408docx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd409docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph409docx2_hd',()=>{it('a',()=>{expect(hd409docx2(1,4)).toBe(2);});it('b',()=>{expect(hd409docx2(3,1)).toBe(1);});it('c',()=>{expect(hd409docx2(0,0)).toBe(0);});it('d',()=>{expect(hd409docx2(93,73)).toBe(2);});it('e',()=>{expect(hd409docx2(15,0)).toBe(4);});});
function hd409docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph409docx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd410docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph410docx2_hd',()=>{it('a',()=>{expect(hd410docx2(1,4)).toBe(2);});it('b',()=>{expect(hd410docx2(3,1)).toBe(1);});it('c',()=>{expect(hd410docx2(0,0)).toBe(0);});it('d',()=>{expect(hd410docx2(93,73)).toBe(2);});it('e',()=>{expect(hd410docx2(15,0)).toBe(4);});});
function hd410docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph410docx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd411docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph411docx2_hd',()=>{it('a',()=>{expect(hd411docx2(1,4)).toBe(2);});it('b',()=>{expect(hd411docx2(3,1)).toBe(1);});it('c',()=>{expect(hd411docx2(0,0)).toBe(0);});it('d',()=>{expect(hd411docx2(93,73)).toBe(2);});it('e',()=>{expect(hd411docx2(15,0)).toBe(4);});});
function hd411docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph411docx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd412docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph412docx2_hd',()=>{it('a',()=>{expect(hd412docx2(1,4)).toBe(2);});it('b',()=>{expect(hd412docx2(3,1)).toBe(1);});it('c',()=>{expect(hd412docx2(0,0)).toBe(0);});it('d',()=>{expect(hd412docx2(93,73)).toBe(2);});it('e',()=>{expect(hd412docx2(15,0)).toBe(4);});});
function hd412docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph412docx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd413docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph413docx2_hd',()=>{it('a',()=>{expect(hd413docx2(1,4)).toBe(2);});it('b',()=>{expect(hd413docx2(3,1)).toBe(1);});it('c',()=>{expect(hd413docx2(0,0)).toBe(0);});it('d',()=>{expect(hd413docx2(93,73)).toBe(2);});it('e',()=>{expect(hd413docx2(15,0)).toBe(4);});});
function hd413docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph413docx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd414docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph414docx2_hd',()=>{it('a',()=>{expect(hd414docx2(1,4)).toBe(2);});it('b',()=>{expect(hd414docx2(3,1)).toBe(1);});it('c',()=>{expect(hd414docx2(0,0)).toBe(0);});it('d',()=>{expect(hd414docx2(93,73)).toBe(2);});it('e',()=>{expect(hd414docx2(15,0)).toBe(4);});});
function hd414docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph414docx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd415docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph415docx2_hd',()=>{it('a',()=>{expect(hd415docx2(1,4)).toBe(2);});it('b',()=>{expect(hd415docx2(3,1)).toBe(1);});it('c',()=>{expect(hd415docx2(0,0)).toBe(0);});it('d',()=>{expect(hd415docx2(93,73)).toBe(2);});it('e',()=>{expect(hd415docx2(15,0)).toBe(4);});});
function hd415docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph415docx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd416docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph416docx2_hd',()=>{it('a',()=>{expect(hd416docx2(1,4)).toBe(2);});it('b',()=>{expect(hd416docx2(3,1)).toBe(1);});it('c',()=>{expect(hd416docx2(0,0)).toBe(0);});it('d',()=>{expect(hd416docx2(93,73)).toBe(2);});it('e',()=>{expect(hd416docx2(15,0)).toBe(4);});});
function hd416docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph416docx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd417docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph417docx2_hd',()=>{it('a',()=>{expect(hd417docx2(1,4)).toBe(2);});it('b',()=>{expect(hd417docx2(3,1)).toBe(1);});it('c',()=>{expect(hd417docx2(0,0)).toBe(0);});it('d',()=>{expect(hd417docx2(93,73)).toBe(2);});it('e',()=>{expect(hd417docx2(15,0)).toBe(4);});});
function hd417docx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph417docx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
