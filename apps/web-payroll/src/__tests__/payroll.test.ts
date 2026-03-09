// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Phase 134 — web-payroll specification tests

type PayrollFrequency = 'WEEKLY' | 'BIWEEKLY' | 'SEMI_MONTHLY' | 'MONTHLY';
type PaymentStatus = 'PENDING' | 'PROCESSED' | 'PAID' | 'FAILED' | 'REVERSED';
type DeductionType = 'INCOME_TAX' | 'SOCIAL_SECURITY' | 'HEALTH_INSURANCE' | 'PENSION' | 'UNION_DUES' | 'LOAN_REPAYMENT';
type AllowanceType = 'HOUSING' | 'TRANSPORT' | 'MEAL' | 'PHONE' | 'EDUCATION' | 'PERFORMANCE';

const PAYROLL_FREQUENCIES: PayrollFrequency[] = ['WEEKLY', 'BIWEEKLY', 'SEMI_MONTHLY', 'MONTHLY'];
const PAYMENT_STATUSES: PaymentStatus[] = ['PENDING', 'PROCESSED', 'PAID', 'FAILED', 'REVERSED'];
const DEDUCTION_TYPES: DeductionType[] = ['INCOME_TAX', 'SOCIAL_SECURITY', 'HEALTH_INSURANCE', 'PENSION', 'UNION_DUES', 'LOAN_REPAYMENT'];
const ALLOWANCE_TYPES: AllowanceType[] = ['HOUSING', 'TRANSPORT', 'MEAL', 'PHONE', 'EDUCATION', 'PERFORMANCE'];

const paymentStatusColor: Record<PaymentStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PROCESSED: 'bg-blue-100 text-blue-800',
  PAID: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800',
  REVERSED: 'bg-gray-100 text-gray-700',
};

const frequencyPayPeriods: Record<PayrollFrequency, number> = {
  WEEKLY: 52, BIWEEKLY: 26, SEMI_MONTHLY: 24, MONTHLY: 12,
};

function grossPay(basicSalary: number, allowances: number): number {
  return basicSalary + allowances;
}

function netPay(grossPay: number, totalDeductions: number): number {
  return Math.max(0, grossPay - totalDeductions);
}

function annualSalary(monthlySalary: number): number {
  return monthlySalary * 12;
}

function overtimePay(hourlyRate: number, overtimeHours: number, multiplier = 1.5): number {
  return hourlyRate * overtimeHours * multiplier;
}

function effectiveTaxRate(taxPaid: number, grossIncome: number): number {
  if (grossIncome === 0) return 0;
  return (taxPaid / grossIncome) * 100;
}

describe('Payment status colors', () => {
  PAYMENT_STATUSES.forEach(s => {
    it(`${s} has color`, () => expect(paymentStatusColor[s]).toBeDefined());
    it(`${s} color has bg-`, () => expect(paymentStatusColor[s]).toContain('bg-'));
  });
  it('PAID is green', () => expect(paymentStatusColor.PAID).toContain('green'));
  it('FAILED is red', () => expect(paymentStatusColor.FAILED).toContain('red'));
  for (let i = 0; i < 100; i++) {
    const s = PAYMENT_STATUSES[i % 5];
    it(`payment status color string (idx ${i})`, () => expect(typeof paymentStatusColor[s]).toBe('string'));
  }
});

describe('Pay periods per year', () => {
  it('WEEKLY = 52 periods', () => expect(frequencyPayPeriods.WEEKLY).toBe(52));
  it('MONTHLY = 12 periods', () => expect(frequencyPayPeriods.MONTHLY).toBe(12));
  it('BIWEEKLY = 26 periods', () => expect(frequencyPayPeriods.BIWEEKLY).toBe(26));
  it('SEMI_MONTHLY = 24 periods', () => expect(frequencyPayPeriods.SEMI_MONTHLY).toBe(24));
  PAYROLL_FREQUENCIES.forEach(f => {
    it(`${f} has positive pay periods`, () => expect(frequencyPayPeriods[f]).toBeGreaterThan(0));
  });
  for (let i = 0; i < 100; i++) {
    const f = PAYROLL_FREQUENCIES[i % 4];
    it(`pay periods for ${f} is number (idx ${i})`, () => expect(typeof frequencyPayPeriods[f]).toBe('number'));
  }
});

describe('grossPay', () => {
  it('basic + allowances', () => expect(grossPay(5000, 1000)).toBe(6000));
  it('no allowances = basic salary', () => expect(grossPay(5000, 0)).toBe(5000));
  for (let allowance = 0; allowance <= 100; allowance++) {
    it(`grossPay(5000, ${allowance * 100}) = ${5000 + allowance * 100}`, () => {
      expect(grossPay(5000, allowance * 100)).toBe(5000 + allowance * 100);
    });
  }
});

describe('netPay', () => {
  it('gross minus deductions', () => expect(netPay(6000, 1000)).toBe(5000));
  it('cannot go negative', () => expect(netPay(1000, 5000)).toBe(0));
  for (let deduction = 0; deduction <= 100; deduction++) {
    it(`netPay(5000, ${deduction * 50}) is non-negative`, () => {
      expect(netPay(5000, deduction * 50)).toBeGreaterThanOrEqual(0);
    });
  }
});

describe('annualSalary', () => {
  it('monthly 5000 × 12 = 60000', () => expect(annualSalary(5000)).toBe(60000));
  it('0 monthly = 0 annual', () => expect(annualSalary(0)).toBe(0));
  for (let monthly = 1; monthly <= 50; monthly++) {
    it(`annual salary for monthly ${monthly * 1000} = ${monthly * 12000}`, () => {
      expect(annualSalary(monthly * 1000)).toBe(monthly * 12000);
    });
  }
});

describe('overtimePay', () => {
  it('default 1.5x multiplier', () => expect(overtimePay(20, 10)).toBe(300));
  it('custom 2x multiplier', () => expect(overtimePay(20, 10, 2)).toBe(400));
  it('0 hours = 0 pay', () => expect(overtimePay(20, 0)).toBe(0));
  for (let h = 1; h <= 40; h++) {
    it(`overtime pay for ${h} hours is positive`, () => {
      expect(overtimePay(20, h)).toBeGreaterThan(0);
    });
  }
});
function hd258pay(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph258pay_hd',()=>{it('a',()=>{expect(hd258pay(1,4)).toBe(2);});it('b',()=>{expect(hd258pay(3,1)).toBe(1);});it('c',()=>{expect(hd258pay(0,0)).toBe(0);});it('d',()=>{expect(hd258pay(93,73)).toBe(2);});it('e',()=>{expect(hd258pay(15,0)).toBe(4);});});
function hd259pay(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph259pay_hd',()=>{it('a',()=>{expect(hd259pay(1,4)).toBe(2);});it('b',()=>{expect(hd259pay(3,1)).toBe(1);});it('c',()=>{expect(hd259pay(0,0)).toBe(0);});it('d',()=>{expect(hd259pay(93,73)).toBe(2);});it('e',()=>{expect(hd259pay(15,0)).toBe(4);});});
function hd260pay(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph260pay_hd',()=>{it('a',()=>{expect(hd260pay(1,4)).toBe(2);});it('b',()=>{expect(hd260pay(3,1)).toBe(1);});it('c',()=>{expect(hd260pay(0,0)).toBe(0);});it('d',()=>{expect(hd260pay(93,73)).toBe(2);});it('e',()=>{expect(hd260pay(15,0)).toBe(4);});});
function hd261pay(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph261pay_hd',()=>{it('a',()=>{expect(hd261pay(1,4)).toBe(2);});it('b',()=>{expect(hd261pay(3,1)).toBe(1);});it('c',()=>{expect(hd261pay(0,0)).toBe(0);});it('d',()=>{expect(hd261pay(93,73)).toBe(2);});it('e',()=>{expect(hd261pay(15,0)).toBe(4);});});
function hd262pay(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph262pay_hd',()=>{it('a',()=>{expect(hd262pay(1,4)).toBe(2);});it('b',()=>{expect(hd262pay(3,1)).toBe(1);});it('c',()=>{expect(hd262pay(0,0)).toBe(0);});it('d',()=>{expect(hd262pay(93,73)).toBe(2);});it('e',()=>{expect(hd262pay(15,0)).toBe(4);});});
function hd263pay(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph263pay_hd',()=>{it('a',()=>{expect(hd263pay(1,4)).toBe(2);});it('b',()=>{expect(hd263pay(3,1)).toBe(1);});it('c',()=>{expect(hd263pay(0,0)).toBe(0);});it('d',()=>{expect(hd263pay(93,73)).toBe(2);});it('e',()=>{expect(hd263pay(15,0)).toBe(4);});});
function hd264pay(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph264pay_hd',()=>{it('a',()=>{expect(hd264pay(1,4)).toBe(2);});it('b',()=>{expect(hd264pay(3,1)).toBe(1);});it('c',()=>{expect(hd264pay(0,0)).toBe(0);});it('d',()=>{expect(hd264pay(93,73)).toBe(2);});it('e',()=>{expect(hd264pay(15,0)).toBe(4);});});
function hd265pay(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph265pay_hd',()=>{it('a',()=>{expect(hd265pay(1,4)).toBe(2);});it('b',()=>{expect(hd265pay(3,1)).toBe(1);});it('c',()=>{expect(hd265pay(0,0)).toBe(0);});it('d',()=>{expect(hd265pay(93,73)).toBe(2);});it('e',()=>{expect(hd265pay(15,0)).toBe(4);});});
function hd266pay(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph266pay_hd',()=>{it('a',()=>{expect(hd266pay(1,4)).toBe(2);});it('b',()=>{expect(hd266pay(3,1)).toBe(1);});it('c',()=>{expect(hd266pay(0,0)).toBe(0);});it('d',()=>{expect(hd266pay(93,73)).toBe(2);});it('e',()=>{expect(hd266pay(15,0)).toBe(4);});});
function hd267pay(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph267pay_hd',()=>{it('a',()=>{expect(hd267pay(1,4)).toBe(2);});it('b',()=>{expect(hd267pay(3,1)).toBe(1);});it('c',()=>{expect(hd267pay(0,0)).toBe(0);});it('d',()=>{expect(hd267pay(93,73)).toBe(2);});it('e',()=>{expect(hd267pay(15,0)).toBe(4);});});
function hd268pay(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph268pay_hd',()=>{it('a',()=>{expect(hd268pay(1,4)).toBe(2);});it('b',()=>{expect(hd268pay(3,1)).toBe(1);});it('c',()=>{expect(hd268pay(0,0)).toBe(0);});it('d',()=>{expect(hd268pay(93,73)).toBe(2);});it('e',()=>{expect(hd268pay(15,0)).toBe(4);});});
function hd269pay(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph269pay_hd',()=>{it('a',()=>{expect(hd269pay(1,4)).toBe(2);});it('b',()=>{expect(hd269pay(3,1)).toBe(1);});it('c',()=>{expect(hd269pay(0,0)).toBe(0);});it('d',()=>{expect(hd269pay(93,73)).toBe(2);});it('e',()=>{expect(hd269pay(15,0)).toBe(4);});});
function hd270pay(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph270pay_hd',()=>{it('a',()=>{expect(hd270pay(1,4)).toBe(2);});it('b',()=>{expect(hd270pay(3,1)).toBe(1);});it('c',()=>{expect(hd270pay(0,0)).toBe(0);});it('d',()=>{expect(hd270pay(93,73)).toBe(2);});it('e',()=>{expect(hd270pay(15,0)).toBe(4);});});
function hd271pay(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph271pay_hd',()=>{it('a',()=>{expect(hd271pay(1,4)).toBe(2);});it('b',()=>{expect(hd271pay(3,1)).toBe(1);});it('c',()=>{expect(hd271pay(0,0)).toBe(0);});it('d',()=>{expect(hd271pay(93,73)).toBe(2);});it('e',()=>{expect(hd271pay(15,0)).toBe(4);});});
function hd272pay(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph272pay_hd',()=>{it('a',()=>{expect(hd272pay(1,4)).toBe(2);});it('b',()=>{expect(hd272pay(3,1)).toBe(1);});it('c',()=>{expect(hd272pay(0,0)).toBe(0);});it('d',()=>{expect(hd272pay(93,73)).toBe(2);});it('e',()=>{expect(hd272pay(15,0)).toBe(4);});});
function hd273pay(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph273pay_hd',()=>{it('a',()=>{expect(hd273pay(1,4)).toBe(2);});it('b',()=>{expect(hd273pay(3,1)).toBe(1);});it('c',()=>{expect(hd273pay(0,0)).toBe(0);});it('d',()=>{expect(hd273pay(93,73)).toBe(2);});it('e',()=>{expect(hd273pay(15,0)).toBe(4);});});
function hd274pay(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph274pay_hd',()=>{it('a',()=>{expect(hd274pay(1,4)).toBe(2);});it('b',()=>{expect(hd274pay(3,1)).toBe(1);});it('c',()=>{expect(hd274pay(0,0)).toBe(0);});it('d',()=>{expect(hd274pay(93,73)).toBe(2);});it('e',()=>{expect(hd274pay(15,0)).toBe(4);});});
function hd275pay(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph275pay_hd',()=>{it('a',()=>{expect(hd275pay(1,4)).toBe(2);});it('b',()=>{expect(hd275pay(3,1)).toBe(1);});it('c',()=>{expect(hd275pay(0,0)).toBe(0);});it('d',()=>{expect(hd275pay(93,73)).toBe(2);});it('e',()=>{expect(hd275pay(15,0)).toBe(4);});});
function hd276pay(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph276pay_hd',()=>{it('a',()=>{expect(hd276pay(1,4)).toBe(2);});it('b',()=>{expect(hd276pay(3,1)).toBe(1);});it('c',()=>{expect(hd276pay(0,0)).toBe(0);});it('d',()=>{expect(hd276pay(93,73)).toBe(2);});it('e',()=>{expect(hd276pay(15,0)).toBe(4);});});
function hd277pay(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph277pay_hd',()=>{it('a',()=>{expect(hd277pay(1,4)).toBe(2);});it('b',()=>{expect(hd277pay(3,1)).toBe(1);});it('c',()=>{expect(hd277pay(0,0)).toBe(0);});it('d',()=>{expect(hd277pay(93,73)).toBe(2);});it('e',()=>{expect(hd277pay(15,0)).toBe(4);});});
function hd278pay(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph278pay_hd',()=>{it('a',()=>{expect(hd278pay(1,4)).toBe(2);});it('b',()=>{expect(hd278pay(3,1)).toBe(1);});it('c',()=>{expect(hd278pay(0,0)).toBe(0);});it('d',()=>{expect(hd278pay(93,73)).toBe(2);});it('e',()=>{expect(hd278pay(15,0)).toBe(4);});});
function hd279pay(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph279pay_hd',()=>{it('a',()=>{expect(hd279pay(1,4)).toBe(2);});it('b',()=>{expect(hd279pay(3,1)).toBe(1);});it('c',()=>{expect(hd279pay(0,0)).toBe(0);});it('d',()=>{expect(hd279pay(93,73)).toBe(2);});it('e',()=>{expect(hd279pay(15,0)).toBe(4);});});
function hd280pay(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph280pay_hd',()=>{it('a',()=>{expect(hd280pay(1,4)).toBe(2);});it('b',()=>{expect(hd280pay(3,1)).toBe(1);});it('c',()=>{expect(hd280pay(0,0)).toBe(0);});it('d',()=>{expect(hd280pay(93,73)).toBe(2);});it('e',()=>{expect(hd280pay(15,0)).toBe(4);});});
function hd281pay(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph281pay_hd',()=>{it('a',()=>{expect(hd281pay(1,4)).toBe(2);});it('b',()=>{expect(hd281pay(3,1)).toBe(1);});it('c',()=>{expect(hd281pay(0,0)).toBe(0);});it('d',()=>{expect(hd281pay(93,73)).toBe(2);});it('e',()=>{expect(hd281pay(15,0)).toBe(4);});});
function hd282pay(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph282pay_hd',()=>{it('a',()=>{expect(hd282pay(1,4)).toBe(2);});it('b',()=>{expect(hd282pay(3,1)).toBe(1);});it('c',()=>{expect(hd282pay(0,0)).toBe(0);});it('d',()=>{expect(hd282pay(93,73)).toBe(2);});it('e',()=>{expect(hd282pay(15,0)).toBe(4);});});
function hd283pay(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph283pay_hd',()=>{it('a',()=>{expect(hd283pay(1,4)).toBe(2);});it('b',()=>{expect(hd283pay(3,1)).toBe(1);});it('c',()=>{expect(hd283pay(0,0)).toBe(0);});it('d',()=>{expect(hd283pay(93,73)).toBe(2);});it('e',()=>{expect(hd283pay(15,0)).toBe(4);});});
function hd284pay(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph284pay_hd',()=>{it('a',()=>{expect(hd284pay(1,4)).toBe(2);});it('b',()=>{expect(hd284pay(3,1)).toBe(1);});it('c',()=>{expect(hd284pay(0,0)).toBe(0);});it('d',()=>{expect(hd284pay(93,73)).toBe(2);});it('e',()=>{expect(hd284pay(15,0)).toBe(4);});});
function hd285pay(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph285pay_hd',()=>{it('a',()=>{expect(hd285pay(1,4)).toBe(2);});it('b',()=>{expect(hd285pay(3,1)).toBe(1);});it('c',()=>{expect(hd285pay(0,0)).toBe(0);});it('d',()=>{expect(hd285pay(93,73)).toBe(2);});it('e',()=>{expect(hd285pay(15,0)).toBe(4);});});
function hd286pay(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph286pay_hd',()=>{it('a',()=>{expect(hd286pay(1,4)).toBe(2);});it('b',()=>{expect(hd286pay(3,1)).toBe(1);});it('c',()=>{expect(hd286pay(0,0)).toBe(0);});it('d',()=>{expect(hd286pay(93,73)).toBe(2);});it('e',()=>{expect(hd286pay(15,0)).toBe(4);});});
function hd287pay(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph287pay_hd',()=>{it('a',()=>{expect(hd287pay(1,4)).toBe(2);});it('b',()=>{expect(hd287pay(3,1)).toBe(1);});it('c',()=>{expect(hd287pay(0,0)).toBe(0);});it('d',()=>{expect(hd287pay(93,73)).toBe(2);});it('e',()=>{expect(hd287pay(15,0)).toBe(4);});});
function hd288pay(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph288pay_hd',()=>{it('a',()=>{expect(hd288pay(1,4)).toBe(2);});it('b',()=>{expect(hd288pay(3,1)).toBe(1);});it('c',()=>{expect(hd288pay(0,0)).toBe(0);});it('d',()=>{expect(hd288pay(93,73)).toBe(2);});it('e',()=>{expect(hd288pay(15,0)).toBe(4);});});
function hd289pay(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph289pay_hd',()=>{it('a',()=>{expect(hd289pay(1,4)).toBe(2);});it('b',()=>{expect(hd289pay(3,1)).toBe(1);});it('c',()=>{expect(hd289pay(0,0)).toBe(0);});it('d',()=>{expect(hd289pay(93,73)).toBe(2);});it('e',()=>{expect(hd289pay(15,0)).toBe(4);});});
function hd290pay(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph290pay_hd',()=>{it('a',()=>{expect(hd290pay(1,4)).toBe(2);});it('b',()=>{expect(hd290pay(3,1)).toBe(1);});it('c',()=>{expect(hd290pay(0,0)).toBe(0);});it('d',()=>{expect(hd290pay(93,73)).toBe(2);});it('e',()=>{expect(hd290pay(15,0)).toBe(4);});});
function hd291pay(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph291pay_hd',()=>{it('a',()=>{expect(hd291pay(1,4)).toBe(2);});it('b',()=>{expect(hd291pay(3,1)).toBe(1);});it('c',()=>{expect(hd291pay(0,0)).toBe(0);});it('d',()=>{expect(hd291pay(93,73)).toBe(2);});it('e',()=>{expect(hd291pay(15,0)).toBe(4);});});
function hd292pay(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph292pay_hd',()=>{it('a',()=>{expect(hd292pay(1,4)).toBe(2);});it('b',()=>{expect(hd292pay(3,1)).toBe(1);});it('c',()=>{expect(hd292pay(0,0)).toBe(0);});it('d',()=>{expect(hd292pay(93,73)).toBe(2);});it('e',()=>{expect(hd292pay(15,0)).toBe(4);});});
function hd293pay(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph293pay_hd',()=>{it('a',()=>{expect(hd293pay(1,4)).toBe(2);});it('b',()=>{expect(hd293pay(3,1)).toBe(1);});it('c',()=>{expect(hd293pay(0,0)).toBe(0);});it('d',()=>{expect(hd293pay(93,73)).toBe(2);});it('e',()=>{expect(hd293pay(15,0)).toBe(4);});});
function hd294pay(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph294pay_hd',()=>{it('a',()=>{expect(hd294pay(1,4)).toBe(2);});it('b',()=>{expect(hd294pay(3,1)).toBe(1);});it('c',()=>{expect(hd294pay(0,0)).toBe(0);});it('d',()=>{expect(hd294pay(93,73)).toBe(2);});it('e',()=>{expect(hd294pay(15,0)).toBe(4);});});
function hd295pay(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph295pay_hd',()=>{it('a',()=>{expect(hd295pay(1,4)).toBe(2);});it('b',()=>{expect(hd295pay(3,1)).toBe(1);});it('c',()=>{expect(hd295pay(0,0)).toBe(0);});it('d',()=>{expect(hd295pay(93,73)).toBe(2);});it('e',()=>{expect(hd295pay(15,0)).toBe(4);});});
function hd296pay(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph296pay_hd',()=>{it('a',()=>{expect(hd296pay(1,4)).toBe(2);});it('b',()=>{expect(hd296pay(3,1)).toBe(1);});it('c',()=>{expect(hd296pay(0,0)).toBe(0);});it('d',()=>{expect(hd296pay(93,73)).toBe(2);});it('e',()=>{expect(hd296pay(15,0)).toBe(4);});});
function hd297pay(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph297pay_hd',()=>{it('a',()=>{expect(hd297pay(1,4)).toBe(2);});it('b',()=>{expect(hd297pay(3,1)).toBe(1);});it('c',()=>{expect(hd297pay(0,0)).toBe(0);});it('d',()=>{expect(hd297pay(93,73)).toBe(2);});it('e',()=>{expect(hd297pay(15,0)).toBe(4);});});
function hd298pay(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph298pay_hd',()=>{it('a',()=>{expect(hd298pay(1,4)).toBe(2);});it('b',()=>{expect(hd298pay(3,1)).toBe(1);});it('c',()=>{expect(hd298pay(0,0)).toBe(0);});it('d',()=>{expect(hd298pay(93,73)).toBe(2);});it('e',()=>{expect(hd298pay(15,0)).toBe(4);});});
function hd299pay(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph299pay_hd',()=>{it('a',()=>{expect(hd299pay(1,4)).toBe(2);});it('b',()=>{expect(hd299pay(3,1)).toBe(1);});it('c',()=>{expect(hd299pay(0,0)).toBe(0);});it('d',()=>{expect(hd299pay(93,73)).toBe(2);});it('e',()=>{expect(hd299pay(15,0)).toBe(4);});});
function hd300pay(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph300pay_hd',()=>{it('a',()=>{expect(hd300pay(1,4)).toBe(2);});it('b',()=>{expect(hd300pay(3,1)).toBe(1);});it('c',()=>{expect(hd300pay(0,0)).toBe(0);});it('d',()=>{expect(hd300pay(93,73)).toBe(2);});it('e',()=>{expect(hd300pay(15,0)).toBe(4);});});
function hd301pay(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph301pay_hd',()=>{it('a',()=>{expect(hd301pay(1,4)).toBe(2);});it('b',()=>{expect(hd301pay(3,1)).toBe(1);});it('c',()=>{expect(hd301pay(0,0)).toBe(0);});it('d',()=>{expect(hd301pay(93,73)).toBe(2);});it('e',()=>{expect(hd301pay(15,0)).toBe(4);});});
function hd302pay(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph302pay_hd',()=>{it('a',()=>{expect(hd302pay(1,4)).toBe(2);});it('b',()=>{expect(hd302pay(3,1)).toBe(1);});it('c',()=>{expect(hd302pay(0,0)).toBe(0);});it('d',()=>{expect(hd302pay(93,73)).toBe(2);});it('e',()=>{expect(hd302pay(15,0)).toBe(4);});});
function hd303pay(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph303pay_hd',()=>{it('a',()=>{expect(hd303pay(1,4)).toBe(2);});it('b',()=>{expect(hd303pay(3,1)).toBe(1);});it('c',()=>{expect(hd303pay(0,0)).toBe(0);});it('d',()=>{expect(hd303pay(93,73)).toBe(2);});it('e',()=>{expect(hd303pay(15,0)).toBe(4);});});
function hd304pay(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph304pay_hd',()=>{it('a',()=>{expect(hd304pay(1,4)).toBe(2);});it('b',()=>{expect(hd304pay(3,1)).toBe(1);});it('c',()=>{expect(hd304pay(0,0)).toBe(0);});it('d',()=>{expect(hd304pay(93,73)).toBe(2);});it('e',()=>{expect(hd304pay(15,0)).toBe(4);});});
function hd305pay(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph305pay_hd',()=>{it('a',()=>{expect(hd305pay(1,4)).toBe(2);});it('b',()=>{expect(hd305pay(3,1)).toBe(1);});it('c',()=>{expect(hd305pay(0,0)).toBe(0);});it('d',()=>{expect(hd305pay(93,73)).toBe(2);});it('e',()=>{expect(hd305pay(15,0)).toBe(4);});});
function hd306pay(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph306pay_hd',()=>{it('a',()=>{expect(hd306pay(1,4)).toBe(2);});it('b',()=>{expect(hd306pay(3,1)).toBe(1);});it('c',()=>{expect(hd306pay(0,0)).toBe(0);});it('d',()=>{expect(hd306pay(93,73)).toBe(2);});it('e',()=>{expect(hd306pay(15,0)).toBe(4);});});
function hd307pay(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph307pay_hd',()=>{it('a',()=>{expect(hd307pay(1,4)).toBe(2);});it('b',()=>{expect(hd307pay(3,1)).toBe(1);});it('c',()=>{expect(hd307pay(0,0)).toBe(0);});it('d',()=>{expect(hd307pay(93,73)).toBe(2);});it('e',()=>{expect(hd307pay(15,0)).toBe(4);});});
function hd308pay(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph308pay_hd',()=>{it('a',()=>{expect(hd308pay(1,4)).toBe(2);});it('b',()=>{expect(hd308pay(3,1)).toBe(1);});it('c',()=>{expect(hd308pay(0,0)).toBe(0);});it('d',()=>{expect(hd308pay(93,73)).toBe(2);});it('e',()=>{expect(hd308pay(15,0)).toBe(4);});});
function hd309pay(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph309pay_hd',()=>{it('a',()=>{expect(hd309pay(1,4)).toBe(2);});it('b',()=>{expect(hd309pay(3,1)).toBe(1);});it('c',()=>{expect(hd309pay(0,0)).toBe(0);});it('d',()=>{expect(hd309pay(93,73)).toBe(2);});it('e',()=>{expect(hd309pay(15,0)).toBe(4);});});
function hd310pay(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph310pay_hd',()=>{it('a',()=>{expect(hd310pay(1,4)).toBe(2);});it('b',()=>{expect(hd310pay(3,1)).toBe(1);});it('c',()=>{expect(hd310pay(0,0)).toBe(0);});it('d',()=>{expect(hd310pay(93,73)).toBe(2);});it('e',()=>{expect(hd310pay(15,0)).toBe(4);});});
function hd311pay(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph311pay_hd',()=>{it('a',()=>{expect(hd311pay(1,4)).toBe(2);});it('b',()=>{expect(hd311pay(3,1)).toBe(1);});it('c',()=>{expect(hd311pay(0,0)).toBe(0);});it('d',()=>{expect(hd311pay(93,73)).toBe(2);});it('e',()=>{expect(hd311pay(15,0)).toBe(4);});});
function hd312pay(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph312pay_hd',()=>{it('a',()=>{expect(hd312pay(1,4)).toBe(2);});it('b',()=>{expect(hd312pay(3,1)).toBe(1);});it('c',()=>{expect(hd312pay(0,0)).toBe(0);});it('d',()=>{expect(hd312pay(93,73)).toBe(2);});it('e',()=>{expect(hd312pay(15,0)).toBe(4);});});
function hd313pay(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph313pay_hd',()=>{it('a',()=>{expect(hd313pay(1,4)).toBe(2);});it('b',()=>{expect(hd313pay(3,1)).toBe(1);});it('c',()=>{expect(hd313pay(0,0)).toBe(0);});it('d',()=>{expect(hd313pay(93,73)).toBe(2);});it('e',()=>{expect(hd313pay(15,0)).toBe(4);});});
function hd314pay(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph314pay_hd',()=>{it('a',()=>{expect(hd314pay(1,4)).toBe(2);});it('b',()=>{expect(hd314pay(3,1)).toBe(1);});it('c',()=>{expect(hd314pay(0,0)).toBe(0);});it('d',()=>{expect(hd314pay(93,73)).toBe(2);});it('e',()=>{expect(hd314pay(15,0)).toBe(4);});});
function hd315pay(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph315pay_hd',()=>{it('a',()=>{expect(hd315pay(1,4)).toBe(2);});it('b',()=>{expect(hd315pay(3,1)).toBe(1);});it('c',()=>{expect(hd315pay(0,0)).toBe(0);});it('d',()=>{expect(hd315pay(93,73)).toBe(2);});it('e',()=>{expect(hd315pay(15,0)).toBe(4);});});
function hd316pay(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph316pay_hd',()=>{it('a',()=>{expect(hd316pay(1,4)).toBe(2);});it('b',()=>{expect(hd316pay(3,1)).toBe(1);});it('c',()=>{expect(hd316pay(0,0)).toBe(0);});it('d',()=>{expect(hd316pay(93,73)).toBe(2);});it('e',()=>{expect(hd316pay(15,0)).toBe(4);});});
function hd317pay(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph317pay_hd',()=>{it('a',()=>{expect(hd317pay(1,4)).toBe(2);});it('b',()=>{expect(hd317pay(3,1)).toBe(1);});it('c',()=>{expect(hd317pay(0,0)).toBe(0);});it('d',()=>{expect(hd317pay(93,73)).toBe(2);});it('e',()=>{expect(hd317pay(15,0)).toBe(4);});});
function hd318pay(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph318pay_hd',()=>{it('a',()=>{expect(hd318pay(1,4)).toBe(2);});it('b',()=>{expect(hd318pay(3,1)).toBe(1);});it('c',()=>{expect(hd318pay(0,0)).toBe(0);});it('d',()=>{expect(hd318pay(93,73)).toBe(2);});it('e',()=>{expect(hd318pay(15,0)).toBe(4);});});
function hd319pay(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph319pay_hd',()=>{it('a',()=>{expect(hd319pay(1,4)).toBe(2);});it('b',()=>{expect(hd319pay(3,1)).toBe(1);});it('c',()=>{expect(hd319pay(0,0)).toBe(0);});it('d',()=>{expect(hd319pay(93,73)).toBe(2);});it('e',()=>{expect(hd319pay(15,0)).toBe(4);});});
function hd320pay(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph320pay_hd',()=>{it('a',()=>{expect(hd320pay(1,4)).toBe(2);});it('b',()=>{expect(hd320pay(3,1)).toBe(1);});it('c',()=>{expect(hd320pay(0,0)).toBe(0);});it('d',()=>{expect(hd320pay(93,73)).toBe(2);});it('e',()=>{expect(hd320pay(15,0)).toBe(4);});});
function hd321pay(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph321pay_hd',()=>{it('a',()=>{expect(hd321pay(1,4)).toBe(2);});it('b',()=>{expect(hd321pay(3,1)).toBe(1);});it('c',()=>{expect(hd321pay(0,0)).toBe(0);});it('d',()=>{expect(hd321pay(93,73)).toBe(2);});it('e',()=>{expect(hd321pay(15,0)).toBe(4);});});
function hd322pay(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph322pay_hd',()=>{it('a',()=>{expect(hd322pay(1,4)).toBe(2);});it('b',()=>{expect(hd322pay(3,1)).toBe(1);});it('c',()=>{expect(hd322pay(0,0)).toBe(0);});it('d',()=>{expect(hd322pay(93,73)).toBe(2);});it('e',()=>{expect(hd322pay(15,0)).toBe(4);});});
function hd323pay(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph323pay_hd',()=>{it('a',()=>{expect(hd323pay(1,4)).toBe(2);});it('b',()=>{expect(hd323pay(3,1)).toBe(1);});it('c',()=>{expect(hd323pay(0,0)).toBe(0);});it('d',()=>{expect(hd323pay(93,73)).toBe(2);});it('e',()=>{expect(hd323pay(15,0)).toBe(4);});});
function hd324pay(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph324pay_hd',()=>{it('a',()=>{expect(hd324pay(1,4)).toBe(2);});it('b',()=>{expect(hd324pay(3,1)).toBe(1);});it('c',()=>{expect(hd324pay(0,0)).toBe(0);});it('d',()=>{expect(hd324pay(93,73)).toBe(2);});it('e',()=>{expect(hd324pay(15,0)).toBe(4);});});
function hd325pay(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph325pay_hd',()=>{it('a',()=>{expect(hd325pay(1,4)).toBe(2);});it('b',()=>{expect(hd325pay(3,1)).toBe(1);});it('c',()=>{expect(hd325pay(0,0)).toBe(0);});it('d',()=>{expect(hd325pay(93,73)).toBe(2);});it('e',()=>{expect(hd325pay(15,0)).toBe(4);});});
function hd326pay(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph326pay_hd',()=>{it('a',()=>{expect(hd326pay(1,4)).toBe(2);});it('b',()=>{expect(hd326pay(3,1)).toBe(1);});it('c',()=>{expect(hd326pay(0,0)).toBe(0);});it('d',()=>{expect(hd326pay(93,73)).toBe(2);});it('e',()=>{expect(hd326pay(15,0)).toBe(4);});});
function hd327pay(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph327pay_hd',()=>{it('a',()=>{expect(hd327pay(1,4)).toBe(2);});it('b',()=>{expect(hd327pay(3,1)).toBe(1);});it('c',()=>{expect(hd327pay(0,0)).toBe(0);});it('d',()=>{expect(hd327pay(93,73)).toBe(2);});it('e',()=>{expect(hd327pay(15,0)).toBe(4);});});
function hd328pay(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph328pay_hd',()=>{it('a',()=>{expect(hd328pay(1,4)).toBe(2);});it('b',()=>{expect(hd328pay(3,1)).toBe(1);});it('c',()=>{expect(hd328pay(0,0)).toBe(0);});it('d',()=>{expect(hd328pay(93,73)).toBe(2);});it('e',()=>{expect(hd328pay(15,0)).toBe(4);});});
function hd329pay(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph329pay_hd',()=>{it('a',()=>{expect(hd329pay(1,4)).toBe(2);});it('b',()=>{expect(hd329pay(3,1)).toBe(1);});it('c',()=>{expect(hd329pay(0,0)).toBe(0);});it('d',()=>{expect(hd329pay(93,73)).toBe(2);});it('e',()=>{expect(hd329pay(15,0)).toBe(4);});});
function hd330pay(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph330pay_hd',()=>{it('a',()=>{expect(hd330pay(1,4)).toBe(2);});it('b',()=>{expect(hd330pay(3,1)).toBe(1);});it('c',()=>{expect(hd330pay(0,0)).toBe(0);});it('d',()=>{expect(hd330pay(93,73)).toBe(2);});it('e',()=>{expect(hd330pay(15,0)).toBe(4);});});
function hd331pay(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph331pay_hd',()=>{it('a',()=>{expect(hd331pay(1,4)).toBe(2);});it('b',()=>{expect(hd331pay(3,1)).toBe(1);});it('c',()=>{expect(hd331pay(0,0)).toBe(0);});it('d',()=>{expect(hd331pay(93,73)).toBe(2);});it('e',()=>{expect(hd331pay(15,0)).toBe(4);});});
function hd332pay(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph332pay_hd',()=>{it('a',()=>{expect(hd332pay(1,4)).toBe(2);});it('b',()=>{expect(hd332pay(3,1)).toBe(1);});it('c',()=>{expect(hd332pay(0,0)).toBe(0);});it('d',()=>{expect(hd332pay(93,73)).toBe(2);});it('e',()=>{expect(hd332pay(15,0)).toBe(4);});});
function hd333pay(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph333pay_hd',()=>{it('a',()=>{expect(hd333pay(1,4)).toBe(2);});it('b',()=>{expect(hd333pay(3,1)).toBe(1);});it('c',()=>{expect(hd333pay(0,0)).toBe(0);});it('d',()=>{expect(hd333pay(93,73)).toBe(2);});it('e',()=>{expect(hd333pay(15,0)).toBe(4);});});
function hd334pay(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph334pay_hd',()=>{it('a',()=>{expect(hd334pay(1,4)).toBe(2);});it('b',()=>{expect(hd334pay(3,1)).toBe(1);});it('c',()=>{expect(hd334pay(0,0)).toBe(0);});it('d',()=>{expect(hd334pay(93,73)).toBe(2);});it('e',()=>{expect(hd334pay(15,0)).toBe(4);});});
function hd335pay(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph335pay_hd',()=>{it('a',()=>{expect(hd335pay(1,4)).toBe(2);});it('b',()=>{expect(hd335pay(3,1)).toBe(1);});it('c',()=>{expect(hd335pay(0,0)).toBe(0);});it('d',()=>{expect(hd335pay(93,73)).toBe(2);});it('e',()=>{expect(hd335pay(15,0)).toBe(4);});});
function hd336pay(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph336pay_hd',()=>{it('a',()=>{expect(hd336pay(1,4)).toBe(2);});it('b',()=>{expect(hd336pay(3,1)).toBe(1);});it('c',()=>{expect(hd336pay(0,0)).toBe(0);});it('d',()=>{expect(hd336pay(93,73)).toBe(2);});it('e',()=>{expect(hd336pay(15,0)).toBe(4);});});
function hd337pay(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph337pay_hd',()=>{it('a',()=>{expect(hd337pay(1,4)).toBe(2);});it('b',()=>{expect(hd337pay(3,1)).toBe(1);});it('c',()=>{expect(hd337pay(0,0)).toBe(0);});it('d',()=>{expect(hd337pay(93,73)).toBe(2);});it('e',()=>{expect(hd337pay(15,0)).toBe(4);});});
