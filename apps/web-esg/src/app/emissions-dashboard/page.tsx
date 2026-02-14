'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@ims/ui';

interface EmissionRecord {
  month: string;
  scope1: number;
  scope2: number;
  scope3: number;
}

const MONTHLY_DATA: EmissionRecord[] = [
  { month: 'Jan', scope1: 245, scope2: 189, scope3: 412 },
  { month: 'Feb', scope1: 238, scope2: 175, scope3: 398 },
  { month: 'Mar', scope1: 256, scope2: 192, scope3: 445 },
  { month: 'Apr', scope1: 231, scope2: 168, scope3: 389 },
  { month: 'May', scope1: 224, scope2: 155, scope3: 376 },
  { month: 'Jun', scope1: 218, scope2: 148, scope3: 365 },
  { month: 'Jul', scope1: 212, scope2: 142, scope3: 358 },
  { month: 'Aug', scope1: 208, scope2: 138, scope3: 345 },
  { month: 'Sep', scope1: 215, scope2: 145, scope3: 362 },
  { month: 'Oct', scope1: 222, scope2: 152, scope3: 378 },
  { month: 'Nov', scope1: 235, scope2: 165, scope3: 395 },
  { month: 'Dec', scope1: 242, scope2: 172, scope3: 408 },
];

const SCOPE_COLORS = {
  scope1: { fill: '#DC2626', label: 'Scope 1 (Direct)', description: 'Owned/controlled sources: fleet vehicles, boilers, fugitive emissions' },
  scope2: { fill: '#F59E0B', label: 'Scope 2 (Indirect)', description: 'Purchased electricity, steam, heating, cooling' },
  scope3: { fill: '#6366F1', label: 'Scope 3 (Value Chain)', description: 'Business travel, commuting, waste, purchased goods, logistics' },
};

const INTENSITY_METRICS = [
  { label: 'tCO2e / employee', value: 4.8, target: 4.0, unit: 'tCO2e' },
  { label: 'tCO2e / £M revenue', value: 12.3, target: 10.0, unit: 'tCO2e' },
  { label: 'tCO2e / m² floor area', value: 0.045, target: 0.035, unit: 'tCO2e' },
];

export default function EmissionsDashboardPage() {
  const [year, setYear] = useState('2026');
  const [scopeFilter, setScopeFilter] = useState<'all' | 'scope1' | 'scope2' | 'scope3'>('all');

  const totals = useMemo(() => {
    const s1 = MONTHLY_DATA.reduce((sum, d) => sum + d.scope1, 0);
    const s2 = MONTHLY_DATA.reduce((sum, d) => sum + d.scope2, 0);
    const s3 = MONTHLY_DATA.reduce((sum, d) => sum + d.scope3, 0);
    return { scope1: s1, scope2: s2, scope3: s3, total: s1 + s2 + s3 };
  }, []);

  const maxMonthly = Math.max(...MONTHLY_DATA.map(d => d.scope1 + d.scope2 + d.scope3));
  const yoyChange = -6.2; // Mock YoY change

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Emissions Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">GHG Protocol Scope 1/2/3 emissions overview</p>
        </div>
        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="px-3 py-2 text-sm rounded-md border border-gray-300 bg-white"
        >
          <option value="2026">2026</option>
          <option value="2025">2025</option>
          <option value="2024">2024</option>
        </select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Total Emissions</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{totals.total.toLocaleString()}</p>
            <p className="text-xs text-gray-500">tCO2e</p>
            <p className={`text-xs font-medium mt-1 ${yoyChange < 0 ? 'text-green-600' : 'text-red-600'}`}>
              {yoyChange > 0 ? '+' : ''}{yoyChange}% YoY
            </p>
          </CardContent>
        </Card>
        {(['scope1', 'scope2', 'scope3'] as const).map(scope => {
          const config = SCOPE_COLORS[scope];
          const value = totals[scope];
          const pct = ((value / totals.total) * 100).toFixed(1);
          return (
            <Card key={scope}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: config.fill }} />
                  <p className="text-sm text-gray-500">{config.label.split(' (')[0]}</p>
                </div>
                <p className="text-2xl font-bold text-gray-900 mt-1">{value.toLocaleString()}</p>
                <p className="text-xs text-gray-500">{pct}% of total</p>
              </CardContent>
            </Card>
          );
        })}
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Net Zero Target</p>
            <p className="text-2xl font-bold text-green-600 mt-1">2040</p>
            <p className="text-xs text-gray-500">SBTi aligned</p>
            <p className="text-xs font-medium text-blue-600 mt-1">On track</p>
          </CardContent>
        </Card>
      </div>

      {/* Scope Filter */}
      <div className="flex gap-2">
        {(['all', 'scope1', 'scope2', 'scope3'] as const).map(f => (
          <button
            key={f}
            onClick={() => setScopeFilter(f)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md border ${
              scopeFilter === f ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {f === 'all' ? 'All Scopes' : SCOPE_COLORS[f].label}
          </button>
        ))}
      </div>

      {/* Monthly Bar Chart (CSS-based) */}
      <Card>
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Monthly Emissions (tCO2e)</h3>
          <div className="flex items-end gap-2 h-48">
            {MONTHLY_DATA.map((d) => {
              const showScope1 = scopeFilter === 'all' || scopeFilter === 'scope1';
              const showScope2 = scopeFilter === 'all' || scopeFilter === 'scope2';
              const showScope3 = scopeFilter === 'all' || scopeFilter === 'scope3';
              const total = (showScope1 ? d.scope1 : 0) + (showScope2 ? d.scope2 : 0) + (showScope3 ? d.scope3 : 0);
              const height = (total / maxMonthly) * 100;

              return (
                <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] font-mono text-gray-500">{total}</span>
                  <div className="w-full flex flex-col-reverse rounded-t overflow-hidden" style={{ height: `${height}%` }}>
                    {showScope1 && <div style={{ height: `${(d.scope1 / total) * 100}%`, backgroundColor: SCOPE_COLORS.scope1.fill }} />}
                    {showScope2 && <div style={{ height: `${(d.scope2 / total) * 100}%`, backgroundColor: SCOPE_COLORS.scope2.fill }} />}
                    {showScope3 && <div style={{ height: `${(d.scope3 / total) * 100}%`, backgroundColor: SCOPE_COLORS.scope3.fill }} />}
                  </div>
                  <span className="text-[10px] text-gray-500">{d.month}</span>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t">
            {Object.entries(SCOPE_COLORS).map(([key, config]) => (
              <div key={key} className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded" style={{ backgroundColor: config.fill }} />
                <span className="text-xs text-gray-600">{config.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-6">
        {/* Carbon Intensity */}
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Carbon Intensity Metrics</h3>
            <div className="space-y-4">
              {INTENSITY_METRICS.map(m => {
                const pct = Math.min(100, (m.value / (m.target * 1.5)) * 100);
                const isOnTarget = m.value <= m.target;
                return (
                  <div key={m.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">{m.label}</span>
                      <span className={`text-xs font-bold ${isOnTarget ? 'text-green-600' : 'text-orange-600'}`}>
                        {m.value} / {m.target} target
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${isOnTarget ? 'bg-green-500' : 'bg-orange-500'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Scope Breakdown */}
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Emission Sources Breakdown</h3>
            <div className="space-y-3">
              {[
                { source: 'Natural Gas (Boilers)', scope: 'Scope 1', value: 890, pct: 15.2 },
                { source: 'Fleet Vehicles (Diesel)', scope: 'Scope 1', value: 1856, pct: 31.7 },
                { source: 'Purchased Electricity', scope: 'Scope 2', value: 1949, pct: 33.3 },
                { source: 'Business Travel (Air)', scope: 'Scope 3', value: 1245, pct: 21.3 },
                { source: 'Employee Commuting', scope: 'Scope 3', value: 876, pct: 15.0 },
                { source: 'Purchased Goods', scope: 'Scope 3', value: 2210, pct: 37.8 },
                { source: 'Waste Disposal', scope: 'Scope 3', value: 400, pct: 6.8 },
              ].map(item => (
                <div key={item.source} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-700 truncate">{item.source}</span>
                      <span className="text-xs font-mono text-gray-500 ml-2">{item.value} tCO2e</span>
                    </div>
                    <div className="mt-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${item.pct}%`,
                          backgroundColor: item.scope === 'Scope 1' ? '#DC2626' : item.scope === 'Scope 2' ? '#F59E0B' : '#6366F1'
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
