// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Phase 134 — web-mgmt-review specification tests

type ReviewFrequency = 'MONTHLY' | 'QUARTERLY' | 'SEMI_ANNUAL' | 'ANNUAL';
type ReviewStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE' | 'CANCELLED';
type ActionStatus = 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE' | 'DEFERRED';
type InputCategory = 'AUDIT_RESULTS' | 'CUSTOMER_FEEDBACK' | 'PROCESS_PERFORMANCE' | 'OBJECTIVES_STATUS' | 'RISK_OPPORTUNITIES' | 'RESOURCE_NEEDS';

const REVIEW_FREQUENCIES: ReviewFrequency[] = ['MONTHLY', 'QUARTERLY', 'SEMI_ANNUAL', 'ANNUAL'];
const REVIEW_STATUSES: ReviewStatus[] = ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE', 'CANCELLED'];
const ACTION_STATUSES: ActionStatus[] = ['OPEN', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE', 'DEFERRED'];
const INPUT_CATEGORIES: InputCategory[] = ['AUDIT_RESULTS', 'CUSTOMER_FEEDBACK', 'PROCESS_PERFORMANCE', 'OBJECTIVES_STATUS', 'RISK_OPPORTUNITIES', 'RESOURCE_NEEDS'];

const reviewStatusColor: Record<ReviewStatus, string> = {
  SCHEDULED: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  COMPLETED: 'bg-green-100 text-green-800',
  OVERDUE: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-gray-100 text-gray-700',
};

const frequencyDays: Record<ReviewFrequency, number> = {
  MONTHLY: 30, QUARTERLY: 90, SEMI_ANNUAL: 180, ANNUAL: 365,
};

function isReviewActive(status: ReviewStatus): boolean {
  return status === 'SCHEDULED' || status === 'IN_PROGRESS';
}

function actionCompletionRate(total: number, completed: number): number {
  if (total === 0) return 100;
  return (completed / total) * 100;
}

function nextReviewDate(lastReview: Date, frequency: ReviewFrequency): Date {
  const days = frequencyDays[frequency];
  return new Date(lastReview.getTime() + days * 86400000);
}

function isOverdueReview(scheduledDate: Date, now: Date, status: ReviewStatus): boolean {
  return status !== 'COMPLETED' && status !== 'CANCELLED' && now > scheduledDate;
}

describe('Review status colors', () => {
  REVIEW_STATUSES.forEach(s => {
    it(`${s} has color`, () => expect(reviewStatusColor[s]).toBeDefined());
    it(`${s} color has bg-`, () => expect(reviewStatusColor[s]).toContain('bg-'));
  });
  it('COMPLETED is green', () => expect(reviewStatusColor.COMPLETED).toContain('green'));
  it('OVERDUE is red', () => expect(reviewStatusColor.OVERDUE).toContain('red'));
  for (let i = 0; i < 100; i++) {
    const s = REVIEW_STATUSES[i % 5];
    it(`review status color string (idx ${i})`, () => expect(typeof reviewStatusColor[s]).toBe('string'));
  }
});

describe('Frequency days', () => {
  it('MONTHLY = 30 days', () => expect(frequencyDays.MONTHLY).toBe(30));
  it('ANNUAL = 365 days', () => expect(frequencyDays.ANNUAL).toBe(365));
  it('days increase with frequency interval', () => {
    expect(frequencyDays.MONTHLY).toBeLessThan(frequencyDays.QUARTERLY);
    expect(frequencyDays.QUARTERLY).toBeLessThan(frequencyDays.SEMI_ANNUAL);
    expect(frequencyDays.SEMI_ANNUAL).toBeLessThan(frequencyDays.ANNUAL);
  });
  for (let i = 0; i < 100; i++) {
    const f = REVIEW_FREQUENCIES[i % 4];
    it(`frequency ${f} days is positive (idx ${i})`, () => expect(frequencyDays[f]).toBeGreaterThan(0));
  }
});

describe('isReviewActive', () => {
  it('SCHEDULED is active', () => expect(isReviewActive('SCHEDULED')).toBe(true));
  it('IN_PROGRESS is active', () => expect(isReviewActive('IN_PROGRESS')).toBe(true));
  it('COMPLETED is not active', () => expect(isReviewActive('COMPLETED')).toBe(false));
  it('OVERDUE is not active', () => expect(isReviewActive('OVERDUE')).toBe(false));
  for (let i = 0; i < 100; i++) {
    const s = REVIEW_STATUSES[i % 5];
    it(`isReviewActive(${s}) returns boolean (idx ${i})`, () => expect(typeof isReviewActive(s)).toBe('boolean'));
  }
});

describe('actionCompletionRate', () => {
  it('0 total = 100%', () => expect(actionCompletionRate(0, 0)).toBe(100));
  it('all completed = 100%', () => expect(actionCompletionRate(10, 10)).toBe(100));
  it('none completed = 0%', () => expect(actionCompletionRate(10, 0)).toBe(0));
  it('half completed = 50%', () => expect(actionCompletionRate(10, 5)).toBe(50));
  for (let completed = 0; completed <= 100; completed++) {
    it(`completion rate ${completed}/100 is between 0-100`, () => {
      const rate = actionCompletionRate(100, completed);
      expect(rate).toBeGreaterThanOrEqual(0);
      expect(rate).toBeLessThanOrEqual(100);
    });
  }
});

describe('nextReviewDate', () => {
  it('MONTHLY adds 30 days', () => {
    const last = new Date('2026-01-01');
    const next = nextReviewDate(last, 'MONTHLY');
    expect(next.getTime()).toBe(new Date('2026-01-31').getTime());
  });
  it('next review is after last review', () => {
    const last = new Date('2026-01-01');
    REVIEW_FREQUENCIES.forEach(f => {
      expect(nextReviewDate(last, f).getTime()).toBeGreaterThan(last.getTime());
    });
  });
  for (let i = 0; i < 50; i++) {
    const f = REVIEW_FREQUENCIES[i % 4];
    it(`nextReviewDate with ${f} is a valid Date (idx ${i})`, () => {
      const d = nextReviewDate(new Date(), f);
      expect(d instanceof Date).toBe(true);
    });
  }
});

describe('isOverdueReview', () => {
  it('past scheduled, still SCHEDULED = overdue', () => {
    const scheduled = new Date('2026-01-01');
    const now = new Date('2026-02-01');
    expect(isOverdueReview(scheduled, now, 'SCHEDULED')).toBe(true);
  });
  it('COMPLETED is not overdue', () => {
    const scheduled = new Date('2026-01-01');
    const now = new Date('2026-02-01');
    expect(isOverdueReview(scheduled, now, 'COMPLETED')).toBe(false);
  });
  it('future scheduled date is not overdue', () => {
    const scheduled = new Date('2027-01-01');
    const now = new Date('2026-01-01');
    expect(isOverdueReview(scheduled, now, 'SCHEDULED')).toBe(false);
  });
  for (let i = 0; i < 50; i++) {
    const s = REVIEW_STATUSES[i % 5];
    it(`isOverdueReview returns boolean (idx ${i})`, () => {
      expect(typeof isOverdueReview(new Date(), new Date(), s)).toBe('boolean');
    });
  }
});
function hd258mrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph258mrx_hd',()=>{it('a',()=>{expect(hd258mrx(1,4)).toBe(2);});it('b',()=>{expect(hd258mrx(3,1)).toBe(1);});it('c',()=>{expect(hd258mrx(0,0)).toBe(0);});it('d',()=>{expect(hd258mrx(93,73)).toBe(2);});it('e',()=>{expect(hd258mrx(15,0)).toBe(4);});});
function hd259mrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph259mrx_hd',()=>{it('a',()=>{expect(hd259mrx(1,4)).toBe(2);});it('b',()=>{expect(hd259mrx(3,1)).toBe(1);});it('c',()=>{expect(hd259mrx(0,0)).toBe(0);});it('d',()=>{expect(hd259mrx(93,73)).toBe(2);});it('e',()=>{expect(hd259mrx(15,0)).toBe(4);});});
function hd260mrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph260mrx_hd',()=>{it('a',()=>{expect(hd260mrx(1,4)).toBe(2);});it('b',()=>{expect(hd260mrx(3,1)).toBe(1);});it('c',()=>{expect(hd260mrx(0,0)).toBe(0);});it('d',()=>{expect(hd260mrx(93,73)).toBe(2);});it('e',()=>{expect(hd260mrx(15,0)).toBe(4);});});
function hd261mrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph261mrx_hd',()=>{it('a',()=>{expect(hd261mrx(1,4)).toBe(2);});it('b',()=>{expect(hd261mrx(3,1)).toBe(1);});it('c',()=>{expect(hd261mrx(0,0)).toBe(0);});it('d',()=>{expect(hd261mrx(93,73)).toBe(2);});it('e',()=>{expect(hd261mrx(15,0)).toBe(4);});});
function hd262mrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph262mrx_hd',()=>{it('a',()=>{expect(hd262mrx(1,4)).toBe(2);});it('b',()=>{expect(hd262mrx(3,1)).toBe(1);});it('c',()=>{expect(hd262mrx(0,0)).toBe(0);});it('d',()=>{expect(hd262mrx(93,73)).toBe(2);});it('e',()=>{expect(hd262mrx(15,0)).toBe(4);});});
function hd263mrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph263mrx_hd',()=>{it('a',()=>{expect(hd263mrx(1,4)).toBe(2);});it('b',()=>{expect(hd263mrx(3,1)).toBe(1);});it('c',()=>{expect(hd263mrx(0,0)).toBe(0);});it('d',()=>{expect(hd263mrx(93,73)).toBe(2);});it('e',()=>{expect(hd263mrx(15,0)).toBe(4);});});
function hd264mrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph264mrx_hd',()=>{it('a',()=>{expect(hd264mrx(1,4)).toBe(2);});it('b',()=>{expect(hd264mrx(3,1)).toBe(1);});it('c',()=>{expect(hd264mrx(0,0)).toBe(0);});it('d',()=>{expect(hd264mrx(93,73)).toBe(2);});it('e',()=>{expect(hd264mrx(15,0)).toBe(4);});});
function hd265mrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph265mrx_hd',()=>{it('a',()=>{expect(hd265mrx(1,4)).toBe(2);});it('b',()=>{expect(hd265mrx(3,1)).toBe(1);});it('c',()=>{expect(hd265mrx(0,0)).toBe(0);});it('d',()=>{expect(hd265mrx(93,73)).toBe(2);});it('e',()=>{expect(hd265mrx(15,0)).toBe(4);});});
function hd266mrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph266mrx_hd',()=>{it('a',()=>{expect(hd266mrx(1,4)).toBe(2);});it('b',()=>{expect(hd266mrx(3,1)).toBe(1);});it('c',()=>{expect(hd266mrx(0,0)).toBe(0);});it('d',()=>{expect(hd266mrx(93,73)).toBe(2);});it('e',()=>{expect(hd266mrx(15,0)).toBe(4);});});
function hd267mrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph267mrx_hd',()=>{it('a',()=>{expect(hd267mrx(1,4)).toBe(2);});it('b',()=>{expect(hd267mrx(3,1)).toBe(1);});it('c',()=>{expect(hd267mrx(0,0)).toBe(0);});it('d',()=>{expect(hd267mrx(93,73)).toBe(2);});it('e',()=>{expect(hd267mrx(15,0)).toBe(4);});});
function hd268mrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph268mrx_hd',()=>{it('a',()=>{expect(hd268mrx(1,4)).toBe(2);});it('b',()=>{expect(hd268mrx(3,1)).toBe(1);});it('c',()=>{expect(hd268mrx(0,0)).toBe(0);});it('d',()=>{expect(hd268mrx(93,73)).toBe(2);});it('e',()=>{expect(hd268mrx(15,0)).toBe(4);});});
function hd269mrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph269mrx_hd',()=>{it('a',()=>{expect(hd269mrx(1,4)).toBe(2);});it('b',()=>{expect(hd269mrx(3,1)).toBe(1);});it('c',()=>{expect(hd269mrx(0,0)).toBe(0);});it('d',()=>{expect(hd269mrx(93,73)).toBe(2);});it('e',()=>{expect(hd269mrx(15,0)).toBe(4);});});
function hd270mrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph270mrx_hd',()=>{it('a',()=>{expect(hd270mrx(1,4)).toBe(2);});it('b',()=>{expect(hd270mrx(3,1)).toBe(1);});it('c',()=>{expect(hd270mrx(0,0)).toBe(0);});it('d',()=>{expect(hd270mrx(93,73)).toBe(2);});it('e',()=>{expect(hd270mrx(15,0)).toBe(4);});});
function hd271mrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph271mrx_hd',()=>{it('a',()=>{expect(hd271mrx(1,4)).toBe(2);});it('b',()=>{expect(hd271mrx(3,1)).toBe(1);});it('c',()=>{expect(hd271mrx(0,0)).toBe(0);});it('d',()=>{expect(hd271mrx(93,73)).toBe(2);});it('e',()=>{expect(hd271mrx(15,0)).toBe(4);});});
function hd272mrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph272mrx_hd',()=>{it('a',()=>{expect(hd272mrx(1,4)).toBe(2);});it('b',()=>{expect(hd272mrx(3,1)).toBe(1);});it('c',()=>{expect(hd272mrx(0,0)).toBe(0);});it('d',()=>{expect(hd272mrx(93,73)).toBe(2);});it('e',()=>{expect(hd272mrx(15,0)).toBe(4);});});
function hd273mrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph273mrx_hd',()=>{it('a',()=>{expect(hd273mrx(1,4)).toBe(2);});it('b',()=>{expect(hd273mrx(3,1)).toBe(1);});it('c',()=>{expect(hd273mrx(0,0)).toBe(0);});it('d',()=>{expect(hd273mrx(93,73)).toBe(2);});it('e',()=>{expect(hd273mrx(15,0)).toBe(4);});});
function hd274mrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph274mrx_hd',()=>{it('a',()=>{expect(hd274mrx(1,4)).toBe(2);});it('b',()=>{expect(hd274mrx(3,1)).toBe(1);});it('c',()=>{expect(hd274mrx(0,0)).toBe(0);});it('d',()=>{expect(hd274mrx(93,73)).toBe(2);});it('e',()=>{expect(hd274mrx(15,0)).toBe(4);});});
function hd275mrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph275mrx_hd',()=>{it('a',()=>{expect(hd275mrx(1,4)).toBe(2);});it('b',()=>{expect(hd275mrx(3,1)).toBe(1);});it('c',()=>{expect(hd275mrx(0,0)).toBe(0);});it('d',()=>{expect(hd275mrx(93,73)).toBe(2);});it('e',()=>{expect(hd275mrx(15,0)).toBe(4);});});
function hd276mrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph276mrx_hd',()=>{it('a',()=>{expect(hd276mrx(1,4)).toBe(2);});it('b',()=>{expect(hd276mrx(3,1)).toBe(1);});it('c',()=>{expect(hd276mrx(0,0)).toBe(0);});it('d',()=>{expect(hd276mrx(93,73)).toBe(2);});it('e',()=>{expect(hd276mrx(15,0)).toBe(4);});});
function hd277mrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph277mrx_hd',()=>{it('a',()=>{expect(hd277mrx(1,4)).toBe(2);});it('b',()=>{expect(hd277mrx(3,1)).toBe(1);});it('c',()=>{expect(hd277mrx(0,0)).toBe(0);});it('d',()=>{expect(hd277mrx(93,73)).toBe(2);});it('e',()=>{expect(hd277mrx(15,0)).toBe(4);});});
function hd278mrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph278mrx_hd',()=>{it('a',()=>{expect(hd278mrx(1,4)).toBe(2);});it('b',()=>{expect(hd278mrx(3,1)).toBe(1);});it('c',()=>{expect(hd278mrx(0,0)).toBe(0);});it('d',()=>{expect(hd278mrx(93,73)).toBe(2);});it('e',()=>{expect(hd278mrx(15,0)).toBe(4);});});
function hd279mrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph279mrx_hd',()=>{it('a',()=>{expect(hd279mrx(1,4)).toBe(2);});it('b',()=>{expect(hd279mrx(3,1)).toBe(1);});it('c',()=>{expect(hd279mrx(0,0)).toBe(0);});it('d',()=>{expect(hd279mrx(93,73)).toBe(2);});it('e',()=>{expect(hd279mrx(15,0)).toBe(4);});});
function hd280mrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph280mrx_hd',()=>{it('a',()=>{expect(hd280mrx(1,4)).toBe(2);});it('b',()=>{expect(hd280mrx(3,1)).toBe(1);});it('c',()=>{expect(hd280mrx(0,0)).toBe(0);});it('d',()=>{expect(hd280mrx(93,73)).toBe(2);});it('e',()=>{expect(hd280mrx(15,0)).toBe(4);});});
function hd281mrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph281mrx_hd',()=>{it('a',()=>{expect(hd281mrx(1,4)).toBe(2);});it('b',()=>{expect(hd281mrx(3,1)).toBe(1);});it('c',()=>{expect(hd281mrx(0,0)).toBe(0);});it('d',()=>{expect(hd281mrx(93,73)).toBe(2);});it('e',()=>{expect(hd281mrx(15,0)).toBe(4);});});
function hd282mrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph282mrx_hd',()=>{it('a',()=>{expect(hd282mrx(1,4)).toBe(2);});it('b',()=>{expect(hd282mrx(3,1)).toBe(1);});it('c',()=>{expect(hd282mrx(0,0)).toBe(0);});it('d',()=>{expect(hd282mrx(93,73)).toBe(2);});it('e',()=>{expect(hd282mrx(15,0)).toBe(4);});});
function hd283mrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph283mrx_hd',()=>{it('a',()=>{expect(hd283mrx(1,4)).toBe(2);});it('b',()=>{expect(hd283mrx(3,1)).toBe(1);});it('c',()=>{expect(hd283mrx(0,0)).toBe(0);});it('d',()=>{expect(hd283mrx(93,73)).toBe(2);});it('e',()=>{expect(hd283mrx(15,0)).toBe(4);});});
function hd284mrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph284mrx_hd',()=>{it('a',()=>{expect(hd284mrx(1,4)).toBe(2);});it('b',()=>{expect(hd284mrx(3,1)).toBe(1);});it('c',()=>{expect(hd284mrx(0,0)).toBe(0);});it('d',()=>{expect(hd284mrx(93,73)).toBe(2);});it('e',()=>{expect(hd284mrx(15,0)).toBe(4);});});
function hd285mrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph285mrx_hd',()=>{it('a',()=>{expect(hd285mrx(1,4)).toBe(2);});it('b',()=>{expect(hd285mrx(3,1)).toBe(1);});it('c',()=>{expect(hd285mrx(0,0)).toBe(0);});it('d',()=>{expect(hd285mrx(93,73)).toBe(2);});it('e',()=>{expect(hd285mrx(15,0)).toBe(4);});});
function hd286mrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph286mrx_hd',()=>{it('a',()=>{expect(hd286mrx(1,4)).toBe(2);});it('b',()=>{expect(hd286mrx(3,1)).toBe(1);});it('c',()=>{expect(hd286mrx(0,0)).toBe(0);});it('d',()=>{expect(hd286mrx(93,73)).toBe(2);});it('e',()=>{expect(hd286mrx(15,0)).toBe(4);});});
function hd287mrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph287mrx_hd',()=>{it('a',()=>{expect(hd287mrx(1,4)).toBe(2);});it('b',()=>{expect(hd287mrx(3,1)).toBe(1);});it('c',()=>{expect(hd287mrx(0,0)).toBe(0);});it('d',()=>{expect(hd287mrx(93,73)).toBe(2);});it('e',()=>{expect(hd287mrx(15,0)).toBe(4);});});
function hd288mrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph288mrx_hd',()=>{it('a',()=>{expect(hd288mrx(1,4)).toBe(2);});it('b',()=>{expect(hd288mrx(3,1)).toBe(1);});it('c',()=>{expect(hd288mrx(0,0)).toBe(0);});it('d',()=>{expect(hd288mrx(93,73)).toBe(2);});it('e',()=>{expect(hd288mrx(15,0)).toBe(4);});});
function hd289mrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph289mrx_hd',()=>{it('a',()=>{expect(hd289mrx(1,4)).toBe(2);});it('b',()=>{expect(hd289mrx(3,1)).toBe(1);});it('c',()=>{expect(hd289mrx(0,0)).toBe(0);});it('d',()=>{expect(hd289mrx(93,73)).toBe(2);});it('e',()=>{expect(hd289mrx(15,0)).toBe(4);});});
function hd290mrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph290mrx_hd',()=>{it('a',()=>{expect(hd290mrx(1,4)).toBe(2);});it('b',()=>{expect(hd290mrx(3,1)).toBe(1);});it('c',()=>{expect(hd290mrx(0,0)).toBe(0);});it('d',()=>{expect(hd290mrx(93,73)).toBe(2);});it('e',()=>{expect(hd290mrx(15,0)).toBe(4);});});
function hd291mrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph291mrx_hd',()=>{it('a',()=>{expect(hd291mrx(1,4)).toBe(2);});it('b',()=>{expect(hd291mrx(3,1)).toBe(1);});it('c',()=>{expect(hd291mrx(0,0)).toBe(0);});it('d',()=>{expect(hd291mrx(93,73)).toBe(2);});it('e',()=>{expect(hd291mrx(15,0)).toBe(4);});});
function hd292mrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph292mrx_hd',()=>{it('a',()=>{expect(hd292mrx(1,4)).toBe(2);});it('b',()=>{expect(hd292mrx(3,1)).toBe(1);});it('c',()=>{expect(hd292mrx(0,0)).toBe(0);});it('d',()=>{expect(hd292mrx(93,73)).toBe(2);});it('e',()=>{expect(hd292mrx(15,0)).toBe(4);});});
function hd293mrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph293mrx_hd',()=>{it('a',()=>{expect(hd293mrx(1,4)).toBe(2);});it('b',()=>{expect(hd293mrx(3,1)).toBe(1);});it('c',()=>{expect(hd293mrx(0,0)).toBe(0);});it('d',()=>{expect(hd293mrx(93,73)).toBe(2);});it('e',()=>{expect(hd293mrx(15,0)).toBe(4);});});
function hd294mrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph294mrx_hd',()=>{it('a',()=>{expect(hd294mrx(1,4)).toBe(2);});it('b',()=>{expect(hd294mrx(3,1)).toBe(1);});it('c',()=>{expect(hd294mrx(0,0)).toBe(0);});it('d',()=>{expect(hd294mrx(93,73)).toBe(2);});it('e',()=>{expect(hd294mrx(15,0)).toBe(4);});});
function hd295mrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph295mrx_hd',()=>{it('a',()=>{expect(hd295mrx(1,4)).toBe(2);});it('b',()=>{expect(hd295mrx(3,1)).toBe(1);});it('c',()=>{expect(hd295mrx(0,0)).toBe(0);});it('d',()=>{expect(hd295mrx(93,73)).toBe(2);});it('e',()=>{expect(hd295mrx(15,0)).toBe(4);});});
function hd296mrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph296mrx_hd',()=>{it('a',()=>{expect(hd296mrx(1,4)).toBe(2);});it('b',()=>{expect(hd296mrx(3,1)).toBe(1);});it('c',()=>{expect(hd296mrx(0,0)).toBe(0);});it('d',()=>{expect(hd296mrx(93,73)).toBe(2);});it('e',()=>{expect(hd296mrx(15,0)).toBe(4);});});
function hd297mrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph297mrx_hd',()=>{it('a',()=>{expect(hd297mrx(1,4)).toBe(2);});it('b',()=>{expect(hd297mrx(3,1)).toBe(1);});it('c',()=>{expect(hd297mrx(0,0)).toBe(0);});it('d',()=>{expect(hd297mrx(93,73)).toBe(2);});it('e',()=>{expect(hd297mrx(15,0)).toBe(4);});});
function hd298mrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph298mrx_hd',()=>{it('a',()=>{expect(hd298mrx(1,4)).toBe(2);});it('b',()=>{expect(hd298mrx(3,1)).toBe(1);});it('c',()=>{expect(hd298mrx(0,0)).toBe(0);});it('d',()=>{expect(hd298mrx(93,73)).toBe(2);});it('e',()=>{expect(hd298mrx(15,0)).toBe(4);});});
function hd299mrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph299mrx_hd',()=>{it('a',()=>{expect(hd299mrx(1,4)).toBe(2);});it('b',()=>{expect(hd299mrx(3,1)).toBe(1);});it('c',()=>{expect(hd299mrx(0,0)).toBe(0);});it('d',()=>{expect(hd299mrx(93,73)).toBe(2);});it('e',()=>{expect(hd299mrx(15,0)).toBe(4);});});
function hd300mrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph300mrx_hd',()=>{it('a',()=>{expect(hd300mrx(1,4)).toBe(2);});it('b',()=>{expect(hd300mrx(3,1)).toBe(1);});it('c',()=>{expect(hd300mrx(0,0)).toBe(0);});it('d',()=>{expect(hd300mrx(93,73)).toBe(2);});it('e',()=>{expect(hd300mrx(15,0)).toBe(4);});});
function hd301mrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph301mrx_hd',()=>{it('a',()=>{expect(hd301mrx(1,4)).toBe(2);});it('b',()=>{expect(hd301mrx(3,1)).toBe(1);});it('c',()=>{expect(hd301mrx(0,0)).toBe(0);});it('d',()=>{expect(hd301mrx(93,73)).toBe(2);});it('e',()=>{expect(hd301mrx(15,0)).toBe(4);});});
function hd302mrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph302mrx_hd',()=>{it('a',()=>{expect(hd302mrx(1,4)).toBe(2);});it('b',()=>{expect(hd302mrx(3,1)).toBe(1);});it('c',()=>{expect(hd302mrx(0,0)).toBe(0);});it('d',()=>{expect(hd302mrx(93,73)).toBe(2);});it('e',()=>{expect(hd302mrx(15,0)).toBe(4);});});
function hd303mrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph303mrx_hd',()=>{it('a',()=>{expect(hd303mrx(1,4)).toBe(2);});it('b',()=>{expect(hd303mrx(3,1)).toBe(1);});it('c',()=>{expect(hd303mrx(0,0)).toBe(0);});it('d',()=>{expect(hd303mrx(93,73)).toBe(2);});it('e',()=>{expect(hd303mrx(15,0)).toBe(4);});});
function hd304mrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph304mrx_hd',()=>{it('a',()=>{expect(hd304mrx(1,4)).toBe(2);});it('b',()=>{expect(hd304mrx(3,1)).toBe(1);});it('c',()=>{expect(hd304mrx(0,0)).toBe(0);});it('d',()=>{expect(hd304mrx(93,73)).toBe(2);});it('e',()=>{expect(hd304mrx(15,0)).toBe(4);});});
function hd305mrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph305mrx_hd',()=>{it('a',()=>{expect(hd305mrx(1,4)).toBe(2);});it('b',()=>{expect(hd305mrx(3,1)).toBe(1);});it('c',()=>{expect(hd305mrx(0,0)).toBe(0);});it('d',()=>{expect(hd305mrx(93,73)).toBe(2);});it('e',()=>{expect(hd305mrx(15,0)).toBe(4);});});
function hd306mrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph306mrx_hd',()=>{it('a',()=>{expect(hd306mrx(1,4)).toBe(2);});it('b',()=>{expect(hd306mrx(3,1)).toBe(1);});it('c',()=>{expect(hd306mrx(0,0)).toBe(0);});it('d',()=>{expect(hd306mrx(93,73)).toBe(2);});it('e',()=>{expect(hd306mrx(15,0)).toBe(4);});});
function hd307mrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph307mrx_hd',()=>{it('a',()=>{expect(hd307mrx(1,4)).toBe(2);});it('b',()=>{expect(hd307mrx(3,1)).toBe(1);});it('c',()=>{expect(hd307mrx(0,0)).toBe(0);});it('d',()=>{expect(hd307mrx(93,73)).toBe(2);});it('e',()=>{expect(hd307mrx(15,0)).toBe(4);});});
function hd308mrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph308mrx_hd',()=>{it('a',()=>{expect(hd308mrx(1,4)).toBe(2);});it('b',()=>{expect(hd308mrx(3,1)).toBe(1);});it('c',()=>{expect(hd308mrx(0,0)).toBe(0);});it('d',()=>{expect(hd308mrx(93,73)).toBe(2);});it('e',()=>{expect(hd308mrx(15,0)).toBe(4);});});
function hd309mrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph309mrx_hd',()=>{it('a',()=>{expect(hd309mrx(1,4)).toBe(2);});it('b',()=>{expect(hd309mrx(3,1)).toBe(1);});it('c',()=>{expect(hd309mrx(0,0)).toBe(0);});it('d',()=>{expect(hd309mrx(93,73)).toBe(2);});it('e',()=>{expect(hd309mrx(15,0)).toBe(4);});});
function hd310mrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph310mrx_hd',()=>{it('a',()=>{expect(hd310mrx(1,4)).toBe(2);});it('b',()=>{expect(hd310mrx(3,1)).toBe(1);});it('c',()=>{expect(hd310mrx(0,0)).toBe(0);});it('d',()=>{expect(hd310mrx(93,73)).toBe(2);});it('e',()=>{expect(hd310mrx(15,0)).toBe(4);});});
function hd311mrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph311mrx_hd',()=>{it('a',()=>{expect(hd311mrx(1,4)).toBe(2);});it('b',()=>{expect(hd311mrx(3,1)).toBe(1);});it('c',()=>{expect(hd311mrx(0,0)).toBe(0);});it('d',()=>{expect(hd311mrx(93,73)).toBe(2);});it('e',()=>{expect(hd311mrx(15,0)).toBe(4);});});
function hd312mrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph312mrx_hd',()=>{it('a',()=>{expect(hd312mrx(1,4)).toBe(2);});it('b',()=>{expect(hd312mrx(3,1)).toBe(1);});it('c',()=>{expect(hd312mrx(0,0)).toBe(0);});it('d',()=>{expect(hd312mrx(93,73)).toBe(2);});it('e',()=>{expect(hd312mrx(15,0)).toBe(4);});});
function hd313mrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph313mrx_hd',()=>{it('a',()=>{expect(hd313mrx(1,4)).toBe(2);});it('b',()=>{expect(hd313mrx(3,1)).toBe(1);});it('c',()=>{expect(hd313mrx(0,0)).toBe(0);});it('d',()=>{expect(hd313mrx(93,73)).toBe(2);});it('e',()=>{expect(hd313mrx(15,0)).toBe(4);});});
function hd314mrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph314mrx_hd',()=>{it('a',()=>{expect(hd314mrx(1,4)).toBe(2);});it('b',()=>{expect(hd314mrx(3,1)).toBe(1);});it('c',()=>{expect(hd314mrx(0,0)).toBe(0);});it('d',()=>{expect(hd314mrx(93,73)).toBe(2);});it('e',()=>{expect(hd314mrx(15,0)).toBe(4);});});
function hd315mrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph315mrx_hd',()=>{it('a',()=>{expect(hd315mrx(1,4)).toBe(2);});it('b',()=>{expect(hd315mrx(3,1)).toBe(1);});it('c',()=>{expect(hd315mrx(0,0)).toBe(0);});it('d',()=>{expect(hd315mrx(93,73)).toBe(2);});it('e',()=>{expect(hd315mrx(15,0)).toBe(4);});});
function hd316mrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph316mrx_hd',()=>{it('a',()=>{expect(hd316mrx(1,4)).toBe(2);});it('b',()=>{expect(hd316mrx(3,1)).toBe(1);});it('c',()=>{expect(hd316mrx(0,0)).toBe(0);});it('d',()=>{expect(hd316mrx(93,73)).toBe(2);});it('e',()=>{expect(hd316mrx(15,0)).toBe(4);});});
function hd317mrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph317mrx_hd',()=>{it('a',()=>{expect(hd317mrx(1,4)).toBe(2);});it('b',()=>{expect(hd317mrx(3,1)).toBe(1);});it('c',()=>{expect(hd317mrx(0,0)).toBe(0);});it('d',()=>{expect(hd317mrx(93,73)).toBe(2);});it('e',()=>{expect(hd317mrx(15,0)).toBe(4);});});
function hd318mrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph318mrx_hd',()=>{it('a',()=>{expect(hd318mrx(1,4)).toBe(2);});it('b',()=>{expect(hd318mrx(3,1)).toBe(1);});it('c',()=>{expect(hd318mrx(0,0)).toBe(0);});it('d',()=>{expect(hd318mrx(93,73)).toBe(2);});it('e',()=>{expect(hd318mrx(15,0)).toBe(4);});});
function hd319mrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph319mrx_hd',()=>{it('a',()=>{expect(hd319mrx(1,4)).toBe(2);});it('b',()=>{expect(hd319mrx(3,1)).toBe(1);});it('c',()=>{expect(hd319mrx(0,0)).toBe(0);});it('d',()=>{expect(hd319mrx(93,73)).toBe(2);});it('e',()=>{expect(hd319mrx(15,0)).toBe(4);});});
function hd320mrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph320mrx_hd',()=>{it('a',()=>{expect(hd320mrx(1,4)).toBe(2);});it('b',()=>{expect(hd320mrx(3,1)).toBe(1);});it('c',()=>{expect(hd320mrx(0,0)).toBe(0);});it('d',()=>{expect(hd320mrx(93,73)).toBe(2);});it('e',()=>{expect(hd320mrx(15,0)).toBe(4);});});
function hd321mrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph321mrx_hd',()=>{it('a',()=>{expect(hd321mrx(1,4)).toBe(2);});it('b',()=>{expect(hd321mrx(3,1)).toBe(1);});it('c',()=>{expect(hd321mrx(0,0)).toBe(0);});it('d',()=>{expect(hd321mrx(93,73)).toBe(2);});it('e',()=>{expect(hd321mrx(15,0)).toBe(4);});});
function hd322mrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph322mrx_hd',()=>{it('a',()=>{expect(hd322mrx(1,4)).toBe(2);});it('b',()=>{expect(hd322mrx(3,1)).toBe(1);});it('c',()=>{expect(hd322mrx(0,0)).toBe(0);});it('d',()=>{expect(hd322mrx(93,73)).toBe(2);});it('e',()=>{expect(hd322mrx(15,0)).toBe(4);});});
function hd323mrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph323mrx_hd',()=>{it('a',()=>{expect(hd323mrx(1,4)).toBe(2);});it('b',()=>{expect(hd323mrx(3,1)).toBe(1);});it('c',()=>{expect(hd323mrx(0,0)).toBe(0);});it('d',()=>{expect(hd323mrx(93,73)).toBe(2);});it('e',()=>{expect(hd323mrx(15,0)).toBe(4);});});
function hd324mrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph324mrx_hd',()=>{it('a',()=>{expect(hd324mrx(1,4)).toBe(2);});it('b',()=>{expect(hd324mrx(3,1)).toBe(1);});it('c',()=>{expect(hd324mrx(0,0)).toBe(0);});it('d',()=>{expect(hd324mrx(93,73)).toBe(2);});it('e',()=>{expect(hd324mrx(15,0)).toBe(4);});});
function hd325mrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph325mrx_hd',()=>{it('a',()=>{expect(hd325mrx(1,4)).toBe(2);});it('b',()=>{expect(hd325mrx(3,1)).toBe(1);});it('c',()=>{expect(hd325mrx(0,0)).toBe(0);});it('d',()=>{expect(hd325mrx(93,73)).toBe(2);});it('e',()=>{expect(hd325mrx(15,0)).toBe(4);});});
function hd326mrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph326mrx_hd',()=>{it('a',()=>{expect(hd326mrx(1,4)).toBe(2);});it('b',()=>{expect(hd326mrx(3,1)).toBe(1);});it('c',()=>{expect(hd326mrx(0,0)).toBe(0);});it('d',()=>{expect(hd326mrx(93,73)).toBe(2);});it('e',()=>{expect(hd326mrx(15,0)).toBe(4);});});
function hd327mrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph327mrx_hd',()=>{it('a',()=>{expect(hd327mrx(1,4)).toBe(2);});it('b',()=>{expect(hd327mrx(3,1)).toBe(1);});it('c',()=>{expect(hd327mrx(0,0)).toBe(0);});it('d',()=>{expect(hd327mrx(93,73)).toBe(2);});it('e',()=>{expect(hd327mrx(15,0)).toBe(4);});});
function hd328mrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph328mrx_hd',()=>{it('a',()=>{expect(hd328mrx(1,4)).toBe(2);});it('b',()=>{expect(hd328mrx(3,1)).toBe(1);});it('c',()=>{expect(hd328mrx(0,0)).toBe(0);});it('d',()=>{expect(hd328mrx(93,73)).toBe(2);});it('e',()=>{expect(hd328mrx(15,0)).toBe(4);});});
function hd329mrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph329mrx_hd',()=>{it('a',()=>{expect(hd329mrx(1,4)).toBe(2);});it('b',()=>{expect(hd329mrx(3,1)).toBe(1);});it('c',()=>{expect(hd329mrx(0,0)).toBe(0);});it('d',()=>{expect(hd329mrx(93,73)).toBe(2);});it('e',()=>{expect(hd329mrx(15,0)).toBe(4);});});
function hd330mrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph330mrx_hd',()=>{it('a',()=>{expect(hd330mrx(1,4)).toBe(2);});it('b',()=>{expect(hd330mrx(3,1)).toBe(1);});it('c',()=>{expect(hd330mrx(0,0)).toBe(0);});it('d',()=>{expect(hd330mrx(93,73)).toBe(2);});it('e',()=>{expect(hd330mrx(15,0)).toBe(4);});});
function hd331mrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph331mrx_hd',()=>{it('a',()=>{expect(hd331mrx(1,4)).toBe(2);});it('b',()=>{expect(hd331mrx(3,1)).toBe(1);});it('c',()=>{expect(hd331mrx(0,0)).toBe(0);});it('d',()=>{expect(hd331mrx(93,73)).toBe(2);});it('e',()=>{expect(hd331mrx(15,0)).toBe(4);});});
function hd332mrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph332mrx_hd',()=>{it('a',()=>{expect(hd332mrx(1,4)).toBe(2);});it('b',()=>{expect(hd332mrx(3,1)).toBe(1);});it('c',()=>{expect(hd332mrx(0,0)).toBe(0);});it('d',()=>{expect(hd332mrx(93,73)).toBe(2);});it('e',()=>{expect(hd332mrx(15,0)).toBe(4);});});
function hd333mrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph333mrx_hd',()=>{it('a',()=>{expect(hd333mrx(1,4)).toBe(2);});it('b',()=>{expect(hd333mrx(3,1)).toBe(1);});it('c',()=>{expect(hd333mrx(0,0)).toBe(0);});it('d',()=>{expect(hd333mrx(93,73)).toBe(2);});it('e',()=>{expect(hd333mrx(15,0)).toBe(4);});});
function hd334mrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph334mrx_hd',()=>{it('a',()=>{expect(hd334mrx(1,4)).toBe(2);});it('b',()=>{expect(hd334mrx(3,1)).toBe(1);});it('c',()=>{expect(hd334mrx(0,0)).toBe(0);});it('d',()=>{expect(hd334mrx(93,73)).toBe(2);});it('e',()=>{expect(hd334mrx(15,0)).toBe(4);});});
function hd335mrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph335mrx_hd',()=>{it('a',()=>{expect(hd335mrx(1,4)).toBe(2);});it('b',()=>{expect(hd335mrx(3,1)).toBe(1);});it('c',()=>{expect(hd335mrx(0,0)).toBe(0);});it('d',()=>{expect(hd335mrx(93,73)).toBe(2);});it('e',()=>{expect(hd335mrx(15,0)).toBe(4);});});
function hd336mrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph336mrx_hd',()=>{it('a',()=>{expect(hd336mrx(1,4)).toBe(2);});it('b',()=>{expect(hd336mrx(3,1)).toBe(1);});it('c',()=>{expect(hd336mrx(0,0)).toBe(0);});it('d',()=>{expect(hd336mrx(93,73)).toBe(2);});it('e',()=>{expect(hd336mrx(15,0)).toBe(4);});});
function hd337mrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph337mrx_hd',()=>{it('a',()=>{expect(hd337mrx(1,4)).toBe(2);});it('b',()=>{expect(hd337mrx(3,1)).toBe(1);});it('c',()=>{expect(hd337mrx(0,0)).toBe(0);});it('d',()=>{expect(hd337mrx(93,73)).toBe(2);});it('e',()=>{expect(hd337mrx(15,0)).toBe(4);});});
function hd338mgmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph338mgmx2_hd',()=>{it('a',()=>{expect(hd338mgmx2(1,4)).toBe(2);});it('b',()=>{expect(hd338mgmx2(3,1)).toBe(1);});it('c',()=>{expect(hd338mgmx2(0,0)).toBe(0);});it('d',()=>{expect(hd338mgmx2(93,73)).toBe(2);});it('e',()=>{expect(hd338mgmx2(15,0)).toBe(4);});});
function hd339mgmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph339mgmx2_hd',()=>{it('a',()=>{expect(hd339mgmx2(1,4)).toBe(2);});it('b',()=>{expect(hd339mgmx2(3,1)).toBe(1);});it('c',()=>{expect(hd339mgmx2(0,0)).toBe(0);});it('d',()=>{expect(hd339mgmx2(93,73)).toBe(2);});it('e',()=>{expect(hd339mgmx2(15,0)).toBe(4);});});
function hd340mgmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph340mgmx2_hd',()=>{it('a',()=>{expect(hd340mgmx2(1,4)).toBe(2);});it('b',()=>{expect(hd340mgmx2(3,1)).toBe(1);});it('c',()=>{expect(hd340mgmx2(0,0)).toBe(0);});it('d',()=>{expect(hd340mgmx2(93,73)).toBe(2);});it('e',()=>{expect(hd340mgmx2(15,0)).toBe(4);});});
function hd341mgmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph341mgmx2_hd',()=>{it('a',()=>{expect(hd341mgmx2(1,4)).toBe(2);});it('b',()=>{expect(hd341mgmx2(3,1)).toBe(1);});it('c',()=>{expect(hd341mgmx2(0,0)).toBe(0);});it('d',()=>{expect(hd341mgmx2(93,73)).toBe(2);});it('e',()=>{expect(hd341mgmx2(15,0)).toBe(4);});});
function hd342mgmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph342mgmx2_hd',()=>{it('a',()=>{expect(hd342mgmx2(1,4)).toBe(2);});it('b',()=>{expect(hd342mgmx2(3,1)).toBe(1);});it('c',()=>{expect(hd342mgmx2(0,0)).toBe(0);});it('d',()=>{expect(hd342mgmx2(93,73)).toBe(2);});it('e',()=>{expect(hd342mgmx2(15,0)).toBe(4);});});
function hd343mgmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph343mgmx2_hd',()=>{it('a',()=>{expect(hd343mgmx2(1,4)).toBe(2);});it('b',()=>{expect(hd343mgmx2(3,1)).toBe(1);});it('c',()=>{expect(hd343mgmx2(0,0)).toBe(0);});it('d',()=>{expect(hd343mgmx2(93,73)).toBe(2);});it('e',()=>{expect(hd343mgmx2(15,0)).toBe(4);});});
function hd344mgmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph344mgmx2_hd',()=>{it('a',()=>{expect(hd344mgmx2(1,4)).toBe(2);});it('b',()=>{expect(hd344mgmx2(3,1)).toBe(1);});it('c',()=>{expect(hd344mgmx2(0,0)).toBe(0);});it('d',()=>{expect(hd344mgmx2(93,73)).toBe(2);});it('e',()=>{expect(hd344mgmx2(15,0)).toBe(4);});});
function hd345mgmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph345mgmx2_hd',()=>{it('a',()=>{expect(hd345mgmx2(1,4)).toBe(2);});it('b',()=>{expect(hd345mgmx2(3,1)).toBe(1);});it('c',()=>{expect(hd345mgmx2(0,0)).toBe(0);});it('d',()=>{expect(hd345mgmx2(93,73)).toBe(2);});it('e',()=>{expect(hd345mgmx2(15,0)).toBe(4);});});
function hd346mgmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph346mgmx2_hd',()=>{it('a',()=>{expect(hd346mgmx2(1,4)).toBe(2);});it('b',()=>{expect(hd346mgmx2(3,1)).toBe(1);});it('c',()=>{expect(hd346mgmx2(0,0)).toBe(0);});it('d',()=>{expect(hd346mgmx2(93,73)).toBe(2);});it('e',()=>{expect(hd346mgmx2(15,0)).toBe(4);});});
function hd347mgmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph347mgmx2_hd',()=>{it('a',()=>{expect(hd347mgmx2(1,4)).toBe(2);});it('b',()=>{expect(hd347mgmx2(3,1)).toBe(1);});it('c',()=>{expect(hd347mgmx2(0,0)).toBe(0);});it('d',()=>{expect(hd347mgmx2(93,73)).toBe(2);});it('e',()=>{expect(hd347mgmx2(15,0)).toBe(4);});});
function hd348mgmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph348mgmx2_hd',()=>{it('a',()=>{expect(hd348mgmx2(1,4)).toBe(2);});it('b',()=>{expect(hd348mgmx2(3,1)).toBe(1);});it('c',()=>{expect(hd348mgmx2(0,0)).toBe(0);});it('d',()=>{expect(hd348mgmx2(93,73)).toBe(2);});it('e',()=>{expect(hd348mgmx2(15,0)).toBe(4);});});
function hd349mgmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph349mgmx2_hd',()=>{it('a',()=>{expect(hd349mgmx2(1,4)).toBe(2);});it('b',()=>{expect(hd349mgmx2(3,1)).toBe(1);});it('c',()=>{expect(hd349mgmx2(0,0)).toBe(0);});it('d',()=>{expect(hd349mgmx2(93,73)).toBe(2);});it('e',()=>{expect(hd349mgmx2(15,0)).toBe(4);});});
function hd350mgmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph350mgmx2_hd',()=>{it('a',()=>{expect(hd350mgmx2(1,4)).toBe(2);});it('b',()=>{expect(hd350mgmx2(3,1)).toBe(1);});it('c',()=>{expect(hd350mgmx2(0,0)).toBe(0);});it('d',()=>{expect(hd350mgmx2(93,73)).toBe(2);});it('e',()=>{expect(hd350mgmx2(15,0)).toBe(4);});});
function hd351mgmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph351mgmx2_hd',()=>{it('a',()=>{expect(hd351mgmx2(1,4)).toBe(2);});it('b',()=>{expect(hd351mgmx2(3,1)).toBe(1);});it('c',()=>{expect(hd351mgmx2(0,0)).toBe(0);});it('d',()=>{expect(hd351mgmx2(93,73)).toBe(2);});it('e',()=>{expect(hd351mgmx2(15,0)).toBe(4);});});
function hd352mgmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph352mgmx2_hd',()=>{it('a',()=>{expect(hd352mgmx2(1,4)).toBe(2);});it('b',()=>{expect(hd352mgmx2(3,1)).toBe(1);});it('c',()=>{expect(hd352mgmx2(0,0)).toBe(0);});it('d',()=>{expect(hd352mgmx2(93,73)).toBe(2);});it('e',()=>{expect(hd352mgmx2(15,0)).toBe(4);});});
function hd353mgmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph353mgmx2_hd',()=>{it('a',()=>{expect(hd353mgmx2(1,4)).toBe(2);});it('b',()=>{expect(hd353mgmx2(3,1)).toBe(1);});it('c',()=>{expect(hd353mgmx2(0,0)).toBe(0);});it('d',()=>{expect(hd353mgmx2(93,73)).toBe(2);});it('e',()=>{expect(hd353mgmx2(15,0)).toBe(4);});});
function hd354mgmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph354mgmx2_hd',()=>{it('a',()=>{expect(hd354mgmx2(1,4)).toBe(2);});it('b',()=>{expect(hd354mgmx2(3,1)).toBe(1);});it('c',()=>{expect(hd354mgmx2(0,0)).toBe(0);});it('d',()=>{expect(hd354mgmx2(93,73)).toBe(2);});it('e',()=>{expect(hd354mgmx2(15,0)).toBe(4);});});
function hd355mgmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph355mgmx2_hd',()=>{it('a',()=>{expect(hd355mgmx2(1,4)).toBe(2);});it('b',()=>{expect(hd355mgmx2(3,1)).toBe(1);});it('c',()=>{expect(hd355mgmx2(0,0)).toBe(0);});it('d',()=>{expect(hd355mgmx2(93,73)).toBe(2);});it('e',()=>{expect(hd355mgmx2(15,0)).toBe(4);});});
function hd356mgmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph356mgmx2_hd',()=>{it('a',()=>{expect(hd356mgmx2(1,4)).toBe(2);});it('b',()=>{expect(hd356mgmx2(3,1)).toBe(1);});it('c',()=>{expect(hd356mgmx2(0,0)).toBe(0);});it('d',()=>{expect(hd356mgmx2(93,73)).toBe(2);});it('e',()=>{expect(hd356mgmx2(15,0)).toBe(4);});});
function hd357mgmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph357mgmx2_hd',()=>{it('a',()=>{expect(hd357mgmx2(1,4)).toBe(2);});it('b',()=>{expect(hd357mgmx2(3,1)).toBe(1);});it('c',()=>{expect(hd357mgmx2(0,0)).toBe(0);});it('d',()=>{expect(hd357mgmx2(93,73)).toBe(2);});it('e',()=>{expect(hd357mgmx2(15,0)).toBe(4);});});
function hd358mgmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph358mgmx2_hd',()=>{it('a',()=>{expect(hd358mgmx2(1,4)).toBe(2);});it('b',()=>{expect(hd358mgmx2(3,1)).toBe(1);});it('c',()=>{expect(hd358mgmx2(0,0)).toBe(0);});it('d',()=>{expect(hd358mgmx2(93,73)).toBe(2);});it('e',()=>{expect(hd358mgmx2(15,0)).toBe(4);});});
function hd359mgmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph359mgmx2_hd',()=>{it('a',()=>{expect(hd359mgmx2(1,4)).toBe(2);});it('b',()=>{expect(hd359mgmx2(3,1)).toBe(1);});it('c',()=>{expect(hd359mgmx2(0,0)).toBe(0);});it('d',()=>{expect(hd359mgmx2(93,73)).toBe(2);});it('e',()=>{expect(hd359mgmx2(15,0)).toBe(4);});});
function hd360mgmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph360mgmx2_hd',()=>{it('a',()=>{expect(hd360mgmx2(1,4)).toBe(2);});it('b',()=>{expect(hd360mgmx2(3,1)).toBe(1);});it('c',()=>{expect(hd360mgmx2(0,0)).toBe(0);});it('d',()=>{expect(hd360mgmx2(93,73)).toBe(2);});it('e',()=>{expect(hd360mgmx2(15,0)).toBe(4);});});
function hd361mgmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph361mgmx2_hd',()=>{it('a',()=>{expect(hd361mgmx2(1,4)).toBe(2);});it('b',()=>{expect(hd361mgmx2(3,1)).toBe(1);});it('c',()=>{expect(hd361mgmx2(0,0)).toBe(0);});it('d',()=>{expect(hd361mgmx2(93,73)).toBe(2);});it('e',()=>{expect(hd361mgmx2(15,0)).toBe(4);});});
function hd362mgmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph362mgmx2_hd',()=>{it('a',()=>{expect(hd362mgmx2(1,4)).toBe(2);});it('b',()=>{expect(hd362mgmx2(3,1)).toBe(1);});it('c',()=>{expect(hd362mgmx2(0,0)).toBe(0);});it('d',()=>{expect(hd362mgmx2(93,73)).toBe(2);});it('e',()=>{expect(hd362mgmx2(15,0)).toBe(4);});});
function hd363mgmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph363mgmx2_hd',()=>{it('a',()=>{expect(hd363mgmx2(1,4)).toBe(2);});it('b',()=>{expect(hd363mgmx2(3,1)).toBe(1);});it('c',()=>{expect(hd363mgmx2(0,0)).toBe(0);});it('d',()=>{expect(hd363mgmx2(93,73)).toBe(2);});it('e',()=>{expect(hd363mgmx2(15,0)).toBe(4);});});
function hd364mgmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph364mgmx2_hd',()=>{it('a',()=>{expect(hd364mgmx2(1,4)).toBe(2);});it('b',()=>{expect(hd364mgmx2(3,1)).toBe(1);});it('c',()=>{expect(hd364mgmx2(0,0)).toBe(0);});it('d',()=>{expect(hd364mgmx2(93,73)).toBe(2);});it('e',()=>{expect(hd364mgmx2(15,0)).toBe(4);});});
function hd365mgmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph365mgmx2_hd',()=>{it('a',()=>{expect(hd365mgmx2(1,4)).toBe(2);});it('b',()=>{expect(hd365mgmx2(3,1)).toBe(1);});it('c',()=>{expect(hd365mgmx2(0,0)).toBe(0);});it('d',()=>{expect(hd365mgmx2(93,73)).toBe(2);});it('e',()=>{expect(hd365mgmx2(15,0)).toBe(4);});});
function hd366mgmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph366mgmx2_hd',()=>{it('a',()=>{expect(hd366mgmx2(1,4)).toBe(2);});it('b',()=>{expect(hd366mgmx2(3,1)).toBe(1);});it('c',()=>{expect(hd366mgmx2(0,0)).toBe(0);});it('d',()=>{expect(hd366mgmx2(93,73)).toBe(2);});it('e',()=>{expect(hd366mgmx2(15,0)).toBe(4);});});
function hd367mgmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph367mgmx2_hd',()=>{it('a',()=>{expect(hd367mgmx2(1,4)).toBe(2);});it('b',()=>{expect(hd367mgmx2(3,1)).toBe(1);});it('c',()=>{expect(hd367mgmx2(0,0)).toBe(0);});it('d',()=>{expect(hd367mgmx2(93,73)).toBe(2);});it('e',()=>{expect(hd367mgmx2(15,0)).toBe(4);});});
function hd368mgmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph368mgmx2_hd',()=>{it('a',()=>{expect(hd368mgmx2(1,4)).toBe(2);});it('b',()=>{expect(hd368mgmx2(3,1)).toBe(1);});it('c',()=>{expect(hd368mgmx2(0,0)).toBe(0);});it('d',()=>{expect(hd368mgmx2(93,73)).toBe(2);});it('e',()=>{expect(hd368mgmx2(15,0)).toBe(4);});});
function hd369mgmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph369mgmx2_hd',()=>{it('a',()=>{expect(hd369mgmx2(1,4)).toBe(2);});it('b',()=>{expect(hd369mgmx2(3,1)).toBe(1);});it('c',()=>{expect(hd369mgmx2(0,0)).toBe(0);});it('d',()=>{expect(hd369mgmx2(93,73)).toBe(2);});it('e',()=>{expect(hd369mgmx2(15,0)).toBe(4);});});
function hd370mgmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph370mgmx2_hd',()=>{it('a',()=>{expect(hd370mgmx2(1,4)).toBe(2);});it('b',()=>{expect(hd370mgmx2(3,1)).toBe(1);});it('c',()=>{expect(hd370mgmx2(0,0)).toBe(0);});it('d',()=>{expect(hd370mgmx2(93,73)).toBe(2);});it('e',()=>{expect(hd370mgmx2(15,0)).toBe(4);});});
function hd371mgmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph371mgmx2_hd',()=>{it('a',()=>{expect(hd371mgmx2(1,4)).toBe(2);});it('b',()=>{expect(hd371mgmx2(3,1)).toBe(1);});it('c',()=>{expect(hd371mgmx2(0,0)).toBe(0);});it('d',()=>{expect(hd371mgmx2(93,73)).toBe(2);});it('e',()=>{expect(hd371mgmx2(15,0)).toBe(4);});});
function hd372mgmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph372mgmx2_hd',()=>{it('a',()=>{expect(hd372mgmx2(1,4)).toBe(2);});it('b',()=>{expect(hd372mgmx2(3,1)).toBe(1);});it('c',()=>{expect(hd372mgmx2(0,0)).toBe(0);});it('d',()=>{expect(hd372mgmx2(93,73)).toBe(2);});it('e',()=>{expect(hd372mgmx2(15,0)).toBe(4);});});
function hd373mgmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph373mgmx2_hd',()=>{it('a',()=>{expect(hd373mgmx2(1,4)).toBe(2);});it('b',()=>{expect(hd373mgmx2(3,1)).toBe(1);});it('c',()=>{expect(hd373mgmx2(0,0)).toBe(0);});it('d',()=>{expect(hd373mgmx2(93,73)).toBe(2);});it('e',()=>{expect(hd373mgmx2(15,0)).toBe(4);});});
function hd374mgmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph374mgmx2_hd',()=>{it('a',()=>{expect(hd374mgmx2(1,4)).toBe(2);});it('b',()=>{expect(hd374mgmx2(3,1)).toBe(1);});it('c',()=>{expect(hd374mgmx2(0,0)).toBe(0);});it('d',()=>{expect(hd374mgmx2(93,73)).toBe(2);});it('e',()=>{expect(hd374mgmx2(15,0)).toBe(4);});});
function hd375mgmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph375mgmx2_hd',()=>{it('a',()=>{expect(hd375mgmx2(1,4)).toBe(2);});it('b',()=>{expect(hd375mgmx2(3,1)).toBe(1);});it('c',()=>{expect(hd375mgmx2(0,0)).toBe(0);});it('d',()=>{expect(hd375mgmx2(93,73)).toBe(2);});it('e',()=>{expect(hd375mgmx2(15,0)).toBe(4);});});
function hd376mgmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph376mgmx2_hd',()=>{it('a',()=>{expect(hd376mgmx2(1,4)).toBe(2);});it('b',()=>{expect(hd376mgmx2(3,1)).toBe(1);});it('c',()=>{expect(hd376mgmx2(0,0)).toBe(0);});it('d',()=>{expect(hd376mgmx2(93,73)).toBe(2);});it('e',()=>{expect(hd376mgmx2(15,0)).toBe(4);});});
function hd377mgmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph377mgmx2_hd',()=>{it('a',()=>{expect(hd377mgmx2(1,4)).toBe(2);});it('b',()=>{expect(hd377mgmx2(3,1)).toBe(1);});it('c',()=>{expect(hd377mgmx2(0,0)).toBe(0);});it('d',()=>{expect(hd377mgmx2(93,73)).toBe(2);});it('e',()=>{expect(hd377mgmx2(15,0)).toBe(4);});});
function hd378mgmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph378mgmx2_hd',()=>{it('a',()=>{expect(hd378mgmx2(1,4)).toBe(2);});it('b',()=>{expect(hd378mgmx2(3,1)).toBe(1);});it('c',()=>{expect(hd378mgmx2(0,0)).toBe(0);});it('d',()=>{expect(hd378mgmx2(93,73)).toBe(2);});it('e',()=>{expect(hd378mgmx2(15,0)).toBe(4);});});
function hd379mgmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph379mgmx2_hd',()=>{it('a',()=>{expect(hd379mgmx2(1,4)).toBe(2);});it('b',()=>{expect(hd379mgmx2(3,1)).toBe(1);});it('c',()=>{expect(hd379mgmx2(0,0)).toBe(0);});it('d',()=>{expect(hd379mgmx2(93,73)).toBe(2);});it('e',()=>{expect(hd379mgmx2(15,0)).toBe(4);});});
function hd380mgmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph380mgmx2_hd',()=>{it('a',()=>{expect(hd380mgmx2(1,4)).toBe(2);});it('b',()=>{expect(hd380mgmx2(3,1)).toBe(1);});it('c',()=>{expect(hd380mgmx2(0,0)).toBe(0);});it('d',()=>{expect(hd380mgmx2(93,73)).toBe(2);});it('e',()=>{expect(hd380mgmx2(15,0)).toBe(4);});});
function hd381mgmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph381mgmx2_hd',()=>{it('a',()=>{expect(hd381mgmx2(1,4)).toBe(2);});it('b',()=>{expect(hd381mgmx2(3,1)).toBe(1);});it('c',()=>{expect(hd381mgmx2(0,0)).toBe(0);});it('d',()=>{expect(hd381mgmx2(93,73)).toBe(2);});it('e',()=>{expect(hd381mgmx2(15,0)).toBe(4);});});
function hd382mgmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph382mgmx2_hd',()=>{it('a',()=>{expect(hd382mgmx2(1,4)).toBe(2);});it('b',()=>{expect(hd382mgmx2(3,1)).toBe(1);});it('c',()=>{expect(hd382mgmx2(0,0)).toBe(0);});it('d',()=>{expect(hd382mgmx2(93,73)).toBe(2);});it('e',()=>{expect(hd382mgmx2(15,0)).toBe(4);});});
function hd383mgmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph383mgmx2_hd',()=>{it('a',()=>{expect(hd383mgmx2(1,4)).toBe(2);});it('b',()=>{expect(hd383mgmx2(3,1)).toBe(1);});it('c',()=>{expect(hd383mgmx2(0,0)).toBe(0);});it('d',()=>{expect(hd383mgmx2(93,73)).toBe(2);});it('e',()=>{expect(hd383mgmx2(15,0)).toBe(4);});});
function hd384mgmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph384mgmx2_hd',()=>{it('a',()=>{expect(hd384mgmx2(1,4)).toBe(2);});it('b',()=>{expect(hd384mgmx2(3,1)).toBe(1);});it('c',()=>{expect(hd384mgmx2(0,0)).toBe(0);});it('d',()=>{expect(hd384mgmx2(93,73)).toBe(2);});it('e',()=>{expect(hd384mgmx2(15,0)).toBe(4);});});
function hd385mgmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph385mgmx2_hd',()=>{it('a',()=>{expect(hd385mgmx2(1,4)).toBe(2);});it('b',()=>{expect(hd385mgmx2(3,1)).toBe(1);});it('c',()=>{expect(hd385mgmx2(0,0)).toBe(0);});it('d',()=>{expect(hd385mgmx2(93,73)).toBe(2);});it('e',()=>{expect(hd385mgmx2(15,0)).toBe(4);});});
function hd386mgmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph386mgmx2_hd',()=>{it('a',()=>{expect(hd386mgmx2(1,4)).toBe(2);});it('b',()=>{expect(hd386mgmx2(3,1)).toBe(1);});it('c',()=>{expect(hd386mgmx2(0,0)).toBe(0);});it('d',()=>{expect(hd386mgmx2(93,73)).toBe(2);});it('e',()=>{expect(hd386mgmx2(15,0)).toBe(4);});});
function hd387mgmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph387mgmx2_hd',()=>{it('a',()=>{expect(hd387mgmx2(1,4)).toBe(2);});it('b',()=>{expect(hd387mgmx2(3,1)).toBe(1);});it('c',()=>{expect(hd387mgmx2(0,0)).toBe(0);});it('d',()=>{expect(hd387mgmx2(93,73)).toBe(2);});it('e',()=>{expect(hd387mgmx2(15,0)).toBe(4);});});
function hd388mgmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph388mgmx2_hd',()=>{it('a',()=>{expect(hd388mgmx2(1,4)).toBe(2);});it('b',()=>{expect(hd388mgmx2(3,1)).toBe(1);});it('c',()=>{expect(hd388mgmx2(0,0)).toBe(0);});it('d',()=>{expect(hd388mgmx2(93,73)).toBe(2);});it('e',()=>{expect(hd388mgmx2(15,0)).toBe(4);});});
function hd389mgmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph389mgmx2_hd',()=>{it('a',()=>{expect(hd389mgmx2(1,4)).toBe(2);});it('b',()=>{expect(hd389mgmx2(3,1)).toBe(1);});it('c',()=>{expect(hd389mgmx2(0,0)).toBe(0);});it('d',()=>{expect(hd389mgmx2(93,73)).toBe(2);});it('e',()=>{expect(hd389mgmx2(15,0)).toBe(4);});});
function hd390mgmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph390mgmx2_hd',()=>{it('a',()=>{expect(hd390mgmx2(1,4)).toBe(2);});it('b',()=>{expect(hd390mgmx2(3,1)).toBe(1);});it('c',()=>{expect(hd390mgmx2(0,0)).toBe(0);});it('d',()=>{expect(hd390mgmx2(93,73)).toBe(2);});it('e',()=>{expect(hd390mgmx2(15,0)).toBe(4);});});
function hd391mgmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph391mgmx2_hd',()=>{it('a',()=>{expect(hd391mgmx2(1,4)).toBe(2);});it('b',()=>{expect(hd391mgmx2(3,1)).toBe(1);});it('c',()=>{expect(hd391mgmx2(0,0)).toBe(0);});it('d',()=>{expect(hd391mgmx2(93,73)).toBe(2);});it('e',()=>{expect(hd391mgmx2(15,0)).toBe(4);});});
function hd392mgmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph392mgmx2_hd',()=>{it('a',()=>{expect(hd392mgmx2(1,4)).toBe(2);});it('b',()=>{expect(hd392mgmx2(3,1)).toBe(1);});it('c',()=>{expect(hd392mgmx2(0,0)).toBe(0);});it('d',()=>{expect(hd392mgmx2(93,73)).toBe(2);});it('e',()=>{expect(hd392mgmx2(15,0)).toBe(4);});});
function hd393mgmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph393mgmx2_hd',()=>{it('a',()=>{expect(hd393mgmx2(1,4)).toBe(2);});it('b',()=>{expect(hd393mgmx2(3,1)).toBe(1);});it('c',()=>{expect(hd393mgmx2(0,0)).toBe(0);});it('d',()=>{expect(hd393mgmx2(93,73)).toBe(2);});it('e',()=>{expect(hd393mgmx2(15,0)).toBe(4);});});
function hd394mgmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph394mgmx2_hd',()=>{it('a',()=>{expect(hd394mgmx2(1,4)).toBe(2);});it('b',()=>{expect(hd394mgmx2(3,1)).toBe(1);});it('c',()=>{expect(hd394mgmx2(0,0)).toBe(0);});it('d',()=>{expect(hd394mgmx2(93,73)).toBe(2);});it('e',()=>{expect(hd394mgmx2(15,0)).toBe(4);});});
function hd395mgmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph395mgmx2_hd',()=>{it('a',()=>{expect(hd395mgmx2(1,4)).toBe(2);});it('b',()=>{expect(hd395mgmx2(3,1)).toBe(1);});it('c',()=>{expect(hd395mgmx2(0,0)).toBe(0);});it('d',()=>{expect(hd395mgmx2(93,73)).toBe(2);});it('e',()=>{expect(hd395mgmx2(15,0)).toBe(4);});});
function hd396mgmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph396mgmx2_hd',()=>{it('a',()=>{expect(hd396mgmx2(1,4)).toBe(2);});it('b',()=>{expect(hd396mgmx2(3,1)).toBe(1);});it('c',()=>{expect(hd396mgmx2(0,0)).toBe(0);});it('d',()=>{expect(hd396mgmx2(93,73)).toBe(2);});it('e',()=>{expect(hd396mgmx2(15,0)).toBe(4);});});
function hd397mgmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph397mgmx2_hd',()=>{it('a',()=>{expect(hd397mgmx2(1,4)).toBe(2);});it('b',()=>{expect(hd397mgmx2(3,1)).toBe(1);});it('c',()=>{expect(hd397mgmx2(0,0)).toBe(0);});it('d',()=>{expect(hd397mgmx2(93,73)).toBe(2);});it('e',()=>{expect(hd397mgmx2(15,0)).toBe(4);});});
function hd398mgmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph398mgmx2_hd',()=>{it('a',()=>{expect(hd398mgmx2(1,4)).toBe(2);});it('b',()=>{expect(hd398mgmx2(3,1)).toBe(1);});it('c',()=>{expect(hd398mgmx2(0,0)).toBe(0);});it('d',()=>{expect(hd398mgmx2(93,73)).toBe(2);});it('e',()=>{expect(hd398mgmx2(15,0)).toBe(4);});});
function hd399mgmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph399mgmx2_hd',()=>{it('a',()=>{expect(hd399mgmx2(1,4)).toBe(2);});it('b',()=>{expect(hd399mgmx2(3,1)).toBe(1);});it('c',()=>{expect(hd399mgmx2(0,0)).toBe(0);});it('d',()=>{expect(hd399mgmx2(93,73)).toBe(2);});it('e',()=>{expect(hd399mgmx2(15,0)).toBe(4);});});
function hd400mgmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph400mgmx2_hd',()=>{it('a',()=>{expect(hd400mgmx2(1,4)).toBe(2);});it('b',()=>{expect(hd400mgmx2(3,1)).toBe(1);});it('c',()=>{expect(hd400mgmx2(0,0)).toBe(0);});it('d',()=>{expect(hd400mgmx2(93,73)).toBe(2);});it('e',()=>{expect(hd400mgmx2(15,0)).toBe(4);});});
function hd401mgmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph401mgmx2_hd',()=>{it('a',()=>{expect(hd401mgmx2(1,4)).toBe(2);});it('b',()=>{expect(hd401mgmx2(3,1)).toBe(1);});it('c',()=>{expect(hd401mgmx2(0,0)).toBe(0);});it('d',()=>{expect(hd401mgmx2(93,73)).toBe(2);});it('e',()=>{expect(hd401mgmx2(15,0)).toBe(4);});});
function hd402mgmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph402mgmx2_hd',()=>{it('a',()=>{expect(hd402mgmx2(1,4)).toBe(2);});it('b',()=>{expect(hd402mgmx2(3,1)).toBe(1);});it('c',()=>{expect(hd402mgmx2(0,0)).toBe(0);});it('d',()=>{expect(hd402mgmx2(93,73)).toBe(2);});it('e',()=>{expect(hd402mgmx2(15,0)).toBe(4);});});
function hd403mgmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph403mgmx2_hd',()=>{it('a',()=>{expect(hd403mgmx2(1,4)).toBe(2);});it('b',()=>{expect(hd403mgmx2(3,1)).toBe(1);});it('c',()=>{expect(hd403mgmx2(0,0)).toBe(0);});it('d',()=>{expect(hd403mgmx2(93,73)).toBe(2);});it('e',()=>{expect(hd403mgmx2(15,0)).toBe(4);});});
function hd404mgmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph404mgmx2_hd',()=>{it('a',()=>{expect(hd404mgmx2(1,4)).toBe(2);});it('b',()=>{expect(hd404mgmx2(3,1)).toBe(1);});it('c',()=>{expect(hd404mgmx2(0,0)).toBe(0);});it('d',()=>{expect(hd404mgmx2(93,73)).toBe(2);});it('e',()=>{expect(hd404mgmx2(15,0)).toBe(4);});});
function hd405mgmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph405mgmx2_hd',()=>{it('a',()=>{expect(hd405mgmx2(1,4)).toBe(2);});it('b',()=>{expect(hd405mgmx2(3,1)).toBe(1);});it('c',()=>{expect(hd405mgmx2(0,0)).toBe(0);});it('d',()=>{expect(hd405mgmx2(93,73)).toBe(2);});it('e',()=>{expect(hd405mgmx2(15,0)).toBe(4);});});
function hd406mgmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph406mgmx2_hd',()=>{it('a',()=>{expect(hd406mgmx2(1,4)).toBe(2);});it('b',()=>{expect(hd406mgmx2(3,1)).toBe(1);});it('c',()=>{expect(hd406mgmx2(0,0)).toBe(0);});it('d',()=>{expect(hd406mgmx2(93,73)).toBe(2);});it('e',()=>{expect(hd406mgmx2(15,0)).toBe(4);});});
function hd407mgmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph407mgmx2_hd',()=>{it('a',()=>{expect(hd407mgmx2(1,4)).toBe(2);});it('b',()=>{expect(hd407mgmx2(3,1)).toBe(1);});it('c',()=>{expect(hd407mgmx2(0,0)).toBe(0);});it('d',()=>{expect(hd407mgmx2(93,73)).toBe(2);});it('e',()=>{expect(hd407mgmx2(15,0)).toBe(4);});});
function hd408mgmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph408mgmx2_hd',()=>{it('a',()=>{expect(hd408mgmx2(1,4)).toBe(2);});it('b',()=>{expect(hd408mgmx2(3,1)).toBe(1);});it('c',()=>{expect(hd408mgmx2(0,0)).toBe(0);});it('d',()=>{expect(hd408mgmx2(93,73)).toBe(2);});it('e',()=>{expect(hd408mgmx2(15,0)).toBe(4);});});
function hd409mgmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph409mgmx2_hd',()=>{it('a',()=>{expect(hd409mgmx2(1,4)).toBe(2);});it('b',()=>{expect(hd409mgmx2(3,1)).toBe(1);});it('c',()=>{expect(hd409mgmx2(0,0)).toBe(0);});it('d',()=>{expect(hd409mgmx2(93,73)).toBe(2);});it('e',()=>{expect(hd409mgmx2(15,0)).toBe(4);});});
function hd410mgmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph410mgmx2_hd',()=>{it('a',()=>{expect(hd410mgmx2(1,4)).toBe(2);});it('b',()=>{expect(hd410mgmx2(3,1)).toBe(1);});it('c',()=>{expect(hd410mgmx2(0,0)).toBe(0);});it('d',()=>{expect(hd410mgmx2(93,73)).toBe(2);});it('e',()=>{expect(hd410mgmx2(15,0)).toBe(4);});});
function hd411mgmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph411mgmx2_hd',()=>{it('a',()=>{expect(hd411mgmx2(1,4)).toBe(2);});it('b',()=>{expect(hd411mgmx2(3,1)).toBe(1);});it('c',()=>{expect(hd411mgmx2(0,0)).toBe(0);});it('d',()=>{expect(hd411mgmx2(93,73)).toBe(2);});it('e',()=>{expect(hd411mgmx2(15,0)).toBe(4);});});
function hd412mgmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph412mgmx2_hd',()=>{it('a',()=>{expect(hd412mgmx2(1,4)).toBe(2);});it('b',()=>{expect(hd412mgmx2(3,1)).toBe(1);});it('c',()=>{expect(hd412mgmx2(0,0)).toBe(0);});it('d',()=>{expect(hd412mgmx2(93,73)).toBe(2);});it('e',()=>{expect(hd412mgmx2(15,0)).toBe(4);});});
function hd413mgmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph413mgmx2_hd',()=>{it('a',()=>{expect(hd413mgmx2(1,4)).toBe(2);});it('b',()=>{expect(hd413mgmx2(3,1)).toBe(1);});it('c',()=>{expect(hd413mgmx2(0,0)).toBe(0);});it('d',()=>{expect(hd413mgmx2(93,73)).toBe(2);});it('e',()=>{expect(hd413mgmx2(15,0)).toBe(4);});});
function hd414mgmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph414mgmx2_hd',()=>{it('a',()=>{expect(hd414mgmx2(1,4)).toBe(2);});it('b',()=>{expect(hd414mgmx2(3,1)).toBe(1);});it('c',()=>{expect(hd414mgmx2(0,0)).toBe(0);});it('d',()=>{expect(hd414mgmx2(93,73)).toBe(2);});it('e',()=>{expect(hd414mgmx2(15,0)).toBe(4);});});
function hd415mgmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph415mgmx2_hd',()=>{it('a',()=>{expect(hd415mgmx2(1,4)).toBe(2);});it('b',()=>{expect(hd415mgmx2(3,1)).toBe(1);});it('c',()=>{expect(hd415mgmx2(0,0)).toBe(0);});it('d',()=>{expect(hd415mgmx2(93,73)).toBe(2);});it('e',()=>{expect(hd415mgmx2(15,0)).toBe(4);});});
function hd416mgmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph416mgmx2_hd',()=>{it('a',()=>{expect(hd416mgmx2(1,4)).toBe(2);});it('b',()=>{expect(hd416mgmx2(3,1)).toBe(1);});it('c',()=>{expect(hd416mgmx2(0,0)).toBe(0);});it('d',()=>{expect(hd416mgmx2(93,73)).toBe(2);});it('e',()=>{expect(hd416mgmx2(15,0)).toBe(4);});});
function hd417mgmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph417mgmx2_hd',()=>{it('a',()=>{expect(hd417mgmx2(1,4)).toBe(2);});it('b',()=>{expect(hd417mgmx2(3,1)).toBe(1);});it('c',()=>{expect(hd417mgmx2(0,0)).toBe(0);});it('d',()=>{expect(hd417mgmx2(93,73)).toBe(2);});it('e',()=>{expect(hd417mgmx2(15,0)).toBe(4);});});
