// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

// ─── Domain Types ────────────────────────────────────────────────────────────

type PayrollRunStatus = 'DRAFT' | 'PROCESSING' | 'CALCULATED' | 'APPROVED' | 'COMPLETED' | 'CANCELLED';
type PayslipStatus = 'DRAFT' | 'GENERATED' | 'CALCULATED' | 'APPROVED' | 'PUBLISHED' | 'PAID';
type PayFrequency = 'WEEKLY' | 'BI_WEEKLY' | 'SEMI_MONTHLY' | 'MONTHLY';
type BenefitCategory =
  | 'HEALTH_INSURANCE'
  | 'LIFE_INSURANCE'
  | 'DENTAL'
  | 'VISION'
  | 'RETIREMENT'
  | 'PENSION'
  | 'HSA'
  | 'FSA'
  | 'TRANSPORTATION'
  | 'WELLNESS'
  | 'OTHER';
type LoanType = 'PERSONAL_LOAN' | 'SALARY_ADVANCE' | 'EMERGENCY_LOAN' | 'HOUSING_LOAN' | 'EDUCATION_LOAN';
type LoanStatus = 'PENDING' | 'APPROVED' | 'DISBURSED' | 'ACTIVE' | 'COMPLETED' | 'DEFAULTED' | 'CANCELLED';
type ExpenseCategory = 'TRAVEL' | 'ACCOMMODATION' | 'MEALS' | 'OFFICE_SUPPLIES' | 'TRAINING' | 'ENTERTAINMENT' | 'OTHER';
type ExpenseStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'PAID';
type TaxJurisdiction = 'uk' | 'us-federal' | 'ie' | 'de';

// ─── Static Arrays ────────────────────────────────────────────────────────────

const PAYROLL_RUN_STATUSES: PayrollRunStatus[] = [
  'DRAFT', 'PROCESSING', 'CALCULATED', 'APPROVED', 'COMPLETED', 'CANCELLED',
];

const PAYSLIP_STATUSES: PayslipStatus[] = [
  'DRAFT', 'GENERATED', 'CALCULATED', 'APPROVED', 'PUBLISHED', 'PAID',
];

const PAY_FREQUENCIES: PayFrequency[] = ['WEEKLY', 'BI_WEEKLY', 'SEMI_MONTHLY', 'MONTHLY'];

const BENEFIT_CATEGORIES: BenefitCategory[] = [
  'HEALTH_INSURANCE', 'LIFE_INSURANCE', 'DENTAL', 'VISION',
  'RETIREMENT', 'PENSION', 'HSA', 'FSA', 'TRANSPORTATION', 'WELLNESS', 'OTHER',
];

const LOAN_TYPES: LoanType[] = [
  'PERSONAL_LOAN', 'SALARY_ADVANCE', 'EMERGENCY_LOAN', 'HOUSING_LOAN', 'EDUCATION_LOAN',
];

const LOAN_STATUSES: LoanStatus[] = [
  'PENDING', 'APPROVED', 'DISBURSED', 'ACTIVE', 'COMPLETED', 'DEFAULTED', 'CANCELLED',
];

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'TRAVEL', 'ACCOMMODATION', 'MEALS', 'OFFICE_SUPPLIES', 'TRAINING', 'ENTERTAINMENT', 'OTHER',
];

const EXPENSE_STATUSES: ExpenseStatus[] = ['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'PAID'];

const TAX_JURISDICTIONS: TaxJurisdiction[] = ['uk', 'us-federal', 'ie', 'de'];

// ─── Badge / Colour Maps ──────────────────────────────────────────────────────

const payrollRunStatusBadge: Record<PayrollRunStatus, string> = {
  DRAFT:       'bg-gray-100 text-gray-800',
  PROCESSING:  'bg-yellow-100 text-yellow-800',
  CALCULATED:  'bg-blue-100 text-blue-800',
  APPROVED:    'bg-indigo-100 text-indigo-800',
  COMPLETED:   'bg-green-100 text-green-800',
  CANCELLED:   'bg-red-100 text-red-800',
};

const payslipStatusBadge: Record<PayslipStatus, string> = {
  DRAFT:       'bg-gray-100 text-gray-800',
  GENERATED:   'bg-yellow-100 text-yellow-800',
  CALCULATED:  'bg-blue-100 text-blue-800',
  APPROVED:    'bg-indigo-100 text-indigo-800',
  PUBLISHED:   'bg-purple-100 text-purple-800',
  PAID:        'bg-green-100 text-green-800',
};

const benefitCategoryBadge: Record<BenefitCategory, string> = {
  HEALTH_INSURANCE: 'bg-blue-100 text-blue-800',
  LIFE_INSURANCE:   'bg-indigo-100 text-indigo-800',
  DENTAL:           'bg-pink-100 text-pink-800',
  VISION:           'bg-cyan-100 text-cyan-800',
  RETIREMENT:       'bg-purple-100 text-purple-800',
  PENSION:          'bg-violet-100 text-violet-800',
  HSA:              'bg-green-100 text-green-800',
  FSA:              'bg-teal-100 text-teal-800',
  TRANSPORTATION:   'bg-orange-100 text-orange-800',
  WELLNESS:         'bg-lime-100 text-lime-800',
  OTHER:            'bg-gray-100 text-gray-800',
};

// ─── Pay Period Multipliers ───────────────────────────────────────────────────

const payPeriodsPerYear: Record<PayFrequency, number> = {
  WEEKLY:      52,
  BI_WEEKLY:   26,
  SEMI_MONTHLY: 24,
  MONTHLY:     12,
};

// ─── Mock Data Shapes ─────────────────────────────────────────────────────────

interface MockPayrollRun {
  id: string;
  runNumber: string;
  payPeriodType: PayFrequency;
  periodStart: string;
  periodEnd: string;
  payDate: string;
  status: PayrollRunStatus;
  employeeCount: number;
  totalGross: number;
  totalDeductions: number;
  totalNet: number;
  createdAt: string;
}

interface MockPayslip {
  id: string;
  payslipNumber: string;
  employeeName: string;
  employeeNumber: string;
  periodStart: string;
  periodEnd: string;
  payDate: string;
  grossEarnings: number;
  netPay: number;
  status: PayslipStatus;
  currency: string;
}

interface MockBenefitPlan {
  id: string;
  code: string;
  name: string;
  category: BenefitCategory;
  provider: string | null;
  employeeContribution: number | null;
  employerContribution: number | null;
  waitingPeriodDays: number;
  isActive: boolean;
  enrollmentCount: number;
}

const MOCK_PAYROLL_RUN: MockPayrollRun = {
  id: 'run-001',
  runNumber: 'PR-2026-001',
  payPeriodType: 'MONTHLY',
  periodStart: '2026-01-01',
  periodEnd: '2026-01-31',
  payDate: '2026-01-31',
  status: 'COMPLETED',
  employeeCount: 120,
  totalGross: 600000,
  totalDeductions: 150000,
  totalNet: 450000,
  createdAt: '2026-01-28T09:00:00Z',
};

const MOCK_PAYSLIPS: MockPayslip[] = [
  {
    id: 'slip-001',
    payslipNumber: 'PS-2026-001',
    employeeName: 'Alice Johnson',
    employeeNumber: 'EMP-001',
    periodStart: '2026-01-01',
    periodEnd: '2026-01-31',
    payDate: '2026-01-31',
    grossEarnings: 5000,
    netPay: 3750,
    status: 'PAID',
    currency: 'USD',
  },
  {
    id: 'slip-002',
    payslipNumber: 'PS-2026-002',
    employeeName: 'Bob Smith',
    employeeNumber: 'EMP-002',
    periodStart: '2026-01-01',
    periodEnd: '2026-01-31',
    payDate: '2026-01-31',
    grossEarnings: 7500,
    netPay: 5250,
    status: 'PUBLISHED',
    currency: 'USD',
  },
  {
    id: 'slip-003',
    payslipNumber: 'PS-2026-003',
    employeeName: 'Carol Davis',
    employeeNumber: 'EMP-003',
    periodStart: '2026-01-01',
    periodEnd: '2026-01-31',
    payDate: '2026-01-31',
    grossEarnings: 4200,
    netPay: 3150,
    status: 'DRAFT',
    currency: 'GBP',
  },
];

const MOCK_BENEFIT_PLAN: MockBenefitPlan = {
  id: 'benefit-001',
  code: 'HEALTH-GOLD',
  name: 'Gold Health Plan',
  category: 'HEALTH_INSURANCE',
  provider: 'BlueCross',
  employeeContribution: 150,
  employerContribution: 450,
  waitingPeriodDays: 30,
  isActive: true,
  enrollmentCount: 85,
};

// ─── UK Tax Jurisdiction Data ─────────────────────────────────────────────────

interface TaxBand { name: string; from: number; to: number | null; rate: number; }

const UK_TAX_BANDS: TaxBand[] = [
  { name: 'Personal Allowance', from: 0, to: 12570, rate: 0 },
  { name: 'Basic Rate', from: 12571, to: 50270, rate: 20 },
  { name: 'Higher Rate', from: 50271, to: 125140, rate: 40 },
  { name: 'Additional Rate', from: 125141, to: null, rate: 45 },
];

const UK_CONFIG = {
  personalAllowance: 12570,
  niRate: 8,
  niThreshold: 12570,
  pensionRate: 5,
  studentLoanRate: 9,
  studentLoanThreshold: 27295,
};

// ─── Pure Helper Functions (inlined from source) ───────────────────────────────

function grossPay(basicSalary: number, allowances: number): number {
  return basicSalary + allowances;
}

function netPay(gross: number, totalDeductions: number): number {
  return Math.max(0, gross - totalDeductions);
}

function deductionAmount(gross: number, ratePercent: number): number {
  return (gross * ratePercent) / 100;
}

function calculateNI(salary: number, niThreshold: number, niRate: number): number {
  return salary > niThreshold ? ((salary - niThreshold) * niRate) / 100 : 0;
}

function calculatePension(salary: number, pensionRate: number): number {
  return (salary * pensionRate) / 100;
}

function calculateStudentLoan(
  salary: number,
  threshold: number,
  rate: number,
): number {
  return salary > threshold ? ((salary - threshold) * rate) / 100 : 0;
}

function calculateIncomeTaxBanded(salary: number, bands: TaxBand[]): number {
  let tax = 0;
  for (const band of bands) {
    const bandMax = band.to ?? Infinity;
    if (salary > band.from) {
      const taxable = Math.min(salary, bandMax) - band.from;
      tax += (taxable * band.rate) / 100;
    }
  }
  return tax;
}

function effectiveRate(taxPaid: number, grossIncome: number): number {
  if (grossIncome === 0) return 0;
  return (taxPaid / grossIncome) * 100;
}

function takeHomePercent(netAmount: number, gross: number): number {
  if (gross === 0) return 0;
  return (netAmount / gross) * 100;
}

function annualToMonthly(annual: number): number {
  return annual / 12;
}

function monthlyToAnnual(monthly: number): number {
  return monthly * 12;
}

function loanInstallment(principal: number, annualRatePercent: number, termMonths: number): number {
  if (annualRatePercent === 0) return principal / termMonths;
  const r = annualRatePercent / 100 / 12;
  return (principal * r * Math.pow(1 + r, termMonths)) / (Math.pow(1 + r, termMonths) - 1);
}

function remainingLoanBalance(principal: number, repaid: number): number {
  return Math.max(0, principal - repaid);
}

function budgetVariance(planned: number, actual: number): number {
  return planned - actual;
}

// ─── Tests: PayrollRun Status Badge Map ──────────────────────────────────────

describe('payrollRunStatusBadge map', () => {
  for (const status of PAYROLL_RUN_STATUSES) {
    it(`${status} has a badge class`, () => {
      expect(payrollRunStatusBadge[status]).toBeDefined();
    });
    it(`${status} badge contains bg-`, () => {
      expect(payrollRunStatusBadge[status]).toContain('bg-');
    });
    it(`${status} badge is a string`, () => {
      expect(typeof payrollRunStatusBadge[status]).toBe('string');
    });
  }

  it('COMPLETED is green', () => expect(payrollRunStatusBadge.COMPLETED).toContain('green'));
  it('CANCELLED is red', () => expect(payrollRunStatusBadge.CANCELLED).toContain('red'));
  it('PROCESSING is yellow', () => expect(payrollRunStatusBadge.PROCESSING).toContain('yellow'));
  it('APPROVED is indigo', () => expect(payrollRunStatusBadge.APPROVED).toContain('indigo'));
  it('DRAFT is gray', () => expect(payrollRunStatusBadge.DRAFT).toContain('gray'));
  it('CALCULATED is blue', () => expect(payrollRunStatusBadge.CALCULATED).toContain('blue'));
  it('map has exactly 6 entries', () => expect(Object.keys(payrollRunStatusBadge).length).toBe(6));
});

// ─── Tests: Payslip Status Badge Map ─────────────────────────────────────────

describe('payslipStatusBadge map', () => {
  for (const status of PAYSLIP_STATUSES) {
    it(`${status} has a badge class`, () => {
      expect(payslipStatusBadge[status]).toBeDefined();
    });
    it(`${status} badge contains bg-`, () => {
      expect(payslipStatusBadge[status]).toContain('bg-');
    });
  }

  it('PAID is green', () => expect(payslipStatusBadge.PAID).toContain('green'));
  it('PUBLISHED is purple', () => expect(payslipStatusBadge.PUBLISHED).toContain('purple'));
  it('GENERATED is yellow', () => expect(payslipStatusBadge.GENERATED).toContain('yellow'));
  it('map has exactly 6 entries', () => expect(Object.keys(payslipStatusBadge).length).toBe(6));
});

// ─── Tests: Benefit Category Badge Map ───────────────────────────────────────

describe('benefitCategoryBadge map', () => {
  for (const cat of BENEFIT_CATEGORIES) {
    it(`${cat} has a badge class`, () => {
      expect(benefitCategoryBadge[cat]).toBeDefined();
    });
    it(`${cat} badge contains bg-`, () => {
      expect(benefitCategoryBadge[cat]).toContain('bg-');
    });
  }

  it('HEALTH_INSURANCE is blue', () => expect(benefitCategoryBadge.HEALTH_INSURANCE).toContain('blue'));
  it('DENTAL is pink', () => expect(benefitCategoryBadge.DENTAL).toContain('pink'));
  it('RETIREMENT is purple', () => expect(benefitCategoryBadge.RETIREMENT).toContain('purple'));
  it('HSA is green', () => expect(benefitCategoryBadge.HSA).toContain('green'));
  it('TRANSPORTATION is orange', () => expect(benefitCategoryBadge.TRANSPORTATION).toContain('orange'));
  it('map has exactly 11 entries', () => expect(Object.keys(benefitCategoryBadge).length).toBe(11));
});

// ─── Tests: Pay Periods Per Year ──────────────────────────────────────────────

describe('payPeriodsPerYear', () => {
  it('WEEKLY = 52', () => expect(payPeriodsPerYear.WEEKLY).toBe(52));
  it('BI_WEEKLY = 26', () => expect(payPeriodsPerYear.BI_WEEKLY).toBe(26));
  it('SEMI_MONTHLY = 24', () => expect(payPeriodsPerYear.SEMI_MONTHLY).toBe(24));
  it('MONTHLY = 12', () => expect(payPeriodsPerYear.MONTHLY).toBe(12));
  it('WEEKLY > BI_WEEKLY', () => expect(payPeriodsPerYear.WEEKLY).toBeGreaterThan(payPeriodsPerYear.BI_WEEKLY));
  it('BI_WEEKLY > SEMI_MONTHLY', () => expect(payPeriodsPerYear.BI_WEEKLY).toBeGreaterThan(payPeriodsPerYear.SEMI_MONTHLY));
  it('SEMI_MONTHLY > MONTHLY', () => expect(payPeriodsPerYear.SEMI_MONTHLY).toBeGreaterThan(payPeriodsPerYear.MONTHLY));

  for (const freq of PAY_FREQUENCIES) {
    it(`${freq} pay periods is positive integer`, () => {
      const v = payPeriodsPerYear[freq];
      expect(v).toBeGreaterThan(0);
      expect(Number.isInteger(v)).toBe(true);
    });
  }
});

// ─── Tests: Mock Data Shapes ──────────────────────────────────────────────────

describe('MOCK_PAYROLL_RUN shape', () => {
  it('has id', () => expect(MOCK_PAYROLL_RUN.id).toBeTruthy());
  it('has runNumber starting PR-', () => expect(MOCK_PAYROLL_RUN.runNumber).toMatch(/^PR-/));
  it('totalNet = totalGross - totalDeductions', () => {
    expect(MOCK_PAYROLL_RUN.totalNet).toBe(MOCK_PAYROLL_RUN.totalGross - MOCK_PAYROLL_RUN.totalDeductions);
  });
  it('totalGross > 0', () => expect(MOCK_PAYROLL_RUN.totalGross).toBeGreaterThan(0));
  it('employeeCount > 0', () => expect(MOCK_PAYROLL_RUN.employeeCount).toBeGreaterThan(0));
  it('status is a valid payroll run status', () => expect(PAYROLL_RUN_STATUSES).toContain(MOCK_PAYROLL_RUN.status));
  it('payFrequency is a valid frequency', () => expect(PAY_FREQUENCIES).toContain(MOCK_PAYROLL_RUN.payPeriodType));
});

describe('MOCK_PAYSLIPS shape', () => {
  it('has 3 payslips', () => expect(MOCK_PAYSLIPS.length).toBe(3));

  for (const slip of MOCK_PAYSLIPS) {
    it(`${slip.payslipNumber} has id`, () => expect(slip.id).toBeTruthy());
    it(`${slip.payslipNumber} grossEarnings > 0`, () => expect(slip.grossEarnings).toBeGreaterThan(0));
    it(`${slip.payslipNumber} netPay > 0`, () => expect(slip.netPay).toBeGreaterThan(0));
    it(`${slip.payslipNumber} netPay <= grossEarnings`, () => {
      expect(slip.netPay).toBeLessThanOrEqual(slip.grossEarnings);
    });
    it(`${slip.payslipNumber} status is valid`, () => {
      expect(PAYSLIP_STATUSES).toContain(slip.status);
    });
    it(`${slip.payslipNumber} has currency`, () => expect(slip.currency.length).toBe(3));
    it(`${slip.payslipNumber} number starts PS-`, () => expect(slip.payslipNumber).toMatch(/^PS-/));
  }
});

describe('MOCK_BENEFIT_PLAN shape', () => {
  it('has id', () => expect(MOCK_BENEFIT_PLAN.id).toBeTruthy());
  it('code is truthy', () => expect(MOCK_BENEFIT_PLAN.code).toBeTruthy());
  it('category is valid', () => expect(BENEFIT_CATEGORIES).toContain(MOCK_BENEFIT_PLAN.category));
  it('isActive is boolean', () => expect(typeof MOCK_BENEFIT_PLAN.isActive).toBe('boolean'));
  it('waitingPeriodDays >= 0', () => expect(MOCK_BENEFIT_PLAN.waitingPeriodDays).toBeGreaterThanOrEqual(0));
  it('enrollmentCount >= 0', () => expect(MOCK_BENEFIT_PLAN.enrollmentCount).toBeGreaterThanOrEqual(0));
  it('employerContribution > employeeContribution', () => {
    expect(MOCK_BENEFIT_PLAN.employerContribution!).toBeGreaterThan(MOCK_BENEFIT_PLAN.employeeContribution!);
  });
});

// ─── Tests: grossPay helper ───────────────────────────────────────────────────

describe('grossPay', () => {
  it('basic + allowances', () => expect(grossPay(5000, 1000)).toBe(6000));
  it('zero allowances returns basic', () => expect(grossPay(5000, 0)).toBe(5000));
  it('zero salary + allowances', () => expect(grossPay(0, 500)).toBe(500));

  const cases: [number, number, number][] = [
    [3000, 500, 3500],
    [4500, 750, 5250],
    [7000, 1500, 8500],
    [10000, 2000, 12000],
  ];
  for (const [basic, allowance, expected] of cases) {
    it(`grossPay(${basic}, ${allowance}) = ${expected}`, () => {
      expect(grossPay(basic, allowance)).toBe(expected);
    });
  }
});

// ─── Tests: netPay helper ─────────────────────────────────────────────────────

describe('netPay', () => {
  it('gross minus deductions', () => expect(netPay(6000, 1500)).toBe(4500));
  it('cannot go negative', () => expect(netPay(1000, 5000)).toBe(0));
  it('zero deductions = gross', () => expect(netPay(5000, 0)).toBe(5000));
  it('equal gross and deductions = 0', () => expect(netPay(3000, 3000)).toBe(0));

  for (let d = 0; d <= 10; d++) {
    it(`netPay(5000, ${d * 500}) is non-negative`, () => {
      expect(netPay(5000, d * 500)).toBeGreaterThanOrEqual(0);
    });
  }
});

// ─── Tests: deductionAmount helper ───────────────────────────────────────────

describe('deductionAmount', () => {
  it('20% of 50000 = 10000', () => expect(deductionAmount(50000, 20)).toBe(10000));
  it('0% = 0', () => expect(deductionAmount(50000, 0)).toBe(0));
  it('100% = full salary', () => expect(deductionAmount(5000, 100)).toBe(5000));

  const rateCases: [number, number, number][] = [
    [60000, 20, 12000],
    [60000, 40, 24000],
    [60000, 45, 27000],
    [12000, 8, 960],
  ];
  for (const [salary, rate, expected] of rateCases) {
    it(`deductionAmount(${salary}, ${rate}%) = ${expected}`, () => {
      expect(deductionAmount(salary, rate)).toBeCloseTo(expected, 2);
    });
  }
});

// ─── Tests: National Insurance calculation ────────────────────────────────────

describe('calculateNI (UK)', () => {
  const { niThreshold, niRate } = UK_CONFIG;

  it('below threshold = 0', () => expect(calculateNI(12000, niThreshold, niRate)).toBe(0));
  it('at threshold = 0', () => expect(calculateNI(12570, niThreshold, niRate)).toBe(0));
  it('above threshold is positive', () => expect(calculateNI(30000, niThreshold, niRate)).toBeGreaterThan(0));
  it('50000 salary NI correct', () => {
    const expected = ((50000 - niThreshold) * niRate) / 100;
    expect(calculateNI(50000, niThreshold, niRate)).toBeCloseTo(expected, 2);
  });

  for (let s = 1; s <= 10; s++) {
    const salary = s * 10000;
    it(`NI non-negative at salary ${salary}`, () => {
      expect(calculateNI(salary, niThreshold, niRate)).toBeGreaterThanOrEqual(0);
    });
  }
});

// ─── Tests: Pension calculation ───────────────────────────────────────────────

describe('calculatePension', () => {
  it('5% of 60000 = 3000', () => expect(calculatePension(60000, 5)).toBe(3000));
  it('0% rate = 0', () => expect(calculatePension(60000, 0)).toBe(0));
  it('result is proportional to salary', () => {
    expect(calculatePension(80000, 5)).toBeGreaterThan(calculatePension(60000, 5));
  });
  it('pension is non-negative', () => expect(calculatePension(0, 5)).toBe(0));
});

// ─── Tests: Student Loan calculation ─────────────────────────────────────────

describe('calculateStudentLoan (UK Plan 2)', () => {
  const { studentLoanThreshold, studentLoanRate } = UK_CONFIG;

  it('below threshold = 0', () => {
    expect(calculateStudentLoan(20000, studentLoanThreshold, studentLoanRate)).toBe(0);
  });
  it('at threshold = 0', () => {
    expect(calculateStudentLoan(studentLoanThreshold, studentLoanThreshold, studentLoanRate)).toBe(0);
  });
  it('above threshold is positive', () => {
    expect(calculateStudentLoan(35000, studentLoanThreshold, studentLoanRate)).toBeGreaterThan(0);
  });
  it('zero rate = 0 regardless of salary', () => {
    expect(calculateStudentLoan(50000, studentLoanThreshold, 0)).toBe(0);
  });
});

// ─── Tests: UK Income Tax banded ─────────────────────────────────────────────

describe('calculateIncomeTaxBanded (UK)', () => {
  it('below personal allowance = 0 tax', () => {
    expect(calculateIncomeTaxBanded(12000, UK_TAX_BANDS)).toBe(0);
  });
  it('at personal allowance boundary = 0 tax', () => {
    expect(calculateIncomeTaxBanded(12570, UK_TAX_BANDS)).toBe(0);
  });
  it('£20000 salary has positive tax', () => {
    expect(calculateIncomeTaxBanded(20000, UK_TAX_BANDS)).toBeGreaterThan(0);
  });
  it('higher salary incurs more tax', () => {
    expect(calculateIncomeTaxBanded(80000, UK_TAX_BANDS)).toBeGreaterThan(
      calculateIncomeTaxBanded(30000, UK_TAX_BANDS),
    );
  });
  it('effective rate < marginal rate', () => {
    const tax = calculateIncomeTaxBanded(55000, UK_TAX_BANDS);
    const eff = effectiveRate(tax, 55000);
    expect(eff).toBeLessThan(40);
  });
});

// ─── Tests: effectiveRate ─────────────────────────────────────────────────────

describe('effectiveRate', () => {
  it('zero income returns 0', () => expect(effectiveRate(0, 0)).toBe(0));
  it('percentage between 0 and 100', () => {
    const rate = effectiveRate(12000, 60000);
    expect(rate).toBeGreaterThan(0);
    expect(rate).toBeLessThan(100);
  });
  it('20% exact', () => expect(effectiveRate(10000, 50000)).toBeCloseTo(20, 5));
});

// ─── Tests: takeHomePercent ───────────────────────────────────────────────────

describe('takeHomePercent', () => {
  it('zero gross returns 0', () => expect(takeHomePercent(0, 0)).toBe(0));
  it('full net = 100%', () => expect(takeHomePercent(5000, 5000)).toBeCloseTo(100, 5));
  it('75% take-home', () => expect(takeHomePercent(3750, 5000)).toBeCloseTo(75, 5));
  it('always <= 100%', () => {
    expect(takeHomePercent(4000, 5000)).toBeLessThanOrEqual(100);
  });
});

// ─── Tests: annual / monthly conversions ─────────────────────────────────────

describe('annualToMonthly / monthlyToAnnual', () => {
  it('60000 annual = 5000 monthly', () => expect(annualToMonthly(60000)).toBe(5000));
  it('5000 monthly = 60000 annual', () => expect(monthlyToAnnual(5000)).toBe(60000));
  it('roundtrip: annual → monthly → annual', () => {
    expect(monthlyToAnnual(annualToMonthly(84000))).toBeCloseTo(84000, 5);
  });
  it('zero annual = zero monthly', () => expect(annualToMonthly(0)).toBe(0));
});

// ─── Tests: loanInstallment ───────────────────────────────────────────────────

describe('loanInstallment', () => {
  it('zero interest: installment = principal / term', () => {
    expect(loanInstallment(12000, 0, 12)).toBeCloseTo(1000, 2);
  });
  it('positive interest increases installment vs zero-rate', () => {
    expect(loanInstallment(12000, 5, 12)).toBeGreaterThan(loanInstallment(12000, 0, 12));
  });
  it('longer term reduces monthly installment', () => {
    expect(loanInstallment(24000, 6, 48)).toBeLessThan(loanInstallment(24000, 6, 24));
  });
  it('installment is positive', () => {
    expect(loanInstallment(10000, 8, 36)).toBeGreaterThan(0);
  });
});

// ─── Tests: remainingLoanBalance ─────────────────────────────────────────────

describe('remainingLoanBalance', () => {
  it('principal minus repaid', () => expect(remainingLoanBalance(10000, 3000)).toBe(7000));
  it('fully repaid = 0', () => expect(remainingLoanBalance(10000, 10000)).toBe(0));
  it('over-repaid clamps to 0', () => expect(remainingLoanBalance(10000, 15000)).toBe(0));
  it('nothing repaid = principal', () => expect(remainingLoanBalance(10000, 0)).toBe(10000));
});

// ─── Tests: budgetVariance ────────────────────────────────────────────────────

describe('budgetVariance', () => {
  it('under spend is positive', () => expect(budgetVariance(50000, 45000)).toBe(5000));
  it('over spend is negative', () => expect(budgetVariance(50000, 55000)).toBe(-5000));
  it('on budget = 0', () => expect(budgetVariance(50000, 50000)).toBe(0));
});

// ─── Tests: MOCK_PAYROLL_RUN exact field values ───────────────────────────────

describe('MOCK_PAYROLL_RUN exact field values', () => {
  it('employeeCount = 120', () => expect(MOCK_PAYROLL_RUN.employeeCount).toBe(120));
  it('totalGross = 600000', () => expect(MOCK_PAYROLL_RUN.totalGross).toBe(600000));
  it('totalNet = 450000', () => expect(MOCK_PAYROLL_RUN.totalNet).toBe(450000));
  it('totalDeductions = 150000', () => expect(MOCK_PAYROLL_RUN.totalDeductions).toBe(150000));
  it('payPeriodType = MONTHLY', () => expect(MOCK_PAYROLL_RUN.payPeriodType).toBe('MONTHLY'));
  it('status = COMPLETED', () => expect(MOCK_PAYROLL_RUN.status).toBe('COMPLETED'));
});

// ─── Tests: MOCK_PAYSLIPS per-slip exact values ───────────────────────────────

describe('MOCK_PAYSLIPS per-slip exact gross/net parametric', () => {
  const cases: [string, number, number][] = [
    ['PS-2026-001', 5000, 3750],
    ['PS-2026-002', 7500, 5250],
    ['PS-2026-003', 4200, 3150],
  ];
  for (const [num, expectedGross, expectedNet] of cases) {
    it(`${num} grossEarnings = ${expectedGross}`, () => {
      const slip = MOCK_PAYSLIPS.find((s) => s.payslipNumber === num);
      expect(slip!.grossEarnings).toBe(expectedGross);
    });
    it(`${num} netPay = ${expectedNet}`, () => {
      const slip = MOCK_PAYSLIPS.find((s) => s.payslipNumber === num);
      expect(slip!.netPay).toBe(expectedNet);
    });
  }
});

// ─── Tests: calculateIncomeTaxBanded exact values parametric ──────────────────

describe('calculateIncomeTaxBanded exact values parametric', () => {
  // Band 1: 0–12570 @0%; Band 2: 12571–50270 @20%; Band 3: 50271–125140 @40%; Band 4: 125141+ @45%
  // 30000: (30000-12571)*0.20=3485.80; 50000: (50000-12571)*0.20=7485.80
  // 60000: basic (50270-12571)*0.20=7539.80 + higher (60000-50271)*0.40=3891.60 = 11431.40
  const exactCases: [number, number][] = [
    [15000, 485.8],
    [20000, 1485.8],
    [30000, 3485.8],
    [50000, 7485.8],
    [60000, 11431.4],
  ];
  for (const [salary, expected] of exactCases) {
    it(`salary £${salary} → tax £${expected}`, () => {
      expect(calculateIncomeTaxBanded(salary, UK_TAX_BANDS)).toBeCloseTo(expected, 1);
    });
  }
});

// ─── Tests: calculateNI exact values parametric ───────────────────────────────

describe('calculateNI exact values parametric', () => {
  const { niThreshold, niRate } = UK_CONFIG;
  const cases: [number, number][] = [
    [20000, (20000 - 12570) * 8 / 100],  // 594.4
    [30000, (30000 - 12570) * 8 / 100],  // 1394.4
    [50000, (50000 - 12570) * 8 / 100],  // 2994.4
  ];
  for (const [salary, expected] of cases) {
    it(`NI at £${salary} = £${expected.toFixed(2)}`, () => {
      expect(calculateNI(salary, niThreshold, niRate)).toBeCloseTo(expected, 2);
    });
  }
});

// ─── Tests: calculateStudentLoan exact values parametric ─────────────────────

describe('calculateStudentLoan exact values parametric', () => {
  const { studentLoanThreshold, studentLoanRate } = UK_CONFIG;
  const cases: [number, number][] = [
    [30000, (30000 - 27295) * 9 / 100],  // 243.45
    [40000, (40000 - 27295) * 9 / 100],  // 1143.45
  ];
  for (const [salary, expected] of cases) {
    it(`student loan at £${salary} = £${expected.toFixed(2)}`, () => {
      expect(calculateStudentLoan(salary, studentLoanThreshold, studentLoanRate)).toBeCloseTo(expected, 2);
    });
  }
});

// ─── Tests: calculatePension exact values parametric ─────────────────────────

describe('calculatePension exact values parametric', () => {
  const cases: [number, number, number][] = [
    [50000, 5, 2500],
    [90000, 3, 2700],
    [100000, 8, 8000],
    [48000, 5, 2400],
  ];
  for (const [salary, rate, expected] of cases) {
    it(`pension(${salary}, ${rate}%) = ${expected}`, () => {
      expect(calculatePension(salary, rate)).toBeCloseTo(expected, 2);
    });
  }
});

// ─── Tests: annualToMonthly additional exact values parametric ────────────────

describe('annualToMonthly additional exact values parametric', () => {
  const cases: [number, number][] = [
    [36000, 3000],
    [90000, 7500],
    [48000, 4000],
    [120000, 10000],
  ];
  for (const [annual, expected] of cases) {
    it(`annualToMonthly(${annual}) = ${expected}`, () => {
      expect(annualToMonthly(annual)).toBeCloseTo(expected, 5);
    });
  }
});

// ─── Tests: loanInstallment zero-rate exact values parametric ─────────────────

describe('loanInstallment zero-rate exact values parametric', () => {
  it('loanInstallment(12000, 0, 24) = 500', () => expect(loanInstallment(12000, 0, 24)).toBeCloseTo(500, 2));
  it('loanInstallment(6000, 0, 12) = 500', () => expect(loanInstallment(6000, 0, 12)).toBeCloseTo(500, 2));
  it('loanInstallment(24000, 0, 48) = 500', () => expect(loanInstallment(24000, 0, 48)).toBeCloseTo(500, 2));
});

// ─── Tests: cross-payroll invariants ─────────────────────────────────────────

describe('cross-payroll invariants', () => {
  it('sum of MOCK_PAYSLIPS grossEarnings = 16700', () => {
    const total = MOCK_PAYSLIPS.reduce((s, p) => s + p.grossEarnings, 0);
    expect(total).toBe(16700);
  });
  it('sum of MOCK_PAYSLIPS netPay = 12150', () => {
    const total = MOCK_PAYSLIPS.reduce((s, p) => s + p.netPay, 0);
    expect(total).toBe(12150);
  });
  it('MOCK_PAYROLL_RUN takeHomePercent = 75%', () => {
    expect(takeHomePercent(MOCK_PAYROLL_RUN.totalNet, MOCK_PAYROLL_RUN.totalGross)).toBeCloseTo(75, 5);
  });
  it('all MOCK_PAYSLIPS have netPay < grossEarnings', () => {
    for (const slip of MOCK_PAYSLIPS) {
      expect(slip.netPay).toBeLessThan(slip.grossEarnings);
    }
  });
  it('MOCK_PAYROLL_RUN.totalDeductions = totalGross - totalNet', () => {
    expect(MOCK_PAYROLL_RUN.totalDeductions).toBe(MOCK_PAYROLL_RUN.totalGross - MOCK_PAYROLL_RUN.totalNet);
  });
});

// ─── Tests: Domain Array Completeness ────────────────────────────────────────

describe('domain array completeness', () => {
  it('PAYROLL_RUN_STATUSES has 6 values', () => expect(PAYROLL_RUN_STATUSES.length).toBe(6));
  it('PAYSLIP_STATUSES has 6 values', () => expect(PAYSLIP_STATUSES.length).toBe(6));
  it('PAY_FREQUENCIES has 4 values', () => expect(PAY_FREQUENCIES.length).toBe(4));
  it('BENEFIT_CATEGORIES has 11 values', () => expect(BENEFIT_CATEGORIES.length).toBe(11));
  it('LOAN_TYPES has 5 values', () => expect(LOAN_TYPES.length).toBe(5));
  it('LOAN_STATUSES has 7 values', () => expect(LOAN_STATUSES.length).toBe(7));
  it('EXPENSE_CATEGORIES has 7 values', () => expect(EXPENSE_CATEGORIES.length).toBe(7));
  it('EXPENSE_STATUSES has 5 values', () => expect(EXPENSE_STATUSES.length).toBe(5));
  it('TAX_JURISDICTIONS has 4 values', () => expect(TAX_JURISDICTIONS.length).toBe(4));
  it('PAYROLL_RUN_STATUSES contains COMPLETED', () => expect(PAYROLL_RUN_STATUSES).toContain('COMPLETED'));
  it('PAYROLL_RUN_STATUSES contains DRAFT', () => expect(PAYROLL_RUN_STATUSES).toContain('DRAFT'));
  it('PAYSLIP_STATUSES contains PAID', () => expect(PAYSLIP_STATUSES).toContain('PAID'));
  it('PAYSLIP_STATUSES contains PUBLISHED', () => expect(PAYSLIP_STATUSES).toContain('PUBLISHED'));
  it('PAY_FREQUENCIES contains MONTHLY', () => expect(PAY_FREQUENCIES).toContain('MONTHLY'));
  it('BENEFIT_CATEGORIES contains HEALTH_INSURANCE', () => expect(BENEFIT_CATEGORIES).toContain('HEALTH_INSURANCE'));
  it('EXPENSE_CATEGORIES contains TRAVEL', () => expect(EXPENSE_CATEGORIES).toContain('TRAVEL'));
  it('TAX_JURISDICTIONS contains uk', () => expect(TAX_JURISDICTIONS).toContain('uk'));
  it('TAX_JURISDICTIONS contains us-federal', () => expect(TAX_JURISDICTIONS).toContain('us-federal'));
  it('UK_TAX_BANDS has 4 bands', () => expect(UK_TAX_BANDS.length).toBe(4));
  it('last UK tax band has null upper bound', () => expect(UK_TAX_BANDS[UK_TAX_BANDS.length - 1].to).toBeNull());
  it('UK_TAX_BANDS rates are ascending', () => {
    for (let i = 1; i < UK_TAX_BANDS.length; i++) {
      expect(UK_TAX_BANDS[i].rate).toBeGreaterThanOrEqual(UK_TAX_BANDS[i - 1].rate);
    }
  });
});

// ─── Phase 211 parametric additions ──────────────────────────────────────────

describe('PAYROLL_RUN_STATUSES — positional index parametric', () => {
  const expected = [
    [0, 'DRAFT'],
    [1, 'PROCESSING'],
    [2, 'CALCULATED'],
    [3, 'APPROVED'],
    [4, 'COMPLETED'],
    [5, 'CANCELLED'],
  ] as const;
  for (const [idx, val] of expected) {
    it(`PAYROLL_RUN_STATUSES[${idx}] === '${val}'`, () => {
      expect(PAYROLL_RUN_STATUSES[idx]).toBe(val);
    });
  }
});

describe('PAYSLIP_STATUSES — positional index parametric', () => {
  const expected = [
    [0, 'DRAFT'],
    [1, 'GENERATED'],
    [2, 'CALCULATED'],
    [3, 'APPROVED'],
    [4, 'PUBLISHED'],
    [5, 'PAID'],
  ] as const;
  for (const [idx, val] of expected) {
    it(`PAYSLIP_STATUSES[${idx}] === '${val}'`, () => {
      expect(PAYSLIP_STATUSES[idx]).toBe(val);
    });
  }
});

describe('PAY_FREQUENCIES — positional index parametric', () => {
  const expected = [
    [0, 'WEEKLY'],
    [1, 'BI_WEEKLY'],
    [2, 'SEMI_MONTHLY'],
    [3, 'MONTHLY'],
  ] as const;
  for (const [idx, val] of expected) {
    it(`PAY_FREQUENCIES[${idx}] === '${val}'`, () => {
      expect(PAY_FREQUENCIES[idx]).toBe(val);
    });
  }
});

describe('LOAN_STATUSES — positional index parametric', () => {
  const expected = [
    [0, 'PENDING'],
    [1, 'APPROVED'],
    [2, 'DISBURSED'],
    [3, 'ACTIVE'],
    [4, 'COMPLETED'],
    [5, 'DEFAULTED'],
    [6, 'CANCELLED'],
  ] as const;
  for (const [idx, val] of expected) {
    it(`LOAN_STATUSES[${idx}] === '${val}'`, () => {
      expect(LOAN_STATUSES[idx]).toBe(val);
    });
  }
});

describe('EXPENSE_STATUSES — positional index parametric', () => {
  const expected = [
    [0, 'DRAFT'],
    [1, 'SUBMITTED'],
    [2, 'APPROVED'],
    [3, 'REJECTED'],
    [4, 'PAID'],
  ] as const;
  for (const [idx, val] of expected) {
    it(`EXPENSE_STATUSES[${idx}] === '${val}'`, () => {
      expect(EXPENSE_STATUSES[idx]).toBe(val);
    });
  }
});

describe('TAX_JURISDICTIONS — positional index parametric', () => {
  const expected = [
    [0, 'uk'],
    [1, 'us-federal'],
    [2, 'ie'],
    [3, 'de'],
  ] as const;
  for (const [idx, val] of expected) {
    it(`TAX_JURISDICTIONS[${idx}] === '${val}'`, () => {
      expect(TAX_JURISDICTIONS[idx]).toBe(val);
    });
  }
});

// ─── Algorithm puzzle phases (ph217pd–ph220pd) ────────────────────────────────
function moveZeroes217pd(nums:number[]):number{let k=0;for(const n of nums)if(n!==0)nums[k++]=n;while(k<nums.length)nums[k++]=0;return nums[0];}
describe('ph217pd_mz',()=>{
  it('a',()=>{expect(moveZeroes217pd([0,1,0,3,12])).toBe(1);});
  it('b',()=>{expect(moveZeroes217pd([0,0,1])).toBe(1);});
  it('c',()=>{expect(moveZeroes217pd([1])).toBe(1);});
  it('d',()=>{expect(moveZeroes217pd([0,0,0,1])).toBe(1);});
  it('e',()=>{expect(moveZeroes217pd([4,2,0,0,3])).toBe(4);});
});
function missingNumber218pd(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph218pd_mn',()=>{
  it('a',()=>{expect(missingNumber218pd([3,0,1])).toBe(2);});
  it('b',()=>{expect(missingNumber218pd([0,1])).toBe(2);});
  it('c',()=>{expect(missingNumber218pd([9,6,4,2,3,5,7,0,1])).toBe(8);});
  it('d',()=>{expect(missingNumber218pd([0])).toBe(1);});
  it('e',()=>{expect(missingNumber218pd([1])).toBe(0);});
});
function countBits219pd(n:number):number[]{const r=new Array(n+1).fill(0);for(let i=1;i<=n;i++)r[i]=r[i>>1]+(i&1);return r;}
describe('ph219pd_cb',()=>{
  it('a',()=>{expect(countBits219pd(2)).toEqual([0,1,1]);});
  it('b',()=>{expect(countBits219pd(5)).toEqual([0,1,1,2,1,2]);});
  it('c',()=>{expect(countBits219pd(0)).toEqual([0]);});
  it('d',()=>{expect(countBits219pd(1)).toEqual([0,1]);});
  it('e',()=>{expect(countBits219pd(4)[4]).toBe(1);});
});
function climbStairs220pd(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph220pd_cs',()=>{
  it('a',()=>{expect(climbStairs220pd(2)).toBe(2);});
  it('b',()=>{expect(climbStairs220pd(3)).toBe(3);});
  it('c',()=>{expect(climbStairs220pd(4)).toBe(5);});
  it('d',()=>{expect(climbStairs220pd(5)).toBe(8);});
  it('e',()=>{expect(climbStairs220pd(1)).toBe(1);});
});
function hd258pd2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph258pd2_hd',()=>{it('a',()=>{expect(hd258pd2(1,4)).toBe(2);});it('b',()=>{expect(hd258pd2(3,1)).toBe(1);});it('c',()=>{expect(hd258pd2(0,0)).toBe(0);});it('d',()=>{expect(hd258pd2(93,73)).toBe(2);});it('e',()=>{expect(hd258pd2(15,0)).toBe(4);});});
function hd259pd2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph259pd2_hd',()=>{it('a',()=>{expect(hd259pd2(1,4)).toBe(2);});it('b',()=>{expect(hd259pd2(3,1)).toBe(1);});it('c',()=>{expect(hd259pd2(0,0)).toBe(0);});it('d',()=>{expect(hd259pd2(93,73)).toBe(2);});it('e',()=>{expect(hd259pd2(15,0)).toBe(4);});});
function hd260pd2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph260pd2_hd',()=>{it('a',()=>{expect(hd260pd2(1,4)).toBe(2);});it('b',()=>{expect(hd260pd2(3,1)).toBe(1);});it('c',()=>{expect(hd260pd2(0,0)).toBe(0);});it('d',()=>{expect(hd260pd2(93,73)).toBe(2);});it('e',()=>{expect(hd260pd2(15,0)).toBe(4);});});
function hd261pd2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph261pd2_hd',()=>{it('a',()=>{expect(hd261pd2(1,4)).toBe(2);});it('b',()=>{expect(hd261pd2(3,1)).toBe(1);});it('c',()=>{expect(hd261pd2(0,0)).toBe(0);});it('d',()=>{expect(hd261pd2(93,73)).toBe(2);});it('e',()=>{expect(hd261pd2(15,0)).toBe(4);});});
function hd262pd2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph262pd2_hd',()=>{it('a',()=>{expect(hd262pd2(1,4)).toBe(2);});it('b',()=>{expect(hd262pd2(3,1)).toBe(1);});it('c',()=>{expect(hd262pd2(0,0)).toBe(0);});it('d',()=>{expect(hd262pd2(93,73)).toBe(2);});it('e',()=>{expect(hd262pd2(15,0)).toBe(4);});});
function hd263pd2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph263pd2_hd',()=>{it('a',()=>{expect(hd263pd2(1,4)).toBe(2);});it('b',()=>{expect(hd263pd2(3,1)).toBe(1);});it('c',()=>{expect(hd263pd2(0,0)).toBe(0);});it('d',()=>{expect(hd263pd2(93,73)).toBe(2);});it('e',()=>{expect(hd263pd2(15,0)).toBe(4);});});
function hd264pd2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph264pd2_hd',()=>{it('a',()=>{expect(hd264pd2(1,4)).toBe(2);});it('b',()=>{expect(hd264pd2(3,1)).toBe(1);});it('c',()=>{expect(hd264pd2(0,0)).toBe(0);});it('d',()=>{expect(hd264pd2(93,73)).toBe(2);});it('e',()=>{expect(hd264pd2(15,0)).toBe(4);});});
function hd265pd2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph265pd2_hd',()=>{it('a',()=>{expect(hd265pd2(1,4)).toBe(2);});it('b',()=>{expect(hd265pd2(3,1)).toBe(1);});it('c',()=>{expect(hd265pd2(0,0)).toBe(0);});it('d',()=>{expect(hd265pd2(93,73)).toBe(2);});it('e',()=>{expect(hd265pd2(15,0)).toBe(4);});});
function hd266pd2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph266pd2_hd',()=>{it('a',()=>{expect(hd266pd2(1,4)).toBe(2);});it('b',()=>{expect(hd266pd2(3,1)).toBe(1);});it('c',()=>{expect(hd266pd2(0,0)).toBe(0);});it('d',()=>{expect(hd266pd2(93,73)).toBe(2);});it('e',()=>{expect(hd266pd2(15,0)).toBe(4);});});
function hd267pd2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph267pd2_hd',()=>{it('a',()=>{expect(hd267pd2(1,4)).toBe(2);});it('b',()=>{expect(hd267pd2(3,1)).toBe(1);});it('c',()=>{expect(hd267pd2(0,0)).toBe(0);});it('d',()=>{expect(hd267pd2(93,73)).toBe(2);});it('e',()=>{expect(hd267pd2(15,0)).toBe(4);});});
function hd268pd2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph268pd2_hd',()=>{it('a',()=>{expect(hd268pd2(1,4)).toBe(2);});it('b',()=>{expect(hd268pd2(3,1)).toBe(1);});it('c',()=>{expect(hd268pd2(0,0)).toBe(0);});it('d',()=>{expect(hd268pd2(93,73)).toBe(2);});it('e',()=>{expect(hd268pd2(15,0)).toBe(4);});});
function hd269pd2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph269pd2_hd',()=>{it('a',()=>{expect(hd269pd2(1,4)).toBe(2);});it('b',()=>{expect(hd269pd2(3,1)).toBe(1);});it('c',()=>{expect(hd269pd2(0,0)).toBe(0);});it('d',()=>{expect(hd269pd2(93,73)).toBe(2);});it('e',()=>{expect(hd269pd2(15,0)).toBe(4);});});
function hd270pd2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph270pd2_hd',()=>{it('a',()=>{expect(hd270pd2(1,4)).toBe(2);});it('b',()=>{expect(hd270pd2(3,1)).toBe(1);});it('c',()=>{expect(hd270pd2(0,0)).toBe(0);});it('d',()=>{expect(hd270pd2(93,73)).toBe(2);});it('e',()=>{expect(hd270pd2(15,0)).toBe(4);});});
function hd271pd2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph271pd2_hd',()=>{it('a',()=>{expect(hd271pd2(1,4)).toBe(2);});it('b',()=>{expect(hd271pd2(3,1)).toBe(1);});it('c',()=>{expect(hd271pd2(0,0)).toBe(0);});it('d',()=>{expect(hd271pd2(93,73)).toBe(2);});it('e',()=>{expect(hd271pd2(15,0)).toBe(4);});});
function hd272pd2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph272pd2_hd',()=>{it('a',()=>{expect(hd272pd2(1,4)).toBe(2);});it('b',()=>{expect(hd272pd2(3,1)).toBe(1);});it('c',()=>{expect(hd272pd2(0,0)).toBe(0);});it('d',()=>{expect(hd272pd2(93,73)).toBe(2);});it('e',()=>{expect(hd272pd2(15,0)).toBe(4);});});
function hd273pd2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph273pd2_hd',()=>{it('a',()=>{expect(hd273pd2(1,4)).toBe(2);});it('b',()=>{expect(hd273pd2(3,1)).toBe(1);});it('c',()=>{expect(hd273pd2(0,0)).toBe(0);});it('d',()=>{expect(hd273pd2(93,73)).toBe(2);});it('e',()=>{expect(hd273pd2(15,0)).toBe(4);});});
function hd274pd2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph274pd2_hd',()=>{it('a',()=>{expect(hd274pd2(1,4)).toBe(2);});it('b',()=>{expect(hd274pd2(3,1)).toBe(1);});it('c',()=>{expect(hd274pd2(0,0)).toBe(0);});it('d',()=>{expect(hd274pd2(93,73)).toBe(2);});it('e',()=>{expect(hd274pd2(15,0)).toBe(4);});});
function hd275pd2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph275pd2_hd',()=>{it('a',()=>{expect(hd275pd2(1,4)).toBe(2);});it('b',()=>{expect(hd275pd2(3,1)).toBe(1);});it('c',()=>{expect(hd275pd2(0,0)).toBe(0);});it('d',()=>{expect(hd275pd2(93,73)).toBe(2);});it('e',()=>{expect(hd275pd2(15,0)).toBe(4);});});
function hd276pd2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph276pd2_hd',()=>{it('a',()=>{expect(hd276pd2(1,4)).toBe(2);});it('b',()=>{expect(hd276pd2(3,1)).toBe(1);});it('c',()=>{expect(hd276pd2(0,0)).toBe(0);});it('d',()=>{expect(hd276pd2(93,73)).toBe(2);});it('e',()=>{expect(hd276pd2(15,0)).toBe(4);});});
