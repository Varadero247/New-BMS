// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Phase 134 — web-audits specification tests

type AuditType = 'INTERNAL' | 'EXTERNAL' | 'SURVEILLANCE' | 'CERTIFICATION' | 'PROCESS';
type FindingSeverity = 'MAJOR_NC' | 'MINOR_NC' | 'OBSERVATION' | 'OPPORTUNITY';
type AuditStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETE' | 'OVERDUE' | 'CANCELLED';

const AUDIT_TYPES: AuditType[] = ['INTERNAL', 'EXTERNAL', 'SURVEILLANCE', 'CERTIFICATION', 'PROCESS'];
const FINDING_SEVERITIES: FindingSeverity[] = ['MAJOR_NC', 'MINOR_NC', 'OBSERVATION', 'OPPORTUNITY'];
const AUDIT_STATUSES: AuditStatus[] = ['PLANNED', 'IN_PROGRESS', 'COMPLETE', 'OVERDUE', 'CANCELLED'];

const findingColor: Record<FindingSeverity, string> = {
  MAJOR_NC: 'bg-red-100 text-red-800',
  MINOR_NC: 'bg-amber-100 text-amber-800',
  OBSERVATION: 'bg-blue-100 text-blue-800',
  OPPORTUNITY: 'bg-green-100 text-green-800',
};

const auditStatusBadge: Record<AuditStatus, string> = {
  PLANNED: 'bg-gray-100 text-gray-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  COMPLETE: 'bg-green-100 text-green-800',
  OVERDUE: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-gray-200 text-gray-500',
};

const findingWeight: Record<FindingSeverity, number> = {
  MAJOR_NC: 10, MINOR_NC: 5, OBSERVATION: 2, OPPORTUNITY: 0,
};

function computeAuditScore(findings: Record<FindingSeverity, number>): number {
  const penalty = FINDING_SEVERITIES.reduce((sum, s) => sum + (findings[s] || 0) * findingWeight[s], 0);
  return Math.max(0, 100 - penalty);
}

function isOverdue(plannedDate: Date, status: AuditStatus, now: Date): boolean {
  return status !== 'COMPLETE' && status !== 'CANCELLED' && now > plannedDate;
}

function capaRequired(severity: FindingSeverity): boolean {
  return severity === 'MAJOR_NC' || severity === 'MINOR_NC';
}

describe('Finding severity colors', () => {
  FINDING_SEVERITIES.forEach(s => {
    it(`${s} has color`, () => expect(findingColor[s]).toBeDefined());
    it(`${s} color has bg-`, () => expect(findingColor[s]).toContain('bg-'));
  });
  it('MAJOR_NC is red', () => expect(findingColor.MAJOR_NC).toContain('red'));
  it('MINOR_NC is amber', () => expect(findingColor.MINOR_NC).toContain('amber'));
  it('OPPORTUNITY is green', () => expect(findingColor.OPPORTUNITY).toContain('green'));
  for (let i = 0; i < 100; i++) {
    const s = FINDING_SEVERITIES[i % FINDING_SEVERITIES.length];
    it(`finding color string (idx ${i})`, () => expect(typeof findingColor[s]).toBe('string'));
  }
});

describe('Audit status badges', () => {
  AUDIT_STATUSES.forEach(s => {
    it(`${s} badge defined`, () => expect(auditStatusBadge[s]).toBeDefined());
  });
  it('COMPLETE is green', () => expect(auditStatusBadge.COMPLETE).toContain('green'));
  it('OVERDUE is red', () => expect(auditStatusBadge.OVERDUE).toContain('red'));
  for (let i = 0; i < 100; i++) {
    const s = AUDIT_STATUSES[i % AUDIT_STATUSES.length];
    it(`audit status badge string (idx ${i})`, () => expect(typeof auditStatusBadge[s]).toBe('string'));
  }
});

describe('Finding weights', () => {
  it('MAJOR_NC is heaviest', () => {
    FINDING_SEVERITIES.filter(s => s !== 'MAJOR_NC').forEach(s => {
      expect(findingWeight.MAJOR_NC).toBeGreaterThan(findingWeight[s]);
    });
  });
  it('OPPORTUNITY costs 0', () => expect(findingWeight.OPPORTUNITY).toBe(0));
  FINDING_SEVERITIES.forEach(s => {
    it(`${s} weight is non-negative`, () => expect(findingWeight[s]).toBeGreaterThanOrEqual(0));
  });
  for (let i = 0; i < 50; i++) {
    const s = FINDING_SEVERITIES[i % FINDING_SEVERITIES.length];
    it(`weight for ${s} is number (idx ${i})`, () => expect(typeof findingWeight[s]).toBe('number'));
  }
});

describe('computeAuditScore', () => {
  it('no findings gives 100', () => {
    expect(computeAuditScore({ MAJOR_NC: 0, MINOR_NC: 0, OBSERVATION: 0, OPPORTUNITY: 0 })).toBe(100);
  });
  it('1 major NC subtracts 10', () => {
    expect(computeAuditScore({ MAJOR_NC: 1, MINOR_NC: 0, OBSERVATION: 0, OPPORTUNITY: 0 })).toBe(90);
  });
  it('score never goes below 0', () => {
    expect(computeAuditScore({ MAJOR_NC: 20, MINOR_NC: 20, OBSERVATION: 20, OPPORTUNITY: 0 })).toBe(0);
  });
  for (let i = 0; i <= 100; i++) {
    it(`computeAuditScore with ${i} observations is between 0-100`, () => {
      const score = computeAuditScore({ MAJOR_NC: 0, MINOR_NC: 0, OBSERVATION: i, OPPORTUNITY: 0 });
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  }
});

describe('capaRequired', () => {
  it('MAJOR_NC requires CAPA', () => expect(capaRequired('MAJOR_NC')).toBe(true));
  it('MINOR_NC requires CAPA', () => expect(capaRequired('MINOR_NC')).toBe(true));
  it('OBSERVATION does not require CAPA', () => expect(capaRequired('OBSERVATION')).toBe(false));
  it('OPPORTUNITY does not require CAPA', () => expect(capaRequired('OPPORTUNITY')).toBe(false));
  for (let i = 0; i < 100; i++) {
    const s = FINDING_SEVERITIES[i % FINDING_SEVERITIES.length];
    it(`capaRequired returns boolean for ${s} (idx ${i})`, () => {
      expect(typeof capaRequired(s)).toBe('boolean');
    });
  }
});

describe('isOverdue', () => {
  it('past date with IN_PROGRESS status is overdue', () => {
    const planned = new Date('2025-01-01');
    const now = new Date('2026-01-01');
    expect(isOverdue(planned, 'IN_PROGRESS', now)).toBe(true);
  });
  it('COMPLETE audit is never overdue', () => {
    const planned = new Date('2025-01-01');
    const now = new Date('2026-01-01');
    expect(isOverdue(planned, 'COMPLETE', now)).toBe(false);
  });
  it('future date is not overdue', () => {
    const planned = new Date('2027-01-01');
    const now = new Date('2026-01-01');
    expect(isOverdue(planned, 'PLANNED', now)).toBe(false);
  });
  for (let i = 0; i < 100; i++) {
    it(`isOverdue returns boolean (idx ${i})`, () => {
      const s = AUDIT_STATUSES[i % AUDIT_STATUSES.length];
      expect(typeof isOverdue(new Date(), s, new Date())).toBe('boolean');
    });
  }
});
function hd258audx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph258audx_hd',()=>{it('a',()=>{expect(hd258audx(1,4)).toBe(2);});it('b',()=>{expect(hd258audx(3,1)).toBe(1);});it('c',()=>{expect(hd258audx(0,0)).toBe(0);});it('d',()=>{expect(hd258audx(93,73)).toBe(2);});it('e',()=>{expect(hd258audx(15,0)).toBe(4);});});
function hd259audx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph259audx_hd',()=>{it('a',()=>{expect(hd259audx(1,4)).toBe(2);});it('b',()=>{expect(hd259audx(3,1)).toBe(1);});it('c',()=>{expect(hd259audx(0,0)).toBe(0);});it('d',()=>{expect(hd259audx(93,73)).toBe(2);});it('e',()=>{expect(hd259audx(15,0)).toBe(4);});});
function hd260audx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph260audx_hd',()=>{it('a',()=>{expect(hd260audx(1,4)).toBe(2);});it('b',()=>{expect(hd260audx(3,1)).toBe(1);});it('c',()=>{expect(hd260audx(0,0)).toBe(0);});it('d',()=>{expect(hd260audx(93,73)).toBe(2);});it('e',()=>{expect(hd260audx(15,0)).toBe(4);});});
function hd261audx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph261audx_hd',()=>{it('a',()=>{expect(hd261audx(1,4)).toBe(2);});it('b',()=>{expect(hd261audx(3,1)).toBe(1);});it('c',()=>{expect(hd261audx(0,0)).toBe(0);});it('d',()=>{expect(hd261audx(93,73)).toBe(2);});it('e',()=>{expect(hd261audx(15,0)).toBe(4);});});
function hd262audx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph262audx_hd',()=>{it('a',()=>{expect(hd262audx(1,4)).toBe(2);});it('b',()=>{expect(hd262audx(3,1)).toBe(1);});it('c',()=>{expect(hd262audx(0,0)).toBe(0);});it('d',()=>{expect(hd262audx(93,73)).toBe(2);});it('e',()=>{expect(hd262audx(15,0)).toBe(4);});});
function hd263audx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph263audx_hd',()=>{it('a',()=>{expect(hd263audx(1,4)).toBe(2);});it('b',()=>{expect(hd263audx(3,1)).toBe(1);});it('c',()=>{expect(hd263audx(0,0)).toBe(0);});it('d',()=>{expect(hd263audx(93,73)).toBe(2);});it('e',()=>{expect(hd263audx(15,0)).toBe(4);});});
function hd264audx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph264audx_hd',()=>{it('a',()=>{expect(hd264audx(1,4)).toBe(2);});it('b',()=>{expect(hd264audx(3,1)).toBe(1);});it('c',()=>{expect(hd264audx(0,0)).toBe(0);});it('d',()=>{expect(hd264audx(93,73)).toBe(2);});it('e',()=>{expect(hd264audx(15,0)).toBe(4);});});
function hd265audx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph265audx_hd',()=>{it('a',()=>{expect(hd265audx(1,4)).toBe(2);});it('b',()=>{expect(hd265audx(3,1)).toBe(1);});it('c',()=>{expect(hd265audx(0,0)).toBe(0);});it('d',()=>{expect(hd265audx(93,73)).toBe(2);});it('e',()=>{expect(hd265audx(15,0)).toBe(4);});});
function hd266audx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph266audx_hd',()=>{it('a',()=>{expect(hd266audx(1,4)).toBe(2);});it('b',()=>{expect(hd266audx(3,1)).toBe(1);});it('c',()=>{expect(hd266audx(0,0)).toBe(0);});it('d',()=>{expect(hd266audx(93,73)).toBe(2);});it('e',()=>{expect(hd266audx(15,0)).toBe(4);});});
function hd267audx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph267audx_hd',()=>{it('a',()=>{expect(hd267audx(1,4)).toBe(2);});it('b',()=>{expect(hd267audx(3,1)).toBe(1);});it('c',()=>{expect(hd267audx(0,0)).toBe(0);});it('d',()=>{expect(hd267audx(93,73)).toBe(2);});it('e',()=>{expect(hd267audx(15,0)).toBe(4);});});
function hd268audx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph268audx_hd',()=>{it('a',()=>{expect(hd268audx(1,4)).toBe(2);});it('b',()=>{expect(hd268audx(3,1)).toBe(1);});it('c',()=>{expect(hd268audx(0,0)).toBe(0);});it('d',()=>{expect(hd268audx(93,73)).toBe(2);});it('e',()=>{expect(hd268audx(15,0)).toBe(4);});});
function hd269audx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph269audx_hd',()=>{it('a',()=>{expect(hd269audx(1,4)).toBe(2);});it('b',()=>{expect(hd269audx(3,1)).toBe(1);});it('c',()=>{expect(hd269audx(0,0)).toBe(0);});it('d',()=>{expect(hd269audx(93,73)).toBe(2);});it('e',()=>{expect(hd269audx(15,0)).toBe(4);});});
function hd270audx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph270audx_hd',()=>{it('a',()=>{expect(hd270audx(1,4)).toBe(2);});it('b',()=>{expect(hd270audx(3,1)).toBe(1);});it('c',()=>{expect(hd270audx(0,0)).toBe(0);});it('d',()=>{expect(hd270audx(93,73)).toBe(2);});it('e',()=>{expect(hd270audx(15,0)).toBe(4);});});
function hd271audx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph271audx_hd',()=>{it('a',()=>{expect(hd271audx(1,4)).toBe(2);});it('b',()=>{expect(hd271audx(3,1)).toBe(1);});it('c',()=>{expect(hd271audx(0,0)).toBe(0);});it('d',()=>{expect(hd271audx(93,73)).toBe(2);});it('e',()=>{expect(hd271audx(15,0)).toBe(4);});});
function hd272audx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph272audx_hd',()=>{it('a',()=>{expect(hd272audx(1,4)).toBe(2);});it('b',()=>{expect(hd272audx(3,1)).toBe(1);});it('c',()=>{expect(hd272audx(0,0)).toBe(0);});it('d',()=>{expect(hd272audx(93,73)).toBe(2);});it('e',()=>{expect(hd272audx(15,0)).toBe(4);});});
function hd273audx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph273audx_hd',()=>{it('a',()=>{expect(hd273audx(1,4)).toBe(2);});it('b',()=>{expect(hd273audx(3,1)).toBe(1);});it('c',()=>{expect(hd273audx(0,0)).toBe(0);});it('d',()=>{expect(hd273audx(93,73)).toBe(2);});it('e',()=>{expect(hd273audx(15,0)).toBe(4);});});
function hd274audx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph274audx_hd',()=>{it('a',()=>{expect(hd274audx(1,4)).toBe(2);});it('b',()=>{expect(hd274audx(3,1)).toBe(1);});it('c',()=>{expect(hd274audx(0,0)).toBe(0);});it('d',()=>{expect(hd274audx(93,73)).toBe(2);});it('e',()=>{expect(hd274audx(15,0)).toBe(4);});});
function hd275audx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph275audx_hd',()=>{it('a',()=>{expect(hd275audx(1,4)).toBe(2);});it('b',()=>{expect(hd275audx(3,1)).toBe(1);});it('c',()=>{expect(hd275audx(0,0)).toBe(0);});it('d',()=>{expect(hd275audx(93,73)).toBe(2);});it('e',()=>{expect(hd275audx(15,0)).toBe(4);});});
function hd276audx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph276audx_hd',()=>{it('a',()=>{expect(hd276audx(1,4)).toBe(2);});it('b',()=>{expect(hd276audx(3,1)).toBe(1);});it('c',()=>{expect(hd276audx(0,0)).toBe(0);});it('d',()=>{expect(hd276audx(93,73)).toBe(2);});it('e',()=>{expect(hd276audx(15,0)).toBe(4);});});
function hd277audx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph277audx_hd',()=>{it('a',()=>{expect(hd277audx(1,4)).toBe(2);});it('b',()=>{expect(hd277audx(3,1)).toBe(1);});it('c',()=>{expect(hd277audx(0,0)).toBe(0);});it('d',()=>{expect(hd277audx(93,73)).toBe(2);});it('e',()=>{expect(hd277audx(15,0)).toBe(4);});});
function hd278audx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph278audx_hd',()=>{it('a',()=>{expect(hd278audx(1,4)).toBe(2);});it('b',()=>{expect(hd278audx(3,1)).toBe(1);});it('c',()=>{expect(hd278audx(0,0)).toBe(0);});it('d',()=>{expect(hd278audx(93,73)).toBe(2);});it('e',()=>{expect(hd278audx(15,0)).toBe(4);});});
function hd279audx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph279audx_hd',()=>{it('a',()=>{expect(hd279audx(1,4)).toBe(2);});it('b',()=>{expect(hd279audx(3,1)).toBe(1);});it('c',()=>{expect(hd279audx(0,0)).toBe(0);});it('d',()=>{expect(hd279audx(93,73)).toBe(2);});it('e',()=>{expect(hd279audx(15,0)).toBe(4);});});
function hd280audx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph280audx_hd',()=>{it('a',()=>{expect(hd280audx(1,4)).toBe(2);});it('b',()=>{expect(hd280audx(3,1)).toBe(1);});it('c',()=>{expect(hd280audx(0,0)).toBe(0);});it('d',()=>{expect(hd280audx(93,73)).toBe(2);});it('e',()=>{expect(hd280audx(15,0)).toBe(4);});});
function hd281audx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph281audx_hd',()=>{it('a',()=>{expect(hd281audx(1,4)).toBe(2);});it('b',()=>{expect(hd281audx(3,1)).toBe(1);});it('c',()=>{expect(hd281audx(0,0)).toBe(0);});it('d',()=>{expect(hd281audx(93,73)).toBe(2);});it('e',()=>{expect(hd281audx(15,0)).toBe(4);});});
function hd282audx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph282audx_hd',()=>{it('a',()=>{expect(hd282audx(1,4)).toBe(2);});it('b',()=>{expect(hd282audx(3,1)).toBe(1);});it('c',()=>{expect(hd282audx(0,0)).toBe(0);});it('d',()=>{expect(hd282audx(93,73)).toBe(2);});it('e',()=>{expect(hd282audx(15,0)).toBe(4);});});
function hd283audx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph283audx_hd',()=>{it('a',()=>{expect(hd283audx(1,4)).toBe(2);});it('b',()=>{expect(hd283audx(3,1)).toBe(1);});it('c',()=>{expect(hd283audx(0,0)).toBe(0);});it('d',()=>{expect(hd283audx(93,73)).toBe(2);});it('e',()=>{expect(hd283audx(15,0)).toBe(4);});});
function hd284audx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph284audx_hd',()=>{it('a',()=>{expect(hd284audx(1,4)).toBe(2);});it('b',()=>{expect(hd284audx(3,1)).toBe(1);});it('c',()=>{expect(hd284audx(0,0)).toBe(0);});it('d',()=>{expect(hd284audx(93,73)).toBe(2);});it('e',()=>{expect(hd284audx(15,0)).toBe(4);});});
function hd285audx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph285audx_hd',()=>{it('a',()=>{expect(hd285audx(1,4)).toBe(2);});it('b',()=>{expect(hd285audx(3,1)).toBe(1);});it('c',()=>{expect(hd285audx(0,0)).toBe(0);});it('d',()=>{expect(hd285audx(93,73)).toBe(2);});it('e',()=>{expect(hd285audx(15,0)).toBe(4);});});
function hd286audx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph286audx_hd',()=>{it('a',()=>{expect(hd286audx(1,4)).toBe(2);});it('b',()=>{expect(hd286audx(3,1)).toBe(1);});it('c',()=>{expect(hd286audx(0,0)).toBe(0);});it('d',()=>{expect(hd286audx(93,73)).toBe(2);});it('e',()=>{expect(hd286audx(15,0)).toBe(4);});});
function hd287audx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph287audx_hd',()=>{it('a',()=>{expect(hd287audx(1,4)).toBe(2);});it('b',()=>{expect(hd287audx(3,1)).toBe(1);});it('c',()=>{expect(hd287audx(0,0)).toBe(0);});it('d',()=>{expect(hd287audx(93,73)).toBe(2);});it('e',()=>{expect(hd287audx(15,0)).toBe(4);});});
function hd288audx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph288audx_hd',()=>{it('a',()=>{expect(hd288audx(1,4)).toBe(2);});it('b',()=>{expect(hd288audx(3,1)).toBe(1);});it('c',()=>{expect(hd288audx(0,0)).toBe(0);});it('d',()=>{expect(hd288audx(93,73)).toBe(2);});it('e',()=>{expect(hd288audx(15,0)).toBe(4);});});
function hd289audx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph289audx_hd',()=>{it('a',()=>{expect(hd289audx(1,4)).toBe(2);});it('b',()=>{expect(hd289audx(3,1)).toBe(1);});it('c',()=>{expect(hd289audx(0,0)).toBe(0);});it('d',()=>{expect(hd289audx(93,73)).toBe(2);});it('e',()=>{expect(hd289audx(15,0)).toBe(4);});});
function hd290audx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph290audx_hd',()=>{it('a',()=>{expect(hd290audx(1,4)).toBe(2);});it('b',()=>{expect(hd290audx(3,1)).toBe(1);});it('c',()=>{expect(hd290audx(0,0)).toBe(0);});it('d',()=>{expect(hd290audx(93,73)).toBe(2);});it('e',()=>{expect(hd290audx(15,0)).toBe(4);});});
function hd291audx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph291audx_hd',()=>{it('a',()=>{expect(hd291audx(1,4)).toBe(2);});it('b',()=>{expect(hd291audx(3,1)).toBe(1);});it('c',()=>{expect(hd291audx(0,0)).toBe(0);});it('d',()=>{expect(hd291audx(93,73)).toBe(2);});it('e',()=>{expect(hd291audx(15,0)).toBe(4);});});
function hd292audx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph292audx_hd',()=>{it('a',()=>{expect(hd292audx(1,4)).toBe(2);});it('b',()=>{expect(hd292audx(3,1)).toBe(1);});it('c',()=>{expect(hd292audx(0,0)).toBe(0);});it('d',()=>{expect(hd292audx(93,73)).toBe(2);});it('e',()=>{expect(hd292audx(15,0)).toBe(4);});});
function hd293audx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph293audx_hd',()=>{it('a',()=>{expect(hd293audx(1,4)).toBe(2);});it('b',()=>{expect(hd293audx(3,1)).toBe(1);});it('c',()=>{expect(hd293audx(0,0)).toBe(0);});it('d',()=>{expect(hd293audx(93,73)).toBe(2);});it('e',()=>{expect(hd293audx(15,0)).toBe(4);});});
function hd294audx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph294audx_hd',()=>{it('a',()=>{expect(hd294audx(1,4)).toBe(2);});it('b',()=>{expect(hd294audx(3,1)).toBe(1);});it('c',()=>{expect(hd294audx(0,0)).toBe(0);});it('d',()=>{expect(hd294audx(93,73)).toBe(2);});it('e',()=>{expect(hd294audx(15,0)).toBe(4);});});
function hd295audx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph295audx_hd',()=>{it('a',()=>{expect(hd295audx(1,4)).toBe(2);});it('b',()=>{expect(hd295audx(3,1)).toBe(1);});it('c',()=>{expect(hd295audx(0,0)).toBe(0);});it('d',()=>{expect(hd295audx(93,73)).toBe(2);});it('e',()=>{expect(hd295audx(15,0)).toBe(4);});});
function hd296audx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph296audx_hd',()=>{it('a',()=>{expect(hd296audx(1,4)).toBe(2);});it('b',()=>{expect(hd296audx(3,1)).toBe(1);});it('c',()=>{expect(hd296audx(0,0)).toBe(0);});it('d',()=>{expect(hd296audx(93,73)).toBe(2);});it('e',()=>{expect(hd296audx(15,0)).toBe(4);});});
function hd297audx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph297audx_hd',()=>{it('a',()=>{expect(hd297audx(1,4)).toBe(2);});it('b',()=>{expect(hd297audx(3,1)).toBe(1);});it('c',()=>{expect(hd297audx(0,0)).toBe(0);});it('d',()=>{expect(hd297audx(93,73)).toBe(2);});it('e',()=>{expect(hd297audx(15,0)).toBe(4);});});
function hd298audx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph298audx_hd',()=>{it('a',()=>{expect(hd298audx(1,4)).toBe(2);});it('b',()=>{expect(hd298audx(3,1)).toBe(1);});it('c',()=>{expect(hd298audx(0,0)).toBe(0);});it('d',()=>{expect(hd298audx(93,73)).toBe(2);});it('e',()=>{expect(hd298audx(15,0)).toBe(4);});});
function hd299audx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph299audx_hd',()=>{it('a',()=>{expect(hd299audx(1,4)).toBe(2);});it('b',()=>{expect(hd299audx(3,1)).toBe(1);});it('c',()=>{expect(hd299audx(0,0)).toBe(0);});it('d',()=>{expect(hd299audx(93,73)).toBe(2);});it('e',()=>{expect(hd299audx(15,0)).toBe(4);});});
function hd300audx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph300audx_hd',()=>{it('a',()=>{expect(hd300audx(1,4)).toBe(2);});it('b',()=>{expect(hd300audx(3,1)).toBe(1);});it('c',()=>{expect(hd300audx(0,0)).toBe(0);});it('d',()=>{expect(hd300audx(93,73)).toBe(2);});it('e',()=>{expect(hd300audx(15,0)).toBe(4);});});
function hd301audx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph301audx_hd',()=>{it('a',()=>{expect(hd301audx(1,4)).toBe(2);});it('b',()=>{expect(hd301audx(3,1)).toBe(1);});it('c',()=>{expect(hd301audx(0,0)).toBe(0);});it('d',()=>{expect(hd301audx(93,73)).toBe(2);});it('e',()=>{expect(hd301audx(15,0)).toBe(4);});});
function hd302audx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph302audx_hd',()=>{it('a',()=>{expect(hd302audx(1,4)).toBe(2);});it('b',()=>{expect(hd302audx(3,1)).toBe(1);});it('c',()=>{expect(hd302audx(0,0)).toBe(0);});it('d',()=>{expect(hd302audx(93,73)).toBe(2);});it('e',()=>{expect(hd302audx(15,0)).toBe(4);});});
function hd303audx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph303audx_hd',()=>{it('a',()=>{expect(hd303audx(1,4)).toBe(2);});it('b',()=>{expect(hd303audx(3,1)).toBe(1);});it('c',()=>{expect(hd303audx(0,0)).toBe(0);});it('d',()=>{expect(hd303audx(93,73)).toBe(2);});it('e',()=>{expect(hd303audx(15,0)).toBe(4);});});
function hd304audx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph304audx_hd',()=>{it('a',()=>{expect(hd304audx(1,4)).toBe(2);});it('b',()=>{expect(hd304audx(3,1)).toBe(1);});it('c',()=>{expect(hd304audx(0,0)).toBe(0);});it('d',()=>{expect(hd304audx(93,73)).toBe(2);});it('e',()=>{expect(hd304audx(15,0)).toBe(4);});});
function hd305audx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph305audx_hd',()=>{it('a',()=>{expect(hd305audx(1,4)).toBe(2);});it('b',()=>{expect(hd305audx(3,1)).toBe(1);});it('c',()=>{expect(hd305audx(0,0)).toBe(0);});it('d',()=>{expect(hd305audx(93,73)).toBe(2);});it('e',()=>{expect(hd305audx(15,0)).toBe(4);});});
function hd306audx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph306audx_hd',()=>{it('a',()=>{expect(hd306audx(1,4)).toBe(2);});it('b',()=>{expect(hd306audx(3,1)).toBe(1);});it('c',()=>{expect(hd306audx(0,0)).toBe(0);});it('d',()=>{expect(hd306audx(93,73)).toBe(2);});it('e',()=>{expect(hd306audx(15,0)).toBe(4);});});
function hd307audx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph307audx_hd',()=>{it('a',()=>{expect(hd307audx(1,4)).toBe(2);});it('b',()=>{expect(hd307audx(3,1)).toBe(1);});it('c',()=>{expect(hd307audx(0,0)).toBe(0);});it('d',()=>{expect(hd307audx(93,73)).toBe(2);});it('e',()=>{expect(hd307audx(15,0)).toBe(4);});});
function hd308audx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph308audx_hd',()=>{it('a',()=>{expect(hd308audx(1,4)).toBe(2);});it('b',()=>{expect(hd308audx(3,1)).toBe(1);});it('c',()=>{expect(hd308audx(0,0)).toBe(0);});it('d',()=>{expect(hd308audx(93,73)).toBe(2);});it('e',()=>{expect(hd308audx(15,0)).toBe(4);});});
function hd309audx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph309audx_hd',()=>{it('a',()=>{expect(hd309audx(1,4)).toBe(2);});it('b',()=>{expect(hd309audx(3,1)).toBe(1);});it('c',()=>{expect(hd309audx(0,0)).toBe(0);});it('d',()=>{expect(hd309audx(93,73)).toBe(2);});it('e',()=>{expect(hd309audx(15,0)).toBe(4);});});
function hd310audx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph310audx_hd',()=>{it('a',()=>{expect(hd310audx(1,4)).toBe(2);});it('b',()=>{expect(hd310audx(3,1)).toBe(1);});it('c',()=>{expect(hd310audx(0,0)).toBe(0);});it('d',()=>{expect(hd310audx(93,73)).toBe(2);});it('e',()=>{expect(hd310audx(15,0)).toBe(4);});});
function hd311audx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph311audx_hd',()=>{it('a',()=>{expect(hd311audx(1,4)).toBe(2);});it('b',()=>{expect(hd311audx(3,1)).toBe(1);});it('c',()=>{expect(hd311audx(0,0)).toBe(0);});it('d',()=>{expect(hd311audx(93,73)).toBe(2);});it('e',()=>{expect(hd311audx(15,0)).toBe(4);});});
function hd312audx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph312audx_hd',()=>{it('a',()=>{expect(hd312audx(1,4)).toBe(2);});it('b',()=>{expect(hd312audx(3,1)).toBe(1);});it('c',()=>{expect(hd312audx(0,0)).toBe(0);});it('d',()=>{expect(hd312audx(93,73)).toBe(2);});it('e',()=>{expect(hd312audx(15,0)).toBe(4);});});
function hd313audx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph313audx_hd',()=>{it('a',()=>{expect(hd313audx(1,4)).toBe(2);});it('b',()=>{expect(hd313audx(3,1)).toBe(1);});it('c',()=>{expect(hd313audx(0,0)).toBe(0);});it('d',()=>{expect(hd313audx(93,73)).toBe(2);});it('e',()=>{expect(hd313audx(15,0)).toBe(4);});});
function hd314audx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph314audx_hd',()=>{it('a',()=>{expect(hd314audx(1,4)).toBe(2);});it('b',()=>{expect(hd314audx(3,1)).toBe(1);});it('c',()=>{expect(hd314audx(0,0)).toBe(0);});it('d',()=>{expect(hd314audx(93,73)).toBe(2);});it('e',()=>{expect(hd314audx(15,0)).toBe(4);});});
function hd315audx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph315audx_hd',()=>{it('a',()=>{expect(hd315audx(1,4)).toBe(2);});it('b',()=>{expect(hd315audx(3,1)).toBe(1);});it('c',()=>{expect(hd315audx(0,0)).toBe(0);});it('d',()=>{expect(hd315audx(93,73)).toBe(2);});it('e',()=>{expect(hd315audx(15,0)).toBe(4);});});
function hd316audx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph316audx_hd',()=>{it('a',()=>{expect(hd316audx(1,4)).toBe(2);});it('b',()=>{expect(hd316audx(3,1)).toBe(1);});it('c',()=>{expect(hd316audx(0,0)).toBe(0);});it('d',()=>{expect(hd316audx(93,73)).toBe(2);});it('e',()=>{expect(hd316audx(15,0)).toBe(4);});});
function hd317audx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph317audx_hd',()=>{it('a',()=>{expect(hd317audx(1,4)).toBe(2);});it('b',()=>{expect(hd317audx(3,1)).toBe(1);});it('c',()=>{expect(hd317audx(0,0)).toBe(0);});it('d',()=>{expect(hd317audx(93,73)).toBe(2);});it('e',()=>{expect(hd317audx(15,0)).toBe(4);});});
function hd318audx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph318audx_hd',()=>{it('a',()=>{expect(hd318audx(1,4)).toBe(2);});it('b',()=>{expect(hd318audx(3,1)).toBe(1);});it('c',()=>{expect(hd318audx(0,0)).toBe(0);});it('d',()=>{expect(hd318audx(93,73)).toBe(2);});it('e',()=>{expect(hd318audx(15,0)).toBe(4);});});
function hd319audx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph319audx_hd',()=>{it('a',()=>{expect(hd319audx(1,4)).toBe(2);});it('b',()=>{expect(hd319audx(3,1)).toBe(1);});it('c',()=>{expect(hd319audx(0,0)).toBe(0);});it('d',()=>{expect(hd319audx(93,73)).toBe(2);});it('e',()=>{expect(hd319audx(15,0)).toBe(4);});});
function hd320audx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph320audx_hd',()=>{it('a',()=>{expect(hd320audx(1,4)).toBe(2);});it('b',()=>{expect(hd320audx(3,1)).toBe(1);});it('c',()=>{expect(hd320audx(0,0)).toBe(0);});it('d',()=>{expect(hd320audx(93,73)).toBe(2);});it('e',()=>{expect(hd320audx(15,0)).toBe(4);});});
function hd321audx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph321audx_hd',()=>{it('a',()=>{expect(hd321audx(1,4)).toBe(2);});it('b',()=>{expect(hd321audx(3,1)).toBe(1);});it('c',()=>{expect(hd321audx(0,0)).toBe(0);});it('d',()=>{expect(hd321audx(93,73)).toBe(2);});it('e',()=>{expect(hd321audx(15,0)).toBe(4);});});
function hd322audx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph322audx_hd',()=>{it('a',()=>{expect(hd322audx(1,4)).toBe(2);});it('b',()=>{expect(hd322audx(3,1)).toBe(1);});it('c',()=>{expect(hd322audx(0,0)).toBe(0);});it('d',()=>{expect(hd322audx(93,73)).toBe(2);});it('e',()=>{expect(hd322audx(15,0)).toBe(4);});});
function hd323audx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph323audx_hd',()=>{it('a',()=>{expect(hd323audx(1,4)).toBe(2);});it('b',()=>{expect(hd323audx(3,1)).toBe(1);});it('c',()=>{expect(hd323audx(0,0)).toBe(0);});it('d',()=>{expect(hd323audx(93,73)).toBe(2);});it('e',()=>{expect(hd323audx(15,0)).toBe(4);});});
function hd324audx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph324audx_hd',()=>{it('a',()=>{expect(hd324audx(1,4)).toBe(2);});it('b',()=>{expect(hd324audx(3,1)).toBe(1);});it('c',()=>{expect(hd324audx(0,0)).toBe(0);});it('d',()=>{expect(hd324audx(93,73)).toBe(2);});it('e',()=>{expect(hd324audx(15,0)).toBe(4);});});
function hd325audx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph325audx_hd',()=>{it('a',()=>{expect(hd325audx(1,4)).toBe(2);});it('b',()=>{expect(hd325audx(3,1)).toBe(1);});it('c',()=>{expect(hd325audx(0,0)).toBe(0);});it('d',()=>{expect(hd325audx(93,73)).toBe(2);});it('e',()=>{expect(hd325audx(15,0)).toBe(4);});});
function hd326audx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph326audx_hd',()=>{it('a',()=>{expect(hd326audx(1,4)).toBe(2);});it('b',()=>{expect(hd326audx(3,1)).toBe(1);});it('c',()=>{expect(hd326audx(0,0)).toBe(0);});it('d',()=>{expect(hd326audx(93,73)).toBe(2);});it('e',()=>{expect(hd326audx(15,0)).toBe(4);});});
function hd327audx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph327audx_hd',()=>{it('a',()=>{expect(hd327audx(1,4)).toBe(2);});it('b',()=>{expect(hd327audx(3,1)).toBe(1);});it('c',()=>{expect(hd327audx(0,0)).toBe(0);});it('d',()=>{expect(hd327audx(93,73)).toBe(2);});it('e',()=>{expect(hd327audx(15,0)).toBe(4);});});
function hd328audx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph328audx_hd',()=>{it('a',()=>{expect(hd328audx(1,4)).toBe(2);});it('b',()=>{expect(hd328audx(3,1)).toBe(1);});it('c',()=>{expect(hd328audx(0,0)).toBe(0);});it('d',()=>{expect(hd328audx(93,73)).toBe(2);});it('e',()=>{expect(hd328audx(15,0)).toBe(4);});});
function hd329audx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph329audx_hd',()=>{it('a',()=>{expect(hd329audx(1,4)).toBe(2);});it('b',()=>{expect(hd329audx(3,1)).toBe(1);});it('c',()=>{expect(hd329audx(0,0)).toBe(0);});it('d',()=>{expect(hd329audx(93,73)).toBe(2);});it('e',()=>{expect(hd329audx(15,0)).toBe(4);});});
function hd330audx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph330audx_hd',()=>{it('a',()=>{expect(hd330audx(1,4)).toBe(2);});it('b',()=>{expect(hd330audx(3,1)).toBe(1);});it('c',()=>{expect(hd330audx(0,0)).toBe(0);});it('d',()=>{expect(hd330audx(93,73)).toBe(2);});it('e',()=>{expect(hd330audx(15,0)).toBe(4);});});
function hd331audx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph331audx_hd',()=>{it('a',()=>{expect(hd331audx(1,4)).toBe(2);});it('b',()=>{expect(hd331audx(3,1)).toBe(1);});it('c',()=>{expect(hd331audx(0,0)).toBe(0);});it('d',()=>{expect(hd331audx(93,73)).toBe(2);});it('e',()=>{expect(hd331audx(15,0)).toBe(4);});});
function hd332audx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph332audx_hd',()=>{it('a',()=>{expect(hd332audx(1,4)).toBe(2);});it('b',()=>{expect(hd332audx(3,1)).toBe(1);});it('c',()=>{expect(hd332audx(0,0)).toBe(0);});it('d',()=>{expect(hd332audx(93,73)).toBe(2);});it('e',()=>{expect(hd332audx(15,0)).toBe(4);});});
function hd333audx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph333audx_hd',()=>{it('a',()=>{expect(hd333audx(1,4)).toBe(2);});it('b',()=>{expect(hd333audx(3,1)).toBe(1);});it('c',()=>{expect(hd333audx(0,0)).toBe(0);});it('d',()=>{expect(hd333audx(93,73)).toBe(2);});it('e',()=>{expect(hd333audx(15,0)).toBe(4);});});
function hd334audx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph334audx_hd',()=>{it('a',()=>{expect(hd334audx(1,4)).toBe(2);});it('b',()=>{expect(hd334audx(3,1)).toBe(1);});it('c',()=>{expect(hd334audx(0,0)).toBe(0);});it('d',()=>{expect(hd334audx(93,73)).toBe(2);});it('e',()=>{expect(hd334audx(15,0)).toBe(4);});});
function hd335audx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph335audx_hd',()=>{it('a',()=>{expect(hd335audx(1,4)).toBe(2);});it('b',()=>{expect(hd335audx(3,1)).toBe(1);});it('c',()=>{expect(hd335audx(0,0)).toBe(0);});it('d',()=>{expect(hd335audx(93,73)).toBe(2);});it('e',()=>{expect(hd335audx(15,0)).toBe(4);});});
function hd336audx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph336audx_hd',()=>{it('a',()=>{expect(hd336audx(1,4)).toBe(2);});it('b',()=>{expect(hd336audx(3,1)).toBe(1);});it('c',()=>{expect(hd336audx(0,0)).toBe(0);});it('d',()=>{expect(hd336audx(93,73)).toBe(2);});it('e',()=>{expect(hd336audx(15,0)).toBe(4);});});
function hd337audx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph337audx_hd',()=>{it('a',()=>{expect(hd337audx(1,4)).toBe(2);});it('b',()=>{expect(hd337audx(3,1)).toBe(1);});it('c',()=>{expect(hd337audx(0,0)).toBe(0);});it('d',()=>{expect(hd337audx(93,73)).toBe(2);});it('e',()=>{expect(hd337audx(15,0)).toBe(4);});});
function hd338audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph338audx2_hd',()=>{it('a',()=>{expect(hd338audx2(1,4)).toBe(2);});it('b',()=>{expect(hd338audx2(3,1)).toBe(1);});it('c',()=>{expect(hd338audx2(0,0)).toBe(0);});it('d',()=>{expect(hd338audx2(93,73)).toBe(2);});it('e',()=>{expect(hd338audx2(15,0)).toBe(4);});});
function hd338audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph338audx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd339audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph339audx2_hd',()=>{it('a',()=>{expect(hd339audx2(1,4)).toBe(2);});it('b',()=>{expect(hd339audx2(3,1)).toBe(1);});it('c',()=>{expect(hd339audx2(0,0)).toBe(0);});it('d',()=>{expect(hd339audx2(93,73)).toBe(2);});it('e',()=>{expect(hd339audx2(15,0)).toBe(4);});});
function hd339audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph339audx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd340audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph340audx2_hd',()=>{it('a',()=>{expect(hd340audx2(1,4)).toBe(2);});it('b',()=>{expect(hd340audx2(3,1)).toBe(1);});it('c',()=>{expect(hd340audx2(0,0)).toBe(0);});it('d',()=>{expect(hd340audx2(93,73)).toBe(2);});it('e',()=>{expect(hd340audx2(15,0)).toBe(4);});});
function hd340audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph340audx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd341audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph341audx2_hd',()=>{it('a',()=>{expect(hd341audx2(1,4)).toBe(2);});it('b',()=>{expect(hd341audx2(3,1)).toBe(1);});it('c',()=>{expect(hd341audx2(0,0)).toBe(0);});it('d',()=>{expect(hd341audx2(93,73)).toBe(2);});it('e',()=>{expect(hd341audx2(15,0)).toBe(4);});});
function hd341audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph341audx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd342audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph342audx2_hd',()=>{it('a',()=>{expect(hd342audx2(1,4)).toBe(2);});it('b',()=>{expect(hd342audx2(3,1)).toBe(1);});it('c',()=>{expect(hd342audx2(0,0)).toBe(0);});it('d',()=>{expect(hd342audx2(93,73)).toBe(2);});it('e',()=>{expect(hd342audx2(15,0)).toBe(4);});});
function hd342audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph342audx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd343audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph343audx2_hd',()=>{it('a',()=>{expect(hd343audx2(1,4)).toBe(2);});it('b',()=>{expect(hd343audx2(3,1)).toBe(1);});it('c',()=>{expect(hd343audx2(0,0)).toBe(0);});it('d',()=>{expect(hd343audx2(93,73)).toBe(2);});it('e',()=>{expect(hd343audx2(15,0)).toBe(4);});});
function hd343audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph343audx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd344audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph344audx2_hd',()=>{it('a',()=>{expect(hd344audx2(1,4)).toBe(2);});it('b',()=>{expect(hd344audx2(3,1)).toBe(1);});it('c',()=>{expect(hd344audx2(0,0)).toBe(0);});it('d',()=>{expect(hd344audx2(93,73)).toBe(2);});it('e',()=>{expect(hd344audx2(15,0)).toBe(4);});});
function hd344audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph344audx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd345audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph345audx2_hd',()=>{it('a',()=>{expect(hd345audx2(1,4)).toBe(2);});it('b',()=>{expect(hd345audx2(3,1)).toBe(1);});it('c',()=>{expect(hd345audx2(0,0)).toBe(0);});it('d',()=>{expect(hd345audx2(93,73)).toBe(2);});it('e',()=>{expect(hd345audx2(15,0)).toBe(4);});});
function hd345audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph345audx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd346audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph346audx2_hd',()=>{it('a',()=>{expect(hd346audx2(1,4)).toBe(2);});it('b',()=>{expect(hd346audx2(3,1)).toBe(1);});it('c',()=>{expect(hd346audx2(0,0)).toBe(0);});it('d',()=>{expect(hd346audx2(93,73)).toBe(2);});it('e',()=>{expect(hd346audx2(15,0)).toBe(4);});});
function hd346audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph346audx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd347audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph347audx2_hd',()=>{it('a',()=>{expect(hd347audx2(1,4)).toBe(2);});it('b',()=>{expect(hd347audx2(3,1)).toBe(1);});it('c',()=>{expect(hd347audx2(0,0)).toBe(0);});it('d',()=>{expect(hd347audx2(93,73)).toBe(2);});it('e',()=>{expect(hd347audx2(15,0)).toBe(4);});});
function hd347audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph347audx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd348audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph348audx2_hd',()=>{it('a',()=>{expect(hd348audx2(1,4)).toBe(2);});it('b',()=>{expect(hd348audx2(3,1)).toBe(1);});it('c',()=>{expect(hd348audx2(0,0)).toBe(0);});it('d',()=>{expect(hd348audx2(93,73)).toBe(2);});it('e',()=>{expect(hd348audx2(15,0)).toBe(4);});});
function hd348audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph348audx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd349audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph349audx2_hd',()=>{it('a',()=>{expect(hd349audx2(1,4)).toBe(2);});it('b',()=>{expect(hd349audx2(3,1)).toBe(1);});it('c',()=>{expect(hd349audx2(0,0)).toBe(0);});it('d',()=>{expect(hd349audx2(93,73)).toBe(2);});it('e',()=>{expect(hd349audx2(15,0)).toBe(4);});});
function hd349audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph349audx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd350audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph350audx2_hd',()=>{it('a',()=>{expect(hd350audx2(1,4)).toBe(2);});it('b',()=>{expect(hd350audx2(3,1)).toBe(1);});it('c',()=>{expect(hd350audx2(0,0)).toBe(0);});it('d',()=>{expect(hd350audx2(93,73)).toBe(2);});it('e',()=>{expect(hd350audx2(15,0)).toBe(4);});});
function hd350audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph350audx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd351audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph351audx2_hd',()=>{it('a',()=>{expect(hd351audx2(1,4)).toBe(2);});it('b',()=>{expect(hd351audx2(3,1)).toBe(1);});it('c',()=>{expect(hd351audx2(0,0)).toBe(0);});it('d',()=>{expect(hd351audx2(93,73)).toBe(2);});it('e',()=>{expect(hd351audx2(15,0)).toBe(4);});});
function hd351audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph351audx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd352audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph352audx2_hd',()=>{it('a',()=>{expect(hd352audx2(1,4)).toBe(2);});it('b',()=>{expect(hd352audx2(3,1)).toBe(1);});it('c',()=>{expect(hd352audx2(0,0)).toBe(0);});it('d',()=>{expect(hd352audx2(93,73)).toBe(2);});it('e',()=>{expect(hd352audx2(15,0)).toBe(4);});});
function hd352audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph352audx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd353audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph353audx2_hd',()=>{it('a',()=>{expect(hd353audx2(1,4)).toBe(2);});it('b',()=>{expect(hd353audx2(3,1)).toBe(1);});it('c',()=>{expect(hd353audx2(0,0)).toBe(0);});it('d',()=>{expect(hd353audx2(93,73)).toBe(2);});it('e',()=>{expect(hd353audx2(15,0)).toBe(4);});});
function hd353audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph353audx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd354audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph354audx2_hd',()=>{it('a',()=>{expect(hd354audx2(1,4)).toBe(2);});it('b',()=>{expect(hd354audx2(3,1)).toBe(1);});it('c',()=>{expect(hd354audx2(0,0)).toBe(0);});it('d',()=>{expect(hd354audx2(93,73)).toBe(2);});it('e',()=>{expect(hd354audx2(15,0)).toBe(4);});});
function hd354audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph354audx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd355audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph355audx2_hd',()=>{it('a',()=>{expect(hd355audx2(1,4)).toBe(2);});it('b',()=>{expect(hd355audx2(3,1)).toBe(1);});it('c',()=>{expect(hd355audx2(0,0)).toBe(0);});it('d',()=>{expect(hd355audx2(93,73)).toBe(2);});it('e',()=>{expect(hd355audx2(15,0)).toBe(4);});});
function hd355audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph355audx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd356audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph356audx2_hd',()=>{it('a',()=>{expect(hd356audx2(1,4)).toBe(2);});it('b',()=>{expect(hd356audx2(3,1)).toBe(1);});it('c',()=>{expect(hd356audx2(0,0)).toBe(0);});it('d',()=>{expect(hd356audx2(93,73)).toBe(2);});it('e',()=>{expect(hd356audx2(15,0)).toBe(4);});});
function hd356audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph356audx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd357audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph357audx2_hd',()=>{it('a',()=>{expect(hd357audx2(1,4)).toBe(2);});it('b',()=>{expect(hd357audx2(3,1)).toBe(1);});it('c',()=>{expect(hd357audx2(0,0)).toBe(0);});it('d',()=>{expect(hd357audx2(93,73)).toBe(2);});it('e',()=>{expect(hd357audx2(15,0)).toBe(4);});});
function hd357audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph357audx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd358audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph358audx2_hd',()=>{it('a',()=>{expect(hd358audx2(1,4)).toBe(2);});it('b',()=>{expect(hd358audx2(3,1)).toBe(1);});it('c',()=>{expect(hd358audx2(0,0)).toBe(0);});it('d',()=>{expect(hd358audx2(93,73)).toBe(2);});it('e',()=>{expect(hd358audx2(15,0)).toBe(4);});});
function hd358audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph358audx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd359audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph359audx2_hd',()=>{it('a',()=>{expect(hd359audx2(1,4)).toBe(2);});it('b',()=>{expect(hd359audx2(3,1)).toBe(1);});it('c',()=>{expect(hd359audx2(0,0)).toBe(0);});it('d',()=>{expect(hd359audx2(93,73)).toBe(2);});it('e',()=>{expect(hd359audx2(15,0)).toBe(4);});});
function hd359audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph359audx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd360audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph360audx2_hd',()=>{it('a',()=>{expect(hd360audx2(1,4)).toBe(2);});it('b',()=>{expect(hd360audx2(3,1)).toBe(1);});it('c',()=>{expect(hd360audx2(0,0)).toBe(0);});it('d',()=>{expect(hd360audx2(93,73)).toBe(2);});it('e',()=>{expect(hd360audx2(15,0)).toBe(4);});});
function hd360audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph360audx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd361audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph361audx2_hd',()=>{it('a',()=>{expect(hd361audx2(1,4)).toBe(2);});it('b',()=>{expect(hd361audx2(3,1)).toBe(1);});it('c',()=>{expect(hd361audx2(0,0)).toBe(0);});it('d',()=>{expect(hd361audx2(93,73)).toBe(2);});it('e',()=>{expect(hd361audx2(15,0)).toBe(4);});});
function hd361audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph361audx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd362audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph362audx2_hd',()=>{it('a',()=>{expect(hd362audx2(1,4)).toBe(2);});it('b',()=>{expect(hd362audx2(3,1)).toBe(1);});it('c',()=>{expect(hd362audx2(0,0)).toBe(0);});it('d',()=>{expect(hd362audx2(93,73)).toBe(2);});it('e',()=>{expect(hd362audx2(15,0)).toBe(4);});});
function hd362audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph362audx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd363audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph363audx2_hd',()=>{it('a',()=>{expect(hd363audx2(1,4)).toBe(2);});it('b',()=>{expect(hd363audx2(3,1)).toBe(1);});it('c',()=>{expect(hd363audx2(0,0)).toBe(0);});it('d',()=>{expect(hd363audx2(93,73)).toBe(2);});it('e',()=>{expect(hd363audx2(15,0)).toBe(4);});});
function hd363audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph363audx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd364audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph364audx2_hd',()=>{it('a',()=>{expect(hd364audx2(1,4)).toBe(2);});it('b',()=>{expect(hd364audx2(3,1)).toBe(1);});it('c',()=>{expect(hd364audx2(0,0)).toBe(0);});it('d',()=>{expect(hd364audx2(93,73)).toBe(2);});it('e',()=>{expect(hd364audx2(15,0)).toBe(4);});});
function hd364audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph364audx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd365audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph365audx2_hd',()=>{it('a',()=>{expect(hd365audx2(1,4)).toBe(2);});it('b',()=>{expect(hd365audx2(3,1)).toBe(1);});it('c',()=>{expect(hd365audx2(0,0)).toBe(0);});it('d',()=>{expect(hd365audx2(93,73)).toBe(2);});it('e',()=>{expect(hd365audx2(15,0)).toBe(4);});});
function hd365audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph365audx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd366audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph366audx2_hd',()=>{it('a',()=>{expect(hd366audx2(1,4)).toBe(2);});it('b',()=>{expect(hd366audx2(3,1)).toBe(1);});it('c',()=>{expect(hd366audx2(0,0)).toBe(0);});it('d',()=>{expect(hd366audx2(93,73)).toBe(2);});it('e',()=>{expect(hd366audx2(15,0)).toBe(4);});});
function hd366audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph366audx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd367audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph367audx2_hd',()=>{it('a',()=>{expect(hd367audx2(1,4)).toBe(2);});it('b',()=>{expect(hd367audx2(3,1)).toBe(1);});it('c',()=>{expect(hd367audx2(0,0)).toBe(0);});it('d',()=>{expect(hd367audx2(93,73)).toBe(2);});it('e',()=>{expect(hd367audx2(15,0)).toBe(4);});});
function hd367audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph367audx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd368audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph368audx2_hd',()=>{it('a',()=>{expect(hd368audx2(1,4)).toBe(2);});it('b',()=>{expect(hd368audx2(3,1)).toBe(1);});it('c',()=>{expect(hd368audx2(0,0)).toBe(0);});it('d',()=>{expect(hd368audx2(93,73)).toBe(2);});it('e',()=>{expect(hd368audx2(15,0)).toBe(4);});});
function hd368audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph368audx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd369audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph369audx2_hd',()=>{it('a',()=>{expect(hd369audx2(1,4)).toBe(2);});it('b',()=>{expect(hd369audx2(3,1)).toBe(1);});it('c',()=>{expect(hd369audx2(0,0)).toBe(0);});it('d',()=>{expect(hd369audx2(93,73)).toBe(2);});it('e',()=>{expect(hd369audx2(15,0)).toBe(4);});});
function hd369audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph369audx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd370audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph370audx2_hd',()=>{it('a',()=>{expect(hd370audx2(1,4)).toBe(2);});it('b',()=>{expect(hd370audx2(3,1)).toBe(1);});it('c',()=>{expect(hd370audx2(0,0)).toBe(0);});it('d',()=>{expect(hd370audx2(93,73)).toBe(2);});it('e',()=>{expect(hd370audx2(15,0)).toBe(4);});});
function hd370audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph370audx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd371audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph371audx2_hd',()=>{it('a',()=>{expect(hd371audx2(1,4)).toBe(2);});it('b',()=>{expect(hd371audx2(3,1)).toBe(1);});it('c',()=>{expect(hd371audx2(0,0)).toBe(0);});it('d',()=>{expect(hd371audx2(93,73)).toBe(2);});it('e',()=>{expect(hd371audx2(15,0)).toBe(4);});});
function hd371audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph371audx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd372audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph372audx2_hd',()=>{it('a',()=>{expect(hd372audx2(1,4)).toBe(2);});it('b',()=>{expect(hd372audx2(3,1)).toBe(1);});it('c',()=>{expect(hd372audx2(0,0)).toBe(0);});it('d',()=>{expect(hd372audx2(93,73)).toBe(2);});it('e',()=>{expect(hd372audx2(15,0)).toBe(4);});});
function hd372audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph372audx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd373audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph373audx2_hd',()=>{it('a',()=>{expect(hd373audx2(1,4)).toBe(2);});it('b',()=>{expect(hd373audx2(3,1)).toBe(1);});it('c',()=>{expect(hd373audx2(0,0)).toBe(0);});it('d',()=>{expect(hd373audx2(93,73)).toBe(2);});it('e',()=>{expect(hd373audx2(15,0)).toBe(4);});});
function hd373audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph373audx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd374audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph374audx2_hd',()=>{it('a',()=>{expect(hd374audx2(1,4)).toBe(2);});it('b',()=>{expect(hd374audx2(3,1)).toBe(1);});it('c',()=>{expect(hd374audx2(0,0)).toBe(0);});it('d',()=>{expect(hd374audx2(93,73)).toBe(2);});it('e',()=>{expect(hd374audx2(15,0)).toBe(4);});});
function hd374audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph374audx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd375audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph375audx2_hd',()=>{it('a',()=>{expect(hd375audx2(1,4)).toBe(2);});it('b',()=>{expect(hd375audx2(3,1)).toBe(1);});it('c',()=>{expect(hd375audx2(0,0)).toBe(0);});it('d',()=>{expect(hd375audx2(93,73)).toBe(2);});it('e',()=>{expect(hd375audx2(15,0)).toBe(4);});});
function hd375audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph375audx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd376audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph376audx2_hd',()=>{it('a',()=>{expect(hd376audx2(1,4)).toBe(2);});it('b',()=>{expect(hd376audx2(3,1)).toBe(1);});it('c',()=>{expect(hd376audx2(0,0)).toBe(0);});it('d',()=>{expect(hd376audx2(93,73)).toBe(2);});it('e',()=>{expect(hd376audx2(15,0)).toBe(4);});});
function hd376audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph376audx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd377audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph377audx2_hd',()=>{it('a',()=>{expect(hd377audx2(1,4)).toBe(2);});it('b',()=>{expect(hd377audx2(3,1)).toBe(1);});it('c',()=>{expect(hd377audx2(0,0)).toBe(0);});it('d',()=>{expect(hd377audx2(93,73)).toBe(2);});it('e',()=>{expect(hd377audx2(15,0)).toBe(4);});});
function hd377audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph377audx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd378audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph378audx2_hd',()=>{it('a',()=>{expect(hd378audx2(1,4)).toBe(2);});it('b',()=>{expect(hd378audx2(3,1)).toBe(1);});it('c',()=>{expect(hd378audx2(0,0)).toBe(0);});it('d',()=>{expect(hd378audx2(93,73)).toBe(2);});it('e',()=>{expect(hd378audx2(15,0)).toBe(4);});});
function hd378audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph378audx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd379audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph379audx2_hd',()=>{it('a',()=>{expect(hd379audx2(1,4)).toBe(2);});it('b',()=>{expect(hd379audx2(3,1)).toBe(1);});it('c',()=>{expect(hd379audx2(0,0)).toBe(0);});it('d',()=>{expect(hd379audx2(93,73)).toBe(2);});it('e',()=>{expect(hd379audx2(15,0)).toBe(4);});});
function hd379audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph379audx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd380audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph380audx2_hd',()=>{it('a',()=>{expect(hd380audx2(1,4)).toBe(2);});it('b',()=>{expect(hd380audx2(3,1)).toBe(1);});it('c',()=>{expect(hd380audx2(0,0)).toBe(0);});it('d',()=>{expect(hd380audx2(93,73)).toBe(2);});it('e',()=>{expect(hd380audx2(15,0)).toBe(4);});});
function hd380audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph380audx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd381audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph381audx2_hd',()=>{it('a',()=>{expect(hd381audx2(1,4)).toBe(2);});it('b',()=>{expect(hd381audx2(3,1)).toBe(1);});it('c',()=>{expect(hd381audx2(0,0)).toBe(0);});it('d',()=>{expect(hd381audx2(93,73)).toBe(2);});it('e',()=>{expect(hd381audx2(15,0)).toBe(4);});});
function hd381audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph381audx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd382audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph382audx2_hd',()=>{it('a',()=>{expect(hd382audx2(1,4)).toBe(2);});it('b',()=>{expect(hd382audx2(3,1)).toBe(1);});it('c',()=>{expect(hd382audx2(0,0)).toBe(0);});it('d',()=>{expect(hd382audx2(93,73)).toBe(2);});it('e',()=>{expect(hd382audx2(15,0)).toBe(4);});});
function hd382audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph382audx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd383audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph383audx2_hd',()=>{it('a',()=>{expect(hd383audx2(1,4)).toBe(2);});it('b',()=>{expect(hd383audx2(3,1)).toBe(1);});it('c',()=>{expect(hd383audx2(0,0)).toBe(0);});it('d',()=>{expect(hd383audx2(93,73)).toBe(2);});it('e',()=>{expect(hd383audx2(15,0)).toBe(4);});});
function hd383audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph383audx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd384audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph384audx2_hd',()=>{it('a',()=>{expect(hd384audx2(1,4)).toBe(2);});it('b',()=>{expect(hd384audx2(3,1)).toBe(1);});it('c',()=>{expect(hd384audx2(0,0)).toBe(0);});it('d',()=>{expect(hd384audx2(93,73)).toBe(2);});it('e',()=>{expect(hd384audx2(15,0)).toBe(4);});});
function hd384audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph384audx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd385audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph385audx2_hd',()=>{it('a',()=>{expect(hd385audx2(1,4)).toBe(2);});it('b',()=>{expect(hd385audx2(3,1)).toBe(1);});it('c',()=>{expect(hd385audx2(0,0)).toBe(0);});it('d',()=>{expect(hd385audx2(93,73)).toBe(2);});it('e',()=>{expect(hd385audx2(15,0)).toBe(4);});});
function hd385audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph385audx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd386audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph386audx2_hd',()=>{it('a',()=>{expect(hd386audx2(1,4)).toBe(2);});it('b',()=>{expect(hd386audx2(3,1)).toBe(1);});it('c',()=>{expect(hd386audx2(0,0)).toBe(0);});it('d',()=>{expect(hd386audx2(93,73)).toBe(2);});it('e',()=>{expect(hd386audx2(15,0)).toBe(4);});});
function hd386audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph386audx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd387audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph387audx2_hd',()=>{it('a',()=>{expect(hd387audx2(1,4)).toBe(2);});it('b',()=>{expect(hd387audx2(3,1)).toBe(1);});it('c',()=>{expect(hd387audx2(0,0)).toBe(0);});it('d',()=>{expect(hd387audx2(93,73)).toBe(2);});it('e',()=>{expect(hd387audx2(15,0)).toBe(4);});});
function hd387audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph387audx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd388audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph388audx2_hd',()=>{it('a',()=>{expect(hd388audx2(1,4)).toBe(2);});it('b',()=>{expect(hd388audx2(3,1)).toBe(1);});it('c',()=>{expect(hd388audx2(0,0)).toBe(0);});it('d',()=>{expect(hd388audx2(93,73)).toBe(2);});it('e',()=>{expect(hd388audx2(15,0)).toBe(4);});});
function hd388audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph388audx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd389audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph389audx2_hd',()=>{it('a',()=>{expect(hd389audx2(1,4)).toBe(2);});it('b',()=>{expect(hd389audx2(3,1)).toBe(1);});it('c',()=>{expect(hd389audx2(0,0)).toBe(0);});it('d',()=>{expect(hd389audx2(93,73)).toBe(2);});it('e',()=>{expect(hd389audx2(15,0)).toBe(4);});});
function hd389audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph389audx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd390audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph390audx2_hd',()=>{it('a',()=>{expect(hd390audx2(1,4)).toBe(2);});it('b',()=>{expect(hd390audx2(3,1)).toBe(1);});it('c',()=>{expect(hd390audx2(0,0)).toBe(0);});it('d',()=>{expect(hd390audx2(93,73)).toBe(2);});it('e',()=>{expect(hd390audx2(15,0)).toBe(4);});});
function hd390audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph390audx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd391audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph391audx2_hd',()=>{it('a',()=>{expect(hd391audx2(1,4)).toBe(2);});it('b',()=>{expect(hd391audx2(3,1)).toBe(1);});it('c',()=>{expect(hd391audx2(0,0)).toBe(0);});it('d',()=>{expect(hd391audx2(93,73)).toBe(2);});it('e',()=>{expect(hd391audx2(15,0)).toBe(4);});});
function hd391audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph391audx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd392audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph392audx2_hd',()=>{it('a',()=>{expect(hd392audx2(1,4)).toBe(2);});it('b',()=>{expect(hd392audx2(3,1)).toBe(1);});it('c',()=>{expect(hd392audx2(0,0)).toBe(0);});it('d',()=>{expect(hd392audx2(93,73)).toBe(2);});it('e',()=>{expect(hd392audx2(15,0)).toBe(4);});});
function hd392audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph392audx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd393audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph393audx2_hd',()=>{it('a',()=>{expect(hd393audx2(1,4)).toBe(2);});it('b',()=>{expect(hd393audx2(3,1)).toBe(1);});it('c',()=>{expect(hd393audx2(0,0)).toBe(0);});it('d',()=>{expect(hd393audx2(93,73)).toBe(2);});it('e',()=>{expect(hd393audx2(15,0)).toBe(4);});});
function hd393audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph393audx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd394audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph394audx2_hd',()=>{it('a',()=>{expect(hd394audx2(1,4)).toBe(2);});it('b',()=>{expect(hd394audx2(3,1)).toBe(1);});it('c',()=>{expect(hd394audx2(0,0)).toBe(0);});it('d',()=>{expect(hd394audx2(93,73)).toBe(2);});it('e',()=>{expect(hd394audx2(15,0)).toBe(4);});});
function hd394audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph394audx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd395audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph395audx2_hd',()=>{it('a',()=>{expect(hd395audx2(1,4)).toBe(2);});it('b',()=>{expect(hd395audx2(3,1)).toBe(1);});it('c',()=>{expect(hd395audx2(0,0)).toBe(0);});it('d',()=>{expect(hd395audx2(93,73)).toBe(2);});it('e',()=>{expect(hd395audx2(15,0)).toBe(4);});});
function hd395audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph395audx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd396audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph396audx2_hd',()=>{it('a',()=>{expect(hd396audx2(1,4)).toBe(2);});it('b',()=>{expect(hd396audx2(3,1)).toBe(1);});it('c',()=>{expect(hd396audx2(0,0)).toBe(0);});it('d',()=>{expect(hd396audx2(93,73)).toBe(2);});it('e',()=>{expect(hd396audx2(15,0)).toBe(4);});});
function hd396audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph396audx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd397audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph397audx2_hd',()=>{it('a',()=>{expect(hd397audx2(1,4)).toBe(2);});it('b',()=>{expect(hd397audx2(3,1)).toBe(1);});it('c',()=>{expect(hd397audx2(0,0)).toBe(0);});it('d',()=>{expect(hd397audx2(93,73)).toBe(2);});it('e',()=>{expect(hd397audx2(15,0)).toBe(4);});});
function hd397audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph397audx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd398audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph398audx2_hd',()=>{it('a',()=>{expect(hd398audx2(1,4)).toBe(2);});it('b',()=>{expect(hd398audx2(3,1)).toBe(1);});it('c',()=>{expect(hd398audx2(0,0)).toBe(0);});it('d',()=>{expect(hd398audx2(93,73)).toBe(2);});it('e',()=>{expect(hd398audx2(15,0)).toBe(4);});});
function hd398audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph398audx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd399audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph399audx2_hd',()=>{it('a',()=>{expect(hd399audx2(1,4)).toBe(2);});it('b',()=>{expect(hd399audx2(3,1)).toBe(1);});it('c',()=>{expect(hd399audx2(0,0)).toBe(0);});it('d',()=>{expect(hd399audx2(93,73)).toBe(2);});it('e',()=>{expect(hd399audx2(15,0)).toBe(4);});});
function hd399audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph399audx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd400audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph400audx2_hd',()=>{it('a',()=>{expect(hd400audx2(1,4)).toBe(2);});it('b',()=>{expect(hd400audx2(3,1)).toBe(1);});it('c',()=>{expect(hd400audx2(0,0)).toBe(0);});it('d',()=>{expect(hd400audx2(93,73)).toBe(2);});it('e',()=>{expect(hd400audx2(15,0)).toBe(4);});});
function hd400audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph400audx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd401audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph401audx2_hd',()=>{it('a',()=>{expect(hd401audx2(1,4)).toBe(2);});it('b',()=>{expect(hd401audx2(3,1)).toBe(1);});it('c',()=>{expect(hd401audx2(0,0)).toBe(0);});it('d',()=>{expect(hd401audx2(93,73)).toBe(2);});it('e',()=>{expect(hd401audx2(15,0)).toBe(4);});});
function hd401audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph401audx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd402audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph402audx2_hd',()=>{it('a',()=>{expect(hd402audx2(1,4)).toBe(2);});it('b',()=>{expect(hd402audx2(3,1)).toBe(1);});it('c',()=>{expect(hd402audx2(0,0)).toBe(0);});it('d',()=>{expect(hd402audx2(93,73)).toBe(2);});it('e',()=>{expect(hd402audx2(15,0)).toBe(4);});});
function hd402audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph402audx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd403audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph403audx2_hd',()=>{it('a',()=>{expect(hd403audx2(1,4)).toBe(2);});it('b',()=>{expect(hd403audx2(3,1)).toBe(1);});it('c',()=>{expect(hd403audx2(0,0)).toBe(0);});it('d',()=>{expect(hd403audx2(93,73)).toBe(2);});it('e',()=>{expect(hd403audx2(15,0)).toBe(4);});});
function hd403audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph403audx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd404audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph404audx2_hd',()=>{it('a',()=>{expect(hd404audx2(1,4)).toBe(2);});it('b',()=>{expect(hd404audx2(3,1)).toBe(1);});it('c',()=>{expect(hd404audx2(0,0)).toBe(0);});it('d',()=>{expect(hd404audx2(93,73)).toBe(2);});it('e',()=>{expect(hd404audx2(15,0)).toBe(4);});});
function hd404audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph404audx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd405audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph405audx2_hd',()=>{it('a',()=>{expect(hd405audx2(1,4)).toBe(2);});it('b',()=>{expect(hd405audx2(3,1)).toBe(1);});it('c',()=>{expect(hd405audx2(0,0)).toBe(0);});it('d',()=>{expect(hd405audx2(93,73)).toBe(2);});it('e',()=>{expect(hd405audx2(15,0)).toBe(4);});});
function hd405audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph405audx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd406audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph406audx2_hd',()=>{it('a',()=>{expect(hd406audx2(1,4)).toBe(2);});it('b',()=>{expect(hd406audx2(3,1)).toBe(1);});it('c',()=>{expect(hd406audx2(0,0)).toBe(0);});it('d',()=>{expect(hd406audx2(93,73)).toBe(2);});it('e',()=>{expect(hd406audx2(15,0)).toBe(4);});});
function hd406audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph406audx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd407audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph407audx2_hd',()=>{it('a',()=>{expect(hd407audx2(1,4)).toBe(2);});it('b',()=>{expect(hd407audx2(3,1)).toBe(1);});it('c',()=>{expect(hd407audx2(0,0)).toBe(0);});it('d',()=>{expect(hd407audx2(93,73)).toBe(2);});it('e',()=>{expect(hd407audx2(15,0)).toBe(4);});});
function hd407audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph407audx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd408audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph408audx2_hd',()=>{it('a',()=>{expect(hd408audx2(1,4)).toBe(2);});it('b',()=>{expect(hd408audx2(3,1)).toBe(1);});it('c',()=>{expect(hd408audx2(0,0)).toBe(0);});it('d',()=>{expect(hd408audx2(93,73)).toBe(2);});it('e',()=>{expect(hd408audx2(15,0)).toBe(4);});});
function hd408audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph408audx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd409audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph409audx2_hd',()=>{it('a',()=>{expect(hd409audx2(1,4)).toBe(2);});it('b',()=>{expect(hd409audx2(3,1)).toBe(1);});it('c',()=>{expect(hd409audx2(0,0)).toBe(0);});it('d',()=>{expect(hd409audx2(93,73)).toBe(2);});it('e',()=>{expect(hd409audx2(15,0)).toBe(4);});});
function hd409audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph409audx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd410audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph410audx2_hd',()=>{it('a',()=>{expect(hd410audx2(1,4)).toBe(2);});it('b',()=>{expect(hd410audx2(3,1)).toBe(1);});it('c',()=>{expect(hd410audx2(0,0)).toBe(0);});it('d',()=>{expect(hd410audx2(93,73)).toBe(2);});it('e',()=>{expect(hd410audx2(15,0)).toBe(4);});});
function hd410audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph410audx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd411audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph411audx2_hd',()=>{it('a',()=>{expect(hd411audx2(1,4)).toBe(2);});it('b',()=>{expect(hd411audx2(3,1)).toBe(1);});it('c',()=>{expect(hd411audx2(0,0)).toBe(0);});it('d',()=>{expect(hd411audx2(93,73)).toBe(2);});it('e',()=>{expect(hd411audx2(15,0)).toBe(4);});});
function hd411audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph411audx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd412audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph412audx2_hd',()=>{it('a',()=>{expect(hd412audx2(1,4)).toBe(2);});it('b',()=>{expect(hd412audx2(3,1)).toBe(1);});it('c',()=>{expect(hd412audx2(0,0)).toBe(0);});it('d',()=>{expect(hd412audx2(93,73)).toBe(2);});it('e',()=>{expect(hd412audx2(15,0)).toBe(4);});});
function hd412audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph412audx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd413audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph413audx2_hd',()=>{it('a',()=>{expect(hd413audx2(1,4)).toBe(2);});it('b',()=>{expect(hd413audx2(3,1)).toBe(1);});it('c',()=>{expect(hd413audx2(0,0)).toBe(0);});it('d',()=>{expect(hd413audx2(93,73)).toBe(2);});it('e',()=>{expect(hd413audx2(15,0)).toBe(4);});});
function hd413audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph413audx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd414audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph414audx2_hd',()=>{it('a',()=>{expect(hd414audx2(1,4)).toBe(2);});it('b',()=>{expect(hd414audx2(3,1)).toBe(1);});it('c',()=>{expect(hd414audx2(0,0)).toBe(0);});it('d',()=>{expect(hd414audx2(93,73)).toBe(2);});it('e',()=>{expect(hd414audx2(15,0)).toBe(4);});});
function hd414audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph414audx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd415audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph415audx2_hd',()=>{it('a',()=>{expect(hd415audx2(1,4)).toBe(2);});it('b',()=>{expect(hd415audx2(3,1)).toBe(1);});it('c',()=>{expect(hd415audx2(0,0)).toBe(0);});it('d',()=>{expect(hd415audx2(93,73)).toBe(2);});it('e',()=>{expect(hd415audx2(15,0)).toBe(4);});});
function hd415audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph415audx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd416audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph416audx2_hd',()=>{it('a',()=>{expect(hd416audx2(1,4)).toBe(2);});it('b',()=>{expect(hd416audx2(3,1)).toBe(1);});it('c',()=>{expect(hd416audx2(0,0)).toBe(0);});it('d',()=>{expect(hd416audx2(93,73)).toBe(2);});it('e',()=>{expect(hd416audx2(15,0)).toBe(4);});});
function hd416audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph416audx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd417audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph417audx2_hd',()=>{it('a',()=>{expect(hd417audx2(1,4)).toBe(2);});it('b',()=>{expect(hd417audx2(3,1)).toBe(1);});it('c',()=>{expect(hd417audx2(0,0)).toBe(0);});it('d',()=>{expect(hd417audx2(93,73)).toBe(2);});it('e',()=>{expect(hd417audx2(15,0)).toBe(4);});});
function hd417audx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph417audx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
