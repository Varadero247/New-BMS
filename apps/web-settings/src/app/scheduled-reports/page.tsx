'use client';

import { useState, useEffect, useCallback } from 'react';

interface ReportSchedule {
  id: string;
  name: string;
  reportType: string;
  schedule: string;
  recipients: string[];
  format: string;
  lastRun: string | null;
  nextRun: string;
  enabled: boolean;
  createdAt: string;
}

interface ReportType {
  value: string;
  label: string;
  description: string;
}

const API_URL = 'http://localhost:4000';

const CRON_PRESETS = [
  { label: 'Every Monday at 9am', value: '0 9 * * 1' },
  { label: '1st of each month at 8am', value: '0 8 1 * *' },
  { label: 'Every Friday at 5pm', value: '0 17 * * 5' },
  { label: 'Daily at 7am', value: '0 7 * * *' },
  { label: 'Quarterly (Jan/Apr/Jul/Oct)', value: '0 8 1 1,4,7,10 *' },
];

function getHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export default function ScheduledReportsPage() {
  const [schedules, setSchedules] = useState<ReportSchedule[]>([]);
  const [reportTypes, setReportTypes] = useState<ReportType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  // Form state
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState('');
  const [formSchedule, setFormSchedule] = useState('');
  const [formRecipients, setFormRecipients] = useState('');
  const [formFormat, setFormFormat] = useState<'pdf' | 'excel' | 'csv'>('pdf');

  const fetchSchedules = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/reports/schedules`, { headers: getHeaders() });
      const data = await res.json();
      if (data.success) setSchedules(data.data);
    } catch {
      /* ignore */
    }
  }, []);

  const fetchTypes = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/reports/types`, { headers: getHeaders() });
      const data = await res.json();
      if (data.success) setReportTypes(data.data);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    Promise.all([fetchSchedules(), fetchTypes()]).finally(() => setLoading(false));
  }, [fetchSchedules, fetchTypes]);

  const handleCreate = async () => {
    if (!formName || !formType || !formSchedule || !formRecipients) return;

    const recipients = formRecipients
      .split(',')
      .map((e) => e.trim())
      .filter(Boolean);

    try {
      const res = await fetch(`${API_URL}/api/admin/reports/schedules`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          name: formName,
          reportType: formType,
          schedule: formSchedule,
          recipients,
          format: formFormat,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSchedules((prev) => [...prev, data.data]);
        setShowCreate(false);
        setFormName('');
        setFormType('');
        setFormSchedule('');
        setFormRecipients('');
        setFormFormat('pdf');
      }
    } catch {
      /* ignore */
    }
  };

  const handleToggle = async (id: string, enabled: boolean) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/reports/schedules/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ enabled: !enabled }),
      });
      const data = await res.json();
      if (data.success) {
        setSchedules((prev) => prev.map((s) => (s.id === id ? data.data : s)));
      }
    } catch {
      /* ignore */
    }
  };

  const handleRunNow = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/reports/schedules/${id}/run`, {
        method: 'POST',
        headers: getHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setSchedules((prev) => prev.map((s) => (s.id === id ? { ...data.data } : s)));
      }
    } catch {
      /* ignore */
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this report schedule?')) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/reports/schedules/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setSchedules((prev) => prev.filter((s) => s.id !== id));
      }
    } catch {
      /* ignore */
    }
  };

  const getTypeLabel = (value: string) =>
    reportTypes.find((t) => t.value === value)?.label || value;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Scheduled Reports</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Configure automated report generation and delivery.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700"
        >
          {showCreate ? 'Cancel' : 'New Schedule'}
        </button>
      </div>

      {/* Create Form */}
      {showCreate && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Create Report Schedule
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name
              </label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g., Weekly Incident Summary"
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Report Type
              </label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100"
              >
                <option value="">Select type...</option>
                {reportTypes.map((rt) => (
                  <option key={rt.value} value={rt.value}>
                    {rt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Schedule (Cron)
              </label>
              <select
                value={formSchedule}
                onChange={(e) => setFormSchedule(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100"
              >
                <option value="">Select schedule...</option>
                {CRON_PRESETS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Format
              </label>
              <select
                value={formFormat}
                onChange={(e) => setFormFormat(e.target.value as 'pdf' | 'excel' | 'csv')}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100"
              >
                <option value="pdf">PDF</option>
                <option value="excel">Excel</option>
                <option value="csv">CSV</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Recipients (comma-separated emails)
            </label>
            <input
              type="text"
              value={formRecipients}
              onChange={(e) => setFormRecipients(e.target.value)}
              placeholder="e.g., admin@ims.local, quality.manager@ims.local"
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleCreate}
              disabled={!formName || !formType || !formSchedule || !formRecipients}
              className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Schedule
            </button>
          </div>
        </div>
      )}

      {/* Schedules Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Schedule
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Format
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Recipients
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Last Run
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {schedules.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400"
                >
                  No scheduled reports. Create one to get started.
                </td>
              </tr>
            ) : (
              schedules.map((s) => (
                <tr
                  key={s.id}
                  className="hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-800/50"
                >
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                    {s.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {getTypeLabel(s.reportType)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 font-mono text-xs">
                    {s.schedule}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 uppercase">
                      {s.format}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {s.recipients.length}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggle(s.id, s.enabled)}
                      className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                        s.enabled
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {s.enabled ? 'Active' : 'Paused'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {s.lastRun ? new Date(s.lastRun).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => handleRunNow(s.id)}
                      className="text-xs text-brand-600 dark:text-brand-400 hover:underline"
                    >
                      Run Now
                    </button>
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="text-xs text-red-600 dark:text-red-400 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
