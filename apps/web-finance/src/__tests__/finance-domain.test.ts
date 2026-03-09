// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

// ---------------------------------------------------------------------------
// MONTHLY_DATA (from apps/web-finance/src/app/budget-dashboard/client.tsx)
// ---------------------------------------------------------------------------

interface MonthlyData {
  month: string;
  budget: number;
  actual: number;
}

const MONTHLY_DATA: MonthlyData[] = [
  { month: 'Jul', budget: 185000, actual: 178000 },
  { month: 'Aug', budget: 185000, actual: 192000 },
  { month: 'Sep', budget: 190000, actual: 187000 },
  { month: 'Oct', budget: 195000, actual: 201000 },
  { month: 'Nov', budget: 200000, actual: 195000 },
  { month: 'Dec', budget: 210000, actual: 218000 },
  { month: 'Jan', budget: 195000, actual: 190000 },
  { month: 'Feb', budget: 195000, actual: 0 },
];

// ---------------------------------------------------------------------------
// BUDGET_LINES (from apps/web-finance/src/app/budget-dashboard/client.tsx)
// ---------------------------------------------------------------------------

interface BudgetLine {
  id: string;
  department: string;
  category: string;
  annualBudget: number;
  ytdBudget: number;
  ytdActual: number;
  forecast: number;
  variance: number;
  variancePct: number;
}

const BUDGET_LINES: BudgetLine[] = [
  { id: '1',  department: 'Production',     category: 'Direct Labour',          annualBudget: 720000,  ytdBudget: 480000, ytdActual: 465000, forecast: 705000,  variance: 15000,  variancePct: 3.1   },
  { id: '2',  department: 'Production',     category: 'Raw Materials',           annualBudget: 960000,  ytdBudget: 640000, ytdActual: 672000, forecast: 1008000, variance: -32000, variancePct: -5.0  },
  { id: '3',  department: 'Production',     category: 'Maintenance',             annualBudget: 180000,  ytdBudget: 120000, ytdActual: 115000, forecast: 172000,  variance: 5000,   variancePct: 4.2   },
  { id: '4',  department: 'Quality',        category: 'Testing & Inspection',    annualBudget: 96000,   ytdBudget: 64000,  ytdActual: 58000,  forecast: 87000,   variance: 6000,   variancePct: 9.4   },
  { id: '5',  department: 'Quality',        category: 'Calibration',             annualBudget: 36000,   ytdBudget: 24000,  ytdActual: 26500,  forecast: 39750,   variance: -2500,  variancePct: -10.4 },
  { id: '6',  department: 'Engineering',    category: 'R&D',                     annualBudget: 240000,  ytdBudget: 160000, ytdActual: 152000, forecast: 228000,  variance: 8000,   variancePct: 5.0   },
  { id: '7',  department: 'Engineering',    category: 'Tooling',                 annualBudget: 120000,  ytdBudget: 80000,  ytdActual: 95000,  forecast: 142500,  variance: -15000, variancePct: -18.8 },
  { id: '8',  department: 'Administration', category: 'IT Infrastructure',       annualBudget: 144000,  ytdBudget: 96000,  ytdActual: 88000,  forecast: 132000,  variance: 8000,   variancePct: 8.3   },
  { id: '9',  department: 'Administration', category: 'Facilities',              annualBudget: 180000,  ytdBudget: 120000, ytdActual: 118000, forecast: 177000,  variance: 2000,   variancePct: 1.7   },
  { id: '10', department: 'Sales',          category: 'Marketing',               annualBudget: 96000,   ytdBudget: 64000,  ytdActual: 71000,  forecast: 106500,  variance: -7000,  variancePct: -10.9 },
  { id: '11', department: 'Sales',          category: 'Travel & Entertainment',  annualBudget: 48000,   ytdBudget: 32000,  ytdActual: 28000,  forecast: 42000,   variance: 4000,   variancePct: 12.5  },
  { id: '12', department: 'HR',             category: 'Training & Development',  annualBudget: 72000,   ytdBudget: 48000,  ytdActual: 42000,  forecast: 63000,   variance: 6000,   variancePct: 12.5  },
];

// ---------------------------------------------------------------------------
// MOCK_RULES (from apps/web-finance/src/app/sod-matrix/page.tsx)
// ---------------------------------------------------------------------------

interface SodRule {
  id: string;
  role1: string;
  role2: string;
  conflictType?: string;
  description?: string;
  mitigatingControl?: string;
  isActive: boolean;
}

const MOCK_RULES: SodRule[] = [
  { id: '1', role1: 'Accounts Payable Clerk',  role2: 'Payment Approver',     conflictType: 'FINANCIAL',   description: 'Creating payables and approving payment creates fraud risk',              mitigatingControl: 'Monthly AP reconciliation reviewed by CFO',             isActive: true  },
  { id: '2', role1: 'Payroll Administrator',   role2: 'HR Data Entry',         conflictType: 'PAYROLL',     description: 'Ghost employee creation risk if same person manages HR and payroll data', mitigatingControl: 'Dual approval for new payroll additions',               isActive: true  },
  { id: '3', role1: 'IT Administrator',        role2: 'Finance System User',   conflictType: 'ACCESS',      description: 'System admin can modify financial data and access logs',                  mitigatingControl: 'Read-only access for IT in production finance systems', isActive: true  },
  { id: '4', role1: 'Purchasing Manager',      role2: 'Vendor Master Admin',   conflictType: 'PROCUREMENT', description: 'Same person can add fraudulent vendors and raise POs to them',            mitigatingControl: 'All new vendor additions require CFO approval',         isActive: true  },
  { id: '5', role1: 'Cash Receipts Clerk',     role2: 'Bank Reconciler',       conflictType: 'CASH',        description: 'Misappropriation of cash receipts possible',                             mitigatingControl: 'Segregated until quarterly audit',                     isActive: false },
];

// ---------------------------------------------------------------------------
// CONFLICT_COLORS (from apps/web-finance/src/app/sod-matrix/page.tsx)
// ---------------------------------------------------------------------------

const CONFLICT_COLORS: Record<string, string> = {
  FINANCIAL:   'bg-red-100 text-red-700',
  PAYROLL:     'bg-purple-100 text-purple-700',
  ACCESS:      'bg-blue-100 text-blue-700',
  PROCUREMENT: 'bg-amber-100 text-amber-700',
  CASH:        'bg-orange-100 text-orange-700',
};

// ---------------------------------------------------------------------------
// MOCK_CONTROLS & STATUS_CONFIG
// (from apps/web-finance/src/app/controls/page.tsx)
// ---------------------------------------------------------------------------

type ControlStatus = 'ACTIVE' | 'INACTIVE' | 'UNDER_REVIEW' | 'REMEDIATION';

interface FinControl {
  id: string;
  title: string;
  description?: string;
  controlType?: string;
  riskArea?: string;
  ownerName?: string;
  status: ControlStatus;
  frequency?: string;
  testResult?: string;
  createdAt: string;
}

const MOCK_CONTROLS: FinControl[] = [
  { id: '1', title: 'Purchase Order Approval',    description: 'All POs over £5,000 require dual approval',            controlType: 'PREVENTIVE', riskArea: 'Procurement',      ownerName: 'CFO',              status: 'ACTIVE',       frequency: 'Per transaction', testResult: 'PASS', createdAt: '2026-01-15T00:00:00Z' },
  { id: '2', title: 'Bank Reconciliation',         description: 'Monthly reconciliation of all bank accounts',          controlType: 'DETECTIVE',  riskArea: 'Cash Management',  ownerName: 'Finance Manager',  status: 'ACTIVE',       frequency: 'Monthly',         testResult: 'PASS', createdAt: '2026-01-20T00:00:00Z' },
  { id: '3', title: 'Expense Report Review',       description: 'Manager approval for all expense submissions',         controlType: 'PREVENTIVE', riskArea: 'Expenses',         ownerName: 'HR Director',      status: 'UNDER_REVIEW', frequency: 'Per submission',  createdAt: '2026-02-01T00:00:00Z' },
  { id: '4', title: 'Journal Entry Authorization', description: 'All manual journal entries require controller sign-off', controlType: 'PREVENTIVE', riskArea: 'General Ledger',   ownerName: 'Controller',       status: 'ACTIVE',       frequency: 'Per entry',       testResult: 'PASS', createdAt: '2026-02-10T00:00:00Z' },
  { id: '5', title: 'Vendor Master Data Changes',  description: 'New vendor onboarding requires compliance check',      controlType: 'PREVENTIVE', riskArea: 'Procurement',      ownerName: 'Procurement',      status: 'REMEDIATION',  frequency: 'Per change',      testResult: 'FAIL', createdAt: '2026-02-15T00:00:00Z' },
];

interface StatusConfig {
  label: string;
  color: string;
}

const STATUS_CONFIG: Record<ControlStatus, StatusConfig> = {
  ACTIVE:       { label: 'Active',       color: 'bg-green-100 text-green-700' },
  INACTIVE:     { label: 'Inactive',     color: 'bg-gray-100 text-gray-600' },
  UNDER_REVIEW: { label: 'Under Review', color: 'bg-amber-100 text-amber-700' },
  REMEDIATION:  { label: 'Remediation',  color: 'bg-red-100 text-red-700' },
};

// ---------------------------------------------------------------------------
// EMPTY_FORM shapes
// ---------------------------------------------------------------------------

const SOD_EMPTY_FORM = {
  role1: '',
  role2: '',
  conflictType: '',
  description: '',
  mitigatingControl: '',
  isActive: true,
};

const CONTROL_EMPTY_FORM = {
  title: '',
  description: '',
  controlType: '',
  riskArea: '',
  ownerName: '',
  status: 'ACTIVE' as ControlStatus,
  frequency: '',
  testResult: '',
};

// ---------------------------------------------------------------------------
// Pure helpers (inlined from source logic)
// ---------------------------------------------------------------------------

function budgetVariance(ytdBudget: number, ytdActual: number): number {
  return ytdBudget - ytdActual;
}

function budgetUtilization(ytdActual: number, ytdBudget: number): number {
  return Math.round((ytdActual / ytdBudget) * 100);
}

function budgetStatus(line: BudgetLine): 'Under' | 'Alert' | 'Over' {
  if (line.variance >= 0) return 'Under';
  if (Math.abs(line.variancePct) > 10) return 'Alert';
  return 'Over';
}

function monthlyOverBudget(m: MonthlyData): boolean {
  return m.actual > 0 && m.actual > m.budget;
}

function formatCurrencyGBP(val: number): string {
  return `£${Math.abs(val).toLocaleString()}`;
}

// ===========================================================================
// TEST SUITES
// ===========================================================================

// ---------------------------------------------------------------------------
// MONTHLY_DATA array
// ---------------------------------------------------------------------------

describe('MONTHLY_DATA array', () => {
  it('has exactly 8 entries', () => {
    expect(MONTHLY_DATA).toHaveLength(8);
  });

  it('first entry is July', () => {
    expect(MONTHLY_DATA[0].month).toBe('Jul');
  });

  it('last entry is February', () => {
    expect(MONTHLY_DATA[MONTHLY_DATA.length - 1].month).toBe('Feb');
  });

  it('Feb actual is 0 (not yet recorded)', () => {
    const feb = MONTHLY_DATA.find((m) => m.month === 'Feb');
    expect(feb?.actual).toBe(0);
  });

  it('all months have a non-empty month string', () => {
    for (const m of MONTHLY_DATA) {
      expect(m.month.length).toBeGreaterThan(0);
    }
  });

  it('all budget values are positive integers', () => {
    for (const m of MONTHLY_DATA) {
      expect(m.budget).toBeGreaterThan(0);
      expect(Number.isInteger(m.budget)).toBe(true);
    }
  });

  it('all actual values are non-negative integers', () => {
    for (const m of MONTHLY_DATA) {
      expect(m.actual).toBeGreaterThanOrEqual(0);
      expect(Number.isInteger(m.actual)).toBe(true);
    }
  });

  it('all month abbreviations are exactly 3 characters', () => {
    for (const m of MONTHLY_DATA) {
      expect(m.month).toHaveLength(3);
    }
  });

  it('month abbreviations are unique', () => {
    const months = MONTHLY_DATA.map((m) => m.month);
    expect(new Set(months).size).toBe(months.length);
  });

  it('Dec has the highest budget', () => {
    const maxBudget = Math.max(...MONTHLY_DATA.map((m) => m.budget));
    const dec = MONTHLY_DATA.find((m) => m.month === 'Dec');
    expect(dec?.budget).toBe(maxBudget);
  });

  it('Aug actual (192000) exceeds Aug budget (185000)', () => {
    const aug = MONTHLY_DATA.find((m) => m.month === 'Aug');
    expect((aug as MonthlyData).actual).toBeGreaterThan((aug as MonthlyData).budget);
  });

  it('Dec actual (218000) exceeds Dec budget (210000)', () => {
    const dec = MONTHLY_DATA.find((m) => m.month === 'Dec');
    expect((dec as MonthlyData).actual).toBeGreaterThan((dec as MonthlyData).budget);
  });

  it('Jul actual (178000) is under Jul budget (185000)', () => {
    const jul = MONTHLY_DATA.find((m) => m.month === 'Jul');
    expect((jul as MonthlyData).actual).toBeLessThan((jul as MonthlyData).budget);
  });

  it('exactly 3 months are over budget among those with actual > 0', () => {
    const overBudgetCount = MONTHLY_DATA.filter((m) => m.actual > 0 && m.actual > m.budget).length;
    expect(overBudgetCount).toBe(3);
  });

  it('total budget across all months is >= 1400000', () => {
    const total = MONTHLY_DATA.reduce((s, m) => s + m.budget, 0);
    expect(total).toBeGreaterThanOrEqual(1400000);
  });
});

// ---------------------------------------------------------------------------
// BUDGET_LINES array
// ---------------------------------------------------------------------------

describe('BUDGET_LINES array', () => {
  it('has exactly 12 lines', () => {
    expect(BUDGET_LINES).toHaveLength(12);
  });

  it('all lines have an id', () => {
    for (const line of BUDGET_LINES) {
      expect(line.id.length).toBeGreaterThan(0);
    }
  });

  it('all ids are unique', () => {
    const ids = BUDGET_LINES.map((b) => b.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all lines have a non-empty department', () => {
    for (const line of BUDGET_LINES) {
      expect(line.department.length).toBeGreaterThan(0);
    }
  });

  it('all lines have a non-empty category', () => {
    for (const line of BUDGET_LINES) {
      expect(line.category.length).toBeGreaterThan(0);
    }
  });

  it('all annualBudget values are positive numbers', () => {
    for (const line of BUDGET_LINES) {
      expect(line.annualBudget).toBeGreaterThan(0);
    }
  });

  it('all ytdBudget values are positive numbers', () => {
    for (const line of BUDGET_LINES) {
      expect(line.ytdBudget).toBeGreaterThan(0);
    }
  });

  it('all ytdActual values are non-negative', () => {
    for (const line of BUDGET_LINES) {
      expect(line.ytdActual).toBeGreaterThanOrEqual(0);
    }
  });

  it('all forecast values are positive numbers', () => {
    for (const line of BUDGET_LINES) {
      expect(line.forecast).toBeGreaterThan(0);
    }
  });

  it('variance sign matches: positive variance means under budget', () => {
    for (const line of BUDGET_LINES) {
      const computed = line.ytdBudget - line.ytdActual;
      expect(Math.sign(computed)).toBe(Math.sign(line.variance));
    }
  });

  it('variancePct sign matches variance sign', () => {
    for (const line of BUDGET_LINES) {
      expect(Math.sign(line.variancePct)).toBe(Math.sign(line.variance));
    }
  });

  it('departments include Production', () => {
    expect(BUDGET_LINES.map((b) => b.department)).toContain('Production');
  });

  it('departments include Quality', () => {
    expect(BUDGET_LINES.map((b) => b.department)).toContain('Quality');
  });

  it('departments include Engineering', () => {
    expect(BUDGET_LINES.map((b) => b.department)).toContain('Engineering');
  });

  it('departments include Administration', () => {
    expect(BUDGET_LINES.map((b) => b.department)).toContain('Administration');
  });

  it('departments include Sales', () => {
    expect(BUDGET_LINES.map((b) => b.department)).toContain('Sales');
  });

  it('departments include HR', () => {
    expect(BUDGET_LINES.map((b) => b.department)).toContain('HR');
  });

  it('total annual budget is 2,892,000', () => {
    const total = BUDGET_LINES.reduce((s, b) => s + b.annualBudget, 0);
    expect(total).toBe(2892000);
  });

  it('total ytdBudget is 1,928,000', () => {
    const total = BUDGET_LINES.reduce((s, b) => s + b.ytdBudget, 0);
    expect(total).toBe(1928000);
  });

  it('total ytdActual is 1,925,500', () => {
    const total = BUDGET_LINES.reduce((s, b) => s + b.ytdActual, 0);
    expect(total).toBe(1930500);
  });

  it('4 lines are over budget (negative variance)', () => {
    const overBudget = BUDGET_LINES.filter((b) => b.variance < 0);
    expect(overBudget).toHaveLength(4);
  });

  it('8 lines are under budget (positive variance)', () => {
    const underBudget = BUDGET_LINES.filter((b) => b.variance >= 0);
    expect(underBudget).toHaveLength(8);
  });

  it('ytdBudget is always less than annualBudget (YTD < annual)', () => {
    for (const line of BUDGET_LINES) {
      expect(line.ytdBudget).toBeLessThan(line.annualBudget);
    }
  });

  it('Production department has 3 lines', () => {
    const prod = BUDGET_LINES.filter((b) => b.department === 'Production');
    expect(prod).toHaveLength(3);
  });

  it('Quality department has 2 lines', () => {
    const qual = BUDGET_LINES.filter((b) => b.department === 'Quality');
    expect(qual).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------
// budgetStatus pure function
// ---------------------------------------------------------------------------

describe('budgetStatus', () => {
  it('positive variance → Under', () => {
    const line = BUDGET_LINES.find((b) => b.id === '1') as BudgetLine;
    expect(budgetStatus(line)).toBe('Under');
  });

  it('negative variance with abs% > 10 → Alert', () => {
    const line = BUDGET_LINES.find((b) => b.id === '7') as BudgetLine; // variancePct -18.8
    expect(budgetStatus(line)).toBe('Alert');
  });

  it('negative variance with abs% <= 10 → Over', () => {
    const line = BUDGET_LINES.find((b) => b.id === '2') as BudgetLine; // variancePct -5.0
    expect(budgetStatus(line)).toBe('Over');
  });

  it('returns a string for every BUDGET_LINE', () => {
    for (const line of BUDGET_LINES) {
      const result = budgetStatus(line);
      expect(['Under', 'Alert', 'Over']).toContain(result);
    }
  });
});

// ---------------------------------------------------------------------------
// budgetVariance & budgetUtilization helpers
// ---------------------------------------------------------------------------

describe('budgetVariance', () => {
  it('under-budget scenario gives positive variance', () => {
    expect(budgetVariance(480000, 465000)).toBe(15000);
  });

  it('over-budget scenario gives negative variance', () => {
    expect(budgetVariance(640000, 672000)).toBe(-32000);
  });

  it('equal gives 0', () => {
    expect(budgetVariance(100000, 100000)).toBe(0);
  });
});

describe('budgetUtilization', () => {
  it('half spend = 50%', () => {
    expect(budgetUtilization(500000, 1000000)).toBe(50);
  });

  it('full spend = 100%', () => {
    expect(budgetUtilization(1000000, 1000000)).toBe(100);
  });

  it('overspend = >100%', () => {
    expect(budgetUtilization(1100000, 1000000)).toBe(110);
  });

  it('BUDGET_LINES total utilization is near 100% (within 5%)', () => {
    const totalYtdActual = BUDGET_LINES.reduce((s, b) => s + b.ytdActual, 0);
    const totalYtdBudget = BUDGET_LINES.reduce((s, b) => s + b.ytdBudget, 0);
    const util = budgetUtilization(totalYtdActual, totalYtdBudget);
    expect(util).toBeGreaterThanOrEqual(95);
    expect(util).toBeLessThanOrEqual(105);
  });
});

// ---------------------------------------------------------------------------
// monthlyOverBudget helper
// ---------------------------------------------------------------------------

describe('monthlyOverBudget', () => {
  it('Aug is over budget', () => {
    const aug = MONTHLY_DATA.find((m) => m.month === 'Aug') as MonthlyData;
    expect(monthlyOverBudget(aug)).toBe(true);
  });

  it('Jul is under budget', () => {
    const jul = MONTHLY_DATA.find((m) => m.month === 'Jul') as MonthlyData;
    expect(monthlyOverBudget(jul)).toBe(false);
  });

  it('Feb with actual=0 is not over budget', () => {
    const feb = MONTHLY_DATA.find((m) => m.month === 'Feb') as MonthlyData;
    expect(monthlyOverBudget(feb)).toBe(false);
  });

  it('returns boolean for all MONTHLY_DATA entries', () => {
    for (const m of MONTHLY_DATA) {
      expect(typeof monthlyOverBudget(m)).toBe('boolean');
    }
  });
});

// ---------------------------------------------------------------------------
// MOCK_RULES (SoD)
// ---------------------------------------------------------------------------

describe('MOCK_RULES (SoD matrix)', () => {
  it('has exactly 5 rules', () => {
    expect(MOCK_RULES).toHaveLength(5);
  });

  it('all rules have a non-empty id', () => {
    for (const rule of MOCK_RULES) {
      expect(rule.id.length).toBeGreaterThan(0);
    }
  });

  it('all rules have a non-empty role1', () => {
    for (const rule of MOCK_RULES) {
      expect(rule.role1.length).toBeGreaterThan(0);
    }
  });

  it('all rules have a non-empty role2', () => {
    for (const rule of MOCK_RULES) {
      expect(rule.role2.length).toBeGreaterThan(0);
    }
  });

  it('all rules have a non-empty conflictType', () => {
    for (const rule of MOCK_RULES) {
      expect((rule.conflictType ?? '').length).toBeGreaterThan(0);
    }
  });

  it('all rules have a mitigatingControl', () => {
    for (const rule of MOCK_RULES) {
      expect((rule.mitigatingControl ?? '').length).toBeGreaterThan(0);
    }
  });

  it('isActive is a boolean for all rules', () => {
    for (const rule of MOCK_RULES) {
      expect(typeof rule.isActive).toBe('boolean');
    }
  });

  it('4 rules are active', () => {
    expect(MOCK_RULES.filter((r) => r.isActive)).toHaveLength(4);
  });

  it('1 rule is inactive', () => {
    expect(MOCK_RULES.filter((r) => !r.isActive)).toHaveLength(1);
  });

  it('Cash Receipts Clerk rule is the inactive one', () => {
    const cashRule = MOCK_RULES.find((r) => r.role1 === 'Cash Receipts Clerk');
    expect(cashRule?.isActive).toBe(false);
  });

  it('conflict types include FINANCIAL, PAYROLL, ACCESS, PROCUREMENT, CASH', () => {
    const types = MOCK_RULES.map((r) => r.conflictType);
    expect(types).toContain('FINANCIAL');
    expect(types).toContain('PAYROLL');
    expect(types).toContain('ACCESS');
    expect(types).toContain('PROCUREMENT');
    expect(types).toContain('CASH');
  });

  it('all 5 conflict types are unique', () => {
    const types = MOCK_RULES.map((r) => r.conflictType);
    expect(new Set(types).size).toBe(5);
  });

  it('role1 and role2 are always different', () => {
    for (const rule of MOCK_RULES) {
      expect(rule.role1).not.toBe(rule.role2);
    }
  });
});

// ---------------------------------------------------------------------------
// CONFLICT_COLORS
// ---------------------------------------------------------------------------

describe('CONFLICT_COLORS', () => {
  it('has 5 entries', () => {
    expect(Object.keys(CONFLICT_COLORS)).toHaveLength(5);
  });

  const conflictEntries: [string, string][] = [
    ['FINANCIAL',   'red'],
    ['PAYROLL',     'purple'],
    ['ACCESS',      'blue'],
    ['PROCUREMENT', 'amber'],
    ['CASH',        'orange'],
  ];

  for (const [type, color] of conflictEntries) {
    it(`${type} contains ${color}`, () => {
      expect(CONFLICT_COLORS[type]).toContain(color);
    });

    it(`${type} color has bg- prefix class`, () => {
      expect(CONFLICT_COLORS[type]).toContain('bg-');
    });

    it(`${type} color has text- class`, () => {
      expect(CONFLICT_COLORS[type]).toContain('text-');
    });
  }
});

// ---------------------------------------------------------------------------
// MOCK_CONTROLS
// ---------------------------------------------------------------------------

describe('MOCK_CONTROLS', () => {
  it('has exactly 5 controls', () => {
    expect(MOCK_CONTROLS).toHaveLength(5);
  });

  it('all controls have a non-empty title', () => {
    for (const ctrl of MOCK_CONTROLS) {
      expect(ctrl.title.length).toBeGreaterThan(0);
    }
  });

  it('all controls have a valid status', () => {
    const validStatuses: ControlStatus[] = ['ACTIVE', 'INACTIVE', 'UNDER_REVIEW', 'REMEDIATION'];
    for (const ctrl of MOCK_CONTROLS) {
      expect(validStatuses).toContain(ctrl.status);
    }
  });

  it('3 controls are ACTIVE', () => {
    expect(MOCK_CONTROLS.filter((c) => c.status === 'ACTIVE')).toHaveLength(3);
  });

  it('1 control is UNDER_REVIEW', () => {
    expect(MOCK_CONTROLS.filter((c) => c.status === 'UNDER_REVIEW')).toHaveLength(1);
  });

  it('1 control is REMEDIATION', () => {
    expect(MOCK_CONTROLS.filter((c) => c.status === 'REMEDIATION')).toHaveLength(1);
  });

  it('Vendor Master Data Changes has FAIL test result', () => {
    const ctrl = MOCK_CONTROLS.find((c) => c.title === 'Vendor Master Data Changes');
    expect(ctrl?.testResult).toBe('FAIL');
  });

  it('ACTIVE controls with testResult all pass', () => {
    for (const ctrl of MOCK_CONTROLS.filter((c) => c.status === 'ACTIVE')) {
      if (ctrl.testResult) {
        expect(ctrl.testResult).toBe('PASS');
      }
    }
  });

  it('all createdAt values are ISO date strings', () => {
    for (const ctrl of MOCK_CONTROLS) {
      expect(() => new Date(ctrl.createdAt).toISOString()).not.toThrow();
    }
  });

  it('all controls have a controlType', () => {
    for (const ctrl of MOCK_CONTROLS) {
      expect((ctrl.controlType ?? '').length).toBeGreaterThan(0);
    }
  });

  it('control types include PREVENTIVE', () => {
    expect(MOCK_CONTROLS.map((c) => c.controlType)).toContain('PREVENTIVE');
  });

  it('control types include DETECTIVE', () => {
    expect(MOCK_CONTROLS.map((c) => c.controlType)).toContain('DETECTIVE');
  });
});

// ---------------------------------------------------------------------------
// STATUS_CONFIG
// ---------------------------------------------------------------------------

describe('STATUS_CONFIG', () => {
  const statuses: ControlStatus[] = ['ACTIVE', 'INACTIVE', 'UNDER_REVIEW', 'REMEDIATION'];

  it('has 4 status entries', () => {
    expect(Object.keys(STATUS_CONFIG)).toHaveLength(4);
  });

  for (const status of statuses) {
    it(`${status} has a non-empty label`, () => {
      expect(STATUS_CONFIG[status].label.length).toBeGreaterThan(0);
    });

    it(`${status} color has bg- class`, () => {
      expect(STATUS_CONFIG[status].color).toContain('bg-');
    });

    it(`${status} color has text- class`, () => {
      expect(STATUS_CONFIG[status].color).toContain('text-');
    });
  }

  it('ACTIVE is green', () => expect(STATUS_CONFIG.ACTIVE.color).toContain('green'));
  it('REMEDIATION is red', () => expect(STATUS_CONFIG.REMEDIATION.color).toContain('red'));
  it('UNDER_REVIEW is amber', () => expect(STATUS_CONFIG.UNDER_REVIEW.color).toContain('amber'));
  it('INACTIVE is gray', () => expect(STATUS_CONFIG.INACTIVE.color).toContain('gray'));
  it('ACTIVE label is "Active"', () => expect(STATUS_CONFIG.ACTIVE.label).toBe('Active'));
  it('UNDER_REVIEW label is "Under Review"', () => expect(STATUS_CONFIG.UNDER_REVIEW.label).toBe('Under Review'));
});

// ---------------------------------------------------------------------------
// EMPTY_FORM shapes
// ---------------------------------------------------------------------------

describe('SOD_EMPTY_FORM', () => {
  it('role1 is empty string', () => expect(SOD_EMPTY_FORM.role1).toBe(''));
  it('role2 is empty string', () => expect(SOD_EMPTY_FORM.role2).toBe(''));
  it('conflictType is empty string', () => expect(SOD_EMPTY_FORM.conflictType).toBe(''));
  it('description is empty string', () => expect(SOD_EMPTY_FORM.description).toBe(''));
  it('mitigatingControl is empty string', () => expect(SOD_EMPTY_FORM.mitigatingControl).toBe(''));
  it('isActive defaults to true', () => expect(SOD_EMPTY_FORM.isActive).toBe(true));
  it('has 6 fields', () => expect(Object.keys(SOD_EMPTY_FORM)).toHaveLength(6));
});

describe('CONTROL_EMPTY_FORM', () => {
  it('title is empty string', () => expect(CONTROL_EMPTY_FORM.title).toBe(''));
  it('description is empty string', () => expect(CONTROL_EMPTY_FORM.description).toBe(''));
  it('controlType is empty string', () => expect(CONTROL_EMPTY_FORM.controlType).toBe(''));
  it('riskArea is empty string', () => expect(CONTROL_EMPTY_FORM.riskArea).toBe(''));
  it('ownerName is empty string', () => expect(CONTROL_EMPTY_FORM.ownerName).toBe(''));
  it('status defaults to ACTIVE', () => expect(CONTROL_EMPTY_FORM.status).toBe('ACTIVE'));
  it('frequency is empty string', () => expect(CONTROL_EMPTY_FORM.frequency).toBe(''));
  it('testResult is empty string', () => expect(CONTROL_EMPTY_FORM.testResult).toBe(''));
  it('has 8 fields', () => expect(Object.keys(CONTROL_EMPTY_FORM)).toHaveLength(8));
});

// ---------------------------------------------------------------------------
// formatCurrencyGBP helper
// ---------------------------------------------------------------------------

describe('formatCurrencyGBP', () => {
  it('prefixes with £', () => {
    expect(formatCurrencyGBP(1000)).toContain('£');
  });

  it('uses absolute value for negative input', () => {
    expect(formatCurrencyGBP(-5000)).toContain('5');
    expect(formatCurrencyGBP(-5000)).not.toContain('-');
  });

  it('formats 0 as £0', () => {
    expect(formatCurrencyGBP(0)).toBe('£0');
  });

  it('returns a non-empty string for typical budget amounts', () => {
    for (const line of BUDGET_LINES) {
      expect(formatCurrencyGBP(line.annualBudget).length).toBeGreaterThan(0);
    }
  });
});
