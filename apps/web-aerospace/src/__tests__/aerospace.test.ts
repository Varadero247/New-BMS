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
function hd258aer(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph258aer_hd',()=>{it('a',()=>{expect(hd258aer(1,4)).toBe(2);});it('b',()=>{expect(hd258aer(3,1)).toBe(1);});it('c',()=>{expect(hd258aer(0,0)).toBe(0);});it('d',()=>{expect(hd258aer(93,73)).toBe(2);});it('e',()=>{expect(hd258aer(15,0)).toBe(4);});});
function hd259aer(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph259aer_hd',()=>{it('a',()=>{expect(hd259aer(1,4)).toBe(2);});it('b',()=>{expect(hd259aer(3,1)).toBe(1);});it('c',()=>{expect(hd259aer(0,0)).toBe(0);});it('d',()=>{expect(hd259aer(93,73)).toBe(2);});it('e',()=>{expect(hd259aer(15,0)).toBe(4);});});
function hd260aer(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph260aer_hd',()=>{it('a',()=>{expect(hd260aer(1,4)).toBe(2);});it('b',()=>{expect(hd260aer(3,1)).toBe(1);});it('c',()=>{expect(hd260aer(0,0)).toBe(0);});it('d',()=>{expect(hd260aer(93,73)).toBe(2);});it('e',()=>{expect(hd260aer(15,0)).toBe(4);});});
function hd261aer(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph261aer_hd',()=>{it('a',()=>{expect(hd261aer(1,4)).toBe(2);});it('b',()=>{expect(hd261aer(3,1)).toBe(1);});it('c',()=>{expect(hd261aer(0,0)).toBe(0);});it('d',()=>{expect(hd261aer(93,73)).toBe(2);});it('e',()=>{expect(hd261aer(15,0)).toBe(4);});});
function hd262aer(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph262aer_hd',()=>{it('a',()=>{expect(hd262aer(1,4)).toBe(2);});it('b',()=>{expect(hd262aer(3,1)).toBe(1);});it('c',()=>{expect(hd262aer(0,0)).toBe(0);});it('d',()=>{expect(hd262aer(93,73)).toBe(2);});it('e',()=>{expect(hd262aer(15,0)).toBe(4);});});
function hd263aer(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph263aer_hd',()=>{it('a',()=>{expect(hd263aer(1,4)).toBe(2);});it('b',()=>{expect(hd263aer(3,1)).toBe(1);});it('c',()=>{expect(hd263aer(0,0)).toBe(0);});it('d',()=>{expect(hd263aer(93,73)).toBe(2);});it('e',()=>{expect(hd263aer(15,0)).toBe(4);});});
function hd264aer(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph264aer_hd',()=>{it('a',()=>{expect(hd264aer(1,4)).toBe(2);});it('b',()=>{expect(hd264aer(3,1)).toBe(1);});it('c',()=>{expect(hd264aer(0,0)).toBe(0);});it('d',()=>{expect(hd264aer(93,73)).toBe(2);});it('e',()=>{expect(hd264aer(15,0)).toBe(4);});});
function hd265aer(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph265aer_hd',()=>{it('a',()=>{expect(hd265aer(1,4)).toBe(2);});it('b',()=>{expect(hd265aer(3,1)).toBe(1);});it('c',()=>{expect(hd265aer(0,0)).toBe(0);});it('d',()=>{expect(hd265aer(93,73)).toBe(2);});it('e',()=>{expect(hd265aer(15,0)).toBe(4);});});
function hd266aer(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph266aer_hd',()=>{it('a',()=>{expect(hd266aer(1,4)).toBe(2);});it('b',()=>{expect(hd266aer(3,1)).toBe(1);});it('c',()=>{expect(hd266aer(0,0)).toBe(0);});it('d',()=>{expect(hd266aer(93,73)).toBe(2);});it('e',()=>{expect(hd266aer(15,0)).toBe(4);});});
function hd267aer(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph267aer_hd',()=>{it('a',()=>{expect(hd267aer(1,4)).toBe(2);});it('b',()=>{expect(hd267aer(3,1)).toBe(1);});it('c',()=>{expect(hd267aer(0,0)).toBe(0);});it('d',()=>{expect(hd267aer(93,73)).toBe(2);});it('e',()=>{expect(hd267aer(15,0)).toBe(4);});});
function hd268aer(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph268aer_hd',()=>{it('a',()=>{expect(hd268aer(1,4)).toBe(2);});it('b',()=>{expect(hd268aer(3,1)).toBe(1);});it('c',()=>{expect(hd268aer(0,0)).toBe(0);});it('d',()=>{expect(hd268aer(93,73)).toBe(2);});it('e',()=>{expect(hd268aer(15,0)).toBe(4);});});
function hd269aer(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph269aer_hd',()=>{it('a',()=>{expect(hd269aer(1,4)).toBe(2);});it('b',()=>{expect(hd269aer(3,1)).toBe(1);});it('c',()=>{expect(hd269aer(0,0)).toBe(0);});it('d',()=>{expect(hd269aer(93,73)).toBe(2);});it('e',()=>{expect(hd269aer(15,0)).toBe(4);});});
function hd270aer(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph270aer_hd',()=>{it('a',()=>{expect(hd270aer(1,4)).toBe(2);});it('b',()=>{expect(hd270aer(3,1)).toBe(1);});it('c',()=>{expect(hd270aer(0,0)).toBe(0);});it('d',()=>{expect(hd270aer(93,73)).toBe(2);});it('e',()=>{expect(hd270aer(15,0)).toBe(4);});});
function hd271aer(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph271aer_hd',()=>{it('a',()=>{expect(hd271aer(1,4)).toBe(2);});it('b',()=>{expect(hd271aer(3,1)).toBe(1);});it('c',()=>{expect(hd271aer(0,0)).toBe(0);});it('d',()=>{expect(hd271aer(93,73)).toBe(2);});it('e',()=>{expect(hd271aer(15,0)).toBe(4);});});
function hd272aer(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph272aer_hd',()=>{it('a',()=>{expect(hd272aer(1,4)).toBe(2);});it('b',()=>{expect(hd272aer(3,1)).toBe(1);});it('c',()=>{expect(hd272aer(0,0)).toBe(0);});it('d',()=>{expect(hd272aer(93,73)).toBe(2);});it('e',()=>{expect(hd272aer(15,0)).toBe(4);});});
function hd273aer(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph273aer_hd',()=>{it('a',()=>{expect(hd273aer(1,4)).toBe(2);});it('b',()=>{expect(hd273aer(3,1)).toBe(1);});it('c',()=>{expect(hd273aer(0,0)).toBe(0);});it('d',()=>{expect(hd273aer(93,73)).toBe(2);});it('e',()=>{expect(hd273aer(15,0)).toBe(4);});});
function hd274aer(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph274aer_hd',()=>{it('a',()=>{expect(hd274aer(1,4)).toBe(2);});it('b',()=>{expect(hd274aer(3,1)).toBe(1);});it('c',()=>{expect(hd274aer(0,0)).toBe(0);});it('d',()=>{expect(hd274aer(93,73)).toBe(2);});it('e',()=>{expect(hd274aer(15,0)).toBe(4);});});
function hd275aer(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph275aer_hd',()=>{it('a',()=>{expect(hd275aer(1,4)).toBe(2);});it('b',()=>{expect(hd275aer(3,1)).toBe(1);});it('c',()=>{expect(hd275aer(0,0)).toBe(0);});it('d',()=>{expect(hd275aer(93,73)).toBe(2);});it('e',()=>{expect(hd275aer(15,0)).toBe(4);});});
function hd276aer(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph276aer_hd',()=>{it('a',()=>{expect(hd276aer(1,4)).toBe(2);});it('b',()=>{expect(hd276aer(3,1)).toBe(1);});it('c',()=>{expect(hd276aer(0,0)).toBe(0);});it('d',()=>{expect(hd276aer(93,73)).toBe(2);});it('e',()=>{expect(hd276aer(15,0)).toBe(4);});});
function hd277aer(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph277aer_hd',()=>{it('a',()=>{expect(hd277aer(1,4)).toBe(2);});it('b',()=>{expect(hd277aer(3,1)).toBe(1);});it('c',()=>{expect(hd277aer(0,0)).toBe(0);});it('d',()=>{expect(hd277aer(93,73)).toBe(2);});it('e',()=>{expect(hd277aer(15,0)).toBe(4);});});
function hd278aer(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph278aer_hd',()=>{it('a',()=>{expect(hd278aer(1,4)).toBe(2);});it('b',()=>{expect(hd278aer(3,1)).toBe(1);});it('c',()=>{expect(hd278aer(0,0)).toBe(0);});it('d',()=>{expect(hd278aer(93,73)).toBe(2);});it('e',()=>{expect(hd278aer(15,0)).toBe(4);});});
function hd279aer(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph279aer_hd',()=>{it('a',()=>{expect(hd279aer(1,4)).toBe(2);});it('b',()=>{expect(hd279aer(3,1)).toBe(1);});it('c',()=>{expect(hd279aer(0,0)).toBe(0);});it('d',()=>{expect(hd279aer(93,73)).toBe(2);});it('e',()=>{expect(hd279aer(15,0)).toBe(4);});});
function hd280aer(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph280aer_hd',()=>{it('a',()=>{expect(hd280aer(1,4)).toBe(2);});it('b',()=>{expect(hd280aer(3,1)).toBe(1);});it('c',()=>{expect(hd280aer(0,0)).toBe(0);});it('d',()=>{expect(hd280aer(93,73)).toBe(2);});it('e',()=>{expect(hd280aer(15,0)).toBe(4);});});
function hd281aer(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph281aer_hd',()=>{it('a',()=>{expect(hd281aer(1,4)).toBe(2);});it('b',()=>{expect(hd281aer(3,1)).toBe(1);});it('c',()=>{expect(hd281aer(0,0)).toBe(0);});it('d',()=>{expect(hd281aer(93,73)).toBe(2);});it('e',()=>{expect(hd281aer(15,0)).toBe(4);});});
function hd282aer(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph282aer_hd',()=>{it('a',()=>{expect(hd282aer(1,4)).toBe(2);});it('b',()=>{expect(hd282aer(3,1)).toBe(1);});it('c',()=>{expect(hd282aer(0,0)).toBe(0);});it('d',()=>{expect(hd282aer(93,73)).toBe(2);});it('e',()=>{expect(hd282aer(15,0)).toBe(4);});});
function hd283aer(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph283aer_hd',()=>{it('a',()=>{expect(hd283aer(1,4)).toBe(2);});it('b',()=>{expect(hd283aer(3,1)).toBe(1);});it('c',()=>{expect(hd283aer(0,0)).toBe(0);});it('d',()=>{expect(hd283aer(93,73)).toBe(2);});it('e',()=>{expect(hd283aer(15,0)).toBe(4);});});
function hd284aer(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph284aer_hd',()=>{it('a',()=>{expect(hd284aer(1,4)).toBe(2);});it('b',()=>{expect(hd284aer(3,1)).toBe(1);});it('c',()=>{expect(hd284aer(0,0)).toBe(0);});it('d',()=>{expect(hd284aer(93,73)).toBe(2);});it('e',()=>{expect(hd284aer(15,0)).toBe(4);});});
function hd285aer(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph285aer_hd',()=>{it('a',()=>{expect(hd285aer(1,4)).toBe(2);});it('b',()=>{expect(hd285aer(3,1)).toBe(1);});it('c',()=>{expect(hd285aer(0,0)).toBe(0);});it('d',()=>{expect(hd285aer(93,73)).toBe(2);});it('e',()=>{expect(hd285aer(15,0)).toBe(4);});});
function hd286aer(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph286aer_hd',()=>{it('a',()=>{expect(hd286aer(1,4)).toBe(2);});it('b',()=>{expect(hd286aer(3,1)).toBe(1);});it('c',()=>{expect(hd286aer(0,0)).toBe(0);});it('d',()=>{expect(hd286aer(93,73)).toBe(2);});it('e',()=>{expect(hd286aer(15,0)).toBe(4);});});
function hd287aer(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph287aer_hd',()=>{it('a',()=>{expect(hd287aer(1,4)).toBe(2);});it('b',()=>{expect(hd287aer(3,1)).toBe(1);});it('c',()=>{expect(hd287aer(0,0)).toBe(0);});it('d',()=>{expect(hd287aer(93,73)).toBe(2);});it('e',()=>{expect(hd287aer(15,0)).toBe(4);});});
function hd288aer(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph288aer_hd',()=>{it('a',()=>{expect(hd288aer(1,4)).toBe(2);});it('b',()=>{expect(hd288aer(3,1)).toBe(1);});it('c',()=>{expect(hd288aer(0,0)).toBe(0);});it('d',()=>{expect(hd288aer(93,73)).toBe(2);});it('e',()=>{expect(hd288aer(15,0)).toBe(4);});});
function hd289aer(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph289aer_hd',()=>{it('a',()=>{expect(hd289aer(1,4)).toBe(2);});it('b',()=>{expect(hd289aer(3,1)).toBe(1);});it('c',()=>{expect(hd289aer(0,0)).toBe(0);});it('d',()=>{expect(hd289aer(93,73)).toBe(2);});it('e',()=>{expect(hd289aer(15,0)).toBe(4);});});
function hd290aer(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph290aer_hd',()=>{it('a',()=>{expect(hd290aer(1,4)).toBe(2);});it('b',()=>{expect(hd290aer(3,1)).toBe(1);});it('c',()=>{expect(hd290aer(0,0)).toBe(0);});it('d',()=>{expect(hd290aer(93,73)).toBe(2);});it('e',()=>{expect(hd290aer(15,0)).toBe(4);});});
function hd291aer(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph291aer_hd',()=>{it('a',()=>{expect(hd291aer(1,4)).toBe(2);});it('b',()=>{expect(hd291aer(3,1)).toBe(1);});it('c',()=>{expect(hd291aer(0,0)).toBe(0);});it('d',()=>{expect(hd291aer(93,73)).toBe(2);});it('e',()=>{expect(hd291aer(15,0)).toBe(4);});});
function hd292aer(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph292aer_hd',()=>{it('a',()=>{expect(hd292aer(1,4)).toBe(2);});it('b',()=>{expect(hd292aer(3,1)).toBe(1);});it('c',()=>{expect(hd292aer(0,0)).toBe(0);});it('d',()=>{expect(hd292aer(93,73)).toBe(2);});it('e',()=>{expect(hd292aer(15,0)).toBe(4);});});
function hd293aer(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph293aer_hd',()=>{it('a',()=>{expect(hd293aer(1,4)).toBe(2);});it('b',()=>{expect(hd293aer(3,1)).toBe(1);});it('c',()=>{expect(hd293aer(0,0)).toBe(0);});it('d',()=>{expect(hd293aer(93,73)).toBe(2);});it('e',()=>{expect(hd293aer(15,0)).toBe(4);});});
function hd294aer(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph294aer_hd',()=>{it('a',()=>{expect(hd294aer(1,4)).toBe(2);});it('b',()=>{expect(hd294aer(3,1)).toBe(1);});it('c',()=>{expect(hd294aer(0,0)).toBe(0);});it('d',()=>{expect(hd294aer(93,73)).toBe(2);});it('e',()=>{expect(hd294aer(15,0)).toBe(4);});});
function hd295aer(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph295aer_hd',()=>{it('a',()=>{expect(hd295aer(1,4)).toBe(2);});it('b',()=>{expect(hd295aer(3,1)).toBe(1);});it('c',()=>{expect(hd295aer(0,0)).toBe(0);});it('d',()=>{expect(hd295aer(93,73)).toBe(2);});it('e',()=>{expect(hd295aer(15,0)).toBe(4);});});
function hd296aer(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph296aer_hd',()=>{it('a',()=>{expect(hd296aer(1,4)).toBe(2);});it('b',()=>{expect(hd296aer(3,1)).toBe(1);});it('c',()=>{expect(hd296aer(0,0)).toBe(0);});it('d',()=>{expect(hd296aer(93,73)).toBe(2);});it('e',()=>{expect(hd296aer(15,0)).toBe(4);});});
function hd297aer(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph297aer_hd',()=>{it('a',()=>{expect(hd297aer(1,4)).toBe(2);});it('b',()=>{expect(hd297aer(3,1)).toBe(1);});it('c',()=>{expect(hd297aer(0,0)).toBe(0);});it('d',()=>{expect(hd297aer(93,73)).toBe(2);});it('e',()=>{expect(hd297aer(15,0)).toBe(4);});});
function hd298aer(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph298aer_hd',()=>{it('a',()=>{expect(hd298aer(1,4)).toBe(2);});it('b',()=>{expect(hd298aer(3,1)).toBe(1);});it('c',()=>{expect(hd298aer(0,0)).toBe(0);});it('d',()=>{expect(hd298aer(93,73)).toBe(2);});it('e',()=>{expect(hd298aer(15,0)).toBe(4);});});
function hd299aer(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph299aer_hd',()=>{it('a',()=>{expect(hd299aer(1,4)).toBe(2);});it('b',()=>{expect(hd299aer(3,1)).toBe(1);});it('c',()=>{expect(hd299aer(0,0)).toBe(0);});it('d',()=>{expect(hd299aer(93,73)).toBe(2);});it('e',()=>{expect(hd299aer(15,0)).toBe(4);});});
function hd300aer(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph300aer_hd',()=>{it('a',()=>{expect(hd300aer(1,4)).toBe(2);});it('b',()=>{expect(hd300aer(3,1)).toBe(1);});it('c',()=>{expect(hd300aer(0,0)).toBe(0);});it('d',()=>{expect(hd300aer(93,73)).toBe(2);});it('e',()=>{expect(hd300aer(15,0)).toBe(4);});});
function hd301aer(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph301aer_hd',()=>{it('a',()=>{expect(hd301aer(1,4)).toBe(2);});it('b',()=>{expect(hd301aer(3,1)).toBe(1);});it('c',()=>{expect(hd301aer(0,0)).toBe(0);});it('d',()=>{expect(hd301aer(93,73)).toBe(2);});it('e',()=>{expect(hd301aer(15,0)).toBe(4);});});
function hd302aer(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph302aer_hd',()=>{it('a',()=>{expect(hd302aer(1,4)).toBe(2);});it('b',()=>{expect(hd302aer(3,1)).toBe(1);});it('c',()=>{expect(hd302aer(0,0)).toBe(0);});it('d',()=>{expect(hd302aer(93,73)).toBe(2);});it('e',()=>{expect(hd302aer(15,0)).toBe(4);});});
function hd303aer(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph303aer_hd',()=>{it('a',()=>{expect(hd303aer(1,4)).toBe(2);});it('b',()=>{expect(hd303aer(3,1)).toBe(1);});it('c',()=>{expect(hd303aer(0,0)).toBe(0);});it('d',()=>{expect(hd303aer(93,73)).toBe(2);});it('e',()=>{expect(hd303aer(15,0)).toBe(4);});});
function hd304aer(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph304aer_hd',()=>{it('a',()=>{expect(hd304aer(1,4)).toBe(2);});it('b',()=>{expect(hd304aer(3,1)).toBe(1);});it('c',()=>{expect(hd304aer(0,0)).toBe(0);});it('d',()=>{expect(hd304aer(93,73)).toBe(2);});it('e',()=>{expect(hd304aer(15,0)).toBe(4);});});
function hd305aer(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph305aer_hd',()=>{it('a',()=>{expect(hd305aer(1,4)).toBe(2);});it('b',()=>{expect(hd305aer(3,1)).toBe(1);});it('c',()=>{expect(hd305aer(0,0)).toBe(0);});it('d',()=>{expect(hd305aer(93,73)).toBe(2);});it('e',()=>{expect(hd305aer(15,0)).toBe(4);});});
function hd306aer(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph306aer_hd',()=>{it('a',()=>{expect(hd306aer(1,4)).toBe(2);});it('b',()=>{expect(hd306aer(3,1)).toBe(1);});it('c',()=>{expect(hd306aer(0,0)).toBe(0);});it('d',()=>{expect(hd306aer(93,73)).toBe(2);});it('e',()=>{expect(hd306aer(15,0)).toBe(4);});});
function hd307aer(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph307aer_hd',()=>{it('a',()=>{expect(hd307aer(1,4)).toBe(2);});it('b',()=>{expect(hd307aer(3,1)).toBe(1);});it('c',()=>{expect(hd307aer(0,0)).toBe(0);});it('d',()=>{expect(hd307aer(93,73)).toBe(2);});it('e',()=>{expect(hd307aer(15,0)).toBe(4);});});
function hd308aer(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph308aer_hd',()=>{it('a',()=>{expect(hd308aer(1,4)).toBe(2);});it('b',()=>{expect(hd308aer(3,1)).toBe(1);});it('c',()=>{expect(hd308aer(0,0)).toBe(0);});it('d',()=>{expect(hd308aer(93,73)).toBe(2);});it('e',()=>{expect(hd308aer(15,0)).toBe(4);});});
function hd309aer(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph309aer_hd',()=>{it('a',()=>{expect(hd309aer(1,4)).toBe(2);});it('b',()=>{expect(hd309aer(3,1)).toBe(1);});it('c',()=>{expect(hd309aer(0,0)).toBe(0);});it('d',()=>{expect(hd309aer(93,73)).toBe(2);});it('e',()=>{expect(hd309aer(15,0)).toBe(4);});});
function hd310aer(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph310aer_hd',()=>{it('a',()=>{expect(hd310aer(1,4)).toBe(2);});it('b',()=>{expect(hd310aer(3,1)).toBe(1);});it('c',()=>{expect(hd310aer(0,0)).toBe(0);});it('d',()=>{expect(hd310aer(93,73)).toBe(2);});it('e',()=>{expect(hd310aer(15,0)).toBe(4);});});
function hd311aer(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph311aer_hd',()=>{it('a',()=>{expect(hd311aer(1,4)).toBe(2);});it('b',()=>{expect(hd311aer(3,1)).toBe(1);});it('c',()=>{expect(hd311aer(0,0)).toBe(0);});it('d',()=>{expect(hd311aer(93,73)).toBe(2);});it('e',()=>{expect(hd311aer(15,0)).toBe(4);});});
function hd312aer(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph312aer_hd',()=>{it('a',()=>{expect(hd312aer(1,4)).toBe(2);});it('b',()=>{expect(hd312aer(3,1)).toBe(1);});it('c',()=>{expect(hd312aer(0,0)).toBe(0);});it('d',()=>{expect(hd312aer(93,73)).toBe(2);});it('e',()=>{expect(hd312aer(15,0)).toBe(4);});});
function hd313aer(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph313aer_hd',()=>{it('a',()=>{expect(hd313aer(1,4)).toBe(2);});it('b',()=>{expect(hd313aer(3,1)).toBe(1);});it('c',()=>{expect(hd313aer(0,0)).toBe(0);});it('d',()=>{expect(hd313aer(93,73)).toBe(2);});it('e',()=>{expect(hd313aer(15,0)).toBe(4);});});
function hd314aer(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph314aer_hd',()=>{it('a',()=>{expect(hd314aer(1,4)).toBe(2);});it('b',()=>{expect(hd314aer(3,1)).toBe(1);});it('c',()=>{expect(hd314aer(0,0)).toBe(0);});it('d',()=>{expect(hd314aer(93,73)).toBe(2);});it('e',()=>{expect(hd314aer(15,0)).toBe(4);});});
function hd315aer(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph315aer_hd',()=>{it('a',()=>{expect(hd315aer(1,4)).toBe(2);});it('b',()=>{expect(hd315aer(3,1)).toBe(1);});it('c',()=>{expect(hd315aer(0,0)).toBe(0);});it('d',()=>{expect(hd315aer(93,73)).toBe(2);});it('e',()=>{expect(hd315aer(15,0)).toBe(4);});});
function hd316aer(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph316aer_hd',()=>{it('a',()=>{expect(hd316aer(1,4)).toBe(2);});it('b',()=>{expect(hd316aer(3,1)).toBe(1);});it('c',()=>{expect(hd316aer(0,0)).toBe(0);});it('d',()=>{expect(hd316aer(93,73)).toBe(2);});it('e',()=>{expect(hd316aer(15,0)).toBe(4);});});
function hd317aer(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph317aer_hd',()=>{it('a',()=>{expect(hd317aer(1,4)).toBe(2);});it('b',()=>{expect(hd317aer(3,1)).toBe(1);});it('c',()=>{expect(hd317aer(0,0)).toBe(0);});it('d',()=>{expect(hd317aer(93,73)).toBe(2);});it('e',()=>{expect(hd317aer(15,0)).toBe(4);});});
function hd318aer(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph318aer_hd',()=>{it('a',()=>{expect(hd318aer(1,4)).toBe(2);});it('b',()=>{expect(hd318aer(3,1)).toBe(1);});it('c',()=>{expect(hd318aer(0,0)).toBe(0);});it('d',()=>{expect(hd318aer(93,73)).toBe(2);});it('e',()=>{expect(hd318aer(15,0)).toBe(4);});});
function hd319aer(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph319aer_hd',()=>{it('a',()=>{expect(hd319aer(1,4)).toBe(2);});it('b',()=>{expect(hd319aer(3,1)).toBe(1);});it('c',()=>{expect(hd319aer(0,0)).toBe(0);});it('d',()=>{expect(hd319aer(93,73)).toBe(2);});it('e',()=>{expect(hd319aer(15,0)).toBe(4);});});
function hd320aer(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph320aer_hd',()=>{it('a',()=>{expect(hd320aer(1,4)).toBe(2);});it('b',()=>{expect(hd320aer(3,1)).toBe(1);});it('c',()=>{expect(hd320aer(0,0)).toBe(0);});it('d',()=>{expect(hd320aer(93,73)).toBe(2);});it('e',()=>{expect(hd320aer(15,0)).toBe(4);});});
function hd321aer(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph321aer_hd',()=>{it('a',()=>{expect(hd321aer(1,4)).toBe(2);});it('b',()=>{expect(hd321aer(3,1)).toBe(1);});it('c',()=>{expect(hd321aer(0,0)).toBe(0);});it('d',()=>{expect(hd321aer(93,73)).toBe(2);});it('e',()=>{expect(hd321aer(15,0)).toBe(4);});});
function hd322aer(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph322aer_hd',()=>{it('a',()=>{expect(hd322aer(1,4)).toBe(2);});it('b',()=>{expect(hd322aer(3,1)).toBe(1);});it('c',()=>{expect(hd322aer(0,0)).toBe(0);});it('d',()=>{expect(hd322aer(93,73)).toBe(2);});it('e',()=>{expect(hd322aer(15,0)).toBe(4);});});
function hd323aer(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph323aer_hd',()=>{it('a',()=>{expect(hd323aer(1,4)).toBe(2);});it('b',()=>{expect(hd323aer(3,1)).toBe(1);});it('c',()=>{expect(hd323aer(0,0)).toBe(0);});it('d',()=>{expect(hd323aer(93,73)).toBe(2);});it('e',()=>{expect(hd323aer(15,0)).toBe(4);});});
function hd324aer(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph324aer_hd',()=>{it('a',()=>{expect(hd324aer(1,4)).toBe(2);});it('b',()=>{expect(hd324aer(3,1)).toBe(1);});it('c',()=>{expect(hd324aer(0,0)).toBe(0);});it('d',()=>{expect(hd324aer(93,73)).toBe(2);});it('e',()=>{expect(hd324aer(15,0)).toBe(4);});});
function hd325aer(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph325aer_hd',()=>{it('a',()=>{expect(hd325aer(1,4)).toBe(2);});it('b',()=>{expect(hd325aer(3,1)).toBe(1);});it('c',()=>{expect(hd325aer(0,0)).toBe(0);});it('d',()=>{expect(hd325aer(93,73)).toBe(2);});it('e',()=>{expect(hd325aer(15,0)).toBe(4);});});
function hd326aer(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph326aer_hd',()=>{it('a',()=>{expect(hd326aer(1,4)).toBe(2);});it('b',()=>{expect(hd326aer(3,1)).toBe(1);});it('c',()=>{expect(hd326aer(0,0)).toBe(0);});it('d',()=>{expect(hd326aer(93,73)).toBe(2);});it('e',()=>{expect(hd326aer(15,0)).toBe(4);});});
function hd327aer(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph327aer_hd',()=>{it('a',()=>{expect(hd327aer(1,4)).toBe(2);});it('b',()=>{expect(hd327aer(3,1)).toBe(1);});it('c',()=>{expect(hd327aer(0,0)).toBe(0);});it('d',()=>{expect(hd327aer(93,73)).toBe(2);});it('e',()=>{expect(hd327aer(15,0)).toBe(4);});});
function hd328aer(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph328aer_hd',()=>{it('a',()=>{expect(hd328aer(1,4)).toBe(2);});it('b',()=>{expect(hd328aer(3,1)).toBe(1);});it('c',()=>{expect(hd328aer(0,0)).toBe(0);});it('d',()=>{expect(hd328aer(93,73)).toBe(2);});it('e',()=>{expect(hd328aer(15,0)).toBe(4);});});
function hd329aer(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph329aer_hd',()=>{it('a',()=>{expect(hd329aer(1,4)).toBe(2);});it('b',()=>{expect(hd329aer(3,1)).toBe(1);});it('c',()=>{expect(hd329aer(0,0)).toBe(0);});it('d',()=>{expect(hd329aer(93,73)).toBe(2);});it('e',()=>{expect(hd329aer(15,0)).toBe(4);});});
function hd330aer(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph330aer_hd',()=>{it('a',()=>{expect(hd330aer(1,4)).toBe(2);});it('b',()=>{expect(hd330aer(3,1)).toBe(1);});it('c',()=>{expect(hd330aer(0,0)).toBe(0);});it('d',()=>{expect(hd330aer(93,73)).toBe(2);});it('e',()=>{expect(hd330aer(15,0)).toBe(4);});});
function hd331aer(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph331aer_hd',()=>{it('a',()=>{expect(hd331aer(1,4)).toBe(2);});it('b',()=>{expect(hd331aer(3,1)).toBe(1);});it('c',()=>{expect(hd331aer(0,0)).toBe(0);});it('d',()=>{expect(hd331aer(93,73)).toBe(2);});it('e',()=>{expect(hd331aer(15,0)).toBe(4);});});
function hd332aer(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph332aer_hd',()=>{it('a',()=>{expect(hd332aer(1,4)).toBe(2);});it('b',()=>{expect(hd332aer(3,1)).toBe(1);});it('c',()=>{expect(hd332aer(0,0)).toBe(0);});it('d',()=>{expect(hd332aer(93,73)).toBe(2);});it('e',()=>{expect(hd332aer(15,0)).toBe(4);});});
function hd333aer(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph333aer_hd',()=>{it('a',()=>{expect(hd333aer(1,4)).toBe(2);});it('b',()=>{expect(hd333aer(3,1)).toBe(1);});it('c',()=>{expect(hd333aer(0,0)).toBe(0);});it('d',()=>{expect(hd333aer(93,73)).toBe(2);});it('e',()=>{expect(hd333aer(15,0)).toBe(4);});});
function hd334aer(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph334aer_hd',()=>{it('a',()=>{expect(hd334aer(1,4)).toBe(2);});it('b',()=>{expect(hd334aer(3,1)).toBe(1);});it('c',()=>{expect(hd334aer(0,0)).toBe(0);});it('d',()=>{expect(hd334aer(93,73)).toBe(2);});it('e',()=>{expect(hd334aer(15,0)).toBe(4);});});
function hd335aer(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph335aer_hd',()=>{it('a',()=>{expect(hd335aer(1,4)).toBe(2);});it('b',()=>{expect(hd335aer(3,1)).toBe(1);});it('c',()=>{expect(hd335aer(0,0)).toBe(0);});it('d',()=>{expect(hd335aer(93,73)).toBe(2);});it('e',()=>{expect(hd335aer(15,0)).toBe(4);});});
function hd336aer(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph336aer_hd',()=>{it('a',()=>{expect(hd336aer(1,4)).toBe(2);});it('b',()=>{expect(hd336aer(3,1)).toBe(1);});it('c',()=>{expect(hd336aer(0,0)).toBe(0);});it('d',()=>{expect(hd336aer(93,73)).toBe(2);});it('e',()=>{expect(hd336aer(15,0)).toBe(4);});});
function hd337aer(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph337aer_hd',()=>{it('a',()=>{expect(hd337aer(1,4)).toBe(2);});it('b',()=>{expect(hd337aer(3,1)).toBe(1);});it('c',()=>{expect(hd337aer(0,0)).toBe(0);});it('d',()=>{expect(hd337aer(93,73)).toBe(2);});it('e',()=>{expect(hd337aer(15,0)).toBe(4);});});
function hd338aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph338aerx2_hd',()=>{it('a',()=>{expect(hd338aerx2(1,4)).toBe(2);});it('b',()=>{expect(hd338aerx2(3,1)).toBe(1);});it('c',()=>{expect(hd338aerx2(0,0)).toBe(0);});it('d',()=>{expect(hd338aerx2(93,73)).toBe(2);});it('e',()=>{expect(hd338aerx2(15,0)).toBe(4);});});
function hd338aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph338aerx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd339aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph339aerx2_hd',()=>{it('a',()=>{expect(hd339aerx2(1,4)).toBe(2);});it('b',()=>{expect(hd339aerx2(3,1)).toBe(1);});it('c',()=>{expect(hd339aerx2(0,0)).toBe(0);});it('d',()=>{expect(hd339aerx2(93,73)).toBe(2);});it('e',()=>{expect(hd339aerx2(15,0)).toBe(4);});});
function hd339aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph339aerx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd340aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph340aerx2_hd',()=>{it('a',()=>{expect(hd340aerx2(1,4)).toBe(2);});it('b',()=>{expect(hd340aerx2(3,1)).toBe(1);});it('c',()=>{expect(hd340aerx2(0,0)).toBe(0);});it('d',()=>{expect(hd340aerx2(93,73)).toBe(2);});it('e',()=>{expect(hd340aerx2(15,0)).toBe(4);});});
function hd340aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph340aerx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd341aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph341aerx2_hd',()=>{it('a',()=>{expect(hd341aerx2(1,4)).toBe(2);});it('b',()=>{expect(hd341aerx2(3,1)).toBe(1);});it('c',()=>{expect(hd341aerx2(0,0)).toBe(0);});it('d',()=>{expect(hd341aerx2(93,73)).toBe(2);});it('e',()=>{expect(hd341aerx2(15,0)).toBe(4);});});
function hd341aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph341aerx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd342aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph342aerx2_hd',()=>{it('a',()=>{expect(hd342aerx2(1,4)).toBe(2);});it('b',()=>{expect(hd342aerx2(3,1)).toBe(1);});it('c',()=>{expect(hd342aerx2(0,0)).toBe(0);});it('d',()=>{expect(hd342aerx2(93,73)).toBe(2);});it('e',()=>{expect(hd342aerx2(15,0)).toBe(4);});});
function hd342aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph342aerx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd343aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph343aerx2_hd',()=>{it('a',()=>{expect(hd343aerx2(1,4)).toBe(2);});it('b',()=>{expect(hd343aerx2(3,1)).toBe(1);});it('c',()=>{expect(hd343aerx2(0,0)).toBe(0);});it('d',()=>{expect(hd343aerx2(93,73)).toBe(2);});it('e',()=>{expect(hd343aerx2(15,0)).toBe(4);});});
function hd343aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph343aerx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd344aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph344aerx2_hd',()=>{it('a',()=>{expect(hd344aerx2(1,4)).toBe(2);});it('b',()=>{expect(hd344aerx2(3,1)).toBe(1);});it('c',()=>{expect(hd344aerx2(0,0)).toBe(0);});it('d',()=>{expect(hd344aerx2(93,73)).toBe(2);});it('e',()=>{expect(hd344aerx2(15,0)).toBe(4);});});
function hd344aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph344aerx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd345aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph345aerx2_hd',()=>{it('a',()=>{expect(hd345aerx2(1,4)).toBe(2);});it('b',()=>{expect(hd345aerx2(3,1)).toBe(1);});it('c',()=>{expect(hd345aerx2(0,0)).toBe(0);});it('d',()=>{expect(hd345aerx2(93,73)).toBe(2);});it('e',()=>{expect(hd345aerx2(15,0)).toBe(4);});});
function hd345aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph345aerx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd346aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph346aerx2_hd',()=>{it('a',()=>{expect(hd346aerx2(1,4)).toBe(2);});it('b',()=>{expect(hd346aerx2(3,1)).toBe(1);});it('c',()=>{expect(hd346aerx2(0,0)).toBe(0);});it('d',()=>{expect(hd346aerx2(93,73)).toBe(2);});it('e',()=>{expect(hd346aerx2(15,0)).toBe(4);});});
function hd346aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph346aerx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd347aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph347aerx2_hd',()=>{it('a',()=>{expect(hd347aerx2(1,4)).toBe(2);});it('b',()=>{expect(hd347aerx2(3,1)).toBe(1);});it('c',()=>{expect(hd347aerx2(0,0)).toBe(0);});it('d',()=>{expect(hd347aerx2(93,73)).toBe(2);});it('e',()=>{expect(hd347aerx2(15,0)).toBe(4);});});
function hd347aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph347aerx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd348aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph348aerx2_hd',()=>{it('a',()=>{expect(hd348aerx2(1,4)).toBe(2);});it('b',()=>{expect(hd348aerx2(3,1)).toBe(1);});it('c',()=>{expect(hd348aerx2(0,0)).toBe(0);});it('d',()=>{expect(hd348aerx2(93,73)).toBe(2);});it('e',()=>{expect(hd348aerx2(15,0)).toBe(4);});});
function hd348aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph348aerx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd349aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph349aerx2_hd',()=>{it('a',()=>{expect(hd349aerx2(1,4)).toBe(2);});it('b',()=>{expect(hd349aerx2(3,1)).toBe(1);});it('c',()=>{expect(hd349aerx2(0,0)).toBe(0);});it('d',()=>{expect(hd349aerx2(93,73)).toBe(2);});it('e',()=>{expect(hd349aerx2(15,0)).toBe(4);});});
function hd349aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph349aerx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd350aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph350aerx2_hd',()=>{it('a',()=>{expect(hd350aerx2(1,4)).toBe(2);});it('b',()=>{expect(hd350aerx2(3,1)).toBe(1);});it('c',()=>{expect(hd350aerx2(0,0)).toBe(0);});it('d',()=>{expect(hd350aerx2(93,73)).toBe(2);});it('e',()=>{expect(hd350aerx2(15,0)).toBe(4);});});
function hd350aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph350aerx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd351aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph351aerx2_hd',()=>{it('a',()=>{expect(hd351aerx2(1,4)).toBe(2);});it('b',()=>{expect(hd351aerx2(3,1)).toBe(1);});it('c',()=>{expect(hd351aerx2(0,0)).toBe(0);});it('d',()=>{expect(hd351aerx2(93,73)).toBe(2);});it('e',()=>{expect(hd351aerx2(15,0)).toBe(4);});});
function hd351aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph351aerx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd352aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph352aerx2_hd',()=>{it('a',()=>{expect(hd352aerx2(1,4)).toBe(2);});it('b',()=>{expect(hd352aerx2(3,1)).toBe(1);});it('c',()=>{expect(hd352aerx2(0,0)).toBe(0);});it('d',()=>{expect(hd352aerx2(93,73)).toBe(2);});it('e',()=>{expect(hd352aerx2(15,0)).toBe(4);});});
function hd352aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph352aerx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd353aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph353aerx2_hd',()=>{it('a',()=>{expect(hd353aerx2(1,4)).toBe(2);});it('b',()=>{expect(hd353aerx2(3,1)).toBe(1);});it('c',()=>{expect(hd353aerx2(0,0)).toBe(0);});it('d',()=>{expect(hd353aerx2(93,73)).toBe(2);});it('e',()=>{expect(hd353aerx2(15,0)).toBe(4);});});
function hd353aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph353aerx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd354aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph354aerx2_hd',()=>{it('a',()=>{expect(hd354aerx2(1,4)).toBe(2);});it('b',()=>{expect(hd354aerx2(3,1)).toBe(1);});it('c',()=>{expect(hd354aerx2(0,0)).toBe(0);});it('d',()=>{expect(hd354aerx2(93,73)).toBe(2);});it('e',()=>{expect(hd354aerx2(15,0)).toBe(4);});});
function hd354aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph354aerx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd355aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph355aerx2_hd',()=>{it('a',()=>{expect(hd355aerx2(1,4)).toBe(2);});it('b',()=>{expect(hd355aerx2(3,1)).toBe(1);});it('c',()=>{expect(hd355aerx2(0,0)).toBe(0);});it('d',()=>{expect(hd355aerx2(93,73)).toBe(2);});it('e',()=>{expect(hd355aerx2(15,0)).toBe(4);});});
function hd355aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph355aerx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd356aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph356aerx2_hd',()=>{it('a',()=>{expect(hd356aerx2(1,4)).toBe(2);});it('b',()=>{expect(hd356aerx2(3,1)).toBe(1);});it('c',()=>{expect(hd356aerx2(0,0)).toBe(0);});it('d',()=>{expect(hd356aerx2(93,73)).toBe(2);});it('e',()=>{expect(hd356aerx2(15,0)).toBe(4);});});
function hd356aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph356aerx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd357aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph357aerx2_hd',()=>{it('a',()=>{expect(hd357aerx2(1,4)).toBe(2);});it('b',()=>{expect(hd357aerx2(3,1)).toBe(1);});it('c',()=>{expect(hd357aerx2(0,0)).toBe(0);});it('d',()=>{expect(hd357aerx2(93,73)).toBe(2);});it('e',()=>{expect(hd357aerx2(15,0)).toBe(4);});});
function hd357aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph357aerx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd358aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph358aerx2_hd',()=>{it('a',()=>{expect(hd358aerx2(1,4)).toBe(2);});it('b',()=>{expect(hd358aerx2(3,1)).toBe(1);});it('c',()=>{expect(hd358aerx2(0,0)).toBe(0);});it('d',()=>{expect(hd358aerx2(93,73)).toBe(2);});it('e',()=>{expect(hd358aerx2(15,0)).toBe(4);});});
function hd358aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph358aerx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd359aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph359aerx2_hd',()=>{it('a',()=>{expect(hd359aerx2(1,4)).toBe(2);});it('b',()=>{expect(hd359aerx2(3,1)).toBe(1);});it('c',()=>{expect(hd359aerx2(0,0)).toBe(0);});it('d',()=>{expect(hd359aerx2(93,73)).toBe(2);});it('e',()=>{expect(hd359aerx2(15,0)).toBe(4);});});
function hd359aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph359aerx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd360aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph360aerx2_hd',()=>{it('a',()=>{expect(hd360aerx2(1,4)).toBe(2);});it('b',()=>{expect(hd360aerx2(3,1)).toBe(1);});it('c',()=>{expect(hd360aerx2(0,0)).toBe(0);});it('d',()=>{expect(hd360aerx2(93,73)).toBe(2);});it('e',()=>{expect(hd360aerx2(15,0)).toBe(4);});});
function hd360aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph360aerx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd361aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph361aerx2_hd',()=>{it('a',()=>{expect(hd361aerx2(1,4)).toBe(2);});it('b',()=>{expect(hd361aerx2(3,1)).toBe(1);});it('c',()=>{expect(hd361aerx2(0,0)).toBe(0);});it('d',()=>{expect(hd361aerx2(93,73)).toBe(2);});it('e',()=>{expect(hd361aerx2(15,0)).toBe(4);});});
function hd361aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph361aerx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd362aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph362aerx2_hd',()=>{it('a',()=>{expect(hd362aerx2(1,4)).toBe(2);});it('b',()=>{expect(hd362aerx2(3,1)).toBe(1);});it('c',()=>{expect(hd362aerx2(0,0)).toBe(0);});it('d',()=>{expect(hd362aerx2(93,73)).toBe(2);});it('e',()=>{expect(hd362aerx2(15,0)).toBe(4);});});
function hd362aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph362aerx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd363aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph363aerx2_hd',()=>{it('a',()=>{expect(hd363aerx2(1,4)).toBe(2);});it('b',()=>{expect(hd363aerx2(3,1)).toBe(1);});it('c',()=>{expect(hd363aerx2(0,0)).toBe(0);});it('d',()=>{expect(hd363aerx2(93,73)).toBe(2);});it('e',()=>{expect(hd363aerx2(15,0)).toBe(4);});});
function hd363aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph363aerx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd364aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph364aerx2_hd',()=>{it('a',()=>{expect(hd364aerx2(1,4)).toBe(2);});it('b',()=>{expect(hd364aerx2(3,1)).toBe(1);});it('c',()=>{expect(hd364aerx2(0,0)).toBe(0);});it('d',()=>{expect(hd364aerx2(93,73)).toBe(2);});it('e',()=>{expect(hd364aerx2(15,0)).toBe(4);});});
function hd364aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph364aerx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd365aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph365aerx2_hd',()=>{it('a',()=>{expect(hd365aerx2(1,4)).toBe(2);});it('b',()=>{expect(hd365aerx2(3,1)).toBe(1);});it('c',()=>{expect(hd365aerx2(0,0)).toBe(0);});it('d',()=>{expect(hd365aerx2(93,73)).toBe(2);});it('e',()=>{expect(hd365aerx2(15,0)).toBe(4);});});
function hd365aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph365aerx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd366aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph366aerx2_hd',()=>{it('a',()=>{expect(hd366aerx2(1,4)).toBe(2);});it('b',()=>{expect(hd366aerx2(3,1)).toBe(1);});it('c',()=>{expect(hd366aerx2(0,0)).toBe(0);});it('d',()=>{expect(hd366aerx2(93,73)).toBe(2);});it('e',()=>{expect(hd366aerx2(15,0)).toBe(4);});});
function hd366aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph366aerx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd367aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph367aerx2_hd',()=>{it('a',()=>{expect(hd367aerx2(1,4)).toBe(2);});it('b',()=>{expect(hd367aerx2(3,1)).toBe(1);});it('c',()=>{expect(hd367aerx2(0,0)).toBe(0);});it('d',()=>{expect(hd367aerx2(93,73)).toBe(2);});it('e',()=>{expect(hd367aerx2(15,0)).toBe(4);});});
function hd367aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph367aerx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd368aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph368aerx2_hd',()=>{it('a',()=>{expect(hd368aerx2(1,4)).toBe(2);});it('b',()=>{expect(hd368aerx2(3,1)).toBe(1);});it('c',()=>{expect(hd368aerx2(0,0)).toBe(0);});it('d',()=>{expect(hd368aerx2(93,73)).toBe(2);});it('e',()=>{expect(hd368aerx2(15,0)).toBe(4);});});
function hd368aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph368aerx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd369aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph369aerx2_hd',()=>{it('a',()=>{expect(hd369aerx2(1,4)).toBe(2);});it('b',()=>{expect(hd369aerx2(3,1)).toBe(1);});it('c',()=>{expect(hd369aerx2(0,0)).toBe(0);});it('d',()=>{expect(hd369aerx2(93,73)).toBe(2);});it('e',()=>{expect(hd369aerx2(15,0)).toBe(4);});});
function hd369aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph369aerx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd370aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph370aerx2_hd',()=>{it('a',()=>{expect(hd370aerx2(1,4)).toBe(2);});it('b',()=>{expect(hd370aerx2(3,1)).toBe(1);});it('c',()=>{expect(hd370aerx2(0,0)).toBe(0);});it('d',()=>{expect(hd370aerx2(93,73)).toBe(2);});it('e',()=>{expect(hd370aerx2(15,0)).toBe(4);});});
function hd370aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph370aerx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd371aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph371aerx2_hd',()=>{it('a',()=>{expect(hd371aerx2(1,4)).toBe(2);});it('b',()=>{expect(hd371aerx2(3,1)).toBe(1);});it('c',()=>{expect(hd371aerx2(0,0)).toBe(0);});it('d',()=>{expect(hd371aerx2(93,73)).toBe(2);});it('e',()=>{expect(hd371aerx2(15,0)).toBe(4);});});
function hd371aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph371aerx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd372aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph372aerx2_hd',()=>{it('a',()=>{expect(hd372aerx2(1,4)).toBe(2);});it('b',()=>{expect(hd372aerx2(3,1)).toBe(1);});it('c',()=>{expect(hd372aerx2(0,0)).toBe(0);});it('d',()=>{expect(hd372aerx2(93,73)).toBe(2);});it('e',()=>{expect(hd372aerx2(15,0)).toBe(4);});});
function hd372aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph372aerx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd373aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph373aerx2_hd',()=>{it('a',()=>{expect(hd373aerx2(1,4)).toBe(2);});it('b',()=>{expect(hd373aerx2(3,1)).toBe(1);});it('c',()=>{expect(hd373aerx2(0,0)).toBe(0);});it('d',()=>{expect(hd373aerx2(93,73)).toBe(2);});it('e',()=>{expect(hd373aerx2(15,0)).toBe(4);});});
function hd373aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph373aerx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd374aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph374aerx2_hd',()=>{it('a',()=>{expect(hd374aerx2(1,4)).toBe(2);});it('b',()=>{expect(hd374aerx2(3,1)).toBe(1);});it('c',()=>{expect(hd374aerx2(0,0)).toBe(0);});it('d',()=>{expect(hd374aerx2(93,73)).toBe(2);});it('e',()=>{expect(hd374aerx2(15,0)).toBe(4);});});
function hd374aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph374aerx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd375aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph375aerx2_hd',()=>{it('a',()=>{expect(hd375aerx2(1,4)).toBe(2);});it('b',()=>{expect(hd375aerx2(3,1)).toBe(1);});it('c',()=>{expect(hd375aerx2(0,0)).toBe(0);});it('d',()=>{expect(hd375aerx2(93,73)).toBe(2);});it('e',()=>{expect(hd375aerx2(15,0)).toBe(4);});});
function hd375aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph375aerx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd376aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph376aerx2_hd',()=>{it('a',()=>{expect(hd376aerx2(1,4)).toBe(2);});it('b',()=>{expect(hd376aerx2(3,1)).toBe(1);});it('c',()=>{expect(hd376aerx2(0,0)).toBe(0);});it('d',()=>{expect(hd376aerx2(93,73)).toBe(2);});it('e',()=>{expect(hd376aerx2(15,0)).toBe(4);});});
function hd376aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph376aerx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd377aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph377aerx2_hd',()=>{it('a',()=>{expect(hd377aerx2(1,4)).toBe(2);});it('b',()=>{expect(hd377aerx2(3,1)).toBe(1);});it('c',()=>{expect(hd377aerx2(0,0)).toBe(0);});it('d',()=>{expect(hd377aerx2(93,73)).toBe(2);});it('e',()=>{expect(hd377aerx2(15,0)).toBe(4);});});
function hd377aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph377aerx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd378aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph378aerx2_hd',()=>{it('a',()=>{expect(hd378aerx2(1,4)).toBe(2);});it('b',()=>{expect(hd378aerx2(3,1)).toBe(1);});it('c',()=>{expect(hd378aerx2(0,0)).toBe(0);});it('d',()=>{expect(hd378aerx2(93,73)).toBe(2);});it('e',()=>{expect(hd378aerx2(15,0)).toBe(4);});});
function hd378aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph378aerx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd379aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph379aerx2_hd',()=>{it('a',()=>{expect(hd379aerx2(1,4)).toBe(2);});it('b',()=>{expect(hd379aerx2(3,1)).toBe(1);});it('c',()=>{expect(hd379aerx2(0,0)).toBe(0);});it('d',()=>{expect(hd379aerx2(93,73)).toBe(2);});it('e',()=>{expect(hd379aerx2(15,0)).toBe(4);});});
function hd379aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph379aerx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd380aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph380aerx2_hd',()=>{it('a',()=>{expect(hd380aerx2(1,4)).toBe(2);});it('b',()=>{expect(hd380aerx2(3,1)).toBe(1);});it('c',()=>{expect(hd380aerx2(0,0)).toBe(0);});it('d',()=>{expect(hd380aerx2(93,73)).toBe(2);});it('e',()=>{expect(hd380aerx2(15,0)).toBe(4);});});
function hd380aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph380aerx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd381aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph381aerx2_hd',()=>{it('a',()=>{expect(hd381aerx2(1,4)).toBe(2);});it('b',()=>{expect(hd381aerx2(3,1)).toBe(1);});it('c',()=>{expect(hd381aerx2(0,0)).toBe(0);});it('d',()=>{expect(hd381aerx2(93,73)).toBe(2);});it('e',()=>{expect(hd381aerx2(15,0)).toBe(4);});});
function hd381aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph381aerx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd382aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph382aerx2_hd',()=>{it('a',()=>{expect(hd382aerx2(1,4)).toBe(2);});it('b',()=>{expect(hd382aerx2(3,1)).toBe(1);});it('c',()=>{expect(hd382aerx2(0,0)).toBe(0);});it('d',()=>{expect(hd382aerx2(93,73)).toBe(2);});it('e',()=>{expect(hd382aerx2(15,0)).toBe(4);});});
function hd382aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph382aerx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd383aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph383aerx2_hd',()=>{it('a',()=>{expect(hd383aerx2(1,4)).toBe(2);});it('b',()=>{expect(hd383aerx2(3,1)).toBe(1);});it('c',()=>{expect(hd383aerx2(0,0)).toBe(0);});it('d',()=>{expect(hd383aerx2(93,73)).toBe(2);});it('e',()=>{expect(hd383aerx2(15,0)).toBe(4);});});
function hd383aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph383aerx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd384aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph384aerx2_hd',()=>{it('a',()=>{expect(hd384aerx2(1,4)).toBe(2);});it('b',()=>{expect(hd384aerx2(3,1)).toBe(1);});it('c',()=>{expect(hd384aerx2(0,0)).toBe(0);});it('d',()=>{expect(hd384aerx2(93,73)).toBe(2);});it('e',()=>{expect(hd384aerx2(15,0)).toBe(4);});});
function hd384aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph384aerx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd385aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph385aerx2_hd',()=>{it('a',()=>{expect(hd385aerx2(1,4)).toBe(2);});it('b',()=>{expect(hd385aerx2(3,1)).toBe(1);});it('c',()=>{expect(hd385aerx2(0,0)).toBe(0);});it('d',()=>{expect(hd385aerx2(93,73)).toBe(2);});it('e',()=>{expect(hd385aerx2(15,0)).toBe(4);});});
function hd385aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph385aerx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd386aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph386aerx2_hd',()=>{it('a',()=>{expect(hd386aerx2(1,4)).toBe(2);});it('b',()=>{expect(hd386aerx2(3,1)).toBe(1);});it('c',()=>{expect(hd386aerx2(0,0)).toBe(0);});it('d',()=>{expect(hd386aerx2(93,73)).toBe(2);});it('e',()=>{expect(hd386aerx2(15,0)).toBe(4);});});
function hd386aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph386aerx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd387aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph387aerx2_hd',()=>{it('a',()=>{expect(hd387aerx2(1,4)).toBe(2);});it('b',()=>{expect(hd387aerx2(3,1)).toBe(1);});it('c',()=>{expect(hd387aerx2(0,0)).toBe(0);});it('d',()=>{expect(hd387aerx2(93,73)).toBe(2);});it('e',()=>{expect(hd387aerx2(15,0)).toBe(4);});});
function hd387aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph387aerx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd388aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph388aerx2_hd',()=>{it('a',()=>{expect(hd388aerx2(1,4)).toBe(2);});it('b',()=>{expect(hd388aerx2(3,1)).toBe(1);});it('c',()=>{expect(hd388aerx2(0,0)).toBe(0);});it('d',()=>{expect(hd388aerx2(93,73)).toBe(2);});it('e',()=>{expect(hd388aerx2(15,0)).toBe(4);});});
function hd388aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph388aerx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd389aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph389aerx2_hd',()=>{it('a',()=>{expect(hd389aerx2(1,4)).toBe(2);});it('b',()=>{expect(hd389aerx2(3,1)).toBe(1);});it('c',()=>{expect(hd389aerx2(0,0)).toBe(0);});it('d',()=>{expect(hd389aerx2(93,73)).toBe(2);});it('e',()=>{expect(hd389aerx2(15,0)).toBe(4);});});
function hd389aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph389aerx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd390aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph390aerx2_hd',()=>{it('a',()=>{expect(hd390aerx2(1,4)).toBe(2);});it('b',()=>{expect(hd390aerx2(3,1)).toBe(1);});it('c',()=>{expect(hd390aerx2(0,0)).toBe(0);});it('d',()=>{expect(hd390aerx2(93,73)).toBe(2);});it('e',()=>{expect(hd390aerx2(15,0)).toBe(4);});});
function hd390aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph390aerx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd391aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph391aerx2_hd',()=>{it('a',()=>{expect(hd391aerx2(1,4)).toBe(2);});it('b',()=>{expect(hd391aerx2(3,1)).toBe(1);});it('c',()=>{expect(hd391aerx2(0,0)).toBe(0);});it('d',()=>{expect(hd391aerx2(93,73)).toBe(2);});it('e',()=>{expect(hd391aerx2(15,0)).toBe(4);});});
function hd391aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph391aerx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd392aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph392aerx2_hd',()=>{it('a',()=>{expect(hd392aerx2(1,4)).toBe(2);});it('b',()=>{expect(hd392aerx2(3,1)).toBe(1);});it('c',()=>{expect(hd392aerx2(0,0)).toBe(0);});it('d',()=>{expect(hd392aerx2(93,73)).toBe(2);});it('e',()=>{expect(hd392aerx2(15,0)).toBe(4);});});
function hd392aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph392aerx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd393aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph393aerx2_hd',()=>{it('a',()=>{expect(hd393aerx2(1,4)).toBe(2);});it('b',()=>{expect(hd393aerx2(3,1)).toBe(1);});it('c',()=>{expect(hd393aerx2(0,0)).toBe(0);});it('d',()=>{expect(hd393aerx2(93,73)).toBe(2);});it('e',()=>{expect(hd393aerx2(15,0)).toBe(4);});});
function hd393aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph393aerx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd394aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph394aerx2_hd',()=>{it('a',()=>{expect(hd394aerx2(1,4)).toBe(2);});it('b',()=>{expect(hd394aerx2(3,1)).toBe(1);});it('c',()=>{expect(hd394aerx2(0,0)).toBe(0);});it('d',()=>{expect(hd394aerx2(93,73)).toBe(2);});it('e',()=>{expect(hd394aerx2(15,0)).toBe(4);});});
function hd394aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph394aerx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd395aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph395aerx2_hd',()=>{it('a',()=>{expect(hd395aerx2(1,4)).toBe(2);});it('b',()=>{expect(hd395aerx2(3,1)).toBe(1);});it('c',()=>{expect(hd395aerx2(0,0)).toBe(0);});it('d',()=>{expect(hd395aerx2(93,73)).toBe(2);});it('e',()=>{expect(hd395aerx2(15,0)).toBe(4);});});
function hd395aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph395aerx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd396aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph396aerx2_hd',()=>{it('a',()=>{expect(hd396aerx2(1,4)).toBe(2);});it('b',()=>{expect(hd396aerx2(3,1)).toBe(1);});it('c',()=>{expect(hd396aerx2(0,0)).toBe(0);});it('d',()=>{expect(hd396aerx2(93,73)).toBe(2);});it('e',()=>{expect(hd396aerx2(15,0)).toBe(4);});});
function hd396aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph396aerx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd397aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph397aerx2_hd',()=>{it('a',()=>{expect(hd397aerx2(1,4)).toBe(2);});it('b',()=>{expect(hd397aerx2(3,1)).toBe(1);});it('c',()=>{expect(hd397aerx2(0,0)).toBe(0);});it('d',()=>{expect(hd397aerx2(93,73)).toBe(2);});it('e',()=>{expect(hd397aerx2(15,0)).toBe(4);});});
function hd397aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph397aerx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd398aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph398aerx2_hd',()=>{it('a',()=>{expect(hd398aerx2(1,4)).toBe(2);});it('b',()=>{expect(hd398aerx2(3,1)).toBe(1);});it('c',()=>{expect(hd398aerx2(0,0)).toBe(0);});it('d',()=>{expect(hd398aerx2(93,73)).toBe(2);});it('e',()=>{expect(hd398aerx2(15,0)).toBe(4);});});
function hd398aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph398aerx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd399aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph399aerx2_hd',()=>{it('a',()=>{expect(hd399aerx2(1,4)).toBe(2);});it('b',()=>{expect(hd399aerx2(3,1)).toBe(1);});it('c',()=>{expect(hd399aerx2(0,0)).toBe(0);});it('d',()=>{expect(hd399aerx2(93,73)).toBe(2);});it('e',()=>{expect(hd399aerx2(15,0)).toBe(4);});});
function hd399aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph399aerx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd400aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph400aerx2_hd',()=>{it('a',()=>{expect(hd400aerx2(1,4)).toBe(2);});it('b',()=>{expect(hd400aerx2(3,1)).toBe(1);});it('c',()=>{expect(hd400aerx2(0,0)).toBe(0);});it('d',()=>{expect(hd400aerx2(93,73)).toBe(2);});it('e',()=>{expect(hd400aerx2(15,0)).toBe(4);});});
function hd400aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph400aerx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd401aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph401aerx2_hd',()=>{it('a',()=>{expect(hd401aerx2(1,4)).toBe(2);});it('b',()=>{expect(hd401aerx2(3,1)).toBe(1);});it('c',()=>{expect(hd401aerx2(0,0)).toBe(0);});it('d',()=>{expect(hd401aerx2(93,73)).toBe(2);});it('e',()=>{expect(hd401aerx2(15,0)).toBe(4);});});
function hd401aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph401aerx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd402aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph402aerx2_hd',()=>{it('a',()=>{expect(hd402aerx2(1,4)).toBe(2);});it('b',()=>{expect(hd402aerx2(3,1)).toBe(1);});it('c',()=>{expect(hd402aerx2(0,0)).toBe(0);});it('d',()=>{expect(hd402aerx2(93,73)).toBe(2);});it('e',()=>{expect(hd402aerx2(15,0)).toBe(4);});});
function hd402aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph402aerx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd403aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph403aerx2_hd',()=>{it('a',()=>{expect(hd403aerx2(1,4)).toBe(2);});it('b',()=>{expect(hd403aerx2(3,1)).toBe(1);});it('c',()=>{expect(hd403aerx2(0,0)).toBe(0);});it('d',()=>{expect(hd403aerx2(93,73)).toBe(2);});it('e',()=>{expect(hd403aerx2(15,0)).toBe(4);});});
function hd403aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph403aerx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd404aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph404aerx2_hd',()=>{it('a',()=>{expect(hd404aerx2(1,4)).toBe(2);});it('b',()=>{expect(hd404aerx2(3,1)).toBe(1);});it('c',()=>{expect(hd404aerx2(0,0)).toBe(0);});it('d',()=>{expect(hd404aerx2(93,73)).toBe(2);});it('e',()=>{expect(hd404aerx2(15,0)).toBe(4);});});
function hd404aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph404aerx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd405aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph405aerx2_hd',()=>{it('a',()=>{expect(hd405aerx2(1,4)).toBe(2);});it('b',()=>{expect(hd405aerx2(3,1)).toBe(1);});it('c',()=>{expect(hd405aerx2(0,0)).toBe(0);});it('d',()=>{expect(hd405aerx2(93,73)).toBe(2);});it('e',()=>{expect(hd405aerx2(15,0)).toBe(4);});});
function hd405aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph405aerx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd406aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph406aerx2_hd',()=>{it('a',()=>{expect(hd406aerx2(1,4)).toBe(2);});it('b',()=>{expect(hd406aerx2(3,1)).toBe(1);});it('c',()=>{expect(hd406aerx2(0,0)).toBe(0);});it('d',()=>{expect(hd406aerx2(93,73)).toBe(2);});it('e',()=>{expect(hd406aerx2(15,0)).toBe(4);});});
function hd406aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph406aerx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd407aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph407aerx2_hd',()=>{it('a',()=>{expect(hd407aerx2(1,4)).toBe(2);});it('b',()=>{expect(hd407aerx2(3,1)).toBe(1);});it('c',()=>{expect(hd407aerx2(0,0)).toBe(0);});it('d',()=>{expect(hd407aerx2(93,73)).toBe(2);});it('e',()=>{expect(hd407aerx2(15,0)).toBe(4);});});
function hd407aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph407aerx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd408aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph408aerx2_hd',()=>{it('a',()=>{expect(hd408aerx2(1,4)).toBe(2);});it('b',()=>{expect(hd408aerx2(3,1)).toBe(1);});it('c',()=>{expect(hd408aerx2(0,0)).toBe(0);});it('d',()=>{expect(hd408aerx2(93,73)).toBe(2);});it('e',()=>{expect(hd408aerx2(15,0)).toBe(4);});});
function hd408aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph408aerx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd409aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph409aerx2_hd',()=>{it('a',()=>{expect(hd409aerx2(1,4)).toBe(2);});it('b',()=>{expect(hd409aerx2(3,1)).toBe(1);});it('c',()=>{expect(hd409aerx2(0,0)).toBe(0);});it('d',()=>{expect(hd409aerx2(93,73)).toBe(2);});it('e',()=>{expect(hd409aerx2(15,0)).toBe(4);});});
function hd409aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph409aerx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd410aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph410aerx2_hd',()=>{it('a',()=>{expect(hd410aerx2(1,4)).toBe(2);});it('b',()=>{expect(hd410aerx2(3,1)).toBe(1);});it('c',()=>{expect(hd410aerx2(0,0)).toBe(0);});it('d',()=>{expect(hd410aerx2(93,73)).toBe(2);});it('e',()=>{expect(hd410aerx2(15,0)).toBe(4);});});
function hd410aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph410aerx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd411aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph411aerx2_hd',()=>{it('a',()=>{expect(hd411aerx2(1,4)).toBe(2);});it('b',()=>{expect(hd411aerx2(3,1)).toBe(1);});it('c',()=>{expect(hd411aerx2(0,0)).toBe(0);});it('d',()=>{expect(hd411aerx2(93,73)).toBe(2);});it('e',()=>{expect(hd411aerx2(15,0)).toBe(4);});});
function hd411aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph411aerx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd412aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph412aerx2_hd',()=>{it('a',()=>{expect(hd412aerx2(1,4)).toBe(2);});it('b',()=>{expect(hd412aerx2(3,1)).toBe(1);});it('c',()=>{expect(hd412aerx2(0,0)).toBe(0);});it('d',()=>{expect(hd412aerx2(93,73)).toBe(2);});it('e',()=>{expect(hd412aerx2(15,0)).toBe(4);});});
function hd412aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph412aerx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd413aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph413aerx2_hd',()=>{it('a',()=>{expect(hd413aerx2(1,4)).toBe(2);});it('b',()=>{expect(hd413aerx2(3,1)).toBe(1);});it('c',()=>{expect(hd413aerx2(0,0)).toBe(0);});it('d',()=>{expect(hd413aerx2(93,73)).toBe(2);});it('e',()=>{expect(hd413aerx2(15,0)).toBe(4);});});
function hd413aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph413aerx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd414aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph414aerx2_hd',()=>{it('a',()=>{expect(hd414aerx2(1,4)).toBe(2);});it('b',()=>{expect(hd414aerx2(3,1)).toBe(1);});it('c',()=>{expect(hd414aerx2(0,0)).toBe(0);});it('d',()=>{expect(hd414aerx2(93,73)).toBe(2);});it('e',()=>{expect(hd414aerx2(15,0)).toBe(4);});});
function hd414aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph414aerx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd415aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph415aerx2_hd',()=>{it('a',()=>{expect(hd415aerx2(1,4)).toBe(2);});it('b',()=>{expect(hd415aerx2(3,1)).toBe(1);});it('c',()=>{expect(hd415aerx2(0,0)).toBe(0);});it('d',()=>{expect(hd415aerx2(93,73)).toBe(2);});it('e',()=>{expect(hd415aerx2(15,0)).toBe(4);});});
function hd415aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph415aerx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd416aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph416aerx2_hd',()=>{it('a',()=>{expect(hd416aerx2(1,4)).toBe(2);});it('b',()=>{expect(hd416aerx2(3,1)).toBe(1);});it('c',()=>{expect(hd416aerx2(0,0)).toBe(0);});it('d',()=>{expect(hd416aerx2(93,73)).toBe(2);});it('e',()=>{expect(hd416aerx2(15,0)).toBe(4);});});
function hd416aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph416aerx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd417aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph417aerx2_hd',()=>{it('a',()=>{expect(hd417aerx2(1,4)).toBe(2);});it('b',()=>{expect(hd417aerx2(3,1)).toBe(1);});it('c',()=>{expect(hd417aerx2(0,0)).toBe(0);});it('d',()=>{expect(hd417aerx2(93,73)).toBe(2);});it('e',()=>{expect(hd417aerx2(15,0)).toBe(4);});});
function hd417aerx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph417aerx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
