// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
export { calculateUKIncomeTax } from './uk';
export { calculateUAEPayroll } from './uae';
export { calculateAUPayroll } from './australia';
export { calculateUSFederal } from './usa';
export { calculateCAFederal } from './canada';
export { calculateTax } from './engine';
export type {
  TaxJurisdiction,
  TaxBracket,
  TaxBreakdown,
  TaxResult,
  TaxConfig,
  UKTaxResult,
  UAETaxResult,
  AUTaxResult,
  USFederalTaxResult,
  CAFederalTaxResult,
} from './types';
