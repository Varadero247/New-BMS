'use client';

import { useState } from 'react';
import {
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Search } from 'lucide-react';

type Status = 'planned' | 'in-progress' | 'completed' | 'on-hold';
type Pillar = 'environmental' | 'social' | 'governance';
type Priority = 'critical' | 'high' | 'medium' | 'low';

interface Initiative {
  id: string;
  name: string;
  description: string;
  pillar: Pillar;
  priority: Priority;
  status: Status;
  owner: string;
  startDate: string;
  targetDate: string;
  budget: number;
  spent: number;
  progress: number;
  impactMetrics: { label: string; value: string; unit: string }[];
  sdgs: number[];
  tags: string[];
}

const initiatives: Initiative[] = [
  {
    id: 'INI-001',
    name: 'Carbon Neutrality Programme',
    description:
      'Achieve net-zero Scope 1 & 2 emissions by 2030 through renewable energy procurement, energy efficiency, and carbon offsets',
    pillar: 'environmental',
    priority: 'critical',
    status: 'in-progress',
    owner: 'Sarah Chen',
    startDate: '2024-01-15',
    targetDate: '2030-12-31',
    budget: 2500000,
    spent: 850000,
    progress: 34,
    impactMetrics: [
      { label: 'CO₂ Reduced', value: '1,240', unit: 'tCO₂e' },
      { label: 'Renewable %', value: '62', unit: '%' },
    ],
    sdgs: [7, 13],
    tags: ['Net Zero', 'Science-Based Target'] },
  {
    id: 'INI-002',
    name: 'Circular Economy Transition',
    description:
      'Reduce waste to landfill to <5% and increase recycling rate to 95% across all operations',
    pillar: 'environmental',
    priority: 'high',
    status: 'in-progress',
    owner: 'James Wilson',
    startDate: '2024-06-01',
    targetDate: '2027-12-31',
    budget: 800000,
    spent: 320000,
    progress: 45,
    impactMetrics: [
      { label: 'Waste Diverted', value: '89', unit: '%' },
      { label: 'Cost Saved', value: '£145k', unit: '' },
    ],
    sdgs: [12],
    tags: ['Zero Waste', 'Recycling'] },
  {
    id: 'INI-003',
    name: 'Water Stewardship',
    description:
      'Reduce freshwater consumption by 30% through rainwater harvesting, recycling, and process optimization',
    pillar: 'environmental',
    priority: 'medium',
    status: 'planned',
    owner: 'Maria Garcia',
    startDate: '2026-01-01',
    targetDate: '2028-12-31',
    budget: 450000,
    spent: 0,
    progress: 0,
    impactMetrics: [{ label: 'Target Reduction', value: '30', unit: '%' }],
    sdgs: [6, 14],
    tags: ['Water'] },
  {
    id: 'INI-004',
    name: 'Diversity & Inclusion Programme',
    description:
      'Achieve 40% women in leadership, zero pay gap, and improve ethnic diversity metrics by 25%',
    pillar: 'social',
    priority: 'high',
    status: 'in-progress',
    owner: 'Priya Patel',
    startDate: '2024-03-01',
    targetDate: '2027-06-30',
    budget: 600000,
    spent: 280000,
    progress: 52,
    impactMetrics: [
      { label: 'Women in Leadership', value: '35', unit: '%' },
      { label: 'Pay Gap', value: '3.2', unit: '%' },
    ],
    sdgs: [5, 10],
    tags: ['DEI', 'Pay Equity'] },
  {
    id: 'INI-005',
    name: 'Community Investment Fund',
    description:
      'Invest £500k annually in local community projects, education, and skills development',
    pillar: 'social',
    priority: 'medium',
    status: 'in-progress',
    owner: 'Tom Richards',
    startDate: '2025-01-01',
    targetDate: '2025-12-31',
    budget: 500000,
    spent: 210000,
    progress: 42,
    impactMetrics: [
      { label: 'Projects Funded', value: '18', unit: '' },
      { label: 'People Reached', value: '4,500', unit: '' },
    ],
    sdgs: [4, 11],
    tags: ['Community', 'Education'] },
  {
    id: 'INI-006',
    name: 'Supply Chain Transparency',
    description: 'Map and audit 100% of Tier 1 suppliers and 80% of Tier 2 for ESG compliance',
    pillar: 'governance',
    priority: 'high',
    status: 'in-progress',
    owner: 'Alex Kim',
    startDate: '2024-09-01',
    targetDate: '2026-06-30',
    budget: 350000,
    spent: 180000,
    progress: 60,
    impactMetrics: [
      { label: 'Tier 1 Mapped', value: '100', unit: '%' },
      { label: 'Tier 2 Mapped', value: '54', unit: '%' },
    ],
    sdgs: [8, 12],
    tags: ['Supply Chain', 'Due Diligence'] },
  {
    id: 'INI-007',
    name: 'Board ESG Competency',
    description:
      'Ensure 50% of board members have ESG expertise and link executive compensation to ESG KPIs',
    pillar: 'governance',
    priority: 'medium',
    status: 'completed',
    owner: 'Diana Foster',
    startDate: '2024-01-01',
    targetDate: '2025-06-30',
    budget: 120000,
    spent: 95000,
    progress: 100,
    impactMetrics: [
      { label: 'Board ESG Expertise', value: '60', unit: '%' },
      { label: 'Exec KPIs Linked', value: '100', unit: '%' },
    ],
    sdgs: [16],
    tags: ['Board', 'Compensation'] },
  {
    id: 'INI-008',
    name: 'Renewable Energy Procurement',
    description: 'Transition to 100% renewable electricity through PPAs and on-site generation',
    pillar: 'environmental',
    priority: 'critical',
    status: 'in-progress',
    owner: 'Sarah Chen',
    startDate: '2024-04-01',
    targetDate: '2028-12-31',
    budget: 1800000,
    spent: 720000,
    progress: 62,
    impactMetrics: [
      { label: 'Renewable %', value: '62', unit: '%' },
      { label: 'Solar Installed', value: '450', unit: 'kW' },
    ],
    sdgs: [7],
    tags: ['Renewable', 'PPA', 'Solar'] },
  {
    id: 'INI-009',
    name: 'Employee Wellbeing Programme',
    description:
      'Launch comprehensive wellbeing programme covering mental health, physical fitness, and financial literacy',
    pillar: 'social',
    priority: 'high',
    status: 'in-progress',
    owner: 'Laura Brown',
    startDate: '2025-01-01',
    targetDate: '2025-12-31',
    budget: 250000,
    spent: 85000,
    progress: 35,
    impactMetrics: [
      { label: 'Participation', value: '72', unit: '%' },
      { label: 'Satisfaction', value: '4.2', unit: '/5' },
    ],
    sdgs: [3],
    tags: ['Wellbeing', 'Mental Health'] },
  {
    id: 'INI-010',
    name: 'Anti-Corruption Framework',
    description: 'Implement ISO 37001 anti-bribery management system across all operations',
    pillar: 'governance',
    priority: 'high',
    status: 'completed',
    owner: 'Robert Taylor',
    startDate: '2024-06-01',
    targetDate: '2025-09-30',
    budget: 200000,
    spent: 185000,
    progress: 100,
    impactMetrics: [
      { label: 'Training Completed', value: '98', unit: '%' },
      { label: 'Certifications', value: '3', unit: 'sites' },
    ],
    sdgs: [16],
    tags: ['ISO 37001', 'Anti-Bribery'] },
];

const statusConfig: Record<Status, { label: string; color: string; icon: React.ReactNode }> = {
  planned: {
    label: 'Planned',
    color: 'bg-gray-100 dark:bg-gray-800 text-gray-700',
    icon: <Clock className="h-3.5 w-3.5" /> },
  'in-progress': {
    label: 'In Progress',
    color: 'bg-blue-100 text-blue-700',
    icon: <TrendingUp className="h-3.5 w-3.5" /> },
  completed: {
    label: 'Completed',
    color: 'bg-green-100 text-green-700',
    icon: <CheckCircle className="h-3.5 w-3.5" /> },
  'on-hold': {
    label: 'On Hold',
    color: 'bg-amber-100 text-amber-700',
    icon: <AlertTriangle className="h-3.5 w-3.5" /> } };

const pillarConfig: Record<Pillar, { label: string; color: string }> = {
  environmental: { label: 'Environmental', color: 'bg-green-100 text-green-700' },
  social: { label: 'Social', color: 'bg-blue-100 text-blue-700' },
  governance: { label: 'Governance', color: 'bg-purple-100 text-purple-700' } };

const priorityConfig: Record<Priority, { label: string; color: string }> = {
  critical: { label: 'Critical', color: 'bg-red-100 text-red-700' },
  high: { label: 'High', color: 'bg-orange-100 text-orange-700' },
  medium: { label: 'Medium', color: 'bg-yellow-100 text-yellow-700' },
  low: { label: 'Low', color: 'bg-gray-100 dark:bg-gray-800 text-gray-600' } };

export default function InitiativesClient() {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [pillarFilter, setPillarFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = initiatives.filter((i) => {
    const matchesStatus = statusFilter === 'all' || i.status === statusFilter;
    const matchesPillar = pillarFilter === 'all' || i.pillar === pillarFilter;
    const matchesSearch =
      !searchTerm ||
      i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesPillar && matchesSearch;
  });

  const totalBudget = initiatives.reduce((s, i) => s + i.budget, 0);
  const totalSpent = initiatives.reduce((s, i) => s + i.spent, 0);
  const completedCount = initiatives.filter((i) => i.status === 'completed').length;
  const avgProgress = Math.round(
    initiatives.reduce((s, i) => s + i.progress, 0) / initiatives.length
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">ESG Initiatives</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Track sustainability improvement projects across Environmental, Social & Governance
          pillars
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">
            Total Initiatives
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">
            {initiatives.length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">
            Completed
          </p>
          <p className="text-3xl font-bold text-green-700 mt-1">{completedCount}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">
            Avg Progress
          </p>
          <p className="text-3xl font-bold text-blue-700 mt-1">{avgProgress}%</p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">
            Total Budget
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">
            £{(totalBudget / 1000000).toFixed(1)}M
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">
            Budget Spent
          </p>
          <p className="text-3xl font-bold text-amber-700 mt-1">
            £{(totalSpent / 1000000).toFixed(1)}M
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            {Math.round((totalSpent / totalBudget) * 100)}% utilised
          </p>
        </div>
      </div>

      {/* Pillar Summary */}
      <div className="grid grid-cols-3 gap-4">
        {(['environmental', 'social', 'governance'] as Pillar[]).map((p) => {
          const pillarInits = initiatives.filter((i) => i.pillar === p);
          const pillarProgress = Math.round(
            pillarInits.reduce((s, i) => s + i.progress, 0) / pillarInits.length
          );
          return (
            <button
              key={p}
              onClick={() => setPillarFilter(pillarFilter === p ? 'all' : p)}
              className={`bg-white dark:bg-gray-900 border rounded-xl p-4 text-left transition-colors ${pillarFilter === p ? 'border-green-400 ring-1 ring-green-200' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${pillarConfig[p].color}`}
                >
                  {pillarConfig[p].label}
                </span>
                <span className="text-sm font-medium text-gray-600">
                  {pillarInits.length} initiatives
                </span>
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                  <span>Progress</span>
                  <span>{pillarProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${p === 'environmental' ? 'bg-green-500' : p === 'social' ? 'bg-blue-500' : 'bg-purple-500'}`}
                    style={{ width: `${pillarProgress}%` }}
                  />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            aria-label="Search initiatives, tags..."
            placeholder="Search initiatives, tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'in-progress', 'planned', 'completed', 'on-hold'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium ${statusFilter === s ? 'bg-green-100 text-green-800' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 hover:bg-gray-200'}`}
            >
              {s === 'all' ? 'All' : statusConfig[s as Status]?.label || s}
            </button>
          ))}
        </div>
      </div>

      {/* Initiatives List */}
      <div className="space-y-3">
        {filtered.map((ini) => {
          const isExpanded = expanded.has(ini.id);
          const budgetPct = Math.round((ini.spent / ini.budget) * 100);
          return (
            <div
              key={ini.id}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden"
            >
              <button
                onClick={() =>
                  setExpanded((prev) => {
                    const n = new Set(prev);
                    if (n.has(ini.id)) { n.delete(ini.id); } else { n.add(ini.id); }
                    return n;
                  })
                }
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:bg-gray-800 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? (
                    <ChevronDown className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  )}
                  <div className="text-left">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{ini.name}</p>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${pillarConfig[ini.pillar].color}`}
                      >
                        {pillarConfig[ini.pillar].label}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityConfig[ini.priority].color}`}
                      >
                        {priorityConfig[ini.priority].label}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig[ini.status].color}`}
                      >
                        {statusConfig[ini.status].icon}
                        {statusConfig[ini.status].label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {ini.id} · {ini.owner} · Due {ini.targetDate}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 min-w-[160px]">
                  <div className="w-24">
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                      <span>{ini.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${ini.progress === 100 ? 'bg-green-500' : ini.progress >= 50 ? 'bg-blue-500' : 'bg-amber-500'}`}
                        style={{ width: `${ini.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-gray-100 dark:border-gray-700 p-4 space-y-4">
                  <p className="text-sm text-gray-600">{ini.description}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">
                        Budget
                      </p>
                      <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        £{(ini.budget / 1000).toFixed(0)}k
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                        <div
                          className={`h-1.5 rounded-full ${budgetPct > 90 ? 'bg-red-500' : budgetPct > 70 ? 'bg-amber-500' : 'bg-green-500'}`}
                          style={{ width: `${budgetPct}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        £{(ini.spent / 1000).toFixed(0)}k spent ({budgetPct}%)
                      </p>
                    </div>
                    {ini.impactMetrics.map((m, i) => (
                      <div key={i}>
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">
                          {m.label}
                        </p>
                        <p className="text-lg font-bold text-green-700">
                          {m.value}
                          {m.unit && (
                            <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                              {m.unit}
                            </span>
                          )}
                        </p>
                      </div>
                    ))}
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">
                        SDG Alignment
                      </p>
                      <div className="flex gap-1 flex-wrap">
                        {ini.sdgs.map((s) => (
                          <span
                            key={s}
                            className="w-8 h-8 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {ini.tags.map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 rounded text-xs"
                      >
                        {t}
                      </span>
                    ))}
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
