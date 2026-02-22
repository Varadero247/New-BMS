'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import { Leaf, TrendingUp, AlertCircle, BarChart2, Globe } from 'lucide-react';
import { api } from '@/lib/api';

interface BreakdownItem {
  scope: number;
  category: string;
  tco2e: number;
}

interface ScopeEmissionsData {
  scope1Total: number;
  scope2Total: number;
  scope3Total: number;
  grandTotal: number;
  breakdown: BreakdownItem[];
}

const MOCK_DATA: ScopeEmissionsData = {
  scope1Total: 234.5,
  scope2Total: 1205.8,
  scope3Total: 4782.3,
  grandTotal: 6222.6,
  breakdown: [
    { scope: 1, category: 'Stationary Combustion', tco2e: 189.2 },
    { scope: 1, category: 'Mobile Combustion', tco2e: 45.3 },
    { scope: 2, category: 'Purchased Electricity', tco2e: 1205.8 },
    { scope: 3, category: 'Business Travel', tco2e: 892.4 },
    { scope: 3, category: 'Employee Commuting', tco2e: 1234.1 },
    { scope: 3, category: 'Purchased Goods & Services', tco2e: 2655.8 },
  ],
};

const scopeConfig: Record<number, { label: string; color: string; bg: string; bar: string }> = {
  1: { label: 'Scope 1', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', bar: 'bg-emerald-500' },
  2: { label: 'Scope 2', color: 'text-teal-700', bg: 'bg-teal-50 border-teal-200', bar: 'bg-teal-500' },
  3: { label: 'Scope 3', color: 'text-green-700', bg: 'bg-green-50 border-green-200', bar: 'bg-green-500' },
};

function pct(val: number, total: number) {
  if (!total) return 0;
  return ((val / total) * 100).toFixed(1);
}

function fmt(val: number) {
  return val.toLocaleString('en-GB', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

export default function ScopeEmissionsPage() {
  const [data, setData] = useState<ScopeEmissionsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const r = await api.get('/scope-emissions');
      setData(r.data.data);
    } catch {
      setData(MOCK_DATA);
      setError('Using mock data — API unavailable');
    } finally {
      setLoading(false);
    }
  }

  const grouped = data
    ? [1, 2, 3].map(scope => ({
        scope,
        items: data.breakdown.filter(b => b.scope === scope),
        subtotal: data.breakdown.filter(b => b.scope === scope).reduce((a, b) => a + b.tco2e, 0),
      }))
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-600 rounded-lg">
            <Globe className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">GHG Scope Emissions Dashboard</h1>
            <p className="text-sm text-gray-500">Greenhouse gas aggregation by scope and category (tCO2e)</p>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin h-8 w-8 border-2 border-green-600 border-t-transparent rounded-full" />
          </div>
        ) : data ? (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Scope 1 */}
              <Card className="border-emerald-200 bg-emerald-50">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">Scope 1</span>
                  </div>
                  <div className="text-2xl font-bold text-emerald-800">{fmt(data.scope1Total)}</div>
                  <div className="text-xs text-emerald-600 mt-1">tCO2e</div>
                  <div className="text-xs text-emerald-600 mt-2">{pct(data.scope1Total, data.grandTotal)}% of total</div>
                  <div className="mt-2 h-1.5 bg-emerald-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${pct(data.scope1Total, data.grandTotal)}%` }}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Scope 2 */}
              <Card className="border-teal-200 bg-teal-50">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-teal-500" />
                    <span className="text-xs font-semibold text-teal-700 uppercase tracking-wide">Scope 2</span>
                  </div>
                  <div className="text-2xl font-bold text-teal-800">{fmt(data.scope2Total)}</div>
                  <div className="text-xs text-teal-600 mt-1">tCO2e</div>
                  <div className="text-xs text-teal-600 mt-2">{pct(data.scope2Total, data.grandTotal)}% of total</div>
                  <div className="mt-2 h-1.5 bg-teal-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal-500 rounded-full"
                      style={{ width: `${pct(data.scope2Total, data.grandTotal)}%` }}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Scope 3 */}
              <Card className="border-green-200 bg-green-50">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-xs font-semibold text-green-700 uppercase tracking-wide">Scope 3</span>
                  </div>
                  <div className="text-2xl font-bold text-green-800">{fmt(data.scope3Total)}</div>
                  <div className="text-xs text-green-600 mt-1">tCO2e</div>
                  <div className="text-xs text-green-600 mt-2">{pct(data.scope3Total, data.grandTotal)}% of total</div>
                  <div className="mt-2 h-1.5 bg-green-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${pct(data.scope3Total, data.grandTotal)}%` }}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Grand Total */}
              <Card className="border-gray-200 bg-white">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-3 w-3 text-gray-500" />
                    <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Total</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{fmt(data.grandTotal)}</div>
                  <div className="text-xs text-gray-500 mt-1">tCO2e</div>
                  <div className="text-xs text-gray-500 mt-2">All scopes combined</div>
                  <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gray-400 rounded-full w-full" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Breakdown Table grouped by scope */}
            <Card className="border-green-100">
              <CardHeader>
                <CardTitle className="text-green-800 flex items-center gap-2">
                  <BarChart2 className="h-5 w-5" />
                  Emissions by Category
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Scope</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Category</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-600">tCO2e</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-600">% of Total</th>
                        <th className="py-3 px-4 font-semibold text-gray-600 w-40">Share</th>
                      </tr>
                    </thead>
                    <tbody>
                      {grouped.map(group => (
                        <>
                          {group.items.map((item, i) => (
                            <tr key={`${group.scope}-${i}`} className="border-b border-gray-50 hover:bg-green-50/30">
                              <td className="py-3 px-4">
                                {i === 0 && (
                                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${scopeConfig[group.scope].color} ${scopeConfig[group.scope].bg} border`}>
                                    Scope {group.scope}
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-gray-700">{item.category}</td>
                              <td className="py-3 px-4 text-right font-mono font-semibold text-gray-900">{fmt(item.tco2e)}</td>
                              <td className="py-3 px-4 text-right text-gray-500">{pct(item.tco2e, data.grandTotal)}%</td>
                              <td className="py-3 px-4">
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${scopeConfig[group.scope].bar}`}
                                    style={{ width: `${pct(item.tco2e, data.grandTotal)}%` }}
                                  />
                                </div>
                              </td>
                            </tr>
                          ))}
                          <tr className={`border-b-2 border-gray-200 ${scopeConfig[group.scope].bg}`}>
                            <td className="py-2 px-4" />
                            <td className="py-2 px-4 text-xs font-bold text-gray-600 uppercase">Scope {group.scope} Subtotal</td>
                            <td className="py-2 px-4 text-right font-bold font-mono text-gray-900">{fmt(group.subtotal)}</td>
                            <td className="py-2 px-4 text-right font-semibold text-gray-600">{pct(group.subtotal, data.grandTotal)}%</td>
                            <td className="py-2 px-4" />
                          </tr>
                        </>
                      ))}
                      <tr className="bg-gray-50 border-t-2 border-gray-300">
                        <td className="py-3 px-4" />
                        <td className="py-3 px-4 text-sm font-bold text-gray-900">Grand Total</td>
                        <td className="py-3 px-4 text-right font-bold font-mono text-gray-900">{fmt(data.grandTotal)}</td>
                        <td className="py-3 px-4 text-right font-semibold text-gray-600">100.0%</td>
                        <td className="py-3 px-4" />
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Footer note */}
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Leaf className="h-3 w-3" />
              Emissions reported in metric tonnes of CO2 equivalent (tCO2e). Data aligned with GHG Protocol Corporate Standard.
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
