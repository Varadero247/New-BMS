'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@ims/ui';
import {
  ListChecks,
  AlertTriangle,
  Clock,
  CheckCircle2,
  RefreshCw,
  User,
  CalendarDays,
  Filter,
} from 'lucide-react';
import Link from 'next/link';
import Sidebar from '@/components/sidebar';
import { api } from '@/lib/api';

interface ActionRisk {
  id: string;
  title: string;
  referenceNumber: string;
  residualRiskLevel?: string;
}

interface RiskAction {
  id: string;
  riskId: string;
  actionTitle: string;
  description: string;
  actionType: string;
  owner?: string;
  ownerEmail?: string;
  targetDate: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: string;
  completedDate?: string;
  evidenceOfCompletion?: string;
  createdAt: string;
  risk: ActionRisk;
}

const STATUS_COLORS: Record<string, string> = {
  OPEN: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  OVERDUE: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  CANCELLED: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
};

const PRIORITY_COLORS: Record<string, string> = {
  CRITICAL: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  HIGH: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  MEDIUM: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  LOW: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
};

const LEVEL_COLORS: Record<string, string> = {
  CRITICAL: 'text-red-600 dark:text-red-400',
  VERY_HIGH: 'text-orange-600 dark:text-orange-400',
  HIGH: 'text-yellow-600 dark:text-yellow-400',
  MEDIUM: 'text-blue-600 dark:text-blue-400',
  LOW: 'text-green-600 dark:text-green-400',
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function daysOverdue(dateStr: string) {
  const diff = Math.floor(
    (new Date().getTime() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24)
  );
  return diff;
}

type TabKey = 'all' | 'overdue' | 'due_soon';

export default function ActionsPage() {
  const [overdue, setOverdue] = useState<RiskAction[]>([]);
  const [dueSoon, setDueSoon] = useState<RiskAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<TabKey>('all');

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const [overdueRes, dueSoonRes] = await Promise.all([
        api.get('/risks/actions/overdue'),
        api.get('/risks/actions/due-soon'),
      ]);
      setOverdue(overdueRes.data.data || []);
      setDueSoon(dueSoonRes.data.data || []);
    } catch (e) {
      setError(
        (e as any)?.response?.status === 401
          ? 'Session expired. Please log in.'
          : 'Failed to load actions data.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const allActions = [
    ...overdue.map((a) => ({ ...a, _source: 'overdue' as const })),
    ...dueSoon
      .filter((d) => !overdue.some((o) => o.id === d.id))
      .map((a) => ({ ...a, _source: 'due_soon' as const })),
  ];

  const displayActions =
    activeTab === 'overdue'
      ? overdue.map((a) => ({ ...a, _source: 'overdue' as const }))
      : activeTab === 'due_soon'
        ? dueSoon.map((a) => ({ ...a, _source: 'due_soon' as const }))
        : allActions;

  const tabs: { key: TabKey; label: string; count: number; icon: React.ReactNode }[] = [
    {
      key: 'all',
      label: 'All',
      count: allActions.length,
      icon: <ListChecks className="h-4 w-4" />,
    },
    {
      key: 'overdue',
      label: 'Overdue',
      count: overdue.length,
      icon: <AlertTriangle className="h-4 w-4" />,
    },
    {
      key: 'due_soon',
      label: 'Due Soon',
      count: dueSoon.length,
      icon: <Clock className="h-4 w-4" />,
    },
  ];

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Risk Actions Register
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Track and manage all risk treatment actions
              </p>
            </div>
            <button
              onClick={loadData}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <Card className="border-red-200 dark:border-red-800">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Overdue</p>
                    <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-1">
                      {loading ? '—' : overdue.length}
                    </p>
                  </div>
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
                    <AlertTriangle className="h-7 w-7 text-red-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-yellow-200 dark:border-yellow-800">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Due Soon (14 days)</p>
                    <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
                      {loading ? '—' : dueSoon.length}
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
                    <Clock className="h-7 w-7 text-yellow-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-blue-200 dark:border-blue-800">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Total Requiring Action
                    </p>
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                      {loading ? '—' : allActions.length}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                    <ListChecks className="h-7 w-7 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-1 mb-4 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg w-fit">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                {tab.icon}
                {tab.label}
                <span
                  className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${
                    tab.key === 'overdue'
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                      : tab.key === 'due_soon'
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                        : 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Actions Table */}
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="animate-pulse space-y-3 p-5">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded" />
                  ))}
                </div>
              ) : displayActions.length === 0 ? (
                <div className="py-16 text-center">
                  <CheckCircle2 className="h-12 w-12 text-green-400 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400 font-medium">
                    {activeTab === 'overdue'
                      ? 'No overdue actions'
                      : activeTab === 'due_soon'
                        ? 'No actions due soon'
                        : 'No actions found'}
                  </p>
                  {activeTab === 'overdue' && (
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                      All actions are on track
                    </p>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Action
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Risk
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Owner
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Target Date
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Priority
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Type
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800/60">
                      {displayActions.map((action) => {
                        const isOv = action._source === 'overdue';
                        const days = isOv ? daysOverdue(action.targetDate) : 0;
                        return (
                          <tr
                            key={action.id}
                            className={`hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors ${
                              isOv
                                ? 'bg-red-50/30 dark:bg-red-900/10 border-l-2 border-l-red-400'
                                : ''
                            }`}
                          >
                            <td className="px-4 py-3 max-w-[220px]">
                              <p className="font-medium text-gray-900 dark:text-gray-100 leading-snug">
                                {action.actionTitle}
                              </p>
                              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate">
                                {action.description}
                              </p>
                            </td>
                            <td className="px-4 py-3">
                              <Link href={`/risks/${action.riskId}`} className="hover:underline">
                                <span className="font-mono text-xs text-gray-500 dark:text-gray-400">
                                  {action.risk?.referenceNumber}
                                </span>
                                {action.risk?.residualRiskLevel && (
                                  <span
                                    className={`ml-1 text-xs font-medium ${LEVEL_COLORS[action.risk.residualRiskLevel] || ''}`}
                                  >
                                    [{action.risk.residualRiskLevel}]
                                  </span>
                                )}
                                <p className="text-xs text-gray-700 dark:text-gray-300 mt-0.5 max-w-[150px] truncate">
                                  {action.risk?.title}
                                </p>
                              </Link>
                            </td>
                            <td className="px-4 py-3">
                              {action.owner ? (
                                <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                                  <User className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                                  <span className="text-xs truncate max-w-[100px]">
                                    {action.owner}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-xs text-gray-400 dark:text-gray-500">
                                  Unassigned
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1.5">
                                <CalendarDays
                                  className={`h-3.5 w-3.5 shrink-0 ${isOv ? 'text-red-500' : 'text-gray-400'}`}
                                />
                                <span
                                  className={`text-xs font-medium ${isOv ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'}`}
                                >
                                  {formatDate(action.targetDate)}
                                </span>
                              </div>
                              {isOv && days > 0 && (
                                <p className="text-xs text-red-500 mt-0.5">{days}d overdue</p>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[action.status] || STATUS_COLORS.OPEN}`}
                              >
                                {action.status.replace(/_/g, ' ')}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              {action.priority && (
                                <span
                                  className={`px-2.5 py-1 rounded-full text-xs font-semibold ${PRIORITY_COLORS[action.priority]}`}
                                >
                                  {action.priority}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {action.actionType?.replace(/_/g, ' ') || '—'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {activeTab !== 'all' && displayActions.length > 0 && (
            <p className="mt-3 text-xs text-gray-400 dark:text-gray-500 text-right">
              <Filter className="h-3 w-3 inline mr-1" />
              Showing {displayActions.length} {activeTab === 'overdue' ? 'overdue' : 'due-soon'}{' '}
              action{displayActions.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
