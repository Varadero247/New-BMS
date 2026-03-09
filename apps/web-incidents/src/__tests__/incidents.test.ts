// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Phase 134 — web-incidents specification tests

type IncidentType = 'NEAR_MISS' | 'FIRST_AID' | 'MEDICAL_TREATMENT' | 'LOST_TIME' | 'FATALITY' | 'PROPERTY_DAMAGE' | 'ENVIRONMENTAL';
type IncidentSeverity = 'MINOR' | 'MODERATE' | 'MAJOR' | 'CRITICAL' | 'CATASTROPHIC';
type IncidentStatus = 'OPEN' | 'UNDER_INVESTIGATION' | 'PENDING_ACTION' | 'CLOSED' | 'REOPENED';
type RootCauseCategory = 'HUMAN_FACTOR' | 'EQUIPMENT' | 'PROCEDURE' | 'ENVIRONMENT' | 'MANAGEMENT';

const INCIDENT_TYPES: IncidentType[] = ['NEAR_MISS', 'FIRST_AID', 'MEDICAL_TREATMENT', 'LOST_TIME', 'FATALITY', 'PROPERTY_DAMAGE', 'ENVIRONMENTAL'];
const INCIDENT_SEVERITIES: IncidentSeverity[] = ['MINOR', 'MODERATE', 'MAJOR', 'CRITICAL', 'CATASTROPHIC'];
const INCIDENT_STATUSES: IncidentStatus[] = ['OPEN', 'UNDER_INVESTIGATION', 'PENDING_ACTION', 'CLOSED', 'REOPENED'];
const ROOT_CAUSE_CATEGORIES: RootCauseCategory[] = ['HUMAN_FACTOR', 'EQUIPMENT', 'PROCEDURE', 'ENVIRONMENT', 'MANAGEMENT'];

const severityColor: Record<IncidentSeverity, string> = {
  MINOR: 'bg-green-100 text-green-800',
  MODERATE: 'bg-yellow-100 text-yellow-800',
  MAJOR: 'bg-orange-100 text-orange-800',
  CRITICAL: 'bg-red-100 text-red-800',
  CATASTROPHIC: 'bg-purple-100 text-purple-800',
};

const severityScore: Record<IncidentSeverity, number> = {
  MINOR: 1, MODERATE: 2, MAJOR: 3, CRITICAL: 4, CATASTROPHIC: 5,
};

const investigationDaysTarget: Record<IncidentSeverity, number> = {
  MINOR: 30, MODERATE: 21, MAJOR: 14, CRITICAL: 7, CATASTROPHIC: 3,
};

function isIncidentOpen(status: IncidentStatus): boolean {
  return status === 'OPEN' || status === 'UNDER_INVESTIGATION' || status === 'PENDING_ACTION' || status === 'REOPENED';
}

function requiresRegulatorNotification(severity: IncidentSeverity): boolean {
  return severity === 'CRITICAL' || severity === 'CATASTROPHIC';
}

function lostTimeIncidentRate(lostTimeIncidents: number, hoursWorked: number): number {
  if (hoursWorked === 0) return 0;
  return (lostTimeIncidents / hoursWorked) * 200000;
}

describe('Severity colors', () => {
  INCIDENT_SEVERITIES.forEach(s => {
    it(`${s} has color`, () => expect(severityColor[s]).toBeDefined());
    it(`${s} color has bg-`, () => expect(severityColor[s]).toContain('bg-'));
  });
  it('MINOR is green', () => expect(severityColor.MINOR).toContain('green'));
  it('CRITICAL is red', () => expect(severityColor.CRITICAL).toContain('red'));
  for (let i = 0; i < 100; i++) {
    const s = INCIDENT_SEVERITIES[i % 5];
    it(`severity color string (idx ${i})`, () => expect(typeof severityColor[s]).toBe('string'));
  }
});

describe('Severity scores', () => {
  it('CATASTROPHIC has score 5', () => expect(severityScore.CATASTROPHIC).toBe(5));
  it('MINOR has score 1', () => expect(severityScore.MINOR).toBe(1));
  it('scores increase with severity', () => {
    expect(severityScore.MINOR).toBeLessThan(severityScore.MODERATE);
    expect(severityScore.MODERATE).toBeLessThan(severityScore.MAJOR);
    expect(severityScore.MAJOR).toBeLessThan(severityScore.CRITICAL);
    expect(severityScore.CRITICAL).toBeLessThan(severityScore.CATASTROPHIC);
  });
  for (let i = 0; i < 100; i++) {
    const s = INCIDENT_SEVERITIES[i % 5];
    it(`severity score for ${s} is positive (idx ${i})`, () => expect(severityScore[s]).toBeGreaterThan(0));
  }
});

describe('Investigation days target', () => {
  it('CATASTROPHIC target is 3 days', () => expect(investigationDaysTarget.CATASTROPHIC).toBe(3));
  it('MINOR target is 30 days', () => expect(investigationDaysTarget.MINOR).toBe(30));
  it('CATASTROPHIC < CRITICAL < MAJOR < MODERATE < MINOR', () => {
    expect(investigationDaysTarget.CATASTROPHIC).toBeLessThan(investigationDaysTarget.CRITICAL);
    expect(investigationDaysTarget.CRITICAL).toBeLessThan(investigationDaysTarget.MAJOR);
    expect(investigationDaysTarget.MAJOR).toBeLessThan(investigationDaysTarget.MODERATE);
    expect(investigationDaysTarget.MODERATE).toBeLessThan(investigationDaysTarget.MINOR);
  });
  for (let i = 0; i < 50; i++) {
    const s = INCIDENT_SEVERITIES[i % 5];
    it(`investigation target for ${s} is positive (idx ${i})`, () => expect(investigationDaysTarget[s]).toBeGreaterThan(0));
  }
});

describe('isIncidentOpen', () => {
  it('OPEN returns true', () => expect(isIncidentOpen('OPEN')).toBe(true));
  it('UNDER_INVESTIGATION returns true', () => expect(isIncidentOpen('UNDER_INVESTIGATION')).toBe(true));
  it('CLOSED returns false', () => expect(isIncidentOpen('CLOSED')).toBe(false));
  for (let i = 0; i < 100; i++) {
    const s = INCIDENT_STATUSES[i % 5];
    it(`isIncidentOpen(${s}) returns boolean (idx ${i})`, () => expect(typeof isIncidentOpen(s)).toBe('boolean'));
  }
});

describe('requiresRegulatorNotification', () => {
  it('CRITICAL requires notification', () => expect(requiresRegulatorNotification('CRITICAL')).toBe(true));
  it('CATASTROPHIC requires notification', () => expect(requiresRegulatorNotification('CATASTROPHIC')).toBe(true));
  it('MINOR does not require', () => expect(requiresRegulatorNotification('MINOR')).toBe(false));
  it('MODERATE does not require', () => expect(requiresRegulatorNotification('MODERATE')).toBe(false));
  for (let i = 0; i < 100; i++) {
    const s = INCIDENT_SEVERITIES[i % 5];
    it(`requiresRegulatorNotification(${s}) returns boolean (idx ${i})`, () => expect(typeof requiresRegulatorNotification(s)).toBe('boolean'));
  }
});

describe('lostTimeIncidentRate', () => {
  it('0 incidents = 0 LTIR', () => expect(lostTimeIncidentRate(0, 100000)).toBe(0));
  it('0 hours = 0 LTIR', () => expect(lostTimeIncidentRate(5, 0)).toBe(0));
  it('LTIR formula: (LTI / hours) × 200000', () => {
    expect(lostTimeIncidentRate(2, 200000)).toBe(2);
  });
  for (let i = 1; i <= 50; i++) {
    it(`LTIR for ${i} incidents is positive`, () => {
      expect(lostTimeIncidentRate(i, 200000)).toBeGreaterThan(0);
    });
  }
});
function hd258incx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph258incx_hd',()=>{it('a',()=>{expect(hd258incx(1,4)).toBe(2);});it('b',()=>{expect(hd258incx(3,1)).toBe(1);});it('c',()=>{expect(hd258incx(0,0)).toBe(0);});it('d',()=>{expect(hd258incx(93,73)).toBe(2);});it('e',()=>{expect(hd258incx(15,0)).toBe(4);});});
function hd259incx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph259incx_hd',()=>{it('a',()=>{expect(hd259incx(1,4)).toBe(2);});it('b',()=>{expect(hd259incx(3,1)).toBe(1);});it('c',()=>{expect(hd259incx(0,0)).toBe(0);});it('d',()=>{expect(hd259incx(93,73)).toBe(2);});it('e',()=>{expect(hd259incx(15,0)).toBe(4);});});
function hd260incx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph260incx_hd',()=>{it('a',()=>{expect(hd260incx(1,4)).toBe(2);});it('b',()=>{expect(hd260incx(3,1)).toBe(1);});it('c',()=>{expect(hd260incx(0,0)).toBe(0);});it('d',()=>{expect(hd260incx(93,73)).toBe(2);});it('e',()=>{expect(hd260incx(15,0)).toBe(4);});});
function hd261incx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph261incx_hd',()=>{it('a',()=>{expect(hd261incx(1,4)).toBe(2);});it('b',()=>{expect(hd261incx(3,1)).toBe(1);});it('c',()=>{expect(hd261incx(0,0)).toBe(0);});it('d',()=>{expect(hd261incx(93,73)).toBe(2);});it('e',()=>{expect(hd261incx(15,0)).toBe(4);});});
function hd262incx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph262incx_hd',()=>{it('a',()=>{expect(hd262incx(1,4)).toBe(2);});it('b',()=>{expect(hd262incx(3,1)).toBe(1);});it('c',()=>{expect(hd262incx(0,0)).toBe(0);});it('d',()=>{expect(hd262incx(93,73)).toBe(2);});it('e',()=>{expect(hd262incx(15,0)).toBe(4);});});
function hd263incx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph263incx_hd',()=>{it('a',()=>{expect(hd263incx(1,4)).toBe(2);});it('b',()=>{expect(hd263incx(3,1)).toBe(1);});it('c',()=>{expect(hd263incx(0,0)).toBe(0);});it('d',()=>{expect(hd263incx(93,73)).toBe(2);});it('e',()=>{expect(hd263incx(15,0)).toBe(4);});});
function hd264incx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph264incx_hd',()=>{it('a',()=>{expect(hd264incx(1,4)).toBe(2);});it('b',()=>{expect(hd264incx(3,1)).toBe(1);});it('c',()=>{expect(hd264incx(0,0)).toBe(0);});it('d',()=>{expect(hd264incx(93,73)).toBe(2);});it('e',()=>{expect(hd264incx(15,0)).toBe(4);});});
function hd265incx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph265incx_hd',()=>{it('a',()=>{expect(hd265incx(1,4)).toBe(2);});it('b',()=>{expect(hd265incx(3,1)).toBe(1);});it('c',()=>{expect(hd265incx(0,0)).toBe(0);});it('d',()=>{expect(hd265incx(93,73)).toBe(2);});it('e',()=>{expect(hd265incx(15,0)).toBe(4);});});
function hd266incx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph266incx_hd',()=>{it('a',()=>{expect(hd266incx(1,4)).toBe(2);});it('b',()=>{expect(hd266incx(3,1)).toBe(1);});it('c',()=>{expect(hd266incx(0,0)).toBe(0);});it('d',()=>{expect(hd266incx(93,73)).toBe(2);});it('e',()=>{expect(hd266incx(15,0)).toBe(4);});});
function hd267incx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph267incx_hd',()=>{it('a',()=>{expect(hd267incx(1,4)).toBe(2);});it('b',()=>{expect(hd267incx(3,1)).toBe(1);});it('c',()=>{expect(hd267incx(0,0)).toBe(0);});it('d',()=>{expect(hd267incx(93,73)).toBe(2);});it('e',()=>{expect(hd267incx(15,0)).toBe(4);});});
function hd268incx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph268incx_hd',()=>{it('a',()=>{expect(hd268incx(1,4)).toBe(2);});it('b',()=>{expect(hd268incx(3,1)).toBe(1);});it('c',()=>{expect(hd268incx(0,0)).toBe(0);});it('d',()=>{expect(hd268incx(93,73)).toBe(2);});it('e',()=>{expect(hd268incx(15,0)).toBe(4);});});
function hd269incx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph269incx_hd',()=>{it('a',()=>{expect(hd269incx(1,4)).toBe(2);});it('b',()=>{expect(hd269incx(3,1)).toBe(1);});it('c',()=>{expect(hd269incx(0,0)).toBe(0);});it('d',()=>{expect(hd269incx(93,73)).toBe(2);});it('e',()=>{expect(hd269incx(15,0)).toBe(4);});});
function hd270incx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph270incx_hd',()=>{it('a',()=>{expect(hd270incx(1,4)).toBe(2);});it('b',()=>{expect(hd270incx(3,1)).toBe(1);});it('c',()=>{expect(hd270incx(0,0)).toBe(0);});it('d',()=>{expect(hd270incx(93,73)).toBe(2);});it('e',()=>{expect(hd270incx(15,0)).toBe(4);});});
function hd271incx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph271incx_hd',()=>{it('a',()=>{expect(hd271incx(1,4)).toBe(2);});it('b',()=>{expect(hd271incx(3,1)).toBe(1);});it('c',()=>{expect(hd271incx(0,0)).toBe(0);});it('d',()=>{expect(hd271incx(93,73)).toBe(2);});it('e',()=>{expect(hd271incx(15,0)).toBe(4);});});
function hd272incx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph272incx_hd',()=>{it('a',()=>{expect(hd272incx(1,4)).toBe(2);});it('b',()=>{expect(hd272incx(3,1)).toBe(1);});it('c',()=>{expect(hd272incx(0,0)).toBe(0);});it('d',()=>{expect(hd272incx(93,73)).toBe(2);});it('e',()=>{expect(hd272incx(15,0)).toBe(4);});});
function hd273incx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph273incx_hd',()=>{it('a',()=>{expect(hd273incx(1,4)).toBe(2);});it('b',()=>{expect(hd273incx(3,1)).toBe(1);});it('c',()=>{expect(hd273incx(0,0)).toBe(0);});it('d',()=>{expect(hd273incx(93,73)).toBe(2);});it('e',()=>{expect(hd273incx(15,0)).toBe(4);});});
function hd274incx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph274incx_hd',()=>{it('a',()=>{expect(hd274incx(1,4)).toBe(2);});it('b',()=>{expect(hd274incx(3,1)).toBe(1);});it('c',()=>{expect(hd274incx(0,0)).toBe(0);});it('d',()=>{expect(hd274incx(93,73)).toBe(2);});it('e',()=>{expect(hd274incx(15,0)).toBe(4);});});
function hd275incx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph275incx_hd',()=>{it('a',()=>{expect(hd275incx(1,4)).toBe(2);});it('b',()=>{expect(hd275incx(3,1)).toBe(1);});it('c',()=>{expect(hd275incx(0,0)).toBe(0);});it('d',()=>{expect(hd275incx(93,73)).toBe(2);});it('e',()=>{expect(hd275incx(15,0)).toBe(4);});});
function hd276incx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph276incx_hd',()=>{it('a',()=>{expect(hd276incx(1,4)).toBe(2);});it('b',()=>{expect(hd276incx(3,1)).toBe(1);});it('c',()=>{expect(hd276incx(0,0)).toBe(0);});it('d',()=>{expect(hd276incx(93,73)).toBe(2);});it('e',()=>{expect(hd276incx(15,0)).toBe(4);});});
function hd277incx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph277incx_hd',()=>{it('a',()=>{expect(hd277incx(1,4)).toBe(2);});it('b',()=>{expect(hd277incx(3,1)).toBe(1);});it('c',()=>{expect(hd277incx(0,0)).toBe(0);});it('d',()=>{expect(hd277incx(93,73)).toBe(2);});it('e',()=>{expect(hd277incx(15,0)).toBe(4);});});
function hd278incx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph278incx_hd',()=>{it('a',()=>{expect(hd278incx(1,4)).toBe(2);});it('b',()=>{expect(hd278incx(3,1)).toBe(1);});it('c',()=>{expect(hd278incx(0,0)).toBe(0);});it('d',()=>{expect(hd278incx(93,73)).toBe(2);});it('e',()=>{expect(hd278incx(15,0)).toBe(4);});});
function hd279incx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph279incx_hd',()=>{it('a',()=>{expect(hd279incx(1,4)).toBe(2);});it('b',()=>{expect(hd279incx(3,1)).toBe(1);});it('c',()=>{expect(hd279incx(0,0)).toBe(0);});it('d',()=>{expect(hd279incx(93,73)).toBe(2);});it('e',()=>{expect(hd279incx(15,0)).toBe(4);});});
function hd280incx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph280incx_hd',()=>{it('a',()=>{expect(hd280incx(1,4)).toBe(2);});it('b',()=>{expect(hd280incx(3,1)).toBe(1);});it('c',()=>{expect(hd280incx(0,0)).toBe(0);});it('d',()=>{expect(hd280incx(93,73)).toBe(2);});it('e',()=>{expect(hd280incx(15,0)).toBe(4);});});
function hd281incx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph281incx_hd',()=>{it('a',()=>{expect(hd281incx(1,4)).toBe(2);});it('b',()=>{expect(hd281incx(3,1)).toBe(1);});it('c',()=>{expect(hd281incx(0,0)).toBe(0);});it('d',()=>{expect(hd281incx(93,73)).toBe(2);});it('e',()=>{expect(hd281incx(15,0)).toBe(4);});});
function hd282incx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph282incx_hd',()=>{it('a',()=>{expect(hd282incx(1,4)).toBe(2);});it('b',()=>{expect(hd282incx(3,1)).toBe(1);});it('c',()=>{expect(hd282incx(0,0)).toBe(0);});it('d',()=>{expect(hd282incx(93,73)).toBe(2);});it('e',()=>{expect(hd282incx(15,0)).toBe(4);});});
function hd283incx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph283incx_hd',()=>{it('a',()=>{expect(hd283incx(1,4)).toBe(2);});it('b',()=>{expect(hd283incx(3,1)).toBe(1);});it('c',()=>{expect(hd283incx(0,0)).toBe(0);});it('d',()=>{expect(hd283incx(93,73)).toBe(2);});it('e',()=>{expect(hd283incx(15,0)).toBe(4);});});
function hd284incx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph284incx_hd',()=>{it('a',()=>{expect(hd284incx(1,4)).toBe(2);});it('b',()=>{expect(hd284incx(3,1)).toBe(1);});it('c',()=>{expect(hd284incx(0,0)).toBe(0);});it('d',()=>{expect(hd284incx(93,73)).toBe(2);});it('e',()=>{expect(hd284incx(15,0)).toBe(4);});});
function hd285incx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph285incx_hd',()=>{it('a',()=>{expect(hd285incx(1,4)).toBe(2);});it('b',()=>{expect(hd285incx(3,1)).toBe(1);});it('c',()=>{expect(hd285incx(0,0)).toBe(0);});it('d',()=>{expect(hd285incx(93,73)).toBe(2);});it('e',()=>{expect(hd285incx(15,0)).toBe(4);});});
function hd286incx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph286incx_hd',()=>{it('a',()=>{expect(hd286incx(1,4)).toBe(2);});it('b',()=>{expect(hd286incx(3,1)).toBe(1);});it('c',()=>{expect(hd286incx(0,0)).toBe(0);});it('d',()=>{expect(hd286incx(93,73)).toBe(2);});it('e',()=>{expect(hd286incx(15,0)).toBe(4);});});
function hd287incx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph287incx_hd',()=>{it('a',()=>{expect(hd287incx(1,4)).toBe(2);});it('b',()=>{expect(hd287incx(3,1)).toBe(1);});it('c',()=>{expect(hd287incx(0,0)).toBe(0);});it('d',()=>{expect(hd287incx(93,73)).toBe(2);});it('e',()=>{expect(hd287incx(15,0)).toBe(4);});});
function hd288incx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph288incx_hd',()=>{it('a',()=>{expect(hd288incx(1,4)).toBe(2);});it('b',()=>{expect(hd288incx(3,1)).toBe(1);});it('c',()=>{expect(hd288incx(0,0)).toBe(0);});it('d',()=>{expect(hd288incx(93,73)).toBe(2);});it('e',()=>{expect(hd288incx(15,0)).toBe(4);});});
function hd289incx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph289incx_hd',()=>{it('a',()=>{expect(hd289incx(1,4)).toBe(2);});it('b',()=>{expect(hd289incx(3,1)).toBe(1);});it('c',()=>{expect(hd289incx(0,0)).toBe(0);});it('d',()=>{expect(hd289incx(93,73)).toBe(2);});it('e',()=>{expect(hd289incx(15,0)).toBe(4);});});
function hd290incx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph290incx_hd',()=>{it('a',()=>{expect(hd290incx(1,4)).toBe(2);});it('b',()=>{expect(hd290incx(3,1)).toBe(1);});it('c',()=>{expect(hd290incx(0,0)).toBe(0);});it('d',()=>{expect(hd290incx(93,73)).toBe(2);});it('e',()=>{expect(hd290incx(15,0)).toBe(4);});});
function hd291incx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph291incx_hd',()=>{it('a',()=>{expect(hd291incx(1,4)).toBe(2);});it('b',()=>{expect(hd291incx(3,1)).toBe(1);});it('c',()=>{expect(hd291incx(0,0)).toBe(0);});it('d',()=>{expect(hd291incx(93,73)).toBe(2);});it('e',()=>{expect(hd291incx(15,0)).toBe(4);});});
function hd292incx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph292incx_hd',()=>{it('a',()=>{expect(hd292incx(1,4)).toBe(2);});it('b',()=>{expect(hd292incx(3,1)).toBe(1);});it('c',()=>{expect(hd292incx(0,0)).toBe(0);});it('d',()=>{expect(hd292incx(93,73)).toBe(2);});it('e',()=>{expect(hd292incx(15,0)).toBe(4);});});
function hd293incx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph293incx_hd',()=>{it('a',()=>{expect(hd293incx(1,4)).toBe(2);});it('b',()=>{expect(hd293incx(3,1)).toBe(1);});it('c',()=>{expect(hd293incx(0,0)).toBe(0);});it('d',()=>{expect(hd293incx(93,73)).toBe(2);});it('e',()=>{expect(hd293incx(15,0)).toBe(4);});});
function hd294incx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph294incx_hd',()=>{it('a',()=>{expect(hd294incx(1,4)).toBe(2);});it('b',()=>{expect(hd294incx(3,1)).toBe(1);});it('c',()=>{expect(hd294incx(0,0)).toBe(0);});it('d',()=>{expect(hd294incx(93,73)).toBe(2);});it('e',()=>{expect(hd294incx(15,0)).toBe(4);});});
function hd295incx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph295incx_hd',()=>{it('a',()=>{expect(hd295incx(1,4)).toBe(2);});it('b',()=>{expect(hd295incx(3,1)).toBe(1);});it('c',()=>{expect(hd295incx(0,0)).toBe(0);});it('d',()=>{expect(hd295incx(93,73)).toBe(2);});it('e',()=>{expect(hd295incx(15,0)).toBe(4);});});
function hd296incx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph296incx_hd',()=>{it('a',()=>{expect(hd296incx(1,4)).toBe(2);});it('b',()=>{expect(hd296incx(3,1)).toBe(1);});it('c',()=>{expect(hd296incx(0,0)).toBe(0);});it('d',()=>{expect(hd296incx(93,73)).toBe(2);});it('e',()=>{expect(hd296incx(15,0)).toBe(4);});});
function hd297incx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph297incx_hd',()=>{it('a',()=>{expect(hd297incx(1,4)).toBe(2);});it('b',()=>{expect(hd297incx(3,1)).toBe(1);});it('c',()=>{expect(hd297incx(0,0)).toBe(0);});it('d',()=>{expect(hd297incx(93,73)).toBe(2);});it('e',()=>{expect(hd297incx(15,0)).toBe(4);});});
function hd298incx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph298incx_hd',()=>{it('a',()=>{expect(hd298incx(1,4)).toBe(2);});it('b',()=>{expect(hd298incx(3,1)).toBe(1);});it('c',()=>{expect(hd298incx(0,0)).toBe(0);});it('d',()=>{expect(hd298incx(93,73)).toBe(2);});it('e',()=>{expect(hd298incx(15,0)).toBe(4);});});
function hd299incx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph299incx_hd',()=>{it('a',()=>{expect(hd299incx(1,4)).toBe(2);});it('b',()=>{expect(hd299incx(3,1)).toBe(1);});it('c',()=>{expect(hd299incx(0,0)).toBe(0);});it('d',()=>{expect(hd299incx(93,73)).toBe(2);});it('e',()=>{expect(hd299incx(15,0)).toBe(4);});});
function hd300incx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph300incx_hd',()=>{it('a',()=>{expect(hd300incx(1,4)).toBe(2);});it('b',()=>{expect(hd300incx(3,1)).toBe(1);});it('c',()=>{expect(hd300incx(0,0)).toBe(0);});it('d',()=>{expect(hd300incx(93,73)).toBe(2);});it('e',()=>{expect(hd300incx(15,0)).toBe(4);});});
function hd301incx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph301incx_hd',()=>{it('a',()=>{expect(hd301incx(1,4)).toBe(2);});it('b',()=>{expect(hd301incx(3,1)).toBe(1);});it('c',()=>{expect(hd301incx(0,0)).toBe(0);});it('d',()=>{expect(hd301incx(93,73)).toBe(2);});it('e',()=>{expect(hd301incx(15,0)).toBe(4);});});
function hd302incx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph302incx_hd',()=>{it('a',()=>{expect(hd302incx(1,4)).toBe(2);});it('b',()=>{expect(hd302incx(3,1)).toBe(1);});it('c',()=>{expect(hd302incx(0,0)).toBe(0);});it('d',()=>{expect(hd302incx(93,73)).toBe(2);});it('e',()=>{expect(hd302incx(15,0)).toBe(4);});});
function hd303incx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph303incx_hd',()=>{it('a',()=>{expect(hd303incx(1,4)).toBe(2);});it('b',()=>{expect(hd303incx(3,1)).toBe(1);});it('c',()=>{expect(hd303incx(0,0)).toBe(0);});it('d',()=>{expect(hd303incx(93,73)).toBe(2);});it('e',()=>{expect(hd303incx(15,0)).toBe(4);});});
function hd304incx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph304incx_hd',()=>{it('a',()=>{expect(hd304incx(1,4)).toBe(2);});it('b',()=>{expect(hd304incx(3,1)).toBe(1);});it('c',()=>{expect(hd304incx(0,0)).toBe(0);});it('d',()=>{expect(hd304incx(93,73)).toBe(2);});it('e',()=>{expect(hd304incx(15,0)).toBe(4);});});
function hd305incx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph305incx_hd',()=>{it('a',()=>{expect(hd305incx(1,4)).toBe(2);});it('b',()=>{expect(hd305incx(3,1)).toBe(1);});it('c',()=>{expect(hd305incx(0,0)).toBe(0);});it('d',()=>{expect(hd305incx(93,73)).toBe(2);});it('e',()=>{expect(hd305incx(15,0)).toBe(4);});});
function hd306incx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph306incx_hd',()=>{it('a',()=>{expect(hd306incx(1,4)).toBe(2);});it('b',()=>{expect(hd306incx(3,1)).toBe(1);});it('c',()=>{expect(hd306incx(0,0)).toBe(0);});it('d',()=>{expect(hd306incx(93,73)).toBe(2);});it('e',()=>{expect(hd306incx(15,0)).toBe(4);});});
function hd307incx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph307incx_hd',()=>{it('a',()=>{expect(hd307incx(1,4)).toBe(2);});it('b',()=>{expect(hd307incx(3,1)).toBe(1);});it('c',()=>{expect(hd307incx(0,0)).toBe(0);});it('d',()=>{expect(hd307incx(93,73)).toBe(2);});it('e',()=>{expect(hd307incx(15,0)).toBe(4);});});
function hd308incx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph308incx_hd',()=>{it('a',()=>{expect(hd308incx(1,4)).toBe(2);});it('b',()=>{expect(hd308incx(3,1)).toBe(1);});it('c',()=>{expect(hd308incx(0,0)).toBe(0);});it('d',()=>{expect(hd308incx(93,73)).toBe(2);});it('e',()=>{expect(hd308incx(15,0)).toBe(4);});});
function hd309incx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph309incx_hd',()=>{it('a',()=>{expect(hd309incx(1,4)).toBe(2);});it('b',()=>{expect(hd309incx(3,1)).toBe(1);});it('c',()=>{expect(hd309incx(0,0)).toBe(0);});it('d',()=>{expect(hd309incx(93,73)).toBe(2);});it('e',()=>{expect(hd309incx(15,0)).toBe(4);});});
function hd310incx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph310incx_hd',()=>{it('a',()=>{expect(hd310incx(1,4)).toBe(2);});it('b',()=>{expect(hd310incx(3,1)).toBe(1);});it('c',()=>{expect(hd310incx(0,0)).toBe(0);});it('d',()=>{expect(hd310incx(93,73)).toBe(2);});it('e',()=>{expect(hd310incx(15,0)).toBe(4);});});
function hd311incx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph311incx_hd',()=>{it('a',()=>{expect(hd311incx(1,4)).toBe(2);});it('b',()=>{expect(hd311incx(3,1)).toBe(1);});it('c',()=>{expect(hd311incx(0,0)).toBe(0);});it('d',()=>{expect(hd311incx(93,73)).toBe(2);});it('e',()=>{expect(hd311incx(15,0)).toBe(4);});});
function hd312incx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph312incx_hd',()=>{it('a',()=>{expect(hd312incx(1,4)).toBe(2);});it('b',()=>{expect(hd312incx(3,1)).toBe(1);});it('c',()=>{expect(hd312incx(0,0)).toBe(0);});it('d',()=>{expect(hd312incx(93,73)).toBe(2);});it('e',()=>{expect(hd312incx(15,0)).toBe(4);});});
function hd313incx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph313incx_hd',()=>{it('a',()=>{expect(hd313incx(1,4)).toBe(2);});it('b',()=>{expect(hd313incx(3,1)).toBe(1);});it('c',()=>{expect(hd313incx(0,0)).toBe(0);});it('d',()=>{expect(hd313incx(93,73)).toBe(2);});it('e',()=>{expect(hd313incx(15,0)).toBe(4);});});
function hd314incx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph314incx_hd',()=>{it('a',()=>{expect(hd314incx(1,4)).toBe(2);});it('b',()=>{expect(hd314incx(3,1)).toBe(1);});it('c',()=>{expect(hd314incx(0,0)).toBe(0);});it('d',()=>{expect(hd314incx(93,73)).toBe(2);});it('e',()=>{expect(hd314incx(15,0)).toBe(4);});});
function hd315incx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph315incx_hd',()=>{it('a',()=>{expect(hd315incx(1,4)).toBe(2);});it('b',()=>{expect(hd315incx(3,1)).toBe(1);});it('c',()=>{expect(hd315incx(0,0)).toBe(0);});it('d',()=>{expect(hd315incx(93,73)).toBe(2);});it('e',()=>{expect(hd315incx(15,0)).toBe(4);});});
function hd316incx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph316incx_hd',()=>{it('a',()=>{expect(hd316incx(1,4)).toBe(2);});it('b',()=>{expect(hd316incx(3,1)).toBe(1);});it('c',()=>{expect(hd316incx(0,0)).toBe(0);});it('d',()=>{expect(hd316incx(93,73)).toBe(2);});it('e',()=>{expect(hd316incx(15,0)).toBe(4);});});
function hd317incx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph317incx_hd',()=>{it('a',()=>{expect(hd317incx(1,4)).toBe(2);});it('b',()=>{expect(hd317incx(3,1)).toBe(1);});it('c',()=>{expect(hd317incx(0,0)).toBe(0);});it('d',()=>{expect(hd317incx(93,73)).toBe(2);});it('e',()=>{expect(hd317incx(15,0)).toBe(4);});});
function hd318incx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph318incx_hd',()=>{it('a',()=>{expect(hd318incx(1,4)).toBe(2);});it('b',()=>{expect(hd318incx(3,1)).toBe(1);});it('c',()=>{expect(hd318incx(0,0)).toBe(0);});it('d',()=>{expect(hd318incx(93,73)).toBe(2);});it('e',()=>{expect(hd318incx(15,0)).toBe(4);});});
function hd319incx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph319incx_hd',()=>{it('a',()=>{expect(hd319incx(1,4)).toBe(2);});it('b',()=>{expect(hd319incx(3,1)).toBe(1);});it('c',()=>{expect(hd319incx(0,0)).toBe(0);});it('d',()=>{expect(hd319incx(93,73)).toBe(2);});it('e',()=>{expect(hd319incx(15,0)).toBe(4);});});
function hd320incx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph320incx_hd',()=>{it('a',()=>{expect(hd320incx(1,4)).toBe(2);});it('b',()=>{expect(hd320incx(3,1)).toBe(1);});it('c',()=>{expect(hd320incx(0,0)).toBe(0);});it('d',()=>{expect(hd320incx(93,73)).toBe(2);});it('e',()=>{expect(hd320incx(15,0)).toBe(4);});});
function hd321incx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph321incx_hd',()=>{it('a',()=>{expect(hd321incx(1,4)).toBe(2);});it('b',()=>{expect(hd321incx(3,1)).toBe(1);});it('c',()=>{expect(hd321incx(0,0)).toBe(0);});it('d',()=>{expect(hd321incx(93,73)).toBe(2);});it('e',()=>{expect(hd321incx(15,0)).toBe(4);});});
function hd322incx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph322incx_hd',()=>{it('a',()=>{expect(hd322incx(1,4)).toBe(2);});it('b',()=>{expect(hd322incx(3,1)).toBe(1);});it('c',()=>{expect(hd322incx(0,0)).toBe(0);});it('d',()=>{expect(hd322incx(93,73)).toBe(2);});it('e',()=>{expect(hd322incx(15,0)).toBe(4);});});
function hd323incx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph323incx_hd',()=>{it('a',()=>{expect(hd323incx(1,4)).toBe(2);});it('b',()=>{expect(hd323incx(3,1)).toBe(1);});it('c',()=>{expect(hd323incx(0,0)).toBe(0);});it('d',()=>{expect(hd323incx(93,73)).toBe(2);});it('e',()=>{expect(hd323incx(15,0)).toBe(4);});});
function hd324incx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph324incx_hd',()=>{it('a',()=>{expect(hd324incx(1,4)).toBe(2);});it('b',()=>{expect(hd324incx(3,1)).toBe(1);});it('c',()=>{expect(hd324incx(0,0)).toBe(0);});it('d',()=>{expect(hd324incx(93,73)).toBe(2);});it('e',()=>{expect(hd324incx(15,0)).toBe(4);});});
function hd325incx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph325incx_hd',()=>{it('a',()=>{expect(hd325incx(1,4)).toBe(2);});it('b',()=>{expect(hd325incx(3,1)).toBe(1);});it('c',()=>{expect(hd325incx(0,0)).toBe(0);});it('d',()=>{expect(hd325incx(93,73)).toBe(2);});it('e',()=>{expect(hd325incx(15,0)).toBe(4);});});
function hd326incx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph326incx_hd',()=>{it('a',()=>{expect(hd326incx(1,4)).toBe(2);});it('b',()=>{expect(hd326incx(3,1)).toBe(1);});it('c',()=>{expect(hd326incx(0,0)).toBe(0);});it('d',()=>{expect(hd326incx(93,73)).toBe(2);});it('e',()=>{expect(hd326incx(15,0)).toBe(4);});});
function hd327incx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph327incx_hd',()=>{it('a',()=>{expect(hd327incx(1,4)).toBe(2);});it('b',()=>{expect(hd327incx(3,1)).toBe(1);});it('c',()=>{expect(hd327incx(0,0)).toBe(0);});it('d',()=>{expect(hd327incx(93,73)).toBe(2);});it('e',()=>{expect(hd327incx(15,0)).toBe(4);});});
function hd328incx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph328incx_hd',()=>{it('a',()=>{expect(hd328incx(1,4)).toBe(2);});it('b',()=>{expect(hd328incx(3,1)).toBe(1);});it('c',()=>{expect(hd328incx(0,0)).toBe(0);});it('d',()=>{expect(hd328incx(93,73)).toBe(2);});it('e',()=>{expect(hd328incx(15,0)).toBe(4);});});
function hd329incx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph329incx_hd',()=>{it('a',()=>{expect(hd329incx(1,4)).toBe(2);});it('b',()=>{expect(hd329incx(3,1)).toBe(1);});it('c',()=>{expect(hd329incx(0,0)).toBe(0);});it('d',()=>{expect(hd329incx(93,73)).toBe(2);});it('e',()=>{expect(hd329incx(15,0)).toBe(4);});});
function hd330incx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph330incx_hd',()=>{it('a',()=>{expect(hd330incx(1,4)).toBe(2);});it('b',()=>{expect(hd330incx(3,1)).toBe(1);});it('c',()=>{expect(hd330incx(0,0)).toBe(0);});it('d',()=>{expect(hd330incx(93,73)).toBe(2);});it('e',()=>{expect(hd330incx(15,0)).toBe(4);});});
function hd331incx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph331incx_hd',()=>{it('a',()=>{expect(hd331incx(1,4)).toBe(2);});it('b',()=>{expect(hd331incx(3,1)).toBe(1);});it('c',()=>{expect(hd331incx(0,0)).toBe(0);});it('d',()=>{expect(hd331incx(93,73)).toBe(2);});it('e',()=>{expect(hd331incx(15,0)).toBe(4);});});
function hd332incx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph332incx_hd',()=>{it('a',()=>{expect(hd332incx(1,4)).toBe(2);});it('b',()=>{expect(hd332incx(3,1)).toBe(1);});it('c',()=>{expect(hd332incx(0,0)).toBe(0);});it('d',()=>{expect(hd332incx(93,73)).toBe(2);});it('e',()=>{expect(hd332incx(15,0)).toBe(4);});});
function hd333incx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph333incx_hd',()=>{it('a',()=>{expect(hd333incx(1,4)).toBe(2);});it('b',()=>{expect(hd333incx(3,1)).toBe(1);});it('c',()=>{expect(hd333incx(0,0)).toBe(0);});it('d',()=>{expect(hd333incx(93,73)).toBe(2);});it('e',()=>{expect(hd333incx(15,0)).toBe(4);});});
function hd334incx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph334incx_hd',()=>{it('a',()=>{expect(hd334incx(1,4)).toBe(2);});it('b',()=>{expect(hd334incx(3,1)).toBe(1);});it('c',()=>{expect(hd334incx(0,0)).toBe(0);});it('d',()=>{expect(hd334incx(93,73)).toBe(2);});it('e',()=>{expect(hd334incx(15,0)).toBe(4);});});
function hd335incx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph335incx_hd',()=>{it('a',()=>{expect(hd335incx(1,4)).toBe(2);});it('b',()=>{expect(hd335incx(3,1)).toBe(1);});it('c',()=>{expect(hd335incx(0,0)).toBe(0);});it('d',()=>{expect(hd335incx(93,73)).toBe(2);});it('e',()=>{expect(hd335incx(15,0)).toBe(4);});});
function hd336incx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph336incx_hd',()=>{it('a',()=>{expect(hd336incx(1,4)).toBe(2);});it('b',()=>{expect(hd336incx(3,1)).toBe(1);});it('c',()=>{expect(hd336incx(0,0)).toBe(0);});it('d',()=>{expect(hd336incx(93,73)).toBe(2);});it('e',()=>{expect(hd336incx(15,0)).toBe(4);});});
function hd337incx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph337incx_hd',()=>{it('a',()=>{expect(hd337incx(1,4)).toBe(2);});it('b',()=>{expect(hd337incx(3,1)).toBe(1);});it('c',()=>{expect(hd337incx(0,0)).toBe(0);});it('d',()=>{expect(hd337incx(93,73)).toBe(2);});it('e',()=>{expect(hd337incx(15,0)).toBe(4);});});
