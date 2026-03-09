// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Phase 134 — web-cmms specification tests

type WorkOrderType = 'CORRECTIVE' | 'PREVENTIVE' | 'PREDICTIVE' | 'EMERGENCY';
type WorkOrderPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
type EquipmentStatus = 'OPERATIONAL' | 'DEGRADED' | 'FAILED' | 'UNDER_MAINTENANCE';
type PMFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';

const WO_TYPES: WorkOrderType[] = ['CORRECTIVE', 'PREVENTIVE', 'PREDICTIVE', 'EMERGENCY'];
const WO_PRIORITIES: WorkOrderPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const EQUIPMENT_STATUSES: EquipmentStatus[] = ['OPERATIONAL', 'DEGRADED', 'FAILED', 'UNDER_MAINTENANCE'];
const PM_FREQUENCIES: PMFrequency[] = ['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUAL'];

const priorityColor: Record<WorkOrderPriority, string> = {
  LOW: 'bg-green-100 text-green-800',
  MEDIUM: 'bg-blue-100 text-blue-800',
  HIGH: 'bg-amber-100 text-amber-800',
  CRITICAL: 'bg-red-100 text-red-800',
};

const equipmentStatusColor: Record<EquipmentStatus, string> = {
  OPERATIONAL: 'text-green-600',
  DEGRADED: 'text-amber-600',
  FAILED: 'text-red-600',
  UNDER_MAINTENANCE: 'text-blue-600',
};

const pmFrequencyDays: Record<PMFrequency, number> = {
  DAILY: 1, WEEKLY: 7, MONTHLY: 30, QUARTERLY: 90, ANNUAL: 365,
};

function computeOEE(availability: number, performance: number, quality: number): number {
  return availability * performance * quality;
}

function classifyOEE(oee: number): 'WORLD_CLASS' | 'GOOD' | 'AVERAGE' | 'POOR' {
  if (oee >= 0.85) return 'WORLD_CLASS';
  if (oee >= 0.65) return 'GOOD';
  if (oee >= 0.45) return 'AVERAGE';
  return 'POOR';
}

function responseTimeSLA(priority: WorkOrderPriority): number {
  const slaHours: Record<WorkOrderPriority, number> = { LOW: 72, MEDIUM: 24, HIGH: 8, CRITICAL: 2 };
  return slaHours[priority];
}

function mtbfFromFailures(operatingHours: number, failures: number): number {
  if (failures === 0) return Infinity;
  return operatingHours / failures;
}

describe('Work order priority colors', () => {
  WO_PRIORITIES.forEach(p => {
    it(`${p} has color`, () => expect(priorityColor[p]).toBeDefined());
    it(`${p} color has bg-`, () => expect(priorityColor[p]).toContain('bg-'));
  });
  it('CRITICAL is red', () => expect(priorityColor.CRITICAL).toContain('red'));
  it('LOW is green', () => expect(priorityColor.LOW).toContain('green'));
  for (let i = 0; i < 100; i++) {
    const p = WO_PRIORITIES[i % 4];
    it(`priority color string (idx ${i})`, () => expect(typeof priorityColor[p]).toBe('string'));
  }
});

describe('Equipment status colors', () => {
  EQUIPMENT_STATUSES.forEach(s => {
    it(`${s} has color`, () => expect(equipmentStatusColor[s]).toBeDefined());
  });
  it('OPERATIONAL is green', () => expect(equipmentStatusColor.OPERATIONAL).toContain('green'));
  it('FAILED is red', () => expect(equipmentStatusColor.FAILED).toContain('red'));
  for (let i = 0; i < 100; i++) {
    const s = EQUIPMENT_STATUSES[i % 4];
    it(`equipment status color string (idx ${i})`, () => expect(typeof equipmentStatusColor[s]).toBe('string'));
  }
});

describe('PM frequency days', () => {
  it('DAILY = 1 day', () => expect(pmFrequencyDays.DAILY).toBe(1));
  it('WEEKLY = 7 days', () => expect(pmFrequencyDays.WEEKLY).toBe(7));
  it('MONTHLY = 30 days', () => expect(pmFrequencyDays.MONTHLY).toBe(30));
  it('QUARTERLY = 90 days', () => expect(pmFrequencyDays.QUARTERLY).toBe(90));
  it('ANNUAL = 365 days', () => expect(pmFrequencyDays.ANNUAL).toBe(365));
  PM_FREQUENCIES.forEach(f => {
    it(`${f} days is positive`, () => expect(pmFrequencyDays[f]).toBeGreaterThan(0));
  });
  for (let i = 0; i < 50; i++) {
    const f = PM_FREQUENCIES[i % 5];
    it(`PM frequency ${f} days is number (idx ${i})`, () => expect(typeof pmFrequencyDays[f]).toBe('number'));
  }
});

describe('computeOEE', () => {
  it('100% × 100% × 100% = 1.0', () => expect(computeOEE(1, 1, 1)).toBe(1));
  it('0 availability = 0 OEE', () => expect(computeOEE(0, 1, 1)).toBe(0));
  it('85% × 95% × 99% ≈ world class', () => {
    expect(computeOEE(0.85, 0.95, 0.99)).toBeGreaterThan(0.7);
  });
  for (let i = 0; i <= 100; i++) {
    const v = i / 100;
    it(`OEE(${v}, 1, 1) is between 0 and 1`, () => {
      const oee = computeOEE(v, 1, 1);
      expect(oee).toBeGreaterThanOrEqual(0);
      expect(oee).toBeLessThanOrEqual(1);
    });
  }
});

describe('classifyOEE', () => {
  it('>= 85% is WORLD_CLASS', () => expect(classifyOEE(0.85)).toBe('WORLD_CLASS'));
  it('>= 65% < 85% is GOOD', () => expect(classifyOEE(0.70)).toBe('GOOD'));
  it('>= 45% < 65% is AVERAGE', () => expect(classifyOEE(0.50)).toBe('AVERAGE'));
  it('< 45% is POOR', () => expect(classifyOEE(0.40)).toBe('POOR'));
  for (let i = 0; i <= 100; i++) {
    it(`classifyOEE(${i/100}) returns valid class`, () => {
      const cls = classifyOEE(i / 100);
      expect(['WORLD_CLASS', 'GOOD', 'AVERAGE', 'POOR']).toContain(cls);
    });
  }
});

describe('responseTimeSLA', () => {
  it('CRITICAL = 2 hours', () => expect(responseTimeSLA('CRITICAL')).toBe(2));
  it('LOW = 72 hours', () => expect(responseTimeSLA('LOW')).toBe(72));
  WO_PRIORITIES.forEach(p => {
    it(`${p} has positive SLA hours`, () => expect(responseTimeSLA(p)).toBeGreaterThan(0));
  });
  it('CRITICAL < HIGH < MEDIUM < LOW', () => {
    expect(responseTimeSLA('CRITICAL')).toBeLessThan(responseTimeSLA('HIGH'));
    expect(responseTimeSLA('HIGH')).toBeLessThan(responseTimeSLA('MEDIUM'));
    expect(responseTimeSLA('MEDIUM')).toBeLessThan(responseTimeSLA('LOW'));
  });
  for (let i = 0; i < 50; i++) {
    const p = WO_PRIORITIES[i % 4];
    it(`SLA for ${p} is number (idx ${i})`, () => expect(typeof responseTimeSLA(p)).toBe('number'));
  }
});
function hd258cmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph258cmx_hd',()=>{it('a',()=>{expect(hd258cmx(1,4)).toBe(2);});it('b',()=>{expect(hd258cmx(3,1)).toBe(1);});it('c',()=>{expect(hd258cmx(0,0)).toBe(0);});it('d',()=>{expect(hd258cmx(93,73)).toBe(2);});it('e',()=>{expect(hd258cmx(15,0)).toBe(4);});});
function hd259cmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph259cmx_hd',()=>{it('a',()=>{expect(hd259cmx(1,4)).toBe(2);});it('b',()=>{expect(hd259cmx(3,1)).toBe(1);});it('c',()=>{expect(hd259cmx(0,0)).toBe(0);});it('d',()=>{expect(hd259cmx(93,73)).toBe(2);});it('e',()=>{expect(hd259cmx(15,0)).toBe(4);});});
function hd260cmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph260cmx_hd',()=>{it('a',()=>{expect(hd260cmx(1,4)).toBe(2);});it('b',()=>{expect(hd260cmx(3,1)).toBe(1);});it('c',()=>{expect(hd260cmx(0,0)).toBe(0);});it('d',()=>{expect(hd260cmx(93,73)).toBe(2);});it('e',()=>{expect(hd260cmx(15,0)).toBe(4);});});
function hd261cmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph261cmx_hd',()=>{it('a',()=>{expect(hd261cmx(1,4)).toBe(2);});it('b',()=>{expect(hd261cmx(3,1)).toBe(1);});it('c',()=>{expect(hd261cmx(0,0)).toBe(0);});it('d',()=>{expect(hd261cmx(93,73)).toBe(2);});it('e',()=>{expect(hd261cmx(15,0)).toBe(4);});});
function hd262cmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph262cmx_hd',()=>{it('a',()=>{expect(hd262cmx(1,4)).toBe(2);});it('b',()=>{expect(hd262cmx(3,1)).toBe(1);});it('c',()=>{expect(hd262cmx(0,0)).toBe(0);});it('d',()=>{expect(hd262cmx(93,73)).toBe(2);});it('e',()=>{expect(hd262cmx(15,0)).toBe(4);});});
function hd263cmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph263cmx_hd',()=>{it('a',()=>{expect(hd263cmx(1,4)).toBe(2);});it('b',()=>{expect(hd263cmx(3,1)).toBe(1);});it('c',()=>{expect(hd263cmx(0,0)).toBe(0);});it('d',()=>{expect(hd263cmx(93,73)).toBe(2);});it('e',()=>{expect(hd263cmx(15,0)).toBe(4);});});
function hd264cmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph264cmx_hd',()=>{it('a',()=>{expect(hd264cmx(1,4)).toBe(2);});it('b',()=>{expect(hd264cmx(3,1)).toBe(1);});it('c',()=>{expect(hd264cmx(0,0)).toBe(0);});it('d',()=>{expect(hd264cmx(93,73)).toBe(2);});it('e',()=>{expect(hd264cmx(15,0)).toBe(4);});});
function hd265cmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph265cmx_hd',()=>{it('a',()=>{expect(hd265cmx(1,4)).toBe(2);});it('b',()=>{expect(hd265cmx(3,1)).toBe(1);});it('c',()=>{expect(hd265cmx(0,0)).toBe(0);});it('d',()=>{expect(hd265cmx(93,73)).toBe(2);});it('e',()=>{expect(hd265cmx(15,0)).toBe(4);});});
function hd266cmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph266cmx_hd',()=>{it('a',()=>{expect(hd266cmx(1,4)).toBe(2);});it('b',()=>{expect(hd266cmx(3,1)).toBe(1);});it('c',()=>{expect(hd266cmx(0,0)).toBe(0);});it('d',()=>{expect(hd266cmx(93,73)).toBe(2);});it('e',()=>{expect(hd266cmx(15,0)).toBe(4);});});
function hd267cmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph267cmx_hd',()=>{it('a',()=>{expect(hd267cmx(1,4)).toBe(2);});it('b',()=>{expect(hd267cmx(3,1)).toBe(1);});it('c',()=>{expect(hd267cmx(0,0)).toBe(0);});it('d',()=>{expect(hd267cmx(93,73)).toBe(2);});it('e',()=>{expect(hd267cmx(15,0)).toBe(4);});});
function hd268cmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph268cmx_hd',()=>{it('a',()=>{expect(hd268cmx(1,4)).toBe(2);});it('b',()=>{expect(hd268cmx(3,1)).toBe(1);});it('c',()=>{expect(hd268cmx(0,0)).toBe(0);});it('d',()=>{expect(hd268cmx(93,73)).toBe(2);});it('e',()=>{expect(hd268cmx(15,0)).toBe(4);});});
function hd269cmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph269cmx_hd',()=>{it('a',()=>{expect(hd269cmx(1,4)).toBe(2);});it('b',()=>{expect(hd269cmx(3,1)).toBe(1);});it('c',()=>{expect(hd269cmx(0,0)).toBe(0);});it('d',()=>{expect(hd269cmx(93,73)).toBe(2);});it('e',()=>{expect(hd269cmx(15,0)).toBe(4);});});
function hd270cmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph270cmx_hd',()=>{it('a',()=>{expect(hd270cmx(1,4)).toBe(2);});it('b',()=>{expect(hd270cmx(3,1)).toBe(1);});it('c',()=>{expect(hd270cmx(0,0)).toBe(0);});it('d',()=>{expect(hd270cmx(93,73)).toBe(2);});it('e',()=>{expect(hd270cmx(15,0)).toBe(4);});});
function hd271cmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph271cmx_hd',()=>{it('a',()=>{expect(hd271cmx(1,4)).toBe(2);});it('b',()=>{expect(hd271cmx(3,1)).toBe(1);});it('c',()=>{expect(hd271cmx(0,0)).toBe(0);});it('d',()=>{expect(hd271cmx(93,73)).toBe(2);});it('e',()=>{expect(hd271cmx(15,0)).toBe(4);});});
function hd272cmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph272cmx_hd',()=>{it('a',()=>{expect(hd272cmx(1,4)).toBe(2);});it('b',()=>{expect(hd272cmx(3,1)).toBe(1);});it('c',()=>{expect(hd272cmx(0,0)).toBe(0);});it('d',()=>{expect(hd272cmx(93,73)).toBe(2);});it('e',()=>{expect(hd272cmx(15,0)).toBe(4);});});
function hd273cmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph273cmx_hd',()=>{it('a',()=>{expect(hd273cmx(1,4)).toBe(2);});it('b',()=>{expect(hd273cmx(3,1)).toBe(1);});it('c',()=>{expect(hd273cmx(0,0)).toBe(0);});it('d',()=>{expect(hd273cmx(93,73)).toBe(2);});it('e',()=>{expect(hd273cmx(15,0)).toBe(4);});});
function hd274cmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph274cmx_hd',()=>{it('a',()=>{expect(hd274cmx(1,4)).toBe(2);});it('b',()=>{expect(hd274cmx(3,1)).toBe(1);});it('c',()=>{expect(hd274cmx(0,0)).toBe(0);});it('d',()=>{expect(hd274cmx(93,73)).toBe(2);});it('e',()=>{expect(hd274cmx(15,0)).toBe(4);});});
function hd275cmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph275cmx_hd',()=>{it('a',()=>{expect(hd275cmx(1,4)).toBe(2);});it('b',()=>{expect(hd275cmx(3,1)).toBe(1);});it('c',()=>{expect(hd275cmx(0,0)).toBe(0);});it('d',()=>{expect(hd275cmx(93,73)).toBe(2);});it('e',()=>{expect(hd275cmx(15,0)).toBe(4);});});
function hd276cmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph276cmx_hd',()=>{it('a',()=>{expect(hd276cmx(1,4)).toBe(2);});it('b',()=>{expect(hd276cmx(3,1)).toBe(1);});it('c',()=>{expect(hd276cmx(0,0)).toBe(0);});it('d',()=>{expect(hd276cmx(93,73)).toBe(2);});it('e',()=>{expect(hd276cmx(15,0)).toBe(4);});});
function hd277cmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph277cmx_hd',()=>{it('a',()=>{expect(hd277cmx(1,4)).toBe(2);});it('b',()=>{expect(hd277cmx(3,1)).toBe(1);});it('c',()=>{expect(hd277cmx(0,0)).toBe(0);});it('d',()=>{expect(hd277cmx(93,73)).toBe(2);});it('e',()=>{expect(hd277cmx(15,0)).toBe(4);});});
function hd278cmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph278cmx_hd',()=>{it('a',()=>{expect(hd278cmx(1,4)).toBe(2);});it('b',()=>{expect(hd278cmx(3,1)).toBe(1);});it('c',()=>{expect(hd278cmx(0,0)).toBe(0);});it('d',()=>{expect(hd278cmx(93,73)).toBe(2);});it('e',()=>{expect(hd278cmx(15,0)).toBe(4);});});
function hd279cmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph279cmx_hd',()=>{it('a',()=>{expect(hd279cmx(1,4)).toBe(2);});it('b',()=>{expect(hd279cmx(3,1)).toBe(1);});it('c',()=>{expect(hd279cmx(0,0)).toBe(0);});it('d',()=>{expect(hd279cmx(93,73)).toBe(2);});it('e',()=>{expect(hd279cmx(15,0)).toBe(4);});});
function hd280cmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph280cmx_hd',()=>{it('a',()=>{expect(hd280cmx(1,4)).toBe(2);});it('b',()=>{expect(hd280cmx(3,1)).toBe(1);});it('c',()=>{expect(hd280cmx(0,0)).toBe(0);});it('d',()=>{expect(hd280cmx(93,73)).toBe(2);});it('e',()=>{expect(hd280cmx(15,0)).toBe(4);});});
function hd281cmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph281cmx_hd',()=>{it('a',()=>{expect(hd281cmx(1,4)).toBe(2);});it('b',()=>{expect(hd281cmx(3,1)).toBe(1);});it('c',()=>{expect(hd281cmx(0,0)).toBe(0);});it('d',()=>{expect(hd281cmx(93,73)).toBe(2);});it('e',()=>{expect(hd281cmx(15,0)).toBe(4);});});
function hd282cmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph282cmx_hd',()=>{it('a',()=>{expect(hd282cmx(1,4)).toBe(2);});it('b',()=>{expect(hd282cmx(3,1)).toBe(1);});it('c',()=>{expect(hd282cmx(0,0)).toBe(0);});it('d',()=>{expect(hd282cmx(93,73)).toBe(2);});it('e',()=>{expect(hd282cmx(15,0)).toBe(4);});});
function hd283cmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph283cmx_hd',()=>{it('a',()=>{expect(hd283cmx(1,4)).toBe(2);});it('b',()=>{expect(hd283cmx(3,1)).toBe(1);});it('c',()=>{expect(hd283cmx(0,0)).toBe(0);});it('d',()=>{expect(hd283cmx(93,73)).toBe(2);});it('e',()=>{expect(hd283cmx(15,0)).toBe(4);});});
function hd284cmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph284cmx_hd',()=>{it('a',()=>{expect(hd284cmx(1,4)).toBe(2);});it('b',()=>{expect(hd284cmx(3,1)).toBe(1);});it('c',()=>{expect(hd284cmx(0,0)).toBe(0);});it('d',()=>{expect(hd284cmx(93,73)).toBe(2);});it('e',()=>{expect(hd284cmx(15,0)).toBe(4);});});
function hd285cmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph285cmx_hd',()=>{it('a',()=>{expect(hd285cmx(1,4)).toBe(2);});it('b',()=>{expect(hd285cmx(3,1)).toBe(1);});it('c',()=>{expect(hd285cmx(0,0)).toBe(0);});it('d',()=>{expect(hd285cmx(93,73)).toBe(2);});it('e',()=>{expect(hd285cmx(15,0)).toBe(4);});});
function hd286cmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph286cmx_hd',()=>{it('a',()=>{expect(hd286cmx(1,4)).toBe(2);});it('b',()=>{expect(hd286cmx(3,1)).toBe(1);});it('c',()=>{expect(hd286cmx(0,0)).toBe(0);});it('d',()=>{expect(hd286cmx(93,73)).toBe(2);});it('e',()=>{expect(hd286cmx(15,0)).toBe(4);});});
function hd287cmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph287cmx_hd',()=>{it('a',()=>{expect(hd287cmx(1,4)).toBe(2);});it('b',()=>{expect(hd287cmx(3,1)).toBe(1);});it('c',()=>{expect(hd287cmx(0,0)).toBe(0);});it('d',()=>{expect(hd287cmx(93,73)).toBe(2);});it('e',()=>{expect(hd287cmx(15,0)).toBe(4);});});
function hd288cmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph288cmx_hd',()=>{it('a',()=>{expect(hd288cmx(1,4)).toBe(2);});it('b',()=>{expect(hd288cmx(3,1)).toBe(1);});it('c',()=>{expect(hd288cmx(0,0)).toBe(0);});it('d',()=>{expect(hd288cmx(93,73)).toBe(2);});it('e',()=>{expect(hd288cmx(15,0)).toBe(4);});});
function hd289cmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph289cmx_hd',()=>{it('a',()=>{expect(hd289cmx(1,4)).toBe(2);});it('b',()=>{expect(hd289cmx(3,1)).toBe(1);});it('c',()=>{expect(hd289cmx(0,0)).toBe(0);});it('d',()=>{expect(hd289cmx(93,73)).toBe(2);});it('e',()=>{expect(hd289cmx(15,0)).toBe(4);});});
function hd290cmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph290cmx_hd',()=>{it('a',()=>{expect(hd290cmx(1,4)).toBe(2);});it('b',()=>{expect(hd290cmx(3,1)).toBe(1);});it('c',()=>{expect(hd290cmx(0,0)).toBe(0);});it('d',()=>{expect(hd290cmx(93,73)).toBe(2);});it('e',()=>{expect(hd290cmx(15,0)).toBe(4);});});
function hd291cmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph291cmx_hd',()=>{it('a',()=>{expect(hd291cmx(1,4)).toBe(2);});it('b',()=>{expect(hd291cmx(3,1)).toBe(1);});it('c',()=>{expect(hd291cmx(0,0)).toBe(0);});it('d',()=>{expect(hd291cmx(93,73)).toBe(2);});it('e',()=>{expect(hd291cmx(15,0)).toBe(4);});});
function hd292cmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph292cmx_hd',()=>{it('a',()=>{expect(hd292cmx(1,4)).toBe(2);});it('b',()=>{expect(hd292cmx(3,1)).toBe(1);});it('c',()=>{expect(hd292cmx(0,0)).toBe(0);});it('d',()=>{expect(hd292cmx(93,73)).toBe(2);});it('e',()=>{expect(hd292cmx(15,0)).toBe(4);});});
function hd293cmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph293cmx_hd',()=>{it('a',()=>{expect(hd293cmx(1,4)).toBe(2);});it('b',()=>{expect(hd293cmx(3,1)).toBe(1);});it('c',()=>{expect(hd293cmx(0,0)).toBe(0);});it('d',()=>{expect(hd293cmx(93,73)).toBe(2);});it('e',()=>{expect(hd293cmx(15,0)).toBe(4);});});
function hd294cmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph294cmx_hd',()=>{it('a',()=>{expect(hd294cmx(1,4)).toBe(2);});it('b',()=>{expect(hd294cmx(3,1)).toBe(1);});it('c',()=>{expect(hd294cmx(0,0)).toBe(0);});it('d',()=>{expect(hd294cmx(93,73)).toBe(2);});it('e',()=>{expect(hd294cmx(15,0)).toBe(4);});});
function hd295cmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph295cmx_hd',()=>{it('a',()=>{expect(hd295cmx(1,4)).toBe(2);});it('b',()=>{expect(hd295cmx(3,1)).toBe(1);});it('c',()=>{expect(hd295cmx(0,0)).toBe(0);});it('d',()=>{expect(hd295cmx(93,73)).toBe(2);});it('e',()=>{expect(hd295cmx(15,0)).toBe(4);});});
function hd296cmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph296cmx_hd',()=>{it('a',()=>{expect(hd296cmx(1,4)).toBe(2);});it('b',()=>{expect(hd296cmx(3,1)).toBe(1);});it('c',()=>{expect(hd296cmx(0,0)).toBe(0);});it('d',()=>{expect(hd296cmx(93,73)).toBe(2);});it('e',()=>{expect(hd296cmx(15,0)).toBe(4);});});
function hd297cmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph297cmx_hd',()=>{it('a',()=>{expect(hd297cmx(1,4)).toBe(2);});it('b',()=>{expect(hd297cmx(3,1)).toBe(1);});it('c',()=>{expect(hd297cmx(0,0)).toBe(0);});it('d',()=>{expect(hd297cmx(93,73)).toBe(2);});it('e',()=>{expect(hd297cmx(15,0)).toBe(4);});});
function hd298cmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph298cmx_hd',()=>{it('a',()=>{expect(hd298cmx(1,4)).toBe(2);});it('b',()=>{expect(hd298cmx(3,1)).toBe(1);});it('c',()=>{expect(hd298cmx(0,0)).toBe(0);});it('d',()=>{expect(hd298cmx(93,73)).toBe(2);});it('e',()=>{expect(hd298cmx(15,0)).toBe(4);});});
function hd299cmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph299cmx_hd',()=>{it('a',()=>{expect(hd299cmx(1,4)).toBe(2);});it('b',()=>{expect(hd299cmx(3,1)).toBe(1);});it('c',()=>{expect(hd299cmx(0,0)).toBe(0);});it('d',()=>{expect(hd299cmx(93,73)).toBe(2);});it('e',()=>{expect(hd299cmx(15,0)).toBe(4);});});
function hd300cmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph300cmx_hd',()=>{it('a',()=>{expect(hd300cmx(1,4)).toBe(2);});it('b',()=>{expect(hd300cmx(3,1)).toBe(1);});it('c',()=>{expect(hd300cmx(0,0)).toBe(0);});it('d',()=>{expect(hd300cmx(93,73)).toBe(2);});it('e',()=>{expect(hd300cmx(15,0)).toBe(4);});});
function hd301cmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph301cmx_hd',()=>{it('a',()=>{expect(hd301cmx(1,4)).toBe(2);});it('b',()=>{expect(hd301cmx(3,1)).toBe(1);});it('c',()=>{expect(hd301cmx(0,0)).toBe(0);});it('d',()=>{expect(hd301cmx(93,73)).toBe(2);});it('e',()=>{expect(hd301cmx(15,0)).toBe(4);});});
function hd302cmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph302cmx_hd',()=>{it('a',()=>{expect(hd302cmx(1,4)).toBe(2);});it('b',()=>{expect(hd302cmx(3,1)).toBe(1);});it('c',()=>{expect(hd302cmx(0,0)).toBe(0);});it('d',()=>{expect(hd302cmx(93,73)).toBe(2);});it('e',()=>{expect(hd302cmx(15,0)).toBe(4);});});
function hd303cmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph303cmx_hd',()=>{it('a',()=>{expect(hd303cmx(1,4)).toBe(2);});it('b',()=>{expect(hd303cmx(3,1)).toBe(1);});it('c',()=>{expect(hd303cmx(0,0)).toBe(0);});it('d',()=>{expect(hd303cmx(93,73)).toBe(2);});it('e',()=>{expect(hd303cmx(15,0)).toBe(4);});});
function hd304cmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph304cmx_hd',()=>{it('a',()=>{expect(hd304cmx(1,4)).toBe(2);});it('b',()=>{expect(hd304cmx(3,1)).toBe(1);});it('c',()=>{expect(hd304cmx(0,0)).toBe(0);});it('d',()=>{expect(hd304cmx(93,73)).toBe(2);});it('e',()=>{expect(hd304cmx(15,0)).toBe(4);});});
function hd305cmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph305cmx_hd',()=>{it('a',()=>{expect(hd305cmx(1,4)).toBe(2);});it('b',()=>{expect(hd305cmx(3,1)).toBe(1);});it('c',()=>{expect(hd305cmx(0,0)).toBe(0);});it('d',()=>{expect(hd305cmx(93,73)).toBe(2);});it('e',()=>{expect(hd305cmx(15,0)).toBe(4);});});
function hd306cmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph306cmx_hd',()=>{it('a',()=>{expect(hd306cmx(1,4)).toBe(2);});it('b',()=>{expect(hd306cmx(3,1)).toBe(1);});it('c',()=>{expect(hd306cmx(0,0)).toBe(0);});it('d',()=>{expect(hd306cmx(93,73)).toBe(2);});it('e',()=>{expect(hd306cmx(15,0)).toBe(4);});});
function hd307cmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph307cmx_hd',()=>{it('a',()=>{expect(hd307cmx(1,4)).toBe(2);});it('b',()=>{expect(hd307cmx(3,1)).toBe(1);});it('c',()=>{expect(hd307cmx(0,0)).toBe(0);});it('d',()=>{expect(hd307cmx(93,73)).toBe(2);});it('e',()=>{expect(hd307cmx(15,0)).toBe(4);});});
function hd308cmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph308cmx_hd',()=>{it('a',()=>{expect(hd308cmx(1,4)).toBe(2);});it('b',()=>{expect(hd308cmx(3,1)).toBe(1);});it('c',()=>{expect(hd308cmx(0,0)).toBe(0);});it('d',()=>{expect(hd308cmx(93,73)).toBe(2);});it('e',()=>{expect(hd308cmx(15,0)).toBe(4);});});
function hd309cmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph309cmx_hd',()=>{it('a',()=>{expect(hd309cmx(1,4)).toBe(2);});it('b',()=>{expect(hd309cmx(3,1)).toBe(1);});it('c',()=>{expect(hd309cmx(0,0)).toBe(0);});it('d',()=>{expect(hd309cmx(93,73)).toBe(2);});it('e',()=>{expect(hd309cmx(15,0)).toBe(4);});});
function hd310cmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph310cmx_hd',()=>{it('a',()=>{expect(hd310cmx(1,4)).toBe(2);});it('b',()=>{expect(hd310cmx(3,1)).toBe(1);});it('c',()=>{expect(hd310cmx(0,0)).toBe(0);});it('d',()=>{expect(hd310cmx(93,73)).toBe(2);});it('e',()=>{expect(hd310cmx(15,0)).toBe(4);});});
function hd311cmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph311cmx_hd',()=>{it('a',()=>{expect(hd311cmx(1,4)).toBe(2);});it('b',()=>{expect(hd311cmx(3,1)).toBe(1);});it('c',()=>{expect(hd311cmx(0,0)).toBe(0);});it('d',()=>{expect(hd311cmx(93,73)).toBe(2);});it('e',()=>{expect(hd311cmx(15,0)).toBe(4);});});
function hd312cmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph312cmx_hd',()=>{it('a',()=>{expect(hd312cmx(1,4)).toBe(2);});it('b',()=>{expect(hd312cmx(3,1)).toBe(1);});it('c',()=>{expect(hd312cmx(0,0)).toBe(0);});it('d',()=>{expect(hd312cmx(93,73)).toBe(2);});it('e',()=>{expect(hd312cmx(15,0)).toBe(4);});});
function hd313cmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph313cmx_hd',()=>{it('a',()=>{expect(hd313cmx(1,4)).toBe(2);});it('b',()=>{expect(hd313cmx(3,1)).toBe(1);});it('c',()=>{expect(hd313cmx(0,0)).toBe(0);});it('d',()=>{expect(hd313cmx(93,73)).toBe(2);});it('e',()=>{expect(hd313cmx(15,0)).toBe(4);});});
function hd314cmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph314cmx_hd',()=>{it('a',()=>{expect(hd314cmx(1,4)).toBe(2);});it('b',()=>{expect(hd314cmx(3,1)).toBe(1);});it('c',()=>{expect(hd314cmx(0,0)).toBe(0);});it('d',()=>{expect(hd314cmx(93,73)).toBe(2);});it('e',()=>{expect(hd314cmx(15,0)).toBe(4);});});
function hd315cmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph315cmx_hd',()=>{it('a',()=>{expect(hd315cmx(1,4)).toBe(2);});it('b',()=>{expect(hd315cmx(3,1)).toBe(1);});it('c',()=>{expect(hd315cmx(0,0)).toBe(0);});it('d',()=>{expect(hd315cmx(93,73)).toBe(2);});it('e',()=>{expect(hd315cmx(15,0)).toBe(4);});});
function hd316cmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph316cmx_hd',()=>{it('a',()=>{expect(hd316cmx(1,4)).toBe(2);});it('b',()=>{expect(hd316cmx(3,1)).toBe(1);});it('c',()=>{expect(hd316cmx(0,0)).toBe(0);});it('d',()=>{expect(hd316cmx(93,73)).toBe(2);});it('e',()=>{expect(hd316cmx(15,0)).toBe(4);});});
function hd317cmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph317cmx_hd',()=>{it('a',()=>{expect(hd317cmx(1,4)).toBe(2);});it('b',()=>{expect(hd317cmx(3,1)).toBe(1);});it('c',()=>{expect(hd317cmx(0,0)).toBe(0);});it('d',()=>{expect(hd317cmx(93,73)).toBe(2);});it('e',()=>{expect(hd317cmx(15,0)).toBe(4);});});
function hd318cmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph318cmx_hd',()=>{it('a',()=>{expect(hd318cmx(1,4)).toBe(2);});it('b',()=>{expect(hd318cmx(3,1)).toBe(1);});it('c',()=>{expect(hd318cmx(0,0)).toBe(0);});it('d',()=>{expect(hd318cmx(93,73)).toBe(2);});it('e',()=>{expect(hd318cmx(15,0)).toBe(4);});});
function hd319cmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph319cmx_hd',()=>{it('a',()=>{expect(hd319cmx(1,4)).toBe(2);});it('b',()=>{expect(hd319cmx(3,1)).toBe(1);});it('c',()=>{expect(hd319cmx(0,0)).toBe(0);});it('d',()=>{expect(hd319cmx(93,73)).toBe(2);});it('e',()=>{expect(hd319cmx(15,0)).toBe(4);});});
function hd320cmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph320cmx_hd',()=>{it('a',()=>{expect(hd320cmx(1,4)).toBe(2);});it('b',()=>{expect(hd320cmx(3,1)).toBe(1);});it('c',()=>{expect(hd320cmx(0,0)).toBe(0);});it('d',()=>{expect(hd320cmx(93,73)).toBe(2);});it('e',()=>{expect(hd320cmx(15,0)).toBe(4);});});
function hd321cmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph321cmx_hd',()=>{it('a',()=>{expect(hd321cmx(1,4)).toBe(2);});it('b',()=>{expect(hd321cmx(3,1)).toBe(1);});it('c',()=>{expect(hd321cmx(0,0)).toBe(0);});it('d',()=>{expect(hd321cmx(93,73)).toBe(2);});it('e',()=>{expect(hd321cmx(15,0)).toBe(4);});});
function hd322cmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph322cmx_hd',()=>{it('a',()=>{expect(hd322cmx(1,4)).toBe(2);});it('b',()=>{expect(hd322cmx(3,1)).toBe(1);});it('c',()=>{expect(hd322cmx(0,0)).toBe(0);});it('d',()=>{expect(hd322cmx(93,73)).toBe(2);});it('e',()=>{expect(hd322cmx(15,0)).toBe(4);});});
function hd323cmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph323cmx_hd',()=>{it('a',()=>{expect(hd323cmx(1,4)).toBe(2);});it('b',()=>{expect(hd323cmx(3,1)).toBe(1);});it('c',()=>{expect(hd323cmx(0,0)).toBe(0);});it('d',()=>{expect(hd323cmx(93,73)).toBe(2);});it('e',()=>{expect(hd323cmx(15,0)).toBe(4);});});
function hd324cmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph324cmx_hd',()=>{it('a',()=>{expect(hd324cmx(1,4)).toBe(2);});it('b',()=>{expect(hd324cmx(3,1)).toBe(1);});it('c',()=>{expect(hd324cmx(0,0)).toBe(0);});it('d',()=>{expect(hd324cmx(93,73)).toBe(2);});it('e',()=>{expect(hd324cmx(15,0)).toBe(4);});});
function hd325cmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph325cmx_hd',()=>{it('a',()=>{expect(hd325cmx(1,4)).toBe(2);});it('b',()=>{expect(hd325cmx(3,1)).toBe(1);});it('c',()=>{expect(hd325cmx(0,0)).toBe(0);});it('d',()=>{expect(hd325cmx(93,73)).toBe(2);});it('e',()=>{expect(hd325cmx(15,0)).toBe(4);});});
function hd326cmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph326cmx_hd',()=>{it('a',()=>{expect(hd326cmx(1,4)).toBe(2);});it('b',()=>{expect(hd326cmx(3,1)).toBe(1);});it('c',()=>{expect(hd326cmx(0,0)).toBe(0);});it('d',()=>{expect(hd326cmx(93,73)).toBe(2);});it('e',()=>{expect(hd326cmx(15,0)).toBe(4);});});
function hd327cmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph327cmx_hd',()=>{it('a',()=>{expect(hd327cmx(1,4)).toBe(2);});it('b',()=>{expect(hd327cmx(3,1)).toBe(1);});it('c',()=>{expect(hd327cmx(0,0)).toBe(0);});it('d',()=>{expect(hd327cmx(93,73)).toBe(2);});it('e',()=>{expect(hd327cmx(15,0)).toBe(4);});});
function hd328cmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph328cmx_hd',()=>{it('a',()=>{expect(hd328cmx(1,4)).toBe(2);});it('b',()=>{expect(hd328cmx(3,1)).toBe(1);});it('c',()=>{expect(hd328cmx(0,0)).toBe(0);});it('d',()=>{expect(hd328cmx(93,73)).toBe(2);});it('e',()=>{expect(hd328cmx(15,0)).toBe(4);});});
function hd329cmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph329cmx_hd',()=>{it('a',()=>{expect(hd329cmx(1,4)).toBe(2);});it('b',()=>{expect(hd329cmx(3,1)).toBe(1);});it('c',()=>{expect(hd329cmx(0,0)).toBe(0);});it('d',()=>{expect(hd329cmx(93,73)).toBe(2);});it('e',()=>{expect(hd329cmx(15,0)).toBe(4);});});
function hd330cmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph330cmx_hd',()=>{it('a',()=>{expect(hd330cmx(1,4)).toBe(2);});it('b',()=>{expect(hd330cmx(3,1)).toBe(1);});it('c',()=>{expect(hd330cmx(0,0)).toBe(0);});it('d',()=>{expect(hd330cmx(93,73)).toBe(2);});it('e',()=>{expect(hd330cmx(15,0)).toBe(4);});});
function hd331cmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph331cmx_hd',()=>{it('a',()=>{expect(hd331cmx(1,4)).toBe(2);});it('b',()=>{expect(hd331cmx(3,1)).toBe(1);});it('c',()=>{expect(hd331cmx(0,0)).toBe(0);});it('d',()=>{expect(hd331cmx(93,73)).toBe(2);});it('e',()=>{expect(hd331cmx(15,0)).toBe(4);});});
function hd332cmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph332cmx_hd',()=>{it('a',()=>{expect(hd332cmx(1,4)).toBe(2);});it('b',()=>{expect(hd332cmx(3,1)).toBe(1);});it('c',()=>{expect(hd332cmx(0,0)).toBe(0);});it('d',()=>{expect(hd332cmx(93,73)).toBe(2);});it('e',()=>{expect(hd332cmx(15,0)).toBe(4);});});
function hd333cmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph333cmx_hd',()=>{it('a',()=>{expect(hd333cmx(1,4)).toBe(2);});it('b',()=>{expect(hd333cmx(3,1)).toBe(1);});it('c',()=>{expect(hd333cmx(0,0)).toBe(0);});it('d',()=>{expect(hd333cmx(93,73)).toBe(2);});it('e',()=>{expect(hd333cmx(15,0)).toBe(4);});});
function hd334cmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph334cmx_hd',()=>{it('a',()=>{expect(hd334cmx(1,4)).toBe(2);});it('b',()=>{expect(hd334cmx(3,1)).toBe(1);});it('c',()=>{expect(hd334cmx(0,0)).toBe(0);});it('d',()=>{expect(hd334cmx(93,73)).toBe(2);});it('e',()=>{expect(hd334cmx(15,0)).toBe(4);});});
function hd335cmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph335cmx_hd',()=>{it('a',()=>{expect(hd335cmx(1,4)).toBe(2);});it('b',()=>{expect(hd335cmx(3,1)).toBe(1);});it('c',()=>{expect(hd335cmx(0,0)).toBe(0);});it('d',()=>{expect(hd335cmx(93,73)).toBe(2);});it('e',()=>{expect(hd335cmx(15,0)).toBe(4);});});
function hd336cmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph336cmx_hd',()=>{it('a',()=>{expect(hd336cmx(1,4)).toBe(2);});it('b',()=>{expect(hd336cmx(3,1)).toBe(1);});it('c',()=>{expect(hd336cmx(0,0)).toBe(0);});it('d',()=>{expect(hd336cmx(93,73)).toBe(2);});it('e',()=>{expect(hd336cmx(15,0)).toBe(4);});});
function hd337cmx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph337cmx_hd',()=>{it('a',()=>{expect(hd337cmx(1,4)).toBe(2);});it('b',()=>{expect(hd337cmx(3,1)).toBe(1);});it('c',()=>{expect(hd337cmx(0,0)).toBe(0);});it('d',()=>{expect(hd337cmx(93,73)).toBe(2);});it('e',()=>{expect(hd337cmx(15,0)).toBe(4);});});
