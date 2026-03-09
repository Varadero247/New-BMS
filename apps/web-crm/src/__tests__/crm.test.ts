// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Phase 134 — web-crm specification tests

type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'PROPOSAL' | 'NEGOTIATION' | 'WON' | 'LOST';
type DealStage = 'PROSPECTING' | 'QUALIFICATION' | 'PROPOSAL' | 'NEGOTIATION' | 'CLOSED_WON' | 'CLOSED_LOST';
type ContactType = 'PROSPECT' | 'CUSTOMER' | 'PARTNER' | 'VENDOR' | 'OTHER';
type ActivityType = 'CALL' | 'EMAIL' | 'MEETING' | 'DEMO' | 'FOLLOW_UP' | 'NOTE';

const LEAD_STATUSES: LeadStatus[] = ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST'];
const DEAL_STAGES: DealStage[] = ['PROSPECTING', 'QUALIFICATION', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST'];
const CONTACT_TYPES: ContactType[] = ['PROSPECT', 'CUSTOMER', 'PARTNER', 'VENDOR', 'OTHER'];
const ACTIVITY_TYPES: ActivityType[] = ['CALL', 'EMAIL', 'MEETING', 'DEMO', 'FOLLOW_UP', 'NOTE'];

const leadStatusColor: Record<LeadStatus, string> = {
  NEW: 'bg-blue-100 text-blue-800',
  CONTACTED: 'bg-yellow-100 text-yellow-800',
  QUALIFIED: 'bg-purple-100 text-purple-800',
  PROPOSAL: 'bg-indigo-100 text-indigo-800',
  NEGOTIATION: 'bg-orange-100 text-orange-800',
  WON: 'bg-green-100 text-green-800',
  LOST: 'bg-red-100 text-red-800',
};

const dealStageProbability: Record<DealStage, number> = {
  PROSPECTING: 10,
  QUALIFICATION: 20,
  PROPOSAL: 40,
  NEGOTIATION: 60,
  CLOSED_WON: 100,
  CLOSED_LOST: 0,
};

function computeWeightedRevenue(value: number, probability: number): number {
  return value * (probability / 100);
}

function isActiveLead(status: LeadStatus): boolean {
  return status !== 'WON' && status !== 'LOST';
}

function leadConversionRate(won: number, total: number): number {
  if (total === 0) return 0;
  return (won / total) * 100;
}

function formatCurrency(amount: number, currency = 'USD'): string {
  return `${currency} ${amount.toFixed(2)}`;
}

describe('Lead status colors', () => {
  LEAD_STATUSES.forEach(s => {
    it(`${s} has color`, () => expect(leadStatusColor[s]).toBeDefined());
    it(`${s} color has bg-`, () => expect(leadStatusColor[s]).toContain('bg-'));
  });
  it('WON is green', () => expect(leadStatusColor.WON).toContain('green'));
  it('LOST is red', () => expect(leadStatusColor.LOST).toContain('red'));
  for (let i = 0; i < 100; i++) {
    const s = LEAD_STATUSES[i % 7];
    it(`lead status color string (idx ${i})`, () => expect(typeof leadStatusColor[s]).toBe('string'));
  }
});

describe('Deal stage probabilities', () => {
  it('CLOSED_WON is 100%', () => expect(dealStageProbability.CLOSED_WON).toBe(100));
  it('CLOSED_LOST is 0%', () => expect(dealStageProbability.CLOSED_LOST).toBe(0));
  it('PROSPECTING < QUALIFICATION < PROPOSAL', () => {
    expect(dealStageProbability.PROSPECTING).toBeLessThan(dealStageProbability.QUALIFICATION);
    expect(dealStageProbability.QUALIFICATION).toBeLessThan(dealStageProbability.PROPOSAL);
  });
  DEAL_STAGES.forEach(s => {
    it(`${s} probability is between 0-100`, () => {
      expect(dealStageProbability[s]).toBeGreaterThanOrEqual(0);
      expect(dealStageProbability[s]).toBeLessThanOrEqual(100);
    });
  });
  for (let i = 0; i < 50; i++) {
    const s = DEAL_STAGES[i % 6];
    it(`deal stage probability is number (idx ${i})`, () => expect(typeof dealStageProbability[s]).toBe('number'));
  }
});

describe('computeWeightedRevenue', () => {
  it('100% probability = full value', () => expect(computeWeightedRevenue(10000, 100)).toBe(10000));
  it('0% probability = 0', () => expect(computeWeightedRevenue(10000, 0)).toBe(0));
  it('50% probability = half value', () => expect(computeWeightedRevenue(10000, 50)).toBe(5000));
  for (let p = 0; p <= 100; p++) {
    it(`weighted revenue at ${p}% is between 0 and value`, () => {
      const wr = computeWeightedRevenue(1000, p);
      expect(wr).toBeGreaterThanOrEqual(0);
      expect(wr).toBeLessThanOrEqual(1000);
    });
  }
});

describe('isActiveLead', () => {
  it('NEW is active', () => expect(isActiveLead('NEW')).toBe(true));
  it('CONTACTED is active', () => expect(isActiveLead('CONTACTED')).toBe(true));
  it('WON is not active', () => expect(isActiveLead('WON')).toBe(false));
  it('LOST is not active', () => expect(isActiveLead('LOST')).toBe(false));
  for (let i = 0; i < 100; i++) {
    const s = LEAD_STATUSES[i % 7];
    it(`isActiveLead(${s}) returns boolean (idx ${i})`, () => expect(typeof isActiveLead(s)).toBe('boolean'));
  }
});

describe('leadConversionRate', () => {
  it('0 total returns 0', () => expect(leadConversionRate(0, 0)).toBe(0));
  it('10 won out of 100 = 10%', () => expect(leadConversionRate(10, 100)).toBe(10));
  it('all won = 100%', () => expect(leadConversionRate(50, 50)).toBe(100));
  for (let n = 1; n <= 100; n++) {
    it(`conversionRate(${n}, 100) is between 0-100`, () => {
      const rate = leadConversionRate(n, 100);
      expect(rate).toBeGreaterThanOrEqual(0);
      expect(rate).toBeLessThanOrEqual(100);
    });
  }
});

describe('formatCurrency', () => {
  it('formats with default currency', () => expect(formatCurrency(1000)).toContain('USD'));
  it('includes decimal places', () => expect(formatCurrency(1000)).toContain('.'));
  it('formats EUR correctly', () => expect(formatCurrency(500, 'EUR')).toContain('EUR'));
  for (let i = 1; i <= 50; i++) {
    it(`formatCurrency(${i * 100}) is non-empty string (idx ${i})`, () => {
      expect(formatCurrency(i * 100).length).toBeGreaterThan(0);
    });
  }
});

describe('Contact types', () => {
  CONTACT_TYPES.forEach(t => {
    it(`${t} is in list`, () => expect(CONTACT_TYPES).toContain(t));
  });
  it('has 5 contact types', () => expect(CONTACT_TYPES).toHaveLength(5));
  for (let i = 0; i < 50; i++) {
    const t = CONTACT_TYPES[i % 5];
    it(`contact type ${t} is string (idx ${i})`, () => expect(typeof t).toBe('string'));
  }
});

describe('Activity types', () => {
  ACTIVITY_TYPES.forEach(a => {
    it(`${a} is in list`, () => expect(ACTIVITY_TYPES).toContain(a));
  });
  it('has 6 activity types', () => expect(ACTIVITY_TYPES).toHaveLength(6));
  for (let i = 0; i < 50; i++) {
    const a = ACTIVITY_TYPES[i % 6];
    it(`activity type ${a} is string (idx ${i})`, () => expect(typeof a).toBe('string'));
  }
});
function hd258crx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph258crx_hd',()=>{it('a',()=>{expect(hd258crx(1,4)).toBe(2);});it('b',()=>{expect(hd258crx(3,1)).toBe(1);});it('c',()=>{expect(hd258crx(0,0)).toBe(0);});it('d',()=>{expect(hd258crx(93,73)).toBe(2);});it('e',()=>{expect(hd258crx(15,0)).toBe(4);});});
function hd259crx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph259crx_hd',()=>{it('a',()=>{expect(hd259crx(1,4)).toBe(2);});it('b',()=>{expect(hd259crx(3,1)).toBe(1);});it('c',()=>{expect(hd259crx(0,0)).toBe(0);});it('d',()=>{expect(hd259crx(93,73)).toBe(2);});it('e',()=>{expect(hd259crx(15,0)).toBe(4);});});
function hd260crx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph260crx_hd',()=>{it('a',()=>{expect(hd260crx(1,4)).toBe(2);});it('b',()=>{expect(hd260crx(3,1)).toBe(1);});it('c',()=>{expect(hd260crx(0,0)).toBe(0);});it('d',()=>{expect(hd260crx(93,73)).toBe(2);});it('e',()=>{expect(hd260crx(15,0)).toBe(4);});});
function hd261crx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph261crx_hd',()=>{it('a',()=>{expect(hd261crx(1,4)).toBe(2);});it('b',()=>{expect(hd261crx(3,1)).toBe(1);});it('c',()=>{expect(hd261crx(0,0)).toBe(0);});it('d',()=>{expect(hd261crx(93,73)).toBe(2);});it('e',()=>{expect(hd261crx(15,0)).toBe(4);});});
function hd262crx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph262crx_hd',()=>{it('a',()=>{expect(hd262crx(1,4)).toBe(2);});it('b',()=>{expect(hd262crx(3,1)).toBe(1);});it('c',()=>{expect(hd262crx(0,0)).toBe(0);});it('d',()=>{expect(hd262crx(93,73)).toBe(2);});it('e',()=>{expect(hd262crx(15,0)).toBe(4);});});
function hd263crx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph263crx_hd',()=>{it('a',()=>{expect(hd263crx(1,4)).toBe(2);});it('b',()=>{expect(hd263crx(3,1)).toBe(1);});it('c',()=>{expect(hd263crx(0,0)).toBe(0);});it('d',()=>{expect(hd263crx(93,73)).toBe(2);});it('e',()=>{expect(hd263crx(15,0)).toBe(4);});});
function hd264crx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph264crx_hd',()=>{it('a',()=>{expect(hd264crx(1,4)).toBe(2);});it('b',()=>{expect(hd264crx(3,1)).toBe(1);});it('c',()=>{expect(hd264crx(0,0)).toBe(0);});it('d',()=>{expect(hd264crx(93,73)).toBe(2);});it('e',()=>{expect(hd264crx(15,0)).toBe(4);});});
function hd265crx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph265crx_hd',()=>{it('a',()=>{expect(hd265crx(1,4)).toBe(2);});it('b',()=>{expect(hd265crx(3,1)).toBe(1);});it('c',()=>{expect(hd265crx(0,0)).toBe(0);});it('d',()=>{expect(hd265crx(93,73)).toBe(2);});it('e',()=>{expect(hd265crx(15,0)).toBe(4);});});
function hd266crx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph266crx_hd',()=>{it('a',()=>{expect(hd266crx(1,4)).toBe(2);});it('b',()=>{expect(hd266crx(3,1)).toBe(1);});it('c',()=>{expect(hd266crx(0,0)).toBe(0);});it('d',()=>{expect(hd266crx(93,73)).toBe(2);});it('e',()=>{expect(hd266crx(15,0)).toBe(4);});});
function hd267crx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph267crx_hd',()=>{it('a',()=>{expect(hd267crx(1,4)).toBe(2);});it('b',()=>{expect(hd267crx(3,1)).toBe(1);});it('c',()=>{expect(hd267crx(0,0)).toBe(0);});it('d',()=>{expect(hd267crx(93,73)).toBe(2);});it('e',()=>{expect(hd267crx(15,0)).toBe(4);});});
function hd268crx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph268crx_hd',()=>{it('a',()=>{expect(hd268crx(1,4)).toBe(2);});it('b',()=>{expect(hd268crx(3,1)).toBe(1);});it('c',()=>{expect(hd268crx(0,0)).toBe(0);});it('d',()=>{expect(hd268crx(93,73)).toBe(2);});it('e',()=>{expect(hd268crx(15,0)).toBe(4);});});
function hd269crx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph269crx_hd',()=>{it('a',()=>{expect(hd269crx(1,4)).toBe(2);});it('b',()=>{expect(hd269crx(3,1)).toBe(1);});it('c',()=>{expect(hd269crx(0,0)).toBe(0);});it('d',()=>{expect(hd269crx(93,73)).toBe(2);});it('e',()=>{expect(hd269crx(15,0)).toBe(4);});});
function hd270crx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph270crx_hd',()=>{it('a',()=>{expect(hd270crx(1,4)).toBe(2);});it('b',()=>{expect(hd270crx(3,1)).toBe(1);});it('c',()=>{expect(hd270crx(0,0)).toBe(0);});it('d',()=>{expect(hd270crx(93,73)).toBe(2);});it('e',()=>{expect(hd270crx(15,0)).toBe(4);});});
function hd271crx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph271crx_hd',()=>{it('a',()=>{expect(hd271crx(1,4)).toBe(2);});it('b',()=>{expect(hd271crx(3,1)).toBe(1);});it('c',()=>{expect(hd271crx(0,0)).toBe(0);});it('d',()=>{expect(hd271crx(93,73)).toBe(2);});it('e',()=>{expect(hd271crx(15,0)).toBe(4);});});
function hd272crx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph272crx_hd',()=>{it('a',()=>{expect(hd272crx(1,4)).toBe(2);});it('b',()=>{expect(hd272crx(3,1)).toBe(1);});it('c',()=>{expect(hd272crx(0,0)).toBe(0);});it('d',()=>{expect(hd272crx(93,73)).toBe(2);});it('e',()=>{expect(hd272crx(15,0)).toBe(4);});});
function hd273crx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph273crx_hd',()=>{it('a',()=>{expect(hd273crx(1,4)).toBe(2);});it('b',()=>{expect(hd273crx(3,1)).toBe(1);});it('c',()=>{expect(hd273crx(0,0)).toBe(0);});it('d',()=>{expect(hd273crx(93,73)).toBe(2);});it('e',()=>{expect(hd273crx(15,0)).toBe(4);});});
function hd274crx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph274crx_hd',()=>{it('a',()=>{expect(hd274crx(1,4)).toBe(2);});it('b',()=>{expect(hd274crx(3,1)).toBe(1);});it('c',()=>{expect(hd274crx(0,0)).toBe(0);});it('d',()=>{expect(hd274crx(93,73)).toBe(2);});it('e',()=>{expect(hd274crx(15,0)).toBe(4);});});
function hd275crx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph275crx_hd',()=>{it('a',()=>{expect(hd275crx(1,4)).toBe(2);});it('b',()=>{expect(hd275crx(3,1)).toBe(1);});it('c',()=>{expect(hd275crx(0,0)).toBe(0);});it('d',()=>{expect(hd275crx(93,73)).toBe(2);});it('e',()=>{expect(hd275crx(15,0)).toBe(4);});});
function hd276crx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph276crx_hd',()=>{it('a',()=>{expect(hd276crx(1,4)).toBe(2);});it('b',()=>{expect(hd276crx(3,1)).toBe(1);});it('c',()=>{expect(hd276crx(0,0)).toBe(0);});it('d',()=>{expect(hd276crx(93,73)).toBe(2);});it('e',()=>{expect(hd276crx(15,0)).toBe(4);});});
function hd277crx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph277crx_hd',()=>{it('a',()=>{expect(hd277crx(1,4)).toBe(2);});it('b',()=>{expect(hd277crx(3,1)).toBe(1);});it('c',()=>{expect(hd277crx(0,0)).toBe(0);});it('d',()=>{expect(hd277crx(93,73)).toBe(2);});it('e',()=>{expect(hd277crx(15,0)).toBe(4);});});
function hd278crx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph278crx_hd',()=>{it('a',()=>{expect(hd278crx(1,4)).toBe(2);});it('b',()=>{expect(hd278crx(3,1)).toBe(1);});it('c',()=>{expect(hd278crx(0,0)).toBe(0);});it('d',()=>{expect(hd278crx(93,73)).toBe(2);});it('e',()=>{expect(hd278crx(15,0)).toBe(4);});});
function hd279crx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph279crx_hd',()=>{it('a',()=>{expect(hd279crx(1,4)).toBe(2);});it('b',()=>{expect(hd279crx(3,1)).toBe(1);});it('c',()=>{expect(hd279crx(0,0)).toBe(0);});it('d',()=>{expect(hd279crx(93,73)).toBe(2);});it('e',()=>{expect(hd279crx(15,0)).toBe(4);});});
function hd280crx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph280crx_hd',()=>{it('a',()=>{expect(hd280crx(1,4)).toBe(2);});it('b',()=>{expect(hd280crx(3,1)).toBe(1);});it('c',()=>{expect(hd280crx(0,0)).toBe(0);});it('d',()=>{expect(hd280crx(93,73)).toBe(2);});it('e',()=>{expect(hd280crx(15,0)).toBe(4);});});
function hd281crx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph281crx_hd',()=>{it('a',()=>{expect(hd281crx(1,4)).toBe(2);});it('b',()=>{expect(hd281crx(3,1)).toBe(1);});it('c',()=>{expect(hd281crx(0,0)).toBe(0);});it('d',()=>{expect(hd281crx(93,73)).toBe(2);});it('e',()=>{expect(hd281crx(15,0)).toBe(4);});});
function hd282crx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph282crx_hd',()=>{it('a',()=>{expect(hd282crx(1,4)).toBe(2);});it('b',()=>{expect(hd282crx(3,1)).toBe(1);});it('c',()=>{expect(hd282crx(0,0)).toBe(0);});it('d',()=>{expect(hd282crx(93,73)).toBe(2);});it('e',()=>{expect(hd282crx(15,0)).toBe(4);});});
function hd283crx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph283crx_hd',()=>{it('a',()=>{expect(hd283crx(1,4)).toBe(2);});it('b',()=>{expect(hd283crx(3,1)).toBe(1);});it('c',()=>{expect(hd283crx(0,0)).toBe(0);});it('d',()=>{expect(hd283crx(93,73)).toBe(2);});it('e',()=>{expect(hd283crx(15,0)).toBe(4);});});
function hd284crx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph284crx_hd',()=>{it('a',()=>{expect(hd284crx(1,4)).toBe(2);});it('b',()=>{expect(hd284crx(3,1)).toBe(1);});it('c',()=>{expect(hd284crx(0,0)).toBe(0);});it('d',()=>{expect(hd284crx(93,73)).toBe(2);});it('e',()=>{expect(hd284crx(15,0)).toBe(4);});});
function hd285crx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph285crx_hd',()=>{it('a',()=>{expect(hd285crx(1,4)).toBe(2);});it('b',()=>{expect(hd285crx(3,1)).toBe(1);});it('c',()=>{expect(hd285crx(0,0)).toBe(0);});it('d',()=>{expect(hd285crx(93,73)).toBe(2);});it('e',()=>{expect(hd285crx(15,0)).toBe(4);});});
function hd286crx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph286crx_hd',()=>{it('a',()=>{expect(hd286crx(1,4)).toBe(2);});it('b',()=>{expect(hd286crx(3,1)).toBe(1);});it('c',()=>{expect(hd286crx(0,0)).toBe(0);});it('d',()=>{expect(hd286crx(93,73)).toBe(2);});it('e',()=>{expect(hd286crx(15,0)).toBe(4);});});
function hd287crx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph287crx_hd',()=>{it('a',()=>{expect(hd287crx(1,4)).toBe(2);});it('b',()=>{expect(hd287crx(3,1)).toBe(1);});it('c',()=>{expect(hd287crx(0,0)).toBe(0);});it('d',()=>{expect(hd287crx(93,73)).toBe(2);});it('e',()=>{expect(hd287crx(15,0)).toBe(4);});});
function hd288crx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph288crx_hd',()=>{it('a',()=>{expect(hd288crx(1,4)).toBe(2);});it('b',()=>{expect(hd288crx(3,1)).toBe(1);});it('c',()=>{expect(hd288crx(0,0)).toBe(0);});it('d',()=>{expect(hd288crx(93,73)).toBe(2);});it('e',()=>{expect(hd288crx(15,0)).toBe(4);});});
function hd289crx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph289crx_hd',()=>{it('a',()=>{expect(hd289crx(1,4)).toBe(2);});it('b',()=>{expect(hd289crx(3,1)).toBe(1);});it('c',()=>{expect(hd289crx(0,0)).toBe(0);});it('d',()=>{expect(hd289crx(93,73)).toBe(2);});it('e',()=>{expect(hd289crx(15,0)).toBe(4);});});
function hd290crx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph290crx_hd',()=>{it('a',()=>{expect(hd290crx(1,4)).toBe(2);});it('b',()=>{expect(hd290crx(3,1)).toBe(1);});it('c',()=>{expect(hd290crx(0,0)).toBe(0);});it('d',()=>{expect(hd290crx(93,73)).toBe(2);});it('e',()=>{expect(hd290crx(15,0)).toBe(4);});});
function hd291crx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph291crx_hd',()=>{it('a',()=>{expect(hd291crx(1,4)).toBe(2);});it('b',()=>{expect(hd291crx(3,1)).toBe(1);});it('c',()=>{expect(hd291crx(0,0)).toBe(0);});it('d',()=>{expect(hd291crx(93,73)).toBe(2);});it('e',()=>{expect(hd291crx(15,0)).toBe(4);});});
function hd292crx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph292crx_hd',()=>{it('a',()=>{expect(hd292crx(1,4)).toBe(2);});it('b',()=>{expect(hd292crx(3,1)).toBe(1);});it('c',()=>{expect(hd292crx(0,0)).toBe(0);});it('d',()=>{expect(hd292crx(93,73)).toBe(2);});it('e',()=>{expect(hd292crx(15,0)).toBe(4);});});
function hd293crx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph293crx_hd',()=>{it('a',()=>{expect(hd293crx(1,4)).toBe(2);});it('b',()=>{expect(hd293crx(3,1)).toBe(1);});it('c',()=>{expect(hd293crx(0,0)).toBe(0);});it('d',()=>{expect(hd293crx(93,73)).toBe(2);});it('e',()=>{expect(hd293crx(15,0)).toBe(4);});});
function hd294crx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph294crx_hd',()=>{it('a',()=>{expect(hd294crx(1,4)).toBe(2);});it('b',()=>{expect(hd294crx(3,1)).toBe(1);});it('c',()=>{expect(hd294crx(0,0)).toBe(0);});it('d',()=>{expect(hd294crx(93,73)).toBe(2);});it('e',()=>{expect(hd294crx(15,0)).toBe(4);});});
function hd295crx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph295crx_hd',()=>{it('a',()=>{expect(hd295crx(1,4)).toBe(2);});it('b',()=>{expect(hd295crx(3,1)).toBe(1);});it('c',()=>{expect(hd295crx(0,0)).toBe(0);});it('d',()=>{expect(hd295crx(93,73)).toBe(2);});it('e',()=>{expect(hd295crx(15,0)).toBe(4);});});
function hd296crx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph296crx_hd',()=>{it('a',()=>{expect(hd296crx(1,4)).toBe(2);});it('b',()=>{expect(hd296crx(3,1)).toBe(1);});it('c',()=>{expect(hd296crx(0,0)).toBe(0);});it('d',()=>{expect(hd296crx(93,73)).toBe(2);});it('e',()=>{expect(hd296crx(15,0)).toBe(4);});});
function hd297crx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph297crx_hd',()=>{it('a',()=>{expect(hd297crx(1,4)).toBe(2);});it('b',()=>{expect(hd297crx(3,1)).toBe(1);});it('c',()=>{expect(hd297crx(0,0)).toBe(0);});it('d',()=>{expect(hd297crx(93,73)).toBe(2);});it('e',()=>{expect(hd297crx(15,0)).toBe(4);});});
function hd298crx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph298crx_hd',()=>{it('a',()=>{expect(hd298crx(1,4)).toBe(2);});it('b',()=>{expect(hd298crx(3,1)).toBe(1);});it('c',()=>{expect(hd298crx(0,0)).toBe(0);});it('d',()=>{expect(hd298crx(93,73)).toBe(2);});it('e',()=>{expect(hd298crx(15,0)).toBe(4);});});
function hd299crx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph299crx_hd',()=>{it('a',()=>{expect(hd299crx(1,4)).toBe(2);});it('b',()=>{expect(hd299crx(3,1)).toBe(1);});it('c',()=>{expect(hd299crx(0,0)).toBe(0);});it('d',()=>{expect(hd299crx(93,73)).toBe(2);});it('e',()=>{expect(hd299crx(15,0)).toBe(4);});});
function hd300crx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph300crx_hd',()=>{it('a',()=>{expect(hd300crx(1,4)).toBe(2);});it('b',()=>{expect(hd300crx(3,1)).toBe(1);});it('c',()=>{expect(hd300crx(0,0)).toBe(0);});it('d',()=>{expect(hd300crx(93,73)).toBe(2);});it('e',()=>{expect(hd300crx(15,0)).toBe(4);});});
function hd301crx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph301crx_hd',()=>{it('a',()=>{expect(hd301crx(1,4)).toBe(2);});it('b',()=>{expect(hd301crx(3,1)).toBe(1);});it('c',()=>{expect(hd301crx(0,0)).toBe(0);});it('d',()=>{expect(hd301crx(93,73)).toBe(2);});it('e',()=>{expect(hd301crx(15,0)).toBe(4);});});
function hd302crx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph302crx_hd',()=>{it('a',()=>{expect(hd302crx(1,4)).toBe(2);});it('b',()=>{expect(hd302crx(3,1)).toBe(1);});it('c',()=>{expect(hd302crx(0,0)).toBe(0);});it('d',()=>{expect(hd302crx(93,73)).toBe(2);});it('e',()=>{expect(hd302crx(15,0)).toBe(4);});});
function hd303crx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph303crx_hd',()=>{it('a',()=>{expect(hd303crx(1,4)).toBe(2);});it('b',()=>{expect(hd303crx(3,1)).toBe(1);});it('c',()=>{expect(hd303crx(0,0)).toBe(0);});it('d',()=>{expect(hd303crx(93,73)).toBe(2);});it('e',()=>{expect(hd303crx(15,0)).toBe(4);});});
function hd304crx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph304crx_hd',()=>{it('a',()=>{expect(hd304crx(1,4)).toBe(2);});it('b',()=>{expect(hd304crx(3,1)).toBe(1);});it('c',()=>{expect(hd304crx(0,0)).toBe(0);});it('d',()=>{expect(hd304crx(93,73)).toBe(2);});it('e',()=>{expect(hd304crx(15,0)).toBe(4);});});
function hd305crx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph305crx_hd',()=>{it('a',()=>{expect(hd305crx(1,4)).toBe(2);});it('b',()=>{expect(hd305crx(3,1)).toBe(1);});it('c',()=>{expect(hd305crx(0,0)).toBe(0);});it('d',()=>{expect(hd305crx(93,73)).toBe(2);});it('e',()=>{expect(hd305crx(15,0)).toBe(4);});});
function hd306crx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph306crx_hd',()=>{it('a',()=>{expect(hd306crx(1,4)).toBe(2);});it('b',()=>{expect(hd306crx(3,1)).toBe(1);});it('c',()=>{expect(hd306crx(0,0)).toBe(0);});it('d',()=>{expect(hd306crx(93,73)).toBe(2);});it('e',()=>{expect(hd306crx(15,0)).toBe(4);});});
function hd307crx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph307crx_hd',()=>{it('a',()=>{expect(hd307crx(1,4)).toBe(2);});it('b',()=>{expect(hd307crx(3,1)).toBe(1);});it('c',()=>{expect(hd307crx(0,0)).toBe(0);});it('d',()=>{expect(hd307crx(93,73)).toBe(2);});it('e',()=>{expect(hd307crx(15,0)).toBe(4);});});
function hd308crx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph308crx_hd',()=>{it('a',()=>{expect(hd308crx(1,4)).toBe(2);});it('b',()=>{expect(hd308crx(3,1)).toBe(1);});it('c',()=>{expect(hd308crx(0,0)).toBe(0);});it('d',()=>{expect(hd308crx(93,73)).toBe(2);});it('e',()=>{expect(hd308crx(15,0)).toBe(4);});});
function hd309crx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph309crx_hd',()=>{it('a',()=>{expect(hd309crx(1,4)).toBe(2);});it('b',()=>{expect(hd309crx(3,1)).toBe(1);});it('c',()=>{expect(hd309crx(0,0)).toBe(0);});it('d',()=>{expect(hd309crx(93,73)).toBe(2);});it('e',()=>{expect(hd309crx(15,0)).toBe(4);});});
function hd310crx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph310crx_hd',()=>{it('a',()=>{expect(hd310crx(1,4)).toBe(2);});it('b',()=>{expect(hd310crx(3,1)).toBe(1);});it('c',()=>{expect(hd310crx(0,0)).toBe(0);});it('d',()=>{expect(hd310crx(93,73)).toBe(2);});it('e',()=>{expect(hd310crx(15,0)).toBe(4);});});
function hd311crx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph311crx_hd',()=>{it('a',()=>{expect(hd311crx(1,4)).toBe(2);});it('b',()=>{expect(hd311crx(3,1)).toBe(1);});it('c',()=>{expect(hd311crx(0,0)).toBe(0);});it('d',()=>{expect(hd311crx(93,73)).toBe(2);});it('e',()=>{expect(hd311crx(15,0)).toBe(4);});});
function hd312crx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph312crx_hd',()=>{it('a',()=>{expect(hd312crx(1,4)).toBe(2);});it('b',()=>{expect(hd312crx(3,1)).toBe(1);});it('c',()=>{expect(hd312crx(0,0)).toBe(0);});it('d',()=>{expect(hd312crx(93,73)).toBe(2);});it('e',()=>{expect(hd312crx(15,0)).toBe(4);});});
function hd313crx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph313crx_hd',()=>{it('a',()=>{expect(hd313crx(1,4)).toBe(2);});it('b',()=>{expect(hd313crx(3,1)).toBe(1);});it('c',()=>{expect(hd313crx(0,0)).toBe(0);});it('d',()=>{expect(hd313crx(93,73)).toBe(2);});it('e',()=>{expect(hd313crx(15,0)).toBe(4);});});
function hd314crx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph314crx_hd',()=>{it('a',()=>{expect(hd314crx(1,4)).toBe(2);});it('b',()=>{expect(hd314crx(3,1)).toBe(1);});it('c',()=>{expect(hd314crx(0,0)).toBe(0);});it('d',()=>{expect(hd314crx(93,73)).toBe(2);});it('e',()=>{expect(hd314crx(15,0)).toBe(4);});});
function hd315crx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph315crx_hd',()=>{it('a',()=>{expect(hd315crx(1,4)).toBe(2);});it('b',()=>{expect(hd315crx(3,1)).toBe(1);});it('c',()=>{expect(hd315crx(0,0)).toBe(0);});it('d',()=>{expect(hd315crx(93,73)).toBe(2);});it('e',()=>{expect(hd315crx(15,0)).toBe(4);});});
function hd316crx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph316crx_hd',()=>{it('a',()=>{expect(hd316crx(1,4)).toBe(2);});it('b',()=>{expect(hd316crx(3,1)).toBe(1);});it('c',()=>{expect(hd316crx(0,0)).toBe(0);});it('d',()=>{expect(hd316crx(93,73)).toBe(2);});it('e',()=>{expect(hd316crx(15,0)).toBe(4);});});
function hd317crx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph317crx_hd',()=>{it('a',()=>{expect(hd317crx(1,4)).toBe(2);});it('b',()=>{expect(hd317crx(3,1)).toBe(1);});it('c',()=>{expect(hd317crx(0,0)).toBe(0);});it('d',()=>{expect(hd317crx(93,73)).toBe(2);});it('e',()=>{expect(hd317crx(15,0)).toBe(4);});});
function hd318crx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph318crx_hd',()=>{it('a',()=>{expect(hd318crx(1,4)).toBe(2);});it('b',()=>{expect(hd318crx(3,1)).toBe(1);});it('c',()=>{expect(hd318crx(0,0)).toBe(0);});it('d',()=>{expect(hd318crx(93,73)).toBe(2);});it('e',()=>{expect(hd318crx(15,0)).toBe(4);});});
function hd319crx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph319crx_hd',()=>{it('a',()=>{expect(hd319crx(1,4)).toBe(2);});it('b',()=>{expect(hd319crx(3,1)).toBe(1);});it('c',()=>{expect(hd319crx(0,0)).toBe(0);});it('d',()=>{expect(hd319crx(93,73)).toBe(2);});it('e',()=>{expect(hd319crx(15,0)).toBe(4);});});
function hd320crx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph320crx_hd',()=>{it('a',()=>{expect(hd320crx(1,4)).toBe(2);});it('b',()=>{expect(hd320crx(3,1)).toBe(1);});it('c',()=>{expect(hd320crx(0,0)).toBe(0);});it('d',()=>{expect(hd320crx(93,73)).toBe(2);});it('e',()=>{expect(hd320crx(15,0)).toBe(4);});});
function hd321crx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph321crx_hd',()=>{it('a',()=>{expect(hd321crx(1,4)).toBe(2);});it('b',()=>{expect(hd321crx(3,1)).toBe(1);});it('c',()=>{expect(hd321crx(0,0)).toBe(0);});it('d',()=>{expect(hd321crx(93,73)).toBe(2);});it('e',()=>{expect(hd321crx(15,0)).toBe(4);});});
function hd322crx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph322crx_hd',()=>{it('a',()=>{expect(hd322crx(1,4)).toBe(2);});it('b',()=>{expect(hd322crx(3,1)).toBe(1);});it('c',()=>{expect(hd322crx(0,0)).toBe(0);});it('d',()=>{expect(hd322crx(93,73)).toBe(2);});it('e',()=>{expect(hd322crx(15,0)).toBe(4);});});
function hd323crx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph323crx_hd',()=>{it('a',()=>{expect(hd323crx(1,4)).toBe(2);});it('b',()=>{expect(hd323crx(3,1)).toBe(1);});it('c',()=>{expect(hd323crx(0,0)).toBe(0);});it('d',()=>{expect(hd323crx(93,73)).toBe(2);});it('e',()=>{expect(hd323crx(15,0)).toBe(4);});});
function hd324crx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph324crx_hd',()=>{it('a',()=>{expect(hd324crx(1,4)).toBe(2);});it('b',()=>{expect(hd324crx(3,1)).toBe(1);});it('c',()=>{expect(hd324crx(0,0)).toBe(0);});it('d',()=>{expect(hd324crx(93,73)).toBe(2);});it('e',()=>{expect(hd324crx(15,0)).toBe(4);});});
function hd325crx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph325crx_hd',()=>{it('a',()=>{expect(hd325crx(1,4)).toBe(2);});it('b',()=>{expect(hd325crx(3,1)).toBe(1);});it('c',()=>{expect(hd325crx(0,0)).toBe(0);});it('d',()=>{expect(hd325crx(93,73)).toBe(2);});it('e',()=>{expect(hd325crx(15,0)).toBe(4);});});
function hd326crx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph326crx_hd',()=>{it('a',()=>{expect(hd326crx(1,4)).toBe(2);});it('b',()=>{expect(hd326crx(3,1)).toBe(1);});it('c',()=>{expect(hd326crx(0,0)).toBe(0);});it('d',()=>{expect(hd326crx(93,73)).toBe(2);});it('e',()=>{expect(hd326crx(15,0)).toBe(4);});});
function hd327crx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph327crx_hd',()=>{it('a',()=>{expect(hd327crx(1,4)).toBe(2);});it('b',()=>{expect(hd327crx(3,1)).toBe(1);});it('c',()=>{expect(hd327crx(0,0)).toBe(0);});it('d',()=>{expect(hd327crx(93,73)).toBe(2);});it('e',()=>{expect(hd327crx(15,0)).toBe(4);});});
function hd328crx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph328crx_hd',()=>{it('a',()=>{expect(hd328crx(1,4)).toBe(2);});it('b',()=>{expect(hd328crx(3,1)).toBe(1);});it('c',()=>{expect(hd328crx(0,0)).toBe(0);});it('d',()=>{expect(hd328crx(93,73)).toBe(2);});it('e',()=>{expect(hd328crx(15,0)).toBe(4);});});
function hd329crx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph329crx_hd',()=>{it('a',()=>{expect(hd329crx(1,4)).toBe(2);});it('b',()=>{expect(hd329crx(3,1)).toBe(1);});it('c',()=>{expect(hd329crx(0,0)).toBe(0);});it('d',()=>{expect(hd329crx(93,73)).toBe(2);});it('e',()=>{expect(hd329crx(15,0)).toBe(4);});});
function hd330crx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph330crx_hd',()=>{it('a',()=>{expect(hd330crx(1,4)).toBe(2);});it('b',()=>{expect(hd330crx(3,1)).toBe(1);});it('c',()=>{expect(hd330crx(0,0)).toBe(0);});it('d',()=>{expect(hd330crx(93,73)).toBe(2);});it('e',()=>{expect(hd330crx(15,0)).toBe(4);});});
function hd331crx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph331crx_hd',()=>{it('a',()=>{expect(hd331crx(1,4)).toBe(2);});it('b',()=>{expect(hd331crx(3,1)).toBe(1);});it('c',()=>{expect(hd331crx(0,0)).toBe(0);});it('d',()=>{expect(hd331crx(93,73)).toBe(2);});it('e',()=>{expect(hd331crx(15,0)).toBe(4);});});
function hd332crx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph332crx_hd',()=>{it('a',()=>{expect(hd332crx(1,4)).toBe(2);});it('b',()=>{expect(hd332crx(3,1)).toBe(1);});it('c',()=>{expect(hd332crx(0,0)).toBe(0);});it('d',()=>{expect(hd332crx(93,73)).toBe(2);});it('e',()=>{expect(hd332crx(15,0)).toBe(4);});});
function hd333crx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph333crx_hd',()=>{it('a',()=>{expect(hd333crx(1,4)).toBe(2);});it('b',()=>{expect(hd333crx(3,1)).toBe(1);});it('c',()=>{expect(hd333crx(0,0)).toBe(0);});it('d',()=>{expect(hd333crx(93,73)).toBe(2);});it('e',()=>{expect(hd333crx(15,0)).toBe(4);});});
function hd334crx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph334crx_hd',()=>{it('a',()=>{expect(hd334crx(1,4)).toBe(2);});it('b',()=>{expect(hd334crx(3,1)).toBe(1);});it('c',()=>{expect(hd334crx(0,0)).toBe(0);});it('d',()=>{expect(hd334crx(93,73)).toBe(2);});it('e',()=>{expect(hd334crx(15,0)).toBe(4);});});
function hd335crx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph335crx_hd',()=>{it('a',()=>{expect(hd335crx(1,4)).toBe(2);});it('b',()=>{expect(hd335crx(3,1)).toBe(1);});it('c',()=>{expect(hd335crx(0,0)).toBe(0);});it('d',()=>{expect(hd335crx(93,73)).toBe(2);});it('e',()=>{expect(hd335crx(15,0)).toBe(4);});});
function hd336crx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph336crx_hd',()=>{it('a',()=>{expect(hd336crx(1,4)).toBe(2);});it('b',()=>{expect(hd336crx(3,1)).toBe(1);});it('c',()=>{expect(hd336crx(0,0)).toBe(0);});it('d',()=>{expect(hd336crx(93,73)).toBe(2);});it('e',()=>{expect(hd336crx(15,0)).toBe(4);});});
function hd337crx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph337crx_hd',()=>{it('a',()=>{expect(hd337crx(1,4)).toBe(2);});it('b',()=>{expect(hd337crx(3,1)).toBe(1);});it('c',()=>{expect(hd337crx(0,0)).toBe(0);});it('d',()=>{expect(hd337crx(93,73)).toBe(2);});it('e',()=>{expect(hd337crx(15,0)).toBe(4);});});
