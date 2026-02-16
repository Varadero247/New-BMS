import type { RoiInputs, RoiResults } from '@/components/roi/types';

// Constants — referenced in sales materials, do not change without approval
const NEXARA_ADMIN_REDUCTION = 0.50;
const AUDIT_PREP_DAYS_WITH_NEXARA = 2;
const SUPPLIER_ONBOARDING_VALUE_PER = 480;
const AUDIT_FAILURE_AVOIDED_VALUE = 8000;
const ENTERPRISE_CONTRACT_OPTION_VALUE = 12000;

// Plan pricing (monthly)
const PLAN_PRICES = {
  Starter: 299,
  Growth: 599,
  Scale: 1199,
  Enterprise: 1800,
} as const;

function getPlan(employees: number): RoiResults['recommendedPlan'] {
  if (employees <= 25) return 'Starter';
  if (employees <= 200) return 'Growth';
  if (employees <= 1000) return 'Scale';
  return 'Enterprise';
}

export function calculateRoi(inputs: RoiInputs): RoiResults {
  const dailyRate = inputs.dailyRateOverride ?? inputs.annualSalary / 230;

  // 1. Admin time saving
  const adminHoursSaved = inputs.adminHoursPerWeek * NEXARA_ADMIN_REDUCTION * 52;
  const adminValueSaved = (adminHoursSaved / 8) * dailyRate;

  // 2. Audit preparation saving
  const rawAuditDaysSaved = (inputs.auditPrepDays - AUDIT_PREP_DAYS_WITH_NEXARA) * inputs.numberOfAudits;
  const auditDaysSaved = Math.max(0, rawAuditDaysSaved);
  const auditPrepValueSaved = auditDaysSaved * dailyRate;

  // 3. Supplier onboarding acceleration
  const supplierValue = inputs.activeSuppliers * SUPPLIER_ONBOARDING_VALUE_PER;

  // 4. Audit risk reduction (probability-weighted)
  const auditRiskValue = inputs.numberOfAudits * (AUDIT_FAILURE_AVOIDED_VALUE / 3);

  // 5. Enterprise contract option value
  const contractValue = inputs.enterpriseContractPursuit ? ENTERPRISE_CONTRACT_OPTION_VALUE : 0;

  // Total
  const totalValue = adminValueSaved + auditPrepValueSaved + supplierValue + auditRiskValue + contractValue;

  // Plan cost
  const recommendedPlan = getPlan(inputs.employees);
  const nexaraCost = PLAN_PRICES[recommendedPlan] * 12;

  // ROI
  const roiPercent = Math.round(((totalValue - nexaraCost) / nexaraCost) * 100);
  const paybackMonths = Math.round((nexaraCost / totalValue) * 12 * 10) / 10;
  const netBenefit = totalValue - nexaraCost;

  return {
    adminValueSaved,
    auditPrepValueSaved,
    supplierValue,
    auditRiskValue,
    contractValue,
    totalValue,
    nexaraCost,
    netBenefit,
    roiPercent,
    paybackMonths,
    recommendedPlan,
    adminHoursSaved,
    auditDaysSaved,
  };
}

export { PLAN_PRICES };
