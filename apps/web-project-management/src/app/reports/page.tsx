'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, BarChart3 } from 'lucide-react';
import { Modal } from '@ims/ui';
import { api } from '@/lib/api';

export default function ReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterProjectId, setFilterProjectId] = useState('');
  const [form, setForm] = useState({
    projectId: '',
    reportPeriod: '',
    reportType: 'WEEKLY',
    executiveSummary: '',
    overallStatus: 'GREEN',
    scheduleStatus: 'GREEN',
    budgetStatus: 'GREEN',
    scopeStatus: 'GREEN',
    qualityStatus: 'GREEN',
    riskStatus: 'GREEN',
    accomplishments: '',
    nextPeriodPlans: '',
  });

  const loadData = useCallback(async () => {
    try {
      const params: any = {};
      if (filterProjectId) params.projectId = filterProjectId;
      const [reportsRes, projectsRes] = await Promise.all([
        api.get('/reports', { params }),
        api.get('/projects'),
      ]);
      setReports(reportsRes.data.data || []);
      setProjects(projectsRes.data.data || []);
    } catch (error) {
      console.error('Failed to load reports:', error);
    } finally {
      setLoading(false);
    }
  }, [filterProjectId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/reports', form);
      setShowModal(false);
      setForm({
        projectId: '',
        reportPeriod: '',
        reportType: 'WEEKLY',
        executiveSummary: '',
        overallStatus: 'GREEN',
        scheduleStatus: 'GREEN',
        budgetStatus: 'GREEN',
        scopeStatus: 'GREEN',
        qualityStatus: 'GREEN',
        riskStatus: 'GREEN',
        accomplishments: '',
        nextPeriodPlans: '',
      });
      loadData();
    } catch (error) {
      console.error('Failed to create report:', error);
    }
  };

  const ragBadge = (status: string) => {
    const colors: Record<string, string> = {
      GREEN: 'bg-green-100 text-green-700',
      AMBER: 'bg-amber-100 text-amber-700',
      RED: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 dark:bg-gray-800 text-gray-700';
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-blue-600" />
              Project Reports
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Status reports and project performance</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Report
          </button>
        </div>

        {/* Filter */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4 mb-6">
          <div className="flex items-center gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Filter by Project</label>
              <select
                value={filterProjectId}
                onChange={(e) => setFilterProjectId(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Projects</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.projectName}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Period</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Overall</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Schedule</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Budget</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Scope</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Quality</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Risk</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Created By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50 dark:bg-gray-800">
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{report.reportPeriod}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{report.reportType}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                      {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${ragBadge(report.overallStatus)}`}>
                        {report.overallStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${ragBadge(report.scheduleStatus)}`}>
                        {report.scheduleStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${ragBadge(report.budgetStatus)}`}>
                        {report.budgetStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${ragBadge(report.scopeStatus)}`}>
                        {report.scopeStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${ragBadge(report.qualityStatus)}`}>
                        {report.qualityStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${ragBadge(report.riskStatus)}`}>
                        {report.riskStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{report.createdBy || '-'}</td>
                  </tr>
                ))}
                {reports.length === 0 && (
                  <tr>
                    <td colSpan={10} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                      No reports found. Create your first status report.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Modal */}
        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create Status Report" size="lg">
          <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project</label>
              <select
                required
                value={form.projectId}
                onChange={(e) => setForm({ ...form, projectId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Project</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.projectName}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Report Period</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Week 5 - Jan 2026"
                  value={form.reportPeriod}
                  onChange={(e) => setForm({ ...form, reportPeriod: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Report Type</label>
                <select
                  value={form.reportType}
                  onChange={(e) => setForm({ ...form, reportType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="DAILY">Daily</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="MONTHLY">Monthly</option>
                  <option value="MILESTONE">Milestone</option>
                  <option value="PHASE_GATE">Phase Gate</option>
                  <option value="FINAL">Final</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Executive Summary</label>
              <textarea
                rows={3}
                value={form.executiveSummary}
                onChange={(e) => setForm({ ...form, executiveSummary: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Overall Status</label>
                <select
                  value={form.overallStatus}
                  onChange={(e) => setForm({ ...form, overallStatus: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="GREEN">Green</option>
                  <option value="AMBER">Amber</option>
                  <option value="RED">Red</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Schedule Status</label>
                <select
                  value={form.scheduleStatus}
                  onChange={(e) => setForm({ ...form, scheduleStatus: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="GREEN">Green</option>
                  <option value="AMBER">Amber</option>
                  <option value="RED">Red</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Budget Status</label>
                <select
                  value={form.budgetStatus}
                  onChange={(e) => setForm({ ...form, budgetStatus: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="GREEN">Green</option>
                  <option value="AMBER">Amber</option>
                  <option value="RED">Red</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Scope Status</label>
                <select
                  value={form.scopeStatus}
                  onChange={(e) => setForm({ ...form, scopeStatus: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="GREEN">Green</option>
                  <option value="AMBER">Amber</option>
                  <option value="RED">Red</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quality Status</label>
                <select
                  value={form.qualityStatus}
                  onChange={(e) => setForm({ ...form, qualityStatus: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="GREEN">Green</option>
                  <option value="AMBER">Amber</option>
                  <option value="RED">Red</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Risk Status</label>
                <select
                  value={form.riskStatus}
                  onChange={(e) => setForm({ ...form, riskStatus: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="GREEN">Green</option>
                  <option value="AMBER">Amber</option>
                  <option value="RED">Red</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Accomplishments</label>
              <textarea
                rows={3}
                value={form.accomplishments}
                onChange={(e) => setForm({ ...form, accomplishments: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Key accomplishments this period"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Next Period Plans</label>
              <textarea
                rows={3}
                value={form.nextPeriodPlans}
                onChange={(e) => setForm({ ...form, nextPeriodPlans: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Plans for the next reporting period"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Report
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}
