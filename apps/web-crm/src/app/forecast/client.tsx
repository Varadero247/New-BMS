'use client';

import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Target,
  PieChart,
  DollarSign,
  Percent,
  Filter,
  ArrowUpRight,
  Calendar,
  User,
} from 'lucide-react';

interface Deal {
  id: string;
  name: string;
  company: string;
  value: number;
  probability: number;
  stage: 'Lead' | 'Qualified' | 'Proposal' | 'Negotiation' | 'Closing';
  expectedClose: string;
  owner: string;
}

interface PipelineStage {
  stage: string;
  deals: number;
  value: number;
  conversionRate: number;
}

const mockDeals: Deal[] = [
  {
    id: '1',
    name: 'Enterprise Cloud Suite',
    company: 'TechCorp Inc',
    value: 250000,
    probability: 85,
    stage: 'Proposal',
    expectedClose: '2026-03-15',
    owner: 'Sarah Chen',
  },
  {
    id: '2',
    name: 'Data Analytics Platform',
    company: 'Global Analytics Ltd',
    value: 180000,
    probability: 60,
    stage: 'Negotiation',
    expectedClose: '2026-02-28',
    owner: 'James Wilson',
  },
  {
    id: '3',
    name: 'Digital Transformation',
    company: 'RetailPro Group',
    value: 420000,
    probability: 45,
    stage: 'Proposal',
    expectedClose: '2026-04-10',
    owner: 'Emma Rodriguez',
  },
  {
    id: '4',
    name: 'Security Infrastructure',
    company: 'FinanceSecure Co',
    value: 195000,
    probability: 90,
    stage: 'Closing',
    expectedClose: '2026-02-20',
    owner: 'Michael Zhang',
  },
  {
    id: '5',
    name: 'API Integration Suite',
    company: 'DevFlow Systems',
    value: 85000,
    probability: 70,
    stage: 'Qualified',
    expectedClose: '2026-03-20',
    owner: 'Sarah Chen',
  },
  {
    id: '6',
    name: 'Marketing Automation',
    company: 'BrandMax Solutions',
    value: 120000,
    probability: 50,
    stage: 'Proposal',
    expectedClose: '2026-03-25',
    owner: 'David Kim',
  },
  {
    id: '7',
    name: 'Customer Portal',
    company: 'ServiceHub Corp',
    value: 95000,
    probability: 35,
    stage: 'Lead',
    expectedClose: '2026-04-30',
    owner: 'Jessica Lee',
  },
  {
    id: '8',
    name: 'Warehouse Management',
    company: 'LogisticsPro Ltd',
    value: 310000,
    probability: 55,
    stage: 'Proposal',
    expectedClose: '2026-04-05',
    owner: 'Robert Brown',
  },
  {
    id: '9',
    name: 'HR Management System',
    company: 'PeopleCare Inc',
    value: 150000,
    probability: 75,
    stage: 'Qualified',
    expectedClose: '2026-03-10',
    owner: 'Sarah Chen',
  },
  {
    id: '10',
    name: 'Mobile App Development',
    company: 'AppWorks Studio',
    value: 205000,
    probability: 40,
    stage: 'Lead',
    expectedClose: '2026-05-15',
    owner: 'Amanda Foster',
  },
];

const pipelineStages: PipelineStage[] = [
  { stage: 'Lead', deals: 8, value: 420000, conversionRate: 0 },
  { stage: 'Qualified', deals: 6, value: 650000, conversionRate: 75 },
  { stage: 'Proposal', deals: 5, value: 890000, conversionRate: 60 },
  { stage: 'Negotiation', deals: 3, value: 780000, conversionRate: 65 },
  { stage: 'Closing', deals: 2, value: 460000, conversionRate: 80 },
];

const monthlyForecastData = [
  { month: 'Feb', weighted: 320000, unweighted: 520000 },
  { month: 'Mar', weighted: 410000, unweighted: 680000 },
  { month: 'Apr', weighted: 380000, unweighted: 620000 },
  { month: 'May', weighted: 290000, unweighted: 450000 },
  { month: 'Jun', weighted: 220000, unweighted: 320000 },
  { month: 'Jul', weighted: 180000, unweighted: 250000 },
];

const stageColors = {
  Lead: '#3b82f6',
  Qualified: '#06b6d4',
  Proposal: '#8b5cf6',
  Negotiation: '#f59e0b',
  Closing: '#10b981',
};

export default function ForecastClient() {
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'value' | 'probability' | 'date'>('value');

  const totalPipeline = mockDeals.reduce((sum, deal) => sum + deal.value, 0);
  const weightedForecast = mockDeals.reduce((sum, deal) => sum + deal.value * (deal.probability / 100), 0);
  const avgDealSize = Math.round(totalPipeline / mockDeals.length);
  const winRate = 62;

  const filteredDeals = useMemo(() => {
    let filtered = mockDeals;
    if (selectedStage) {
      filtered = filtered.filter((deal) => deal.stage === selectedStage);
    }

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'probability':
          return b.probability - a.probability;
        case 'date':
          return new Date(a.expectedClose).getTime() - new Date(b.expectedClose).getTime();
        case 'value':
        default:
          return b.value - a.value;
      }
    });
  }, [selectedStage, sortBy]);

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `£${(value / 1000000).toFixed(1)}M`;
    return `£${(value / 1000).toFixed(0)}k`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Sales Forecast</h1>
          <p className="text-slate-600">Pipeline analysis and revenue projection for the next 6 months</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {/* Total Pipeline */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-slate-600">Total Pipeline</p>
              <DollarSign className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalPipeline)}</p>
            <div className="mt-2 flex items-center text-xs text-blue-600">
              <ArrowUpRight className="w-3 h-3 mr-1" />
              24 deals
            </div>
          </div>

          {/* Weighted Forecast */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-slate-600">Weighted Forecast</p>
              <TrendingUp className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{formatCurrency(weightedForecast)}</p>
            <div className="mt-2 flex items-center text-xs text-purple-600">
              <ArrowUpRight className="w-3 h-3 mr-1" />
              {((weightedForecast / totalPipeline) * 100).toFixed(0)}% of pipeline
            </div>
          </div>

          {/* Deals in Pipeline */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-cyan-500">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-slate-600">Deals in Pipeline</p>
              <Target className="w-5 h-5 text-cyan-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{mockDeals.length}</p>
            <div className="mt-2 text-xs text-cyan-600">
              Average deal age: 3.2 weeks
            </div>
          </div>

          {/* Average Deal Size */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-amber-500">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-slate-600">Average Deal Size</p>
              <PieChart className="w-5 h-5 text-amber-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{formatCurrency(avgDealSize)}</p>
            <div className="mt-2 text-xs text-amber-600">
              Range: £85k - £420k
            </div>
          </div>

          {/* Win Rate */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-emerald-500">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-slate-600">Win Rate</p>
              <Percent className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{winRate}%</p>
            <div className="mt-2 text-xs text-emerald-600">
              Industry avg: 55%
            </div>
          </div>
        </div>

        {/* Monthly Forecast Chart */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-slate-900 mb-6">6-Month Forecast</h2>
          <div className="flex items-center gap-4 mb-4 text-xs">
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-violet-500" /><span className="text-slate-600">Weighted Forecast</span></div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-slate-300" /><span className="text-slate-600">Unweighted Pipeline</span></div>
          </div>
          <div className="flex items-end gap-4 h-64">
            {monthlyForecastData.map((d) => {
              const maxVal = Math.max(...monthlyForecastData.map((m) => m.unweighted));
              return (
                <div key={d.month} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                  <div className="w-full flex gap-1 items-end flex-1">
                    <div className="flex-1 bg-violet-500 rounded-t-md transition-all" style={{ height: `${(d.weighted / maxVal) * 100}%` }} title={`Weighted: ${formatCurrency(d.weighted)}`} />
                    <div className="flex-1 bg-slate-300 rounded-t-md transition-all" style={{ height: `${(d.unweighted / maxVal) * 100}%` }} title={`Unweighted: ${formatCurrency(d.unweighted)}`} />
                  </div>
                  <span className="text-xs text-slate-500 font-medium">{d.month}</span>
                </div>
              );
            })}
          </div>
          <div className="flex items-end gap-4 mt-2">
            {monthlyForecastData.map((d) => (
              <div key={d.month} className="flex-1 text-center">
                <p className="text-xs text-violet-600 font-medium">{formatCurrency(d.weighted)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Pipeline by Stage - Funnel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Funnel Visualization */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Pipeline by Stage</h2>
            <div className="space-y-4">
              {pipelineStages.map((stage, index) => {
                const maxWidth = 100;
                const width = ((5 - index) / 5) * maxWidth;
                return (
                  <div key={stage.stage} className="space-y-2">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-semibold text-slate-900">{stage.stage}</p>
                        <p className="text-xs text-slate-600">
                          {stage.deals} deals • {formatCurrency(stage.value)}
                        </p>
                      </div>
                      {stage.conversionRate > 0 && (
                        <p className="text-xs font-medium text-emerald-600">{stage.conversionRate}% conv.</p>
                      )}
                    </div>
                    <div className="flex items-center">
                      <div
                        className="h-12 rounded-lg flex items-center justify-center text-white font-semibold transition-all"
                        style={{
                          width: `${width}%`,
                          backgroundColor:
                            stageColors[stage.stage as keyof typeof stageColors] || '#64748b',
                        }}
                      >
                        {stage.deals}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stage Distribution Stats */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Stage Distribution</h2>
            <div className="space-y-4">
              {pipelineStages.map((stage) => {
                const percentage = (stage.value / totalPipeline) * 100;
                return (
                  <div key={stage.stage}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700">{stage.stage}</span>
                      <span className="text-sm font-semibold text-slate-900">{percentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2.5">
                      <div
                        className="h-2.5 rounded-full transition-all"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor:
                            stageColors[stage.stage as keyof typeof stageColors] || '#64748b',
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Deals Table */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">All Deals ({filteredDeals.length})</h2>
            <div className="flex items-center gap-3">
              <select
                value={selectedStage || ''}
                onChange={(e) => setSelectedStage(e.target.value || null)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Stages</option>
                {pipelineStages.map((s) => (
                  <option key={s.stage} value={s.stage}>
                    {s.stage}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'value' | 'probability' | 'date')}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="value">Sort by Value</option>
                <option value="probability">Sort by Probability</option>
                <option value="date">Sort by Close Date</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Deal Name</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Company</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-700">Value</th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-700">Probability</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-700">Weighted Value</th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-700">Stage</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Expected Close</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Owner</th>
                </tr>
              </thead>
              <tbody>
                {filteredDeals.map((deal) => {
                  const weightedValue = deal.value * (deal.probability / 100);
                  return (
                    <tr key={deal.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-900">{deal.name}</td>
                      <td className="px-4 py-3 text-slate-700">{deal.company}</td>
                      <td className="px-4 py-3 text-right text-slate-900 font-semibold">
                        {formatCurrency(deal.value)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-full bg-slate-200 rounded-full h-2 max-w-xs">
                            <div
                              className="h-2 rounded-full bg-blue-500 transition-all"
                              style={{ width: `${deal.probability}%` }}
                            ></div>
                          </div>
                          <span className="font-medium text-slate-900 min-w-max">{deal.probability}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-slate-900 font-semibold">
                        {formatCurrency(weightedValue)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-white"
                          style={{
                            backgroundColor:
                              stageColors[deal.stage as keyof typeof stageColors] || '#64748b',
                          }}
                        >
                          {deal.stage}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-700 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        {new Date(deal.expectedClose).toLocaleDateString('en-GB', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="px-4 py-3 text-slate-700 flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-400" />
                        {deal.owner}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
