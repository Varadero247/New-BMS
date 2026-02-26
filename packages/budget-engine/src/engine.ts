import { Budget, BudgetLine, BudgetPeriod, BudgetSummary, CostCategory, Currency, VarianceAnalysis, VarianceStatus } from './types';

export function createBudgetLine(
  id: string, name: string, category: CostCategory,
  budgeted: number, actual: number, currency: Currency,
  period: BudgetPeriod, overrides: Partial<BudgetLine> = {}
): BudgetLine {
  return { id, name, category, budgeted, actual, currency, period, ...overrides };
}

export function createBudget(
  id: string, name: string, currency: Currency, period: BudgetPeriod,
  startDate: number, endDate: number, lines: BudgetLine[] = []
): Budget {
  return { id, name, currency, period, startDate, endDate, lines };
}

export function computeVariance(budgeted: number, actual: number): number {
  return actual - budgeted;
}

export function computeVariancePct(budgeted: number, actual: number): number {
  if (budgeted === 0) return actual === 0 ? 0 : 100;
  return ((actual - budgeted) / budgeted) * 100;
}

export function getVarianceStatus(variancePct: number): VarianceStatus {
  if (variancePct > 20) return 'critical';
  if (variancePct > 5) return 'over_budget';
  if (variancePct < -20) return 'under_budget';
  return 'on_track';
}

export function analyseVariance(line: BudgetLine): VarianceAnalysis {
  const variance = computeVariance(line.budgeted, line.actual);
  const variancePct = computeVariancePct(line.budgeted, line.actual);
  return {
    lineId: line.id,
    lineName: line.name,
    budgeted: line.budgeted,
    actual: line.actual,
    variance,
    variancePct,
    status: getVarianceStatus(variancePct),
  };
}

export function getBudgetSummary(budget: Budget): BudgetSummary {
  const totalBudgeted = budget.lines.reduce((s, l) => s + l.budgeted, 0);
  const totalActual = budget.lines.reduce((s, l) => s + l.actual, 0);
  const totalCommitted = budget.lines.reduce((s, l) => s + (l.committed ?? 0), 0);
  const totalVariance = computeVariance(totalBudgeted, totalActual);
  const variancePct = computeVariancePct(totalBudgeted, totalActual);
  const overBudgetLines = budget.lines.filter(l => l.actual > l.budgeted).length;
  return {
    totalBudgeted, totalActual, totalCommitted, totalVariance,
    variancePct, status: getVarianceStatus(variancePct),
    lineCount: budget.lines.length, overBudgetLines,
  };
}

export function addLineToBudget(budget: Budget, line: BudgetLine): Budget {
  return { ...budget, lines: [...budget.lines, line] };
}

export function removeLineFromBudget(budget: Budget, lineId: string): Budget {
  return { ...budget, lines: budget.lines.filter(l => l.id !== lineId) };
}

export function getLineById(budget: Budget, lineId: string): BudgetLine | undefined {
  return budget.lines.find(l => l.id === lineId);
}

export function filterLinesByCategory(budget: Budget, category: CostCategory): BudgetLine[] {
  return budget.lines.filter(l => l.category === category);
}

export function totalBudgetedByCategory(budget: Budget): Record<CostCategory, number> {
  const result = {} as Record<CostCategory, number>;
  for (const line of budget.lines) {
    result[line.category] = (result[line.category] ?? 0) + line.budgeted;
  }
  return result;
}

export function remainingBudget(line: BudgetLine): number {
  return line.budgeted - line.actual - (line.committed ?? 0);
}

export function forecastFullYear(line: BudgetLine, elapsedMonths: number): number {
  if (elapsedMonths <= 0) return line.actual;
  return (line.actual / elapsedMonths) * 12;
}

export function isValidCurrency(c: string): c is Currency {
  return ['GBP', 'USD', 'EUR', 'CAD', 'AUD'].includes(c);
}

export function isValidCategory(c: string): c is CostCategory {
  return ['capex', 'opex', 'labour', 'materials', 'services', 'overheads', 'contingency', 'other'].includes(c);
}

export function isValidPeriod(p: string): p is BudgetPeriod {
  return ['monthly', 'quarterly', 'annual'].includes(p);
}

export function roundCurrency(amount: number, decimals = 2): number {
  return Math.round(amount * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

export function getAllVariances(budget: Budget): VarianceAnalysis[] {
  return budget.lines.map(analyseVariance);
}
