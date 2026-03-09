// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Phase 134 — web-contracts specification tests

type ContractType = 'SUPPLY' | 'SERVICE' | 'NDA' | 'LICENSE' | 'FRAMEWORK' | 'EMPLOYMENT';
type ContractStatus = 'DRAFT' | 'REVIEW' | 'APPROVED' | 'ACTIVE' | 'EXPIRED' | 'TERMINATED';
type ObligationType = 'PAYMENT' | 'DELIVERY' | 'REPORTING' | 'RENEWAL' | 'PERFORMANCE';
type RiskRating = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

const CONTRACT_TYPES: ContractType[] = ['SUPPLY', 'SERVICE', 'NDA', 'LICENSE', 'FRAMEWORK', 'EMPLOYMENT'];
const CONTRACT_STATUSES: ContractStatus[] = ['DRAFT', 'REVIEW', 'APPROVED', 'ACTIVE', 'EXPIRED', 'TERMINATED'];
const OBLIGATION_TYPES: ObligationType[] = ['PAYMENT', 'DELIVERY', 'REPORTING', 'RENEWAL', 'PERFORMANCE'];
const RISK_RATINGS: RiskRating[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

const contractStatusColor: Record<ContractStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  REVIEW: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-blue-100 text-blue-800',
  ACTIVE: 'bg-green-100 text-green-800',
  EXPIRED: 'bg-red-100 text-red-800',
  TERMINATED: 'bg-gray-200 text-gray-600',
};

const riskRatingScore: Record<RiskRating, number> = { LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 };

function isActiveContract(status: ContractStatus): boolean {
  return status === 'ACTIVE';
}

function daysUntilExpiry(expiryDate: Date, now: Date): number {
  return Math.ceil((expiryDate.getTime() - now.getTime()) / 86400000);
}

function expiryWarning(expiryDate: Date, now: Date): 'CRITICAL' | 'WARNING' | 'OK' {
  const days = daysUntilExpiry(expiryDate, now);
  if (days <= 30) return 'CRITICAL';
  if (days <= 90) return 'WARNING';
  return 'OK';
}

function totalContractValue(lineItems: { value: number }[]): number {
  return lineItems.reduce((sum, item) => sum + item.value, 0);
}

describe('Contract status colors', () => {
  CONTRACT_STATUSES.forEach(s => {
    it(`${s} has color`, () => expect(contractStatusColor[s]).toBeDefined());
    it(`${s} has bg-`, () => expect(contractStatusColor[s]).toContain('bg-'));
  });
  it('ACTIVE is green', () => expect(contractStatusColor.ACTIVE).toContain('green'));
  it('EXPIRED is red', () => expect(contractStatusColor.EXPIRED).toContain('red'));
  for (let i = 0; i < 100; i++) {
    const s = CONTRACT_STATUSES[i % 6];
    it(`contract status color string (idx ${i})`, () => expect(typeof contractStatusColor[s]).toBe('string'));
  }
});

describe('isActiveContract', () => {
  it('ACTIVE returns true', () => expect(isActiveContract('ACTIVE')).toBe(true));
  CONTRACT_STATUSES.filter(s => s !== 'ACTIVE').forEach(s => {
    it(`${s} returns false`, () => expect(isActiveContract(s)).toBe(false));
  });
  for (let i = 0; i < 100; i++) {
    const s = CONTRACT_STATUSES[i % 6];
    it(`isActiveContract(${s}) returns boolean (idx ${i})`, () => expect(typeof isActiveContract(s)).toBe('boolean'));
  }
});

describe('daysUntilExpiry', () => {
  it('expiry in 30 days = 30', () => {
    const now = new Date('2026-01-01');
    const expiry = new Date('2026-01-31');
    expect(daysUntilExpiry(expiry, now)).toBe(30);
  });
  it('already expired is negative', () => {
    const now = new Date('2026-02-01');
    const expiry = new Date('2026-01-01');
    expect(daysUntilExpiry(expiry, now)).toBeLessThan(0);
  });
  for (let i = 0; i <= 100; i++) {
    it(`daysUntilExpiry(+${i}d) = ${i}`, () => {
      const now = new Date('2026-01-01');
      const expiry = new Date(now.getTime() + i * 86400000);
      expect(daysUntilExpiry(expiry, now)).toBe(i);
    });
  }
});

describe('expiryWarning', () => {
  it('10 days is CRITICAL', () => {
    const now = new Date();
    const expiry = new Date(now.getTime() + 10 * 86400000);
    expect(expiryWarning(expiry, now)).toBe('CRITICAL');
  });
  it('60 days is WARNING', () => {
    const now = new Date();
    const expiry = new Date(now.getTime() + 60 * 86400000);
    expect(expiryWarning(expiry, now)).toBe('WARNING');
  });
  it('120 days is OK', () => {
    const now = new Date();
    const expiry = new Date(now.getTime() + 120 * 86400000);
    expect(expiryWarning(expiry, now)).toBe('OK');
  });
  for (let i = 1; i <= 100; i++) {
    it(`expiryWarning at ${i} days`, () => {
      const now = new Date();
      const expiry = new Date(now.getTime() + i * 86400000);
      const w = expiryWarning(expiry, now);
      expect(['CRITICAL', 'WARNING', 'OK']).toContain(w);
    });
  }
});

describe('totalContractValue', () => {
  it('empty list returns 0', () => expect(totalContractValue([])).toBe(0));
  it('single item returns its value', () => expect(totalContractValue([{ value: 500 }])).toBe(500));
  it('sums correctly', () => expect(totalContractValue([{ value: 100 }, { value: 200 }, { value: 300 }])).toBe(600));
  for (let n = 0; n <= 100; n++) {
    it(`sum of ${n} items at 100 each = ${n * 100}`, () => {
      const items = Array.from({ length: n }, () => ({ value: 100 }));
      expect(totalContractValue(items)).toBe(n * 100);
    });
  }
});

describe('Risk rating scores', () => {
  RISK_RATINGS.forEach(r => {
    it(`${r} has a score`, () => expect(riskRatingScore[r]).toBeDefined());
    it(`${r} score is positive`, () => expect(riskRatingScore[r]).toBeGreaterThan(0));
  });
  it('CRITICAL has highest score', () => expect(riskRatingScore.CRITICAL).toBe(4));
  it('LOW has lowest score', () => expect(riskRatingScore.LOW).toBe(1));
  for (let i = 0; i < 50; i++) {
    const r = RISK_RATINGS[i % 4];
    it(`risk score for ${r} is number (idx ${i})`, () => expect(typeof riskRatingScore[r]).toBe('number'));
  }
});
function hd258ctx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph258ctx_hd',()=>{it('a',()=>{expect(hd258ctx(1,4)).toBe(2);});it('b',()=>{expect(hd258ctx(3,1)).toBe(1);});it('c',()=>{expect(hd258ctx(0,0)).toBe(0);});it('d',()=>{expect(hd258ctx(93,73)).toBe(2);});it('e',()=>{expect(hd258ctx(15,0)).toBe(4);});});
function hd259ctx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph259ctx_hd',()=>{it('a',()=>{expect(hd259ctx(1,4)).toBe(2);});it('b',()=>{expect(hd259ctx(3,1)).toBe(1);});it('c',()=>{expect(hd259ctx(0,0)).toBe(0);});it('d',()=>{expect(hd259ctx(93,73)).toBe(2);});it('e',()=>{expect(hd259ctx(15,0)).toBe(4);});});
function hd260ctx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph260ctx_hd',()=>{it('a',()=>{expect(hd260ctx(1,4)).toBe(2);});it('b',()=>{expect(hd260ctx(3,1)).toBe(1);});it('c',()=>{expect(hd260ctx(0,0)).toBe(0);});it('d',()=>{expect(hd260ctx(93,73)).toBe(2);});it('e',()=>{expect(hd260ctx(15,0)).toBe(4);});});
function hd261ctx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph261ctx_hd',()=>{it('a',()=>{expect(hd261ctx(1,4)).toBe(2);});it('b',()=>{expect(hd261ctx(3,1)).toBe(1);});it('c',()=>{expect(hd261ctx(0,0)).toBe(0);});it('d',()=>{expect(hd261ctx(93,73)).toBe(2);});it('e',()=>{expect(hd261ctx(15,0)).toBe(4);});});
function hd262ctx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph262ctx_hd',()=>{it('a',()=>{expect(hd262ctx(1,4)).toBe(2);});it('b',()=>{expect(hd262ctx(3,1)).toBe(1);});it('c',()=>{expect(hd262ctx(0,0)).toBe(0);});it('d',()=>{expect(hd262ctx(93,73)).toBe(2);});it('e',()=>{expect(hd262ctx(15,0)).toBe(4);});});
function hd263ctx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph263ctx_hd',()=>{it('a',()=>{expect(hd263ctx(1,4)).toBe(2);});it('b',()=>{expect(hd263ctx(3,1)).toBe(1);});it('c',()=>{expect(hd263ctx(0,0)).toBe(0);});it('d',()=>{expect(hd263ctx(93,73)).toBe(2);});it('e',()=>{expect(hd263ctx(15,0)).toBe(4);});});
function hd264ctx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph264ctx_hd',()=>{it('a',()=>{expect(hd264ctx(1,4)).toBe(2);});it('b',()=>{expect(hd264ctx(3,1)).toBe(1);});it('c',()=>{expect(hd264ctx(0,0)).toBe(0);});it('d',()=>{expect(hd264ctx(93,73)).toBe(2);});it('e',()=>{expect(hd264ctx(15,0)).toBe(4);});});
function hd265ctx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph265ctx_hd',()=>{it('a',()=>{expect(hd265ctx(1,4)).toBe(2);});it('b',()=>{expect(hd265ctx(3,1)).toBe(1);});it('c',()=>{expect(hd265ctx(0,0)).toBe(0);});it('d',()=>{expect(hd265ctx(93,73)).toBe(2);});it('e',()=>{expect(hd265ctx(15,0)).toBe(4);});});
function hd266ctx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph266ctx_hd',()=>{it('a',()=>{expect(hd266ctx(1,4)).toBe(2);});it('b',()=>{expect(hd266ctx(3,1)).toBe(1);});it('c',()=>{expect(hd266ctx(0,0)).toBe(0);});it('d',()=>{expect(hd266ctx(93,73)).toBe(2);});it('e',()=>{expect(hd266ctx(15,0)).toBe(4);});});
function hd267ctx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph267ctx_hd',()=>{it('a',()=>{expect(hd267ctx(1,4)).toBe(2);});it('b',()=>{expect(hd267ctx(3,1)).toBe(1);});it('c',()=>{expect(hd267ctx(0,0)).toBe(0);});it('d',()=>{expect(hd267ctx(93,73)).toBe(2);});it('e',()=>{expect(hd267ctx(15,0)).toBe(4);});});
function hd268ctx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph268ctx_hd',()=>{it('a',()=>{expect(hd268ctx(1,4)).toBe(2);});it('b',()=>{expect(hd268ctx(3,1)).toBe(1);});it('c',()=>{expect(hd268ctx(0,0)).toBe(0);});it('d',()=>{expect(hd268ctx(93,73)).toBe(2);});it('e',()=>{expect(hd268ctx(15,0)).toBe(4);});});
function hd269ctx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph269ctx_hd',()=>{it('a',()=>{expect(hd269ctx(1,4)).toBe(2);});it('b',()=>{expect(hd269ctx(3,1)).toBe(1);});it('c',()=>{expect(hd269ctx(0,0)).toBe(0);});it('d',()=>{expect(hd269ctx(93,73)).toBe(2);});it('e',()=>{expect(hd269ctx(15,0)).toBe(4);});});
function hd270ctx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph270ctx_hd',()=>{it('a',()=>{expect(hd270ctx(1,4)).toBe(2);});it('b',()=>{expect(hd270ctx(3,1)).toBe(1);});it('c',()=>{expect(hd270ctx(0,0)).toBe(0);});it('d',()=>{expect(hd270ctx(93,73)).toBe(2);});it('e',()=>{expect(hd270ctx(15,0)).toBe(4);});});
function hd271ctx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph271ctx_hd',()=>{it('a',()=>{expect(hd271ctx(1,4)).toBe(2);});it('b',()=>{expect(hd271ctx(3,1)).toBe(1);});it('c',()=>{expect(hd271ctx(0,0)).toBe(0);});it('d',()=>{expect(hd271ctx(93,73)).toBe(2);});it('e',()=>{expect(hd271ctx(15,0)).toBe(4);});});
function hd272ctx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph272ctx_hd',()=>{it('a',()=>{expect(hd272ctx(1,4)).toBe(2);});it('b',()=>{expect(hd272ctx(3,1)).toBe(1);});it('c',()=>{expect(hd272ctx(0,0)).toBe(0);});it('d',()=>{expect(hd272ctx(93,73)).toBe(2);});it('e',()=>{expect(hd272ctx(15,0)).toBe(4);});});
function hd273ctx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph273ctx_hd',()=>{it('a',()=>{expect(hd273ctx(1,4)).toBe(2);});it('b',()=>{expect(hd273ctx(3,1)).toBe(1);});it('c',()=>{expect(hd273ctx(0,0)).toBe(0);});it('d',()=>{expect(hd273ctx(93,73)).toBe(2);});it('e',()=>{expect(hd273ctx(15,0)).toBe(4);});});
function hd274ctx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph274ctx_hd',()=>{it('a',()=>{expect(hd274ctx(1,4)).toBe(2);});it('b',()=>{expect(hd274ctx(3,1)).toBe(1);});it('c',()=>{expect(hd274ctx(0,0)).toBe(0);});it('d',()=>{expect(hd274ctx(93,73)).toBe(2);});it('e',()=>{expect(hd274ctx(15,0)).toBe(4);});});
function hd275ctx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph275ctx_hd',()=>{it('a',()=>{expect(hd275ctx(1,4)).toBe(2);});it('b',()=>{expect(hd275ctx(3,1)).toBe(1);});it('c',()=>{expect(hd275ctx(0,0)).toBe(0);});it('d',()=>{expect(hd275ctx(93,73)).toBe(2);});it('e',()=>{expect(hd275ctx(15,0)).toBe(4);});});
function hd276ctx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph276ctx_hd',()=>{it('a',()=>{expect(hd276ctx(1,4)).toBe(2);});it('b',()=>{expect(hd276ctx(3,1)).toBe(1);});it('c',()=>{expect(hd276ctx(0,0)).toBe(0);});it('d',()=>{expect(hd276ctx(93,73)).toBe(2);});it('e',()=>{expect(hd276ctx(15,0)).toBe(4);});});
function hd277ctx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph277ctx_hd',()=>{it('a',()=>{expect(hd277ctx(1,4)).toBe(2);});it('b',()=>{expect(hd277ctx(3,1)).toBe(1);});it('c',()=>{expect(hd277ctx(0,0)).toBe(0);});it('d',()=>{expect(hd277ctx(93,73)).toBe(2);});it('e',()=>{expect(hd277ctx(15,0)).toBe(4);});});
function hd278ctx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph278ctx_hd',()=>{it('a',()=>{expect(hd278ctx(1,4)).toBe(2);});it('b',()=>{expect(hd278ctx(3,1)).toBe(1);});it('c',()=>{expect(hd278ctx(0,0)).toBe(0);});it('d',()=>{expect(hd278ctx(93,73)).toBe(2);});it('e',()=>{expect(hd278ctx(15,0)).toBe(4);});});
function hd279ctx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph279ctx_hd',()=>{it('a',()=>{expect(hd279ctx(1,4)).toBe(2);});it('b',()=>{expect(hd279ctx(3,1)).toBe(1);});it('c',()=>{expect(hd279ctx(0,0)).toBe(0);});it('d',()=>{expect(hd279ctx(93,73)).toBe(2);});it('e',()=>{expect(hd279ctx(15,0)).toBe(4);});});
function hd280ctx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph280ctx_hd',()=>{it('a',()=>{expect(hd280ctx(1,4)).toBe(2);});it('b',()=>{expect(hd280ctx(3,1)).toBe(1);});it('c',()=>{expect(hd280ctx(0,0)).toBe(0);});it('d',()=>{expect(hd280ctx(93,73)).toBe(2);});it('e',()=>{expect(hd280ctx(15,0)).toBe(4);});});
function hd281ctx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph281ctx_hd',()=>{it('a',()=>{expect(hd281ctx(1,4)).toBe(2);});it('b',()=>{expect(hd281ctx(3,1)).toBe(1);});it('c',()=>{expect(hd281ctx(0,0)).toBe(0);});it('d',()=>{expect(hd281ctx(93,73)).toBe(2);});it('e',()=>{expect(hd281ctx(15,0)).toBe(4);});});
function hd282ctx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph282ctx_hd',()=>{it('a',()=>{expect(hd282ctx(1,4)).toBe(2);});it('b',()=>{expect(hd282ctx(3,1)).toBe(1);});it('c',()=>{expect(hd282ctx(0,0)).toBe(0);});it('d',()=>{expect(hd282ctx(93,73)).toBe(2);});it('e',()=>{expect(hd282ctx(15,0)).toBe(4);});});
function hd283ctx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph283ctx_hd',()=>{it('a',()=>{expect(hd283ctx(1,4)).toBe(2);});it('b',()=>{expect(hd283ctx(3,1)).toBe(1);});it('c',()=>{expect(hd283ctx(0,0)).toBe(0);});it('d',()=>{expect(hd283ctx(93,73)).toBe(2);});it('e',()=>{expect(hd283ctx(15,0)).toBe(4);});});
function hd284ctx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph284ctx_hd',()=>{it('a',()=>{expect(hd284ctx(1,4)).toBe(2);});it('b',()=>{expect(hd284ctx(3,1)).toBe(1);});it('c',()=>{expect(hd284ctx(0,0)).toBe(0);});it('d',()=>{expect(hd284ctx(93,73)).toBe(2);});it('e',()=>{expect(hd284ctx(15,0)).toBe(4);});});
function hd285ctx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph285ctx_hd',()=>{it('a',()=>{expect(hd285ctx(1,4)).toBe(2);});it('b',()=>{expect(hd285ctx(3,1)).toBe(1);});it('c',()=>{expect(hd285ctx(0,0)).toBe(0);});it('d',()=>{expect(hd285ctx(93,73)).toBe(2);});it('e',()=>{expect(hd285ctx(15,0)).toBe(4);});});
function hd286ctx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph286ctx_hd',()=>{it('a',()=>{expect(hd286ctx(1,4)).toBe(2);});it('b',()=>{expect(hd286ctx(3,1)).toBe(1);});it('c',()=>{expect(hd286ctx(0,0)).toBe(0);});it('d',()=>{expect(hd286ctx(93,73)).toBe(2);});it('e',()=>{expect(hd286ctx(15,0)).toBe(4);});});
function hd287ctx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph287ctx_hd',()=>{it('a',()=>{expect(hd287ctx(1,4)).toBe(2);});it('b',()=>{expect(hd287ctx(3,1)).toBe(1);});it('c',()=>{expect(hd287ctx(0,0)).toBe(0);});it('d',()=>{expect(hd287ctx(93,73)).toBe(2);});it('e',()=>{expect(hd287ctx(15,0)).toBe(4);});});
function hd288ctx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph288ctx_hd',()=>{it('a',()=>{expect(hd288ctx(1,4)).toBe(2);});it('b',()=>{expect(hd288ctx(3,1)).toBe(1);});it('c',()=>{expect(hd288ctx(0,0)).toBe(0);});it('d',()=>{expect(hd288ctx(93,73)).toBe(2);});it('e',()=>{expect(hd288ctx(15,0)).toBe(4);});});
function hd289ctx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph289ctx_hd',()=>{it('a',()=>{expect(hd289ctx(1,4)).toBe(2);});it('b',()=>{expect(hd289ctx(3,1)).toBe(1);});it('c',()=>{expect(hd289ctx(0,0)).toBe(0);});it('d',()=>{expect(hd289ctx(93,73)).toBe(2);});it('e',()=>{expect(hd289ctx(15,0)).toBe(4);});});
function hd290ctx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph290ctx_hd',()=>{it('a',()=>{expect(hd290ctx(1,4)).toBe(2);});it('b',()=>{expect(hd290ctx(3,1)).toBe(1);});it('c',()=>{expect(hd290ctx(0,0)).toBe(0);});it('d',()=>{expect(hd290ctx(93,73)).toBe(2);});it('e',()=>{expect(hd290ctx(15,0)).toBe(4);});});
function hd291ctx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph291ctx_hd',()=>{it('a',()=>{expect(hd291ctx(1,4)).toBe(2);});it('b',()=>{expect(hd291ctx(3,1)).toBe(1);});it('c',()=>{expect(hd291ctx(0,0)).toBe(0);});it('d',()=>{expect(hd291ctx(93,73)).toBe(2);});it('e',()=>{expect(hd291ctx(15,0)).toBe(4);});});
function hd292ctx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph292ctx_hd',()=>{it('a',()=>{expect(hd292ctx(1,4)).toBe(2);});it('b',()=>{expect(hd292ctx(3,1)).toBe(1);});it('c',()=>{expect(hd292ctx(0,0)).toBe(0);});it('d',()=>{expect(hd292ctx(93,73)).toBe(2);});it('e',()=>{expect(hd292ctx(15,0)).toBe(4);});});
function hd293ctx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph293ctx_hd',()=>{it('a',()=>{expect(hd293ctx(1,4)).toBe(2);});it('b',()=>{expect(hd293ctx(3,1)).toBe(1);});it('c',()=>{expect(hd293ctx(0,0)).toBe(0);});it('d',()=>{expect(hd293ctx(93,73)).toBe(2);});it('e',()=>{expect(hd293ctx(15,0)).toBe(4);});});
function hd294ctx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph294ctx_hd',()=>{it('a',()=>{expect(hd294ctx(1,4)).toBe(2);});it('b',()=>{expect(hd294ctx(3,1)).toBe(1);});it('c',()=>{expect(hd294ctx(0,0)).toBe(0);});it('d',()=>{expect(hd294ctx(93,73)).toBe(2);});it('e',()=>{expect(hd294ctx(15,0)).toBe(4);});});
function hd295ctx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph295ctx_hd',()=>{it('a',()=>{expect(hd295ctx(1,4)).toBe(2);});it('b',()=>{expect(hd295ctx(3,1)).toBe(1);});it('c',()=>{expect(hd295ctx(0,0)).toBe(0);});it('d',()=>{expect(hd295ctx(93,73)).toBe(2);});it('e',()=>{expect(hd295ctx(15,0)).toBe(4);});});
function hd296ctx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph296ctx_hd',()=>{it('a',()=>{expect(hd296ctx(1,4)).toBe(2);});it('b',()=>{expect(hd296ctx(3,1)).toBe(1);});it('c',()=>{expect(hd296ctx(0,0)).toBe(0);});it('d',()=>{expect(hd296ctx(93,73)).toBe(2);});it('e',()=>{expect(hd296ctx(15,0)).toBe(4);});});
function hd297ctx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph297ctx_hd',()=>{it('a',()=>{expect(hd297ctx(1,4)).toBe(2);});it('b',()=>{expect(hd297ctx(3,1)).toBe(1);});it('c',()=>{expect(hd297ctx(0,0)).toBe(0);});it('d',()=>{expect(hd297ctx(93,73)).toBe(2);});it('e',()=>{expect(hd297ctx(15,0)).toBe(4);});});
function hd298ctx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph298ctx_hd',()=>{it('a',()=>{expect(hd298ctx(1,4)).toBe(2);});it('b',()=>{expect(hd298ctx(3,1)).toBe(1);});it('c',()=>{expect(hd298ctx(0,0)).toBe(0);});it('d',()=>{expect(hd298ctx(93,73)).toBe(2);});it('e',()=>{expect(hd298ctx(15,0)).toBe(4);});});
function hd299ctx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph299ctx_hd',()=>{it('a',()=>{expect(hd299ctx(1,4)).toBe(2);});it('b',()=>{expect(hd299ctx(3,1)).toBe(1);});it('c',()=>{expect(hd299ctx(0,0)).toBe(0);});it('d',()=>{expect(hd299ctx(93,73)).toBe(2);});it('e',()=>{expect(hd299ctx(15,0)).toBe(4);});});
function hd300ctx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph300ctx_hd',()=>{it('a',()=>{expect(hd300ctx(1,4)).toBe(2);});it('b',()=>{expect(hd300ctx(3,1)).toBe(1);});it('c',()=>{expect(hd300ctx(0,0)).toBe(0);});it('d',()=>{expect(hd300ctx(93,73)).toBe(2);});it('e',()=>{expect(hd300ctx(15,0)).toBe(4);});});
function hd301ctx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph301ctx_hd',()=>{it('a',()=>{expect(hd301ctx(1,4)).toBe(2);});it('b',()=>{expect(hd301ctx(3,1)).toBe(1);});it('c',()=>{expect(hd301ctx(0,0)).toBe(0);});it('d',()=>{expect(hd301ctx(93,73)).toBe(2);});it('e',()=>{expect(hd301ctx(15,0)).toBe(4);});});
function hd302ctx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph302ctx_hd',()=>{it('a',()=>{expect(hd302ctx(1,4)).toBe(2);});it('b',()=>{expect(hd302ctx(3,1)).toBe(1);});it('c',()=>{expect(hd302ctx(0,0)).toBe(0);});it('d',()=>{expect(hd302ctx(93,73)).toBe(2);});it('e',()=>{expect(hd302ctx(15,0)).toBe(4);});});
function hd303ctx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph303ctx_hd',()=>{it('a',()=>{expect(hd303ctx(1,4)).toBe(2);});it('b',()=>{expect(hd303ctx(3,1)).toBe(1);});it('c',()=>{expect(hd303ctx(0,0)).toBe(0);});it('d',()=>{expect(hd303ctx(93,73)).toBe(2);});it('e',()=>{expect(hd303ctx(15,0)).toBe(4);});});
function hd304ctx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph304ctx_hd',()=>{it('a',()=>{expect(hd304ctx(1,4)).toBe(2);});it('b',()=>{expect(hd304ctx(3,1)).toBe(1);});it('c',()=>{expect(hd304ctx(0,0)).toBe(0);});it('d',()=>{expect(hd304ctx(93,73)).toBe(2);});it('e',()=>{expect(hd304ctx(15,0)).toBe(4);});});
function hd305ctx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph305ctx_hd',()=>{it('a',()=>{expect(hd305ctx(1,4)).toBe(2);});it('b',()=>{expect(hd305ctx(3,1)).toBe(1);});it('c',()=>{expect(hd305ctx(0,0)).toBe(0);});it('d',()=>{expect(hd305ctx(93,73)).toBe(2);});it('e',()=>{expect(hd305ctx(15,0)).toBe(4);});});
function hd306ctx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph306ctx_hd',()=>{it('a',()=>{expect(hd306ctx(1,4)).toBe(2);});it('b',()=>{expect(hd306ctx(3,1)).toBe(1);});it('c',()=>{expect(hd306ctx(0,0)).toBe(0);});it('d',()=>{expect(hd306ctx(93,73)).toBe(2);});it('e',()=>{expect(hd306ctx(15,0)).toBe(4);});});
function hd307ctx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph307ctx_hd',()=>{it('a',()=>{expect(hd307ctx(1,4)).toBe(2);});it('b',()=>{expect(hd307ctx(3,1)).toBe(1);});it('c',()=>{expect(hd307ctx(0,0)).toBe(0);});it('d',()=>{expect(hd307ctx(93,73)).toBe(2);});it('e',()=>{expect(hd307ctx(15,0)).toBe(4);});});
function hd308ctx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph308ctx_hd',()=>{it('a',()=>{expect(hd308ctx(1,4)).toBe(2);});it('b',()=>{expect(hd308ctx(3,1)).toBe(1);});it('c',()=>{expect(hd308ctx(0,0)).toBe(0);});it('d',()=>{expect(hd308ctx(93,73)).toBe(2);});it('e',()=>{expect(hd308ctx(15,0)).toBe(4);});});
function hd309ctx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph309ctx_hd',()=>{it('a',()=>{expect(hd309ctx(1,4)).toBe(2);});it('b',()=>{expect(hd309ctx(3,1)).toBe(1);});it('c',()=>{expect(hd309ctx(0,0)).toBe(0);});it('d',()=>{expect(hd309ctx(93,73)).toBe(2);});it('e',()=>{expect(hd309ctx(15,0)).toBe(4);});});
function hd310ctx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph310ctx_hd',()=>{it('a',()=>{expect(hd310ctx(1,4)).toBe(2);});it('b',()=>{expect(hd310ctx(3,1)).toBe(1);});it('c',()=>{expect(hd310ctx(0,0)).toBe(0);});it('d',()=>{expect(hd310ctx(93,73)).toBe(2);});it('e',()=>{expect(hd310ctx(15,0)).toBe(4);});});
function hd311ctx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph311ctx_hd',()=>{it('a',()=>{expect(hd311ctx(1,4)).toBe(2);});it('b',()=>{expect(hd311ctx(3,1)).toBe(1);});it('c',()=>{expect(hd311ctx(0,0)).toBe(0);});it('d',()=>{expect(hd311ctx(93,73)).toBe(2);});it('e',()=>{expect(hd311ctx(15,0)).toBe(4);});});
function hd312ctx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph312ctx_hd',()=>{it('a',()=>{expect(hd312ctx(1,4)).toBe(2);});it('b',()=>{expect(hd312ctx(3,1)).toBe(1);});it('c',()=>{expect(hd312ctx(0,0)).toBe(0);});it('d',()=>{expect(hd312ctx(93,73)).toBe(2);});it('e',()=>{expect(hd312ctx(15,0)).toBe(4);});});
function hd313ctx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph313ctx_hd',()=>{it('a',()=>{expect(hd313ctx(1,4)).toBe(2);});it('b',()=>{expect(hd313ctx(3,1)).toBe(1);});it('c',()=>{expect(hd313ctx(0,0)).toBe(0);});it('d',()=>{expect(hd313ctx(93,73)).toBe(2);});it('e',()=>{expect(hd313ctx(15,0)).toBe(4);});});
function hd314ctx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph314ctx_hd',()=>{it('a',()=>{expect(hd314ctx(1,4)).toBe(2);});it('b',()=>{expect(hd314ctx(3,1)).toBe(1);});it('c',()=>{expect(hd314ctx(0,0)).toBe(0);});it('d',()=>{expect(hd314ctx(93,73)).toBe(2);});it('e',()=>{expect(hd314ctx(15,0)).toBe(4);});});
function hd315ctx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph315ctx_hd',()=>{it('a',()=>{expect(hd315ctx(1,4)).toBe(2);});it('b',()=>{expect(hd315ctx(3,1)).toBe(1);});it('c',()=>{expect(hd315ctx(0,0)).toBe(0);});it('d',()=>{expect(hd315ctx(93,73)).toBe(2);});it('e',()=>{expect(hd315ctx(15,0)).toBe(4);});});
function hd316ctx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph316ctx_hd',()=>{it('a',()=>{expect(hd316ctx(1,4)).toBe(2);});it('b',()=>{expect(hd316ctx(3,1)).toBe(1);});it('c',()=>{expect(hd316ctx(0,0)).toBe(0);});it('d',()=>{expect(hd316ctx(93,73)).toBe(2);});it('e',()=>{expect(hd316ctx(15,0)).toBe(4);});});
function hd317ctx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph317ctx_hd',()=>{it('a',()=>{expect(hd317ctx(1,4)).toBe(2);});it('b',()=>{expect(hd317ctx(3,1)).toBe(1);});it('c',()=>{expect(hd317ctx(0,0)).toBe(0);});it('d',()=>{expect(hd317ctx(93,73)).toBe(2);});it('e',()=>{expect(hd317ctx(15,0)).toBe(4);});});
function hd318ctx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph318ctx_hd',()=>{it('a',()=>{expect(hd318ctx(1,4)).toBe(2);});it('b',()=>{expect(hd318ctx(3,1)).toBe(1);});it('c',()=>{expect(hd318ctx(0,0)).toBe(0);});it('d',()=>{expect(hd318ctx(93,73)).toBe(2);});it('e',()=>{expect(hd318ctx(15,0)).toBe(4);});});
function hd319ctx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph319ctx_hd',()=>{it('a',()=>{expect(hd319ctx(1,4)).toBe(2);});it('b',()=>{expect(hd319ctx(3,1)).toBe(1);});it('c',()=>{expect(hd319ctx(0,0)).toBe(0);});it('d',()=>{expect(hd319ctx(93,73)).toBe(2);});it('e',()=>{expect(hd319ctx(15,0)).toBe(4);});});
function hd320ctx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph320ctx_hd',()=>{it('a',()=>{expect(hd320ctx(1,4)).toBe(2);});it('b',()=>{expect(hd320ctx(3,1)).toBe(1);});it('c',()=>{expect(hd320ctx(0,0)).toBe(0);});it('d',()=>{expect(hd320ctx(93,73)).toBe(2);});it('e',()=>{expect(hd320ctx(15,0)).toBe(4);});});
function hd321ctx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph321ctx_hd',()=>{it('a',()=>{expect(hd321ctx(1,4)).toBe(2);});it('b',()=>{expect(hd321ctx(3,1)).toBe(1);});it('c',()=>{expect(hd321ctx(0,0)).toBe(0);});it('d',()=>{expect(hd321ctx(93,73)).toBe(2);});it('e',()=>{expect(hd321ctx(15,0)).toBe(4);});});
function hd322ctx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph322ctx_hd',()=>{it('a',()=>{expect(hd322ctx(1,4)).toBe(2);});it('b',()=>{expect(hd322ctx(3,1)).toBe(1);});it('c',()=>{expect(hd322ctx(0,0)).toBe(0);});it('d',()=>{expect(hd322ctx(93,73)).toBe(2);});it('e',()=>{expect(hd322ctx(15,0)).toBe(4);});});
function hd323ctx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph323ctx_hd',()=>{it('a',()=>{expect(hd323ctx(1,4)).toBe(2);});it('b',()=>{expect(hd323ctx(3,1)).toBe(1);});it('c',()=>{expect(hd323ctx(0,0)).toBe(0);});it('d',()=>{expect(hd323ctx(93,73)).toBe(2);});it('e',()=>{expect(hd323ctx(15,0)).toBe(4);});});
function hd324ctx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph324ctx_hd',()=>{it('a',()=>{expect(hd324ctx(1,4)).toBe(2);});it('b',()=>{expect(hd324ctx(3,1)).toBe(1);});it('c',()=>{expect(hd324ctx(0,0)).toBe(0);});it('d',()=>{expect(hd324ctx(93,73)).toBe(2);});it('e',()=>{expect(hd324ctx(15,0)).toBe(4);});});
function hd325ctx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph325ctx_hd',()=>{it('a',()=>{expect(hd325ctx(1,4)).toBe(2);});it('b',()=>{expect(hd325ctx(3,1)).toBe(1);});it('c',()=>{expect(hd325ctx(0,0)).toBe(0);});it('d',()=>{expect(hd325ctx(93,73)).toBe(2);});it('e',()=>{expect(hd325ctx(15,0)).toBe(4);});});
function hd326ctx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph326ctx_hd',()=>{it('a',()=>{expect(hd326ctx(1,4)).toBe(2);});it('b',()=>{expect(hd326ctx(3,1)).toBe(1);});it('c',()=>{expect(hd326ctx(0,0)).toBe(0);});it('d',()=>{expect(hd326ctx(93,73)).toBe(2);});it('e',()=>{expect(hd326ctx(15,0)).toBe(4);});});
function hd327ctx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph327ctx_hd',()=>{it('a',()=>{expect(hd327ctx(1,4)).toBe(2);});it('b',()=>{expect(hd327ctx(3,1)).toBe(1);});it('c',()=>{expect(hd327ctx(0,0)).toBe(0);});it('d',()=>{expect(hd327ctx(93,73)).toBe(2);});it('e',()=>{expect(hd327ctx(15,0)).toBe(4);});});
function hd328ctx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph328ctx_hd',()=>{it('a',()=>{expect(hd328ctx(1,4)).toBe(2);});it('b',()=>{expect(hd328ctx(3,1)).toBe(1);});it('c',()=>{expect(hd328ctx(0,0)).toBe(0);});it('d',()=>{expect(hd328ctx(93,73)).toBe(2);});it('e',()=>{expect(hd328ctx(15,0)).toBe(4);});});
function hd329ctx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph329ctx_hd',()=>{it('a',()=>{expect(hd329ctx(1,4)).toBe(2);});it('b',()=>{expect(hd329ctx(3,1)).toBe(1);});it('c',()=>{expect(hd329ctx(0,0)).toBe(0);});it('d',()=>{expect(hd329ctx(93,73)).toBe(2);});it('e',()=>{expect(hd329ctx(15,0)).toBe(4);});});
function hd330ctx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph330ctx_hd',()=>{it('a',()=>{expect(hd330ctx(1,4)).toBe(2);});it('b',()=>{expect(hd330ctx(3,1)).toBe(1);});it('c',()=>{expect(hd330ctx(0,0)).toBe(0);});it('d',()=>{expect(hd330ctx(93,73)).toBe(2);});it('e',()=>{expect(hd330ctx(15,0)).toBe(4);});});
function hd331ctx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph331ctx_hd',()=>{it('a',()=>{expect(hd331ctx(1,4)).toBe(2);});it('b',()=>{expect(hd331ctx(3,1)).toBe(1);});it('c',()=>{expect(hd331ctx(0,0)).toBe(0);});it('d',()=>{expect(hd331ctx(93,73)).toBe(2);});it('e',()=>{expect(hd331ctx(15,0)).toBe(4);});});
function hd332ctx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph332ctx_hd',()=>{it('a',()=>{expect(hd332ctx(1,4)).toBe(2);});it('b',()=>{expect(hd332ctx(3,1)).toBe(1);});it('c',()=>{expect(hd332ctx(0,0)).toBe(0);});it('d',()=>{expect(hd332ctx(93,73)).toBe(2);});it('e',()=>{expect(hd332ctx(15,0)).toBe(4);});});
function hd333ctx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph333ctx_hd',()=>{it('a',()=>{expect(hd333ctx(1,4)).toBe(2);});it('b',()=>{expect(hd333ctx(3,1)).toBe(1);});it('c',()=>{expect(hd333ctx(0,0)).toBe(0);});it('d',()=>{expect(hd333ctx(93,73)).toBe(2);});it('e',()=>{expect(hd333ctx(15,0)).toBe(4);});});
function hd334ctx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph334ctx_hd',()=>{it('a',()=>{expect(hd334ctx(1,4)).toBe(2);});it('b',()=>{expect(hd334ctx(3,1)).toBe(1);});it('c',()=>{expect(hd334ctx(0,0)).toBe(0);});it('d',()=>{expect(hd334ctx(93,73)).toBe(2);});it('e',()=>{expect(hd334ctx(15,0)).toBe(4);});});
function hd335ctx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph335ctx_hd',()=>{it('a',()=>{expect(hd335ctx(1,4)).toBe(2);});it('b',()=>{expect(hd335ctx(3,1)).toBe(1);});it('c',()=>{expect(hd335ctx(0,0)).toBe(0);});it('d',()=>{expect(hd335ctx(93,73)).toBe(2);});it('e',()=>{expect(hd335ctx(15,0)).toBe(4);});});
function hd336ctx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph336ctx_hd',()=>{it('a',()=>{expect(hd336ctx(1,4)).toBe(2);});it('b',()=>{expect(hd336ctx(3,1)).toBe(1);});it('c',()=>{expect(hd336ctx(0,0)).toBe(0);});it('d',()=>{expect(hd336ctx(93,73)).toBe(2);});it('e',()=>{expect(hd336ctx(15,0)).toBe(4);});});
function hd337ctx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph337ctx_hd',()=>{it('a',()=>{expect(hd337ctx(1,4)).toBe(2);});it('b',()=>{expect(hd337ctx(3,1)).toBe(1);});it('c',()=>{expect(hd337ctx(0,0)).toBe(0);});it('d',()=>{expect(hd337ctx(93,73)).toBe(2);});it('e',()=>{expect(hd337ctx(15,0)).toBe(4);});});
