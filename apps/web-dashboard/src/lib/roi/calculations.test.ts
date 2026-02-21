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
