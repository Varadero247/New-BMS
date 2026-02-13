export type TaxJurisdiction = 'UK' | 'UAE' | 'AU' | 'US' | 'CA';

export interface TaxBracket {
  min: number;
  max: number | null;
  rate: number;
}

export interface TaxBreakdown {
  bracket: string;
  taxableAmount: number;
  rate: number;
  tax: number;
}

export interface UKTaxResult {
  grossPay: number;
  incomeTax: number;
  nationalInsurance: number;
  netPay: number;
  breakdown: TaxBreakdown[];
}

export interface UAETaxResult {
  grossPay: number;
  tax: number;
  gratuity: number;
  socialSecurity: number;
  netPay: number;
}

export interface AUTaxResult {
  grossPay: number;
  incomeTax: number;
  superannuation: number;
  medicareLevy: number;
  netPay: number;
}

export interface USFederalTaxResult {
  grossPay: number;
  federalTax: number;
  socialSecurity: number;
  medicare: number;
  netPay: number;
}

export interface CAFederalTaxResult {
  grossPay: number;
  federalTax: number;
  cpp: number;
  ei: number;
  netPay: number;
}

export type TaxResult = UKTaxResult | UAETaxResult | AUTaxResult | USFederalTaxResult | CAFederalTaxResult;

export interface TaxConfig {
  jurisdiction: TaxJurisdiction;
  period?: 'annual' | 'monthly' | 'weekly' | 'fortnightly';
  filingStatus?: 'single' | 'married' | 'head_of_household';
  nationality?: string;
  yearsOfService?: number;
  taxCode?: string;
}
