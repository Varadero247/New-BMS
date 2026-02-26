// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
export interface RoiInputs {
  employees: number;
  adminHoursPerWeek: number;
  annualSalary: number;
  numberOfAudits: 1 | 2 | 3 | 4;
  auditPrepDays: number;
  activeSuppliers: number;
  enterpriseContractPursuit: boolean;
  dailyRateOverride?: number;
}

export interface RoiResults {
  adminValueSaved: number;
  auditPrepValueSaved: number;
  supplierValue: number;
  auditRiskValue: number;
  contractValue: number;
  totalValue: number;
  nexaraCost: number;
  netBenefit: number;
  roiPercent: number;
  paybackMonths: number;
  recommendedPlan: 'Starter' | 'Growth' | 'Scale' | 'Enterprise';
  adminHoursSaved: number;
  auditDaysSaved: number;
}

export const DEFAULT_INPUTS: RoiInputs = {
  employees: 200,
  adminHoursPerWeek: 20,
  annualSalary: 45000,
  numberOfAudits: 2,
  auditPrepDays: 10,
  activeSuppliers: 25,
  enterpriseContractPursuit: true,
};
