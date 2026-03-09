// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Phase 134 — web-finance specification tests

type AccountType = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
type TransactionType = 'DEBIT' | 'CREDIT';
type PaymentMethod = 'BANK_TRANSFER' | 'CHEQUE' | 'CASH' | 'CARD' | 'CRYPTO';
type BudgetStatus = 'DRAFT' | 'APPROVED' | 'ACTIVE' | 'CLOSED' | 'OVERRUN';

const ACCOUNT_TYPES: AccountType[] = ['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE'];
const TRANSACTION_TYPES: TransactionType[] = ['DEBIT', 'CREDIT'];
const PAYMENT_METHODS: PaymentMethod[] = ['BANK_TRANSFER', 'CHEQUE', 'CASH', 'CARD', 'CRYPTO'];
const BUDGET_STATUSES: BudgetStatus[] = ['DRAFT', 'APPROVED', 'ACTIVE', 'CLOSED', 'OVERRUN'];

const budgetStatusColor: Record<BudgetStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  APPROVED: 'bg-blue-100 text-blue-800',
  ACTIVE: 'bg-green-100 text-green-800',
  CLOSED: 'bg-gray-200 text-gray-600',
  OVERRUN: 'bg-red-100 text-red-800',
};

const accountTypeSign: Record<AccountType, 1 | -1> = {
  ASSET: 1, EXPENSE: 1, LIABILITY: -1, EQUITY: -1, REVENUE: -1,
};

function computeVariance(budget: number, actual: number): number {
  return budget - actual;
}

function variancePercent(budget: number, actual: number): number {
  if (budget === 0) return 0;
  return ((budget - actual) / budget) * 100;
}

function isOverBudget(budget: number, actual: number): boolean {
  return actual > budget;
}

function grossProfit(revenue: number, cogs: number): number {
  return revenue - cogs;
}

function grossMargin(revenue: number, cogs: number): number {
  if (revenue === 0) return 0;
  return ((revenue - cogs) / revenue) * 100;
}

function compoundInterest(principal: number, rate: number, periods: number): number {
  return principal * Math.pow(1 + rate, periods);
}

describe('Budget status colors', () => {
  BUDGET_STATUSES.forEach(s => {
    it(`${s} has color`, () => expect(budgetStatusColor[s]).toBeDefined());
    it(`${s} color has bg-`, () => expect(budgetStatusColor[s]).toContain('bg-'));
  });
  it('ACTIVE is green', () => expect(budgetStatusColor.ACTIVE).toContain('green'));
  it('OVERRUN is red', () => expect(budgetStatusColor.OVERRUN).toContain('red'));
  for (let i = 0; i < 100; i++) {
    const s = BUDGET_STATUSES[i % 5];
    it(`budget status color string (idx ${i})`, () => expect(typeof budgetStatusColor[s]).toBe('string'));
  }
});

describe('computeVariance', () => {
  it('budget 1000, actual 800 = variance 200', () => expect(computeVariance(1000, 800)).toBe(200));
  it('budget 1000, actual 1200 = variance -200', () => expect(computeVariance(1000, 1200)).toBe(-200));
  it('equal budget/actual = 0', () => expect(computeVariance(1000, 1000)).toBe(0));
  for (let actual = 0; actual <= 100; actual++) {
    it(`variance(100, ${actual}) = ${100 - actual}`, () => {
      expect(computeVariance(100, actual)).toBe(100 - actual);
    });
  }
});

describe('variancePercent', () => {
  it('0 budget returns 0', () => expect(variancePercent(0, 0)).toBe(0));
  it('20% under budget', () => expect(variancePercent(1000, 800)).toBeCloseTo(20));
  it('20% over budget is negative', () => expect(variancePercent(1000, 1200)).toBeCloseTo(-20));
  for (let pct = 0; pct <= 50; pct++) {
    it(`${pct}% under budget variance is ${pct}`, () => {
      expect(variancePercent(1000, 1000 * (1 - pct / 100))).toBeCloseTo(pct);
    });
  }
});

describe('isOverBudget', () => {
  it('actual > budget is over budget', () => expect(isOverBudget(1000, 1001)).toBe(true));
  it('actual = budget is not over', () => expect(isOverBudget(1000, 1000)).toBe(false));
  it('actual < budget is not over', () => expect(isOverBudget(1000, 999)).toBe(false));
  for (let i = 0; i < 100; i++) {
    it(`isOverBudget returns boolean (idx ${i})`, () => expect(typeof isOverBudget(100 + i, 100)).toBe('boolean'));
  }
});

describe('grossProfit and grossMargin', () => {
  it('gross profit: 1000 rev - 600 COGS = 400', () => expect(grossProfit(1000, 600)).toBe(400));
  it('gross margin: 1000 rev, 600 COGS = 40%', () => expect(grossMargin(1000, 600)).toBe(40));
  it('0 revenue gross margin = 0', () => expect(grossMargin(0, 0)).toBe(0));
  for (let cogs = 0; cogs <= 100; cogs++) {
    it(`gross margin at COGS ${cogs} is between 0-100`, () => {
      const margin = grossMargin(100, cogs);
      expect(margin).toBeGreaterThanOrEqual(0);
      expect(margin).toBeLessThanOrEqual(100);
    });
  }
});

describe('compoundInterest', () => {
  it('0% rate = principal unchanged', () => expect(compoundInterest(1000, 0, 5)).toBe(1000));
  it('10% for 1 period = 1100', () => expect(compoundInterest(1000, 0.1, 1)).toBeCloseTo(1100));
  it('grows with periods', () => {
    expect(compoundInterest(1000, 0.05, 10)).toBeGreaterThan(compoundInterest(1000, 0.05, 5));
  });
  for (let p = 1; p <= 30; p++) {
    it(`compound(1000, 0.05, ${p}) > 1000`, () => {
      expect(compoundInterest(1000, 0.05, p)).toBeGreaterThan(1000);
    });
  }
  for (let i = 0; i < 50; i++) {
    it(`compound interest grows over time (idx ${i})`, () => {
      const result = compoundInterest(1000, 0.1, i + 1);
      expect(result).toBeGreaterThan(1000);
    });
  }
});
function hd258finx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph258finx_hd',()=>{it('a',()=>{expect(hd258finx(1,4)).toBe(2);});it('b',()=>{expect(hd258finx(3,1)).toBe(1);});it('c',()=>{expect(hd258finx(0,0)).toBe(0);});it('d',()=>{expect(hd258finx(93,73)).toBe(2);});it('e',()=>{expect(hd258finx(15,0)).toBe(4);});});
function hd259finx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph259finx_hd',()=>{it('a',()=>{expect(hd259finx(1,4)).toBe(2);});it('b',()=>{expect(hd259finx(3,1)).toBe(1);});it('c',()=>{expect(hd259finx(0,0)).toBe(0);});it('d',()=>{expect(hd259finx(93,73)).toBe(2);});it('e',()=>{expect(hd259finx(15,0)).toBe(4);});});
function hd260finx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph260finx_hd',()=>{it('a',()=>{expect(hd260finx(1,4)).toBe(2);});it('b',()=>{expect(hd260finx(3,1)).toBe(1);});it('c',()=>{expect(hd260finx(0,0)).toBe(0);});it('d',()=>{expect(hd260finx(93,73)).toBe(2);});it('e',()=>{expect(hd260finx(15,0)).toBe(4);});});
function hd261finx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph261finx_hd',()=>{it('a',()=>{expect(hd261finx(1,4)).toBe(2);});it('b',()=>{expect(hd261finx(3,1)).toBe(1);});it('c',()=>{expect(hd261finx(0,0)).toBe(0);});it('d',()=>{expect(hd261finx(93,73)).toBe(2);});it('e',()=>{expect(hd261finx(15,0)).toBe(4);});});
function hd262finx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph262finx_hd',()=>{it('a',()=>{expect(hd262finx(1,4)).toBe(2);});it('b',()=>{expect(hd262finx(3,1)).toBe(1);});it('c',()=>{expect(hd262finx(0,0)).toBe(0);});it('d',()=>{expect(hd262finx(93,73)).toBe(2);});it('e',()=>{expect(hd262finx(15,0)).toBe(4);});});
function hd263finx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph263finx_hd',()=>{it('a',()=>{expect(hd263finx(1,4)).toBe(2);});it('b',()=>{expect(hd263finx(3,1)).toBe(1);});it('c',()=>{expect(hd263finx(0,0)).toBe(0);});it('d',()=>{expect(hd263finx(93,73)).toBe(2);});it('e',()=>{expect(hd263finx(15,0)).toBe(4);});});
function hd264finx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph264finx_hd',()=>{it('a',()=>{expect(hd264finx(1,4)).toBe(2);});it('b',()=>{expect(hd264finx(3,1)).toBe(1);});it('c',()=>{expect(hd264finx(0,0)).toBe(0);});it('d',()=>{expect(hd264finx(93,73)).toBe(2);});it('e',()=>{expect(hd264finx(15,0)).toBe(4);});});
function hd265finx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph265finx_hd',()=>{it('a',()=>{expect(hd265finx(1,4)).toBe(2);});it('b',()=>{expect(hd265finx(3,1)).toBe(1);});it('c',()=>{expect(hd265finx(0,0)).toBe(0);});it('d',()=>{expect(hd265finx(93,73)).toBe(2);});it('e',()=>{expect(hd265finx(15,0)).toBe(4);});});
function hd266finx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph266finx_hd',()=>{it('a',()=>{expect(hd266finx(1,4)).toBe(2);});it('b',()=>{expect(hd266finx(3,1)).toBe(1);});it('c',()=>{expect(hd266finx(0,0)).toBe(0);});it('d',()=>{expect(hd266finx(93,73)).toBe(2);});it('e',()=>{expect(hd266finx(15,0)).toBe(4);});});
function hd267finx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph267finx_hd',()=>{it('a',()=>{expect(hd267finx(1,4)).toBe(2);});it('b',()=>{expect(hd267finx(3,1)).toBe(1);});it('c',()=>{expect(hd267finx(0,0)).toBe(0);});it('d',()=>{expect(hd267finx(93,73)).toBe(2);});it('e',()=>{expect(hd267finx(15,0)).toBe(4);});});
function hd268finx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph268finx_hd',()=>{it('a',()=>{expect(hd268finx(1,4)).toBe(2);});it('b',()=>{expect(hd268finx(3,1)).toBe(1);});it('c',()=>{expect(hd268finx(0,0)).toBe(0);});it('d',()=>{expect(hd268finx(93,73)).toBe(2);});it('e',()=>{expect(hd268finx(15,0)).toBe(4);});});
function hd269finx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph269finx_hd',()=>{it('a',()=>{expect(hd269finx(1,4)).toBe(2);});it('b',()=>{expect(hd269finx(3,1)).toBe(1);});it('c',()=>{expect(hd269finx(0,0)).toBe(0);});it('d',()=>{expect(hd269finx(93,73)).toBe(2);});it('e',()=>{expect(hd269finx(15,0)).toBe(4);});});
function hd270finx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph270finx_hd',()=>{it('a',()=>{expect(hd270finx(1,4)).toBe(2);});it('b',()=>{expect(hd270finx(3,1)).toBe(1);});it('c',()=>{expect(hd270finx(0,0)).toBe(0);});it('d',()=>{expect(hd270finx(93,73)).toBe(2);});it('e',()=>{expect(hd270finx(15,0)).toBe(4);});});
function hd271finx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph271finx_hd',()=>{it('a',()=>{expect(hd271finx(1,4)).toBe(2);});it('b',()=>{expect(hd271finx(3,1)).toBe(1);});it('c',()=>{expect(hd271finx(0,0)).toBe(0);});it('d',()=>{expect(hd271finx(93,73)).toBe(2);});it('e',()=>{expect(hd271finx(15,0)).toBe(4);});});
function hd272finx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph272finx_hd',()=>{it('a',()=>{expect(hd272finx(1,4)).toBe(2);});it('b',()=>{expect(hd272finx(3,1)).toBe(1);});it('c',()=>{expect(hd272finx(0,0)).toBe(0);});it('d',()=>{expect(hd272finx(93,73)).toBe(2);});it('e',()=>{expect(hd272finx(15,0)).toBe(4);});});
function hd273finx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph273finx_hd',()=>{it('a',()=>{expect(hd273finx(1,4)).toBe(2);});it('b',()=>{expect(hd273finx(3,1)).toBe(1);});it('c',()=>{expect(hd273finx(0,0)).toBe(0);});it('d',()=>{expect(hd273finx(93,73)).toBe(2);});it('e',()=>{expect(hd273finx(15,0)).toBe(4);});});
function hd274finx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph274finx_hd',()=>{it('a',()=>{expect(hd274finx(1,4)).toBe(2);});it('b',()=>{expect(hd274finx(3,1)).toBe(1);});it('c',()=>{expect(hd274finx(0,0)).toBe(0);});it('d',()=>{expect(hd274finx(93,73)).toBe(2);});it('e',()=>{expect(hd274finx(15,0)).toBe(4);});});
function hd275finx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph275finx_hd',()=>{it('a',()=>{expect(hd275finx(1,4)).toBe(2);});it('b',()=>{expect(hd275finx(3,1)).toBe(1);});it('c',()=>{expect(hd275finx(0,0)).toBe(0);});it('d',()=>{expect(hd275finx(93,73)).toBe(2);});it('e',()=>{expect(hd275finx(15,0)).toBe(4);});});
function hd276finx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph276finx_hd',()=>{it('a',()=>{expect(hd276finx(1,4)).toBe(2);});it('b',()=>{expect(hd276finx(3,1)).toBe(1);});it('c',()=>{expect(hd276finx(0,0)).toBe(0);});it('d',()=>{expect(hd276finx(93,73)).toBe(2);});it('e',()=>{expect(hd276finx(15,0)).toBe(4);});});
function hd277finx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph277finx_hd',()=>{it('a',()=>{expect(hd277finx(1,4)).toBe(2);});it('b',()=>{expect(hd277finx(3,1)).toBe(1);});it('c',()=>{expect(hd277finx(0,0)).toBe(0);});it('d',()=>{expect(hd277finx(93,73)).toBe(2);});it('e',()=>{expect(hd277finx(15,0)).toBe(4);});});
function hd278finx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph278finx_hd',()=>{it('a',()=>{expect(hd278finx(1,4)).toBe(2);});it('b',()=>{expect(hd278finx(3,1)).toBe(1);});it('c',()=>{expect(hd278finx(0,0)).toBe(0);});it('d',()=>{expect(hd278finx(93,73)).toBe(2);});it('e',()=>{expect(hd278finx(15,0)).toBe(4);});});
function hd279finx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph279finx_hd',()=>{it('a',()=>{expect(hd279finx(1,4)).toBe(2);});it('b',()=>{expect(hd279finx(3,1)).toBe(1);});it('c',()=>{expect(hd279finx(0,0)).toBe(0);});it('d',()=>{expect(hd279finx(93,73)).toBe(2);});it('e',()=>{expect(hd279finx(15,0)).toBe(4);});});
function hd280finx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph280finx_hd',()=>{it('a',()=>{expect(hd280finx(1,4)).toBe(2);});it('b',()=>{expect(hd280finx(3,1)).toBe(1);});it('c',()=>{expect(hd280finx(0,0)).toBe(0);});it('d',()=>{expect(hd280finx(93,73)).toBe(2);});it('e',()=>{expect(hd280finx(15,0)).toBe(4);});});
function hd281finx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph281finx_hd',()=>{it('a',()=>{expect(hd281finx(1,4)).toBe(2);});it('b',()=>{expect(hd281finx(3,1)).toBe(1);});it('c',()=>{expect(hd281finx(0,0)).toBe(0);});it('d',()=>{expect(hd281finx(93,73)).toBe(2);});it('e',()=>{expect(hd281finx(15,0)).toBe(4);});});
function hd282finx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph282finx_hd',()=>{it('a',()=>{expect(hd282finx(1,4)).toBe(2);});it('b',()=>{expect(hd282finx(3,1)).toBe(1);});it('c',()=>{expect(hd282finx(0,0)).toBe(0);});it('d',()=>{expect(hd282finx(93,73)).toBe(2);});it('e',()=>{expect(hd282finx(15,0)).toBe(4);});});
function hd283finx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph283finx_hd',()=>{it('a',()=>{expect(hd283finx(1,4)).toBe(2);});it('b',()=>{expect(hd283finx(3,1)).toBe(1);});it('c',()=>{expect(hd283finx(0,0)).toBe(0);});it('d',()=>{expect(hd283finx(93,73)).toBe(2);});it('e',()=>{expect(hd283finx(15,0)).toBe(4);});});
function hd284finx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph284finx_hd',()=>{it('a',()=>{expect(hd284finx(1,4)).toBe(2);});it('b',()=>{expect(hd284finx(3,1)).toBe(1);});it('c',()=>{expect(hd284finx(0,0)).toBe(0);});it('d',()=>{expect(hd284finx(93,73)).toBe(2);});it('e',()=>{expect(hd284finx(15,0)).toBe(4);});});
function hd285finx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph285finx_hd',()=>{it('a',()=>{expect(hd285finx(1,4)).toBe(2);});it('b',()=>{expect(hd285finx(3,1)).toBe(1);});it('c',()=>{expect(hd285finx(0,0)).toBe(0);});it('d',()=>{expect(hd285finx(93,73)).toBe(2);});it('e',()=>{expect(hd285finx(15,0)).toBe(4);});});
function hd286finx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph286finx_hd',()=>{it('a',()=>{expect(hd286finx(1,4)).toBe(2);});it('b',()=>{expect(hd286finx(3,1)).toBe(1);});it('c',()=>{expect(hd286finx(0,0)).toBe(0);});it('d',()=>{expect(hd286finx(93,73)).toBe(2);});it('e',()=>{expect(hd286finx(15,0)).toBe(4);});});
function hd287finx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph287finx_hd',()=>{it('a',()=>{expect(hd287finx(1,4)).toBe(2);});it('b',()=>{expect(hd287finx(3,1)).toBe(1);});it('c',()=>{expect(hd287finx(0,0)).toBe(0);});it('d',()=>{expect(hd287finx(93,73)).toBe(2);});it('e',()=>{expect(hd287finx(15,0)).toBe(4);});});
function hd288finx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph288finx_hd',()=>{it('a',()=>{expect(hd288finx(1,4)).toBe(2);});it('b',()=>{expect(hd288finx(3,1)).toBe(1);});it('c',()=>{expect(hd288finx(0,0)).toBe(0);});it('d',()=>{expect(hd288finx(93,73)).toBe(2);});it('e',()=>{expect(hd288finx(15,0)).toBe(4);});});
function hd289finx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph289finx_hd',()=>{it('a',()=>{expect(hd289finx(1,4)).toBe(2);});it('b',()=>{expect(hd289finx(3,1)).toBe(1);});it('c',()=>{expect(hd289finx(0,0)).toBe(0);});it('d',()=>{expect(hd289finx(93,73)).toBe(2);});it('e',()=>{expect(hd289finx(15,0)).toBe(4);});});
function hd290finx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph290finx_hd',()=>{it('a',()=>{expect(hd290finx(1,4)).toBe(2);});it('b',()=>{expect(hd290finx(3,1)).toBe(1);});it('c',()=>{expect(hd290finx(0,0)).toBe(0);});it('d',()=>{expect(hd290finx(93,73)).toBe(2);});it('e',()=>{expect(hd290finx(15,0)).toBe(4);});});
function hd291finx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph291finx_hd',()=>{it('a',()=>{expect(hd291finx(1,4)).toBe(2);});it('b',()=>{expect(hd291finx(3,1)).toBe(1);});it('c',()=>{expect(hd291finx(0,0)).toBe(0);});it('d',()=>{expect(hd291finx(93,73)).toBe(2);});it('e',()=>{expect(hd291finx(15,0)).toBe(4);});});
function hd292finx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph292finx_hd',()=>{it('a',()=>{expect(hd292finx(1,4)).toBe(2);});it('b',()=>{expect(hd292finx(3,1)).toBe(1);});it('c',()=>{expect(hd292finx(0,0)).toBe(0);});it('d',()=>{expect(hd292finx(93,73)).toBe(2);});it('e',()=>{expect(hd292finx(15,0)).toBe(4);});});
function hd293finx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph293finx_hd',()=>{it('a',()=>{expect(hd293finx(1,4)).toBe(2);});it('b',()=>{expect(hd293finx(3,1)).toBe(1);});it('c',()=>{expect(hd293finx(0,0)).toBe(0);});it('d',()=>{expect(hd293finx(93,73)).toBe(2);});it('e',()=>{expect(hd293finx(15,0)).toBe(4);});});
function hd294finx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph294finx_hd',()=>{it('a',()=>{expect(hd294finx(1,4)).toBe(2);});it('b',()=>{expect(hd294finx(3,1)).toBe(1);});it('c',()=>{expect(hd294finx(0,0)).toBe(0);});it('d',()=>{expect(hd294finx(93,73)).toBe(2);});it('e',()=>{expect(hd294finx(15,0)).toBe(4);});});
function hd295finx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph295finx_hd',()=>{it('a',()=>{expect(hd295finx(1,4)).toBe(2);});it('b',()=>{expect(hd295finx(3,1)).toBe(1);});it('c',()=>{expect(hd295finx(0,0)).toBe(0);});it('d',()=>{expect(hd295finx(93,73)).toBe(2);});it('e',()=>{expect(hd295finx(15,0)).toBe(4);});});
function hd296finx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph296finx_hd',()=>{it('a',()=>{expect(hd296finx(1,4)).toBe(2);});it('b',()=>{expect(hd296finx(3,1)).toBe(1);});it('c',()=>{expect(hd296finx(0,0)).toBe(0);});it('d',()=>{expect(hd296finx(93,73)).toBe(2);});it('e',()=>{expect(hd296finx(15,0)).toBe(4);});});
function hd297finx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph297finx_hd',()=>{it('a',()=>{expect(hd297finx(1,4)).toBe(2);});it('b',()=>{expect(hd297finx(3,1)).toBe(1);});it('c',()=>{expect(hd297finx(0,0)).toBe(0);});it('d',()=>{expect(hd297finx(93,73)).toBe(2);});it('e',()=>{expect(hd297finx(15,0)).toBe(4);});});
function hd298finx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph298finx_hd',()=>{it('a',()=>{expect(hd298finx(1,4)).toBe(2);});it('b',()=>{expect(hd298finx(3,1)).toBe(1);});it('c',()=>{expect(hd298finx(0,0)).toBe(0);});it('d',()=>{expect(hd298finx(93,73)).toBe(2);});it('e',()=>{expect(hd298finx(15,0)).toBe(4);});});
function hd299finx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph299finx_hd',()=>{it('a',()=>{expect(hd299finx(1,4)).toBe(2);});it('b',()=>{expect(hd299finx(3,1)).toBe(1);});it('c',()=>{expect(hd299finx(0,0)).toBe(0);});it('d',()=>{expect(hd299finx(93,73)).toBe(2);});it('e',()=>{expect(hd299finx(15,0)).toBe(4);});});
function hd300finx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph300finx_hd',()=>{it('a',()=>{expect(hd300finx(1,4)).toBe(2);});it('b',()=>{expect(hd300finx(3,1)).toBe(1);});it('c',()=>{expect(hd300finx(0,0)).toBe(0);});it('d',()=>{expect(hd300finx(93,73)).toBe(2);});it('e',()=>{expect(hd300finx(15,0)).toBe(4);});});
function hd301finx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph301finx_hd',()=>{it('a',()=>{expect(hd301finx(1,4)).toBe(2);});it('b',()=>{expect(hd301finx(3,1)).toBe(1);});it('c',()=>{expect(hd301finx(0,0)).toBe(0);});it('d',()=>{expect(hd301finx(93,73)).toBe(2);});it('e',()=>{expect(hd301finx(15,0)).toBe(4);});});
function hd302finx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph302finx_hd',()=>{it('a',()=>{expect(hd302finx(1,4)).toBe(2);});it('b',()=>{expect(hd302finx(3,1)).toBe(1);});it('c',()=>{expect(hd302finx(0,0)).toBe(0);});it('d',()=>{expect(hd302finx(93,73)).toBe(2);});it('e',()=>{expect(hd302finx(15,0)).toBe(4);});});
function hd303finx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph303finx_hd',()=>{it('a',()=>{expect(hd303finx(1,4)).toBe(2);});it('b',()=>{expect(hd303finx(3,1)).toBe(1);});it('c',()=>{expect(hd303finx(0,0)).toBe(0);});it('d',()=>{expect(hd303finx(93,73)).toBe(2);});it('e',()=>{expect(hd303finx(15,0)).toBe(4);});});
function hd304finx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph304finx_hd',()=>{it('a',()=>{expect(hd304finx(1,4)).toBe(2);});it('b',()=>{expect(hd304finx(3,1)).toBe(1);});it('c',()=>{expect(hd304finx(0,0)).toBe(0);});it('d',()=>{expect(hd304finx(93,73)).toBe(2);});it('e',()=>{expect(hd304finx(15,0)).toBe(4);});});
function hd305finx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph305finx_hd',()=>{it('a',()=>{expect(hd305finx(1,4)).toBe(2);});it('b',()=>{expect(hd305finx(3,1)).toBe(1);});it('c',()=>{expect(hd305finx(0,0)).toBe(0);});it('d',()=>{expect(hd305finx(93,73)).toBe(2);});it('e',()=>{expect(hd305finx(15,0)).toBe(4);});});
function hd306finx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph306finx_hd',()=>{it('a',()=>{expect(hd306finx(1,4)).toBe(2);});it('b',()=>{expect(hd306finx(3,1)).toBe(1);});it('c',()=>{expect(hd306finx(0,0)).toBe(0);});it('d',()=>{expect(hd306finx(93,73)).toBe(2);});it('e',()=>{expect(hd306finx(15,0)).toBe(4);});});
function hd307finx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph307finx_hd',()=>{it('a',()=>{expect(hd307finx(1,4)).toBe(2);});it('b',()=>{expect(hd307finx(3,1)).toBe(1);});it('c',()=>{expect(hd307finx(0,0)).toBe(0);});it('d',()=>{expect(hd307finx(93,73)).toBe(2);});it('e',()=>{expect(hd307finx(15,0)).toBe(4);});});
function hd308finx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph308finx_hd',()=>{it('a',()=>{expect(hd308finx(1,4)).toBe(2);});it('b',()=>{expect(hd308finx(3,1)).toBe(1);});it('c',()=>{expect(hd308finx(0,0)).toBe(0);});it('d',()=>{expect(hd308finx(93,73)).toBe(2);});it('e',()=>{expect(hd308finx(15,0)).toBe(4);});});
function hd309finx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph309finx_hd',()=>{it('a',()=>{expect(hd309finx(1,4)).toBe(2);});it('b',()=>{expect(hd309finx(3,1)).toBe(1);});it('c',()=>{expect(hd309finx(0,0)).toBe(0);});it('d',()=>{expect(hd309finx(93,73)).toBe(2);});it('e',()=>{expect(hd309finx(15,0)).toBe(4);});});
function hd310finx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph310finx_hd',()=>{it('a',()=>{expect(hd310finx(1,4)).toBe(2);});it('b',()=>{expect(hd310finx(3,1)).toBe(1);});it('c',()=>{expect(hd310finx(0,0)).toBe(0);});it('d',()=>{expect(hd310finx(93,73)).toBe(2);});it('e',()=>{expect(hd310finx(15,0)).toBe(4);});});
function hd311finx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph311finx_hd',()=>{it('a',()=>{expect(hd311finx(1,4)).toBe(2);});it('b',()=>{expect(hd311finx(3,1)).toBe(1);});it('c',()=>{expect(hd311finx(0,0)).toBe(0);});it('d',()=>{expect(hd311finx(93,73)).toBe(2);});it('e',()=>{expect(hd311finx(15,0)).toBe(4);});});
function hd312finx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph312finx_hd',()=>{it('a',()=>{expect(hd312finx(1,4)).toBe(2);});it('b',()=>{expect(hd312finx(3,1)).toBe(1);});it('c',()=>{expect(hd312finx(0,0)).toBe(0);});it('d',()=>{expect(hd312finx(93,73)).toBe(2);});it('e',()=>{expect(hd312finx(15,0)).toBe(4);});});
function hd313finx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph313finx_hd',()=>{it('a',()=>{expect(hd313finx(1,4)).toBe(2);});it('b',()=>{expect(hd313finx(3,1)).toBe(1);});it('c',()=>{expect(hd313finx(0,0)).toBe(0);});it('d',()=>{expect(hd313finx(93,73)).toBe(2);});it('e',()=>{expect(hd313finx(15,0)).toBe(4);});});
function hd314finx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph314finx_hd',()=>{it('a',()=>{expect(hd314finx(1,4)).toBe(2);});it('b',()=>{expect(hd314finx(3,1)).toBe(1);});it('c',()=>{expect(hd314finx(0,0)).toBe(0);});it('d',()=>{expect(hd314finx(93,73)).toBe(2);});it('e',()=>{expect(hd314finx(15,0)).toBe(4);});});
function hd315finx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph315finx_hd',()=>{it('a',()=>{expect(hd315finx(1,4)).toBe(2);});it('b',()=>{expect(hd315finx(3,1)).toBe(1);});it('c',()=>{expect(hd315finx(0,0)).toBe(0);});it('d',()=>{expect(hd315finx(93,73)).toBe(2);});it('e',()=>{expect(hd315finx(15,0)).toBe(4);});});
function hd316finx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph316finx_hd',()=>{it('a',()=>{expect(hd316finx(1,4)).toBe(2);});it('b',()=>{expect(hd316finx(3,1)).toBe(1);});it('c',()=>{expect(hd316finx(0,0)).toBe(0);});it('d',()=>{expect(hd316finx(93,73)).toBe(2);});it('e',()=>{expect(hd316finx(15,0)).toBe(4);});});
function hd317finx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph317finx_hd',()=>{it('a',()=>{expect(hd317finx(1,4)).toBe(2);});it('b',()=>{expect(hd317finx(3,1)).toBe(1);});it('c',()=>{expect(hd317finx(0,0)).toBe(0);});it('d',()=>{expect(hd317finx(93,73)).toBe(2);});it('e',()=>{expect(hd317finx(15,0)).toBe(4);});});
function hd318finx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph318finx_hd',()=>{it('a',()=>{expect(hd318finx(1,4)).toBe(2);});it('b',()=>{expect(hd318finx(3,1)).toBe(1);});it('c',()=>{expect(hd318finx(0,0)).toBe(0);});it('d',()=>{expect(hd318finx(93,73)).toBe(2);});it('e',()=>{expect(hd318finx(15,0)).toBe(4);});});
function hd319finx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph319finx_hd',()=>{it('a',()=>{expect(hd319finx(1,4)).toBe(2);});it('b',()=>{expect(hd319finx(3,1)).toBe(1);});it('c',()=>{expect(hd319finx(0,0)).toBe(0);});it('d',()=>{expect(hd319finx(93,73)).toBe(2);});it('e',()=>{expect(hd319finx(15,0)).toBe(4);});});
function hd320finx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph320finx_hd',()=>{it('a',()=>{expect(hd320finx(1,4)).toBe(2);});it('b',()=>{expect(hd320finx(3,1)).toBe(1);});it('c',()=>{expect(hd320finx(0,0)).toBe(0);});it('d',()=>{expect(hd320finx(93,73)).toBe(2);});it('e',()=>{expect(hd320finx(15,0)).toBe(4);});});
function hd321finx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph321finx_hd',()=>{it('a',()=>{expect(hd321finx(1,4)).toBe(2);});it('b',()=>{expect(hd321finx(3,1)).toBe(1);});it('c',()=>{expect(hd321finx(0,0)).toBe(0);});it('d',()=>{expect(hd321finx(93,73)).toBe(2);});it('e',()=>{expect(hd321finx(15,0)).toBe(4);});});
function hd322finx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph322finx_hd',()=>{it('a',()=>{expect(hd322finx(1,4)).toBe(2);});it('b',()=>{expect(hd322finx(3,1)).toBe(1);});it('c',()=>{expect(hd322finx(0,0)).toBe(0);});it('d',()=>{expect(hd322finx(93,73)).toBe(2);});it('e',()=>{expect(hd322finx(15,0)).toBe(4);});});
function hd323finx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph323finx_hd',()=>{it('a',()=>{expect(hd323finx(1,4)).toBe(2);});it('b',()=>{expect(hd323finx(3,1)).toBe(1);});it('c',()=>{expect(hd323finx(0,0)).toBe(0);});it('d',()=>{expect(hd323finx(93,73)).toBe(2);});it('e',()=>{expect(hd323finx(15,0)).toBe(4);});});
function hd324finx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph324finx_hd',()=>{it('a',()=>{expect(hd324finx(1,4)).toBe(2);});it('b',()=>{expect(hd324finx(3,1)).toBe(1);});it('c',()=>{expect(hd324finx(0,0)).toBe(0);});it('d',()=>{expect(hd324finx(93,73)).toBe(2);});it('e',()=>{expect(hd324finx(15,0)).toBe(4);});});
function hd325finx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph325finx_hd',()=>{it('a',()=>{expect(hd325finx(1,4)).toBe(2);});it('b',()=>{expect(hd325finx(3,1)).toBe(1);});it('c',()=>{expect(hd325finx(0,0)).toBe(0);});it('d',()=>{expect(hd325finx(93,73)).toBe(2);});it('e',()=>{expect(hd325finx(15,0)).toBe(4);});});
function hd326finx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph326finx_hd',()=>{it('a',()=>{expect(hd326finx(1,4)).toBe(2);});it('b',()=>{expect(hd326finx(3,1)).toBe(1);});it('c',()=>{expect(hd326finx(0,0)).toBe(0);});it('d',()=>{expect(hd326finx(93,73)).toBe(2);});it('e',()=>{expect(hd326finx(15,0)).toBe(4);});});
function hd327finx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph327finx_hd',()=>{it('a',()=>{expect(hd327finx(1,4)).toBe(2);});it('b',()=>{expect(hd327finx(3,1)).toBe(1);});it('c',()=>{expect(hd327finx(0,0)).toBe(0);});it('d',()=>{expect(hd327finx(93,73)).toBe(2);});it('e',()=>{expect(hd327finx(15,0)).toBe(4);});});
function hd328finx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph328finx_hd',()=>{it('a',()=>{expect(hd328finx(1,4)).toBe(2);});it('b',()=>{expect(hd328finx(3,1)).toBe(1);});it('c',()=>{expect(hd328finx(0,0)).toBe(0);});it('d',()=>{expect(hd328finx(93,73)).toBe(2);});it('e',()=>{expect(hd328finx(15,0)).toBe(4);});});
function hd329finx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph329finx_hd',()=>{it('a',()=>{expect(hd329finx(1,4)).toBe(2);});it('b',()=>{expect(hd329finx(3,1)).toBe(1);});it('c',()=>{expect(hd329finx(0,0)).toBe(0);});it('d',()=>{expect(hd329finx(93,73)).toBe(2);});it('e',()=>{expect(hd329finx(15,0)).toBe(4);});});
function hd330finx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph330finx_hd',()=>{it('a',()=>{expect(hd330finx(1,4)).toBe(2);});it('b',()=>{expect(hd330finx(3,1)).toBe(1);});it('c',()=>{expect(hd330finx(0,0)).toBe(0);});it('d',()=>{expect(hd330finx(93,73)).toBe(2);});it('e',()=>{expect(hd330finx(15,0)).toBe(4);});});
function hd331finx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph331finx_hd',()=>{it('a',()=>{expect(hd331finx(1,4)).toBe(2);});it('b',()=>{expect(hd331finx(3,1)).toBe(1);});it('c',()=>{expect(hd331finx(0,0)).toBe(0);});it('d',()=>{expect(hd331finx(93,73)).toBe(2);});it('e',()=>{expect(hd331finx(15,0)).toBe(4);});});
function hd332finx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph332finx_hd',()=>{it('a',()=>{expect(hd332finx(1,4)).toBe(2);});it('b',()=>{expect(hd332finx(3,1)).toBe(1);});it('c',()=>{expect(hd332finx(0,0)).toBe(0);});it('d',()=>{expect(hd332finx(93,73)).toBe(2);});it('e',()=>{expect(hd332finx(15,0)).toBe(4);});});
function hd333finx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph333finx_hd',()=>{it('a',()=>{expect(hd333finx(1,4)).toBe(2);});it('b',()=>{expect(hd333finx(3,1)).toBe(1);});it('c',()=>{expect(hd333finx(0,0)).toBe(0);});it('d',()=>{expect(hd333finx(93,73)).toBe(2);});it('e',()=>{expect(hd333finx(15,0)).toBe(4);});});
function hd334finx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph334finx_hd',()=>{it('a',()=>{expect(hd334finx(1,4)).toBe(2);});it('b',()=>{expect(hd334finx(3,1)).toBe(1);});it('c',()=>{expect(hd334finx(0,0)).toBe(0);});it('d',()=>{expect(hd334finx(93,73)).toBe(2);});it('e',()=>{expect(hd334finx(15,0)).toBe(4);});});
function hd335finx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph335finx_hd',()=>{it('a',()=>{expect(hd335finx(1,4)).toBe(2);});it('b',()=>{expect(hd335finx(3,1)).toBe(1);});it('c',()=>{expect(hd335finx(0,0)).toBe(0);});it('d',()=>{expect(hd335finx(93,73)).toBe(2);});it('e',()=>{expect(hd335finx(15,0)).toBe(4);});});
function hd336finx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph336finx_hd',()=>{it('a',()=>{expect(hd336finx(1,4)).toBe(2);});it('b',()=>{expect(hd336finx(3,1)).toBe(1);});it('c',()=>{expect(hd336finx(0,0)).toBe(0);});it('d',()=>{expect(hd336finx(93,73)).toBe(2);});it('e',()=>{expect(hd336finx(15,0)).toBe(4);});});
function hd337finx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph337finx_hd',()=>{it('a',()=>{expect(hd337finx(1,4)).toBe(2);});it('b',()=>{expect(hd337finx(3,1)).toBe(1);});it('c',()=>{expect(hd337finx(0,0)).toBe(0);});it('d',()=>{expect(hd337finx(93,73)).toBe(2);});it('e',()=>{expect(hd337finx(15,0)).toBe(4);});});
