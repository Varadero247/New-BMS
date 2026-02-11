'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, FolderKanban, Sparkles } from 'lucide-react';
import { Modal } from '@ims/ui';
import { api, aiApi } from '@/lib/api';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [showAiModal, setShowAiModal] = useState(false);
  const [form, setForm] = useState({
    projectName: '',
    projectType: 'CONSTRUCTION',
    methodology: 'WATERFALL',
    priority: 'MEDIUM',
    startDate: '',
    plannedEndDate: '',
    plannedBudget: '',
    projectDescription: '',
  });

  const loadData = useCallback(async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data.data || []);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/projects', {
        ...form,
        plannedBudget: form.plannedBudget ? parseFloat(form.plannedBudget) : undefined,
      });
      setShowModal(false);
      setForm({
        projectName: '',
        projectType: 'CONSTRUCTION',
        methodology: 'WATERFALL',
        priority: 'MEDIUM',
        startDate: '',
        plannedEndDate: '',
        plannedBudget: '',
        projectDescription: '',
      });
      loadData();
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  const handleAiCharter = async (project: any) => {
    setAiLoading(true);
    try {
      const res = await aiApi.post('/analyze', {
        type: 'PROJECT_CHARTER',
        data: project,
      });
      setAiResult(res.data.data?.analysis || res.data.data || 'No analysis returned');
      setShowAiModal(true);
    } catch (error) {
      console.error('AI analysis failed:', error);
    } finally {
      setAiLoading(false);
    }
  };

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      PLANNING: 'bg-blue-100 text-blue-700',
      ACTIVE: 'bg-green-100 text-green-700',
      ON_HOLD: 'bg-amber-100 text-amber-700',
      COMPLETED: 'bg-purple-100 text-purple-700',
      CANCELLED: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const healthBadge = (health: string) => {
    const colors: Record<string, string> = {
      GREEN: 'bg-green-100 text-green-700',
      AMBER: 'bg-amber-100 text-amber-700',
      RED: 'bg-red-100 text-red-700',
    };
    return colors[health] || 'bg-gray-100 text-gray-700';
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
              <FolderKanban className="h-6 w-6 text-blue-600" />
              Projects
            </h1>
            <p className="text-gray-500 text-sm mt-1">Manage all projects</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Project
          </button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Methodology</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Health</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progress</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {projects.map((project) => (
                  <tr key={project.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-mono text-gray-900">{project.projectCode}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{project.projectName}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{project.projectType}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{project.methodology}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${statusBadge(project.status)}`}>
                        {project.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {project.projectHealth && (
                        <span className={`text-xs px-2 py-1 rounded-full ${healthBadge(project.projectHealth)}`}>
                          {project.projectHealth}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-gray-200 rounded-full">
                          <div
                            className="h-2 bg-blue-600 rounded-full"
                            style={{ width: `${project.completionPercentage || 0}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">{project.completionPercentage || 0}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{project.priority}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleAiCharter(project)}
                        disabled={aiLoading}
                        className="flex items-center gap-1 text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors disabled:opacity-50"
                      >
                        <Sparkles className="h-3 w-3" />
                        AI Charter
                      </button>
                    </td>
                  </tr>
                ))}
                {projects.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                      No projects found. Create your first project.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Modal */}
        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create Project" size="lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
              <input
                type="text"
                required
                value={form.projectName}
                onChange={(e) => setForm({ ...form, projectName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Type</label>
                <select
                  value={form.projectType}
                  onChange={(e) => setForm({ ...form, projectType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="CONSTRUCTION">Construction</option>
                  <option value="SOFTWARE">Software</option>
                  <option value="INFRASTRUCTURE">Infrastructure</option>
                  <option value="RESEARCH">Research</option>
                  <option value="COMPLIANCE">Compliance</option>
                  <option value="IMPROVEMENT">Improvement</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Methodology</label>
                <select
                  value={form.methodology}
                  onChange={(e) => setForm({ ...form, methodology: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="WATERFALL">Waterfall</option>
                  <option value="AGILE">Agile</option>
                  <option value="HYBRID">Hybrid</option>
                  <option value="PRINCE2">PRINCE2</option>
                  <option value="LEAN">Lean</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Planned Budget</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.plannedBudget}
                  onChange={(e) => setForm({ ...form, plannedBudget: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Planned End Date</label>
                <input
                  type="date"
                  value={form.plannedEndDate}
                  onChange={(e) => setForm({ ...form, plannedEndDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                rows={3}
                value={form.projectDescription}
                onChange={(e) => setForm({ ...form, projectDescription: e.target.value })}
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
                Create Project
              </button>
            </div>
          </form>
        </Modal>

        {/* AI Result Modal */}
        <Modal isOpen={showAiModal} onClose={() => setShowAiModal(false)} title="AI Project Charter" size="lg">
          <div className="prose max-w-none">
            <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded-lg">{aiResult}</pre>
          </div>
          <div className="flex justify-end pt-4">
            <button
              onClick={() => setShowAiModal(false)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </Modal>
      </div>
    </div>
  );
}
