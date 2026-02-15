'use client';

import { useState } from 'react';
import { Gauge, Badge } from '@ims/ui';
import { TrendingUp, TrendingDown, Zap, Flame, Droplets, Sun, Wind, BarChart3 } from 'lucide-react';

interface EnPI {
  id: string;
  name: string;
  unit: string;
  current: number;
  baseline: number;
  target: number;
  trend: number;
}

interface EnergySource {
  name: string;
  scope: 1 | 2;
  consumption: number;
  unit: string;
  cost: number;
  share: number;
  icon: typeof Zap;
  color: string;
}

const ENPIS: EnPI[] = [
  { id: '1', name: 'Energy Intensity', unit: 'kWh/unit', current: 12.3, baseline: 15.0, target: 11.0, trend: -8.5 },
  { id: '2', name: 'Electricity per m²', unit: 'kWh/m²', current: 142, baseline: 165, target: 130, trend: -6.2 },
  { id: '3', name: 'Gas Consumption', unit: 'therms/month', current: 4200, baseline: 5100, target: 3800, trend: -12.1 },
  { id: '4', name: 'Energy Cost Ratio', unit: '£/unit', current: 0.82, baseline: 0.95, target: 0.75, trend: -5.3 },
  { id: '5', name: 'Renewable %', unit: '%', current: 38, baseline: 22, target: 50, trend: 16.0 },
  { id: '6', name: 'Peak Demand', unit: 'kVA', current: 485, baseline: 540, target: 450, trend: -10.2 },
];

const ENERGY_SOURCES: EnergySource[] = [
  { name: 'Grid Electricity', scope: 2, consumption: 245000, unit: 'kWh', cost: 73500, share: 42, icon: Zap, color: 'bg-blue-500' },
  { name: 'Natural Gas', scope: 1, consumption: 52000, unit: 'therms', cost: 36400, share: 28, icon: Flame, color: 'bg-orange-500' },
  { name: 'Solar PV (On-site)', scope: 2, consumption: 85000, unit: 'kWh', cost: 0, share: 15, icon: Sun, color: 'bg-yellow-500' },
  { name: 'Diesel (Generators)', scope: 1, consumption: 4200, unit: 'litres', cost: 5880, share: 8, icon: Droplets, color: 'bg-gray-500' },
  { name: 'Wind (PPA)', scope: 2, consumption: 42000, unit: 'kWh', cost: 4200, share: 7, icon: Wind, color: 'bg-teal-500' },
];

const MONTHLY_DATA = [
  { month: 'Sep', electricity: 22500, gas: 4800, renewable: 9200, total: 36500 },
  { month: 'Oct', electricity: 23100, gas: 5200, renewable: 8800, total: 37100 },
  { month: 'Nov', electricity: 24500, gas: 5800, renewable: 7500, total: 37800 },
  { month: 'Dec', electricity: 25200, gas: 6200, renewable: 6800, total: 38200 },
  { month: 'Jan', electricity: 24800, gas: 6500, renewable: 7200, total: 38500 },
  { month: 'Feb', electricity: 23500, gas: 5500, renewable: 9500, total: 38500 },
];

const SEUS = [
  { name: 'HVAC System', consumption: 98000, share: 32, status: 'optimized' as const },
  { name: 'Production Line 1', consumption: 72000, share: 24, status: 'monitoring' as const },
  { name: 'Compressed Air', consumption: 45000, share: 15, status: 'action-needed' as const },
  { name: 'Lighting', consumption: 35000, share: 11, status: 'optimized' as const },
  { name: 'IT Infrastructure', consumption: 28000, share: 9, status: 'monitoring' as const },
  { name: 'Other', consumption: 27000, share: 9, status: 'monitoring' as const },
];

const seuStatusColors = {
  optimized: 'bg-green-100 text-green-700',
  monitoring: 'bg-blue-100 text-blue-700',
  'action-needed': 'bg-red-100 text-red-700',
};

export default function PerformanceDashboardClient() {
  const [period, setPeriod] = useState<'6m' | '12m' | 'ytd'>('6m');

  // Calculate overall energy performance
  const totalBaseline = ENPIS.reduce((s, e) => s + e.baseline, 0);
  const totalCurrent = ENPIS.reduce((s, e) => s + e.current, 0);
  const overallImprovement = Math.round(((totalBaseline - totalCurrent) / totalBaseline) * 100);

  const totalConsumption = ENERGY_SOURCES.reduce((s, e) => s + e.cost, 0);
  const renewableShare = ENERGY_SOURCES.filter(e => e.name.includes('Solar') || e.name.includes('Wind')).reduce((s, e) => s + e.share, 0);
  const scope1Share = ENERGY_SOURCES.filter(e => e.scope === 1).reduce((s, e) => s + e.share, 0);
  const scope2Share = ENERGY_SOURCES.filter(e => e.scope === 2).reduce((s, e) => s + e.share, 0);

  const maxMonthly = Math.max(...MONTHLY_DATA.map(m => m.total));

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Energy Performance Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">ISO 50001 EnMS — Energy performance indicators, baselines, and significant energy uses</p>
        </div>
        <div className="flex items-center gap-1 border rounded-lg p-0.5">
          {(['6m', '12m', 'ytd'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 rounded text-xs font-medium ${period === p ? 'bg-yellow-100 text-yellow-700' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
            >
              {p === '6m' ? '6 Months' : p === '12m' ? '12 Months' : 'YTD'}
            </button>
          ))}
        </div>
      </div>

      {/* Top-level Gauges */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex flex-col items-center">
          <Gauge value={overallImprovement} max={20} size="lg" label="Energy Improvement" sublabel="vs Baseline" color="green" />
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex flex-col items-center">
          <Gauge value={renewableShare} max={100} size="lg" label="Renewable Energy" sublabel="of total mix" color="blue" />
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex flex-col items-center">
          <Gauge value={72} max={100} size="lg" label="ISO 50001 Compliance" sublabel="clause coverage" color="auto" />
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex flex-col items-center">
          <Gauge value={ENPIS.filter(e => e.current <= e.target).length} max={ENPIS.length} size="lg" label="Targets Met" sublabel={`${ENPIS.filter(e => e.current <= e.target).length}/${ENPIS.length} EnPIs`} color="auto" />
        </div>
      </div>

      {/* EnPI Cards */}
      <div>
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Energy Performance Indicators (EnPIs)</h2>
        <div className="grid grid-cols-3 gap-3">
          {ENPIS.map(enpi => {
            const improvement = ((enpi.baseline - enpi.current) / enpi.baseline * 100);
            const targetProgress = Math.min(100, ((enpi.baseline - enpi.current) / (enpi.baseline - enpi.target)) * 100);
            const onTrack = enpi.current <= enpi.target;

            return (
              <div key={enpi.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{enpi.name}</span>
                  <div className="flex items-center gap-1">
                    {enpi.trend < 0 ? (
                      <TrendingDown className="h-3.5 w-3.5 text-green-600" />
                    ) : (
                      <TrendingUp className="h-3.5 w-3.5 text-green-600" />
                    )}
                    <span className="text-[10px] text-green-600 font-medium">
                      {enpi.trend > 0 ? '+' : ''}{enpi.trend.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="flex items-end gap-2 mb-2">
                  <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{enpi.current}</span>
                  <span className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">{enpi.unit}</span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-gray-400 dark:text-gray-500">Baseline: {enpi.baseline}</span>
                    <span className={`font-medium ${onTrack ? 'text-green-600' : 'text-yellow-600'}`}>
                      Target: {enpi.target}
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${onTrack ? 'bg-green-500' : targetProgress >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: `${Math.max(0, Math.min(100, targetProgress))}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-gray-400 dark:text-gray-500 text-right">
                    {improvement.toFixed(1)}% improvement from baseline
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Energy Consumption Chart + Sources */}
      <div className="grid grid-cols-3 gap-4">
        {/* Monthly trend */}
        <div className="col-span-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Monthly Energy Consumption</h3>
          <div className="flex items-end gap-2 h-48">
            {MONTHLY_DATA.map(m => (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex flex-col-reverse" style={{ height: `${(m.total / maxMonthly) * 160}px` }}>
                  <div className="bg-blue-400 rounded-t-sm" style={{ height: `${(m.electricity / m.total) * 100}%` }} />
                  <div className="bg-orange-400" style={{ height: `${(m.gas / m.total) * 100}%` }} />
                  <div className="bg-green-400 rounded-t-sm" style={{ height: `${(m.renewable / m.total) * 100}%` }} />
                </div>
                <span className="text-[10px] text-gray-500 dark:text-gray-400">{m.month}</span>
                <span className="text-[9px] text-gray-400 dark:text-gray-500">{(m.total / 1000).toFixed(0)}k</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-3 justify-center">
            <div className="flex items-center gap-1.5"><div className="w-3 h-2 rounded bg-blue-400" /><span className="text-[10px] text-gray-500 dark:text-gray-400">Electricity</span></div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-2 rounded bg-orange-400" /><span className="text-[10px] text-gray-500 dark:text-gray-400">Gas</span></div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-2 rounded bg-green-400" /><span className="text-[10px] text-gray-500 dark:text-gray-400">Renewable</span></div>
          </div>
        </div>

        {/* Energy sources */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Energy Sources</h3>
          <div className="space-y-3">
            {ENERGY_SOURCES.map(source => {
              const Icon = source.icon;
              return (
                <div key={source.name} className="flex items-center gap-3">
                  <Icon className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[11px] font-medium text-gray-700 dark:text-gray-300 truncate">{source.name}</span>
                      <Badge variant="secondary" className="text-[8px]">Scope {source.scope}</Badge>
                    </div>
                    <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${source.color}`} style={{ width: `${source.share}%` }} />
                    </div>
                    <div className="flex justify-between text-[9px] text-gray-400 dark:text-gray-500 mt-0.5">
                      <span>{source.consumption.toLocaleString()} {source.unit}</span>
                      <span>{source.share}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 text-xs">
            <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Scope 1:</span><span className="font-medium">{scope1Share}%</span></div>
            <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Scope 2:</span><span className="font-medium">{scope2Share}%</span></div>
            <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Total Cost:</span><span className="font-medium">£{totalConsumption.toLocaleString()}</span></div>
          </div>
        </div>
      </div>

      {/* Significant Energy Uses */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Significant Energy Uses (SEUs)</h3>
        <div className="grid grid-cols-6 gap-3">
          {SEUS.map(seu => (
            <div key={seu.name} className="border border-gray-100 dark:border-gray-700 rounded-lg p-3 text-center">
              <div className="mb-2">
                <Gauge value={seu.share} max={40} size="sm" color="auto" />
              </div>
              <p className="text-[11px] font-medium text-gray-900 dark:text-gray-100">{seu.name}</p>
              <p className="text-[9px] text-gray-400 dark:text-gray-500">{(seu.consumption / 1000).toFixed(0)}k kWh | {seu.share}%</p>
              <span className={`inline-block mt-1 text-[8px] font-medium rounded-full px-1.5 py-0.5 ${seuStatusColors[seu.status]}`}>
                {seu.status.replace('-', ' ')}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Savings tracker */}
      <div className="bg-gradient-to-r from-yellow-50 to-green-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Energy Savings Tracker — 2026</h3>
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-xl font-bold text-green-700">£18,420</p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400">Cost Savings YTD</p>
          </div>
          <div>
            <p className="text-xl font-bold text-blue-700">42,300 kWh</p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400">Energy Saved YTD</p>
          </div>
          <div>
            <p className="text-xl font-bold text-purple-700">18.2 tCO₂e</p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400">Carbon Avoided</p>
          </div>
          <div>
            <p className="text-xl font-bold text-amber-700">3 / 5</p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400">Projects Completed</p>
          </div>
        </div>
      </div>
    </div>
  );
}
