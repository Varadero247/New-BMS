export interface DepreciationResult {
  annualDepreciation: number;
  accumulatedDepreciation: number;
  bookValue: number;
}

export interface InterestResult {
  totalInterest: number;
  totalAmount: number;
}

export interface CurrencyConversion {
  convertedAmount: number;
  exchangeRate: number;
}

export interface FxGainLoss {
  gainLoss: number;
  isGain: boolean;
}

export interface NPVResult {
  npv: number;
  isPositive: boolean;
}

export interface IRRResult {
  irr: number;
  converged: boolean;
}
