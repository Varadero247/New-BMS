export type BudgetPeriod = 'monthly' | 'quarterly' | 'annual';
export type VarianceStatus = 'on_track' | 'over_budget' | 'under_budget' | 'critical';
export type CostCategory = 'capex' | 'opex' | 'labour' | 'materials' | 'services' | 'overheads' | 'contingency' | 'other';
export type Currency = 'GBP' | 'USD' | 'EUR' | 'CAD' | 'AUD';

export interface BudgetLine {
  id: string;
  name: string;
  category: CostCategory;
  budgeted: number;
  actual: number;
  committed?: number;   // purchase orders / commitments
  currency: Currency;
  period: BudgetPeriod;
  notes?: string;
}

export interface Budget {
  id: string;
  name: string;
  lines: BudgetLine[];
  currency: Currency;
  period: BudgetPeriod;
  startDate: number;
  endDate: number;
  owner?: string;
}

export interface VarianceAnalysis {
  lineId: string;
  lineName: string;
  budgeted: number;
  actual: number;
  variance: number;           // actual - budgeted (positive = overspend)
  variancePct: number;        // variance / budgeted * 100
  status: VarianceStatus;
}

export interface BudgetSummary {
  totalBudgeted: number;
  totalActual: number;
  totalCommitted: number;
  totalVariance: number;
  variancePct: number;
  status: VarianceStatus;
  lineCount: number;
  overBudgetLines: number;
}
