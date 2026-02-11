'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, GitPullRequest } from 'lucide-react';
import { Modal } from '@ims/ui';
import { api } from '@/lib/api';

export default function ChangesPage() {
  const [changes, setChanges] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterProjectId, setFilterProjectId] = useState('');
  const [form, setForm] = useState({
    projectId: '',
    changeCode: '',
    changeTitle: '',
    changeType: 'SCOPE',
    priority: 'MEDIUM',
    urgency: 'MEDIUM',
    requestedBy: '',
    changeDescription: '',
    changeReason: '',
  });

  const loadData = useCallback(async () => {
    try {
      const params: any = {};
      if (filterProjectId) params.projectId = filterProjectId;
      const [changesRes, projectsRes] = await Promise.all([
        api.get('/changes', { params }),
        api.get('/projects'),
      ]);
      setChanges(changesRes.data.data || []);
      setProjects(projectsRes.data.data || []);
    } catch (error) {
      console.error('Failed to load changes:', error);
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
      await api.post('/changes', form);
      setShowModal(false);
      setForm({
        projectId: '',
        changeCode: '',
        changeTitle: '',
        changeType: 'SCOPE',
        priority: 'MEDIUM',
        urgency: 'MEDIUM',
        requestedBy: '',
        changeDescription: '',
        changeReason: '',
      });
      loadData();
    } catch (error) {
      console.error('Failed to create change:', error);
    }
  };

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      SUBMITTED: 'bg-blue-100 text-blue-700',
      UNDER_REVIEW: 'bg-amber-100 text-amber-700',
      APPROVED: 'bg-green-100 text-green-700',
      REJECTED: 'bg-red-100 text-red-700',
      IMPLEMENTED: 'bg-purple-100 text-purple-700',
      DEFERRED: 'bg-gray-100 text-gray-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
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
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <GitPullRequest className="h-6 w-6 text-blue-600" />
              Change Requests
            </h1>
            <p className="text-gray-500 text-sm mt-1">Manage project change requests</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Change Request
          </button>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex items-center gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Project</label>
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

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Urgency</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requested By</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {changes.map((change) => (
                  <tr key={change.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-mono text-gray-900">{change.changeCode}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{change.changeTitle}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{change.changeType}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{change.priority}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{change.urgency}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${statusBadge(change.status)}`}>
                        {change.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{change.requestedBy || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {change.createdAt ? new Date(change.createdAt).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                ))}
                {changes.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                      No change requests found. Create your first change request.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Modal */}
        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create Change Request" size="lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Change Code</label>
                <input
                  type="text"
                  required
                  value={form.changeCode}
                  onChange={(e) => setForm({ ...form, changeCode: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Change Title</label>
                <input
                  type="text"
                  required
                  value={form.changeTitle}
                  onChange={(e) => setForm({ ...form, changeTitle: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={form.changeType}
                  onChange={(e) => setForm({ ...form, changeType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="SCOPE">Scope</option>
                  <option value="SCHEDULE">Schedule</option>
                  <option value="COST">Cost</option>
                  <option value="QUALITY">Quality</option>
                  <option value="RESOURCE">Resource</option>
                  <option value="REQUIREMENTS">Requirements</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Urgency</label>
                <select
                  value={form.urgency}
                  onChange={(e) => setForm({ ...form, urgency: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Requested By</label>
              <input
                type="text"
                value={form.requestedBy}
                onChange={(e) => setForm({ ...form, requestedBy: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                rows={3}
                value={form.changeDescription}
                onChange={(e) => setForm({ ...form, changeDescription: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Change</label>
              <textarea
                rows={3}
                value={form.changeReason}
                onChange={(e) => setForm({ ...form, changeReason: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Change Request
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}
