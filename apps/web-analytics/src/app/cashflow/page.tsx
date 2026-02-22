'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import { DollarSign, TrendingUp, TrendingDown, Loader2, Banknote } from 'lucide-react';
import { api } from '@/lib/api';

interface CashFlowForecast {
  id: string;
  weekStart: string;
  inflowForecast: number;
  outflowForecast: number;
  netCashFlow: number;
  cumulativeCashFlow: number;
  confidence: number;
  notes?: string;
}

interface CashPosition {
  id?: string;
  date: string;
  cashOnHand: number;
  overdraftLimit: number;
  availableCredit: number;
}

const MOCK_FORECASTS: CashFlowForecast[] = [
  { id: '1', weekStart: '2026-02-23', inflowForecast: 85000, outflowForecast: 62000, netCashFlow: 23000, cumulativeCashFlow: 143000, confidence: 0.92, notes: 'Customer invoices due' },
  { id: '2', weekStart: '2026-03-02', inflowForecast: 45000, outflowForecast: 71000, netCashFlow: -26000, cumulativeCashFlow: 117000, confidence: 0.85, notes: 'Payroll week' },
  { id: '3', weekStart: '2026-03-09', inflowForecast: 95000, outflowForecast: 55000, netCashFlow: 40000, cumulativeCashFlow: 157000, confidence: 0.88 },
  { id: '4', weekStart: '2026-03-16', inflowForecast: 60000, outflowForecast: 68000, netCashFlow: -8000, cumulativeCashFlow: 149000, confidence: 0.80 },
  { id: '5', weekStart: '2026-03-23', inflowForecast: 75000, outflowForecast: 50000, netCashFlow: 25000, cumulativeCashFlow: 174000, confidence: 0.75 },
  { id: '6', weekStart: '2026-03-30', inflowForecast: 110000, outflowForecast: 80000, netCashFlow: 30000, cumulativeCashFlow: 204000, confidence: 0.70, notes: 'Quarter end' },
];

const MOCK_POSITION: CashPosition = {
  date: new Date().toISOString(),
  cashOnHand: 143000,
  overdraftLimit: 50000,
  availableCredit: 193000,
};

function fmt(n: number) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(n);
}

export default function CashflowPage() {
  const [forecasts, setForecasts] = useState<CashFlowForecast[]>([]);
  const [position, setPosition] = useState<CashPosition | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [fRes, pRes] = await Promise.allSettled([
          api.get('/cashflow'),
          api.get('/cashflow/position'),
        ]);
        setForecasts(fRes.status === 'fulfilled' ? (fRes.value.data.data?.forecasts || MOCK_FORECASTS) : MOCK_FORECASTS);
        setPosition(pRes.status === 'fulfilled' ? (pRes.value.data.data?.position || MOCK_POSITION) : MOCK_POSITION);
      } catch {
        setForecasts(MOCK_FORECASTS);
        setPosition(MOCK_POSITION);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-96">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  const totalInflows = forecasts.reduce((s, f) => s + f.inflowForecast, 0);
  const totalOutflows = forecasts.reduce((s, f) => s + f.outflowForecast, 0);
  const netForecast = totalInflows - totalOutflows;
  const negativeWeeks = forecasts.filter((f) => f.netCashFlow < 0).length;

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Cash Flow Forecast</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Weekly cash flow projections and current position</p>
        </div>

        {/* Cash Position */}
        {position && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <Banknote className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold text-green-700">{fmt(position.cashOnHand)}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Cash on Hand</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">As of {new Date(position.date).toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold text-blue-700">{fmt(position.overdraftLimit)}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Overdraft Limit</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">Facility limit</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-purple-500">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-8 w-8 text-purple-500" />
                  <div>
                    <p className="text-2xl font-bold text-purple-700">{fmt(position.availableCredit)}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Available Credit</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">Cash + overdraft</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Forecast Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Inflows', value: fmt(totalInflows), color: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300' },
            { label: 'Total Outflows', value: fmt(totalOutflows), color: 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300' },
            { label: 'Net Forecast', value: fmt(netForecast), color: netForecast >= 0 ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300' : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300' },
            { label: 'Negative Weeks', value: negativeWeeks.toString(), color: negativeWeeks > 0 ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300' : 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300' },
          ].map((stat) => (
            <div key={stat.label} className={`rounded-lg p-4 ${stat.color}`}>
              <p className="text-xl font-bold">{stat.value}</p>
              <p className="text-sm font-medium mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Forecast Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <DollarSign className="h-5 w-5 text-purple-600" />
              Weekly Forecast ({forecasts.length} weeks)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Week Starting</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Inflows</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Outflows</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Net</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Cumulative</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Confidence</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {forecasts.map((f) => (
                    <tr key={f.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                        {new Date(f.weekStart).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="py-3 px-4 text-right text-green-700">{fmt(f.inflowForecast)}</td>
                      <td className="py-3 px-4 text-right text-red-600">{fmt(f.outflowForecast)}</td>
                      <td className={`py-3 px-4 text-right font-semibold ${f.netCashFlow >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                        <span className="flex items-center justify-end gap-1">
                          {f.netCashFlow >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                          {fmt(f.netCashFlow)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-gray-700 dark:text-gray-300">{fmt(f.cumulativeCashFlow)}</td>
                      <td className="py-3 px-4 text-right">
                        <span className={`text-xs font-medium ${f.confidence >= 0.85 ? 'text-green-600' : f.confidence >= 0.7 ? 'text-amber-600' : 'text-red-600'}`}>
                          {Math.round(f.confidence * 100)}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-400 dark:text-gray-500 text-xs">{f.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
