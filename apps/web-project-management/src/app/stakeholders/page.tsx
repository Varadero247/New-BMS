'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, UserCheck, Sparkles } from 'lucide-react';
import { Modal } from '@ims/ui';
import { api, aiApi } from '@/lib/api';

export default function StakeholdersPage() {
  const [stakeholders, setStakeholders] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterProjectId, setFilterProjectId] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [showAiModal, setShowAiModal] = useState(false);
  const [form, setForm] = useState({
    projectId: '',
    stakeholderName: '',
    stakeholderOrg: '',
    stakeholderRole: '',
    stakeholderType: 'INTERNAL',
    powerLevel: 3,
    interestLevel: 3,
    email: '',
    communicationFrequency: 'MONTHLY',
  });

  const loadData = useCallback(async () => {
    try {
      const params: any = {};
      if (filterProjectId) params.projectId = filterProjectId;
      const [stakeholdersRes, projectsRes] = await Promise.all([
        api.get('/stakeholders', { params }),
        api.get('/projects'),
      ]);
      setStakeholders(stakeholdersRes.data.data || []);
      setProjects(projectsRes.data.data || []);
    } catch (error) {
      console.error('Failed to load stakeholders:', error);
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
      await api.post('/stakeholders', {
        ...form,
        powerLevel: parseInt(String(form.powerLevel)),
        interestLevel: parseInt(String(form.interestLevel)),
      });
      setShowModal(false);
      setForm({
        projectId: '',
        stakeholderName: '',
        stakeholderOrg: '',
        stakeholderRole: '',
        stakeholderType: 'INTERNAL',
        powerLevel: 3,
        interestLevel: 3,
        email: '',
        communicationFrequency: 'MONTHLY',
      });
      loadData();
    } catch (error) {
      console.error('Failed to create stakeholder:', error);
    }
  };

  const handleAiStrategy = async (stakeholder: any) => {
    setAiLoading(true);
    try {
      const res = await aiApi.post('/analyze', {
        type: 'STAKEHOLDER_STRATEGY',
        data: stakeholder,
      });
      setAiResult(res.data.data?.analysis || res.data.data || 'No analysis returned');
      setShowAiModal(true);
    } catch (error) {
      console.error('AI analysis failed:', error);
    } finally {
      setAiLoading(false);
    }
  };

  const getCategory = (power: number, interest: number) => {
    if (power >= 4 && interest >= 4) return 'MANAGE_CLOSELY';
    if (power >= 4 && interest < 4) return 'KEEP_SATISFIED';
    if (power < 4 && interest >= 4) return 'KEEP_INFORMED';
    return 'MONITOR';
  };

  const categoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      MANAGE_CLOSELY: 'bg-red-100 text-red-700',
      KEEP_SATISFIED: 'bg-amber-100 text-amber-700',
      KEEP_INFORMED: 'bg-blue-100 text-blue-700',
      MONITOR: 'bg-gray-100 text-gray-700',
    };
    const labels: Record<string, string> = {
      MANAGE_CLOSELY: 'Manage Closely',
      KEEP_SATISFIED: 'Keep Satisfied',
      KEEP_INFORMED: 'Keep Informed',
      MONITOR: 'Monitor',
    };
    return { color: colors[category] || 'bg-gray-100 text-gray-700', label: labels[category] || category };
  };

  const engagementBadge = (engagement: string) => {
    const colors: Record<string, string> = {
      SUPPORTIVE: 'bg-green-100 text-green-700',
      NEUTRAL: 'bg-gray-100 text-gray-700',
      RESISTANT: 'bg-red-100 text-red-700',
      LEADING: 'bg-blue-100 text-blue-700',
      UNAWARE: 'bg-amber-100 text-amber-700',
    };
    return colors[engagement] || 'bg-gray-100 text-gray-700';
  };

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      ACTIVE: 'bg-green-100 text-green-700',
      INACTIVE: 'bg-gray-100 text-gray-700',
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
              <UserCheck className="h-6 w-6 text-blue-600" />
              Stakeholders
            </h1>
            <p className="text-gray-500 text-sm mt-1">Stakeholder register and engagement</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Stakeholder
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Org</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Power</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Interest</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Engagement</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stakeholders.map((sh) => {
                  const category = sh.stakeholderCategory || getCategory(sh.powerLevel, sh.interestLevel);
                  const cat = categoryBadge(category);
                  return (
                    <tr key={sh.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{sh.stakeholderName}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{sh.stakeholderOrg || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{sh.stakeholderRole || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{sh.stakeholderType}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{sh.powerLevel}/5</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{sh.interestLevel}/5</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${cat.color}`}>
                          {cat.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {sh.engagementLevel && (
                          <span className={`text-xs px-2 py-1 rounded-full ${engagementBadge(sh.engagementLevel)}`}>
                            {sh.engagementLevel}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${statusBadge(sh.status)}`}>
                          {sh.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleAiStrategy(sh)}
                          disabled={aiLoading}
                          className="flex items-center gap-1 text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors disabled:opacity-50"
                        >
                          <Sparkles className="h-3 w-3" />
                          AI Strategy
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {stakeholders.length === 0 && (
                  <tr>
                    <td colSpan={10} className="px-4 py-8 text-center text-gray-500">
                      No stakeholders found. Add your first stakeholder.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Modal */}
        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Stakeholder" size="lg">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={form.stakeholderName}
                  onChange={(e) => setForm({ ...form, stakeholderName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Organization</label>
                <input
                  type="text"
                  value={form.stakeholderOrg}
                  onChange={(e) => setForm({ ...form, stakeholderOrg: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <input
                  type="text"
                  value={form.stakeholderRole}
                  onChange={(e) => setForm({ ...form, stakeholderRole: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={form.stakeholderType}
                  onChange={(e) => setForm({ ...form, stakeholderType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="INTERNAL">Internal</option>
                  <option value="EXTERNAL">External</option>
                  <option value="CUSTOMER">Customer</option>
                  <option value="SPONSOR">Sponsor</option>
                  <option value="REGULATORY">Regulatory</option>
                  <option value="SUPPLIER">Supplier</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Power Level (1-5)</label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  required
                  value={form.powerLevel}
                  onChange={(e) => setForm({ ...form, powerLevel: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Interest Level (1-5)</label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  required
                  value={form.interestLevel}
                  onChange={(e) => setForm({ ...form, interestLevel: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Comm. Frequency</label>
                <select
                  value={form.communicationFrequency}
                  onChange={(e) => setForm({ ...form, communicationFrequency: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="DAILY">Daily</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="BI_WEEKLY">Bi-Weekly</option>
                  <option value="MONTHLY">Monthly</option>
                  <option value="QUARTERLY">Quarterly</option>
                  <option value="AS_NEEDED">As Needed</option>
                </select>
              </div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                Category: <span className="font-bold">{categoryBadge(getCategory(form.powerLevel, form.interestLevel)).label}</span>
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
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
                Add Stakeholder
              </button>
            </div>
          </form>
        </Modal>

        {/* AI Result Modal */}
        <Modal isOpen={showAiModal} onClose={() => setShowAiModal(false)} title="AI Stakeholder Strategy" size="lg">
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
