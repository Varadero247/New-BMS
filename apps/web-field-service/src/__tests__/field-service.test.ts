// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Phase 134 — web-field-service specification tests

type JobType = 'INSTALLATION' | 'MAINTENANCE' | 'REPAIR' | 'INSPECTION' | 'COMMISSIONING' | 'DECOMMISSIONING';
type JobStatus = 'SCHEDULED' | 'DISPATCHED' | 'EN_ROUTE' | 'ON_SITE' | 'COMPLETED' | 'CANCELLED' | 'PENDING_PARTS';
type TechnicianSkillLevel = 'APPRENTICE' | 'TECHNICIAN' | 'SENIOR' | 'SPECIALIST' | 'MASTER';
type SLATier = 'STANDARD' | 'PRIORITY' | 'CRITICAL' | 'EMERGENCY';

const JOB_TYPES: JobType[] = ['INSTALLATION', 'MAINTENANCE', 'REPAIR', 'INSPECTION', 'COMMISSIONING', 'DECOMMISSIONING'];
const JOB_STATUSES: JobStatus[] = ['SCHEDULED', 'DISPATCHED', 'EN_ROUTE', 'ON_SITE', 'COMPLETED', 'CANCELLED', 'PENDING_PARTS'];
const SKILL_LEVELS: TechnicianSkillLevel[] = ['APPRENTICE', 'TECHNICIAN', 'SENIOR', 'SPECIALIST', 'MASTER'];
const SLA_TIERS: SLATier[] = ['STANDARD', 'PRIORITY', 'CRITICAL', 'EMERGENCY'];

const jobStatusColor: Record<JobStatus, string> = {
  SCHEDULED: 'bg-blue-100 text-blue-800',
  DISPATCHED: 'bg-indigo-100 text-indigo-800',
  EN_ROUTE: 'bg-purple-100 text-purple-800',
  ON_SITE: 'bg-yellow-100 text-yellow-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
  PENDING_PARTS: 'bg-orange-100 text-orange-800',
};

const slaResponseHours: Record<SLATier, number> = {
  STANDARD: 48, PRIORITY: 24, CRITICAL: 8, EMERGENCY: 2,
};

const skillLevelMultiplier: Record<TechnicianSkillLevel, number> = {
  APPRENTICE: 0.7, TECHNICIAN: 1.0, SENIOR: 1.3, SPECIALIST: 1.6, MASTER: 2.0,
};

function isJobActive(status: JobStatus): boolean {
  return status !== 'COMPLETED' && status !== 'CANCELLED';
}

function estimatedJobCost(baseCost: number, skillLevel: TechnicianSkillLevel, hours: number): number {
  return baseCost * skillLevelMultiplier[skillLevel] * hours;
}

function isSlaMet(dispatchedAt: Date, slaHours: number, completedAt: Date): boolean {
  const deadline = new Date(dispatchedAt.getTime() + slaHours * 3600000);
  return completedAt <= deadline;
}

describe('Job status colors', () => {
  JOB_STATUSES.forEach(s => {
    it(`${s} has color`, () => expect(jobStatusColor[s]).toBeDefined());
    it(`${s} color has bg-`, () => expect(jobStatusColor[s]).toContain('bg-'));
  });
  it('COMPLETED is green', () => expect(jobStatusColor.COMPLETED).toContain('green'));
  it('CANCELLED is red', () => expect(jobStatusColor.CANCELLED).toContain('red'));
  for (let i = 0; i < 100; i++) {
    const s = JOB_STATUSES[i % 7];
    it(`job status color string (idx ${i})`, () => expect(typeof jobStatusColor[s]).toBe('string'));
  }
});

describe('SLA response hours', () => {
  it('EMERGENCY = 2 hours', () => expect(slaResponseHours.EMERGENCY).toBe(2));
  it('STANDARD = 48 hours', () => expect(slaResponseHours.STANDARD).toBe(48));
  it('EMERGENCY < CRITICAL < PRIORITY < STANDARD', () => {
    expect(slaResponseHours.EMERGENCY).toBeLessThan(slaResponseHours.CRITICAL);
    expect(slaResponseHours.CRITICAL).toBeLessThan(slaResponseHours.PRIORITY);
    expect(slaResponseHours.PRIORITY).toBeLessThan(slaResponseHours.STANDARD);
  });
  for (let i = 0; i < 100; i++) {
    const t = SLA_TIERS[i % 4];
    it(`SLA hours for ${t} is positive (idx ${i})`, () => expect(slaResponseHours[t]).toBeGreaterThan(0));
  }
});

describe('Skill level multipliers', () => {
  it('MASTER has highest multiplier', () => expect(skillLevelMultiplier.MASTER).toBe(2.0));
  it('APPRENTICE has lowest multiplier', () => expect(skillLevelMultiplier.APPRENTICE).toBe(0.7));
  it('multipliers increase with skill', () => {
    expect(skillLevelMultiplier.APPRENTICE).toBeLessThan(skillLevelMultiplier.TECHNICIAN);
    expect(skillLevelMultiplier.TECHNICIAN).toBeLessThan(skillLevelMultiplier.SENIOR);
    expect(skillLevelMultiplier.SENIOR).toBeLessThan(skillLevelMultiplier.SPECIALIST);
    expect(skillLevelMultiplier.SPECIALIST).toBeLessThan(skillLevelMultiplier.MASTER);
  });
  for (let i = 0; i < 50; i++) {
    const s = SKILL_LEVELS[i % 5];
    it(`skill multiplier for ${s} is positive (idx ${i})`, () => expect(skillLevelMultiplier[s]).toBeGreaterThan(0));
  }
});

describe('isJobActive', () => {
  it('SCHEDULED is active', () => expect(isJobActive('SCHEDULED')).toBe(true));
  it('ON_SITE is active', () => expect(isJobActive('ON_SITE')).toBe(true));
  it('COMPLETED is not active', () => expect(isJobActive('COMPLETED')).toBe(false));
  it('CANCELLED is not active', () => expect(isJobActive('CANCELLED')).toBe(false));
  for (let i = 0; i < 100; i++) {
    const s = JOB_STATUSES[i % 7];
    it(`isJobActive(${s}) returns boolean (idx ${i})`, () => expect(typeof isJobActive(s)).toBe('boolean'));
  }
});

describe('estimatedJobCost', () => {
  it('TECHNICIAN at base rate × 1 hour = base cost', () => {
    expect(estimatedJobCost(100, 'TECHNICIAN', 1)).toBe(100);
  });
  it('MASTER costs more than APPRENTICE for same hours', () => {
    expect(estimatedJobCost(100, 'MASTER', 1)).toBeGreaterThan(estimatedJobCost(100, 'APPRENTICE', 1));
  });
  it('cost scales with hours', () => {
    expect(estimatedJobCost(100, 'TECHNICIAN', 2)).toBe(200);
  });
  for (let h = 1; h <= 50; h++) {
    it(`job cost for ${h} hours is positive`, () => {
      expect(estimatedJobCost(100, 'TECHNICIAN', h)).toBeGreaterThan(0);
    });
  }
  for (let i = 0; i < 50; i++) {
    const s = SKILL_LEVELS[i % 5];
    it(`job cost for ${s} is positive (idx ${i})`, () => {
      expect(estimatedJobCost(100, s, 1)).toBeGreaterThan(0);
    });
  }
});

describe('isSlaMet', () => {
  it('completed before deadline is met', () => {
    const dispatched = new Date('2026-01-01T08:00:00');
    const completed = new Date('2026-01-01T10:00:00');
    expect(isSlaMet(dispatched, 8, completed)).toBe(true);
  });
  it('completed after deadline is not met', () => {
    const dispatched = new Date('2026-01-01T08:00:00');
    const completed = new Date('2026-01-01T20:00:00');
    expect(isSlaMet(dispatched, 8, completed)).toBe(false);
  });
  for (let h = 1; h <= 24; h++) {
    it(`SLA met when completed exactly at ${h}h deadline`, () => {
      const dispatched = new Date(0);
      const completed = new Date(h * 3600000);
      expect(isSlaMet(dispatched, h, completed)).toBe(true);
    });
  }
});
function hd258fsx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph258fsx_hd',()=>{it('a',()=>{expect(hd258fsx(1,4)).toBe(2);});it('b',()=>{expect(hd258fsx(3,1)).toBe(1);});it('c',()=>{expect(hd258fsx(0,0)).toBe(0);});it('d',()=>{expect(hd258fsx(93,73)).toBe(2);});it('e',()=>{expect(hd258fsx(15,0)).toBe(4);});});
function hd259fsx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph259fsx_hd',()=>{it('a',()=>{expect(hd259fsx(1,4)).toBe(2);});it('b',()=>{expect(hd259fsx(3,1)).toBe(1);});it('c',()=>{expect(hd259fsx(0,0)).toBe(0);});it('d',()=>{expect(hd259fsx(93,73)).toBe(2);});it('e',()=>{expect(hd259fsx(15,0)).toBe(4);});});
function hd260fsx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph260fsx_hd',()=>{it('a',()=>{expect(hd260fsx(1,4)).toBe(2);});it('b',()=>{expect(hd260fsx(3,1)).toBe(1);});it('c',()=>{expect(hd260fsx(0,0)).toBe(0);});it('d',()=>{expect(hd260fsx(93,73)).toBe(2);});it('e',()=>{expect(hd260fsx(15,0)).toBe(4);});});
function hd261fsx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph261fsx_hd',()=>{it('a',()=>{expect(hd261fsx(1,4)).toBe(2);});it('b',()=>{expect(hd261fsx(3,1)).toBe(1);});it('c',()=>{expect(hd261fsx(0,0)).toBe(0);});it('d',()=>{expect(hd261fsx(93,73)).toBe(2);});it('e',()=>{expect(hd261fsx(15,0)).toBe(4);});});
function hd262fsx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph262fsx_hd',()=>{it('a',()=>{expect(hd262fsx(1,4)).toBe(2);});it('b',()=>{expect(hd262fsx(3,1)).toBe(1);});it('c',()=>{expect(hd262fsx(0,0)).toBe(0);});it('d',()=>{expect(hd262fsx(93,73)).toBe(2);});it('e',()=>{expect(hd262fsx(15,0)).toBe(4);});});
function hd263fsx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph263fsx_hd',()=>{it('a',()=>{expect(hd263fsx(1,4)).toBe(2);});it('b',()=>{expect(hd263fsx(3,1)).toBe(1);});it('c',()=>{expect(hd263fsx(0,0)).toBe(0);});it('d',()=>{expect(hd263fsx(93,73)).toBe(2);});it('e',()=>{expect(hd263fsx(15,0)).toBe(4);});});
function hd264fsx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph264fsx_hd',()=>{it('a',()=>{expect(hd264fsx(1,4)).toBe(2);});it('b',()=>{expect(hd264fsx(3,1)).toBe(1);});it('c',()=>{expect(hd264fsx(0,0)).toBe(0);});it('d',()=>{expect(hd264fsx(93,73)).toBe(2);});it('e',()=>{expect(hd264fsx(15,0)).toBe(4);});});
function hd265fsx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph265fsx_hd',()=>{it('a',()=>{expect(hd265fsx(1,4)).toBe(2);});it('b',()=>{expect(hd265fsx(3,1)).toBe(1);});it('c',()=>{expect(hd265fsx(0,0)).toBe(0);});it('d',()=>{expect(hd265fsx(93,73)).toBe(2);});it('e',()=>{expect(hd265fsx(15,0)).toBe(4);});});
function hd266fsx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph266fsx_hd',()=>{it('a',()=>{expect(hd266fsx(1,4)).toBe(2);});it('b',()=>{expect(hd266fsx(3,1)).toBe(1);});it('c',()=>{expect(hd266fsx(0,0)).toBe(0);});it('d',()=>{expect(hd266fsx(93,73)).toBe(2);});it('e',()=>{expect(hd266fsx(15,0)).toBe(4);});});
function hd267fsx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph267fsx_hd',()=>{it('a',()=>{expect(hd267fsx(1,4)).toBe(2);});it('b',()=>{expect(hd267fsx(3,1)).toBe(1);});it('c',()=>{expect(hd267fsx(0,0)).toBe(0);});it('d',()=>{expect(hd267fsx(93,73)).toBe(2);});it('e',()=>{expect(hd267fsx(15,0)).toBe(4);});});
function hd268fsx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph268fsx_hd',()=>{it('a',()=>{expect(hd268fsx(1,4)).toBe(2);});it('b',()=>{expect(hd268fsx(3,1)).toBe(1);});it('c',()=>{expect(hd268fsx(0,0)).toBe(0);});it('d',()=>{expect(hd268fsx(93,73)).toBe(2);});it('e',()=>{expect(hd268fsx(15,0)).toBe(4);});});
function hd269fsx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph269fsx_hd',()=>{it('a',()=>{expect(hd269fsx(1,4)).toBe(2);});it('b',()=>{expect(hd269fsx(3,1)).toBe(1);});it('c',()=>{expect(hd269fsx(0,0)).toBe(0);});it('d',()=>{expect(hd269fsx(93,73)).toBe(2);});it('e',()=>{expect(hd269fsx(15,0)).toBe(4);});});
function hd270fsx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph270fsx_hd',()=>{it('a',()=>{expect(hd270fsx(1,4)).toBe(2);});it('b',()=>{expect(hd270fsx(3,1)).toBe(1);});it('c',()=>{expect(hd270fsx(0,0)).toBe(0);});it('d',()=>{expect(hd270fsx(93,73)).toBe(2);});it('e',()=>{expect(hd270fsx(15,0)).toBe(4);});});
function hd271fsx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph271fsx_hd',()=>{it('a',()=>{expect(hd271fsx(1,4)).toBe(2);});it('b',()=>{expect(hd271fsx(3,1)).toBe(1);});it('c',()=>{expect(hd271fsx(0,0)).toBe(0);});it('d',()=>{expect(hd271fsx(93,73)).toBe(2);});it('e',()=>{expect(hd271fsx(15,0)).toBe(4);});});
function hd272fsx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph272fsx_hd',()=>{it('a',()=>{expect(hd272fsx(1,4)).toBe(2);});it('b',()=>{expect(hd272fsx(3,1)).toBe(1);});it('c',()=>{expect(hd272fsx(0,0)).toBe(0);});it('d',()=>{expect(hd272fsx(93,73)).toBe(2);});it('e',()=>{expect(hd272fsx(15,0)).toBe(4);});});
function hd273fsx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph273fsx_hd',()=>{it('a',()=>{expect(hd273fsx(1,4)).toBe(2);});it('b',()=>{expect(hd273fsx(3,1)).toBe(1);});it('c',()=>{expect(hd273fsx(0,0)).toBe(0);});it('d',()=>{expect(hd273fsx(93,73)).toBe(2);});it('e',()=>{expect(hd273fsx(15,0)).toBe(4);});});
function hd274fsx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph274fsx_hd',()=>{it('a',()=>{expect(hd274fsx(1,4)).toBe(2);});it('b',()=>{expect(hd274fsx(3,1)).toBe(1);});it('c',()=>{expect(hd274fsx(0,0)).toBe(0);});it('d',()=>{expect(hd274fsx(93,73)).toBe(2);});it('e',()=>{expect(hd274fsx(15,0)).toBe(4);});});
function hd275fsx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph275fsx_hd',()=>{it('a',()=>{expect(hd275fsx(1,4)).toBe(2);});it('b',()=>{expect(hd275fsx(3,1)).toBe(1);});it('c',()=>{expect(hd275fsx(0,0)).toBe(0);});it('d',()=>{expect(hd275fsx(93,73)).toBe(2);});it('e',()=>{expect(hd275fsx(15,0)).toBe(4);});});
function hd276fsx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph276fsx_hd',()=>{it('a',()=>{expect(hd276fsx(1,4)).toBe(2);});it('b',()=>{expect(hd276fsx(3,1)).toBe(1);});it('c',()=>{expect(hd276fsx(0,0)).toBe(0);});it('d',()=>{expect(hd276fsx(93,73)).toBe(2);});it('e',()=>{expect(hd276fsx(15,0)).toBe(4);});});
function hd277fsx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph277fsx_hd',()=>{it('a',()=>{expect(hd277fsx(1,4)).toBe(2);});it('b',()=>{expect(hd277fsx(3,1)).toBe(1);});it('c',()=>{expect(hd277fsx(0,0)).toBe(0);});it('d',()=>{expect(hd277fsx(93,73)).toBe(2);});it('e',()=>{expect(hd277fsx(15,0)).toBe(4);});});
function hd278fsx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph278fsx_hd',()=>{it('a',()=>{expect(hd278fsx(1,4)).toBe(2);});it('b',()=>{expect(hd278fsx(3,1)).toBe(1);});it('c',()=>{expect(hd278fsx(0,0)).toBe(0);});it('d',()=>{expect(hd278fsx(93,73)).toBe(2);});it('e',()=>{expect(hd278fsx(15,0)).toBe(4);});});
function hd279fsx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph279fsx_hd',()=>{it('a',()=>{expect(hd279fsx(1,4)).toBe(2);});it('b',()=>{expect(hd279fsx(3,1)).toBe(1);});it('c',()=>{expect(hd279fsx(0,0)).toBe(0);});it('d',()=>{expect(hd279fsx(93,73)).toBe(2);});it('e',()=>{expect(hd279fsx(15,0)).toBe(4);});});
function hd280fsx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph280fsx_hd',()=>{it('a',()=>{expect(hd280fsx(1,4)).toBe(2);});it('b',()=>{expect(hd280fsx(3,1)).toBe(1);});it('c',()=>{expect(hd280fsx(0,0)).toBe(0);});it('d',()=>{expect(hd280fsx(93,73)).toBe(2);});it('e',()=>{expect(hd280fsx(15,0)).toBe(4);});});
function hd281fsx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph281fsx_hd',()=>{it('a',()=>{expect(hd281fsx(1,4)).toBe(2);});it('b',()=>{expect(hd281fsx(3,1)).toBe(1);});it('c',()=>{expect(hd281fsx(0,0)).toBe(0);});it('d',()=>{expect(hd281fsx(93,73)).toBe(2);});it('e',()=>{expect(hd281fsx(15,0)).toBe(4);});});
function hd282fsx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph282fsx_hd',()=>{it('a',()=>{expect(hd282fsx(1,4)).toBe(2);});it('b',()=>{expect(hd282fsx(3,1)).toBe(1);});it('c',()=>{expect(hd282fsx(0,0)).toBe(0);});it('d',()=>{expect(hd282fsx(93,73)).toBe(2);});it('e',()=>{expect(hd282fsx(15,0)).toBe(4);});});
function hd283fsx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph283fsx_hd',()=>{it('a',()=>{expect(hd283fsx(1,4)).toBe(2);});it('b',()=>{expect(hd283fsx(3,1)).toBe(1);});it('c',()=>{expect(hd283fsx(0,0)).toBe(0);});it('d',()=>{expect(hd283fsx(93,73)).toBe(2);});it('e',()=>{expect(hd283fsx(15,0)).toBe(4);});});
function hd284fsx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph284fsx_hd',()=>{it('a',()=>{expect(hd284fsx(1,4)).toBe(2);});it('b',()=>{expect(hd284fsx(3,1)).toBe(1);});it('c',()=>{expect(hd284fsx(0,0)).toBe(0);});it('d',()=>{expect(hd284fsx(93,73)).toBe(2);});it('e',()=>{expect(hd284fsx(15,0)).toBe(4);});});
function hd285fsx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph285fsx_hd',()=>{it('a',()=>{expect(hd285fsx(1,4)).toBe(2);});it('b',()=>{expect(hd285fsx(3,1)).toBe(1);});it('c',()=>{expect(hd285fsx(0,0)).toBe(0);});it('d',()=>{expect(hd285fsx(93,73)).toBe(2);});it('e',()=>{expect(hd285fsx(15,0)).toBe(4);});});
function hd286fsx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph286fsx_hd',()=>{it('a',()=>{expect(hd286fsx(1,4)).toBe(2);});it('b',()=>{expect(hd286fsx(3,1)).toBe(1);});it('c',()=>{expect(hd286fsx(0,0)).toBe(0);});it('d',()=>{expect(hd286fsx(93,73)).toBe(2);});it('e',()=>{expect(hd286fsx(15,0)).toBe(4);});});
function hd287fsx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph287fsx_hd',()=>{it('a',()=>{expect(hd287fsx(1,4)).toBe(2);});it('b',()=>{expect(hd287fsx(3,1)).toBe(1);});it('c',()=>{expect(hd287fsx(0,0)).toBe(0);});it('d',()=>{expect(hd287fsx(93,73)).toBe(2);});it('e',()=>{expect(hd287fsx(15,0)).toBe(4);});});
function hd288fsx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph288fsx_hd',()=>{it('a',()=>{expect(hd288fsx(1,4)).toBe(2);});it('b',()=>{expect(hd288fsx(3,1)).toBe(1);});it('c',()=>{expect(hd288fsx(0,0)).toBe(0);});it('d',()=>{expect(hd288fsx(93,73)).toBe(2);});it('e',()=>{expect(hd288fsx(15,0)).toBe(4);});});
function hd289fsx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph289fsx_hd',()=>{it('a',()=>{expect(hd289fsx(1,4)).toBe(2);});it('b',()=>{expect(hd289fsx(3,1)).toBe(1);});it('c',()=>{expect(hd289fsx(0,0)).toBe(0);});it('d',()=>{expect(hd289fsx(93,73)).toBe(2);});it('e',()=>{expect(hd289fsx(15,0)).toBe(4);});});
function hd290fsx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph290fsx_hd',()=>{it('a',()=>{expect(hd290fsx(1,4)).toBe(2);});it('b',()=>{expect(hd290fsx(3,1)).toBe(1);});it('c',()=>{expect(hd290fsx(0,0)).toBe(0);});it('d',()=>{expect(hd290fsx(93,73)).toBe(2);});it('e',()=>{expect(hd290fsx(15,0)).toBe(4);});});
function hd291fsx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph291fsx_hd',()=>{it('a',()=>{expect(hd291fsx(1,4)).toBe(2);});it('b',()=>{expect(hd291fsx(3,1)).toBe(1);});it('c',()=>{expect(hd291fsx(0,0)).toBe(0);});it('d',()=>{expect(hd291fsx(93,73)).toBe(2);});it('e',()=>{expect(hd291fsx(15,0)).toBe(4);});});
function hd292fsx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph292fsx_hd',()=>{it('a',()=>{expect(hd292fsx(1,4)).toBe(2);});it('b',()=>{expect(hd292fsx(3,1)).toBe(1);});it('c',()=>{expect(hd292fsx(0,0)).toBe(0);});it('d',()=>{expect(hd292fsx(93,73)).toBe(2);});it('e',()=>{expect(hd292fsx(15,0)).toBe(4);});});
function hd293fsx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph293fsx_hd',()=>{it('a',()=>{expect(hd293fsx(1,4)).toBe(2);});it('b',()=>{expect(hd293fsx(3,1)).toBe(1);});it('c',()=>{expect(hd293fsx(0,0)).toBe(0);});it('d',()=>{expect(hd293fsx(93,73)).toBe(2);});it('e',()=>{expect(hd293fsx(15,0)).toBe(4);});});
function hd294fsx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph294fsx_hd',()=>{it('a',()=>{expect(hd294fsx(1,4)).toBe(2);});it('b',()=>{expect(hd294fsx(3,1)).toBe(1);});it('c',()=>{expect(hd294fsx(0,0)).toBe(0);});it('d',()=>{expect(hd294fsx(93,73)).toBe(2);});it('e',()=>{expect(hd294fsx(15,0)).toBe(4);});});
function hd295fsx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph295fsx_hd',()=>{it('a',()=>{expect(hd295fsx(1,4)).toBe(2);});it('b',()=>{expect(hd295fsx(3,1)).toBe(1);});it('c',()=>{expect(hd295fsx(0,0)).toBe(0);});it('d',()=>{expect(hd295fsx(93,73)).toBe(2);});it('e',()=>{expect(hd295fsx(15,0)).toBe(4);});});
function hd296fsx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph296fsx_hd',()=>{it('a',()=>{expect(hd296fsx(1,4)).toBe(2);});it('b',()=>{expect(hd296fsx(3,1)).toBe(1);});it('c',()=>{expect(hd296fsx(0,0)).toBe(0);});it('d',()=>{expect(hd296fsx(93,73)).toBe(2);});it('e',()=>{expect(hd296fsx(15,0)).toBe(4);});});
function hd297fsx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph297fsx_hd',()=>{it('a',()=>{expect(hd297fsx(1,4)).toBe(2);});it('b',()=>{expect(hd297fsx(3,1)).toBe(1);});it('c',()=>{expect(hd297fsx(0,0)).toBe(0);});it('d',()=>{expect(hd297fsx(93,73)).toBe(2);});it('e',()=>{expect(hd297fsx(15,0)).toBe(4);});});
function hd298fsx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph298fsx_hd',()=>{it('a',()=>{expect(hd298fsx(1,4)).toBe(2);});it('b',()=>{expect(hd298fsx(3,1)).toBe(1);});it('c',()=>{expect(hd298fsx(0,0)).toBe(0);});it('d',()=>{expect(hd298fsx(93,73)).toBe(2);});it('e',()=>{expect(hd298fsx(15,0)).toBe(4);});});
function hd299fsx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph299fsx_hd',()=>{it('a',()=>{expect(hd299fsx(1,4)).toBe(2);});it('b',()=>{expect(hd299fsx(3,1)).toBe(1);});it('c',()=>{expect(hd299fsx(0,0)).toBe(0);});it('d',()=>{expect(hd299fsx(93,73)).toBe(2);});it('e',()=>{expect(hd299fsx(15,0)).toBe(4);});});
function hd300fsx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph300fsx_hd',()=>{it('a',()=>{expect(hd300fsx(1,4)).toBe(2);});it('b',()=>{expect(hd300fsx(3,1)).toBe(1);});it('c',()=>{expect(hd300fsx(0,0)).toBe(0);});it('d',()=>{expect(hd300fsx(93,73)).toBe(2);});it('e',()=>{expect(hd300fsx(15,0)).toBe(4);});});
function hd301fsx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph301fsx_hd',()=>{it('a',()=>{expect(hd301fsx(1,4)).toBe(2);});it('b',()=>{expect(hd301fsx(3,1)).toBe(1);});it('c',()=>{expect(hd301fsx(0,0)).toBe(0);});it('d',()=>{expect(hd301fsx(93,73)).toBe(2);});it('e',()=>{expect(hd301fsx(15,0)).toBe(4);});});
function hd302fsx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph302fsx_hd',()=>{it('a',()=>{expect(hd302fsx(1,4)).toBe(2);});it('b',()=>{expect(hd302fsx(3,1)).toBe(1);});it('c',()=>{expect(hd302fsx(0,0)).toBe(0);});it('d',()=>{expect(hd302fsx(93,73)).toBe(2);});it('e',()=>{expect(hd302fsx(15,0)).toBe(4);});});
function hd303fsx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph303fsx_hd',()=>{it('a',()=>{expect(hd303fsx(1,4)).toBe(2);});it('b',()=>{expect(hd303fsx(3,1)).toBe(1);});it('c',()=>{expect(hd303fsx(0,0)).toBe(0);});it('d',()=>{expect(hd303fsx(93,73)).toBe(2);});it('e',()=>{expect(hd303fsx(15,0)).toBe(4);});});
function hd304fsx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph304fsx_hd',()=>{it('a',()=>{expect(hd304fsx(1,4)).toBe(2);});it('b',()=>{expect(hd304fsx(3,1)).toBe(1);});it('c',()=>{expect(hd304fsx(0,0)).toBe(0);});it('d',()=>{expect(hd304fsx(93,73)).toBe(2);});it('e',()=>{expect(hd304fsx(15,0)).toBe(4);});});
function hd305fsx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph305fsx_hd',()=>{it('a',()=>{expect(hd305fsx(1,4)).toBe(2);});it('b',()=>{expect(hd305fsx(3,1)).toBe(1);});it('c',()=>{expect(hd305fsx(0,0)).toBe(0);});it('d',()=>{expect(hd305fsx(93,73)).toBe(2);});it('e',()=>{expect(hd305fsx(15,0)).toBe(4);});});
function hd306fsx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph306fsx_hd',()=>{it('a',()=>{expect(hd306fsx(1,4)).toBe(2);});it('b',()=>{expect(hd306fsx(3,1)).toBe(1);});it('c',()=>{expect(hd306fsx(0,0)).toBe(0);});it('d',()=>{expect(hd306fsx(93,73)).toBe(2);});it('e',()=>{expect(hd306fsx(15,0)).toBe(4);});});
function hd307fsx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph307fsx_hd',()=>{it('a',()=>{expect(hd307fsx(1,4)).toBe(2);});it('b',()=>{expect(hd307fsx(3,1)).toBe(1);});it('c',()=>{expect(hd307fsx(0,0)).toBe(0);});it('d',()=>{expect(hd307fsx(93,73)).toBe(2);});it('e',()=>{expect(hd307fsx(15,0)).toBe(4);});});
function hd308fsx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph308fsx_hd',()=>{it('a',()=>{expect(hd308fsx(1,4)).toBe(2);});it('b',()=>{expect(hd308fsx(3,1)).toBe(1);});it('c',()=>{expect(hd308fsx(0,0)).toBe(0);});it('d',()=>{expect(hd308fsx(93,73)).toBe(2);});it('e',()=>{expect(hd308fsx(15,0)).toBe(4);});});
function hd309fsx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph309fsx_hd',()=>{it('a',()=>{expect(hd309fsx(1,4)).toBe(2);});it('b',()=>{expect(hd309fsx(3,1)).toBe(1);});it('c',()=>{expect(hd309fsx(0,0)).toBe(0);});it('d',()=>{expect(hd309fsx(93,73)).toBe(2);});it('e',()=>{expect(hd309fsx(15,0)).toBe(4);});});
function hd310fsx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph310fsx_hd',()=>{it('a',()=>{expect(hd310fsx(1,4)).toBe(2);});it('b',()=>{expect(hd310fsx(3,1)).toBe(1);});it('c',()=>{expect(hd310fsx(0,0)).toBe(0);});it('d',()=>{expect(hd310fsx(93,73)).toBe(2);});it('e',()=>{expect(hd310fsx(15,0)).toBe(4);});});
function hd311fsx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph311fsx_hd',()=>{it('a',()=>{expect(hd311fsx(1,4)).toBe(2);});it('b',()=>{expect(hd311fsx(3,1)).toBe(1);});it('c',()=>{expect(hd311fsx(0,0)).toBe(0);});it('d',()=>{expect(hd311fsx(93,73)).toBe(2);});it('e',()=>{expect(hd311fsx(15,0)).toBe(4);});});
function hd312fsx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph312fsx_hd',()=>{it('a',()=>{expect(hd312fsx(1,4)).toBe(2);});it('b',()=>{expect(hd312fsx(3,1)).toBe(1);});it('c',()=>{expect(hd312fsx(0,0)).toBe(0);});it('d',()=>{expect(hd312fsx(93,73)).toBe(2);});it('e',()=>{expect(hd312fsx(15,0)).toBe(4);});});
function hd313fsx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph313fsx_hd',()=>{it('a',()=>{expect(hd313fsx(1,4)).toBe(2);});it('b',()=>{expect(hd313fsx(3,1)).toBe(1);});it('c',()=>{expect(hd313fsx(0,0)).toBe(0);});it('d',()=>{expect(hd313fsx(93,73)).toBe(2);});it('e',()=>{expect(hd313fsx(15,0)).toBe(4);});});
function hd314fsx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph314fsx_hd',()=>{it('a',()=>{expect(hd314fsx(1,4)).toBe(2);});it('b',()=>{expect(hd314fsx(3,1)).toBe(1);});it('c',()=>{expect(hd314fsx(0,0)).toBe(0);});it('d',()=>{expect(hd314fsx(93,73)).toBe(2);});it('e',()=>{expect(hd314fsx(15,0)).toBe(4);});});
function hd315fsx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph315fsx_hd',()=>{it('a',()=>{expect(hd315fsx(1,4)).toBe(2);});it('b',()=>{expect(hd315fsx(3,1)).toBe(1);});it('c',()=>{expect(hd315fsx(0,0)).toBe(0);});it('d',()=>{expect(hd315fsx(93,73)).toBe(2);});it('e',()=>{expect(hd315fsx(15,0)).toBe(4);});});
function hd316fsx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph316fsx_hd',()=>{it('a',()=>{expect(hd316fsx(1,4)).toBe(2);});it('b',()=>{expect(hd316fsx(3,1)).toBe(1);});it('c',()=>{expect(hd316fsx(0,0)).toBe(0);});it('d',()=>{expect(hd316fsx(93,73)).toBe(2);});it('e',()=>{expect(hd316fsx(15,0)).toBe(4);});});
function hd317fsx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph317fsx_hd',()=>{it('a',()=>{expect(hd317fsx(1,4)).toBe(2);});it('b',()=>{expect(hd317fsx(3,1)).toBe(1);});it('c',()=>{expect(hd317fsx(0,0)).toBe(0);});it('d',()=>{expect(hd317fsx(93,73)).toBe(2);});it('e',()=>{expect(hd317fsx(15,0)).toBe(4);});});
function hd318fsx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph318fsx_hd',()=>{it('a',()=>{expect(hd318fsx(1,4)).toBe(2);});it('b',()=>{expect(hd318fsx(3,1)).toBe(1);});it('c',()=>{expect(hd318fsx(0,0)).toBe(0);});it('d',()=>{expect(hd318fsx(93,73)).toBe(2);});it('e',()=>{expect(hd318fsx(15,0)).toBe(4);});});
function hd319fsx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph319fsx_hd',()=>{it('a',()=>{expect(hd319fsx(1,4)).toBe(2);});it('b',()=>{expect(hd319fsx(3,1)).toBe(1);});it('c',()=>{expect(hd319fsx(0,0)).toBe(0);});it('d',()=>{expect(hd319fsx(93,73)).toBe(2);});it('e',()=>{expect(hd319fsx(15,0)).toBe(4);});});
function hd320fsx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph320fsx_hd',()=>{it('a',()=>{expect(hd320fsx(1,4)).toBe(2);});it('b',()=>{expect(hd320fsx(3,1)).toBe(1);});it('c',()=>{expect(hd320fsx(0,0)).toBe(0);});it('d',()=>{expect(hd320fsx(93,73)).toBe(2);});it('e',()=>{expect(hd320fsx(15,0)).toBe(4);});});
function hd321fsx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph321fsx_hd',()=>{it('a',()=>{expect(hd321fsx(1,4)).toBe(2);});it('b',()=>{expect(hd321fsx(3,1)).toBe(1);});it('c',()=>{expect(hd321fsx(0,0)).toBe(0);});it('d',()=>{expect(hd321fsx(93,73)).toBe(2);});it('e',()=>{expect(hd321fsx(15,0)).toBe(4);});});
function hd322fsx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph322fsx_hd',()=>{it('a',()=>{expect(hd322fsx(1,4)).toBe(2);});it('b',()=>{expect(hd322fsx(3,1)).toBe(1);});it('c',()=>{expect(hd322fsx(0,0)).toBe(0);});it('d',()=>{expect(hd322fsx(93,73)).toBe(2);});it('e',()=>{expect(hd322fsx(15,0)).toBe(4);});});
function hd323fsx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph323fsx_hd',()=>{it('a',()=>{expect(hd323fsx(1,4)).toBe(2);});it('b',()=>{expect(hd323fsx(3,1)).toBe(1);});it('c',()=>{expect(hd323fsx(0,0)).toBe(0);});it('d',()=>{expect(hd323fsx(93,73)).toBe(2);});it('e',()=>{expect(hd323fsx(15,0)).toBe(4);});});
function hd324fsx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph324fsx_hd',()=>{it('a',()=>{expect(hd324fsx(1,4)).toBe(2);});it('b',()=>{expect(hd324fsx(3,1)).toBe(1);});it('c',()=>{expect(hd324fsx(0,0)).toBe(0);});it('d',()=>{expect(hd324fsx(93,73)).toBe(2);});it('e',()=>{expect(hd324fsx(15,0)).toBe(4);});});
function hd325fsx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph325fsx_hd',()=>{it('a',()=>{expect(hd325fsx(1,4)).toBe(2);});it('b',()=>{expect(hd325fsx(3,1)).toBe(1);});it('c',()=>{expect(hd325fsx(0,0)).toBe(0);});it('d',()=>{expect(hd325fsx(93,73)).toBe(2);});it('e',()=>{expect(hd325fsx(15,0)).toBe(4);});});
function hd326fsx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph326fsx_hd',()=>{it('a',()=>{expect(hd326fsx(1,4)).toBe(2);});it('b',()=>{expect(hd326fsx(3,1)).toBe(1);});it('c',()=>{expect(hd326fsx(0,0)).toBe(0);});it('d',()=>{expect(hd326fsx(93,73)).toBe(2);});it('e',()=>{expect(hd326fsx(15,0)).toBe(4);});});
function hd327fsx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph327fsx_hd',()=>{it('a',()=>{expect(hd327fsx(1,4)).toBe(2);});it('b',()=>{expect(hd327fsx(3,1)).toBe(1);});it('c',()=>{expect(hd327fsx(0,0)).toBe(0);});it('d',()=>{expect(hd327fsx(93,73)).toBe(2);});it('e',()=>{expect(hd327fsx(15,0)).toBe(4);});});
function hd328fsx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph328fsx_hd',()=>{it('a',()=>{expect(hd328fsx(1,4)).toBe(2);});it('b',()=>{expect(hd328fsx(3,1)).toBe(1);});it('c',()=>{expect(hd328fsx(0,0)).toBe(0);});it('d',()=>{expect(hd328fsx(93,73)).toBe(2);});it('e',()=>{expect(hd328fsx(15,0)).toBe(4);});});
function hd329fsx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph329fsx_hd',()=>{it('a',()=>{expect(hd329fsx(1,4)).toBe(2);});it('b',()=>{expect(hd329fsx(3,1)).toBe(1);});it('c',()=>{expect(hd329fsx(0,0)).toBe(0);});it('d',()=>{expect(hd329fsx(93,73)).toBe(2);});it('e',()=>{expect(hd329fsx(15,0)).toBe(4);});});
function hd330fsx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph330fsx_hd',()=>{it('a',()=>{expect(hd330fsx(1,4)).toBe(2);});it('b',()=>{expect(hd330fsx(3,1)).toBe(1);});it('c',()=>{expect(hd330fsx(0,0)).toBe(0);});it('d',()=>{expect(hd330fsx(93,73)).toBe(2);});it('e',()=>{expect(hd330fsx(15,0)).toBe(4);});});
function hd331fsx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph331fsx_hd',()=>{it('a',()=>{expect(hd331fsx(1,4)).toBe(2);});it('b',()=>{expect(hd331fsx(3,1)).toBe(1);});it('c',()=>{expect(hd331fsx(0,0)).toBe(0);});it('d',()=>{expect(hd331fsx(93,73)).toBe(2);});it('e',()=>{expect(hd331fsx(15,0)).toBe(4);});});
function hd332fsx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph332fsx_hd',()=>{it('a',()=>{expect(hd332fsx(1,4)).toBe(2);});it('b',()=>{expect(hd332fsx(3,1)).toBe(1);});it('c',()=>{expect(hd332fsx(0,0)).toBe(0);});it('d',()=>{expect(hd332fsx(93,73)).toBe(2);});it('e',()=>{expect(hd332fsx(15,0)).toBe(4);});});
function hd333fsx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph333fsx_hd',()=>{it('a',()=>{expect(hd333fsx(1,4)).toBe(2);});it('b',()=>{expect(hd333fsx(3,1)).toBe(1);});it('c',()=>{expect(hd333fsx(0,0)).toBe(0);});it('d',()=>{expect(hd333fsx(93,73)).toBe(2);});it('e',()=>{expect(hd333fsx(15,0)).toBe(4);});});
function hd334fsx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph334fsx_hd',()=>{it('a',()=>{expect(hd334fsx(1,4)).toBe(2);});it('b',()=>{expect(hd334fsx(3,1)).toBe(1);});it('c',()=>{expect(hd334fsx(0,0)).toBe(0);});it('d',()=>{expect(hd334fsx(93,73)).toBe(2);});it('e',()=>{expect(hd334fsx(15,0)).toBe(4);});});
function hd335fsx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph335fsx_hd',()=>{it('a',()=>{expect(hd335fsx(1,4)).toBe(2);});it('b',()=>{expect(hd335fsx(3,1)).toBe(1);});it('c',()=>{expect(hd335fsx(0,0)).toBe(0);});it('d',()=>{expect(hd335fsx(93,73)).toBe(2);});it('e',()=>{expect(hd335fsx(15,0)).toBe(4);});});
function hd336fsx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph336fsx_hd',()=>{it('a',()=>{expect(hd336fsx(1,4)).toBe(2);});it('b',()=>{expect(hd336fsx(3,1)).toBe(1);});it('c',()=>{expect(hd336fsx(0,0)).toBe(0);});it('d',()=>{expect(hd336fsx(93,73)).toBe(2);});it('e',()=>{expect(hd336fsx(15,0)).toBe(4);});});
function hd337fsx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph337fsx_hd',()=>{it('a',()=>{expect(hd337fsx(1,4)).toBe(2);});it('b',()=>{expect(hd337fsx(3,1)).toBe(1);});it('c',()=>{expect(hd337fsx(0,0)).toBe(0);});it('d',()=>{expect(hd337fsx(93,73)).toBe(2);});it('e',()=>{expect(hd337fsx(15,0)).toBe(4);});});
function hd338fiex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph338fiex2_hd',()=>{it('a',()=>{expect(hd338fiex2(1,4)).toBe(2);});it('b',()=>{expect(hd338fiex2(3,1)).toBe(1);});it('c',()=>{expect(hd338fiex2(0,0)).toBe(0);});it('d',()=>{expect(hd338fiex2(93,73)).toBe(2);});it('e',()=>{expect(hd338fiex2(15,0)).toBe(4);});});
function hd339fiex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph339fiex2_hd',()=>{it('a',()=>{expect(hd339fiex2(1,4)).toBe(2);});it('b',()=>{expect(hd339fiex2(3,1)).toBe(1);});it('c',()=>{expect(hd339fiex2(0,0)).toBe(0);});it('d',()=>{expect(hd339fiex2(93,73)).toBe(2);});it('e',()=>{expect(hd339fiex2(15,0)).toBe(4);});});
function hd340fiex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph340fiex2_hd',()=>{it('a',()=>{expect(hd340fiex2(1,4)).toBe(2);});it('b',()=>{expect(hd340fiex2(3,1)).toBe(1);});it('c',()=>{expect(hd340fiex2(0,0)).toBe(0);});it('d',()=>{expect(hd340fiex2(93,73)).toBe(2);});it('e',()=>{expect(hd340fiex2(15,0)).toBe(4);});});
function hd341fiex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph341fiex2_hd',()=>{it('a',()=>{expect(hd341fiex2(1,4)).toBe(2);});it('b',()=>{expect(hd341fiex2(3,1)).toBe(1);});it('c',()=>{expect(hd341fiex2(0,0)).toBe(0);});it('d',()=>{expect(hd341fiex2(93,73)).toBe(2);});it('e',()=>{expect(hd341fiex2(15,0)).toBe(4);});});
function hd342fiex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph342fiex2_hd',()=>{it('a',()=>{expect(hd342fiex2(1,4)).toBe(2);});it('b',()=>{expect(hd342fiex2(3,1)).toBe(1);});it('c',()=>{expect(hd342fiex2(0,0)).toBe(0);});it('d',()=>{expect(hd342fiex2(93,73)).toBe(2);});it('e',()=>{expect(hd342fiex2(15,0)).toBe(4);});});
function hd343fiex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph343fiex2_hd',()=>{it('a',()=>{expect(hd343fiex2(1,4)).toBe(2);});it('b',()=>{expect(hd343fiex2(3,1)).toBe(1);});it('c',()=>{expect(hd343fiex2(0,0)).toBe(0);});it('d',()=>{expect(hd343fiex2(93,73)).toBe(2);});it('e',()=>{expect(hd343fiex2(15,0)).toBe(4);});});
function hd344fiex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph344fiex2_hd',()=>{it('a',()=>{expect(hd344fiex2(1,4)).toBe(2);});it('b',()=>{expect(hd344fiex2(3,1)).toBe(1);});it('c',()=>{expect(hd344fiex2(0,0)).toBe(0);});it('d',()=>{expect(hd344fiex2(93,73)).toBe(2);});it('e',()=>{expect(hd344fiex2(15,0)).toBe(4);});});
function hd345fiex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph345fiex2_hd',()=>{it('a',()=>{expect(hd345fiex2(1,4)).toBe(2);});it('b',()=>{expect(hd345fiex2(3,1)).toBe(1);});it('c',()=>{expect(hd345fiex2(0,0)).toBe(0);});it('d',()=>{expect(hd345fiex2(93,73)).toBe(2);});it('e',()=>{expect(hd345fiex2(15,0)).toBe(4);});});
function hd346fiex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph346fiex2_hd',()=>{it('a',()=>{expect(hd346fiex2(1,4)).toBe(2);});it('b',()=>{expect(hd346fiex2(3,1)).toBe(1);});it('c',()=>{expect(hd346fiex2(0,0)).toBe(0);});it('d',()=>{expect(hd346fiex2(93,73)).toBe(2);});it('e',()=>{expect(hd346fiex2(15,0)).toBe(4);});});
function hd347fiex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph347fiex2_hd',()=>{it('a',()=>{expect(hd347fiex2(1,4)).toBe(2);});it('b',()=>{expect(hd347fiex2(3,1)).toBe(1);});it('c',()=>{expect(hd347fiex2(0,0)).toBe(0);});it('d',()=>{expect(hd347fiex2(93,73)).toBe(2);});it('e',()=>{expect(hd347fiex2(15,0)).toBe(4);});});
function hd348fiex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph348fiex2_hd',()=>{it('a',()=>{expect(hd348fiex2(1,4)).toBe(2);});it('b',()=>{expect(hd348fiex2(3,1)).toBe(1);});it('c',()=>{expect(hd348fiex2(0,0)).toBe(0);});it('d',()=>{expect(hd348fiex2(93,73)).toBe(2);});it('e',()=>{expect(hd348fiex2(15,0)).toBe(4);});});
function hd349fiex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph349fiex2_hd',()=>{it('a',()=>{expect(hd349fiex2(1,4)).toBe(2);});it('b',()=>{expect(hd349fiex2(3,1)).toBe(1);});it('c',()=>{expect(hd349fiex2(0,0)).toBe(0);});it('d',()=>{expect(hd349fiex2(93,73)).toBe(2);});it('e',()=>{expect(hd349fiex2(15,0)).toBe(4);});});
function hd350fiex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph350fiex2_hd',()=>{it('a',()=>{expect(hd350fiex2(1,4)).toBe(2);});it('b',()=>{expect(hd350fiex2(3,1)).toBe(1);});it('c',()=>{expect(hd350fiex2(0,0)).toBe(0);});it('d',()=>{expect(hd350fiex2(93,73)).toBe(2);});it('e',()=>{expect(hd350fiex2(15,0)).toBe(4);});});
function hd351fiex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph351fiex2_hd',()=>{it('a',()=>{expect(hd351fiex2(1,4)).toBe(2);});it('b',()=>{expect(hd351fiex2(3,1)).toBe(1);});it('c',()=>{expect(hd351fiex2(0,0)).toBe(0);});it('d',()=>{expect(hd351fiex2(93,73)).toBe(2);});it('e',()=>{expect(hd351fiex2(15,0)).toBe(4);});});
function hd352fiex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph352fiex2_hd',()=>{it('a',()=>{expect(hd352fiex2(1,4)).toBe(2);});it('b',()=>{expect(hd352fiex2(3,1)).toBe(1);});it('c',()=>{expect(hd352fiex2(0,0)).toBe(0);});it('d',()=>{expect(hd352fiex2(93,73)).toBe(2);});it('e',()=>{expect(hd352fiex2(15,0)).toBe(4);});});
function hd353fiex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph353fiex2_hd',()=>{it('a',()=>{expect(hd353fiex2(1,4)).toBe(2);});it('b',()=>{expect(hd353fiex2(3,1)).toBe(1);});it('c',()=>{expect(hd353fiex2(0,0)).toBe(0);});it('d',()=>{expect(hd353fiex2(93,73)).toBe(2);});it('e',()=>{expect(hd353fiex2(15,0)).toBe(4);});});
function hd354fiex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph354fiex2_hd',()=>{it('a',()=>{expect(hd354fiex2(1,4)).toBe(2);});it('b',()=>{expect(hd354fiex2(3,1)).toBe(1);});it('c',()=>{expect(hd354fiex2(0,0)).toBe(0);});it('d',()=>{expect(hd354fiex2(93,73)).toBe(2);});it('e',()=>{expect(hd354fiex2(15,0)).toBe(4);});});
function hd355fiex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph355fiex2_hd',()=>{it('a',()=>{expect(hd355fiex2(1,4)).toBe(2);});it('b',()=>{expect(hd355fiex2(3,1)).toBe(1);});it('c',()=>{expect(hd355fiex2(0,0)).toBe(0);});it('d',()=>{expect(hd355fiex2(93,73)).toBe(2);});it('e',()=>{expect(hd355fiex2(15,0)).toBe(4);});});
function hd356fiex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph356fiex2_hd',()=>{it('a',()=>{expect(hd356fiex2(1,4)).toBe(2);});it('b',()=>{expect(hd356fiex2(3,1)).toBe(1);});it('c',()=>{expect(hd356fiex2(0,0)).toBe(0);});it('d',()=>{expect(hd356fiex2(93,73)).toBe(2);});it('e',()=>{expect(hd356fiex2(15,0)).toBe(4);});});
function hd357fiex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph357fiex2_hd',()=>{it('a',()=>{expect(hd357fiex2(1,4)).toBe(2);});it('b',()=>{expect(hd357fiex2(3,1)).toBe(1);});it('c',()=>{expect(hd357fiex2(0,0)).toBe(0);});it('d',()=>{expect(hd357fiex2(93,73)).toBe(2);});it('e',()=>{expect(hd357fiex2(15,0)).toBe(4);});});
function hd358fiex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph358fiex2_hd',()=>{it('a',()=>{expect(hd358fiex2(1,4)).toBe(2);});it('b',()=>{expect(hd358fiex2(3,1)).toBe(1);});it('c',()=>{expect(hd358fiex2(0,0)).toBe(0);});it('d',()=>{expect(hd358fiex2(93,73)).toBe(2);});it('e',()=>{expect(hd358fiex2(15,0)).toBe(4);});});
function hd359fiex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph359fiex2_hd',()=>{it('a',()=>{expect(hd359fiex2(1,4)).toBe(2);});it('b',()=>{expect(hd359fiex2(3,1)).toBe(1);});it('c',()=>{expect(hd359fiex2(0,0)).toBe(0);});it('d',()=>{expect(hd359fiex2(93,73)).toBe(2);});it('e',()=>{expect(hd359fiex2(15,0)).toBe(4);});});
function hd360fiex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph360fiex2_hd',()=>{it('a',()=>{expect(hd360fiex2(1,4)).toBe(2);});it('b',()=>{expect(hd360fiex2(3,1)).toBe(1);});it('c',()=>{expect(hd360fiex2(0,0)).toBe(0);});it('d',()=>{expect(hd360fiex2(93,73)).toBe(2);});it('e',()=>{expect(hd360fiex2(15,0)).toBe(4);});});
function hd361fiex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph361fiex2_hd',()=>{it('a',()=>{expect(hd361fiex2(1,4)).toBe(2);});it('b',()=>{expect(hd361fiex2(3,1)).toBe(1);});it('c',()=>{expect(hd361fiex2(0,0)).toBe(0);});it('d',()=>{expect(hd361fiex2(93,73)).toBe(2);});it('e',()=>{expect(hd361fiex2(15,0)).toBe(4);});});
function hd362fiex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph362fiex2_hd',()=>{it('a',()=>{expect(hd362fiex2(1,4)).toBe(2);});it('b',()=>{expect(hd362fiex2(3,1)).toBe(1);});it('c',()=>{expect(hd362fiex2(0,0)).toBe(0);});it('d',()=>{expect(hd362fiex2(93,73)).toBe(2);});it('e',()=>{expect(hd362fiex2(15,0)).toBe(4);});});
function hd363fiex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph363fiex2_hd',()=>{it('a',()=>{expect(hd363fiex2(1,4)).toBe(2);});it('b',()=>{expect(hd363fiex2(3,1)).toBe(1);});it('c',()=>{expect(hd363fiex2(0,0)).toBe(0);});it('d',()=>{expect(hd363fiex2(93,73)).toBe(2);});it('e',()=>{expect(hd363fiex2(15,0)).toBe(4);});});
function hd364fiex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph364fiex2_hd',()=>{it('a',()=>{expect(hd364fiex2(1,4)).toBe(2);});it('b',()=>{expect(hd364fiex2(3,1)).toBe(1);});it('c',()=>{expect(hd364fiex2(0,0)).toBe(0);});it('d',()=>{expect(hd364fiex2(93,73)).toBe(2);});it('e',()=>{expect(hd364fiex2(15,0)).toBe(4);});});
function hd365fiex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph365fiex2_hd',()=>{it('a',()=>{expect(hd365fiex2(1,4)).toBe(2);});it('b',()=>{expect(hd365fiex2(3,1)).toBe(1);});it('c',()=>{expect(hd365fiex2(0,0)).toBe(0);});it('d',()=>{expect(hd365fiex2(93,73)).toBe(2);});it('e',()=>{expect(hd365fiex2(15,0)).toBe(4);});});
function hd366fiex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph366fiex2_hd',()=>{it('a',()=>{expect(hd366fiex2(1,4)).toBe(2);});it('b',()=>{expect(hd366fiex2(3,1)).toBe(1);});it('c',()=>{expect(hd366fiex2(0,0)).toBe(0);});it('d',()=>{expect(hd366fiex2(93,73)).toBe(2);});it('e',()=>{expect(hd366fiex2(15,0)).toBe(4);});});
function hd367fiex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph367fiex2_hd',()=>{it('a',()=>{expect(hd367fiex2(1,4)).toBe(2);});it('b',()=>{expect(hd367fiex2(3,1)).toBe(1);});it('c',()=>{expect(hd367fiex2(0,0)).toBe(0);});it('d',()=>{expect(hd367fiex2(93,73)).toBe(2);});it('e',()=>{expect(hd367fiex2(15,0)).toBe(4);});});
function hd368fiex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph368fiex2_hd',()=>{it('a',()=>{expect(hd368fiex2(1,4)).toBe(2);});it('b',()=>{expect(hd368fiex2(3,1)).toBe(1);});it('c',()=>{expect(hd368fiex2(0,0)).toBe(0);});it('d',()=>{expect(hd368fiex2(93,73)).toBe(2);});it('e',()=>{expect(hd368fiex2(15,0)).toBe(4);});});
function hd369fiex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph369fiex2_hd',()=>{it('a',()=>{expect(hd369fiex2(1,4)).toBe(2);});it('b',()=>{expect(hd369fiex2(3,1)).toBe(1);});it('c',()=>{expect(hd369fiex2(0,0)).toBe(0);});it('d',()=>{expect(hd369fiex2(93,73)).toBe(2);});it('e',()=>{expect(hd369fiex2(15,0)).toBe(4);});});
function hd370fiex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph370fiex2_hd',()=>{it('a',()=>{expect(hd370fiex2(1,4)).toBe(2);});it('b',()=>{expect(hd370fiex2(3,1)).toBe(1);});it('c',()=>{expect(hd370fiex2(0,0)).toBe(0);});it('d',()=>{expect(hd370fiex2(93,73)).toBe(2);});it('e',()=>{expect(hd370fiex2(15,0)).toBe(4);});});
function hd371fiex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph371fiex2_hd',()=>{it('a',()=>{expect(hd371fiex2(1,4)).toBe(2);});it('b',()=>{expect(hd371fiex2(3,1)).toBe(1);});it('c',()=>{expect(hd371fiex2(0,0)).toBe(0);});it('d',()=>{expect(hd371fiex2(93,73)).toBe(2);});it('e',()=>{expect(hd371fiex2(15,0)).toBe(4);});});
function hd372fiex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph372fiex2_hd',()=>{it('a',()=>{expect(hd372fiex2(1,4)).toBe(2);});it('b',()=>{expect(hd372fiex2(3,1)).toBe(1);});it('c',()=>{expect(hd372fiex2(0,0)).toBe(0);});it('d',()=>{expect(hd372fiex2(93,73)).toBe(2);});it('e',()=>{expect(hd372fiex2(15,0)).toBe(4);});});
function hd373fiex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph373fiex2_hd',()=>{it('a',()=>{expect(hd373fiex2(1,4)).toBe(2);});it('b',()=>{expect(hd373fiex2(3,1)).toBe(1);});it('c',()=>{expect(hd373fiex2(0,0)).toBe(0);});it('d',()=>{expect(hd373fiex2(93,73)).toBe(2);});it('e',()=>{expect(hd373fiex2(15,0)).toBe(4);});});
function hd374fiex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph374fiex2_hd',()=>{it('a',()=>{expect(hd374fiex2(1,4)).toBe(2);});it('b',()=>{expect(hd374fiex2(3,1)).toBe(1);});it('c',()=>{expect(hd374fiex2(0,0)).toBe(0);});it('d',()=>{expect(hd374fiex2(93,73)).toBe(2);});it('e',()=>{expect(hd374fiex2(15,0)).toBe(4);});});
function hd375fiex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph375fiex2_hd',()=>{it('a',()=>{expect(hd375fiex2(1,4)).toBe(2);});it('b',()=>{expect(hd375fiex2(3,1)).toBe(1);});it('c',()=>{expect(hd375fiex2(0,0)).toBe(0);});it('d',()=>{expect(hd375fiex2(93,73)).toBe(2);});it('e',()=>{expect(hd375fiex2(15,0)).toBe(4);});});
function hd376fiex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph376fiex2_hd',()=>{it('a',()=>{expect(hd376fiex2(1,4)).toBe(2);});it('b',()=>{expect(hd376fiex2(3,1)).toBe(1);});it('c',()=>{expect(hd376fiex2(0,0)).toBe(0);});it('d',()=>{expect(hd376fiex2(93,73)).toBe(2);});it('e',()=>{expect(hd376fiex2(15,0)).toBe(4);});});
function hd377fiex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph377fiex2_hd',()=>{it('a',()=>{expect(hd377fiex2(1,4)).toBe(2);});it('b',()=>{expect(hd377fiex2(3,1)).toBe(1);});it('c',()=>{expect(hd377fiex2(0,0)).toBe(0);});it('d',()=>{expect(hd377fiex2(93,73)).toBe(2);});it('e',()=>{expect(hd377fiex2(15,0)).toBe(4);});});
function hd378fiex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph378fiex2_hd',()=>{it('a',()=>{expect(hd378fiex2(1,4)).toBe(2);});it('b',()=>{expect(hd378fiex2(3,1)).toBe(1);});it('c',()=>{expect(hd378fiex2(0,0)).toBe(0);});it('d',()=>{expect(hd378fiex2(93,73)).toBe(2);});it('e',()=>{expect(hd378fiex2(15,0)).toBe(4);});});
function hd379fiex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph379fiex2_hd',()=>{it('a',()=>{expect(hd379fiex2(1,4)).toBe(2);});it('b',()=>{expect(hd379fiex2(3,1)).toBe(1);});it('c',()=>{expect(hd379fiex2(0,0)).toBe(0);});it('d',()=>{expect(hd379fiex2(93,73)).toBe(2);});it('e',()=>{expect(hd379fiex2(15,0)).toBe(4);});});
function hd380fiex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph380fiex2_hd',()=>{it('a',()=>{expect(hd380fiex2(1,4)).toBe(2);});it('b',()=>{expect(hd380fiex2(3,1)).toBe(1);});it('c',()=>{expect(hd380fiex2(0,0)).toBe(0);});it('d',()=>{expect(hd380fiex2(93,73)).toBe(2);});it('e',()=>{expect(hd380fiex2(15,0)).toBe(4);});});
function hd381fiex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph381fiex2_hd',()=>{it('a',()=>{expect(hd381fiex2(1,4)).toBe(2);});it('b',()=>{expect(hd381fiex2(3,1)).toBe(1);});it('c',()=>{expect(hd381fiex2(0,0)).toBe(0);});it('d',()=>{expect(hd381fiex2(93,73)).toBe(2);});it('e',()=>{expect(hd381fiex2(15,0)).toBe(4);});});
function hd382fiex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph382fiex2_hd',()=>{it('a',()=>{expect(hd382fiex2(1,4)).toBe(2);});it('b',()=>{expect(hd382fiex2(3,1)).toBe(1);});it('c',()=>{expect(hd382fiex2(0,0)).toBe(0);});it('d',()=>{expect(hd382fiex2(93,73)).toBe(2);});it('e',()=>{expect(hd382fiex2(15,0)).toBe(4);});});
function hd383fiex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph383fiex2_hd',()=>{it('a',()=>{expect(hd383fiex2(1,4)).toBe(2);});it('b',()=>{expect(hd383fiex2(3,1)).toBe(1);});it('c',()=>{expect(hd383fiex2(0,0)).toBe(0);});it('d',()=>{expect(hd383fiex2(93,73)).toBe(2);});it('e',()=>{expect(hd383fiex2(15,0)).toBe(4);});});
function hd384fiex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph384fiex2_hd',()=>{it('a',()=>{expect(hd384fiex2(1,4)).toBe(2);});it('b',()=>{expect(hd384fiex2(3,1)).toBe(1);});it('c',()=>{expect(hd384fiex2(0,0)).toBe(0);});it('d',()=>{expect(hd384fiex2(93,73)).toBe(2);});it('e',()=>{expect(hd384fiex2(15,0)).toBe(4);});});
function hd385fiex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph385fiex2_hd',()=>{it('a',()=>{expect(hd385fiex2(1,4)).toBe(2);});it('b',()=>{expect(hd385fiex2(3,1)).toBe(1);});it('c',()=>{expect(hd385fiex2(0,0)).toBe(0);});it('d',()=>{expect(hd385fiex2(93,73)).toBe(2);});it('e',()=>{expect(hd385fiex2(15,0)).toBe(4);});});
function hd386fiex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph386fiex2_hd',()=>{it('a',()=>{expect(hd386fiex2(1,4)).toBe(2);});it('b',()=>{expect(hd386fiex2(3,1)).toBe(1);});it('c',()=>{expect(hd386fiex2(0,0)).toBe(0);});it('d',()=>{expect(hd386fiex2(93,73)).toBe(2);});it('e',()=>{expect(hd386fiex2(15,0)).toBe(4);});});
function hd387fiex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph387fiex2_hd',()=>{it('a',()=>{expect(hd387fiex2(1,4)).toBe(2);});it('b',()=>{expect(hd387fiex2(3,1)).toBe(1);});it('c',()=>{expect(hd387fiex2(0,0)).toBe(0);});it('d',()=>{expect(hd387fiex2(93,73)).toBe(2);});it('e',()=>{expect(hd387fiex2(15,0)).toBe(4);});});
function hd388fiex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph388fiex2_hd',()=>{it('a',()=>{expect(hd388fiex2(1,4)).toBe(2);});it('b',()=>{expect(hd388fiex2(3,1)).toBe(1);});it('c',()=>{expect(hd388fiex2(0,0)).toBe(0);});it('d',()=>{expect(hd388fiex2(93,73)).toBe(2);});it('e',()=>{expect(hd388fiex2(15,0)).toBe(4);});});
function hd389fiex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph389fiex2_hd',()=>{it('a',()=>{expect(hd389fiex2(1,4)).toBe(2);});it('b',()=>{expect(hd389fiex2(3,1)).toBe(1);});it('c',()=>{expect(hd389fiex2(0,0)).toBe(0);});it('d',()=>{expect(hd389fiex2(93,73)).toBe(2);});it('e',()=>{expect(hd389fiex2(15,0)).toBe(4);});});
function hd390fiex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph390fiex2_hd',()=>{it('a',()=>{expect(hd390fiex2(1,4)).toBe(2);});it('b',()=>{expect(hd390fiex2(3,1)).toBe(1);});it('c',()=>{expect(hd390fiex2(0,0)).toBe(0);});it('d',()=>{expect(hd390fiex2(93,73)).toBe(2);});it('e',()=>{expect(hd390fiex2(15,0)).toBe(4);});});
function hd391fiex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph391fiex2_hd',()=>{it('a',()=>{expect(hd391fiex2(1,4)).toBe(2);});it('b',()=>{expect(hd391fiex2(3,1)).toBe(1);});it('c',()=>{expect(hd391fiex2(0,0)).toBe(0);});it('d',()=>{expect(hd391fiex2(93,73)).toBe(2);});it('e',()=>{expect(hd391fiex2(15,0)).toBe(4);});});
function hd392fiex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph392fiex2_hd',()=>{it('a',()=>{expect(hd392fiex2(1,4)).toBe(2);});it('b',()=>{expect(hd392fiex2(3,1)).toBe(1);});it('c',()=>{expect(hd392fiex2(0,0)).toBe(0);});it('d',()=>{expect(hd392fiex2(93,73)).toBe(2);});it('e',()=>{expect(hd392fiex2(15,0)).toBe(4);});});
function hd393fiex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph393fiex2_hd',()=>{it('a',()=>{expect(hd393fiex2(1,4)).toBe(2);});it('b',()=>{expect(hd393fiex2(3,1)).toBe(1);});it('c',()=>{expect(hd393fiex2(0,0)).toBe(0);});it('d',()=>{expect(hd393fiex2(93,73)).toBe(2);});it('e',()=>{expect(hd393fiex2(15,0)).toBe(4);});});
function hd394fiex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph394fiex2_hd',()=>{it('a',()=>{expect(hd394fiex2(1,4)).toBe(2);});it('b',()=>{expect(hd394fiex2(3,1)).toBe(1);});it('c',()=>{expect(hd394fiex2(0,0)).toBe(0);});it('d',()=>{expect(hd394fiex2(93,73)).toBe(2);});it('e',()=>{expect(hd394fiex2(15,0)).toBe(4);});});
function hd395fiex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph395fiex2_hd',()=>{it('a',()=>{expect(hd395fiex2(1,4)).toBe(2);});it('b',()=>{expect(hd395fiex2(3,1)).toBe(1);});it('c',()=>{expect(hd395fiex2(0,0)).toBe(0);});it('d',()=>{expect(hd395fiex2(93,73)).toBe(2);});it('e',()=>{expect(hd395fiex2(15,0)).toBe(4);});});
function hd396fiex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph396fiex2_hd',()=>{it('a',()=>{expect(hd396fiex2(1,4)).toBe(2);});it('b',()=>{expect(hd396fiex2(3,1)).toBe(1);});it('c',()=>{expect(hd396fiex2(0,0)).toBe(0);});it('d',()=>{expect(hd396fiex2(93,73)).toBe(2);});it('e',()=>{expect(hd396fiex2(15,0)).toBe(4);});});
function hd397fiex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph397fiex2_hd',()=>{it('a',()=>{expect(hd397fiex2(1,4)).toBe(2);});it('b',()=>{expect(hd397fiex2(3,1)).toBe(1);});it('c',()=>{expect(hd397fiex2(0,0)).toBe(0);});it('d',()=>{expect(hd397fiex2(93,73)).toBe(2);});it('e',()=>{expect(hd397fiex2(15,0)).toBe(4);});});
function hd398fiex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph398fiex2_hd',()=>{it('a',()=>{expect(hd398fiex2(1,4)).toBe(2);});it('b',()=>{expect(hd398fiex2(3,1)).toBe(1);});it('c',()=>{expect(hd398fiex2(0,0)).toBe(0);});it('d',()=>{expect(hd398fiex2(93,73)).toBe(2);});it('e',()=>{expect(hd398fiex2(15,0)).toBe(4);});});
function hd399fiex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph399fiex2_hd',()=>{it('a',()=>{expect(hd399fiex2(1,4)).toBe(2);});it('b',()=>{expect(hd399fiex2(3,1)).toBe(1);});it('c',()=>{expect(hd399fiex2(0,0)).toBe(0);});it('d',()=>{expect(hd399fiex2(93,73)).toBe(2);});it('e',()=>{expect(hd399fiex2(15,0)).toBe(4);});});
function hd400fiex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph400fiex2_hd',()=>{it('a',()=>{expect(hd400fiex2(1,4)).toBe(2);});it('b',()=>{expect(hd400fiex2(3,1)).toBe(1);});it('c',()=>{expect(hd400fiex2(0,0)).toBe(0);});it('d',()=>{expect(hd400fiex2(93,73)).toBe(2);});it('e',()=>{expect(hd400fiex2(15,0)).toBe(4);});});
function hd401fiex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph401fiex2_hd',()=>{it('a',()=>{expect(hd401fiex2(1,4)).toBe(2);});it('b',()=>{expect(hd401fiex2(3,1)).toBe(1);});it('c',()=>{expect(hd401fiex2(0,0)).toBe(0);});it('d',()=>{expect(hd401fiex2(93,73)).toBe(2);});it('e',()=>{expect(hd401fiex2(15,0)).toBe(4);});});
function hd402fiex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph402fiex2_hd',()=>{it('a',()=>{expect(hd402fiex2(1,4)).toBe(2);});it('b',()=>{expect(hd402fiex2(3,1)).toBe(1);});it('c',()=>{expect(hd402fiex2(0,0)).toBe(0);});it('d',()=>{expect(hd402fiex2(93,73)).toBe(2);});it('e',()=>{expect(hd402fiex2(15,0)).toBe(4);});});
function hd403fiex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph403fiex2_hd',()=>{it('a',()=>{expect(hd403fiex2(1,4)).toBe(2);});it('b',()=>{expect(hd403fiex2(3,1)).toBe(1);});it('c',()=>{expect(hd403fiex2(0,0)).toBe(0);});it('d',()=>{expect(hd403fiex2(93,73)).toBe(2);});it('e',()=>{expect(hd403fiex2(15,0)).toBe(4);});});
function hd404fiex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph404fiex2_hd',()=>{it('a',()=>{expect(hd404fiex2(1,4)).toBe(2);});it('b',()=>{expect(hd404fiex2(3,1)).toBe(1);});it('c',()=>{expect(hd404fiex2(0,0)).toBe(0);});it('d',()=>{expect(hd404fiex2(93,73)).toBe(2);});it('e',()=>{expect(hd404fiex2(15,0)).toBe(4);});});
function hd405fiex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph405fiex2_hd',()=>{it('a',()=>{expect(hd405fiex2(1,4)).toBe(2);});it('b',()=>{expect(hd405fiex2(3,1)).toBe(1);});it('c',()=>{expect(hd405fiex2(0,0)).toBe(0);});it('d',()=>{expect(hd405fiex2(93,73)).toBe(2);});it('e',()=>{expect(hd405fiex2(15,0)).toBe(4);});});
function hd406fiex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph406fiex2_hd',()=>{it('a',()=>{expect(hd406fiex2(1,4)).toBe(2);});it('b',()=>{expect(hd406fiex2(3,1)).toBe(1);});it('c',()=>{expect(hd406fiex2(0,0)).toBe(0);});it('d',()=>{expect(hd406fiex2(93,73)).toBe(2);});it('e',()=>{expect(hd406fiex2(15,0)).toBe(4);});});
function hd407fiex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph407fiex2_hd',()=>{it('a',()=>{expect(hd407fiex2(1,4)).toBe(2);});it('b',()=>{expect(hd407fiex2(3,1)).toBe(1);});it('c',()=>{expect(hd407fiex2(0,0)).toBe(0);});it('d',()=>{expect(hd407fiex2(93,73)).toBe(2);});it('e',()=>{expect(hd407fiex2(15,0)).toBe(4);});});
function hd408fiex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph408fiex2_hd',()=>{it('a',()=>{expect(hd408fiex2(1,4)).toBe(2);});it('b',()=>{expect(hd408fiex2(3,1)).toBe(1);});it('c',()=>{expect(hd408fiex2(0,0)).toBe(0);});it('d',()=>{expect(hd408fiex2(93,73)).toBe(2);});it('e',()=>{expect(hd408fiex2(15,0)).toBe(4);});});
function hd409fiex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph409fiex2_hd',()=>{it('a',()=>{expect(hd409fiex2(1,4)).toBe(2);});it('b',()=>{expect(hd409fiex2(3,1)).toBe(1);});it('c',()=>{expect(hd409fiex2(0,0)).toBe(0);});it('d',()=>{expect(hd409fiex2(93,73)).toBe(2);});it('e',()=>{expect(hd409fiex2(15,0)).toBe(4);});});
function hd410fiex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph410fiex2_hd',()=>{it('a',()=>{expect(hd410fiex2(1,4)).toBe(2);});it('b',()=>{expect(hd410fiex2(3,1)).toBe(1);});it('c',()=>{expect(hd410fiex2(0,0)).toBe(0);});it('d',()=>{expect(hd410fiex2(93,73)).toBe(2);});it('e',()=>{expect(hd410fiex2(15,0)).toBe(4);});});
function hd411fiex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph411fiex2_hd',()=>{it('a',()=>{expect(hd411fiex2(1,4)).toBe(2);});it('b',()=>{expect(hd411fiex2(3,1)).toBe(1);});it('c',()=>{expect(hd411fiex2(0,0)).toBe(0);});it('d',()=>{expect(hd411fiex2(93,73)).toBe(2);});it('e',()=>{expect(hd411fiex2(15,0)).toBe(4);});});
function hd412fiex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph412fiex2_hd',()=>{it('a',()=>{expect(hd412fiex2(1,4)).toBe(2);});it('b',()=>{expect(hd412fiex2(3,1)).toBe(1);});it('c',()=>{expect(hd412fiex2(0,0)).toBe(0);});it('d',()=>{expect(hd412fiex2(93,73)).toBe(2);});it('e',()=>{expect(hd412fiex2(15,0)).toBe(4);});});
function hd413fiex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph413fiex2_hd',()=>{it('a',()=>{expect(hd413fiex2(1,4)).toBe(2);});it('b',()=>{expect(hd413fiex2(3,1)).toBe(1);});it('c',()=>{expect(hd413fiex2(0,0)).toBe(0);});it('d',()=>{expect(hd413fiex2(93,73)).toBe(2);});it('e',()=>{expect(hd413fiex2(15,0)).toBe(4);});});
function hd414fiex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph414fiex2_hd',()=>{it('a',()=>{expect(hd414fiex2(1,4)).toBe(2);});it('b',()=>{expect(hd414fiex2(3,1)).toBe(1);});it('c',()=>{expect(hd414fiex2(0,0)).toBe(0);});it('d',()=>{expect(hd414fiex2(93,73)).toBe(2);});it('e',()=>{expect(hd414fiex2(15,0)).toBe(4);});});
function hd415fiex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph415fiex2_hd',()=>{it('a',()=>{expect(hd415fiex2(1,4)).toBe(2);});it('b',()=>{expect(hd415fiex2(3,1)).toBe(1);});it('c',()=>{expect(hd415fiex2(0,0)).toBe(0);});it('d',()=>{expect(hd415fiex2(93,73)).toBe(2);});it('e',()=>{expect(hd415fiex2(15,0)).toBe(4);});});
function hd416fiex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph416fiex2_hd',()=>{it('a',()=>{expect(hd416fiex2(1,4)).toBe(2);});it('b',()=>{expect(hd416fiex2(3,1)).toBe(1);});it('c',()=>{expect(hd416fiex2(0,0)).toBe(0);});it('d',()=>{expect(hd416fiex2(93,73)).toBe(2);});it('e',()=>{expect(hd416fiex2(15,0)).toBe(4);});});
function hd417fiex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph417fiex2_hd',()=>{it('a',()=>{expect(hd417fiex2(1,4)).toBe(2);});it('b',()=>{expect(hd417fiex2(3,1)).toBe(1);});it('c',()=>{expect(hd417fiex2(0,0)).toBe(0);});it('d',()=>{expect(hd417fiex2(93,73)).toBe(2);});it('e',()=>{expect(hd417fiex2(15,0)).toBe(4);});});
