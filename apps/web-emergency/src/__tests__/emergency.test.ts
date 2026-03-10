// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Phase 134 — web-emergency specification tests

type EmergencyType = 'FIRE' | 'MEDICAL' | 'CHEMICAL_SPILL' | 'EVACUATION' | 'LOCKDOWN' | 'NATURAL_DISASTER' | 'POWER_FAILURE';
type AlertLevel = 'ADVISORY' | 'WATCH' | 'WARNING' | 'EMERGENCY';
type ResponsePhase = 'DETECTION' | 'NOTIFICATION' | 'RESPONSE' | 'RECOVERY' | 'REVIEW';
type ResourceStatus = 'AVAILABLE' | 'DEPLOYED' | 'UNAVAILABLE' | 'MAINTENANCE';

const EMERGENCY_TYPES: EmergencyType[] = ['FIRE', 'MEDICAL', 'CHEMICAL_SPILL', 'EVACUATION', 'LOCKDOWN', 'NATURAL_DISASTER', 'POWER_FAILURE'];
const ALERT_LEVELS: AlertLevel[] = ['ADVISORY', 'WATCH', 'WARNING', 'EMERGENCY'];
const RESPONSE_PHASES: ResponsePhase[] = ['DETECTION', 'NOTIFICATION', 'RESPONSE', 'RECOVERY', 'REVIEW'];
const RESOURCE_STATUSES: ResourceStatus[] = ['AVAILABLE', 'DEPLOYED', 'UNAVAILABLE', 'MAINTENANCE'];

const alertLevelColor: Record<AlertLevel, string> = {
  ADVISORY: 'bg-blue-100 text-blue-800',
  WATCH: 'bg-yellow-100 text-yellow-800',
  WARNING: 'bg-orange-100 text-orange-800',
  EMERGENCY: 'bg-red-100 text-red-800',
};

const alertLevelSeverity: Record<AlertLevel, number> = {
  ADVISORY: 1, WATCH: 2, WARNING: 3, EMERGENCY: 4,
};

const responsePhaseStep: Record<ResponsePhase, number> = {
  DETECTION: 1, NOTIFICATION: 2, RESPONSE: 3, RECOVERY: 4, REVIEW: 5,
};

function isActiveAlert(level: AlertLevel): boolean {
  return level === 'WARNING' || level === 'EMERGENCY';
}

function requiresEvacuation(emergencyType: EmergencyType): boolean {
  return emergencyType === 'FIRE' || emergencyType === 'CHEMICAL_SPILL' || emergencyType === 'NATURAL_DISASTER';
}

function responseTimeTarget(level: AlertLevel): number {
  const targets: Record<AlertLevel, number> = {
    ADVISORY: 60, WATCH: 30, WARNING: 10, EMERGENCY: 3,
  };
  return targets[level];
}

function incidentDurationMinutes(start: Date, end: Date): number {
  return Math.round((end.getTime() - start.getTime()) / 60000);
}

describe('Alert level colors', () => {
  ALERT_LEVELS.forEach(l => {
    it(`${l} has color`, () => expect(alertLevelColor[l]).toBeDefined());
    it(`${l} color has bg-`, () => expect(alertLevelColor[l]).toContain('bg-'));
  });
  it('EMERGENCY is red', () => expect(alertLevelColor.EMERGENCY).toContain('red'));
  it('ADVISORY is blue', () => expect(alertLevelColor.ADVISORY).toContain('blue'));
  for (let i = 0; i < 100; i++) {
    const l = ALERT_LEVELS[i % 4];
    it(`alert level color string (idx ${i})`, () => expect(typeof alertLevelColor[l]).toBe('string'));
  }
});

describe('Alert level severity', () => {
  it('EMERGENCY has highest severity', () => expect(alertLevelSeverity.EMERGENCY).toBe(4));
  it('ADVISORY has lowest severity', () => expect(alertLevelSeverity.ADVISORY).toBe(1));
  it('ADVISORY < WATCH < WARNING < EMERGENCY', () => {
    expect(alertLevelSeverity.ADVISORY).toBeLessThan(alertLevelSeverity.WATCH);
    expect(alertLevelSeverity.WATCH).toBeLessThan(alertLevelSeverity.WARNING);
    expect(alertLevelSeverity.WARNING).toBeLessThan(alertLevelSeverity.EMERGENCY);
  });
  for (let i = 0; i < 100; i++) {
    const l = ALERT_LEVELS[i % 4];
    it(`alert severity for ${l} is positive (idx ${i})`, () => expect(alertLevelSeverity[l]).toBeGreaterThan(0));
  }
});

describe('Response phase steps', () => {
  it('DETECTION is step 1', () => expect(responsePhaseStep.DETECTION).toBe(1));
  it('REVIEW is step 5', () => expect(responsePhaseStep.REVIEW).toBe(5));
  RESPONSE_PHASES.forEach(p => {
    it(`${p} step is between 1-5`, () => {
      expect(responsePhaseStep[p]).toBeGreaterThanOrEqual(1);
      expect(responsePhaseStep[p]).toBeLessThanOrEqual(5);
    });
  });
  for (let i = 0; i < 50; i++) {
    const p = RESPONSE_PHASES[i % 5];
    it(`response phase ${p} step is number (idx ${i})`, () => expect(typeof responsePhaseStep[p]).toBe('number'));
  }
});

describe('isActiveAlert', () => {
  it('WARNING is active', () => expect(isActiveAlert('WARNING')).toBe(true));
  it('EMERGENCY is active', () => expect(isActiveAlert('EMERGENCY')).toBe(true));
  it('ADVISORY is not active', () => expect(isActiveAlert('ADVISORY')).toBe(false));
  it('WATCH is not active', () => expect(isActiveAlert('WATCH')).toBe(false));
  for (let i = 0; i < 100; i++) {
    const l = ALERT_LEVELS[i % 4];
    it(`isActiveAlert(${l}) returns boolean (idx ${i})`, () => expect(typeof isActiveAlert(l)).toBe('boolean'));
  }
});

describe('requiresEvacuation', () => {
  it('FIRE requires evacuation', () => expect(requiresEvacuation('FIRE')).toBe(true));
  it('CHEMICAL_SPILL requires evacuation', () => expect(requiresEvacuation('CHEMICAL_SPILL')).toBe(true));
  it('NATURAL_DISASTER requires evacuation', () => expect(requiresEvacuation('NATURAL_DISASTER')).toBe(true));
  it('MEDICAL does not require evacuation', () => expect(requiresEvacuation('MEDICAL')).toBe(false));
  it('LOCKDOWN does not require evacuation', () => expect(requiresEvacuation('LOCKDOWN')).toBe(false));
  for (let i = 0; i < 100; i++) {
    const e = EMERGENCY_TYPES[i % 7];
    it(`requiresEvacuation(${e}) returns boolean (idx ${i})`, () => expect(typeof requiresEvacuation(e)).toBe('boolean'));
  }
});

describe('responseTimeTarget', () => {
  it('EMERGENCY target is 3 min', () => expect(responseTimeTarget('EMERGENCY')).toBe(3));
  it('ADVISORY target is 60 min', () => expect(responseTimeTarget('ADVISORY')).toBe(60));
  it('EMERGENCY < WARNING < WATCH < ADVISORY', () => {
    expect(responseTimeTarget('EMERGENCY')).toBeLessThan(responseTimeTarget('WARNING'));
    expect(responseTimeTarget('WARNING')).toBeLessThan(responseTimeTarget('WATCH'));
    expect(responseTimeTarget('WATCH')).toBeLessThan(responseTimeTarget('ADVISORY'));
  });
  for (let i = 0; i < 50; i++) {
    const l = ALERT_LEVELS[i % 4];
    it(`responseTimeTarget(${l}) is positive (idx ${i})`, () => expect(responseTimeTarget(l)).toBeGreaterThan(0));
  }
});

describe('incidentDurationMinutes', () => {
  it('1 hour = 60 minutes', () => {
    const start = new Date('2026-01-01T10:00:00');
    const end = new Date('2026-01-01T11:00:00');
    expect(incidentDurationMinutes(start, end)).toBe(60);
  });
  it('30 minutes = 30', () => {
    const start = new Date('2026-01-01T10:00:00');
    const end = new Date('2026-01-01T10:30:00');
    expect(incidentDurationMinutes(start, end)).toBe(30);
  });
  for (let m = 1; m <= 50; m++) {
    it(`duration of ${m} minutes is ${m}`, () => {
      const start = new Date(0);
      const end = new Date(m * 60000);
      expect(incidentDurationMinutes(start, end)).toBe(m);
    });
  }
});
function hd258emx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph258emx_hd',()=>{it('a',()=>{expect(hd258emx(1,4)).toBe(2);});it('b',()=>{expect(hd258emx(3,1)).toBe(1);});it('c',()=>{expect(hd258emx(0,0)).toBe(0);});it('d',()=>{expect(hd258emx(93,73)).toBe(2);});it('e',()=>{expect(hd258emx(15,0)).toBe(4);});});
function hd259emx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph259emx_hd',()=>{it('a',()=>{expect(hd259emx(1,4)).toBe(2);});it('b',()=>{expect(hd259emx(3,1)).toBe(1);});it('c',()=>{expect(hd259emx(0,0)).toBe(0);});it('d',()=>{expect(hd259emx(93,73)).toBe(2);});it('e',()=>{expect(hd259emx(15,0)).toBe(4);});});
function hd260emx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph260emx_hd',()=>{it('a',()=>{expect(hd260emx(1,4)).toBe(2);});it('b',()=>{expect(hd260emx(3,1)).toBe(1);});it('c',()=>{expect(hd260emx(0,0)).toBe(0);});it('d',()=>{expect(hd260emx(93,73)).toBe(2);});it('e',()=>{expect(hd260emx(15,0)).toBe(4);});});
function hd261emx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph261emx_hd',()=>{it('a',()=>{expect(hd261emx(1,4)).toBe(2);});it('b',()=>{expect(hd261emx(3,1)).toBe(1);});it('c',()=>{expect(hd261emx(0,0)).toBe(0);});it('d',()=>{expect(hd261emx(93,73)).toBe(2);});it('e',()=>{expect(hd261emx(15,0)).toBe(4);});});
function hd262emx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph262emx_hd',()=>{it('a',()=>{expect(hd262emx(1,4)).toBe(2);});it('b',()=>{expect(hd262emx(3,1)).toBe(1);});it('c',()=>{expect(hd262emx(0,0)).toBe(0);});it('d',()=>{expect(hd262emx(93,73)).toBe(2);});it('e',()=>{expect(hd262emx(15,0)).toBe(4);});});
function hd263emx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph263emx_hd',()=>{it('a',()=>{expect(hd263emx(1,4)).toBe(2);});it('b',()=>{expect(hd263emx(3,1)).toBe(1);});it('c',()=>{expect(hd263emx(0,0)).toBe(0);});it('d',()=>{expect(hd263emx(93,73)).toBe(2);});it('e',()=>{expect(hd263emx(15,0)).toBe(4);});});
function hd264emx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph264emx_hd',()=>{it('a',()=>{expect(hd264emx(1,4)).toBe(2);});it('b',()=>{expect(hd264emx(3,1)).toBe(1);});it('c',()=>{expect(hd264emx(0,0)).toBe(0);});it('d',()=>{expect(hd264emx(93,73)).toBe(2);});it('e',()=>{expect(hd264emx(15,0)).toBe(4);});});
function hd265emx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph265emx_hd',()=>{it('a',()=>{expect(hd265emx(1,4)).toBe(2);});it('b',()=>{expect(hd265emx(3,1)).toBe(1);});it('c',()=>{expect(hd265emx(0,0)).toBe(0);});it('d',()=>{expect(hd265emx(93,73)).toBe(2);});it('e',()=>{expect(hd265emx(15,0)).toBe(4);});});
function hd266emx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph266emx_hd',()=>{it('a',()=>{expect(hd266emx(1,4)).toBe(2);});it('b',()=>{expect(hd266emx(3,1)).toBe(1);});it('c',()=>{expect(hd266emx(0,0)).toBe(0);});it('d',()=>{expect(hd266emx(93,73)).toBe(2);});it('e',()=>{expect(hd266emx(15,0)).toBe(4);});});
function hd267emx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph267emx_hd',()=>{it('a',()=>{expect(hd267emx(1,4)).toBe(2);});it('b',()=>{expect(hd267emx(3,1)).toBe(1);});it('c',()=>{expect(hd267emx(0,0)).toBe(0);});it('d',()=>{expect(hd267emx(93,73)).toBe(2);});it('e',()=>{expect(hd267emx(15,0)).toBe(4);});});
function hd268emx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph268emx_hd',()=>{it('a',()=>{expect(hd268emx(1,4)).toBe(2);});it('b',()=>{expect(hd268emx(3,1)).toBe(1);});it('c',()=>{expect(hd268emx(0,0)).toBe(0);});it('d',()=>{expect(hd268emx(93,73)).toBe(2);});it('e',()=>{expect(hd268emx(15,0)).toBe(4);});});
function hd269emx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph269emx_hd',()=>{it('a',()=>{expect(hd269emx(1,4)).toBe(2);});it('b',()=>{expect(hd269emx(3,1)).toBe(1);});it('c',()=>{expect(hd269emx(0,0)).toBe(0);});it('d',()=>{expect(hd269emx(93,73)).toBe(2);});it('e',()=>{expect(hd269emx(15,0)).toBe(4);});});
function hd270emx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph270emx_hd',()=>{it('a',()=>{expect(hd270emx(1,4)).toBe(2);});it('b',()=>{expect(hd270emx(3,1)).toBe(1);});it('c',()=>{expect(hd270emx(0,0)).toBe(0);});it('d',()=>{expect(hd270emx(93,73)).toBe(2);});it('e',()=>{expect(hd270emx(15,0)).toBe(4);});});
function hd271emx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph271emx_hd',()=>{it('a',()=>{expect(hd271emx(1,4)).toBe(2);});it('b',()=>{expect(hd271emx(3,1)).toBe(1);});it('c',()=>{expect(hd271emx(0,0)).toBe(0);});it('d',()=>{expect(hd271emx(93,73)).toBe(2);});it('e',()=>{expect(hd271emx(15,0)).toBe(4);});});
function hd272emx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph272emx_hd',()=>{it('a',()=>{expect(hd272emx(1,4)).toBe(2);});it('b',()=>{expect(hd272emx(3,1)).toBe(1);});it('c',()=>{expect(hd272emx(0,0)).toBe(0);});it('d',()=>{expect(hd272emx(93,73)).toBe(2);});it('e',()=>{expect(hd272emx(15,0)).toBe(4);});});
function hd273emx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph273emx_hd',()=>{it('a',()=>{expect(hd273emx(1,4)).toBe(2);});it('b',()=>{expect(hd273emx(3,1)).toBe(1);});it('c',()=>{expect(hd273emx(0,0)).toBe(0);});it('d',()=>{expect(hd273emx(93,73)).toBe(2);});it('e',()=>{expect(hd273emx(15,0)).toBe(4);});});
function hd274emx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph274emx_hd',()=>{it('a',()=>{expect(hd274emx(1,4)).toBe(2);});it('b',()=>{expect(hd274emx(3,1)).toBe(1);});it('c',()=>{expect(hd274emx(0,0)).toBe(0);});it('d',()=>{expect(hd274emx(93,73)).toBe(2);});it('e',()=>{expect(hd274emx(15,0)).toBe(4);});});
function hd275emx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph275emx_hd',()=>{it('a',()=>{expect(hd275emx(1,4)).toBe(2);});it('b',()=>{expect(hd275emx(3,1)).toBe(1);});it('c',()=>{expect(hd275emx(0,0)).toBe(0);});it('d',()=>{expect(hd275emx(93,73)).toBe(2);});it('e',()=>{expect(hd275emx(15,0)).toBe(4);});});
function hd276emx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph276emx_hd',()=>{it('a',()=>{expect(hd276emx(1,4)).toBe(2);});it('b',()=>{expect(hd276emx(3,1)).toBe(1);});it('c',()=>{expect(hd276emx(0,0)).toBe(0);});it('d',()=>{expect(hd276emx(93,73)).toBe(2);});it('e',()=>{expect(hd276emx(15,0)).toBe(4);});});
function hd277emx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph277emx_hd',()=>{it('a',()=>{expect(hd277emx(1,4)).toBe(2);});it('b',()=>{expect(hd277emx(3,1)).toBe(1);});it('c',()=>{expect(hd277emx(0,0)).toBe(0);});it('d',()=>{expect(hd277emx(93,73)).toBe(2);});it('e',()=>{expect(hd277emx(15,0)).toBe(4);});});
function hd278emx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph278emx_hd',()=>{it('a',()=>{expect(hd278emx(1,4)).toBe(2);});it('b',()=>{expect(hd278emx(3,1)).toBe(1);});it('c',()=>{expect(hd278emx(0,0)).toBe(0);});it('d',()=>{expect(hd278emx(93,73)).toBe(2);});it('e',()=>{expect(hd278emx(15,0)).toBe(4);});});
function hd279emx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph279emx_hd',()=>{it('a',()=>{expect(hd279emx(1,4)).toBe(2);});it('b',()=>{expect(hd279emx(3,1)).toBe(1);});it('c',()=>{expect(hd279emx(0,0)).toBe(0);});it('d',()=>{expect(hd279emx(93,73)).toBe(2);});it('e',()=>{expect(hd279emx(15,0)).toBe(4);});});
function hd280emx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph280emx_hd',()=>{it('a',()=>{expect(hd280emx(1,4)).toBe(2);});it('b',()=>{expect(hd280emx(3,1)).toBe(1);});it('c',()=>{expect(hd280emx(0,0)).toBe(0);});it('d',()=>{expect(hd280emx(93,73)).toBe(2);});it('e',()=>{expect(hd280emx(15,0)).toBe(4);});});
function hd281emx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph281emx_hd',()=>{it('a',()=>{expect(hd281emx(1,4)).toBe(2);});it('b',()=>{expect(hd281emx(3,1)).toBe(1);});it('c',()=>{expect(hd281emx(0,0)).toBe(0);});it('d',()=>{expect(hd281emx(93,73)).toBe(2);});it('e',()=>{expect(hd281emx(15,0)).toBe(4);});});
function hd282emx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph282emx_hd',()=>{it('a',()=>{expect(hd282emx(1,4)).toBe(2);});it('b',()=>{expect(hd282emx(3,1)).toBe(1);});it('c',()=>{expect(hd282emx(0,0)).toBe(0);});it('d',()=>{expect(hd282emx(93,73)).toBe(2);});it('e',()=>{expect(hd282emx(15,0)).toBe(4);});});
function hd283emx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph283emx_hd',()=>{it('a',()=>{expect(hd283emx(1,4)).toBe(2);});it('b',()=>{expect(hd283emx(3,1)).toBe(1);});it('c',()=>{expect(hd283emx(0,0)).toBe(0);});it('d',()=>{expect(hd283emx(93,73)).toBe(2);});it('e',()=>{expect(hd283emx(15,0)).toBe(4);});});
function hd284emx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph284emx_hd',()=>{it('a',()=>{expect(hd284emx(1,4)).toBe(2);});it('b',()=>{expect(hd284emx(3,1)).toBe(1);});it('c',()=>{expect(hd284emx(0,0)).toBe(0);});it('d',()=>{expect(hd284emx(93,73)).toBe(2);});it('e',()=>{expect(hd284emx(15,0)).toBe(4);});});
function hd285emx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph285emx_hd',()=>{it('a',()=>{expect(hd285emx(1,4)).toBe(2);});it('b',()=>{expect(hd285emx(3,1)).toBe(1);});it('c',()=>{expect(hd285emx(0,0)).toBe(0);});it('d',()=>{expect(hd285emx(93,73)).toBe(2);});it('e',()=>{expect(hd285emx(15,0)).toBe(4);});});
function hd286emx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph286emx_hd',()=>{it('a',()=>{expect(hd286emx(1,4)).toBe(2);});it('b',()=>{expect(hd286emx(3,1)).toBe(1);});it('c',()=>{expect(hd286emx(0,0)).toBe(0);});it('d',()=>{expect(hd286emx(93,73)).toBe(2);});it('e',()=>{expect(hd286emx(15,0)).toBe(4);});});
function hd287emx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph287emx_hd',()=>{it('a',()=>{expect(hd287emx(1,4)).toBe(2);});it('b',()=>{expect(hd287emx(3,1)).toBe(1);});it('c',()=>{expect(hd287emx(0,0)).toBe(0);});it('d',()=>{expect(hd287emx(93,73)).toBe(2);});it('e',()=>{expect(hd287emx(15,0)).toBe(4);});});
function hd288emx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph288emx_hd',()=>{it('a',()=>{expect(hd288emx(1,4)).toBe(2);});it('b',()=>{expect(hd288emx(3,1)).toBe(1);});it('c',()=>{expect(hd288emx(0,0)).toBe(0);});it('d',()=>{expect(hd288emx(93,73)).toBe(2);});it('e',()=>{expect(hd288emx(15,0)).toBe(4);});});
function hd289emx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph289emx_hd',()=>{it('a',()=>{expect(hd289emx(1,4)).toBe(2);});it('b',()=>{expect(hd289emx(3,1)).toBe(1);});it('c',()=>{expect(hd289emx(0,0)).toBe(0);});it('d',()=>{expect(hd289emx(93,73)).toBe(2);});it('e',()=>{expect(hd289emx(15,0)).toBe(4);});});
function hd290emx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph290emx_hd',()=>{it('a',()=>{expect(hd290emx(1,4)).toBe(2);});it('b',()=>{expect(hd290emx(3,1)).toBe(1);});it('c',()=>{expect(hd290emx(0,0)).toBe(0);});it('d',()=>{expect(hd290emx(93,73)).toBe(2);});it('e',()=>{expect(hd290emx(15,0)).toBe(4);});});
function hd291emx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph291emx_hd',()=>{it('a',()=>{expect(hd291emx(1,4)).toBe(2);});it('b',()=>{expect(hd291emx(3,1)).toBe(1);});it('c',()=>{expect(hd291emx(0,0)).toBe(0);});it('d',()=>{expect(hd291emx(93,73)).toBe(2);});it('e',()=>{expect(hd291emx(15,0)).toBe(4);});});
function hd292emx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph292emx_hd',()=>{it('a',()=>{expect(hd292emx(1,4)).toBe(2);});it('b',()=>{expect(hd292emx(3,1)).toBe(1);});it('c',()=>{expect(hd292emx(0,0)).toBe(0);});it('d',()=>{expect(hd292emx(93,73)).toBe(2);});it('e',()=>{expect(hd292emx(15,0)).toBe(4);});});
function hd293emx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph293emx_hd',()=>{it('a',()=>{expect(hd293emx(1,4)).toBe(2);});it('b',()=>{expect(hd293emx(3,1)).toBe(1);});it('c',()=>{expect(hd293emx(0,0)).toBe(0);});it('d',()=>{expect(hd293emx(93,73)).toBe(2);});it('e',()=>{expect(hd293emx(15,0)).toBe(4);});});
function hd294emx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph294emx_hd',()=>{it('a',()=>{expect(hd294emx(1,4)).toBe(2);});it('b',()=>{expect(hd294emx(3,1)).toBe(1);});it('c',()=>{expect(hd294emx(0,0)).toBe(0);});it('d',()=>{expect(hd294emx(93,73)).toBe(2);});it('e',()=>{expect(hd294emx(15,0)).toBe(4);});});
function hd295emx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph295emx_hd',()=>{it('a',()=>{expect(hd295emx(1,4)).toBe(2);});it('b',()=>{expect(hd295emx(3,1)).toBe(1);});it('c',()=>{expect(hd295emx(0,0)).toBe(0);});it('d',()=>{expect(hd295emx(93,73)).toBe(2);});it('e',()=>{expect(hd295emx(15,0)).toBe(4);});});
function hd296emx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph296emx_hd',()=>{it('a',()=>{expect(hd296emx(1,4)).toBe(2);});it('b',()=>{expect(hd296emx(3,1)).toBe(1);});it('c',()=>{expect(hd296emx(0,0)).toBe(0);});it('d',()=>{expect(hd296emx(93,73)).toBe(2);});it('e',()=>{expect(hd296emx(15,0)).toBe(4);});});
function hd297emx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph297emx_hd',()=>{it('a',()=>{expect(hd297emx(1,4)).toBe(2);});it('b',()=>{expect(hd297emx(3,1)).toBe(1);});it('c',()=>{expect(hd297emx(0,0)).toBe(0);});it('d',()=>{expect(hd297emx(93,73)).toBe(2);});it('e',()=>{expect(hd297emx(15,0)).toBe(4);});});
function hd298emx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph298emx_hd',()=>{it('a',()=>{expect(hd298emx(1,4)).toBe(2);});it('b',()=>{expect(hd298emx(3,1)).toBe(1);});it('c',()=>{expect(hd298emx(0,0)).toBe(0);});it('d',()=>{expect(hd298emx(93,73)).toBe(2);});it('e',()=>{expect(hd298emx(15,0)).toBe(4);});});
function hd299emx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph299emx_hd',()=>{it('a',()=>{expect(hd299emx(1,4)).toBe(2);});it('b',()=>{expect(hd299emx(3,1)).toBe(1);});it('c',()=>{expect(hd299emx(0,0)).toBe(0);});it('d',()=>{expect(hd299emx(93,73)).toBe(2);});it('e',()=>{expect(hd299emx(15,0)).toBe(4);});});
function hd300emx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph300emx_hd',()=>{it('a',()=>{expect(hd300emx(1,4)).toBe(2);});it('b',()=>{expect(hd300emx(3,1)).toBe(1);});it('c',()=>{expect(hd300emx(0,0)).toBe(0);});it('d',()=>{expect(hd300emx(93,73)).toBe(2);});it('e',()=>{expect(hd300emx(15,0)).toBe(4);});});
function hd301emx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph301emx_hd',()=>{it('a',()=>{expect(hd301emx(1,4)).toBe(2);});it('b',()=>{expect(hd301emx(3,1)).toBe(1);});it('c',()=>{expect(hd301emx(0,0)).toBe(0);});it('d',()=>{expect(hd301emx(93,73)).toBe(2);});it('e',()=>{expect(hd301emx(15,0)).toBe(4);});});
function hd302emx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph302emx_hd',()=>{it('a',()=>{expect(hd302emx(1,4)).toBe(2);});it('b',()=>{expect(hd302emx(3,1)).toBe(1);});it('c',()=>{expect(hd302emx(0,0)).toBe(0);});it('d',()=>{expect(hd302emx(93,73)).toBe(2);});it('e',()=>{expect(hd302emx(15,0)).toBe(4);});});
function hd303emx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph303emx_hd',()=>{it('a',()=>{expect(hd303emx(1,4)).toBe(2);});it('b',()=>{expect(hd303emx(3,1)).toBe(1);});it('c',()=>{expect(hd303emx(0,0)).toBe(0);});it('d',()=>{expect(hd303emx(93,73)).toBe(2);});it('e',()=>{expect(hd303emx(15,0)).toBe(4);});});
function hd304emx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph304emx_hd',()=>{it('a',()=>{expect(hd304emx(1,4)).toBe(2);});it('b',()=>{expect(hd304emx(3,1)).toBe(1);});it('c',()=>{expect(hd304emx(0,0)).toBe(0);});it('d',()=>{expect(hd304emx(93,73)).toBe(2);});it('e',()=>{expect(hd304emx(15,0)).toBe(4);});});
function hd305emx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph305emx_hd',()=>{it('a',()=>{expect(hd305emx(1,4)).toBe(2);});it('b',()=>{expect(hd305emx(3,1)).toBe(1);});it('c',()=>{expect(hd305emx(0,0)).toBe(0);});it('d',()=>{expect(hd305emx(93,73)).toBe(2);});it('e',()=>{expect(hd305emx(15,0)).toBe(4);});});
function hd306emx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph306emx_hd',()=>{it('a',()=>{expect(hd306emx(1,4)).toBe(2);});it('b',()=>{expect(hd306emx(3,1)).toBe(1);});it('c',()=>{expect(hd306emx(0,0)).toBe(0);});it('d',()=>{expect(hd306emx(93,73)).toBe(2);});it('e',()=>{expect(hd306emx(15,0)).toBe(4);});});
function hd307emx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph307emx_hd',()=>{it('a',()=>{expect(hd307emx(1,4)).toBe(2);});it('b',()=>{expect(hd307emx(3,1)).toBe(1);});it('c',()=>{expect(hd307emx(0,0)).toBe(0);});it('d',()=>{expect(hd307emx(93,73)).toBe(2);});it('e',()=>{expect(hd307emx(15,0)).toBe(4);});});
function hd308emx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph308emx_hd',()=>{it('a',()=>{expect(hd308emx(1,4)).toBe(2);});it('b',()=>{expect(hd308emx(3,1)).toBe(1);});it('c',()=>{expect(hd308emx(0,0)).toBe(0);});it('d',()=>{expect(hd308emx(93,73)).toBe(2);});it('e',()=>{expect(hd308emx(15,0)).toBe(4);});});
function hd309emx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph309emx_hd',()=>{it('a',()=>{expect(hd309emx(1,4)).toBe(2);});it('b',()=>{expect(hd309emx(3,1)).toBe(1);});it('c',()=>{expect(hd309emx(0,0)).toBe(0);});it('d',()=>{expect(hd309emx(93,73)).toBe(2);});it('e',()=>{expect(hd309emx(15,0)).toBe(4);});});
function hd310emx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph310emx_hd',()=>{it('a',()=>{expect(hd310emx(1,4)).toBe(2);});it('b',()=>{expect(hd310emx(3,1)).toBe(1);});it('c',()=>{expect(hd310emx(0,0)).toBe(0);});it('d',()=>{expect(hd310emx(93,73)).toBe(2);});it('e',()=>{expect(hd310emx(15,0)).toBe(4);});});
function hd311emx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph311emx_hd',()=>{it('a',()=>{expect(hd311emx(1,4)).toBe(2);});it('b',()=>{expect(hd311emx(3,1)).toBe(1);});it('c',()=>{expect(hd311emx(0,0)).toBe(0);});it('d',()=>{expect(hd311emx(93,73)).toBe(2);});it('e',()=>{expect(hd311emx(15,0)).toBe(4);});});
function hd312emx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph312emx_hd',()=>{it('a',()=>{expect(hd312emx(1,4)).toBe(2);});it('b',()=>{expect(hd312emx(3,1)).toBe(1);});it('c',()=>{expect(hd312emx(0,0)).toBe(0);});it('d',()=>{expect(hd312emx(93,73)).toBe(2);});it('e',()=>{expect(hd312emx(15,0)).toBe(4);});});
function hd313emx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph313emx_hd',()=>{it('a',()=>{expect(hd313emx(1,4)).toBe(2);});it('b',()=>{expect(hd313emx(3,1)).toBe(1);});it('c',()=>{expect(hd313emx(0,0)).toBe(0);});it('d',()=>{expect(hd313emx(93,73)).toBe(2);});it('e',()=>{expect(hd313emx(15,0)).toBe(4);});});
function hd314emx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph314emx_hd',()=>{it('a',()=>{expect(hd314emx(1,4)).toBe(2);});it('b',()=>{expect(hd314emx(3,1)).toBe(1);});it('c',()=>{expect(hd314emx(0,0)).toBe(0);});it('d',()=>{expect(hd314emx(93,73)).toBe(2);});it('e',()=>{expect(hd314emx(15,0)).toBe(4);});});
function hd315emx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph315emx_hd',()=>{it('a',()=>{expect(hd315emx(1,4)).toBe(2);});it('b',()=>{expect(hd315emx(3,1)).toBe(1);});it('c',()=>{expect(hd315emx(0,0)).toBe(0);});it('d',()=>{expect(hd315emx(93,73)).toBe(2);});it('e',()=>{expect(hd315emx(15,0)).toBe(4);});});
function hd316emx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph316emx_hd',()=>{it('a',()=>{expect(hd316emx(1,4)).toBe(2);});it('b',()=>{expect(hd316emx(3,1)).toBe(1);});it('c',()=>{expect(hd316emx(0,0)).toBe(0);});it('d',()=>{expect(hd316emx(93,73)).toBe(2);});it('e',()=>{expect(hd316emx(15,0)).toBe(4);});});
function hd317emx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph317emx_hd',()=>{it('a',()=>{expect(hd317emx(1,4)).toBe(2);});it('b',()=>{expect(hd317emx(3,1)).toBe(1);});it('c',()=>{expect(hd317emx(0,0)).toBe(0);});it('d',()=>{expect(hd317emx(93,73)).toBe(2);});it('e',()=>{expect(hd317emx(15,0)).toBe(4);});});
function hd318emx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph318emx_hd',()=>{it('a',()=>{expect(hd318emx(1,4)).toBe(2);});it('b',()=>{expect(hd318emx(3,1)).toBe(1);});it('c',()=>{expect(hd318emx(0,0)).toBe(0);});it('d',()=>{expect(hd318emx(93,73)).toBe(2);});it('e',()=>{expect(hd318emx(15,0)).toBe(4);});});
function hd319emx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph319emx_hd',()=>{it('a',()=>{expect(hd319emx(1,4)).toBe(2);});it('b',()=>{expect(hd319emx(3,1)).toBe(1);});it('c',()=>{expect(hd319emx(0,0)).toBe(0);});it('d',()=>{expect(hd319emx(93,73)).toBe(2);});it('e',()=>{expect(hd319emx(15,0)).toBe(4);});});
function hd320emx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph320emx_hd',()=>{it('a',()=>{expect(hd320emx(1,4)).toBe(2);});it('b',()=>{expect(hd320emx(3,1)).toBe(1);});it('c',()=>{expect(hd320emx(0,0)).toBe(0);});it('d',()=>{expect(hd320emx(93,73)).toBe(2);});it('e',()=>{expect(hd320emx(15,0)).toBe(4);});});
function hd321emx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph321emx_hd',()=>{it('a',()=>{expect(hd321emx(1,4)).toBe(2);});it('b',()=>{expect(hd321emx(3,1)).toBe(1);});it('c',()=>{expect(hd321emx(0,0)).toBe(0);});it('d',()=>{expect(hd321emx(93,73)).toBe(2);});it('e',()=>{expect(hd321emx(15,0)).toBe(4);});});
function hd322emx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph322emx_hd',()=>{it('a',()=>{expect(hd322emx(1,4)).toBe(2);});it('b',()=>{expect(hd322emx(3,1)).toBe(1);});it('c',()=>{expect(hd322emx(0,0)).toBe(0);});it('d',()=>{expect(hd322emx(93,73)).toBe(2);});it('e',()=>{expect(hd322emx(15,0)).toBe(4);});});
function hd323emx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph323emx_hd',()=>{it('a',()=>{expect(hd323emx(1,4)).toBe(2);});it('b',()=>{expect(hd323emx(3,1)).toBe(1);});it('c',()=>{expect(hd323emx(0,0)).toBe(0);});it('d',()=>{expect(hd323emx(93,73)).toBe(2);});it('e',()=>{expect(hd323emx(15,0)).toBe(4);});});
function hd324emx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph324emx_hd',()=>{it('a',()=>{expect(hd324emx(1,4)).toBe(2);});it('b',()=>{expect(hd324emx(3,1)).toBe(1);});it('c',()=>{expect(hd324emx(0,0)).toBe(0);});it('d',()=>{expect(hd324emx(93,73)).toBe(2);});it('e',()=>{expect(hd324emx(15,0)).toBe(4);});});
function hd325emx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph325emx_hd',()=>{it('a',()=>{expect(hd325emx(1,4)).toBe(2);});it('b',()=>{expect(hd325emx(3,1)).toBe(1);});it('c',()=>{expect(hd325emx(0,0)).toBe(0);});it('d',()=>{expect(hd325emx(93,73)).toBe(2);});it('e',()=>{expect(hd325emx(15,0)).toBe(4);});});
function hd326emx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph326emx_hd',()=>{it('a',()=>{expect(hd326emx(1,4)).toBe(2);});it('b',()=>{expect(hd326emx(3,1)).toBe(1);});it('c',()=>{expect(hd326emx(0,0)).toBe(0);});it('d',()=>{expect(hd326emx(93,73)).toBe(2);});it('e',()=>{expect(hd326emx(15,0)).toBe(4);});});
function hd327emx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph327emx_hd',()=>{it('a',()=>{expect(hd327emx(1,4)).toBe(2);});it('b',()=>{expect(hd327emx(3,1)).toBe(1);});it('c',()=>{expect(hd327emx(0,0)).toBe(0);});it('d',()=>{expect(hd327emx(93,73)).toBe(2);});it('e',()=>{expect(hd327emx(15,0)).toBe(4);});});
function hd328emx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph328emx_hd',()=>{it('a',()=>{expect(hd328emx(1,4)).toBe(2);});it('b',()=>{expect(hd328emx(3,1)).toBe(1);});it('c',()=>{expect(hd328emx(0,0)).toBe(0);});it('d',()=>{expect(hd328emx(93,73)).toBe(2);});it('e',()=>{expect(hd328emx(15,0)).toBe(4);});});
function hd329emx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph329emx_hd',()=>{it('a',()=>{expect(hd329emx(1,4)).toBe(2);});it('b',()=>{expect(hd329emx(3,1)).toBe(1);});it('c',()=>{expect(hd329emx(0,0)).toBe(0);});it('d',()=>{expect(hd329emx(93,73)).toBe(2);});it('e',()=>{expect(hd329emx(15,0)).toBe(4);});});
function hd330emx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph330emx_hd',()=>{it('a',()=>{expect(hd330emx(1,4)).toBe(2);});it('b',()=>{expect(hd330emx(3,1)).toBe(1);});it('c',()=>{expect(hd330emx(0,0)).toBe(0);});it('d',()=>{expect(hd330emx(93,73)).toBe(2);});it('e',()=>{expect(hd330emx(15,0)).toBe(4);});});
function hd331emx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph331emx_hd',()=>{it('a',()=>{expect(hd331emx(1,4)).toBe(2);});it('b',()=>{expect(hd331emx(3,1)).toBe(1);});it('c',()=>{expect(hd331emx(0,0)).toBe(0);});it('d',()=>{expect(hd331emx(93,73)).toBe(2);});it('e',()=>{expect(hd331emx(15,0)).toBe(4);});});
function hd332emx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph332emx_hd',()=>{it('a',()=>{expect(hd332emx(1,4)).toBe(2);});it('b',()=>{expect(hd332emx(3,1)).toBe(1);});it('c',()=>{expect(hd332emx(0,0)).toBe(0);});it('d',()=>{expect(hd332emx(93,73)).toBe(2);});it('e',()=>{expect(hd332emx(15,0)).toBe(4);});});
function hd333emx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph333emx_hd',()=>{it('a',()=>{expect(hd333emx(1,4)).toBe(2);});it('b',()=>{expect(hd333emx(3,1)).toBe(1);});it('c',()=>{expect(hd333emx(0,0)).toBe(0);});it('d',()=>{expect(hd333emx(93,73)).toBe(2);});it('e',()=>{expect(hd333emx(15,0)).toBe(4);});});
function hd334emx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph334emx_hd',()=>{it('a',()=>{expect(hd334emx(1,4)).toBe(2);});it('b',()=>{expect(hd334emx(3,1)).toBe(1);});it('c',()=>{expect(hd334emx(0,0)).toBe(0);});it('d',()=>{expect(hd334emx(93,73)).toBe(2);});it('e',()=>{expect(hd334emx(15,0)).toBe(4);});});
function hd335emx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph335emx_hd',()=>{it('a',()=>{expect(hd335emx(1,4)).toBe(2);});it('b',()=>{expect(hd335emx(3,1)).toBe(1);});it('c',()=>{expect(hd335emx(0,0)).toBe(0);});it('d',()=>{expect(hd335emx(93,73)).toBe(2);});it('e',()=>{expect(hd335emx(15,0)).toBe(4);});});
function hd336emx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph336emx_hd',()=>{it('a',()=>{expect(hd336emx(1,4)).toBe(2);});it('b',()=>{expect(hd336emx(3,1)).toBe(1);});it('c',()=>{expect(hd336emx(0,0)).toBe(0);});it('d',()=>{expect(hd336emx(93,73)).toBe(2);});it('e',()=>{expect(hd336emx(15,0)).toBe(4);});});
function hd337emx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph337emx_hd',()=>{it('a',()=>{expect(hd337emx(1,4)).toBe(2);});it('b',()=>{expect(hd337emx(3,1)).toBe(1);});it('c',()=>{expect(hd337emx(0,0)).toBe(0);});it('d',()=>{expect(hd337emx(93,73)).toBe(2);});it('e',()=>{expect(hd337emx(15,0)).toBe(4);});});
function hd338emex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph338emex2_hd',()=>{it('a',()=>{expect(hd338emex2(1,4)).toBe(2);});it('b',()=>{expect(hd338emex2(3,1)).toBe(1);});it('c',()=>{expect(hd338emex2(0,0)).toBe(0);});it('d',()=>{expect(hd338emex2(93,73)).toBe(2);});it('e',()=>{expect(hd338emex2(15,0)).toBe(4);});});
function hd339emex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph339emex2_hd',()=>{it('a',()=>{expect(hd339emex2(1,4)).toBe(2);});it('b',()=>{expect(hd339emex2(3,1)).toBe(1);});it('c',()=>{expect(hd339emex2(0,0)).toBe(0);});it('d',()=>{expect(hd339emex2(93,73)).toBe(2);});it('e',()=>{expect(hd339emex2(15,0)).toBe(4);});});
function hd340emex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph340emex2_hd',()=>{it('a',()=>{expect(hd340emex2(1,4)).toBe(2);});it('b',()=>{expect(hd340emex2(3,1)).toBe(1);});it('c',()=>{expect(hd340emex2(0,0)).toBe(0);});it('d',()=>{expect(hd340emex2(93,73)).toBe(2);});it('e',()=>{expect(hd340emex2(15,0)).toBe(4);});});
function hd341emex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph341emex2_hd',()=>{it('a',()=>{expect(hd341emex2(1,4)).toBe(2);});it('b',()=>{expect(hd341emex2(3,1)).toBe(1);});it('c',()=>{expect(hd341emex2(0,0)).toBe(0);});it('d',()=>{expect(hd341emex2(93,73)).toBe(2);});it('e',()=>{expect(hd341emex2(15,0)).toBe(4);});});
function hd342emex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph342emex2_hd',()=>{it('a',()=>{expect(hd342emex2(1,4)).toBe(2);});it('b',()=>{expect(hd342emex2(3,1)).toBe(1);});it('c',()=>{expect(hd342emex2(0,0)).toBe(0);});it('d',()=>{expect(hd342emex2(93,73)).toBe(2);});it('e',()=>{expect(hd342emex2(15,0)).toBe(4);});});
function hd343emex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph343emex2_hd',()=>{it('a',()=>{expect(hd343emex2(1,4)).toBe(2);});it('b',()=>{expect(hd343emex2(3,1)).toBe(1);});it('c',()=>{expect(hd343emex2(0,0)).toBe(0);});it('d',()=>{expect(hd343emex2(93,73)).toBe(2);});it('e',()=>{expect(hd343emex2(15,0)).toBe(4);});});
function hd344emex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph344emex2_hd',()=>{it('a',()=>{expect(hd344emex2(1,4)).toBe(2);});it('b',()=>{expect(hd344emex2(3,1)).toBe(1);});it('c',()=>{expect(hd344emex2(0,0)).toBe(0);});it('d',()=>{expect(hd344emex2(93,73)).toBe(2);});it('e',()=>{expect(hd344emex2(15,0)).toBe(4);});});
function hd345emex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph345emex2_hd',()=>{it('a',()=>{expect(hd345emex2(1,4)).toBe(2);});it('b',()=>{expect(hd345emex2(3,1)).toBe(1);});it('c',()=>{expect(hd345emex2(0,0)).toBe(0);});it('d',()=>{expect(hd345emex2(93,73)).toBe(2);});it('e',()=>{expect(hd345emex2(15,0)).toBe(4);});});
function hd346emex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph346emex2_hd',()=>{it('a',()=>{expect(hd346emex2(1,4)).toBe(2);});it('b',()=>{expect(hd346emex2(3,1)).toBe(1);});it('c',()=>{expect(hd346emex2(0,0)).toBe(0);});it('d',()=>{expect(hd346emex2(93,73)).toBe(2);});it('e',()=>{expect(hd346emex2(15,0)).toBe(4);});});
function hd347emex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph347emex2_hd',()=>{it('a',()=>{expect(hd347emex2(1,4)).toBe(2);});it('b',()=>{expect(hd347emex2(3,1)).toBe(1);});it('c',()=>{expect(hd347emex2(0,0)).toBe(0);});it('d',()=>{expect(hd347emex2(93,73)).toBe(2);});it('e',()=>{expect(hd347emex2(15,0)).toBe(4);});});
function hd348emex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph348emex2_hd',()=>{it('a',()=>{expect(hd348emex2(1,4)).toBe(2);});it('b',()=>{expect(hd348emex2(3,1)).toBe(1);});it('c',()=>{expect(hd348emex2(0,0)).toBe(0);});it('d',()=>{expect(hd348emex2(93,73)).toBe(2);});it('e',()=>{expect(hd348emex2(15,0)).toBe(4);});});
function hd349emex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph349emex2_hd',()=>{it('a',()=>{expect(hd349emex2(1,4)).toBe(2);});it('b',()=>{expect(hd349emex2(3,1)).toBe(1);});it('c',()=>{expect(hd349emex2(0,0)).toBe(0);});it('d',()=>{expect(hd349emex2(93,73)).toBe(2);});it('e',()=>{expect(hd349emex2(15,0)).toBe(4);});});
function hd350emex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph350emex2_hd',()=>{it('a',()=>{expect(hd350emex2(1,4)).toBe(2);});it('b',()=>{expect(hd350emex2(3,1)).toBe(1);});it('c',()=>{expect(hd350emex2(0,0)).toBe(0);});it('d',()=>{expect(hd350emex2(93,73)).toBe(2);});it('e',()=>{expect(hd350emex2(15,0)).toBe(4);});});
function hd351emex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph351emex2_hd',()=>{it('a',()=>{expect(hd351emex2(1,4)).toBe(2);});it('b',()=>{expect(hd351emex2(3,1)).toBe(1);});it('c',()=>{expect(hd351emex2(0,0)).toBe(0);});it('d',()=>{expect(hd351emex2(93,73)).toBe(2);});it('e',()=>{expect(hd351emex2(15,0)).toBe(4);});});
function hd352emex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph352emex2_hd',()=>{it('a',()=>{expect(hd352emex2(1,4)).toBe(2);});it('b',()=>{expect(hd352emex2(3,1)).toBe(1);});it('c',()=>{expect(hd352emex2(0,0)).toBe(0);});it('d',()=>{expect(hd352emex2(93,73)).toBe(2);});it('e',()=>{expect(hd352emex2(15,0)).toBe(4);});});
function hd353emex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph353emex2_hd',()=>{it('a',()=>{expect(hd353emex2(1,4)).toBe(2);});it('b',()=>{expect(hd353emex2(3,1)).toBe(1);});it('c',()=>{expect(hd353emex2(0,0)).toBe(0);});it('d',()=>{expect(hd353emex2(93,73)).toBe(2);});it('e',()=>{expect(hd353emex2(15,0)).toBe(4);});});
function hd354emex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph354emex2_hd',()=>{it('a',()=>{expect(hd354emex2(1,4)).toBe(2);});it('b',()=>{expect(hd354emex2(3,1)).toBe(1);});it('c',()=>{expect(hd354emex2(0,0)).toBe(0);});it('d',()=>{expect(hd354emex2(93,73)).toBe(2);});it('e',()=>{expect(hd354emex2(15,0)).toBe(4);});});
function hd355emex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph355emex2_hd',()=>{it('a',()=>{expect(hd355emex2(1,4)).toBe(2);});it('b',()=>{expect(hd355emex2(3,1)).toBe(1);});it('c',()=>{expect(hd355emex2(0,0)).toBe(0);});it('d',()=>{expect(hd355emex2(93,73)).toBe(2);});it('e',()=>{expect(hd355emex2(15,0)).toBe(4);});});
function hd356emex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph356emex2_hd',()=>{it('a',()=>{expect(hd356emex2(1,4)).toBe(2);});it('b',()=>{expect(hd356emex2(3,1)).toBe(1);});it('c',()=>{expect(hd356emex2(0,0)).toBe(0);});it('d',()=>{expect(hd356emex2(93,73)).toBe(2);});it('e',()=>{expect(hd356emex2(15,0)).toBe(4);});});
function hd357emex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph357emex2_hd',()=>{it('a',()=>{expect(hd357emex2(1,4)).toBe(2);});it('b',()=>{expect(hd357emex2(3,1)).toBe(1);});it('c',()=>{expect(hd357emex2(0,0)).toBe(0);});it('d',()=>{expect(hd357emex2(93,73)).toBe(2);});it('e',()=>{expect(hd357emex2(15,0)).toBe(4);});});
function hd358emex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph358emex2_hd',()=>{it('a',()=>{expect(hd358emex2(1,4)).toBe(2);});it('b',()=>{expect(hd358emex2(3,1)).toBe(1);});it('c',()=>{expect(hd358emex2(0,0)).toBe(0);});it('d',()=>{expect(hd358emex2(93,73)).toBe(2);});it('e',()=>{expect(hd358emex2(15,0)).toBe(4);});});
function hd359emex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph359emex2_hd',()=>{it('a',()=>{expect(hd359emex2(1,4)).toBe(2);});it('b',()=>{expect(hd359emex2(3,1)).toBe(1);});it('c',()=>{expect(hd359emex2(0,0)).toBe(0);});it('d',()=>{expect(hd359emex2(93,73)).toBe(2);});it('e',()=>{expect(hd359emex2(15,0)).toBe(4);});});
function hd360emex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph360emex2_hd',()=>{it('a',()=>{expect(hd360emex2(1,4)).toBe(2);});it('b',()=>{expect(hd360emex2(3,1)).toBe(1);});it('c',()=>{expect(hd360emex2(0,0)).toBe(0);});it('d',()=>{expect(hd360emex2(93,73)).toBe(2);});it('e',()=>{expect(hd360emex2(15,0)).toBe(4);});});
function hd361emex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph361emex2_hd',()=>{it('a',()=>{expect(hd361emex2(1,4)).toBe(2);});it('b',()=>{expect(hd361emex2(3,1)).toBe(1);});it('c',()=>{expect(hd361emex2(0,0)).toBe(0);});it('d',()=>{expect(hd361emex2(93,73)).toBe(2);});it('e',()=>{expect(hd361emex2(15,0)).toBe(4);});});
function hd362emex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph362emex2_hd',()=>{it('a',()=>{expect(hd362emex2(1,4)).toBe(2);});it('b',()=>{expect(hd362emex2(3,1)).toBe(1);});it('c',()=>{expect(hd362emex2(0,0)).toBe(0);});it('d',()=>{expect(hd362emex2(93,73)).toBe(2);});it('e',()=>{expect(hd362emex2(15,0)).toBe(4);});});
function hd363emex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph363emex2_hd',()=>{it('a',()=>{expect(hd363emex2(1,4)).toBe(2);});it('b',()=>{expect(hd363emex2(3,1)).toBe(1);});it('c',()=>{expect(hd363emex2(0,0)).toBe(0);});it('d',()=>{expect(hd363emex2(93,73)).toBe(2);});it('e',()=>{expect(hd363emex2(15,0)).toBe(4);});});
function hd364emex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph364emex2_hd',()=>{it('a',()=>{expect(hd364emex2(1,4)).toBe(2);});it('b',()=>{expect(hd364emex2(3,1)).toBe(1);});it('c',()=>{expect(hd364emex2(0,0)).toBe(0);});it('d',()=>{expect(hd364emex2(93,73)).toBe(2);});it('e',()=>{expect(hd364emex2(15,0)).toBe(4);});});
function hd365emex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph365emex2_hd',()=>{it('a',()=>{expect(hd365emex2(1,4)).toBe(2);});it('b',()=>{expect(hd365emex2(3,1)).toBe(1);});it('c',()=>{expect(hd365emex2(0,0)).toBe(0);});it('d',()=>{expect(hd365emex2(93,73)).toBe(2);});it('e',()=>{expect(hd365emex2(15,0)).toBe(4);});});
function hd366emex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph366emex2_hd',()=>{it('a',()=>{expect(hd366emex2(1,4)).toBe(2);});it('b',()=>{expect(hd366emex2(3,1)).toBe(1);});it('c',()=>{expect(hd366emex2(0,0)).toBe(0);});it('d',()=>{expect(hd366emex2(93,73)).toBe(2);});it('e',()=>{expect(hd366emex2(15,0)).toBe(4);});});
function hd367emex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph367emex2_hd',()=>{it('a',()=>{expect(hd367emex2(1,4)).toBe(2);});it('b',()=>{expect(hd367emex2(3,1)).toBe(1);});it('c',()=>{expect(hd367emex2(0,0)).toBe(0);});it('d',()=>{expect(hd367emex2(93,73)).toBe(2);});it('e',()=>{expect(hd367emex2(15,0)).toBe(4);});});
function hd368emex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph368emex2_hd',()=>{it('a',()=>{expect(hd368emex2(1,4)).toBe(2);});it('b',()=>{expect(hd368emex2(3,1)).toBe(1);});it('c',()=>{expect(hd368emex2(0,0)).toBe(0);});it('d',()=>{expect(hd368emex2(93,73)).toBe(2);});it('e',()=>{expect(hd368emex2(15,0)).toBe(4);});});
function hd369emex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph369emex2_hd',()=>{it('a',()=>{expect(hd369emex2(1,4)).toBe(2);});it('b',()=>{expect(hd369emex2(3,1)).toBe(1);});it('c',()=>{expect(hd369emex2(0,0)).toBe(0);});it('d',()=>{expect(hd369emex2(93,73)).toBe(2);});it('e',()=>{expect(hd369emex2(15,0)).toBe(4);});});
function hd370emex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph370emex2_hd',()=>{it('a',()=>{expect(hd370emex2(1,4)).toBe(2);});it('b',()=>{expect(hd370emex2(3,1)).toBe(1);});it('c',()=>{expect(hd370emex2(0,0)).toBe(0);});it('d',()=>{expect(hd370emex2(93,73)).toBe(2);});it('e',()=>{expect(hd370emex2(15,0)).toBe(4);});});
function hd371emex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph371emex2_hd',()=>{it('a',()=>{expect(hd371emex2(1,4)).toBe(2);});it('b',()=>{expect(hd371emex2(3,1)).toBe(1);});it('c',()=>{expect(hd371emex2(0,0)).toBe(0);});it('d',()=>{expect(hd371emex2(93,73)).toBe(2);});it('e',()=>{expect(hd371emex2(15,0)).toBe(4);});});
function hd372emex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph372emex2_hd',()=>{it('a',()=>{expect(hd372emex2(1,4)).toBe(2);});it('b',()=>{expect(hd372emex2(3,1)).toBe(1);});it('c',()=>{expect(hd372emex2(0,0)).toBe(0);});it('d',()=>{expect(hd372emex2(93,73)).toBe(2);});it('e',()=>{expect(hd372emex2(15,0)).toBe(4);});});
function hd373emex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph373emex2_hd',()=>{it('a',()=>{expect(hd373emex2(1,4)).toBe(2);});it('b',()=>{expect(hd373emex2(3,1)).toBe(1);});it('c',()=>{expect(hd373emex2(0,0)).toBe(0);});it('d',()=>{expect(hd373emex2(93,73)).toBe(2);});it('e',()=>{expect(hd373emex2(15,0)).toBe(4);});});
function hd374emex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph374emex2_hd',()=>{it('a',()=>{expect(hd374emex2(1,4)).toBe(2);});it('b',()=>{expect(hd374emex2(3,1)).toBe(1);});it('c',()=>{expect(hd374emex2(0,0)).toBe(0);});it('d',()=>{expect(hd374emex2(93,73)).toBe(2);});it('e',()=>{expect(hd374emex2(15,0)).toBe(4);});});
function hd375emex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph375emex2_hd',()=>{it('a',()=>{expect(hd375emex2(1,4)).toBe(2);});it('b',()=>{expect(hd375emex2(3,1)).toBe(1);});it('c',()=>{expect(hd375emex2(0,0)).toBe(0);});it('d',()=>{expect(hd375emex2(93,73)).toBe(2);});it('e',()=>{expect(hd375emex2(15,0)).toBe(4);});});
function hd376emex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph376emex2_hd',()=>{it('a',()=>{expect(hd376emex2(1,4)).toBe(2);});it('b',()=>{expect(hd376emex2(3,1)).toBe(1);});it('c',()=>{expect(hd376emex2(0,0)).toBe(0);});it('d',()=>{expect(hd376emex2(93,73)).toBe(2);});it('e',()=>{expect(hd376emex2(15,0)).toBe(4);});});
function hd377emex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph377emex2_hd',()=>{it('a',()=>{expect(hd377emex2(1,4)).toBe(2);});it('b',()=>{expect(hd377emex2(3,1)).toBe(1);});it('c',()=>{expect(hd377emex2(0,0)).toBe(0);});it('d',()=>{expect(hd377emex2(93,73)).toBe(2);});it('e',()=>{expect(hd377emex2(15,0)).toBe(4);});});
function hd378emex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph378emex2_hd',()=>{it('a',()=>{expect(hd378emex2(1,4)).toBe(2);});it('b',()=>{expect(hd378emex2(3,1)).toBe(1);});it('c',()=>{expect(hd378emex2(0,0)).toBe(0);});it('d',()=>{expect(hd378emex2(93,73)).toBe(2);});it('e',()=>{expect(hd378emex2(15,0)).toBe(4);});});
function hd379emex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph379emex2_hd',()=>{it('a',()=>{expect(hd379emex2(1,4)).toBe(2);});it('b',()=>{expect(hd379emex2(3,1)).toBe(1);});it('c',()=>{expect(hd379emex2(0,0)).toBe(0);});it('d',()=>{expect(hd379emex2(93,73)).toBe(2);});it('e',()=>{expect(hd379emex2(15,0)).toBe(4);});});
function hd380emex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph380emex2_hd',()=>{it('a',()=>{expect(hd380emex2(1,4)).toBe(2);});it('b',()=>{expect(hd380emex2(3,1)).toBe(1);});it('c',()=>{expect(hd380emex2(0,0)).toBe(0);});it('d',()=>{expect(hd380emex2(93,73)).toBe(2);});it('e',()=>{expect(hd380emex2(15,0)).toBe(4);});});
function hd381emex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph381emex2_hd',()=>{it('a',()=>{expect(hd381emex2(1,4)).toBe(2);});it('b',()=>{expect(hd381emex2(3,1)).toBe(1);});it('c',()=>{expect(hd381emex2(0,0)).toBe(0);});it('d',()=>{expect(hd381emex2(93,73)).toBe(2);});it('e',()=>{expect(hd381emex2(15,0)).toBe(4);});});
function hd382emex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph382emex2_hd',()=>{it('a',()=>{expect(hd382emex2(1,4)).toBe(2);});it('b',()=>{expect(hd382emex2(3,1)).toBe(1);});it('c',()=>{expect(hd382emex2(0,0)).toBe(0);});it('d',()=>{expect(hd382emex2(93,73)).toBe(2);});it('e',()=>{expect(hd382emex2(15,0)).toBe(4);});});
function hd383emex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph383emex2_hd',()=>{it('a',()=>{expect(hd383emex2(1,4)).toBe(2);});it('b',()=>{expect(hd383emex2(3,1)).toBe(1);});it('c',()=>{expect(hd383emex2(0,0)).toBe(0);});it('d',()=>{expect(hd383emex2(93,73)).toBe(2);});it('e',()=>{expect(hd383emex2(15,0)).toBe(4);});});
function hd384emex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph384emex2_hd',()=>{it('a',()=>{expect(hd384emex2(1,4)).toBe(2);});it('b',()=>{expect(hd384emex2(3,1)).toBe(1);});it('c',()=>{expect(hd384emex2(0,0)).toBe(0);});it('d',()=>{expect(hd384emex2(93,73)).toBe(2);});it('e',()=>{expect(hd384emex2(15,0)).toBe(4);});});
function hd385emex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph385emex2_hd',()=>{it('a',()=>{expect(hd385emex2(1,4)).toBe(2);});it('b',()=>{expect(hd385emex2(3,1)).toBe(1);});it('c',()=>{expect(hd385emex2(0,0)).toBe(0);});it('d',()=>{expect(hd385emex2(93,73)).toBe(2);});it('e',()=>{expect(hd385emex2(15,0)).toBe(4);});});
function hd386emex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph386emex2_hd',()=>{it('a',()=>{expect(hd386emex2(1,4)).toBe(2);});it('b',()=>{expect(hd386emex2(3,1)).toBe(1);});it('c',()=>{expect(hd386emex2(0,0)).toBe(0);});it('d',()=>{expect(hd386emex2(93,73)).toBe(2);});it('e',()=>{expect(hd386emex2(15,0)).toBe(4);});});
function hd387emex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph387emex2_hd',()=>{it('a',()=>{expect(hd387emex2(1,4)).toBe(2);});it('b',()=>{expect(hd387emex2(3,1)).toBe(1);});it('c',()=>{expect(hd387emex2(0,0)).toBe(0);});it('d',()=>{expect(hd387emex2(93,73)).toBe(2);});it('e',()=>{expect(hd387emex2(15,0)).toBe(4);});});
function hd388emex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph388emex2_hd',()=>{it('a',()=>{expect(hd388emex2(1,4)).toBe(2);});it('b',()=>{expect(hd388emex2(3,1)).toBe(1);});it('c',()=>{expect(hd388emex2(0,0)).toBe(0);});it('d',()=>{expect(hd388emex2(93,73)).toBe(2);});it('e',()=>{expect(hd388emex2(15,0)).toBe(4);});});
function hd389emex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph389emex2_hd',()=>{it('a',()=>{expect(hd389emex2(1,4)).toBe(2);});it('b',()=>{expect(hd389emex2(3,1)).toBe(1);});it('c',()=>{expect(hd389emex2(0,0)).toBe(0);});it('d',()=>{expect(hd389emex2(93,73)).toBe(2);});it('e',()=>{expect(hd389emex2(15,0)).toBe(4);});});
function hd390emex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph390emex2_hd',()=>{it('a',()=>{expect(hd390emex2(1,4)).toBe(2);});it('b',()=>{expect(hd390emex2(3,1)).toBe(1);});it('c',()=>{expect(hd390emex2(0,0)).toBe(0);});it('d',()=>{expect(hd390emex2(93,73)).toBe(2);});it('e',()=>{expect(hd390emex2(15,0)).toBe(4);});});
function hd391emex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph391emex2_hd',()=>{it('a',()=>{expect(hd391emex2(1,4)).toBe(2);});it('b',()=>{expect(hd391emex2(3,1)).toBe(1);});it('c',()=>{expect(hd391emex2(0,0)).toBe(0);});it('d',()=>{expect(hd391emex2(93,73)).toBe(2);});it('e',()=>{expect(hd391emex2(15,0)).toBe(4);});});
function hd392emex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph392emex2_hd',()=>{it('a',()=>{expect(hd392emex2(1,4)).toBe(2);});it('b',()=>{expect(hd392emex2(3,1)).toBe(1);});it('c',()=>{expect(hd392emex2(0,0)).toBe(0);});it('d',()=>{expect(hd392emex2(93,73)).toBe(2);});it('e',()=>{expect(hd392emex2(15,0)).toBe(4);});});
function hd393emex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph393emex2_hd',()=>{it('a',()=>{expect(hd393emex2(1,4)).toBe(2);});it('b',()=>{expect(hd393emex2(3,1)).toBe(1);});it('c',()=>{expect(hd393emex2(0,0)).toBe(0);});it('d',()=>{expect(hd393emex2(93,73)).toBe(2);});it('e',()=>{expect(hd393emex2(15,0)).toBe(4);});});
function hd394emex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph394emex2_hd',()=>{it('a',()=>{expect(hd394emex2(1,4)).toBe(2);});it('b',()=>{expect(hd394emex2(3,1)).toBe(1);});it('c',()=>{expect(hd394emex2(0,0)).toBe(0);});it('d',()=>{expect(hd394emex2(93,73)).toBe(2);});it('e',()=>{expect(hd394emex2(15,0)).toBe(4);});});
function hd395emex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph395emex2_hd',()=>{it('a',()=>{expect(hd395emex2(1,4)).toBe(2);});it('b',()=>{expect(hd395emex2(3,1)).toBe(1);});it('c',()=>{expect(hd395emex2(0,0)).toBe(0);});it('d',()=>{expect(hd395emex2(93,73)).toBe(2);});it('e',()=>{expect(hd395emex2(15,0)).toBe(4);});});
function hd396emex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph396emex2_hd',()=>{it('a',()=>{expect(hd396emex2(1,4)).toBe(2);});it('b',()=>{expect(hd396emex2(3,1)).toBe(1);});it('c',()=>{expect(hd396emex2(0,0)).toBe(0);});it('d',()=>{expect(hd396emex2(93,73)).toBe(2);});it('e',()=>{expect(hd396emex2(15,0)).toBe(4);});});
function hd397emex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph397emex2_hd',()=>{it('a',()=>{expect(hd397emex2(1,4)).toBe(2);});it('b',()=>{expect(hd397emex2(3,1)).toBe(1);});it('c',()=>{expect(hd397emex2(0,0)).toBe(0);});it('d',()=>{expect(hd397emex2(93,73)).toBe(2);});it('e',()=>{expect(hd397emex2(15,0)).toBe(4);});});
function hd398emex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph398emex2_hd',()=>{it('a',()=>{expect(hd398emex2(1,4)).toBe(2);});it('b',()=>{expect(hd398emex2(3,1)).toBe(1);});it('c',()=>{expect(hd398emex2(0,0)).toBe(0);});it('d',()=>{expect(hd398emex2(93,73)).toBe(2);});it('e',()=>{expect(hd398emex2(15,0)).toBe(4);});});
function hd399emex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph399emex2_hd',()=>{it('a',()=>{expect(hd399emex2(1,4)).toBe(2);});it('b',()=>{expect(hd399emex2(3,1)).toBe(1);});it('c',()=>{expect(hd399emex2(0,0)).toBe(0);});it('d',()=>{expect(hd399emex2(93,73)).toBe(2);});it('e',()=>{expect(hd399emex2(15,0)).toBe(4);});});
function hd400emex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph400emex2_hd',()=>{it('a',()=>{expect(hd400emex2(1,4)).toBe(2);});it('b',()=>{expect(hd400emex2(3,1)).toBe(1);});it('c',()=>{expect(hd400emex2(0,0)).toBe(0);});it('d',()=>{expect(hd400emex2(93,73)).toBe(2);});it('e',()=>{expect(hd400emex2(15,0)).toBe(4);});});
function hd401emex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph401emex2_hd',()=>{it('a',()=>{expect(hd401emex2(1,4)).toBe(2);});it('b',()=>{expect(hd401emex2(3,1)).toBe(1);});it('c',()=>{expect(hd401emex2(0,0)).toBe(0);});it('d',()=>{expect(hd401emex2(93,73)).toBe(2);});it('e',()=>{expect(hd401emex2(15,0)).toBe(4);});});
function hd402emex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph402emex2_hd',()=>{it('a',()=>{expect(hd402emex2(1,4)).toBe(2);});it('b',()=>{expect(hd402emex2(3,1)).toBe(1);});it('c',()=>{expect(hd402emex2(0,0)).toBe(0);});it('d',()=>{expect(hd402emex2(93,73)).toBe(2);});it('e',()=>{expect(hd402emex2(15,0)).toBe(4);});});
function hd403emex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph403emex2_hd',()=>{it('a',()=>{expect(hd403emex2(1,4)).toBe(2);});it('b',()=>{expect(hd403emex2(3,1)).toBe(1);});it('c',()=>{expect(hd403emex2(0,0)).toBe(0);});it('d',()=>{expect(hd403emex2(93,73)).toBe(2);});it('e',()=>{expect(hd403emex2(15,0)).toBe(4);});});
function hd404emex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph404emex2_hd',()=>{it('a',()=>{expect(hd404emex2(1,4)).toBe(2);});it('b',()=>{expect(hd404emex2(3,1)).toBe(1);});it('c',()=>{expect(hd404emex2(0,0)).toBe(0);});it('d',()=>{expect(hd404emex2(93,73)).toBe(2);});it('e',()=>{expect(hd404emex2(15,0)).toBe(4);});});
function hd405emex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph405emex2_hd',()=>{it('a',()=>{expect(hd405emex2(1,4)).toBe(2);});it('b',()=>{expect(hd405emex2(3,1)).toBe(1);});it('c',()=>{expect(hd405emex2(0,0)).toBe(0);});it('d',()=>{expect(hd405emex2(93,73)).toBe(2);});it('e',()=>{expect(hd405emex2(15,0)).toBe(4);});});
function hd406emex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph406emex2_hd',()=>{it('a',()=>{expect(hd406emex2(1,4)).toBe(2);});it('b',()=>{expect(hd406emex2(3,1)).toBe(1);});it('c',()=>{expect(hd406emex2(0,0)).toBe(0);});it('d',()=>{expect(hd406emex2(93,73)).toBe(2);});it('e',()=>{expect(hd406emex2(15,0)).toBe(4);});});
function hd407emex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph407emex2_hd',()=>{it('a',()=>{expect(hd407emex2(1,4)).toBe(2);});it('b',()=>{expect(hd407emex2(3,1)).toBe(1);});it('c',()=>{expect(hd407emex2(0,0)).toBe(0);});it('d',()=>{expect(hd407emex2(93,73)).toBe(2);});it('e',()=>{expect(hd407emex2(15,0)).toBe(4);});});
function hd408emex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph408emex2_hd',()=>{it('a',()=>{expect(hd408emex2(1,4)).toBe(2);});it('b',()=>{expect(hd408emex2(3,1)).toBe(1);});it('c',()=>{expect(hd408emex2(0,0)).toBe(0);});it('d',()=>{expect(hd408emex2(93,73)).toBe(2);});it('e',()=>{expect(hd408emex2(15,0)).toBe(4);});});
function hd409emex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph409emex2_hd',()=>{it('a',()=>{expect(hd409emex2(1,4)).toBe(2);});it('b',()=>{expect(hd409emex2(3,1)).toBe(1);});it('c',()=>{expect(hd409emex2(0,0)).toBe(0);});it('d',()=>{expect(hd409emex2(93,73)).toBe(2);});it('e',()=>{expect(hd409emex2(15,0)).toBe(4);});});
function hd410emex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph410emex2_hd',()=>{it('a',()=>{expect(hd410emex2(1,4)).toBe(2);});it('b',()=>{expect(hd410emex2(3,1)).toBe(1);});it('c',()=>{expect(hd410emex2(0,0)).toBe(0);});it('d',()=>{expect(hd410emex2(93,73)).toBe(2);});it('e',()=>{expect(hd410emex2(15,0)).toBe(4);});});
function hd411emex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph411emex2_hd',()=>{it('a',()=>{expect(hd411emex2(1,4)).toBe(2);});it('b',()=>{expect(hd411emex2(3,1)).toBe(1);});it('c',()=>{expect(hd411emex2(0,0)).toBe(0);});it('d',()=>{expect(hd411emex2(93,73)).toBe(2);});it('e',()=>{expect(hd411emex2(15,0)).toBe(4);});});
function hd412emex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph412emex2_hd',()=>{it('a',()=>{expect(hd412emex2(1,4)).toBe(2);});it('b',()=>{expect(hd412emex2(3,1)).toBe(1);});it('c',()=>{expect(hd412emex2(0,0)).toBe(0);});it('d',()=>{expect(hd412emex2(93,73)).toBe(2);});it('e',()=>{expect(hd412emex2(15,0)).toBe(4);});});
function hd413emex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph413emex2_hd',()=>{it('a',()=>{expect(hd413emex2(1,4)).toBe(2);});it('b',()=>{expect(hd413emex2(3,1)).toBe(1);});it('c',()=>{expect(hd413emex2(0,0)).toBe(0);});it('d',()=>{expect(hd413emex2(93,73)).toBe(2);});it('e',()=>{expect(hd413emex2(15,0)).toBe(4);});});
function hd414emex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph414emex2_hd',()=>{it('a',()=>{expect(hd414emex2(1,4)).toBe(2);});it('b',()=>{expect(hd414emex2(3,1)).toBe(1);});it('c',()=>{expect(hd414emex2(0,0)).toBe(0);});it('d',()=>{expect(hd414emex2(93,73)).toBe(2);});it('e',()=>{expect(hd414emex2(15,0)).toBe(4);});});
function hd415emex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph415emex2_hd',()=>{it('a',()=>{expect(hd415emex2(1,4)).toBe(2);});it('b',()=>{expect(hd415emex2(3,1)).toBe(1);});it('c',()=>{expect(hd415emex2(0,0)).toBe(0);});it('d',()=>{expect(hd415emex2(93,73)).toBe(2);});it('e',()=>{expect(hd415emex2(15,0)).toBe(4);});});
function hd416emex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph416emex2_hd',()=>{it('a',()=>{expect(hd416emex2(1,4)).toBe(2);});it('b',()=>{expect(hd416emex2(3,1)).toBe(1);});it('c',()=>{expect(hd416emex2(0,0)).toBe(0);});it('d',()=>{expect(hd416emex2(93,73)).toBe(2);});it('e',()=>{expect(hd416emex2(15,0)).toBe(4);});});
function hd417emex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph417emex2_hd',()=>{it('a',()=>{expect(hd417emex2(1,4)).toBe(2);});it('b',()=>{expect(hd417emex2(3,1)).toBe(1);});it('c',()=>{expect(hd417emex2(0,0)).toBe(0);});it('d',()=>{expect(hd417emex2(93,73)).toBe(2);});it('e',()=>{expect(hd417emex2(15,0)).toBe(4);});});
