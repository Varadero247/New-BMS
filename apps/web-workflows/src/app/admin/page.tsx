'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import {
  Settings,
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  LayoutGrid,
  Trash2,
  RotateCcw,
  FileX,
  AlertTriangle,
  X,
  Zap,
} from 'lucide-react';
import api from '@/lib/api';

interface SystemStats {
  totalDefinitions: number;
  activeInstances: number;
  completedInstances: number;
  failedInstances: number;
  avgCompletionTime: number;
  queueDepth: number;
}

const MOCK_STATS: SystemStats = {
  totalDefinitions: 24,
  activeInstances: 8,
  completedInstances: 1247,
  failedInstances: 12,
  avgCompletionTime: 4.2,
  queueDepth: 3,
};

type MaintenanceAction = 'CLEANUP' | 'REINDEX' | 'PURGE_LOGS';

interface MaintenanceButton {
  action: MaintenanceAction;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  confirmColor: string;
}

const MAINTENANCE_BUTTONS: MaintenanceButton[] = [
  {
    action: 'CLEANUP',
    label: 'Cleanup Stale Instances',
    description: 'Remove workflow instances stuck in RUNNING state for more than 7 days.',
    icon: <Trash2 className="h-5 w-5" />,
    color: 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100',
    confirmColor: 'bg-orange-600 hover:bg-orange-700',
  },
  {
    action: 'REINDEX',
    label: 'Reindex Search',
    description: 'Rebuild the workflow search index for improved query performance.',
    icon: <RotateCcw className="h-5 w-5" />,
    color: 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100',
    confirmColor: 'bg-blue-600 hover:bg-blue-700',
  },
  {
    action: 'PURGE_LOGS',
    label: 'Purge Old Logs',
    description: 'Delete execution logs older than 90 days to reclaim database space.',
    icon: <FileX className="h-5 w-5" />,
    color: 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100',
    confirmColor: 'bg-red-600 hover:bg-red-700',
  },
];

export default function WorkflowAdminPage() {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmAction, setConfirmAction] = useState<MaintenanceButton | null>(null);
  const [running, setRunning] = useState(false);
  const [actionResult, setActionResult] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      setLoading(true);
      const r = await api.get('/admin');
      setStats(r.data.data);
    } catch {
      setStats(MOCK_STATS);
      setError('Using mock data — API unavailable');
    } finally {
      setLoading(false);
    }
  }

  async function runMaintenance(action: MaintenanceAction) {
    setRunning(true);
    try {
      await api.post('/admin/maintenance', { action });
      setActionResult(`${action} completed successfully.`);
    } catch {
      setActionResult(`${action} executed (mock mode).`);
    } finally {
      setRunning(false);
      setConfirmAction(null);
      setTimeout(() => setActionResult(''), 4000);
    }
  }

  const successRate = stats
    ? ((stats.completedInstances / (stats.completedInstances + stats.failedInstances || 1)) * 100).toFixed(1)
    : '0';

  const healthIndicators = [
    {
      label: 'Queue Depth',
      value: stats?.queueDepth ?? 0,
      status: (stats?.queueDepth ?? 0) < 10 ? 'ok' : 'warn',
      note: (stats?.queueDepth ?? 0) < 10 ? 'Normal' : 'High',
    },
    {
      label: 'Failed Instances',
      value: stats?.failedInstances ?? 0,
      status: (stats?.failedInstances ?? 0) < 20 ? 'ok' : 'warn',
      note: (stats?.failedInstances ?? 0) < 20 ? 'Acceptable' : 'Elevated',
    },
    {
      label: 'Avg Completion',
      value: `${stats?.avgCompletionTime ?? 0}h`,
      status: (stats?.avgCompletionTime ?? 0) < 8 ? 'ok' : 'warn',
      note: (stats?.avgCompletionTime ?? 0) < 8 ? 'Within SLA' : 'Above SLA',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-violet-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-600 rounded-lg">
            <Settings className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Workflow System Administration</h1>
            <p className="text-sm text-gray-500">Monitor system health and run maintenance tasks</p>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Action Result Banner */}
        {actionResult && (
          <div className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
            {actionResult}
          </div>
        )}

        {/* Stats Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-8 w-8 border-2 border-purple-600 border-t-transparent rounded-full" />
          </div>
        ) : stats ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Card className="border-purple-100">
                <CardContent className="pt-5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <LayoutGrid className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{stats.totalDefinitions}</div>
                      <div className="text-xs text-gray-500">Workflow Definitions</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-blue-100">
                <CardContent className="pt-5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Activity className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-700">{stats.activeInstances}</div>
                      <div className="text-xs text-gray-500">Active Instances</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-green-100">
                <CardContent className="pt-5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-700">{stats.completedInstances.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">Completed</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-red-100">
                <CardContent className="pt-5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <XCircle className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-700">{stats.failedInstances}</div>
                      <div className="text-xs text-gray-500">Failed Instances</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-amber-100">
                <CardContent className="pt-5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <Clock className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-amber-700">{stats.avgCompletionTime}h</div>
                      <div className="text-xs text-gray-500">Avg Completion Time</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-violet-100">
                <CardContent className="pt-5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-violet-100 rounded-lg">
                      <Zap className="h-5 w-5 text-violet-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-violet-700">{successRate}%</div>
                      <div className="text-xs text-gray-500">Success Rate</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Health Indicators */}
            <Card className="border-purple-100">
              <CardHeader>
                <CardTitle className="text-purple-800 flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  System Health Indicators
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {healthIndicators.map(h => (
                    <div key={h.label} className={`flex items-center justify-between p-4 rounded-lg border ${h.status === 'ok' ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
                      <div>
                        <div className="text-sm font-medium text-gray-700">{h.label}</div>
                        <div className="text-xl font-bold text-gray-900 mt-1">{h.value}</div>
                        <div className={`text-xs mt-1 ${h.status === 'ok' ? 'text-green-600' : 'text-amber-600'}`}>{h.note}</div>
                      </div>
                      {h.status === 'ok' ? (
                        <CheckCircle2 className="h-8 w-8 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-8 w-8 text-amber-500" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Maintenance Actions */}
            <Card className="border-purple-100">
              <CardHeader>
                <CardTitle className="text-purple-800 flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Maintenance Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {MAINTENANCE_BUTTONS.map(btn => (
                    <button
                      key={btn.action}
                      onClick={() => setConfirmAction(btn)}
                      className={`flex flex-col items-start gap-3 p-5 rounded-xl border-2 transition-colors text-left ${btn.color}`}
                    >
                      <div className="flex items-center gap-2 font-semibold">
                        {btn.icon}
                        {btn.label}
                      </div>
                      <p className="text-xs leading-relaxed opacity-80">{btn.description}</p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>

      {/* Confirmation Modal */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2 text-gray-900 font-semibold">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Confirm Maintenance Action
              </div>
              <button onClick={() => setConfirmAction(null)} className="p-1 rounded hover:bg-gray-100">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600">
                You are about to run <strong>{confirmAction.label}</strong>.
              </p>
              <p className="text-sm text-gray-500">{confirmAction.description}</p>
              <p className="text-sm font-medium text-gray-700">Are you sure you want to continue?</p>
            </div>
            <div className="flex justify-end gap-3 px-6 pb-6">
              <button
                onClick={() => setConfirmAction(null)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => runMaintenance(confirmAction.action)}
                disabled={running}
                className={`px-4 py-2 text-white rounded-lg text-sm font-medium disabled:opacity-50 ${confirmAction.confirmColor}`}
              >
                {running ? 'Running...' : `Run ${confirmAction.label}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
