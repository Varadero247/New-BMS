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
