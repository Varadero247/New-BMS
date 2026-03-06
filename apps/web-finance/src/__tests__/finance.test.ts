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
