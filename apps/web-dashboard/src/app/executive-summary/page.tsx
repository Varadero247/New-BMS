'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import {
  TrendingUp, TrendingDown, Minus, Shield, Leaf, Award, ShieldCheck,
  AlertTriangle, CheckCircle, Clock, Users, BarChart3, Target, Activity,
} from 'lucide-react';
import { api } from '@/lib/api';
import { Sidebar } from '@/components/sidebar';

interface ModuleScore {
  module: string;
  label: string;
  score: number;
  trend: 'up' | 'down' | 'stable';
  change: number;
  color: string;
  icon: any;
  openItems: number;
  criticalItems: number;
}

interface KpiCard {
  label: string;
  value: string | number;
  sub: string;
  trend: 'up' | 'down' | 'stable';
  color: string;
}

const MOCK_SCORES: ModuleScore[] = [
  { module: 'iso45001', label: 'Health & Safety', score: 87, trend: 'up', change: 3, color: 'red', icon: Shield, openItems: 12, criticalItems: 2 },
  { module: 'iso14001', label: 'Environmental', score: 92, trend: 'up', change: 1, color: 'green', icon: Leaf, openItems: 5, criticalItems: 0 },
  { module: 'iso9001', label: 'Quality', score: 84, trend: 'down', change: 2, color: 'blue', icon: Award, openItems: 18, criticalItems: 3 },
  { module: 'iso27001', label: 'InfoSec', score: 78, trend: 'up', change: 5, color: 'cyan', icon: ShieldCheck, openItems: 9, criticalItems: 1 },
];

function ScoreBar({ value, color }: { value: number; color: string }) {
  const colors: Record<string, string> = {
    red: 'bg-red-500', green: 'bg-green-500', blue: 'bg-blue-500', cyan: 'bg-cyan-500',
  };
  return (
    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 mt-2">
      <div
        className={`h-2 rounded-full transition-all ${colors[color] || 'bg-gray-400'}`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

function TrendIcon({ trend }: { trend: 'up' | 'down' | 'stable' }) {
  if (trend === 'up') return <TrendingUp className="h-4 w-4 text-green-500" />;
  if (trend === 'down') return <TrendingDown className="h-4 w-4 text-red-500" />;
  return <Minus className="h-4 w-4 text-gray-400 dark:text-gray-500" />;
}

export default function ExecutiveSummaryPage() {
  const [scores] = useState<ModuleScore[]>(MOCK_SCORES);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('Q1-2026');

  useEffect(() => {
    // Try to load real data; fall back to mock
    const loadData = async () => {
      try {
        await api.get('/dashboard/stats');
      } catch {
        // use mock
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const overallScore = Math.round(scores.reduce((s, m) => s + m.score, 0) / scores.length);

  const kpis: KpiCard[] = [
    { label: 'Overall IMS Score', value: `${overallScore}%`, sub: 'Across all modules', trend: 'up', color: 'purple' },
    { label: 'Open Corrective Actions', value: 44, sub: '8 overdue', trend: 'down', color: 'orange' },
    { label: 'Audit Findings', value: 7, sub: 'This quarter', trend: 'stable', color: 'blue' },
    { label: 'Regulatory Compliance', value: '96%', sub: 'All jurisdictions', trend: 'up', color: 'green' },
  ];

  if (loading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="animate-pulse space-y-4 max-w-7xl mx-auto">
            <div className="h-8 bg-gray-200 rounded w-1/3" />
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-gray-200 rounded" />)}
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-48 bg-gray-200 rounded" />)}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-800">
      <Sidebar />
      <main className="flex-1 overflow-auto p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Executive Summary</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Cross-module IMS performance overview</p>
            </div>
            <select
              value={period}
              onChange={e => setPeriod(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Q1-2026">Q1 2026</option>
              <option value="Q4-2025">Q4 2025</option>
              <option value="Q3-2025">Q3 2025</option>
            </select>
          </div>

          {/* KPI row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {kpis.map(kpi => (
              <Card key={kpi.label}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{kpi.label}</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{kpi.value}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{kpi.sub}</p>
                    </div>
                    <TrendIcon trend={kpi.trend} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Module Scorecards */}
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Module Compliance Scores — {period}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {scores.map(mod => {
              const Icon = mod.icon;
              return (
                <Card key={mod.module}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-${mod.color}-100`}>
                          <Icon className={`h-5 w-5 text-${mod.color}-600`} />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-gray-100">{mod.label}</p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <TrendIcon trend={mod.trend} />
                            <span className={`text-xs font-medium ${mod.trend === 'up' ? 'text-green-600' : mod.trend === 'down' ? 'text-red-600' : 'text-gray-400'}`}>
                              {mod.trend === 'up' ? '+' : mod.trend === 'down' ? '-' : ''}{mod.change}% vs last period
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">{mod.score}</span>
                        <span className="text-lg text-gray-400 dark:text-gray-500">%</span>
                      </div>
                    </div>
                    <ScoreBar value={mod.score} color={mod.color} />
                    <div className="flex gap-4 mt-3">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                        <Clock className="h-3.5 w-3.5 text-orange-400" />
                        {mod.openItems} open items
                      </div>
                      {mod.criticalItems > 0 && (
                        <div className="flex items-center gap-1.5 text-xs text-red-600">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          {mod.criticalItems} critical
                        </div>
                      )}
                      {mod.criticalItems === 0 && (
                        <div className="flex items-center gap-1.5 text-xs text-green-600">
                          <CheckCircle className="h-3.5 w-3.5" />
                          No critical items
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Bottom grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Top Risks */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Top Risks Requiring Attention
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { ref: 'ISR-2026-008', title: 'Unpatched endpoint vulnerabilities', module: 'InfoSec', level: 'CRITICAL', score: 24 },
                    { ref: 'HSR-2026-014', title: 'Fall hazard at elevated workstation C3', module: 'H&S', level: 'HIGH', score: 20 },
                    { ref: 'QR-2026-005', title: 'Supplier qualification gap — Component X', module: 'Quality', level: 'HIGH', score: 18 },
                    { ref: 'ENV-ASP-2026-003', title: 'Cooling tower discharge exceeding limits', module: 'Environmental', level: 'MEDIUM', score: 15 },
                  ].map(risk => (
                    <div key={risk.ref} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{risk.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-400 dark:text-gray-500">{risk.ref}</span>
                          <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${risk.module === 'InfoSec' ? 'bg-cyan-100 text-cyan-700' : risk.module === 'H&S' ? 'bg-red-100 text-red-700' : risk.module === 'Quality' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                            {risk.module}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-3">
                        <span className={`text-xs px-2 py-1 rounded font-medium ${risk.level === 'CRITICAL' ? 'bg-red-100 text-red-700' : risk.level === 'HIGH' ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {risk.level}
                        </span>
                        <span className="text-lg font-bold text-gray-300 dark:text-gray-600">{risk.score}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* KPI Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Target className="h-5 w-5 text-blue-500" />
                  Objectives Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { label: 'Zero LTI Rate', target: 100, current: 97, color: 'red' },
                    { label: 'Carbon Reduction', target: 100, current: 72, color: 'green' },
                    { label: 'Customer Satisfaction', target: 100, current: 88, color: 'blue' },
                    { label: 'Supplier Audits', target: 100, current: 64, color: 'purple' },
                  ].map(obj => (
                    <div key={obj.label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700 dark:text-gray-300 font-medium">{obj.label}</span>
                        <span className="text-gray-500 dark:text-gray-400">{obj.current}%</span>
                      </div>
                      <ScoreBar value={obj.current} color={obj.color} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary table */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart3 className="h-5 w-5 text-purple-500" />
                Cross-Module Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 text-gray-500 dark:text-gray-400 font-medium">Module</th>
                      <th className="text-right py-3 px-4 text-gray-500 dark:text-gray-400 font-medium">Compliance %</th>
                      <th className="text-right py-3 px-4 text-gray-500 dark:text-gray-400 font-medium">Open CAPAs</th>
                      <th className="text-right py-3 px-4 text-gray-500 dark:text-gray-400 font-medium">Overdue</th>
                      <th className="text-right py-3 px-4 text-gray-500 dark:text-gray-400 font-medium">Last Audit</th>
                      <th className="text-left py-3 px-4 text-gray-500 dark:text-gray-400 font-medium">Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { module: 'Health & Safety', compliance: 87, capaOpen: 12, overdue: 3, lastAudit: 'Jan 2026', trend: 'up' as const },
                      { module: 'Environmental', compliance: 92, capaOpen: 5, overdue: 0, lastAudit: 'Feb 2026', trend: 'up' as const },
                      { module: 'Quality', compliance: 84, capaOpen: 18, overdue: 5, lastAudit: 'Jan 2026', trend: 'down' as const },
                      { module: 'InfoSec', compliance: 78, capaOpen: 9, overdue: 2, lastAudit: 'Dec 2025', trend: 'up' as const },
                      { module: 'ESG', compliance: 71, capaOpen: 4, overdue: 1, lastAudit: 'Nov 2025', trend: 'stable' as const },
                    ].map(row => (
                      <tr key={row.module} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:bg-gray-800">
                        <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">{row.module}</td>
                        <td className="py-3 px-4 text-right">
                          <span className={`font-semibold ${row.compliance >= 90 ? 'text-green-600' : row.compliance >= 80 ? 'text-blue-600' : 'text-orange-600'}`}>
                            {row.compliance}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right text-gray-600">{row.capaOpen}</td>
                        <td className="py-3 px-4 text-right">
                          <span className={row.overdue > 0 ? 'text-red-600 font-medium' : 'text-green-600'}>{row.overdue}</span>
                        </td>
                        <td className="py-3 px-4 text-right text-gray-500 dark:text-gray-400">{row.lastAudit}</td>
                        <td className="py-3 px-4">
                          <TrendIcon trend={row.trend} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
