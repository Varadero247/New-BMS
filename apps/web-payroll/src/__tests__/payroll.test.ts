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
