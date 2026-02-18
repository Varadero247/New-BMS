'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Users } from 'lucide-react';
import { Modal } from '@ims/ui';
import { api } from '@/lib/api';

export default function ResourcesPage() {
  const [resources, setResources] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterProjectId, setFilterProjectId] = useState('');
  const [form, setForm] = useState({
    projectId: '',
    resourceName: '',
    resourceRole: '',
    resourceType: 'INTERNAL',
    responsibility: 'RESPONSIBLE',
    allocationPercentage: '',
    allocatedFrom: '',
    allocatedTo: '',
    costPerHour: '',
    plannedHours: '',
  });

  const loadData = useCallback(async () => {
    try {
      const params: any = {};
      if (filterProjectId) params.projectId = filterProjectId;
      const [resourcesRes, projectsRes] = await Promise.all([
        api.get('/resources', { params }),
        api.get('/projects'),
      ]);
      setResources(resourcesRes.data.data || []);
      setProjects(projectsRes.data.data || []);
    } catch (error) {
      console.error('Failed to load resources:', error);
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
      await api.post('/resources', {
        ...form,
        allocationPercentage: form.allocationPercentage ? parseFloat(form.allocationPercentage) : undefined,
        costPerHour: form.costPerHour ? parseFloat(form.costPerHour) : undefined,
        plannedHours: form.plannedHours ? parseFloat(form.plannedHours) : undefined,
      });
      setShowModal(false);
      setForm({
        projectId: '',
        resourceName: '',
        resourceRole: '',
        resourceType: 'INTERNAL',
        responsibility: 'RESPONSIBLE',
        allocationPercentage: '',
        allocatedFrom: '',
        allocatedTo: '',
        costPerHour: '',
        plannedHours: '',
      });
      loadData();
    } catch (error) {
      console.error('Failed to create resource:', error);
    }
  };

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      ACTIVE: 'bg-green-100 text-green-700',
      INACTIVE: 'bg-gray-100 dark:bg-gray-800 text-gray-700',
      ON_LEAVE: 'bg-amber-100 text-amber-700',
      RELEASED: 'bg-blue-100 text-blue-700',
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
              <Users className="h-6 w-6 text-blue-600" />
              Resources
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Resource allocation and management</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Resource
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">RACI</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Allocation %</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">From</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">To</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {resources.map((resource) => (
                  <tr key={resource.id} className="hover:bg-gray-50 dark:bg-gray-800">
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{resource.resourceName}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{resource.resourceRole}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{resource.resourceType}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                        {resource.responsibility}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-gray-200 rounded-full">
                          <div
                            className="h-2 bg-blue-600 rounded-full"
                            style={{ width: `${resource.allocationPercentage || 0}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{resource.allocationPercentage || 0}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                      {resource.allocatedFrom ? new Date(resource.allocatedFrom).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                      {resource.allocatedTo ? new Date(resource.allocatedTo).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${statusBadge(resource.status)}`}>
                        {resource.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {resources.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                      No resources found. Add your first resource.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Modal */}
        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Resource" size="lg">
          <form onSubmit={handleSubmit} className="space-y-4">
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Resource Name</label>
                <input
                  type="text"
                  required
                  value={form.resourceName}
                  onChange={(e) => setForm({ ...form, resourceName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                <input
                  type="text"
                  required
                  value={form.resourceRole}
                  onChange={(e) => setForm({ ...form, resourceRole: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Resource Type</label>
                <select
                  value={form.resourceType}
                  onChange={(e) => setForm({ ...form, resourceType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="INTERNAL">Internal</option>
                  <option value="EXTERNAL">External</option>
                  <option value="CONTRACTOR">Contractor</option>
                  <option value="CONSULTANT">Consultant</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Responsibility (RACI)</label>
                <select
                  value={form.responsibility}
                  onChange={(e) => setForm({ ...form, responsibility: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="RESPONSIBLE">Responsible</option>
                  <option value="ACCOUNTABLE">Accountable</option>
                  <option value="CONSULTED">Consulted</option>
                  <option value="INFORMED">Informed</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Allocation %</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={form.allocationPercentage}
                  onChange={(e) => setForm({ ...form, allocationPercentage: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cost Per Hour</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.costPerHour}
                  onChange={(e) => setForm({ ...form, costPerHour: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Planned Hours</label>
                <input
                  type="number"
                  value={form.plannedHours}
                  onChange={(e) => setForm({ ...form, plannedHours: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Allocated From</label>
                <input
                  type="date"
                  value={form.allocatedFrom}
                  onChange={(e) => setForm({ ...form, allocatedFrom: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Allocated To</label>
                <input
                  type="date"
                  value={form.allocatedTo}
                  onChange={(e) => setForm({ ...form, allocatedTo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
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
                Add Resource
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}
