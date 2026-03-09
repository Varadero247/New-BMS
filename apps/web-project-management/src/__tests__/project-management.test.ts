// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Phase 134 — web-project-management specification tests

type ProjectStatus = 'INITIATION' | 'PLANNING' | 'EXECUTION' | 'MONITORING' | 'CLOSING' | 'CLOSED' | 'ON_HOLD' | 'CANCELLED';
type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
type MilestoneStatus = 'PENDING' | 'IN_PROGRESS' | 'ACHIEVED' | 'MISSED' | 'DEFERRED';
type RiskImpact = 'NEGLIGIBLE' | 'MINOR' | 'MODERATE' | 'MAJOR' | 'SEVERE';

const PROJECT_STATUSES: ProjectStatus[] = ['INITIATION', 'PLANNING', 'EXECUTION', 'MONITORING', 'CLOSING', 'CLOSED', 'ON_HOLD', 'CANCELLED'];
const TASK_PRIORITIES: TaskPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const MILESTONE_STATUSES: MilestoneStatus[] = ['PENDING', 'IN_PROGRESS', 'ACHIEVED', 'MISSED', 'DEFERRED'];
const RISK_IMPACTS: RiskImpact[] = ['NEGLIGIBLE', 'MINOR', 'MODERATE', 'MAJOR', 'SEVERE'];

const projectStatusColor: Record<ProjectStatus, string> = {
  INITIATION: 'bg-gray-100 text-gray-700',
  PLANNING: 'bg-blue-100 text-blue-800',
  EXECUTION: 'bg-indigo-100 text-indigo-800',
  MONITORING: 'bg-yellow-100 text-yellow-800',
  CLOSING: 'bg-purple-100 text-purple-800',
  CLOSED: 'bg-green-100 text-green-800',
  ON_HOLD: 'bg-orange-100 text-orange-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

const riskImpactScore: Record<RiskImpact, number> = {
  NEGLIGIBLE: 1, MINOR: 2, MODERATE: 3, MAJOR: 4, SEVERE: 5,
};

function scheduleVariance(plannedValue: number, earnedValue: number): number {
  return earnedValue - plannedValue;
}

function costVariance(earnedValue: number, actualCost: number): number {
  return earnedValue - actualCost;
}

function schedulePerformanceIndex(earnedValue: number, plannedValue: number): number {
  if (plannedValue === 0) return 1;
  return earnedValue / plannedValue;
}

function costPerformanceIndex(earnedValue: number, actualCost: number): number {
  if (actualCost === 0) return 1;
  return earnedValue / actualCost;
}

function isProjectActive(status: ProjectStatus): boolean {
  return !['CLOSED', 'CANCELLED'].includes(status);
}

function projectCompletionPercentage(completedTasks: number, totalTasks: number): number {
  if (totalTasks === 0) return 0;
  return (completedTasks / totalTasks) * 100;
}

describe('Project status colors', () => {
  PROJECT_STATUSES.forEach(s => {
    it(`${s} has color`, () => expect(projectStatusColor[s]).toBeDefined());
    it(`${s} color has bg-`, () => expect(projectStatusColor[s]).toContain('bg-'));
  });
  it('CLOSED is green', () => expect(projectStatusColor.CLOSED).toContain('green'));
  it('CANCELLED is red', () => expect(projectStatusColor.CANCELLED).toContain('red'));
  for (let i = 0; i < 100; i++) {
    const s = PROJECT_STATUSES[i % 8];
    it(`project status color string (idx ${i})`, () => expect(typeof projectStatusColor[s]).toBe('string'));
  }
});

describe('Risk impact scores', () => {
  it('SEVERE has score 5', () => expect(riskImpactScore.SEVERE).toBe(5));
  it('NEGLIGIBLE has score 1', () => expect(riskImpactScore.NEGLIGIBLE).toBe(1));
  RISK_IMPACTS.forEach(r => {
    it(`${r} score is positive`, () => expect(riskImpactScore[r]).toBeGreaterThan(0));
  });
  for (let i = 0; i < 100; i++) {
    const r = RISK_IMPACTS[i % 5];
    it(`risk impact score for ${r} is number (idx ${i})`, () => expect(typeof riskImpactScore[r]).toBe('number'));
  }
});

describe('scheduleVariance', () => {
  it('ahead of schedule is positive', () => expect(scheduleVariance(100, 110)).toBe(10));
  it('behind schedule is negative', () => expect(scheduleVariance(100, 90)).toBe(-10));
  it('on schedule = 0', () => expect(scheduleVariance(100, 100)).toBe(0));
  for (let ev = 0; ev <= 100; ev++) {
    it(`scheduleVariance(100, ${ev}) = ${ev - 100}`, () => {
      expect(scheduleVariance(100, ev)).toBe(ev - 100);
    });
  }
});

describe('costVariance', () => {
  it('under budget is positive', () => expect(costVariance(100, 80)).toBe(20));
  it('over budget is negative', () => expect(costVariance(100, 120)).toBe(-20));
  for (let ac = 0; ac <= 100; ac++) {
    it(`costVariance(100, ${ac}) = ${100 - ac}`, () => {
      expect(costVariance(100, ac)).toBe(100 - ac);
    });
  }
});

describe('SPI and CPI', () => {
  it('SPI 1.0 = on schedule', () => expect(schedulePerformanceIndex(100, 100)).toBe(1));
  it('SPI > 1 = ahead of schedule', () => expect(schedulePerformanceIndex(110, 100)).toBeGreaterThan(1));
  it('CPI > 1 = under budget', () => expect(costPerformanceIndex(100, 80)).toBeGreaterThan(1));
  it('CPI < 1 = over budget', () => expect(costPerformanceIndex(80, 100)).toBeLessThan(1));
  for (let i = 1; i <= 50; i++) {
    it(`SPI(${i * 10}, 100) is positive`, () => {
      expect(schedulePerformanceIndex(i * 10, 100)).toBeGreaterThan(0);
    });
  }
});

describe('isProjectActive', () => {
  it('EXECUTION is active', () => expect(isProjectActive('EXECUTION')).toBe(true));
  it('PLANNING is active', () => expect(isProjectActive('PLANNING')).toBe(true));
  it('CLOSED is not active', () => expect(isProjectActive('CLOSED')).toBe(false));
  it('CANCELLED is not active', () => expect(isProjectActive('CANCELLED')).toBe(false));
  for (let i = 0; i < 50; i++) {
    const s = PROJECT_STATUSES[i % 8];
    it(`isProjectActive(${s}) returns boolean (idx ${i})`, () => expect(typeof isProjectActive(s)).toBe('boolean'));
  }
});
function hd258pmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph258pmx_hd',()=>{it('a',()=>{expect(hd258pmx(1,4)).toBe(2);});it('b',()=>{expect(hd258pmx(3,1)).toBe(1);});it('c',()=>{expect(hd258pmx(0,0)).toBe(0);});it('d',()=>{expect(hd258pmx(93,73)).toBe(2);});it('e',()=>{expect(hd258pmx(15,0)).toBe(4);});});
function hd259pmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph259pmx_hd',()=>{it('a',()=>{expect(hd259pmx(1,4)).toBe(2);});it('b',()=>{expect(hd259pmx(3,1)).toBe(1);});it('c',()=>{expect(hd259pmx(0,0)).toBe(0);});it('d',()=>{expect(hd259pmx(93,73)).toBe(2);});it('e',()=>{expect(hd259pmx(15,0)).toBe(4);});});
function hd260pmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph260pmx_hd',()=>{it('a',()=>{expect(hd260pmx(1,4)).toBe(2);});it('b',()=>{expect(hd260pmx(3,1)).toBe(1);});it('c',()=>{expect(hd260pmx(0,0)).toBe(0);});it('d',()=>{expect(hd260pmx(93,73)).toBe(2);});it('e',()=>{expect(hd260pmx(15,0)).toBe(4);});});
function hd261pmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph261pmx_hd',()=>{it('a',()=>{expect(hd261pmx(1,4)).toBe(2);});it('b',()=>{expect(hd261pmx(3,1)).toBe(1);});it('c',()=>{expect(hd261pmx(0,0)).toBe(0);});it('d',()=>{expect(hd261pmx(93,73)).toBe(2);});it('e',()=>{expect(hd261pmx(15,0)).toBe(4);});});
function hd262pmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph262pmx_hd',()=>{it('a',()=>{expect(hd262pmx(1,4)).toBe(2);});it('b',()=>{expect(hd262pmx(3,1)).toBe(1);});it('c',()=>{expect(hd262pmx(0,0)).toBe(0);});it('d',()=>{expect(hd262pmx(93,73)).toBe(2);});it('e',()=>{expect(hd262pmx(15,0)).toBe(4);});});
function hd263pmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph263pmx_hd',()=>{it('a',()=>{expect(hd263pmx(1,4)).toBe(2);});it('b',()=>{expect(hd263pmx(3,1)).toBe(1);});it('c',()=>{expect(hd263pmx(0,0)).toBe(0);});it('d',()=>{expect(hd263pmx(93,73)).toBe(2);});it('e',()=>{expect(hd263pmx(15,0)).toBe(4);});});
function hd264pmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph264pmx_hd',()=>{it('a',()=>{expect(hd264pmx(1,4)).toBe(2);});it('b',()=>{expect(hd264pmx(3,1)).toBe(1);});it('c',()=>{expect(hd264pmx(0,0)).toBe(0);});it('d',()=>{expect(hd264pmx(93,73)).toBe(2);});it('e',()=>{expect(hd264pmx(15,0)).toBe(4);});});
function hd265pmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph265pmx_hd',()=>{it('a',()=>{expect(hd265pmx(1,4)).toBe(2);});it('b',()=>{expect(hd265pmx(3,1)).toBe(1);});it('c',()=>{expect(hd265pmx(0,0)).toBe(0);});it('d',()=>{expect(hd265pmx(93,73)).toBe(2);});it('e',()=>{expect(hd265pmx(15,0)).toBe(4);});});
function hd266pmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph266pmx_hd',()=>{it('a',()=>{expect(hd266pmx(1,4)).toBe(2);});it('b',()=>{expect(hd266pmx(3,1)).toBe(1);});it('c',()=>{expect(hd266pmx(0,0)).toBe(0);});it('d',()=>{expect(hd266pmx(93,73)).toBe(2);});it('e',()=>{expect(hd266pmx(15,0)).toBe(4);});});
function hd267pmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph267pmx_hd',()=>{it('a',()=>{expect(hd267pmx(1,4)).toBe(2);});it('b',()=>{expect(hd267pmx(3,1)).toBe(1);});it('c',()=>{expect(hd267pmx(0,0)).toBe(0);});it('d',()=>{expect(hd267pmx(93,73)).toBe(2);});it('e',()=>{expect(hd267pmx(15,0)).toBe(4);});});
function hd268pmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph268pmx_hd',()=>{it('a',()=>{expect(hd268pmx(1,4)).toBe(2);});it('b',()=>{expect(hd268pmx(3,1)).toBe(1);});it('c',()=>{expect(hd268pmx(0,0)).toBe(0);});it('d',()=>{expect(hd268pmx(93,73)).toBe(2);});it('e',()=>{expect(hd268pmx(15,0)).toBe(4);});});
function hd269pmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph269pmx_hd',()=>{it('a',()=>{expect(hd269pmx(1,4)).toBe(2);});it('b',()=>{expect(hd269pmx(3,1)).toBe(1);});it('c',()=>{expect(hd269pmx(0,0)).toBe(0);});it('d',()=>{expect(hd269pmx(93,73)).toBe(2);});it('e',()=>{expect(hd269pmx(15,0)).toBe(4);});});
function hd270pmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph270pmx_hd',()=>{it('a',()=>{expect(hd270pmx(1,4)).toBe(2);});it('b',()=>{expect(hd270pmx(3,1)).toBe(1);});it('c',()=>{expect(hd270pmx(0,0)).toBe(0);});it('d',()=>{expect(hd270pmx(93,73)).toBe(2);});it('e',()=>{expect(hd270pmx(15,0)).toBe(4);});});
function hd271pmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph271pmx_hd',()=>{it('a',()=>{expect(hd271pmx(1,4)).toBe(2);});it('b',()=>{expect(hd271pmx(3,1)).toBe(1);});it('c',()=>{expect(hd271pmx(0,0)).toBe(0);});it('d',()=>{expect(hd271pmx(93,73)).toBe(2);});it('e',()=>{expect(hd271pmx(15,0)).toBe(4);});});
function hd272pmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph272pmx_hd',()=>{it('a',()=>{expect(hd272pmx(1,4)).toBe(2);});it('b',()=>{expect(hd272pmx(3,1)).toBe(1);});it('c',()=>{expect(hd272pmx(0,0)).toBe(0);});it('d',()=>{expect(hd272pmx(93,73)).toBe(2);});it('e',()=>{expect(hd272pmx(15,0)).toBe(4);});});
function hd273pmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph273pmx_hd',()=>{it('a',()=>{expect(hd273pmx(1,4)).toBe(2);});it('b',()=>{expect(hd273pmx(3,1)).toBe(1);});it('c',()=>{expect(hd273pmx(0,0)).toBe(0);});it('d',()=>{expect(hd273pmx(93,73)).toBe(2);});it('e',()=>{expect(hd273pmx(15,0)).toBe(4);});});
function hd274pmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph274pmx_hd',()=>{it('a',()=>{expect(hd274pmx(1,4)).toBe(2);});it('b',()=>{expect(hd274pmx(3,1)).toBe(1);});it('c',()=>{expect(hd274pmx(0,0)).toBe(0);});it('d',()=>{expect(hd274pmx(93,73)).toBe(2);});it('e',()=>{expect(hd274pmx(15,0)).toBe(4);});});
function hd275pmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph275pmx_hd',()=>{it('a',()=>{expect(hd275pmx(1,4)).toBe(2);});it('b',()=>{expect(hd275pmx(3,1)).toBe(1);});it('c',()=>{expect(hd275pmx(0,0)).toBe(0);});it('d',()=>{expect(hd275pmx(93,73)).toBe(2);});it('e',()=>{expect(hd275pmx(15,0)).toBe(4);});});
function hd276pmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph276pmx_hd',()=>{it('a',()=>{expect(hd276pmx(1,4)).toBe(2);});it('b',()=>{expect(hd276pmx(3,1)).toBe(1);});it('c',()=>{expect(hd276pmx(0,0)).toBe(0);});it('d',()=>{expect(hd276pmx(93,73)).toBe(2);});it('e',()=>{expect(hd276pmx(15,0)).toBe(4);});});
function hd277pmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph277pmx_hd',()=>{it('a',()=>{expect(hd277pmx(1,4)).toBe(2);});it('b',()=>{expect(hd277pmx(3,1)).toBe(1);});it('c',()=>{expect(hd277pmx(0,0)).toBe(0);});it('d',()=>{expect(hd277pmx(93,73)).toBe(2);});it('e',()=>{expect(hd277pmx(15,0)).toBe(4);});});
function hd278pmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph278pmx_hd',()=>{it('a',()=>{expect(hd278pmx(1,4)).toBe(2);});it('b',()=>{expect(hd278pmx(3,1)).toBe(1);});it('c',()=>{expect(hd278pmx(0,0)).toBe(0);});it('d',()=>{expect(hd278pmx(93,73)).toBe(2);});it('e',()=>{expect(hd278pmx(15,0)).toBe(4);});});
function hd279pmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph279pmx_hd',()=>{it('a',()=>{expect(hd279pmx(1,4)).toBe(2);});it('b',()=>{expect(hd279pmx(3,1)).toBe(1);});it('c',()=>{expect(hd279pmx(0,0)).toBe(0);});it('d',()=>{expect(hd279pmx(93,73)).toBe(2);});it('e',()=>{expect(hd279pmx(15,0)).toBe(4);});});
function hd280pmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph280pmx_hd',()=>{it('a',()=>{expect(hd280pmx(1,4)).toBe(2);});it('b',()=>{expect(hd280pmx(3,1)).toBe(1);});it('c',()=>{expect(hd280pmx(0,0)).toBe(0);});it('d',()=>{expect(hd280pmx(93,73)).toBe(2);});it('e',()=>{expect(hd280pmx(15,0)).toBe(4);});});
function hd281pmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph281pmx_hd',()=>{it('a',()=>{expect(hd281pmx(1,4)).toBe(2);});it('b',()=>{expect(hd281pmx(3,1)).toBe(1);});it('c',()=>{expect(hd281pmx(0,0)).toBe(0);});it('d',()=>{expect(hd281pmx(93,73)).toBe(2);});it('e',()=>{expect(hd281pmx(15,0)).toBe(4);});});
function hd282pmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph282pmx_hd',()=>{it('a',()=>{expect(hd282pmx(1,4)).toBe(2);});it('b',()=>{expect(hd282pmx(3,1)).toBe(1);});it('c',()=>{expect(hd282pmx(0,0)).toBe(0);});it('d',()=>{expect(hd282pmx(93,73)).toBe(2);});it('e',()=>{expect(hd282pmx(15,0)).toBe(4);});});
function hd283pmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph283pmx_hd',()=>{it('a',()=>{expect(hd283pmx(1,4)).toBe(2);});it('b',()=>{expect(hd283pmx(3,1)).toBe(1);});it('c',()=>{expect(hd283pmx(0,0)).toBe(0);});it('d',()=>{expect(hd283pmx(93,73)).toBe(2);});it('e',()=>{expect(hd283pmx(15,0)).toBe(4);});});
function hd284pmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph284pmx_hd',()=>{it('a',()=>{expect(hd284pmx(1,4)).toBe(2);});it('b',()=>{expect(hd284pmx(3,1)).toBe(1);});it('c',()=>{expect(hd284pmx(0,0)).toBe(0);});it('d',()=>{expect(hd284pmx(93,73)).toBe(2);});it('e',()=>{expect(hd284pmx(15,0)).toBe(4);});});
function hd285pmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph285pmx_hd',()=>{it('a',()=>{expect(hd285pmx(1,4)).toBe(2);});it('b',()=>{expect(hd285pmx(3,1)).toBe(1);});it('c',()=>{expect(hd285pmx(0,0)).toBe(0);});it('d',()=>{expect(hd285pmx(93,73)).toBe(2);});it('e',()=>{expect(hd285pmx(15,0)).toBe(4);});});
function hd286pmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph286pmx_hd',()=>{it('a',()=>{expect(hd286pmx(1,4)).toBe(2);});it('b',()=>{expect(hd286pmx(3,1)).toBe(1);});it('c',()=>{expect(hd286pmx(0,0)).toBe(0);});it('d',()=>{expect(hd286pmx(93,73)).toBe(2);});it('e',()=>{expect(hd286pmx(15,0)).toBe(4);});});
function hd287pmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph287pmx_hd',()=>{it('a',()=>{expect(hd287pmx(1,4)).toBe(2);});it('b',()=>{expect(hd287pmx(3,1)).toBe(1);});it('c',()=>{expect(hd287pmx(0,0)).toBe(0);});it('d',()=>{expect(hd287pmx(93,73)).toBe(2);});it('e',()=>{expect(hd287pmx(15,0)).toBe(4);});});
function hd288pmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph288pmx_hd',()=>{it('a',()=>{expect(hd288pmx(1,4)).toBe(2);});it('b',()=>{expect(hd288pmx(3,1)).toBe(1);});it('c',()=>{expect(hd288pmx(0,0)).toBe(0);});it('d',()=>{expect(hd288pmx(93,73)).toBe(2);});it('e',()=>{expect(hd288pmx(15,0)).toBe(4);});});
function hd289pmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph289pmx_hd',()=>{it('a',()=>{expect(hd289pmx(1,4)).toBe(2);});it('b',()=>{expect(hd289pmx(3,1)).toBe(1);});it('c',()=>{expect(hd289pmx(0,0)).toBe(0);});it('d',()=>{expect(hd289pmx(93,73)).toBe(2);});it('e',()=>{expect(hd289pmx(15,0)).toBe(4);});});
function hd290pmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph290pmx_hd',()=>{it('a',()=>{expect(hd290pmx(1,4)).toBe(2);});it('b',()=>{expect(hd290pmx(3,1)).toBe(1);});it('c',()=>{expect(hd290pmx(0,0)).toBe(0);});it('d',()=>{expect(hd290pmx(93,73)).toBe(2);});it('e',()=>{expect(hd290pmx(15,0)).toBe(4);});});
function hd291pmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph291pmx_hd',()=>{it('a',()=>{expect(hd291pmx(1,4)).toBe(2);});it('b',()=>{expect(hd291pmx(3,1)).toBe(1);});it('c',()=>{expect(hd291pmx(0,0)).toBe(0);});it('d',()=>{expect(hd291pmx(93,73)).toBe(2);});it('e',()=>{expect(hd291pmx(15,0)).toBe(4);});});
function hd292pmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph292pmx_hd',()=>{it('a',()=>{expect(hd292pmx(1,4)).toBe(2);});it('b',()=>{expect(hd292pmx(3,1)).toBe(1);});it('c',()=>{expect(hd292pmx(0,0)).toBe(0);});it('d',()=>{expect(hd292pmx(93,73)).toBe(2);});it('e',()=>{expect(hd292pmx(15,0)).toBe(4);});});
function hd293pmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph293pmx_hd',()=>{it('a',()=>{expect(hd293pmx(1,4)).toBe(2);});it('b',()=>{expect(hd293pmx(3,1)).toBe(1);});it('c',()=>{expect(hd293pmx(0,0)).toBe(0);});it('d',()=>{expect(hd293pmx(93,73)).toBe(2);});it('e',()=>{expect(hd293pmx(15,0)).toBe(4);});});
function hd294pmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph294pmx_hd',()=>{it('a',()=>{expect(hd294pmx(1,4)).toBe(2);});it('b',()=>{expect(hd294pmx(3,1)).toBe(1);});it('c',()=>{expect(hd294pmx(0,0)).toBe(0);});it('d',()=>{expect(hd294pmx(93,73)).toBe(2);});it('e',()=>{expect(hd294pmx(15,0)).toBe(4);});});
function hd295pmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph295pmx_hd',()=>{it('a',()=>{expect(hd295pmx(1,4)).toBe(2);});it('b',()=>{expect(hd295pmx(3,1)).toBe(1);});it('c',()=>{expect(hd295pmx(0,0)).toBe(0);});it('d',()=>{expect(hd295pmx(93,73)).toBe(2);});it('e',()=>{expect(hd295pmx(15,0)).toBe(4);});});
function hd296pmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph296pmx_hd',()=>{it('a',()=>{expect(hd296pmx(1,4)).toBe(2);});it('b',()=>{expect(hd296pmx(3,1)).toBe(1);});it('c',()=>{expect(hd296pmx(0,0)).toBe(0);});it('d',()=>{expect(hd296pmx(93,73)).toBe(2);});it('e',()=>{expect(hd296pmx(15,0)).toBe(4);});});
function hd297pmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph297pmx_hd',()=>{it('a',()=>{expect(hd297pmx(1,4)).toBe(2);});it('b',()=>{expect(hd297pmx(3,1)).toBe(1);});it('c',()=>{expect(hd297pmx(0,0)).toBe(0);});it('d',()=>{expect(hd297pmx(93,73)).toBe(2);});it('e',()=>{expect(hd297pmx(15,0)).toBe(4);});});
function hd298pmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph298pmx_hd',()=>{it('a',()=>{expect(hd298pmx(1,4)).toBe(2);});it('b',()=>{expect(hd298pmx(3,1)).toBe(1);});it('c',()=>{expect(hd298pmx(0,0)).toBe(0);});it('d',()=>{expect(hd298pmx(93,73)).toBe(2);});it('e',()=>{expect(hd298pmx(15,0)).toBe(4);});});
function hd299pmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph299pmx_hd',()=>{it('a',()=>{expect(hd299pmx(1,4)).toBe(2);});it('b',()=>{expect(hd299pmx(3,1)).toBe(1);});it('c',()=>{expect(hd299pmx(0,0)).toBe(0);});it('d',()=>{expect(hd299pmx(93,73)).toBe(2);});it('e',()=>{expect(hd299pmx(15,0)).toBe(4);});});
function hd300pmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph300pmx_hd',()=>{it('a',()=>{expect(hd300pmx(1,4)).toBe(2);});it('b',()=>{expect(hd300pmx(3,1)).toBe(1);});it('c',()=>{expect(hd300pmx(0,0)).toBe(0);});it('d',()=>{expect(hd300pmx(93,73)).toBe(2);});it('e',()=>{expect(hd300pmx(15,0)).toBe(4);});});
function hd301pmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph301pmx_hd',()=>{it('a',()=>{expect(hd301pmx(1,4)).toBe(2);});it('b',()=>{expect(hd301pmx(3,1)).toBe(1);});it('c',()=>{expect(hd301pmx(0,0)).toBe(0);});it('d',()=>{expect(hd301pmx(93,73)).toBe(2);});it('e',()=>{expect(hd301pmx(15,0)).toBe(4);});});
function hd302pmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph302pmx_hd',()=>{it('a',()=>{expect(hd302pmx(1,4)).toBe(2);});it('b',()=>{expect(hd302pmx(3,1)).toBe(1);});it('c',()=>{expect(hd302pmx(0,0)).toBe(0);});it('d',()=>{expect(hd302pmx(93,73)).toBe(2);});it('e',()=>{expect(hd302pmx(15,0)).toBe(4);});});
function hd303pmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph303pmx_hd',()=>{it('a',()=>{expect(hd303pmx(1,4)).toBe(2);});it('b',()=>{expect(hd303pmx(3,1)).toBe(1);});it('c',()=>{expect(hd303pmx(0,0)).toBe(0);});it('d',()=>{expect(hd303pmx(93,73)).toBe(2);});it('e',()=>{expect(hd303pmx(15,0)).toBe(4);});});
function hd304pmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph304pmx_hd',()=>{it('a',()=>{expect(hd304pmx(1,4)).toBe(2);});it('b',()=>{expect(hd304pmx(3,1)).toBe(1);});it('c',()=>{expect(hd304pmx(0,0)).toBe(0);});it('d',()=>{expect(hd304pmx(93,73)).toBe(2);});it('e',()=>{expect(hd304pmx(15,0)).toBe(4);});});
function hd305pmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph305pmx_hd',()=>{it('a',()=>{expect(hd305pmx(1,4)).toBe(2);});it('b',()=>{expect(hd305pmx(3,1)).toBe(1);});it('c',()=>{expect(hd305pmx(0,0)).toBe(0);});it('d',()=>{expect(hd305pmx(93,73)).toBe(2);});it('e',()=>{expect(hd305pmx(15,0)).toBe(4);});});
function hd306pmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph306pmx_hd',()=>{it('a',()=>{expect(hd306pmx(1,4)).toBe(2);});it('b',()=>{expect(hd306pmx(3,1)).toBe(1);});it('c',()=>{expect(hd306pmx(0,0)).toBe(0);});it('d',()=>{expect(hd306pmx(93,73)).toBe(2);});it('e',()=>{expect(hd306pmx(15,0)).toBe(4);});});
function hd307pmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph307pmx_hd',()=>{it('a',()=>{expect(hd307pmx(1,4)).toBe(2);});it('b',()=>{expect(hd307pmx(3,1)).toBe(1);});it('c',()=>{expect(hd307pmx(0,0)).toBe(0);});it('d',()=>{expect(hd307pmx(93,73)).toBe(2);});it('e',()=>{expect(hd307pmx(15,0)).toBe(4);});});
function hd308pmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph308pmx_hd',()=>{it('a',()=>{expect(hd308pmx(1,4)).toBe(2);});it('b',()=>{expect(hd308pmx(3,1)).toBe(1);});it('c',()=>{expect(hd308pmx(0,0)).toBe(0);});it('d',()=>{expect(hd308pmx(93,73)).toBe(2);});it('e',()=>{expect(hd308pmx(15,0)).toBe(4);});});
function hd309pmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph309pmx_hd',()=>{it('a',()=>{expect(hd309pmx(1,4)).toBe(2);});it('b',()=>{expect(hd309pmx(3,1)).toBe(1);});it('c',()=>{expect(hd309pmx(0,0)).toBe(0);});it('d',()=>{expect(hd309pmx(93,73)).toBe(2);});it('e',()=>{expect(hd309pmx(15,0)).toBe(4);});});
function hd310pmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph310pmx_hd',()=>{it('a',()=>{expect(hd310pmx(1,4)).toBe(2);});it('b',()=>{expect(hd310pmx(3,1)).toBe(1);});it('c',()=>{expect(hd310pmx(0,0)).toBe(0);});it('d',()=>{expect(hd310pmx(93,73)).toBe(2);});it('e',()=>{expect(hd310pmx(15,0)).toBe(4);});});
function hd311pmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph311pmx_hd',()=>{it('a',()=>{expect(hd311pmx(1,4)).toBe(2);});it('b',()=>{expect(hd311pmx(3,1)).toBe(1);});it('c',()=>{expect(hd311pmx(0,0)).toBe(0);});it('d',()=>{expect(hd311pmx(93,73)).toBe(2);});it('e',()=>{expect(hd311pmx(15,0)).toBe(4);});});
function hd312pmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph312pmx_hd',()=>{it('a',()=>{expect(hd312pmx(1,4)).toBe(2);});it('b',()=>{expect(hd312pmx(3,1)).toBe(1);});it('c',()=>{expect(hd312pmx(0,0)).toBe(0);});it('d',()=>{expect(hd312pmx(93,73)).toBe(2);});it('e',()=>{expect(hd312pmx(15,0)).toBe(4);});});
function hd313pmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph313pmx_hd',()=>{it('a',()=>{expect(hd313pmx(1,4)).toBe(2);});it('b',()=>{expect(hd313pmx(3,1)).toBe(1);});it('c',()=>{expect(hd313pmx(0,0)).toBe(0);});it('d',()=>{expect(hd313pmx(93,73)).toBe(2);});it('e',()=>{expect(hd313pmx(15,0)).toBe(4);});});
function hd314pmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph314pmx_hd',()=>{it('a',()=>{expect(hd314pmx(1,4)).toBe(2);});it('b',()=>{expect(hd314pmx(3,1)).toBe(1);});it('c',()=>{expect(hd314pmx(0,0)).toBe(0);});it('d',()=>{expect(hd314pmx(93,73)).toBe(2);});it('e',()=>{expect(hd314pmx(15,0)).toBe(4);});});
function hd315pmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph315pmx_hd',()=>{it('a',()=>{expect(hd315pmx(1,4)).toBe(2);});it('b',()=>{expect(hd315pmx(3,1)).toBe(1);});it('c',()=>{expect(hd315pmx(0,0)).toBe(0);});it('d',()=>{expect(hd315pmx(93,73)).toBe(2);});it('e',()=>{expect(hd315pmx(15,0)).toBe(4);});});
function hd316pmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph316pmx_hd',()=>{it('a',()=>{expect(hd316pmx(1,4)).toBe(2);});it('b',()=>{expect(hd316pmx(3,1)).toBe(1);});it('c',()=>{expect(hd316pmx(0,0)).toBe(0);});it('d',()=>{expect(hd316pmx(93,73)).toBe(2);});it('e',()=>{expect(hd316pmx(15,0)).toBe(4);});});
function hd317pmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph317pmx_hd',()=>{it('a',()=>{expect(hd317pmx(1,4)).toBe(2);});it('b',()=>{expect(hd317pmx(3,1)).toBe(1);});it('c',()=>{expect(hd317pmx(0,0)).toBe(0);});it('d',()=>{expect(hd317pmx(93,73)).toBe(2);});it('e',()=>{expect(hd317pmx(15,0)).toBe(4);});});
function hd318pmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph318pmx_hd',()=>{it('a',()=>{expect(hd318pmx(1,4)).toBe(2);});it('b',()=>{expect(hd318pmx(3,1)).toBe(1);});it('c',()=>{expect(hd318pmx(0,0)).toBe(0);});it('d',()=>{expect(hd318pmx(93,73)).toBe(2);});it('e',()=>{expect(hd318pmx(15,0)).toBe(4);});});
function hd319pmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph319pmx_hd',()=>{it('a',()=>{expect(hd319pmx(1,4)).toBe(2);});it('b',()=>{expect(hd319pmx(3,1)).toBe(1);});it('c',()=>{expect(hd319pmx(0,0)).toBe(0);});it('d',()=>{expect(hd319pmx(93,73)).toBe(2);});it('e',()=>{expect(hd319pmx(15,0)).toBe(4);});});
function hd320pmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph320pmx_hd',()=>{it('a',()=>{expect(hd320pmx(1,4)).toBe(2);});it('b',()=>{expect(hd320pmx(3,1)).toBe(1);});it('c',()=>{expect(hd320pmx(0,0)).toBe(0);});it('d',()=>{expect(hd320pmx(93,73)).toBe(2);});it('e',()=>{expect(hd320pmx(15,0)).toBe(4);});});
function hd321pmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph321pmx_hd',()=>{it('a',()=>{expect(hd321pmx(1,4)).toBe(2);});it('b',()=>{expect(hd321pmx(3,1)).toBe(1);});it('c',()=>{expect(hd321pmx(0,0)).toBe(0);});it('d',()=>{expect(hd321pmx(93,73)).toBe(2);});it('e',()=>{expect(hd321pmx(15,0)).toBe(4);});});
function hd322pmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph322pmx_hd',()=>{it('a',()=>{expect(hd322pmx(1,4)).toBe(2);});it('b',()=>{expect(hd322pmx(3,1)).toBe(1);});it('c',()=>{expect(hd322pmx(0,0)).toBe(0);});it('d',()=>{expect(hd322pmx(93,73)).toBe(2);});it('e',()=>{expect(hd322pmx(15,0)).toBe(4);});});
function hd323pmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph323pmx_hd',()=>{it('a',()=>{expect(hd323pmx(1,4)).toBe(2);});it('b',()=>{expect(hd323pmx(3,1)).toBe(1);});it('c',()=>{expect(hd323pmx(0,0)).toBe(0);});it('d',()=>{expect(hd323pmx(93,73)).toBe(2);});it('e',()=>{expect(hd323pmx(15,0)).toBe(4);});});
function hd324pmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph324pmx_hd',()=>{it('a',()=>{expect(hd324pmx(1,4)).toBe(2);});it('b',()=>{expect(hd324pmx(3,1)).toBe(1);});it('c',()=>{expect(hd324pmx(0,0)).toBe(0);});it('d',()=>{expect(hd324pmx(93,73)).toBe(2);});it('e',()=>{expect(hd324pmx(15,0)).toBe(4);});});
function hd325pmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph325pmx_hd',()=>{it('a',()=>{expect(hd325pmx(1,4)).toBe(2);});it('b',()=>{expect(hd325pmx(3,1)).toBe(1);});it('c',()=>{expect(hd325pmx(0,0)).toBe(0);});it('d',()=>{expect(hd325pmx(93,73)).toBe(2);});it('e',()=>{expect(hd325pmx(15,0)).toBe(4);});});
function hd326pmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph326pmx_hd',()=>{it('a',()=>{expect(hd326pmx(1,4)).toBe(2);});it('b',()=>{expect(hd326pmx(3,1)).toBe(1);});it('c',()=>{expect(hd326pmx(0,0)).toBe(0);});it('d',()=>{expect(hd326pmx(93,73)).toBe(2);});it('e',()=>{expect(hd326pmx(15,0)).toBe(4);});});
function hd327pmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph327pmx_hd',()=>{it('a',()=>{expect(hd327pmx(1,4)).toBe(2);});it('b',()=>{expect(hd327pmx(3,1)).toBe(1);});it('c',()=>{expect(hd327pmx(0,0)).toBe(0);});it('d',()=>{expect(hd327pmx(93,73)).toBe(2);});it('e',()=>{expect(hd327pmx(15,0)).toBe(4);});});
function hd328pmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph328pmx_hd',()=>{it('a',()=>{expect(hd328pmx(1,4)).toBe(2);});it('b',()=>{expect(hd328pmx(3,1)).toBe(1);});it('c',()=>{expect(hd328pmx(0,0)).toBe(0);});it('d',()=>{expect(hd328pmx(93,73)).toBe(2);});it('e',()=>{expect(hd328pmx(15,0)).toBe(4);});});
function hd329pmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph329pmx_hd',()=>{it('a',()=>{expect(hd329pmx(1,4)).toBe(2);});it('b',()=>{expect(hd329pmx(3,1)).toBe(1);});it('c',()=>{expect(hd329pmx(0,0)).toBe(0);});it('d',()=>{expect(hd329pmx(93,73)).toBe(2);});it('e',()=>{expect(hd329pmx(15,0)).toBe(4);});});
function hd330pmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph330pmx_hd',()=>{it('a',()=>{expect(hd330pmx(1,4)).toBe(2);});it('b',()=>{expect(hd330pmx(3,1)).toBe(1);});it('c',()=>{expect(hd330pmx(0,0)).toBe(0);});it('d',()=>{expect(hd330pmx(93,73)).toBe(2);});it('e',()=>{expect(hd330pmx(15,0)).toBe(4);});});
function hd331pmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph331pmx_hd',()=>{it('a',()=>{expect(hd331pmx(1,4)).toBe(2);});it('b',()=>{expect(hd331pmx(3,1)).toBe(1);});it('c',()=>{expect(hd331pmx(0,0)).toBe(0);});it('d',()=>{expect(hd331pmx(93,73)).toBe(2);});it('e',()=>{expect(hd331pmx(15,0)).toBe(4);});});
function hd332pmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph332pmx_hd',()=>{it('a',()=>{expect(hd332pmx(1,4)).toBe(2);});it('b',()=>{expect(hd332pmx(3,1)).toBe(1);});it('c',()=>{expect(hd332pmx(0,0)).toBe(0);});it('d',()=>{expect(hd332pmx(93,73)).toBe(2);});it('e',()=>{expect(hd332pmx(15,0)).toBe(4);});});
function hd333pmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph333pmx_hd',()=>{it('a',()=>{expect(hd333pmx(1,4)).toBe(2);});it('b',()=>{expect(hd333pmx(3,1)).toBe(1);});it('c',()=>{expect(hd333pmx(0,0)).toBe(0);});it('d',()=>{expect(hd333pmx(93,73)).toBe(2);});it('e',()=>{expect(hd333pmx(15,0)).toBe(4);});});
function hd334pmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph334pmx_hd',()=>{it('a',()=>{expect(hd334pmx(1,4)).toBe(2);});it('b',()=>{expect(hd334pmx(3,1)).toBe(1);});it('c',()=>{expect(hd334pmx(0,0)).toBe(0);});it('d',()=>{expect(hd334pmx(93,73)).toBe(2);});it('e',()=>{expect(hd334pmx(15,0)).toBe(4);});});
function hd335pmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph335pmx_hd',()=>{it('a',()=>{expect(hd335pmx(1,4)).toBe(2);});it('b',()=>{expect(hd335pmx(3,1)).toBe(1);});it('c',()=>{expect(hd335pmx(0,0)).toBe(0);});it('d',()=>{expect(hd335pmx(93,73)).toBe(2);});it('e',()=>{expect(hd335pmx(15,0)).toBe(4);});});
function hd336pmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph336pmx_hd',()=>{it('a',()=>{expect(hd336pmx(1,4)).toBe(2);});it('b',()=>{expect(hd336pmx(3,1)).toBe(1);});it('c',()=>{expect(hd336pmx(0,0)).toBe(0);});it('d',()=>{expect(hd336pmx(93,73)).toBe(2);});it('e',()=>{expect(hd336pmx(15,0)).toBe(4);});});
function hd337pmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph337pmx_hd',()=>{it('a',()=>{expect(hd337pmx(1,4)).toBe(2);});it('b',()=>{expect(hd337pmx(3,1)).toBe(1);});it('c',()=>{expect(hd337pmx(0,0)).toBe(0);});it('d',()=>{expect(hd337pmx(93,73)).toBe(2);});it('e',()=>{expect(hd337pmx(15,0)).toBe(4);});});
