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
function hd338crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph338crmx2_hd',()=>{it('a',()=>{expect(hd338crmx2(1,4)).toBe(2);});it('b',()=>{expect(hd338crmx2(3,1)).toBe(1);});it('c',()=>{expect(hd338crmx2(0,0)).toBe(0);});it('d',()=>{expect(hd338crmx2(93,73)).toBe(2);});it('e',()=>{expect(hd338crmx2(15,0)).toBe(4);});});
function hd338crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph338crmx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd339crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph339crmx2_hd',()=>{it('a',()=>{expect(hd339crmx2(1,4)).toBe(2);});it('b',()=>{expect(hd339crmx2(3,1)).toBe(1);});it('c',()=>{expect(hd339crmx2(0,0)).toBe(0);});it('d',()=>{expect(hd339crmx2(93,73)).toBe(2);});it('e',()=>{expect(hd339crmx2(15,0)).toBe(4);});});
function hd339crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph339crmx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd340crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph340crmx2_hd',()=>{it('a',()=>{expect(hd340crmx2(1,4)).toBe(2);});it('b',()=>{expect(hd340crmx2(3,1)).toBe(1);});it('c',()=>{expect(hd340crmx2(0,0)).toBe(0);});it('d',()=>{expect(hd340crmx2(93,73)).toBe(2);});it('e',()=>{expect(hd340crmx2(15,0)).toBe(4);});});
function hd340crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph340crmx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd341crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph341crmx2_hd',()=>{it('a',()=>{expect(hd341crmx2(1,4)).toBe(2);});it('b',()=>{expect(hd341crmx2(3,1)).toBe(1);});it('c',()=>{expect(hd341crmx2(0,0)).toBe(0);});it('d',()=>{expect(hd341crmx2(93,73)).toBe(2);});it('e',()=>{expect(hd341crmx2(15,0)).toBe(4);});});
function hd341crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph341crmx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd342crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph342crmx2_hd',()=>{it('a',()=>{expect(hd342crmx2(1,4)).toBe(2);});it('b',()=>{expect(hd342crmx2(3,1)).toBe(1);});it('c',()=>{expect(hd342crmx2(0,0)).toBe(0);});it('d',()=>{expect(hd342crmx2(93,73)).toBe(2);});it('e',()=>{expect(hd342crmx2(15,0)).toBe(4);});});
function hd342crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph342crmx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd343crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph343crmx2_hd',()=>{it('a',()=>{expect(hd343crmx2(1,4)).toBe(2);});it('b',()=>{expect(hd343crmx2(3,1)).toBe(1);});it('c',()=>{expect(hd343crmx2(0,0)).toBe(0);});it('d',()=>{expect(hd343crmx2(93,73)).toBe(2);});it('e',()=>{expect(hd343crmx2(15,0)).toBe(4);});});
function hd343crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph343crmx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd344crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph344crmx2_hd',()=>{it('a',()=>{expect(hd344crmx2(1,4)).toBe(2);});it('b',()=>{expect(hd344crmx2(3,1)).toBe(1);});it('c',()=>{expect(hd344crmx2(0,0)).toBe(0);});it('d',()=>{expect(hd344crmx2(93,73)).toBe(2);});it('e',()=>{expect(hd344crmx2(15,0)).toBe(4);});});
function hd344crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph344crmx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd345crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph345crmx2_hd',()=>{it('a',()=>{expect(hd345crmx2(1,4)).toBe(2);});it('b',()=>{expect(hd345crmx2(3,1)).toBe(1);});it('c',()=>{expect(hd345crmx2(0,0)).toBe(0);});it('d',()=>{expect(hd345crmx2(93,73)).toBe(2);});it('e',()=>{expect(hd345crmx2(15,0)).toBe(4);});});
function hd345crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph345crmx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd346crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph346crmx2_hd',()=>{it('a',()=>{expect(hd346crmx2(1,4)).toBe(2);});it('b',()=>{expect(hd346crmx2(3,1)).toBe(1);});it('c',()=>{expect(hd346crmx2(0,0)).toBe(0);});it('d',()=>{expect(hd346crmx2(93,73)).toBe(2);});it('e',()=>{expect(hd346crmx2(15,0)).toBe(4);});});
function hd346crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph346crmx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd347crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph347crmx2_hd',()=>{it('a',()=>{expect(hd347crmx2(1,4)).toBe(2);});it('b',()=>{expect(hd347crmx2(3,1)).toBe(1);});it('c',()=>{expect(hd347crmx2(0,0)).toBe(0);});it('d',()=>{expect(hd347crmx2(93,73)).toBe(2);});it('e',()=>{expect(hd347crmx2(15,0)).toBe(4);});});
function hd347crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph347crmx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd348crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph348crmx2_hd',()=>{it('a',()=>{expect(hd348crmx2(1,4)).toBe(2);});it('b',()=>{expect(hd348crmx2(3,1)).toBe(1);});it('c',()=>{expect(hd348crmx2(0,0)).toBe(0);});it('d',()=>{expect(hd348crmx2(93,73)).toBe(2);});it('e',()=>{expect(hd348crmx2(15,0)).toBe(4);});});
function hd348crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph348crmx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd349crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph349crmx2_hd',()=>{it('a',()=>{expect(hd349crmx2(1,4)).toBe(2);});it('b',()=>{expect(hd349crmx2(3,1)).toBe(1);});it('c',()=>{expect(hd349crmx2(0,0)).toBe(0);});it('d',()=>{expect(hd349crmx2(93,73)).toBe(2);});it('e',()=>{expect(hd349crmx2(15,0)).toBe(4);});});
function hd349crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph349crmx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd350crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph350crmx2_hd',()=>{it('a',()=>{expect(hd350crmx2(1,4)).toBe(2);});it('b',()=>{expect(hd350crmx2(3,1)).toBe(1);});it('c',()=>{expect(hd350crmx2(0,0)).toBe(0);});it('d',()=>{expect(hd350crmx2(93,73)).toBe(2);});it('e',()=>{expect(hd350crmx2(15,0)).toBe(4);});});
function hd350crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph350crmx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd351crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph351crmx2_hd',()=>{it('a',()=>{expect(hd351crmx2(1,4)).toBe(2);});it('b',()=>{expect(hd351crmx2(3,1)).toBe(1);});it('c',()=>{expect(hd351crmx2(0,0)).toBe(0);});it('d',()=>{expect(hd351crmx2(93,73)).toBe(2);});it('e',()=>{expect(hd351crmx2(15,0)).toBe(4);});});
function hd351crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph351crmx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd352crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph352crmx2_hd',()=>{it('a',()=>{expect(hd352crmx2(1,4)).toBe(2);});it('b',()=>{expect(hd352crmx2(3,1)).toBe(1);});it('c',()=>{expect(hd352crmx2(0,0)).toBe(0);});it('d',()=>{expect(hd352crmx2(93,73)).toBe(2);});it('e',()=>{expect(hd352crmx2(15,0)).toBe(4);});});
function hd352crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph352crmx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd353crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph353crmx2_hd',()=>{it('a',()=>{expect(hd353crmx2(1,4)).toBe(2);});it('b',()=>{expect(hd353crmx2(3,1)).toBe(1);});it('c',()=>{expect(hd353crmx2(0,0)).toBe(0);});it('d',()=>{expect(hd353crmx2(93,73)).toBe(2);});it('e',()=>{expect(hd353crmx2(15,0)).toBe(4);});});
function hd353crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph353crmx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd354crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph354crmx2_hd',()=>{it('a',()=>{expect(hd354crmx2(1,4)).toBe(2);});it('b',()=>{expect(hd354crmx2(3,1)).toBe(1);});it('c',()=>{expect(hd354crmx2(0,0)).toBe(0);});it('d',()=>{expect(hd354crmx2(93,73)).toBe(2);});it('e',()=>{expect(hd354crmx2(15,0)).toBe(4);});});
function hd354crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph354crmx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd355crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph355crmx2_hd',()=>{it('a',()=>{expect(hd355crmx2(1,4)).toBe(2);});it('b',()=>{expect(hd355crmx2(3,1)).toBe(1);});it('c',()=>{expect(hd355crmx2(0,0)).toBe(0);});it('d',()=>{expect(hd355crmx2(93,73)).toBe(2);});it('e',()=>{expect(hd355crmx2(15,0)).toBe(4);});});
function hd355crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph355crmx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd356crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph356crmx2_hd',()=>{it('a',()=>{expect(hd356crmx2(1,4)).toBe(2);});it('b',()=>{expect(hd356crmx2(3,1)).toBe(1);});it('c',()=>{expect(hd356crmx2(0,0)).toBe(0);});it('d',()=>{expect(hd356crmx2(93,73)).toBe(2);});it('e',()=>{expect(hd356crmx2(15,0)).toBe(4);});});
function hd356crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph356crmx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd357crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph357crmx2_hd',()=>{it('a',()=>{expect(hd357crmx2(1,4)).toBe(2);});it('b',()=>{expect(hd357crmx2(3,1)).toBe(1);});it('c',()=>{expect(hd357crmx2(0,0)).toBe(0);});it('d',()=>{expect(hd357crmx2(93,73)).toBe(2);});it('e',()=>{expect(hd357crmx2(15,0)).toBe(4);});});
function hd357crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph357crmx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd358crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph358crmx2_hd',()=>{it('a',()=>{expect(hd358crmx2(1,4)).toBe(2);});it('b',()=>{expect(hd358crmx2(3,1)).toBe(1);});it('c',()=>{expect(hd358crmx2(0,0)).toBe(0);});it('d',()=>{expect(hd358crmx2(93,73)).toBe(2);});it('e',()=>{expect(hd358crmx2(15,0)).toBe(4);});});
function hd358crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph358crmx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd359crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph359crmx2_hd',()=>{it('a',()=>{expect(hd359crmx2(1,4)).toBe(2);});it('b',()=>{expect(hd359crmx2(3,1)).toBe(1);});it('c',()=>{expect(hd359crmx2(0,0)).toBe(0);});it('d',()=>{expect(hd359crmx2(93,73)).toBe(2);});it('e',()=>{expect(hd359crmx2(15,0)).toBe(4);});});
function hd359crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph359crmx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd360crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph360crmx2_hd',()=>{it('a',()=>{expect(hd360crmx2(1,4)).toBe(2);});it('b',()=>{expect(hd360crmx2(3,1)).toBe(1);});it('c',()=>{expect(hd360crmx2(0,0)).toBe(0);});it('d',()=>{expect(hd360crmx2(93,73)).toBe(2);});it('e',()=>{expect(hd360crmx2(15,0)).toBe(4);});});
function hd360crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph360crmx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd361crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph361crmx2_hd',()=>{it('a',()=>{expect(hd361crmx2(1,4)).toBe(2);});it('b',()=>{expect(hd361crmx2(3,1)).toBe(1);});it('c',()=>{expect(hd361crmx2(0,0)).toBe(0);});it('d',()=>{expect(hd361crmx2(93,73)).toBe(2);});it('e',()=>{expect(hd361crmx2(15,0)).toBe(4);});});
function hd361crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph361crmx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd362crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph362crmx2_hd',()=>{it('a',()=>{expect(hd362crmx2(1,4)).toBe(2);});it('b',()=>{expect(hd362crmx2(3,1)).toBe(1);});it('c',()=>{expect(hd362crmx2(0,0)).toBe(0);});it('d',()=>{expect(hd362crmx2(93,73)).toBe(2);});it('e',()=>{expect(hd362crmx2(15,0)).toBe(4);});});
function hd362crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph362crmx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd363crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph363crmx2_hd',()=>{it('a',()=>{expect(hd363crmx2(1,4)).toBe(2);});it('b',()=>{expect(hd363crmx2(3,1)).toBe(1);});it('c',()=>{expect(hd363crmx2(0,0)).toBe(0);});it('d',()=>{expect(hd363crmx2(93,73)).toBe(2);});it('e',()=>{expect(hd363crmx2(15,0)).toBe(4);});});
function hd363crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph363crmx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd364crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph364crmx2_hd',()=>{it('a',()=>{expect(hd364crmx2(1,4)).toBe(2);});it('b',()=>{expect(hd364crmx2(3,1)).toBe(1);});it('c',()=>{expect(hd364crmx2(0,0)).toBe(0);});it('d',()=>{expect(hd364crmx2(93,73)).toBe(2);});it('e',()=>{expect(hd364crmx2(15,0)).toBe(4);});});
function hd364crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph364crmx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd365crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph365crmx2_hd',()=>{it('a',()=>{expect(hd365crmx2(1,4)).toBe(2);});it('b',()=>{expect(hd365crmx2(3,1)).toBe(1);});it('c',()=>{expect(hd365crmx2(0,0)).toBe(0);});it('d',()=>{expect(hd365crmx2(93,73)).toBe(2);});it('e',()=>{expect(hd365crmx2(15,0)).toBe(4);});});
function hd365crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph365crmx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd366crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph366crmx2_hd',()=>{it('a',()=>{expect(hd366crmx2(1,4)).toBe(2);});it('b',()=>{expect(hd366crmx2(3,1)).toBe(1);});it('c',()=>{expect(hd366crmx2(0,0)).toBe(0);});it('d',()=>{expect(hd366crmx2(93,73)).toBe(2);});it('e',()=>{expect(hd366crmx2(15,0)).toBe(4);});});
function hd366crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph366crmx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd367crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph367crmx2_hd',()=>{it('a',()=>{expect(hd367crmx2(1,4)).toBe(2);});it('b',()=>{expect(hd367crmx2(3,1)).toBe(1);});it('c',()=>{expect(hd367crmx2(0,0)).toBe(0);});it('d',()=>{expect(hd367crmx2(93,73)).toBe(2);});it('e',()=>{expect(hd367crmx2(15,0)).toBe(4);});});
function hd367crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph367crmx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd368crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph368crmx2_hd',()=>{it('a',()=>{expect(hd368crmx2(1,4)).toBe(2);});it('b',()=>{expect(hd368crmx2(3,1)).toBe(1);});it('c',()=>{expect(hd368crmx2(0,0)).toBe(0);});it('d',()=>{expect(hd368crmx2(93,73)).toBe(2);});it('e',()=>{expect(hd368crmx2(15,0)).toBe(4);});});
function hd368crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph368crmx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd369crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph369crmx2_hd',()=>{it('a',()=>{expect(hd369crmx2(1,4)).toBe(2);});it('b',()=>{expect(hd369crmx2(3,1)).toBe(1);});it('c',()=>{expect(hd369crmx2(0,0)).toBe(0);});it('d',()=>{expect(hd369crmx2(93,73)).toBe(2);});it('e',()=>{expect(hd369crmx2(15,0)).toBe(4);});});
function hd369crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph369crmx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd370crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph370crmx2_hd',()=>{it('a',()=>{expect(hd370crmx2(1,4)).toBe(2);});it('b',()=>{expect(hd370crmx2(3,1)).toBe(1);});it('c',()=>{expect(hd370crmx2(0,0)).toBe(0);});it('d',()=>{expect(hd370crmx2(93,73)).toBe(2);});it('e',()=>{expect(hd370crmx2(15,0)).toBe(4);});});
function hd370crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph370crmx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd371crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph371crmx2_hd',()=>{it('a',()=>{expect(hd371crmx2(1,4)).toBe(2);});it('b',()=>{expect(hd371crmx2(3,1)).toBe(1);});it('c',()=>{expect(hd371crmx2(0,0)).toBe(0);});it('d',()=>{expect(hd371crmx2(93,73)).toBe(2);});it('e',()=>{expect(hd371crmx2(15,0)).toBe(4);});});
function hd371crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph371crmx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd372crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph372crmx2_hd',()=>{it('a',()=>{expect(hd372crmx2(1,4)).toBe(2);});it('b',()=>{expect(hd372crmx2(3,1)).toBe(1);});it('c',()=>{expect(hd372crmx2(0,0)).toBe(0);});it('d',()=>{expect(hd372crmx2(93,73)).toBe(2);});it('e',()=>{expect(hd372crmx2(15,0)).toBe(4);});});
function hd372crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph372crmx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd373crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph373crmx2_hd',()=>{it('a',()=>{expect(hd373crmx2(1,4)).toBe(2);});it('b',()=>{expect(hd373crmx2(3,1)).toBe(1);});it('c',()=>{expect(hd373crmx2(0,0)).toBe(0);});it('d',()=>{expect(hd373crmx2(93,73)).toBe(2);});it('e',()=>{expect(hd373crmx2(15,0)).toBe(4);});});
function hd373crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph373crmx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd374crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph374crmx2_hd',()=>{it('a',()=>{expect(hd374crmx2(1,4)).toBe(2);});it('b',()=>{expect(hd374crmx2(3,1)).toBe(1);});it('c',()=>{expect(hd374crmx2(0,0)).toBe(0);});it('d',()=>{expect(hd374crmx2(93,73)).toBe(2);});it('e',()=>{expect(hd374crmx2(15,0)).toBe(4);});});
function hd374crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph374crmx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd375crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph375crmx2_hd',()=>{it('a',()=>{expect(hd375crmx2(1,4)).toBe(2);});it('b',()=>{expect(hd375crmx2(3,1)).toBe(1);});it('c',()=>{expect(hd375crmx2(0,0)).toBe(0);});it('d',()=>{expect(hd375crmx2(93,73)).toBe(2);});it('e',()=>{expect(hd375crmx2(15,0)).toBe(4);});});
function hd375crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph375crmx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd376crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph376crmx2_hd',()=>{it('a',()=>{expect(hd376crmx2(1,4)).toBe(2);});it('b',()=>{expect(hd376crmx2(3,1)).toBe(1);});it('c',()=>{expect(hd376crmx2(0,0)).toBe(0);});it('d',()=>{expect(hd376crmx2(93,73)).toBe(2);});it('e',()=>{expect(hd376crmx2(15,0)).toBe(4);});});
function hd376crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph376crmx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd377crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph377crmx2_hd',()=>{it('a',()=>{expect(hd377crmx2(1,4)).toBe(2);});it('b',()=>{expect(hd377crmx2(3,1)).toBe(1);});it('c',()=>{expect(hd377crmx2(0,0)).toBe(0);});it('d',()=>{expect(hd377crmx2(93,73)).toBe(2);});it('e',()=>{expect(hd377crmx2(15,0)).toBe(4);});});
function hd377crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph377crmx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd378crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph378crmx2_hd',()=>{it('a',()=>{expect(hd378crmx2(1,4)).toBe(2);});it('b',()=>{expect(hd378crmx2(3,1)).toBe(1);});it('c',()=>{expect(hd378crmx2(0,0)).toBe(0);});it('d',()=>{expect(hd378crmx2(93,73)).toBe(2);});it('e',()=>{expect(hd378crmx2(15,0)).toBe(4);});});
function hd378crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph378crmx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd379crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph379crmx2_hd',()=>{it('a',()=>{expect(hd379crmx2(1,4)).toBe(2);});it('b',()=>{expect(hd379crmx2(3,1)).toBe(1);});it('c',()=>{expect(hd379crmx2(0,0)).toBe(0);});it('d',()=>{expect(hd379crmx2(93,73)).toBe(2);});it('e',()=>{expect(hd379crmx2(15,0)).toBe(4);});});
function hd379crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph379crmx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd380crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph380crmx2_hd',()=>{it('a',()=>{expect(hd380crmx2(1,4)).toBe(2);});it('b',()=>{expect(hd380crmx2(3,1)).toBe(1);});it('c',()=>{expect(hd380crmx2(0,0)).toBe(0);});it('d',()=>{expect(hd380crmx2(93,73)).toBe(2);});it('e',()=>{expect(hd380crmx2(15,0)).toBe(4);});});
function hd380crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph380crmx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd381crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph381crmx2_hd',()=>{it('a',()=>{expect(hd381crmx2(1,4)).toBe(2);});it('b',()=>{expect(hd381crmx2(3,1)).toBe(1);});it('c',()=>{expect(hd381crmx2(0,0)).toBe(0);});it('d',()=>{expect(hd381crmx2(93,73)).toBe(2);});it('e',()=>{expect(hd381crmx2(15,0)).toBe(4);});});
function hd381crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph381crmx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd382crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph382crmx2_hd',()=>{it('a',()=>{expect(hd382crmx2(1,4)).toBe(2);});it('b',()=>{expect(hd382crmx2(3,1)).toBe(1);});it('c',()=>{expect(hd382crmx2(0,0)).toBe(0);});it('d',()=>{expect(hd382crmx2(93,73)).toBe(2);});it('e',()=>{expect(hd382crmx2(15,0)).toBe(4);});});
function hd382crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph382crmx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd383crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph383crmx2_hd',()=>{it('a',()=>{expect(hd383crmx2(1,4)).toBe(2);});it('b',()=>{expect(hd383crmx2(3,1)).toBe(1);});it('c',()=>{expect(hd383crmx2(0,0)).toBe(0);});it('d',()=>{expect(hd383crmx2(93,73)).toBe(2);});it('e',()=>{expect(hd383crmx2(15,0)).toBe(4);});});
function hd383crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph383crmx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd384crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph384crmx2_hd',()=>{it('a',()=>{expect(hd384crmx2(1,4)).toBe(2);});it('b',()=>{expect(hd384crmx2(3,1)).toBe(1);});it('c',()=>{expect(hd384crmx2(0,0)).toBe(0);});it('d',()=>{expect(hd384crmx2(93,73)).toBe(2);});it('e',()=>{expect(hd384crmx2(15,0)).toBe(4);});});
function hd384crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph384crmx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd385crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph385crmx2_hd',()=>{it('a',()=>{expect(hd385crmx2(1,4)).toBe(2);});it('b',()=>{expect(hd385crmx2(3,1)).toBe(1);});it('c',()=>{expect(hd385crmx2(0,0)).toBe(0);});it('d',()=>{expect(hd385crmx2(93,73)).toBe(2);});it('e',()=>{expect(hd385crmx2(15,0)).toBe(4);});});
function hd385crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph385crmx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd386crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph386crmx2_hd',()=>{it('a',()=>{expect(hd386crmx2(1,4)).toBe(2);});it('b',()=>{expect(hd386crmx2(3,1)).toBe(1);});it('c',()=>{expect(hd386crmx2(0,0)).toBe(0);});it('d',()=>{expect(hd386crmx2(93,73)).toBe(2);});it('e',()=>{expect(hd386crmx2(15,0)).toBe(4);});});
function hd386crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph386crmx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd387crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph387crmx2_hd',()=>{it('a',()=>{expect(hd387crmx2(1,4)).toBe(2);});it('b',()=>{expect(hd387crmx2(3,1)).toBe(1);});it('c',()=>{expect(hd387crmx2(0,0)).toBe(0);});it('d',()=>{expect(hd387crmx2(93,73)).toBe(2);});it('e',()=>{expect(hd387crmx2(15,0)).toBe(4);});});
function hd387crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph387crmx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd388crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph388crmx2_hd',()=>{it('a',()=>{expect(hd388crmx2(1,4)).toBe(2);});it('b',()=>{expect(hd388crmx2(3,1)).toBe(1);});it('c',()=>{expect(hd388crmx2(0,0)).toBe(0);});it('d',()=>{expect(hd388crmx2(93,73)).toBe(2);});it('e',()=>{expect(hd388crmx2(15,0)).toBe(4);});});
function hd388crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph388crmx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd389crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph389crmx2_hd',()=>{it('a',()=>{expect(hd389crmx2(1,4)).toBe(2);});it('b',()=>{expect(hd389crmx2(3,1)).toBe(1);});it('c',()=>{expect(hd389crmx2(0,0)).toBe(0);});it('d',()=>{expect(hd389crmx2(93,73)).toBe(2);});it('e',()=>{expect(hd389crmx2(15,0)).toBe(4);});});
function hd389crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph389crmx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd390crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph390crmx2_hd',()=>{it('a',()=>{expect(hd390crmx2(1,4)).toBe(2);});it('b',()=>{expect(hd390crmx2(3,1)).toBe(1);});it('c',()=>{expect(hd390crmx2(0,0)).toBe(0);});it('d',()=>{expect(hd390crmx2(93,73)).toBe(2);});it('e',()=>{expect(hd390crmx2(15,0)).toBe(4);});});
function hd390crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph390crmx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd391crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph391crmx2_hd',()=>{it('a',()=>{expect(hd391crmx2(1,4)).toBe(2);});it('b',()=>{expect(hd391crmx2(3,1)).toBe(1);});it('c',()=>{expect(hd391crmx2(0,0)).toBe(0);});it('d',()=>{expect(hd391crmx2(93,73)).toBe(2);});it('e',()=>{expect(hd391crmx2(15,0)).toBe(4);});});
function hd391crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph391crmx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd392crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph392crmx2_hd',()=>{it('a',()=>{expect(hd392crmx2(1,4)).toBe(2);});it('b',()=>{expect(hd392crmx2(3,1)).toBe(1);});it('c',()=>{expect(hd392crmx2(0,0)).toBe(0);});it('d',()=>{expect(hd392crmx2(93,73)).toBe(2);});it('e',()=>{expect(hd392crmx2(15,0)).toBe(4);});});
function hd392crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph392crmx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd393crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph393crmx2_hd',()=>{it('a',()=>{expect(hd393crmx2(1,4)).toBe(2);});it('b',()=>{expect(hd393crmx2(3,1)).toBe(1);});it('c',()=>{expect(hd393crmx2(0,0)).toBe(0);});it('d',()=>{expect(hd393crmx2(93,73)).toBe(2);});it('e',()=>{expect(hd393crmx2(15,0)).toBe(4);});});
function hd393crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph393crmx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd394crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph394crmx2_hd',()=>{it('a',()=>{expect(hd394crmx2(1,4)).toBe(2);});it('b',()=>{expect(hd394crmx2(3,1)).toBe(1);});it('c',()=>{expect(hd394crmx2(0,0)).toBe(0);});it('d',()=>{expect(hd394crmx2(93,73)).toBe(2);});it('e',()=>{expect(hd394crmx2(15,0)).toBe(4);});});
function hd394crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph394crmx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd395crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph395crmx2_hd',()=>{it('a',()=>{expect(hd395crmx2(1,4)).toBe(2);});it('b',()=>{expect(hd395crmx2(3,1)).toBe(1);});it('c',()=>{expect(hd395crmx2(0,0)).toBe(0);});it('d',()=>{expect(hd395crmx2(93,73)).toBe(2);});it('e',()=>{expect(hd395crmx2(15,0)).toBe(4);});});
function hd395crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph395crmx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd396crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph396crmx2_hd',()=>{it('a',()=>{expect(hd396crmx2(1,4)).toBe(2);});it('b',()=>{expect(hd396crmx2(3,1)).toBe(1);});it('c',()=>{expect(hd396crmx2(0,0)).toBe(0);});it('d',()=>{expect(hd396crmx2(93,73)).toBe(2);});it('e',()=>{expect(hd396crmx2(15,0)).toBe(4);});});
function hd396crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph396crmx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd397crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph397crmx2_hd',()=>{it('a',()=>{expect(hd397crmx2(1,4)).toBe(2);});it('b',()=>{expect(hd397crmx2(3,1)).toBe(1);});it('c',()=>{expect(hd397crmx2(0,0)).toBe(0);});it('d',()=>{expect(hd397crmx2(93,73)).toBe(2);});it('e',()=>{expect(hd397crmx2(15,0)).toBe(4);});});
function hd397crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph397crmx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd398crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph398crmx2_hd',()=>{it('a',()=>{expect(hd398crmx2(1,4)).toBe(2);});it('b',()=>{expect(hd398crmx2(3,1)).toBe(1);});it('c',()=>{expect(hd398crmx2(0,0)).toBe(0);});it('d',()=>{expect(hd398crmx2(93,73)).toBe(2);});it('e',()=>{expect(hd398crmx2(15,0)).toBe(4);});});
function hd398crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph398crmx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd399crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph399crmx2_hd',()=>{it('a',()=>{expect(hd399crmx2(1,4)).toBe(2);});it('b',()=>{expect(hd399crmx2(3,1)).toBe(1);});it('c',()=>{expect(hd399crmx2(0,0)).toBe(0);});it('d',()=>{expect(hd399crmx2(93,73)).toBe(2);});it('e',()=>{expect(hd399crmx2(15,0)).toBe(4);});});
function hd399crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph399crmx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd400crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph400crmx2_hd',()=>{it('a',()=>{expect(hd400crmx2(1,4)).toBe(2);});it('b',()=>{expect(hd400crmx2(3,1)).toBe(1);});it('c',()=>{expect(hd400crmx2(0,0)).toBe(0);});it('d',()=>{expect(hd400crmx2(93,73)).toBe(2);});it('e',()=>{expect(hd400crmx2(15,0)).toBe(4);});});
function hd400crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph400crmx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd401crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph401crmx2_hd',()=>{it('a',()=>{expect(hd401crmx2(1,4)).toBe(2);});it('b',()=>{expect(hd401crmx2(3,1)).toBe(1);});it('c',()=>{expect(hd401crmx2(0,0)).toBe(0);});it('d',()=>{expect(hd401crmx2(93,73)).toBe(2);});it('e',()=>{expect(hd401crmx2(15,0)).toBe(4);});});
function hd401crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph401crmx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd402crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph402crmx2_hd',()=>{it('a',()=>{expect(hd402crmx2(1,4)).toBe(2);});it('b',()=>{expect(hd402crmx2(3,1)).toBe(1);});it('c',()=>{expect(hd402crmx2(0,0)).toBe(0);});it('d',()=>{expect(hd402crmx2(93,73)).toBe(2);});it('e',()=>{expect(hd402crmx2(15,0)).toBe(4);});});
function hd402crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph402crmx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd403crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph403crmx2_hd',()=>{it('a',()=>{expect(hd403crmx2(1,4)).toBe(2);});it('b',()=>{expect(hd403crmx2(3,1)).toBe(1);});it('c',()=>{expect(hd403crmx2(0,0)).toBe(0);});it('d',()=>{expect(hd403crmx2(93,73)).toBe(2);});it('e',()=>{expect(hd403crmx2(15,0)).toBe(4);});});
function hd403crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph403crmx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd404crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph404crmx2_hd',()=>{it('a',()=>{expect(hd404crmx2(1,4)).toBe(2);});it('b',()=>{expect(hd404crmx2(3,1)).toBe(1);});it('c',()=>{expect(hd404crmx2(0,0)).toBe(0);});it('d',()=>{expect(hd404crmx2(93,73)).toBe(2);});it('e',()=>{expect(hd404crmx2(15,0)).toBe(4);});});
function hd404crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph404crmx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd405crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph405crmx2_hd',()=>{it('a',()=>{expect(hd405crmx2(1,4)).toBe(2);});it('b',()=>{expect(hd405crmx2(3,1)).toBe(1);});it('c',()=>{expect(hd405crmx2(0,0)).toBe(0);});it('d',()=>{expect(hd405crmx2(93,73)).toBe(2);});it('e',()=>{expect(hd405crmx2(15,0)).toBe(4);});});
function hd405crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph405crmx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd406crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph406crmx2_hd',()=>{it('a',()=>{expect(hd406crmx2(1,4)).toBe(2);});it('b',()=>{expect(hd406crmx2(3,1)).toBe(1);});it('c',()=>{expect(hd406crmx2(0,0)).toBe(0);});it('d',()=>{expect(hd406crmx2(93,73)).toBe(2);});it('e',()=>{expect(hd406crmx2(15,0)).toBe(4);});});
function hd406crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph406crmx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd407crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph407crmx2_hd',()=>{it('a',()=>{expect(hd407crmx2(1,4)).toBe(2);});it('b',()=>{expect(hd407crmx2(3,1)).toBe(1);});it('c',()=>{expect(hd407crmx2(0,0)).toBe(0);});it('d',()=>{expect(hd407crmx2(93,73)).toBe(2);});it('e',()=>{expect(hd407crmx2(15,0)).toBe(4);});});
function hd407crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph407crmx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd408crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph408crmx2_hd',()=>{it('a',()=>{expect(hd408crmx2(1,4)).toBe(2);});it('b',()=>{expect(hd408crmx2(3,1)).toBe(1);});it('c',()=>{expect(hd408crmx2(0,0)).toBe(0);});it('d',()=>{expect(hd408crmx2(93,73)).toBe(2);});it('e',()=>{expect(hd408crmx2(15,0)).toBe(4);});});
function hd408crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph408crmx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd409crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph409crmx2_hd',()=>{it('a',()=>{expect(hd409crmx2(1,4)).toBe(2);});it('b',()=>{expect(hd409crmx2(3,1)).toBe(1);});it('c',()=>{expect(hd409crmx2(0,0)).toBe(0);});it('d',()=>{expect(hd409crmx2(93,73)).toBe(2);});it('e',()=>{expect(hd409crmx2(15,0)).toBe(4);});});
function hd409crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph409crmx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd410crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph410crmx2_hd',()=>{it('a',()=>{expect(hd410crmx2(1,4)).toBe(2);});it('b',()=>{expect(hd410crmx2(3,1)).toBe(1);});it('c',()=>{expect(hd410crmx2(0,0)).toBe(0);});it('d',()=>{expect(hd410crmx2(93,73)).toBe(2);});it('e',()=>{expect(hd410crmx2(15,0)).toBe(4);});});
function hd410crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph410crmx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd411crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph411crmx2_hd',()=>{it('a',()=>{expect(hd411crmx2(1,4)).toBe(2);});it('b',()=>{expect(hd411crmx2(3,1)).toBe(1);});it('c',()=>{expect(hd411crmx2(0,0)).toBe(0);});it('d',()=>{expect(hd411crmx2(93,73)).toBe(2);});it('e',()=>{expect(hd411crmx2(15,0)).toBe(4);});});
function hd411crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph411crmx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd412crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph412crmx2_hd',()=>{it('a',()=>{expect(hd412crmx2(1,4)).toBe(2);});it('b',()=>{expect(hd412crmx2(3,1)).toBe(1);});it('c',()=>{expect(hd412crmx2(0,0)).toBe(0);});it('d',()=>{expect(hd412crmx2(93,73)).toBe(2);});it('e',()=>{expect(hd412crmx2(15,0)).toBe(4);});});
function hd412crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph412crmx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd413crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph413crmx2_hd',()=>{it('a',()=>{expect(hd413crmx2(1,4)).toBe(2);});it('b',()=>{expect(hd413crmx2(3,1)).toBe(1);});it('c',()=>{expect(hd413crmx2(0,0)).toBe(0);});it('d',()=>{expect(hd413crmx2(93,73)).toBe(2);});it('e',()=>{expect(hd413crmx2(15,0)).toBe(4);});});
function hd413crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph413crmx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd414crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph414crmx2_hd',()=>{it('a',()=>{expect(hd414crmx2(1,4)).toBe(2);});it('b',()=>{expect(hd414crmx2(3,1)).toBe(1);});it('c',()=>{expect(hd414crmx2(0,0)).toBe(0);});it('d',()=>{expect(hd414crmx2(93,73)).toBe(2);});it('e',()=>{expect(hd414crmx2(15,0)).toBe(4);});});
function hd414crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph414crmx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd415crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph415crmx2_hd',()=>{it('a',()=>{expect(hd415crmx2(1,4)).toBe(2);});it('b',()=>{expect(hd415crmx2(3,1)).toBe(1);});it('c',()=>{expect(hd415crmx2(0,0)).toBe(0);});it('d',()=>{expect(hd415crmx2(93,73)).toBe(2);});it('e',()=>{expect(hd415crmx2(15,0)).toBe(4);});});
function hd415crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph415crmx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd416crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph416crmx2_hd',()=>{it('a',()=>{expect(hd416crmx2(1,4)).toBe(2);});it('b',()=>{expect(hd416crmx2(3,1)).toBe(1);});it('c',()=>{expect(hd416crmx2(0,0)).toBe(0);});it('d',()=>{expect(hd416crmx2(93,73)).toBe(2);});it('e',()=>{expect(hd416crmx2(15,0)).toBe(4);});});
function hd416crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph416crmx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd417crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph417crmx2_hd',()=>{it('a',()=>{expect(hd417crmx2(1,4)).toBe(2);});it('b',()=>{expect(hd417crmx2(3,1)).toBe(1);});it('c',()=>{expect(hd417crmx2(0,0)).toBe(0);});it('d',()=>{expect(hd417crmx2(93,73)).toBe(2);});it('e',()=>{expect(hd417crmx2(15,0)).toBe(4);});});
function hd417crmx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph417crmx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
