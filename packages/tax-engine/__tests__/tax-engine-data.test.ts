// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
/**
 * Phase 163 — Comprehensive jurisdiction computation and invariant tests for
 * @ims/tax-engine.
 *
 * Verifies exact bracket math and payroll deduction rules for:
 *   UK   — income tax (4 brackets) + National Insurance (3 brackets)
 *   UAE  — 0% income tax + EOSG gratuity + GCC social security
 *   AU   — income tax (5 brackets) + superannuation (11.5%) + Medicare (2%)
 *   US   — federal income tax (7 brackets, single/married) + FICA (SS cap + Medicare)
 *   CA   — federal tax (5 brackets, BPA offset) + CPP (cap+exemption) + EI (cap)
 *   calculateTax — dispatcher routes all 5 jurisdictions
 */

import {
  calculateUKIncomeTax,
  calculateUAEPayroll,
  calculateAUPayroll,
  calculateUSFederal,
  calculateCAFederal,
  calculateTax,
} from '../src';

// ─── UK income tax ────────────────────────────────────────────────────────────
// Brackets (annual): 0-12570: 0%, 12571-50270: 20%, 50271-125140: 40%, 125141+: 45%
// NI brackets:       0-12570: 0%, 12571-50270:  8%, 50271+:         2%

describe('calculateUKIncomeTax', () => {
  // Helper: compute expected values from first principles
  function ukTax(annual: number): number {
    let t = 0;
    if (annual > 12571) t += (Math.min(annual, 50270) - 12571) * 0.2;
    if (annual > 50271) t += (Math.min(annual, 125140) - 50271) * 0.4;
    if (annual > 125141) t += (annual - 125141) * 0.45;
    return t;
  }
  function ukNI(annual: number): number {
    let ni = 0;
    if (annual > 12571) ni += (Math.min(annual, 50270) - 12571) * 0.08;
    if (annual > 50271) ni += (annual - 50271) * 0.02;
    return ni;
  }

  const ANNUAL_CASES = [
    { income: 5000,   label: 'below personal allowance' },
    { income: 12570,  label: 'at personal allowance boundary' },
    { income: 25000,  label: 'basic-rate band' },
    { income: 50270,  label: 'at top of basic-rate band' },
    { income: 60000,  label: 'into higher-rate band' },
    { income: 125140, label: 'at top of higher-rate band' },
    { income: 150000, label: 'into additional-rate band' },
  ];

  for (const { income, label } of ANNUAL_CASES) {
    describe(`annual income £${income} (${label})`, () => {
      const r = calculateUKIncomeTax(income, '1257L', 'annual');

      it('grossPay is preserved', () => {
        expect(r.grossPay).toBe(income);
      });
      it('incomeTax matches bracket formula', () => {
        expect(r.incomeTax).toBeCloseTo(ukTax(income), 1);
      });
      it('nationalInsurance matches NI formula', () => {
        expect(r.nationalInsurance).toBeCloseTo(ukNI(income), 1);
      });
      it('netPay = grossPay − incomeTax − nationalInsurance', () => {
        expect(r.netPay).toBeCloseTo(income - r.incomeTax - r.nationalInsurance, 1);
      });
      it('all result values are finite numbers', () => {
        expect(Number.isFinite(r.incomeTax)).toBe(true);
        expect(Number.isFinite(r.nationalInsurance)).toBe(true);
        expect(Number.isFinite(r.netPay)).toBe(true);
      });
    });
  }

  describe('period scaling', () => {
    it('monthly £2500 × 12 = annual £30000 income tax (within rounding)', () => {
      const monthly = calculateUKIncomeTax(2500, '1257L', 'monthly');
      const annual  = calculateUKIncomeTax(30000, '1257L', 'annual');
      expect(monthly.incomeTax * 12).toBeCloseTo(annual.incomeTax, 0);
    });

    it('weekly £577 × 52 ≈ annual £30004 income tax (within rounding)', () => {
      const weekly = calculateUKIncomeTax(577, '1257L', 'weekly');
      const annual = calculateUKIncomeTax(577 * 52, '1257L', 'annual');
      expect(weekly.incomeTax * 52).toBeCloseTo(annual.incomeTax, 0);
    });
  });

  describe('tax-free threshold invariant', () => {
    it('income at or below £12570 has 0 income tax and 0 NI', () => {
      const r = calculateUKIncomeTax(12570);
      expect(r.incomeTax).toBe(0);
      expect(r.nationalInsurance).toBe(0);
    });
  });

  describe('progressive rate invariant', () => {
    it('effective tax rate increases as income increases', () => {
      const rates = [30000, 60000, 130000].map((inc) => {
        const r = calculateUKIncomeTax(inc);
        return (r.incomeTax + r.nationalInsurance) / inc;
      });
      expect(rates[1]).toBeGreaterThan(rates[0]);
      expect(rates[2]).toBeGreaterThan(rates[1]);
    });
  });
});

// ─── UAE payroll ─────────────────────────────────────────────────────────────
// 0% income tax; EOSG gratuity; GCC social security 5%

describe('calculateUAEPayroll', () => {
  const GROSS = 10000; // AED

  describe('gratuity calculation by years of service', () => {
    const GRATUITY_CASES = [
      { years: 0, expectedDays: 0 },
      { years: 1, expectedDays: 21 },
      { years: 3, expectedDays: 63 },
      { years: 5, expectedDays: 105 },
      { years: 6, expectedDays: 135 },  // 5*21 + 1*30
      { years: 10, expectedDays: 255 }, // 5*21 + 5*30
      { years: 15, expectedDays: 405 }, // 5*21 + 10*30
    ];

    for (const { years, expectedDays } of GRATUITY_CASES) {
      describe(`${years} years of service → ${expectedDays} days`, () => {
        const r = calculateUAEPayroll(GROSS, 'OTHER', years);

        it('gratuity = (gross/30) × days', () => {
          expect(r.gratuity).toBeCloseTo((GROSS / 30) * expectedDays, 2);
        });
        it('tax is always 0 in UAE', () => {
          expect(r.tax).toBe(0);
        });
      });
    }
  });

  describe('social security by nationality', () => {
    const GCC_CASES = [
      { nationality: 'UAE', isgcc: true },
      { nationality: 'SA',  isgcc: true },
      { nationality: 'KW',  isgcc: true },
      { nationality: 'BH',  isgcc: true },
      { nationality: 'OM',  isgcc: true },
      { nationality: 'QA',  isgcc: true },
      { nationality: 'UK',  isgcc: false },
      { nationality: 'IN',  isgcc: false },
      { nationality: 'OTHER', isgcc: false },
    ];

    for (const { nationality, isgcc } of GCC_CASES) {
      describe(`nationality ${nationality}`, () => {
        const r = calculateUAEPayroll(GROSS, nationality, 0);

        it(`socialSecurity = ${isgcc ? '5% of gross' : '0'}`, () => {
          const expected = isgcc ? GROSS * 0.05 : 0;
          expect(r.socialSecurity).toBeCloseTo(expected, 2);
        });
        it('netPay = gross − socialSecurity', () => {
          expect(r.netPay).toBeCloseTo(GROSS - r.socialSecurity, 2);
        });
      });
    }
  });

  describe('case-insensitive nationality', () => {
    it('lowercase "uae" treated same as "UAE"', () => {
      const upper = calculateUAEPayroll(GROSS, 'UAE', 0);
      const lower = calculateUAEPayroll(GROSS, 'uae', 0);
      expect(lower.socialSecurity).toBeCloseTo(upper.socialSecurity, 2);
    });
  });
});

// ─── Australian payroll ───────────────────────────────────────────────────────
// Brackets: 0-18200: 0%, 18201-45000: 16%, 45001-135000: 30%, 135001-190000: 37%, 190001+: 45%
// Super: 11.5% (added on top, not deducted from net); Medicare: 2% (deducted)

describe('calculateAUPayroll', () => {
  function auTax(annual: number): number {
    let t = 0;
    if (annual > 18201) t += (Math.min(annual, 45000) - 18201) * 0.16;
    if (annual > 45001) t += (Math.min(annual, 135000) - 45001) * 0.3;
    if (annual > 135001) t += (Math.min(annual, 190000) - 135001) * 0.37;
    if (annual > 190001) t += (annual - 190001) * 0.45;
    return t;
  }

  const AU_CASES = [
    { income: 18200, label: 'at tax-free threshold' },
    { income: 30000, label: 'in 16% bracket' },
    { income: 45000, label: 'at top of 16% bracket' },
    { income: 80000, label: 'in 30% bracket' },
    { income: 140000, label: 'in 37% bracket' },
    { income: 200000, label: 'in 45% bracket' },
  ];

  for (const { income, label } of AU_CASES) {
    describe(`annual income A$${income} (${label})`, () => {
      const r = calculateAUPayroll(income, 'annual');

      it('grossPay is preserved', () => {
        expect(r.grossPay).toBe(income);
      });
      it('incomeTax matches bracket formula', () => {
        expect(r.incomeTax).toBeCloseTo(auTax(income), 0);
      });
      it('superannuation = 11.5% of gross', () => {
        expect(r.superannuation).toBeCloseTo(income * 0.115, 1);
      });
      it('medicareLevy = 2% of gross', () => {
        expect(r.medicareLevy).toBeCloseTo(income * 0.02, 1);
      });
      it('netPay = gross − incomeTax − medicareLevy (super NOT deducted)', () => {
        expect(r.netPay).toBeCloseTo(income - r.incomeTax - r.medicareLevy, 1);
      });
    });
  }

  describe('super is employer contribution — not included in netPay reduction', () => {
    it('netPay + incomeTax + medicareLevy = grossPay (super excluded)', () => {
      const r = calculateAUPayroll(60000);
      expect(r.netPay + r.incomeTax + r.medicareLevy).toBeCloseTo(60000, 1);
    });
  });

  describe('period scaling', () => {
    it('monthly A$5000 × 12 = annual A$60000 income tax (within rounding)', () => {
      const monthly = calculateAUPayroll(5000, 'monthly');
      const annual  = calculateAUPayroll(60000, 'annual');
      expect(monthly.incomeTax * 12).toBeCloseTo(annual.incomeTax, 0);
    });
  });
});

// ─── US federal ──────────────────────────────────────────────────────────────
// Single brackets: 0-11600: 10%, 11601-47150: 12%, 47151-100525: 22%, ...
// SS: 6.2% capped at $168,600; Medicare: 1.45% uncapped

describe('calculateUSFederal', () => {
  function usFederal(annual: number, married = false): number {
    const brackets = married
      ? [
          { min: 0,      max: 23200,  rate: 0.10 },
          { min: 23201,  max: 94300,  rate: 0.12 },
          { min: 94301,  max: 201050, rate: 0.22 },
          { min: 201051, max: 383900, rate: 0.24 },
          { min: 383901, max: 487450, rate: 0.32 },
          { min: 487451, max: 731200, rate: 0.35 },
          { min: 731201, max: Infinity, rate: 0.37 },
        ]
      : [
          { min: 0,      max: 11600,  rate: 0.10 },
          { min: 11601,  max: 47150,  rate: 0.12 },
          { min: 47151,  max: 100525, rate: 0.22 },
          { min: 100526, max: 191950, rate: 0.24 },
          { min: 191951, max: 243725, rate: 0.32 },
          { min: 243726, max: 609350, rate: 0.35 },
          { min: 609351, max: Infinity, rate: 0.37 },
        ];
    let tax = 0;
    for (const b of brackets) {
      if (annual <= b.min) break;
      tax += (Math.min(annual, b.max) - b.min) * b.rate;
    }
    return tax;
  }

  const US_SINGLE_CASES = [
    { income: 11600,  label: 'top of 10% bracket' },
    { income: 30000,  label: 'in 12% bracket' },
    { income: 80000,  label: 'in 22% bracket' },
    { income: 200000, label: 'in 32% bracket' },
  ];

  for (const { income, label } of US_SINGLE_CASES) {
    describe(`US single annual $${income} (${label})`, () => {
      const r = calculateUSFederal(income, 'single', 'annual');

      it('grossPay is preserved', () => {
        expect(r.grossPay).toBe(income);
      });
      it('federalTax matches bracket formula', () => {
        expect(r.federalTax).toBeCloseTo(usFederal(income, false), 1);
      });
      it('socialSecurity = 6.2% of min(income, 168600)', () => {
        expect(r.socialSecurity).toBeCloseTo(Math.min(income, 168600) * 0.062, 1);
      });
      it('medicare = 1.45% of income (uncapped)', () => {
        expect(r.medicare).toBeCloseTo(income * 0.0145, 1);
      });
      it('netPay = grossPay − federalTax − SS − medicare', () => {
        expect(r.netPay).toBeCloseTo(income - r.federalTax - r.socialSecurity - r.medicare, 1);
      });
    });
  }

  describe('filing status: married vs single', () => {
    it('married filing jointly pays less federal tax than single at $80,000', () => {
      const single  = calculateUSFederal(80000, 'single', 'annual');
      const married = calculateUSFederal(80000, 'married', 'annual');
      expect(married.federalTax).toBeLessThan(single.federalTax);
    });

    it('married bracket formula matches at $150,000', () => {
      const r = calculateUSFederal(150000, 'married', 'annual');
      expect(r.federalTax).toBeCloseTo(usFederal(150000, true), 1);
    });
  });

  describe('Social Security cap', () => {
    it('SS is capped at $168,600 wage base', () => {
      const above = calculateUSFederal(200000, 'single', 'annual');
      const cap   = calculateUSFederal(168600, 'single', 'annual');
      expect(above.socialSecurity).toBeCloseTo(cap.socialSecurity, 1);
    });

    it('Medicare is NOT capped at high income', () => {
      const r200 = calculateUSFederal(200000, 'single', 'annual');
      const r100 = calculateUSFederal(100000, 'single', 'annual');
      expect(r200.medicare).toBeCloseTo(r100.medicare * 2, 1);
    });
  });
});

// ─── Canadian federal ─────────────────────────────────────────────────────────
// BPA = 15705; brackets on (income - BPA); CPP cap 68500 / exemption 3500; EI cap 63200

describe('calculateCAFederal', () => {
  const BPA = 15705;
  const CPP_RATE = 0.0595;
  const CPP_EXEMPTION = 3500;
  const CPP_MAX = 68500;
  const EI_RATE = 0.0166;
  const EI_MAX = 63200;

  function caFederal(annual: number): number {
    const taxable = Math.max(0, annual - BPA);
    const brackets = [
      { min: 0,      max: 55867,  rate: 0.15 },
      { min: 55868,  max: 111733, rate: 0.205 },
      { min: 111734, max: 154906, rate: 0.26 },
      { min: 154907, max: 220000, rate: 0.29 },
      { min: 220001, max: Infinity, rate: 0.33 },
    ];
    let tax = 0;
    for (const b of brackets) {
      if (taxable <= b.min) break;
      tax += (Math.min(taxable, b.max) - b.min) * b.rate;
    }
    return tax;
  }
  function caCPP(annual: number): number {
    const pensionable = Math.min(annual, CPP_MAX);
    const contributable = Math.max(0, pensionable - CPP_EXEMPTION);
    return contributable * CPP_RATE;
  }
  function caEI(annual: number): number {
    return Math.min(annual, EI_MAX) * EI_RATE;
  }

  const CA_CASES = [
    { income: 15705,  label: 'equals BPA — zero federal tax' },
    { income: 40000,  label: 'in 15% bracket' },
    { income: 80000,  label: 'in 20.5% bracket' },
    { income: 120000, label: 'in 26% bracket' },
    { income: 230000, label: 'in 33% bracket' },
  ];

  for (const { income, label } of CA_CASES) {
    describe(`CA annual C$${income} (${label})`, () => {
      const r = calculateCAFederal(income, 'annual');

      it('grossPay is preserved', () => {
        expect(r.grossPay).toBe(income);
      });
      it('federalTax matches BPA-adjusted bracket formula', () => {
        expect(r.federalTax).toBeCloseTo(caFederal(income), 1);
      });
      it('cpp = 5.95% of (min(income, 68500) − 3500)', () => {
        expect(r.cpp).toBeCloseTo(caCPP(income), 1);
      });
      it('ei = 1.66% of min(income, 63200)', () => {
        expect(r.ei).toBeCloseTo(caEI(income), 1);
      });
      it('netPay = gross − federalTax − cpp − ei', () => {
        expect(r.netPay).toBeCloseTo(income - r.federalTax - r.cpp - r.ei, 1);
      });
    });
  }

  describe('CPP wage cap', () => {
    it('CPP stops growing above C$68,500', () => {
      const r100 = calculateCAFederal(100000);
      const r68  = calculateCAFederal(68500);
      expect(r100.cpp).toBeCloseTo(r68.cpp, 1);
    });
  });

  describe('EI insurable earnings cap', () => {
    it('EI stops growing above C$63,200', () => {
      const r100 = calculateCAFederal(100000);
      const r63  = calculateCAFederal(63200);
      expect(r100.ei).toBeCloseTo(r63.ei, 1);
    });
  });

  describe('BPA exemption', () => {
    it('income ≤ BPA has 0 federal tax', () => {
      const r = calculateCAFederal(BPA);
      expect(r.federalTax).toBe(0);
    });
  });
});

// ─── calculateTax dispatcher ──────────────────────────────────────────────────

describe('calculateTax', () => {
  it('UK: routes to calculateUKIncomeTax', () => {
    const r = calculateTax('UK', 50000);
    expect('incomeTax' in r).toBe(true);
    expect('nationalInsurance' in r).toBe(true);
  });

  it('UAE: routes to calculateUAEPayroll', () => {
    const r = calculateTax('UAE', 10000);
    expect('gratuity' in r).toBe(true);
    expect('socialSecurity' in r).toBe(true);
  });

  it('AU: routes to calculateAUPayroll', () => {
    const r = calculateTax('AU', 80000);
    expect('superannuation' in r).toBe(true);
    expect('medicareLevy' in r).toBe(true);
  });

  it('US: routes to calculateUSFederal', () => {
    const r = calculateTax('US', 60000);
    expect('federalTax' in r).toBe(true);
    expect('socialSecurity' in r).toBe(true);
    expect('medicare' in r).toBe(true);
  });

  it('CA: routes to calculateCAFederal', () => {
    const r = calculateTax('CA', 70000);
    expect('federalTax' in r).toBe(true);
    expect('cpp' in r).toBe(true);
    expect('ei' in r).toBe(true);
  });

  it('all jurisdictions return grossPay', () => {
    for (const jur of ['UK', 'UAE', 'AU', 'US', 'CA'] as const) {
      const r = calculateTax(jur, 50000) as any;
      expect(r.grossPay).toBe(50000);
    }
  });

  it('all jurisdictions produce a positive netPay for normal income', () => {
    for (const jur of ['UK', 'UAE', 'AU', 'US', 'CA'] as const) {
      const r = calculateTax(jur, 50000) as any;
      expect(r.netPay).toBeGreaterThan(0);
    }
  });

  it('UAE: period option is ignored (payroll is monthly-based)', () => {
    const r1 = calculateTax('UAE', 10000) as any;
    const r2 = calculateTax('UAE', 10000, { period: 'annual' }) as any;
    expect(r1.netPay).toBe(r2.netPay);
  });

  it('US: married filing status reduces federal tax vs single', () => {
    const single  = calculateTax('US', 100000, { filingStatus: 'single' }) as any;
    const married = calculateTax('US', 100000, { filingStatus: 'married' }) as any;
    expect(married.federalTax).toBeLessThan(single.federalTax);
  });

  it('throws for unsupported jurisdiction', () => {
    expect(() => calculateTax('XX' as any, 50000)).toThrow();
  });
});

// ─── cross-jurisdiction invariants ───────────────────────────────────────────

describe('cross-jurisdiction invariants', () => {
  it('UAE has the lowest effective deduction rate (0% income tax)', () => {
    const gross = 60000;
    const uae = calculateTax('UAE', gross) as any;
    const uk  = calculateTax('UK', gross) as any;
    const au  = calculateTax('AU', gross) as any;
    const us  = calculateTax('US', gross) as any;
    const ca  = calculateTax('CA', gross) as any;

    const uaeDeduction = (gross - uae.netPay) / gross;
    const ukDeduction  = (gross - uk.netPay)  / gross;
    const auDeduction  = (gross - au.netPay)  / gross;
    const usDeduction  = (gross - us.netPay)  / gross;
    const caDeduction  = (gross - ca.netPay)  / gross;

    expect(uaeDeduction).toBeLessThan(ukDeduction);
    expect(uaeDeduction).toBeLessThan(auDeduction);
    expect(uaeDeduction).toBeLessThan(usDeduction);
    expect(uaeDeduction).toBeLessThan(caDeduction);
  });

  it('all jurisdictions: netPay < grossPay for taxable income', () => {
    for (const jur of ['UK', 'AU', 'US', 'CA'] as const) {
      const r = calculateTax(jur, 80000) as any;
      expect(r.netPay).toBeLessThan(80000);
    }
  });

  it('all jurisdictions: deductions increase with income (progressive/monotone)', () => {
    const incomes = [30000, 60000, 100000];
    for (const jur of ['UK', 'AU', 'US', 'CA'] as const) {
      const deductions = incomes.map((inc) => {
        const r = calculateTax(jur, inc) as any;
        return inc - r.netPay;
      });
      expect(deductions[1]).toBeGreaterThan(deductions[0]);
      expect(deductions[2]).toBeGreaterThan(deductions[1]);
    }
  });
});
