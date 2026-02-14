'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '@ims/ui';
import { Gauge } from '@ims/ui';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  PiggyBank,
  Filter,
} from 'lucide-react';

interface BudgetLine {
  id: string;
  department: string;
  category: string;
  annualBudget: number;
  ytdBudget: number;
  ytdActual: number;
  forecast: number;
  variance: number;
  variancePct: number;
}

interface MonthlyData {
  month: string;
  budget: number;
  actual: number;
}

const MONTHLY_DATA: MonthlyData[] = [
  { month: 'Jul', budget: 185000, actual: 178000 },
  { month: 'Aug', budget: 185000, actual: 192000 },
  { month: 'Sep', budget: 190000, actual: 187000 },
  { month: 'Oct', budget: 195000, actual: 201000 },
  { month: 'Nov', budget: 200000, actual: 195000 },
  { month: 'Dec', budget: 210000, actual: 218000 },
  { month: 'Jan', budget: 195000, actual: 190000 },
  { month: 'Feb', budget: 195000, actual: 0 },
];

const BUDGET_LINES: BudgetLine[] = [
  { id: '1', department: 'Production', category: 'Direct Labour', annualBudget: 720000, ytdBudget: 480000, ytdActual: 465000, forecast: 705000, variance: 15000, variancePct: 3.1 },
  { id: '2', department: 'Production', category: 'Raw Materials', annualBudget: 960000, ytdBudget: 640000, ytdActual: 672000, forecast: 1008000, variance: -32000, variancePct: -5.0 },
  { id: '3', department: 'Production', category: 'Maintenance', annualBudget: 180000, ytdBudget: 120000, ytdActual: 115000, forecast: 172000, variance: 5000, variancePct: 4.2 },
  { id: '4', department: 'Quality', category: 'Testing & Inspection', annualBudget: 96000, ytdBudget: 64000, ytdActual: 58000, forecast: 87000, variance: 6000, variancePct: 9.4 },
  { id: '5', department: 'Quality', category: 'Calibration', annualBudget: 36000, ytdBudget: 24000, ytdActual: 26500, forecast: 39750, variance: -2500, variancePct: -10.4 },
  { id: '6', department: 'Engineering', category: 'R&D', annualBudget: 240000, ytdBudget: 160000, ytdActual: 152000, forecast: 228000, variance: 8000, variancePct: 5.0 },
  { id: '7', department: 'Engineering', category: 'Tooling', annualBudget: 120000, ytdBudget: 80000, ytdActual: 95000, forecast: 142500, variance: -15000, variancePct: -18.8 },
  { id: '8', department: 'Administration', category: 'IT Infrastructure', annualBudget: 144000, ytdBudget: 96000, ytdActual: 88000, forecast: 132000, variance: 8000, variancePct: 8.3 },
  { id: '9', department: 'Administration', category: 'Facilities', annualBudget: 180000, ytdBudget: 120000, ytdActual: 118000, forecast: 177000, variance: 2000, variancePct: 1.7 },
  { id: '10', department: 'Sales', category: 'Marketing', annualBudget: 96000, ytdBudget: 64000, ytdActual: 71000, forecast: 106500, variance: -7000, variancePct: -10.9 },
  { id: '11', department: 'Sales', category: 'Travel & Entertainment', annualBudget: 48000, ytdBudget: 32000, ytdActual: 28000, forecast: 42000, variance: 4000, variancePct: 12.5 },
  { id: '12', department: 'HR', category: 'Training & Development', annualBudget: 72000, ytdBudget: 48000, ytdActual: 42000, forecast: 63000, variance: 6000, variancePct: 12.5 },
];

function formatCurrency(val: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.abs(val));
}

export default function BudgetDashboardPage() {
  const [selectedDept, setSelectedDept] = useState<string>('');
  const period = 'FY 2025/26';

  const filtered = selectedDept
    ? BUDGET_LINES.filter(b => b.department === selectedDept)
    : BUDGET_LINES;

  const departments = [...new Set(BUDGET_LINES.map(b => b.department))];

  // Totals
  const totalBudget = BUDGET_LINES.reduce((s, b) => s + b.annualBudget, 0);
  const totalYtdBudget = BUDGET_LINES.reduce((s, b) => s + b.ytdBudget, 0);
  const totalYtdActual = BUDGET_LINES.reduce((s, b) => s + b.ytdActual, 0);
  const totalForecast = BUDGET_LINES.reduce((s, b) => s + b.forecast, 0);
  const totalVariance = totalYtdBudget - totalYtdActual;
  const overBudgetLines = BUDGET_LINES.filter(b => b.variance < 0).length;
  const budgetUtilization = Math.round((totalYtdActual / totalYtdBudget) * 100);

  const maxMonthly = Math.max(...MONTHLY_DATA.map(m => Math.max(m.budget, m.actual)));

  // Department totals
  const deptSummary = departments.map(dept => {
    const lines = BUDGET_LINES.filter(b => b.department === dept);
    const budget = lines.reduce((s, b) => s + b.ytdBudget, 0);
    const actual = lines.reduce((s, b) => s + b.ytdActual, 0);
    return { dept, budget, actual, variance: budget - actual };
  });

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Budget Dashboard</h1>
            <p className="text-gray-500 mt-1">{period} — Year-to-date performance and forecast variance analysis</p>
          </div>
          <div className="flex items-center gap-2">
            <PiggyBank className="h-5 w-5 text-indigo-600" />
            <span className="text-sm text-indigo-600 font-medium">{period}</span>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {/* Budget Utilization Gauge */}
          <Card>
            <CardContent className="pt-6 flex flex-col items-center">
              <Gauge
                value={budgetUtilization}
                max={100}
                size="lg"
                label="Budget Utilization"
                sublabel="YTD"
                color={budgetUtilization > 100 ? 'red' : budgetUtilization > 95 ? 'yellow' : 'green'}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Annual Budget</p>
                  <p className="text-2xl font-bold text-indigo-700">{formatCurrency(totalBudget)}</p>
                  <p className="text-xs text-gray-400 mt-1">Forecast: {formatCurrency(totalForecast)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-indigo-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">YTD Variance</p>
                  <p className={`text-2xl font-bold ${totalVariance >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    {totalVariance >= 0 ? '+' : '-'}{formatCurrency(totalVariance)}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Budget: {formatCurrency(totalYtdBudget)} | Actual: {formatCurrency(totalYtdActual)}
                  </p>
                </div>
                {totalVariance >= 0 ? (
                  <CheckCircle className="h-8 w-8 text-green-500" />
                ) : (
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Lines Over Budget</p>
                  <p className="text-2xl font-bold text-orange-700">{overBudgetLines}</p>
                  <p className="text-xs text-gray-400 mt-1">of {BUDGET_LINES.length} total lines</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Chart */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-indigo-600" />
              Monthly Budget vs Actual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-3 h-40">
              {MONTHLY_DATA.map(m => (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex items-end justify-center gap-1" style={{ height: 120 }}>
                    <div
                      className="w-5 bg-blue-200 rounded-t"
                      style={{ height: `${(m.budget / maxMonthly) * 120}px` }}
                      title={`Budget: ${formatCurrency(m.budget)}`}
                    />
                    {m.actual > 0 && (
                      <div
                        className={`w-5 rounded-t ${m.actual > m.budget ? 'bg-red-400' : 'bg-green-400'}`}
                        style={{ height: `${(m.actual / maxMonthly) * 120}px` }}
                        title={`Actual: ${formatCurrency(m.actual)}`}
                      />
                    )}
                  </div>
                  <span className="text-xs text-gray-500">{m.month}</span>
                  {m.actual > 0 && (
                    <span className={`text-xs font-medium ${m.actual > m.budget ? 'text-red-600' : 'text-green-600'}`}>
                      {m.actual > m.budget ? '+' : ''}{formatCurrency(m.actual - m.budget)}
                    </span>
                  )}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4 mt-3 justify-center">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-2 rounded bg-blue-200" />
                <span className="text-xs text-gray-500">Budget</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-2 rounded bg-green-400" />
                <span className="text-xs text-gray-500">Under Budget</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-2 rounded bg-red-400" />
                <span className="text-xs text-gray-500">Over Budget</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Department Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-indigo-600" />
              Department Summary
              {selectedDept && (
                <span className="ml-2">
                  <Badge className="bg-indigo-100 text-indigo-700">{selectedDept}</Badge>
                  <button
                    onClick={() => setSelectedDept('')}
                    className="ml-2 text-xs text-blue-600 hover:underline"
                  >
                    Clear
                  </button>
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {deptSummary.map(d => (
                <button
                  key={d.dept}
                  onClick={() => setSelectedDept(selectedDept === d.dept ? '' : d.dept)}
                  className={`border rounded-lg p-3 text-center transition-all ${
                    selectedDept === d.dept
                      ? 'ring-2 ring-indigo-500 border-indigo-300 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                  }`}
                >
                  <p className="text-xs font-semibold text-gray-700 mb-2">{d.dept}</p>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-1">
                    <div
                      className={`h-full rounded-full ${d.variance >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                      style={{ width: `${Math.min(100, (d.actual / d.budget) * 100)}%` }}
                    />
                  </div>
                  <p className={`text-xs font-medium ${d.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {d.variance >= 0 ? '+' : '-'}{formatCurrency(d.variance)}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {Math.round((d.actual / d.budget) * 100)}% utilized
                  </p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Budget Lines Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PiggyBank className="h-5 w-5 text-indigo-600" />
              Budget Lines ({filtered.length})
              {selectedDept && <span className="text-sm font-normal text-gray-500">— {selectedDept}</span>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Department</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Category</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">Annual Budget</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">YTD Budget</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">YTD Actual</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">Variance</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">Var %</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">Forecast</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(line => (
                    <tr key={line.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-700 font-medium">{line.department}</td>
                      <td className="py-3 px-4 text-gray-900">{line.category}</td>
                      <td className="py-3 px-4 text-right font-mono text-gray-600">{formatCurrency(line.annualBudget)}</td>
                      <td className="py-3 px-4 text-right font-mono text-gray-600">{formatCurrency(line.ytdBudget)}</td>
                      <td className="py-3 px-4 text-right font-mono text-gray-900 font-medium">{formatCurrency(line.ytdActual)}</td>
                      <td className={`py-3 px-4 text-right font-mono font-medium ${line.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {line.variance >= 0 ? '+' : '-'}{formatCurrency(line.variance)}
                      </td>
                      <td className={`py-3 px-4 text-right font-medium ${line.variancePct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        <div className="flex items-center justify-end gap-1">
                          {line.variancePct >= 0 ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          {line.variancePct >= 0 ? '+' : ''}{line.variancePct.toFixed(1)}%
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-gray-600">{formatCurrency(line.forecast)}</td>
                      <td className="py-3 px-4 text-center">
                        {line.variance >= 0 ? (
                          <Badge className="bg-green-100 text-green-700">Under</Badge>
                        ) : Math.abs(line.variancePct) > 10 ? (
                          <Badge className="bg-red-100 text-red-700">Alert</Badge>
                        ) : (
                          <Badge className="bg-yellow-100 text-yellow-700">Over</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50 border-t-2 border-gray-300 font-semibold">
                    <td colSpan={2} className="py-3 px-4 text-gray-700">Total</td>
                    <td className="py-3 px-4 text-right font-mono">
                      {formatCurrency(filtered.reduce((s, b) => s + b.annualBudget, 0))}
                    </td>
                    <td className="py-3 px-4 text-right font-mono">
                      {formatCurrency(filtered.reduce((s, b) => s + b.ytdBudget, 0))}
                    </td>
                    <td className="py-3 px-4 text-right font-mono">
                      {formatCurrency(filtered.reduce((s, b) => s + b.ytdActual, 0))}
                    </td>
                    <td className={`py-3 px-4 text-right font-mono ${filtered.reduce((s, b) => s + b.variance, 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {filtered.reduce((s, b) => s + b.variance, 0) >= 0 ? '+' : '-'}
                      {formatCurrency(filtered.reduce((s, b) => s + b.variance, 0))}
                    </td>
                    <td className="py-3 px-4" />
                    <td className="py-3 px-4 text-right font-mono">
                      {formatCurrency(filtered.reduce((s, b) => s + b.forecast, 0))}
                    </td>
                    <td className="py-3 px-4" />
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
