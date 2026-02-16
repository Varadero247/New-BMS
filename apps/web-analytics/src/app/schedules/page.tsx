'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import { Plus, Search, Calendar, Clock, XCircle, Play } from 'lucide-react';
import { api } from '@/lib/api';

interface ScheduleItem {
  id: string;
  name: string;
  reportName: string;
  frequency: string;
  cronExpression: string;
  nextRun: string | null;
  lastRun: string | null;
  recipients: string[];
  format: string;
  status: string;
  owner: string;
  successCount: number;
  failureCount: number;
}

const MOCK_SCHEDULES: ScheduleItem[] = [
  { id: '1', name: 'Weekly H&S KPI Report', reportName: 'H&S Performance Dashboard', frequency: 'Weekly', cronExpression: '0 8 * * MON', nextRun: '2026-02-17T08:00:00Z', lastRun: '2026-02-10T08:00:00Z', recipients: ['bob.smith@ims.local', 'alice.johnson@ims.local'], format: 'PDF', status: 'ACTIVE', owner: 'Bob Smith', successCount: 12, failureCount: 0 },
  { id: '2', name: 'Monthly Compliance Summary', reportName: 'Q1 2026 Compliance Summary', frequency: 'Monthly', cronExpression: '0 9 1 * *', nextRun: '2026-03-01T09:00:00Z', lastRun: '2026-02-01T09:00:00Z', recipients: ['alice.johnson@ims.local', 'ceo@company.com'], format: 'PDF', status: 'ACTIVE', owner: 'Alice Johnson', successCount: 6, failureCount: 0 },
  { id: '3', name: 'Fortnightly CAPA Effectiveness', reportName: 'CAPA Effectiveness Review', frequency: 'Fortnightly', cronExpression: '0 8 1,15 * *', nextRun: '2026-03-01T08:00:00Z', lastRun: '2026-02-14T08:00:00Z', recipients: ['ivan.quality@ims.local'], format: 'PDF', status: 'ACTIVE', owner: 'Ivan Quality', successCount: 8, failureCount: 1 },
  { id: '4', name: 'Daily ESG Emissions Digest', reportName: 'ESG Emissions Report', frequency: 'Daily', cronExpression: '0 7 * * *', nextRun: '2026-02-15T07:00:00Z', lastRun: '2026-02-14T07:00:00Z', recipients: ['eve.green@ims.local'], format: 'XLSX', status: 'ACTIVE', owner: 'Eve Green', successCount: 45, failureCount: 0 },
  { id: '5', name: 'Monthly Energy Management Report', reportName: 'Energy Management Report', frequency: 'Monthly', cronExpression: '0 9 1 * *', nextRun: '2026-03-01T09:00:00Z', lastRun: '2026-02-01T09:00:00Z', recipients: ['heidi.energy@ims.local', 'facilities@company.com'], format: 'PDF', status: 'ACTIVE', owner: 'Heidi Energy', successCount: 3, failureCount: 0 },
  { id: '6', name: 'Quarterly Finance Report', reportName: 'Financial KPI Report', frequency: 'Quarterly', cronExpression: '0 9 1 1,4,7,10 *', nextRun: '2026-04-01T09:00:00Z', lastRun: '2026-01-01T09:00:00Z', recipients: ['jane.finance@ims.local', 'cfo@company.com'], format: 'PDF', status: 'PAUSED', owner: 'Jane Finance', successCount: 1, failureCount: 0 },
  { id: '7', name: 'Weekly Supplier Scorecard', reportName: 'Supplier Quality Report', frequency: 'Weekly', cronExpression: '0 8 * * FRI', nextRun: null, lastRun: null, recipients: ['karl@ims.local'], format: 'XLSX', status: 'PAUSED', owner: 'Karl Procurement', successCount: 0, failureCount: 0 },
];

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  PAUSED: 'bg-yellow-100 text-yellow-700',
  DISABLED: 'bg-gray-100 dark:bg-gray-800 text-gray-500',
  FAILED: 'bg-red-100 text-red-700',
};

const FREQ_COLORS: Record<string, string> = {
  Daily: 'bg-blue-100 text-blue-700',
  Weekly: 'bg-purple-100 text-purple-700',
  Fortnightly: 'bg-indigo-100 text-indigo-700',
  Monthly: 'bg-orange-100 text-orange-700',
  Quarterly: 'bg-rose-100 text-rose-700',
};

function SuccessRate({ success, total }: { success: number; total: number }) {
  if (total === 0) return <span className="text-xs text-gray-400 dark:text-gray-500">No runs yet</span>;
  const pct = Math.round((success / total) * 100);
  return (
    <span className={`text-xs font-medium ${pct >= 90 ? 'text-green-600' : pct >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
      {pct}% ({success}/{total})
    </span>
  );
}

export default function SchedulesPage() {
  const [items, setItems] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [freqFilter, setFreqFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const r = await api.get('/schedules');
        setItems(r.data.data || MOCK_SCHEDULES);
      } catch {
        setItems(MOCK_SCHEDULES);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = items.filter(i => {
    const matchSearch = searchTerm === '' ||
      i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.reportName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.owner.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFreq = freqFilter === '' || i.frequency === freqFilter;
    const matchStatus = statusFilter === '' || i.status === statusFilter;
    return matchSearch && matchFreq && matchStatus;
  });

  const active = items.filter(i => i.status === 'ACTIVE').length;
  const frequencies = [...new Set(items.map(i => i.frequency))].sort();

  async function toggleSchedule(id: string, current: string) {
    const newStatus = current === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    setItems(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
    try {
      await api.put(`/schedules/${id}`, { status: newStatus });
    } catch {
      // optimistic update kept
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4 max-w-7xl mx-auto">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="grid grid-cols-3 gap-4">
            {[1,2,3].map(i => <div key={i} className="h-24 bg-gray-200 rounded" />)}
          </div>
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Report Schedules</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Automate report generation and delivery to recipients</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2 text-sm font-medium"
          >
            <Plus className="h-4 w-4" /> Add Schedule
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total Schedules', value: items.length, color: 'bg-purple-50 text-purple-700' },
            { label: 'Active', value: active, color: 'bg-green-50 text-green-700' },
            { label: 'Paused', value: items.length - active, color: 'bg-yellow-50 text-yellow-700' },
          ].map(s => (
            <div key={s.label} className={`rounded-lg p-4 ${s.color}`}>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-sm font-medium mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              aria-label="Search schedules..." placeholder="Search schedules..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <select aria-label="Filter by frequency" value={freqFilter} onChange={e => setFreqFilter(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
            <option value="">All Frequencies</option>
            {frequencies.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
          <select aria-label="Filter by status" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="PAUSED">Paused</option>
          </select>
        </div>

        {/* Schedules table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-5 w-5 text-purple-600" />
              Schedules ({filtered.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>No schedules found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Schedule</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Frequency</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Cron</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Next Run</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Last Run</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Success Rate</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Recipients</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Status</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(sched => (
                      <tr key={sched.id} className={`border-b hover:bg-gray-50 dark:bg-gray-800 ${sched.status === 'PAUSED' ? 'opacity-70' : ''}`}>
                        <td className="py-3 px-4">
                          <p className="font-medium text-gray-900 dark:text-gray-100">{sched.name}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{sched.reportName} · {sched.format}</p>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${FREQ_COLORS[sched.frequency] || 'bg-gray-100 dark:bg-gray-800 text-gray-700'}`}>
                            {sched.frequency}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-gray-700 dark:text-gray-300">{sched.cronExpression}</code>
                        </td>
                        <td className="py-3 px-4 text-xs text-gray-500 dark:text-gray-400">
                          {sched.nextRun ? (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(sched.nextRun).toLocaleString()}
                            </span>
                          ) : <span className="text-gray-300 dark:text-gray-600">Paused</span>}
                        </td>
                        <td className="py-3 px-4 text-xs text-gray-500 dark:text-gray-400">
                          {sched.lastRun ? new Date(sched.lastRun).toLocaleString() : <span className="text-gray-300 dark:text-gray-600">Never</span>}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <SuccessRate success={sched.successCount} total={sched.successCount + sched.failureCount} />
                        </td>
                        <td className="py-3 px-4 text-xs text-gray-500 dark:text-gray-400">
                          <p>{sched.recipients.length} recipient{sched.recipients.length !== 1 ? 's' : ''}</p>
                          <p className="text-gray-400 dark:text-gray-500 truncate max-w-[140px]">{sched.recipients[0]}</p>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${STATUS_STYLES[sched.status] || 'bg-gray-100 dark:bg-gray-800 text-gray-700'}`}>
                            {sched.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => toggleSchedule(sched.id, sched.status)}
                              className={`text-xs px-2 py-1 rounded font-medium ${sched.status === 'ACTIVE' ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                            >
                              {sched.status === 'ACTIVE' ? 'Pause' : 'Resume'}
                            </button>
                            <button className="p-1.5 rounded hover:bg-purple-100 text-purple-600" title="Run now">
                              <Play className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create Schedule Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Add Schedule</h2>
                <button onClick={() => setShowCreateModal(false)}>
                  <XCircle className="h-5 w-5 text-gray-400 dark:text-gray-500 hover:text-gray-600" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Schedule Name</label>
                  <input type="text" placeholder="e.g. Weekly Safety Digest" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Report</label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                    <option>H&S Performance Dashboard</option>
                    <option>Q1 2026 Compliance Summary</option>
                    <option>ESG Emissions Report</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Frequency</label>
                    <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                      <option>Daily</option>
                      <option>Weekly</option>
                      <option>Fortnightly</option>
                      <option>Monthly</option>
                      <option>Quarterly</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Format</label>
                    <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                      <option>PDF</option>
                      <option>XLSX</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Recipients (comma-separated emails)</label>
                  <input type="text" placeholder="alice@company.com, bob@company.com" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300">Cancel</button>
                <button className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700">Create Schedule</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
