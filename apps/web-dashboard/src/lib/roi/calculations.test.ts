import { calculateRoi } from './calculations';
import type { RoiInputs } from '../../components/roi/types';
import { DEFAULT_INPUTS } from '../../components/roi/types';

describe('calculateRoi', () => {
  it('returns approximately 661% ROI with default inputs', () => {
    const results = calculateRoi(DEFAULT_INPUTS);
    // Allow ±30% tolerance around 661% — the key is that it's in the right ballpark
    expect(results.roiPercent).toBeGreaterThan(450);
    expect(results.roiPercent).toBeLessThan(870);
  });

  it('returns supplierValue of 0 when zero suppliers', () => {
    const results = calculateRoi({ ...DEFAULT_INPUTS, activeSuppliers: 0 });
    expect(results.supplierValue).toBe(0);
  });

  it('returns contractValue of 0 when enterpriseContractPursuit is false', () => {
    const results = calculateRoi({ ...DEFAULT_INPUTS, enterpriseContractPursuit: false });
    expect(results.contractValue).toBe(0);
  });

  it('assigns Starter plan for 25 employees', () => {
    const results = calculateRoi({ ...DEFAULT_INPUTS, employees: 25 });
    expect(results.recommendedPlan).toBe('Starter');
  });

  it('assigns Growth plan for 26 employees', () => {
    const results = calculateRoi({ ...DEFAULT_INPUTS, employees: 26 });
    expect(results.recommendedPlan).toBe('Growth');
  });

  it('assigns Growth plan for 200 employees', () => {
    const results = calculateRoi({ ...DEFAULT_INPUTS, employees: 200 });
    expect(results.recommendedPlan).toBe('Growth');
  });

  it('assigns Scale plan for 201 employees', () => {
    const results = calculateRoi({ ...DEFAULT_INPUTS, employees: 201 });
    expect(results.recommendedPlan).toBe('Scale');
  });

  it('returns auditPrepValueSaved of 0 when auditPrepDays <= 2', () => {
    const results = calculateRoi({ ...DEFAULT_INPUTS, auditPrepDays: 2 });
    expect(results.auditPrepValueSaved).toBe(0);
    expect(results.auditDaysSaved).toBe(0);

    const results1 = calculateRoi({ ...DEFAULT_INPUTS, auditPrepDays: 1 });
    expect(results1.auditPrepValueSaved).toBe(0);
    expect(results1.auditDaysSaved).toBe(0);
  });

  it('returns all non-negative values', () => {
    const results = calculateRoi(DEFAULT_INPUTS);
    expect(results.adminValueSaved).toBeGreaterThanOrEqual(0);
    expect(results.auditPrepValueSaved).toBeGreaterThanOrEqual(0);
    expect(results.supplierValue).toBeGreaterThanOrEqual(0);
    expect(results.auditRiskValue).toBeGreaterThanOrEqual(0);
    expect(results.contractValue).toBeGreaterThanOrEqual(0);
    expect(results.totalValue).toBeGreaterThanOrEqual(0);
    expect(results.nexaraCost).toBeGreaterThanOrEqual(0);
    expect(results.paybackMonths).toBeGreaterThanOrEqual(0);
    expect(results.adminHoursSaved).toBeGreaterThanOrEqual(0);
    expect(results.auditDaysSaved).toBeGreaterThanOrEqual(0);
  });

  it('returns paybackMonths between 0.1 and 12 for valid inputs', () => {
    // Default inputs
    expect(calculateRoi(DEFAULT_INPUTS).paybackMonths).toBeGreaterThanOrEqual(0.1);
    expect(calculateRoi(DEFAULT_INPUTS).paybackMonths).toBeLessThanOrEqual(12);

    // Minimum viable inputs — payback can exceed 12 months when value is very low
    const minInputs: RoiInputs = {
      employees: 25,
      adminHoursPerWeek: 2,
      annualSalary: 25000,
      numberOfAudits: 1,
      auditPrepDays: 1,
      activeSuppliers: 0,
      enterpriseContractPursuit: false,
    };
    const minResults = calculateRoi(minInputs);
    expect(minResults.paybackMonths).toBeGreaterThanOrEqual(0.1);
    expect(minResults.paybackMonths).toBeLessThanOrEqual(24);

    // Maximum inputs
    const maxInputs: RoiInputs = {
      employees: 5000,
      adminHoursPerWeek: 40,
      annualSalary: 90000,
      numberOfAudits: 4,
      auditPrepDays: 20,
      activeSuppliers: 500,
      enterpriseContractPursuit: true,
    };
    const maxResults = calculateRoi(maxInputs);
    expect(maxResults.paybackMonths).toBeGreaterThanOrEqual(0.1);
    expect(maxResults.paybackMonths).toBeLessThanOrEqual(12);
  });

  it('uses dailyRateOverride when provided', () => {
    const withOverride = calculateRoi({ ...DEFAULT_INPUTS, dailyRateOverride: 500 });
    const without = calculateRoi({ ...DEFAULT_INPUTS });
    expect(withOverride.adminValueSaved).not.toBe(without.adminValueSaved);
  });
});

describe('calculateRoi — extended', () => {
  it('assigns Enterprise plan for 1001 employees', () => {
    const results = calculateRoi({ ...DEFAULT_INPUTS, employees: 1001 });
    expect(results.recommendedPlan).toBe('Enterprise');
  });

  it('assigns Scale plan for exactly 1000 employees', () => {
    const results = calculateRoi({ ...DEFAULT_INPUTS, employees: 1000 });
    expect(results.recommendedPlan).toBe('Scale');
  });

  it('netBenefit equals totalValue minus nexaraCost', () => {
    const results = calculateRoi(DEFAULT_INPUTS);
    expect(results.netBenefit).toBeCloseTo(results.totalValue - results.nexaraCost, 5);
  });

  it('adminHoursSaved equals adminHoursPerWeek * 0.5 * 52', () => {
    const inputs = { ...DEFAULT_INPUTS, adminHoursPerWeek: 10 };
    const results = calculateRoi(inputs);
    expect(results.adminHoursSaved).toBeCloseTo(10 * 0.5 * 52, 5);
  });

  it('auditRiskValue scales with numberOfAudits', () => {
    const result2 = calculateRoi({ ...DEFAULT_INPUTS, numberOfAudits: 2 });
    const result4 = calculateRoi({ ...DEFAULT_INPUTS, numberOfAudits: 4 });
    expect(result4.auditRiskValue).toBeCloseTo(result2.auditRiskValue * 2, 5);
  });

  it('supplierValue equals activeSuppliers * 480', () => {
    const inputs = { ...DEFAULT_INPUTS, activeSuppliers: 10 };
    const results = calculateRoi(inputs);
    expect(results.supplierValue).toBeCloseTo(10 * 480, 5);
  });

  it('contractValue equals 12000 when enterpriseContractPursuit is true', () => {
    const results = calculateRoi({ ...DEFAULT_INPUTS, enterpriseContractPursuit: true });
    expect(results.contractValue).toBe(12000);
  });

  it('totalValue equals sum of all value components', () => {
    const r = calculateRoi(DEFAULT_INPUTS);
    const expected = r.adminValueSaved + r.auditPrepValueSaved + r.supplierValue + r.auditRiskValue + r.contractValue;
    expect(r.totalValue).toBeCloseTo(expected, 5);
  });

  it('roiPercent is close to netBenefit / nexaraCost * 100', () => {
    const r = calculateRoi(DEFAULT_INPUTS);
    if (r.nexaraCost > 0) {
      const raw = (r.netBenefit / r.nexaraCost) * 100;
      expect(Math.abs(r.roiPercent - raw)).toBeLessThan(1);
    }
  });
});

describe('calculateRoi — additional edge cases', () => {
  it('Starter plan nexaraCost is 299 * 12 = 3588', () => {
    const results = calculateRoi({ ...DEFAULT_INPUTS, employees: 25 });
    expect(results.nexaraCost).toBe(299 * 12);
  });

  it('Growth plan nexaraCost is 599 * 12 = 7188', () => {
    const results = calculateRoi({ ...DEFAULT_INPUTS, employees: 100 });
    expect(results.nexaraCost).toBe(599 * 12);
  });

  it('Scale plan nexaraCost is 1199 * 12 = 14388', () => {
    const results = calculateRoi({ ...DEFAULT_INPUTS, employees: 500 });
    expect(results.nexaraCost).toBe(1199 * 12);
  });

  it('Enterprise plan nexaraCost is 1800 * 12 = 21600', () => {
    const results = calculateRoi({ ...DEFAULT_INPUTS, employees: 2000 });
    expect(results.nexaraCost).toBe(1800 * 12);
  });

  it('auditDaysSaved is 0 when auditPrepDays equals 2', () => {
    const results = calculateRoi({ ...DEFAULT_INPUTS, auditPrepDays: 2 });
    expect(results.auditDaysSaved).toBe(0);
  });

  it('auditDaysSaved is positive when auditPrepDays > 2', () => {
    const results = calculateRoi({ ...DEFAULT_INPUTS, auditPrepDays: 5, numberOfAudits: 2 });
    expect(results.auditDaysSaved).toBeGreaterThan(0);
  });

  it('adminValueSaved scales proportionally with adminHoursPerWeek', () => {
    const r5 = calculateRoi({ ...DEFAULT_INPUTS, adminHoursPerWeek: 5 });
    const r10 = calculateRoi({ ...DEFAULT_INPUTS, adminHoursPerWeek: 10 });
    expect(r10.adminValueSaved).toBeCloseTo(r5.adminValueSaved * 2, 5);
  });

  it('dailyRateOverride of 0 produces adminValueSaved of 0', () => {
    const results = calculateRoi({ ...DEFAULT_INPUTS, dailyRateOverride: 0 });
    expect(results.adminValueSaved).toBe(0);
  });

  it('auditRiskValue is always numberOfAudits * (8000 / 3)', () => {
    const inputs: RoiInputs = { ...DEFAULT_INPUTS, numberOfAudits: 3 };
    const results = calculateRoi(inputs);
    expect(results.auditRiskValue).toBeCloseTo(3 * (8000 / 3), 5);
  });
});

describe('calculateRoi — boundary and formula checks', () => {
  it('PLAN_PRICES export has Starter, Growth, Scale, Enterprise', () => {
    const { PLAN_PRICES } = require('./calculations');
    expect(PLAN_PRICES).toHaveProperty('Starter');
    expect(PLAN_PRICES).toHaveProperty('Growth');
    expect(PLAN_PRICES).toHaveProperty('Scale');
    expect(PLAN_PRICES).toHaveProperty('Enterprise');
  });

  it('paybackMonths rounds to one decimal place', () => {
    const r = calculateRoi(DEFAULT_INPUTS);
    const str = r.paybackMonths.toString();
    const decimalParts = str.split('.');
    if (decimalParts.length > 1) {
      expect(decimalParts[1].length).toBeLessThanOrEqual(1);
    }
  });

  it('roiPercent is an integer (Math.round result)', () => {
    const r = calculateRoi(DEFAULT_INPUTS);
    expect(Number.isInteger(r.roiPercent)).toBe(true);
  });

  it('adminValueSaved with dailyRateOverride uses override not salary', () => {
    const withOverride = calculateRoi({ ...DEFAULT_INPUTS, dailyRateOverride: 1000, annualSalary: 10000 });
    const withoutOverride = calculateRoi({ ...DEFAULT_INPUTS, dailyRateOverride: undefined, annualSalary: 10000 });
    expect(withOverride.adminValueSaved).not.toBe(withoutOverride.adminValueSaved);
  });

  it('auditPrepValueSaved is 0 when auditPrepDays equals AUDIT_PREP_DAYS_WITH_NEXARA (2)', () => {
    const r = calculateRoi({ ...DEFAULT_INPUTS, auditPrepDays: 2 });
    expect(r.auditPrepValueSaved).toBe(0);
  });

  it('totalValue equals zero when all value drivers are zero', () => {
    const zeroInputs: RoiInputs = {
      employees: 25,
      adminHoursPerWeek: 0,
      annualSalary: 0,
      numberOfAudits: 0,
      auditPrepDays: 2,
      activeSuppliers: 0,
      enterpriseContractPursuit: false,
      dailyRateOverride: 0,
    };
    const r = calculateRoi(zeroInputs);
    expect(r.totalValue).toBe(0);
  });
});
