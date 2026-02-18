'use client';

import { useState, useMemo } from 'react';
import { Badge } from '@ims/ui';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Award,
  Star,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';

interface ScorecardPeriod {
  period: string;
  quality: number;
  delivery: number;
  responsiveness: number;
  cost: number;
  compliance: number;
  overall: number;
  grade: string;
}

interface SupplierScorecard {
  id: string;
  name: string;
  category: string;
  tier: 'Strategic' | 'Preferred' | 'Approved' | 'Conditional';
  currentScore: number;
  previousScore: number;
  grade: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  history: ScorecardPeriod[];
  ncrCount: number;
  onTimeDelivery: number;
  qualityPpm: number;
  leadTimeDays: number;
}

const MOCK_SUPPLIERS: SupplierScorecard[] = [
  {
    id: 'SUP-001',
    name: 'Precision Parts Ltd',
    category: 'Raw Materials',
    tier: 'Strategic',
    currentScore: 92,
    previousScore: 88,
    grade: 'A',
    riskLevel: 'Low',
    ncrCount: 1,
    onTimeDelivery: 97,
    qualityPpm: 150,
    leadTimeDays: 5,
    history: [
      {
        period: 'Q3 2025',
        quality: 85,
        delivery: 88,
        responsiveness: 82,
        cost: 90,
        compliance: 87,
        overall: 86,
        grade: 'B',
      },
      {
        period: 'Q4 2025',
        quality: 88,
        delivery: 90,
        responsiveness: 85,
        cost: 88,
        compliance: 90,
        overall: 88,
        grade: 'B',
      },
      {
        period: 'Q1 2026',
        quality: 93,
        delivery: 95,
        responsiveness: 88,
        cost: 90,
        compliance: 94,
        overall: 92,
        grade: 'A',
      },
    ],
  },
  {
    id: 'SUP-002',
    name: 'FastShip Logistics',
    category: 'Logistics',
    tier: 'Preferred',
    currentScore: 85,
    previousScore: 87,
    grade: 'B',
    riskLevel: 'Low',
    ncrCount: 2,
    onTimeDelivery: 94,
    qualityPpm: 0,
    leadTimeDays: 3,
    history: [
      {
        period: 'Q3 2025',
        quality: 90,
        delivery: 82,
        responsiveness: 88,
        cost: 85,
        compliance: 86,
        overall: 86,
        grade: 'B',
      },
      {
        period: 'Q4 2025',
        quality: 88,
        delivery: 86,
        responsiveness: 90,
        cost: 84,
        compliance: 88,
        overall: 87,
        grade: 'B',
      },
      {
        period: 'Q1 2026',
        quality: 85,
        delivery: 84,
        responsiveness: 88,
        cost: 83,
        compliance: 85,
        overall: 85,
        grade: 'B',
      },
    ],
  },
  {
    id: 'SUP-003',
    name: 'TechCoat Surfaces',
    category: 'Surface Treatment',
    tier: 'Approved',
    currentScore: 78,
    previousScore: 72,
    grade: 'C',
    riskLevel: 'Medium',
    ncrCount: 4,
    onTimeDelivery: 88,
    qualityPpm: 450,
    leadTimeDays: 10,
    history: [
      {
        period: 'Q3 2025',
        quality: 68,
        delivery: 75,
        responsiveness: 70,
        cost: 78,
        compliance: 72,
        overall: 72,
        grade: 'C',
      },
      {
        period: 'Q4 2025',
        quality: 70,
        delivery: 73,
        responsiveness: 72,
        cost: 76,
        compliance: 70,
        overall: 72,
        grade: 'C',
      },
      {
        period: 'Q1 2026',
        quality: 78,
        delivery: 80,
        responsiveness: 76,
        cost: 78,
        compliance: 78,
        overall: 78,
        grade: 'C',
      },
    ],
  },
  {
    id: 'SUP-004',
    name: 'Global Metals Inc',
    category: 'Raw Materials',
    tier: 'Strategic',
    currentScore: 95,
    previousScore: 93,
    grade: 'A',
    riskLevel: 'Low',
    ncrCount: 0,
    onTimeDelivery: 99,
    qualityPpm: 50,
    leadTimeDays: 7,
    history: [
      {
        period: 'Q3 2025',
        quality: 92,
        delivery: 94,
        responsiveness: 90,
        cost: 91,
        compliance: 93,
        overall: 92,
        grade: 'A',
      },
      {
        period: 'Q4 2025',
        quality: 93,
        delivery: 95,
        responsiveness: 92,
        cost: 90,
        compliance: 94,
        overall: 93,
        grade: 'A',
      },
      {
        period: 'Q1 2026',
        quality: 96,
        delivery: 97,
        responsiveness: 93,
        cost: 92,
        compliance: 95,
        overall: 95,
        grade: 'A',
      },
    ],
  },
  {
    id: 'SUP-005',
    name: 'PackRight Solutions',
    category: 'Packaging',
    tier: 'Approved',
    currentScore: 71,
    previousScore: 76,
    grade: 'C',
    riskLevel: 'High',
    ncrCount: 6,
    onTimeDelivery: 82,
    qualityPpm: 800,
    leadTimeDays: 4,
    history: [
      {
        period: 'Q3 2025',
        quality: 78,
        delivery: 80,
        responsiveness: 75,
        cost: 82,
        compliance: 78,
        overall: 78,
        grade: 'C',
      },
      {
        period: 'Q4 2025',
        quality: 76,
        delivery: 77,
        responsiveness: 73,
        cost: 80,
        compliance: 74,
        overall: 76,
        grade: 'C',
      },
      {
        period: 'Q1 2026',
        quality: 70,
        delivery: 72,
        responsiveness: 68,
        cost: 78,
        compliance: 68,
        overall: 71,
        grade: 'C',
      },
    ],
  },
  {
    id: 'SUP-006',
    name: 'ElectroComp Systems',
    category: 'Electronic Components',
    tier: 'Preferred',
    currentScore: 89,
    previousScore: 86,
    grade: 'B',
    riskLevel: 'Low',
    ncrCount: 1,
    onTimeDelivery: 96,
    qualityPpm: 200,
    leadTimeDays: 8,
    history: [
      {
        period: 'Q3 2025',
        quality: 84,
        delivery: 88,
        responsiveness: 85,
        cost: 83,
        compliance: 85,
        overall: 85,
        grade: 'B',
      },
      {
        period: 'Q4 2025',
        quality: 86,
        delivery: 87,
        responsiveness: 86,
        cost: 84,
        compliance: 86,
        overall: 86,
        grade: 'B',
      },
      {
        period: 'Q1 2026',
        quality: 90,
        delivery: 91,
        responsiveness: 88,
        cost: 86,
        compliance: 90,
        overall: 89,
        grade: 'B',
      },
    ],
  },
  {
    id: 'SUP-007',
    name: 'QuickMold Tooling',
    category: 'Tooling',
    tier: 'Conditional',
    currentScore: 62,
    previousScore: 58,
    grade: 'D',
    riskLevel: 'High',
    ncrCount: 8,
    onTimeDelivery: 75,
    qualityPpm: 1200,
    leadTimeDays: 15,
    history: [
      {
        period: 'Q3 2025',
        quality: 55,
        delivery: 60,
        responsiveness: 58,
        cost: 65,
        compliance: 52,
        overall: 58,
        grade: 'D',
      },
      {
        period: 'Q4 2025',
        quality: 56,
        delivery: 58,
        responsiveness: 60,
        cost: 62,
        compliance: 54,
        overall: 58,
        grade: 'D',
      },
      {
        period: 'Q1 2026',
        quality: 62,
        delivery: 65,
        responsiveness: 60,
        cost: 64,
        compliance: 58,
        overall: 62,
        grade: 'D',
      },
    ],
  },
];

const gradeConfig: Record<string, { bg: string; text: string }> = {
  A: { bg: 'bg-green-100', text: 'text-green-700' },
  B: { bg: 'bg-blue-100', text: 'text-blue-700' },
  C: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  D: { bg: 'bg-red-100', text: 'text-red-700' },
};

const tierConfig: Record<string, string> = {
  Strategic: 'bg-purple-100 text-purple-700',
  Preferred: 'bg-blue-100 text-blue-700',
  Approved: 'bg-gray-100 dark:bg-gray-800 text-gray-700',
  Conditional: 'bg-red-100 text-red-700',
};

const riskConfig: Record<string, string> = {
  Low: 'bg-green-100 text-green-700',
  Medium: 'bg-yellow-100 text-yellow-700',
  High: 'bg-red-100 text-red-700',
};

function ScoreBar({ value, label }: { value: number; label: string }) {
  const color =
    value >= 90
      ? 'bg-green-500'
      : value >= 75
        ? 'bg-blue-500'
        : value >= 60
          ? 'bg-yellow-500'
          : 'bg-red-500';
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-gray-500 dark:text-gray-400 w-24 text-right">{label}</span>
      <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs font-medium text-gray-700 dark:text-gray-300 w-8">{value}</span>
    </div>
  );
}

export default function ScorecardDashboardClient() {
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierScorecard | null>(null);
  const [filterTier, setFilterTier] = useState<string>('');
  const [filterRisk, setFilterRisk] = useState<string>('');
  const [sortBy, setSortBy] = useState<'score' | 'name' | 'risk'>('score');

  const suppliers = useMemo(() => {
    let filtered = MOCK_SUPPLIERS.filter((s) => {
      if (filterTier && s.tier !== filterTier) return false;
      if (filterRisk && s.riskLevel !== filterRisk) return false;
      return true;
    });
    if (sortBy === 'score') filtered.sort((a, b) => b.currentScore - a.currentScore);
    else if (sortBy === 'name') filtered.sort((a, b) => a.name.localeCompare(b.name));
    else
      filtered.sort((a, b) => {
        const r: Record<string, number> = { High: 0, Medium: 1, Low: 2 };
        return (r[a.riskLevel] ?? 2) - (r[b.riskLevel] ?? 2);
      });
    return filtered;
  }, [filterTier, filterRisk, sortBy]);

  // Summary
  const avgScore = Math.round(
    MOCK_SUPPLIERS.reduce((s, sup) => s + sup.currentScore, 0) / MOCK_SUPPLIERS.length
  );
  const gradeA = MOCK_SUPPLIERS.filter((s) => s.grade === 'A').length;
  const highRisk = MOCK_SUPPLIERS.filter((s) => s.riskLevel === 'High').length;
  const totalNCRs = MOCK_SUPPLIERS.reduce((s, sup) => s + sup.ncrCount, 0);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Supplier Scorecard Dashboard
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Performance overview of all suppliers — weighted KPIs across quality, delivery,
            responsiveness, cost & compliance
          </p>
        </div>
        <a
          href="/scorecards"
          className="px-3 py-1.5 text-xs font-medium rounded-md border border-gray-300 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-800"
        >
          Table View
        </a>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center">
          <Award className="h-6 w-6 text-cyan-600 mx-auto mb-1" />
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{avgScore}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Avg Score</p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center">
          <Star className="h-6 w-6 text-green-600 mx-auto mb-1" />
          <p className="text-2xl font-bold text-green-700">{gradeA}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Grade A Suppliers</p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center">
          <AlertTriangle className="h-6 w-6 text-red-600 mx-auto mb-1" />
          <p className="text-2xl font-bold text-red-700">{highRisk}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">High Risk</p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center">
          <AlertTriangle className="h-6 w-6 text-orange-600 mx-auto mb-1" />
          <p className="text-2xl font-bold text-orange-700">{totalNCRs}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Open NCRs</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5">
        <span className="text-xs text-gray-500 dark:text-gray-400">Tier:</span>
        <select
          value={filterTier}
          onChange={(e) => setFilterTier(e.target.value)}
          className="text-xs border rounded px-2 py-1"
        >
          <option value="">All</option>
          <option value="Strategic">Strategic</option>
          <option value="Preferred">Preferred</option>
          <option value="Approved">Approved</option>
          <option value="Conditional">Conditional</option>
        </select>
        <span className="text-xs text-gray-500 dark:text-gray-400">Risk:</span>
        <select
          value={filterRisk}
          onChange={(e) => setFilterRisk(e.target.value)}
          className="text-xs border rounded px-2 py-1"
        >
          <option value="">All</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
        <span className="text-xs text-gray-500 dark:text-gray-400">Sort:</span>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="text-xs border rounded px-2 py-1"
        >
          <option value="score">Score (High to Low)</option>
          <option value="name">Name (A-Z)</option>
          <option value="risk">Risk Level</option>
        </select>
        <span className="ml-auto text-xs text-gray-400 dark:text-gray-500">
          {suppliers.length} suppliers
        </span>
      </div>

      {/* Supplier cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {suppliers.map((supplier) => {
          const trend = supplier.currentScore - supplier.previousScore;
          const isSelected = selectedSupplier?.id === supplier.id;
          const latestPeriod = supplier.history[supplier.history.length - 1];

          return (
            <div
              key={supplier.id}
              onClick={() => setSelectedSupplier(isSelected ? null : supplier)}
              className={`bg-white dark:bg-gray-900 border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${isSelected ? 'ring-2 ring-cyan-500 border-cyan-300' : 'border-gray-200 dark:border-gray-700'}`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {supplier.name}
                  </h3>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500">
                    {supplier.category} | {supplier.id}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-medium rounded-full px-2 py-0.5 ${tierConfig[supplier.tier]}`}
                  >
                    {supplier.tier}
                  </span>
                  <span
                    className={`text-[10px] font-medium rounded-full px-2 py-0.5 ${riskConfig[supplier.riskLevel]}`}
                  >
                    {supplier.riskLevel}
                  </span>
                </div>
              </div>

              {/* Score + Grade */}
              <div className="flex items-center gap-4 mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className={`h-12 w-12 rounded-full flex items-center justify-center ${gradeConfig[supplier.grade]?.bg || 'bg-gray-100 dark:bg-gray-800'}`}
                  >
                    <span
                      className={`text-lg font-bold ${gradeConfig[supplier.grade]?.text || 'text-gray-700 dark:text-gray-300'}`}
                    >
                      {supplier.grade}
                    </span>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      {supplier.currentScore}
                    </p>
                    <div className="flex items-center gap-1">
                      {trend > 0 ? (
                        <TrendingUp className="h-3 w-3 text-green-600" />
                      ) : trend < 0 ? (
                        <TrendingDown className="h-3 w-3 text-red-600" />
                      ) : (
                        <Minus className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                      )}
                      <span
                        className={`text-[10px] ${trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-400'}`}
                      >
                        {trend > 0 ? '+' : ''}
                        {trend} vs last quarter
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick KPIs */}
                <div className="ml-auto grid grid-cols-2 gap-x-4 gap-y-1 text-[10px]">
                  <div>
                    <span className="text-gray-400 dark:text-gray-500">OTD:</span>{' '}
                    <span
                      className={`font-medium ${supplier.onTimeDelivery >= 95 ? 'text-green-700' : supplier.onTimeDelivery >= 85 ? 'text-yellow-700' : 'text-red-700'}`}
                    >
                      {supplier.onTimeDelivery}%
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 dark:text-gray-500">PPM:</span>{' '}
                    <span
                      className={`font-medium ${supplier.qualityPpm <= 200 ? 'text-green-700' : supplier.qualityPpm <= 500 ? 'text-yellow-700' : 'text-red-700'}`}
                    >
                      {supplier.qualityPpm}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 dark:text-gray-500">NCRs:</span>{' '}
                    <span
                      className={`font-medium ${supplier.ncrCount === 0 ? 'text-green-700' : supplier.ncrCount <= 2 ? 'text-yellow-700' : 'text-red-700'}`}
                    >
                      {supplier.ncrCount}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 dark:text-gray-500">Lead:</span>{' '}
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {supplier.leadTimeDays}d
                    </span>
                  </div>
                </div>
              </div>

              {/* Score breakdown bars */}
              {latestPeriod && (
                <div className="space-y-1">
                  <ScoreBar value={latestPeriod.quality} label="Quality" />
                  <ScoreBar value={latestPeriod.delivery} label="Delivery" />
                  <ScoreBar value={latestPeriod.responsiveness} label="Response" />
                  <ScoreBar value={latestPeriod.cost} label="Cost" />
                  <ScoreBar value={latestPeriod.compliance} label="Compliance" />
                </div>
              )}

              {/* Expanded detail — history */}
              {isSelected && (
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Quarterly History
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-[10px]">
                      <thead>
                        <tr className="border-b border-gray-100 dark:border-gray-700">
                          <th className="text-left py-1 text-gray-500 dark:text-gray-400">
                            Period
                          </th>
                          <th className="text-center py-1 text-gray-500 dark:text-gray-400">
                            Quality
                          </th>
                          <th className="text-center py-1 text-gray-500 dark:text-gray-400">
                            Delivery
                          </th>
                          <th className="text-center py-1 text-gray-500 dark:text-gray-400">
                            Response
                          </th>
                          <th className="text-center py-1 text-gray-500 dark:text-gray-400">
                            Cost
                          </th>
                          <th className="text-center py-1 text-gray-500 dark:text-gray-400">
                            Compliance
                          </th>
                          <th className="text-center py-1 text-gray-500 dark:text-gray-400">
                            Overall
                          </th>
                          <th className="text-center py-1 text-gray-500 dark:text-gray-400">
                            Grade
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {supplier.history.map((h) => (
                          <tr
                            key={h.period}
                            className="border-b border-gray-50 dark:border-gray-800"
                          >
                            <td className="py-1.5 font-medium text-gray-700 dark:text-gray-300">
                              {h.period}
                            </td>
                            <td className="py-1.5 text-center">{h.quality}</td>
                            <td className="py-1.5 text-center">{h.delivery}</td>
                            <td className="py-1.5 text-center">{h.responsiveness}</td>
                            <td className="py-1.5 text-center">{h.cost}</td>
                            <td className="py-1.5 text-center">{h.compliance}</td>
                            <td className="py-1.5 text-center font-bold">{h.overall}</td>
                            <td className="py-1.5 text-center">
                              <span
                                className={`inline-flex items-center justify-center h-5 w-5 rounded-full text-[9px] font-bold ${gradeConfig[h.grade]?.bg || 'bg-gray-100 dark:bg-gray-800'} ${gradeConfig[h.grade]?.text || 'text-gray-700 dark:text-gray-300'}`}
                              >
                                {h.grade}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
