'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface RiskAssessment {
  id: string;
  title: string;
  description?: string;
  category: string;
  likelihood: number;
  impact: number;
  riskScore: number;
  status: string;
  mitigationMeasures?: string;
  residualRisk?: string;
  owner?: string;
  reviewDate?: string;
  createdAt: string;
  updatedAt: string;
}

const categoryOptions = ['BRIBERY_OF_PUBLIC_OFFICIALS', 'COMMERCIAL_BRIBERY', 'FACILITATION_PAYMENTS', 'GIFTS_HOSPITALITY', 'POLITICAL_CONTRIBUTIONS', 'CHARITABLE_DONATIONS', 'SPONSORSHIPS', 'THIRD_PARTY', 'PROCUREMENT', 'OTHER'];
const statusOptions = ['DRAFT', 'ASSESSED', 'MITIGATED', 'ACCEPTED', 'CLOSED'];

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 dark:bg-gray-800 text-gray-700',
  ASSESSED: 'bg-blue-100 text-blue-700',
  MITIGATED: 'bg-green-100 text-green-700',
  ACCEPTED: 'bg-yellow-100 text-yellow-700',
  CLOSED: 'bg-gray-100 dark:bg-gray-800 text-gray-700',
};

function getRiskColor(score: number): string {
  if (score >= 20) return 'bg-red-100 text-red-700';
  if (score >= 12) return 'bg-orange-100 text-orange-700';
  if (score >= 6) return 'bg-yellow-100 text-yellow-700';
  return 'bg-green-100 text-green-700';
}

export default function RiskAssessmentsPage() {
  const [risks, setRisks] = useState<RiskAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRisk, setEditingRisk] = useState<RiskAssessment | null>(null);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'BRIBERY_OF_PUBLIC_OFFICIALS',
    likelihood: 1,
    impact: 1,
    status: 'DRAFT',
    mitigationMeasures: '',
    residualRisk: '',
    owner: '',
    reviewDate: '',
  });

  useEffect(() => {
    loadRisks();
  }, []);

  async function loadRisks() {
    try {
      setError(null);
      const res = await api.get('/risk-assessments');
      setRisks(res.data.data || []);
    } catch (err) {
      console.error('Error loading risk assessments:', err);
      setError('Failed to load risk assessments.');
    } finally {
      setLoading(false);
    }
  }

  function openAddModal() {
    setEditingRisk(null);
    setForm({ title: '', description: '', category: 'BRIBERY_OF_PUBLIC_OFFICIALS', likelihood: 1, impact: 1, status: 'DRAFT', mitigationMeasures: '', residualRisk: '', owner: '', reviewDate: '' });
    setModalOpen(true);
  }

  function openEditModal(risk: RiskAssessment) {
    setEditingRisk(risk);
    setForm({
      title: risk.title,
      description: risk.description || '',
      category: risk.category,
      likelihood: risk.likelihood,
      impact: risk.impact,
      status: risk.status,
      mitigationMeasures: risk.mitigationMeasures || '',
      residualRisk: risk.residualRisk || '',
      owner: risk.owner || '',
      reviewDate: risk.reviewDate ? risk.reviewDate.split('T')[0] : '',
    });
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editingRisk) {
        await api.put(`/risk-assessments/${editingRisk.id}`, form);
      } else {
        await api.post('/risk-assessments', form);
      }
      setModalOpen(false);
      loadRisks();
    } catch (err) {
      console.error('Error saving risk assessment:', err);
      setError('Failed to save risk assessment.');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this risk assessment?')) return;
    try {
      await api.delete(`/risk-assessments/${id}`);
      loadRisks();
    } catch (err) {
      console.error('Error deleting risk assessment:', err);
      setError('Failed to delete risk assessment.');
    }
  }

  const filteredRisks = risks.filter((r) => {
    if (filterCategory && r.category !== filterCategory) return false;
    if (filterStatus && r.status !== filterStatus) return false;
    return true;
  });

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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Bribery Risk Assessments</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Bribery risk assessment register per ISO 37001</p>
          </div>
          <button onClick={openAddModal} className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors">
            Add Risk Assessment
          </button>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>}

        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6 p-4">
          <div className="flex gap-4">
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500">
              <option value="">All Categories</option>
              {categoryOptions.map((c) => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
            </select>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500">
              <option value="">All Statuses</option>
              {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">L</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">I</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Owner</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredRisks.length > 0 ? (
                filteredRisks.map((risk) => (
                  <tr key={risk.id} className="hover:bg-gray-50 dark:bg-gray-800">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{risk.title}</p>
                      {risk.description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate max-w-xs">{risk.description}</p>}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{risk.category.replace(/_/g, ' ')}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{risk.likelihood}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{risk.impact}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getRiskColor(risk.riskScore)}`}>
                        {risk.riskScore}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[risk.status] || 'bg-gray-100 dark:bg-gray-800 text-gray-700'}`}>
                        {risk.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{risk.owner || '-'}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => openEditModal(risk)} className="text-rose-600 hover:text-rose-700 text-sm mr-3">Edit</button>
                      <button onClick={() => handleDelete(risk.id)} className="text-red-600 hover:text-red-700 text-sm">Delete</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">No risk assessments found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setModalOpen(false)} />
            <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-lg w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">{editingRisk ? 'Edit Risk Assessment' : 'Add Risk Assessment'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                  <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500" rows={3} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                    <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500">
                      {categoryOptions.map((c) => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                    <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500">
                      {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Likelihood (1-5)</label>
                    <input type="number" min={1} max={5} value={form.likelihood} onChange={(e) => setForm({ ...form, likelihood: parseInt(e.target.value) || 1 })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Impact (1-5)</label>
                    <input type="number" min={1} max={5} value={form.impact} onChange={(e) => setForm({ ...form, impact: parseInt(e.target.value) || 1 })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mitigation Measures</label>
                  <textarea value={form.mitigationMeasures} onChange={(e) => setForm({ ...form, mitigationMeasures: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500" rows={3} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Owner</label>
                    <input type="text" value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Review Date</label>
                    <input type="date" value={form.reviewDate} onChange={(e) => setForm({ ...form, reviewDate: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500" />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-800">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700">
                    {editingRisk ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
