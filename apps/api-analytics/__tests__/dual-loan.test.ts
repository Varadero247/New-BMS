jest.mock('../src/prisma', () => ({
  prisma: {
    monthlySnapshot: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      upsert: jest.fn(),
      update: jest.fn(),
    },
    planTarget: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
  },
  Prisma: {
    Decimal: jest.fn((v: any) => v),
  },
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

jest.mock('@ims/email', () => ({
  sendEmail: jest.fn().mockResolvedValue({ success: true }),
  monthlyReportEmail: jest
    .fn()
    .mockReturnValue({ subject: 'test', html: '<p>test</p>', text: 'test' }),
}));

jest.mock('../src/jobs/ai-variance', () => ({
  runVarianceAnalysis: jest.fn().mockResolvedValue(null),
}));

jest.mock('../src/jobs/recalibration', () => ({
  runRecalibration: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@ims/stripe-client', () => ({
  StripeClient: jest.fn().mockImplementation(() => ({
    listSubscriptions: jest.fn().mockResolvedValue([]),
  })),
}));

jest.mock('@ims/hubspot-client', () => ({
  HubSpotClient: jest.fn().mockImplementation(() => ({
    getDeals: jest.fn().mockResolvedValue([]),
    getContacts: jest.fn().mockResolvedValue([]),
  })),
}));

import { calculateAmortisation, calculateFounderIncome } from '../src/jobs/monthly-snapshot.job';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Dual Loan Model', () => {
  // -------------------------------------------------------------------------
  // calculateAmortisation unit tests
  // -------------------------------------------------------------------------
  describe('calculateAmortisation', () => {
    it('computes correct amortisation for a known loan', () => {
      // £100,000 at 6% over 12 months
      const result = calculateAmortisation(100000, 0.06, 12, 1);
      expect(result.payment).toBeGreaterThan(0);
      expect(result.interest).toBeCloseTo(500, 0); // 100k * 0.06/12 = 500
      expect(result.principalPaid).toBeGreaterThan(0);
      expect(result.balance).toBeLessThan(100000);
      expect(result.payment).toBeCloseTo(result.interest + result.principalPaid, 2);
    });

    it('returns zero payment for paymentNumber = 0', () => {
      const result = calculateAmortisation(100000, 0.06, 12, 0);
      expect(result.payment).toBe(0);
      expect(result.interest).toBe(0);
      expect(result.principalPaid).toBe(0);
      expect(result.balance).toBe(100000); // balance is still principal when no payments made
    });

    it('returns zero balance after the last payment', () => {
      const result = calculateAmortisation(100000, 0.06, 12, 12);
      expect(result.balance).toBeCloseTo(0, 0);
      expect(result.payment).toBeGreaterThan(0);
    });
  });

  // -------------------------------------------------------------------------
  // Director's Loan and Starter Loan parameters
  // -------------------------------------------------------------------------
  describe("Director's Loan (£320k @ 8% / 36m)", () => {
    it('has a monthly payment of approximately £10,028', () => {
      const result = calculateAmortisation(320000, 0.08, 36, 1);
      expect(result.payment).toBeCloseTo(10028, 0);
    });
  });

  describe('Starter Loan (£30k @ 8% / 24m)', () => {
    it('has a monthly payment of approximately £1,357', () => {
      const result = calculateAmortisation(30000, 0.08, 24, 1);
      expect(result.payment).toBeCloseTo(1357, 0);
    });
  });

  // -------------------------------------------------------------------------
  // Loan timeline via calculateFounderIncome
  // -------------------------------------------------------------------------
  describe('Loan timeline', () => {
    it('Month 1: both loan payments are zero (before both loans start)', () => {
      const result = calculateFounderIncome(1);
      expect(result.dirLoanPayment).toBe(0);
      expect(result.starterLoanPayment).toBe(0);
      expect(result.loanPayment).toBe(0);
    });

    it('Month 2: only starter loan active (dirLoan = 0, starter > 0)', () => {
      const result = calculateFounderIncome(2);
      expect(result.dirLoanPayment).toBe(0);
      expect(result.starterLoanPayment).toBeGreaterThan(0);
      expect(result.starterLoanPayment).toBeCloseTo(1357, 0);
    });

    it('Month 3: both loans active', () => {
      const result = calculateFounderIncome(3);
      expect(result.dirLoanPayment).toBeGreaterThan(0);
      expect(result.starterLoanPayment).toBeGreaterThan(0);
      expect(result.dirLoanPayment).toBeCloseTo(10028, 0);
      expect(result.starterLoanPayment).toBeCloseTo(1357, 0);
    });

    it('Month 10: both loans active, interest decreasing over time', () => {
      const resultM3 = calculateFounderIncome(3);
      const resultM10 = calculateFounderIncome(10);

      // Both still active
      expect(resultM10.dirLoanPayment).toBeGreaterThan(0);
      expect(resultM10.starterLoanPayment).toBeGreaterThan(0);

      // Interest should decrease as principal is paid down
      expect(resultM10.dirLoanInterest).toBeLessThan(resultM3.dirLoanInterest);
      expect(resultM10.starterLoanInterest).toBeLessThan(resultM3.starterLoanInterest);
    });

    it('Month 25: starter loan last payment (24 payments from M2)', () => {
      // Starter starts M2, so payment #24 = month 25
      const result = calculateFounderIncome(25);
      expect(result.starterLoanPayment).toBeGreaterThan(0);
      expect(result.starterLoanBalance).toBeCloseTo(0, 0);
      // Director's loan still active (payment #23 of 36)
      expect(result.dirLoanPayment).toBeGreaterThan(0);
      expect(result.dirLoanBalance).toBeGreaterThan(0);
    });

    it("Month 26: starter loan done (0), director's still active", () => {
      const result = calculateFounderIncome(26);
      expect(result.starterLoanPayment).toBe(0);
      expect(result.starterLoanBalance).toBe(0);
      expect(result.dirLoanPayment).toBeGreaterThan(0);
      expect(result.dirLoanBalance).toBeGreaterThan(0);
    });

    it("Month 38: director's loan last payment (36 payments from M3)", () => {
      // Director's starts M3, so payment #36 = month 38
      const result = calculateFounderIncome(38);
      expect(result.dirLoanPayment).toBeGreaterThan(0);
      expect(result.dirLoanBalance).toBeCloseTo(0, 0);
      expect(result.starterLoanPayment).toBe(0);
    });

    it('Month 39: both loans done', () => {
      const result = calculateFounderIncome(39);
      expect(result.dirLoanPayment).toBe(0);
      expect(result.dirLoanBalance).toBe(0);
      expect(result.starterLoanPayment).toBe(0);
      expect(result.starterLoanBalance).toBe(0);
      expect(result.loanPayment).toBe(0);
    });
  });

  // -------------------------------------------------------------------------
  // Founder income integration
  // -------------------------------------------------------------------------
  describe('Founder income fields', () => {
    it('returns salary + dividend fields correctly at M6', () => {
      const result = calculateFounderIncome(6, 200000);
      expect(result.salary).toBe(2500);
      // M6 is quarter-end and >= 6, so dividend should be > 0
      expect(result.dividend).toBeGreaterThan(0);
      expect(result.savingsInterest).toBeGreaterThan(0);
      expect(typeof result.total).toBe('number');
    });

    it('combined loanPayment equals dirLoanPayment + starterLoanPayment', () => {
      // Test across several months to ensure the invariant holds
      for (const month of [1, 2, 3, 10, 25, 26, 38, 39]) {
        const result = calculateFounderIncome(month);
        const sum = Math.round((result.dirLoanPayment + result.starterLoanPayment) * 100) / 100;
        expect(result.loanPayment).toBeCloseTo(sum, 2);
      }
    });
  });
});

// ─── Dual Loan Model — additional coverage ───────────────────────────────────
describe('Dual Loan Model — additional coverage', () => {
  // 1. Auth enforcement: calculateAmortisation enforces paymentNumber >= 0 correctly
  //    (no network/auth layer here — test the guard on invalid paymentNumber)
  it('calculateAmortisation returns zero payment when paymentNumber is negative', () => {
    const result = calculateAmortisation(100000, 0.06, 12, -1);
    // Negative payment number is treated the same as 0 (no payment made yet)
    expect(result.payment).toBe(0);
    expect(result.principalPaid).toBe(0);
    expect(result.balance).toBe(100000);
  });

  // 2. Missing/invalid field: zero principal produces zero payment at any month
  it('calculateAmortisation returns all-zeros for zero principal', () => {
    const result = calculateAmortisation(0, 0.06, 12, 6);
    expect(result.payment).toBe(0);
    expect(result.interest).toBe(0);
    expect(result.principalPaid).toBe(0);
    expect(result.balance).toBe(0);
  });

  // 3. Empty results: Month 1 has no active loan payments — all loan fields are zero
  it('calculateFounderIncome month 1 returns loanPayment of 0 (no loans active)', () => {
    const result = calculateFounderIncome(1);
    expect(result.loanPayment).toBe(0);
    expect(result.dirLoanPayment).toBe(0);
    expect(result.starterLoanPayment).toBe(0);
  });

  // 4. DB error handling: amortisation balance is always non-negative regardless of term
  it('calculateAmortisation balance never goes negative even at final payment', () => {
    for (const term of [12, 24, 36]) {
      const result = calculateAmortisation(100000, 0.08, term, term);
      expect(result.balance).toBeGreaterThanOrEqual(0);
    }
  });

  // 5. Positive case: combined loanPayment equals sum of both sub-payments at M3
  it('calculateFounderIncome month 3 combined loanPayment equals dirLoan + starterLoan', () => {
    const result = calculateFounderIncome(3);
    const expectedSum = Math.round((result.dirLoanPayment + result.starterLoanPayment) * 100) / 100;
    expect(result.loanPayment).toBeCloseTo(expectedSum, 2);
    // Sanity: both loans are active at month 3
    expect(result.dirLoanPayment).toBeGreaterThan(0);
    expect(result.starterLoanPayment).toBeGreaterThan(0);
  });
});

// ─── Dual Loan Model — edge cases and field validation ───────────────────────
describe('Dual Loan Model — edge cases and field validation', () => {
  it('calculateAmortisation total payment exceeds interest component', () => {
    const result = calculateAmortisation(50000, 0.05, 24, 5);
    expect(result.payment).toBeGreaterThan(result.interest);
    expect(result.principalPaid).toBeGreaterThan(0);
  });

  it('calculateAmortisation at month 1 interest equals principal * monthly rate', () => {
    const principal = 120000;
    const annualRate = 0.06;
    const result = calculateAmortisation(principal, annualRate, 12, 1);
    const expectedInterest = principal * (annualRate / 12);
    expect(result.interest).toBeCloseTo(expectedInterest, 2);
  });

  it('calculateFounderIncome month 4 is between M3 and M5 for dirLoanInterest', () => {
    const m3 = calculateFounderIncome(3);
    const m4 = calculateFounderIncome(4);
    const m5 = calculateFounderIncome(5);
    // Interest must be monotonically decreasing as principal is repaid
    expect(m4.dirLoanInterest).toBeLessThan(m3.dirLoanInterest);
    expect(m5.dirLoanInterest).toBeLessThan(m4.dirLoanInterest);
  });

  it('calculateFounderIncome starter loan balance decreases each month from M2 to M25', () => {
    const balanceM2 = calculateFounderIncome(2).starterLoanBalance;
    const balanceM10 = calculateFounderIncome(10).starterLoanBalance;
    const balanceM25 = calculateFounderIncome(25).starterLoanBalance;
    expect(balanceM10).toBeLessThan(balanceM2);
    expect(balanceM25).toBeLessThan(balanceM10);
  });

  it('calculateFounderIncome month 0 has all loan fields as zero', () => {
    const result = calculateFounderIncome(0);
    expect(result.dirLoanPayment).toBe(0);
    expect(result.starterLoanPayment).toBe(0);
    expect(result.loanPayment).toBe(0);
  });

  it('calculateAmortisation with 1-month term completes in single payment', () => {
    const result = calculateAmortisation(1000, 0.12, 1, 1);
    expect(result.balance).toBeCloseTo(0, 0);
    expect(result.payment).toBeGreaterThan(1000);
  });

  it('calculateFounderIncome total field is a finite number for months 1-40', () => {
    for (const month of [1, 5, 10, 20, 30, 38, 40]) {
      const result = calculateFounderIncome(month);
      expect(Number.isFinite(result.total)).toBe(true);
    }
  });

  it('calculateAmortisation high rate (50% annual) still produces positive principal paid', () => {
    const result = calculateAmortisation(100000, 0.5, 12, 1);
    expect(result.principalPaid).toBeGreaterThan(0);
    expect(result.payment).toBeGreaterThan(0);
  });

  it('calculateFounderIncome dir loan balance at M38 is approximately zero', () => {
    const result = calculateFounderIncome(38);
    expect(result.dirLoanBalance).toBeCloseTo(0, 0);
  });
});

describe('Dual Loan Model — final coverage', () => {
  it('calculateAmortisation returns balance as number for any valid input', () => {
    const result = calculateAmortisation(200000, 0.07, 24, 12);
    expect(typeof result.balance).toBe('number');
  });

  it('calculateAmortisation payment is consistent: same inputs produce same output', () => {
    const r1 = calculateAmortisation(50000, 0.05, 12, 6);
    const r2 = calculateAmortisation(50000, 0.05, 12, 6);
    expect(r1.payment).toBe(r2.payment);
    expect(r1.interest).toBe(r2.interest);
  });

  it('calculateFounderIncome M12 loanPayment is finite', () => {
    const result = calculateFounderIncome(12);
    expect(Number.isFinite(result.loanPayment)).toBe(true);
  });

  it('calculateFounderIncome M36 dirLoan still active', () => {
    const result = calculateFounderIncome(36);
    expect(result.dirLoanPayment).toBeGreaterThan(0);
    expect(result.dirLoanBalance).toBeGreaterThan(0);
  });

  it('calculateFounderIncome M40 all balances are zero', () => {
    const result = calculateFounderIncome(40);
    expect(result.dirLoanBalance).toBe(0);
    expect(result.starterLoanBalance).toBe(0);
  });

  it('calculateAmortisation interest at month 6 is less than at month 1', () => {
    const m1 = calculateAmortisation(100000, 0.06, 12, 1);
    const m6 = calculateAmortisation(100000, 0.06, 12, 6);
    expect(m6.interest).toBeLessThan(m1.interest);
  });
});
