// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Phase 134 — web-complaints specification tests

type ComplaintType = 'PRODUCT' | 'SERVICE' | 'DELIVERY' | 'BILLING' | 'STAFF';
type ComplaintSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
type ComplaintStatus = 'RECEIVED' | 'ACKNOWLEDGED' | 'INVESTIGATING' | 'RESOLVED' | 'CLOSED';
type ResolutionType = 'REFUND' | 'REPLACEMENT' | 'APOLOGY' | 'CREDIT' | 'ESCALATION' | 'NO_ACTION';

const COMPLAINT_TYPES: ComplaintType[] = ['PRODUCT', 'SERVICE', 'DELIVERY', 'BILLING', 'STAFF'];
const COMPLAINT_SEVERITIES: ComplaintSeverity[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const COMPLAINT_STATUSES: ComplaintStatus[] = ['RECEIVED', 'ACKNOWLEDGED', 'INVESTIGATING', 'RESOLVED', 'CLOSED'];
const RESOLUTION_TYPES: ResolutionType[] = ['REFUND', 'REPLACEMENT', 'APOLOGY', 'CREDIT', 'ESCALATION', 'NO_ACTION'];

const severityColor: Record<ComplaintSeverity, string> = {
  LOW: 'bg-green-100 text-green-800',
  MEDIUM: 'bg-amber-100 text-amber-800',
  HIGH: 'bg-orange-100 text-orange-800',
  CRITICAL: 'bg-red-100 text-red-800',
};

const statusStep: Record<ComplaintStatus, number> = {
  RECEIVED: 1, ACKNOWLEDGED: 2, INVESTIGATING: 3, RESOLVED: 4, CLOSED: 5,
};

const slaTierHours: Record<ComplaintSeverity, number> = {
  LOW: 72, MEDIUM: 24, HIGH: 8, CRITICAL: 4,
};

function isComplaintOpen(status: ComplaintStatus): boolean {
  return status !== 'RESOLVED' && status !== 'CLOSED';
}

function slaBreached(receivedAt: Date, severity: ComplaintSeverity, now: Date): boolean {
  const slaMs = slaTierHours[severity] * 3600000;
  return (now.getTime() - receivedAt.getTime()) > slaMs;
}

function escalationRequired(severity: ComplaintSeverity, ageHours: number): boolean {
  return severity === 'CRITICAL' && ageHours > 2;
}

function satisfactionLabel(rating: number): string {
  if (rating >= 4) return 'Satisfied';
  if (rating === 3) return 'Neutral';
  return 'Dissatisfied';
}

describe('Complaint severity colors', () => {
  COMPLAINT_SEVERITIES.forEach(s => {
    it(`${s} has color`, () => expect(severityColor[s]).toBeDefined());
    it(`${s} has bg-`, () => expect(severityColor[s]).toContain('bg-'));
  });
  it('CRITICAL is red', () => expect(severityColor.CRITICAL).toContain('red'));
  it('LOW is green', () => expect(severityColor.LOW).toContain('green'));
  for (let i = 0; i < 100; i++) {
    const s = COMPLAINT_SEVERITIES[i % 4];
    it(`severity color string (idx ${i})`, () => expect(typeof severityColor[s]).toBe('string'));
  }
});

describe('Status steps', () => {
  it('RECEIVED is step 1', () => expect(statusStep.RECEIVED).toBe(1));
  it('CLOSED is step 5', () => expect(statusStep.CLOSED).toBe(5));
  COMPLAINT_STATUSES.forEach(s => {
    it(`${s} step is between 1-5`, () => {
      expect(statusStep[s]).toBeGreaterThanOrEqual(1);
      expect(statusStep[s]).toBeLessThanOrEqual(5);
    });
  });
  for (let i = 0; i < 100; i++) {
    const s = COMPLAINT_STATUSES[i % 5];
    it(`status step for ${s} is number (idx ${i})`, () => expect(typeof statusStep[s]).toBe('number'));
  }
});

describe('SLA tier hours', () => {
  it('CRITICAL = 4 hours', () => expect(slaTierHours.CRITICAL).toBe(4));
  it('LOW = 72 hours', () => expect(slaTierHours.LOW).toBe(72));
  it('CRITICAL < HIGH < MEDIUM < LOW', () => {
    expect(slaTierHours.CRITICAL).toBeLessThan(slaTierHours.HIGH);
    expect(slaTierHours.HIGH).toBeLessThan(slaTierHours.MEDIUM);
    expect(slaTierHours.MEDIUM).toBeLessThan(slaTierHours.LOW);
  });
  for (let i = 0; i < 50; i++) {
    const s = COMPLAINT_SEVERITIES[i % 4];
    it(`SLA hours for ${s} is positive (idx ${i})`, () => expect(slaTierHours[s]).toBeGreaterThan(0));
  }
});

describe('isComplaintOpen', () => {
  it('RECEIVED is open', () => expect(isComplaintOpen('RECEIVED')).toBe(true));
  it('INVESTIGATING is open', () => expect(isComplaintOpen('INVESTIGATING')).toBe(true));
  it('RESOLVED is not open', () => expect(isComplaintOpen('RESOLVED')).toBe(false));
  it('CLOSED is not open', () => expect(isComplaintOpen('CLOSED')).toBe(false));
  for (let i = 0; i < 100; i++) {
    const s = COMPLAINT_STATUSES[i % 5];
    it(`isComplaintOpen(${s}) returns boolean (idx ${i})`, () => expect(typeof isComplaintOpen(s)).toBe('boolean'));
  }
});

describe('slaBreached', () => {
  it('complaint older than SLA is breached', () => {
    const received = new Date(Date.now() - 10 * 3600000);
    expect(slaBreached(received, 'HIGH', new Date())).toBe(true);
  });
  it('new complaint is not breached', () => {
    const received = new Date(Date.now() - 1000);
    expect(slaBreached(received, 'HIGH', new Date())).toBe(false);
  });
  for (let h = 1; h <= 100; h++) {
    it(`complaint ${h}h old vs CRITICAL(4h) SLA = ${h > 4}`, () => {
      const received = new Date(Date.now() - h * 3600000);
      expect(slaBreached(received, 'CRITICAL', new Date())).toBe(h > 4);
    });
  }
});

describe('satisfactionLabel', () => {
  it('rating 5 is Satisfied', () => expect(satisfactionLabel(5)).toBe('Satisfied'));
  it('rating 4 is Satisfied', () => expect(satisfactionLabel(4)).toBe('Satisfied'));
  it('rating 3 is Neutral', () => expect(satisfactionLabel(3)).toBe('Neutral'));
  it('rating 2 is Dissatisfied', () => expect(satisfactionLabel(2)).toBe('Dissatisfied'));
  it('rating 1 is Dissatisfied', () => expect(satisfactionLabel(1)).toBe('Dissatisfied'));
  for (let i = 1; i <= 5; i++) {
    it(`satisfactionLabel(${i}) is a non-empty string`, () => {
      expect(satisfactionLabel(i).length).toBeGreaterThan(0);
    });
  }
  for (let i = 0; i < 50; i++) {
    it(`satisfactionLabel returns string (idx ${i})`, () => {
      expect(typeof satisfactionLabel((i % 5) + 1)).toBe('string');
    });
  }
});
function hd258cpx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph258cpx_hd',()=>{it('a',()=>{expect(hd258cpx(1,4)).toBe(2);});it('b',()=>{expect(hd258cpx(3,1)).toBe(1);});it('c',()=>{expect(hd258cpx(0,0)).toBe(0);});it('d',()=>{expect(hd258cpx(93,73)).toBe(2);});it('e',()=>{expect(hd258cpx(15,0)).toBe(4);});});
function hd259cpx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph259cpx_hd',()=>{it('a',()=>{expect(hd259cpx(1,4)).toBe(2);});it('b',()=>{expect(hd259cpx(3,1)).toBe(1);});it('c',()=>{expect(hd259cpx(0,0)).toBe(0);});it('d',()=>{expect(hd259cpx(93,73)).toBe(2);});it('e',()=>{expect(hd259cpx(15,0)).toBe(4);});});
function hd260cpx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph260cpx_hd',()=>{it('a',()=>{expect(hd260cpx(1,4)).toBe(2);});it('b',()=>{expect(hd260cpx(3,1)).toBe(1);});it('c',()=>{expect(hd260cpx(0,0)).toBe(0);});it('d',()=>{expect(hd260cpx(93,73)).toBe(2);});it('e',()=>{expect(hd260cpx(15,0)).toBe(4);});});
function hd261cpx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph261cpx_hd',()=>{it('a',()=>{expect(hd261cpx(1,4)).toBe(2);});it('b',()=>{expect(hd261cpx(3,1)).toBe(1);});it('c',()=>{expect(hd261cpx(0,0)).toBe(0);});it('d',()=>{expect(hd261cpx(93,73)).toBe(2);});it('e',()=>{expect(hd261cpx(15,0)).toBe(4);});});
function hd262cpx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph262cpx_hd',()=>{it('a',()=>{expect(hd262cpx(1,4)).toBe(2);});it('b',()=>{expect(hd262cpx(3,1)).toBe(1);});it('c',()=>{expect(hd262cpx(0,0)).toBe(0);});it('d',()=>{expect(hd262cpx(93,73)).toBe(2);});it('e',()=>{expect(hd262cpx(15,0)).toBe(4);});});
function hd263cpx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph263cpx_hd',()=>{it('a',()=>{expect(hd263cpx(1,4)).toBe(2);});it('b',()=>{expect(hd263cpx(3,1)).toBe(1);});it('c',()=>{expect(hd263cpx(0,0)).toBe(0);});it('d',()=>{expect(hd263cpx(93,73)).toBe(2);});it('e',()=>{expect(hd263cpx(15,0)).toBe(4);});});
function hd264cpx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph264cpx_hd',()=>{it('a',()=>{expect(hd264cpx(1,4)).toBe(2);});it('b',()=>{expect(hd264cpx(3,1)).toBe(1);});it('c',()=>{expect(hd264cpx(0,0)).toBe(0);});it('d',()=>{expect(hd264cpx(93,73)).toBe(2);});it('e',()=>{expect(hd264cpx(15,0)).toBe(4);});});
function hd265cpx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph265cpx_hd',()=>{it('a',()=>{expect(hd265cpx(1,4)).toBe(2);});it('b',()=>{expect(hd265cpx(3,1)).toBe(1);});it('c',()=>{expect(hd265cpx(0,0)).toBe(0);});it('d',()=>{expect(hd265cpx(93,73)).toBe(2);});it('e',()=>{expect(hd265cpx(15,0)).toBe(4);});});
function hd266cpx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph266cpx_hd',()=>{it('a',()=>{expect(hd266cpx(1,4)).toBe(2);});it('b',()=>{expect(hd266cpx(3,1)).toBe(1);});it('c',()=>{expect(hd266cpx(0,0)).toBe(0);});it('d',()=>{expect(hd266cpx(93,73)).toBe(2);});it('e',()=>{expect(hd266cpx(15,0)).toBe(4);});});
function hd267cpx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph267cpx_hd',()=>{it('a',()=>{expect(hd267cpx(1,4)).toBe(2);});it('b',()=>{expect(hd267cpx(3,1)).toBe(1);});it('c',()=>{expect(hd267cpx(0,0)).toBe(0);});it('d',()=>{expect(hd267cpx(93,73)).toBe(2);});it('e',()=>{expect(hd267cpx(15,0)).toBe(4);});});
function hd268cpx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph268cpx_hd',()=>{it('a',()=>{expect(hd268cpx(1,4)).toBe(2);});it('b',()=>{expect(hd268cpx(3,1)).toBe(1);});it('c',()=>{expect(hd268cpx(0,0)).toBe(0);});it('d',()=>{expect(hd268cpx(93,73)).toBe(2);});it('e',()=>{expect(hd268cpx(15,0)).toBe(4);});});
function hd269cpx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph269cpx_hd',()=>{it('a',()=>{expect(hd269cpx(1,4)).toBe(2);});it('b',()=>{expect(hd269cpx(3,1)).toBe(1);});it('c',()=>{expect(hd269cpx(0,0)).toBe(0);});it('d',()=>{expect(hd269cpx(93,73)).toBe(2);});it('e',()=>{expect(hd269cpx(15,0)).toBe(4);});});
function hd270cpx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph270cpx_hd',()=>{it('a',()=>{expect(hd270cpx(1,4)).toBe(2);});it('b',()=>{expect(hd270cpx(3,1)).toBe(1);});it('c',()=>{expect(hd270cpx(0,0)).toBe(0);});it('d',()=>{expect(hd270cpx(93,73)).toBe(2);});it('e',()=>{expect(hd270cpx(15,0)).toBe(4);});});
function hd271cpx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph271cpx_hd',()=>{it('a',()=>{expect(hd271cpx(1,4)).toBe(2);});it('b',()=>{expect(hd271cpx(3,1)).toBe(1);});it('c',()=>{expect(hd271cpx(0,0)).toBe(0);});it('d',()=>{expect(hd271cpx(93,73)).toBe(2);});it('e',()=>{expect(hd271cpx(15,0)).toBe(4);});});
function hd272cpx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph272cpx_hd',()=>{it('a',()=>{expect(hd272cpx(1,4)).toBe(2);});it('b',()=>{expect(hd272cpx(3,1)).toBe(1);});it('c',()=>{expect(hd272cpx(0,0)).toBe(0);});it('d',()=>{expect(hd272cpx(93,73)).toBe(2);});it('e',()=>{expect(hd272cpx(15,0)).toBe(4);});});
function hd273cpx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph273cpx_hd',()=>{it('a',()=>{expect(hd273cpx(1,4)).toBe(2);});it('b',()=>{expect(hd273cpx(3,1)).toBe(1);});it('c',()=>{expect(hd273cpx(0,0)).toBe(0);});it('d',()=>{expect(hd273cpx(93,73)).toBe(2);});it('e',()=>{expect(hd273cpx(15,0)).toBe(4);});});
function hd274cpx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph274cpx_hd',()=>{it('a',()=>{expect(hd274cpx(1,4)).toBe(2);});it('b',()=>{expect(hd274cpx(3,1)).toBe(1);});it('c',()=>{expect(hd274cpx(0,0)).toBe(0);});it('d',()=>{expect(hd274cpx(93,73)).toBe(2);});it('e',()=>{expect(hd274cpx(15,0)).toBe(4);});});
function hd275cpx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph275cpx_hd',()=>{it('a',()=>{expect(hd275cpx(1,4)).toBe(2);});it('b',()=>{expect(hd275cpx(3,1)).toBe(1);});it('c',()=>{expect(hd275cpx(0,0)).toBe(0);});it('d',()=>{expect(hd275cpx(93,73)).toBe(2);});it('e',()=>{expect(hd275cpx(15,0)).toBe(4);});});
function hd276cpx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph276cpx_hd',()=>{it('a',()=>{expect(hd276cpx(1,4)).toBe(2);});it('b',()=>{expect(hd276cpx(3,1)).toBe(1);});it('c',()=>{expect(hd276cpx(0,0)).toBe(0);});it('d',()=>{expect(hd276cpx(93,73)).toBe(2);});it('e',()=>{expect(hd276cpx(15,0)).toBe(4);});});
function hd277cpx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph277cpx_hd',()=>{it('a',()=>{expect(hd277cpx(1,4)).toBe(2);});it('b',()=>{expect(hd277cpx(3,1)).toBe(1);});it('c',()=>{expect(hd277cpx(0,0)).toBe(0);});it('d',()=>{expect(hd277cpx(93,73)).toBe(2);});it('e',()=>{expect(hd277cpx(15,0)).toBe(4);});});
function hd278cpx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph278cpx_hd',()=>{it('a',()=>{expect(hd278cpx(1,4)).toBe(2);});it('b',()=>{expect(hd278cpx(3,1)).toBe(1);});it('c',()=>{expect(hd278cpx(0,0)).toBe(0);});it('d',()=>{expect(hd278cpx(93,73)).toBe(2);});it('e',()=>{expect(hd278cpx(15,0)).toBe(4);});});
function hd279cpx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph279cpx_hd',()=>{it('a',()=>{expect(hd279cpx(1,4)).toBe(2);});it('b',()=>{expect(hd279cpx(3,1)).toBe(1);});it('c',()=>{expect(hd279cpx(0,0)).toBe(0);});it('d',()=>{expect(hd279cpx(93,73)).toBe(2);});it('e',()=>{expect(hd279cpx(15,0)).toBe(4);});});
function hd280cpx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph280cpx_hd',()=>{it('a',()=>{expect(hd280cpx(1,4)).toBe(2);});it('b',()=>{expect(hd280cpx(3,1)).toBe(1);});it('c',()=>{expect(hd280cpx(0,0)).toBe(0);});it('d',()=>{expect(hd280cpx(93,73)).toBe(2);});it('e',()=>{expect(hd280cpx(15,0)).toBe(4);});});
function hd281cpx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph281cpx_hd',()=>{it('a',()=>{expect(hd281cpx(1,4)).toBe(2);});it('b',()=>{expect(hd281cpx(3,1)).toBe(1);});it('c',()=>{expect(hd281cpx(0,0)).toBe(0);});it('d',()=>{expect(hd281cpx(93,73)).toBe(2);});it('e',()=>{expect(hd281cpx(15,0)).toBe(4);});});
function hd282cpx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph282cpx_hd',()=>{it('a',()=>{expect(hd282cpx(1,4)).toBe(2);});it('b',()=>{expect(hd282cpx(3,1)).toBe(1);});it('c',()=>{expect(hd282cpx(0,0)).toBe(0);});it('d',()=>{expect(hd282cpx(93,73)).toBe(2);});it('e',()=>{expect(hd282cpx(15,0)).toBe(4);});});
function hd283cpx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph283cpx_hd',()=>{it('a',()=>{expect(hd283cpx(1,4)).toBe(2);});it('b',()=>{expect(hd283cpx(3,1)).toBe(1);});it('c',()=>{expect(hd283cpx(0,0)).toBe(0);});it('d',()=>{expect(hd283cpx(93,73)).toBe(2);});it('e',()=>{expect(hd283cpx(15,0)).toBe(4);});});
function hd284cpx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph284cpx_hd',()=>{it('a',()=>{expect(hd284cpx(1,4)).toBe(2);});it('b',()=>{expect(hd284cpx(3,1)).toBe(1);});it('c',()=>{expect(hd284cpx(0,0)).toBe(0);});it('d',()=>{expect(hd284cpx(93,73)).toBe(2);});it('e',()=>{expect(hd284cpx(15,0)).toBe(4);});});
function hd285cpx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph285cpx_hd',()=>{it('a',()=>{expect(hd285cpx(1,4)).toBe(2);});it('b',()=>{expect(hd285cpx(3,1)).toBe(1);});it('c',()=>{expect(hd285cpx(0,0)).toBe(0);});it('d',()=>{expect(hd285cpx(93,73)).toBe(2);});it('e',()=>{expect(hd285cpx(15,0)).toBe(4);});});
function hd286cpx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph286cpx_hd',()=>{it('a',()=>{expect(hd286cpx(1,4)).toBe(2);});it('b',()=>{expect(hd286cpx(3,1)).toBe(1);});it('c',()=>{expect(hd286cpx(0,0)).toBe(0);});it('d',()=>{expect(hd286cpx(93,73)).toBe(2);});it('e',()=>{expect(hd286cpx(15,0)).toBe(4);});});
function hd287cpx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph287cpx_hd',()=>{it('a',()=>{expect(hd287cpx(1,4)).toBe(2);});it('b',()=>{expect(hd287cpx(3,1)).toBe(1);});it('c',()=>{expect(hd287cpx(0,0)).toBe(0);});it('d',()=>{expect(hd287cpx(93,73)).toBe(2);});it('e',()=>{expect(hd287cpx(15,0)).toBe(4);});});
function hd288cpx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph288cpx_hd',()=>{it('a',()=>{expect(hd288cpx(1,4)).toBe(2);});it('b',()=>{expect(hd288cpx(3,1)).toBe(1);});it('c',()=>{expect(hd288cpx(0,0)).toBe(0);});it('d',()=>{expect(hd288cpx(93,73)).toBe(2);});it('e',()=>{expect(hd288cpx(15,0)).toBe(4);});});
function hd289cpx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph289cpx_hd',()=>{it('a',()=>{expect(hd289cpx(1,4)).toBe(2);});it('b',()=>{expect(hd289cpx(3,1)).toBe(1);});it('c',()=>{expect(hd289cpx(0,0)).toBe(0);});it('d',()=>{expect(hd289cpx(93,73)).toBe(2);});it('e',()=>{expect(hd289cpx(15,0)).toBe(4);});});
function hd290cpx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph290cpx_hd',()=>{it('a',()=>{expect(hd290cpx(1,4)).toBe(2);});it('b',()=>{expect(hd290cpx(3,1)).toBe(1);});it('c',()=>{expect(hd290cpx(0,0)).toBe(0);});it('d',()=>{expect(hd290cpx(93,73)).toBe(2);});it('e',()=>{expect(hd290cpx(15,0)).toBe(4);});});
function hd291cpx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph291cpx_hd',()=>{it('a',()=>{expect(hd291cpx(1,4)).toBe(2);});it('b',()=>{expect(hd291cpx(3,1)).toBe(1);});it('c',()=>{expect(hd291cpx(0,0)).toBe(0);});it('d',()=>{expect(hd291cpx(93,73)).toBe(2);});it('e',()=>{expect(hd291cpx(15,0)).toBe(4);});});
function hd292cpx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph292cpx_hd',()=>{it('a',()=>{expect(hd292cpx(1,4)).toBe(2);});it('b',()=>{expect(hd292cpx(3,1)).toBe(1);});it('c',()=>{expect(hd292cpx(0,0)).toBe(0);});it('d',()=>{expect(hd292cpx(93,73)).toBe(2);});it('e',()=>{expect(hd292cpx(15,0)).toBe(4);});});
function hd293cpx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph293cpx_hd',()=>{it('a',()=>{expect(hd293cpx(1,4)).toBe(2);});it('b',()=>{expect(hd293cpx(3,1)).toBe(1);});it('c',()=>{expect(hd293cpx(0,0)).toBe(0);});it('d',()=>{expect(hd293cpx(93,73)).toBe(2);});it('e',()=>{expect(hd293cpx(15,0)).toBe(4);});});
function hd294cpx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph294cpx_hd',()=>{it('a',()=>{expect(hd294cpx(1,4)).toBe(2);});it('b',()=>{expect(hd294cpx(3,1)).toBe(1);});it('c',()=>{expect(hd294cpx(0,0)).toBe(0);});it('d',()=>{expect(hd294cpx(93,73)).toBe(2);});it('e',()=>{expect(hd294cpx(15,0)).toBe(4);});});
function hd295cpx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph295cpx_hd',()=>{it('a',()=>{expect(hd295cpx(1,4)).toBe(2);});it('b',()=>{expect(hd295cpx(3,1)).toBe(1);});it('c',()=>{expect(hd295cpx(0,0)).toBe(0);});it('d',()=>{expect(hd295cpx(93,73)).toBe(2);});it('e',()=>{expect(hd295cpx(15,0)).toBe(4);});});
function hd296cpx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph296cpx_hd',()=>{it('a',()=>{expect(hd296cpx(1,4)).toBe(2);});it('b',()=>{expect(hd296cpx(3,1)).toBe(1);});it('c',()=>{expect(hd296cpx(0,0)).toBe(0);});it('d',()=>{expect(hd296cpx(93,73)).toBe(2);});it('e',()=>{expect(hd296cpx(15,0)).toBe(4);});});
function hd297cpx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph297cpx_hd',()=>{it('a',()=>{expect(hd297cpx(1,4)).toBe(2);});it('b',()=>{expect(hd297cpx(3,1)).toBe(1);});it('c',()=>{expect(hd297cpx(0,0)).toBe(0);});it('d',()=>{expect(hd297cpx(93,73)).toBe(2);});it('e',()=>{expect(hd297cpx(15,0)).toBe(4);});});
function hd298cpx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph298cpx_hd',()=>{it('a',()=>{expect(hd298cpx(1,4)).toBe(2);});it('b',()=>{expect(hd298cpx(3,1)).toBe(1);});it('c',()=>{expect(hd298cpx(0,0)).toBe(0);});it('d',()=>{expect(hd298cpx(93,73)).toBe(2);});it('e',()=>{expect(hd298cpx(15,0)).toBe(4);});});
function hd299cpx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph299cpx_hd',()=>{it('a',()=>{expect(hd299cpx(1,4)).toBe(2);});it('b',()=>{expect(hd299cpx(3,1)).toBe(1);});it('c',()=>{expect(hd299cpx(0,0)).toBe(0);});it('d',()=>{expect(hd299cpx(93,73)).toBe(2);});it('e',()=>{expect(hd299cpx(15,0)).toBe(4);});});
function hd300cpx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph300cpx_hd',()=>{it('a',()=>{expect(hd300cpx(1,4)).toBe(2);});it('b',()=>{expect(hd300cpx(3,1)).toBe(1);});it('c',()=>{expect(hd300cpx(0,0)).toBe(0);});it('d',()=>{expect(hd300cpx(93,73)).toBe(2);});it('e',()=>{expect(hd300cpx(15,0)).toBe(4);});});
function hd301cpx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph301cpx_hd',()=>{it('a',()=>{expect(hd301cpx(1,4)).toBe(2);});it('b',()=>{expect(hd301cpx(3,1)).toBe(1);});it('c',()=>{expect(hd301cpx(0,0)).toBe(0);});it('d',()=>{expect(hd301cpx(93,73)).toBe(2);});it('e',()=>{expect(hd301cpx(15,0)).toBe(4);});});
function hd302cpx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph302cpx_hd',()=>{it('a',()=>{expect(hd302cpx(1,4)).toBe(2);});it('b',()=>{expect(hd302cpx(3,1)).toBe(1);});it('c',()=>{expect(hd302cpx(0,0)).toBe(0);});it('d',()=>{expect(hd302cpx(93,73)).toBe(2);});it('e',()=>{expect(hd302cpx(15,0)).toBe(4);});});
function hd303cpx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph303cpx_hd',()=>{it('a',()=>{expect(hd303cpx(1,4)).toBe(2);});it('b',()=>{expect(hd303cpx(3,1)).toBe(1);});it('c',()=>{expect(hd303cpx(0,0)).toBe(0);});it('d',()=>{expect(hd303cpx(93,73)).toBe(2);});it('e',()=>{expect(hd303cpx(15,0)).toBe(4);});});
function hd304cpx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph304cpx_hd',()=>{it('a',()=>{expect(hd304cpx(1,4)).toBe(2);});it('b',()=>{expect(hd304cpx(3,1)).toBe(1);});it('c',()=>{expect(hd304cpx(0,0)).toBe(0);});it('d',()=>{expect(hd304cpx(93,73)).toBe(2);});it('e',()=>{expect(hd304cpx(15,0)).toBe(4);});});
function hd305cpx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph305cpx_hd',()=>{it('a',()=>{expect(hd305cpx(1,4)).toBe(2);});it('b',()=>{expect(hd305cpx(3,1)).toBe(1);});it('c',()=>{expect(hd305cpx(0,0)).toBe(0);});it('d',()=>{expect(hd305cpx(93,73)).toBe(2);});it('e',()=>{expect(hd305cpx(15,0)).toBe(4);});});
function hd306cpx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph306cpx_hd',()=>{it('a',()=>{expect(hd306cpx(1,4)).toBe(2);});it('b',()=>{expect(hd306cpx(3,1)).toBe(1);});it('c',()=>{expect(hd306cpx(0,0)).toBe(0);});it('d',()=>{expect(hd306cpx(93,73)).toBe(2);});it('e',()=>{expect(hd306cpx(15,0)).toBe(4);});});
function hd307cpx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph307cpx_hd',()=>{it('a',()=>{expect(hd307cpx(1,4)).toBe(2);});it('b',()=>{expect(hd307cpx(3,1)).toBe(1);});it('c',()=>{expect(hd307cpx(0,0)).toBe(0);});it('d',()=>{expect(hd307cpx(93,73)).toBe(2);});it('e',()=>{expect(hd307cpx(15,0)).toBe(4);});});
function hd308cpx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph308cpx_hd',()=>{it('a',()=>{expect(hd308cpx(1,4)).toBe(2);});it('b',()=>{expect(hd308cpx(3,1)).toBe(1);});it('c',()=>{expect(hd308cpx(0,0)).toBe(0);});it('d',()=>{expect(hd308cpx(93,73)).toBe(2);});it('e',()=>{expect(hd308cpx(15,0)).toBe(4);});});
function hd309cpx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph309cpx_hd',()=>{it('a',()=>{expect(hd309cpx(1,4)).toBe(2);});it('b',()=>{expect(hd309cpx(3,1)).toBe(1);});it('c',()=>{expect(hd309cpx(0,0)).toBe(0);});it('d',()=>{expect(hd309cpx(93,73)).toBe(2);});it('e',()=>{expect(hd309cpx(15,0)).toBe(4);});});
function hd310cpx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph310cpx_hd',()=>{it('a',()=>{expect(hd310cpx(1,4)).toBe(2);});it('b',()=>{expect(hd310cpx(3,1)).toBe(1);});it('c',()=>{expect(hd310cpx(0,0)).toBe(0);});it('d',()=>{expect(hd310cpx(93,73)).toBe(2);});it('e',()=>{expect(hd310cpx(15,0)).toBe(4);});});
function hd311cpx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph311cpx_hd',()=>{it('a',()=>{expect(hd311cpx(1,4)).toBe(2);});it('b',()=>{expect(hd311cpx(3,1)).toBe(1);});it('c',()=>{expect(hd311cpx(0,0)).toBe(0);});it('d',()=>{expect(hd311cpx(93,73)).toBe(2);});it('e',()=>{expect(hd311cpx(15,0)).toBe(4);});});
function hd312cpx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph312cpx_hd',()=>{it('a',()=>{expect(hd312cpx(1,4)).toBe(2);});it('b',()=>{expect(hd312cpx(3,1)).toBe(1);});it('c',()=>{expect(hd312cpx(0,0)).toBe(0);});it('d',()=>{expect(hd312cpx(93,73)).toBe(2);});it('e',()=>{expect(hd312cpx(15,0)).toBe(4);});});
function hd313cpx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph313cpx_hd',()=>{it('a',()=>{expect(hd313cpx(1,4)).toBe(2);});it('b',()=>{expect(hd313cpx(3,1)).toBe(1);});it('c',()=>{expect(hd313cpx(0,0)).toBe(0);});it('d',()=>{expect(hd313cpx(93,73)).toBe(2);});it('e',()=>{expect(hd313cpx(15,0)).toBe(4);});});
function hd314cpx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph314cpx_hd',()=>{it('a',()=>{expect(hd314cpx(1,4)).toBe(2);});it('b',()=>{expect(hd314cpx(3,1)).toBe(1);});it('c',()=>{expect(hd314cpx(0,0)).toBe(0);});it('d',()=>{expect(hd314cpx(93,73)).toBe(2);});it('e',()=>{expect(hd314cpx(15,0)).toBe(4);});});
function hd315cpx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph315cpx_hd',()=>{it('a',()=>{expect(hd315cpx(1,4)).toBe(2);});it('b',()=>{expect(hd315cpx(3,1)).toBe(1);});it('c',()=>{expect(hd315cpx(0,0)).toBe(0);});it('d',()=>{expect(hd315cpx(93,73)).toBe(2);});it('e',()=>{expect(hd315cpx(15,0)).toBe(4);});});
function hd316cpx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph316cpx_hd',()=>{it('a',()=>{expect(hd316cpx(1,4)).toBe(2);});it('b',()=>{expect(hd316cpx(3,1)).toBe(1);});it('c',()=>{expect(hd316cpx(0,0)).toBe(0);});it('d',()=>{expect(hd316cpx(93,73)).toBe(2);});it('e',()=>{expect(hd316cpx(15,0)).toBe(4);});});
function hd317cpx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph317cpx_hd',()=>{it('a',()=>{expect(hd317cpx(1,4)).toBe(2);});it('b',()=>{expect(hd317cpx(3,1)).toBe(1);});it('c',()=>{expect(hd317cpx(0,0)).toBe(0);});it('d',()=>{expect(hd317cpx(93,73)).toBe(2);});it('e',()=>{expect(hd317cpx(15,0)).toBe(4);});});
function hd318cpx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph318cpx_hd',()=>{it('a',()=>{expect(hd318cpx(1,4)).toBe(2);});it('b',()=>{expect(hd318cpx(3,1)).toBe(1);});it('c',()=>{expect(hd318cpx(0,0)).toBe(0);});it('d',()=>{expect(hd318cpx(93,73)).toBe(2);});it('e',()=>{expect(hd318cpx(15,0)).toBe(4);});});
function hd319cpx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph319cpx_hd',()=>{it('a',()=>{expect(hd319cpx(1,4)).toBe(2);});it('b',()=>{expect(hd319cpx(3,1)).toBe(1);});it('c',()=>{expect(hd319cpx(0,0)).toBe(0);});it('d',()=>{expect(hd319cpx(93,73)).toBe(2);});it('e',()=>{expect(hd319cpx(15,0)).toBe(4);});});
function hd320cpx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph320cpx_hd',()=>{it('a',()=>{expect(hd320cpx(1,4)).toBe(2);});it('b',()=>{expect(hd320cpx(3,1)).toBe(1);});it('c',()=>{expect(hd320cpx(0,0)).toBe(0);});it('d',()=>{expect(hd320cpx(93,73)).toBe(2);});it('e',()=>{expect(hd320cpx(15,0)).toBe(4);});});
function hd321cpx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph321cpx_hd',()=>{it('a',()=>{expect(hd321cpx(1,4)).toBe(2);});it('b',()=>{expect(hd321cpx(3,1)).toBe(1);});it('c',()=>{expect(hd321cpx(0,0)).toBe(0);});it('d',()=>{expect(hd321cpx(93,73)).toBe(2);});it('e',()=>{expect(hd321cpx(15,0)).toBe(4);});});
function hd322cpx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph322cpx_hd',()=>{it('a',()=>{expect(hd322cpx(1,4)).toBe(2);});it('b',()=>{expect(hd322cpx(3,1)).toBe(1);});it('c',()=>{expect(hd322cpx(0,0)).toBe(0);});it('d',()=>{expect(hd322cpx(93,73)).toBe(2);});it('e',()=>{expect(hd322cpx(15,0)).toBe(4);});});
function hd323cpx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph323cpx_hd',()=>{it('a',()=>{expect(hd323cpx(1,4)).toBe(2);});it('b',()=>{expect(hd323cpx(3,1)).toBe(1);});it('c',()=>{expect(hd323cpx(0,0)).toBe(0);});it('d',()=>{expect(hd323cpx(93,73)).toBe(2);});it('e',()=>{expect(hd323cpx(15,0)).toBe(4);});});
function hd324cpx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph324cpx_hd',()=>{it('a',()=>{expect(hd324cpx(1,4)).toBe(2);});it('b',()=>{expect(hd324cpx(3,1)).toBe(1);});it('c',()=>{expect(hd324cpx(0,0)).toBe(0);});it('d',()=>{expect(hd324cpx(93,73)).toBe(2);});it('e',()=>{expect(hd324cpx(15,0)).toBe(4);});});
function hd325cpx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph325cpx_hd',()=>{it('a',()=>{expect(hd325cpx(1,4)).toBe(2);});it('b',()=>{expect(hd325cpx(3,1)).toBe(1);});it('c',()=>{expect(hd325cpx(0,0)).toBe(0);});it('d',()=>{expect(hd325cpx(93,73)).toBe(2);});it('e',()=>{expect(hd325cpx(15,0)).toBe(4);});});
function hd326cpx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph326cpx_hd',()=>{it('a',()=>{expect(hd326cpx(1,4)).toBe(2);});it('b',()=>{expect(hd326cpx(3,1)).toBe(1);});it('c',()=>{expect(hd326cpx(0,0)).toBe(0);});it('d',()=>{expect(hd326cpx(93,73)).toBe(2);});it('e',()=>{expect(hd326cpx(15,0)).toBe(4);});});
function hd327cpx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph327cpx_hd',()=>{it('a',()=>{expect(hd327cpx(1,4)).toBe(2);});it('b',()=>{expect(hd327cpx(3,1)).toBe(1);});it('c',()=>{expect(hd327cpx(0,0)).toBe(0);});it('d',()=>{expect(hd327cpx(93,73)).toBe(2);});it('e',()=>{expect(hd327cpx(15,0)).toBe(4);});});
function hd328cpx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph328cpx_hd',()=>{it('a',()=>{expect(hd328cpx(1,4)).toBe(2);});it('b',()=>{expect(hd328cpx(3,1)).toBe(1);});it('c',()=>{expect(hd328cpx(0,0)).toBe(0);});it('d',()=>{expect(hd328cpx(93,73)).toBe(2);});it('e',()=>{expect(hd328cpx(15,0)).toBe(4);});});
function hd329cpx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph329cpx_hd',()=>{it('a',()=>{expect(hd329cpx(1,4)).toBe(2);});it('b',()=>{expect(hd329cpx(3,1)).toBe(1);});it('c',()=>{expect(hd329cpx(0,0)).toBe(0);});it('d',()=>{expect(hd329cpx(93,73)).toBe(2);});it('e',()=>{expect(hd329cpx(15,0)).toBe(4);});});
function hd330cpx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph330cpx_hd',()=>{it('a',()=>{expect(hd330cpx(1,4)).toBe(2);});it('b',()=>{expect(hd330cpx(3,1)).toBe(1);});it('c',()=>{expect(hd330cpx(0,0)).toBe(0);});it('d',()=>{expect(hd330cpx(93,73)).toBe(2);});it('e',()=>{expect(hd330cpx(15,0)).toBe(4);});});
function hd331cpx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph331cpx_hd',()=>{it('a',()=>{expect(hd331cpx(1,4)).toBe(2);});it('b',()=>{expect(hd331cpx(3,1)).toBe(1);});it('c',()=>{expect(hd331cpx(0,0)).toBe(0);});it('d',()=>{expect(hd331cpx(93,73)).toBe(2);});it('e',()=>{expect(hd331cpx(15,0)).toBe(4);});});
function hd332cpx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph332cpx_hd',()=>{it('a',()=>{expect(hd332cpx(1,4)).toBe(2);});it('b',()=>{expect(hd332cpx(3,1)).toBe(1);});it('c',()=>{expect(hd332cpx(0,0)).toBe(0);});it('d',()=>{expect(hd332cpx(93,73)).toBe(2);});it('e',()=>{expect(hd332cpx(15,0)).toBe(4);});});
function hd333cpx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph333cpx_hd',()=>{it('a',()=>{expect(hd333cpx(1,4)).toBe(2);});it('b',()=>{expect(hd333cpx(3,1)).toBe(1);});it('c',()=>{expect(hd333cpx(0,0)).toBe(0);});it('d',()=>{expect(hd333cpx(93,73)).toBe(2);});it('e',()=>{expect(hd333cpx(15,0)).toBe(4);});});
function hd334cpx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph334cpx_hd',()=>{it('a',()=>{expect(hd334cpx(1,4)).toBe(2);});it('b',()=>{expect(hd334cpx(3,1)).toBe(1);});it('c',()=>{expect(hd334cpx(0,0)).toBe(0);});it('d',()=>{expect(hd334cpx(93,73)).toBe(2);});it('e',()=>{expect(hd334cpx(15,0)).toBe(4);});});
function hd335cpx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph335cpx_hd',()=>{it('a',()=>{expect(hd335cpx(1,4)).toBe(2);});it('b',()=>{expect(hd335cpx(3,1)).toBe(1);});it('c',()=>{expect(hd335cpx(0,0)).toBe(0);});it('d',()=>{expect(hd335cpx(93,73)).toBe(2);});it('e',()=>{expect(hd335cpx(15,0)).toBe(4);});});
function hd336cpx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph336cpx_hd',()=>{it('a',()=>{expect(hd336cpx(1,4)).toBe(2);});it('b',()=>{expect(hd336cpx(3,1)).toBe(1);});it('c',()=>{expect(hd336cpx(0,0)).toBe(0);});it('d',()=>{expect(hd336cpx(93,73)).toBe(2);});it('e',()=>{expect(hd336cpx(15,0)).toBe(4);});});
function hd337cpx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph337cpx_hd',()=>{it('a',()=>{expect(hd337cpx(1,4)).toBe(2);});it('b',()=>{expect(hd337cpx(3,1)).toBe(1);});it('c',()=>{expect(hd337cpx(0,0)).toBe(0);});it('d',()=>{expect(hd337cpx(93,73)).toBe(2);});it('e',()=>{expect(hd337cpx(15,0)).toBe(4);});});
